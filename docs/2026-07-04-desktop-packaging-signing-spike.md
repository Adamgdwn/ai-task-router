# 2026-07-04 - Desktop Packaging And Signing Spike

Document ID: PATH-ENG-003
Version: 0.1.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before Desktop Chunk D7 beta release-candidate work
Last Updated: 2026-07-04T19:20:30-06:00
Status Updated: 2026-07-04T19:20:30-06:00

## Purpose

This document records Desktop Chunk D6: the first packaging and signing spike for AI Task Router.

The goal is to prove that internal desktop package artifacts can be produced without pretending they are public-release ready, and to document the platform trust gates that must pass before ordinary users are asked to download the desktop app.

## Scope

In scope for D6:

- opt-in internal Windows packaging command
- unsigned NSIS package build for local evidence
- artifact size and SHA-256 inspection
- signing and release requirement notes for Windows, macOS, and Linux
- clear public-release blockers

Out of scope for D6:

- public downloads
- publishing to any website or store
- code signing
- notarization
- auto-update
- installer launch/install smoke tests
- weakening or bypassing Windows Application Control
- adding provider connections, telemetry, credentials, file indexing, or broad local permissions

## Official Source Basis

Primary references reviewed for this spike:

- Tauri distribution overview: https://v2.tauri.app/distribute/
- Tauri Windows installer guide: https://v2.tauri.app/distribute/windows-installer/
- Tauri Windows code-signing guide: https://v2.tauri.app/distribute/sign/windows/
- Tauri macOS signing and notarization guide: https://v2.tauri.app/distribute/sign/macos/
- Tauri AppImage guide: https://v2.tauri.app/distribute/appimage/
- Tauri Debian package guide: https://v2.tauri.app/distribute/debian/
- Tauri updater signing guide: https://v2.tauri.app/plugin/updater/
- Microsoft Windows app code-signing options: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options
- Apple notarization overview: https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution

Key D6 interpretation:

- Tauri `build` can produce platform bundles and can split build and bundle work.
- Windows packaging is OS-specific; this Windows lab can build the Windows NSIS package.
- macOS public direct distribution requires signing and notarization.
- Linux distribution should use AppImage first and `.deb` where Debian/Ubuntu support is intended; checksums or signatures are still needed for user trust.
- Tauri updater support is not enabled. If it is added later, updater signatures and private-key custody become a separate security decision.

## Repo Changes

D6 adds:

- `src-tauri/tauri.internal-windows.conf.json`: opt-in internal Windows NSIS packaging config.
- `npm run desktop:package:windows:internal`: builds an unsigned internal NSIS package with `--no-sign` and the D6 config.
- `scripts/inspect-desktop-artifacts.mjs`: lists package artifacts with size and SHA-256.
- `npm run desktop:artifacts`: runs the artifact inspection helper.
- `scripts/inspect-desktop-artifacts.node-test.mjs` and `npm run test:scripts`: Node test coverage for the artifact inspector.

The default `npm run desktop:build` command remains a no-bundle build.

## Internal Windows Package Evidence

Timestamp: 2026-07-04T19:12:31-06:00

| Check | Result | Evidence |
|---|---|---|
| Governance preflight before work | passed | `bash scripts/governance-preflight.sh` reported 0 warnings. |
| Internal package build | passed | `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:package:windows:internal` built one NSIS package. |
| Artifact path | generated | `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe` |
| Artifact size | recorded | `1,990,042` bytes, reported by helper as `1.90 MiB`. |
| Artifact SHA-256 | recorded | `FF170B0B681AA1954881767524E805C005AF72402C5B0AE7FCB0AF8934AC3BFD` |
| Installer signature | not signed | `Get-AuthenticodeSignature` returned `NotSigned` for the NSIS installer. |
| Release executable signature | not signed | `Get-AuthenticodeSignature` returned `NotSigned` for `src-tauri\target\release\ai-task-router-desktop.exe`. |
| Artifact helper test | passed | `npm run test:scripts` ran 2 Node tests. |

The artifact is internal evidence only. It should not be posted publicly or given to non-technical beta users.

## Windows Trust Gates

Before any public Windows download:

- Confirm the legal publisher name. Current provisional name is `Guided AI Labs Ltd`.
- Choose the Windows path: Microsoft Store/MSIX first, direct signed installer, or both.
- If direct distribution is used, choose the signing path. Microsoft currently recommends Azure Artifact Signing for non-Store distribution where available; traditional OV certificates remain an option.
- Sign both the installer and shipped executable where the selected path requires it.
- Timestamp signatures.
- Publish SHA-256 checksums.
- Write release notes, install notes, uninstall notes, and support/withdrawal instructions.
- Run launch, local discovery, clear-results, and uninstall smoke tests on a machine that represents the target user environment.
- Review SmartScreen and Windows Application Control behavior before asking ordinary users to install.

Current blocker:

The Windows lab still blocks unsigned rebuilt desktop executables through Windows Application Control. D6 does not weaken that policy and does not claim desktop launch smoke for the current unsigned package.

## macOS Trust Gates

Before any public macOS download:

- Build on macOS.
- Confirm Apple Developer account ownership and legal team name.
- Use a Developer ID Application certificate for direct distribution.
- Keep hardened runtime enabled unless a reviewed reason says otherwise.
- Notarize with Apple.
- Staple or otherwise verify notarization according to the chosen build flow.
- Decide whether the first macOS beta supports Apple Silicon only, Intel only, or universal binaries.
- Run Gatekeeper launch checks on a clean macOS machine.
- Publish checksums, release notes, install notes, uninstall notes, and support/withdrawal instructions.

D6 did not build macOS artifacts because the current lab environment is Windows.

## Linux Trust Gates

Before any public Linux download:

- Build Linux artifacts on the oldest supported base system practical for the target users.
- Prefer AppImage first for broad compatibility.
- Add `.deb` for Debian/Ubuntu users when install/uninstall smoke tests are ready.
- Review WebKitGTK and GTK package dependencies for the target distribution baseline.
- Publish SHA-256 checksums and consider GPG signatures.
- Run AppImage and `.deb` install/launch/uninstall smoke tests.
- Write Linux-specific support notes for executable permissions, desktop entries, and dependencies.

D6 did not build Linux artifacts because the current lab environment is Windows.

## Release Blockers

Desktop release remains blocked until:

- Windows signing and distribution path are selected and proven.
- macOS signing/notarization path is selected and proven if macOS is advertised.
- Linux artifact/checksum path is selected and proven if Linux is advertised.
- The lab Application Control issue is resolved through an approved policy/signing/trusted-path route.
- Public privacy/local-access copy is reviewed.
- Installer install, launch, discovery, clear-results, and uninstall smoke tests pass on target OSes.

## Next Action

Move to Desktop Chunk D7 only after the owner chooses the beta distribution path and approves the required signing/account work. A safe next slice is a decision packet for:

- Windows Store/MSIX versus direct installer
- legal publisher identity
- whether macOS/Linux are beta targets now or later
- whether auto-update remains deferred
