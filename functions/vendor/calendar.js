// Calendar helpers shared by the page (Save the date) and the API route (alert link).
// Plans are in Philippine time. Manila is UTC+8 all year, so no daylight-saving math is needed.
import { findPlace, budgetFor, checklistFor, BUDGET_NOTE, CHECK_NOTE } from "./data.js";

const PH_OFFSET_HOURS = 8;
const HOURS = 3;

export function parseTime(t) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(t || "").trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return { h, min: Number(m[2]) };
}

export function eventWindow(date, time) {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  const t = parseTime(time);
  if (!dm || !t) return null;
  const start = new Date(Date.UTC(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), t.h - PH_OFFSET_HOURS, t.min));
  const end = new Date(start.getTime() + HOURS * 3600 * 1000);
  return { start, end };
}

const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// "Binondo, Manila, Philippines": what the calendar apps look up to draw the pin. "Pasay or Malate" keeps just the first.
export function mapsQuery(plan) {
  const area = String(plan.area || "").split(/\s+or\s+/i)[0].trim();
  return [plan.place, area, "Philippines"].filter(Boolean).join(", ");
}

export function mapsUrl(plan) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(plan))}`;
}

// Opens the route from wherever she is, by public transport first.
export function directionsUrl(plan) {
  return `https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=${encodeURIComponent(mapsQuery(plan))}`;
}

const prettyDay = (date) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (!m) return String(date || "");
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
};

export function eventParts(plan) {
  const win = eventWindow(plan.date, plan.time);
  if (!win) return null;
  const title = "Chico and Chica's Date \u2764\uFE0F";
  const location = mapsQuery(plan);
  const known = findPlace(plan);
  const budget = budgetFor(plan);
  const where = [plan.place, plan.area].filter(Boolean).join(", ");
  const vibe = plan.catTitle || (known && known.cat.title) || "";
  const lines = [
    `Where: ${where}`,
    `Map: ${mapsUrl(plan)}`,
    `Directions: ${directionsUrl(plan)}`,
    `When: ${prettyDay(plan.date)}, ${plan.time}`,
    vibe ? `Vibe: ${vibe}${known && known.cat.title === vibe ? `. ${known.cat.vibe}` : ""}` : "",
    "",
    known ? "What we'll do:" : "",
    ...(known ? known.place.highlights.map((h) => `- ${h}`) : []),
    "",
    budget ? `Budget: ${budget.sign} (${budget.range}). ${BUDGET_NOTE}` : "",
    `Dalhin: ${checklistFor(plan).join(", ")}`,
    CHECK_NOTE,
    "",
    plan.note && plan.note.trim() ? `Extras: ${plan.note.trim()}` : "",
    "",
    "Chico + Chica. See you!"
  ];
  const details = lines.filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== "")).join("\n");
  return { win, title, location, details, map: mapsUrl(plan) };
}

export function googleCalendarUrl(plan) {
  const p = eventParts(plan);
  if (!p) return "";
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: p.title,
    dates: `${stamp(p.win.start)}/${stamp(p.win.end)}`,
    details: p.details,
    location: p.location
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// RFC 5545 asks for lines of at most 75 octets; fold on character boundaries well under that.
const fold = (line) => {
  const out = [];
  let rest = Array.from(line);
  while (rest.length > 60) { out.push(rest.slice(0, 60).join("")); rest = rest.slice(60); }
  out.push(rest.join(""));
  return out.join("\r\n ");
};

export function icsFile(plan) {
  const p = eventParts(plan);
  if (!p) return "";
  const uid = `date-${plan.date}-${p.win.start.getTime()}@chica.keicodes.dev`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chico and Chica//Date//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(p.win.start)}`,
    `DTEND:${stamp(p.win.end)}`,
    `SUMMARY:${esc(p.title)}`,
    `LOCATION:${esc(p.location)}`,
    `URL:${p.map}`,
    `DESCRIPTION:${esc(p.details)}`,
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Our date is tomorrow, Chica!", "END:VALARM",
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Our date starts in 2 hours!", "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
