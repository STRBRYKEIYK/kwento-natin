# Kwento Natin 💌

## Firebase migration

Firebase project: `chica-keicodes-dev`. The main site and five related sites are assembled from the commits pinned in `firebase.sources.json`. The main site retains `/date`, `/555`, `/vouchers`, `/second`, `/ilychicaaa`, `/third`, `/oras`, PETSA and the 1:11 surprise. The older `ilychicaaa` variant has its own Firebase Hosting site.

```powershell
npm ci
npm --prefix functions ci
npm run build:firebase
npm run test:firebase
```

The build clones missing linked repositories into ignored `.firebase-sources/` and creates `.firebase-hosting/`. It leaves originals intact and excludes raw chat exports from publication. The shared timed messages are included at `/oras/messages.json`. Never run Firebase initialization with an instruction to overwrite `index.html` or replace the existing Firestore/Storage rules.

Dates, private memory photos, calendar exports and notifications use the `chicaApi` Cloud Function in `asia-southeast1`, colocated with the existing database and bucket. Date changes use Firestore transactions and the original merge/cancellation rules. Notification settings are stored in the `CHICA_NOTIFICATIONS` Secret Manager secret.

Before switching DNS:

1. Complete `npm run firebase:login` if required.
2. Restore masked Telegram credentials with `npm run firebase:telegram-setup` in your own terminal. Values are saved only under ignored `.firebase-migration-data/private/`; never paste or commit them.
3. Run `npm run firebase:notifications` to store the validated configuration in Secret Manager.
4. Run `npm run firebase:migrate-data` immediately before cutover. This backs up the old scheduler again and merges it into Firebase without replacing newer Firebase data. The old Vercel data is not deleted.
5. Run `npm run firebase:deploy`, then `node scripts/verify-firebase-live.mjs --api`. All checks must pass before moving the custom domains.
6. Run `node scripts/firebase-domain-status.mjs` for Firebase's current certificate/DNS requirements. DNS is managed in Cloudflare. The `chica` CNAME points to `chica-keicodes-dev.web.app`; `voucher` points to `chica-keicodes-dev-vouchers.web.app`, both DNS-only. Keep existing DNS until the APIs, secrets and certificate are ready.

Published Firebase sites:

| Site | Firebase URL |
| --- | --- |
| Library and all linked paths | https://chica-keicodes-dev.web.app |
| Scheduler | https://chica-keicodes-dev-dates.web.app |
| Vouchers | https://chica-keicodes-dev-vouchers.web.app |
| Second letter | https://chica-keicodes-dev-second.web.app |
| Current recording letter | https://chica-keicodes-dev-song.web.app |
| Original recording letter | https://chica-keicodes-dev-original.web.app |

Vercel projects and stored data remain available during migration. This setup does not delete them, upgrade a billing plan, change database access rules, or automatically alter Cloudflare records. Future changes to a linked repository require updating its pinned commit before rebuilding.


A personal love letter built with React, Vite, and Framer Motion, with photos, dated memories, a personal letter, and eleven songs in the playlist.

## Run locally

Use Node.js 22.12+ (or a newer supported Node version).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite and add `/third/` (the letter is served under that path). React source needs the dev server; opening `index.html` directly does not run the app.

```sh
npm test
npm run build
npm run preview
```

The production website is in `dist/`. `npm run build` builds the letter into `dist/third/` and copies the library menu from `menu/` to the root of `dist/`.

## chica.keicodes.dev layout

| Path | What | Where it comes from |
| --- | --- | --- |
| `/` | Library bookshelf: books are categories, pages are entries | `menu/index.html` (this repo) |
| `/second` | Para sa Chica ko | proxied to the `para-sa-chica` project |
| `/third` | Kwento Natin (this letter) | this repo, built by Vite with `base: '/third/'` |
| `/oras` | Mga Oras Natin: the timed messages (10:10, 11:11 ... 5:55) | `menu/oras/`, copied to `dist/oras/` by `scripts/build-menu.mjs` |
| `/555` | 5:55 Limang Pandama | proxied to `chica-date-scheduler` |
| `/date` | Date scheduler | proxied to `chica-date-scheduler` |
| `/vouchers` | Love Voucher Book | proxied to `love-voucher-book` |

The proxies are the `rewrites` in `vercel.json`. To add something to the library, edit the `LIB` list at the top of the script in `menu/index.html`: a book is a category, and each item in its `pages` is one entry (title, blurb, `href`, `stamp`, a thumbnail in `menu/img/`; set `frame: true` for a colour photo in a picture frame, and `photo: "key"` to make the frame open large when tapped; the big versions live in `PHOTOS`, with a 900px copy in `menu/img/`). A new book also needs its id in `SHELVES`. The BAGO tag and counts are filled in by the page. Add a rewrite here if the entry lives in another project. The wall calendar beside the shelf (wide screens) and the small one hung inside the shelf (phones, tap to open the full calendar) read the dates Date Tayo saves in `localStorage` under `chica.dates.v1`: each set date gets a pentel-pen heart. Dates are also kept by the scheduler's `/date/api/dates` (needs its Blob store connected, see that repo) so any device sees them; whatever a phone has that the server lacks is sent up automatically. To pin a date on every device whatever happens, add it to `SEEDED` in the calendar script. The local save only works because `/date` and the menu share the `chica.keicodes.dev` origin.

## Mga Oras Natin (`/oras`)
A separate 3:33 surprise lives at `/333`, linked from the ORAS-ORAS shelf. The `aircon` keyword opens three notes and a longer letter in all caps; it is a playful reveal, not authentication. The remote's Lamig Check controls change a fictional cuddling forecast from 24°C to 16°C. Content and styles live in `src/pages/ThreeThirtyThreePage.jsx` and its CSS. `npm run build` generates a discreet link preview at `dist/333/index.html`.


A static page (`menu/oras/index.html`) that reads `menu/oras/messages.json`. A little panel holds the toggles (the hour, long or short, AM or PM, order, a search box, Surprise me) and a big panel lists the messages by day. `/oras#1010` opens on one hour; at one of the times of day the page opens on that hour by itself.

`messages.json` is made from the WhatsApp export with `node scripts/build-oras.mjs path/to/timed-messages.json` (the export itself is not kept here, this repo is public). The script leaves out drafts (unless their id is in `SENT`, with the text that was really sent, for a draft sent after the export), messages that name other people (`mentionsOthers`) and the ids in its `HOLD` list; pass `--include-others` to put the others back.

## Content and behavior

- Edit memories, captions, and letter text in `src/data/story.json`.
- Playlist and chapter order live in `src/data/content.js`.
- Photos and recordings live in `public/assets/`; the originals remain available in the build.
- React components live in `src/components/`; audio, reading, theme, and persistence logic live in `src/hooks/`.
- Reading position, photo colors, and theme stay in browser local storage. Existing saved values are accepted.
- Music starts from an explicit user action. Quiet mode, pause intent, manual song choice, and optional chapter following are supported.
- Songs crossfade over 1.2 seconds, including chapter changes and automatic advancement. Play fades in; pause fades out briefly. Web Audio gain nodes handle fades on mobile, with media-volume fades as a fallback.
- Framer Motion animates the envelope, section entrances, progress, photo changes, and player. Reduced-motion preferences are respected.
- Layouts cover narrow phones, larger phones, tablets, desktop, and landscape photo viewing. Photos load lazily and all primary touch controls are at least 44px.

Tests exercise React interactions, audio behavior, saved preferences, and content/asset preservation using JSDOM and a mock audio element. They do not verify real browser layout, native dialog focus trapping, or actual audio playback. Visual checks at 320, 375, 390, and 430px widths, plus landscape and a real iOS/Android browser, remain useful before publication.
