# 2026-07-09T03:04:01+00:00 - AI Task Router

AI Task Router is a local-first decision helper for choosing the smallest adequate AI route for a task.

It recommends lean, balanced, and premium tool/model routes while respecting task information choices, sensitivity, privacy posture, cost, energy, quality needs, and user-configured tool availability.

## Product Boundary

This project is not an autonomous agent.

The MVP may:

- recommend AI tool/model/toolchain routes
- generate route cards
- generate step-by-step prompt packages
- save local route decisions
- capture local route feedback
- export Markdown, JSON, and CSV artifacts

The MVP must not:

- call external AI APIs
- connect to external systems
- execute actions
- send, publish, merge, schedule, delete, deploy, or modify external records
- store credentials
- perform live source search or file indexing
- include hidden telemetry

## Current Status

Status: v0.2 browser/PWA production URL is live at `https://ai-task-router.pages.dev/`; Old Skool AI public hub is live at `https://oldskoolai.com/ai-task-router/`; D19 PDF-ready Decision Card reports are deployed; D21 added a Windows MSIX proof package path and workflow support; D22 added Windows Store/MSIX trust prep for Partner Center identity values; social launch, custom domains, live pricing/model fetches, exact public savings claims, and public desktop downloads remain separate gated chunks
Status Updated: 2026-07-06T15:24:36.2422654-06:00

Public repository: https://github.com/Adamgdwn/ai-task-router

Current online app: https://ai-task-router.pages.dev/

Current public hub: https://oldskoolai.com/ai-task-router/

Current target: v0.2 Local Web App MVP

Active plan: [docs/2026-07-09-current-build-pathway.md](docs/2026-07-09-current-build-pathway.md)

Product brief: [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md)

Impact-estimator methodology: [docs/2026-07-05-impact-estimator-methodology.md](docs/2026-07-05-impact-estimator-methodology.md)

Public impact insight update: [docs/2026-07-05-public-impact-insight-cloudflare-update.md](docs/2026-07-05-public-impact-insight-cloudflare-update.md)

## Planned Stack

- Vite
- React
- TypeScript
- Zod
- Dexie / IndexedDB
- Vitest
- Playwright
- Web app manifest and service worker for the hosted/PWA install path
- Tauri, for the desktop shell and permissioned local discovery prototype

## Local Setup

Install dependencies:

```bash
npm install
```

Run the local app:

```bash
npm run dev
```

Run the smoke test:

```bash
npm run test
```

Run the web release-candidate artifact scan after a production build:

```bash
npm run build
npm run scan:web-rc
```

Check for local model tools on this machine:

```bash
npm run detect:local-models
```

This local check does not change the browser app, connect accounts, call AI providers, or send data anywhere.
Use `npm run detect:local-models -- --details` only when you want local model names printed in the terminal.

Build the app:

```bash
npm run build
```

Preview the production web/PWA build locally:

```bash
npm run preview -- --host 127.0.0.1 --port 5184
```

The hosted browser app now includes an install manifest, Guided AI Labs app icons, and a production-only service worker.
Supported browsers may offer an Install app option when the site is served over HTTPS or local preview. The browser/PWA
version cannot check the user's computer; local AI tool discovery requires the desktop app.

Run Playwright against the hosted production app:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://ai-task-router.pages.dev"
npx playwright test
```

Check the desktop shell environment:

```bash
npm run desktop:info
```

Run the desktop shell in dev mode after Tauri prerequisites are installed:

```bash
npm run desktop:dev
```

Current Windows lab note: `npm run desktop:dev` reaches the Vite dev server but the debug Rust build is blocked by Windows Application Control policy when Cargo tries to execute a generated `build-script-build.exe`.

After the D4 rebuild, the unsigned release executable launch remains blocked by the same Application Control policy family. The no-bundle desktop build still succeeds when the current shell can see `C:\Users\adamg\.cargo\bin`.

Build the desktop shell without packaging:

```bash
npm run desktop:build
```

Build an internal unsigned Windows installer for packaging evidence only:

```bash
$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"
npm run desktop:package:windows:internal
npm run desktop:artifacts
```

The D6 internal package command uses `src-tauri/tauri.internal-windows.conf.json` and `--no-sign`. The generated NSIS installer is not for public distribution or non-technical beta users until the signing, trust, checksum, install, launch, and uninstall checks are approved.

Build technical-preview desktop packages for platform verification:

```bash
npm run desktop:package:windows:technical-preview
npm run desktop:package:macos:technical-preview
npm run desktop:package:linux:technical-preview
npm run desktop:checksums
npm run desktop:gate:technical-preview
```

Windows can be built on this Windows lab. macOS and Linux packages should be built on matching OS runners, using the manual GitHub Actions workflow `Desktop Technical Preview Artifacts`. The technical-preview gate verifies generated artifacts and checksums, then keeps public downloads held. These artifacts are for owner/developer inspection only until signing, notarization, install/launch/uninstall smoke, support/withdrawal copy, and owner launch approval pass.

Build a Windows MSIX proof package for owner/developer inspection:

```bash
npm run desktop:package:windows:msix-proof
npm run desktop:gate:technical-preview
```

The MSIX proof uses Microsoft WinApp CLI and a local self-signed development certificate under ignored build output. It proves the package mechanics and can be uploaded by the manual technical-preview workflow, but it is not public-download ready because the signer is not trusted by ordinary Windows machines.

Prepare the Windows MSIX manifest after the app is reserved in Microsoft Partner Center:

```bash
npm run desktop:prepare:windows-store-manifest
npm run desktop:prepare:windows-store-manifest -- --write
```

The first command should fail until `docs/release/windows-store-package-identity.json` exists with real Partner Center values copied from `docs/release/windows-store-package-identity.template.json`. Do not commit government ID, tax, banking, account secrets, or private Partner Center screenshots.

Public desktop download readiness is intentionally stricter:

```bash
npm run desktop:gate:public
```

That command should fail until real platform trust evidence exists in `docs/release/desktop-public-release-evidence.json`.

Public web distribution uses GitHub plus Cloudflare. D13 deployed the browser/PWA app to the Cloudflare Pages production URL at `https://ai-task-router.pages.dev/` and recorded hosted smoke evidence in [Cloudflare Production Launch Smoke](docs/2026-07-05-cloudflare-production-launch-smoke.md). D14 published and smoked the Old Skool AI public hub, public security route, and Guided AI Labs / Guided AI Journey cross-site links in [Public Hub And Cross-Site Link Smoke](docs/2026-07-05-public-hub-and-cross-site-link-smoke.md). D16 added and deployed the public impact insight in [Public Impact Insight Cloudflare Update](docs/2026-07-05-public-impact-insight-cloudflare-update.md). D17 added the desktop download readiness gate in [Desktop Download Readiness Gate](docs/2026-07-05-desktop-download-readiness-gate.md). D18 added and deployed suggested stage guidance in [Public Stage Guidance Cloudflare Update](docs/2026-07-05-public-stage-guidance-cloudflare-update.md). D19 added and deployed PDF-ready saved Decision Card reports in [Public PDF Report Cloudflare Update](docs/2026-07-05-public-pdf-report-cloudflare-update.md). D20 selected the Windows Store/MSIX-first public desktop lane and tightened the public evidence gate in [Desktop Public Distribution Decision](docs/2026-07-06-desktop-public-distribution-decision.md). D21 added the Windows MSIX proof in [Windows MSIX Proof](docs/2026-07-06-windows-msix-proof.md). D22 added the [Windows Store Trust Prep](docs/2026-07-06-windows-store-trust-prep.md) identity template and manifest-prep command. Do not use the D9 preview alias in public links.

Desktop prerequisites installed on this Windows machine:

- Rustup `1.29.0` with Rust/Cargo `1.96.1`, default `stable-x86_64-pc-windows-msvc`
- Visual Studio Build Tools 2022 `17.14.35`
- MSVC `14.44.35207`
- Windows SDK `10.0.26100.0`
- WebView2 `149.0.4022.98`
- Microsoft WinApp CLI `0.4.0` for the local MSIX proof path

The desktop app is still an internal prototype. It now has a desktop-only `Check this computer` flow for selected local AI tools and a manual technical-preview artifact lane, but it does not add public download approval, signing, updater, provider connections, telemetry, credentials, file indexing, arbitrary folder inspection, or external actions.

Desktop Chunk D4 implements the first native local discovery path: custom Rust commands check only allowlisted local tools after user approval, hide model names by default, reject path details, and return schema-validated results to the UI. Browser users still add tools manually.

Manual local start check used for Chunk One:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Project Classification

Primary use case: AI decision-support web application

Selected risk tier: low

Selected governance level: 1

Sensitive data: No external sensitive-data processing in MVP. User-entered task metadata and local route logs only.

Production action capability: None. No execution mode exists.

Human approval required: Required for public-facing risk, regulated/highly restricted scenarios, and any future high-impact route recommendation.

## Documentation

- [Product brief](docs/PRODUCT_BRIEF.md)
- [Architecture](docs/architecture.md)
- [Context map](docs/context-map.md)
- [Current build pathway](docs/2026-07-09-current-build-pathway.md)
- [Historical build pathway archive](docs/2026-07-03-current-pathway.md)
- [Manual](docs/manual.md)
- [Roadmap](docs/roadmap.md)
- [Desktop trust and distribution plan](docs/2026-07-04-desktop-trust-distribution-plan.md)
- [Desktop packaging and signing spike](docs/2026-07-04-desktop-packaging-signing-spike.md)
- [Public launch master plan](docs/2026-07-04-public-launch-master-plan.md)
- [Old Skool AI hub handoff package](docs/2026-07-04-old-skool-ai-hub-handoff.md)
- [Cloudflare production launch smoke](docs/2026-07-05-cloudflare-production-launch-smoke.md)
- [Public hub and cross-site link smoke](docs/2026-07-05-public-hub-and-cross-site-link-smoke.md)
- [Public impact insight Cloudflare update](docs/2026-07-05-public-impact-insight-cloudflare-update.md)
- [Public stage guidance Cloudflare update](docs/2026-07-05-public-stage-guidance-cloudflare-update.md)
- [Public PDF report Cloudflare update](docs/2026-07-05-public-pdf-report-cloudflare-update.md)
- [Windows MSIX proof](docs/2026-07-06-windows-msix-proof.md)
- [Windows Store trust prep](docs/2026-07-06-windows-store-trust-prep.md)
- [Release and security readiness packet](docs/2026-07-04-release-security-readiness-packet.md)
- [Web release candidate security pass](docs/2026-07-04-web-release-candidate-security-pass.md)
- [Desktop wrapper ADR](docs/decisions/adr-0001-desktop-wrapper.md)
- [Security policy](SECURITY.md)
- [Durable development policy](docs/policy/durable-development-engineering-policy.md)
- [Engineering standards](docs/standards/README.md)
- [Document control standard](docs/standards/document-control-standard.md)
- [Ship-ready standard](docs/standards/ship-ready-engineering-standard.md)

