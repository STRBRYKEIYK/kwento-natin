import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile, mkdir, open, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { firebaseAccessToken, firebaseRequest } from './firebase-auth.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const project = 'chica-keicodes-dev';
const bucket = `${project}.firebasestorage.app`;
const statePath = resolve(root, '.firebase-migration-data/media/upload-state.json');
const catalogPath = resolve(root, 'functions/src/media-catalog.json');
const types = { '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.gif':'image/gif', '.avif':'image/avif', '.heic':'image/heic', '.mp4':'video/mp4', '.mov':'video/quicktime', '.webm':'video/webm', '.mp3':'audio/mpeg', '.m4a':'audio/mp4', '.ogg':'audio/ogg', '.wav':'audio/wav' };
const apply = process.argv.includes('--apply');
const files = execFileSync('git', ['ls-files','-z'], { cwd:root, encoding:'utf8', maxBuffer:16*1024*1024 }).split('\0').filter(p => /^(public\/|apps\/)/.test(p) && !p.includes('/dist/') && types[extname(p).toLowerCase()]);
const inventory = [];
if(!files.length) throw new Error('No tracked media to migrate; refusing to replace the existing catalog.');
for (const path of files) {
  const sha = createHash('sha256'), md5 = createHash('md5');
  let bytes = 0;
  for await (const chunk of createReadStream(resolve(root,path))) { sha.update(chunk); md5.update(chunk); bytes += chunk.length; }
  inventory.push({ path, sha:sha.digest('hex'), md5:md5.digest('base64'), bytes, contentType:types[extname(path).toLowerCase()], extension:extname(path).toLowerCase().replace('.jpeg','.jpg') });
}
const unique = [...new Map(inventory.map(f=>[f.sha,f])).values()];
console.log(JSON.stringify({ files:files.length, unique:unique.length, bytes:inventory.reduce((s,f)=>s+f.bytes,0), uniqueBytes:unique.reduce((s,f)=>s+f.bytes,0) }));
if (!apply) process.exit(0);
const [billing, bucketInfo] = await Promise.all([
  firebaseRequest(`https://cloudbilling.googleapis.com/v1/projects/${project}/billingInfo`),
  firebaseRequest(`https://storage.googleapis.com/storage/v1/b/${bucket}`),
]);
if (!billing.billingEnabled) throw new Error('Existing Firebase project billing is not enabled; no billing changes were made.');
console.log(JSON.stringify({ project, bucket, location:bucketInfo.location, billingEnabled:true }));
await mkdir(dirname(statePath),{recursive:true});
try {
  const oldCatalog=JSON.parse(await readFile(catalogPath,'utf8'));
  if(Object.keys(oldCatalog.sources).some(path=>!files.includes(path))) throw new Error('The existing catalog contains migrated sources absent from Git. Use the app uploader for new media; refusing to discard migrated records.');
} catch(e) { if(e.code!=='ENOENT') throw e; }
let state;
try { state=JSON.parse(await readFile(statePath,'utf8')); } catch (e) { if(e.code!=='ENOENT') throw e; state={version:1,bucket,objects:{}}; }
if (state.bucket!==bucket) throw new Error('Unexpected migration bucket');
let saveQueue=Promise.resolve();
function save() { saveQueue=saveQueue.then(()=>writeFile(statePath,JSON.stringify(state,null,2),{mode:0o600})); return saveQueue; }
let token = await firebaseAccessToken(), tokenTime=Date.now();
async function request(url,options={}) {
  if(Date.now()-tokenTime>45*60*1000) { token=await firebaseAccessToken(); tokenTime=Date.now(); }
  return fetch(url,{...options,headers:{...options.headers,Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(180000)});
}
async function metadata(name) {
  const r=await request(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`);
  if(r.status===404) return null;
  if(!r.ok) throw new Error(`Object metadata failed: ${r.status}`);
  return r.json();
}
function verify(file,meta) {
  if(Number(meta.size)!==file.bytes || meta.md5Hash!==file.md5) throw new Error(`Cloud checksum mismatch: ${file.path}`);
  const downloadToken=meta.metadata?.firebaseStorageDownloadTokens?.split(',')[0];
  if(!downloadToken) throw new Error(`Missing download token: ${file.path}`);
  return { object:meta.name, token:downloadToken, bytes:file.bytes, contentType:file.contentType, md5:file.md5, generation:meta.generation, verified:true };
}
async function upload(file) {
  const name=`library/sha256/${file.sha}${file.extension}`;
  const found=await metadata(name);
  if(found) { state.objects[file.sha]=verify(file,found); await save(); return; }
  const entry=state.objects[file.sha] ||= { object:name, token:randomUUID() };
  let offset=0;
  async function status() {
    const r=await request(entry.session,{method:'PUT',headers:{'Content-Length':'0','Content-Range':`bytes */${file.bytes}`},redirect:'manual'});
    if(r.ok) return { done:await r.json() };
    if(r.status===308) return { offset:Number(r.headers.get('Range')?.match(/-(\d+)$/)?.[1] ?? -1)+1 };
    if(r.status===404 || r.status===410) return { expired:true };
    throw new Error(`Upload status failed: ${r.status}`);
  }
  if(entry.session) {
    const s=await status();
    if(s.done) { state.objects[file.sha]=verify(file,s.done); await save(); return; }
    if(s.expired) delete entry.session; else offset=s.offset;
  }
  if(!entry.session) {
    const r=await request(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=resumable&ifGenerationMatch=0&name=${encodeURIComponent(name)}`,{
      method:'POST',headers:{'Content-Type':'application/json','X-Upload-Content-Type':file.contentType,'X-Upload-Content-Length':String(file.bytes)},
      body:JSON.stringify({name,contentType:file.contentType,md5Hash:file.md5,cacheControl:'public,max-age=31536000,immutable',metadata:{firebaseStorageDownloadTokens:entry.token,sha256:file.sha}}),
    });
    if(!r.ok) throw new Error(`Start upload failed (${r.status}): ${file.path}`);
    entry.session=r.headers.get('Location');
    if(!entry.session?.startsWith('https://storage.googleapis.com/')) throw new Error('Unexpected upload endpoint');
    await save();
  }
  const handle=await open(resolve(root,file.path),'r');
  try {
    let failures=0;
    while(offset<file.bytes) {
      const length=Math.min(8*1024*1024,file.bytes-offset), buffer=Buffer.allocUnsafe(length);
      const {bytesRead}=await handle.read(buffer,0,length,offset);
      if(bytesRead!==length) throw new Error(`Local file changed: ${file.path}`);
      try {
        const r=await request(entry.session,{method:'PUT',headers:{'Content-Type':file.contentType,'Content-Length':String(length),'Content-Range':`bytes ${offset}-${offset+length-1}/${file.bytes}`},body:buffer,redirect:'manual'});
        if(r.status===308) offset=Number(r.headers.get('Range')?.match(/-(\d+)$/)?.[1] ?? -1)+1;
        else if(r.ok) { verify(file,await r.json()); offset=file.bytes; }
        else throw new Error(`Upload returned ${r.status}`);
        failures=0;
      } catch(e) {
        if(++failures>5) throw new Error(`Upload failed for ${file.path}: ${e.message}`);
        await new Promise(r=>setTimeout(r,Math.min(1000*2**failures,15000)));
        const s=await status();
        if(s.done) { verify(file,s.done); offset=file.bytes; } else if(s.expired) throw new Error(`Upload session expired: ${file.path}`); else offset=s.offset;
      }
    }
  } finally { await handle.close(); }
  state.objects[file.sha]=verify(file,await metadata(name));
  await save();
}
let next=0, completed=0;
await Promise.all(Array.from({length:6},async()=>{
  while(next<unique.length) {
    const file=unique[next++]; await upload(file); completed++;
    if(completed%25===0 || file.bytes>30*1024*1024 || completed===unique.length) console.log(`Verified ${completed}/${unique.length} objects (${file.path})`);
  }
}));
const catalog={version:1,bucket,objects:state.objects,paths:{},sources:{}};
for(const file of inventory) {
  catalog.sources[file.path]=file.sha;
  const p=file.path;
  let url;
  if(p.startsWith('public/')) url='/'+p.slice(7);
  else if(p.startsWith('apps/date-scheduler/public/')) url='/date/'+p.slice('apps/date-scheduler/public/'.length);
  else if(p.startsWith('apps/vouchers/')) url='/vouchers/'+p.slice('apps/vouchers/'.length);
  else if(p.startsWith('apps/second-letter/')) url='/second/'+p.slice('apps/second-letter/'.length);
  else if(p.startsWith('apps/recording-letter/public/')) url='/'+p.slice('apps/recording-letter/public/'.length);
  else if(p.startsWith('apps/original-recording/public/ilychicaaa/')) url='/ilychicaaa-original/'+p.slice('apps/original-recording/public/ilychicaaa/'.length);
  if(url) catalog.paths[url]=file.sha;
}
// Preserve previously published Vite image URLs by matching their content hashes.
for(const base of ['dist/date/assets','.firebase-hosting/main/date/assets']) {
  const {readdir}=await import('node:fs/promises');
  let names; try{ names=await readdir(resolve(root,base)); }catch(e){if(e.code==='ENOENT')continue;throw e;}
  for(const name of names) if(types[extname(name).toLowerCase()]) {
    const sha=createHash('sha256').update(await readFile(resolve(root,base,name))).digest('hex');
    if(catalog.objects[sha]) catalog.paths['/date/assets/'+name]=sha;
  }
}
// A local source can be removed only after this complete, verified catalog exists.
await writeFile(catalogPath,JSON.stringify(catalog)+'\n');
await writeFile(resolve(dirname(statePath),'inventory.json'),JSON.stringify(inventory,null,2),{mode:0o600});
console.log(`Wrote verified media catalog: ${inventory.length} source files, ${unique.length} cloud objects.`);
