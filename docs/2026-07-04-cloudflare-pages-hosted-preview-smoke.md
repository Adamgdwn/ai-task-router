# 2026-07-04 - Cloudflare Pages Hosted Preview Smoke

Document ID: AUD-ENG-003
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before custom domain, public website links, or social launch
Timestamp: 2026-07-04T21:05:03-06:00
Last Updated: 2026-07-04T21:05:03-06:00

## Purpose

This packet records Desktop Chunk D9: the first Cloudflare Pages hosted preview and smoke test for AI Task Router.

D9 proves the current browser/PWA build can be hosted on Cloudflare Pages and exercised over HTTPS from a real hosted URL. It does not select the canonical public URL, attach a custom domain, change DNS, add public links from the three websites, create social launch posts, create a GitHub Release, publish desktop artifacts, sign installers, enable telemetry, or distribute the D6 unsigned Windows installer.

## Scope

In scope:

- validate Cloudflare account access from the master environment file without printing secrets
- create or reuse a Cloudflare Pages project
- deploy the current `dist/` build to a preview branch
- smoke test the hosted preview over HTTPS
- run hosted Playwright E2E against the preview
- record release hold, gaps, and rollback path

Out of scope:

- custom domain or DNS changes
- public production launch
- links from `oldskoolai.com`, `guidedailabs.com`, or `guidedaijourney.com`
- YouTube, Facebook, or LinkedIn launch posts
- GitHub Releases or desktop downloads
- provider API calls, telemetry, uploads, external actions, remote sync, authentication, or credential storage

## Result

Completion target: Task complete, release hold.

Result: Cloudflare Pages hosted preview is live and passed hosted smoke and E2E checks.

Public launch decision: hold.

Reason: The preview works, but the canonical public URL is not selected, no custom domain has been attached or smoked, the Cloudflare Pages project is not connected to GitHub yet, and no owner launch decision has been made.

## Preview Details

| Item | Value |
|---|---|
| Cloudflare Pages project | `ai-task-router` |
| Project domain | `ai-task-router.pages.dev` |
| Production branch | `main` |
| Git provider | Not connected yet |
| Deployment type | Wrangler direct upload from local `dist/` |
| Deployment environment | Preview |
| Preview branch | `preview-20260704-0c7b253` |
| Commit | `0c7b253` |
| Preview URL | `https://preview-20260704-0c7b253.ai-task-router.pages.dev` |
| Deployment URL | `https://d1f402b0.ai-task-router.pages.dev` |
| Functions | None |
| Preview environment variables | None |

The root project URL `https://ai-task-router.pages.dev/` does not yet have a production deployment and returned 404 during smoke. Use the preview URL above for testing until a production/canonical URL is selected.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-04T20:58:04-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before Cloudflare provider work. |
| 2026-07-04T20:58:04-06:00 | Cloudflare token/account check | passed | Wrangler accepted the account API token from the master environment file. Token values were not printed or documented. |
| 2026-07-04T20:58:04-06:00 | `npx --yes wrangler pages project list` | passed | No existing Pages projects were listed before creation. |
| 2026-07-04T21:05:03-06:00 | `npm run build` | passed with existing warning | TypeScript and Vite production build passed; Vite repeated the existing 519.84 kB chunk-size warning. |
| 2026-07-04T21:05:03-06:00 | `npm run scan:web-rc` | passed | Production artifact scan found no release-blocking findings before deployment. |
| 2026-07-04T21:05:03-06:00 | `npx --yes wrangler pages project create ai-task-router --production-branch main` | passed | Created Cloudflare Pages project `ai-task-router`. |
| 2026-07-04T21:05:03-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch preview-20260704-0c7b253` | passed | Uploaded 9 files and created the preview deployment. |
| 2026-07-04T21:05:03-06:00 | Cloudflare Pages deployment API check | passed | Latest deployment reported `preview` environment, successful deploy stage, no env vars, no Functions, branch `preview-20260704-0c7b253`, commit `0c7b253`. |
| 2026-07-04T21:05:03-06:00 | Node HTTPS hosted asset check | passed | Preview root, `manifest.webmanifest`, `service-worker.js`, `/pwa/icon-192.png`, and `/pwa/icon-512.png` returned 200; icons returned `image/png`. |
| 2026-07-04T21:05:03-06:00 | Chromium hosted smoke | passed | Playwright/Chromium loaded the preview, title `AI Task Router \| Guided AI Labs`, first `h1` `AI Task Router`, manifest link `/manifest.webmanifest`, service worker registered, and observed 0 external requests during load. |
| 2026-07-04T21:05:03-06:00 | `npx playwright test` | passed | Local E2E path still passed 6 Chromium tests after adding hosted-base-url support. |
| 2026-07-04T21:05:03-06:00 | `PLAYWRIGHT_BASE_URL=https://preview-20260704-0c7b253.ai-task-router.pages.dev npx playwright test` | passed | Hosted Cloudflare preview passed the same 6 Chromium E2E tests. |
| 2026-07-04T21:05:03-06:00 | `npm audit --audit-level=moderate` | passed | Audit found 0 vulnerabilities. |
| 2026-07-04T21:05:03-06:00 | `npm run test:scripts` | passed | Node script tests passed 4 tests. |
| 2026-07-04T21:05:03-06:00 | `npm run test` | passed | Vitest passed 12 files and 88 tests. |
| 2026-07-04T21:05:03-06:00 | `npm run build`; `npm run scan:web-rc` | passed with existing warning | Final production build and artifact scan passed after the Playwright config change; build retained the existing chunk-size warning only. |

## Smoke Notes

- Hosted Chromium E2E confirms Start Here, My AI Tools, My Task, Best Options, Decision Card, Copy-Ready Prompts, Past Choices, no-execution controls, local-store migration, and narrow-viewport layout still work from the Cloudflare preview.
- The hosted preview made no observed external requests during the Chromium load smoke.
- The manifest uses root `start_url` and `scope`, matching the preview subdomain/root hosting shape.
- The service worker registered from the hosted preview.
- The browser/PWA boundary remains unchanged: browser users cannot check the computer; local AI tool discovery remains a desktop-only path.

## Caveats

- The Pages project is not connected to GitHub yet. This D9 preview used Wrangler direct upload from local `dist/`, so future production release still needs either GitHub integration or a documented direct-upload release process.
- Windows `curl.exe` and PowerShell `Invoke-WebRequest` hit a TLS handshake failure against the preview alias (`SEC_E_ILLEGAL_MESSAGE` / SSL connection failure), while Node HTTPS/fetch and Chromium succeeded over HTTPS. Treat this as a follow-up verification item for another Windows browser/client and the eventual custom domain before public launch.
- The first icon smoke used old `/icons/...` paths and correctly returned the SPA HTML fallback; the actual manifest icon paths are `/pwa/icon-192.png` and `/pwa/icon-512.png`, and those returned `image/png`.
- No production deployment exists at `https://ai-task-router.pages.dev/` yet; it returned 404 during smoke.

## Rollback

Before public links:

- Delete the preview deployment or Cloudflare Pages project if the preview should be withdrawn.
- No public website or social rollback is needed because no public links were added.
- Fix the repo and redeploy a new preview branch if hosted smoke regresses.

After a future production/custom-domain launch:

- Roll back to a previous successful Cloudflare Pages production deployment.
- Remove or update links from `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com` if user trust, copy, or app behavior is affected.
- If service-worker behavior is wrong, ship a corrected build with an updated cache name or roll back to the previous good production deployment and tell affected users to reload.

## Known Gaps

- Canonical public app URL is still not selected.
- Custom domain/subdomain has not been attached or smoke tested.
- GitHub integration is not connected to the Cloudflare Pages project yet.
- Public website links were not added.
- Social launch links were not created.
- GitHub Releases were not created.
- Desktop release remains blocked by signing, Windows Application Control/trusted-path, checksums, install/launch/local-discovery/uninstall smoke tests, and support/withdrawal notes.

## Handoff

D9 is task complete with a release hold.

Next release-engineering chunk should choose the canonical public URL and decide whether to connect Cloudflare Pages to GitHub before production. Prefer a root app subdomain or the Cloudflare Pages default URL for the PWA path; if a subpath is chosen, review Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links before release.
