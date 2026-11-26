import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const manifest = JSON.parse(await readFile(resolve(root, 'firebase.sources.json'), 'utf8'));

export function appDirectory(source) {
  const directory = resolve(root, source.path);
  if (!directory.startsWith(resolve(root, 'apps') + sep)) throw new Error('Invalid local app path');
  return directory;
}

export const publicFilter = path => !/(?:^|[\\/])chat(?: \(\d+\))?\.txt$/i.test(path)
  && !basename(path).startsWith('.env') && basename(path) !== '.DS_Store';

// Only local runtime directories are published; no checkout or network fetch is needed.
export async function copyLinkedApp(source, output, mount = source.mount, standalone = false) {
  const directory = appDirectory(source);
  const target = resolve(output, mount);
  if (!target.startsWith(resolve(output) + sep)) throw new Error('Invalid app mount');
  await mkdir(target, { recursive: true });
  if (source.kind === 'vite') {
    await cp(resolve(directory, 'dist/date'), target, { recursive: true, filter: publicFilter });
  } else if (source.kind === 'vouchers' || source.kind === 'second') {
    await cp(resolve(directory, 'index.html'), resolve(target, 'index.html'));
    const assets = source.kind === 'vouchers' ? 'img' : 'assets';
    await cp(resolve(directory, assets), resolve(target, assets), { recursive: true, filter: publicFilter });
  } else if (source.kind === 'song') {
    await cp(resolve(directory, 'public/ilychicaaa'), target, { recursive: true, filter: publicFilter });
    let html = await readFile(resolve(target, 'index.html'), 'utf8');
    html = html.replace(/https:\/\/(?:chica-ilychicaaa|ilychicaaa)\.vercel\.app\/ilychicaaa\//g, '/ilychicaaa/');
    if (mount !== 'ilychicaaa') html = html.replaceAll('/ilychicaaa/', `/${mount}/`);
    if (standalone) html = html.replace(/href=["']\/["']/g, 'href="https://chica.keicodes.dev/"');
    await writeFile(resolve(target, 'index.html'), html);
  } else throw new Error('Unknown app kind: ' + source.kind);
}
