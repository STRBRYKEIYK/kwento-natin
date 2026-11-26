import { cp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import { resolve, dirname, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'firebase.sources.json'), 'utf8'));
const output = resolve(root, '.firebase-hosting');
const sources = resolve(root, '.firebase-sources');
const exists = async path => { try { await access(path); return true; } catch { return false; } };

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' && command === 'npm' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}
function git(args, cwd = root) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Git failed');
  return result.stdout.trim();
}
function npm(args, cwd) {
  if (process.env.npm_execpath) run(process.execPath, [process.env.npm_execpath, ...args], cwd);
  else run('npm', args, cwd);
}

await mkdir(sources, { recursive: true });
for (const source of manifest.sources) {
  const checkout = resolve(sources, source.name);
  if (!checkout.startsWith(sources + sep)) throw new Error('Invalid source path');
  if (!await exists(checkout)) {
    await mkdir(checkout);
    git(['init'], checkout);
    git(['remote', 'add', 'origin', `https://github.com/STRBRYKEIYK/${source.name}.git`], checkout);
    git(['fetch', '--depth', '1', 'origin', source.commit], checkout);
    git(['checkout', '--detach', 'FETCH_HEAD'], checkout);
  }
  if (git(['rev-parse', 'HEAD'], checkout) !== source.commit) throw new Error(`Source commit mismatch: ${source.name}`);
  if (source.kind === 'vite') {
    if (!await exists(resolve(checkout, 'node_modules'))) npm(['ci', '--ignore-scripts', '--no-audit', '--no-fund'], checkout);
    npm(['run', 'build'], checkout);
  }
}

npm(['run', 'build'], root);
// This script only resets its own generated output, never a source checkout.
if (dirname(output) !== root || basename(output) !== '.firebase-hosting') throw new Error('Unsafe output directory');
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'main'), { recursive: true });
const publicFilter = path => !/(?:^|[\\/])chat(?: \(\d+\))?\.txt$/i.test(path) && !path.endsWith('.DS_Store');
await cp(resolve(root, 'dist'), resolve(output, 'main'), { recursive: true, filter: publicFilter });
await mkdir(resolve(output, 'main/oras'), { recursive: true });
await cp(resolve(root, 'menu/oras/messages.json'), resolve(output, 'main/oras/messages.json'));

for (const source of manifest.sources) {
  const checkout = resolve(sources, source.name);
  const siteRoot = resolve(output, source.name);
  const mount = resolve(siteRoot, source.mount);
  await mkdir(mount, { recursive: true });
  if (source.kind === 'vite') await cp(resolve(checkout, 'dist/date'), mount, { recursive: true });
  if (source.kind === 'vouchers' || source.kind === 'second') {
    await cp(resolve(checkout, 'index.html'), resolve(mount, 'index.html'));
    const assets = source.kind === 'vouchers' ? 'img' : 'assets';
    await cp(resolve(checkout, assets), resolve(mount, assets), { recursive: true });
  }
  if (source.kind === 'song') {
    await cp(resolve(checkout, 'public/ilychicaaa'), mount, { recursive: true });
    const html = await readFile(resolve(mount, 'index.html'), 'utf8');
    await writeFile(resolve(mount, 'index.html'), html.replace(/https:\/\/(?:chica-ilychicaaa|ilychicaaa)\.vercel\.app\/ilychicaaa\//g, '/ilychicaaa/'));
  }
  if (source.main) await cp(mount, resolve(output, 'main', source.mount), { recursive: true });
  // Root links on standalone letter sites return to the actual Library, not their own root redirect.
  if (source.kind === 'song') {
    const html = await readFile(resolve(mount, 'index.html'), 'utf8');
    await writeFile(resolve(mount, 'index.html'), html.replace(/href=["']\/["']/g, 'href="https://chica.keicodes.dev/"'));
  }
}
await writeFile(resolve(output, 'build-manifest.json'), JSON.stringify({ projectId: manifest.projectId, sources: manifest.sources, builtAt: new Date().toISOString() }, null, 2));
console.log('Prepared six Firebase Hosting sites; all source repositories and media stay intact.');
