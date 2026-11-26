export const PHOTO_KEY = /^m-[A-Za-z0-9_-]{16,32}\.jpg$/;
export const PLAN_ID = /^[A-Za-z0-9_-]{1,40}$/;
export const clean = (value, max) => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max) : '';
export const manilaToday = (now = Date.now()) => new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, mo, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, mo - 1, day));
  return y >= 2025 && y <= 2040 && date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === day;
}
export function sanitizePlan(body, now = Date.now()) {
  if (!body || typeof body !== 'object' || !PLAN_ID.test(body.id) || !validDate(body.date)) return null;
  return { id: body.id, date: body.date, time: clean(body.time, 10), place: clean(body.place, 140), area: clean(body.area, 80),
    vibe: clean(body.vibe, 80), pid: typeof body.pid === 'string' && /^[a-z0-9-]{1,40}$/.test(body.pid) ? body.pid : '',
    by: body.by === 'chico' ? 'chico' : 'chica', status: ['confirmed', 'proposed', 'cancelled'].includes(body.status) ? body.status : 'confirmed',
    note: clean(body.note, 300), sent: body.sent === true, savedAt: now };
}
export function jpegBuffer(photo) {
  const prefix = 'data:image/jpeg;base64,';
  if (typeof photo !== 'string' || !photo.startsWith(prefix) || photo.length > 2_100_000) return null;
  const value = photo.slice(prefix.length);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null;
  const buffer = Buffer.from(value, 'base64');
  return buffer.length >= 200 && buffer.length <= 1_500_000 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff ? buffer : null;
}
