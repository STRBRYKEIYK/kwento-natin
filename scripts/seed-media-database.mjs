import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { catalog, mediaUrl, mediaPath } from '../functions/src/shared/media.js';
import { DATES, imgSrc, thumbSrc, videoSrc, videoThumbSrc } from '../src/pages/petsaData.js';
import { firebaseRequest } from './firebase-auth.mjs';

const project='chica-keicodes-dev';
const base=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
function field(value) {
  if(typeof value==='string')return {stringValue:value};
  if(typeof value==='boolean')return {booleanValue:value};
  if(typeof value==='number')return {integerValue:String(value)};
  if(Array.isArray(value))return {arrayValue:{values:value.map(field)}};
  return {mapValue:{fields:fields(value)}};
}
function fields(value) {return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,field(v)]));}
async function list(collection) {
  let docs=[],page='';
  do { const result=await firebaseRequest(`${base}/${collection}?pageSize=1000${page?'&pageToken='+encodeURIComponent(page):''}`); docs.push(...(result.documents||[]));page=result.nextPageToken||''; }while(page);
  return docs;
}
const [oldMedia,oldAlbums,dates]=await Promise.all([list('media'),list('albums'),firebaseRequest(`${base}/_chica/dateScheduler`)]);
const backup=resolve('.firebase-migration-data/media/database-before-seed.json');
await mkdir(resolve('.firebase-migration-data/media'),{recursive:true});
try { await writeFile(backup,JSON.stringify({media:oldMedia,albums:oldAlbums,dateScheduler:dates},null,2),{flag:'wx',mode:0o600}); }catch(e){if(e.code!=='EEXIST')throw e;}
const existing=new Set([...oldMedia,...oldAlbums].map(d=>d.name));
const documents=[];
for(const [sha,obj]of Object.entries(catalog.objects)) {
  if(!obj.verified)throw new Error('Unverified object in catalog');
  documents.push({id:`media/${sha}`,data:{sha256:sha,storagePath:obj.object,bucket:catalog.bucket,bytes:obj.bytes,contentType:obj.contentType,md5:obj.md5,downloadUrl:mediaUrl(Object.keys(catalog.paths).find(p=>catalog.paths[p]===sha)||'') || '',legacyPaths:Object.keys(catalog.paths).filter(p=>catalog.paths[p]===sha)}});
}
function requireCloud(url) {if(!url.startsWith(`https://firebasestorage.googleapis.com/v0/b/${catalog.bucket}/o/`))throw new Error(`Unmapped album media: ${url}`);return url;}
for(const [order,d] of DATES.entries()) {
  const media=d.files.map(file=>({type:'photo',file,url:requireCloud(imgSrc(d,file)),thumbnailUrl:requireCloud(thumbSrc(d,file))}));
  for(const file of d.videos||[])media.push({type:'video',file,url:requireCloud(videoSrc(d,file)),thumbnailUrl:requireCloud(videoThumbSrc(d,file))});
  documents.push({id:`albums/${d.date}`,data:{date:d.date,label:d.label,place:d.place,desc:d.desc,order,media}});
}
const pending=documents.map(({id,data})=>({update:{name:`projects/${project}/databases/(default)/documents/${id}`,fields:fields(data)},currentDocument:{exists:false}})).filter(w=>!existing.has(w.update.name));
console.log(`Metadata: ${documents.length} documents, ${pending.length} new; existing documents will be preserved.`);
if(!process.argv.includes('--apply'))process.exit(0);
for(let i=0;i<pending.length;i+=200)await firebaseRequest(`${base}:commit`,{method:'POST',body:JSON.stringify({writes:pending.slice(i,i+200)})});
const [media,albums,afterDates]=await Promise.all([list('media'),list('albums'),firebaseRequest(`${base}/_chica/dateScheduler`)]);
if(!isDeepStrictEqual(dates.fields,afterDates.fields))throw new Error('Saved dates changed during metadata migration');
console.log(JSON.stringify({media:media.length,albums:albums.length,savedDatesPreserved:true}));
