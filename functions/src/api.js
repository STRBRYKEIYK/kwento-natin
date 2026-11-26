import { randomBytes } from 'node:crypto';
import { upsert, dedupe, isCancelled } from './shared/dates-core.js';
import { googleCalendarUrl, icsFile } from './shared/calendar.js';
import { messages } from './shared/date-messages.js';
import { clean, validDate, sanitizePlan, manilaToday, jpegBuffer, PLAN_ID, PHOTO_KEY } from './validation.js';

class HttpError extends Error { constructor(status, reason) { super(reason || 'Request failed'); this.status = status; this.reason = reason; } }
const VOUCHERS = { 1: 'ISANG KANTA PARA SAYO', 2: 'ISANG TAWAG MULA SA AKIN', 3: 'ISANG MAHIGPIT NA YAKAP', 4: 'TAKOYAKI O CHEESECAKE', 5: 'ISANG DATE, IKAW ANG BAHALA', 6: 'ISANG SURPRISE', 7: 'UNLIMITED NA I LOVE YOU', 8: 'SURPRISE: AKO. HABAMBUHAY. (NAKUSKOS NA)' };

export function createApi({ store, notifyDate, notifyVoucher, channels, now = Date.now, photoKey = () => `m-${randomBytes(12).toString('base64url')}.jpg`, reportError = error => console.error('Chica API failed:', error.name) }) {
  return async function api(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const url = new URL(req.originalUrl || req.url || '/', 'https://chica.keicodes.dev');
    const path = url.pathname;
    const action = ({ '/api/dates': 'dates', '/api/memory': 'memory', '/api/photo': 'photo', '/api/cal': 'cal', '/api/date': 'send', '/api/redeem': 'redeem' })[path] || (/^\/date\/api\/(dates|memory|photo|cal|send)$/.exec(path)?.[1]) || (path === '/vouchers/api/redeem' ? 'redeem' : '');
    const methods = { dates: ['GET', 'POST'], memory: ['POST'], photo: ['GET'], cal: ['GET'], send: ['GET', 'POST'], redeem: ['POST'] };
    if (!methods[action]) return res.status(404).json({ ok: false });
    if (!methods[action].includes(req.method)) { res.setHeader('Allow', methods[action].join(', ')); return res.status(405).json({ ok: false }); }
    if (req.rawBody?.length > 2_150_000) return res.status(413).json({ ok: false });
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    try {
      if (action === 'dates') {
        if (req.method === 'GET') return res.status(200).json({ ok: true, enabled: true, dates: dedupe(await store.readDates()) });
        const entry = sanitizePlan(body, now());
        if (!entry) throw new HttpError(400);
        await store.updateDates(list => upsert(list, entry));
        return res.status(200).json({ ok: true, enabled: true });
      }
      if (action === 'memory') {
        const id = typeof body.id === 'string' ? body.id : '';
        const note = clean(body.note, 300);
        const photo = typeof body.photo === 'string' ? body.photo : '';
        if (!PLAN_ID.test(id) || (!note && !photo)) throw new HttpError(400);
        const buffer = photo ? jpegBuffer(photo) : null;
        if (photo && !buffer) throw new HttpError(400, 'photo');
        const current = (await store.readDates()).find(entry => entry.id === id);
        if (!current || isCancelled(current)) throw new HttpError(404);
        if (current.date > manilaToday(now())) throw new HttpError(409, 'not-yet');
        const key = buffer ? photoKey() : '';
        if (buffer) { if (!PHOTO_KEY.test(key)) throw new Error('Invalid photo key'); await store.putPhoto(key, buffer); }
        let saved;
        let oldKey;
        try {
          await store.updateDates(list => {
            const latest = list.find(entry => entry.id === id);
            if (!latest || isCancelled(latest)) throw new HttpError(404);
            if (latest.date > manilaToday(now())) throw new HttpError(409, 'not-yet');
            oldKey = latest.mem?.photo || '';
            saved = { ...latest, mem: { note: note || latest.mem?.note || '', photo: key || oldKey, at: now() }, savedAt: now() };
            return upsert(list, saved);
          });
        } catch (error) { if (key) await store.deletePhoto(key).catch(() => {}); throw error; }
        if (key && oldKey && key !== oldKey) await store.deletePhoto(oldKey).catch(() => {});
        return res.status(200).json({ ok: true, entry: saved });
      }
      if (action === 'photo') {
        const key = url.searchParams.get('k') || '';
        if (!PHOTO_KEY.test(key)) throw new HttpError(404);
        const buffer = await store.getPhoto(key);
        if (!buffer) throw new HttpError(404);
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'private, max-age=86400');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.status(200).send(buffer);
      }
      if (action === 'cal') {
        const id = url.searchParams.get('id') || '';
        if (!PLAN_ID.test(id)) throw new HttpError(404);
        const entry = (await store.readDates()).find(item => item.id === id && !isCancelled(item));
        if (!entry) throw new HttpError(404);
        const plan = { ...entry, catTitle: entry.vibe };
        if (url.searchParams.get('f') === 'google') {
          const target = googleCalendarUrl(plan);
          if (!target) throw new HttpError(404);
          res.setHeader('Location', target);
          return res.status(302).end();
        }
        const calendar = icsFile(plan);
        if (!calendar) throw new HttpError(404);
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="Chico-and-Chica-date.ics"');
        return res.status(200).send(calendar);
      }
      if (action === 'send') {
        if (req.method === 'GET') return res.status(200).json({ ok: true, channels: channels() });
        const kind = ['new', 'change', 'cancel', 'accept', 'decline'].includes(body.kind) ? body.kind : 'new';
        const actor = body.actor === 'chico' ? 'chico' : 'chica';
        const plan = { vibe: clean(body.catTitle, 80), place: clean(body.place, 140), area: clean(body.area, 80), date: clean(body.date, 10), time: clean(body.time, 10), note: clean(body.note, 800), customPlace: body.customPlace === true };
        if (!plan.place || !validDate(plan.date) || !plan.time) throw new HttpError(400);
        const from = body.from && clean(body.from.place, 140) ? { place: clean(body.from.place, 140), area: clean(body.from.area, 80), date: clean(body.from.date, 10), time: clean(body.from.time, 10) } : null;
        const message = messages({ kind, actor, p: plan, from });
        if (!message) throw new HttpError(400);
        const calendarUrl = kind === 'cancel' || kind === 'decline' ? '' : googleCalendarUrl({ ...plan, catTitle: plan.vibe });
        return res.status(200).json(await notifyDate({ ...message, calendarUrl, to: actor === 'chico' ? 'chica' : 'keith' }));
      }
      const number = Number(body.n);
      if (!Number.isInteger(number) || !VOUCHERS[number]) throw new HttpError(400);
      const when = new Date(now()).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });
      return res.status(200).json(await notifyVoucher(`CHICAAAAA REDEEMED VOUCHER #${number}: ${VOUCHERS[number]} (${when} PHT)`, `Voucher #${number} redeemed`));
    } catch (error) {
      if (!error.status) reportError(error);
      return res.status(error.status || 500).json({ ok: false, ...(error.reason ? { why: error.reason } : {}) });
    }
  };
}
