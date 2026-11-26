## OneElevenPage — Defect Review

1. **Remove `className="lib-h1"` from cover h1.** Shared `.lib-h1` bleeds `text-wrap: balance`, `line-height: .9`, and `margin-top: 10px`. Page selector wins on most properties via higher specificity (0,2,1 vs 0,1,0), but `text-wrap` and any future lib-h1 additions leak through. Fragile coupling — use only the page-scoped selector.

2. **Off-palette pin gradient.** `.oe-print::before` uses hardcoded `#c0392b`, `#922b21`, `#6e2018` — none match `--red: #c8102e`. Swap to `var(--red)`-based stops.

3. **320px `.oe-topbar` overflow.** Three flex children, no truncation. Middle span ("PARA SA CHICAAA KO") needs `min-width:0; overflow:hidden; text-overflow:ellipsis` or hide below ~360px.

4. **320px `.oe-navigation` word-break.** `flex-wrap:nowrap` + `overflow-wrap:anywhere` on primary button will split "SULAT" mid-syllable. Shorten label or allow wrap.

5. **`!important` on `.oe-primary`/`.oe-secondary` font-size/weight.** Specificity fight symptom — the `button{font:inherit}` reset already handles this. Remove `!important`.

6. **Lightbox missing backdrop-click-to-close.** Add `onClick={e => e.target === dialog.current && dialog.current.close()}` on `<dialog>`.

No blocking findings preventing deploy.
