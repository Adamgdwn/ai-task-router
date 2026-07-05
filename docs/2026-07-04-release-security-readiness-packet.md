# 2026-07-04 - Release And Security Readiness Packet

Document ID: AUD-ENG-001
Version: 1.1.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before public web hosting, controlled desktop beta, or social link launch
Timestamp: 2026-07-04T19:34:29-06:00
Last Updated: 2026-07-04T20:35:49-06:00

## Purpose

This packet records the D7 release and security readiness decision before AI Task Router is linked from public websites or offered as a desktop download.

D7 does not publish the app, upload artifacts, change DNS, create a GitHub Release, enable an updater, add telemetry, sign installers, or distribute the D6 unsigned installer.

## Scope

In scope:

- public web/PWA distribution planning
- GitHub release and repository readiness planning
- Cloudflare Pages and custom-domain readiness planning
- cybersecurity gate for the hosted browser/PWA app
- cybersecurity gate for future desktop beta installers
- social-link launch guardrails for YouTube, Facebook, and LinkedIn

Out of scope:

- production deploy
- DNS changes
- public download links
- code signing
- updater setup
- provider API calls
- account connections
- telemetry
- broad local filesystem access
- external security claims without evidence

## Owner Direction

The owner confirmed the preferred public path on 2026-07-04:

- use GitHub as the public source/release hub
- use Cloudflare for hosting
- place links on `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com`
- share public links through YouTube, Facebook, and LinkedIn after completion and cybersecurity testing

## Executive Summary

Recommended release shape:

| Surface | Recommendation | Status |
|---|---|---|
| Hosted app | Use Cloudflare Pages as the primary public host for the web/PWA build. | Local D8 RC evidence passed; Cloudflare preview not deployed |
| Canonical URL | Use one canonical app URL and link to it from all three websites to avoid duplicate service-worker scopes and stale builds. | Decision pending |
| Existing websites | Add clear calls to action on `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com` that point to the canonical app URL. | Planned |
| GitHub | Keep the repo public and use GitHub Releases later for signed desktop artifacts, checksums, and release notes. | Planned |
| GitHub Pages | Keep as a fallback static host if Cloudflare Pages is delayed. | Fallback |
| Desktop downloads | Do not publish until signing, checksum, install/launch/uninstall smoke, local discovery smoke, and support/withdrawal checks pass. | Blocked |
| Social channels | Share only after the web release gate passes and the destination page explains browser vs desktop capabilities. | Blocked |

The safest first public release is the hosted browser/PWA version. The desktop version should remain unavailable to ordinary users until a signed Windows beta path is proven.

## Current Source Basis

Official sources reviewed for this packet:

- GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
- GitHub Pages overview: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub Pages HTTPS: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- Cloudflare Pages overview: https://developers.cloudflare.com/pages/
- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Microsoft Windows code signing options: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP WSTG: https://owasp.org/www-project-web-security-testing-guide/
- Tauri capabilities: https://v2.tauri.app/security/capabilities/
- RustSec: https://rustsec.org/

Key source implications for this project:

- GitHub Releases are appropriate for versioned release notes and downloadable artifacts, but they do not replace signing, checksums, or user trust copy.
- GitHub Pages and Cloudflare Pages both fit a static browser/PWA build, but public sites must use HTTPS and must not contain sensitive data.
- Cloudflare Pages supports custom domains through Cloudflare-managed apex domains or CNAME records for subdomains.
- Windows self-signed certificates are development/testing only, not ordinary-user distribution.
- Tauri capabilities should stay narrow; broader native access requires explicit review.
- Rust native dependencies need a RustSec-style audit before desktop public release.
- OWASP ASVS/WSTG are useful as a practical security-test frame even though this MVP has no auth or backend.

## Distribution Design

### Hosted Web And PWA

Preferred first public path:

1. Cloudflare Pages project builds from GitHub.
2. Production build command: `npm ci && npm run build`.
3. Build output directory: `dist`.
4. Canonical public app URL is attached to one Cloudflare Pages project.
5. `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com` link to the canonical app URL.
6. Social posts link to a landing/explainer page or the canonical app URL only after the release gate passes.

Recommended canonical URL options:

| Option | Pros | Tradeoff |
|---|---|---|
| `https://app.oldskoolai.com/` | Clean app-specific URL, root scope works well for PWA/service worker, does not take over the main site. | Requires subdomain DNS and cross-site links. |
| `https://oldskoolai.com/ai-task-router/` | Keeps the app visibly inside OldSkoolAI. | Requires Vite `base`, manifest `start_url`/`scope`, service-worker cache URL review. |
| `https://tools.guidedailabs.com/ai-task-router/` | Strong Guided AI Labs brand alignment. | Same subpath/service-worker review if not root. |

Recommendation: use `https://app.oldskoolai.com/` for the first public web/PWA release, then add obvious links from the three main websites.

Avoid deploying three independent copies unless there is a clear reason. Three copies create extra cache, service-worker, support, and version drift risk.

### GitHub

Use GitHub for:

- public source transparency
- tags and release notes
- signed desktop artifacts later
- checksums later
- vulnerability/security reporting route

Do not use GitHub Releases yet for:

- the D6 unsigned NSIS artifact
- public desktop downloads
- any artifact without signing and checksum evidence

### Desktop

Desktop remains a future controlled beta track.

Windows public beta remains blocked until:

- Windows Application Control/signing/trusted-path issue is resolved
- legal publisher identity is confirmed
- Windows distribution path is chosen
- installer is signed or Store/MSIX route is proven
- checksum is generated and published
- install/launch/local-discovery/clear-results/uninstall smoke tests pass
- support and withdrawal path exists

macOS and Linux remain later than Windows unless the owner changes target order.

Auto-update remains deferred. Enabling an updater requires a separate owner-approved chunk because it introduces signing keys, update trust, rollback, and compromise-response concerns.

## Cybersecurity Gate

### Web/PWA Release Gate

The hosted browser/PWA app may move to public preview only when all items pass or are explicitly accepted as a documented exception:

- clean install: `npm ci`
- dependency audit: `npm audit --audit-level=moderate`
- unit suite: `npm run test`
- production build: `npm run build`
- production preview smoke: manifest link, Apple icon, `manifest.webmanifest`, `service-worker.js`, 192px icon, 512px icon, primary pages
- browser smoke: desktop and narrow viewport
- no hidden network behavior review: no provider calls, telemetry, upload, remote sync, or feedback analytics
- no secret check: repo and public build contain no `.env`, credentials, tokens, private keys, or signing material
- service-worker review: same-origin app shell only, no background sync, push, upload, analytics, or local discovery claim
- public copy review: browser app says it cannot check the computer; desktop app required for that
- Cloudflare/GitHub hosting preview uses HTTPS
- rollback plan: previous Cloudflare Pages deployment or prior static artifact can be restored, and public links can be withdrawn

Recommended but not blocking for the first public preview:

- Playwright E2E suite for Start Here, My AI Tools, My Task, Best Options, Decision Card, Copy-Ready Prompts, and Past Choices
- CodeQL or Semgrep static scan
- GitHub secret scanning/push protection enabled where available
- dependency update plan through Dependabot

### Desktop Beta Gate

The desktop app may move to controlled beta only when all items pass or are explicitly accepted by the owner as a beta exception:

- Windows Application Control/signing/trusted-path blocker resolved without weakening security silently
- signed Windows installer or approved Store/MSIX path
- `Get-AuthenticodeSignature` shows trusted signing status where applicable
- `npm run desktop:artifacts` produces SHA-256 for each artifact
- checksums are published beside artifacts
- install smoke passes on a clean Windows machine
- launch smoke passes
- local discovery smoke passes for selected tools
- clear-results smoke passes
- uninstall smoke passes
- D4/D6 native permission boundaries reviewed against `docs/tool-permission-matrix.md`
- Tauri capability file still has no broad filesystem, shell, process, upload, updater, credential, telemetry, or database plugin permissions
- `cargo audit` or equivalent RustSec advisory scan passes or findings are accepted
- Defender or equivalent malware scan does not flag the artifact
- beta release notes, privacy/local-access note, known limits, support route, and withdrawal plan exist

Do not run a public beta with unsigned direct-download installers for ordinary users.

## Release Copy Requirements

The public web page or product page must say, plainly:

- The browser version uses what you type or choose in the app.
- The browser version does not connect to AI accounts.
- The browser version does not upload files or inspect the computer.
- Checking the computer requires the desktop app.
- Desktop checking is user-started and limited to selected local AI tools.
- The app makes recommendations and prompt packages; it does not act for the user.

Desktop download pages must also include:

- publisher name
- version
- release date
- checksum
- supported OS
- signing/notarization status
- install and uninstall notes
- what the local check can and cannot inspect
- support/vulnerability reporting route
- known limitations

## Blockers

| Blocker | Impact | Next move |
|---|---|---|
| Cloudflare Pages preview and HTTPS smoke have not run. | Do not launch public links or social links yet. | Create Cloudflare Pages preview, verify HTTPS, PWA metadata, service-worker scope, and browser-vs-desktop copy. |
| Canonical public URL not final. | Vite base, manifest scope, service worker, and links may need different settings. | Owner chooses root subdomain vs subpath before deployment. |
| Windows Application Control still blocks unsigned executable/test runs. | Desktop discovery smoke cannot be claimed on current lab setup. | Resolve through approved lab policy, signing, or trusted path. |
| Desktop installer is unsigned. | Not suitable for ordinary-user download. | Choose Store/MSIX or direct signing path, then sign before beta. |
| Legal publisher identity not final. | Signing, Store identity, user trust copy, and website copy could diverge. | Confirm legal publisher name before signing. |
| Security reporting route is basic. | Public users need a clear vulnerability path. | `SECURITY.md` exists; enable GitHub private vulnerability reporting where available before public launch. |

## D7 Decision

D7 status: Task complete as a readiness packet.

Release decision: hold.

Reason: The public web path is promising but still needs E2E/security release evidence, and the desktop path remains blocked by signing and Application Control issues.

Recommended next sequence:

1. Complete Chunk Fifteen E2E fixtures for the web MVP.
2. Run D8 Web Release Candidate And Cybersecurity Pass against a local/preview build.
3. Configure Cloudflare Pages preview without adding public social links.
4. Choose the canonical URL.
5. Launch the hosted browser/PWA when the release gate passes.
6. Continue desktop signing/App Control work separately before any desktop beta.

## D8 Decision

D8 status: Task complete as a web release-candidate security pass, with release hold.

Decision packet:

- [Web Release Candidate Security Pass](2026-07-04-web-release-candidate-security-pass.md)

Release decision: hold.

Reason: The browser/PWA artifact passed local release-candidate checks, but Cloudflare Pages preview hosting, HTTPS behavior, custom-domain behavior, and owner canonical URL confirmation are not verified yet.

D8 result:

- Added `npm run scan:web-rc` for repeatable production artifact checks.
- Clean install, dependency audit, script tests, unit tests, production build, production artifact scan, Playwright E2E, and local production-preview smoke passed.
- Cloudflare Pages preview configuration and rollback checklist are documented.
- Public website links, social launch, GitHub Releases, DNS changes, Cloudflare production deployment, desktop downloads, signing, updater, telemetry, provider connections, and external actions remain out of scope.

Recommended next sequence:

1. Confirm `https://app.oldskoolai.com/` or choose a subpath alternative.
2. Create a Cloudflare Pages preview from GitHub with build command `npm ci && npm run build` and output directory `dist`.
3. Smoke test the HTTPS preview and public copy.
4. Attach the canonical URL only after preview passes.
5. Add public links from the three existing websites only after custom-domain smoke passes.
6. Share through YouTube, Facebook, and LinkedIn only after the owner makes the launch decision.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-04T19:34:29-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D7 docs work. |
| 2026-07-04T19:34:29-06:00 | official source review | passed | GitHub, Cloudflare, Microsoft, OWASP, Tauri, and RustSec sources reviewed for current release/security planning. |
| 2026-07-04T19:41:25-06:00 | `npm run test`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Unit suite passed with 12 files and 88 tests; audit found 0 vulnerabilities; governance reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T20:27:56-06:00 | `npm ci`; `npm audit --audit-level=moderate`; `npm run test:scripts`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `npx playwright test`; local production preview smoke | passed with existing build warning | D8 local web RC pass completed. Clean install passed after stale repo-owned Vite dev/preview servers were stopped; audit found 0 vulnerabilities; script tests passed 4 tests; Vitest passed 12 files and 88 tests; build passed with the existing chunk-size warning; web RC scan passed; Playwright passed 6 Chromium tests; production preview served root, manifest, icons, and service worker. |
| 2026-07-04T20:35:49-06:00 | D8 close-out validation | passed | Governance preflight, dependency audit, script tests, unit tests, production build, web RC scan, Playwright E2E, and whitespace check all passed; build retained the existing chunk-size warning only. |

## Handoff

Do not publish the D6 unsigned NSIS installer.

Resume with Cloudflare Pages preview configuration if the priority is hosted release engineering. Resume with Chunk Sixteen if the owner wants MVP polish and documentation tightened before hosted preview. Public launch remains held until HTTPS preview, canonical URL, custom-domain smoke, and owner launch decision pass.
