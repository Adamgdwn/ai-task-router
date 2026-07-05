# 2026-07-04T15:35:38-06:00 - Implementation Status

Last Updated: 2026-07-04T18:16:13-06:00
Status: desktop-d4-permissioned-local-discovery-build-validated
Status Updated: 2026-07-04T18:16:13-06:00
Owner: Technical Lead

## Completed Work

Desktop Chunk D4 permissioned local AI tool detection, building on the Desktop Chunk D3 trust boundary.

Completion target: Integration complete.

Current state: D4 local discovery prototype implemented; scaffold present; Windows prerequisites installed; no-bundle desktop build passes; dev mode and unsigned release executable launch remain blocked by Windows Application Control.

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

## Product Boundary

This desktop track now adds narrow native discovery for selected local AI tools only. It still does not add arbitrary folder inspection, package signing, auto-update, provider connections, credential storage, authentication, telemetry, remote sync, provider API calls, external destinations, automatic uploads, file indexing, feedback analytics, best-stack recommendation logic, or execution workflows.

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

## Known Gaps

- `npm run desktop:dev` does not launch yet because local Windows Application Control blocks generated debug build scripts.
- The current rebuilt unsigned release executable does not launch because local Windows Application Control blocks it.
- The generated release Rust test executable from final close-out does not launch because local Windows Application Control blocks it.
- Some fresh shells may need a restart or temporary `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"` before Tauri can see Rust.
- Public desktop packaging, signing, updater, and installer remain out of scope.
- Interactive desktop launch smoke for D4 remains blocked until the lab Application Control/signing/trusted-path issue is resolved.

## Next Chunk

Either proceed to Desktop Chunk D5 for the hosted/PWA install path, resolve the local Windows Application Control blockers through an approved lab policy/signing/trusted-path route before interactive desktop smoke tests, or move to D6 packaging/signing research as build-only work.

Proceeding beyond D4 still requires owner approval and must not add broad filesystem permissions, arbitrary shell execution, arbitrary folder inspection, packaging, signing, updater, provider connections, telemetry, credentials, file indexing, or external actions without a separate approved chunk.
