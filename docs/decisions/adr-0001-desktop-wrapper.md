# ADR-0001: Desktop Wrapper Choice For Trusted Local Discovery

Document ID: ADR-ENG-001
Version: 1.0.0
Status: accepted for spike
Owner: Technical Lead
Approver: Project Owner
Date: 2026-07-04
Status Updated: 2026-07-04T14:51:54-06:00

## Context

AI Task Router is currently a local-first Vite, React, and TypeScript browser app. The v0.2 browser MVP recommends routes, generates prompt packages, saves local records, and exports user-triggered artifacts. It does not call provider APIs, connect accounts, store credentials, upload data, index files, or execute actions.

The owner wants two future distribution paths:

- a hosted/PWA path for low-friction use
- a signed desktop path for people who want permissioned local AI tool and local model discovery

Desktop Chunk D0 set the recommended boundary for the first desktop track. On 2026-07-04T14:51:54-06:00, the owner's instruction to carry on with the next chunk was treated as confirmation of the D0 recommended defaults:

- first desktop scope stays limited to AI tool and local model discovery
- user-selected folder inspection is deferred from the first public desktop release
- Windows is the first target OS, followed by macOS and then Linux packaging
- `Guided AI Labs Ltd` is the provisional publisher identity if it is the correct legal signing entity
- Microsoft Store MSIX should be evaluated before direct signed Windows installers
- governance remains level 1 for docs-only planning, with a stronger control review required before native local discovery implementation

D1 exists to choose the wrapper for the next spike. It must not add desktop code or native discovery yet.

Research basis, reviewed on 2026-07-04:

- Tauri official docs: security overview, capabilities, distribution, Windows code signing, updater signing
- Electron official docs: security guidance and code signing
- MDN and Chrome developer docs: PWA installability and browser file-system access limits

## Decision

Select Tauri for Desktop Chunk D2, the first desktop shell spike.

Keep the hosted web/PWA path as the low-friction public distribution path.

Hold Electron as a fallback if the Tauri spike exposes a practical blocker that materially hurts the product, such as Windows development friction, packaging/signing blockers, accessibility or rendering issues, or an unsafe or awkward native command boundary.

Do not implement local scanning, local model import, folder inspection, auto-update, packaging, signing, telemetry, provider connections, or file indexing in D2.

## Rationale

Tauri is the better first spike candidate for this product because the main trust problem is not "can we show a web UI on desktop?" It is "can ordinary people trust this app when it asks for narrow local machine access?"

Tauri gives the project a smaller desktop shell, keeps the existing web frontend, and makes the frontend/native boundary a first-class design concern. Its capability model is a useful fit for the later requirement that local checks be explicit, allowlisted, read-only, and easy to explain. Tauri's official docs also document platform distribution paths, signing, and update-signature requirements, which matches the trust plan.

Electron remains a credible fallback. It has a mature ecosystem and broad packaging support, but its default mental model brings more Chromium and Node surface area. Electron can still be secure when configured carefully, but for this app it creates more work to prove that the renderer cannot casually reach system capabilities.

The PWA path should continue, but it cannot replace the desktop path for local discovery. PWAs are useful for installation, offline operation, and a normal app-like launcher. Browser local file access is still user-mediated, browser-dependent, and not a good foundation for trusted background-free local AI tool discovery.

## Alternatives Considered

| Option | Fit | Main Benefits | Main Risks | Decision |
|---|---|---|---|---|
| Tauri | Strong | Reuses Vite frontend, small shell, explicit native boundary, strong fit for allowlisted local checks. | Adds Rust/toolchain learning curve, platform packaging quirks, smaller ecosystem than Electron. | Selected for D2 spike. |
| Electron | Medium | Mature desktop ecosystem, familiar JavaScript/Node environment, broad installer tooling. | Heavier runtime, larger attack surface, requires strict security hardening to keep renderer isolated from Node/system access. | Fallback if Tauri blocks. |
| Web/PWA only for longer | Medium for hosting, weak for local discovery | Lowest install friction, keeps current browser security model, avoids desktop signing work. | Cannot provide the trusted native local discovery experience the owner wants. Browser file access remains user-mediated and support varies. | Keep as separate hosted track, not the desktop answer. |

## Consequences

Benefits:

- D2 can focus on proving the current UI launches in a desktop shell.
- Later local discovery can be designed around explicit native commands rather than broad system access.
- The signed desktop trust plan stays aligned with ordinary-user expectations.
- The current browser app remains safe and separately shippable.

Tradeoffs:

- The team must accept Rust/Tauri toolchain setup for desktop work.
- Windows, macOS, and Linux packaging still need their own later spikes.
- Tauri's WebView behavior must be checked on supported operating systems before public beta.
- Auto-update, signing, and installer trust remain later chunks, not solved by this ADR.

Risks and controls:

| Risk | Control |
|---|---|
| The desktop wrapper could quietly expand the app's permission surface. | D2 must launch only the existing UI. No file-system, shell, process, upload, telemetry, or provider permissions are approved. |
| Tauri command defaults could expose too much if later native commands are added casually. | D3 must define every command, input, output, error shape, permission copy, and non-goal before implementation. |
| Users may confuse the hosted/PWA version with the desktop version. | Product copy must distinguish hosted web/PWA capabilities from signed desktop capabilities before public release. |
| Signing and installer trust may be underestimated. | Packaging/signing stays blocked until later release chunks document publisher identity, certificate path, notarization, checksums, and support notes. |

## D2 Work Boundary

Desktop Chunk D2 may:

- add the minimum Tauri scaffold needed to run the current Vite app in a desktop shell
- confirm the current browser build still works
- launch the app locally on Windows
- document new setup commands and prerequisites
- run existing tests, build, and dependency audit

Desktop Chunk D2 must not:

- add native discovery commands
- read files, folders, processes, registries, or model directories from the app
- add Tauri file-system, shell, process, upload, telemetry, updater, OAuth, provider, or credential features
- package or sign public installers
- claim desktop release readiness

## Review Point

Review this ADR after D2.

If the Tauri shell spike is clean, proceed to D3: trust boundary and permission model.

If Tauri blocks the spike, update this ADR with evidence and either retry with a narrower Tauri setup or switch the next spike to Electron.

## Source Notes

- Tauri security: https://v2.tauri.app/security/
- Tauri capabilities: https://v2.tauri.app/security/capabilities/
- Tauri distribution: https://v2.tauri.app/distribute/
- Tauri Windows code signing: https://v2.tauri.app/distribute/sign/windows/
- Tauri updater signing: https://v2.tauri.app/plugin/updater/
- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- Electron code signing: https://www.electronjs.org/docs/latest/tutorial/code-signing
- MDN PWA installability: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- Chrome File System Access API: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
