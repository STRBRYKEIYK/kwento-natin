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

The single Firebase project is **`chica-keicodes-dev`**. Its existing ID is retained to preserve data, app configuration, domains, and notification secrets. Cloud Firestore's `(default)` database stores saved dates in `_chica/dateScheduler` and uploaded PETSA entries in `entries`. Cloud Storage uses `chica-keicodes-dev.firebasestorage.app`, with `memories/` for scheduler photos and `entries/` for PETSA uploads. Existing static photos and recordings remain in the repository and are published through Firebase Hosting.

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

The backup writes the existing Firestore documents and Storage object metadata under ignored `.firebase-migration-data/firestore-backups/`. It does not copy object bytes; source media remains in this repository, and a deployment does not change existing uploaded objects. Keep backups private. The status command prints counts, not saved messages or credentials.

`firebase:deploy` builds and verifies the site, checks the existing notification secret, then deploys Hosting and `chicaApi` to the single Firebase project. It does not deploy or overwrite Firestore/Storage security rules. Never run Firebase initialization with an instruction to replace `index.html` or the existing access rules.

The legacy `npm run firebase:migrate-data` command backs up the old Vercel scheduler and merges it into Firestore without replacing newer Firebase changes. Run it only for a deliberate legacy data import. Old repositories are retained as migration backups; they are not build dependencies.

Automatic Vercel Git deployments are disabled by `vercel.json` so future changes here do not keep publishing large duplicate builds to Vercel. Existing Vercel projects, data, and the latest fallback deployment have not been removed by this consolidation.

If notification credentials ever need restoring, use `npm run firebase:telegram-setup`, then `npm run firebase:notifications`, in your own terminal. Never paste or commit credentials. Domain/certificate status is available through `node scripts/firebase-domain-status.mjs`.

## Editing content

- The Library book entries live in `src/pages/libraryData.js`. Add a page, thumbnail, and route together.
- Original photos and recordings live in `public/assets/` and the relevant `apps/*` directory. MP4s use Git LFS; a fresh checkout must download the LFS content before building.
- Letter memories and playlist data live in `src/letter/data/`; its UI, audio hooks, and tests live under `src/letter/`.
- ORAS renders `menu/oras/messages.json`. `scripts/build-oras.mjs` imports timed messages without publishing raw chat exports.
- AIRCON is `/aircon`; the old `/333` link remains a Firebase and client-side redirect. Content lives in `src/pages/ThreeThirtyThreePage.jsx`.
- MATAMIS is `/matamis`; its recipe, timer, and letter live in `src/pages/MatamisPage.jsx`.
- HILING is `/hiling`, entry 7 in REGALO: open an illustrated blue-hour window, choose or write a wish, fold it into a paper plane, and reveal a matching note. It works at any hour, supports keyboards and reduced motion, and saves only the last sent wish in this browser. Nothing is sent to Chico or a server. Source, styles, and interaction tests are `src/pages/HilingPage.*`; the cover is `public/menu/img/hiling.svg`.
- `scripts/build-one-eleven.mjs` generates link previews for 1:11, AIRCON, MATAMIS, and HILING.

The React tests cover interactions, saved preferences, playlist behavior, and Library links. The API tests cover date merging, cancellations, memory photos, calendars, and notification routing without sending real notifications. The consolidation checks verify imported file/media hashes, shared date logic, local build sources, and Firebase output. Real-device video/audio playback remains useful after changing recordings or player behavior.
