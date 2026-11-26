import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { manifest, appDirectory } from './linked-apps.mjs';
import * as serverDates from '../functions/src/shared/dates-core.js';
import * as schedulerDates from '../apps/date-scheduler/src/dates-core.js';

assert.equal(manifest.version, 2);
assert.equal(manifest.projectId, 'chica-keicodes-dev');
assert.equal(manifest.sources.length, 5);
const mainMounts = manifest.sources.map(source => source.mainMount || source.mount);
assert.equal(new Set(mainMounts).size, 5, 'Apps must not overwrite one another');
assert.equal(serverDates.mergeLists, schedulerDates.mergeLists, 'Frontend/backend must use one merge implementation');
assert.equal(serverDates.upsert, schedulerDates.upsert);

const adapted = new Set([
  'chica-date-scheduler/package.json',
  'chica-date-scheduler/src/calendar.js',
  'chica-date-scheduler/src/data.js',
  'chica-date-scheduler/src/dates-core.js',
  'chica-ilychicaaa/public/ilychicaaa/index.html',
  'ilychicaaa/public/ilychicaaa/index.html',
]);
let preserved = 0;
const verifyOriginalHashes = process.argv.includes('--imports');
for (const source of manifest.sources) {
  const provenance = JSON.parse(await readFile(`docs/imports/${source.name}.json`, 'utf8'));
  assert.equal(provenance.commit, source.commit);
  for (const file of provenance.files) {
    const bytes = await readFile(resolve(appDirectory(source), file.path));
    if (verifyOriginalHashes && !adapted.has(`${source.name}/${file.path}`)) {
      assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, 'Imported file changed: ' + file.path);
    }
    assert.ok(!bytes.subarray(0, 100).toString().startsWith('version https://git-lfs.github.com/spec/'), 'An LFS pointer was copied instead of media');
    preserved++;
  }
}
for (const file of ['scripts/build-firebase.mjs', 'scripts/build-linked-apps.mjs', 'scripts/linked-apps.mjs']) {
  const script = await readFile(file, 'utf8');
  assert.ok(!script.includes('.firebase-sources'), 'Build still uses an external checkout');
  assert.ok(!script.includes('git clone') && !script.includes('git fetch'), 'Build still downloads repository sources');
}
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.equal(vercel.git.deploymentEnabled, false, 'Automatic Vercel deployments must stay disabled');
console.log(`Verified five local apps, shared merge rules, ${preserved} imported files/media${verifyOriginalHashes ? ' (original checksums verified outside the documented adaptations)' : ''}, and disabled automatic Vercel deployments.`);
