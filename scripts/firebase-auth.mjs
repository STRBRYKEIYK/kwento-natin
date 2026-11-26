import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const auth = require('firebase-tools/lib/auth');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Keep the CLI's existing credentials in memory; never print or persist them in the project.
export async function firebaseAccessToken() {
  const account = auth.getProjectDefaultAccount(root) || auth.getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error('Firebase sign-in is required. Run npm exec firebase login.');
  const tokens = await auth.getAccessToken(account.tokens.refresh_token, account.tokens.scopes || ['https://www.googleapis.com/auth/cloud-platform']);
  if (!tokens.access_token) throw new Error('Firebase login has expired. Sign in again.');
  return tokens.access_token;
}

export async function firebaseRequest(url, options = {}) {
  const token = await firebaseAccessToken();
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${token}` } });
  if (!response.ok) { const error = new Error(`Firebase request failed (${response.status}): ${new URL(url).pathname}`); error.status = response.status; throw error; }
  return response.status === 204 ? null : response.json();
}
