# 2026-07-06 - Windows Store Trust Prep

Document ID: AUD-ENG-012
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-06
Last Reviewed: 2026-07-06
Next Review: Before Partner Center submission, Store certification, public desktop beta, or Old Skool AI desktop download link
Timestamp: 2026-07-06T15:24:36.2422654-06:00

## Purpose

This document records Desktop Chunk D22: the Windows Store trust-prep slice.

The owner asked to proceed with the Microsoft Store/MSIX trust path only if it is the solid and fast path, not ceremony. The safe D22 slice is to confirm that Store/MSIX remains the most effective first Windows trust lane, prepare the repo to accept real Partner Center identity values, and keep public desktop downloads held until Microsoft Store certification or equivalent trusted signing evidence exists.

## Scope

In scope for D22:

- refresh current official Microsoft and Tauri distribution guidance
- compare Store/MSIX with direct download signing for ordinary-user trust
- add a Partner Center package identity template
- add a repeatable manifest-prep script that refuses placeholder identity values
- document the owner action path required in Partner Center
- keep the existing self-signed MSIX proof as owner/developer-only

Out of scope for D22:

- creating a Microsoft developer account
- reserving the Store app name
- entering government ID, company, tax, banking, or legal verification details
- Store submission or certification
- trusted signing setup, Azure Artifact Signing setup, OV certificate purchase, or public GitHub Release creation
- filling `docs/release/desktop-public-release-evidence.json`
- public desktop download buttons or ordinary-user installer publication

## Official Source Basis

Sources reviewed on 2026-07-06:

- Microsoft code-signing options for Windows app developers: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options
- Microsoft app package requirements for MSIX apps: https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/app-package-requirements
- Microsoft Partner Center developer account setup: https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/open-a-developer-account
- Microsoft publish-your-first-Windows-app guide: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/publish-first-app
- Microsoft choose-a-distribution-path guide: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/choose-distribution-path
- Microsoft MSIX signing guide: https://learn.microsoft.com/en-us/windows/msix/package/sign-msix-package-guide
- Microsoft MSIX Identity manifest reference: https://learn.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-f-identity
- Microsoft MSIX troubleshooting guide: https://learn.microsoft.com/en-us/windows/msix/msix-troubleshooting-guide
- Microsoft Artifact Signing integrations: https://learn.microsoft.com/en-us/azure/artifact-signing/how-to-signing-integrations
- Tauri Microsoft Store guide: https://v2.tauri.app/distribute/microsoft-store/

Key D22 interpretation:

- Microsoft Store MSIX remains the fastest credible path for ordinary-user Windows trust because Microsoft re-signs accepted MSIX/AppX packages after certification.
- Direct download remains a fallback, but it requires Azure Artifact Signing or an OV certificate and may still see SmartScreen reputation prompts early.
- Self-signed MSIX remains useful for development and tester proof only; ordinary users should not be asked to trust a local certificate.
- The Tauri Microsoft Store page still documents a Store path using signed EXE/MSI installers, while Microsoft now documents WinApp CLI for Tauri MSIX packaging. D21 already proved the Microsoft WinApp CLI MSIX path locally. D22 keeps Store/MSIX first but records direct signed installer fallback if Partner Center rejects this package shape or Store policy creates a blocker.

## Effectiveness Decision

| Option | Speed | User trust | Cost/custody | D22 decision |
|---|---|---|---|---|
| Microsoft Store MSIX | Fastest credible public route after account verification and certification | Best ordinary-user Windows install experience; Microsoft handles Store MSIX signing | No separate CA certificate or private-key custody for Store MSIX | Use first |
| Direct MSIX/installer with Azure Artifact Signing | Good fallback after Azure identity validation | Trusted signature, but SmartScreen reputation may still build over time | Monthly service and signing workflow setup | Keep as fallback |
| Direct MSIX/installer with OV certificate | Viable fallback | Trusted signature, but reputation may still build over time | Certificate purchase and key custody/HSM workflow | Keep as fallback |
| Self-signed MSIX | Already working locally | Not acceptable for ordinary users | Free but manual trust is unsafe for public users | Developer/tester proof only |

Decision:

Proceed with Store/MSIX first. This is not hoop-jumping; it removes the most user-hostile Windows warning path without adding certificate operations before the first public desktop release. The next blocker is not code. It is the owner-controlled Partner Center account, legal publisher identity, and reserved app identity.

## Repo Changes

D22 updates:

- `docs/release/windows-store-package-identity.template.json` records the exact Partner Center identity values the owner must copy after reserving the app.
- `scripts/prepare-windows-store-manifest.mjs` validates a real `docs/release/windows-store-package-identity.json` file and applies those values to `src-tauri/windows-msix/Package.appxmanifest` only when explicitly run with `--write`.
- `scripts/prepare-windows-store-manifest.node-test.mjs` covers placeholder rejection, MSIX version validation, publisher shape validation, manifest replacement, and XML escaping.
- `package.json` adds `npm run desktop:prepare:windows-store-manifest`.

The checked-in MSIX manifest remains provisional until the owner has real Partner Center values. D22 does not create `docs/release/windows-store-package-identity.json`.

## Owner Action Packet

When ready to move from repo prep into Microsoft-controlled work:

1. Start at `https://storedeveloper.microsoft.com/`, not a legacy Partner Center entry point.
2. Choose the correct account type before registration. Use a Company account if the public publisher should be `Guided AI Labs Ltd`; Microsoft documents that changing an Individual account to Company is not supported.
3. Complete Microsoft identity or company verification.
4. In Partner Center Apps and Games, reserve the public app name, expected first choice: `AI Task Router`.
5. Open the app's Product identity or package identity page and copy the exact Package/Identity/Name and Publisher values.
6. Copy `docs/release/windows-store-package-identity.template.json` to `docs/release/windows-store-package-identity.json`.
7. Set `status` to `partner-center-confirmed`, set `legalPublisher`, and paste the exact `msix.identityName` and `msix.publisher` values from Partner Center.
8. Run `npm run desktop:prepare:windows-store-manifest`.
9. If validation passes, run `npm run desktop:prepare:windows-store-manifest -- --write`.
10. Build the MSIX with `npm run desktop:package:windows:msix-proof -- --skip-build` after a fresh `npm run desktop:build`, or run the full MSIX package command.
11. Use Partner Center submission/certification evidence, not local self-signed evidence, before creating any public desktop release evidence.

Do not put government ID images, tax information, banking information, Partner Center secrets, Azure secrets, or private account screenshots in this repository.

## Current Trust State

D22 is task complete for Store trust preparation only.

The local MSIX proof remains signed with a local development certificate and is still not public-download ready. Public desktop release remains held until:

- Partner Center identity is confirmed
- the MSIX manifest matches Partner Center values
- Store submission/certification or equivalent trusted signing evidence passes
- checksum publication is ready
- install/launch/local-discovery/uninstall smoke passes
- Windows Application Control behavior is documented
- WebView2 runtime handling is recorded
- owner launch approval is recorded
- `npm run desktop:gate:public` passes with real evidence

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-06T15:24:36.2422654-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D22 work. |
| 2026-07-06T15:24:36.2422654-06:00 | official source refresh | passed | Microsoft Store/MSIX, Partner Center, signing, Artifact Signing, MSIX identity, and Tauri Store guidance were reviewed. |
| 2026-07-06T15:35:57-06:00 | `node --check scripts/prepare-windows-store-manifest.mjs`; `node --check scripts/prepare-windows-store-manifest.node-test.mjs`; JSON parse check for `package.json` and `docs/release/windows-store-package-identity.template.json` | passed | New script, test file, package script, and identity template parsed. |
| 2026-07-06T15:35:57-06:00 | `npm run test:scripts` | passed | Node script suite passed 18 tests, including placeholder rejection, MSIX version validation, publisher shape validation, manifest replacement, and XML escaping. |
| 2026-07-06T15:35:57-06:00 | `npm run desktop:prepare:windows-store-manifest` | expected fail | Failed because `docs/release/windows-store-package-identity.json` does not exist yet. This is the intended hold until the owner reserves the app in Partner Center. |
| 2026-07-06T15:35:57-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate` | passed with existing build warning | Vitest passed 13 files and 96 tests; production build passed with existing chunk-size warning; audit found 0 vulnerabilities. |
| 2026-07-06T15:35:57-06:00 | `npm run desktop:gate:technical-preview`; `npm run desktop:gate:public` | passed with expected public gate failure | Technical-preview artifact hygiene passed for the local MSIX and NSIS artifacts. Public gate failed as expected because no real public release evidence exists. |
| 2026-07-06T15:35:57-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |

## Handoff

Next desktop step:

- owner completes Partner Center account/app reservation and provides non-secret package identity values
- fill `docs/release/windows-store-package-identity.json` from the template
- run the manifest-prep command, write the manifest, rebuild the MSIX, and attempt Store package upload
- update this packet or add a new Store submission evidence packet with actual Partner Center results

Do not create `docs/release/desktop-public-release-evidence.json`, public GitHub Releases, public desktop download buttons, signing workflows, or ordinary-user installers until real Store certification or trusted signing evidence exists.
