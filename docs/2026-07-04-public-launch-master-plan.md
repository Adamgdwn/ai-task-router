# 2026-07-04 - Public Launch Master Plan

Document ID: PATH-ENG-005
Version: 0.1.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before public Old Skool AI links, canonical-domain DNS work, public GitHub Releases, or desktop download buttons
Last Updated: 2026-07-04T22:10:36-06:00
Status Updated: 2026-07-04T22:10:36-06:00

## Purpose

This plan gives AI Task Router one controlled path from current release-candidate work to public distribution.

It exists to prevent improvised launch work. The public release should move through visible lanes, gates, and owner decisions instead of mixing website changes, Cloudflare production, GitHub Releases, desktop signing, cybersecurity checks, and social sharing in one loose push.

## Current State

As of 2026-07-04T22:10:36-06:00:

- The browser/PWA MVP is locally release-candidate ready.
- Cloudflare Pages preview exists at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- The preview is not the public canonical URL.
- The app has no backend, no Supabase requirement, no provider API calls, no external account connections, no telemetry, and no remote storage requirement.
- The browser/PWA version cannot inspect the user's computer.
- The desktop prototype has narrow permissioned local AI tool discovery through Tauri commands.
- Windows technical-preview packaging was locally verified, but the installer and executable are unsigned.
- macOS and Linux technical-preview artifact workflows are ready, but remote artifacts have not been generated in this repo yet.
- Public desktop downloads remain held until signing/notarization, checksums, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner approval pass.
- The owner preference is one Old Skool AI public hub/tab, with `guidedailabs.com` and `guidedaijourney.com` linking to that hub.

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
| Public hub | Not built in this repo | Old Skool AI page/tab explains the tool and links to the online app | Hub copy, link, rollback, owner approval |
| Hosted web/PWA | Preview deployed and smoked | People can use the tool online for free | Canonical URL, hosted smoke, web RC checks, launch approval |
| Windows desktop | Local unsigned NSIS technical preview exists | Signed installer or Store/MSIX download | Publisher identity, signing path, install/launch/uninstall smoke |
| macOS desktop | Workflow-ready, not generated | Signed and notarized DMG | Apple Developer ID, notarization, smoke |
| Linux desktop | Workflow-ready, not generated | AppImage and/or `.deb` download | Linux smoke, checksums/signature decision, dependency notes |
| Public support | Basic `SECURITY.md` exists | Users know where to report security/support issues | Public support route and withdrawal plan |

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

- Old Skool AI page content distinguishes online app from future desktop app.
- Copy says the browser version does not check the user's computer.
- Desktop download area says downloads are coming after signing and safety checks, unless a separate owner-approved technical-preview exception is recorded.
- The other two sites link to the Old Skool AI hub rather than hosting separate copies.

### Phase 2 - Cloudflare Production Path Decision

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
- public release notes

Windows gates:

- choose Microsoft Store/MSIX, direct signed installer, or both
- obtain or configure code-signing path
- sign installer and executable
- verify signature
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
| Old Skool AI hub route chosen | Project Owner | pending | Owner confirms page/tab and link structure |
| Canonical online app URL chosen | Project Owner | pending | URL decision and hosted smoke |
| Cloudflare release process chosen | Technical Lead / Project Owner | pending | GitHub-connected Pages or direct-upload release process |
| Web/PWA release gate | Technical Lead | pending | D8/D9 checks rerun against final URL |
| Public copy review | Project Owner | pending | Hub copy and app boundary copy approved |
| Support/security route | Project Owner / Technical Lead | partial | `SECURITY.md` exists; public support copy still needed |
| Desktop product name | Project Owner | pending | Name recorded before signing |
| Desktop legal publisher | Project Owner | pending | Publisher identity recorded before signing |
| Windows trust path | Project Owner / Technical Lead | pending | Store/MSIX or signed installer decision |
| macOS trust path | Project Owner / Technical Lead | pending | Developer ID/notarization path |
| Linux trust path | Technical Lead | pending | artifact set, checksums/signature, smoke |
| Social launch | Project Owner | held | Only after web launch approval |
| Public desktop downloads | Project Owner | held | Only after desktop gates pass |

## Immediate Next Chunk Recommendation

Run D12 as the Old Skool AI hub handoff package:

- create the exact page/tab instructions for the Linux-side website
- provide approved placeholder copy for online use and held desktop downloads
- document where `guidedailabs.com` and `guidedaijourney.com` should link
- keep the desktop download buttons hidden or explicitly "coming after signing and safety checks"
- do not make DNS, Cloudflare production, GitHub Release, or public desktop artifact changes in the same chunk

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-04T22:10:36-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; text scan for unconfirmed URL and premature desktop-download claims | passed | Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; text scan found only correction/negative-boundary references for `app.oldskoolai.com`, "public desktop downloads are ready", and "safe to install". |
| 2026-07-04T22:03:36-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D11 planning work. |

## Handoff

D11 creates the public launch master plan only. It does not launch the app publicly, change DNS, connect Cloudflare production to GitHub, create GitHub Releases, run desktop technical-preview workflows, sign installers, notarize macOS artifacts, or add public desktop download links.

The next safest execution chunk is D12 Old Skool AI hub handoff. Public web launch should wait until the canonical URL and Cloudflare production path are chosen and smoked. Public desktop downloads should wait until platform trust gates pass or a separately documented technical-preview exception is approved.
