# 2026-07-04T15:35:38-06:00 - Implementation Status

Last Updated: 2026-07-06T14:08:49-06:00
Status: d21-windows-msix-proof
Status Updated: 2026-07-06T14:08:49-06:00
Owner: Technical Lead

## Completed Work

Windows MSIX proof packaging added, building on the D20 desktop public distribution decision, D19 PDF-ready saved Decision Card reports, D18 public suggested-stage guidance, D17 desktop download readiness gate, D16 public impact insight UI, D15 impact estimator methodology, D14 public hub and cross-site link smoke, D13 Cloudflare production launch smoke, D12 Old Skool AI hub handoff package, D11 public launch master plan, D10 desktop technical-preview artifact lane, D9 Cloudflare hosted preview smoke, and D6 packaging/signing evidence.

Completion target: Task complete for D21 Windows MSIX proof packaging and workflow support.

Current state: D11 adds `docs/2026-07-04-public-launch-master-plan.md` as the controlling release map, D12 adds `docs/2026-07-04-old-skool-ai-hub-handoff.md` as the Linux-side Old Skool AI hub package, D13 adds `docs/2026-07-05-cloudflare-production-launch-smoke.md` as the production web/PWA evidence packet, D14 adds `docs/2026-07-05-public-hub-and-cross-site-link-smoke.md` as the public hub/cross-site evidence packet, D15 adds `docs/2026-07-05-impact-estimator-methodology.md` as the impact calculation methodology, D16 adds `docs/2026-07-05-public-impact-insight-cloudflare-update.md` as the public impact UI production-update evidence packet, D17 adds `docs/2026-07-05-desktop-download-readiness-gate.md` as the desktop download readiness evidence packet, D18 adds `docs/2026-07-05-public-stage-guidance-cloudflare-update.md` as the public stage-guidance production-update evidence packet, D19 adds `docs/2026-07-05-public-pdf-report-cloudflare-update.md` as the public PDF report production-update evidence packet, D20 adds `docs/2026-07-06-desktop-public-distribution-decision.md` as the desktop public distribution/evidence-gate packet, and D21 adds `docs/2026-07-06-windows-msix-proof.md` as the self-signed MSIX proof packet. The browser/PWA app is live at `https://ai-task-router.pages.dev/` with public impact insight, suggested-stage guidance, and PDF-ready saved Decision Card reports, the Old Skool AI hub is live at `https://oldskoolai.com/ai-task-router/`, public support/security copy is live at `https://oldskoolai.com/security/`, and Guided AI Labs plus Guided AI Journey now link to the hub. Desktop technical-preview artifacts have a checksum/readiness gate, Windows now has a local MSIX proof path, and public mode still requires real platform trust evidence before ordinary-user desktop downloads, social launch posts, custom-domain/DNS work, exact public savings claims, live pricing/model fetches, live pricing tables, provider connections, signing workflows, Store submission, or GitHub Releases.

## Scope

This desktop track keeps the Tauri native surface narrow and controlled around the existing Vite/React app.

The D2 shell slice provides:

- `@tauri-apps/cli` as a project dev dependency.
- Desktop npm scripts: `tauri`, `desktop:info`, `desktop:dev`, and `desktop:build`.
- `src-tauri` with a minimal Rust app shell.
- Tauri config pointed at the existing Vite dev server and `dist` build output.
- A D2 no-bundle desktop build script, not a packaging/signing workflow.
- Empty Tauri capability permissions for the default window.
- No Tauri plugins beyond the core shell.
- Brand-aligned desktop icon assets generated from a square Guided AI Labs icon source.
- Vite watcher ignore for `src-tauri`.
- `src-tauri/Cargo.lock` generated and retained after successful Cargo dependency resolution.

The D3 trust-boundary slice provides:

- Explicit release CSP and dev CSP in `src-tauri/tauri.conf.json`.
- Future desktop discovery option/request/response/error schemas in `src/domain/schemas.ts`.
- Matching TypeScript types in `src/domain/types.ts`.
- Unit coverage for schema defaults, redaction gates, summary consistency, duplicate tool rejection, and path-detail rejection.
- Updated desktop trust plan, permission matrix, architecture note, risk register, README, changelog, and pathway handoff.

The D4 local-discovery slice provides:

- `@tauri-apps/api` as a runtime dependency for desktop IPC.
- Custom Rust commands `get_desktop_discovery_options` and `run_desktop_discovery` in `src-tauri/src/discovery.rs`.
- Command registration in `src-tauri/src/lib.rs`.
- A frontend bridge in `src/desktop/desktopDiscovery.ts` that detects Tauri runtime availability and validates native responses with Zod before UI use.
- A desktop-only `Check this computer` panel in My AI Tools.
- Allowlisted checks for `ollama`, `lm-studio`, `jan`, and `gpt4all`.
- Summary-first results, optional capped model-name details, clear results, and add-to-My-AI-Tools actions.
- No path return, no startup/background scans, no user-supplied paths, and no broad Tauri plugin permissions.

The D5 hosted/PWA install slice provides:

- `public/manifest.webmanifest` with name, short name, start URL, standalone display mode, theme/background colors, and 192px/512px Guided AI Labs icons.
- `public/service-worker.js` with same-origin app-shell caching, navigation fallback, install/activate/fetch handlers, and old-cache cleanup.
- `public/pwa/icon-192.png` and `public/pwa/icon-512.png` copied from the existing Guided AI Labs desktop icon set.
- `src/pwa/registerServiceWorker.ts` to register the service worker only in production HTTPS or local preview, never during Vite dev mode or inside Tauri.
- Start Here browser-install UI that responds to `beforeinstallprompt`, keeps fallback browser-menu copy, and explicitly says computer checking requires the desktop app.
- Tests for the install prompt path and service-worker registration gating.

The D6 packaging/signing spike provides:

- `src-tauri/tauri.internal-windows.conf.json`, an explicit internal Windows NSIS packaging config.
- `npm run desktop:package:windows:internal`, which builds with `--no-sign` and leaves normal `desktop:build` as a no-bundle build.
- `scripts/inspect-desktop-artifacts.mjs` and `npm run desktop:artifacts`, which report package artifact size and SHA-256.
- Node script tests for the artifact inspector.
- A dated D6 signing requirements note in `docs/2026-07-04-desktop-packaging-signing-spike.md`.

The D7 release/security readiness packet provides:

- `docs/2026-07-04-release-security-readiness-packet.md`, recording the web/PWA and desktop release gates.
- A public `SECURITY.md` with the current security model and vulnerability reporting route.
- Deployment, runbook, risk, roadmap, README, desktop plan, and pathway updates for the GitHub plus Cloudflare distribution direction.
- A hold decision: no public web launch, social sharing, GitHub Release artifact, or desktop download until release evidence passes.

Chunk Fifteen provides:

- `src/tests/fixtures/e2eTaskFixtures.ts` with 22 non-sensitive fixture tasks covering public, internal, confidential, regulated, highly restricted, public-facing risk, current-facts, citation, coding, writing, planning, packaging, review, research, synthesis, and analysis scenarios.
- `src/tests/e2e/mvp-workflows.spec.ts` with six Playwright tests covering the corrected web MVP workflows and no-execution boundary.
- A Vitest exclusion for `src/tests/e2e/**` so unit tests and Playwright tests run in the right harnesses.

D8 provides:

- `scripts/web-release-candidate-scan.mjs` and `npm run scan:web-rc`, a repeatable production artifact scan for high-confidence secret patterns, unexpected external URLs, root-domain PWA manifest fields, required PWA icon entries, and service-worker guardrails.
- `scripts/web-release-candidate-scan.node-test.mjs` with Node tests for safe artifacts and release-blocking findings that do not print secret-looking values.
- `docs/2026-07-04-web-release-candidate-security-pass.md`, the D8 evidence packet with validation, source basis, Cloudflare preview plan, smoke matrix, rollback checklist, and release hold.

D9 provides:

- `docs/2026-07-04-cloudflare-pages-hosted-preview-smoke.md`, the D9 evidence packet for the hosted Cloudflare Pages preview.
- Cloudflare Pages project `ai-task-router`.
- Direct-upload test preview `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- Hosted Playwright support through `PLAYWRIGHT_BASE_URL` in `playwright.config.ts`.
- Hosted smoke evidence for root page, manifest, service worker, PWA icons, service-worker registration, and no observed external requests during Chromium load.

D10 provides:

- `docs/2026-07-04-desktop-technical-preview-artifacts.md`, the D10 evidence packet for technical-preview desktop artifacts.
- `.github/workflows/desktop-technical-preview.yml`, a manual GitHub Actions workflow for Windows, macOS, and Linux technical-preview artifacts.
- `src-tauri/tauri.technical-preview.conf.json`, a shared bundle config with updater artifacts disabled.
- Package scripts for Windows NSIS, macOS DMG, Linux AppImage, and Linux `.deb` technical-preview builds.
- `npm run desktop:checksums`, which writes `SHA256SUMS.txt` beside generated desktop packages.
- D17 later adds the readiness gate that checks those artifacts and checksums before workflow upload.

D11 provides:

- `docs/2026-07-04-public-launch-master-plan.md`, the public release execution map.
- A recommended first public shape: Old Skool AI as the hub/tab, with Guided AI Labs and Guided AI Journey linking there, and one Cloudflare Pages-backed app destination for online use.
- Separated release lanes for public hub, hosted web/PWA, Windows desktop, macOS desktop, Linux desktop, and public support.
- A phase plan from master-plan baseline through Old Skool AI hub handoff, Cloudflare production decision, hosted release gate, desktop trust/signing readiness, controlled beta, and public desktop downloads.
- A public go/no-go board for unresolved owner and technical decisions.

D12 provides:

- `docs/2026-07-04-old-skool-ai-hub-handoff.md`, the Linux-side website package for the Old Skool AI hub.
- Recommended Old Skool AI route `/ai-task-router/`, subject to existing site routing.
- Plain-language public copy for the hero, online app, trust notes, desktop hold state, SEO metadata, and cross-site links.
- Cross-site link instructions for `guidedailabs.com` and `guidedaijourney.com`.
- A publish checklist that blocks the D9 preview alias and blocks unsigned/unnotarized desktop artifacts.
- Rollback/removal notes for the page, navigation links, cross-site links, and online-button target.

D13 provides:

- `docs/2026-07-05-cloudflare-production-launch-smoke.md`, the production web/PWA evidence packet.
- Canonical first public online app URL `https://ai-task-router.pages.dev/`.
- Wrangler direct-upload production deployment to Cloudflare Pages branch `main`, source `af2b367`.
- Hosted smoke evidence for root page, manifest, service worker, PWA icons, hosted Playwright E2E, Windows `curl.exe`, PowerShell `Invoke-WebRequest`, service-worker scope, and no observed external requests during Chromium load.
- Updated release docs that keep Old Skool AI page publication, cross-site links, social launch, custom domains, GitHub Releases, and public desktop downloads gated.

D14 provides:

- `docs/2026-07-05-public-hub-and-cross-site-link-smoke.md`, the public hub and cross-site link evidence packet.
- Old Skool AI public hub publication at `https://oldskoolai.com/ai-task-router/`, with online CTAs pointing to `https://ai-task-router.pages.dev/`.
- Old Skool AI public support/security route at `https://oldskoolai.com/security/`.
- Guided AI Labs and Guided AI Journey footer links to the Old Skool AI hub.
- Public HTTP and Playwright smoke evidence across desktop and mobile for the hub, support/security route, cross-site links, app URL, redirects, and no stale preview or desktop-download claims on the D14 public pages.

D15 provides:

- `docs/2026-07-05-impact-estimator-methodology.md`, a draft methodology for source-refresh, 100k-token benchmark pricing, right-sizing cost savings, scenario energy/water estimates, and public-safe copy.
- `src/domain/impact/impactEstimator.ts`, a deterministic local calculation module with reviewed-source pricing anchors and scenario energy anchors.
- `src/tests/unit/impactEstimator.test.ts`, covering 100k-token math, cached input pricing, right-sizing cost savings, energy/water ranges, and source anchoring.

D16 provides:

- `src/domain/impact/publicImpactSnapshot.ts`, a reviewed-source public snapshot for the in-app impact panel.
- A Best Options impact insight section with 100k-token pricing, right-sizing, energy, skill payoff, route-specific framing, caveats, and official source links.
- A Start Here cue that the app helps build judgment about when a smaller route is enough.
- `scripts/web-release-candidate-scan.mjs` allowlist entries for the official source links, while retaining the unexpected external URL release gate.
- `docs/2026-07-05-public-impact-insight-cloudflare-update.md`, the Cloudflare production update and smoke packet for deployment `cd2c5112` from source `b4daec6`.

D17 provides:

- `docs/2026-07-05-desktop-download-readiness-gate.md`, the desktop artifact readiness gate packet.
- `scripts/desktop-release-gate.mjs`, which checks generated desktop artifacts, validates `SHA256SUMS.txt`, classifies platform artifacts, reports technical-preview holds, and blocks public mode until trust evidence exists.
- `scripts/desktop-release-gate.node-test.mjs`, with Node tests for technical-preview hold, public gate failure, stale checksums, and platform classification.
- `npm run desktop:gate:technical-preview` and `npm run desktop:gate:public`.
- A `.github/workflows/desktop-technical-preview.yml` gate step after checksum generation and before artifact upload.

D18 provides:

- `src/domain/routing/stageGuidance.ts`, a deterministic local suggested-stage generator.
- A backward-compatible `stageGuidance` route-card schema field.
- A shared `StageGuidancePanel` rendered in Best Options and saved Decision Cards.
- Suggested Stages in route-card Markdown export.
- `docs/2026-07-05-public-stage-guidance-cloudflare-update.md`, the Cloudflare production update and smoke packet for deployment `98a58ca6` from source `9d3154d`.

D19 provides:

- `src/ui/screens/ImpactInsightPanel.tsx`, a shared public impact panel used by Best Options and saved Decision Cards.
- Saved Decision Cards with impact context and a `Save PDF report` action that calls the browser print path.
- Print CSS that hides app chrome/export controls and keeps report header, suggested stages, impact context, warnings, and route tradeoffs visible.
- `docs/2026-07-05-public-pdf-report-cloudflare-update.md`, the Cloudflare production update and smoke packet for deployment `49d21829` from source `9c870ce`.

D20 provides:

- `docs/2026-07-06-desktop-public-distribution-decision.md`, the public desktop distribution decision and evidence-gate packet.
- A Windows Store/MSIX-first recommended lane for ordinary-user Windows desktop distribution, with direct signed installer retained as fallback.
- `docs/release/desktop-public-release-evidence.template.json`, a hold-state public release evidence template.
- `scripts/desktop-release-gate.mjs` public mode checks for real platform trust evidence at `docs/release/desktop-public-release-evidence.json`.
- Node script coverage for missing public evidence, future Windows MSIX pass, and distribution-lane mismatch rejection.

D21 provides:

- `docs/2026-07-06-windows-msix-proof.md`, the Windows MSIX proof evidence packet.
- `src-tauri/windows-msix/Package.appxmanifest` plus generated MSIX assets.
- `scripts/package-windows-msix-proof.mjs` and `npm run desktop:package:windows:msix-proof`.
- Node script coverage for path containment and WinApp CLI telemetry opt-out.
- Manual technical-preview workflow support for a Windows MSIX proof artifact.

## Product Boundary

This desktop track now adds narrow native discovery for selected local AI tools only, an opt-in internal unsigned Windows package build for evidence, a manual technical-preview artifact lane, a desktop artifact readiness gate, a D20 public evidence gate for future trusted desktop downloads, and a D21 self-signed Windows MSIX proof path. The browser/PWA track adds installability, D8 local release-candidate evidence, D9 Cloudflare Pages hosted test preview, D13 Cloudflare Pages production deployment, D14 public hub/cross-site links, D16 public impact insight UI, D18 public suggested-stage guidance, and D19 PDF-ready saved Decision Card reports. D11 adds planning/control documentation, D12 adds website handoff documentation, D13 adds production web launch evidence, D14 adds public web doorway evidence, D15 adds impact-estimator methodology, D16 wires a caveated reviewed-source impact story into the public Best Options screen, D17 keeps desktop artifact readiness machine-checkable without publishing installers, D18 adds compact stage-and-recommended-help guidance without turning the app into a project planner, D19 lets users save a local browser PDF report without a server renderer, D20 selects a Windows Store/MSIX-first public desktop lane while keeping public downloads held until real trust evidence exists, and D21 proves MSIX packaging mechanics without claiming ordinary-user trust. Neither track adds arbitrary folder inspection, public trusted code signing, public installer publishing, auto-update, provider connections, credential storage, authentication, telemetry, remote sync, provider API calls, automatic uploads, file indexing, feedback analytics, best-stack recommendation logic, custom-domain/DNS changes, social launch links, public desktop downloads, exact public savings claims, live pricing/model fetches, or execution workflows.

The existing `npm run detect:local-models` command remains explicit and terminal-only.

The desktop commands `get_desktop_discovery_options` and `run_desktop_discovery` are implemented as custom Rust commands, not broad shell or filesystem plugin permissions.

## Evidence

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the scaffold and before the prerequisite retry.
- `bash -lc "date -Iseconds"` captured `2026-07-04T15:35:38-06:00` and `2026-07-04T16:04:28-06:00`.
- `npm install --save-dev @tauri-apps/cli@2.11.4` passed and audit reported 0 vulnerabilities.
- `npx tauri init ...` created the `src-tauri` scaffold.
- `npx tauri icon src-tauri/icon-source.svg` generated branded desktop icon assets.
- Initial `npm run desktop:info` found WebView2 but reported missing MSVC Build Tools, Rust, Cargo, rustup, and Rust toolchain.
- Deep machine audit found no Rust/rustup/Cargo, no Visual Studio Installer/vswhere, no Visual Studio Build Tools folders, and no Windows SDK folders before install.
- Installed Rustup through winget: Rustup `1.29.0`, Rust/Cargo `1.96.1`, default `stable-x86_64-pc-windows-msvc`.
- Installed Visual Studio Build Tools 2022 through winget: Build Tools `17.14.35`, MSVC `14.44.35207`, Windows SDK `10.0.26100.0`.
- Post-install `npm run desktop:info` passed all environment checks and reported WebView2 `149.0.4022.98`.
- `cargo metadata --manifest-path src-tauri/Cargo.toml --format-version 1 --no-deps` passed.
- `npm run desktop:build` passed and built `src-tauri\target\release\ai-task-router-desktop.exe`.
- Release executable launch smoke test confirmed a running desktop process with main window title `AI Task Router`, then stopped it cleanly.
- `npm run desktop:dev` and direct `cargo build --manifest-path src-tauri/Cargo.toml` are blocked by Windows Application Control when Cargo tries to run the generated debug `build-script-build.exe`.
- Windows Code Integrity logs show event IDs `3033` and `3077`, policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}`, Enterprise signing level requirement.
- `npm run test` passed with 11 test files and 81 tests before the prerequisite retry.
- `npm audit --audit-level=moderate` found 0 vulnerabilities before the prerequisite retry.
- `npm run build` passed with the existing Vite chunk-size warning before the prerequisite retry.
- `src-tauri/icons/icon.png` was visually checked and shows the Guided AI Labs mark.
- Final close-out checks passed: `npm run desktop:info`, `npm run test`, `npm run build`, `npm audit --audit-level=moderate`, `bash scripts/governance-preflight.sh`, `npm run desktop:build`, and `git diff --check`.
- D3 focused `npm run test -- domainSchemas` passed with 1 file and 8 tests.
- D3 `npm run build` passed with the existing Vite chunk-size warning after adding desktop discovery schemas.
- D3 `npm run test` passed with 11 files and 83 tests; `npm audit --audit-level=moderate` found 0 vulnerabilities; `bash scripts/governance-preflight.sh` passed with 0 warnings.
- D3 `npm run desktop:info` passed after prepending `C:\Users\adamg\.cargo\bin` to the current shell PATH; without that current-process adjustment Tauri could not see Rust even though it is installed and present in the user PATH.
- D3 `npm run desktop:build` passed after prepending `C:\Users\adamg\.cargo\bin`.
- D3 release executable launch smoke test was blocked by Windows Application Control. Signature check reports unsigned, SHA-256 `079EF12762D987A877146E6051B32A1E2ED9BC42507B020959F00F2793C7512B`, and Code Integrity event IDs `3033`/`3077` cite policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}`.
- Final D3 documentation close-out checks passed: `bash scripts/governance-preflight.sh` reported 0 warnings and `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D4 focused `npm run test -- App` passed with 1 file and 13 tests.
- D4 `npm run test` passed with 11 files and 84 tests.
- D4 `npm run build` passed with the existing Vite chunk-size warning.
- D4 `cargo test --manifest-path src-tauri\Cargo.toml --lib --release` passed earlier in the code loop with 4 Rust tests; the final close-out rerun was blocked by Windows Application Control when executing the generated release test binary.
- D4 `cargo test --manifest-path src-tauri\Cargo.toml --lib --release --no-run` passed in final close-out.
- D4 `cargo fmt --manifest-path src-tauri\Cargo.toml --check` passed.
- D4 `npm audit --audit-level=moderate` found 0 vulnerabilities.
- D4 `bash scripts/governance-preflight.sh` passed with 0 warnings.
- D4 `npm run desktop:info` passed after prepending `C:\Users\adamg\.cargo\bin` to the current shell PATH.
- D4 `npm run desktop:build` passed after prepending `C:\Users\adamg\.cargo\bin` and built `src-tauri\target\release\ai-task-router-desktop.exe`.
- D4 `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D5 focused `npm run test -- App pwaServiceWorker` passed with 2 files and 17 tests.
- D5 `node --check public\service-worker.js` passed.
- D5 `npm audit --audit-level=moderate` found 0 vulnerabilities.
- D5 `bash scripts/governance-preflight.sh` passed with 0 warnings.
- D5 `npm run test` passed with 12 files and 88 tests.
- D5 `npm run build` passed with the existing Vite chunk-size warning and produced `dist/manifest.webmanifest`, `dist/service-worker.js`, `dist/pwa/icon-192.png`, and `dist/pwa/icon-512.png`.
- D5 local production preview on `http://127.0.0.1:5184/` served the install metadata: manifest link present, Apple icon link present, manifest name `AI Task Router | Guided AI Labs`, display `standalone`, start URL `/`, two icons, both icon URLs returned 200, service worker returned 200, and install/fetch handlers were present.
- D6 `node --check scripts\inspect-desktop-artifacts.mjs` passed.
- D6 JSON parse check for `package.json` and `src-tauri/tauri.internal-windows.conf.json` passed.
- D6 pre-package `npm run desktop:artifacts` passed and correctly found no package artifacts before packaging.
- D6 `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:package:windows:internal` passed and generated `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe`.
- D6 `npm run desktop:artifacts` reported package size `1.90 MiB` and SHA-256 `FF170B0B681AA1954881767524E805C005AF72402C5B0AE7FCB0AF8934AC3BFD`.
- D6 `Get-AuthenticodeSignature` reported `NotSigned` for both the generated NSIS installer and `src-tauri\target\release\ai-task-router-desktop.exe`.
- D6 `npm run test:scripts` passed with 2 Node tests.
- D7 `bash scripts/governance-preflight.sh` passed with 0 warnings.
- D7 official source review covered GitHub Releases/Pages/HTTPS, Cloudflare Pages/custom domains, Microsoft code signing, OWASP ASVS/WSTG, Tauri capabilities, and RustSec.
- D7 close-out validation passed: `npm run test` ran 12 files and 88 tests; `npm audit --audit-level=moderate` found 0 vulnerabilities; `bash scripts/governance-preflight.sh` reported 0 warnings; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- Chunk Fifteen installed the missing local Playwright Chromium browser cache with `npx playwright install chromium`.
- Chunk Fifteen close-out validation passed: `bash scripts/governance-preflight.sh` reported 0 warnings; `npm run test` ran 12 files and 88 tests; `npm run build` passed with the existing Vite chunk-size warning; `npx playwright test` passed 6 Chromium tests; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D8 governance preflight passed with 0 warnings and official Cloudflare Pages, GitHub security, and OWASP sources were reviewed.
- D8 `npm ci` initially hit a Windows `EPERM` lock from stale repo-owned Vite dev/preview servers; those `agents\agent-picker` Node processes were stopped and `npm ci` then passed with 0 vulnerabilities.
- D8 `npm audit --audit-level=moderate` found 0 vulnerabilities.
- D8 `npm run test:scripts` passed with 4 Node script tests.
- D8 `npm run test` passed with 12 files and 88 tests.
- D8 `npm run build` passed with the existing Vite chunk-size warning.
- D8 `npm run scan:web-rc` passed with no release-blocking findings.
- D8 `npx playwright test` passed with 6 Chromium tests.
- D8 local production preview at `http://127.0.0.1:5185/` served root, manifest, Apple icon, 192px icon, 512px icon, and service worker with install/fetch handlers and same-origin-only guard.
- D8 close-out validation passed at 2026-07-04T20:35:49-06:00: governance preflight, audit, script tests, unit tests, build, web RC scan, Playwright E2E, and whitespace check all passed; build retained the existing chunk-size warning only.
- D9 governance preflight passed with 0 warnings before Cloudflare provider work.
- D9 verified Cloudflare token/account access from the master environment file without printing or documenting token values.
- D9 created Cloudflare Pages project `ai-task-router`.
- D9 deployed a Wrangler direct-upload preview at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- D9 Cloudflare deployment API check reported a preview environment, successful deploy stage, no environment variables, no Functions, branch `preview-20260704-0c7b253`, and commit `0c7b253`.
- D9 Node HTTPS/fetch checks returned 200 for the preview root, `manifest.webmanifest`, `service-worker.js`, `/pwa/icon-192.png`, and `/pwa/icon-512.png`; both icon paths returned `image/png`.
- D9 Chromium hosted smoke loaded title `AI Task Router | Guided AI Labs`, first heading `AI Task Router`, manifest link `/manifest.webmanifest`, registered the service worker, and observed 0 external requests during load.
- D9 `npx playwright test` passed locally with 6 Chromium tests after adding hosted-base-url support.
- D9 hosted `PLAYWRIGHT_BASE_URL=https://preview-20260704-0c7b253.ai-task-router.pages.dev npx playwright test` passed with 6 Chromium tests.
- D9 final validation passed: `npm audit --audit-level=moderate`, `npm run test:scripts`, `npm run test`, `npm run build`, and `npm run scan:web-rc`. Build retained the existing Vite chunk-size warning only.
- D10 governance preflight passed with 0 warnings.
- D10 syntax and config checks passed: `node --check scripts/inspect-desktop-artifacts.mjs`, `node --check scripts/inspect-desktop-artifacts.node-test.mjs`, JSON parse check for `package.json` and `src-tauri/tauri.technical-preview.conf.json`, and `npx --yes yaml-lint .github/workflows/desktop-technical-preview.yml`.
- D10 `npm audit --audit-level=moderate` found 0 vulnerabilities.
- D10 `npm run test:scripts` passed with 4 Node script tests, including checksum file output.
- D10 `npm run test` passed with 12 files and 88 tests.
- D10 `npm run build` passed with the existing Vite chunk-size warning.
- D10 `npm run scan:web-rc` passed with no release-blocking findings.
- D10 Windows technical-preview package build passed and generated `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe`.
- D10 `npm run desktop:artifacts` reported size `1.90 MiB` and SHA-256 `C6438D8EDBDFFEC8375D9538373F4C2E681DE02EE037474C1C0C11B006CA0B86`.
- D10 `npm run desktop:checksums` wrote `src-tauri\target\release\bundle\SHA256SUMS.txt`.
- D10 `Get-AuthenticodeSignature` reported `NotSigned` for both the Windows NSIS installer and rebuilt release executable.
- D10 `git diff --check` passed with only normal Windows LF-to-CRLF notices.
- D11 governance preflight passed with 0 warnings before public launch master planning.
- D11 close-out validation passed: governance preflight reported 0 warnings, `git diff --check` reported only normal Windows LF-to-CRLF notices, and the release-boundary text scan found only correction or negative-boundary references.
- D12 governance preflight passed with 0 warnings before the Old Skool AI hub handoff package.
- D12 close-out validation passed: governance preflight reported 0 warnings; `git diff --check` reported only normal Windows LF-to-CRLF notices; release-boundary scans found no stale D12-not-created wording and only historical or negative-boundary references for preview URLs, unconfirmed app subdomain, and premature desktop-download claims.
- D14 public hub/cross-site validation passed: Old Skool AI `npm run typecheck`, `npm run lint`, `npm run build`, governance check, and `git diff --check`; Guided AI Labs `npm run lint`, `npm run build`, governance preflight, and `git diff --check`; Guided AI Journey `npm run typecheck`, `npm run lint`, production build with existing repo-local env loaded into process, and `git diff --check`; public HTTP/Playwright smoke confirmed the app, hub, support/security route, Guided AI Labs link, Guided AI Journey link, apex redirects, mobile/desktop rendering, and no stale preview or desktop-download claims on D14 public pages.
- D15 focused estimator validation passed: `npm run test -- impactEstimator` ran 1 file and 5 tests.
- D15 full unit validation passed: `npm run test` ran 13 files and 93 tests.
- D15 production build passed with the existing Vite chunk-size warning.
- D15 close-out governance and whitespace checks passed: `bash scripts/governance-preflight.sh` reported 0 warnings and `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D16 governance preflight passed with 0 warnings before public UI/release work.
- D16 focused validation passed: `npm run test -- impactEstimator` ran 1 file and 7 tests; `npm run test -- App` ran 1 file and 14 tests.
- D16 full unit validation passed: `npm run test` ran 13 files and 95 tests.
- D16 production build passed with the existing Vite chunk-size warning.
- D16 web release-candidate scan passed after official source links were explicitly allowlisted.
- D16 local Playwright passed 6 Chromium tests, including the impact insight assertion.
- D16 local visual smoke passed on desktop and mobile, including source-details-open mobile with no horizontal overflow.
- D16 Cloudflare production deployment passed: `b4daec6` deployed to `https://cd2c5112.ai-task-router.pages.dev`; canonical `https://ai-task-router.pages.dev/` served root, manifest, service worker, and PWA icons with HTTP 200.
- D16 hosted Playwright passed 6 Chromium tests against `https://ai-task-router.pages.dev`.
- D16 hosted Chromium impact smoke passed: impact panel rendered, caveat was visible, initial load observed 0 external requests, and no desktop horizontal overflow.
- D17 governance preflight passed with 0 warnings before and after desktop gate work.
- D17 official source review covered Tauri Windows/macOS signing, Tauri GitHub pipelines, Microsoft Windows app code-signing options, and Apple notarization.
- D17 script validation passed: `node --check scripts/desktop-release-gate.mjs` and `node --check scripts/desktop-release-gate.node-test.mjs`.
- D17 `npm run test:scripts` passed with 8 Node script tests.
- D17 workflow validation passed: `npx --yes yaml-lint .github/workflows/desktop-technical-preview.yml`.
- D17 full validation passed: `npm run test` ran 13 files and 95 tests; `npm run build` passed with the existing Vite chunk-size warning; `npm run scan:web-rc` passed; `npm audit --audit-level=moderate` found 0 vulnerabilities; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D17 Windows technical-preview package build passed and generated `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe`, size `1.90 MiB`, SHA-256 `F7086F7F4D87379111F81FC9F839C88C566B46C3F1E931280DBE1E18E4CD80B4`.
- D17 `npm run desktop:checksums` wrote `SHA256SUMS.txt`.
- D17 `npm run desktop:gate:technical-preview` passed artifact hygiene and printed the public-download hold.
- D17 `npm run desktop:gate:public` failed as expected for missing Windows trust evidence.
- D17 `Get-AuthenticodeSignature` reported `NotSigned` for both the Windows NSIS installer and rebuilt desktop executable.
- D18 focused validation passed: `npx tsc --noEmit` and `npm run test -- routeCardGenerator domainSchemas exportImport App` ran 4 files and 35 tests.
- D18 full validation passed: `npm run test` ran 13 files and 96 tests; `npm run build` passed with the existing Vite chunk-size warning; `npm run scan:web-rc` passed; `npm audit --audit-level=moderate` found 0 vulnerabilities; `bash scripts/governance-preflight.sh` reported 0 warnings; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D18 local Playwright passed 6 Chromium tests, and local production preview visual smoke rendered Suggested stages on desktop and mobile with no horizontal overflow.
- D18 Cloudflare production deployment passed: source `9d3154d` deployed to `https://98a58ca6.ai-task-router.pages.dev`; canonical `https://ai-task-router.pages.dev/` served root, manifest, service worker, and PWA icons with HTTP 200.
- D18 hosted Playwright passed 6 Chromium tests against `https://ai-task-router.pages.dev`.
- D18 hosted Chromium stage-guidance smoke passed: Suggested stages rendered for a generated route, 4 stage cards were visible, initial load observed 0 external requests, and desktop width had no horizontal overflow.
- D19 focused validation passed: `npx tsc --noEmit` and `npm run test -- App` ran 14 App tests.
- D19 full validation passed: `npm run test` ran 13 files and 96 tests; `npm run build` passed with the existing Vite chunk-size warning; `npm run scan:web-rc` passed; `npm audit --audit-level=moderate` found 0 vulnerabilities; `bash scripts/governance-preflight.sh` reported 0 warnings; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D19 local and hosted PDF-report smokes passed: saved Decision Card showed `Save PDF report`, included impact context, had no desktop/mobile overflow, observed 0 external requests on hosted smoke, and print CSS hid app chrome/export controls while keeping report content visible.
- D19 Cloudflare production deployment passed: source `9c870ce` deployed to `https://49d21829.ai-task-router.pages.dev`; canonical `https://ai-task-router.pages.dev/` served root, manifest, and service worker with HTTP 200.
- D19 hosted Playwright passed 6 Chromium tests against `https://ai-task-router.pages.dev`.
- D20 governance preflight passed with 0 warnings before desktop distribution work.
- D20 official source refresh covered current Microsoft Windows app code-signing/MSIX/winapp CLI/Artifact Signing/WebView2, Tauri Windows/macOS/Linux signing, and Apple Developer ID/notarization sources.
- D20 script validation passed: `node --check scripts/desktop-release-gate.mjs`, `node --check scripts/desktop-release-gate.node-test.mjs`, and `npm run test:scripts` ran 10 Node script tests.
- D20 full close-out validation passed: `npm run test` ran 13 files and 96 tests; `npm run build` passed with the existing Vite chunk-size warning; `npm audit --audit-level=moderate` found 0 vulnerabilities; `bash scripts/governance-preflight.sh` reported 0 warnings; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D20 desktop gate validation passed with the intended hold: `npm run desktop:gate:technical-preview` passed artifact hygiene and `npm run desktop:gate:public` failed as expected because no real `docs/release/desktop-public-release-evidence.json` exists and Windows trust evidence remains incomplete.
- D21 governance preflight passed with 0 warnings before MSIX proof work.
- D21 official source review covered Microsoft WinApp CLI/Tauri, WinApp CLI usage, setup-WinAppCli, Tauri Windows installer, Tauri Windows signing, and Tauri Microsoft Store sources.
- D21 installed Microsoft WinApp CLI `0.4.0` locally through Winget.
- D21 generated checked-in MSIX manifest/assets under `src-tauri/windows-msix/`.
- D21 script validation passed: `node --check scripts/package-windows-msix-proof.mjs`, `node --check scripts/package-windows-msix-proof.node-test.mjs`, and `npm run test:scripts` ran 13 Node script tests.
- D21 `npm run desktop:package:windows:msix-proof` passed and generated `src-tauri\target\release\bundle\msix\AI-Task-Router_0.2.0.0_x64.msix`, size `2.79 MiB`, SHA-256 `6668983AE21279E918F1DE6A34E37369E0A6B0BF3E78D0827CF0C0A6AD80EDCD`.
- D21 `npm run desktop:gate:technical-preview` passed artifact hygiene for the MSIX proof plus existing NSIS artifact, while printing the public-download hold.
- D21 `npm run desktop:gate:public` failed as expected because no real `docs/release/desktop-public-release-evidence.json` exists.
- D21 signature/content checks confirmed the MSIX has `Package.appxmanifest`, `ai-task-router-desktop.exe`, `AppxBlockMap.xml`, and `AppxSignature.p7x`; `Get-AuthenticodeSignature` reports local `CN=Guided AI Labs Ltd` signer with untrusted root.

## Known Gaps

- `npm run desktop:dev` does not launch yet because local Windows Application Control blocks generated debug build scripts.
- The current rebuilt unsigned release executable does not launch because local Windows Application Control blocks it.
- The generated release Rust test executable from final close-out does not launch because local Windows Application Control blocks it.
- Some fresh shells may need a restart or temporary `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"` before Tauri can see Rust.
- Public desktop packaging, signing, updater, and installer distribution remain out of scope.
- The D6 NSIS installer is unsigned internal evidence only and must not be published or shared with non-technical users.
- D10 technical-preview artifacts are not public-release downloads and must not be linked from Old Skool AI until signing/notarization, smoke tests, support/withdrawal copy, and owner approval pass or a technical-preview exception is explicitly accepted.
- D20 `npm run desktop:gate:public` is expected to fail until real platform trust evidence exists at `docs/release/desktop-public-release-evidence.json`.
- The D21 MSIX proof is signed with a local self-signed development certificate only; it is not public-download ready.
- The D21 manual workflow support has not been run remotely yet, so no GitHub Actions MSIX proof artifact currently exists from this chunk.
- The D10 GitHub Actions workflow has to be manually run before remote Windows/macOS/Linux artifacts exist.
- Interactive desktop launch smoke for D4 remains blocked until the lab Application Control/signing/trusted-path issue is resolved.
- Cloudflare Pages production URL exists at `https://ai-task-router.pages.dev/` and currently includes the D19 PDF-ready saved Decision Card report path.
- D20 recommends Windows Store/MSIX first for public Windows desktop distribution; legal publisher identity, Microsoft Partner Center/MSIX path, Application Control smoke, WebView2 runtime handling, and install/launch/local-discovery/uninstall smoke remain unresolved.
- Cloudflare Pages project is not connected to GitHub yet; D13 accepted direct upload for the first production web release.
- Old Skool AI public hub and support/security routes are live; Guided AI Labs and Guided AI Journey now link to the hub.
- Guided AI Journey local `main` still has the pre-existing unpushed commit `236fd7e` and is intentionally ahead/behind `origin/main`; D14 was safely pushed from a temporary worktree based on `origin/main` as commit `610438b`.
- A first Vercel deploy attempt from the temporary Journey worktree targeted an accidental temporary Vercel project before `.vercel/project.json` was copied from the real repo. The correct production deployment succeeded and is aliased to `https://www.guidedaijourney.com/`; cleanup of the accidental temporary provider object remains a follow-up if desired.
- Public social launch links have not been created.
- The D16 public impact panel is not an opt-in user-specific savings calculator and is not approved as exact public savings claims.
- The D18 suggested-stage guidance is not a full project plan or project-management workflow; it is compact local guidance based on the selected route.
- The D19 PDF report path uses the browser print dialog and is not a server-rendered PDF service.
- Provider pricing and environmental anchors must be refreshed before public impact claims because pricing, model routing, infrastructure, and provider disclosures change.
- Custom-domain/DNS work has not been done.
- Windows `curl.exe` and PowerShell `Invoke-WebRequest` passed against the production Pages URL; the D9 preview alias remains historical only.
- Browser install prompts depend on browser support, HTTPS or local preview, and browser-specific engagement rules.
- If the hosted app is deployed under a subpath rather than a domain root, Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links must be reviewed before release.
- DirectLink has been updated with the D14 publication result and next decision boundary.

## Next Chunk

Choose the next bounded lane: owner-reviewed social/video launch copy using the now-public safe impact, stage-guidance, and report language; a reviewed methodology page; an opt-in local estimator UI; the next Windows trusted-release slice; Cloudflare/GitHub/custom-domain automation; or another explicitly approved release chunk. For desktop downloads, D20/D21 recommend Windows Store/MSIX first with direct signed installer as fallback; next desktop work should confirm legal publisher identity, Microsoft Partner Center package identity, and Store submission/trusted signing evidence before ordinary-user beta. Keep public desktop downloads held.

Proceeding beyond D21 still requires owner approval and must not add broad filesystem permissions, arbitrary shell execution, arbitrary folder inspection, public trusted code signing, updater, provider connections, telemetry, credentials, file indexing, public installer publishing, DNS changes, public GitHub Release artifacts, social launch links, live pricing/model fetches, exact public savings claims, or external actions without a separate approved chunk.
