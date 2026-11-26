import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CATEGORIES, TIMES, ALL_PLACES, TIERS, ZONES, BUDGET_NOTE, CHECK_NOTE, findPlace, checklistFor, budgetFor } from "./data.js";
import { PHOTOS } from "./photos.js";
import { googleCalendarUrl, icsFile, mapsUrl, directionsUrl } from "./calendar.js";
import { acceptDate, cancelDate, entryFrom, forgetPlanKey, getRole, isCancelled, loadDates, newPlanId, planKey, saveDate, sendAlert, slot, statusOf } from "./saved.js";

const STEPS = ["Vibe", "Place", "Date & time", "Your say"];
const EMPTY = { catId: "", catTitle: "", place: "", area: "", pid: "", customPlace: false, date: "", time: "", note: "" };
const LABEL = "text-[10px] font-bold uppercase tracking-[0.28em]";
const NO_FILTER = { budget: 0, zone: "" };

/* ---------- helpers ---------- */
const parseISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const prettyDate = (iso) =>
  iso ? parseISO(iso).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
const shortDate = (iso) => (iso ? parseISO(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "");
const dayLabel = (iso) => {
  const d = parseISO(iso);
  const long = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return d.getFullYear() === new Date().getFullYear() ? long : `${long}, ${d.getFullYear()}`;
};
const todayISO = () => { const t = new Date(); return toISO(t.getFullYear(), t.getMonth(), t.getDate()); };
const daysUntil = (iso) => Math.round((parseISO(iso) - parseISO(todayISO())) / 86400000);
const countdown = (iso) => {
  const n = daysUntil(iso);
  return n === 0 ? "NGAYON NA!" : n === 1 ? "BUKAS NA!" : n > 1 ? `${n} ARAW NA LANG` : "";
};

const enc = (p) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(p))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const dec = (s) => {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const p = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    if (!p || typeof p !== "object") return null;
    const out = { ...EMPTY };
    for (const k of Object.keys(EMPTY)) {
      if (k === "customPlace") out[k] = p[k] === true;
      else if (typeof p[k] === "string") out[k] = p[k].slice(0, k === "note" ? 800 : 140);
    }
    return out.place && /^\d{4}-\d{2}-\d{2}$/.test(out.date) && out.time ? out : null;
  } catch {
    return null;
  }
};

const isCustomPlan = (s) => s.customPlace || s.note.trim().length > 0;

const OPEN_LINK = () => `${location.origin}${location.pathname}?open=dates`;

const planText = (s, role) =>
  role === "chico"
    ? [
        "CHICAAA! PLANO KO PARA SA ATIN \u{1F970}",
        `Vibe: ${s.catTitle}`,
        `Place: ${s.place}${s.area ? ` (${s.area})` : ""}`,
        `When: ${prettyDate(s.date)} at ${s.time}`,
        s.note.trim() ? `Extras: ${s.note.trim()}` : "",
        "",
        `Sagutin mo dito: ${OPEN_LINK()}`
      ].filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== "")).join("\n")
    : [
        "CHICOOO! HERE'S OUR DATE PLAN \u{1F970}",
        `Vibe: ${s.catTitle}`,
        `Place: ${s.place}${s.area ? ` (${s.area})` : ""}${s.customPlace ? " - my own pick!" : ""}`,
        `When: ${prettyDate(s.date)} at ${s.time}`,
        s.note.trim() ? `My extras: ${s.note.trim()}` : ""
      ].filter(Boolean).join("\n");

/* ---------- small marks ---------- */
const Heart = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
const Arrow = ({ className = "h-4 w-4", flip = false }) => (
  <svg viewBox="0 0 24 24" className={`${className} ${flip ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);
const Tick = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
const Dice = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const variants = {
  enter: (d) => ({ opacity: 0, x: d > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d > 0 ? -28 : 28 })
};

/* ---------- welcome ---------- */
function Ticker() {
  const unit = (k) => (
    <span key={k} className="flex shrink-0 items-center gap-5 pr-5">
      {["Chico", "Chica", "3:33 PM", "Date night", "Admit two"].map((t) => (
        <span key={t} className="flex items-center gap-5">
          <span>{t}</span>
          <Heart className="h-2.5 w-2.5" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden bg-red py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white" aria-hidden="true">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">{[0, 1, 2, 3].map(unit)}</div>
    </div>
  );
}

function Welcome({ role, onStart, mine, waiting, next, onDates }) {
  const chico = role === "chico";
  return (
    <div className="min-h-dvh bg-ink text-paper">
      <Ticker />
      <div className="mx-auto flex min-h-[calc(100dvh-34px)] max-w-xl flex-col px-6 pb-10 pt-6">
        <div className={`${LABEL} flex justify-between text-paper/55`}>
          <span>3:33 PM</span>
          <span>11.16.2026</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
          className="relative mx-auto mt-7 w-[86%] max-w-sm"
        >
          <div className="print absolute -right-3 top-3 w-[62%] rotate-[5deg]">
            <div className="aspect-[4/3]"><img src={PHOTOS.b5} alt="" loading="eager" decoding="async" /></div>
          </div>
          <div className="print relative w-[72%] -rotate-[3deg]">
            <div className="aspect-[4/3]"><img src={PHOTOS.b3} alt="Chico and Chica in matching sunglasses" loading="eager" decoding="async" /></div>
            <p className="absolute inset-x-0 bottom-1.5 text-center text-[8px] font-bold uppercase tracking-[0.3em] text-mute">Nos. 1116 &middot; 0333</p>
          </div>
          <span className="absolute -bottom-2 -right-1 rotate-[-4deg] border-[1.5px] border-red-lt bg-ink px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.28em] text-red-lt">
            Admit two
          </span>
        </motion.div>

        <div className="mt-auto pt-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={`${LABEL} text-red-lt`}>
            {chico ? "Plano ni Chico" : "Isang imbitasyon"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-4 font-display text-[3.2rem] font-black italic leading-[0.94] sm:text-7xl"
          >
            {chico ? <>Chico plans a date for <span className="text-red-lt">Chica.</span></> : <>Chico invites <span className="text-red-lt">Chica</span> on a date.</>}
            <Heart className="ml-2 inline-block h-[0.4em] w-[0.4em] align-[0.1em] text-red-lt" />
          </motion.h1>

          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 border-t-[1.5px] border-paper">
            {[["Para kay", "Chicaaaaa ko"], ["Mula kay", "Chicooo mo"], [chico ? "Ikaw ang bahala" : "Ikaw ang pipili", "Lugar, araw, oras"]].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[116px_1fr] gap-3 border-b border-paper/20 py-3">
                <dt className={`${LABEL} pt-0.5 text-red-lt`}>{k}</dt>
                <dd className="text-[15px] font-medium uppercase tracking-wide">{v}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.97 }} onClick={onStart}
            className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-red px-8 text-[12px] font-bold uppercase tracking-[0.2em] text-white"
          >
            {chico ? "Simulan ang plano" : "Open invitation"} <Arrow />
          </motion.button>

          {mine > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              whileTap={{ scale: 0.97 }} onClick={onDates}
              className="mt-3 flex min-h-14 w-full items-center justify-between gap-3 rounded-full border-[1.5px] border-paper/60 px-6 text-left"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-[0.2em]">
                  {waiting ? "May plano si Chico, sagutin mo" : `Mga date natin · ${mine}`}
                </span>
                {next && countdown(next.date) && (
                  <span className={`${LABEL} mt-0.5 block truncate text-red-lt`}>{shortDate(next.date)} {"·"} {countdown(next.date)}</span>
                )}
              </span>
              <Arrow className="h-4 w-4 shrink-0" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- step chrome: a little panel for the toggles, a big panel for the choices ---------- */
function Header({ step, onBack }) {
  return (
    <header className="mb-7 lg:mb-9">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className={`${LABEL} -ml-1 inline-flex min-h-11 items-center gap-2 pr-3 text-ink`}>
          <Arrow flip /> Back
        </button>
        <p className={`${LABEL} text-mute`}>{`0${step} / 0${STEPS.length}`} · {STEPS[step - 1]}</p>
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-[3px] flex-1 transition-colors duration-300 ${i < step ? "bg-red" : "bg-line"}`} />
        ))}
      </div>
    </header>
  );
}

function Title({ eyebrow, children, sub, photo, tilt = 4, className = "mb-7" }) {
  return (
    <div className={`relative ${className}`}>
      {photo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 0 }} animate={{ opacity: 1, scale: 1, rotate: tilt }} transition={{ delay: 0.15, duration: 0.5 }}
          className="print absolute right-0 top-0 w-[88px]" aria-hidden="true"
        >
          <div className="aspect-square"><img src={photo} alt="" loading="lazy" decoding="async" /></div>
        </motion.div>
      )}
      <p className={`${LABEL} text-red`}>{eyebrow}</p>
      <h2 className={`mt-2 font-display text-[2.6rem] font-black italic leading-[1.02] ${photo ? "pr-24" : ""}`}>{children}</h2>
      {sub && <p className="mt-3 max-w-[34ch] text-[13px] font-medium uppercase leading-relaxed tracking-wide text-mute">{sub}</p>}
    </div>
  );
}

const Chevron = ({ open }) => (
  <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* a small toggle. `dark` is for the little panel. */
function Chip({ on, onClick, children, dark = false, disabled = false, count, title }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={on} disabled={disabled} title={title}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors disabled:opacity-35 ${dark ? "lg:min-h-8 lg:px-3" : ""} ${
        on ? "border-red bg-red text-white" : dark ? "border-paper/40 text-paper" : "border-ink bg-card text-ink"
      }`}
    >
      {children}
      {count != null && <span className={on ? "text-white/80" : dark ? "text-paper/50" : "text-mute"}>{count}</span>}
    </button>
  );
}

function Group({ label, children, scroll = false, className = "mt-5 lg:mt-4" }) {
  return (
    <div className={className}>
      <p className={`${LABEL} text-paper/55`}>{label}</p>
      <div
        role="group" aria-label={label}
        className={`mt-2 flex gap-2 ${scroll ? "-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0" : "flex-wrap"}`}
      >{children}</div>
    </div>
  );
}

/* the little panel: toggles on top, what we have so far and Continue underneath (wide screens) */
function SidePanel({ nav, label = "Mga toggle", pinned, peek, toggleLabel = "Ayusin", startOpen = true, children }) {
  const [open, setOpen] = useState(startOpen);
  const bodyId = useId();
  const { sel, step } = nav;
  const cat = CATEGORIES.find((c) => c.id === sel.catId);
  const rows = [["Vibe", cat ? cat.short : sel.catTitle, 1], ["Lugar", sel.place, 2], ["Araw", sel.date ? shortDate(sel.date) : "", 3], ["Oras", sel.time, 3]];
  const showFoot = !nav.noNext || rows.some(([, v]) => v);
  return (
    <aside
      aria-label="Mga toggle"
      className="min-w-0 rounded-xl bg-ink p-4 text-paper lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex lg:max-h-[calc(100dvh-7.5rem)] lg:flex-col lg:self-start lg:p-5"
    >
      <div className="lg:-mx-2 lg:-mt-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-2 lg:pt-1">
      <div className="flex items-center justify-between gap-3">
        <p className={`${LABEL} text-red-lt`}>{label}</p>
        {children && (
          <button
            type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={bodyId}
            className={`${LABEL} -mr-2 inline-flex min-h-11 items-center gap-2 px-2 text-paper/80 lg:hidden`}
          >
            {open ? "Itago" : toggleLabel} <Chevron open={open} />
          </button>
        )}
      </div>
      {pinned && <div className="mt-1 lg:mt-3">{pinned}</div>}
      {!open && peek && <p className="mt-3 text-[11px] font-medium uppercase leading-relaxed tracking-wide text-paper/60 lg:hidden">{peek}</p>}
      {children && <div id={bodyId} className={`${open ? "block" : "hidden"} lg:block`}>{children}</div>}
      </div>

      {showFoot && <div className="mt-4 hidden shrink-0 border-t border-paper/20 pt-4 lg:block">
        {rows.some(([, v]) => v) && (
          <>
            <p className={`${LABEL} text-paper/55`}>Date natin</p>
            <dl className="mt-1 mb-3">
              {rows.filter(([, v]) => v).map(([k, v, to]) => (
                <div key={k} className="grid grid-cols-[52px_minmax(0,1fr)] items-baseline gap-2 border-b border-paper/15 py-1">
                  <dt className={`${LABEL} text-red-lt`}>{k}</dt>
                  <dd className="min-w-0 break-words text-[14px] font-bold leading-snug">
                    {to !== step ? (
                      <button type="button" onClick={() => nav.jump(to)} className="text-left underline decoration-paper/30 underline-offset-4 hover:decoration-red-lt">{v}</button>
                    ) : v}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {!nav.noNext && (
          <>
            <p className="min-h-4 text-[11px] font-bold uppercase leading-snug tracking-[0.14em] text-paper/60" role="status">{nav.hint}</p>
            <button
              type="button" onClick={nav.next} disabled={!nav.canNext}
              className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-red px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-opacity disabled:opacity-30 lg:min-h-12"
            >
              {nav.nextLabel} <Arrow />
            </button>
          </>
        )}
      </div>}
    </aside>
  );
}

/* the big panel: a titled frame around the choices */
function Panel({ head, aside: right, children }) {
  return (
    <div className="overflow-hidden rounded-xl border-[1.5px] border-ink">
      <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink bg-card px-4 py-3 lg:px-5">
        <p className={`${LABEL} text-red`}>{head}</p>
        {right && <p className={`${LABEL} text-mute`}>{right}</p>}
      </div>
      <div className="bg-paper p-3 sm:p-4 lg:p-5">{children}</div>
    </div>
  );
}

function BottomBar({ nav }) {
  if (nav.noNext) return null;
  const line = [nav.sel.place, nav.sel.date && shortDate(nav.sel.date), nav.sel.time].filter(Boolean).join(" · ");
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-6 pb-6 pt-3 lg:hidden">
      <div className="mx-auto max-w-xl">
        <p className={`${LABEL} mb-2 min-h-4 truncate text-center tracking-[0.14em] ${nav.hint ? "text-mute" : "text-ink"}`} role="status">{nav.hint || line}</p>
        <button
          type="button" onClick={nav.next} disabled={!nav.canNext}
          className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-red px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-opacity disabled:opacity-30"
        >
          {nav.nextLabel} <Arrow />
        </button>
      </div>
    </div>
  );
}

function Stage({ nav, title, aside, children }) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className={`mx-auto w-full max-w-xl px-6 pt-4 lg:max-w-6xl lg:pb-16 ${nav.noNext ? "pb-16" : "pb-44"}`}>
        <Header step={nav.step} onBack={nav.back} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-0">
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">{title}</div>
          {aside}
          <section className="min-w-0 lg:col-start-2 lg:row-start-2">{children}</section>
        </div>
      </div>
      <BottomBar nav={nav} />
    </div>
  );
}

/* a ticket-style card: dashed stub on the left, content on the right */
function TicketRow({ id, mark, label, active, onClick, children, delay = 0, disabled = false }) {
  return (
    <motion.button
      id={id} type="button" disabled={disabled}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: disabled ? 0.4 : 1, y: 0 }} transition={{ delay }}
      whileTap={disabled ? undefined : { scale: 0.985 }} onClick={onClick} aria-pressed={active}
      className={`relative grid w-full grid-cols-[60px_1fr] overflow-hidden rounded-lg border-[1.5px] bg-card text-left transition-colors ${active ? "border-red" : "border-ink"}`}
    >
      <span className={`flex flex-col items-center justify-between gap-3 border-r-2 border-dashed px-1 py-4 ${active ? "border-red" : "border-ink"}`}>
        <span className={`${LABEL} text-[8px] tracking-[0.3em] text-red [writing-mode:vertical-rl] rotate-180`}>{label}</span>
        <span className={`font-display text-[2.2rem] font-black leading-none ${active ? "text-red" : "text-ink"}`}>{mark}</span>
      </span>
      <span className="min-w-0 p-4 pr-5">{children}</span>
      {active && (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-red text-white"><Tick className="h-3.5 w-3.5" /></span>
      )}
    </motion.button>
  );
}

/* ---------- steps 1 and 2: the vibe, then the place ---------- */
const matchesBZ = (f) => (p) => (!f.budget || p.budget <= f.budget) && (!f.zone || p.zone === f.zone);

function SurpriseButton({ onClick, disabled }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-dashed border-paper/70 px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:border-red-lt disabled:opacity-40 lg:min-h-12"
    >
      <Dice className="h-5 w-5" /> Surprise me
    </button>
  );
}

// the same budget and distance toggles on the vibe step and the place step
function filterPeek(filters) {
  return `${filters.budget ? `Hanggang ${TIERS[filters.budget].sign}` : "Kahit magkano"} · ${filters.zone ? ZONES[filters.zone] : "Kahit saan"}`;
}
function FilterGroups({ filters, setFilters, shown, total }) {
  const active = !!(filters.budget || filters.zone);
  return (
    <>
      <Group label="Budget para sa dalawa">
        <Chip dark on={!filters.budget} onClick={() => setFilters({ ...filters, budget: 0 })}>Kahit magkano</Chip>
        {[1, 2].map((t) => (
          <Chip key={t} dark title={`${TIERS[t].label}: ${TIERS[t].range}`} on={filters.budget === t} onClick={() => setFilters({ ...filters, budget: filters.budget === t ? 0 : t })}>Hanggang {TIERS[t].sign}</Chip>
        ))}
      </Group>
      <Group label="Gaano kalayo">
        <Chip dark on={!filters.zone} onClick={() => setFilters({ ...filters, zone: "" })}>Kahit saan</Chip>
        {Object.entries(ZONES).map(([k, text]) => (
          <Chip key={k} dark on={filters.zone === k} onClick={() => setFilters({ ...filters, zone: filters.zone === k ? "" : k })}>{text}</Chip>
        ))}
      </Group>
      <p className="mt-4 text-[11px] font-medium uppercase leading-relaxed tracking-wide text-paper/70 lg:mt-3" role="status">
        {active ? `${shown} sa ${total} lugar ang bagay.` : `${total} lugar sa kabuuan.`}
        {active && <button type="button" onClick={() => setFilters(NO_FILTER)} className="ml-2 font-bold text-red-lt underline underline-offset-4">Alisin</button>}
      </p>
    </>
  );
}

function CategoryStep({ nav, sel, onPick, filters, setFilters, onSurprise }) {
  const ok = matchesBZ(filters);
  const total = ALL_PLACES.length;
  const shown = ALL_PLACES.filter(ok).length;
  return (
    <Stage
      nav={nav}
      title={<Title eyebrow="Step one" sub="What kind of date are we feeling?" photo={PHOTOS.b1} tilt={4} className="mb-2 lg:mb-6">Pick the vibe</Title>}
      aside={
        <SidePanel nav={nav} pinned={<SurpriseButton onClick={onSurprise} disabled={!shown} />} peek={filterPeek(filters)} toggleLabel="Budget at layo" startOpen={false}>
          <FilterGroups filters={filters} setFilters={setFilters} shown={shown} total={total} />
        </SidePanel>
      }
    >
      <Panel head="Mga vibe" aside={`${CATEGORIES.length}`}>
        <div className="grid gap-3 lg:grid-cols-2">
          {CATEGORIES.map((c, i) => {
            const n = ALL_PLACES.filter((p) => p.catId === c.id && ok(p)).length;
            return (
              <TicketRow key={c.id} id={`cat-${c.id}`} mark={i + 1} label="Vibe" active={sel.catId === c.id} onClick={() => onPick(c)} delay={0.05 * i} disabled={!n}>
                <span className="block pr-6 font-display text-[1.3rem] font-black leading-tight">{c.title}</span>
                <span className="mt-1.5 block text-[12px] font-medium uppercase leading-relaxed tracking-wide text-mute">{c.vibe}</span>
                <span className={`${LABEL} mt-3 block text-red`}>
                  {n === c.places.length ? `${n} ${n === 1 ? "place" : "places"}` : `${n} of ${c.places.length} places`} + your own pick
                </span>
              </TicketRow>
            );
          })}
        </div>
      </Panel>
    </Stage>
  );
}

function PlaceStep({ nav, sel, patch, role, filters, setFilters, surprise, onSurprise }) {
  const chico = role === "chico";
  const ok = matchesBZ(filters);
  const cat = CATEGORIES.find((c) => c.id === sel.catId);
  const custom = sel.customPlace;

  // Surprise me: bring the chosen card into view
  useEffect(() => {
    if (!surprise) return;
    const el = document.getElementById(`pl-${surprise}`);
    if (!el) return;
    const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
  }, [surprise]);

  if (!cat) return null;
  const total = ALL_PLACES.length;
  const shown = ALL_PLACES.filter(ok).length;
  const list = ALL_PLACES.filter((p) => p.catId === cat.id && ok(p));
  const hidden = cat.places.length - list.length;
  const pick = (p) => patch({ place: p.name, area: p.area, pid: p.id, customPlace: false });
  const openCustom = () => patch({ place: "", area: "", pid: "", customPlace: true });

  return (
    <Stage
      nav={nav}
      title={<Title eyebrow="Step two" sub={cat.vibe} photo={PHOTOS.b2} tilt={-4} className="mb-2 lg:mb-6">Set the scene</Title>}
      aside={
        <SidePanel nav={nav} pinned={<SurpriseButton onClick={onSurprise} disabled={!shown} />} peek={filterPeek(filters)} toggleLabel="Budget at layo" startOpen={false}>
          <FilterGroups filters={filters} setFilters={setFilters} shown={shown} total={total} />
        </SidePanel>
      }
    >
      <Panel head="Mga lugar" aside={`${list.length} / ${cat.places.length}`}>
        <p className="mb-4 font-display text-xl font-black italic leading-tight">{cat.title}</p>
        {surprise && sel.pid === surprise && !custom && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-ink px-4 py-3 text-paper">
            <p className={`${LABEL} leading-relaxed tracking-[0.2em]`}>Pinili ng tadhana</p>
            <button type="button" onClick={onSurprise} className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-paper/60 px-4 text-[11px] font-bold uppercase tracking-[0.16em]">
              <Dice /> Isa pa
            </button>
          </div>
        )}
        {hidden > 0 && (
          <p className="mb-4 text-[11px] font-medium uppercase leading-relaxed tracking-wide text-mute">
            {hidden} lugar ang nakatago dahil sa filter.
            <button type="button" onClick={() => setFilters(NO_FILTER)} className="ml-2 font-bold text-red underline underline-offset-4">Ipakita lahat</button>
          </p>
        )}
        <div className="grid gap-3 lg:grid-cols-2" role="group" aria-label="Choose a place">
          {list.map((p, i) => (
            <TicketRow key={p.id} id={`pl-${p.id}`} mark={"ABCDEFGH"[i]} label="Place" active={!custom && sel.place === p.name} onClick={() => pick(p)} delay={0.05 * i}>
              <span className="block pr-6 font-display text-[1.25rem] font-black leading-tight">{p.name}</span>
              <span className={`${LABEL} mt-1.5 block text-mute`}>{p.area}</span>
              <span className="mt-3 block text-[12px] font-medium uppercase leading-relaxed tracking-wide text-ink/80">{p.highlights.join("  ·  ")}</span>
              <span className={`${LABEL} mt-3 flex flex-wrap gap-x-4 gap-y-1 text-red`}>
                <span>{TIERS[p.budget].sign} {TIERS[p.budget].label}</span>
                <span>{ZONES[p.zone]}</span>
              </span>
            </TicketRow>
          ))}
        </div>

        {!list.length && (
          <div className="rounded-lg border-[1.5px] border-dashed border-ink px-5 py-8 text-center">
            <p className="font-display text-xl font-black italic">Walang bagay sa mga toggle.</p>
            <button type="button" onClick={() => setFilters(NO_FILTER)} className={`${LABEL} mt-3 min-h-11 text-red underline underline-offset-4`}>Alisin ang filters</button>
          </div>
        )}

        <motion.div layout className={`mt-3 rounded-lg border-[1.5px] border-dashed p-5 ${custom ? "border-red bg-card" : "border-ink bg-transparent"}`}>
          <button type="button" onClick={openCustom} aria-expanded={custom} className="block w-full text-left">
            <span className={`${LABEL} block text-red`}>Option {"ABCDEFGH"[list.length]} {"·"} {chico ? "Chico's" : "Chica's"} pick</span>
            <span className="mt-1 block font-display text-[1.3rem] font-black leading-tight">I have another place in mind!</span>
          </button>
          <AnimatePresence initial={false}>
            {custom && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <label htmlFor="custom-place" className={`${LABEL} mb-1 mt-6 block text-mute`}>{chico ? "Where to?" : "Where to, Chica?"}</label>
                <input
                  id="custom-place" autoFocus maxLength={120} value={sel.place}
                  onChange={(e) => patch({ place: e.target.value, area: "", pid: "", customPlace: true })}
                  placeholder="A cafe, a beach, a secret spot"
                  className="w-full border-0 border-b-2 border-ink bg-transparent pb-2 pt-1 font-display text-2xl font-bold italic placeholder:font-normal placeholder:text-mute/50 focus:border-red focus:outline-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Panel>
    </Stage>
  );
}

/* ---------- step 3: day and time ---------- */
function Calendar({ value, onChange }) {
  const today = useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);
  const [view, setView] = useState(() => {
    const b = value ? parseISO(value) : today;
    return new Date(b.getFullYear(), b.getMonth(), 1);
  });
  // a quick-day chip can move the date to another month: follow it
  useEffect(() => {
    if (!value) return;
    const d = parseISO(value);
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);
  const minView = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxView = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const y = view.getFullYear();
  const m = view.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(view.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const shift = (n) => setView(new Date(y, m + n, 1));

  return (
    <div className="rounded-lg border-[1.5px] border-ink bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => shift(-1)} disabled={view <= minView} aria-label="Previous month" className="grid h-11 w-11 place-items-center disabled:opacity-20"><Arrow flip /></button>
        <p className="font-display text-xl font-black" aria-live="polite">{view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        <button onClick={() => shift(1)} disabled={view >= maxView} aria-label="Next month" className="grid h-11 w-11 place-items-center disabled:opacity-20"><Arrow /></button>
      </div>
      <div className={`${LABEL} grid grid-cols-7 border-b border-line pb-2 text-center text-mute`}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const iso = toISO(y, m, d);
          const past = new Date(y, m, d) < today;
          const on = value === iso;
          const isToday = new Date(y, m, d).getTime() === today.getTime();
          return (
            <button
              key={iso} disabled={past} onClick={() => onChange(iso)} aria-pressed={on} aria-label={prettyDate(iso)}
              className={`mx-auto grid h-11 w-11 place-items-center rounded-full text-[15px] font-bold transition-colors ${
                on ? "bg-red text-white" : past ? "text-ink/25" : "hover:bg-paper"
              } ${isToday && !on ? "underline decoration-red decoration-2 underline-offset-4" : ""}`}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

const monthDay = (iso) => parseISO(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const PERIODS = [["", "Lahat"], ["am", "Umaga"], ["noon", "Tanghali"], ["pm", "Hapon"], ["eve", "Gabi"]];
const minutes = (t) => {
  const m = /^(\d+):(\d\d) (AM|PM)$/.exec(t);
  return m ? ((+m[1] % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + +m[2] : 0;
};
const periodOf = (t) => { const x = minutes(t); return x < 720 ? "am" : x <= 840 ? "noon" : x < 1080 ? "pm" : "eve"; };

// Bukas, the coming Saturday and Sunday (a day is listed once)
function quickDays() {
  const t = parseISO(todayISO());
  const add = (n) => { const d = new Date(t); d.setDate(d.getDate() + n); return toISO(d.getFullYear(), d.getMonth(), d.getDate()); };
  const out = [];
  for (const [label, iso] of [["Bukas", add(1)], ["Sabado", add((6 - t.getDay() + 7) % 7)], ["Linggo", add((7 - t.getDay()) % 7)]]) {
    if (!out.some((x) => x[1] === iso)) out.push([label, iso]);
  }
  return out;
}

function WhenStep({ nav, sel, patch, role }) {
  const [period, setPeriod] = useState("");
  const days = useMemo(quickDays, []);
  const times = TIMES.filter((t) => !period || periodOf(t) === period);
  return (
    <Stage
      nav={nav}
      title={<Title eyebrow="Step three" sub={sel.place ? `Our date at ${sel.place}.` : "Choose a day that works for you."} photo={PHOTOS.b4} tilt={4} className="mb-2 lg:mb-6">Lock in the time</Title>}
      aside={
        <SidePanel nav={nav}>
          <Group label="Mabilis na pili">
            {days.map(([label, iso]) => (
              <Chip key={iso} dark on={sel.date === iso} onClick={() => patch({ date: iso })}>
                {label} <span className={sel.date === iso ? "text-white/80" : "text-paper/55"}>{monthDay(iso)}</span>
              </Chip>
            ))}
          </Group>
          <Group label="Oras ng araw">
            {PERIODS.map(([k, label]) => (
              <Chip key={k || "all"} dark on={period === k} onClick={() => setPeriod(k)}>{label}</Chip>
            ))}
          </Group>
        </SidePanel>
      }
    >
      <Panel head="Araw at oras" aside={sel.date ? `${shortDate(sel.date)}${sel.time ? ` · ${sel.time}` : ""}` : ""}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Calendar value={sel.date} onChange={(date) => patch({ date })} />
          <div>
            <p id="time-label" className={`${LABEL} mb-2 text-mute`}>{role === "chico" ? "What time?" : "What time, Chica?"}</p>
            <div role="group" aria-labelledby="time-label" className="grid grid-cols-3 gap-2">
              {times.map((t) => (
                <button
                  key={t} type="button" onClick={() => patch({ time: t })} aria-pressed={sel.time === t}
                  className={`min-h-11 rounded-lg border-[1.5px] px-1 text-[13px] font-bold transition-colors ${sel.time === t ? "border-red bg-red text-white" : "border-ink bg-card text-ink hover:border-red"}`}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>
        {sel.date && (
          <p className={`${LABEL} mt-6 rounded-lg bg-ink px-4 py-4 leading-relaxed tracking-[0.18em] text-paper`}>
            {prettyDate(sel.date)}{sel.time ? ` · ${sel.time}` : ""}
          </p>
        )}
      </Panel>
    </Stage>
  );
}

/* ---------- step 4: her say ---------- */
const IDEAS = ["Coffee after", "Photo booth", "Merienda muna", "Maglakad-lakad lang", "Walang phone muna"];
const NOTE_MAX = 300;
const hasIdea = (note, t) => note.toLowerCase().includes(t.toLowerCase());
const addIdea = (note, t) => {
  const n = note.trim();
  return n ? `${n}${/[.!?,]$/.test(n) ? "" : ","} ${t}` : t;
};
const dropIdea = (note, t) => {
  const i = note.toLowerCase().indexOf(t.toLowerCase());
  if (i < 0) return note;
  let a = i;
  let b = i + t.length;
  const lead = /,\s*$/.exec(note.slice(0, a));
  const trail = /^,\s*/.exec(note.slice(b));
  if (lead) a -= lead[0].length;
  else if (trail) b += trail[0].length;
  return (note.slice(0, a) + note.slice(b)).trim();
};

function NoteStep({ nav, sel, patch, role }) {
  const chico = role === "chico";
  const phrase = (t) => (chico ? t.toUpperCase() : t);
  return (
    <Stage
      nav={nav}
      title={<Title eyebrow="Step four" sub="Totally optional. Your idea always counts." photo={PHOTOS.b6} tilt={-4} className="mb-2 lg:mb-6">Your say</Title>}
      aside={
        <SidePanel nav={nav}>
          <Group label="Mga idea">
            {IDEAS.map((t) => {
              const p = phrase(t);
              const on = hasIdea(sel.note, p);
              return (
                <Chip key={t} dark on={on} disabled={!on && addIdea(sel.note, p).length > NOTE_MAX}
                  onClick={() => patch({ note: on ? dropIdea(sel.note, p) : addIdea(sel.note, p) })}>{t}</Chip>
              );
            })}
          </Group>
          <p className="mt-3 text-[10px] font-medium uppercase leading-relaxed tracking-wide text-paper/45">Pindutin para idagdag o alisin sa note.</p>
        </SidePanel>
      }
    >
      <Panel head="Ang say mo" aside={`${sel.note.length} / ${NOTE_MAX}`}>
        <div className="rounded-lg border-[1.5px] border-ink bg-card p-5">
          <label htmlFor="note" className="block font-display text-xl font-black italic leading-snug">
            {chico ? "Anything else you want to add, change, or do on this date?" : "Anything else you want to add, change, or do on this date, Chica?"}
          </label>
          <textarea
            id="note" rows={8} maxLength={NOTE_MAX} value={sel.note} onChange={(e) => patch({ note: e.target.value })}
            placeholder="Extra stops, foods to try, a different mood, a surprise"
            className="ruled mt-3 w-full resize-none border-0 bg-transparent p-0 text-lg font-medium placeholder:text-mute/50 focus:outline-none"
          />
        </div>
      </Panel>
    </Stage>
  );
}

/* ---------- confirmation ticket ---------- */
function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3 border-b border-line py-3.5 last:border-b-0">
      <dt className={`${LABEL} pt-1 text-red`}>{label}</dt>
      <dd className="min-w-0 break-words text-[17px] font-bold leading-snug">{children}</dd>
    </div>
  );
}

const CONFETTI_COLORS = ["#c8102e", "#ff4b63", "#f3f3f0", "#c8102e", "#fdfdfb"];
function Confetti() {
  const bits = useMemo(
    () => Array.from({ length: 44 }, (_, i) => {
      const r = (a, b) => a + Math.random() * (b - a);
      return { i, x: r(-170, 170), up: r(150, 330), fall: r(60, 260), rot: r(-540, 540), w: r(5, 9), h: r(9, 16), d: r(0, 0.12), t: r(1.5, 2.3), c: CONFETTI_COLORS[i % CONFETTI_COLORS.length] };
    }),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {bits.map((b) => (
        <motion.span
          key={b.i}
          className="absolute left-1/2 top-[62%] block"
          style={{ width: b.w, height: b.h, background: b.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: [0, -b.up, b.fall], opacity: [1, 1, 0], rotate: b.rot }}
          transition={{ duration: b.t, delay: b.d, ease: "easeOut", times: [0, 0.42, 1] }}
        />
      ))}
    </div>
  );
}

// Budget and what to bring, under the ticket.
function BeforeYouGo({ sel }) {
  const budget = budgetFor(sel);
  const items = checklistFor(sel);
  const [done, setDone] = useState({});
  return (
    <section className="mt-6 rounded-lg border-[1.5px] border-paper/40 p-5" aria-labelledby="bago">
      <p id="bago" className={`${LABEL} text-red-lt`}>Bago pumunta</p>
      {budget && (
        <p className="mt-3 text-[15px] font-bold leading-snug">
          Budget: <span className="text-red-lt">{budget.sign}</span> {"·"} {budget.range}
          <span className="mt-1 block text-[11px] font-medium uppercase leading-relaxed tracking-wide text-paper/60">{BUDGET_NOTE}</span>
        </p>
      )}
      <p className={`${LABEL} mt-5 text-paper/60`}>Dalhin</p>
      <ul className="mt-2 grid gap-1">
        {items.map((t) => (
          <li key={t}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-medium">
              <input
                type="checkbox" checked={!!done[t]} onChange={() => setDone((d) => ({ ...d, [t]: !d[t] }))}
                className="h-5 w-5 shrink-0 appearance-none rounded border-[1.5px] border-paper/70 bg-transparent checked:border-red checked:bg-red"
              />
              <span className={done[t] ? "text-paper/50 line-through" : ""}>{t}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-medium uppercase leading-relaxed tracking-wide text-paper/60">{CHECK_NOTE}</p>
    </section>
  );
}

function Confirm({ role, sel, replacing, readOnly, onRestart, onEdit }) {
  const chico = role === "chico";
  const [status, setStatus] = useState("idle");
  const [boom, setBoom] = useState(false);
  useEffect(() => {
    if (status !== "sent") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setBoom(true);
    const t = setTimeout(() => setBoom(false), 2800);
    return () => clearTimeout(t);
  }, [status]);
  const [copied, setCopied] = useState("");
  const planId = useMemo(() => planKey(), []);
  // the same day at the same place keeps the old plan's id, so changing only the time or the extras edits that plan
  const keepId = replacing && slot(replacing) === slot(entryFrom(planId, sel, false, role)) ? replacing.id : planId;
  const closed = useRef("");
  // keep the chosen day on her device and on the server so the Library calendar can put a heart on it
  useEffect(() => {
    if (readOnly) return;
    saveDate(keepId, sel, status === "sent");
    // the plan moved to another day or place: the old one is closed, once
    if (replacing && keepId !== replacing.id && closed.current !== replacing.id) { closed.current = replacing.id; cancelDate(replacing); }
  }, [readOnly, keepId, replacing, sel.date, sel.time, sel.place, sel.area, sel.catTitle, sel.pid, sel.note, status]);
  const custom = isCustomPlan(sel);
  const text = planText(sel, role);
  const link = chico ? OPEN_LINK() : `${location.origin}${location.pathname}#p=${enc(sel)}`;

  const send = async () => {
    setStatus("sending");
    const kind = replacing ? "change" : "new";
    const entry = { vibe: sel.catTitle, place: sel.place, area: sel.area, date: sel.date, time: sel.time, note: sel.note, pid: sel.pid };
    const j = await sendAlert(kind, role, entry, replacing ? { from: { place: replacing.place, area: replacing.area, date: replacing.date, time: replacing.time } } : {});
    setStatus(j && j.ok === true ? "sent" : "fail");
  };
  const calUrl = googleCalendarUrl(sel);
  const saveIcs = () => {
    const url = URL.createObjectURL(new Blob([icsFile(sel)], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "Chico-and-Chica-date.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const share = async () => { try { await navigator.share({ title: "Chico + Chica date", text, url: link }); } catch { /* closed the sheet */ } };
  const copy = async (what, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(what); setTimeout(() => setCopied(""), 1800); }
    catch { setCopied("manual"); }
  };
  const pill = "inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-paper/60 px-3 text-center text-[11px] font-bold uppercase tracking-[0.16em]";

  return (
    <div className="min-h-dvh bg-ink text-paper">
      {boom && <Confetti />}
      <div className="mx-auto max-w-xl px-6 pb-14 pt-6 lg:max-w-6xl">
        <button onClick={onEdit} className={`${LABEL} -ml-1 inline-flex min-h-11 items-center gap-2 pr-3`}><Arrow flip /> Change something</button>
        <p className={`${LABEL} mt-6 text-red-lt`}>{chico ? "Plano ni Chico" : replacing ? "Binago na natin, asawa ko" : "Pasok na, asawa ko"}</p>
        <h2 className="mt-2 font-display text-[2.6rem] font-black italic leading-[1.02]">{chico ? "Here's our plan." : "Here's our plan, Chica."}</h2>

        <div className="lg:mt-8 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
        <motion.article
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mt-8 rounded-lg bg-card text-ink lg:mt-0" aria-label="Date itinerary ticket"
        >
          <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-ink px-5 pb-4 pt-5">
            <div>
              <p className={`${LABEL} text-mute`}>Date ticket · admit two</p>
              <p className="mt-1 font-display text-[2rem] font-black italic leading-none">Chico + Chica</p>
              {custom && (
                <span className={`${LABEL} mt-3 inline-block -rotate-2 border-2 border-red px-2.5 py-1.5 text-red`}>{chico ? "Chico's custom plan" : "Chica's custom plan"}</span>
              )}
            </div>
            <Heart className="mt-1 h-6 w-6 shrink-0 text-red" />
          </div>
          <div className="grid grid-cols-3 gap-[3px] border-b-[1.5px] border-ink bg-ink" aria-hidden="true">
            {[PHOTOS.b2, PHOTOS.b3, PHOTOS.b6].map((src, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden bg-line">
                <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover grayscale" />
              </div>
            ))}
          </div>
          <dl className="px-5 pb-2 pt-1">
            <Row label="Vibe">{sel.catTitle}</Row>
            <Row label={sel.customPlace ? (chico ? "Chico's pick" : "Chica's pick") : "Place"}>
              {sel.place}
              {sel.area && <span className="mt-0.5 block text-[13px] font-medium uppercase tracking-wide text-mute">{sel.area}</span>}
            </Row>
            <Row label="Day">{prettyDate(sel.date)}</Row>
            <Row label="Time">{sel.time}</Row>
            {sel.note.trim() && <Row label={chico ? "Extras" : "Her extras"}><span className="whitespace-pre-wrap font-medium">{sel.note.trim()}</span></Row>}
          </dl>
          <div className="notch mt-2 flex items-center justify-between gap-4 border-t-2 border-dashed border-ink/70 px-5 py-4">
            <span className="bars h-6 w-24 shrink-0" aria-hidden="true" />
            <span className={`${LABEL} text-right text-mute`}>No. 1116 · 0333<br />With love, Chico</span>
          </div>
        </motion.article>

        <BeforeYouGo sel={sel} />
        </div>

        <div className="mt-8 grid gap-3 lg:sticky lg:top-6 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:rounded-xl lg:border-[1.5px] lg:border-paper/30 lg:p-5">
          <button
            onClick={send} disabled={status === "sending" || status === "sent"}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-red px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-white disabled:opacity-90"
          >
            {status === "sent" ? <><Tick /> {chico ? "Sent to Chica" : "Sent to Chico"}</> : status === "sending" ? "Sending..." : <>{chico ? "Send to Chica" : replacing ? "Send the change to Chico" : "Send to Chico"} <Arrow /></>}
          </button>
          <p role="status" className="min-h-6 text-center text-[12px] font-medium uppercase leading-relaxed tracking-wide text-paper/80">
            {status === "sent" && (chico ? "Nakarating na kay Chica ang plano mo." : "Nakarating na kay Chico ang plano mo.")}
            {status === "fail" && (chico ? "Hindi pa awtomatikong umabot kay Chica. Gamitin ang WhatsApp o Share sa baba." : "Hindi pa umabot kay Chico. Gamitin ang WhatsApp o Share sa baba.")}
            {copied === "manual" && "Di ma-copy dito. Pindutin nang matagal ang text para kopyahin."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a href={mapsUrl(sel)} target="_blank" rel="noopener" className={pill}>Mapa</a>
            <a href={directionsUrl(sel)} target="_blank" rel="noopener" className={pill}>Paano pumunta</a>
          </div>
          <div className="mt-2 border-t border-paper/20 pt-5">
            <p className={`${LABEL} text-red-lt`}>{chico ? "Save the date" : "Save the date, Chica"}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a href={calUrl} target="_blank" rel="noopener" className={pill}>Google Calendar</a>
              <button onClick={saveIcs} className={pill}>Apple / Outlook</button>
            </div>
            <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wide text-paper/60">May paalala 1 araw at 2 oras bago ang date</p>
          </div>
          <div className={`mt-2 grid gap-3 ${canShare ? "grid-cols-2" : ""}`}>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-paper/50 px-3 text-[11px] font-bold uppercase tracking-[0.1em]"
            >{canShare ? "WhatsApp" : "Send on WhatsApp"}</a>
            {canShare && <button onClick={share} className="min-h-12 rounded-full border-[1.5px] border-paper/50 px-3 text-[11px] font-bold uppercase tracking-[0.1em]">Messenger &amp; more</button>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => copy("plan", text)} className="min-h-12 rounded-full border border-paper/25 px-4 text-[11px] font-bold uppercase tracking-[0.2em]">{copied === "plan" ? "Copied" : "Copy plan"}</button>
            <button onClick={() => copy("link", link)} className="min-h-12 rounded-full border border-paper/25 px-4 text-[11px] font-bold uppercase tracking-[0.2em]">{copied === "link" ? "Copied" : "Copy link"}</button>
          </div>
          <button onClick={onRestart} className={`${LABEL} mt-2 min-h-11 text-red-lt underline underline-offset-4`}>Plan a different date</button>
        </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- our dates: see them, change them, cancel them, answer Chico ---------- */
function statusLine(e, role) {
  const s = statusOf(e);
  if (s === "proposed") return role === "chica" ? "Plano ni Chico · sagutin mo" : "Hinihintay ang sagot ni Chica";
  if (byOf(e) === "chico") return "Oo na si Chica";
  return e.sent ? "Naipadala na kay Chico" : "Nakatakda";
}
const byOf = (e) => (e && e.by === "chico" ? "chico" : "chica");

// Map and calendar for a saved date, built the same way as on the ticket
function SaveRow({ e }) {
  const plan = { date: e.date, time: e.time, place: e.place, area: e.area, pid: e.pid, note: e.note, catTitle: e.vibe };
  const cal = googleCalendarUrl(plan);
  const save = () => {
    const ics = icsFile(plan);
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "Chico-and-Chica-date.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  const link = "inline-flex min-h-10 items-center text-[11px] font-bold uppercase tracking-[0.12em] underline decoration-red decoration-2 underline-offset-4";
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0">
      <a href={mapsUrl(plan)} target="_blank" rel="noopener" className={link}>Mapa</a>
      {cal && <a href={cal} target="_blank" rel="noopener" className={link}>Google Calendar</a>}
      {cal && <button onClick={save} className={link}>Apple / Outlook</button>}
    </div>
  );
}

function DateCard({ e, role, busy, asked, onAsk, onAccept, onChange, onCancel, past }) {
  const waiting = statusOf(e) === "proposed" && role === "chica";
  const cd = past ? "" : countdown(e.date);
  const btn = "inline-flex min-h-11 items-center justify-center rounded-full border-[1.5px] px-4 text-[11px] font-bold uppercase tracking-[0.14em] disabled:opacity-40";
  return (
    <li className={`rounded-lg border-[1.5px] bg-card text-ink ${waiting ? "border-red" : "border-ink"}`}>
      <div className="px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <p className={`${LABEL} min-w-0 pt-1 ${waiting ? "text-red" : "text-mute"}`}>{past ? "Nakaraan" : statusLine(e, role)}</p>
          {cd && <span className={`${LABEL} shrink-0 rounded-full bg-ink px-3 py-1.5 text-center leading-tight tracking-[0.16em] text-paper`}>{cd}</span>}
        </div>
        <p className="mt-2 font-display text-[1.5rem] font-black leading-tight">{dayLabel(e.date)}</p>
        <p className="mt-0.5 text-[15px] font-bold">{e.time}</p>
      </div>
      <div className="px-5 pb-4 pt-3">
        <p className="break-words text-[17px] font-bold leading-snug">{e.place}</p>
        {e.area && <p className={`${LABEL} mt-0.5 text-mute`}>{e.area}</p>}
        {e.note && <p className="mt-2 whitespace-pre-wrap text-[13px] font-medium text-ink/80">{e.note}</p>}
        {!past && <SaveRow e={e} />}
        {!past && (
          <div className="mt-4">
            {asked ? (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sigurado ka ba?">
                <span className={`${LABEL} mr-1`}>Sigurado ka ba?</span>
                <button disabled={busy} onClick={onCancel} className={`${btn} border-red bg-red text-white`}>{waiting ? "Oo, hindi pwede" : "Oo, i-cancel"}</button>
                <button onClick={() => onAsk("")} className={`${btn} border-ink`}>Huwag</button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {waiting && <button disabled={busy} onClick={onAccept} className={`${btn} border-red bg-red text-white`}>Game na!</button>}
                <button disabled={busy} onClick={onChange} className={`${btn} border-ink`}>Palitan</button>
                <button disabled={busy} onClick={() => onAsk(e.id)} className={`${btn} border-ink`}>{waiting ? "Hindi pwede" : "I-cancel"}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function MyDates({ role, onBack, onNew, onEdit }) {
  const [state, setState] = useState({ loading: true, all: [] });
  const [busy, setBusy] = useState("");
  const [asked, setAsked] = useState("");
  const [msg, setMsg] = useState("");
  const refresh = useCallback(async () => { const r = await loadDates(); setState({ loading: false, all: r.all }); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const today = todayISO();
  const live = state.all.filter((x) => !isCancelled(x));
  const upcoming = live.filter((x) => x.date >= today).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const past = live.filter((x) => x.date < today).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  const run = async (e, job, done) => {
    setBusy(e.id); setAsked("");
    try { await job(); setMsg(done); } finally { await refresh(); setBusy(""); }
  };
  const accept = (e) => run(e, async () => { const ok = acceptDate(e); await sendAlert("accept", "chica", ok); }, "Sige, kita tayo! Nakatakda na.");
  const cancel = (e) => run(e, async () => {
    const proposal = statusOf(e) === "proposed" && role === "chica";
    cancelDate(e);
    await sendAlert(proposal ? "decline" : "cancel", role, e);
  }, "Na-cancel na. Pumili tayo ng bago, kailan mo gusto?");

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto w-full max-w-xl px-6 pb-16 pt-4">
        <header className="mb-8 flex items-center justify-between">
          <button onClick={onBack} className={`${LABEL} -ml-1 inline-flex min-h-11 items-center gap-2 pr-3`}><Arrow flip /> Back</button>
          <p className={`${LABEL} text-mute`}>{role === "chico" ? "Plano ni Chico" : "Para kay Chica"}</p>
        </header>
        <Title eyebrow="Mga date natin" sub={upcoming.length ? "Palitan o i-cancel kung kailangan." : ""}>Our dates</Title>

        <p role="status" className="min-h-5 text-[12px] font-bold uppercase leading-relaxed tracking-wide text-red">{msg}</p>

        {state.loading && <p className={`${LABEL} mt-4 text-mute`}>Sandali lang...</p>}
        {!state.loading && !upcoming.length && (
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-mute">Wala pang nakatakdang date. Pumili na tayo ng araw.</p>
        )}
        <ul className="mt-4 grid gap-4">
          {upcoming.map((e) => (
            <DateCard
              key={e.id} e={e} role={role} busy={busy === e.id} asked={asked === e.id} onAsk={setAsked}
              onAccept={() => accept(e)} onChange={() => onEdit(e)} onCancel={() => cancel(e)}
            />
          ))}
        </ul>

        <button
          onClick={onNew}
          className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-red px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-white"
        >Mag-plan ng bago <Arrow /></button>

        {past.length > 0 && (
          <>
            <p className={`${LABEL} mt-10 text-mute`}>Mga nakaraan</p>
            <ul className="mt-3 grid gap-3">
              {past.map((e) => <DateCard key={e.id} e={e} role={role} past />)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}


/* ---------- app ---------- */
// steps: 0 welcome, 1 vibe, 2 place, 3 day and time, 4 her say, 5 the ticket, 6 our dates
export default function App() {
  const role = useMemo(() => getRole(), []);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [sel, setSel] = useState(EMPTY);
  const [replacing, setReplacing] = useState(null);
  const [fromLink, setFromLink] = useState(false);
  const [filters, setFilters] = useState(NO_FILTER);
  const [surprise, setSurprise] = useState("");
  const [dates, setDates] = useState([]);
  const patch = (o) => setSel((s) => ({ ...s, ...o }));
  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); window.scrollTo(0, 0); };

  useEffect(() => {
    const m = /^#p=(.+)$/.exec(location.hash);
    if (m) {
      const p = dec(m[1]);
      if (p) { setSel(p); setFromLink(true); setStep(5); return; }
    }
    if (new URLSearchParams(location.search).get("open") === "dates") setStep(6);
  }, []);

  // what is already planned, for the welcome screen
  useEffect(() => {
    let live = true;
    loadDates().then((r) => { if (live) setDates(r.all.filter((x) => !isCancelled(x) && x.date >= todayISO()).sort((a, b) => (a.date < b.date ? -1 : 1))); });
    return () => { live = false; };
  }, [step]);

  const canNext =
    (step === 2 && sel.place.trim().length >= 2) ||
    (step === 3 && !!sel.date && !!sel.time) ||
    step === 4;

  const hint =
    step === 2 && !canNext ? "Pick a place to continue" :
    step === 3 && !canNext ? (!sel.date ? "Pick a day to continue" : "Pick a time to continue") : "";

  const pickCategory = (c) => {
    if (sel.catId !== c.id) patch({ catId: c.id, catTitle: c.title, place: "", area: "", pid: "", customPlace: false });
    setSurprise("");
    go(2);
  };

  const surpriseMe = () => {
    const ok = matchesBZ(filters);
    const pool = ALL_PLACES.filter(ok).filter((p) => p.id !== surprise);
    const list = pool.length ? pool : ALL_PLACES.filter(ok);
    if (!list.length) return;
    const p = list[Math.floor(Math.random() * list.length)];
    setSurprise(p.id);
    setSel((s) => ({ ...s, catId: p.catId, catTitle: p.catTitle, place: p.name, area: p.area, pid: p.id, customPlace: false }));
    if (step !== 2) go(2);
  };

  const fresh = () => {
    forgetPlanKey(); history.replaceState(null, "", location.pathname);
    setSel(EMPTY); setReplacing(null); setFromLink(false); setSurprise(""); setFilters(NO_FILTER);
  };

  // change a saved date: start from what it was, at the day and time
  const startEdit = (e) => {
    const f = findPlace(e);
    const cat = f ? f.cat : CATEGORIES.find((c) => c.title === e.vibe);
    forgetPlanKey();
    setSel({
      catId: cat ? cat.id : "", catTitle: cat ? cat.title : e.vibe || "", place: e.place, area: e.area || "", pid: f ? f.place.id : "",
      customPlace: !f, date: e.date, time: e.time, note: e.note || ""
    });
    setReplacing(e); setFromLink(false); setSurprise(""); setFilters(NO_FILTER);
    go(cat ? 3 : 1);
  };

  const waiting = role === "chica" && dates.some((x) => statusOf(x) === "proposed" && byOf(x) === "chico");
  const nav = { step, sel, canNext, hint, noNext: step === 1, nextLabel: step === 4 ? "See our plan" : "Continue", back: () => go(step - 1), next: () => go(step + 1), jump: go };

  let body;
  if (step === 0) body = <Welcome role={role} onStart={() => { fresh(); go(1); }} mine={dates.length} waiting={waiting} next={dates[0]} onDates={() => go(6)} />;
  else if (step === 6) body = <MyDates role={role} onBack={() => go(0)} onNew={() => { fresh(); go(1); }} onEdit={startEdit} />;
  else if (step === 5) body = <Confirm role={role} sel={sel} replacing={replacing} readOnly={fromLink} onEdit={() => { setFromLink(false); go(4); }} onRestart={() => { fresh(); go(1); }} />;
  else if (step === 1) body = <CategoryStep nav={nav} sel={sel} onPick={pickCategory} filters={filters} setFilters={setFilters} onSurprise={surpriseMe} />;
  else if (step === 2) body = <PlaceStep nav={nav} sel={sel} patch={patch} role={role} filters={filters} setFilters={setFilters} surprise={surprise} onSurprise={surpriseMe} />;
  else if (step === 3) body = <WhenStep nav={nav} sel={sel} patch={patch} role={role} />;
  else body = <NoteStep nav={nav} sel={sel} patch={patch} role={role} />;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.24, ease: "easeOut" }}>
          {body}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
