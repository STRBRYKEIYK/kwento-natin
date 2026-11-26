import { FieldValue } from 'firebase-admin/firestore';
import { PHOTO_KEY } from './validation.js';

export function createStore(db, bucket) {
  const state = db.doc('_chica/dateScheduler');
  const photo = key => {
    if (!PHOTO_KEY.test(key)) throw new Error('Invalid photo key');
    return bucket.file(`memories/${key}`);
  };
  return {
    async readDates() { const snapshot = await state.get(); const entries = snapshot.data()?.entries; return Array.isArray(entries) ? entries : []; },
    async updateDates(transform) {
      return db.runTransaction(async transaction => {
        const snapshot = await transaction.get(state);
        const entries = snapshot.data()?.entries;
        const next = transform(Array.isArray(entries) ? entries : []);
        transaction.set(state, { entries: next, updatedAt: FieldValue.serverTimestamp() });
        return next;
      });
    },
    async putPhoto(key, bytes) { await photo(key).save(bytes, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: 'image/jpeg', cacheControl: 'private, max-age=86400' } }); },
    async getPhoto(key) { try { const [bytes] = await photo(key).download(); return bytes; } catch (error) { if (Number(error.code) === 404) return null; throw error; } },
    async deletePhoto(key) { await photo(key).delete({ ignoreNotFound: true }); },
  };
}
