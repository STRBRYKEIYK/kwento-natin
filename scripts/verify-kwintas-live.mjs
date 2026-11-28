import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { mediaUrl } from '../functions/src/shared/media.js';

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return { text: await response.text(), url: response.url, type: response.headers.get('content-type') };
}

const localModel = await readFile('public/models/kwintas.glb');
for (const host of ['https://chica.keicodes.dev', 'https://chica-keicodes-dev.web.app']) {
  const page = await get(`${host}/kwintas`);
  assert.ok(page.text.includes('<title>11:11 · ANG KWINTAS NATIN — PARA SA CHICAAAA KO</title>'), 'Necklace title missing');
  assert.ok(page.text.includes(mediaUrl('/assets/kwintas/necklace-portrait.jpg').replaceAll('&', '&amp;')), 'Share preview image missing');
  const moduleTag = page.text.match(/<script\b(?=[^>]*\btype="module")[^>]*>/)?.[0];
  const modulePath = moduleTag?.match(/\bsrc="([^"]+\.js)"/)?.[1];
  assert.ok(modulePath, 'Entry script missing');
  const entry = await get(new URL(modulePath, page.url));
  assert.match(entry.text, /path\s*:\s*["'`]\/kwintas["'`]/);
  const chunk = async name => {
    const pattern = new RegExp(`import\\(["'\x60]([^"'\x60]*${name}-[^"'\x60]+\\.js)["'\x60]\\)`);
    const path = entry.text.match(pattern)?.[1];
    assert.ok(path, `${name} bundle missing`);
    const result = await get(new URL(path, entry.url));
    assert.match(result.type, /javascript/);
    return result.text;
  };
  const story = await chunk('KwintasPage');
  assert.ok(story.includes('ANG KWINTAS NATIN') && story.includes('CHICAAAA KOOOO, ASAWAAAA KOOOO,'), 'Story or letter missing');
  for (const name of ['necklaces-together.jpg', 'keith-hexagon.jpg', 'jersey-oval.jpg', 'necklace-portrait.jpg', 'jersey-design.png', 'keith-design.png']) {
    assert.ok(story.includes(mediaUrl('/assets/kwintas/' + name)), `Showcase missing: ${name}`);
  }
  const library = await chunk('LibraryPage');
  assert.ok(library.includes('11:11 · Ang Kwintas Natin') && library.includes('/kwintas'), 'Library entry missing');
  const modelCode = await chunk('KwintasModel');
  assert.ok(modelCode.includes('/models/kwintas.glb') && modelCode.includes('SUBUKAN ULIT'), 'Model integration missing');
  const response = await fetch(`${host}/models/kwintas.glb`, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200);
  const data = Buffer.from(await response.arrayBuffer());
  assert.equal(data.toString('ascii', 0, 4), 'glTF');
  assert.equal(data.length, localModel.length);
  assert.equal(createHash('sha256').update(data).digest('hex'), createHash('sha256').update(localModel).digest('hex'), 'Live model differs from verified web copy');
  const cover = await get(`${host}/menu/img/kwintas.svg`);
  assert.match(cover.type, /image\/svg\+xml/);
  assert.ok(cover.text.includes('ANG KWINTAS NATIN'));
  console.log(`PASS ${host}/kwintas — title, SULAT entry, story/letter, six showcases, cover, viewer and complete GLB.`);
}
