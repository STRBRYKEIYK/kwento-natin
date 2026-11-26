const main = 'https://chica-keicodes-dev.web.app';
const checks = [
  ['/', 'text/html'], ['/one-minute-eleven-memories', 'text/html'], ['/third', 'text/html'],
  ['/date/', 'text/html'], ['/date/places.json', 'application/json'], ['/555', 'text/html'],
  ['/vouchers/', 'text/html'], ['/vouchers/img/p1.jpg', 'image/'], ['/second/', 'text/html'],
  ['/second/assets/long-drive.mp3', 'audio/'], ['/ilychicaaa/', 'text/html'], ['/ilychicaaa/media/para-sa-chica.mp4', 'video/'],
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
if (process.argv.includes('--api')) {
  const response = await fetch(main + '/date/api/dates');
  const data = response.headers.get('content-type')?.includes('json') ? await response.json() : null;
  if (!response.ok || !data?.enabled || !Array.isArray(data.dates)) { console.error('Date API is not ready. Keep the current custom-domain DNS unchanged.'); process.exitCode = 1; }
  else console.log(`Date API verified: ${data.dates.length} saved dates.`);
  const notify = await fetch(main + '/date/api/send');
  const state = notify.headers.get('content-type')?.includes('json') ? await notify.json() : null;
  if (!state?.channels?.telegram || state?.channels?.ntfyFingerprint !== '6752fc00') { console.error('Existing notification channels are not restored yet.'); process.exitCode = 1; }
  else console.log('Existing Telegram and push configuration verified without sending messages.');
}
