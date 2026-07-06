# 2026-07-06 - Windows MSIX Proof

Document ID: AUD-ENG-011
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-06
Last Reviewed: 2026-07-06
Next Review: Before controlled Windows beta, Microsoft Partner Center submission, public GitHub Release, or Old Skool AI desktop download link
Timestamp: 2026-07-06T14:08:49-06:00

## Purpose

This document records Desktop Chunk D21: the Windows MSIX proof slice.

The owner asked to get the MSIX proof and downloadable desktop path moving. The safe D21 slice is to make MSIX packaging repeatable, create a local proof artifact, add workflow support for a collaborator-download artifact, and keep public desktop downloads held until real Windows trust evidence exists.

## Scope

In scope for D21:

- install and verify Microsoft WinApp CLI on the Windows lab machine
- add a checked-in MSIX manifest and generated Windows app assets
- add a repeatable local MSIX proof packaging script
- generate a local self-signed development certificate under ignored build output
- build a local signed MSIX proof package and checksum
- add the MSIX proof package step to the manual technical-preview workflow
- document proof evidence and remaining public-release blockers

Out of scope for D21:

- Microsoft Partner Center app reservation or submission
- Store certification
- public GitHub Release artifacts
- Old Skool AI public desktop download buttons
- trusted CA or Azure Artifact Signing setup
- installing the local development certificate on user machines
- claiming SmartScreen, Store, or Application Control public trust
- updater flows, telemetry, provider connections, broad filesystem access, or external actions

## Official Source Basis

Sources reviewed on 2026-07-06:

- Microsoft winapp CLI Tauri guide: https://learn.microsoft.com/en-us/windows/apps/dev-tools/winapp-cli/guides/tauri
- Microsoft winapp CLI usage reference: https://learn.microsoft.com/en-us/windows/apps/dev-tools/winapp-cli/usage
- Microsoft winapp CLI installation overview: https://learn.microsoft.com/en-us/windows/apps/dev-tools/winapp-cli/
- Microsoft setup-WinAppCli GitHub Action: https://github.com/microsoft/setup-WinAppCli
- Tauri Windows installer guide: https://v2.tauri.app/distribute/windows-installer/
- Tauri Windows code-signing guide: https://v2.tauri.app/distribute/sign/windows/
- Tauri Microsoft Store guide: https://v2.tauri.app/distribute/microsoft-store/

Key D21 interpretation:

- Tauri itself still produces Windows EXE/MSI/NSIS paths, while Microsoft documents `winapp` as the current Tauri-to-MSIX proof path.
- MSIX packages must be signed. A self-signed development certificate proves packaging mechanics only; it is not public user trust.
- The Microsoft Store/Partner Center path or a trusted direct-signing path remains required before ordinary users should download the desktop app.

## Repo Changes

D21 updates:

- `src-tauri/windows-msix/Package.appxmanifest` records the provisional package identity `GuidedAILabs.AITaskRouter`, publisher `CN=Guided AI Labs Ltd`, display name `AI Task Router`, and full-trust desktop capability.
- `src-tauri/windows-msix/Assets/` contains WinApp-generated MSIX logo assets derived from the existing Guided AI Labs icon source.
- `scripts/package-windows-msix-proof.mjs` builds/stages the Tauri release executable, copies MSIX manifest/assets, generates a local development certificate under `src-tauri/target/msix-proof`, creates a signed MSIX proof package, writes `SHA256SUMS.txt`, and opts out of WinApp CLI telemetry.
- `scripts/package-windows-msix-proof.node-test.mjs` covers proof paths, safe path containment, and telemetry opt-out.
- `package.json` adds `npm run desktop:package:windows:msix-proof`.
- `.github/workflows/desktop-technical-preview.yml` now sets up WinApp CLI on Windows and builds the MSIX proof package before artifact upload.

## Local Artifact Evidence

Local D21 proof artifact:

| Artifact | Size | SHA-256 | Signature status |
|---|---:|---|---|
| `src-tauri\target\release\bundle\msix\AI-Task-Router_0.2.0.0_x64.msix` | `2.79 MiB` | `6668983AE21279E918F1DE6A34E37369E0A6B0BF3E78D0827CF0C0A6AD80EDCD` | signed by local development certificate; Windows reports untrusted root |

Signature details:

- `Get-AuthenticodeSignature` returned `UnknownError`.
- Status message: certificate chain terminated in a root certificate that is not trusted by the trust provider.
- Signer subject/issuer: `CN=Guided AI Labs Ltd`.
- Certificate validity: 2026-07-06 to 2027-07-06.

Package content smoke:

- `Package.appxmanifest` present.
- `ai-task-router-desktop.exe` present.
- `AppxBlockMap.xml` present.
- `AppxSignature.p7x` present.
- Generated MSIX image assets present.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-06T13:59:23-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D21 work. |
| 2026-07-06T14:08:49-06:00 | official source refresh | passed | Microsoft WinApp CLI/Tauri, Tauri Windows installer/signing/Store, and setup-WinAppCli sources were reviewed. |
| 2026-07-06T14:08:49-06:00 | `winget install Microsoft.WinAppCLI --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity`; `winapp --version` | passed | Installed Microsoft WinApp CLI `0.4.0` on the Windows lab machine. |
| 2026-07-06T14:08:49-06:00 | `winapp manifest generate ...` | passed | Generated MSIX manifest/assets from the existing app icon. |
| 2026-07-06T14:08:49-06:00 | `node --check scripts/package-windows-msix-proof.mjs`; `node --check scripts/package-windows-msix-proof.node-test.mjs`; `npm run test:scripts` | passed | Node script suite passed 13 tests. |
| 2026-07-06T14:08:49-06:00 | `npm run desktop:package:windows:msix-proof` | passed with existing build warning | Built the release executable, generated a self-signed development certificate, created the MSIX proof package, and wrote checksums. |
| 2026-07-06T14:08:49-06:00 | `npm run desktop:package:windows:msix-proof -- --skip-build` | passed | Repackaged from the existing release executable without the earlier Node shell warning. |
| 2026-07-06T14:08:49-06:00 | `npm run desktop:artifacts`; `npm run desktop:gate:technical-preview` | passed with public hold | Gate found the MSIX and existing NSIS artifact, validated `SHA256SUMS.txt`, and held public downloads. |
| 2026-07-06T14:08:49-06:00 | `npm run desktop:gate:public` | expected fail | Public gate failed because no real public release evidence exists at `docs/release/desktop-public-release-evidence.json`. |
| 2026-07-06T14:08:49-06:00 | `Get-AuthenticodeSignature`; package content listing | passed with trust gap | MSIX has an Appx signature and app manifest/exe, but signer chain is untrusted because this is a local development certificate. |
| 2026-07-06T14:25:40-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `npx --yes yaml-lint .github/workflows/desktop-technical-preview.yml`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Full Vitest passed 13 files and 96 tests; production build passed; audit found 0 vulnerabilities; workflow YAML lint passed; governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |

## Release Decision

D21 is task complete for an MSIX proof and collaborator-download path, not public desktop release.

Public desktop downloads remain held. The current MSIX proof is suitable for owner/developer inspection and CI artifact testing only. It is not suitable for ordinary users because the certificate is self-signed, the package has not gone through Microsoft Store/Partner Center, Application Control launch smoke is not passed, WebView2 runtime handling is not finalized for the public lane, and install/launch/local-discovery/uninstall smoke remains incomplete.

## Handoff

Next desktop step:

- confirm the final legal publisher identity and Microsoft Partner Center account path
- reserve/register the Windows app identity or document the selected Store package identity
- run the manual technical-preview workflow after D21 is pushed if a collaborator-download artifact is needed
- decide whether the next trust proof is Microsoft Store submission or a direct signing/Azure Artifact Signing fallback
- keep `docs/release/desktop-public-release-evidence.json` absent until the evidence fields are true and owner-approved

Do not publish public desktop download buttons, public GitHub Releases, or ordinary-user installers until `npm run desktop:gate:public` passes with real evidence and the owner approves public desktop launch.
