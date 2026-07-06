# 2026-07-04 - Public Launch Master Plan

Document ID: PATH-ENG-005
Version: 0.8.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before social launch posts, canonical-domain DNS work, public GitHub Releases, or desktop download buttons
Last Updated: 2026-07-06T14:08:49-06:00
Status Updated: 2026-07-06T14:08:49-06:00

## Purpose

This plan gives AI Task Router one controlled path from current release-candidate work to public distribution.

It exists to prevent improvised launch work. The public release should move through visible lanes, gates, and owner decisions instead of mixing website changes, Cloudflare production, GitHub Releases, desktop signing, cybersecurity checks, and social sharing in one loose push.

## Current State

As of 2026-07-06T13:39:30-06:00:

- The browser/PWA MVP is live and link-ready at `https://ai-task-router.pages.dev/`.
- The Old Skool AI public hub is live at `https://oldskoolai.com/ai-task-router/`.
- The public security route is live at `https://oldskoolai.com/security/`.
- Guided AI Labs and Guided AI Journey now link to the Old Skool AI hub.
- Cloudflare Pages preview exists at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- The preview is historical smoke evidence only and is not the public canonical URL.
- The app has no backend, no Supabase requirement, no provider API calls, no external account connections, no telemetry, and no remote storage requirement.
- The browser/PWA version cannot inspect the user's computer.
- The desktop prototype has narrow permissioned local AI tool discovery through Tauri commands.
- Windows technical-preview packaging was locally verified, but the installer and executable are unsigned.
- macOS and Linux technical-preview artifact workflows are ready, but remote artifacts have not been generated in this repo yet.
- D17 adds [Desktop Download Readiness Gate](2026-07-05-desktop-download-readiness-gate.md), making artifact/checksum checks repeatable and making the public desktop gate fail until trust evidence exists.
- D18 adds [Public Stage Guidance Cloudflare Update](2026-07-05-public-stage-guidance-cloudflare-update.md), adding compact suggested stages with recommended help beside each stage to the public app and redeploying Cloudflare Pages production.
- D19 adds [Public PDF Report Cloudflare Update](2026-07-05-public-pdf-report-cloudflare-update.md), adding PDF-ready saved Decision Card reports to the public app and redeploying Cloudflare Pages production.
- D20 adds [Desktop Public Distribution Decision](2026-07-06-desktop-public-distribution-decision.md), recommending Windows Store/MSIX first and tightening the public desktop gate around a real evidence manifest.
- D21 adds [Windows MSIX Proof](2026-07-06-windows-msix-proof.md), creating a repeatable self-signed MSIX proof and workflow artifact path while keeping public desktop downloads held.
- Public desktop downloads remain held until signing/notarization, checksums, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner approval pass.
- The owner preference is one Old Skool AI public hub/tab, with `guidedailabs.com` and `guidedaijourney.com` linking to that hub.
- D12 adds the [Old Skool AI Hub Handoff Package](2026-07-04-old-skool-ai-hub-handoff.md), including page structure, plain-language copy, cross-site link instructions, held desktop-download copy, and rollback notes.
- D13 adds the [Cloudflare Production Launch Smoke](2026-07-05-cloudflare-production-launch-smoke.md), selecting the Cloudflare Pages production URL and validating it with hosted smoke.
- D14 adds the [Public Hub And Cross-Site Link Smoke](2026-07-05-public-hub-and-cross-site-link-smoke.md), publishing and smoking the Old Skool AI hub, public security route, and cross-site links.

## Launch Principles

1. Use one public product doorway.
2. Keep web/PWA and desktop release gates separate.
3. Do not publish ordinary-user desktop downloads until trust gates pass.
4. Do not create three independent app deployments unless service-worker scope, support, analytics posture, and rollback are explicitly designed.
5. Keep the MVP local-first and recommendation-only.
6. Do not add provider account connections, telemetry, remote sync, file indexing, broad filesystem access, or execution workflows during launch work.
7. Every public link must have a rollback or removal path.
8. Every public claim must match the current capability boundary.

## Recommended First Public Shape

Recommended public information architecture:

1. `oldskoolai.com` gets the primary AI Task Router tab/page.
2. That page explains the tool in plain language and provides the online launch button.
3. `guidedailabs.com` and `guidedaijourney.com` link to the Old Skool AI page.
4. The Old Skool AI page eventually contains desktop download choices, but the public desktop buttons stay hidden or disabled until desktop gates pass.
5. The online app runs from one Cloudflare Pages-backed app destination.

Recommended app URL decision for first public release:

- Prefer a Cloudflare Pages-backed root app destination or owned subdomain once DNS is deliberately approved and smoked.
- Avoid a subpath-hosted PWA for the first public release unless Vite `base`, manifest `start_url`/`scope`, service-worker cache paths, and rollback behavior are explicitly retested.
- If speed matters more than branded URL polish, a Cloudflare Pages production URL can be used as the initial online app destination while Old Skool AI remains the friendly public doorway.

## Release Lanes

| Lane | Current state | Public outcome | Gate |
|---|---|---|---|
| Public hub | Live and smoked on Old Skool AI | Old Skool AI page/tab explains the tool and links to the online app | Complete for web doorway; social remains separate |
| Hosted web/PWA | Production URL deployed and smoked | People can use the tool online for free | Complete for Cloudflare Pages default URL; custom domain remains separate |
| Windows desktop | Local unsigned NSIS technical preview and self-signed MSIX proof exist; D20 recommends Store/MSIX first | Store/MSIX download first, direct signed installer as fallback | Publisher identity, Partner Center/MSIX path, final package identity, Store/signing evidence, Application Control smoke, install/launch/uninstall smoke |
| macOS desktop | Workflow-ready, not generated | Signed and notarized DMG | Apple Developer ID, notarization, smoke |
| Linux desktop | Workflow-ready, not generated | AppImage and/or `.deb` download | Linux smoke, checksum/signature decision, dependency notes |
| Public support | Public security page exists on Old Skool AI | Users know where to report security/support issues | Complete for web doorway; withdrawal plan remains in D12/D14 rollback notes |

## Phase Plan

### Phase 0 - Master Plan Baseline

Status: current D11 planning chunk

Outcome:

- one public-launch plan exists
- open decisions are visible
- release lanes and gates are separated
- next chunks can be executed without guessing

Completion target:

- Task complete

### Phase 1 - Old Skool AI Hub Handoff

Status: complete as of D12; published and smoked as of D14; see [Old Skool AI Hub Handoff Package](2026-07-04-old-skool-ai-hub-handoff.md) and [Public Hub And Cross-Site Link Smoke](2026-07-05-public-hub-and-cross-site-link-smoke.md).

Goal:

Prepare the Linux-side website instructions for the Old Skool AI product tab/page and cross-site links.

In scope:

- page structure
- plain-language launch copy
- online-app button placeholder
- desktop-download copy with safe hold state
- links from Guided AI Labs and Guided AI Journey back to Old Skool AI
- rollback/removal instructions

Out of scope:

- DNS changes
- public desktop download links
- social launch
- provider account connections
- telemetry or lead capture

Acceptance criteria:

- [x] Old Skool AI page content distinguishes online app from future desktop app.
- [x] Copy says the browser version does not check the user's computer.
- [x] Desktop download area says downloads are coming after signing and safety checks, unless a separate owner-approved technical-preview exception is recorded.
- [x] The other two sites link to the Old Skool AI hub rather than hosting separate copies.

### Phase 2 - Cloudflare Production Path Decision

Status: complete as of D13; first production URL is `https://ai-task-router.pages.dev/`.

Goal:

Choose the hosted app release path before production promotion.

Decision options:

| Option | Pros | Tradeoffs | Recommendation |
|---|---|---|---|
| Cloudflare Pages production URL | Fastest, clean rollback, no DNS delay | Less branded | Good first production candidate if owner accepts |
| Owned subdomain | Branded and clean | Needs DNS/custom-domain smoke | Good public target after explicit DNS approval |
| Old Skool AI subpath | Feels integrated | Requires Vite/PWA/service-worker path retest | Defer unless specifically preferred |
| Embedded iframe | Keeps user on Old Skool AI page | PWA install and service-worker behavior can be confusing | Avoid for the app itself |

Recommended default:

Use the Old Skool AI hub as the public doorway and link to one Cloudflare Pages-backed app destination. Prefer a production Pages URL or explicitly approved owned subdomain over a subpath for the first public release.

### Phase 3 - Hosted Web/PWA Public Release Gate

Status: complete for the Cloudflare Pages default URL as of D13. Public website links and social launch remain separate gates.

Goal:

Promote the online app only after the public URL behaves correctly.

Required checks:

- `bash scripts/governance-preflight.sh`
- `npm ci`
- `npm audit --audit-level=moderate`
- `npm run test:scripts`
- `npm run test`
- `npm run build`
- `npm run scan:web-rc`
- `npx playwright test`
- hosted `PLAYWRIGHT_BASE_URL=<canonical-url> npx playwright test`
- browser smoke on desktop and narrow mobile viewport
- manifest, PWA icons, service worker, and install copy over HTTPS
- no hidden external requests during first load
- browser copy says local computer checking requires the desktop app
- rollback to previous Pages deployment confirmed
- owner launch approval recorded

Hold conditions:

- canonical URL not selected
- service-worker scope mismatch
- hidden external request found
- security scan or audit failure
- hosted E2E failure
- public copy overclaims local discovery
- rollback not understood

### Phase 4 - Desktop Trust And Signing Readiness

Goal:

Turn technical-preview desktop builds into trusted public download candidates.

Shared desktop prerequisites:

- canonical desktop product name
- legal publisher name
- support/vulnerability reporting route
- local-access privacy page
- withdrawal plan for bad artifacts
- install, launch, local discovery, clear-results, and uninstall smoke matrix
- checksum policy
- `npm run desktop:gate:technical-preview` and `npm run desktop:gate:public` evidence
- public release notes
- public release evidence at `docs/release/desktop-public-release-evidence.json`

Windows gates:

- use Microsoft Store/MSIX first unless the owner deliberately switches to direct signing
- confirm Microsoft Partner Center and legal publisher identity
- create or generate a reviewable MSIX package identity
- verify package type matches the selected Windows lane
- obtain or configure code-signing path
- sign installer and executable
- verify signature
- document WebView2 runtime handling
- pass install/launch/uninstall smoke on target Windows machine
- resolve lab Application Control/trusted-path blocker before claiming interactive desktop smoke

macOS gates:

- choose Apple Developer account ownership
- configure Developer ID signing
- notarize DMG/app
- verify Gatekeeper behavior
- pass install/launch/uninstall smoke on Apple Silicon and Intel where advertised

Linux gates:

- choose AppImage only, or AppImage plus `.deb`
- run Linux package workflow on matching runner
- verify checksums
- decide whether to GPG-sign checksums
- document dependencies and uninstall steps
- pass install/launch/uninstall smoke on target distribution

### Phase 5 - Controlled Desktop Beta

Goal:

Allow a small technical audience to test signed or clearly bounded desktop builds.

Entry criteria:

- technical-preview exception or signing gates recorded
- users know what is and is not trusted
- artifacts can be withdrawn
- checksums published for beta users
- feedback/support route exists

Exit criteria:

- install issues are triaged
- local discovery behavior is verified
- no broad filesystem access was added
- no telemetry or external upload was added
- release notes and known limits are updated

### Phase 6 - Public Desktop Downloads

Goal:

Publish ordinary-user download buttons only after platform trust evidence exists.

Required public page behavior:

- download buttons are platform-specific
- checksums are visible or linked
- version is visible
- signing/notarization status is true and plain
- privacy/local-access copy is linked
- support and vulnerability route is linked
- withdrawal notice path exists

Hold conditions:

- unsigned Windows direct installer
- unnotarized macOS download for ordinary users
- Linux artifact not smoke tested
- no checksum
- no support/withdrawal path
- owner has not approved public desktop launch

## Cybersecurity And Trust Checklist

### Web/PWA

- no secrets in repo or build artifact
- no service-role keys or provider API keys
- no auth claims
- no hidden external requests on first load
- no telemetry
- no backend data retention claims
- IndexedDB/local-only storage language remains accurate
- service worker is same-origin and production-only
- dependency audit is clean or exceptions are recorded
- Playwright E2E passes against hosted URL

### Desktop

- Tauri capability permissions remain narrow
- local discovery uses custom commands, not arbitrary shell execution
- no startup/background scanning
- no user-supplied path scanning without separate approved chunk
- no returned local file paths in normal UI
- model names remain hidden by default unless user chooses detail
- signing/notarization evidence exists where applicable
- generated artifacts have checksums
- install/uninstall behavior is verified
- user-facing copy explains what the app can inspect

## Website Copy Requirements

Old Skool AI hub copy should be plain and non-technical.

It should say:

- what the tool helps people do
- that it runs in the browser for normal planning
- that the browser version stores work locally on the user's device
- that desktop checking is a separate installable app
- that desktop downloads will appear after signing and safety checks
- that no AI provider accounts are connected by the current MVP
- that no files are uploaded by the current MVP

It should not say:

- source permissions
- policy defaults
- routing engine
- raw scores
- model tier
- technical preview as if it were safe for ordinary users
- computer scanning from the browser

## Public Go/No-Go Board

| Gate | Owner | Status | Evidence needed |
|---|---|---|---|
| Old Skool AI hub route chosen | Project Owner | complete | D14 published and smoked `https://oldskoolai.com/ai-task-router/` |
| Canonical online app URL chosen | Project Owner | complete | D13 selected and smoked `https://ai-task-router.pages.dev/` |
| Cloudflare release process chosen | Technical Lead / Project Owner | complete for D13 | Wrangler direct-upload production release recorded; GitHub integration remains future hardening |
| Web/PWA release gate | Technical Lead | passed for Pages URL | D13 reran local and hosted checks against `https://ai-task-router.pages.dev/` |
| Public copy review | Project Owner | complete for web doorway | D14 published the D12 copy with the D13 app URL and public smoke passed |
| Support/security route | Project Owner / Technical Lead | complete for web doorway | D14 published and linked `https://oldskoolai.com/security/`; repo `SECURITY.md` remains the code/reporting policy |
| Desktop product name | Project Owner | working default | D20 keeps `AI Task Router`; owner can still change before signing |
| Desktop legal publisher | Project Owner | pending | Publisher identity recorded before signing |
| Windows trust path | Project Owner / Technical Lead | Store/MSIX-first selected | D20 recommends Store/MSIX first; direct signed installer remains fallback |
| macOS trust path | Project Owner / Technical Lead | pending | Developer ID/notarization path |
| Linux trust path | Technical Lead | pending | artifact set, checksums/signature, smoke |
| Desktop artifact gate | Technical Lead | public evidence gate added | D17 validates artifacts/checksums; D20 requires real public release evidence before public mode can pass |
| Social launch | Project Owner | next decision | Web doorway is live and smoked; social copy/review remains a separate owner-approved chunk |
| Public desktop downloads | Project Owner | held | Only after desktop gates pass |

## Immediate Next Chunk Recommendation

Run one of the next bounded chunks:

- owner-approved social launch copy/review for YouTube, Facebook, and/or LinkedIn
- desktop trust/signing readiness for future ordinary-user downloads
- Cloudflare/GitHub release hardening or custom-domain planning, only if explicitly approved

Keep desktop download buttons hidden or disabled until desktop gates pass. Do not create public GitHub Releases, custom-domain/DNS changes, social launch posts, or public desktop artifact links without a separate approved chunk.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T10:07:48-06:00 | D17 desktop download readiness gate | passed with public download hold | Added artifact/checksum gate scripts, tests, and workflow step; fresh Windows technical-preview package passed artifact hygiene with SHA-256 `F7086F7F4D87379111F81FC9F839C88C566B46C3F1E931280DBE1E18E4CD80B4`; public desktop gate failed as expected until platform trust evidence exists. |
| 2026-07-05T10:49:02-06:00 | D18 public suggested-stage guidance | passed | Added route-card stage guidance, Best Options and Decision Card UI, Markdown export, tests, local/hosted smoke, and Cloudflare production deployment `98a58ca6` from source `9d3154d`. |
| 2026-07-05T11:12:24-06:00 | D19 public PDF reports | passed | Added shared impact panel, saved Decision Card impact context, `Save PDF report`, print CSS, focused/full tests, local/hosted PDF-report smoke, and Cloudflare production deployment `49d21829` from source `9c870ce`. |
| 2026-07-06T13:55:02-06:00 | D20 desktop public distribution decision | passed with public download hold and existing build warning | Refreshed Microsoft, Apple, and Tauri source basis; selected Windows Store/MSIX-first as the recommended first trusted Windows lane; added a hold-state public release evidence template; tightened `npm run desktop:gate:public` so it fails until real platform trust evidence exists; full close-out validation passed with 10 Node script tests, 13 Vitest files and 96 tests, production build, 0 audit vulnerabilities, 0 governance warnings, technical-preview gate pass, expected public gate failure, and whitespace check notices only for normal Windows LF-to-CRLF conversion. |
| 2026-07-06T14:08:49-06:00 | D21 Windows MSIX proof | passed with public download hold and existing build warning | Installed Microsoft WinApp CLI 0.4.0 locally, generated MSIX manifest/assets, added repeatable MSIX proof packaging and workflow support, built a self-signed local MSIX proof with SHA-256 `6668983AE21279E918F1DE6A34E37369E0A6B0BF3E78D0827CF0C0A6AD80EDCD`, verified package contents/signature status, passed technical-preview gate, and confirmed public gate still fails until real release evidence exists. |
| 2026-07-05T07:57:15-06:00 | D14 public hub and cross-site link smoke | passed | Old Skool AI hub, public security route, Guided AI Labs link, and Guided AI Journey link were published and smoked on desktop/mobile; public pages returned 200 and no D9 preview alias or public desktop artifact strings were found. |
| 2026-07-05T07:22:04-06:00 | D13 local and hosted web/PWA release gate | passed | Cloudflare Pages production URL `https://ai-task-router.pages.dev/` was deployed and smoked; local and hosted Playwright passed; production assets returned 200; Windows `curl.exe` and PowerShell returned 200; Chromium smoke found service-worker scope at the production root and 0 observed external requests. |
| 2026-07-04T22:30:30-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; release-boundary `rg` scans; D12 handoff presence scan | passed | Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; scans found no stale D12-not-created wording and only historical or negative-boundary references for preview URLs, unconfirmed app subdomain, and premature desktop-download claims; D12 handoff doc exists and names D13 as the next release-engineering chunk. No app/runtime tests were run because D12 changed documentation and release-control notes only. |
| 2026-07-04T22:10:36-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; text scan for unconfirmed URL and premature desktop-download claims | passed | Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; text scan found only correction/negative-boundary references for `app.oldskoolai.com`, "public desktop downloads are ready", and "safe to install". |
| 2026-07-04T22:03:36-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D11 planning work. |

## Handoff

D14 has deployed and smoked the browser/PWA production app plus the public Old Skool AI hub and cross-site links. D16, D18, and D19 redeployed the production app with impact, suggested-stage guidance, and PDF-ready saved Decision Card reports. D17 adds a desktop artifact readiness gate for technical-preview builds. D20 selects Windows Store/MSIX first and adds a real public evidence gate for desktop downloads. D21 adds a self-signed MSIX proof and workflow support. These chunks did not change DNS, connect Cloudflare production to GitHub, create GitHub Releases, publish trusted signing evidence, notarize macOS artifacts, create social posts, add provider connections, or add public desktop download links.

The next safest execution chunk is social launch copy/review, a reviewed methodology/estimator chunk, or the next Windows trusted-release slice for publisher identity, Partner Center package identity, and Store submission/trusted signing evidence. Public desktop downloads should wait until platform trust gates pass or a separately documented technical-preview exception is approved.
