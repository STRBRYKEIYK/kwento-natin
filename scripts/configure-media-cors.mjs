import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { firebaseRequest } from './firebase-auth.mjs';
import { catalog } from '../functions/src/shared/media.js';
const endpoint=`https://storage.googleapis.com/storage/v1/b/${catalog.bucket}`;
const before=await firebaseRequest(endpoint);
const config=JSON.parse(await readFile(new URL('../firebase.json',import.meta.url),'utf8'));
const origin=['https://chica.keicodes.dev',...config.hosting.flatMap(s=>[`https://${s.site}.web.app`,`https://${s.site}.firebaseapp.com`]),'http://localhost:5173','http://127.0.0.1:5173'];
const rule={origin,method:['GET','HEAD'],responseHeader:['Content-Type','Content-Length','Content-Range','Accept-Ranges','Cache-Control'],maxAgeSeconds:3600};
const cors=[...(before.cors||[])];
if(!cors.some(r=>origin.every(o=>r.origin?.includes(o)) && ['GET','HEAD'].every(m=>r.method?.includes(m))))cors.push(rule);
await mkdir(resolve('.firebase-migration-data/media'),{recursive:true});
try {await writeFile(resolve('.firebase-migration-data/media/bucket-before-cors.json'),JSON.stringify(before,null,2),{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;}
if(JSON.stringify(cors)!==JSON.stringify(before.cors||[]))await firebaseRequest(endpoint,{method:'PATCH',body:JSON.stringify({cors})});
console.log('Configured media GET/HEAD CORS for the site, compatibility hosts and local development; bucket permissions are unchanged.');
