# 2026-07-05 - Public Impact Insight Cloudflare Update

Document ID: AUD-ENG-006
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-05
Next Review: Before social launch posts, exact public savings claims, live pricing tables, custom-domain DNS work, or public desktop download buttons
Timestamp: 2026-07-05T09:34:16-06:00
Last Updated: 2026-07-05T09:34:16-06:00

## Purpose

This packet records D16: adding the reviewed impact-estimator story to the public browser/PWA app and redeploying the Cloudflare Pages production URL.

D16 makes the public app explain why right-sized AI tool choice matters. It does not create social posts, attach a custom app domain, create GitHub Releases, publish desktop artifacts, sign installers, notarize macOS artifacts, enable telemetry, connect provider accounts, add a backend, fetch live pricing, calculate exact per-user savings, or distribute desktop downloads.

## Owner Direction

On 2026-07-05, the owner clarified that the impact story needed to be in the public shared tool, not only in a repo methodology document. The owner asked for the work to fit the user experience as a clear side panel or similar UI without crowding the tool's main routing intent.

This was treated as approval for a bounded public web/PWA update with these constraints:

- add the impact story to the existing online tool
- keep the main routing workflow usable and uncluttered
- use reviewed pricing and environmental examples without false claims
- keep examples framed as estimates, not user-specific bills or guaranteed savings
- keep the app local-first, with no provider calls, telemetry, live pricing fetches, account connections, or execution workflow
- keep desktop downloads, social posts, DNS/custom-domain work, and exact public savings claims out of this chunk

## Release Decision

Completion target: Task complete with public web update evidence.

Result: The hosted web/PWA app at the existing canonical URL now includes the public impact insight:

```text
https://ai-task-router.pages.dev/
```

The Old Skool AI hub continues to link to the same canonical online app URL:

```text
https://oldskoolai.com/ai-task-router/
```

Release process accepted for D16: Wrangler direct upload from the local `dist/` artifact to the Cloudflare Pages `main` production branch.

Public social launch decision: still held for a separate owner-approved copy/review chunk.

Desktop release decision: still held. No unsigned or unnotarized desktop artifacts are public downloads.

## Production Details

| Item | Value |
|---|---|
| Cloudflare Pages project | `ai-task-router` |
| Canonical app URL | `https://ai-task-router.pages.dev/` |
| Production deployment URL | `https://cd2c5112.ai-task-router.pages.dev` |
| Production deployment ID | `cd2c5112-e554-407f-a631-114fc189651c` |
| Branch | `main` |
| Source commit | `b4daec6` |
| Deployment source | Wrangler direct upload from local `dist/` |
| Build output | 9 static files |
| Functions | None |
| Runtime environment variables | None required by the app |
| Custom domain | Not attached |
| GitHub integration | Not connected yet |

Previous production deployment:

```text
https://80545680.ai-task-router.pages.dev
```

Do not use the D9 preview alias in public website links.

## Public UI Behavior

D16 adds:

- a Start Here note that the app helps users build judgment about when a smaller route is enough
- a Best Options impact section directly after the recommendation summary
- a 100k-token reviewed-pricing example
- a right-sizing scenario example
- a scenario energy estimate
- a skill payoff statement
- a recommendation-specific note based on the current best option's resource level
- a collapsed "Method and sources" section with official source links
- visible caveat copy that estimates are not the user's bill and not a guarantee

The panel is intentionally educational, not a live calculator. It does not fetch provider pricing, inspect usage history, or claim exact user savings.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T09:23:40-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance preflight reported 0 warnings before D16 public UI/release work; timestamp captured. |
| 2026-07-05T09:30:02-06:00 | `npm run test -- impactEstimator`; `npm run test -- App` | passed | Focused impact suite passed 1 file and 7 tests; focused App suite passed 1 file and 14 tests. |
| 2026-07-05T09:30:21-06:00 | `npm run test`; `npm run build` | passed with existing build warning | Full Vitest passed 13 files and 95 tests. Production build passed with the existing Vite chunk-size warning; built JS chunk was 530.59 kB. |
| 2026-07-05T09:30:50-06:00 | `npm run scan:web-rc` | passed | Web release-candidate scan found no release-blocking findings. Official impact/pricing links are explicitly allowlisted; surprise external URLs remain blocked. |
| 2026-07-05T09:31:30-06:00 | `npx playwright test` | passed | Local Playwright passed 6 Chromium tests after the impact panel assertion was narrowed to the metric label. |
| 2026-07-05T09:32:58-06:00 | Local production preview visual smoke at `http://127.0.0.1:5185/` | passed | Desktop and mobile screenshots confirmed the impact section renders without crowding; desktop 1440px and mobile 390px had no horizontal overflow. |
| 2026-07-05T09:33:40-06:00 | Mobile source-details-open smoke | passed | The collapsed source list was opened on a 390px viewport and still had no horizontal overflow. |
| 2026-07-05T09:34:16-06:00 | `git diff --check` | passed | Whitespace check passed; output only included normal Windows LF-to-CRLF notices. |
| 2026-07-05T09:36:00-06:00 | `npx --yes wrangler whoami --env-file ...` | passed | Wrangler accepted the Cloudflare API token from the secure master environment file. Token values were not printed or documented. |
| 2026-07-05T09:36:40-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash b4daec6... --commit-message "Add public impact insight panel" --env-file ...` | passed | Cloudflare deployed the `main` branch production build and returned deployment URL `https://cd2c5112.ai-task-router.pages.dev`. |
| 2026-07-05T09:37:10-06:00 | Hosted asset smoke | passed | `https://ai-task-router.pages.dev/`, `manifest.webmanifest`, `service-worker.js`, `/pwa/icon-192.png`, and `/pwa/icon-512.png` returned HTTP 200 with expected content types. |
| 2026-07-05T09:37:10-06:00 | `npx --yes wrangler pages deployment list --project-name ai-task-router --env-file ...` | passed | Latest production deployment reported branch `main`, source `b4daec6`, deployment `https://cd2c5112.ai-task-router.pages.dev`. |
| 2026-07-05T09:38:40-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test` | passed | Production URL passed the 6 Chromium E2E tests, including the impact insight assertion and no-execution boundary checks. |
| 2026-07-05T09:39:00-06:00 | Hosted Chromium impact smoke | passed | Production app title was `AI Task Router | Guided AI Labs`, first heading was `AI Task Router`, the impact panel rendered, the guarantee caveat was visible, initial load observed 0 external requests, and desktop width had no horizontal overflow. |

## Known Gaps

- The public impact panel uses a reviewed source snapshot from 2026-07-05; provider pricing and model disclosures can change.
- The panel is not an opt-in user-specific savings calculator.
- The app does not fetch live pricing or provider usage history.
- Exact per-user savings, carbon, water, or bill-reduction claims remain held until a separate source refresh, owner review, and release evidence pass.
- Social launch posts have not been created.
- Public desktop downloads remain blocked by signing/notarization, checksums, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner approval.
- No custom app domain or DNS change has been made; the app still uses the Cloudflare Pages URL.
- Cloudflare Pages is still not connected to GitHub; D16 used the accepted direct-upload process.

## Rollback

Cloudflare web rollback:

1. In Cloudflare Pages, roll production back from deployment `cd2c5112-e554-407f-a631-114fc189651c` to previous production deployment `80545680-27ea-46cc-9cc1-9bfdf82b2eb8`, or deploy a corrected `dist/` artifact to `main`.
2. In Git, revert `b4daec6` to remove the public impact insight panel and source-link allowlist if the issue is content or UX related.
3. If the app URL becomes unhealthy while the hub stays healthy, remove or disable the Old Skool AI online-app CTA until the app rollback is complete.

No database, credentials, provider accounts, user records, or external integrations are changed by D16.

## Handoff

D16 is task complete. The public online app now includes the impact insight in Best Options and a lightweight skill-building cue on Start Here.

The next bounded chunk can be owner-reviewed social/video launch copy using the now-public safe framing, a reviewed public methodology page, a future opt-in local estimator UI, or a separate desktop trust/signing chunk. Keep public desktop downloads, exact public savings claims, live pricing fetches, provider connections, DNS/custom-domain work, and social launch posts gated behind separate approval and evidence.
