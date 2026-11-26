const main = 'https://chica-keicodes-dev.web.app';
const checks = [
  ['/', 'text/html'], ['/one-minute-eleven-memories', 'text/html'], ['/third', 'text/html'],
  ['/aircon', 'text/html'], ['/matamis', 'text/html'],
  ['/hiling', 'text/html'],
  ['/date/', 'text/html'], ['/date/places.json', 'application/json'], ['/555', 'text/html'],
  ['/vouchers/', 'text/html'], ['/vouchers/img/p1.jpg', 'image/'], ['/second/', 'text/html'],
  ['/second/assets/long-drive.mp3', 'audio/'], ['/ilychicaaa/', 'text/html'], ['/ilychicaaa/media/para-sa-chica.mp4', 'video/'],
  ['/ilychicaaa-original/', 'text/html'], ['/ilychicaaa-original/media/para-sa-chica.mp4', 'video/'],
  ['/oras/messages.json', 'application/json'],
];
const results = await Promise.all(checks.map(async ([path, type]) => {
  const response = await fetch(main + path, { method: 'HEAD' });
  return { path, status: response.status, ok: response.ok && response.headers.get('content-type')?.startsWith(type) };
}));
for (const site of ['dates', 'vouchers', 'second', 'song', 'original']) {
  const response = await fetch(`https://chica-keicodes-dev-${site}.web.app/`, { method: 'HEAD' });
  results.push({ site, status: response.status, ok: response.ok && response.headers.get('content-type')?.startsWith('text/html') });
}
console.log(JSON.stringify(results, null, 2));
if (results.some(result => !result.ok)) process.exitCode = 1;
// A missing SPA route can still return 200. Verify each invitation and its actual route bundle.
const pages = [
  { path: '/aircon', title: 'AIRCON · TAYO MUNA', chunk: 'ThreeThirtyThreePage' },
  { path: '/matamis', title: '10:10 · MATAMIS', chunk: 'MatamisPage' },
  { path: '/hiling', title: '11:11 · HILING — SA LAHAT NG HILING, IKAW.', chunk: 'HilingPage' },
];
for (const host of [main, 'https://chica.keicodes.dev']) {
  for (const { path, title, chunk: chunkName } of pages) {
    const page = await fetch(host + path, { signal: AbortSignal.timeout(15000) });
    const html = await page.text();
    const moduleTag = html.match(/<script\b(?=[^>]*\btype="module")[^>]*>/)?.[0];
    const modulePath = moduleTag?.match(/\bsrc="([^"]+\.js)"/)?.[1];
    const entry = modulePath && await fetch(new URL(modulePath, page.url), { signal: AbortSignal.timeout(15000) });
    const bundle = entry?.ok ? await entry.text() : '';
    const chunkPath = bundle.match(new RegExp(`import\\(["'\`]([^"'\`]*${chunkName}-[^"'\`]+\\.js)["'\`]\\)`))?.[1];
    const chunk = chunkPath && await fetch(new URL(chunkPath, entry.url), { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    const route = new RegExp(`path\\s*:\\s*["'\`]${path}["'\`]`);
    const checks = { page: page.ok, title: html.includes(`<title>${title}</title>`), route: route.test(bundle), chunk: Boolean(chunk?.ok && chunk.headers.get('content-type')?.includes('javascript')) };
    const ok = Object.values(checks).every(Boolean);
    console.log(`${path} invitation, route, and page bundle at ${host}: ${ok ? 'PASS' : 'FAIL'}`);
    if (!ok) { console.error(checks); process.exitCode = 1; }
  }
  // The old shared /333 link must be a real redirect to /aircon, not a second page.
  const old = await fetch(host + '/333', { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  const target = old.headers.get('location');
  const redirected = [301, 302, 307, 308].includes(old.status) && Boolean(target) && new URL(target, host).pathname === '/aircon';
  console.log(`/333 redirects to /aircon at ${host}: ${redirected ? 'PASS' : 'FAIL'}`);
  if (!redirected) { console.error({ status: old.status, location: target }); process.exitCode = 1; }
}
if (process.argv.includes('--api')) {
  const albumsResponse=await fetch(main+'/date/api/albums');
  const albums=albumsResponse.headers.get('content-type')?.includes('json') ? await albumsResponse.json() : null;
  if(!albumsResponse.ok || !albums?.ok || albums.albums?.length!==11 || !albums.albums.every(a=>Array.isArray(a.media) && a.media.every(m=>m.url?.startsWith('https://firebasestorage.googleapis.com/')))) {console.error('Curated Firestore albums are not ready');process.exitCode=1;}
  else console.log(`Firestore gallery verified: ${albums.albums.length} albums, ${albums.albums.flatMap(a=>a.media).length} photos/videos.`);
  for(const host of [main,'https://chica.keicodes.dev']) {
    for(const path of ['/ilychicaaa/media/para-sa-chica.mp4','/second/assets/long-drive.mp3','/vouchers/img/p1.jpg']) {
      const response=await fetch(host+path,{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(30000)});
      const ok=response.status===302 && response.headers.get('location')===mediaUrl(path);
      if(!ok){console.error(`Legacy Storage redirect failed: ${host}${path}`);process.exitCode=1;}
    }
  }
  const response = await fetch(main + '/date/api/dates');
  const data = response.headers.get('content-type')?.includes('json') ? await response.json() : null;
  if (!response.ok || !data?.enabled || !Array.isArray(data.dates)) { console.error('Date API is not ready. Keep the current custom-domain DNS unchanged.'); process.exitCode = 1; }
  else console.log(`Date API verified: ${data.dates.length} saved dates.`);
  const notify = await fetch(main + '/date/api/send');
  const state = notify.headers.get('content-type')?.includes('json') ? await notify.json() : null;
  if (!state?.channels?.telegram || state?.channels?.ntfyFingerprint !== '6752fc00') { console.error('Existing notification channels are not restored yet.'); process.exitCode = 1; }
  else console.log('Existing Telegram and push configuration verified without sending messages.');
}
import { catalog, mediaUrl } from '../functions/src/shared/media.js';
