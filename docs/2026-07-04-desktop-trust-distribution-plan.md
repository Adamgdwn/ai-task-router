# 2026-07-04 - Desktop Trust And Distribution Plan

Document ID: PATH-ENG-002
Version: 0.10.1
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before D8 web release candidate work, public web hosting, or controlled desktop beta work
Last Updated: 2026-07-04T20:49:44-06:00
Status Updated: 2026-07-04T20:49:44-06:00

Planning state: Desktop Chunk D0 confirmed and Desktop Chunk D1 ADR accepted for a Tauri shell spike. Desktop Chunk D2 has the repo-local Tauri shell scaffold, branded icon assets, desktop npm scripts, installed Windows build prerequisites, a passing no-bundle desktop build, and a previously verified release executable launch. Desktop Chunk D3 defined the frontend/native trust boundary, command contracts, user permission flow, local data handling, response schemas, and CSP hardening. Desktop Chunk D4 implements the first permissioned local AI tool discovery prototype with custom Rust commands, frontend schema validation, a user-started `Check this computer` flow, no broad Tauri plugin permissions, no paths returned, no startup/background scanning, and build-only desktop validation. Desktop Chunk D5 implements the hosted/browser PWA install path with manifest, 192px/512px branded icons, production-only service-worker registration, Start Here install copy, and explicit browser-vs-desktop local-discovery boundaries. Desktop Chunk D6 adds an opt-in internal Windows NSIS package build, artifact checksum inspection, and signing requirements documentation while keeping public release blocked. Desktop Chunk D7 records the release/security readiness packet, selecting Cloudflare Pages plus GitHub as the intended free distribution path. D8 records the web/PWA release-candidate security pass, adds repeatable artifact scanning, and verifies local clean install/audit/tests/build/E2E/production-preview evidence while still holding public launch until Cloudflare Pages HTTPS preview, canonical URL confirmation, and custom-domain smoke pass. Dev mode remains blocked by Windows Application Control when Cargo tries to run a generated debug build script; the current rebuilt unsigned release executable and generated release test executable launch remain blocked until the lab policy/signing/trusted-path issue is resolved.

## Purpose

This plan defines how AI Task Router can grow from a local-first browser app into a trusted installable desktop app for Windows, macOS, and Linux, without weakening the current MVP boundary.

The product goal is two-option distribution:

1. Hosted web app or installable PWA for people who want to try the tool immediately.
2. Signed desktop app for people who want the app to inspect their own computer for local AI tools, local models, and later user-approved folders.

The desktop version exists because local machine inspection changes the trust promise. If the app asks to look around a user's computer, it must be explicit, narrow, understandable, reversible, and distributed in a way normal people can trust.

## Current Repo Reality

- The current app is a Vite, React, and TypeScript web app.
- The current build artifact is static browser output from `npm run build`.
- The browser build now includes a PWA install path: web app manifest, service worker, and branded 192px/512px icons.
- Browser storage is local IndexedDB through Dexie.
- The app is recommendation-only. It does not call provider APIs, connect accounts, store credentials, upload files, index folders, or execute external actions.
- `npm run detect:local-models` exists as a separate explicit local command. It checks Ollama and common local model folders, prints a summary by default, and does not change app state.
- The desktop prototype now has a D4 `Check this computer` flow for selected local AI tools only; it does not return paths, run at startup, use broad Tauri plugin permissions, or claim public packaging/signing readiness.
- The hosted/browser install path does not perform local discovery. It says computer checking requires the desktop app.
- The D6 internal Windows package path can generate an unsigned NSIS installer for evidence only. It is not public release readiness.
- The D8 web/PWA release-candidate pass is complete locally, but Cloudflare hosting has not been created or smoke tested yet.

The current project classification in `project-control.yaml` is:

- Primary use case: AI decision-support web application
- Risk tier: low
- Governance level: 1
- Sensitive data: false for the MVP
- Production action capability: none

## Governance Mismatch Warning

The selected governance level remains unchanged by this planning document.

However, a signed desktop app that inspects local tools, model folders, or user-selected directories is a higher-trust product surface than the current browser MVP. Before implementation beyond a prototype spike, the owner should review whether the project classification, risk tier, required docs, release gates, and review level still fit.

Recommended stronger controls for the desktop track:

- threat model before native filesystem access
- explicit local permission matrix
- security review before public installers
- signed release artifacts before public download
- documented rollback and revocation path
- release checks on each target OS
- clear user-facing privacy and local access language

No governance level should be changed without an explicit owner decision.

## Recommended Product Shape

### Track A: Hosted Web App And PWA

The web app should remain the low-friction entry point.

Use this for:

- task intake
- AI tool selection by the user
- route cards
- prompt packages
- local browser storage
- manual exports
- learning and guided workflows
- "install from browser" PWA experience where supported

Do not use this for:

- broad local filesystem access
- local model discovery
- background scanning
- command execution
- private folder indexing

Trust promise:

> This version runs in your browser and only uses what you type or choose in the app.

### Track B: Signed Desktop App

The desktop app should be the trusted local assistant.

Use this for:

- checking whether common local AI tools are installed
- detecting user-approved local model tools such as Ollama, LM Studio, Jan, GPT4All, llama.cpp, Open WebUI, and similar tools
- checking common model folders with strict limits
- letting the user choose a folder to inspect later, if that feature is approved
- writing desktop-specific settings in the app's local data area
- future user-approved local inventory workflows

Do not use this for:

- silent startup scanning
- recursive home drive indexing
- file-content reading by default
- provider account login
- credentials
- telemetry
- remote sync
- automatic uploads
- autonomous execution
- changing files, sending messages, deploying, purchasing, or publishing

Trust promise:

> This version only checks the local areas you approve, shows what it found, and lets you remove anything.

## Technology Recommendation

The selected spike candidate is Tauri.

Why it fits:

- It can wrap the existing Vite/React app instead of rebuilding the UI.
- It supports Windows, macOS, and Linux from one app codebase.
- It keeps native system access behind a Rust command layer instead of giving the frontend broad machine access.
- It has a permission and capability model that fits a least-privilege local app.
- It produces smaller desktop apps than many Chromium-bundled alternatives.

Current official references:

- Tauri security model: https://v2.tauri.app/security/
- Tauri distribution and signing docs: https://v2.tauri.app/distribute/
- Tauri Windows signing docs: https://v2.tauri.app/distribute/sign/windows/
- Tauri macOS signing docs: https://v2.tauri.app/distribute/sign/macos/
- Microsoft Windows app code signing options: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options
- Apple notarization docs: https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
- Desktop Chunk D6 packaging/signing spike: [docs/2026-07-04-desktop-packaging-signing-spike.md](2026-07-04-desktop-packaging-signing-spike.md)

Desktop Chunk D1 selected Tauri for the first desktop shell spike. See [ADR-0001: Desktop Wrapper Choice For Trusted Local Discovery](decisions/adr-0001-desktop-wrapper.md). Tauri is accepted for the D2 spike only; the project can still fall back to Electron if D2 produces evidence that Tauri is a poor fit.

## Trust Principles

These principles should apply to every desktop feature:

1. No silent scan.
2. No background inventory.
3. No broad recursive search by default.
4. No reading file contents unless a later feature explicitly needs it and the owner approves it.
5. No uploading local inventory or file paths.
6. No telemetry unless separately designed, disclosed, and approved.
7. No credentials, provider tokens, OAuth, or account passwords.
8. No provider API calls in the local discovery workflow.
9. No destructive actions.
10. No command execution except narrow, reviewed, read-only checks such as `ollama list`.
11. Native commands must have timeouts.
12. Returned reports should summarize by default and hide private path details unless the user asks to see them.
13. The user can skip, cancel, rerun, and clear local discovery.
14. The app explains results in plain language.
15. All native responses are validated before the frontend trusts them.

## Desktop Architecture

### Boundary

The desktop app should keep the browser UI and native machine access separated.

Frontend:

- renders the current React app
- asks for consent in plain language
- calls a small set of native commands
- validates native responses with TypeScript/Zod schemas
- stores user-approved results locally
- never receives unrestricted filesystem access

Native layer:

- owns filesystem and process checks
- exposes allowlisted commands only
- validates command inputs
- limits searched paths
- limits recursion depth
- redacts or summarizes sensitive paths
- returns structured results
- logs only safe operational summaries

### Initial Native Commands

The first desktop spike should expose only these candidate commands:

- `check_local_ai_tools(options)`: check selected known tools and common install/model paths.
- `check_ollama()`: run `ollama list` with a short timeout if the user selected Ollama checking.
- `choose_folder_for_check()`: open a native folder picker, then inspect only that selected folder according to a narrow rule.
- `clear_local_discovery_results()`: clear app-stored local discovery results.

No command should:

- scan the whole drive
- scan the entire home folder
- upload anything
- modify files
- execute arbitrary user-supplied shell text
- run provider CLIs other than reviewed read-only commands

### Local Discovery Data Model

The desktop discovery report should use a small structured shape:

- checkedAt
- platform
- appVersion
- checksRequested
- toolsFound
- toolsNotFound
- warnings
- userApprovedFolders
- privateDetailsHidden

Each found tool should include:

- toolLabel
- detectionMethod
- confidence
- modelCount if known
- modelNames only when the user chooses to reveal them
- safeUserMessage
- addToMyToolsAction

## User Experience Plan

The desktop flow should be written for ordinary users, not developers.

Possible screen title:

> Check this computer

Plain-language intro:

> We can look for AI tools already on this computer. You choose what we check. Nothing is uploaded.

Initial choices:

- Check common AI app locations
- Check Ollama
- Let me choose a folder
- Skip for now

Before running:

- Show exactly what will be checked.
- Say that the check is local-only.
- Say that it may take a few seconds.
- Provide Cancel.

After running:

- "We found Ollama with 3 local models."
- "We found an LM Studio model folder."
- "We did not find Jan in common locations."
- "Add Ollama to My AI Tools"
- "Show details"
- "Hide details"
- "Clear these results"

Avoid:

- "filesystem permissions"
- "source permissions"
- "routing metadata"
- "capability assumptions"
- "technical routing details"
- "artifact packaging"
- "provider verification"

Use:

- "What should we check?"
- "What we found"
- "Add this tool"
- "Nothing leaves your computer"
- "Clear results"

## Distribution Strategy

### Web/PWA Release

Preferred public entry:

- canonical product page on `oldskoolai.com`
- links from `guidedailabs.com` and `guidedaijourney.com`
- optional browser install prompt after the hosted app is ready

Release requirements:

- production static build from clean install
- app manifest
- branded icons
- no hidden external calls
- clear limitations
- no desktop discovery claims on the browser version
- smoke tests on desktop and mobile browsers

### Windows Desktop Release

Preferred public trust path:

1. Internal unsigned development builds only for local testing.
2. Signed beta build before any non-technical users download it.
3. Microsoft Store MSIX path should be evaluated first because Store MSIX packages are re-signed by Microsoft.
4. If distributing directly, use a recognized signing path and expect SmartScreen reputation to build over time.

Release artifacts to evaluate:

- MSIX for Store path
- MSI or NSIS installer for direct path only after signing is solved
- portable ZIP only for internal testing or advanced users

Required before public Windows download:

- signed installer or Store package
- publisher identity matches the brand/legal entity
- checksum published
- release notes
- uninstall path verified
- SmartScreen behavior documented and reviewed

### macOS Desktop Release

Preferred public trust path:

1. Build on macOS.
2. Sign with Apple Developer ID.
3. Notarize with Apple.
4. Distribute DMG or app bundle through the product site after notarization passes.

Required before public macOS download:

- paid Apple Developer account
- Developer ID Application certificate
- hardened runtime where required
- notarization pass
- Gatekeeper launch check
- Apple Silicon and Intel support decision
- uninstall notes

### Linux Desktop Release

Preferred public trust path:

1. AppImage for broad compatibility.
2. `.deb` for Debian/Ubuntu users.
3. `.rpm` later if demand exists.
4. Signed checksums for every release artifact.
5. Package repository only after release flow stabilizes.

Required before public Linux download:

- AppImage smoke test
- Debian/Ubuntu install smoke test if `.deb` is offered
- permissions reviewed
- checksum published
- release notes
- uninstall notes

## Phased Work Plan

### Phase 0: Owner Decisions And Risk Review

Goal:

Confirm the desktop product boundary before implementation.

Questions to answer:

- Should desktop discovery remain limited to AI tools and models for the first release?
- Should the desktop app inspect user-selected folders in the first release, or defer that?
- Is the brand/publisher name Guided AI Labs Ltd, OldSkoolAI, or another legal name?
- Which OS is the first desktop target: Windows first, then macOS/Linux, or all three together?
- Should Windows public release prefer Microsoft Store, direct download, or both?
- Should macOS public release require notarization before any external beta?
- Should the governance level stay as-is for planning and rise only before implementation?

Deliverables:

- owner decision note in the pathway or ADR
- updated risk review if desktop implementation is approved
- explicit non-goals for the first desktop build

Stop condition:

Stop if the first desktop release scope includes broad folder indexing, background scanning, telemetry, credentials, or provider API calls without a separate security review.

## Desktop Chunk D0 Decision Packet

Status: task complete with current release-launch App Control blocker

Status Updated: 2026-07-04T14:51:54-06:00

Completion target: Task complete

Goal:

Confirm the first desktop product boundary, target release order, publisher identity, and governance posture before any desktop code is added.

Owner confirmation:

The owner's 2026-07-04 request to carry on with the next chunk was treated as confirmation to use the recommended D0 defaults and proceed to D1. No desktop implementation was approved by D0.

Recommended owner decisions:

| Decision | Recommended default | Reason | Owner status |
|---|---|---|---|
| First desktop scope | Limit the first desktop track to AI tool and local model discovery. | This matches the user's trust goal while avoiding broad file inspection too early. | Confirmed for planning |
| User-selected folders | Defer folder inspection from the first public desktop release; allow only a separately reviewed prototype later. | Folder inspection changes the privacy surface and should wait for the trust-boundary design. | Confirmed for planning |
| First target OS | Windows first, then macOS, then Linux packaging. | The current development lab is Windows-led, and Windows signing/install friction is the most urgent ordinary-user trust problem. | Confirmed for planning |
| Publisher identity | Use `Guided AI Labs Ltd` for signing and publisher identity if it is the correct legal entity. | Signing should match a real legal publisher users can recognize. | Confirmed as provisional |
| Product naming | Keep the product as `AI Task Router` for the repo and app, with Guided AI Labs/OldSkoolAI branding decided before packaging. | This avoids changing code identity before the brand/distribution route is final. | Confirmed for planning |
| Windows distribution | Evaluate Microsoft Store MSIX first; use direct signed installers only after signing and SmartScreen implications are reviewed. | Store packaging may reduce trust friction for non-technical users. | Confirmed for planning |
| macOS distribution | Require Developer ID signing and notarization before external beta. | Unsigned macOS apps are not trustworthy enough for ordinary users. | Confirmed for planning |
| Linux distribution | Start with AppImage and checksums; add `.deb` after install/uninstall testing. | This gives broad Linux reach without overbuilding package infrastructure. | Confirmed for planning |
| Governance level | Keep governance level 1 for docs-only planning; review raising to at least a medium-control track before native local discovery implementation. | Local machine inspection is a higher-trust surface than the current browser MVP. | Confirmed for planning |

First desktop non-goals until separately approved:

- broad folder indexing
- startup or background scanning
- telemetry
- provider account connections
- provider API calls
- OAuth
- credential storage
- remote sync
- reading file contents by default
- arbitrary shell command execution
- changing, deleting, publishing, sending, deploying, purchasing, or modifying anything

Risk review:

The current v0.2 browser MVP remains low risk and governance level 1. The desktop track introduces a higher-trust local machine surface. The recommended control posture is to keep planning lightweight for D0 and D1, then require a trust-boundary design, tool permission update, and governance review before any native local discovery code is added.

D0 stop condition:

Do not start Desktop Chunk D2 or any desktop implementation if the scope expands into broad folder inspection, background scanning, telemetry, credentials, provider API calls, or file-content indexing without a separate security review.

D0 result:

Confirmed defaults are recorded above. Desktop Chunk D1 created the tool decision ADR comparing Tauri, Electron, and the option to stay web/PWA-only for longer.

## Desktop Chunk D1 Tool Decision ADR

Status: task complete

Status Updated: 2026-07-04T14:51:54-06:00

Completion target: Task complete

Goal:

Record the desktop wrapper decision before adding desktop code.

Decision:

Use Tauri for Desktop Chunk D2, the first desktop shell spike. Keep the hosted web/PWA track as the low-friction public path, and keep Electron as a fallback if the Tauri spike proves unsuitable.

Decision record:

- [ADR-0001: Desktop Wrapper Choice For Trusted Local Discovery](decisions/adr-0001-desktop-wrapper.md)

D1 non-goals:

- no Tauri scaffold added
- no Electron scaffold added
- no native local discovery commands
- no packaging, signing, auto-update, telemetry, provider connections, OAuth, credentials, folder inspection, or file indexing

D1 handoff:

Proceed to Desktop Chunk D2 only as a shell spike. D2 may wrap the current UI in Tauri and prove that the browser app still builds. D2 must not add native discovery or any local machine inspection.

## Desktop Chunk D2 Shell Scaffold Attempt

Status: draft complete with dev-mode Application Control blocker

Status Updated: 2026-07-04T16:04:28-06:00

Completion target: Draft complete

Result:

The repo-local Tauri shell scaffold was added, the missing Windows build prerequisites were installed, the no-bundle release build passed, and the release executable launched the `AI Task Router` desktop window. The remaining D2 blocker is specific to `npm run desktop:dev`: Windows Application Control blocks Cargo from executing the generated debug build-script binary.

Implemented:

- added `@tauri-apps/cli` as a development dependency
- added `tauri`, `desktop:info`, `desktop:dev`, and `desktop:build` npm scripts
- added `src-tauri` with a minimal Rust shell and no custom native commands
- configured Tauri for the existing Vite app using `devUrl` `http://localhost:5173` and `frontendDist` `../dist`
- set the product name and version to `AI Task Router` `0.2.0`
- set the provisional app identifier to `com.guidedailabs.aitaskrouter`
- generated desktop icon assets from a square Guided AI Labs icon source
- set the Tauri bundle to inactive for the spike so D2 does not package or sign installers
- configured the default capability with an empty permission list
- configured Vite to ignore `src-tauri` in its file watcher
- committed Cargo's generated `src-tauri/Cargo.lock` after the first successful dependency resolution

System tools installed and verified:

- Rustup `1.29.0`
- Rust/Cargo `1.96.1` with default `stable-x86_64-pc-windows-msvc`
- Visual Studio Build Tools 2022 `17.14.35`
- MSVC `14.44.35207`
- Windows SDK `10.0.26100.0`
- WebView2 `149.0.4022.98`

Not added:

- native discovery commands
- filesystem, shell, process, upload, provider, telemetry, updater, credential, or file-indexing plugins
- folder inspection
- packaging
- signing
- auto-update
- provider connections
- external actions

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the scaffold
- `npm run desktop:info` parsed the Tauri project and confirmed WebView2 is present
- `npm run desktop:info` reported missing MSVC Build Tools, Rust, Cargo, rustup, and Rust toolchain
- `npm run test` passed with 11 test files and 81 tests
- `npm audit --audit-level=moderate` found 0 vulnerabilities
- `npm run build` passed with the existing Vite chunk-size warning
- `npm run desktop:build` failed at `cargo metadata` because `cargo` is not installed
- generated `src-tauri/icons/icon.png` was visually checked and shows the Guided AI Labs mark
- final close-out checks passed: `npm run test`, `npm run build`, `npm audit --audit-level=moderate`, `bash scripts/governance-preflight.sh`, and `git diff --check`
- `winget install --id Rustlang.Rustup --exact --source winget --accept-package-agreements --accept-source-agreements --silent` installed Rustup and the default stable MSVC Rust toolchain
- `winget install --id Microsoft.VisualStudio.2022.BuildTools --exact --source winget --accept-package-agreements --accept-source-agreements --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"` installed the Visual Studio 2022 C++ build tools
- `npm run desktop:info` passed all Tauri environment checks after install
- `cargo metadata --manifest-path src-tauri/Cargo.toml --format-version 1 --no-deps` passed
- `npm run desktop:build` passed and built `src-tauri\target\release\ai-task-router-desktop.exe`
- release executable launch smoke test confirmed a running desktop process with main window title `AI Task Router`, then stopped it cleanly
- `npm run desktop:dev` and direct `cargo build --manifest-path src-tauri/Cargo.toml` both failed because Windows Application Control blocked the generated debug `build-script-build.exe`
- Windows Code Integrity logged event IDs `3033` and `3077` for policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}`
- final close-out checks passed: `npm run desktop:info`, `npm run test`, `npm run build`, `npm audit --audit-level=moderate`, `bash scripts/governance-preflight.sh`, `npm run desktop:build`, and `git diff --check`

Remaining troubleshooting step:

Resolve the Windows Application Control debug-build blocker through the lab's approved policy path, then rerun:

```bash
npm run desktop:info
npm run desktop:dev
npm run desktop:build
```

D2 has enough evidence for a release-build shell spike, but dev mode remains blocked until the local Application Control policy allows Cargo's generated debug build scripts in the approved development path.

## Desktop Chunk D3 Trust Boundary And Permission Model

Status: task complete

Status Updated: 2026-07-04T16:25:09-06:00

Completion target: Task complete

Result:

D3 defines the desktop trust boundary before native local discovery enters the app. This chunk added executable TypeScript/Zod schemas for the future desktop discovery IPC contract and hardened the Tauri shell with an explicit CSP. It did not add native commands, filesystem permissions, shell/process plugins, folder inspection, model scanning, packaging, signing, telemetry, provider connections, credentials, or external actions. The current unsigned rebuilt release executable cannot be launch-smoke-tested in this lab session because Windows Application Control blocks it.

Official source basis reviewed on 2026-07-04:

- Tauri security overview: https://v2.tauri.app/security/
- Tauri capabilities: https://v2.tauri.app/security/capabilities/
- Tauri permissions: https://v2.tauri.app/security/permissions/
- Tauri runtime authority: https://v2.tauri.app/security/runtime-authority/
- Tauri CSP: https://v2.tauri.app/security/csp/
- Tauri config reference for `csp` and `devCsp`: https://v2.tauri.app/reference/config/
- Tauri shell plugin permissions: https://v2.tauri.app/plugin/shell/

D3 baseline desktop boundary before D4 implementation:

- `src-tauri/capabilities/default.json` granted no permissions.
- `src-tauri/src/lib.rs` registered no custom Tauri commands.
- `src-tauri/Cargo.toml` had no filesystem, shell, process, upload, updater, provider, credential, telemetry, or database plugin dependency.
- `src-tauri/tauri.conf.json` keeps bundling inactive and now has a release CSP plus a dev CSP for the Vite server.
- `npm run desktop:dev` remains blocked by the Windows lab Application Control policy; the current rebuilt release executable is also blocked because it is unsigned. D3 does not weaken or bypass that control.

Trust boundary model:

| Boundary | Trust level | Allowed role | Controls |
|---|---|---|---|
| React WebView | Untrusted caller | Render UI, store browser-local IndexedDB data, ask for a named native discovery action only after user approval. | Cannot receive broad filesystem access; all native results must pass schemas before use; no hidden startup checks. |
| Tauri IPC | Controlled bridge | Carry named requests and structured responses between the WebView and Rust core. | Only approved commands may be exposed; capabilities must remain narrow; command inputs must be runtime-validated. |
| Rust core | Trusted local authority | Enforce allowlists, timeouts, redaction, and result limits for desktop-only local checks. | Never trust frontend input directly; never accept arbitrary commands, paths, shell text, URLs, or provider credentials. |
| Local OS, tools, folders, and process output | Untrusted local evidence | Provide installation/model evidence from allowlisted checks only. | Treat output as untrusted text; limit size; redact paths; avoid file-content reads; handle timeouts and blocks safely. |
| External services | Out of scope | None. | No provider API calls, account login, telemetry, upload, remote sync, or external action execution. |

Approved future command contract for D4:

| Command | Purpose | Input | Output | Error shape | Non-goals |
|---|---|---|---|---|---|
| `get_desktop_discovery_options` | Let the desktop UI show which local tool checks are available for the current OS. | None. | `desktopDiscoveryOptionsResponseSchema` from `src/domain/schemas.ts`. | `desktopDiscoveryErrorSchema` if platform or runtime setup is unsupported. | No scanning, no folder listing, no model names, no provider calls. |
| `run_desktop_discovery` | Run a user-approved local AI tool/model check for selected allowlisted tools. | `desktopDiscoveryRequestSchema` from `src/domain/schemas.ts`; selected tools only; details off by default; `includePathDetails` must remain `false`. | `desktopDiscoveryResponseSchema` from `src/domain/schemas.ts`. | `desktopDiscoveryErrorSchema` with safe error codes such as `invalid-request`, `tool-timeout`, `tool-failed`, `app-control-blocked`, or `unsupported-platform`. | No arbitrary shell text, no user-supplied paths, no recursive home scan, no file content reads, no writes, no credentials, no network calls. |

Implementation notes for D4:

- Prefer custom Rust commands over Tauri's shell plugin for this first discovery path.
- If a local CLI must be invoked, use fixed executable names and fixed arguments only, with no shell interpolation.
- Add explicit timeouts per check.
- Limit each result to known tool IDs: `ollama`, `lm-studio`, `jan`, and `gpt4all` until the allowlist is deliberately expanded.
- Summary mode must return counts and friendly statuses without model names or paths.
- Details mode may return model names only after the user chooses to show details; it must still cap results and must not return full paths.
- Path details are blocked by schema in D3 and require a separate owner-approved chunk if ever needed.
- Native command implementation must fail closed if schema validation, platform checks, App Control, or allowlist checks fail.

User permission flow for D4:

1. User clicks a plain-language action such as `Check this computer`.
2. App explains: "We will only check the AI tools you select. We will not read your documents, upload anything, or connect accounts."
3. User chooses tool checks from the allowlisted list.
4. User runs the check manually; no check runs at startup or in the background.
5. App shows a summary first.
6. User may choose whether to show model names.
7. User may add a found tool to My AI Tools or clear the result.

Data handling rules:

| Data | Default handling | Allowed persistence | Prohibited handling |
|---|---|---|---|
| Tool installed/not found status | Show friendly summary. | Browser-local IndexedDB only if the user adds a tool or saves a result. | Hidden telemetry, upload, provider sync. |
| Model count | Show summary count. | Browser-local IndexedDB only after user action. | Inferring unrelated folder contents. |
| Model names | Hidden by default. | May be shown in details mode and saved only after user action. | Printed in support logs by default, sent remotely, or shown without user choice. |
| Paths | Not returned by D3 schemas. | None in D4. | Full path disclosure, recursive folder indexes, arbitrary user path inspection. |
| Errors | Safe code and short safe detail. | Validation log or local support note only when user chooses to share. | Raw stdout/stderr dumps, private paths, secrets, or machine inventory. |

Threat notes and controls:

| Threat | Control |
|---|---|
| A compromised WebView asks for broader access. | Runtime schema validation, narrow Tauri capabilities, named commands only, no default native permissions. |
| Command injection through tool names or arguments. | Tool IDs are enum-only; no arbitrary shell text; fixed executable names and args. |
| Local tool output leaks private data. | Treat output as untrusted, cap result size, redact by default, hide model names unless details mode is chosen. |
| Discovery feels invasive to non-technical users. | User starts every check, selects tools, sees plain-language copy, can clear results. |
| The app starts scanning silently after install. | Startup/background checks are prohibited by this plan and the permission matrix. |
| Dev or release environment blocks local checks. | Return safe `app-control-blocked`, `permission-denied`, or `tool-timeout` errors without bypassing OS security controls. |

D4 entry gates, satisfied by the 2026-07-04T18:16:13-06:00 D4 implementation:

- Native discovery was implemented only after the D3 schemas and user copy were reviewed against the UI.
- Rust command tests cover allowlists, path-detail rejection, summary redaction, and capped safe model names.
- `src-tauri/capabilities/default.json` remains free of broad `fs:*`, `shell:*`, process, upload, updater, provider, credential, telemetry, or broad discovery plugin permissions.
- `npm run test`, `npm run build`, `npm run desktop:info`, and `npm run desktop:build` passed.
- D4 is not public release readiness; packaging/signing remains later.

D3 validation:

- Final documentation close-out checks passed: `bash scripts/governance-preflight.sh` reported 0 warnings and `git diff --check` reported only normal Windows LF-to-CRLF notices.
- `npm run test -- domainSchemas` passed with 1 test file and 8 tests after adding the desktop discovery schemas.
- `npm run test` passed with 11 test files and 83 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- `npm run desktop:info` passed after prepending `C:\Users\adamg\.cargo\bin` to the current shell PATH; without that fresh-shell adjustment, Tauri could not see Rust even though the tools are installed and present in the user PATH.
- `npm run desktop:build` passed after prepending `C:\Users\adamg\.cargo\bin` and built `src-tauri\target\release\ai-task-router-desktop.exe`.
- Rebuilt release executable launch smoke test was blocked by Windows Application Control. `Get-AuthenticodeSignature` reports the executable is unsigned, SHA-256 `079EF12762D987A877146E6051B32A1E2ED9BC42507B020959F00F2793C7512B`, and Code Integrity events `3033`/`3077` cite policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}`.

## Desktop Chunk D4 Permissioned Local AI Tool Detection

Status: integration complete with build-only desktop validation

Status Updated: 2026-07-04T18:16:13-06:00

Completion target: Integration complete

Result:

D4 implements the first desktop-only local AI tool discovery path against the D3 contract. The desktop UI now offers a plain-language `Check this computer` flow inside My AI Tools when the app is running in Tauri. The browser version does not scan; it shows a note that computer checking belongs to the desktop app and keeps manual setup available.

Official source basis reviewed on 2026-07-04:

- Tauri custom command and frontend invocation docs: https://v2.tauri.app/develop/calling-rust/
- Tauri capabilities model: https://v2.tauri.app/security/capabilities/

Current D4 native surface:

- `src-tauri/src/discovery.rs` implements `get_desktop_discovery_options` and `run_desktop_discovery` as custom Rust commands.
- `src-tauri/src/lib.rs` registers those commands through the single Tauri invoke handler.
- `src/desktop/desktopDiscovery.ts` is the only frontend bridge; it checks for a Tauri runtime and validates native responses against the existing Zod schemas before UI use.
- `src-tauri/capabilities/default.json` still grants no broad plugin permissions. D4 does not add Tauri `fs`, `shell`, process, upload, updater, provider, credential, telemetry, or database plugin permissions.
- `@tauri-apps/api` is now a runtime dependency so the frontend can invoke the custom commands in the desktop app.

Implemented checks:

- Options command returns a fixed allowlist only: `ollama`, `lm-studio`, `jan`, and `gpt4all`. It does not scan folders, run commands, list models, read files, call providers, or collect telemetry.
- Discovery command accepts only non-empty, unique, allowlisted tool IDs.
- `includePathDetails: true` is rejected. Paths are not returned in summary or detail mode.
- Summary mode returns counts and friendly statuses without model names.
- Details mode may return capped safe model names only after the user chooses `Show model names`.
- Ollama uses the fixed executable name `ollama` with fixed args `list`, no shell interpolation, timeout handling, and capped stdout parsing.
- LM Studio, Jan, and GPT4All use known-folder checks only. D4 does not accept user-supplied paths, whole-drive searches, recursive home scans, file-content reads, writes, network calls, credentials, or provider actions.

User flow:

1. User opens My AI Tools.
2. In the desktop app only, user clicks `Check this computer`.
3. App presents the allowlisted local tools and explains the check in plain language.
4. User selects the tools to check and clicks `Run check`.
5. App shows summary results first.
6. User may show model names, hide model names, clear results, or add detected tools to My AI Tools.
7. Saving still uses the existing user-triggered setup save path.

D4 validation:

- `npm run test -- App` passed with 1 file and 13 tests.
- `npm run test` passed with 11 files and 84 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `cargo test --manifest-path src-tauri\Cargo.toml --lib --release` passed earlier in the D4 code loop with 4 Rust tests. The final close-out rerun after docs/config updates compiled but was blocked by Windows Application Control when launching the generated release test executable.
- `cargo test --manifest-path src-tauri\Cargo.toml --lib --release --no-run` passed in final close-out.
- `cargo fmt --manifest-path src-tauri\Cargo.toml --check` passed.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- `npm run desktop:info` passed after prepending `C:\Users\adamg\.cargo\bin` to the current shell PATH.
- `npm run desktop:build` passed after prepending `C:\Users\adamg\.cargo\bin` and built `src-tauri\target\release\ai-task-router-desktop.exe`.
- `git diff --check` reported only normal Windows LF-to-CRLF notices.

D4 known limits:

- Desktop launch smoke was not treated as passing. The Windows lab Application Control issue remains unresolved for dev mode, unsigned release executable launch, and final execution of the generated release Rust test binary.
- D4 is not public desktop release readiness. Packaging, signing, updater, installer, checksums, notarization, and public support copy remain later chunks.
- D4 does not inspect arbitrary folders, connect accounts, call provider APIs, upload data, store credentials, index files, or run external actions.
- The terminal-only `npm run detect:local-models` command remains separate and explicit.

## Desktop Chunk D5 PWA Install Path

Status: integration complete

Status Updated: 2026-07-04T18:41:17-06:00

Completion target: Integration complete

Result:

D5 implements the hosted/browser install path without changing the desktop trust boundary. The production web build now has install metadata, branded PWA icons, a production-only service worker, and a Start Here install card that keeps ordinary users oriented: the browser version can be installed where supported, but checking the computer requires the desktop app.

Official source basis reviewed on 2026-07-04:

- MDN making PWAs installable: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- web.dev PWA install criteria: https://web.dev/articles/install-criteria
- Chrome installable manifest audit: https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest

Current D5 browser/PWA surface:

- `public/manifest.webmanifest` defines the install name, short name, start URL `/`, scope `/`, standalone display, theme/background colors, and icon metadata.
- `public/pwa/icon-192.png` and `public/pwa/icon-512.png` reuse the Guided AI Labs icon set at the sizes expected by common installability checks.
- `public/service-worker.js` caches same-origin app-shell assets and handles same-origin navigation/assets only.
- `src/pwa/registerServiceWorker.ts` registers the service worker only in production HTTPS or local preview, never in Vite dev mode and never inside Tauri.
- `index.html` links the manifest and install icon.
- Start Here now includes an `Install the browser version` card. It listens for `beforeinstallprompt` when supported, provides fallback browser-menu copy, and explicitly says local computer checking requires the desktop app.

D5 non-goals:

- no public hosting or DNS work
- no desktop packaging, signing, updater, notarization, installers, checksums, or public downloads
- no provider calls, external APIs, account connections, telemetry, remote sync, uploads, or hidden network calls
- no local AI tool discovery in the browser/PWA version
- no arbitrary folder inspection, file indexing, startup/background scanning, or service-worker background sync/push

D5 validation:

- `npm run test -- App pwaServiceWorker` passed with 2 files and 17 tests.
- `node --check public\service-worker.js` passed.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- `npm run test` passed with 12 files and 88 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- Build output included `dist/manifest.webmanifest`, `dist/service-worker.js`, `dist/pwa/icon-192.png`, and `dist/pwa/icon-512.png`.
- Local production preview at `http://127.0.0.1:5184/` served the install metadata: manifest link present, Apple icon link present, manifest name `AI Task Router | Guided AI Labs`, display `standalone`, start URL `/`, two icons, 200 responses for both icon URLs, 200 response for `service-worker.js`, and service-worker install/fetch handlers present.

D5 known limits:

- Browser install prompts depend on browser support, HTTPS or local preview, and browser-specific engagement rules.
- Public hosting has not been executed.
- If hosted under a subpath rather than domain root, review Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links before release.
- D5 is not public release readiness; it is install-path integration.

### Phase 1: Desktop Tool Decision Spike

Goal:

Prove whether the current Vite app can be wrapped cleanly for desktop.

Expected work:

- use [ADR-0001](decisions/adr-0001-desktop-wrapper.md) as the wrapper decision record
- scaffold Tauri in a bounded chunk
- run existing React app inside the desktop shell
- build a local dev desktop app on Windows
- confirm current browser build still works
- document added dependencies and toolchain requirements
- do not add local scanning yet

Acceptance criteria:

- existing web app still runs with `npm run dev`
- existing web app still builds with `npm run build`
- desktop shell launches the current UI
- no native permissions beyond the shell are exposed
- ADR records tradeoffs, risks, exit plan, and selected candidate
- D2 does not add native discovery, folder inspection, packaging, signing, updater, provider connections, telemetry, credentials, or file indexing

Validation:

- `npm run test`
- `npm run build`
- desktop dev launch
- dependency audit

### Phase 2: Desktop Trust Boundary Design

Goal:

Design the native permission boundary before local detection enters the app.

Expected work:

- document frontend/native trust boundary
- define IPC command names, inputs, outputs, and errors
- define Zod schemas for desktop discovery responses
- define user-facing permission copy
- update tool permission matrix
- add threat model notes
- decide what path details are hidden by default

Acceptance criteria:

- every native command has a purpose, input shape, output shape, error shape, and non-goal
- native commands are read-only
- user copy avoids technical jargon
- private paths and model names are not shown by default
- no command accepts arbitrary shell text

Validation:

- design review against this plan
- schema tests once schemas are implemented

### Phase 3: Permissioned Local Discovery Prototype

Goal:

Move the current explicit local detector concept into a desktop-only, user-approved workflow.

Expected work:

- implement read-only native detection for selected tools
- include timeouts and failure states
- support Windows first, then macOS/Linux after path rules are reviewed
- add "Check this computer" UI
- add "Add found tool to My AI Tools" action
- add "Clear results"
- keep browser/PWA version free of native detection controls unless it explains that desktop is required

Acceptance criteria:

- no check runs on app startup
- user must click to begin
- user can select what to check
- user can cancel before running
- results summarize by default
- found tools can be added to My AI Tools
- user can clear local discovery results
- browser build does not pretend it can scan the computer

Validation:

- unit tests for path detection logic
- IPC response schema tests
- UI tests for permission flow
- manual Windows desktop smoke test
- no external network calls

### Phase 4: Desktop Packaging Spike

Goal:

Produce internal desktop packages and learn the release mechanics before public distribution.

Expected work:

- configure app identity, icons, product name, and version
- produce Windows internal build
- produce macOS internal build on a Mac
- produce Linux internal build
- document build commands
- document artifact locations
- document install and uninstall behavior
- do not publish public downloads yet

Acceptance criteria:

- internal package launches on at least Windows
- package uses branded app icon/name
- app data location is documented
- uninstall behavior is known
- release artifacts are not confused with public trusted installers

Validation:

- clean install build
- launch smoke test
- local discovery smoke test if Phase 3 is complete
- uninstall/reinstall smoke test

### Phase 5: Signing And Public Trust Readiness

Goal:

Prepare trustworthy public installers.

Expected work:

- select Windows signing path
- select macOS signing/notarization path
- define Linux artifact signing/checksum path
- document secret handling for signing credentials
- design CI or manual build process
- publish checksum process
- create release checklist
- create rollback/revocation notes

Acceptance criteria:

- no signing secrets are committed
- Windows public path is chosen and documented
- macOS public path includes notarization
- Linux path includes checksums
- release checklist includes OS-specific smoke tests
- support and update path are known

Validation:

- signed/notarized test artifact where possible
- checksum verification
- install/launch/uninstall smoke tests
- security review before public download

### Phase 6: Controlled Beta

Goal:

Let a small set of trusted users install the desktop app and report friction.

Expected work:

- private or low-visibility download page
- clear beta label
- release notes
- install instructions per OS
- known limitations
- feedback intake
- documented rollback/withdraw path

Acceptance criteria:

- beta users understand what the app checks
- no silent scan
- no telemetry surprise
- install friction is recorded
- at least one clean install and uninstall per supported OS
- local discovery results are understandable to a non-technical user

Validation:

- beta smoke checklist
- support log review
- security issue triage path

### Phase 7: Public Desktop Release

Goal:

Ship the desktop app publicly only after trust, signing, support, and release evidence are ready.

Expected work:

- public product page
- signed installers
- checksums
- release notes
- privacy note
- support contact
- versioned changelog
- update instructions
- rollback plan

Acceptance criteria:

- public users can identify the publisher
- public users can verify what the app does locally
- install path is trusted enough for ordinary users
- no unsupported OS is advertised
- web/PWA and desktop capabilities are clearly distinguished

Validation:

- release-readiness review
- OS install matrix
- no-secrets check
- dependency audit
- final smoke tests

## Suggested Future Chunks

These are the desktop-track chunks. D0 through D6 now have current states; D7 and later remain planned future work unless the owner explicitly continues that lane.

### Desktop Chunk D0 - Owner Decision And Governance Review

Completion target: Task complete

Outcome:

The owner confirms the first desktop scope, target OS order, publisher identity, and whether governance changes are needed before desktop implementation.

Current state:

D0 was confirmed for planning on 2026-07-04T14:51:54-06:00. The decision packet above records the accepted defaults and keeps desktop implementation outside D0.

### Desktop Chunk D1 - Desktop Tool Decision ADR

Completion target: Task complete

Outcome:

The repo records whether Tauri, Electron, or another wrapper is selected, with rationale, risks, costs, and exit plan.

Current state:

D1 is complete. [ADR-0001](decisions/adr-0001-desktop-wrapper.md) selects Tauri for the D2 shell spike and keeps Electron as fallback.

### Desktop Chunk D2 - Desktop Shell Spike

Completion target: Draft complete

Outcome:

The current React app launches in a desktop shell without adding local scanning yet.

Current state:

The Tauri scaffold, desktop scripts, branded icons, installed prerequisites, no-bundle build, and release executable launch are verified. `npm run desktop:dev` remains blocked by Windows Application Control policy against generated debug build scripts.

### Desktop Chunk D3 - Trust Boundary And Permission Model

Completion target: Task complete

Outcome:

Native commands, user permissions, local data handling, and response schemas are documented before implementation.

Current state:

D3 is complete as of 2026-07-04T16:25:09-06:00 with the release-launch smoke test blocked by Windows Application Control. The trust-boundary model, D4 command contract, user permission flow, data-handling rules, response/error schemas, threat notes, and CSP hardening are recorded above. D4 later implemented the approved command contract.

### Desktop Chunk D4 - Permissioned Local AI Tool Detection

Completion target: Integration complete

Outcome:

The desktop app can check selected local AI tools with explicit user approval and add found tools to My AI Tools.

Current state:

D4 is integration complete as of 2026-07-04T18:16:13-06:00. Custom Rust commands now provide allowlisted local AI tool discovery for Ollama, LM Studio, Jan, and GPT4All through a user-started desktop UI. The implementation keeps broad Tauri plugin permissions empty, rejects path details, hides model names by default, does not run at startup or in the background, and has build-only desktop validation because the Windows lab Application Control launch blocker remains unresolved.

### Desktop Chunk D5 - PWA Install Path

Completion target: Integration complete

Outcome:

The hosted web app can be installed from supported browsers while clearly stating that local discovery requires the desktop version.

Current state:

D5 is integration complete as of 2026-07-04T18:41:17-06:00. The browser build has a manifest, branded 192px/512px icons, production-only service-worker registration, Start Here browser-install copy, service-worker gating tests, and preview evidence that install metadata is served from production output. Public hosting is not executed, and browser/PWA local discovery remains prohibited.

### Desktop Chunk D6 - Packaging And Signing Spike

Completion target: Draft complete

Outcome:

Internal packages build for target OSes, signing requirements are documented, and public release remains blocked until trust checks pass.

Current state:

D6 is draft complete as of 2026-07-04T19:20:30-06:00. The repo now has an opt-in internal Windows NSIS packaging config and script, plus artifact inspection with SHA-256 output. The Windows internal package build passed and generated `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe`, size `1,990,042` bytes, SHA-256 `FF170B0B681AA1954881767524E805C005AF72402C5B0AE7FCB0AF8934AC3BFD`. The installer and rebuilt release executable both report `NotSigned`. This artifact is internal evidence only; do not publish it or send it to non-technical users.

D6 details are recorded in [Desktop Packaging And Signing Spike](2026-07-04-desktop-packaging-signing-spike.md).

### Desktop Chunk D7 - Release And Security Readiness Packet

Status: task complete, release hold

Status Updated: 2026-07-04T19:34:29-06:00

Completion target: Task complete

Outcome:

D7 records the release and cybersecurity gate before any public web hosting, social sharing, GitHub Release, or desktop installer distribution. The owner confirmed the desired free distribution route: GitHub for source/release transparency, Cloudflare for hosting, visible links from `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com`, and later sharing through YouTube, Facebook, and LinkedIn.

Decision packet:

- [Release And Security Readiness Packet](2026-07-04-release-security-readiness-packet.md)

D7 decision:

Release is held. The hosted browser/PWA path should be the first public surface after E2E and cybersecurity checks pass. The desktop app remains blocked for ordinary users until Windows Application Control/signing/trusted-path is resolved, the installer is signed or Store/MSIX path is proven, checksums are published, and install/launch/local-discovery/clear-results/uninstall smoke tests pass.

Recommended public web shape:

- one canonical Cloudflare Pages app URL
- links from the three existing websites to that canonical URL
- GitHub Pages as fallback only
- GitHub Releases later for signed desktop artifacts, release notes, and checksums
- no public desktop download from the D6 unsigned NSIS artifact

D7 validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- Official GitHub, Cloudflare, Microsoft, OWASP, Tauri, and RustSec sources were reviewed for release/security planning.
- No deploy, DNS, GitHub Release, signing, updater, or artifact upload was performed.

### Desktop Chunk D8 - Web Release Candidate And Cybersecurity Pass

Status: task complete, release hold

Status Updated: 2026-07-04T20:27:56-06:00

Completion target: Task complete

Outcome:

D8 completed the local web/PWA release-candidate and cybersecurity pass. The browser/PWA artifact is ready for Cloudflare Pages preview configuration, but it is not public-release approved yet.

Decision packet:

- [Web Release Candidate Security Pass](2026-07-04-web-release-candidate-security-pass.md)

D8 result:

- Added `npm run scan:web-rc`, a repeatable production artifact scan for high-confidence secret patterns, unexpected external URLs, root-domain PWA manifest fields, required PWA icon entries, and service-worker guardrails.
- Verified clean install, dependency audit, script tests, unit tests, production build, production artifact scan, Playwright E2E, and local production-preview metadata.
- Documented Cloudflare Pages preview configuration: GitHub repo, build command `npm ci && npm run build`, output directory `dist`, no required environment variables, and a pending canonical URL/custom-domain decision from the owner-controlled domains.
- Documented HTTPS preview smoke requirements, public-link hold, and rollback checklist.

D8 release decision:

Hold public launch. The next release-engineering step is Cloudflare Pages preview creation and HTTPS smoke. Do not add public links from `oldskoolai.com`, `guidedailabs.com`, `guidedaijourney.com`, YouTube, Facebook, or LinkedIn until the hosted preview/custom-domain checks pass and the owner makes the launch decision.

D8 validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- Official Cloudflare Pages, GitHub security, and OWASP sources were reviewed.
- `npm ci` passed after stale repo-owned Vite dev/preview servers were stopped.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `npm run test:scripts` passed with 4 Node script tests.
- `npm run test` passed with 12 files and 88 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run scan:web-rc` passed with no release-blocking findings.
- `npx playwright test` passed with 6 Chromium tests.
- Local production preview at `http://127.0.0.1:5185/` served root page, manifest, Apple icon, 192px icon, 512px icon, and service worker with install/fetch handlers and same-origin-only guard.

### Desktop Chunk D9 - Cloudflare Pages Hosted Preview Smoke

Status: task complete, release hold

Status Updated: 2026-07-04T21:05:03-06:00

Completion target: Task complete

Outcome:

D9 created the first Cloudflare Pages hosted preview and proved the browser/PWA MVP can run from a hosted HTTPS URL without adding public website links or changing DNS.

Decision packet:

- [Cloudflare Pages Hosted Preview Smoke](2026-07-04-cloudflare-pages-hosted-preview-smoke.md)

D9 result:

- Created Cloudflare Pages project `ai-task-router`.
- Deployed a Wrangler direct-upload preview to `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- Confirmed the Cloudflare deployment was preview-only, with no environment variables and no Functions.
- Verified hosted root, manifest, service worker, and PWA icons over HTTPS with Node.
- Verified hosted title, heading, manifest, service-worker registration, and zero observed external requests with Chromium.
- Added `PLAYWRIGHT_BASE_URL` support to `playwright.config.ts` and ran the E2E suite against the Cloudflare preview.

D9 release decision:

Hold public launch. The preview works, but the canonical public URL is not selected, no custom domain has been attached or smoked, the Cloudflare Pages project is not connected to GitHub yet, and the owner has not made the launch decision.

D9 validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- Cloudflare token/account access was verified from the master environment file without printing token values.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `npm run test:scripts` passed with 4 Node script tests.
- `npm run test` passed with 12 files and 88 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run scan:web-rc` passed with no release-blocking findings.
- `npx playwright test` passed locally with 6 Chromium tests.
- Hosted `PLAYWRIGHT_BASE_URL=https://preview-20260704-0c7b253.ai-task-router.pages.dev npx playwright test` passed with 6 Chromium tests.
- Windows `curl.exe` and PowerShell `Invoke-WebRequest` hit a TLS handshake failure against the preview alias while Node HTTPS/fetch and Chromium succeeded; retest normal browsers and the final custom domain before public launch.

## Open Decisions

- Canonical public app URL: pending; owner confirmed the three root websites but not `https://app.oldskoolai.com/`, so the next chunk must choose root, subpath, Cloudflare Pages default URL, or a newly created subdomain under an owned domain.
- Cloudflare production release path: decide whether to connect the Pages project to GitHub before production or accept a documented Wrangler direct-upload release process.
- Canonical product name for the desktop app.
- Legal publisher name for signing.
- Windows distribution path: Microsoft Store/MSIX, direct signed installer, or both.
- macOS distribution path and Apple Developer account ownership.
- Linux artifact set: AppImage only first, or AppImage plus `.deb`.
- Whether a later separately reviewed prototype should include user-selected folder inspection.
- Whether model names are hidden by default, shown with consent, or never stored.
- Auto-update is deferred unless separately approved.
- Public privacy/local-access page is required before controlled desktop beta or public launch.
- Whether governance level should rise before desktop implementation.

## Non-Goals Until Explicitly Approved

- Provider account connections
- Provider API calls
- OAuth
- Credential storage
- Remote sync
- Telemetry
- Feedback analytics
- Background scanning
- File content indexing
- Whole-drive search
- Automatic uploads
- Desktop agent actions
- Shell command runner
- Best-stack purchasing or subscription flows
- Any execution workflow that sends, publishes, deletes, deploys, purchases, or modifies external systems

## Immediate Recommendation

Choose the next lane deliberately:

- For hosted release engineering, choose the canonical public URL, decide whether Cloudflare Pages should be GitHub-connected before production or use a documented direct-upload release process, then smoke the canonical/custom domain before adding public links.
- For product completion, run Chunk Sixteen MVP polish and documentation if the owner wants docs tightened before public launch.
- For the desktop lane, resolve the Windows lab Application Control/signing/trusted-path blocker before claiming interactive desktop discovery smoke tests or creating a controlled desktop beta.

Do not expand D4/D5/D6 into arbitrary folder inspection, broad filesystem permissions, provider connections, credentials, telemetry, updater, public hosting, file indexing, auto-upload, whole-drive search, public installer publishing, or external actions without a separately approved chunk.
