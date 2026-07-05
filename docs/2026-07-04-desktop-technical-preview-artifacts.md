# 2026-07-04 - Desktop Technical Preview Artifacts

Document ID: PATH-ENG-004
Version: 0.3.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before publishing any desktop download links
Last Updated: 2026-07-05T10:07:48-06:00
Status Updated: 2026-07-05T10:07:48-06:00

## Purpose

This document records Desktop Chunk D10: a technical-preview artifact lane for Windows, macOS, and Linux desktop builds.

The owner asked for Windows, Mac, and Linux downloads today. The safe interpretation is to create a same-day artifact path for technical review without publishing unsigned or unnotarized installers to ordinary users.

## Scope

In scope for D10:

- manual GitHub Actions workflow for Windows, macOS, and Linux desktop package artifacts
- technical-preview Tauri bundle config
- platform package scripts
- SHA-256 checksum file generation
- release boundary notes for Old Skool AI download-page planning

Out of scope for D10:

- public website download buttons
- public GitHub Releases
- code signing
- macOS notarization
- Microsoft Store/MSIX submission
- Linux GPG signing
- updater artifacts
- bypassing Windows Application Control
- broad filesystem permissions, telemetry, provider connections, credentials, or file indexing

## Official Source Basis

Primary references checked during D10:

- Tauri GitHub Actions pipeline guide: https://v2.tauri.app/distribute/pipelines/github/
- `tauri-apps/tauri-action`: https://github.com/tauri-apps/tauri-action
- Tauri Windows signing guide: https://v2.tauri.app/distribute/sign/windows/
- Tauri macOS signing and notarization guide: https://v2.tauri.app/distribute/sign/macos/

Key D10 interpretation:

- GitHub Actions is an appropriate way to build desktop artifacts on the matching platform runners.
- Windows public direct downloads still need a signing path to avoid ordinary-user trust warnings.
- macOS public direct downloads still need Developer ID signing and notarization.
- Linux artifacts can be produced earlier, but public downloads still need smoke tests, checksums, and preferably signed checksums.

## Repo Changes

D10 adds:

- `.github/workflows/desktop-technical-preview.yml`: manual workflow that builds Windows NSIS, macOS DMG, Linux AppImage, and Linux `.deb` technical-preview artifacts.
- `src-tauri/tauri.technical-preview.conf.json`: shared technical-preview bundle config with updater artifacts disabled.
- `npm run desktop:package:windows:technical-preview`
- `npm run desktop:package:macos:technical-preview`
- `npm run desktop:package:linux:technical-preview`
- `npm run desktop:checksums`
- checksum file writing in `scripts/inspect-desktop-artifacts.mjs`
- Node test coverage for checksum file output.

D17 later adds [Desktop Download Readiness Gate](2026-07-05-desktop-download-readiness-gate.md), `npm run desktop:gate:technical-preview`, `npm run desktop:gate:public`, and a workflow gate step after checksum generation. D17 does not publish desktop downloads.

## Workflow Use

Run the workflow manually from GitHub Actions:

```text
Actions -> Desktop Technical Preview Artifacts -> Run workflow
```

The workflow uploads short-retention GitHub Actions artifacts:

- `ai-task-router-windows-x64-unsigned-nsis`
- `ai-task-router-macos-aarch64-unsigned-dmg`
- `ai-task-router-macos-x64-unsigned-dmg`
- `ai-task-router-linux-x64-appimage-deb`

Each artifact includes its generated packages plus `SHA256SUMS.txt`.

The workflow now runs `npm run desktop:gate:technical-preview` before upload. The gate verifies artifact/checksum alignment and still reports that public downloads remain held.

## Public Download Boundary

The D10 artifacts are not public release artifacts.

They are appropriate for:

- technical owner inspection
- platform build verification
- packaging smoke work
- preparing the future Old Skool AI download page structure

They are not appropriate for:

- public Old Skool AI download buttons
- non-technical beta users
- social launch links
- "safe to install" claims

Before ordinary-user download links are published, the project still needs the D7/D6 gates:

- Windows signing or Store/MSIX path
- macOS Developer ID signing and notarization
- Linux smoke tests and checksum/signature decision
- install, launch, local discovery, clear-results, and uninstall smoke tests on target OSes
- support, vulnerability, withdrawal, and plain-language privacy/local-access page

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-04T21:36:20-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D10 work. |
| 2026-07-04T21:49:15-06:00 | `node --check scripts/inspect-desktop-artifacts.mjs`; `node --check scripts/inspect-desktop-artifacts.node-test.mjs` | passed | Script syntax checks passed. |
| 2026-07-04T21:49:15-06:00 | JSON parse check for `package.json` and `src-tauri/tauri.technical-preview.conf.json` | passed | Both JSON files parsed successfully. |
| 2026-07-04T21:49:15-06:00 | `npx --yes yaml-lint .github/workflows/desktop-technical-preview.yml` | passed | Workflow YAML parsed successfully. |
| 2026-07-04T21:49:15-06:00 | `npm audit --audit-level=moderate` | passed | Found 0 vulnerabilities. |
| 2026-07-04T21:49:15-06:00 | `npm run test:scripts` | passed | Node script suite passed 4 tests, including checksum file output. |
| 2026-07-04T21:49:15-06:00 | `npm run test` | passed | Vitest passed 12 files and 88 tests. |
| 2026-07-04T21:49:15-06:00 | `npm run build` | passed with existing warning | Production build passed with the existing 519.84 kB Vite chunk-size warning. |
| 2026-07-04T21:49:15-06:00 | `npm run scan:web-rc` | passed | Web release-candidate scan found no release-blocking findings. |
| 2026-07-04T21:49:15-06:00 | `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:package:windows:technical-preview` | passed | Built `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe`. |
| 2026-07-04T21:49:15-06:00 | `npm run desktop:artifacts`; `npm run desktop:checksums` | passed | Reported Windows NSIS artifact size `1.90 MiB`, SHA-256 `C6438D8EDBDFFEC8375D9538373F4C2E681DE02EE037474C1C0C11B006CA0B86`, and wrote `src-tauri\target\release\bundle\SHA256SUMS.txt`. |
| 2026-07-04T21:49:15-06:00 | `Get-AuthenticodeSignature` | expected hold | The Windows NSIS installer and rebuilt release executable both reported `NotSigned`. |
| 2026-07-04T21:52:19-06:00 | `git diff --check` | passed | Reported only normal Windows LF-to-CRLF notices. |
| 2026-07-05T10:07:48-06:00 | `npm run test:scripts`; `npx --yes yaml-lint .github/workflows/desktop-technical-preview.yml`; `npm run desktop:package:windows:technical-preview`; `npm run desktop:checksums`; `npm run desktop:gate:technical-preview`; `npm run desktop:gate:public`; `Get-AuthenticodeSignature` | passed with expected public gate failure | D17 added the desktop download readiness gate and workflow check; script suite passed 8 tests; workflow YAML parsed; fresh Windows technical-preview package hash was `F7086F7F4D87379111F81FC9F839C88C566B46C3F1E931280DBE1E18E4CD80B4`; technical-preview gate passed; public gate failed as expected; installer and executable reported `NotSigned`. |

Remote macOS and Linux artifact generation was not run in this local chunk. Run the manual GitHub Actions workflow after the owner confirms technical-preview artifact sharing is acceptable.

## Handoff

If the owner wants public download links next, do not add them directly to `oldskoolai.com` yet. Run `npm run desktop:gate:public` as a blocker check, then complete a signing/trust chunk or explicitly record a technical-preview exception that says the artifacts are unsigned/unnotarized, where they may be shared, who may receive them, and how they can be withdrawn.
