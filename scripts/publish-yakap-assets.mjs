import { readFile, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { firebaseAccessToken } from './firebase-auth.mjs';

const bucket = 'chica-keicodes-dev.firebasestorage.app';
const files = ['public/models/yakap-poster.png', 'public/menu/img/yakap.png'];
const token = await firebaseAccessToken();
const updates = [];
for (const source of files) {
  const bytes = await readFile(source);
  const sha = createHash('sha256').update(bytes).digest('hex');
  const md5 = createHash('md5').update(bytes).digest('base64');
  const name = `library/sha256/${sha}.png`;
  const objectUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`;
  let response = await fetch(objectUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) {
    const boundary = `yakap-${randomUUID()}`;
    const metadata = { name, contentType: 'image/png', md5Hash: md5, cacheControl: 'public,max-age=31536000,immutable', metadata: { firebaseStorageDownloadTokens: randomUUID(), sha256: sha } };
    const body = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: image/png\r\n\r\n`), bytes, Buffer.from(`\r\n--${boundary}--\r\n`)]);
    response = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=multipart&ifGenerationMatch=0&name=${encodeURIComponent(name)}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
  }
  if (!response.ok) throw new Error(`Asset upload failed (${response.status}): ${source}`);
  const metadata = await response.json();
  const downloadToken = metadata.metadata?.firebaseStorageDownloadTokens?.split(',')[0];
  if (Number(metadata.size) !== bytes.length || metadata.md5Hash !== md5 || !downloadToken) throw new Error(`Asset verification failed: ${source}`);
  updates.push({ source, sha, object: { object: name, token: downloadToken, bytes: bytes.length, contentType: 'image/png', md5, generation: metadata.generation, verified: true } });
  console.log(`Uploaded and verified ${source} (${bytes.length} bytes).`);
}
// Re-read before merging so other catalog additions remain intact.
const path = 'functions/src/media-catalog.json';
const catalog = JSON.parse(await readFile(path, 'utf8'));
if (catalog.bucket !== bucket) throw new Error('Unexpected media bucket');
for (const { source, sha, object } of updates) {
  catalog.sources[source] = sha;
  catalog.paths[source.slice('public'.length)] = sha;
  catalog.objects[sha] = object;
}
await writeFile(path, JSON.stringify(catalog, null, 2) + '\n');
