import { cp, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, manifest, copyLinkedApp, publicFilter } from './linked-apps.mjs';

const output = resolve(root, '.firebase-hosting');
const result = process.env.npm_execpath
  ? spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build'], { cwd: root, stdio: 'inherit' })
  : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`Build failed (${result.status})`);

if (dirname(output) !== root || basename(output) !== '.firebase-hosting') throw new Error('Unsafe output directory');
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'main'), { recursive: true });
await cp(resolve(root, 'dist'), resolve(output, 'main'), { recursive: true, filter: publicFilter });
await mkdir(resolve(output, 'main/oras'), { recursive: true });
await cp(resolve(root, 'menu/oras/messages.json'), resolve(output, 'main/oras/messages.json'));

// Existing site IDs remain compatibility addresses with the same shared backend.
for (const source of manifest.sources) await copyLinkedApp(source, resolve(output, source.name), source.mount, true);
await writeFile(resolve(output, 'build-manifest.json'), JSON.stringify({ projectId: manifest.projectId, sources: manifest.sources, builtAt: new Date().toISOString() }, null, 2));
console.log('Prepared Kwento Natin and five compatibility sites from this repository alone.');
