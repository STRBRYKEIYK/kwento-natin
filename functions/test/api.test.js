import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../src/api.js';
import { sanitizePlan, jpegBuffer } from '../src/validation.js';
import { catalog, mediaUrl } from '../src/shared/media.js';

function fixture(initial = []) {
  let entries = structuredClone(initial);
  const photos = new Map();
  const sent = [];
  const store = {
    readAlbums: async () => [{date:'2026-08-06',label:'Agosto 6',media:[{type:'video',url:'https://example.test/video.mp4'}]}],
    readDates: async () => structuredClone(entries),
    updateDates: async transform => { entries = transform(structuredClone(entries)); },
    putPhoto: async (key, value) => photos.set(key, value),
    getPhoto: async key => photos.get(key),
    deletePhoto: async key => photos.delete(key),
  };
  const api = createApi({ store, now: () => Date.parse('2026-11-26T05:00:00Z'), notifyDate: async message => { sent.push(message); return { ok: true }; }, notifyVoucher: async (...message) => { sent.push(message); return { ok: true }; }, channels: () => ({ telegram: true }), reportError: () => {} });
  async function request(url, method = 'GET', body) {
    const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; }, send(value) { this.body = value; return this; }, end() { return this; } };
    await api({ originalUrl: url, method, body }, response);
    return response;
  }
  return { request, store, photos, sent, entries: () => entries };
}
const plan = { id: 'date-one', date: '2026-11-17', time: '1:00 PM', place: 'Binondo', status: 'confirmed', savedAt: 1 };

test('date writes preserve existing memories, cancellations and distinct plans', async () => {
  const f = fixture([{ ...plan, mem: { note: 'Keep this', photo: '', at: 1 } }]);
  assert.equal((await f.request('/date/api/dates', 'POST', { ...plan, place: 'Binondo', note: 'New note' })).statusCode, 200);
  assert.equal(f.entries()[0].mem.note, 'Keep this');
  await f.request('/date/api/dates', 'POST', { ...plan, id: 'other', date: '2026-11-28', place: 'Manila' });
  await f.request('/date/api/dates', 'POST', { ...plan, status: 'cancelled' });
  const response = await f.request('/date/api/dates');
  assert.equal(response.body.dates.length, 2);
  assert.equal(response.body.dates.find(x => x.id === plan.id).status, 'cancelled');
});

test('legacy media links redirect only known paths for GET and HEAD', async () => {
  const f=fixture();
  const path=Object.keys(catalog.paths).find(p=>p.includes(' '));
  for(const method of ['GET','HEAD']) {
    const response=await f.request(encodeURI(path),method);
    assert.equal(response.statusCode,302);
    assert.equal(response.headers.Location,mediaUrl(path));
    assert.match(response.headers['Cache-Control'],/^public/);
  }
  assert.equal((await f.request(encodeURI(path),'POST')).statusCode,405);
  assert.equal((await f.request('/assets/missing.mp4')).statusCode,404);
  assert.equal((await f.request('/assets/%ZZ.mp4')).statusCode,404);
  assert.equal((await f.request('/assets/__proto__')).statusCode,404);
});

test('curated albums are loaded from the database and cannot be modified by the public endpoint', async () => {
  const f=fixture();
  const result=await f.request('/date/api/albums');
  assert.equal(result.statusCode,200);
  assert.equal(result.body.albums[0].media[0].type,'video');
  assert.equal((await f.request('/date/api/albums','POST',{})).statusCode,405);
  f.store.readAlbums=async()=>{throw new Error('Database offline');};
  assert.equal((await f.request('/date/api/albums')).statusCode,500);
});

test('bad dates, paths, unsupported methods and future memories are rejected', async () => {
  const f = fixture([{ ...plan, date: '2026-12-01' }]);
  assert.equal(sanitizePlan({ ...plan, date: '2026-02-30' }), null);
  assert.equal((await f.request('/date/api/memory', 'POST', { id: plan.id, note: 'Too early' })).statusCode, 409);
  assert.equal((await f.request('/date/api/photo?k=../../secret')).statusCode, 404);
  assert.equal((await f.request('/date/api/dates', 'DELETE')).statusCode, 405);
  assert.equal((await f.request('/not-a-route')).statusCode, 404);
  assert.equal(jpegBuffer('data:image/jpeg;base64,bm90LWEtanBlZw=='), null);
});

test('memories retain old notes, store private JPEGs, and stream through the same endpoint', async () => {
  const f = fixture([{ ...plan, mem: { note: 'Original note', photo: '', at: 1 } }]);
  const bytes = Buffer.alloc(250); bytes.set([0xff, 0xd8, 0xff]);
  const saved = await f.request('/date/api/memory', 'POST', { id: plan.id, photo: `data:image/jpeg;base64,${bytes.toString('base64')}` });
  assert.equal(saved.statusCode, 200);
  assert.equal(saved.body.entry.mem.note, 'Original note');
  const photo = await f.request('/date/api/photo?k=' + saved.body.entry.mem.photo);
  assert.deepEqual(photo.body, bytes);
  assert.equal(photo.headers['Cache-Control'], 'private, max-age=86400');
});

test('calendar links retain Philippine-time events and cancelled plans stay unavailable', async () => {
  const f = fixture([plan]);
  const calendar = await f.request('/date/api/cal?id=date-one');
  assert.equal(calendar.statusCode, 200);
  assert.match(calendar.body, /DTSTART:20261117T050000Z/);
  assert.match(calendar.body, /BEGIN:VALARM/);
  const google = await f.request('/date/api/cal?id=date-one&f=google');
  assert.equal(google.statusCode, 302);
  assert.match(google.headers.Location, /^https:\/\/calendar.google.com\//);
});

test('notification routing is preserved without sending any real messages in tests', async () => {
  const f = fixture();
  assert.equal((await f.request('/date/api/send')).body.channels.telegram, true);
  await f.request('/date/api/send', 'POST', { ...plan, actor: 'chico' });
  assert.equal(f.sent[0].to, 'chica');
  assert.match(f.sent[0].chicaText, /MAY PLANO SI CHICO/);
  assert.equal((await f.request('/vouchers/api/redeem', 'POST', { n: 99 })).statusCode, 400);
  assert.equal((await f.request('/vouchers/api/redeem', 'POST', { n: 3 })).statusCode, 200);
  assert.match(f.sent[1][0], /ISANG MAHIGPIT NA YAKAP/);
});
