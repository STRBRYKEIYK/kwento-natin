import assert from 'node:assert/strict';
import { open, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, mediaUrl } from '../functions/src/shared/media.js';
import { firebaseRequest } from './firebase-auth.mjs';

const prefix=`https://storage.googleapis.com/storage/v1/b/${catalog.bucket}/o`;
const objects=[];
let page='';
do {const result=await firebaseRequest(`${prefix}?maxResults=1000&prefix=library%2F${page?'&pageToken='+encodeURIComponent(page):''}`); objects.push(...(result.items||[]));page=result.nextPageToken||'';}while(page);
const byName=new Map(objects.map(o=>[o.name,o]));
const sources=new Map();
for(const [path,sha] of Object.entries(catalog.sources)) if(!sources.has(sha))sources.set(sha,path);
const checks=Object.entries(catalog.objects);
let next=0,verified=0;
await Promise.all(Array.from({length:8},async()=>{
  while(next<checks.length) {
    const [sha,item]=checks[next++], remote=byName.get(item.object);
    assert.equal(remote?.md5Hash,item.md5,`Remote checksum ${item.object}`);
    assert.equal(Number(remote.size),item.bytes);
    assert.equal(remote.generation,item.generation);
    assert.ok(remote.metadata.firebaseStorageDownloadTokens.split(',').includes(item.token));
    const url=`https://firebasestorage.googleapis.com/v0/b/${catalog.bucket}/o/${encodeURIComponent(item.object)}?alt=media&token=${encodeURIComponent(item.token)}`;
    let r;
    for(let attempt=0;attempt<3;attempt++) {
      try { r=await fetch(url,{headers:{Origin:'https://chica.keicodes.dev',Range:'bytes=0-63'},signal:AbortSignal.timeout(30000)}); if(r.ok)break; }catch(e){if(attempt===2)throw e;}
    }
    assert.equal(r.status,206,`Range playback ${item.object}`);
    assert.ok(['*','https://chica.keicodes.dev'].includes(r.headers.get('access-control-allow-origin')),`CORS ${item.object}`);
    assert.equal(r.headers.get('content-type')?.split(';')[0],item.contentType);
    assert.equal(r.headers.get('content-range'),`bytes 0-63/${item.bytes}`);
    let local=resolve(sources.get(sha));
    let handle;
    try { handle=await open(local,'r'); }catch(e){if(e.code!=='ENOENT')throw e;handle=await open(resolve('.firebase-migration-data/media-originals',sources.get(sha)),'r');}
    try {const buffer=Buffer.alloc(64);const {bytesRead}=await handle.read(buffer,0,64,0);assert.deepEqual(Buffer.from(await r.arrayBuffer()),buffer.subarray(0,bytesRead));}finally{await handle.close();}
    if(++verified%200===0)console.log(`Public downloads, CORS and range playback: ${verified}/${checks.length}`);
  }
}));
const result={bucket:catalog.bucket,verifiedAt:new Date().toISOString(),objects:verified,bytes:checks.reduce((n,[,o])=>n+o.bytes,0),checks:['server MD5','byte count','generation','download token','public download','CORS','range response','local byte prefix']};
await mkdir(resolve('.firebase-migration-data/media'),{recursive:true});
await writeFile(resolve('.firebase-migration-data/media/cloud-verification.json'),JSON.stringify(result,null,2),{mode:0o600});
console.log(JSON.stringify(result));
