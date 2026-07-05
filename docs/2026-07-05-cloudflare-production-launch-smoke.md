# 2026-07-05 - Cloudflare Production Launch Smoke

Document ID: AUD-ENG-004
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-05
Next Review: Before custom-domain DNS work, public website links, social launch, or desktop download buttons
Timestamp: 2026-07-05T07:22:04-06:00
Last Updated: 2026-07-05T07:22:04-06:00

## Purpose

This packet records Desktop Chunk D13: canonical online app URL selection, Cloudflare Pages direct-upload production deployment, and hosted smoke testing for the browser/PWA MVP.

D13 makes the web/PWA app available at the Cloudflare Pages production URL. It does not publish the Old Skool AI hub page, change DNS, attach a custom domain, create GitHub Releases, publish desktop artifacts, create social launch posts, sign installers, notarize macOS artifacts, enable telemetry, connect provider accounts, add a backend, or distribute desktop downloads.

## Owner Direction

On 2026-07-05, the owner asked to pick up where the prior session left off and get the project shared out to the world.

This was treated as approval to run the next bounded release-engineering chunk, D13, with these constraints:

- use the Cloudflare Pages production URL as the first canonical online app URL
- accept a documented Wrangler direct-upload production release for this chunk
- keep Old Skool AI website publication, cross-site links, DNS/custom-domain work, social posts, GitHub Releases, and desktop downloads out of this chunk
- keep desktop download buttons hidden or disabled until desktop signing/trust gates pass

## Release Decision

Completion target: Task complete.

Result: The hosted web/PWA app is live and link-ready at:

```text
https://ai-task-router.pages.dev/
```

Release process accepted for D13: Wrangler direct upload from the local `dist/` artifact to the Cloudflare Pages `main` production branch.

Public website and social launch decision: hold until the Old Skool AI hub page uses the final URL, support/security route is confirmed for ordinary users, cross-site links are updated, and the owner approves the public-link/social step.

Desktop release decision: hold. No unsigned or unnotarized desktop artifacts are public downloads.

## Production Details

| Item | Value |
|---|---|
| Cloudflare Pages project | `ai-task-router` |
| Canonical app URL for first public web release | `https://ai-task-router.pages.dev/` |
| Production deployment URL | `https://80545680.ai-task-router.pages.dev` |
| Production deployment ID | `80545680-27ea-46cc-9cc1-9bfdf82b2eb8` |
| Branch | `main` |
| Source commit | `af2b367` |
| Deployment source | Wrangler direct upload from local `dist/` |
| Build output | 9 static files |
| Functions | None |
| Runtime environment variables | None required by the app |
| Custom domain | Not attached |
| GitHub integration | Not connected yet |

The D9 smoke-test preview remains historical evidence only:

```text
https://preview-20260704-0c7b253.ai-task-router.pages.dev
```

Do not use the D9 preview alias in public website links.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T07:14:38-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance preflight reported 0 warnings before D13 release work; timestamp captured. |
| 2026-07-05T07:19:21-06:00 | `npm ci`; `npm audit --audit-level=moderate`; `npm run test:scripts`; `npm run test` | passed | Clean install passed; audit found 0 vulnerabilities; Node script tests passed 4 tests; Vitest passed 12 files and 88 tests. |
| 2026-07-05T07:20:00-06:00 | `npm run build`; `npm run scan:web-rc`; `npx playwright test`; `bash scripts/governance-preflight.sh` | passed with existing build warning | Production build passed with the known 519.84 kB Vite chunk warning; web release-candidate scan found no release-blocking findings; local Playwright passed 6 Chromium tests; governance preflight again reported 0 warnings. |
| 2026-07-05T07:20:00-06:00 | `npx --yes wrangler whoami --env-file ...` | passed | Wrangler accepted the Cloudflare API token from the secure master environment file. Token values were not printed or documented. |
| 2026-07-05T07:20:56-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash af2b367... --commit-message "Promote ai-task-router web release candidate" --env-file ...` | passed | Cloudflare deployed the `main` branch production build and returned deployment URL `https://80545680.ai-task-router.pages.dev`. |
| 2026-07-05T07:21:14-06:00 | Node HTTPS hosted asset check | passed | `https://ai-task-router.pages.dev/`, `manifest.webmanifest`, `service-worker.js`, `/pwa/icon-192.png`, and `/pwa/icon-512.png` returned 200 with expected content types. |
| 2026-07-05T07:21:14-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test` | passed | Hosted production URL passed the same 6 Chromium E2E tests. |
| 2026-07-05T07:21:14-06:00 | `curl.exe -I https://ai-task-router.pages.dev/`; `Invoke-WebRequest -Method Head` | passed | Both Windows clients returned HTTP 200 for the production URL, resolving the D9 Windows TLS caveat for this final Pages URL. |
| 2026-07-05T07:21:14-06:00 | `npx --yes wrangler pages deployment list --project-name ai-task-router --env-file ...` | passed | Latest deployment reported `Production`, branch `main`, source `af2b367`, deployment `https://80545680.ai-task-router.pages.dev`. |
| 2026-07-05T07:21:52-06:00 | Chromium metadata/network smoke | passed | Title `AI Task Router | Guided AI Labs`, first heading `AI Task Router`, manifest `/manifest.webmanifest`, service-worker scope `https://ai-task-router.pages.dev/`, and 0 observed external requests during load. |
| 2026-07-05T07:30:44-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; release-boundary `rg` scans | passed | Final D13 documentation close-out validation passed. Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; scans found no stale canonical-URL-pending, preview-command, premature desktop-download, or install-safety wording in active release docs. |

## Smoke Notes

- The Cloudflare Pages production URL serves the app over HTTPS.
- The hosted app serves the manifest, service worker, and 192px/512px PWA icons from the production URL.
- The service-worker scope is the production root URL, matching the selected Cloudflare Pages default URL.
- Hosted E2E confirms Start Here, My AI Tools, My Task, Best Options, Decision Card, Copy-Ready Prompts, Past Choices, no-execution controls, local-store migration, and narrow-viewport layout.
- The Chromium load smoke observed no external requests during first load.
- The browser/PWA boundary remains unchanged: the browser app cannot check the user's computer; local AI tool discovery requires the desktop app.

## Known Gaps

- The Old Skool AI public hub page has not been published from this repo.
- `guidedailabs.com` and `guidedaijourney.com` links have not been updated from this repo.
- Social launch posts have not been created.
- No custom domain or DNS change has been made.
- Cloudflare Pages is still not connected to GitHub; D13 accepted direct upload for the first production web release.
- The public support/security route for ordinary website users still needs owner confirmation on the hub page, though `SECURITY.md` exists in this repo.
- Public desktop downloads remain blocked by signing/notarization, checksums, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner approval.

## Rollback

Cloudflare web rollback:

1. In Cloudflare Pages, roll back from production deployment `80545680-27ea-46cc-9cc1-9bfdf82b2eb8` to a prior known-good production deployment when one exists, or deploy a corrected `dist/` artifact to `main`.
2. If public links have been added, remove or disable the Old Skool AI online-app button until the production URL is healthy.
3. If service-worker behavior is wrong, ship a corrected build with an updated cache name or roll back and tell affected users to reload.
4. Record the rollback in the active pathway, runbook, and changelog.

Website rollback remains separate:

1. Remove the Old Skool AI navigation link.
2. Unpublish or draft the `AI Task Router` page.
3. Remove Guided AI Labs and Guided AI Journey cross-site links.

## Handoff

D13 is task complete. The web/PWA app is live and link-ready at `https://ai-task-router.pages.dev/`.

The next bounded chunk should publish or update the Old Skool AI hub page using the D12 copy and the D13 final app URL, confirm the public support/security route, add the Guided AI Labs and Guided AI Journey cross-site links, smoke the public pages on desktop and mobile, and only then decide whether to create social launch posts.

Keep desktop download buttons hidden or disabled until the separate desktop trust gates pass or a documented technical-preview exception is explicitly accepted.
