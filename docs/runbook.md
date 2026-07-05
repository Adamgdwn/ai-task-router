# 2026-07-03T11:49:34-06:00 - Runbook

Last Updated: 2026-07-04T18:16:13-06:00
Status: active
Owner: Technical Lead

## Purpose

Describe what this system does in operation.

## Alerts And Failures

List likely failure conditions and what to do first.

## Dependencies

List critical dependencies and how to check them.

## System Tools And Troubleshooting

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

## Recovery

Document service recovery or fallback actions.

## Escalation

Describe who to contact and when.


