import { firebaseRequest } from './firebase-auth.mjs';
try {
  const value = await firebaseRequest('https://secretmanager.googleapis.com/v1/projects/chica-keicodes-dev/secrets/CHICA_NOTIFICATIONS/versions/latest:access');
  const config = JSON.parse(Buffer.from(value.payload?.data || '', 'base64').toString('utf8'));
  const scheduler = config.scheduler || {};
  const required = ['NTFY_TOPIC', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
  if (required.some(key => typeof scheduler[key] !== 'string' || !scheduler[key].trim() || scheduler[key].includes('[SENSITIVE]'))) throw new Error('Notification configuration is incomplete.');
  console.log('Existing push and Telegram settings are present in Firebase Secret Manager.');
} catch {
  console.error('Firebase notification settings are not ready. Restore them locally and run npm run firebase:notifications before deploying the API.');
  process.exitCode = 1;
}
