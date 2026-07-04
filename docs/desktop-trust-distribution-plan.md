# Desktop Trust And Distribution Plan

Document ID: PATH-ENG-002
Version: 0.2.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before Desktop Chunk D1
Last Updated: 2026-07-04T11:35:38-06:00
Status Updated: 2026-07-04T11:35:38-06:00

Planning state: Desktop Chunk D0 opened; owner confirmation required before desktop implementation.

## Purpose

This plan defines how AI Task Router can grow from a local-first browser app into a trusted installable desktop app for Windows, macOS, and Linux, without weakening the current MVP boundary.

The product goal is two-option distribution:

1. Hosted web app or installable PWA for people who want to try the tool immediately.
2. Signed desktop app for people who want the app to inspect their own computer for local AI tools, local models, and later user-approved folders.

The desktop version exists because local machine inspection changes the trust promise. If the app asks to look around a user's computer, it must be explicit, narrow, understandable, reversible, and distributed in a way normal people can trust.

## Current Repo Reality

- The current app is a Vite, React, and TypeScript web app.
- The current build artifact is static browser output from `npm run build`.
- Browser storage is local IndexedDB through Dexie.
- The app is recommendation-only. It does not call provider APIs, connect accounts, store credentials, upload files, index folders, or execute external actions.
- `npm run detect:local-models` exists as a separate explicit local command. It checks Ollama and common local model folders, prints a summary by default, and does not change app state.

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

The current best candidate is Tauri.

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

This plan does not yet make Tauri a final architecture decision. The first desktop chunk should produce an ADR comparing at least Tauri and Electron, then recommend one.

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

Status: draft complete

Status Updated: 2026-07-04T11:28:22-06:00

Completion target: Task complete after owner confirmation

Goal:

Confirm the first desktop product boundary, target release order, publisher identity, and governance posture before any desktop code is added.

Recommended owner decisions:

| Decision | Recommended default | Reason | Owner status |
|---|---|---|---|
| First desktop scope | Limit the first desktop track to AI tool and local model discovery. | This matches the user's trust goal while avoiding broad file inspection too early. | Pending confirmation |
| User-selected folders | Defer folder inspection from the first public desktop release; allow only a separately reviewed prototype later. | Folder inspection changes the privacy surface and should wait for the trust-boundary design. | Pending confirmation |
| First target OS | Windows first, then macOS, then Linux packaging. | The current development lab is Windows-led, and Windows signing/install friction is the most urgent ordinary-user trust problem. | Pending confirmation |
| Publisher identity | Use `Guided AI Labs Ltd` for signing and publisher identity if it is the correct legal entity. | Signing should match a real legal publisher users can recognize. | Pending confirmation |
| Product naming | Keep the product as `AI Task Router` for the repo and app, with Guided AI Labs/OldSkoolAI branding decided before packaging. | This avoids changing code identity before the brand/distribution route is final. | Pending confirmation |
| Windows distribution | Evaluate Microsoft Store MSIX first; use direct signed installers only after signing and SmartScreen implications are reviewed. | Store packaging may reduce trust friction for non-technical users. | Pending confirmation |
| macOS distribution | Require Developer ID signing and notarization before external beta. | Unsigned macOS apps are not trustworthy enough for ordinary users. | Pending confirmation |
| Linux distribution | Start with AppImage and checksums; add `.deb` after install/uninstall testing. | This gives broad Linux reach without overbuilding package infrastructure. | Pending confirmation |
| Governance level | Keep governance level 1 for docs-only planning; review raising to at least a medium-control track before native local discovery implementation. | Local machine inspection is a higher-trust surface than the current browser MVP. | Pending confirmation |

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

Do not start Desktop Chunk D1 or any desktop implementation if the owner chooses broad folder inspection, background scanning, telemetry, credentials, provider API calls, or file-content indexing for the first desktop release without a separate security review.

D0 handoff:

Ask the owner to confirm, change, or defer the recommended defaults above. After confirmation, create Desktop Chunk D1 as a tool decision ADR comparing Tauri, Electron, and the option to stay web/PWA-only for longer.

### Phase 1: Desktop Tool Decision Spike

Goal:

Prove whether the current Vite app can be wrapped cleanly for desktop.

Expected work:

- create an ADR comparing Tauri and Electron
- scaffold Tauri in a branch or bounded chunk if selected
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

These are planning chunks, not current v0.2 work:

### Desktop Chunk D0 - Owner Decision And Governance Review

Completion target: Task complete

Outcome:

The owner confirms the first desktop scope, target OS order, publisher identity, and whether governance changes are needed before desktop implementation.

Current state:

D0 is opened as of 2026-07-04T11:28:22-06:00 with a proposed decision packet above. It is not complete until the owner confirms, changes, or defers those decisions.

### Desktop Chunk D1 - Desktop Tool Decision ADR

Completion target: Task complete

Outcome:

The repo records whether Tauri, Electron, or another wrapper is selected, with rationale, risks, costs, and exit plan.

### Desktop Chunk D2 - Desktop Shell Spike

Completion target: Draft complete

Outcome:

The current React app launches in a desktop shell without adding local scanning yet.

### Desktop Chunk D3 - Trust Boundary And Permission Model

Completion target: Task complete

Outcome:

Native commands, user permissions, local data handling, and response schemas are documented before implementation.

### Desktop Chunk D4 - Permissioned Local AI Tool Detection

Completion target: Integration complete

Outcome:

The desktop app can check selected local AI tools with explicit user approval and add found tools to My AI Tools.

### Desktop Chunk D5 - PWA Install Path

Completion target: Integration complete

Outcome:

The hosted web app can be installed from supported browsers while clearly stating that local discovery requires the desktop version.

### Desktop Chunk D6 - Packaging And Signing Spike

Completion target: Draft complete

Outcome:

Internal packages build for target OSes, signing requirements are documented, and public release remains blocked until trust checks pass.

### Desktop Chunk D7 - Controlled Beta Release Candidate

Completion target: Release ready candidate

Outcome:

Signed or clearly controlled beta installers are ready for limited users with instructions, checksums, support notes, and rollback path.

## Open Decisions

- Canonical product name for the desktop app.
- Legal publisher name for signing.
- Windows distribution path: Microsoft Store, direct signed installer, or both.
- macOS distribution path and Apple Developer account ownership.
- Linux artifact set: AppImage only first, or AppImage plus `.deb`.
- Whether local folder inspection is in first desktop release or deferred.
- Whether model names are hidden by default, shown with consent, or never stored.
- Whether auto-update is required for the first desktop release.
- Whether a public privacy page is needed before beta.
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

Desktop Chunk D0 is now open as a planning and governance review. Confirm, change, or defer the D0 owner decisions before any desktop code is added.

This keeps the current app shippable as a safe hosted/PWA experience while giving the trusted desktop app the extra care it deserves.
