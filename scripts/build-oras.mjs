// Turns the timed-messages export into menu/oras/messages.json, which the Mga Oras Natin page reads.
//   node scripts/build-oras.mjs path/to/timed-messages.json
// The export itself is not kept in this repo (the repo is public). Messages in HOLD, drafts and anything that
// names other people (mentionsOthers) are left out until Chico says to include them.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/build-oras.mjs timed-messages.json'); process.exit(1); }

// Held back on purpose: apologies and lines about her being hurt, stressed or unwell.
// Add an id here to keep a message off the page; take it out to include it.
const HOLD = new Set([
  '2026-09-28-0333-pm', // "I'M SORRY DIN"
  '2026-10-04-1111-pm', // hopes her pain and stress go away
  '2026-10-07-0444-pm', // "I'M SORRY SA LAHAT"
  '2026-10-13-1111-pm', // apology for being annoyed
  '2026-11-14-0444-pm', // says her head hurts
]);
const INCLUDE_OTHERS = process.argv.includes('--include-others');

const all = JSON.parse(readFileSync(src, 'utf8'));
const keep = all.filter((m) => !m.draft && !HOLD.has(m.id) && (INCLUDE_OTHERS || !m.mentionsOthers));
keep.sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1));

// short keys: this file is the biggest thing the page downloads
const out = keep.map((m) => {
  const o = { i: m.id, t: m.time, p: m.period, d: m.date, s: m.sentAt, k: m.kind === 'crafted' ? 1 : 0, x: m.text.replace(/\s+$/, '') };
  if (m.attachments && m.attachments.length) o.a = m.attachments;
  return o;
});

mkdirSync('menu/oras', { recursive: true });
writeFileSync('menu/oras/messages.json', JSON.stringify(out));
console.log(`oras: ${out.length} of ${all.length} messages written (${all.length - out.length} held back)`);
