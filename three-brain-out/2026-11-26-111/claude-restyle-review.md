## Blocking Defect

**`.oe-cover-clock` overflows at 320px.** At 320px the page padding is 20px/side → 280px content width. The mobile restyle sets `font-size: 4.7rem` (≈150px for "1:11") + `gap: 24px` + `span` at `max-width: 120px` = ~294px minimum. This guarantees horizontal scroll on small phones.

**Fix:** Drop the mobile clock font-size (e.g., `clamp(3rem, 12vw, 4.7rem)`) or stack the flex children vertically below ~380px with an additional breakpoint or `flex-wrap: wrap`.

---

No React regressions found — key logic, state resets, refs, dialog API, `aria-current` pattern, and conditional rendering are all correct. `lang="tl"` on `<main>` is valid for Tagalog content. `text-transform: uppercase` inheritance is intentional per the restyle. Letter length increase and visual restyle are structurally sound. The filmstrip's `overflow-x: auto` is intentional horizontal scroll, not a defect.
