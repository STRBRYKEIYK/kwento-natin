import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { firebaseRequest } from './firebase-auth.mjs';

const domains = [
  { site: 'chica-keicodes-dev', domain: 'chica.keicodes.dev', existingPublic: 'public' },
  { site: 'chica-keicodes-dev-vouchers', domain: 'voucher.keicodes.dev', existingPublic: 'apps/vouchers' },
];
const result = [];
for (const item of domains) {
  const state = await firebaseRequest(`https://firebasehosting.googleapis.com/v1beta1/projects/chica-keicodes-dev/sites/${item.site}/customDomains/${item.domain}`);
  const http = state.cert?.verification?.http;
  if (process.argv.includes('--prepare-http') && http?.path && http?.desired) {
    if (!/^\/\.well-known\/acme-challenge\/[A-Za-z0-9_-]+$/.test(http.path) || !/^[A-Za-z0-9._-]+$/.test(http.desired)) throw new Error('Unexpected certificate verification format');
    const publicRoot = resolve(item.existingPublic);
    const file = resolve(publicRoot, '.' + http.path);
    if (!file.startsWith(publicRoot + sep)) throw new Error('Unsafe certificate verification path');
    await mkdir(resolve(publicRoot, '.well-known/acme-challenge'), { recursive: true });
    await writeFile(file, http.desired);
  }
  result.push({ domain: item.domain, firebaseSite: `${item.site}.web.app`, hostState: state.hostState, ownershipState: state.ownershipState, certificateState: state.cert?.state, dns: state.requiredDnsUpdates?.desired, certificateDns: state.cert?.verification?.dns?.desired });
}
await mkdir('.firebase-migration-data', { recursive: true });
await writeFile('.firebase-migration-data/domains.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
