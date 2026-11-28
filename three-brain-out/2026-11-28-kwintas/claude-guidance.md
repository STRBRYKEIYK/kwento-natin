Here's your read-only grounding and integration guidance for `/kwintas` (under 500 words).

## Story grounding (what is true — treat as source data)

- **Core gift:** A custom necklace *pair* from Perfect Presents (ordered Aug 27, 2026). **KEITH = hexagonal frame; JERSEY = oval frame.** Gold *color* only — never claim solid gold or purity.
- **Who wears which:** The **hexagon (KEITH)** is worn by **Chica/Jersey**; the **oval (JERSEY)** is worn by **Chico/Keith**. Each carries the *other's* name near the heart. Get this crossing exactly right in alt text and captions.
- **Symbolism** (personal, from the order copy — not etymology fact): Jersey = island home, resilience, deep roots; Keith = wood/forest, quiet strength, growth.
- **Timeline beats you may tell softly:** designs approved Aug 28 (praised fluid inner curves + distinct-but-paired frames); shipping email Sept 5; brief tracking confusion resolved as warehouse pickup; Sept 6 1:48PM Chico's "DUMATING NAAAA YUNG MONOGRAMMM"; given during the **late monthsary on Sept 11** (alongside crochet flowers + Chicabara from Chica); Nov 4 Chica notes "LAGI MO PA SUOT YING NECKLACE" (ongoing everyday meaning).
- **Hard don'ts:** Sept 11 is the *late monthsary*, **not** "delivery day." No invented wedding dates, proposals, arrival dates, hidden/merged letters, or secret initials. No clock/lock gating.

## Sensitive-data boundaries

- **Never** surface the email screenshots (home address, payment, phone), tracking numbers, logistics detail, money amounts, or the raw ZIP/chat.
- The lead portrait (`necklace-portrait.jpg`) is a **visualization** — label it subtly as portrait/visualization. The **Sept 11 box photos are actual documentary photos**; those three may be presented as real.

## Integration guidance (how the pieces connect)

- **Gallery ≠ model fallback.** The four images (`necklaces-together.jpg`, `keith-hexagon.jpg`, `jersey-oval.jpg`, `necklace-portrait.jpg`) are a **permanent showcase**, always rendered regardless of model load/error/success. The `necklaceStage` (Codex's injected `<KwintasModel/>`) lives in a **separate** `.kw-model-stage` and must never cover or replace the gallery. Page must be fully usable with no WebGL.
- **Media paths:** route every gallery `src` through `mediaUrl` from `../media.js` (respects Vite dev public prefix). Verify the actual signature/prefix behavior in that file before wiring.
- **Ownership lane:** you touch only `KwintasPage.jsx`, `KwintasPage.css`, `kwintas.svg`. Codex owns `KwintasModel.jsx`, routing, `media-catalog.json`, library metadata, assets, tests, build. Don't change shared files or revert others.
- **Library placement:** last entry under **SULAT** (not ORAS-ORAS); back-nav likely `/?book=sulat` — confirm against the real library convention before hardcoding.
- **A11y/art direction:** scoped `.kw-page` CSS, reduced-motion, visible focus, correct `aria-expanded`/`aria-controls` on letter reveal with sensible scroll/focus; hero eager, rest lazy. Warm ivory/linen + antique gold + dark ink, intimate editorial archive. Local fonts only.
- **Voice:** Taglish letter to **CHICAAAA/ASAWAAAA KOOOO** from **CHICOOO**; display copy in CAPS but readable; close on "name near the heart, in ordinary days and at 11:11." Title: **11:11 · KWINTAS NATIN — PARA SA CHICAAAA KO.**

I've kept this to read-only guidance and made no edits.
