## Code Review — OneElevenPage

### Bugs

1. **Null-safe inconsistency on dialog ref.**
   `dialog.current.close()` (close button) will throw if `ref` is null. The open call already uses `?.` — the close must match:
   ```js
   onClick={() => dialog.current?.close()}
   ```

2. **Focus not managed on memory navigation.**
   The focus `useEffect` depends on `[opened, letterOpen]` but **not** `active`. When the user taps "Isa pang alaala", React unmounts the old `.oe-memory` (keyed by `memory.id`) and mounts a new one with a fresh `<h2 ref={heading}>`, but nothing calls `.focus()`. Screen reader users land nowhere after navigating. Fix: add `active` to the dependency array.

3. **`aria-current` value should be `"step"` or `"true"`, not bare string `'true'`.**
   Current code works because the CSS selector is `[aria-current]` (presence), but semantically `aria-current="true"` is valid. This is fine — just noting the selector would also match `aria-current="false"` if that ever appears.

### Accessibility

4. **No `lang` attribute.** All visible copy is Tagalog. Without `lang="fil"` on `<main>` (or `<html>`), screen readers will pronounce every word with English phonetics. Add:
   ```jsx
   <main className="one-eleven" lang="fil">
   ```

5. **Lightbox image has no dimensions or `loading` attribute.** The `<img>` inside `<dialog>` will cause a layout shift when it loads. Consider adding `loading="lazy"` or at least explicit width/height hints.

### Mobile Layout

6. **Last-card CTA text overflow risk.** On `≤ 320px` screens, `.oe-navigation` is `flex-wrap: nowrap` and the primary button text "May sulat pa 'ko sa 'yo" (~25 chars) can overflow or force text to a single cramped line. Either allow wrapping on that final card or shorten the label at small widths.

7. **Filmstrip has no scroll-snap.** On mobile the strip scrolls freely; `scroll-snap-type: x mandatory` on the container + `scroll-snap-align: center` on buttons would prevent half-visible thumbnails.

### Minor / Defensive

- `photoById[id]` will throw if any `id` in the hardcoded array doesn't exist in `story.json`. A guard or build-time check would prevent a white-screen crash.
- The grain SVG in `background-image` is a data URI rendered on every paint — on low-end phones this filter-based texture can cause jank during scroll. Consider a static PNG tile.

### No Blocking Findings on:
- Route `/one-minute-eleven-memories` (component is a default export, routing is external)
- `prefers-reduced-motion` handling — correctly disables all animation/transition
- Image `src` paths (accepted per brief that all referenced images exist)

**Top priority:** items 1, 2, and 4 — real runtime error, broken a11y flow, and mispronounced content.
