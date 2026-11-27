import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

// The model merger preserves separate scenes by default. model-viewer displays
// only the default scene, so both gifts must be roots of that same scene.
const path = new URL('../public/models/yakap-delivery.glb', import.meta.url);
const bytes = await readFile(path);
assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'Expected a GLB model');
const jsonLength = bytes.readUInt32LE(12);
const document = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
const roots = [...new Set(document.scenes.flatMap(scene => scene.nodes || []))];
assert.equal(roots.length, 2, 'Expected capybara and tulip roots');
assert.equal(new Set(roots.map(index => document.nodes[index].mesh)).size, 2, 'Both gifts must retain their meshes');
document.scenes = [{ name: 'Capybara holding tulips', nodes: roots }];
document.scene = 0;

let json = Buffer.from(JSON.stringify(document));
json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
const binaryChunks = bytes.subarray(20 + jsonLength);
const header = Buffer.from(bytes.subarray(0, 20));
header.writeUInt32LE(20 + json.length + binaryChunks.length, 8);
header.writeUInt32LE(json.length, 12);
await writeFile(path, Buffer.concat([header, json, binaryChunks]));
console.log('Combined capybara and tulips into the default scene; geometry and textures preserved.');
