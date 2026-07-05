# 2026-07-04T15:35:38-06:00 - Implementation Status

Last Updated: 2026-07-04T21:05:03-06:00
Status: d9-cloudflare-hosted-preview-smoke-complete-release-hold
Status Updated: 2026-07-04T21:05:03-06:00
Owner: Technical Lead

## Completed Work

Desktop Chunk D9 Cloudflare Pages hosted preview smoke, building on D8 local web release-candidate security evidence.

Completion target: Task complete, release hold.

Current state: D9 is task complete with public release still held. The browser/PWA artifact has local release-candidate evidence and a Cloudflare Pages hosted preview at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`. Hosted Node/Chromium HTTPS smoke, hosted Playwright E2E, audit, script tests, unit tests, production build, and web artifact scan all passed. The next hosted-release step is owner-confirmed canonical URL selection, Cloudflare GitHub-integration/direct-upload decision, custom-domain smoke if used, and owner launch decision before public website links or social launch.

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

## Product Boundary

This desktop track now adds narrow native discovery for selected local AI tools only and an opt-in internal unsigned Windows package build for evidence. The browser/PWA track adds installability, D8 local release-candidate evidence, and a D9 Cloudflare Pages hosted test preview. Neither track adds arbitrary folder inspection, code signing, public installer publishing, auto-update, provider connections, credential storage, authentication, telemetry, remote sync, provider API calls, external destinations, automatic uploads, file indexing, feedback analytics, best-stack recommendation logic, custom-domain/DNS changes, public website links, social launch links, or execution workflows.

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

## Known Gaps

- `npm run desktop:dev` does not launch yet because local Windows Application Control blocks generated debug build scripts.
- The current rebuilt unsigned release executable does not launch because local Windows Application Control blocks it.
- The generated release Rust test executable from final close-out does not launch because local Windows Application Control blocks it.
- Some fresh shells may need a restart or temporary `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"` before Tauri can see Rust.
- Public desktop packaging, signing, updater, and installer distribution remain out of scope.
- The D6 NSIS installer is unsigned internal evidence only and must not be published or shared with non-technical users.
- Interactive desktop launch smoke for D4 remains blocked until the lab Application Control/signing/trusted-path issue is resolved.
- Cloudflare Pages hosted preview exists, but public launch has not happened.
- Cloudflare Pages project is not connected to GitHub yet; production release path still needs a GitHub-integration vs direct-upload decision.
- Public social launch links have not been created.
- The canonical public app URL still needs owner confirmation before public launch.
- Custom-domain/DNS work has not been done.
- Windows `curl.exe` and PowerShell `Invoke-WebRequest` hit a TLS handshake failure against the preview alias while Node and Chromium passed; retest normal browsers and final domain before public launch.
- Browser install prompts depend on browser support, HTTPS or local preview, and browser-specific engagement rules.
- If the hosted app is deployed under a subpath rather than a domain root, Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links must be reviewed before release.

## Next Chunk

Choose the canonical URL from the owner-controlled domains or Cloudflare Pages default URL, decide whether Cloudflare Pages should be GitHub-connected before production or use a documented direct-upload release process, and smoke the canonical/custom domain before public links. Run Chunk Sixteen first if the owner wants documentation and polish tightened before public launch.

Proceeding beyond D9 still requires owner approval and must not add broad filesystem permissions, arbitrary shell execution, arbitrary folder inspection, code signing, updater, provider connections, telemetry, credentials, file indexing, Cloudflare production/canonical launch, public installer publishing, DNS changes, GitHub Release artifacts, social launch links, or external actions without a separate approved chunk.
