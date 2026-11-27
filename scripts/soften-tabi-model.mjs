import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../public/models/chica-y-chico.glb', import.meta.url);
const bytes = await readFile(file);
assert.equal(bytes.readUInt32LE(0), 0x46546c67);
assert.equal(bytes.readUInt32LE(8), bytes.length);
const length = bytes.readUInt32LE(12);
const model = JSON.parse(bytes.subarray(20, 20 + length).toString());
// One atlas material covers both figurines and the gold base. Keep its
// metallic/roughness map, and soften only the dielectric reflections.
const extension = 'KHR_materials_specular';
model.extensionsUsed = [...new Set([...(model.extensionsUsed || []), extension])];
for (const material of model.materials || []) {
  material.extensions ||= {};
  material.extensions[extension] = { ...material.extensions[extension], specularFactor: 0.25 };
}
let json = Buffer.from(JSON.stringify(model));
json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
const binary = bytes.subarray(20 + length);
const header = Buffer.from(bytes.subarray(0, 20));
header.writeUInt32LE(20 + json.length + binary.length, 8);
header.writeUInt32LE(json.length, 12);
const output = Buffer.concat([header, json, binary]);
assert.ok(output.subarray(20 + json.length).equals(binary), 'Geometry and textures must remain byte-for-byte unchanged');
await writeFile(file, output);
console.log('Softened figurine reflections to 25%; preserved geometry, all textures, and the metallic gold map.');
