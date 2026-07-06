# 2026-07-04T15:35:38-06:00 - Session State

Last Updated: 2026-07-06T15:24:36.2422654-06:00
Status: d22-windows-store-trust-prep
Status Updated: 2026-07-06T15:24:36.2422654-06:00
Owner: Technical Lead

## Current Objective

Windows Store trust prep after D21 Windows MSIX proof packaging.

Current result: D22 Windows Store trust prep is task complete with public desktop downloads still held. The browser/PWA app is live at `https://ai-task-router.pages.dev/`, the Old Skool AI hub is live at `https://oldskoolai.com/ai-task-router/`, public support/security copy is live at `https://oldskoolai.com/security/`, and Guided AI Labs plus Guided AI Journey now link to the hub. D15 added a reviewed-source calculation backbone for 100k-token pricing examples, right-sizing cost savings, and scenario-based energy/water ranges. D16 wires that safe story into Best Options with caveats and official source links, plus a Start Here skill-building cue. D17 adds `scripts/desktop-release-gate.mjs`, npm desktop gate commands, tests, and a technical-preview workflow gate step. D18 adds compact suggested stages with recommended help beside each stage in Best Options, saved Decision Cards, and route-card Markdown exports. D19 adds impact context and a local browser print/save-PDF report path to saved Decision Cards. D20 recommends Windows Store/MSIX first for ordinary-user Windows desktop distribution, keeps direct signed installer as fallback, and updates public gate mode so it requires real platform trust evidence at `docs/release/desktop-public-release-evidence.json`. D21 adds WinApp CLI MSIX manifest/assets, a repeatable self-signed MSIX proof packaging script, and workflow support for a Windows MSIX proof artifact. D22 adds `docs/release/windows-store-package-identity.template.json`, `scripts/prepare-windows-store-manifest.mjs`, and `npm run desktop:prepare:windows-store-manifest` for real Partner Center identity values after the owner reserves the app. Public desktop downloads, social launch posts, custom-domain/DNS work, live pricing/model fetches, live pricing tables, exact public savings claims, provider connections, signing workflows, Store submission, and GitHub Releases remain held for separate approved chunks.

## Files Changed In This Session

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/build.rs`
- `src-tauri/capabilities/default.json`
- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`
- `src-tauri/src/discovery.rs`
- `src/desktop/desktopDiscovery.ts`
- `src/styles.css`
- `src/tests/unit/App.test.tsx`
- `src/ui/screens/SetupScreens.tsx`
- `docs/tool-permission-matrix.md`
- `docs/architecture.md`
- `docs/risks/risk-register.md`
- `README.md`
- `docs/runbook.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/2026-07-04-desktop-trust-distribution-plan.md`
- `docs/CHANGELOG.md`
- `IMPLEMENTATION_STATUS.md`
- `SESSION_STATE.md`
- `index.html`
- `public/manifest.webmanifest`
- `public/pwa/icon-192.png`
- `public/pwa/icon-512.png`
- `public/service-worker.js`
- `src/main.tsx`
- `src/pwa/registerServiceWorker.ts`
- `src/tests/unit/pwaServiceWorker.test.ts`
- `src-tauri/tauri.internal-windows.conf.json`
- `scripts/inspect-desktop-artifacts.mjs`
- `scripts/inspect-desktop-artifacts.node-test.mjs`
- `docs/2026-07-04-desktop-packaging-signing-spike.md`
- `docs/2026-07-04-release-security-readiness-packet.md`
- `SECURITY.md`
- `src/tests/fixtures/e2eTaskFixtures.ts`
- `src/tests/e2e/mvp-workflows.spec.ts`
- `vitest.config.ts`
- `scripts/web-release-candidate-scan.mjs`
- `scripts/web-release-candidate-scan.node-test.mjs`
- `docs/2026-07-04-web-release-candidate-security-pass.md`
- `playwright.config.ts`
- `docs/2026-07-04-cloudflare-pages-hosted-preview-smoke.md`
- `docs/2026-07-05-cloudflare-production-launch-smoke.md`
- `docs/2026-07-05-public-hub-and-cross-site-link-smoke.md`
- `docs/2026-07-05-impact-estimator-methodology.md`
- `docs/2026-07-05-public-impact-insight-cloudflare-update.md`
- `src/domain/impact/impactEstimator.ts`
- `src/domain/impact/publicImpactSnapshot.ts`
- `src/tests/unit/impactEstimator.test.ts`
- `scripts/desktop-release-gate.mjs`
- `scripts/desktop-release-gate.node-test.mjs`
- `docs/2026-07-05-desktop-download-readiness-gate.md`
- `src/domain/routing/stageGuidance.ts`
- `src/ui/screens/StageGuidancePanel.tsx`
- `docs/2026-07-05-public-stage-guidance-cloudflare-update.md`
- `docs/2026-07-06-desktop-public-distribution-decision.md`
- `docs/release/desktop-public-release-evidence.template.json`
- `docs/2026-07-06-windows-msix-proof.md`
- `scripts/package-windows-msix-proof.mjs`
- `scripts/package-windows-msix-proof.node-test.mjs`
- `src-tauri/windows-msix/`
- `.github/workflows/desktop-technical-preview.yml`
- `docs/2026-07-04-public-launch-master-plan.md`
- `docs/2026-07-04-desktop-trust-distribution-plan.md`

Earlier D2/D3 scaffold and trust-boundary files remain in place.

## Commands Run

- `git status --short`
- targeted `Get-Content`, `Select-String`, and `rg` reads for repo instructions, governance docs, active pathway, desktop plan, README, runbook, and status files
- official Tauri, Rust, and Microsoft documentation review for Windows prerequisites and install command support
- `bash scripts/governance-preflight.sh`
- `bash -lc "date -Iseconds"`
- deep system audit for `rustc`, `cargo`, `rustup`, `cl`, `msbuild`, `winget`, Rust folders, Visual Studio Installer/vswhere, Visual Studio folders, MSVC folders, Windows SDK registry/folders, and installed app entries
- `npm run desktop:info`
- `winget search --id Rustlang.Rustup --exact`
- `winget search --id Microsoft.VisualStudio.2022.BuildTools --exact`
- `winget install --id Rustlang.Rustup --exact --source winget --accept-package-agreements --accept-source-agreements --silent`
- `rustup --version`
- `rustc --version`
- `cargo --version`
- `rustup show`
- `winget install --id Microsoft.VisualStudio.2022.BuildTools --exact --source winget --accept-package-agreements --accept-source-agreements --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`
- `vswhere -all -products *`
- `vswhere -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`
- `vswhere -requires Microsoft.VisualStudio.Component.Windows11SDK.26100`
- `cargo metadata --manifest-path src-tauri/Cargo.toml --format-version 1 --no-deps`
- `npm run desktop:build`
- controlled `npm run desktop:dev` launch attempt with captured logs
- `cargo build --manifest-path src-tauri/Cargo.toml`
- Windows Code Integrity and Device Guard event/policy checks
- release executable launch smoke test
- official Tauri security, capabilities, permissions, runtime authority, CSP, config, and shell-plugin docs review
- `npm run test -- domainSchemas`
- `npm run test`
- `npm run build`
- `npm audit --audit-level=moderate`
- `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:info`
- `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:build`
- official PWA installability references reviewed from MDN, web.dev, and Chrome for Developers
- copied existing Guided AI Labs icon assets into `public/pwa/icon-192.png` and `public/pwa/icon-512.png`
- `npm run test -- App pwaServiceWorker`
- `node --check public\service-worker.js`
- `npm audit --audit-level=moderate`
- `bash scripts/governance-preflight.sh`
- `npm run build`
- production preview checks at `http://127.0.0.1:5184/` for manifest link, Apple icon link, manifest fields, icon URLs, and service-worker install/fetch handlers
- `npm run test`
- release executable launch smoke test attempt
- `Get-AuthenticodeSignature`
- Windows Code Integrity event review
- `git diff --check`
- `npm install @tauri-apps/api@^2.11.1`
- `npm run test -- App`
- `npm run test`
- `npm run build`
- `cargo test --manifest-path src-tauri\Cargo.toml --lib --release`
- `cargo fmt --manifest-path src-tauri\Cargo.toml --check`
- `npm audit --audit-level=moderate`
- `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:info`
- `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:build`
- official Tauri distribution/signing, Tauri updater signing, Microsoft Windows code-signing, and Apple notarization references reviewed for D6
- `node --check scripts\inspect-desktop-artifacts.mjs`
- JSON parse check for `package.json` and `src-tauri/tauri.internal-windows.conf.json`
- `npm run desktop:artifacts`
- `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:package:windows:internal`
- `Get-AuthenticodeSignature` on the generated NSIS installer and rebuilt release executable
- `npm run test:scripts`
- official GitHub Releases, GitHub Pages/HTTPS, Cloudflare Pages/custom domains, Microsoft Windows code signing, OWASP ASVS/WSTG, Tauri capabilities, and RustSec references reviewed for D7
- `npx playwright install chromium`
- `npx playwright test`
- official Cloudflare Pages Git integration, build configuration, preview deployments, custom domains, rollbacks, GitHub dependency/secret scanning, Dependabot, CodeQL, OWASP ASVS, and OWASP WSTG references reviewed for D8
- `node --check scripts\web-release-candidate-scan.mjs`
- `node --check scripts\web-release-candidate-scan.node-test.mjs`
- `npm run scan:web-rc`
- `npm ci`
- stopped stale repo-owned `agents\agent-picker` Vite dev/preview Node processes after the first `npm ci` attempt hit a Windows file lock
- local production preview smoke at `http://127.0.0.1:5185/`
- Cloudflare access check through Wrangler using the master environment file without printing token values
- `npx --yes wrangler pages project create ai-task-router --production-branch main`
- `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch preview-20260704-0c7b253 --commit-hash 0c7b253`
- Cloudflare Pages deployment API check for project/deployment metadata
- hosted Node HTTPS/fetch smoke for root, manifest, service worker, and PWA icons
- hosted Chromium smoke for title, heading, manifest, service-worker registration, and external request count
- hosted `PLAYWRIGHT_BASE_URL=https://preview-20260704-0c7b253.ai-task-router.pages.dev npx playwright test`

## Validation Notes

- Governance preflight passed with 0 warnings before the prerequisite retry.
- Before install, Rust/Cargo/rustup and Visual Studio/MSVC/Windows SDK were not found in PATH, common folders, uninstall entries, or vswhere.
- Rustup installed through winget and verified: Rustup `1.29.0`; Rust/Cargo `1.96.1`; default `stable-x86_64-pc-windows-msvc`.
- Visual Studio Build Tools 2022 installed through winget and verified: Build Tools `17.14.35`; MSVC `14.44.35207`; Windows SDK `10.0.26100.0`.
- `npm run desktop:info` now passes all environment checks and confirms WebView2 `149.0.4022.98`.
- `npm run desktop:build` passed and built `src-tauri\target\release\ai-task-router-desktop.exe`.
- Prior D2 release executable launch smoke test confirmed the then-current app stayed running after 12 seconds with main window title `AI Task Router`, then stopped cleanly.
- `npm run desktop:dev` reaches Vite on port `5173`, but Cargo debug build fails when Windows Application Control blocks generated `build-script-build.exe`.
- Direct `cargo build --manifest-path src-tauri/Cargo.toml` reproduces the same block.
- Windows Code Integrity event IDs `3033` and `3077` identify policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}` and an Enterprise signing level requirement.
- Final close-out checks passed: `npm run desktop:info`, `npm run test`, `npm run build`, `npm audit --audit-level=moderate`, `bash scripts/governance-preflight.sh`, `npm run desktop:build`, and `git diff --check`.
- D3 added explicit release/dev CSP, desktop discovery schema contracts, and docs without adding native commands or machine inspection.
- Focused D3 schema validation passed: `npm run test -- domainSchemas` ran 1 file and 8 tests.
- D3 full unit validation passed: `npm run test` ran 11 files and 83 tests.
- D3 web build passed with the existing Vite chunk-size warning.
- D3 audit found 0 vulnerabilities and governance preflight passed with 0 warnings.
- D3 `npm run desktop:info` passed after prepending `C:\Users\adamg\.cargo\bin` to the current shell PATH.
- D3 `npm run desktop:build` passed after prepending `C:\Users\adamg\.cargo\bin`.
- D3 release executable launch smoke test was blocked by Windows Application Control. Signature check reports unsigned; SHA-256 `079EF12762D987A877146E6051B32A1E2ED9BC42507B020959F00F2793C7512B`; Code Integrity event IDs `3033` and `3077` cite policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}`.
- Final D3 documentation close-out checks passed: `bash scripts/governance-preflight.sh` reported 0 warnings and `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D4 added custom Rust discovery commands and a desktop-only UI path without broad Tauri plugin permissions.
- D4 focused App validation passed: `npm run test -- App` ran 1 file and 13 tests.
- D4 full unit validation passed: `npm run test` ran 11 files and 84 tests.
- D4 web build passed with the existing Vite chunk-size warning.
- D4 Rust validation passed earlier in the code loop: `cargo test --manifest-path src-tauri\Cargo.toml --lib --release` ran 4 tests. The final close-out rerun compiled but Windows Application Control blocked the generated release test executable; `cargo test --manifest-path src-tauri\Cargo.toml --lib --release --no-run` and `cargo fmt --manifest-path src-tauri\Cargo.toml --check` passed.
- D4 audit found 0 vulnerabilities and governance preflight passed with 0 warnings.
- D4 `npm run desktop:info` and `npm run desktop:build` passed after prepending `C:\Users\adamg\.cargo\bin` to the current shell PATH.
- D4 no-bundle desktop build produced `src-tauri\target\release\ai-task-router-desktop.exe`.
- D5 focused validation passed: `npm run test -- App pwaServiceWorker` ran 2 files and 17 tests.
- D5 service-worker syntax validation passed: `node --check public\service-worker.js`.
- D5 audit found 0 vulnerabilities: `npm audit --audit-level=moderate`.
- D5 governance preflight passed with 0 warnings: `bash scripts/governance-preflight.sh`.
- D5 production build passed: `npm run build` completed with the existing Vite chunk-size warning and included `dist/manifest.webmanifest`, `dist/service-worker.js`, `dist/pwa/icon-192.png`, and `dist/pwa/icon-512.png`.
- D5 full unit validation passed: `npm run test` ran 12 files and 88 tests.
- D5 local production preview check on `http://127.0.0.1:5184/` confirmed the manifest link, Apple icon link, manifest name `AI Task Router | Guided AI Labs`, display `standalone`, start URL `/`, two icons, 200 responses for both icon URLs, 200 response for `service-worker.js`, and service-worker install/fetch handlers.
- D6 script syntax validation passed: `node --check scripts\inspect-desktop-artifacts.mjs`.
- D6 config/package JSON parse check passed.
- D6 pre-package `npm run desktop:artifacts` passed and reported no package artifacts.
- D6 internal Windows package build passed: `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:package:windows:internal`.
- D6 generated `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe`, size `1,990,042` bytes, SHA-256 `FF170B0B681AA1954881767524E805C005AF72402C5B0AE7FCB0AF8934AC3BFD`.
- D6 signature checks reported `NotSigned` for both the generated NSIS installer and `src-tauri\target\release\ai-task-router-desktop.exe`.
- D6 script test passed: `npm run test:scripts` ran 2 Node tests.
- D7 governance startup passed: `bash scripts/governance-preflight.sh` reported 0 warnings.
- D7 did not deploy hosting, change DNS, publish a GitHub Release, sign artifacts, upload artifacts, enable an updater, or share social links.
- D7 close-out validation passed: `npm run test` ran 12 files and 88 tests; `npm audit --audit-level=moderate` found 0 vulnerabilities; `bash scripts/governance-preflight.sh` reported 0 warnings; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- Chunk Fifteen installed the missing Playwright Chromium browser cache locally with `npx playwright install chromium`.
- Chunk Fifteen close-out validation passed: `bash scripts/governance-preflight.sh` reported 0 warnings; `npm run test` ran 12 files and 88 tests; `npm run build` passed with the existing Vite chunk-size warning; `npx playwright test` passed 6 Chromium tests; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D8 governance preflight passed with 0 warnings and official source review covered current Cloudflare Pages, GitHub security, and OWASP references.
- D8 added `npm run scan:web-rc` with script tests; `node --check` passed for both new script files and `npm run test:scripts` passed 4 Node tests.
- D8 `npm ci` initially hit `EPERM` on Rolldown's native binding because stale repo-owned Vite dev/preview servers were running; stopping only the `agents\agent-picker` Node processes cleared the lock.
- D8 clean install then passed: 125 packages added, 126 packages audited, 0 vulnerabilities.
- D8 `npm audit --audit-level=moderate` found 0 vulnerabilities.
- D8 `npm run test` passed with 12 files and 88 tests.
- D8 `npm run build` passed with the existing 519.84 kB Vite chunk-size warning.
- D8 `npm run scan:web-rc` passed with no release-blocking findings.
- D8 `npx playwright test` passed with 6 Chromium tests.
- D8 local production preview served root 200, manifest link, Apple icon link, manifest 200 with name `AI Task Router | Guided AI Labs`, display `standalone`, start URL `/`, scope `/`, 192px icon 200, 512px icon 200, service worker 200, install/fetch handlers, and same-origin-only guard.
- D8 close-out validation passed at 2026-07-04T20:35:49-06:00: governance preflight, audit, script tests, unit tests, build, web RC scan, Playwright E2E, and whitespace check all passed; build retained the existing chunk-size warning only.
- D9 governance preflight passed with 0 warnings.
- D9 Cloudflare token/account access succeeded from the master environment file without printing token values.
- D9 Cloudflare Pages project `ai-task-router` was created.
- D9 direct-upload preview deployed at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- D9 deployment API check reported preview environment, successful deploy stage, no environment variables, no Functions, branch `preview-20260704-0c7b253`, and commit `0c7b253`.
- D9 Node HTTPS/fetch returned 200 for preview root, `manifest.webmanifest`, `service-worker.js`, `/pwa/icon-192.png`, and `/pwa/icon-512.png`; both icon paths returned `image/png`.
- D9 Chromium hosted smoke loaded title `AI Task Router | Guided AI Labs`, first heading `AI Task Router`, manifest link `/manifest.webmanifest`, service worker registration, and 0 observed external requests.
- D9 local `npx playwright test` passed with 6 Chromium tests after adding `PLAYWRIGHT_BASE_URL` support.
- D9 hosted `PLAYWRIGHT_BASE_URL=https://preview-20260704-0c7b253.ai-task-router.pages.dev npx playwright test` passed with 6 Chromium tests.
- D9 final validation passed: `npm audit --audit-level=moderate`, `npm run test:scripts`, `npm run test`, `npm run build`, and `npm run scan:web-rc`. Build retained the existing Vite chunk-size warning only.
- D16 validation passed: governance preflight 0 warnings; focused impact/App tests; full Vitest 13 files and 95 tests; production build with existing Vite chunk-size warning; web RC scan; local Playwright 6 Chromium tests; desktop/mobile visual smoke with no horizontal overflow; source-details-open mobile smoke; Cloudflare production deploy `cd2c5112` from source `b4daec6`; hosted asset checks; hosted Playwright 6 Chromium tests; hosted impact smoke with visible caveat, 0 initial external requests, and no desktop overflow.
- D17 validation passed: governance preflight 0 warnings; official Tauri/Microsoft/Apple signing and pipeline source review; `node --check` for the gate script and tests; `npm run test:scripts` with 8 Node tests; workflow YAML lint; full Vitest 13 files and 95 tests; production build with existing Vite chunk-size warning; web RC scan; audit 0 vulnerabilities; Windows technical-preview package hash `F7086F7F4D87379111F81FC9F839C88C566B46C3F1E931280DBE1E18E4CD80B4`; technical-preview gate passed; public gate failed as expected; installer/executable `NotSigned`.
- D18 validation passed: focused TypeScript/schema/generator/export/App tests; full Vitest 13 files and 96 tests; production build with existing Vite chunk-size warning; web RC scan; audit 0 vulnerabilities; governance preflight 0 warnings; local Playwright 6 Chromium tests; local desktop/mobile visual smoke with no horizontal overflow; Cloudflare production deploy `98a58ca6` from source `9d3154d`; hosted asset checks; hosted Playwright 6 Chromium tests; hosted stage-guidance smoke with 4 stage cards, 0 initial external requests, and no desktop overflow.
- D19 validation passed: focused TypeScript/App tests; full Vitest 13 files and 96 tests; production build with existing Vite chunk-size warning; web RC scan; audit 0 vulnerabilities; governance preflight 0 warnings; local Playwright 6 Chromium tests; local and hosted PDF-report smokes with no desktop/mobile overflow; hosted smoke observed 0 external requests; Cloudflare production deploy `49d21829` from source `9c870ce`; hosted asset checks; hosted Playwright 6 Chromium tests.
- D20 validation passed with intended public hold: governance preflight 0 warnings; official Microsoft/Apple/Tauri source refresh; `node --check` for desktop gate script and tests; `npm run test:scripts` with 10 Node tests; `npm run test` with 13 files and 96 tests; `npm run build` with the existing Vite chunk-size warning; `npm audit --audit-level=moderate` with 0 vulnerabilities; `npm run desktop:gate:technical-preview` passed artifact hygiene; `npm run desktop:gate:public` failed as expected because no real `docs/release/desktop-public-release-evidence.json` exists and Windows trust evidence remains incomplete; `git diff --check` reported only normal Windows LF-to-CRLF notices.
- D21 validation passed with intended public hold: governance preflight 0 warnings; official Microsoft WinApp/Tauri and Tauri Windows source review; WinApp CLI `0.4.0` installed locally through Winget; MSIX manifest/assets generated; `node --check` and `npm run test:scripts` passed with 13 Node tests; local MSIX proof package generated with SHA-256 `6668983AE21279E918F1DE6A34E37369E0A6B0BF3E78D0827CF0C0A6AD80EDCD`; technical-preview gate passed; public gate failed as expected; signature check showed local `CN=Guided AI Labs Ltd` signer with untrusted root.

## Known Gaps

- `npm run desktop:dev` still needs the Windows lab Application Control policy issue resolved.
- The current rebuilt unsigned release executable also needs an approved lab policy/signing/trusted-path resolution before launch smoke tests can pass again.
- The generated release Rust test executable also needs the same App Control resolution before final `cargo test --release` execution can pass consistently.
- Some fresh shells may need restart or temporary `.cargo\bin` prepending before Tauri can see Rust.
- Do not bypass or weaken Code Integrity silently.
- Do not add broad filesystem permissions, arbitrary shell/process access, telemetry, provider connections, updater, code signing, public installer publishing, credentials, file indexing, or external actions beyond D6 without a separately approved chunk.
- D4 native local discovery is implemented, but interactive desktop launch smoke remains blocked by Windows Application Control.
- The D6 NSIS installer is unsigned internal evidence only and must not be published or shared with non-technical users.
- D20 `npm run desktop:gate:public` is expected to fail until real platform trust evidence exists at `docs/release/desktop-public-release-evidence.json`.
- The D21 MSIX proof is signed with a local self-signed development certificate only; it is not public-download ready.
- The D21 manual workflow support has not been run remotely yet, so no GitHub Actions MSIX proof artifact currently exists from this chunk.
- D22 `npm run desktop:prepare:windows-store-manifest` is expected to fail until the owner reserves the app in Partner Center and creates `docs/release/windows-store-package-identity.json` from the template with real non-secret package identity values.
- D20-D22 recommend Windows Store/MSIX first, but legal publisher identity, Microsoft Partner Center app reservation/package identity, Store submission/certification, Application Control smoke, WebView2 runtime handling, and install/launch/local-discovery/uninstall smoke remain unresolved.
- Cloudflare Pages production URL exists at `https://ai-task-router.pages.dev/` and includes the D19 PDF-ready saved Decision Card report path.
- Cloudflare Pages project is not connected to GitHub yet; D13 accepted direct upload for the first production web release.
- Old Skool AI public hub and support/security routes are live; Guided AI Labs and Guided AI Journey now link to the hub.
- Guided AI Journey local `main` still has the pre-existing unpushed commit `236fd7e` and is intentionally ahead/behind `origin/main`; D14 was safely pushed from a temporary worktree based on `origin/main` as commit `610438b`.
- A first Vercel deploy attempt from the temporary Journey worktree targeted an accidental temporary Vercel project before `.vercel/project.json` was copied from the real repo. The correct production deployment succeeded and is aliased to `https://www.guidedaijourney.com/`; cleanup of the accidental temporary provider object remains a follow-up if desired.
- Public social launch links have not been created.
- D16 public impact insight is deployed, but it is not an opt-in user-specific savings calculator and is not approved as exact public savings claims.
- D18 suggested-stage guidance is deployed, but it is not a full project plan, live model lookup, provider entitlement check, or automation workflow.
- D19 PDF-ready reports are browser print/save-PDF views of saved Decision Cards, not server-rendered PDF jobs or screenshot capture.
- Provider pricing and environmental anchors must be refreshed before future public exact impact claims because prices, model routing, infrastructure, and provider disclosures can change.
- Custom-domain/DNS work has not been done.
- Windows `curl.exe` and PowerShell `Invoke-WebRequest` passed against the production Pages URL; the D9 preview alias remains historical only.
- Browser install prompts depend on browser support, HTTPS or local preview, and browser-specific engagement rules.
- If deployed under a subpath, Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links must be reviewed before release.

## Next Handoff

Resume by choosing the next bounded release lane: owner-reviewed social/video launch copy using the now-public safe impact, stage-guidance, and PDF-report language; a reviewed public methodology page; an opt-in local estimator UI; the next Windows Store submission slice after Partner Center app reservation; Cloudflare/GitHub/custom-domain automation; or another explicitly approved chunk. For desktop downloads, D20-D22 recommend Windows Store/MSIX first with direct signed installer as fallback. Next desktop work should use real non-secret Partner Center package identity values, run `npm run desktop:prepare:windows-store-manifest -- --write`, rebuild the MSIX, and record Store upload/certification results before ordinary-user beta. Keep post-D22 work bounded: no broad filesystem permissions, arbitrary shell/process execution, startup/background scans, user-supplied paths, provider connections, telemetry, credentials, file indexing, DNS changes, social launch links, public installer publishing, public trusted code signing, updater, GitHub Release artifacts, live pricing/model fetches, exact public savings claims, Partner Center secrets, identity documents, tax/banking details, private account screenshots, or external actions without a separately approved chunk.
