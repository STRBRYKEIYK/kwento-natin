import assert from 'node:assert/strict';

const get = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return { text: await response.text(), url: response.url, type: response.headers.get('content-type') };
};

for (const host of ['https://chica.keicodes.dev', 'https://chica-keicodes-dev.web.app']) {
  const page = await get(`${host}/biyahe`);
  assert.ok(page.text.includes('<title>11:11 PM · BIYAHE NATIN — PARA SA ASAWAAAA KO</title>'), 'Invitation title missing');
  const moduleTag = page.text.match(/<script\b(?=[^>]*\btype="module")[^>]*>/)?.[0];
  const modulePath = moduleTag?.match(/\bsrc="([^"]+\.js)"/)?.[1];
  assert.ok(modulePath, 'Module entry missing');
  const entry = await get(new URL(modulePath, page.url));
  assert.ok(/path\s*:\s*["'`]\/biyahe["'`]/.test(entry.text), 'Page route missing');
  const chunkPath = entry.text.match(/import\(["'`]([^"'`]*BiyahePage-[^"'`]+\.js)["'`]\)/)?.[1];
  assert.ok(chunkPath, 'Biyahe page bundle missing');
  const chunk = await get(new URL(chunkPath, entry.url));
  assert.match(chunk.type, /javascript/);
  assert.ok(chunk.text.includes('11:11 PM POOOO, ASAWAAAA KOOOO!'), 'Letter opening missing');
  assert.ok(chunk.text.includes('MWUAAAAAAAAAA!'), 'Letter closing missing');
  assert.ok(!chunk.text.includes('10:10'), 'Old page time remains');
  const modelChunkPath = entry.text.match(/import\(["'`]([^"'`]*BiyaheMotorcycle-[^"'`]+\.js)["'`]\)/)?.[1];
  assert.ok(modelChunkPath, 'Motorcycle viewer bundle missing');
  const modelChunk = await get(new URL(modelChunkPath, entry.url));
  assert.ok(modelChunk.text.includes('/models/biyahe-scooter.glb'), 'Supplied model is not wired up');
  assert.ok(modelChunk.text.includes('180deg 75deg 105%'), 'The right-facing side camera angle is missing');
  assert.ok(modelChunk.text.includes('NAKAPIRME HABANG BUMIBIYAHE'), 'The ride camera lock is missing');
  assert.ok(modelChunk.text.includes('bh-ride-scene') && modelChunk.text.includes('data-mode') && modelChunk.text.includes('data-moment'), 'Connected ride scenery is missing');
  const model = await fetch(`${host}/models/biyahe-scooter.glb`, { signal: AbortSignal.timeout(30000) });
  assert.equal(model.status, 200, 'Motorcycle model request failed');
  const modelData = Buffer.from(await model.arrayBuffer());
  assert.equal(modelData.toString('ascii', 0, 4), 'glTF', 'Motorcycle asset is not a GLB');
  assert.equal(modelData.byteLength, 12232544, 'Motorcycle model file is incomplete');
  const libraryPath = entry.text.match(/import\(["'`]([^"'`]*LibraryPage-[^"'`]+\.js)["'`]\)/)?.[1];
  assert.ok(libraryPath, 'Library bundle missing');
  const library = await get(new URL(libraryPath, entry.url));
  assert.ok(library.text.includes('11:11 · Biyahe Natin') && library.text.includes('/biyahe'), 'Library entry missing');
  const cover = await get(`${host}/menu/img/biyahe.svg`);
  assert.match(cover.type, /image\/svg\+xml/);
  assert.ok(cover.text.includes('<svg'), 'Cover artwork missing');
  console.log(`PASS ${host}/biyahe — 11:11 invitation, letter, library entry, cover, viewer, and complete GLB`);
}
