import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { firebaseAccessToken, firebaseRequest } from './firebase-auth.mjs';
import { mergeLists } from '../functions/src/shared/dates-core.js';
import { PHOTO_KEY } from '../functions/src/validation.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const directory = resolve(root, '.firebase-migration-data/backups', new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(directory, { recursive: true });
const legacySource = 'https://chica-date-scheduler.vercel.app';
const response = await fetch(legacySource + '/date/api/dates', { headers: { 'Cache-Control': 'no-cache' } });
if (!response.ok) throw new Error('Cannot back up the live date store.');
const state = await response.json();
if (!state.ok || !state.enabled || !Array.isArray(state.dates)) throw new Error('Live date store is unavailable; refusing an empty migration.');
await writeFile(resolve(directory, 'dates.json'), JSON.stringify(state, null, 2), { mode: 0o600 });
const keys = [...new Set(state.dates.map(entry => entry.mem?.photo).filter(Boolean))];
const hashes = {};
for (const key of keys) {
  if (!PHOTO_KEY.test(key)) throw new Error('Unexpected private photo key in date data.');
  const photo = await fetch(`${legacySource}/date/api/photo?k=${encodeURIComponent(key)}`);
  if (!photo.ok || !photo.headers.get('content-type')?.startsWith('image/jpeg')) throw new Error('A memory photo could not be backed up.');
  const bytes = Buffer.from(await photo.arrayBuffer());
  hashes[key] = createHash('sha256').update(bytes).digest('hex');
  await writeFile(resolve(directory, key), bytes, { mode: 0o600 });
}
await writeFile(resolve(directory, 'checksums.json'), JSON.stringify(hashes, null, 2), { mode: 0o600 });
console.log(`Backed up ${state.dates.length} saved dates and ${keys.length} private photos. Source data was not changed.`);
if (!apply) { console.log('Backup only. Add --apply after Firebase sign-in to import without overwriting newer Firebase changes.'); process.exit(0); }

await firebaseAccessToken();
const bucket = 'chica-keicodes-dev.firebasestorage.app';
for (const key of keys) {
  const bytes = await readFile(resolve(directory, key));
  const object = encodeURIComponent(`memories/${key}`);
  const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${object}`;
  const currentResponse = await fetch(url + '?alt=media', { headers: { Authorization: `Bearer ${await firebaseAccessToken()}` } });
  if (currentResponse.ok) {
    const current = Buffer.from(await currentResponse.arrayBuffer());
    if (createHash('sha256').update(current).digest('hex') !== hashes[key]) throw new Error('Existing Firebase photo differs; refusing to overwrite it.');
  } else if (currentResponse.status === 404) {
    try {
      await firebaseRequest(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${object}&ifGenerationMatch=0`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: bytes });
    } catch (error) {
      if (error.status !== 412) throw error;
      const concurrent = await fetch(url + '?alt=media', { headers: { Authorization: `Bearer ${await firebaseAccessToken()}` } });
      if (!concurrent.ok || createHash('sha256').update(Buffer.from(await concurrent.arrayBuffer())).digest('hex') !== hashes[key]) throw new Error('A concurrent photo import has different bytes.');
    }
    await firebaseRequest(url, { method: 'PATCH', body: JSON.stringify({ cacheControl: 'private, max-age=86400' }) });
  } else throw new Error('Cannot verify the existing Firebase memory photo.');
}
function encode(value) {
  if (value === null) return { nullValue: 'NULL_VALUE' };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)])) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  return { stringValue: String(value) };
}
function decode(value) {
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, decode(item)]));
  if ('integerValue' in value) return Number(value.integerValue);
  if ('nullValue' in value) return null;
  return Object.values(value)[0];
}
const document = 'https://firestore.googleapis.com/v1/projects/chica-keicodes-dev/databases/(default)/documents/_chica/dateScheduler';
for (let attempt = 0; attempt < 5; attempt++) {
  let snapshot;
  try { snapshot = await firebaseRequest(document); } catch (error) { if (error.status !== 404) throw error; }
  const current = snapshot?.fields?.entries ? decode(snapshot.fields.entries) : [];
  const query = new URLSearchParams([['updateMask.fieldPaths', 'entries'], ['updateMask.fieldPaths', 'importedAt'], [snapshot ? 'currentDocument.updateTime' : 'currentDocument.exists', snapshot ? snapshot.updateTime : 'false']]);
  try {
    await firebaseRequest(document + '?' + query, { method: 'PATCH', body: JSON.stringify({ fields: { entries: encode(mergeLists(Array.isArray(current) ? current : [], state.dates)), importedAt: encode(new Date().toISOString()) } }) });
    break;
  } catch (error) { if (![409, 412].includes(error.status) || attempt === 4) throw error; }
}
console.log('Imported the saved dates and verified private photo bytes. Existing PETSA entries and old Vercel data were preserved.');
