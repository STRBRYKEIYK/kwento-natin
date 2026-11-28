# Kwento Natin 💌

Kwento Natin is the definitive repository for the Library, letters, date scheduler, vouchers, recordings, albums, timed messages, and surprises at **https://chica.keicodes.dev**.

## Repository layout

| Feature | Source in this repository | Main URL |
| --- | --- | --- |
| Library and React surprises | `src/pages/`, `src/library/` | `/` |
| Kwento Natin letter and playlist | `src/letter/` | `/third` |
| Date scheduler and Limang Pandama | `apps/date-scheduler/` | `/date/`, `/555` |
| Love Voucher Book | `apps/vouchers/` | `/vouchers/` |
| Para sa Chica ko | `apps/second-letter/` | `/second/` |
| Current recording letter | `apps/recording-letter/` | `/ilychicaaa/` |
| Original recording letter | `apps/original-recording/` | `/ilychicaaa-original/` |
| Shared Firebase API | `functions/src/` | `/date/api/*`, `/vouchers/api/*` |
| Shared dates, places, calendar, notifications | `functions/src/shared/` | Used by both scheduler and API |

All five former repositories have been imported. `firebase.sources.json` records their local directories and original commits; `docs/imports/` records original file checksums. Builds use local source files and do not clone or download the old repositories. Make future changes here.

## Firebase database and hosting

The single Firebase project is **`chica-keicodes-dev`**. Its existing ID is retained to preserve data, app configuration, domains, and notification secrets. Cloud Firestore's `(default)` database stores saved dates in `_chica/dateScheduler`, uploaded PETSA entries in `entries`, curated albums in `albums`, and file metadata in `media`. Images, music and videos live in Cloud Storage bucket `chica-keicodes-dev.firebasestorage.app`: `library/sha256/` holds the migrated library, `memories/` holds scheduler photos, and `entries/` holds PETSA uploads. Firebase Hosting serves code, HTML, fonts and SVG artwork.

The media migration verified 1,107 original files against 1,013 unique cloud objects (1,576,141,071 bytes). Identical files share a Storage object. `functions/src/media-catalog.json` records original paths, hashes and immutable Storage download URLs; it contains public media download tokens, never account credentials. The frontend loads Storage URLs directly. Legacy media links redirect through `chicaApi`. PETSA reads its 11 curated albums from Firestore, with the local album list as a fallback. Saved dates and existing upload locations are preserved.

`chicaApi` runs in `asia-southeast1` and uses the existing database, bucket, and `CHICA_NOTIFICATIONS` Secret Manager secret. Date merging, cancellation marks, private memory photo URLs, and browser storage keys are preserved. Voucher scratch/redeem progress continues to use its existing local storage key; the voucher API sends notifications. The consolidation does not silently upload or reset browser-only progress.

The six Hosting site IDs below are compatibility addresses within this same Firebase project. They use the same API and database, and are all built and deployed from this repository:

| Site | Firebase URL |
| --- | --- |
| Library and all apps | https://chica-keicodes-dev.web.app |
| Scheduler | https://chica-keicodes-dev-dates.web.app |
| Vouchers | https://chica-keicodes-dev-vouchers.web.app |
| Second letter | https://chica-keicodes-dev-second.web.app |
| Current recording | https://chica-keicodes-dev-song.web.app |
| Original recording | https://chica-keicodes-dev-original.web.app |

The public domain already points to Firebase. `voucher.keicodes.dev` transfers its existing voucher progress to the main `/vouchers` page. No DNS change is needed for normal releases.

## Install, build, and verify

Use Node.js 22.12+; the deployed Cloud Function runtime is Node.js 22.

```powershell
npm ci
npm --prefix functions ci
npm test
npm run build:firebase
npm run test:firebase
```

The root npm workspace installs the scheduler's dependencies with the rest of the frontend dependencies. `npm run build` produces the entire website in `dist/`, including the five imported apps. `npm run build:firebase` also assembles `.firebase-hosting/` for the main site and compatibility addresses.

```powershell
npm run dev
npm run dev --workspace=@kwento-natin/date-scheduler
npm run preview
```

The first dev command runs the main React app; the workspace command runs the scheduler. `npm run preview` serves the complete built frontend. API endpoints require Firebase Hosting/Functions or the Emulator Suite; preview alone does not run a database API.

## Database status, backup, and deployment

```powershell
npm run firebase:database
npm run firebase:backup
npm run firebase:deploy
node scripts/verify-firebase-live.mjs --api
```

The backup writes Firestore documents and Storage object metadata under ignored `.firebase-migration-data/firestore-backups/`. It does not copy object bytes. The original media files were retained locally under ignored `.firebase-migration-data/media-originals/`; old Git commits and old repositories also retain their history. Keep those backups private and maintain a separate backup of Storage. Normal deployments do not change existing Storage objects. The status command prints counts, not saved messages or credentials.

`firebase:deploy` builds and verifies the site, checks the existing notification secret, then deploys Hosting and `chicaApi` to the single Firebase project. It does not deploy or overwrite Firestore/Storage security rules. Never run Firebase initialization with an instruction to replace `index.html` or the existing access rules.

The legacy `npm run firebase:migrate-data` command backs up the old Vercel scheduler and merges it into Firestore without replacing newer Firebase changes. Run it only for a deliberate legacy data import. Old repositories are retained as migration backups; they are not build dependencies.

Automatic Vercel Git deployments are disabled by `vercel.json` so future changes here do not keep publishing large duplicate builds to Vercel. Existing Vercel projects, data, and the latest fallback deployment have not been removed by this consolidation.

If notification credentials ever need restoring, use `npm run firebase:telegram-setup`, then `npm run firebase:notifications`, in your own terminal. Never paste or commit credentials. Domain/certificate status is available through `node scripts/firebase-domain-status.mjs`.

## Editing content

- The necklace page leads with the interactive 3D stage, then the linen visualization. Complete name meanings live in `src/pages/kwintasOrder.js` and appear in both design cards. The user requested meanings only: do not add chain specifications, prices or receipt details. `KwintasPage.test.jsx` verifies the section order, complete meanings, and absence of order details; `scripts/verify-kwintas-live.mjs` also checks that live page bytes match the verified build.

- ANG KWINTAS NATIN is the 11:11 necklace story at `/kwintas`, appended as the last SULAT entry. Antigravity owns `src/pages/KwintasPage.jsx`, `src/pages/KwintasPage.css` and the cover `public/menu/img/kwintas.svg`; Codex integrates `KwintasModel.jsx`, routing and verified media. Six permanent showcase images live in Storage through the media catalog, independently of the 3D viewer. The supplied portrait is labeled as a visualization; three photos record the September 11 late monthsary, and two transparent mockups show the approved designs. KEITH is the hexagon worn by Chica, and JERSEY is the oval worn by Chico. The Downloads original GLB remains untouched; `public/models/kwintas.glb` is a 12.14 MB web copy using Draco and 2048px WebP textures with simplification disabled. Bounds are preserved; welding removed two degenerate triangles from 4,994,542. The viewer has progress, retry, drag/zoom and camera reset. Claude supplied source-grounding guidance and an independent integration review under `three-brain-out/2026-11-28-kwintas/`. The raw chat and email screenshots are not published.

- BIYAHE NATIN is the 11:11 PM page in ORAS-ORAS at `/biyahe`. Antigravity owns its UI/UX in `src/pages/BiyahePage.jsx` and `src/pages/BiyahePage.css`, with the cover at `public/menu/img/biyahe.svg`. The full supplied letter is preserved. `BiyaheMotorcycle.jsx` integrates the supplied scooter model with drag controls, loading progress, retry, and camera reset. `public/models/biyahe-scooter.glb` is a 12.23 MB web copy of the 151.04 MB Downloads original, using Draco and 2048px WebP textures with mesh simplification disabled; welding removed four degenerate triangles from about 4.95 million. The Downloads original is untouched. The `motorcycleStage` prop accepts a render function receiving `{ mode, moment }` so the model scene follows every ride/stop control; existing React elements still work. Antigravity owns `BiyaheScene.jsx` and its road/overlook/food/hug scenery. The loaded viewer is preserved; ride mode restores and locks the right-facing side view, while stops allow rotation. Antigravity scales the riding motorcycle to 72% and uses the generated photographic roadside asset in `public/scenes/biyahe-ride-realistic.png`; the prompt is saved in `docs/biyahe-image-prompt.txt`. The stopped inspection view keeps its original size and uses `public/scenes/biyahe-stop-realistic.png` for the mountain overlook; food and hug stops keep their own scenes. Both image prompts are in `docs/biyahe-image-prompt.txt`.

- A LEGO HOUSE is the 3:33 PM page in ORAS-ORAS at `/lego-house`. Antigravity owns its page UI, styling, and framed-dreams interaction in `src/pages/LegoHousePage.jsx` and `src/pages/LegoHousePage.css`; `LegoHouseModel.jsx` integrates the supplied house model with loading progress, retry, drag controls, and camera reset. The full supplied letter is preserved. `public/models/lego-house.glb` is a 6.11 MB web copy of the 69.43 MB Downloads original, using Draco and 2048px WebP textures with mesh simplification disabled; its 1,902,655 triangles and bounds are preserved. The original file is untouched. The cover is `public/menu/img/lego-house.svg`.

- PANGAKO is the 2:22 message in ORAS-ORAS at `/pangako`. Antigravity designed its UI/UX, promises, and letter in `src/pages/PangakoPage.jsx` and `src/pages/PangakoPage.css`; the cover is `public/menu/img/pangako.svg`. Display copy is in CAPS. The August 15 promises come from the supplied chat; the raw export is not published. `PangakoRing.jsx` loads `public/models/pangako-ring.glb`, with the illustration as its loading/error fallback, progress, retry, drag controls, and camera reset. The supplied `06eb3a89-0467-4e7b-a0bf-fcfe5fac3da9.glb` was optimized from 149.59 MB to 9.38 MB using Draco and 2048px WebP textures with mesh simplification disabled; welding removed 20 degenerate triangles from about 4.98 million. The original Downloads file is untouched. Local Draco decoders are reused. The optional `ringStage` prop remains available for overrides.

- TABI MUNA TAYO is the special gentle 1:11 page for Chicaaa at `/tabi`, in ORAS-ORAS. Antigravity supplied its editorial moss and ivory UI/UX direction; source is `src/pages/TabiPage.jsx` and `src/pages/TabiPage.css`. The supplied `CHICA Y CHICOO.glb` was optimized from 144.46 MB to 11.52 MB without mesh simplification, using Draco and 2048px WebP textures; the web copy is `public/models/chica-y-chico.glb`. The original Downloads file is untouched. Local Draco decoders are reused. The viewer has drag controls, loading progress, retry, and camera reset; the letter works independently of the model. The cover is `public/menu/img/tabi.svg`. The original 1:11 memories page remains at `/one-minute-eleven-memories`.

- The Library book entries live in `src/pages/libraryData.js`. Add a page, thumbnail, and route together.
- Personal media is excluded from Git and Hosting bundles. A fresh checkout builds without downloading Git LFS or the old repositories. `src/media.js` resolves existing media references; the Vite plugin also resolves scheduler image imports and static page references from the catalog.
- Add new photos through PETSA's existing add-entry form: it uploads to Storage and saves metadata in Firestore. For new videos or music, upload the file to Storage and use its download URL in an album's `media` list or the relevant content entry. Store album labels, dates, descriptions, media URLs and thumbnail URLs in Firestore; never put binary file contents in a database document. Keep a video thumbnail as an image and set `type: "video"`.
- Update curated albums in Firestore's `albums` collection, keeping their `date` values and order stable because shared PETSA links use album indexes. Existing story text and curated fallback filenames remain in source control.
- The manual recording-encoding workflow downloads from Storage and returns an encoded artifact. It does not commit video files or overwrite cloud media. Upload a chosen replacement to Storage and update its URL deliberately.
- Letter memories and playlist data live in `src/letter/data/`; its UI, audio hooks, and tests live under `src/letter/`.
- ORAS renders `menu/oras/messages.json`. `scripts/build-oras.mjs` imports timed messages without publishing raw chat exports.
- AIRCON is `/aircon`; the old `/333` link remains a Firebase and client-side redirect. Content lives in `src/pages/ThreeThirtyThreePage.jsx`.
- MATAMIS is `/matamis`; its recipe, timer, and letter live in `src/pages/MatamisPage.jsx`.
- HILING is `/hiling`, entry 7 in REGALO: open an illustrated blue-hour window, choose or write a wish, fold it into a paper plane, and reveal a matching note. It works at any hour, supports keyboards and reduced motion, and saves only the last sent wish in this browser. Nothing is sent to Chico or a server. Source, styles, and interaction tests are `src/pages/HilingPage.*`; the cover is `public/menu/img/hiling.svg`.
- `scripts/build-one-eleven.mjs` generates link previews for 1:11, AIRCON, MATAMIS, and HILING.
- HAPON NATIN is the afternoon 12:12 surprise in ORAS-ORAS, at `/hapon`: a sunny picnic illustration with three notes to open, including a letter for Chicaaa. Source and styles are `src/pages/HaponPage.*`; the cover is `public/menu/img/hapon.svg`. YAKAP stays in REGALO at `/yakap`.

The React tests cover interactions, saved preferences, playlist behavior, and Library links. The API tests cover date merging, cancellations, memory photos, calendars, and notification routing without sending real notifications. The consolidation checks verify imported file/media hashes, shared date logic, local build sources, and Firebase output. Real-device video/audio playback remains useful after changing recordings or player behavior.

`node scripts/verify-cloud-media.mjs` checks every migrated object's server checksum, size, generation, public download, CORS and range playback against its local original or migration backup. It requires Firebase CLI sign-in. `scripts/migrate-media.mjs --apply` is the initial migration tool and refuses to discard an existing catalog; do not use it as a general uploader after migration. `scripts/seed-media-database.mjs --apply` creates missing metadata documents only and preserves edited albums and existing dates. These scripts never replace Firestore or Storage security rules.
