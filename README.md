# Kwento Natin 💌

A personal love letter built with React, Vite, and Framer Motion. The original photos, chapter text, letter, and six recordings are preserved.

## Run locally

Use Node.js 22.12+ (or a newer supported Node version).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. React source needs the dev server; opening `index.html` directly does not run the app.

```sh
npm test
npm run build
npm run preview
```

The production website is in `dist/`. Publish that directory on a static host. Relative asset URLs support hosting inside a project subdirectory.

## Content and behavior

- Edit memories, captions, and letter text in `src/data/story.json`.
- Playlist and chapter order live in `src/data/content.js`.
- Photos and recordings live in `public/assets/`; the originals remain available in the build.
- React components live in `src/components/`; audio, reading, theme, and persistence logic live in `src/hooks/`.
- Reading position, photo colors, and theme stay in browser local storage. Existing saved values are accepted.
- Music starts from an explicit user action. Quiet mode, pause intent, manual song choice, and optional chapter following are supported.
- Framer Motion animates the envelope, section entrances, progress, photo changes, and player. Reduced-motion preferences are respected.
- Layouts cover narrow phones, larger phones, tablets, desktop, and landscape photo viewing. Photos load lazily and all primary touch controls are at least 44px.

Tests exercise React interactions, audio behavior, saved preferences, and content/asset preservation using JSDOM and a mock audio element. They do not verify real browser layout, native dialog focus trapping, or actual audio playback. Visual checks at 320, 375, 390, and 430px widths, plus landscape and a real iOS/Android browser, remain useful before publication.
