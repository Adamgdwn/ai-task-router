# 2026-07-04T15:35:38-06:00 - Implementation Status

Last Updated: 2026-07-04T16:09:09-06:00
Status: desktop-d2-release-shell-verified-dev-mode-blocked
Status Updated: 2026-07-04T16:04:28-06:00
Owner: Technical Lead

## Completed Work

Desktop Chunk D2 shell spike.

Completion target: Draft complete.

Current state: scaffold present; Windows prerequisites installed; no-bundle release build and release executable launch verified; dev mode blocked by Windows Application Control.

## Scope

This slice added the minimum Tauri v2 desktop shell around the existing Vite/React app while keeping the desktop trust boundary closed.

The completed slice provides:

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

## Product Boundary

This D2 scaffold does not add native discovery, folder inspection, package signing, auto-update, provider connections, credential storage, authentication, telemetry, remote sync, provider API calls, external destinations, automatic uploads, file indexing, feedback analytics, best-stack recommendation logic, or execution workflows.

The existing `npm run detect:local-models` command remains explicit and terminal-only.

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

## Known Gaps

- `npm run desktop:dev` does not launch yet because local Windows Application Control blocks generated debug build scripts.
- Tauri reports CSP as unset; keep that under D3 trust-boundary review before native commands are added.
- Public desktop packaging, signing, updater, installer, and local discovery remain out of scope.

## Next Chunk

Either resolve the local Windows Application Control dev-mode blocker through an approved lab policy path, or proceed to Desktop Chunk D3 as design-only trust-boundary work using the verified release-build shell evidence.

Proceeding to implementation beyond shell/trust-boundary design still requires owner approval and must not add native local discovery, folder inspection, packaging, signing, updater, provider connections, telemetry, credentials, file indexing, or external actions.
