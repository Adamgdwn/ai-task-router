# 2026-07-06 - Desktop Public Distribution Decision

Document ID: AUD-ENG-010
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-06
Last Reviewed: 2026-07-06
Next Review: Before signing workflows, public GitHub Releases, controlled desktop beta, or Old Skool AI desktop download buttons
Timestamp: 2026-07-06T13:39:30-06:00

## Purpose

This document records Desktop Chunk D20: the public desktop distribution decision and evidence-gate hardening.

The owner approved continuing with D20 after the web/PWA launch. The safe D20 slice is to choose the first trusted desktop distribution lane, make the public release evidence explicit, and keep ordinary-user downloads held until actual platform trust evidence exists.

## Scope

In scope for D20:

- current official source refresh for Windows, macOS, Linux, Tauri, and WebView2 distribution facts
- first trusted Windows lane recommendation
- structured public desktop release evidence manifest template
- desktop public gate update so public mode can pass only when platform trust evidence is recorded
- documentation, runbook, and pathway updates

Out of scope for D20:

- public desktop download buttons
- public GitHub Releases
- code-signing certificate purchase or setup
- Microsoft Store submission
- Azure Artifact Signing setup
- macOS Developer ID signing or notarization
- Linux GPG signing
- installer publishing
- updater workflows
- bypassing Windows Application Control
- provider connections, telemetry, credentials, broad filesystem access, or external actions

## Official Source Basis

Sources refreshed on 2026-07-06:

- Microsoft code signing options for Windows app developers: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options
- Microsoft MSIX signing guide: https://learn.microsoft.com/en-us/windows/msix/package/sign-msix-package-guide
- Microsoft winapp CLI Tauri guide: https://learn.microsoft.com/is-is/windows/apps/dev-tools/winapp-cli/guides/tauri
- Microsoft Azure Artifact Signing quickstart: https://learn.microsoft.com/en-us/azure/artifact-signing/quickstart
- Microsoft WebView2 Runtime distribution: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution
- Tauri Windows signing: https://v2.tauri.app/distribute/sign/windows/
- Tauri macOS signing: https://v2.tauri.app/distribute/sign/macos/
- Tauri Linux signing: https://v2.tauri.app/distribute/sign/linux/
- Apple notarizing macOS software before distribution: https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
- Apple Developer ID: https://developer.apple.com/developer-id/

Key D20 interpretation:

- Microsoft Store MSIX is the preferred first Windows public lane because Microsoft signs/re-signs Store MSIX packages after certification, which avoids this project purchasing and operating a code-signing certificate before first ordinary-user Windows distribution.
- Tauri does not remove the need for Windows or macOS trust. Windows browser downloads still need Store/MSIX trust or Authenticode signing, and macOS direct downloads still need Developer ID signing plus notarization.
- Direct Windows distribution remains a fallback through Azure Artifact Signing or an OV certificate path after publisher identity and signing operations are ready.
- Linux can be distributed without platform code signing, but public links still need generated artifacts, checksum publication, dependency notes, install/launch/local-discovery/uninstall smoke, and a checksum-signature decision.
- Windows WebView2 runtime handling must remain explicit for ordinary-user desktop release.

## D20 Decision

Recommended first trusted desktop path:

| Platform | D20 decision | Reason | Hold until |
|---|---|---|---|
| Windows | Store/MSIX first; direct signed installer remains fallback | Best ordinary-user trust path with less certificate custody burden; Microsoft docs now show Tauri plus MSIX packaging guidance | Microsoft Partner Center/publisher identity, MSIX package identity, Store submission/certification or equivalent evidence, checksums, Application Control smoke, WebView2 plan, install/launch/local-discovery/uninstall smoke |
| macOS | Developer ID signed and notarized DMG later | Required for direct downloads outside Mac App Store | Apple Developer account/team identity, Developer ID certificate, notarization, Gatekeeper smoke, install/launch/local-discovery/uninstall smoke |
| Linux | AppImage first, `.deb` after smoke | Lowest-friction Linux path while preserving checksum and support discipline | Linux runner/package output, checksums, dependency notes, signature decision, install/launch/local-discovery/uninstall smoke |

Public desktop downloads remain held. D20 does not create a public artifact or approve unsigned technical-preview sharing.

## Repo Changes

D20 updates:

- `scripts/desktop-release-gate.mjs` now accepts `--evidence <path>` for public release evidence.
- Public gate mode now looks for `docs/release/desktop-public-release-evidence.json` by default.
- Public gate mode checks top-level release evidence: product name, legal publisher, owner approval, support route, withdrawal plan, and local-access/privacy URL.
- Public gate mode checks platform-specific evidence before any public artifact can pass.
- Windows evidence must include Store/MSIX or Authenticode evidence, signature verification, checksums, Application Control smoke, WebView2 runtime plan, install/launch/local-discovery/uninstall smoke, and artifact type matching the selected lane.
- macOS evidence must include Developer ID signing, notarization, Gatekeeper smoke, checksums, install/launch/local-discovery/uninstall smoke, and artifact type matching the selected lane.
- Linux evidence must include checksum publication, checksum-signature decision, dependency notes, install/launch/local-discovery/uninstall smoke, and artifact type matching the selected lane.
- `docs/release/desktop-public-release-evidence.template.json` provides the future evidence shape while remaining in `hold` state.

## Current Gate Result

The current local Windows NSIS technical-preview artifact remains unsigned and not public-ready.

The D20 public gate correctly fails because no actual public evidence manifest exists at `docs/release/desktop-public-release-evidence.json` and the current artifact still needs Windows trust evidence, checksum publication, Application Control smoke, WebView2 runtime plan, install/launch/uninstall smoke, and local discovery smoke.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-06T13:39:30-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D20 work. |
| 2026-07-06T13:39:30-06:00 | official source refresh | passed | Microsoft, Apple, and Tauri distribution/signing docs were reviewed. |
| 2026-07-06T13:39:30-06:00 | `node --check scripts/desktop-release-gate.mjs`; `node --check scripts/desktop-release-gate.node-test.mjs`; `npm run test:scripts` | passed | Script suite passed 10 tests, including public evidence missing, future Windows MSIX pass, and lane mismatch rejection. |
| 2026-07-06T13:55:02-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed with existing build warning | Full Vitest passed 13 files and 96 tests; production build passed with the existing Vite chunk-size warning; audit found 0 vulnerabilities; governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-06T13:39:30-06:00 | `npm run desktop:gate:technical-preview` | passed with public hold | Existing Windows NSIS artifact hygiene passed; public-download hold remains. |
| 2026-07-06T13:39:30-06:00 | `npm run desktop:gate:public` | expected fail | Public gate failed because no actual public evidence manifest exists and Windows trust evidence remains incomplete. |

## Handoff

The next desktop chunk should be a Windows MSIX proof slice, not public release:

- confirm the legal publisher identity and Microsoft Partner Center path
- add or generate Windows MSIX package identity in a reviewable way
- prove local MSIX packaging with development identity or document why it is blocked
- decide whether Store submission or Azure Artifact Signing is the first real trust proof
- keep `docs/release/desktop-public-release-evidence.json` absent or unapproved until real evidence exists

Do not publish desktop download buttons, public GitHub Releases, or ordinary-user installers until `npm run desktop:gate:public` passes with real evidence and the owner approves public desktop launch.
