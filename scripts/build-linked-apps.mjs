import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, manifest, copyLinkedApp } from './linked-apps.mjs';

for (const source of manifest.sources) {
  await copyLinkedApp(source, resolve(root, 'dist'), source.mainMount || source.mount);
}
await mkdir(resolve(root, 'dist/555'), { recursive: true });
await cp(resolve(root, 'dist/date/five/index.html'), resolve(root, 'dist/555/index.html'));
console.log('Built all five Chica apps from local Kwento Natin sources.');
