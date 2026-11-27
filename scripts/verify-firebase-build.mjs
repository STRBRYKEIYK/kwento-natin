import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { catalog, mediaUrl } from '../functions/src/shared/media.js';

const root = resolve('.firebase-hosting');
const manifest = JSON.parse(await readFile('firebase.sources.json', 'utf8'));
const config = JSON.parse(await readFile('firebase.json', 'utf8'));
const required = ['index.html', 'one-minute-eleven-memories/index.html', 'date/index.html', 'date/places.json', 'date/five/index.html', '555/index.html', 'vouchers/index.html', 'second/index.html', 'ilychicaaa/index.html', 'ilychicaaa-original/index.html', 'oras/messages.json'];
required.push('tabi/index.html', 'models/chica-y-chico.glb');
for (const file of required) await access(resolve(root, 'main', file));
const tabi = await readFile(resolve(root, 'main/tabi/index.html'), 'utf8');
assert.ok(tabi.includes('<title>1:11 · TABI MUNA TAYO — PARA SA CHICAAA KO</title>'), 'The TABI invitation is missing');
const aircon = await readFile(resolve(root, 'main/aircon/index.html'), 'utf8');
assert.ok(aircon.includes('<title>AIRCON · TAYO MUNA</title>'), 'The AIRCON invitation is missing from the Firebase build');
const mainSite = config.hosting.find(site => site.site === 'chica-keicodes-dev');
assert.ok(mainSite.redirects?.some(r => r.source.startsWith('/333') && r.destination === '/aircon'), '/333 must redirect to /aircon');
await assert.rejects(access(resolve(root, 'main/333/index.html')), 'The old /333 page must not be published beside /aircon');
const matamis = await readFile(resolve(root, 'main/matamis/index.html'), 'utf8');
assert.ok(matamis.includes('<title>10:10 · MATAMIS</title>'), 'The MATAMIS invitation is missing from the Firebase build');
const hiling = await readFile(resolve(root, 'main/hiling/index.html'), 'utf8');
assert.ok(hiling.includes('<title>11:11 · HILING — SA LAHAT NG HILING, IKAW.</title>'), 'The HILING invitation must survive consolidation');
for (const source of manifest.sources) await access(resolve(root, source.name, source.mount, 'index.html'));
assert.equal(config.hosting.length, 6);
for (const site of config.hosting) {
  assert.ok(site.public.startsWith('.firebase-hosting/'));
  for (const rewrite of site.rewrites) if (rewrite.function) assert.equal(rewrite.function.region, 'asia-southeast1');
}
for (const source of manifest.sources.filter(item => item.kind === 'song')) {
  const html = await readFile(resolve(root, source.name, source.mount, 'index.html'), 'utf8');
  assert.ok(!html.includes('.vercel.app'), 'A recording still depends on Vercel');
  const main = await readFile(resolve(root, 'main', source.mainMount || source.mount, 'index.html'), 'utf8');
  assert.ok(!main.includes('.vercel.app'), 'A main-site recording still depends on Vercel');
  const mediaPath = `/${source.mainMount || source.mount}/media/para-sa-chica.mp4`;
  assert.ok(main.includes(mediaUrl(mediaPath)), 'The recording must load its verified Storage video');
  assert.ok(html.includes(mediaUrl(mediaPath)), 'The compatibility recording must load its verified Storage video');
}
let count = 0;
let total = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else {
      assert.ok(!/^chat(?: \(\d+\))?\.txt$/i.test(entry.name), 'Raw chat export was included');
      assert.ok(!entry.name.startsWith('.env'), 'Environment file was included');
      assert.ok(!/\.(?:jpe?g|png|webp|gif|avif|heic|mp4|mov|webm|mp3|m4a|ogg|wav)$/i.test(entry.name), 'Personal media must be external to Hosting: '+relative(root,path));
      const info = await stat(path);
      assert.ok(info.size < 2 * 1024 ** 3, 'Firebase Hosting individual file limit exceeded: ' + relative(root, path));
      count++;
      total += info.size;
    }
  }
}
await walk(root);
assert.ok(Object.keys(catalog.objects).length>1000,'The complete media catalog is missing');
assert.ok(Object.values(catalog.objects).every(o=>o.verified && o.bytes>0 && o.md5),'An unverified cloud object was published');
// The supplied couple model has its own budget; preserve the existing limit
// for the rest of the six sites so unrelated bundle growth still fails.
const coupleModel = await stat(resolve(root, 'main/models/chica-y-chico.glb'));
assert.ok(coupleModel.size < 12 * 1024**2, 'The optimized couple model exceeds 12 MB');
assert.ok(total - coupleModel.size < 25 * 1024**2,'The six hosting bundles excluding the couple model unexpectedly exceed 25 MB');
console.log(`Verified six sites, API routing, recordings, albums, and shared messages (${count} files, ${Math.round(total / 1024 ** 2)} MB).`);
