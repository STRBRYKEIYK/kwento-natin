# Kwento Natin 💌

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
| `/555` | 5:55 Limang Pandama | proxied to `chica-date-scheduler` |
| `/date` | Date scheduler | proxied to `chica-date-scheduler` |
| `/vouchers` | Love Voucher Book | proxied to `love-voucher-book` |

The proxies are the `rewrites` in `vercel.json`. To add something to the library, edit the `LIB` list at the top of the script in `menu/index.html`: a book is a category, and each item in its `pages` is one entry (title, blurb, `href`, `stamp`, a thumbnail in `menu/img/`; set `frame: true` for a colour photo in a picture frame, and `photo: "key"` to make the frame open large when tapped; the big versions live in `PHOTOS`, with a 900px copy in `menu/img/`). A new book also needs its id in `SHELVES`. The BAGO tag and counts are filled in by the page. Add a rewrite here if the entry lives in another project. The wall calendar beside the shelf (wide screens) and the small one hung inside the shelf (phones, tap to open the full calendar) read the dates Date Tayo saves in `localStorage` under `chica.dates.v1`: each set date gets a pentel-pen heart. This only works because `/date` and the menu share the `chica.keicodes.dev` origin.

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
