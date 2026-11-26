import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const directory = resolve('.firebase-migration-data/private');
const path = resolve(directory, 'notifications.json');
const allowed = ['NTFY_TOPIC', 'NTFY_SERVER', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'TELEGRAM_CHICA_CHAT_ID', 'RESEND_API_KEY', 'NOTIFY_EMAIL', 'CALLMEBOT_APIKEY', 'NOTIFY_PHONE'];
await mkdir(directory, { recursive: true });
let config;
try { config = JSON.parse(await readFile(path, 'utf8')); } catch (error) {
  if (error.code !== 'ENOENT') throw error;
  config = {};
  for (const name of ['scheduler', 'vouchers']) {
    const env = parseEnv(await readFile(resolve(directory, name + '.env'), 'utf8'));
    config[name] = Object.fromEntries(allowed.filter(key => env[key]).map(key => [key, env[key]]));
  }
  if (!config.scheduler.NTFY_TOPIC) {
    const project = JSON.parse((await readFile(resolve(directory, 'scheduler.project.json'), 'utf8')).replace(/^\uFEFF/, ''));
    if (!project.id) throw new Error('Missing scheduler project metadata; cannot preserve existing push subscribers.');
    config.scheduler.NTFY_TOPIC = 'chica-date-' + createHash('sha256').update('ntfy:' + project.id).digest('hex').slice(0, 24);
  }
  await writeFile(path, JSON.stringify(config, null, 2), { mode: 0o600 });
}
const missing = Object.entries(config).flatMap(([name, env]) => Object.entries(env).filter(([, value]) => !value || String(value).includes('[SENSITIVE]')).map(([key]) => name + '.' + key));
if (missing.length) {
  console.error('Local-only notification values need to be restored: ' + missing.join(', '));
  console.error('Edit .firebase-migration-data/private/notifications.json locally, then run this command again. Do not paste notification credentials into chat or commit them.');
  process.exit(2);
}
const fingerprint = createHash('sha256').update('fp:' + config.scheduler.NTFY_TOPIC).digest('hex').slice(0, 8);
console.log('Preserved push subscription fingerprint: ' + fingerprint);
if (process.argv.includes('--apply')) {
  const result = spawnSync(process.execPath, [resolve('node_modules/firebase-tools/lib/bin/firebase.js'), 'functions:secrets:set', 'CHICA_NOTIFICATIONS', '--project', 'chica-keicodes-dev', '--data-file', path], { stdio: 'inherit' });
  process.exitCode = result.status || 0;
} else console.log('Prepared local-only notification config. Add --apply after Firebase sign-in to store it in Secret Manager.');
