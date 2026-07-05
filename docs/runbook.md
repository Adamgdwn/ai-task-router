# 2026-07-03T11:49:34-06:00 - Runbook

Last Updated: 2026-07-04T20:49:44-06:00
Status: active
Owner: Technical Lead

## Purpose

Describe what this system does in operation.

## Alerts And Failures

List likely failure conditions and what to do first.

## Dependencies

List critical dependencies and how to check them.

## System Tools And Troubleshooting

### Hosted Web/PWA Preview

As of 2026-07-04T18:41:17-06:00, the browser build includes a PWA install path:

- `public/manifest.webmanifest`
- `public/service-worker.js`
- `public/pwa/icon-192.png`
- `public/pwa/icon-512.png`
- install metadata in `index.html`
- production-only service-worker registration in `src/pwa/registerServiceWorker.ts`

Preview command:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5184
```

Troubleshooting:

- The browser install prompt depends on browser support, HTTPS or local preview, and browser-specific engagement rules.
- The app may still be usable as a normal website even when a browser does not show an install prompt.
- The service worker is intentionally not registered during Vite dev mode and not registered inside Tauri.
- The browser/PWA build must not claim it can check the user's computer. Local AI tool discovery requires the desktop app.
- If hosting under a subpath, update Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links before release.

### Public Web Release Readiness

As of 2026-07-04T21:05:03-06:00, D7 selected the intended free distribution path, D8 completed local web/PWA release-candidate evidence, and D9 created the first Cloudflare Pages hosted preview:

- GitHub remains the public source/release hub.
- Cloudflare Pages is the preferred public host.
- Current test preview: `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- Use one canonical app URL and link to it from `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com`; the owner has not confirmed `https://app.oldskoolai.com/`, so choose root, subpath, Cloudflare Pages default URL, or a newly created subdomain under an owned domain before public launch.
- YouTube, Facebook, and LinkedIn links should wait until the web/PWA release gate passes.
- D8 added `npm run scan:web-rc` for production artifact checks.
- D9 added hosted Playwright support through `PLAYWRIGHT_BASE_URL`.

Minimum pre-public checks:

```bash
npm ci
npm audit --audit-level=moderate
npm run test
npm run build
npm run scan:web-rc
npx playwright test
npm run preview -- --host 127.0.0.1 --port 5184
```

Hosted preview E2E:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://preview-20260704-0c7b253.ai-task-router.pages.dev"
npx playwright test
```

Release troubleshooting:

- If `npm ci` fails on Windows with a locked Rolldown native binding, check for stale `agents\agent-picker` Vite dev/preview `node.exe` processes and stop only the repo-owned processes before retrying.
- If Windows `curl.exe` or PowerShell `Invoke-WebRequest` fails TLS against the Cloudflare preview alias, retest with Chromium/normal browsers and the final custom domain before launch. D9 saw this curl/PowerShell issue while Node and Chromium succeeded.
- Do not launch from social channels until the production preview and security checks pass.
- Do not create three independent app deployments unless the service-worker scope, cache, support, and rollback plan are explicit.
- If the owner chooses a subpath instead of a root app domain/subdomain, update Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links first.
- Confirm public copy says the browser/PWA app cannot check the computer.
- Use [release and security readiness packet](2026-07-04-release-security-readiness-packet.md) as the D7 gate.
- Use [web release candidate security pass](2026-07-04-web-release-candidate-security-pass.md) as the D8 local evidence packet.

### Desktop Build Toolchain

As of 2026-07-04T16:04:28-06:00, this Windows machine has the Tauri desktop prerequisites installed and verified:

| Tool | Installed version or evidence | Verification |
|---|---|---|
| Rustup | `1.29.0` | `rustup --version` |
| Rust compiler | `rustc 1.96.1`; default host `x86_64-pc-windows-msvc` | `rustc --version`; `rustup show` |
| Cargo | `cargo 1.96.1` | `cargo --version` |
| Visual Studio Build Tools | Visual Studio Build Tools 2022 `17.14.35` at `C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools` | `vswhere -all -products *` |
| MSVC | `14.44.35207` with `cl.exe` under `VC\Tools\MSVC` | `vswhere -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64` |
| Windows SDK | `10.0.26100.0` under `C:\Program Files (x86)\Windows Kits\10` | `vswhere -requires Microsoft.VisualStudio.Component.Windows11SDK.26100` |
| WebView2 | `149.0.4022.98` | `npm run desktop:info` |

Install source:

- Rustup installed with `winget install --id Rustlang.Rustup --exact --source winget --accept-package-agreements --accept-source-agreements --silent`.
- Build Tools installed with `winget install --id Microsoft.VisualStudio.2022.BuildTools --exact --source winget --accept-package-agreements --accept-source-agreements --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`.

Validation after install:

- `npm run desktop:info` passed all environment checks.
- `cargo metadata --manifest-path src-tauri/Cargo.toml --format-version 1 --no-deps` passed.
- `npm run desktop:build` passed and built `src-tauri\target\release\ai-task-router-desktop.exe`.
- Launch smoke test started the release executable, confirmed the `AI Task Router` window title, and stopped it cleanly.

Current troubleshooting item:

- Some fresh Codex/PowerShell sessions may not inherit the user PATH entry for `C:\Users\adamg\.cargo\bin` even though it is present in the user PATH and the Rust tools are installed. Restart the shell, or temporarily prepend it before desktop checks with `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"`.
- `npm run desktop:dev` starts Vite on port `5173`, but the debug Rust build fails because Windows Application Control blocks Cargo from running `src-tauri\target\debug\build\ai-task-router-desktop-...\build-script-build.exe`.
- Reproduced with direct `cargo build --manifest-path src-tauri/Cargo.toml`.
- Windows Code Integrity logged event IDs `3033` and `3077`; policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}` said the generated build script did not meet Enterprise signing level requirements.
- `citool -lp` could not list policy details in the current non-elevated session (`0x80070005`), and Device Guard reports code integrity enforcement active.
- After the D3 rebuild, `npm run desktop:build` still succeeds when Rust is on PATH, but launching the rebuilt unsigned release executable is also blocked by Windows Application Control. `Get-AuthenticodeSignature` reports it is not digitally signed, SHA-256 `079EF12762D987A877146E6051B32A1E2ED9BC42507B020959F00F2793C7512B`, and Code Integrity events `3033`/`3077` cite the same policy ID.
- After the D4 local-discovery implementation, `npm run desktop:info`, `cargo test --manifest-path src-tauri\Cargo.toml --lib --release --no-run`, `cargo fmt --manifest-path src-tauri\Cargo.toml --check`, and `npm run desktop:build` pass when `C:\Users\adamg\.cargo\bin` is prepended to the current shell PATH. `cargo test --manifest-path src-tauri\Cargo.toml --lib --release` passed earlier in the D4 code loop, but the final rerun was blocked when Windows Application Control prevented the generated release test executable from launching. D4 launch smoke remains unclaimed until the same Windows Application Control issue is resolved.
- Do not weaken or bypass Application Control silently. Resolve through the Windows lab security policy, a trusted development folder/policy exception, or an approved elevated admin troubleshooting session.

### Internal Desktop Packaging

As of 2026-07-04T19:12:31-06:00, Desktop Chunk D6 can build an internal unsigned Windows NSIS installer for evidence only:

```powershell
$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"
npm run desktop:package:windows:internal
npm run desktop:artifacts
```

D6 generated:

| Artifact | Size | SHA-256 | Signature |
|---|---:|---|---|
| `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe` | `1,990,042` bytes | `FF170B0B681AA1954881767524E805C005AF72402C5B0AE7FCB0AF8934AC3BFD` | `NotSigned` |

Troubleshooting:

- The D6 package config is `src-tauri/tauri.internal-windows.conf.json`; normal `npm run desktop:build` remains no-bundle.
- The package command uses `--no-sign`; the resulting installer and rebuilt release executable are expected to be unsigned.
- Do not publish, upload, or send the unsigned installer to ordinary users.
- Do not run installer launch/install smoke tests until the lab Application Control/signing/trusted-path issue is resolved through an approved route.
- For public release planning, use [desktop packaging and signing spike](2026-07-04-desktop-packaging-signing-spike.md).

## Recovery

Document service recovery or fallback actions.

## Escalation

Describe who to contact and when.


