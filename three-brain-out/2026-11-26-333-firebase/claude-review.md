# 3:33 Firebase route fix

User report: https://chica.keicodes.dev/333 did not work.

Cause: Firebase was serving the build preceding the commits that added /333. The SPA fallback returned HTTP 200, so the existing availability checks missed the absent route.

Claude CLI reviewed the regression-check diff and the plan to rebuild and deploy only the main Hosting site. It agreed with the deployment plan. Useful findings incorporated: select the module script specifically, and report individual failed checks. The current Vite build uses backticks for route strings and dynamic imports; the checks accept all three JavaScript quote styles.

The review's title-encoding concern came from PowerShell pipeline encoding; the actual generated title was verified as 3:33 followed by the middle dot and TAYO MUNA. Reading the invitation file explicitly already fails if it is absent. The page chunk check deliberately follows the current Vite output and validates that the lazy-loaded page is actually available.

Validation:
- Before deployment: both Firebase and the custom domain failed the invitation/route/chunk check despite returning HTTP 200.
- Build: npm run build:firebase passed; generated 333/index.html and the ThreeThirtyThreePage chunk.
- Three page interaction tests passed, including keyword submission, note/letter progression, reset, and temperature controls.
- Five backend tests and six-site build checks passed.
- Deployed hosting:chica-keicodes-dev successfully (19 new files).
- After deployment: invitation title, route definition, and page JavaScript passed on both domains. All 19 existing site/media checks and read-only date/notification checks passed.
- Native browser access was unavailable; no live visual inspection was claimed.
