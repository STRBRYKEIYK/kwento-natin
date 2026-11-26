// Dates are kept on her device so the Library calendar (same origin, chica.keicodes.dev) can mark them with a heart,
// and on the server (api/dates) so every device sees them. The rules for what counts as "the same date", what a cancel
// does and how copies merge live in dates-core.js.
import { slot, slotId, upsert, mergeLists, tombstone, isCancelled, statusOf, byOf, visible, MAX_ENTRIES } from "./dates-core.js";

const KEY = "chica.dates.v1";
const SERVER_CACHE = "chica.dates.srv";
const PLAN = "chica.plan";
const ROLE = "chica.role";
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const API = () => `${import.meta.env.BASE_URL}api`;

/* ---------- who is using this: Chica by default, Chico on the link with ?as=chico ---------- */
export function getRole() {
  try {
    const q = new URLSearchParams(location.search).get("as");
    if (q === "chico" || q === "chica") { localStorage.setItem(ROLE, q); return q; }
    return localStorage.getItem(ROLE) === "chico" ? "chico" : "chica";
  } catch {
    return "chica";
  }
}

/* ---------- this device ---------- */
export function readDates() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

function writeDates(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_ENTRIES))); } catch { /* storage blocked, the plan itself still works */ }
}

export function planKey() {
  try {
    let id = sessionStorage.getItem(PLAN);
    if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); sessionStorage.setItem(PLAN, id); }
    return id;
  } catch {
    return "p" + Date.now().toString(36);
  }
}

export function forgetPlanKey() {
  try { sessionStorage.removeItem(PLAN); } catch { /* storage blocked */ }
}

export const newPlanId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- the server ---------- */
// Best effort: if it fails, the date is still on this device and the Library page sends it up later.
function remember(entry) {
  try {
    const { savedAt, mem, ...body } = entry; // the server stamps its own time and only the memory endpoint writes mem
    fetch(`${API()}/dates`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), keepalive: true
    }).catch(() => {});
  } catch { /* offline or blocked */ }
}

// This phone's dates merged with the server's (cached for the Library page too). Cancelled ones are included.
export async function loadDates() {
  let server = [], enabled = false;
  try {
    const r = await fetch(`${API()}/dates`, { cache: "no-store" });
    const j = r.ok ? await r.json() : null;
    if (j && j.ok === true && Array.isArray(j.dates)) {
      server = j.dates; enabled = j.enabled === true;
      try { localStorage.setItem(SERVER_CACHE, JSON.stringify(server)); } catch { /* storage blocked */ }
    }
  } catch { /* offline: this phone's list is still good */ }
  if (!server.length) {
    try { const c = JSON.parse(localStorage.getItem(SERVER_CACHE) || "[]"); if (Array.isArray(c)) server = c; } catch { /* ignore */ }
  }
  return { all: mergeLists(readDates(), server), enabled };
}

/* ---------- save, change, cancel, answer ---------- */
export function entryFrom(id, sel, sent, role = getRole()) {
  return {
    id, date: sel.date, time: sel.time || "", place: sel.place || "", area: sel.area || "",
    vibe: sel.catTitle || "", pid: sel.pid || "", by: role,
    // what Chico picks waits for Chica's yes; what Chica picks is settled
    status: role === "chico" ? "proposed" : "confirmed",
    note: (sel.note || "").trim().slice(0, 300), sent: !!sent
  };
}

function store(entry) {
  const now = Date.now();
  writeDates(upsert(readDates(), { ...entry, savedAt: now }));
  remember(entry);
}

export function saveDate(id, sel, sent) {
  if (!ISO.test(sel.date || "")) return null;
  const entry = entryFrom(id, sel, sent);
  const prev = readDates().find((x) => x && x.id === id);
  // this plan moved to another day or place: close the old one so an old copy of it cannot come back
  if (prev && typeof prev.date === "string" && !isCancelled(prev) && slot(prev) !== slot(entry)) store(tombstone(prev));
  // it was already sent from another tab: it stays sent
  const before = readDates().some((x) => x && x.sent && !isCancelled(x) && typeof x.date === "string" && slot(x) === slot(entry));
  const out = { ...entry, sent: entry.sent || before };
  store(out);
  return out;
}

// Gives up a date. The entry stays as a cancelled mark so it is gone on every device, not just this one.
export function cancelDate(entry) {
  const gone = { ...entry, status: "cancelled" };
  delete gone.savedAt; delete gone.mem;
  store(gone);
  return gone;
}

// Chica says yes to what Chico suggested.
export function acceptDate(entry) {
  const ok = { ...entry, status: "confirmed" };
  delete ok.savedAt;
  store(ok);
  return ok;
}

export { slot, slotId, statusOf, byOf, isCancelled, visible };

// Tell the other person (and Keith's channels) what just happened. Resolves to the API answer, or null if it could not be reached.
export async function sendAlert(kind, actor, entry, extra = {}) {
  try {
    const r = await fetch(`${API()}/send`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, actor, catTitle: entry.vibe, place: entry.place, area: entry.area, date: entry.date, time: entry.time, note: entry.note || "", customPlace: !entry.pid, ...extra })
    });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
