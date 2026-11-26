import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onRequest } from 'firebase-functions/v2/https';
import { defineJsonSecret } from 'firebase-functions/params';
import notifyDate, { channels } from '../vendor/notifications.js';
import notifyVoucher from '../vendor/voucher-notifications.cjs';
import { createApi } from './api.js';
import { createStore } from './store.js';

initializeApp({ storageBucket: 'chica-keicodes-dev.firebasestorage.app' });
const store = createStore(getFirestore(), getStorage().bucket());
const notificationConfig = defineJsonSecret('CHICA_NOTIFICATIONS');
let api;

export const chicaApi = onRequest({ region: 'asia-southeast1', memory: '256MiB', minInstances: 0, maxInstances: 1, concurrency: 20, timeoutSeconds: 60, secrets: [notificationConfig], invoker: 'public' }, (req, res) => {
  if (!api) {
    const config = notificationConfig.value();
    api = createApi({ store, notifyDate: message => notifyDate(message, config.scheduler || {}), notifyVoucher: (text, subject) => notifyVoucher(text, subject, config.vouchers || {}), channels: () => channels(config.scheduler || {}) });
  }
  return api(req, res);
});
