Review complete. Findings below, separating confirmed bugs from hypotheses that depend on files outside the six I was given.

## Confirmed correct (not bugs)
- **Retry / stale-event handling** — `key={attempt}` remounts a fresh `<model-viewer>`; the old effect's cleanup sets `cancelled = true` and removes its listeners, so firing `load` on the stale element is correctly ignored. Matches the test at `KwintasModel.test.jsx:25-39`. Solid.
- **Library placement** — `/kwintas` is the **last** page in the `sulat` book (`libraryData.js:5`), not in `oras`. Matches the brief's explicit requirement. Correct.
- **Route wiring** — `/kwintas` exists, `KwintasModel` injected via `necklaceStage` prop (`main.jsx:27,51`), consistent with the Lego/Biyahe pattern.
- **Double-load idempotency** — both the `load` listener and the post-import `if (model.loaded) onLoad()` path can fire; both set the same state, so no harm.

## Defects / risks

**1. (High, PLAUSIBLE) Lazy `KwintasModel` can blank the whole page — breaks gallery independence.**
`KwintasModel` is `lazy()` (`main.jsx:27`) and is handed to `KwintasPage` as an already-created element. The only Suspense boundary is the top-level `fallback={null}` (`main.jsx:32`). On first navigation to `/kwintas`, when `KwintasPage` renders `necklaceStage`, the model chunk suspends and bubbles to that top boundary → the **entire** page (including the permanent photo gallery the brief insists must always render) goes blank until the model chunk loads. This directly contradicts the brief's "gallery independent of model loading" rule. **Whether this is an actual bug depends on `KwintasPage.jsx` (not in scope): it is only safe if `KwintasPage` wraps `necklaceStage` in its own local `<Suspense>`.** Worth verifying — the Lego page uses the same `houseStage` pattern, so check how it handles this.

**2. (Medium, PLAUSIBLE) Dev-only `/public/...` paths likely 404 in local dev.**
`KwintasModel.jsx:3` and `:30` prefix `/public` in DEV:
```
const MODEL = `${import.meta.env.DEV ? '/public' : ''}/models/kwintas.glb`;
ModelViewerElement.dracoDecoderLocation = import.meta.env.DEV ? '/public/models/draco/' : '/models/draco/';
```
Vite serves `public/` contents at the **root** (`/models/kwintas.glb`), not under `/public/`. Everything else in the repo (e.g. all `libraryData.js` image paths) uses root-absolute paths with no `/public` prefix. So in `vite dev` the GLB and the Draco decoder would 404 and the model would sit in the failed state; the prod branch (`/models/...`) is correct. The test masks this — it asserts `src` only `toContain('/models/kwintas.glb')`, which is true for both branches — and the Firebase build/verify runs the prod branch. **Confirm against `LegoHouseModel.jsx`/`BiyaheMotorcycle.jsx` and the Vite config before treating as fact**; if those siblings use the same `/public` prefix and work, there's a repo-specific reason. Otherwise this is a real dev-only regression.

**3. (Low) Draco location set after the element is upgraded.**
`dracoDecoderLocation` is assigned inside the dynamic `import().then` (`:30`), i.e. after the module (which defines the custom element) resolves. In practice the import *is* what defines `model-viewer`, so decoding can't start before the property is set — effectively safe, but it's timing-fragile. Only matters if the GLB is Draco-compressed (and note: `ktx2TranscoderLocation`/`meshoptDecoderLocation` are **not** set, so KTX2 textures or Meshopt compression in the asset would fail to load). Can't verify the GLB's compression from the given files.

## Dependency note (not a code defect)
- `build-one-eleven.mjs:10` and the gallery (per the brief) reference `/assets/kwintas/necklace-portrait.jpg` and three `/assets/kwintas/*.jpg` photos, but `git status` shows only `public/menu/img/kwintas.svg` and `public/models/kwintas.glb` as new — the `assets/kwintas/*` images are **not** in the tree. If Codex hasn't staged them, the OG/WhatsApp preview and the "permanent showcase" gallery both break at runtime. Verify those assets exist before deploy.

Nothing to implement here — this was a read-only review, so no plan file written and no subagents spawned, per your instructions.
