import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const root = resolve('.firebase-hosting');
const manifest = JSON.parse(await readFile('firebase.sources.json', 'utf8'));
const config = JSON.parse(await readFile('firebase.json', 'utf8'));
const required = ['index.html', 'one-minute-eleven-memories/index.html', 'date/index.html', 'date/places.json', 'date/five/index.html', 'vouchers/index.html', 'vouchers/img/p1.jpg', 'second/index.html', 'second/assets/long-drive.mp3', 'ilychicaaa/index.html', 'ilychicaaa/media/para-sa-chica.mp4', 'oras/messages.json'];
for (const file of required) await access(resolve(root, 'main', file));
const aircon = await readFile(resolve(root, 'main/aircon/index.html'), 'utf8');
assert.ok(aircon.includes('<title>AIRCON · TAYO MUNA</title>'), 'The AIRCON invitation is missing from the Firebase build');
const mainSite = config.hosting.find(site => site.site === 'chica-keicodes-dev');
assert.ok(mainSite.redirects?.some(r => r.source.startsWith('/333') && r.destination === '/aircon'), '/333 must redirect to /aircon');
await assert.rejects(access(resolve(root, 'main/333/index.html')), 'The old /333 page must not be published beside /aircon');
const matamis = await readFile(resolve(root, 'main/matamis/index.html'), 'utf8');
assert.ok(matamis.includes('<title>10:10 · MATAMIS</title>'), 'The MATAMIS invitation is missing from the Firebase build');
for (const source of manifest.sources) await access(resolve(root, source.name, source.mount, 'index.html'));
assert.equal(config.hosting.length, 6);
for (const site of config.hosting) {
  assert.ok(site.public.startsWith('.firebase-hosting/'));
  for (const rewrite of site.rewrites) if (rewrite.function) assert.equal(rewrite.function.region, 'asia-southeast1');
}
for (const source of manifest.sources.filter(item => item.kind === 'song')) {
  const html = await readFile(resolve(root, source.name, source.mount, 'index.html'), 'utf8');
  assert.ok(!html.includes('https://chica-ilychicaaa.vercel.app/'), 'A recording still depends on Vercel');
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
      const info = await stat(path);
      assert.ok(info.size < 2 * 1024 ** 3, 'Firebase Hosting individual file limit exceeded: ' + relative(root, path));
      count++;
      total += info.size;
    }
  }
}
await walk(root);
console.log(`Verified six sites, API routing, recordings, albums, and shared messages (${count} files, ${Math.round(total / 1024 ** 2)} MB).`);
