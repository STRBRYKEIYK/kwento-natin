// The rules for a saved date, shared by the server (api/_dates.js) and the page (src/saved.js).
// No imports, so it bundles for the browser and runs in the function. The Library menu has its own copy of
// slot / mergePair / mergeLists in menu/index.html (kwento-natin), so keep the three in step.
//
// An entry: { id, date: "YYYY-MM-DD", time, place, area, vibe, pid, by, status, note, sent, savedAt, mem? }
//   status  "confirmed" (default) | "proposed" (Chico suggested it, waiting for Chica) | "cancelled" (kept as a tombstone)
//   by      "chica" (default) | "chico"
//   mem     { note, photo, at }  the memory added after the date

export const MAX_ENTRIES = 200;
export const STATUSES = ["confirmed", "proposed", "cancelled"];

export const statusOf = (x) => (x && STATUSES.includes(x.status) ? x.status : "confirmed");
export const byOf = (x) => (x && x.by === "chico" ? "chico" : "chica");
export const isCancelled = (x) => statusOf(x) === "cancelled";

// The same day at the same place is one date, whichever plan id saved it. Case and spacing do not matter.
export const slot = (x) => `${x.date}|${String(x.place || "").toLowerCase().replace(/\s+/g, " ").trim()}`;

// A short stable id for the tombstone of a slot that a plan moved away from.
export function slotId(x) {
  let h = 5381;
  const s = slot(x);
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return `x${h.toString(36)}`;
}

const valid = (x) => x && typeof x === "object" && typeof x.date === "string";
const bySavedAt = (a, b) => (a.savedAt || 0) - (b.savedAt || 0);

// Two copies of the same date: the newer one wins. "Sent" and the memory carry over, but only from copies
// that are not cancelled, so a re-planned date never inherits "sent" from a cancelled one.
export function mergePair(a, b) {
  const win = (b.savedAt || 0) >= (a.savedAt || 0) ? b : a;
  const lose = win === b ? a : b;
  const cancelled = isCancelled(win);
  const out = { ...win, sent: cancelled ? Boolean(win.sent) : [a, b].some((e) => e.sent && !isCancelled(e)) };
  if (!cancelled && !out.mem && lose.mem && !isCancelled(lose)) out.mem = lose.mem;
  return out;
}

// One entry per date + place.
export function dedupe(list) {
  const by = new Map();
  for (const x of Array.isArray(list) ? list : []) {
    if (!valid(x)) continue;
    const k = slot(x);
    by.set(k, by.has(k) ? mergePair(by.get(k), x) : x);
  }
  return [...by.values()].sort(bySavedAt);
}

// Several lists (this phone, the server) into one: first by plan id (a plan that moved day keeps only its newest
// day), then by date + place.
export function mergeLists(...lists) {
  const byId = new Map();
  for (const l of lists) {
    for (const x of Array.isArray(l) ? l : []) {
      if (!valid(x)) continue;
      const k = x.id || slot(x);
      byId.set(k, byId.has(k) ? mergePair(byId.get(k), x) : x);
    }
  }
  return dedupe([...byId.values()]);
}

// Add or change one entry. Anything with the same id or the same date + place is folded into it.
export function upsert(list, entry, max = MAX_ENTRIES) {
  const hit = (x) => valid(x) && (x.id === entry.id || slot(x) === slot(entry));
  let next = entry;
  for (const o of list.filter(hit)) next = mergePair(o, next);
  return dedupe(list.filter((x) => !hit(x)).concat(next)).slice(-max);
}

// The entry that closes a slot a plan moved away from, so an old copy of that date cannot come back.
export function tombstone(old, now = Date.now()) {
  return { id: slotId(old), date: old.date, time: old.time || "", place: old.place || "", area: old.area || "", vibe: old.vibe || "", pid: old.pid || "", by: byOf(old), status: "cancelled", note: "", sent: false, savedAt: now };
}

export const visible = (list) => dedupe(list).filter((x) => !isCancelled(x));
