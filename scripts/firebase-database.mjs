import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { firebaseRequest } from './firebase-auth.mjs';

const { projectId } = JSON.parse(await readFile(new URL('../firebase.sources.json', import.meta.url), 'utf8'));
const documents = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const collections = {};
for (const collection of ['entries', '_chica']) {
  const all = [];
  let pageToken;
  do {
    const query = new URLSearchParams({ pageSize: '1000', ...(pageToken ? { pageToken } : {}) });
    const page = await firebaseRequest(`${documents}/${collection}?${query}`);
    all.push(...(page.documents || []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  collections[collection] = all;
}
const objects = [];
let pageToken;
do {
  const query = new URLSearchParams({ maxResults: '1000', ...(pageToken ? { pageToken } : {}) });
  const page = await firebaseRequest(`https://storage.googleapis.com/storage/v1/b/${projectId}.firebasestorage.app/o?${query}`);
  objects.push(...(page.items || []));
  pageToken = page.nextPageToken;
} while (pageToken);

const scheduler = collections._chica.find(doc => doc.name.endsWith('/dateScheduler'));
if (!scheduler || !scheduler.fields?.entries?.arrayValue) throw new Error('Existing date database was not found; refusing to treat it as an empty database.');
const summary = {
  projectId,
  database: '(default)',
  savedDates: (scheduler.fields.entries.arrayValue.values || []).length,
  uploadedPetsaEntries: collections.entries.length,
  storedMediaObjects: objects.length,
  storedMediaBytes: objects.reduce((sum, object) => sum + Number(object.size || 0), 0),
};
if (process.argv.includes('--backup')) {
  const backupAt = new Date().toISOString();
  const directory = resolve('.firebase-migration-data/firestore-backups', backupAt.replace(/[:.]/g, '-'));
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'snapshot.json'), JSON.stringify({ projectId, backupAt, collections, storageObjects: objects }, null, 2), { mode: 0o600 });
  summary.backup = directory;
}
console.log(JSON.stringify(summary, null, 2));
