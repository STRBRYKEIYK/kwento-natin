# Shared notes

Each public page loads `/shared/comments.js`, a dependency-free `<library-notes>` element. The component has an isolated stylesheet and a separate thread per page. Oras-oras time filters select their own threads through the `chica:comment-page` event.

The shared service is `/date/api/comments`, hosted by the date scheduler and backed by its existing **private** Vercel Blob store. The existing main-domain `/date/:path+` proxy carries those requests. No storage credentials are sent to the browser.

## Access

Only Chico and Chicaaa can read or post notes. Each has a separate random 256-bit invitation key. The API's `_comment-access.js` contains only their SHA-256 hashes. Keep the actual invitation links outside all repositories. Opening one's own link sets the identity for that browser; the fragment is removed from the address bar. The browser remembers access across pages on the same origin. A different browser or standalone deployment requires opening the private link there or pasting the access code.

There is no name selector: the server assigns the author's name from the verified key. Anyone who receives a private invitation can use its identity. To revoke a link, replace its hash on the server and privately issue a new link. Never put raw keys in source, screenshots, build logs, or public documentation.

## Persistence

Every accepted note is one immutable Blob object, with the page, UUID, server-derived author and server timestamp. Writes use `allowOverwrite: false`. Request retries reuse the same UUID. Existing content cannot be replaced, and the API supports no editing or deletion methods. Distinct comments cannot overwrite one another.

Only the current thread is listed, with thirty notes at a time and a button for older notes. Comments are plain text rendered through `textContent`. Local session storage holds drafts, not the saved comment history. Failed writes retain the draft and show a retry message.

## Integration and validation

Add this inside an HTML document's head, replacing the key with its thread:

```html
<script src="https://chica.keicodes.dev/shared/comments.js" data-page="ilychicaaa"></script>
```

Use `library`, `oras`, `555`, `date`, `vouchers`, `second`, `third`, or `ilychicaaa`. The shared script captures invitation fragments before page scripts run, then mounts the section after the document is parsed. `scripts/build-menu.mjs` copies the shared asset to the main deployment's `/shared/` directory.

In the library repository, run `npm test` and `npm run build`. In the date scheduler, run `node --test tests/comments.test.js` and `npm run build`. Deploy the date backend first, then the library's shared asset, then the remaining page integrations. Changes to other apps only add the shared script.
