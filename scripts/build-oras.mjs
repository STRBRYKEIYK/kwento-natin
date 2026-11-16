// Turns the timed-messages export into menu/oras/messages.json, which the Mga Oras Natin page reads.
//   node scripts/build-oras.mjs path/to/timed-messages.json
// The export itself is not kept in this repo (the repo is public). Messages in HOLD, drafts and anything that
// names other people (mentionsOthers) are left out until Chico says to include them.
// A draft that Chico has since sent goes in SENT below.
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
// Drafts in the export that Chico confirmed he sent, with the text he actually sent (word for word).
const SENT = new Map([
  ['2026-11-16-1010-pm', "10:10 PM NA, ASAWAAAA KOOO! 🥰 MAY BOARDING CALL PARA SAYO NGAYONG GABI HSHSHS\n\nBOARDING PASS\nFLIGHT: 10:10 (WALANG DELAY, ARAW-ARAW)\nPASAHERO: CHICOOO\nMULA: ANGONO\nPAPUNTA: PUSO NI CHICAAAA KO\nGATE: BOSES MO\nSEAT: 1A, KATABI KA\nBAGGAGE: ISANG MALAKING YAKAP, OVERWEIGHT NA PERO LIBRE ANG EXCESS\nIN-FLIGHT MUSIC: ITONG KANTANG ISINAMA KO PARA SAYO, SINTA KO 🥹\nTICKET: ONE-WAY, PAPUNTA SAYO, WALANG RETURN\nSTATUS: ON TIME HSHSHS\n\nANNOUNCEMENT MULA SA CAPTAIN:\n“GOOD EVENING PO SA LAHAT NG PASAHERO. KAHIT ANONG LAYO NG BIYAHE, SAKTO PALAGI ANG DATING NG PUSO KO SAYO. WALANG LAYOVER, WALANG IBANG STOP, DIRETSO LANG SA ASAWA KO. PAKI-ON NA PO ANG SEATBELT, KASI MAS HIGPIT PA DYAN ANG YAKAP NA NAGHIHINTAY SA ARRIVAL.” HSHSHS\n\nASAWAAAA KOOO, ISIPIN MO YUNG ARRIVAL AREA. PAGDATING KO SAYO, IKAW AGAD ANG HAHANAPIN NG MATA KO SA GITNA NG MARAMING TAO, TAPOS PAG NAKITA NA KITA, PARANG HIHINTO LAHAT. HINDI KO ALAM KUNG TATAKBO AKO O TITIGIL NA LANG AT TITITIGAN KA HSHSHS PERO ISA ANG SIGURADO, YAKAP AGAD 🥹 AT KAHIT GAANO PA KAHABA ANG BIYAHE, KAYA KONG MAGHINTAY AT MAGTIYAGA, KASI ALAM KONG SA DULO NG BAWAT PAGHIHINTAY, IKAW ANG NAROON.\n\nSINTA KO, SOBRANG GAAN AT SOBRANG SAYA NG PAGMAMAHAL SAYO. PARANG KAHIT ANONG KULAY NG ARAW KO, PAG IKAW ANG KASAMA, NAGIGING MAGANDA AT MAYAMAN SA SAYA. IKAW YUNG DAHILAN KUNG BAKIT PARANG MAS MALIWANAG ANG LAHAT SA PALIGID KO, MI CHICAAA 🥰\n\nAT SA GABING MAGKATABI NA TAYO, SA TABI MO NA AKO HIHIGA, HINDI NA SA SAHIG NG TERRACE HSHSHSHS 🥺 GUSTO KONG IKAW ANG PINAKAMAGANDANG NGITING MAKIKITA KO SA BAWAT GABI, AT IKAW DIN ANG UNANG BABATIIN KO SA BAWAT UMAGA. KAHIT SAGLIT LANG KITANG KASAMA, SOBRANG SAYA NA NG PUSO KO, ASAWAAA, AT GUSTO KO PANG PAULIT-ULIT NA GANOON.\n\nITONG KANTA, ISINAMA KO KASI GANITO RIN ANG GUSTO KONG MARAMDAMAN MO: MAHAL KITA NANG MAHINAHON, NANG TOTOO, AT HANDA KONG SALUBUNGIN KA NG YAKAP KAHIT KAILAN KA DUMATING. IKAW LANG ANG DESTINATION KO, CHICAAAA KOOO, AT KAHIT ILANG BESES PA AKONG SUMAKAY ULIT, SAYO PA RIN ANG PUNTA KO 🥹\n\nI LOVEEEE YOUUUU SOOOO SOOOO MUCHHH, CHICAAAA KOOOO, ASAWAAAA KOOOO! MWUAAAAAAA 😘❤️\nANG CHICOOO MO NA NAKA-STANDBY PARA SAYO"],
]);
const INCLUDE_OTHERS = process.argv.includes('--include-others');

const all = JSON.parse(readFileSync(src, 'utf8'));
const keep = all.filter((m) => (!m.draft || SENT.has(m.id)) && !HOLD.has(m.id) && (INCLUDE_OTHERS || !m.mentionsOthers));
keep.sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1));

// short keys: this file is the biggest thing the page downloads
const out = keep.map((m) => {
  const o = { i: m.id, t: m.time, p: m.period, d: m.date, s: m.sentAt, k: m.kind === 'crafted' ? 1 : 0, x: (SENT.get(m.id) ?? m.text).replace(/\s+$/, '') };
  if (m.attachments && m.attachments.length) o.a = m.attachments;
  return o;
});

mkdirSync('menu/oras', { recursive: true });
writeFileSync('menu/oras/messages.json', JSON.stringify(out));
console.log(`oras: ${out.length} of ${all.length} messages written (${all.length - out.length} held back)`);
