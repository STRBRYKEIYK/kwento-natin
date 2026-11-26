## Migration Blocker Review

### 1. DEPLOYMENT BLOCKER — Secret must exist before function deploy
`functions/src/index.js` calls `defineJsonSecret('CHICA_NOTIFICATIONS')` at module level and passes it in `secrets: [notificationConfig]`. Cloud Functions will refuse to deploy (or crash on cold start) if that secret doesn't exist yet. `firebase-notifications.mjs --apply` **must** complete before `firebase deploy --only functions`. Nothing in `firebase.json` `predeploy` enforces this ordering.

### 2. DATA-LOSS — `MAX_ENTRIES = 200` silent truncation during merge
`migrate-firebase-data.mjs` calls `mergeLists(current, state.dates)` from `dates-core.js`, which caps at 200 entries. If the Vercel backup is near 200 and Firebase already has entries, the merge will silently drop the oldest without warning or error. The script prints "Imported the saved dates" regardless.

### 3. BUILD BLOCKER — Second song source URL not rewritten
`build-firebase.mjs` replaces only `https://chica-ilychicaaa.vercel.app/ilychicaaa/` for `kind === 'song'`. The `ilychicaaa` (original) source in `firebase.sources.json` also has `kind: 'song'` but its repo likely hardcodes a *different* Vercel domain (`https://ilychicaaa.vercel.app/...`). Those references survive the build, producing broken asset paths on Firebase Hosting. Additionally, only `index.html` is rewritten — any Vercel URLs in JS/CSS files remain broken for both song sources.

### 4. CONCURRENCY — Photo upload aborts on parallel runs
`migrate-firebase-data.mjs` checks for 404, then uploads with `ifGenerationMatch: 0`. If two runs overlap, the second upload hits a 412 precondition failure with no retry — the script throws and aborts mid-migration, leaving Firestore partially updated and orphaned photos in the bucket.

### 5. FIREBASE CONFIG — `storageBucket` name assumed, not verified
`functions/src/index.js` hardcodes `storageBucket: 'chica-keicodes-dev.firebasestorage.app'`. The user states the bucket is in `asia-southeast1`, but the `.firebasestorage.app` naming convention doesn't encode region. If the actual bucket name differs (e.g., created manually), every `store.putPhoto` / `store.getPhoto` call in `store.js` will fail — writes throw, reads return null — with no descriptive error surfaced to the API caller (the catch in `api.js` returns a generic 500).

### 6. CREDENTIAL CONCERN — Exported bare token contradicts its own comment
`firebase-auth.mjs` comments "never export, print or copy its credentials" but exports `firebaseAccessToken()` returning the raw OAuth token. Any caller that logs a failed request's headers or interpolates the token into an error message would leak it. The risk is contained to local scripts today but the export surface is wider than the stated intent.

### 7. CONCURRENCY — Lazy `api` init is safe but fragile
`index.js` initializes `api` inside the request handler with `if (!api)`. Node.js single-threading makes this safe at `concurrency: 20`, but `maxInstances: 1` means a single instance crash (e.g., from an unset secret) drops all 20 concurrent requests with no fallback.

**Recommended deploy order:** notifications secret → function deploy → hosting build → data migration → hosting deploy. Items 1–3 are hard blockers; 4–5 risk silent data loss or broken runtime.
