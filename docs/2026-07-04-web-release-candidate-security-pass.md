# 2026-07-04 - Web Release Candidate Security Pass

Document ID: AUD-ENG-002
Version: 1.0.1
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before Cloudflare production deployment, public website links, or social launch
Timestamp: 2026-07-04T20:27:56-06:00
Last Updated: 2026-07-04T20:49:44-06:00

## Purpose

This packet records Desktop Chunk D8: the web/PWA release-candidate and cybersecurity pass for AI Task Router.

D8 proves the current browser/PWA build is ready for a Cloudflare Pages preview check. It does not publish the app, change DNS, create public website links, create social posts, create a GitHub Release, upload desktop artifacts, sign installers, enable telemetry, or distribute the D6 unsigned Windows installer.

## Scope

In scope:

- clean local install evidence
- dependency audit
- unit, script, build, and Playwright validation
- production web artifact scan
- local production-preview smoke
- Cloudflare Pages preview plan
- canonical URL recommendation
- HTTPS and custom-domain check plan
- smoke matrix
- rollback checklist
- public launch go/no-go

Out of scope:

- Cloudflare project creation
- DNS changes
- public custom domain attachment
- public website link insertion
- social media launch posts
- GitHub Releases
- desktop signing, notarization, updater, or public installer publishing
- provider connections, telemetry, remote sync, uploads, file indexing, or execution workflows

## Current Source Basis

Official sources reviewed for D8:

- Cloudflare Pages Git integration: https://developers.cloudflare.com/pages/configuration/git-integration/
- Cloudflare Pages build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Cloudflare Pages preview deployments: https://developers.cloudflare.com/pages/configuration/preview-deployments/
- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare Pages rollbacks: https://developers.cloudflare.com/pages/configuration/rollbacks/
- GitHub dependency review: https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review
- GitHub secret scanning: https://docs.github.com/code-security/secret-scanning/about-secret-scanning
- GitHub Dependabot configuration: https://docs.github.com/en/code-security/concepts/supply-chain-security/about-the-dependabot-yml-file
- GitHub CodeQL code scanning: https://docs.github.com/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql
- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Web Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/

Source implications for this project:

- Cloudflare Pages can build static output from the connected GitHub repository using a configured build command and output directory.
- Preview deployments can be used to review new versions before production, but production rollback planning still needs a production deployment target.
- Cloudflare custom domains are suitable for an owner-controlled domain, including a subdomain created under a domain the owner controls. The owner has not confirmed `https://app.oldskoolai.com/` as owned or selected.
- GitHub dependency review, Dependabot, secret scanning, and CodeQL are appropriate next hardening controls, but D8 did not enable provider-side settings.
- OWASP ASVS/WSTG remain useful as the web security review frame even though the MVP has no auth, backend, payment, uploaded files, or provider APIs.

## D8 Result

Completion target: Task complete, release hold.

Result: D8 local release-candidate evidence passed. The current browser/PWA build is ready for a Cloudflare Pages preview configuration and HTTPS smoke test.

Public launch decision: hold.

Reason: Cloudflare preview hosting, HTTPS behavior, canonical URL attachment, and owner URL confirmation are still unverified. Public website links and social launch posts should wait until those checks pass.

Recommended next move:

1. Confirm the canonical public app URL from the owner-controlled domains: a root/subpath on `oldskoolai.com`, `guidedailabs.com`, or `guidedaijourney.com`, or a newly created subdomain under one of those domains if DNS control allows it.
2. Create a Cloudflare Pages preview from GitHub with build command `npm ci && npm run build` and output directory `dist`.
3. Smoke test the Cloudflare preview over HTTPS.
4. Attach the canonical domain only after preview smoke passes.
5. Add public links from `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com` after the custom-domain smoke passes.

## Release Candidate Scan

D8 added a repeatable local scan:

```bash
npm run scan:web-rc
```

The scan checks:

- high-confidence secret patterns in source and build files, without printing matching values
- unexpected external URLs in the built `dist/` artifact
- required PWA manifest fields for the root-domain release path
- 192px and 512px PWA icon entries
- service-worker guardrails: no push, background sync, import scripts, send beacon, WebSocket, EventSource, XHR, cross-origin handling, or non-GET handling

The scanner allows known static reference URLs bundled by dependencies or SVG metadata, such as React error documentation, JSON Schema references, W3C/SVG namespaces, Inkscape metadata namespaces, and similar non-runtime references. Unknown external URLs remain release-blocking.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-04T20:19:38-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D8 work. |
| 2026-07-04T20:19:38-06:00 | official source review | passed | Cloudflare Pages Git integration, build configuration, preview deployments, custom domains, rollbacks, GitHub dependency/secret scanning, Dependabot, CodeQL, OWASP ASVS, and OWASP WSTG were reviewed. |
| 2026-07-04T20:24:40-06:00 | `npm ci` | initially blocked | Windows returned `EPERM` when deleting Rolldown's native binding because stale Vite dev/preview Node processes from this repo were still running. |
| 2026-07-04T20:25:05-06:00 | stale local process cleanup | passed | Stopped only `node.exe` processes whose command line pointed at `C:\Users\adamg\01. Code Projects\agents\agent-picker`; unrelated command-center dev server was left running. |
| 2026-07-04T20:25:16-06:00 | `npm ci` | passed | Clean install added 125 packages and audited 126 packages with 0 vulnerabilities. |
| 2026-07-04T20:25:25-06:00 | `npm audit --audit-level=moderate` | passed | Audit found 0 vulnerabilities. |
| 2026-07-04T20:25:25-06:00 | `npm run test:scripts` | passed | Node script tests passed: 4 tests, including the new web release-candidate scan tests. |
| 2026-07-04T20:25:25-06:00 | `npm run test` | passed | Vitest passed: 12 files, 88 tests. |
| 2026-07-04T20:25:55-06:00 | `npm run build` | passed with existing warning | TypeScript and Vite production build passed; Vite repeated the existing chunk-size warning for a 519.84 kB JS bundle. |
| 2026-07-04T20:26:17-06:00 | `npm run scan:web-rc` | passed | Production artifact scan found no release-blocking findings. |
| 2026-07-04T20:26:17-06:00 | `npx playwright test` | passed | Playwright Chromium passed 6 tests covering fixtures, first-run setup, My AI Tools, stale migration, routing/artifacts/feedback, no-execution controls, and narrow viewport overflow. |
| 2026-07-04T20:27:56-06:00 | local production preview on `http://127.0.0.1:5185/` | passed | Root page 200; manifest link present; Apple icon link present; manifest 200 with name `AI Task Router | Guided AI Labs`, display `standalone`, start URL `/`, scope `/`; 192px and 512px icons 200; service worker 200 with install/fetch handlers and same-origin-only guard. |
| 2026-07-04T20:35:49-06:00 | close-out validation | passed | Governance preflight, dependency audit, script tests, unit tests, production build, web RC scan, Playwright E2E, and whitespace check all passed; build retained the existing chunk-size warning only. |
| 2026-07-04T20:49:44-06:00 | canonical URL owner correction | passed | Owner clarified that `https://app.oldskoolai.com/` is not owned or confirmed; the next release chunk must select an owner-controlled URL or Cloudflare Pages default URL before custom-domain work. |

## Smoke Matrix

| Surface | Status | Evidence | Follow-up |
|---|---|---|---|
| Clean install | passed | `npm ci` after stale repo-owned dev servers were stopped. | Keep old local servers stopped before future clean installs. |
| Dependency audit | passed | `npm audit --audit-level=moderate` found 0 vulnerabilities. | Add Dependabot later if owner wants automated dependency PRs. |
| Script and security tooling | passed | `npm run test:scripts`; `npm run scan:web-rc`. | Consider GitHub CodeQL/secret-scanning setup in a separate provider-settings chunk. |
| Unit tests | passed | `npm run test` ran 12 files and 88 tests. | Continue to keep business rules in unit tests. |
| Production build | passed with warning | `npm run build`; existing chunk-size warning only. | Consider code-splitting after public preview, not as a release blocker. |
| E2E workflows | passed | `npx playwright test` passed 6 Chromium tests. | Add additional browsers later if public usage warrants it. |
| Production preview metadata | passed | Local `dist/` preview served root page, manifest, icons, and service worker. | Repeat on Cloudflare Pages HTTPS preview. |
| Browser/PWA local-discovery boundary | passed locally | E2E and copy checks still show browser/PWA cannot check the computer. | Verify public copy again after Cloudflare deploy. |
| Cloudflare Pages preview HTTPS | not run | No Cloudflare project/preview URL was configured in D8. | Required before public launch. |
| Canonical app URL | pending owner decision | Owner confirmed the three root websites, but not `https://app.oldskoolai.com/`. | Owner chooses root, subpath, Cloudflare Pages default URL, or a newly created subdomain under an owned domain before deployment. |
| Existing website links | blocked | No links added to the three existing websites. | Add only after Cloudflare preview/custom-domain smoke passes. |
| Social launch | blocked | No YouTube, Facebook, or LinkedIn links created. | Add only after public web release gate passes. |
| Desktop downloads | blocked | D6 installer remains unsigned internal evidence only. | Continue signing/App Control work separately. |

## Cloudflare Pages Preview Plan

Recommended preview configuration:

| Setting | Value |
|---|---|
| Source repository | `https://github.com/Adamgdwn/ai-task-router` |
| Project name | `ai-task-router` |
| Production branch | `main`, unless the owner wants a temporary release branch first |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Node version | Use Cloudflare default if it supports the lockfile; otherwise set `NODE_VERSION=24.16.0` to match this D8 machine |
| Environment variables | None required for the browser/PWA MVP |
| Custom domain candidate | TBD: owner-confirmed domain, subpath, or subdomain under `oldskoolai.com`, `guidedailabs.com`, or `guidedaijourney.com` |

Preview smoke checklist:

- HTTPS preview URL loads with 200 status.
- `manifest.webmanifest` loads over HTTPS.
- `service-worker.js` loads over HTTPS.
- 192px and 512px PWA icons load over HTTPS.
- Start Here, My AI Tools, Choosing Style, My Task, Best Options, Decision Card, Copy-Ready Prompts, and Past Choices open normally.
- Browser/PWA copy still says computer checking requires the desktop app.
- DevTools Network panel shows no provider calls, telemetry, uploads, remote sync, or feedback analytics during the walkthrough.
- Service worker scope matches the canonical app URL path.
- If a subpath is chosen instead of root subdomain, Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links are reviewed before launch.

## Rollback Checklist

Before public links:

- If the Cloudflare preview is bad, withdraw the preview link and fix the repo before attaching a custom domain.
- No public website or social rollback is needed if no public links were shared.

After production Cloudflare deployment:

- Roll back to the previous successful production deployment in Cloudflare Pages.
- Remove or update links from `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com` if user trust, copy, or app behavior is affected.
- Do not use preview deployments as the rollback target for production; keep a known good production deployment.
- If service-worker behavior is wrong, ship a corrected build with an updated cache name or roll back to the previous good production deployment and tell affected users to reload.
- Record rollback action and reason in the active pathway and changelog.

Desktop rollback remains separate and is not covered by this web rollback path.

## Known Gaps

- Cloudflare Pages project was not created in D8.
- HTTPS preview was not checked in D8.
- Canonical URL is still recommended, not owner-confirmed.
- Public website links were not added.
- Social launch links were not created.
- GitHub provider-side CodeQL, Dependabot, dependency review, and secret scanning settings were reviewed but not enabled by D8.
- The production build still has a non-blocking Vite chunk-size warning.
- Desktop release remains blocked by signing, Windows Application Control/trusted-path, checksums, install/launch/local-discovery/uninstall smoke tests, and support/withdrawal notes.

## Handoff

Web/PWA D8 is task complete with a release hold.

The next release-engineering chunk should create a Cloudflare Pages preview, verify HTTPS and app behavior from the hosted preview, confirm the canonical URL from the owner-controlled domains, and only then decide whether to attach a custom domain/subdomain or add public links from the three existing websites.
