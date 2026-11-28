import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mediaObject, mediaUrl } from '../functions/src/shared/media.js';

const bytes = await readFile('public/models/kwintas.glb');
assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
assert.equal(bytes.readUInt32LE(4), 2);
assert.equal(bytes.readUInt32LE(8), bytes.length);
assert.ok(bytes.length < 13 * 1024 ** 2);
const document = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
assert.ok(document.extensionsRequired.includes('KHR_draco_mesh_compression'));
assert.equal(document.meshes.length, 1);
assert.ok(document.meshes[0].primitives.every(primitive => primitive.extensions.KHR_draco_mesh_compression));
console.log(`Verified necklace GLB header, complete bytes, Draco geometry (${bytes.length} bytes).`);

for (const name of ['necklaces-together.jpg', 'keith-hexagon.jpg', 'jersey-oval.jpg', 'necklace-portrait.jpg', 'jersey-design.png', 'keith-design.png']) {
  const path = '/assets/kwintas/' + name;
  assert.ok(mediaObject(path)?.verified, `${name} missing catalog verification`);
  const response = await fetch(mediaUrl(path), { headers: { Range: 'bytes=0-63' } });
  assert.equal(response.status, 206, `${name} range download unavailable`);
  const png = name.endsWith('.png');
  assert.ok(response.headers.get('content-type').includes(png ? 'image/png' : 'image/jpeg'));
  const firstBytes = Buffer.from(await response.arrayBuffer());
  assert.equal(firstBytes.readUInt16BE(), png ? 0x8950 : 0xffd8, `${name} has invalid image signature`);
  console.log(`Verified showcase image and range download: ${name}.`);
}
