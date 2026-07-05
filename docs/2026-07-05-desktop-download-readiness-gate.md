# 2026-07-05 - Desktop Download Readiness Gate

Document ID: AUD-ENG-007
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-05
Next Review: Before public desktop download links, public GitHub Releases, signing workflows, or controlled desktop beta
Timestamp: 2026-07-05T10:07:48-06:00

## Purpose

This document records Desktop Chunk D17: a machine-checkable desktop download readiness gate.

The owner wants Windows, Mac, and Linux downloads as soon as possible. The safe next step is to make generated artifacts easier to verify and harder to accidentally publish as ordinary-user downloads before trust evidence exists.

## Scope

In scope for D17:

- desktop artifact hygiene gate
- checksum verification against `SHA256SUMS.txt`
- technical-preview hold reporting
- public-download gate that fails until trust evidence exists
- GitHub Actions workflow check before artifact upload
- release docs and handoff updates

Out of scope for D17:

- public desktop download links
- public GitHub Releases
- code signing
- macOS notarization
- Microsoft Store/MSIX submission
- Linux GPG signing
- updater artifacts
- bypassing Windows Application Control
- provider connections, telemetry, credentials, broad filesystem access, or external actions

## Official Source Basis

Primary sources checked during D17:

- Tauri Windows signing guide: https://v2.tauri.app/distribute/sign/windows/
- Tauri macOS signing and notarization guide: https://v2.tauri.app/distribute/sign/macos/
- Tauri GitHub pipeline guide: https://v2.tauri.app/distribute/pipelines/github/
- Microsoft Windows app code-signing options: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options
- Apple notarization overview: https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution

Key D17 interpretation:

- Windows public browser downloads need Store/MSIX trust or signing evidence; unsigned direct downloads are not appropriate for ordinary users.
- macOS public direct downloads need Developer ID signing and notarization evidence.
- Linux packages can be produced earlier, but public links still need checksum publication, smoke tests, dependency notes, and a signature decision.
- Manual GitHub Actions artifacts are useful for platform verification, but they do not replace signing, notarization, smoke tests, support copy, or owner approval.

## Repo Changes

D17 adds:

- `scripts/desktop-release-gate.mjs`: desktop artifact readiness gate.
- `scripts/desktop-release-gate.node-test.mjs`: Node tests for the gate.
- `npm run desktop:gate:technical-preview`: validates artifacts/checksums and reports the public-download hold without failing technical-preview hygiene.
- `npm run desktop:gate:public`: fails until platform trust evidence exists.
- `.github/workflows/desktop-technical-preview.yml` gate step after checksum generation and before artifact upload.

## Gate Behavior

Technical-preview mode is for owner/developer inspection:

```bash
npm run desktop:gate:technical-preview
```

It checks that desktop packages exist, that `SHA256SUMS.txt` exists, and that every checksum line matches the generated artifacts. If artifact hygiene passes, it exits successfully but prints the remaining public-download hold.

Public mode is intentionally stricter:

```bash
npm run desktop:gate:public
```

It currently fails for generated desktop artifacts because signing/notarization, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner desktop launch approval are not complete.

## Release Decision

Public desktop downloads remain held.

D17 improves the path toward downloadable apps by making artifact readiness repeatable and explicit. It does not create a public download, GitHub Release, signing workflow, updater, DNS change, social launch, provider connection, telemetry, or external action.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T09:55:06-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D17 work. |
| 2026-07-05T09:55:06-06:00 | official source review | passed | Tauri Windows/macOS signing, Tauri GitHub pipelines, Microsoft code-signing options, and Apple notarization references were reviewed. |
| 2026-07-05T09:55:06-06:00 | `node --check scripts/desktop-release-gate.mjs`; `node --check scripts/desktop-release-gate.node-test.mjs` | passed | New gate script and tests parse successfully. |
| 2026-07-05T09:55:06-06:00 | `npm run test:scripts` | passed | Node script suite passed 8 tests, including technical-preview hold, public gate failure, stale checksum failure, and artifact platform classification. |
| 2026-07-05T09:55:06-06:00 | `npx --yes yaml-lint .github/workflows/desktop-technical-preview.yml` | passed | Manual technical-preview artifact workflow YAML parsed after adding the gate step. |
| 2026-07-05T10:07:48-06:00 | `npm run test`; `npm run build`; `npm run scan:web-rc`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed with existing build warning | Vitest passed 13 files and 95 tests; production build passed with the existing Vite chunk-size warning; web release-candidate scan passed; audit found 0 vulnerabilities; governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-05T10:07:48-06:00 | `npm run desktop:package:windows:technical-preview`; `npm run desktop:artifacts`; `npm run desktop:checksums`; `npm run desktop:gate:technical-preview` | passed with public download hold | Built Windows NSIS technical-preview installer, size `1.90 MiB`, SHA-256 `F7086F7F4D87379111F81FC9F839C88C566B46C3F1E931280DBE1E18E4CD80B4`; wrote `SHA256SUMS.txt`; technical-preview gate passed artifact hygiene and printed the public-download hold. |
| 2026-07-05T10:07:48-06:00 | `npm run desktop:gate:public` | expected fail | Public gate failed with one release-blocking finding for missing Windows Store/MSIX or Authenticode signing evidence, install/launch/uninstall smoke, and local discovery smoke. |
| 2026-07-05T10:07:48-06:00 | `Get-AuthenticodeSignature` | expected hold | Windows NSIS installer and rebuilt desktop executable both reported `NotSigned`. |

## Handoff

Next desktop work should choose one trust lane rather than publishing unsigned artifacts:

- Windows: decide Microsoft Store/MSIX first versus direct signed installer, confirm publisher identity, then prove signing or Store trust.
- macOS: configure Developer ID signing and notarization on macOS runners before any ordinary-user DMG.
- Linux: run Linux AppImage/`.deb` smoke, publish checksums, and decide whether to sign checksums before public links.

Keep Old Skool AI desktop download buttons hidden or disabled until platform trust gates pass or the owner separately accepts a documented technical-preview exception.
