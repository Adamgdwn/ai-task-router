# Current Build Pathway

Document ID: PATH-ENG-001
Version: 0.7.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-03
Last Reviewed: 2026-07-04
Next Review: During the next substantial build session
Last Updated: 2026-07-05T09:01:13-06:00
Status Updated: 2026-07-05T09:01:13-06:00

> This is the live path from charter baseline to the v0.2 Local Web App MVP.

## Purpose

This document keeps AI Task Router work small, detailed, timestamped, testable, and easy to resume.

The current product source is [docs/PRODUCT_BRIEF.md](PRODUCT_BRIEF.md), derived from the uploaded coder build brief and Mermaid diagrams.

## Future Distribution Note

Reference only as of 2026-07-05T08:58:47-06:00: the owner wants Old Skool AI to be the primary public product/download hub, with `guidedailabs.com` and `guidedaijourney.com` linking there. The owner also wants Windows, Mac, and Linux downloads as soon as possible. D10 adds a manual technical-preview artifact lane for Windows/macOS/Linux builds, but public ordinary-user desktop downloads remain held until signing/notarization, checksums, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner launch approval pass. D11 adds the public launch master plan in [docs/2026-07-04-public-launch-master-plan.md](2026-07-04-public-launch-master-plan.md), making the Old Skool AI hub, hosted web/PWA, desktop trust gates, support/withdrawal needs, and go/no-go board the controlled release map. D12 adds the [Old Skool AI Hub Handoff Package](2026-07-04-old-skool-ai-hub-handoff.md) with Linux-side page copy, cross-site links, held desktop-download copy, publish checklist, and rollback notes. D13 adds the [Cloudflare Production Launch Smoke](2026-07-05-cloudflare-production-launch-smoke.md), selecting and smoking `https://ai-task-router.pages.dev/` as the first canonical online app URL. D14 adds the [Public Hub And Cross-Site Link Smoke](2026-07-05-public-hub-and-cross-site-link-smoke.md), publishing the Old Skool AI hub, public security route, and Guided AI Labs / Guided AI Journey links. D15 adds the [AI Task Router Impact Estimator Methodology](2026-07-05-impact-estimator-methodology.md), a draft calculation backbone for 100k-token pricing, right-sizing savings, and scenario-based environmental estimates. D9's preview alias remains historical smoke evidence only and must not be used in public links.

## Future Desktop Trust Note

Reference only as of 2026-07-04T22:23:04-06:00: the project should keep two distribution options open: a hosted/PWA web app for low-friction use and a signed desktop app for permissioned local machine discovery. The detailed planning baseline is [docs/2026-07-04-desktop-trust-distribution-plan.md](2026-07-04-desktop-trust-distribution-plan.md), the public release execution map is [docs/2026-07-04-public-launch-master-plan.md](2026-07-04-public-launch-master-plan.md), and the public website handoff is [docs/2026-07-04-old-skool-ai-hub-handoff.md](2026-07-04-old-skool-ai-hub-handoff.md). Desktop Chunk D0 is confirmed for planning, Desktop Chunk D1 selected Tauri for the first shell spike in [ADR-0001](decisions/adr-0001-desktop-wrapper.md), Desktop Chunk D2 has the shell scaffold and Windows prerequisites, Desktop Chunk D3 defined the trust-boundary contract and CSP hardening, Desktop Chunk D4 implements a desktop-only `Check this computer` local AI tool discovery flow using custom Rust commands, Desktop Chunk D5 implements the hosted/browser PWA install path, Desktop Chunk D6 adds an opt-in internal Windows NSIS packaging path plus signing requirements documentation, Desktop Chunk D7 records the release/security readiness packet in [docs/2026-07-04-release-security-readiness-packet.md](2026-07-04-release-security-readiness-packet.md), D8 records the web/PWA release-candidate security pass in [docs/2026-07-04-web-release-candidate-security-pass.md](2026-07-04-web-release-candidate-security-pass.md), D9 records the Cloudflare Pages hosted preview smoke in [docs/2026-07-04-cloudflare-pages-hosted-preview-smoke.md](2026-07-04-cloudflare-pages-hosted-preview-smoke.md), D10 records the manual desktop technical-preview artifact lane in [docs/2026-07-04-desktop-technical-preview-artifacts.md](2026-07-04-desktop-technical-preview-artifacts.md), D11 records the public launch master plan, and D12 records the Old Skool AI hub handoff package. D4 keeps broad Tauri plugin permissions empty, rejects path details, hides model names by default, does not run startup/background scans, and validates with build-only desktop checks because Windows Application Control still blocks dev-mode, unsigned release executable launch, and final execution of the generated release Rust test binary. D5 adds manifest/install icons/service worker/install copy only; browser/PWA local discovery remains prohibited. D6 generated an unsigned internal NSIS artifact for evidence only; D10 can generate unsigned/unnotarized technical-preview artifacts for platform verification only. Public release remains held until canonical URL confirmation, custom-domain smoke if used, GitHub integration or direct-upload release process decision, desktop signing/trust evidence where applicable, and owner launch decision pass. The terminal `npm run detect:local-models` command remains separate and explicit.

## Future Product Planning Note

Reference only as of 2026-07-03T12:15:46-06:00: in addition to asking users which free agents they use and which paid subscriptions they already have, the app should later ask whether the user wants a proposed best AI stack. That future recommendation mode should cover a free stack and multiple paid tiers, while keeping the MVP boundary intact: recommendations only, no subscriptions purchased, no provider accounts connected, and no external action taken by the app.

## Required Work Pattern

For ordinary scoped work:

1. Check `git status --short`.
2. Read `AGENTS.md`.
3. Use `docs/context-map.md` when context routing is unclear.
4. Inspect only the files needed for the current chunk.
5. Run targeted validation after the change.

For material or risk-triggering work:

1. Start from `START_HERE.md`.
2. Run `bash scripts/governance-preflight.sh`.
3. Review the standards named in `START_HERE.md`.
4. Review `docs/standards/document-control-standard.md` when creating or materially updating controlled docs, pathway notes, ADRs, registers, validation logs, or handoffs.
5. Review `project-control.yaml` and open exceptions.
6. Capture a timestamp.
7. Work one detailed chunk only.
8. Update this pathway with status, validation, known gaps, and next action.

## Detailed Chunk Rule

Build chunks for this project must be unusually explicit.

Each implementation chunk should include:

- objective
- user outcome
- budget class
- target completion state
- allowed files or folders
- non-goals
- product boundary reminders
- domain terms to use
- acceptance criteria
- test expectations
- UX/product finish expectations
- security and privacy notes
- rollback or recovery path
- stop condition
- handoff note

Do not hand a coder a vague chunk such as "build the routing engine." Split work into small, verifiable slices with concrete files and expected behavior.

## Active Path

| Step | Status | Timestamp | Owner | Notes |
|------|--------|-----------|-------|-------|
| Charter lock | complete | 2026-07-03T11:35:41-06:00 | Technical Lead | Repo identity, product boundary, product brief, and detailed chunk rule are aligned. |
| Chunk 0 app skeleton | complete | 2026-07-03T11:58:27-06:00 | Technical Lead | Vite/React/TypeScript app shell, placeholder screens, smoke test, and control docs are in place. |
| Chunk 1 domain schemas | complete | 2026-07-03T12:10:23-06:00 | Technical Lead | Core TypeScript domain types and Zod schemas are implemented and tested. |
| Chunk 2 default registries | complete | 2026-07-03T12:23:53-06:00 | Technical Lead | Editable default registries and policy seeds validate against schemas without adding routing behavior. |
| Chunk Four hard gates | complete | 2026-07-03T12:47:24-06:00 | Technical Lead | Deterministic hard gates now return allowed model/source IDs, structured blocked items, warnings, and human approval requirements. |
| Chunk Five route candidate generation | complete | 2026-07-03T14:08:55-06:00 | Technical Lead | Score-free route candidates now generate lean, balanced, and premium plans or explicit unavailable states from hard-gate output. |
| Chunk Six scoring engine | complete | 2026-07-03T14:47:01-06:00 | Technical Lead | Generated route candidates now score against selected policy weights, task preferences, model capability fit, source fit, sensitivity fit, speed, and warnings. |
| Chunk Seven route card generator | complete | 2026-07-03T15:00:18-06:00 | Technical Lead | Route cards now assemble from task intake, hard gates, scored candidates, blocked routes, warnings, and supplied prompt-package placeholders. |
| Chunk Eight prompt package generator | complete | 2026-07-03T15:19:08-06:00 | Technical Lead | Deterministic local prompt packages now assemble from selected route steps, task context, allowed source IDs, route warnings, and approval requirements. |
| Chunk Nine local persistence | complete | 2026-07-03T17:19:32-06:00 | Technical Lead | Dexie/IndexedDB local store now persists and validates editable configuration, route cards, prompt packages, route logs, and feedback-ready records. |
| Chunk Ten export/import functions | complete | 2026-07-03T17:44:01-06:00 | Technical Lead | Schema-versioned local JSON import/export utilities, route-card and prompt-package Markdown, route-log CSV, and recoverable import validation are implemented and tested. |
| Chunk Eleven setup UI screens | complete | 2026-07-03T19:34:35-06:00 | Technical Lead | Setup screens now edit tool inventory, source permissions, policy defaults, and local setup preferences through IndexedDB-backed storage. |
| Brand polish detour | complete | 2026-07-03T19:54:49-06:00 | Technical Lead | Guided AI Labs logo assets, official navy/teal palette, branded app chrome, favicon/title metadata, and responsive setup polish are in place. |
| Chunk Twelve task intake and results UI | complete | 2026-07-03T21:03:52-06:00 | Technical Lead | Task intake and route results now run local validation, hard gates, candidate generation, scoring, route-card generation, prompt-package generation, warnings, blocked routes, and explicit local save. |
| Chunk Thirteen route card and prompt package UI | complete | 2026-07-03T22:08:42-06:00 | Technical Lead | Route card and prompt package detail screens now load saved local records, show route decisions and prompt steps, and prepare local copy/download Markdown. |
| Usability path detour | complete | 2026-07-03T23:55:54-06:00 | Technical Lead | Reworked the app front door, setup aisles, task flow, and saved-plan copy into plain-language conversational UX. |
| Chunk Fourteen route log and feedback UI | complete | 2026-07-04T00:24:26-06:00 | Technical Lead | Past Choices now lists saved route decisions, supports search/filter/sort, saves local feedback, and opens saved decision cards without sending feedback anywhere. |
| Usability surgery detour | complete | 2026-07-04T00:53:25-06:00 | Technical Lead | Reworked My AI Tools, What To Include, My Task, and Best Options so average users see normal tool/source/task choices instead of internal routing language. |
| My AI Tools dropdown cleanup detour | complete | 2026-07-04T08:38:31-06:00 | Technical Lead | Replaced subscription/tier/text-field setup with provider, visible model, and thinking-setting dropdowns backed by an everyday tool catalog. |
| My AI Tools progressive app setup detour | complete | 2026-07-04T09:00:27-06:00 | Technical Lead | Replaced the prefilled tool grid with progressive AI app, account-level, and frequency rows backed by a broader app catalog. |
| My AI Tools sparse selector correction | complete | 2026-07-04T09:18:42-06:00 | Technical Lead | Corrected stale local data and row headings so My AI Tools starts as one generic Tool selection row, not five named provider cards. |
| My AI Tools manual add and local models detour | complete | 2026-07-04T09:40:46-06:00 | Technical Lead | Replaced automatic row reveal with an explicit branded add button, provider-specific plan labels, local model choices, and a local detector script. |
| My AI Tools tailored account levels detour | complete | 2026-07-04T10:00:43-06:00 | Technical Lead | Researched and expanded provider-specific account dropdowns, added remove buttons, and fixed selected-chip/dropdown wrapping. |
| Contextual task include detour | complete | 2026-07-04T10:20:07-06:00 | Technical Lead | Removed standalone What To Include onboarding and moved optional include choices into My Task. |
| Desktop trust and distribution planning detour | complete | 2026-07-04T11:17:43-06:00 | Technical Lead | Added the future hosted/PWA plus signed desktop distribution plan, trust principles, phases, and governance review prompt without changing v0.2 scope. |
| Document control standard adoption | complete | 2026-07-04T11:28:22-06:00 | Technical Lead | Added the local document-control standard and routed governed docs, validation logs, ADRs, registers, and handoffs through it. |
| Desktop Chunk D0 owner decision and governance review | complete | 2026-07-04T14:51:54-06:00 | Technical Lead | Owner's request to carry on was treated as confirmation of the D0 recommended defaults for planning. No desktop implementation was approved by D0. |
| Desktop Chunk D1 desktop wrapper ADR | complete | 2026-07-04T14:51:54-06:00 | Technical Lead | Added [ADR-0001](decisions/adr-0001-desktop-wrapper.md), selecting Tauri for the first desktop shell spike, keeping PWA as the hosted path and Electron as fallback. |
| Document control date-first working-doc correction | complete | 2026-07-04T15:22:04-06:00 | Technical Lead | Renamed the desktop trust working plan to [docs/2026-07-04-desktop-trust-distribution-plan.md](2026-07-04-desktop-trust-distribution-plan.md), updated repo links, and clarified the date-first working-document convention. |
| Desktop Chunk D2 Tauri shell spike | draft complete with dev-mode Application Control blocker | 2026-07-04T16:04:28-06:00 | Technical Lead | Installed Rustup/Rust/Cargo and Visual Studio Build Tools with MSVC/SDK, verified `desktop:info`, built the no-bundle release executable, and confirmed the release window title `AI Task Router`. `desktop:dev` is blocked by Windows Application Control for generated debug build scripts. No native discovery, folder inspection, packaging, signing, updater, provider connection, telemetry, or file indexing was added. |
| Desktop Chunk D3 trust boundary and permission model | task complete with current release-launch App Control blocker | 2026-07-04T16:25:09-06:00 | Technical Lead | Defined the frontend/native trust boundary, future command contracts, user permission flow, local data rules, response/error schemas, and threat controls; added explicit desktop CSP and Zod schema contracts without adding native discovery or machine inspection. The no-bundle build passes, but the current rebuilt unsigned release executable is blocked by Windows Application Control. |
| Desktop Chunk D4 permissioned local AI tool detection | integration complete with build-only desktop validation and Rust test-executable App Control blocker | 2026-07-04T18:16:13-06:00 | Technical Lead | Added custom Tauri/Rust discovery commands, a desktop-only `Check this computer` UI, schema-validated frontend bridge, allowlisted Ollama/LM Studio/Jan/GPT4All checks, summary-first results, optional model-name reveal, and add-to-My-AI-Tools actions. No broad plugin permissions, paths, startup/background scans, provider calls, telemetry, file indexing, packaging, signing, updater, credentials, or external actions were added. |
| Desktop Chunk D5 PWA install path | integration complete | 2026-07-04T18:41:17-06:00 | Technical Lead | Added browser install manifest, branded 192px/512px PWA icons, production-only service-worker registration, Start Here install copy, service-worker gating tests, and production-preview evidence that install metadata is served. Browser/PWA local discovery remains prohibited and public hosting was not executed. |
| Desktop Chunk D6 packaging and signing spike | draft complete | 2026-07-04T19:20:30-06:00 | Technical Lead | Added an opt-in internal Windows NSIS packaging config and script, artifact SHA-256 inspection helper, Node script tests, official-source signing requirements, and an internal unsigned artifact evidence record. Public desktop release remains blocked until platform signing/trust checks pass. |
| Desktop Chunk D7 release and security readiness packet | task complete, release hold | 2026-07-04T19:34:29-06:00 | Technical Lead | Added the D7 release/security readiness packet, confirmed GitHub plus Cloudflare as the intended free distribution path, recommended one canonical Cloudflare Pages app URL linked from the three existing sites, added a public security policy, and held public release until E2E/cybersecurity gates and desktop signing/trust checks pass. |
| Chunk Fifteen E2E tests and fixture suite | integration complete | 2026-07-04T20:02:34-06:00 | Technical Lead | Added 22 safe fixture tasks and Playwright E2E coverage for first-run setup, My AI Tools manual-add/local-model/remove/migration behavior, contextual task include choices, routing, saved route cards, prompt-package export preparation, route-log feedback, no-execution controls, and narrow-viewport overflow. |
| Desktop Chunk D8 web release candidate security pass | task complete, release hold | 2026-07-04T20:27:56-06:00 | Technical Lead | Added a repeatable `npm run scan:web-rc` artifact scan, recorded the web release-candidate security pass, verified clean install/audit/tests/build/E2E/local production preview, and held public launch until Cloudflare Pages HTTPS preview, canonical URL confirmation, and public-link smoke pass. |
| Canonical URL owner correction | complete | 2026-07-04T20:49:44-06:00 | Technical Lead | Corrected release handoffs to stop recommending unconfirmed `https://app.oldskoolai.com/`; the canonical URL must now be selected from an owner-controlled root site, subpath, Cloudflare Pages default URL, or newly created subdomain before public launch. |
| Desktop Chunk D9 Cloudflare Pages hosted preview smoke | task complete, release hold | 2026-07-04T21:05:03-06:00 | Technical Lead | Created Cloudflare Pages project `ai-task-router`, deployed a Wrangler direct-upload preview at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`, verified hosted HTTPS behavior with Node and Chromium, ran hosted Playwright E2E, and kept public launch held until canonical URL/custom-domain/GitHub-integration decisions pass. |
| Desktop Chunk D10 desktop technical-preview artifacts | draft complete, public download hold | 2026-07-04T21:52:19-06:00 | Technical Lead | Added a manual GitHub Actions workflow for Windows/macOS/Linux technical-preview artifacts, a shared Tauri preview bundle config, platform package scripts, and SHA-256 checksum file generation. Local Windows technical-preview packaging passed and produced a `NotSigned` NSIS artifact for technical review only; public downloads remain held until signing/notarization, smoke tests, support/withdrawal copy, and owner public-launch approval pass. |
| Desktop Chunk D11 public launch master plan | task complete, release hold | 2026-07-04T22:10:36-06:00 | Technical Lead | Added [Public Launch Master Plan](2026-07-04-public-launch-master-plan.md) to control the Old Skool AI hub path, hosted web/PWA release gates, desktop trust/signing gates, cybersecurity checklist, support/withdrawal needs, and public go/no-go board before launch work continues. |
| Desktop Chunk D12 Old Skool AI hub handoff package | task complete, release hold | 2026-07-04T22:23:04-06:00 | Technical Lead | Added [Old Skool AI Hub Handoff Package](2026-07-04-old-skool-ai-hub-handoff.md) with Linux-side page/tab instructions, online-app copy, held desktop-download copy, cross-site links, publish checklist, and rollback/removal notes. |
| Night closeout documentation sweep | task complete | 2026-07-04T22:43:52-06:00 | Technical Lead | Updated the token-friendly startup handoff, recorded the DirectLink assumption that Adam will ensure Linux reads the sent handoff, updated implementation status and work tracking, and left D13 intentionally paused. |
| AI environmental impact information session | draft complete | 2026-07-04T23:38:12-06:00 | Technical Lead | Added [AI Environmental Impact Information Session](2026-07-04-ai-environmental-impact-information-session.md) with researched energy/water anchors, right-sizing formulas, novice/intermediate/heavy-user scenarios, scale framing, source caveats, and safe claim language. This is an internal draft, not public marketing copy or release approval. |
| Desktop Chunk D13 Cloudflare production launch smoke | task complete, web/PWA link-ready | 2026-07-05T07:22:04-06:00 | Technical Lead | Added [Cloudflare Production Launch Smoke](2026-07-05-cloudflare-production-launch-smoke.md), selected `https://ai-task-router.pages.dev/` as the first canonical online app URL, accepted Wrangler direct upload for this production web chunk, deployed branch `main` from source `af2b367`, reran local and hosted web/PWA gates, and kept Old Skool AI page publication, social launch, custom domains, GitHub Releases, and public desktop downloads gated. |
| Desktop Chunk D14 public hub and cross-site link smoke | task complete, public web doorway live | 2026-07-05T07:57:15-06:00 | Technical Lead | Added [Public Hub And Cross-Site Link Smoke](2026-07-05-public-hub-and-cross-site-link-smoke.md), published the Old Skool AI `AI Task Router` hub at `https://oldskoolai.com/ai-task-router/`, added the public security route at `https://oldskoolai.com/security/`, linked Guided AI Labs and Guided AI Journey to the hub, and smoked public desktop/mobile pages while keeping social posts and desktop downloads gated. |
| Impact estimator methodology | draft complete | 2026-07-05T08:58:47-06:00 | Technical Lead | Added [AI Task Router Impact Estimator Methodology](2026-07-05-impact-estimator-methodology.md), `src/domain/impact/impactEstimator.ts`, and focused tests for reviewed 100k-token pricing anchors, right-sizing cost savings, and scenario-based energy/water ranges. This is a calculation backbone for public education and future opt-in estimator work, not a live UI change or public savings claim. |
| Source control baseline | complete | 2026-07-03T11:51:11-06:00 | Technical Lead | Local Git repo initialized and public GitHub repo created at `https://github.com/Adamgdwn/ai-task-router`. |

## Chunk Zero - Charter Lock And Planning Baseline

Status: complete
Status Updated: 2026-07-03T11:49:34-06:00

Completion target: Task complete

Budget class: Small

Objective:

Align the repository with AI Task Router before implementation begins.

User outcome:

A future coding agent can understand the product, boundary, governance classification, and first build chunks without rereading the uploaded brief from scratch.

Allowed files:

- `README.md`
- `project-control.yaml`
- `docs/PRODUCT_BRIEF.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `START_HERE.md` only if the top-level active plan changes

Non-goals:

- Do not initialize the Vite app.
- Do not implement routing logic.
- Do not add dependencies.
- Do not create connector, auth, provider API, or agent-execution code.

Acceptance criteria:

- [x] Repo identity says AI Task Router, not generic Agent Picker.
- [x] Project classification states decision-support web application, not autonomous AI agent.
- [x] README states the no-execution and no-external-API boundary.
- [x] Product brief exists in repo and summarizes the uploaded build brief.
- [x] Active pathway includes the Detailed Chunk Rule.
- [x] Preflight passes or any remaining gaps are explicitly recorded.
- [x] Known inability to commit/push is recorded if the folder is still not a Git repo.

Validation:

- `bash scripts/governance-preflight.sh`
- `git status --short` if/when the folder becomes a Git repo
- Manual check of product boundary wording in README and product brief

Stop condition:

Reached. The charter baseline is clear and the next implementation chunk is defined in enough detail to execute.

Known gaps:

- This folder was not a Git repository at session start. Source control was initialized on 2026-07-03 and pushed to the public GitHub repository.
- The app skeleton does not exist yet.
- Uploaded Mermaid diagrams are not yet copied into repo-local docs.

Next action:

Proceed to Chunk One when the owner is ready to scaffold the app.

## Chunk One - App Skeleton And Control Docs

Status: complete
Status Updated: 2026-07-03T11:58:27-06:00

Completion target: Task complete

Budget class: Small

Objective:

Create the local-first AI Task Router skeleton using Vite, React, and TypeScript.

User outcome:

The owner can run a local placeholder app, see the planned screens, and confirm the product boundary before routing logic exists.

Allowed work:

- Initialize package scripts and app scaffold.
- Add Vite/React/TypeScript configuration.
- Add Vitest configuration and one smoke test.
- Add Playwright skeleton only if straightforward and low-friction.
- Add placeholder navigation for planned screens.
- Add project control docs expected by the build brief if they do not already exist.

Expected files or folders:

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `playwright.config.ts` if included
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/ui/screens/*`
- `src/tests/unit/*` or equivalent smoke test location
- `IMPLEMENTATION_STATUS.md`
- `SESSION_STATE.md`
- `DECISION_LOG.md`

Non-goals:

- Do not implement route scoring.
- Do not implement hard gates.
- Do not add IndexedDB persistence yet.
- Do not add external APIs, auth, OAuth, connectors, provider clients, telemetry, desktop packaging, or background workers.

Product boundary reminders:

- The app recommends; it does not act.
- Normal use after load must not require external network calls.
- No credentials are stored.

Acceptance criteria:

- [x] App starts locally with the documented command.
- [x] Placeholder screens exist for welcome, tool inventory, source permissions, policy settings, task intake, route results, route card, prompt package, route log, and reference.
- [x] Placeholder UI clearly states the no-execution/no-external-API boundary.
- [x] Test command runs and passes with at least one smoke test.
- [x] README includes install/run/test instructions.
- [x] `IMPLEMENTATION_STATUS.md` records Chunk One complete and Chunk Two next.
- [x] `SESSION_STATE.md` records files changed, commands run, and known gaps.

Validation:

- `npm install`
- `npm audit --audit-level=moderate`
- `npm run test`
- `npm run build`
- manual local app start check at `http://127.0.0.1:5173`

Test expectations:

- `npm install`
- `npm run test`
- `npm run build`
- Manual local app start check

UX/product finish expectations:

- Keep UI simple and app-like.
- Do not make a marketing landing page.
- Use stable placeholder navigation that future screens can keep.
- Avoid decorative overdesign before real workflows exist.

Security and privacy notes:

- No API keys.
- No external fetch calls.
- No credential fields.
- No telemetry.

Rollback or recovery:

Revert scaffold files if the selected stack changes before routing logic is added.

Stop condition:

Reached. The skeleton runs and placeholder screens validate. Do not continue into domain schemas in the same chunk.

Handoff note:

Next chunk should implement TypeScript domain types and Zod schemas from the product brief.

## Chunk Two - Domain Types And Runtime Schemas

Status: complete
Status Updated: 2026-07-03T12:10:23-06:00

Completion target: Task complete

Budget class: Small

Objective:

Implement the core TypeScript domain model and Zod schemas.

User outcome:

Future routing logic has stable, validated data shapes for models, sources, task intake, route options, route cards, prompt steps, and route logs.

Allowed files:

- `src/domain/types.ts`
- `src/domain/schemas.ts`
- `src/tests/unit/domainSchemas.test.ts`
- minor exports/index files only if needed by local patterns

Non-goals:

- Do not create default model registry data yet.
- Do not implement hard gates, scoring, persistence, exports, or UI forms.
- Do not hard-code provider behavior into schemas.

Acceptance criteria:

- [x] Permission level accepts only `0 | 1 | 2 | 3 | 4`.
- [x] Sensitivity class accepts only the product-defined values.
- [x] Task intake schema validates a representative valid task.
- [x] Task intake schema rejects invalid sensitivity and invalid permission references.
- [x] Route card schema validates a representative route card.
- [x] Route option, route step, prompt step, and route log entry schemas are covered.
- [x] Types infer cleanly from schemas or schemas are aligned with explicit interfaces.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm audit --audit-level=moderate`
- `npm run test -- domainSchemas`
- `npm run build`

Test expectations:

- `npm run test -- domainSchemas`
- `npm run build`

Security and privacy notes:

Runtime schemas are the first trust boundary for imported/exported config and route records. Validation errors should be clear enough for future UI display.

Rollback or recovery:

Schema-only changes can be reverted before routing logic depends on them.

Stop condition:

Reached. Schemas and tests pass. Seed registries were not added in this chunk.

Handoff note:

Next chunk should create default registries and policy seeds that validate against the schemas without adding routing behavior.

## Chunk Three - Default Registries And Policy Seeds

Status: complete
Status Updated: 2026-07-03T12:23:53-06:00

Completion target: Task complete

Budget class: Small

Objective:

Create editable seed data for models, source permissions, policy defaults, and task templates.

User outcome:

The app has realistic local defaults that can drive routing without external API calls.

Expected files:

- `src/domain/defaults/defaultModels.ts`
- `src/domain/defaults/defaultSources.ts`
- `src/domain/defaults/defaultPolicies.ts`
- `src/domain/defaults/defaultTaskTemplates.ts`
- `src/tests/unit/defaultRegistries.test.ts`

Non-goals:

- Do not encode provider capabilities directly in routing functions.
- Do not claim model names or provider lineups are permanent.
- Do not add import/export UI yet.

Acceptance criteria:

- [x] Default models load and validate against schemas.
- [x] Each enabled model has capability scores.
- [x] Human/manual review is always available as a final approval route step.
- [x] Default source registry includes local files, uploaded docs, web, GitHub, M365/SharePoint, Google Drive, personal memory, and other.
- [x] Default policies include least-resource, balanced, and quality-first scoring weights.
- [x] Tests reject duplicate IDs.
- [x] Tests confirm no seed item requires credentials or external calls.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm audit --audit-level=moderate`
- `npm run test -- defaultRegistries`
- `npm run test`
- `npm run build`

Implementation notes:

- Added minimal policy default and task template schemas so the new seed data validates at the same runtime boundary as the existing domain model.
- Seed model labels are intentionally generic user-configured placeholders, not claims about permanent provider lineups.
- External-looking sources such as web, GitHub, Microsoft 365/SharePoint, and Google Drive are reference categories only; the app still does not connect to them.

Test expectations:

- `npm run test -- defaultRegistries`
- `npm run build`

Stop condition:

Reached. All seed data validates, duplicate IDs are tested, no seed item requires credentials or external calls, and no routing behavior has been implemented.

Handoff note:

Next chunk should implement hard gates using these schemas and defaults. Do not add scoring, persistence, exports, or UI forms in that chunk.

## Remaining Planned Chunks

These chunks are intentionally detailed before implementation so later coding stays focused and small. Each chunk should be revisited immediately before execution, but the order and boundaries below are the current build pathway.

## Chunk Four - Hard Gates

Status: complete
Status Updated: 2026-07-03T12:47:24-06:00

Completion target: Task complete

Budget class: Small

Objective:

Implement deterministic hard gates that evaluate a task intake, model inventory, and source permissions before route scoring exists.

User outcome:

The app can explain why a route is impossible or risky before it recommends anything, especially for sensitivity, source access, current facts, citations, and public-facing output.

Allowed files or folders:

- `src/domain/routing/hardGates.ts`
- `src/domain/routing/*` index files only if useful
- `src/tests/unit/hardGates.test.ts`
- minor schema or type additions only if a hard-gate result shape is missing
- `docs/2026-07-03-current-pathway.md`
- `IMPLEMENTATION_STATUS.md`
- `SESSION_STATE.md`
- `DECISION_LOG.md` only if a new boundary decision is made

Non-goals:

- Do not score routes.
- Do not generate lean, balanced, or premium candidates.
- Do not create route cards or prompt packages.
- Do not add persistence, export/import, or UI forms.
- Do not call external APIs, inspect local files, search the web, or connect to providers.

Product boundary reminders:

- Hard gates produce local recommendations and warnings only.
- Highly restricted content must not be routed to non-local or external-style model options.
- No-access sources must never appear in route steps.
- The app may warn that a user should do research elsewhere, but it must not perform that research.

Domain terms to use:

- hard gate
- blocked route
- warning
- permission level
- sensitivity class
- source permission
- human approval
- current facts
- citations
- public-facing risk

Acceptance criteria:

- [x] Highly restricted tasks block all non-local model/tool options and preserve manual human review as the safe fallback.
- [x] Requested sources with permission level `0` are excluded and reported as blocked.
- [x] Sources that do not allow the task sensitivity class are blocked with clear reason strings.
- [x] Tasks requiring current facts or citations produce a warning unless a research-capable model/tool and an allowed research source are available.
- [x] Public-facing, regulated, highly restricted, high-quality, or critical tasks require a human approval warning.
- [x] Gate output is deterministic and stable for repeated identical inputs.
- [x] Gate functions are pure and receive all inputs explicitly.
- [x] Tests cover allowed, warning, and blocked outcomes.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm run test -- hardGates`
- `npm run test`
- `npm run build`

Implementation notes:

- Added `evaluateHardGates` as a pure domain function with explicit task and model inputs.
- Hard-gate output includes allowed model IDs, allowed source IDs, structured blocked model/source details, typed warnings, and a human approval flag.
- Blocked sources are limited to requested sources that the gate rejects; unrequested sources are ignored rather than surfaced as route blockers.
- No schema changes were needed, and no scoring, candidate generation, persistence, exports, UI forms, external calls, source search, or provider connections were added.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test -- hardGates`
- `npm run build`
- Add table-style fixtures for edge cases where helpful.

UX/product finish expectations:

- Reason strings should be short, human-readable, and ready for later UI display.
- Avoid technical jargon such as raw Zod paths in user-facing messages.
- Preserve enough structured detail for route cards to show warnings and blocked routes later.

Security and privacy notes:

- Do not log task descriptions or source details.
- Do not store any gate output in this chunk.
- Do not infer access to sources beyond the explicit source permission registry.

Rollback or recovery path:

Hard gate module and tests can be reverted before candidate generation depends on them. If schema changes are required, keep them narrow and document the reason in `DECISION_LOG.md`.

Stop condition:

Reached. Hard gates return typed warnings and blocked details with passing unit tests. Candidate generation was not started.

Handoff note:

Next chunk should use hard-gate output to generate lean, balanced, and premium route candidates without scoring them yet.

## Chunk Five - Route Candidate Generation

Status: complete
Status Updated: 2026-07-03T14:08:55-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Generate valid lean, balanced, and premium route candidates from task intake, available models, source permissions, policy defaults, and hard-gate results.

User outcome:

For a valid task, the app can produce three understandable route options that reflect resource posture before any numeric scoring or recommendation selection exists.

Allowed files or folders:

- `src/domain/routing/candidateGeneration.ts`
- `src/domain/routing/hardGates.ts` only for integration adjustments
- `src/domain/routing/*` index files only if useful
- `src/tests/unit/routeCandidates.test.ts`
- fixture data under `src/tests/fixtures/*` if it keeps tests readable
- active pathway and status docs

Non-goals:

- Do not implement weighted scoring.
- Do not choose the recommended route.
- Do not generate final route cards or prompt packages.
- Do not persist or export candidates.
- Do not build UI.

Product boundary reminders:

- Candidate routes are plans only.
- A route step may say the user should consult a research tool, but the app must not consult it.
- Candidate generation must respect all hard-gate exclusions.

Domain terms to use:

- route candidate
- lean route
- balanced route
- premium route
- route step
- model step
- research step
- artifact step
- manual step
- human review

Acceptance criteria:

- [x] Generates one lean candidate when at least one safe small/manual path exists.
- [x] Generates one balanced candidate when a safe mid-tier or synthesis path exists.
- [x] Generates one premium candidate when a safe frontier/research/artifact path exists.
- [x] Omits or marks unavailable strategies when no safe candidate can be built.
- [x] Uses `defaultFinalApprovalRouteStep` where human review is required.
- [x] Does not include blocked sources or blocked model options in candidate steps.
- [x] Produces stable route IDs and step IDs suitable for tests and later route-card generation.
- [x] Candidate summaries explain the route posture without score language.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm run test -- routeCandidates`
- `npm run test`
- `npm run build`
- `git diff --check`

Implementation notes:

- Added `generateRouteCandidates` as a pure domain function in `src/domain/routing/candidateGeneration.ts`.
- Candidate generation returns score-free `candidates` plus explicit `unavailable` strategy states instead of filling route option scores with placeholder numbers.
- Stable route IDs use `route-{taskId}-{strategy}` and route step IDs use route-specific suffixes such as `-research`, `-synthesis`, `-manual`, `-artifact`, and `-human-approval`.
- Lean routes prefer a safe small model and fall back to manual human preparation when hard gates remove the lighter model path.
- Balanced routes require a safe mid-tier or frontier synthesis path.
- Premium routes require a safe frontier, research, or artifact-capable path and may add artifact packaging when the task output calls for it.
- Current-facts and citation tasks add a manual research step only when hard gates allow both a web source and a research-capable model/tool.
- Human approval clones `defaultFinalApprovalRouteStep` with candidate-specific step IDs when hard gates require approval.
- No scoring, recommendation selection, route cards, prompt packages, persistence, exports, UI, source search, provider calls, connectors, credentials, or telemetry were added.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test -- routeCandidates`
- `npm run build`
- Cover at least these fixtures: simple public writing task, confidential internal synthesis task, current-facts research task, public-facing draft, highly restricted fallback.

UX/product finish expectations:

- Candidate labels should be readable in a results screen without rewriting.
- Route steps should be concise enough for cards but detailed enough to become prompt package inputs.
- Missing candidate states should produce useful explanations instead of empty arrays with no context.

Security and privacy notes:

- Treat candidate generation as pure local computation.
- Do not add connectors, file reads, local indexing, provider SDKs, or telemetry.
- Keep source IDs explicit so later UI can avoid displaying unauthorized sources.

Rollback or recovery path:

Candidate generation can be reverted independently if scoring reveals the wrong abstraction. Keep hard-gate changes backward compatible with Chunk Four tests.

Stop condition:

Reached. Candidates are generated and validated by unit tests. Scoring and recommendation selection were not added.

Handoff note:

Next chunk should score generated candidates with policy weights and select a recommended route.

## Chunk Six - Scoring Engine

Status: complete
Status Updated: 2026-07-03T14:47:01-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Score generated route candidates using policy weights, task preferences, quality needs, source fit, sensitivity fit, cost, energy, and speed.

User outcome:

The app can select a recommended route and explain the tradeoffs without pretending the score is an objective truth.

Allowed files or folders:

- `src/domain/routing/scoring.ts`
- `src/domain/routing/candidateGeneration.ts` only for necessary integration details
- `src/tests/unit/routeScoring.test.ts`
- shared test fixtures under `src/tests/fixtures/*`
- active pathway and status docs

Non-goals:

- Do not generate final route cards.
- Do not generate prompt packages.
- Do not persist recommendations.
- Do not build UI.
- Do not add provider-specific pricing tables or live cost lookups.

Product boundary reminders:

- Scores rank local recommendations only.
- Cost and energy levels are qualitative MVP estimates, not real-time provider billing data.
- Human approval remains a safety requirement even when a route scores highly.

Domain terms to use:

- scoring weights
- least-resource
- balanced
- quality-first
- cost preference
- energy preference
- quality bar
- tie-breaker
- recommended route

Acceptance criteria:

- [x] Scores each unblocked candidate on a `0` to `100` scale.
- [x] Applies policy default weights for least-resource, balanced, and quality-first modes.
- [x] Incorporates task cost and energy preferences.
- [x] Incorporates quality bar and knowledge work type fit using model capability scores.
- [x] Penalizes routes that carry warnings without hiding those warnings.
- [x] Uses least-resource-first tie-breakers when scores are equal or close enough to be ambiguous.
- [x] Never recommends a blocked route.
- [x] Returns transparent score components for later UI display.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm run test -- routeScoring`
- `npm run test`
- `npm run build`

Implementation notes:

- Added `scoreRouteCandidates` as a pure domain function in `src/domain/routing/scoring.ts`.
- Scoring accepts task intake, generated route candidates, model inventory, and one selected policy default.
- Policy weights are normalized before use so the default policy totals do not need to add to exactly `1`.
- Score components include cost fit, energy fit, quality fit, speed fit, source fit, sensitivity fit, and warning penalty.
- Cost and energy remain qualitative MVP estimates from candidate posture and task preferences, not live provider billing or energy data.
- Quality fit uses model capability scores mapped to the task knowledge work type and adjusted by the requested quality bar.
- Warning messages remain visible on candidates while a capped warning penalty reduces the final score.
- Recommendation selection never considers unavailable candidates and applies the least-resource tie-breaker only when the top scores are within the ambiguity threshold.
- No route cards, prompt packages, persistence, exports, UI, provider-specific pricing, live cost lookup, external calls, connectors, credentials, or telemetry were added.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test -- routeScoring`
- `npm run build`
- Add tests for tie-breakers, warning penalties, no-candidate states, and policy changes.

UX/product finish expectations:

- Score explanations should be understandable to a non-technical user.
- Avoid false precision in labels; keep the exact number available but emphasize tradeoffs.
- Prepare structured data for later result cards, such as strengths, cautions, and selected policy.

Security and privacy notes:

- Do not add telemetry or external cost data.
- Do not embed provider claims that may become stale.
- Keep scoring deterministic so route logs are explainable.

Rollback or recovery path:

Scoring can be reverted if the weighting model proves confusing. Candidate generation should still pass without scoring.

Stop condition:

Reached. Route candidates can be scored, transparent components are returned, and a recommendation can be selected in unit tests. Route cards were not produced.

Handoff note:

Next chunk should assemble route cards from task intake, scored candidates, blocked routes, warnings, and prompt-package placeholders.

## Chunk Seven - Route Card Generator

Status: complete
Status Updated: 2026-07-03T15:00:18-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Generate a complete route card object from task intake, hard gates, generated candidates, scoring output, and a prompt package supplied by the next generator boundary.

User outcome:

The app can produce an export-ready route decision artifact with recommended route, alternatives, warnings, blocked routes, and traceable metadata.

Allowed files or folders:

- `src/domain/routing/routeCardGenerator.ts`
- `src/domain/routing/scoring.ts` only for integration adjustments
- `src/domain/routing/candidateGeneration.ts` only for integration adjustments
- `src/tests/unit/routeCardGenerator.test.ts`
- shared fixtures under `src/tests/fixtures/*`
- active pathway and status docs

Non-goals:

- Do not implement prompt package generation beyond a narrow placeholder input or temporary internal stub.
- Do not persist route cards.
- Do not export route cards to files.
- Do not build UI.
- Do not change the no-external-action boundary.

Product boundary reminders:

- A route card is a local decision artifact, not an executed route.
- Blocked routes must remain visible in the card so the user understands what was rejected.
- Human approval warnings must survive card generation.

Domain terms to use:

- route card
- recommended option
- blocked route
- warnings
- route option
- prompt package reference
- createdAt

Acceptance criteria:

- [x] Creates a `RouteCard` that validates against `routeCardSchema`.
- [x] Includes all generated route options that are safe to show.
- [x] Sets `recommendedOptionId` to the selected scored candidate.
- [x] Preserves hard-gate warnings and blocked route reasons.
- [x] Includes task sensitivity class and task ID.
- [x] Uses deterministic IDs where practical and a testable timestamp injection point.
- [x] Handles no-safe-route cases with a clear manual-review route card.

Implementation notes:

- Added `generateRouteCard` as a pure domain function with explicit task, hard-gate, scoring, prompt-package, and `createdAt` inputs.
- The prompt package is supplied as a boundary object and must belong to the same task; real prompt-package generation remains Chunk Eight.
- Scored candidates map into strict `RouteOption` objects, keeping route scores and option warnings/cautions available for later UI display.
- Hard-gate blocked models, hard-gate blocked sources, and unavailable route candidates map into visible `blockedRoutes`.
- If no safe scored candidate exists, the card gets a deterministic manual-review fallback route so the route card still validates and clearly explains the hold state.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test -- routeCardGenerator`
- `npm run build`
- Tests should validate route cards with `routeCardSchema.safeParse`.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- `npm run test -- routeCardGenerator` passed with 1 test file and 5 tests.
- `npm run test` passed with 7 test files and 44 tests.
- `npm run build` passed.
- `git diff --check` passed with only normal Windows LF-to-CRLF notices.

UX/product finish expectations:

- Generated text should be card-ready: concise title, route summaries, warnings, and blocked-route labels.
- Avoid duplicating the same warning repeatedly across card-level and option-level fields unless it improves clarity.

Security and privacy notes:

- Do not serialize or log sensitive task descriptions outside the returned local object.
- Do not include blocked source details beyond the source labels/IDs already provided by the user.
- No persistence or export side effects in this chunk.

Rollback or recovery path:

Route card generator can be reverted without affecting hard gates, candidate generation, or scoring if kept as a separate module.

Stop condition:

Reached. Route-card objects validate, the focused route-card generator tests pass, and the prompt package generator/UI were not built.

Handoff note:

Next chunk should replace placeholder prompt package handling with a real deterministic prompt package generator. Do not call AI models, send prompts, persist prompt packages, export files, or add provider integrations in that chunk.

## Chunk Eight - Prompt Package Generator

Status: complete
Status Updated: 2026-07-03T15:19:08-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Generate a structured prompt package from the selected route, task intake, source permissions, warnings, and approval requirements.

User outcome:

The user receives a usable sequence of prompts/instructions they can manually paste into their chosen tools while staying inside the app's recommendation-only boundary.

Allowed files or folders:

- `src/domain/prompting/promptPackageGenerator.ts`
- `src/domain/routing/routeCardGenerator.ts` only for integration adjustments
- `src/tests/unit/promptPackageGenerator.test.ts`
- shared fixtures under `src/tests/fixtures/*`
- active pathway and status docs

Non-goals:

- Do not call an AI model.
- Do not send prompts to tools.
- Do not add clipboard automation unless explicitly deferred and approved later.
- Do not persist or export prompt packages.
- Do not build UI.

Product boundary reminders:

- Prompt packages are local instructions for the user.
- The app does not execute the prompt package.
- The package must carry sensitivity and source-use reminders where needed.

Domain terms to use:

- prompt package
- prompt step
- input refs
- expected output
- human approval
- source-use reminder
- route step

Acceptance criteria:

- [x] Creates a `PromptPackage` that validates against `promptPackageSchema`.
- [x] Includes one or more prompt steps aligned with the recommended route steps.
- [x] Includes explicit expected output for each prompt step.
- [x] Marks steps requiring human approval where public-facing risk, regulated, highly restricted, critical, or high-quality work requires it.
- [x] Includes source-use reminders for allowed sources and excludes blocked sources.
- [x] Includes current-facts and citation reminders when the task requires them.
- [x] Avoids provider-specific prompt claims unless they come from user-configured inventory labels.

Implementation notes:

- Added `generatePromptPackage` as a pure domain function with explicit `task`, `selectedRoute`, `hardGateResult`, and optional prompt-package ID inputs.
- Generated prompt packages validate through `promptPackageSchema.parse`.
- Prompt step IDs are deterministic and route-step aligned by default.
- Instructions are deliberately detailed enough for manual pasting while repeating that the app does not send prompts, call tools, connect accounts, approve output, or record outside-tool results.
- Source-use reminders include only hard-gate-allowed source IDs and omit blocked, no-access, undeclared, and sensitivity-disallowed sources from usable prompt refs.
- Human approval is represented either from a human review route step or from an added final approval step when hard gates require approval and the selected route lacks that step.
- Route-card integration is verified with generated prompt packages rather than placeholder prompt-package stubs.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- `npm run test -- promptPackageGenerator` passed with 1 test file and 7 tests.
- `npm run test` passed with 8 test files and 51 tests.
- `npm run build` passed.
- `git diff --check` passed.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test -- promptPackageGenerator`
- `npm run build`
- Test public-facing, current-facts, no-source, and highly restricted fallback cases.

UX/product finish expectations:

- Prompt step titles should be short and action-oriented.
- Instructions should be detailed enough to be useful, not vague one-liners.
- The package should be readable as Markdown later without rewriting.

Security and privacy notes:

- Never include instructions to bypass a tool's policy, scrape private data, or expose restricted sources.
- Do not add hidden prompt text or invisible system instructions.
- Do not store generated prompts in this chunk.

Rollback or recovery path:

Prompt package generation can be reverted independently. Route card generation should continue to work with a minimal placeholder if needed.

Stop condition:

Reached. Prompt packages validate and can be attached to route cards in tests. Persistence, exports, clipboard actions, provider calls, and UI were not added.

Handoff note:

Next chunk should add local persistence for user inventory, source permissions, policy settings, route cards, prompt packages, route logs, and feedback.

## Chunk Nine - Local Persistence

Status: complete
Status Updated: 2026-07-03T17:19:32-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Add browser-local persistence for editable configuration and route records using Dexie/IndexedDB.

User outcome:

The user can refresh the local app without losing their configured tools, source permissions, policies, route cards, prompt packages, route logs, or feedback records.

Allowed files or folders:

- `src/storage/*`
- `src/domain/schemas.ts` only for persisted record schema adjustments
- `src/domain/types.ts` only for aligned exported types
- `src/tests/unit/storage*.test.ts`
- `package.json`
- `package-lock.json`
- active pathway and status docs

Non-goals:

- Do not add cloud sync.
- Do not add auth, accounts, teams, or remote databases.
- Do not add import/export yet.
- Do not persist secrets or provider credentials.
- Do not build UI forms beyond any test-only harness.

Product boundary reminders:

- Persistence is local browser storage only.
- User-triggered exports come later.
- The app must not store API keys, OAuth tokens, passwords, or hidden telemetry identifiers.

Domain terms to use:

- local store
- IndexedDB
- model inventory
- source permission registry
- policy settings
- route card
- prompt package
- route log entry
- feedback outcome

Acceptance criteria:

- [x] Adds Dexie only if it remains the selected IndexedDB dependency after dependency/audit check.
- [x] Defines versioned local tables for inventories, sources, policy settings, route cards, prompt packages, route logs, and feedback-ready records.
- [x] Seeds defaults only when no local user configuration exists.
- [x] Validates loaded records against schemas before use.
- [x] Surfaces validation failures as recoverable local errors.
- [x] Provides clear reset/reseed functions for development and future UI.
- [x] Includes tests for seed, save, load, update, validation failure, and reset behavior.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm install` if adding Dexie
- `npm audit --audit-level=moderate`
- `npm run test -- storage`
- `npm run build`

Validation:

- `bash scripts/governance-preflight.sh`
- `npm install dexie && npm install --save-dev fake-indexeddb`
- `npm audit --audit-level=moderate`
- `npm run test -- storage`
- `npm run test`
- `npm run build`
- `git diff --check`

Implementation notes:

- Added `src/storage/localStore.ts` with a versioned Dexie database and domain-named tables for model inventory, source permissions, policy settings, route cards, prompt packages, and feedback-ready route log entries.
- Added default configuration seeding that runs only when no local configuration exists, plus explicit reset and reseed functions for development and future UI.
- Loaded and saved records are validated through existing Zod schemas; corrupt stored data surfaces as recoverable local validation errors without logging payloads.
- Route-card saves also persist the attached prompt package so future UI can read either artifact shape.
- Added `fake-indexeddb` only as a test dependency so IndexedDB behavior remains deterministic in Vitest.

UX/product finish expectations:

- Storage errors should be expressible in plain language for future UI.
- Reset behavior must be explicit, never automatic data loss.
- Keep storage APIs small and domain-named.

Security and privacy notes:

- No credentials.
- No external network calls.
- No local file indexing.
- Do not log persisted record payloads.
- Treat route logs as local private user data.

Rollback or recovery path:

Dexie and storage modules can be reverted before UI depends on them. If a schema version changes, document the migration path or mark local reset as acceptable for pre-MVP data.

Stop condition:

Reached. Local storage APIs pass targeted storage tests, the full unit suite, governance preflight, audit, build, and whitespace checks. Import/export and UI screens were not implemented.

Handoff note:

Next chunk should add explicit export/import utilities using the same schemas and local data shapes.

## Chunk Ten - Export And Import Functions

Status: complete
Status Updated: 2026-07-03T17:44:01-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Implement local export/import utilities for route cards, prompt packages, route logs, and configuration data.

User outcome:

The user can move or archive their local decision artifacts as Markdown, JSON, and CSV-friendly files without the app connecting to external services.

Allowed files or folders:

- `src/domain/export/*`
- `src/storage/*` only for integration types or local record loading helpers
- `src/tests/unit/exportImport.test.ts`
- shared fixtures under `src/tests/fixtures/*`
- active pathway and status docs

Non-goals:

- Do not build export/import UI yet.
- Do not add PDF export unless it is explicitly approved later.
- Do not upload exports anywhere.
- Do not add cloud backup.
- Do not bypass schema validation on import.

Product boundary reminders:

- Exports are user-triggered local artifacts only.
- Imports update local state only after validation and user confirmation in future UI.
- No external publish, send, merge, schedule, or deploy actions.

Domain terms to use:

- export artifact
- import bundle
- route card Markdown
- configuration JSON
- route log CSV
- schema validation
- recoverable import error

Acceptance criteria:

- [x] Serializes a route card and prompt package to readable Markdown.
- [x] Serializes configuration and route records to schema-versioned JSON.
- [x] Serializes route logs to CSV-friendly text with stable headers.
- [x] Validates imported JSON before returning usable data.
- [x] Rejects malformed, unknown-version, or schema-invalid imports with actionable errors.
- [x] Does not include secrets or hidden telemetry fields in any export format.
- [x] Tests cover round-trip JSON, Markdown content, CSV headers, and invalid imports.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm audit --audit-level=moderate`
- `npm run test -- exportImport`
- `npm run test`
- `npm run build`
- `git diff --check`

Implementation notes:

- Added `src/domain/export/exportImport.ts` as a pure local utility boundary with centralized `exportImportSchemaVersion = 1`.
- JSON export artifacts now include strict `configuration`, `route-records`, and `local-bundle` envelopes with product, artifact kind, schema version, and exported timestamp metadata.
- Import parsing validates JSON, artifact kind, schema version, schema shape, duplicate IDs, and route-record consistency before returning usable local data.
- Markdown serializers emit readable route card and prompt package documents without adding UI, clipboard, download, upload, or provider-send behavior.
- Route-log CSV uses stable headers exported as `routeLogCsvHeaders` and escapes comma/quote/newline text for CSV-friendly output.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test -- exportImport`
- `npm run build`

UX/product finish expectations:

- Markdown should read well when opened outside the app.
- Import errors should be suitable for display without exposing stack traces.
- CSV headers should be stable and documented in test names or fixtures.

Security and privacy notes:

- Warn future UI that exports may contain user-entered task data.
- Do not sanitize by silently removing fields without reporting what happened.
- Do not add upload/download side effects in unit logic.

Rollback or recovery path:

Export/import utilities can be reverted before UI calls them. Keep schema-version constants centralized so future migrations are controllable.

Stop condition:

Reached. Utility tests pass, full checks pass, and no UI or setup screens were added in this chunk.

Handoff note:

Next chunk should build setup UI screens for tool inventory, source permissions, and policy defaults using local storage and existing domain modules.

## Chunk Eleven - Setup UI Screens

Status: complete
Status Updated: 2026-07-03T19:34:35-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Replace setup placeholders with usable screens for model/tool inventory, source permissions, policy settings, and future stack-recommendation opt-in notes.

User outcome:

The user can tell the app which free agents and paid subscriptions they already use, configure source permissions, choose policy defaults, and understand that proposed best-stack recommendations are a future planning mode.

Allowed files or folders:

- `src/ui/screens/*`
- `src/ui/components/*`
- `src/ui/state/*` or `src/ui/hooks/*` only if needed
- `src/storage/*` only for UI integration
- `src/domain/defaults/*` only for copy or seed adjustments
- `src/tests/unit/*` UI tests if local pattern supports them
- active pathway and status docs

Non-goals:

- Do not implement best-stack recommendation logic yet.
- Do not connect to provider accounts.
- Do not store credentials.
- Do not implement task intake/results screens yet.
- Do not add authentication, telemetry, or remote sync.

Product boundary reminders:

- User inventory is descriptive only.
- The app records what the user says they have; it does not verify subscriptions.
- Any future proposed stack mode remains recommendation-only.

Domain terms to use:

- tool inventory
- free agent
- paid subscription
- source permission
- policy default
- least-resource
- balanced
- quality-first
- proposed best stack

Acceptance criteria:

- [x] Tool inventory screen lists default model/tool entries and lets users enable, disable, and edit key labels/capability assumptions.
- [x] Tool inventory includes clear fields for free agents and paid subscriptions the user already has.
- [x] Source permissions screen lets users set source permission levels and sensitivity allowances.
- [x] Policy settings screen lets users choose least-resource, balanced, or quality-first defaults.
- [x] Setup screens persist local changes through the storage API.
- [x] UI copy reinforces that no provider connection or credential storage exists.
- [x] Future best-stack prompt is represented only as a planning note or disabled/coming-later control, not functional logic.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm run test -- App storageLocalStore`
- `npm run test`
- `npm run build`
- `npm audit --audit-level=moderate`
- manual browser check at `http://127.0.0.1:5173` using system Chrome through Playwright for desktop and mobile setup navigation, persistence after refresh, and horizontal overflow
- `git diff --check`

Implementation notes:

- Added `setupPreferences` to the local Dexie store at schema version 2 for the active policy default, leaving `PolicyDefault` records schema-clean.
- Added `useSetupConfiguration` as the UI state boundary for seed/load/save/reset, dirty state, storage errors, and active policy display.
- Replaced only tool inventory, source permissions, and policy settings placeholders; task intake, route results, route cards, prompt packages, route log, reference, and welcome remain bounded for later chunks.
- Kept proposed best stack as a disabled coming-later control with no recommendation logic, account connection, credential field, provider API call, telemetry, remote sync, or execution workflow.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test`
- `npm run build`
- Manual local app check for setup navigation and persistence after refresh.

UX/product finish expectations:

- Operational app UI, not a marketing page.
- Dense enough for repeated configuration work, but readable on desktop and mobile.
- Use form controls appropriate to values: toggles, selects, segmented controls, numeric inputs, and clear save/reset actions.
- Text must not overflow or overlap in narrow viewports.

Security and privacy notes:

- Do not include credential fields.
- Do not ask the user to connect accounts.
- Make local-only storage clear without overloading the screen with legal copy.

Rollback or recovery path:

Setup UI can be reverted to placeholders if storage integration becomes unstable. Domain and storage modules should remain independently testable.

Stop condition:

Reached. Setup screens are usable, local changes persist, tests/build pass, and task intake/results placeholders remain untouched.

Handoff note:

Next chunk should replace task intake and results placeholders using the routing modules already built. The Guided AI Labs brand polish detour has also been completed, so resume Chunk Twelve with the branded shell in place.

## Brand Polish Detour - Guided AI Labs Identity

Status: complete
Status Updated: 2026-07-03T19:54:49-06:00

Completion target: Task complete

Budget class: Small

Objective:

Apply Guided AI Labs branding to the local app shell before continuing functional routing UI work.

User outcome:

When the owner or an early user downloads and runs the local app, it looks like a professional Guided AI Labs product with clear brand identity, clean palette, and usable setup screens.

Allowed files or folders:

- `public/brand/*`
- `src/App.tsx`
- `src/styles.css`
- `index.html`
- `src/tests/unit/App.test.tsx`
- active pathway, status, session, and decision docs

Non-goals:

- Do not change setup persistence, routing, scoring, prompt-package, or export/import behavior.
- Do not add a marketing landing page.
- Do not add provider account connections, credentials, auth, telemetry, remote sync, external asset fetching, or execution workflows.
- Do not add new dependencies just for branding.

Product boundary reminders:

- Brand assets are static local files packaged with the app.
- Branding must not weaken the local-first and recommendation-only boundary.
- The app still does not verify subscriptions, connect accounts, call external providers, send telemetry, or execute work.

Domain terms to use:

- Guided AI Labs
- AI Task Router
- local-first
- recommendation-only
- brand palette
- public brand asset

Acceptance criteria:

- [x] Guided AI Labs logo is visible in the app shell.
- [x] Brand assets are packaged locally under `public/brand`.
- [x] Browser metadata includes Guided AI Labs title/description and a local SVG favicon.
- [x] UI theme uses the official navy, AI teal, bright teal, and cloud-light palette from the brand assets.
- [x] Setup-heavy screens remain clean, operational, and responsive on desktop and mobile.
- [x] Existing product boundary copy remains visible.
- [x] No provider, credential, auth, telemetry, remote sync, execution, or external asset-fetching behavior is introduced.

Validation:

- `bash scripts/governance-preflight.sh`
- `npm run test -- App`
- `npm run build`
- manual Playwright/browser check with system Chrome at `http://127.0.0.1:5173` for logo load, branded title, desktop/mobile setup navigation, and horizontal overflow

Implementation notes:

- Copied only the selected vendor-provided SVG logo assets into `public/brand` instead of importing the full marketing folder.
- Updated app shell lockup to show Guided AI Labs identity alongside the AI Task Router product name.
- Reworked CSS variables and surfaces around the brand palette while keeping the UI dense and operational.
- Kept mobile navigation compact as a two-column grid so branded chrome does not bury the working screen.

Test expectations:

- `npm run test`
- `npm run build`
- `bash scripts/governance-preflight.sh`
- `git diff --check`

UX/product finish expectations:

- The branded shell should feel like a professional app, not a marketing page.
- Logo, nav, boundary chips, setup toolbar, repeated records, and form fields should not overlap or overflow on desktop or mobile.
- Brand color should support clarity and focus, not decoration.

Security and privacy notes:

- Static SVG assets do not introduce secrets, remote calls, telemetry, or external provider behavior.
- No user data shape or storage schema changes are included in this detour.

Rollback or recovery path:

Revert the brand asset files, `src/App.tsx`, `src/styles.css`, `index.html`, and the related App test changes. Functional setup/storage behavior remains separate.

Stop condition:

Stop when the branded app shell and setup screens validate on desktop and mobile, and the next handoff still points to Chunk Twelve.

Handoff note:

Resume Chunk Twelve with the branded shell in place. Do not rework the brand unless new owner feedback identifies a specific issue.

## Chunk Twelve - Task Intake And Results UI

Status: complete
Status Updated: 2026-07-03T21:03:52-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Build the structured task intake workflow and route results screen that runs local validation, hard gates, candidate generation, scoring, route card generation, and prompt package generation.

User outcome:

The user can enter a real task, request sources, choose sensitivity and output needs, then see lean, balanced, premium, recommended, warning, and blocked-route results.

Allowed files or folders:

- `src/ui/screens/*`
- `src/ui/components/*`
- `src/ui/state/*` or `src/ui/hooks/*` only if needed
- `src/domain/routing/*` only for integration fixes
- `src/domain/prompting/*` only for integration fixes
- `src/storage/*` only for reading configuration and saving generated records when explicitly triggered
- UI/unit tests under `src/tests/unit/*`
- active pathway and status docs

Non-goals:

- Do not implement detailed route-card and prompt-package viewing screens yet.
- Do not implement export/import buttons yet unless they already exist as disabled placeholders.
- Do not add external search, provider calls, connectors, or account linking.
- Do not add route-log feedback UI yet.

Product boundary reminders:

- Results are recommendations only.
- A "run" or "execute" action is out of scope and should not appear.
- Current-facts routes may instruct the user to research elsewhere; the app must not search.

Domain terms to use:

- task intake
- sensitivity class
- quality bar
- requested sources
- lean route
- balanced route
- premium route
- recommended route
- warnings
- blocked routes

Acceptance criteria:

- [x] Task intake form captures all required `taskIntakeSchema` fields.
- [x] Form uses default task templates where helpful without hiding advanced fields.
- [x] Validation errors are displayed near the relevant fields.
- [x] Results screen shows lean, balanced, premium, and recommended route states.
- [x] Results screen shows warnings and blocked routes clearly.
- [x] Routing runs entirely in the browser from local inputs and stored configuration.
- [x] User can save a generated route card/prompt package locally if storage is ready.
- [x] Empty, invalid, no-safe-route, and success states are handled.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test`
- `npm run build`
- Manual local app check for at least public writing, current-facts research, public-facing copy, and highly restricted fallback scenarios.

UX/product finish expectations:

- Use compact, scannable forms with sensible grouping.
- Avoid helper text that lectures; use concise labels and inline error states.
- Keep route comparison easy to scan.
- Ensure mobile layout preserves form labels and result cards without overlap.

Security and privacy notes:

- Do not log task descriptions to console.
- Do not send task data over the network.
- Do not expose blocked source details beyond user-provided local configuration.

Implementation notes:

- Added `useTaskRouting` as the browser-local orchestration hook for task draft state, schema validation, routing pipeline execution, generated route state, and explicit save state.
- Added task intake and route results screens while leaving route-card and prompt-package detail screens as placeholders for Chunk Thirteen.
- The route results screen compares lean, balanced, and premium states, marks the recommended route, shows warnings and blocked routes, handles invalid/empty/no-safe-route/success states, and saves the generated route card plus prompt package only when the user presses the save button.
- Exported the existing manual review fallback route-option builder from the route-card generator so UI no-safe-route prompt-package generation uses the same fallback shape as route cards.
- Manual browser validation used a fresh Vite dev server at `http://127.0.0.1:5174` because the long-running server at `5173` served stale CSS while updated JS was hot-loaded. Source/build validation remained clean.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before Chunk Twelve work.
- `npm run test -- App` passed with 1 test file and 6 tests.
- `npm run test` passed with 10 test files and 71 tests.
- `npm run build` passed.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5174` passed for public writing, current-facts research, public-facing copy, highly restricted fallback, local save, desktop/mobile screenshots, and horizontal overflow checks.

Rollback or recovery path:

The UI can fall back to placeholder screens while domain modules remain intact. Keep UI orchestration separate enough to debug routing without React.

Stop condition:

Stop when intake and results are usable and verified. Do not implement full route card/prompt package screens in this chunk.

Handoff note:

Next chunk should build the route card and prompt package viewing/copy/export-prep UI.

## Chunk Thirteen - Route Card And Prompt Package UI

Status: complete
Status Updated: 2026-07-03T22:08:42-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Build focused screens for viewing generated route cards and prompt packages, with local copy/download preparation where safe.

User outcome:

The user can inspect the final route decision artifact and the detailed prompt package before manually using it in their chosen tools.

Allowed files or folders:

- `src/ui/screens/*`
- `src/ui/components/*`
- `src/domain/export/*` only for display/export integration fixes
- `src/storage/*` only for loading saved route cards and prompt packages
- UI/unit tests under `src/tests/unit/*`
- active pathway and status docs

Non-goals:

- Do not send prompts to external tools.
- Do not add one-click provider launch, OAuth, or connector behavior.
- Do not implement feedback analytics.
- Do not add PDF export unless separately approved.

Product boundary reminders:

- The user manually decides what to do with route cards and prompt steps.
- Copy/download actions must be local browser actions only.
- The app must not represent prompt packages as executed.

Domain terms to use:

- route card
- prompt package
- prompt step
- expected output
- warning
- blocked route
- human approval
- local export

Acceptance criteria:

- [x] Route card screen shows recommended route, alternatives, scores/tradeoffs, warnings, blocked routes, and created timestamp.
- [x] Prompt package screen shows ordered prompt steps, input refs, expected output, and approval requirements.
- [x] User can copy prompt step text or prepared Markdown locally if browser support is straightforward.
- [x] Local download/export preparation uses Chunk Ten utilities if available.
- [x] Screens handle missing/deleted route card IDs gracefully.
- [x] Human approval requirements remain visible near the relevant prompt steps.

Implementation notes:

- Added `useRouteArtifacts` to load saved route cards and prompt packages from IndexedDB, keep selected route-card state, preserve a deleted selected ID safely, and handle explicit browser clipboard copy state.
- Added route-card and prompt-package detail screens that reuse Chunk Ten Markdown serializers for local export preparation.
- Route card UI shows created timestamp, sensitivity, recommended route, score, route count, approval steps, warnings, blocked routes, and detailed option tradeoffs.
- Prompt package UI shows ordered prompt steps, input refs, expected outputs, and human-approval badges near the relevant steps.
- Download actions are local `data:text/markdown` links and copy actions use explicit user-triggered clipboard calls only.
- No provider launch, OAuth, connector behavior, telemetry, feedback analytics, PDF export, route log feedback UI, or external execution workflow was added.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before implementation.
- `npm run test -- App` passed with 1 file and 9 tests.
- `npm run test` passed with 10 files and 74 tests.
- `npm run build` passed.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5175` passed for generating/saving a public-facing route, viewing route card and prompt package screens, local Markdown download-link preparation, desktop and mobile horizontal overflow, and screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-chunk13-route-card-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-chunk13-prompt-package-mobile.png`

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test`
- `npm run build`
- Manual local app check for viewing a saved route card and prompt package on desktop and mobile widths.

UX/product finish expectations:

- Keep route cards scannable and prompt packages sequential.
- Use icons for local copy/download actions where available in the existing stack.
- Avoid nested cards; use sections and compact repeated items.
- Text must wrap cleanly for long task titles and warning messages.

Security and privacy notes:

- Clipboard/download actions should be explicit user actions.
- Do not add hidden telemetry around copying or downloading.
- Clearly preserve local-only behavior.

Rollback or recovery path:

Viewing screens can be reverted to results-only display. Export utilities and stored route records should remain unchanged.

Stop condition:

Reached. Route card and prompt package screens are usable and verified. Route log feedback UI was not added in this chunk.

Handoff note:

Next chunk should build route log and feedback workflows for saved recommendations.

## Usability Detour - Conversational Path And Plain-Language UX

Status: complete
Status Updated: 2026-07-03T23:55:54-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Turn the technically accurate MVP interface into a more natural guided path for everyday users before adding more route-log surface area.

User outcome:

The user can walk through the app like clear aisles: choose available AI tools, choose information comfort, choose decision style, describe the task, review best options, and inspect saved decision cards and copy-ready prompts.

Allowed files or folders:

- `src/App.tsx`
- `src/ui/screens/*`
- `src/ui/state/*`
- `src/domain/defaults/defaultModels.ts`
- `src/styles.css`
- `src/tests/unit/App.test.tsx`
- active pathway and status docs

Non-goals:

- Do not change the routing engine, hard gates, scoring rules, persistence schema, export formats, or prompt-package generation.
- Do not add provider account connections, credential storage, telemetry, external calls, prompt execution, route-log feedback UI, best-stack recommendation logic, or import/export UI.

Product boundary reminders:

- The app remains local-first and recommendation-only.
- Plain-language labels are a presentation layer over the same safety model.
- Advanced routing details can remain available, but they should not be the default user path.

Domain terms to use in the user-facing path:

- start here
- AI tools
- information comfort
- choosing style
- my task
- best options
- decision card
- copy-ready prompts
- saved plans

Acceptance criteria:

- [x] Navigation labels and first-screen path use plain-language aisle-style wording.
- [x] Tool inventory reads as quick shelf choices with dropdowns and editable names, with technical details moved behind advanced drawers.
- [x] Source permissions are replaced in the UI by information comfort choices that map back to existing permission/sensitivity controls.
- [x] Policy settings are replaced in the UI by choosing-style options focused on cost/time, balance, and quality.
- [x] Task intake and route results copy speaks to everyday actions and decisions.
- [x] Saved route-card and prompt-package screens use decision-card, saved-plan, and copy-ready prompt language where appropriate.
- [x] Default model labels are everyday shelf names while IDs and routing assumptions remain unchanged.

Implementation notes:

- Added `StartHereScreen` with a four-step guided path: tools, information comfort, choosing style, and task description.
- Renamed screen labels in `screenDefinitions` while preserving stable screen IDs and route orchestration.
- Reworked `SetupScreens` so the primary setup path uses dropdowns and cards; capability scores, permission levels, sensitivity allowances, and policy weights are still available through advanced drawers.
- Added source comfort translation helpers that map `none`, `public`, `work`, `confidential`, and `restricted` choices back to existing source permission and sensitivity shapes.
- Updated task-routing and route-artifact UI copy/state messages to use best options, saved plans, decision cards, and copy-ready prompts.
- Updated default model seed labels to everyday tool shelves without changing IDs, tiers, capability scores, permissions, or external-call flags.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before implementation.
- `npm run test -- App` passed with 1 file and 9 tests.
- `npm run test` passed with 10 files and 74 tests.
- `npm run build` passed.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5176` passed for Start Here, My AI Tools, Information Comfort, Choosing Style, My Task, Best Options, Decision Card, Copy-Ready Prompts, desktop/mobile layout, and no horizontal overflow.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-usability-start-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-usability-tools-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-usability-prompts-mobile.png`

UX/product finish expectations:

- Keep the supermarket/aisle mental model: clear choices first, advanced controls later.
- Avoid exposing source permissions, policy defaults, model tiers, or scoring weights as the primary product language.
- Existing users with older browser-local seed labels may need to use `Restore starter choices` to see the new default shelf names.

Security and privacy notes:

- No safety boundary changed. The app still does not connect accounts, call providers, inspect files, execute prompts, store credentials, or send telemetry.
- Local saved choices and saved plans remain browser-owned IndexedDB records.

Rollback or recovery path:

Revert this detour's UI/default-label changes to restore the prior clinical setup screens. Stored records remain compatible because schema IDs and persisted shapes were unchanged.

Stop condition:

Reached. The conversational usability path is implemented, tested, and manually verified. Route-log feedback UI was not added in this detour.

Handoff note:

Next chunk should build route-log and feedback workflows using the new language direction. Keep route-log UI plain-language and avoid reintroducing source-permission or policy-default terminology in primary user flows.

## Chunk Fourteen - Route Log And Feedback UI

Status: complete
Status Updated: 2026-07-04T00:24:26-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Build the local route log and feedback UI for saved route decisions.

User outcome:

The user can review past route recommendations, record whether a route was accepted, edited, rejected, or deferred, and keep lightweight local feedback.

Allowed files or folders:

- `src/ui/screens/*`
- `src/ui/components/*`
- `src/storage/*` only for route-log and feedback integration
- `src/domain/schemas.ts` only if feedback shape needs a narrow extension
- UI/unit tests under `src/tests/unit/*`
- active pathway and status docs

Non-goals:

- Do not add analytics dashboards.
- Do not send feedback anywhere.
- Do not train or tune models.
- Do not add multi-user audit trails.
- Do not add hosted telemetry or error reporting.

Product boundary reminders:

- Feedback is local and user-owned.
- Route logs are decision records, not execution logs.
- The app does not learn automatically from feedback in v0.2 unless a later chunk explicitly adds local-only preference adjustment.

Domain terms to use:

- route log
- feedback outcome
- accepted
- edited
- rejected
- deferred
- rating
- notes
- local record

Acceptance criteria:

- [x] Route log screen lists saved route decisions with task title, selected strategy, outcome, and timestamp.
- [x] User can filter or sort enough to find recent decisions.
- [x] User can add or edit feedback outcome and optional rating/notes.
- [x] Feedback validates against `routeLogEntrySchema` through a backward-compatible optional rating/notes extension.
- [x] User can open a saved route card from the log.
- [x] Empty log and local storage error states are handled.
- [x] No feedback leaves the browser.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test`
- `npm run build`
- Manual local app check for creating, editing, filtering, and reopening route log entries.

Implementation notes:

- Added `RouteLogScreen` as the `Past Choices` workflow with local loading, empty/error states, search, outcome filter, recent/title sorting, a selected-record list, and quick feedback editing.
- Saving generated route results now also creates a route-log entry with an initial `deferred` outcome so feedback has a local record to attach to.
- Extended route-log feedback validation so users can save an outcome with no note, a note without a rating, a rating without a note, or both.
- Opening a saved decision from Past Choices selects the existing decision-card record and reuses the Chunk Thirteen saved artifact screen.
- Real-browser validation caught and fixed the case where changing a filtered `deferred` record to `edited` made the saved acknowledgement disappear.

Validation:

- `npm run test -- App` passed with 1 file and 11 tests.
- `npm run test` passed with 10 files and 76 tests.
- `npm run build` passed.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5177` passed for creating a saved plan, viewing Past Choices, filtering no-match and deferred views, saving edited feedback with rating and note, opening the saved decision card, mobile layout, screenshots, and no horizontal overflow.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-chunk14-past-choices-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-chunk14-feedback-saved-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-chunk14-past-choices-mobile.png`

UX/product finish expectations:

- The log should feel like a working table/list, not a marketing feed.
- Feedback controls should be quick and low-friction.
- Long notes and titles must not break layout.

Security and privacy notes:

- Do not log feedback text.
- Do not store hidden identifiers.
- Keep reset/delete operations explicit and recoverable where practical.

Rollback or recovery path:

Route log UI can be reverted while leaving stored records intact. If schema changes are made, keep them backward compatible or document local reset limitations.

Stop condition:

Reached. Route log and feedback flows are usable and verified. E2E coverage expansion remains Chunk Fifteen.

Handoff note:

Next chunk should add end-to-end tests and fixture coverage for the MVP acceptance scenarios without changing the local-only recommendation boundary.

## Usability Surgery Detour - Plain-Language Intake Reset

Status: complete
Status Updated: 2026-07-04T00:53:25-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Rework the setup and task intake surfaces so non-technical users can tell the app what tools they use, what information to include, and what they are trying to do without internal routing language.

User outcome:

The user sees ordinary choices: My AI Tools, What To Include, Choosing Style, My Task, Best Options, Decision Card, Copy-Ready Prompts, and Past Choices.

Allowed files or folders:

- `src/ui/screens/*`
- `src/ui/state/*`
- `src/storage/localStore.ts`
- `src/domain/defaults/*`
- `src/styles.css`
- UI and domain tests under `src/tests/unit/*`
- active pathway and status docs

Non-goals:

- Do not add provider account connections.
- Do not add credential storage.
- Do not add authentication, telemetry, remote sync, provider API calls, external destinations, automatic uploads, feedback analytics, best-stack recommendation logic, or execution workflows.
- Do not change the local-first routing boundary.
- Do not start Chunk Fifteen E2E implementation in this detour.

Product boundary reminders:

- The app recommends; it does not act.
- All setup choices remain browser-local.
- Tool and source labels are user-owned descriptions, not live provider integrations.
- Advanced routing terms can exist in domain code, but they must be translated before appearing in the primary user flow.

Domain terms to use:

- My AI Tools
- What To Include
- Choosing Style
- My Task
- Best Options
- Decision Card
- Copy-Ready Prompts
- Past Choices
- Style
- Fit

Acceptance criteria:

- [x] My AI Tools asks what models/tools the user uses, which everyday app/model/setting they choose, which one they use most, and whether each one should be included.
- [x] Information Comfort is renamed to What To Include and presents direct include/not-include selections.
- [x] What To Include uses plain privacy choices such as public/shareable, ordinary work info, confidential info, and sensitive info.
- [x] My Task no longer exposes reference IDs, internal route IDs, DMAIC/start-with fields, task-local-route fields, or clinical planning controls in the primary flow.
- [x] A description-only task can generate a valid local route with a derived title and internal ID.
- [x] Best Options no longer exposes Policy, raw score badges, permission-level text, or scoring-weight language in the primary UI.
- [x] Existing route engine, schemas, storage, and recommendation-only boundary remain intact.

Implementation notes:

- Added a browser-local preferred-tool preference so the app can ask which tool the user uses most without forcing technical model ranking language.
- Replaced model and source starter labels with everyday phrases while preserving stable domain IDs.
- Rebuilt the source setup screen as a plain include list with privacy dropdowns.
- Rebuilt task intake around one main natural-language description, optional short name, quick shortcuts, and a rough-structure preview.
- Translated primary result language from policy/score/gate terminology to Style, Fit, Best fit, safety checks, and allowed-by-your-choices copy.
- Updated tests to protect the new plain-language flow.

Validation:

- `npm run test -- App` passed with 1 file and 11 tests.
- `npm run test` passed with 10 files and 76 tests.
- `npm run build` passed.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings before the detour.
- Final close-out validation passed: `npm run test`, `npm run build`, `npm audit --audit-level=moderate`, `bash scripts/governance-preflight.sh`, and `git diff --check`.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5178` passed for My AI Tools, What To Include, My Task, Best Options, desktop/mobile layout, no horizontal overflow, and no primary-result leakage of Policy, permission-level, or raw score wording.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-ux-surgery-tools-v2-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-ux-surgery-include-v2-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-ux-surgery-results-v2-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-ux-surgery-task-v2-mobile.png`

UX/product finish expectations:

- The app should feel like a guided conversation with clear aisles, not an operations console.
- Source and privacy setup should ask what to include, not ask users to reason about permissions.
- Task intake should let users describe what they need and then show a rough structure.
- Results should explain the fit and practical next action before technical detail.

Security and privacy notes:

- The detour does not add external fetches, provider SDKs, account identifiers, secrets, telemetry, or remote persistence.
- Users still decide what information categories are included.
- Generated prompt packages remain manual-use instructions.

Rollback or recovery path:

The UI wording and local preference changes can be reverted independently from the pure routing engine. If the new task ID/title derivation causes issues, revert `useTaskRouting` to require explicit IDs and restore the corresponding tests.

Stop condition:

Reached. The primary setup and task intake flows are now plain-language, tested, and manually verified. Chunk Fifteen remains active next for fixture and E2E coverage.

Handoff note:

Next chunk should add end-to-end tests and fixture coverage for the corrected plain-language MVP workflow. Keep the user-facing route as Start Here, My AI Tools, What To Include, Choosing Style, My Task, Best Options, Decision Card, Copy-Ready Prompts, and Past Choices.

## My AI Tools Dropdown Cleanup Detour

Status: complete
Status Updated: 2026-07-04T08:38:31-06:00

Completion target: Integration complete

Budget class: Small

Objective:

Replace the remaining My AI Tools clinical setup controls with dropdowns that match what everyday users see inside AI apps.

User outcome:

The user can choose an AI app, a visible model option, and a thinking/effort setting without seeing internal model IDs, model tiers, capability scores, routing categories, or subscription-level buckets.

Allowed files or folders:

- `src/domain/defaults/*`
- `src/ui/screens/SetupScreens.tsx`
- `src/ui/screens/screenDefinitions.ts`
- `src/styles.css`
- `src/tests/unit/App.test.tsx`
- active pathway and status docs

Non-goals:

- Do not add provider account connections.
- Do not verify subscriptions.
- Do not call provider APIs.
- Do not add credentials, telemetry, remote sync, automatic uploads, or execution workflows.
- Do not start Chunk Fifteen E2E implementation in this detour.

Product boundary reminders:

- Provider and model choices are editable local descriptions and routing assumptions only.
- The app still recommends a path; the user still manually uses the chosen tool outside the app.
- Internal route tiers can remain in domain data, but the primary UI must translate them into provider/model/thinking choices.

Domain terms to use:

- AI app
- Model shown in that app
- Thinking setting
- I use this
- I use this most
- Show extra settings

Acceptance criteria:

- [x] My AI Tools uses dropdowns for AI app, visible model, and thinking setting.
- [x] My AI Tools no longer shows subscription level, routing category, capability assumptions, maximum information comfort, model tier, or technical routing details controls.
- [x] Starter model labels are recognizable app choices such as ChatGPT, Claude, Gemini, Perplexity, and Microsoft Copilot while preserving stable internal IDs.
- [x] ChatGPT choices include model and thinking-setting options rather than a generic subscription tier.
- [x] Changing a model/thinking dropdown persists locally and restores through the normal save/refresh path.
- [x] Existing route candidate and scoring behavior remains stable under the default setup.
- [x] The no-credentials, no-provider-call, local-first boundary remains intact.

Implementation notes:

- Added `src/domain/defaults/everydayToolCatalog.ts` to map provider/model/thinking dropdown choices into the existing internal tier, capability, local-only, and permission assumptions.
- Rebuilt `defaultModels` from the everyday catalog so default rows show app-like labels while keeping existing record IDs.
- Removed the My AI Tools text label field, subscription dropdown, model routing drawer, capability grid, and local-only checkbox from the primary setup screen.
- Renamed remaining advanced drawer summaries to `Show extra settings` and translated the source privacy guardrail labels.
- Kept `ChatGPT: GPT-5.5 - Medium` mapped to the everyday mid-strength path so the default route engine behavior did not drift.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the detour.
- `npm run test -- App` passed with 1 file and 11 tests.
- `npm run test` passed with 10 files and 76 tests.
- `npm run build` passed.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5179` passed for My AI Tools dropdown behavior, What To Include extra-settings label, desktop/mobile layout, no horizontal overflow, and no old My AI Tools leakage of Subscription level, Technical routing details, Routing category, Capability assumptions, or user-configured starter labels.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-everyday-tools-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-everyday-tools-mobile.png`

UX/product finish expectations:

- The screen should feel like matching what the user sees in ChatGPT, Claude, Gemini, Copilot, Perplexity, a private/local model, or another AI app.
- If a provider's wording changes, the user should still be able to pick the closest everyday match.
- The screen should not require users to understand routing, permissions, tiers, capability scores, or subscriptions.

Security and privacy notes:

- No external requests, provider SDKs, account IDs, credentials, telemetry, or remote persistence were added.
- The catalog stores assumptions only; it does not validate live provider availability.

Rollback or recovery path:

Revert the catalog, default model seed changes, setup row changes, CSS grid adjustment, and App test update. Existing local IndexedDB records remain schema-compatible because the same model inventory shape and stable IDs are preserved.

Stop condition:

Reached. My AI Tools now uses everyday dropdowns, preserves local setup behavior, and passes unit, build, and browser validation. Chunk Fifteen remains active next.

Handoff note:

Chunk Fifteen should add E2E coverage for the dropdown version of My AI Tools. Do not reintroduce subscription-level, model-tier, capability-score, routing-category, permission-level, or technical-routing-details language in the primary My AI Tools path.

## My AI Tools Progressive App Setup Detour

Status: complete
Status Updated: 2026-07-04T09:00:27-06:00

Completion target: Integration complete

Budget class: Small

Objective:

Replace the remaining multi-row My AI Tools setup with a progressive, sparse app picker that lets users add only the tools they actually recognize.

User outcome:

The user sees one empty AI app row, chooses an app, chooses their account level and how often they use it, then gets one new blank row for the next familiar app.

Allowed files or folders:

- `src/domain/defaults/*`
- `src/ui/screens/SetupScreens.tsx`
- `src/ui/screens/screenDefinitions.ts`
- `src/styles.css`
- `src/tests/fixtures/*`
- `src/tests/unit/*`
- active pathway and status docs

Non-goals:

- Do not add provider account connections.
- Do not verify paid plans.
- Do not call provider APIs.
- Do not add credentials, telemetry, remote sync, automatic uploads, or execution workflows.
- Do not start Chunk Fifteen E2E implementation in this detour.

Product boundary reminders:

- App, account-level, and frequency choices are local descriptions and routing assumptions only.
- A broad provider list is an editable local catalog, not a live marketplace or recommendation engine.
- Tests that need a full routeable stack should use explicit fixtures instead of pretending first-run defaults contain tools.

Domain terms to use:

- AI app
- Account level
- How often
- Add an AI app
- Free or basic
- Paid everyday
- Pro or strongest
- Work, team, or enterprise

Acceptance criteria:

- [x] My AI Tools initially shows one empty `Add an AI app` row instead of a prefilled grid.
- [x] Selecting an app automatically enables that slot and reveals one new empty slot below it.
- [x] The primary row uses AI app, account level, and frequency dropdowns only.
- [x] The provider list includes mainstream and broader AI apps, including DeepSeek, Qwen, Kimi, Doubao, MiniMax, and Tencent Hunyuan, plus `Something else`.
- [x] Starter setup records remain schema-compatible and stable-ID-compatible while no longer presenting five preselected tools.
- [x] Route-domain tests use explicit route-ready model fixtures instead of relying on first-run setup defaults.
- [x] The no-credentials, no-provider-call, local-first boundary remains intact.

Implementation notes:

- Reworked `everydayToolCatalog` around app, account-level, and frequency selections instead of app/model/thinking selections.
- Changed first-run `defaultModels` to preserve the manual review record and create empty tool slots, including three extra slots for longer user inventories.
- Updated My AI Tools to render populated rows plus the first empty row only.
- Removed the include checkbox and usual-helper radio from the primary path; selecting `Choose an AI app` removes a tool from recommendations.
- Added `src/tests/fixtures/routeReadyModels.ts` so routing tests have explicit model assumptions separate from first-run setup.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the detour.
- `npm run test -- App` passed with 1 file and 11 tests.
- `npm run test` passed with 10 files and 76 tests.
- `npm run build` passed.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5180` passed for progressive My AI Tools behavior, broad provider options, desktop/mobile layout, no horizontal overflow, persistence, and no old model/thinking/subscription/details wording in the primary My AI Tools path.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-progressive-tools-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-progressive-tools-mobile.png`

UX/product finish expectations:

- The screen should feel like adding items to a simple list, not completing an inventory audit.
- Users should not feel pressure to fill rows for tools they do not know.
- Account-level language should stay practical and should not become subscription taxonomy.

Security and privacy notes:

- No external requests, provider SDKs, account IDs, credentials, telemetry, or remote persistence were added.
- The catalog stores assumptions only; it does not validate live provider availability or paid-plan status.

Rollback or recovery path:

Revert the catalog rewrite, default model seed changes, progressive row rendering, route-ready test fixture, CSS grid adjustment, and related tests. Existing IndexedDB records remain schema-compatible because the model inventory record shape is unchanged.

Stop condition:

Reached. My AI Tools now adds AI apps progressively, saves locally, validates in tests/build/browser checks, and keeps Chunk Fifteen active next.

Handoff note:

Superseded by the later manual-add detour. Chunk Fifteen should use the current My AI Tools behavior from the latest handoff, not this earlier automatic-next-row workflow.

## My AI Tools Sparse Selector Correction

Status: complete
Status Updated: 2026-07-04T09:18:42-06:00

Completion target: Integration complete

Budget class: Small

Objective:

Correct the owner-reported mismatch where existing browser data still showed five named provider cards instead of one neutral selector.

User outcome:

My AI Tools now reads like a simple add-one-at-a-time list: one `Tool selection` card appears first, the AI app lives inside the dropdown, and older saved starter rows are cleared into the corrected empty starter state.

Allowed files or folders:

- `src/domain/defaults/everydayToolCatalog.ts`
- `src/storage/localStore.ts`
- `src/ui/screens/SetupScreens.tsx`
- `src/ui/state/useSetupConfiguration.ts`
- `src/tests/fixtures/*`
- `src/tests/unit/*`
- active pathway and status docs

Non-goals:

- Do not add custom provider text fields in this correction.
- Do not add provider account connections, credentials, telemetry, external calls, or execution workflows.
- Do not start Chunk Fifteen E2E implementation in this correction.

Acceptance criteria:

- [x] Primary row headings say `Tool selection`, not `ChatGPT`, `Gemini`, `Claude`, `Perplexity`, or `Microsoft Copilot`.
- [x] A stale local database containing the old five prefilled starter rows migrates to `0 selected` and one blank selector.
- [x] Selecting an app, account level, and frequency still reveals the next blank selector.
- [x] The AI app dropdown includes `Genspark` as a normal app choice and still includes broader fallback options.
- [x] Explicit route-ready fixtures keep their account and frequency assumptions after the catalog inference change.
- [x] No provider calls, credentials, telemetry, remote sync, or execution behavior are added.

Implementation notes:

- Added legacy prefilled-row detection for the exact prior starter labels and providers.
- Added local store migration so stale IndexedDB model inventories are reset to the corrected empty default slots.
- Removed stable-ID provider fallback from everyday tool inference so empty slots cannot become provider-branded cards by ID alone.
- Changed My AI Tools row headings to the generic `Tool selection`.
- Added a `legacyPrefilledToolModels` fixture and regression coverage in App and storage tests.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the correction.
- `npm run test -- App` passed with 1 file and 12 tests.
- `npm run test -- storageLocalStore` passed with 1 file and 9 tests.
- `npm run test` passed with 10 files and 78 tests.
- `npm run build` passed.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5180` deliberately planted the old five-row starter inventory in IndexedDB, reloaded, confirmed `0 selected`, one `Tool selection` row, no provider-named regions, Genspark selection, automatic next row, and no mobile horizontal overflow.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings at close-out.
- `git diff --check` passed; output only included normal Windows LF-to-CRLF notices.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-tool-selection-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-tool-selection-mobile.png`

UX/product finish expectations:

- The screen should not imply that the big-name tools are defaults or required.
- Provider names should appear as dropdown options only until the user chooses one.
- Existing users from the previous detour should get the corrected starter experience after refresh without needing to know about local storage.

Security and privacy notes:

- The migration touches only browser-local IndexedDB records.
- The app remains recommendation-only and does not connect to, verify, or call AI providers.

Rollback or recovery path:

Revert the catalog inference changes, local store migration, row heading change, and regression tests. Existing records remain schema-compatible because the model inventory shape is unchanged.

Stop condition:

Reached. The reported screen mismatch is corrected, validated in tests/build/browser, and Chunk Fifteen remains active next.

Handoff note:

Superseded by the later manual-add detour. Chunk Fifteen should still cover stale five-row local-store migration, but the normal add/save path now uses the explicit `Add another tool` button.

## My AI Tools Manual Add And Local Models Detour

Status: complete
Status Updated: 2026-07-04T09:40:46-06:00

Completion target: Integration complete

Budget class: Small

Objective:

Correct the remaining owner-reported My AI Tools mismatch: selecting one tool should not automatically create another selector, account-level choices should match the selected app more closely, and Local should expose recognizable local model tools.

User outcome:

The user sees one `Tool selection` card, picks the AI app and matching account/setup level, and uses a branded `Add another tool` button only when they choose to add another row. Choosing Local now shows local model options such as Ollama and LM Studio instead of a generic account level.

Allowed files or folders:

- `src/domain/defaults/everydayToolCatalog.ts`
- `src/ui/screens/SetupScreens.tsx`
- `src/styles.css`
- `src/tests/fixtures/*`
- `src/tests/unit/*`
- `scripts/*`
- `package.json`
- README/manual/status/pathway docs

Non-goals:

- Do not connect provider accounts, verify paid plans, call AI providers, scan files from the browser, or run local models from the app.
- Do not auto-import local detector results into IndexedDB in this detour.
- Do not start Chunk Fifteen E2E implementation in this detour.

Acceptance criteria:

- [x] My AI Tools still starts with one generic `Tool selection` row.
- [x] Selecting an app no longer automatically reveals a second blank selector.
- [x] A branded `Add another tool` button reveals the next blank selector when the user chooses it.
- [x] ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, Canva, GitHub Copilot, and Cursor use provider-specific account or plan labels.
- [x] Choosing Local changes the second dropdown to `Local model` with local model tools such as Ollama, LM Studio, Jan, llama.cpp, GPT4All, Open WebUI, and other local model.
- [x] A local detector script can summarize common local model tooling without changing app state or making network calls.
- [x] No provider calls, credentials, telemetry, remote sync, automatic uploads, file indexing, or execution behavior are added.

Implementation notes:

- Replaced automatic empty-row display after selection with explicit UI state controlled by `Add another tool`.
- Expanded the everyday tool catalog with provider-specific plan labels based on official provider plan pages checked on 2026-07-04.
- Preserved the existing model inventory schema and route-ready fixture behavior; richer UI labels still map to local deterministic routing fields.
- Added `npm run detect:local-models`, which checks Ollama plus common local model folders and prints a summary by default.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the detour.
- `npm run test -- App everydayToolCatalog` passed with 2 files and 14 tests.
- `npm run detect:local-models` passed and produced a summary without printing model names.
- `npm run test` passed with 11 files and 80 tests.
- `npm run build` passed.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5181` passed for one-row initial state, no automatic second row after ChatGPT selection, provider-specific `Go`/`Plus` account options, branded `Add another tool`, Local model choices, desktop/mobile layout, and no horizontal overflow.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-manual-add-tools-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-manual-add-tools-mobile.png`

UX/product finish expectations:

- The screen should feel like the user controls the list, not like the app is assigning homework.
- Local setup should be recognizable to people who use Ollama, LM Studio, Jan, llama.cpp, GPT4All, Open WebUI, or another private model path.
- Provider-specific plan names need periodic review because AI product packaging changes.

Security and privacy notes:

- The browser app remains recommendation-only and does not scan the machine.
- The local detector is an explicit terminal command, performs no network calls, and does not mutate app settings.
- `--details` and `--json` can print local model names, so normal validation used the default summary output only.

Rollback or recovery path:

Revert the catalog additions, manual add button state, local detector script/package command, docs, and related tests. Existing IndexedDB records remain schema-compatible because the model inventory record shape is unchanged.

Stop condition:

Reached. The reported UX behavior is corrected, local model choices exist, the detector boundary is documented, and focused/full/browser validation passed.

Handoff note:

Chunk Fifteen should add E2E coverage for the manual-add My AI Tools flow: one blank starter row, selecting an app does not add a second row, `Add another tool` reveals the next selector, provider-specific account labels are available, Local shows local model choices, stale five-row migration still lands on one blank row, and the detector remains a separate local command rather than browser execution.

## My AI Tools Tailored Account Levels Detour

Status: complete
Status Updated: 2026-07-04T10:00:43-06:00

Completion target: Integration complete

Budget class: Small

Objective:

Finish the owner-requested My AI Tools cleanup by making account-level dropdowns genuinely tailored to the selected AI app, adding a remove-tool control, and fixing wrapping around the selected state.

User outcome:

The user chooses an AI app and sees account choices that look like that provider's real plan or access language, rather than generic `paid or premium` buckets. If they add the wrong tool, they can remove it. The selected state and long account choices remain tidy on desktop and mobile.

Allowed files or folders:

- `src/domain/defaults/everydayToolCatalog.ts`
- `src/ui/screens/SetupScreens.tsx`
- `src/styles.css`
- `src/tests/unit/*`
- status/pathway/decision docs

Non-goals:

- Do not connect provider accounts or verify whether a user really has a paid plan.
- Do not add provider API calls, billing checks, OAuth, credentials, telemetry, remote sync, uploads, file indexing, or execution workflows.
- Do not start Chunk Fifteen E2E implementation in this detour.

Acceptance criteria:

- [x] ChatGPT separates Free, Go, Plus, Pro, Business, and Enterprise.
- [x] Claude separates Free, Pro, Max 5x, Max 20x, Team, and Enterprise.
- [x] Gemini includes Google AI Plus, Google AI Pro, Google AI Ultra, and Workspace variants.
- [x] Microsoft Copilot distinguishes free/personal/work Microsoft 365 paths.
- [x] Perplexity includes Free, Pro, Max, Enterprise Pro, and Enterprise Max.
- [x] Broader tools such as Genspark, Grok, Meta AI, Poe, You.com, NotebookLM, Replit, DeepSeek, Qwen, Kimi, Doubao, MiniMax, Zhipu, Tencent Hunyuan, and Mistral now have provider-specific choices instead of the generic consumer buckets.
- [x] Selected and added tool rows expose a `Remove tool` button.
- [x] The `Selected` chip and long dropdown values do not wrap awkwardly or create horizontal overflow.
- [x] Existing model inventory records remain schema-compatible.

Implementation notes:

- `EverydayToolAccountId` is now a flexible string key because account plans change frequently and many providers use provider-specific labels.
- Added `legacyLabels` on account options so older saved labels such as `Business or Enterprise` still infer to the intended provider option after the split.
- Kept provider display names stable where possible to avoid stranding previously saved rows.
- Added researched account options for both major Western providers and the broader app list requested for users who recognize less common or Chinese AI tools.
- Added row-level removal in `InventoryGroup`; selected tools reset to an empty slot and accidental empty rows are hidden.
- Added CSS to keep selected pills and native select values on one line with ellipsis instead of wrapping.

Research sources checked:

- OpenAI ChatGPT pricing: `https://openai.com/chatgpt/pricing/`
- Anthropic Claude plan help: `https://support.anthropic.com/en/articles/11049762-choosing-a-claude-ai-plan`
- Google AI Pro/Ultra and NotebookLM help: `https://gemini.google.com/advanced`, `https://support.google.com/notebooklm/answer/16213268`
- Microsoft Copilot/Microsoft 365 pricing and support: `https://www.microsoft.com/en-us/microsoft-365-copilot/pricing`, `https://support.microsoft.com/en-us/microsoft-365-copilot/what-s-the-difference-between-microsoft-copilot-free-and-copilot-in-microsoft-365`
- Perplexity pricing/help: `https://www.perplexity.ai/enterprise/pricing`, `https://www.perplexity.ai/help-center/en/articles/11680686-perplexity-max.html`
- Genspark membership/team pages: `https://www.genspark.ai/helpcenter/membership-plans`, `https://www.genspark.ai/team_pricing`
- xAI/Grok pricing/docs: `https://x.ai/pricing`, `https://docs.x.ai/grok/faq`
- Poe subscription plans: `https://poe.com/subscription_plans`
- You.com pricing/upgrade: `https://you.com/pricing`, `https://you.com/upgrade`
- Canva pricing/help: `https://www.canva.com/ff_sn/pricing/`, `https://www.canva.com/help/upgrade-to-canva-pro-or-business/`
- GitHub Copilot plans: `https://github.com/features/copilot/plans`
- Cursor pricing: `https://cursor.com/pricing`
- Replit pricing: `https://replit.com/pricing`
- DeepSeek app/API docs: `https://www.deepseek.com/en/`, `https://api-docs.deepseek.com/quick_start/pricing`
- Qwen/Alibaba Model Studio docs: `https://qwen.ai/`, `https://www.alibabacloud.com/help/en/model-studio/qwen-code`
- Kimi/Moonshot API docs: `https://platform.moonshot.ai/docs/pricing/chat`, `https://platform.moonshot.ai/docs/pricing/limits`
- Doubao/Volcano Engine sources: `https://www.volcengine.com/product/doubao`, `https://research.doubao.com/en/seed2`
- MiniMax API/token plan docs: `https://platform.minimax.io/docs/pricing/overview`, `https://platform.minimax.io/docs/guides/pricing-token-plan`
- Z.ai/Zhipu GLM docs: `https://z.ai/subscribe`, `https://docs.z.ai/devpack/overview`
- Tencent Hunyuan/Tencent Cloud docs: `https://hunyuan.tencent.com/`, `https://intl.cloud.tencent.com/document/product/1284/77186`
- Mistral pricing/Vibe notes: `https://mistral.ai/pricing/`, `https://mistral.ai/products/vibe/`

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the detour.
- `npm run test -- App everydayToolCatalog` passed with 2 files and 15 tests.
- `npm run test` passed with 11 files and 81 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5182` passed for long provider-specific account labels, three selected tool rows, remove button behavior, selected-count update, desktop/mobile layout, no selected-chip wrapping, and no horizontal overflow.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-tailored-tools-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-tailored-tools-mobile.png`

UX/product finish expectations:

- Account-level choices should look like the user’s actual provider account, not internal routing assumptions.
- The screen should stay user-controlled: add and remove are explicit.
- Provider plan labels need periodic review because the market changes quickly.

Security and privacy notes:

- The app still only stores local user choices.
- The app still does not verify plans or connect to providers.
- No external calls are made by the app; research was done during development only.

Rollback or recovery path:

Revert the catalog label expansion, row removal UI, wrapping CSS, and related tests. Existing local data remains compatible because the model inventory shape is unchanged.

Stop condition:

Reached. Provider-specific account choices were researched and expanded, remove behavior works, wrapping was fixed, and tests/build/browser validation passed.

Handoff note:

Chunk Fifteen should now cover the researched account-level list, remove-tool behavior, no selected-chip wrapping, no horizontal overflow, explicit add behavior, stale five-row migration, Local model choices, and the existing no-provider/no-execution boundary.

## Contextual Task Include Detour

Status: complete
Status Updated: 2026-07-04T10:20:07-06:00

Completion target: Integration complete

Budget class: Small

Objective:

Remove the standalone `What To Include` setup screen from the primary path and make information selection a contextual, optional question inside `My Task`.

User outcome:

The user does not have to configure sites, drives, folders, documents, or privacy/source settings before knowing what they are trying to do. When a task needs specific information, the task screen asks in ordinary language and defaults to `Nothing specific`.

Allowed files or folders:

- `src/App.tsx`
- `src/ui/screens/screenDefinitions.ts`
- `src/ui/screens/SetupScreens.tsx`
- `src/ui/screens/TaskRoutingScreens.tsx`
- `src/ui/state/useTaskRouting.ts`
- `src/styles.css`
- `src/tests/unit/App.test.tsx`
- status/pathway/decision docs

Non-goals:

- Do not remove the internal source registry or hard-gate safety model.
- Do not add file scanning, uploads, provider connectors, credentials, telemetry, external calls, or execution workflows.
- Do not begin Chunk Fifteen E2E implementation in this detour.

Acceptance criteria:

- [x] Start Here no longer presents a `What To Include` aisle.
- [x] Side navigation no longer exposes a standalone `What To Include` screen.
- [x] `My Task` asks `Do you want to include anything specific?`.
- [x] `Nothing specific` is the default task information choice.
- [x] Optional task choices use everyday labels such as website/current search, file or folder, pasted documents, repo/code page, work docs, Google Drive, and notes/background.
- [x] Shortcut templates can still select source IDs for routing and hard gates.
- [x] Blocked-source messages no longer tell users to fix a removed `What To Include` screen.

Implementation notes:

- Removed `source-permissions` from `screenDefinitions` and from the App render switch.
- Removed the visible `SourcePermissionsScreen` setup component and its primary-flow source editing controls.
- Kept the source registry in local configuration because existing schemas, templates, hard gates, scoring, and prompt packaging still rely on deterministic source IDs.
- Added a `Nothing specific` tile to the task include section that clears requested source IDs.
- Added task-specific source labels and hints so users see "A website or current search" instead of implementation-flavored source records.
- Source records with `permissionLevel: 0` stay hidden from manual task choices unless a shortcut has already selected them, which keeps template-driven safety checks visible without pushing unavailable choices.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the detour.
- `npm run test -- App` passed with 1 file and 12 tests.
- `npm run test` passed with 11 files and 81 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5183` passed for no standalone `What To Include` navigation, Start Here's three-step path, My Task's optional include question, `Nothing specific` default/clear behavior, desktop/mobile layout, and no horizontal overflow.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings at close-out.
- `git diff --check` passed; output only included normal Windows LF-to-CRLF notices.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-contextual-include-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-contextual-include-mobile.png`

UX/product finish expectations:

- The primary path should feel like tools, choosing style, then a task conversation.
- Source/privacy setup should not be front-loaded on average users.
- Task include choices should stay optional and understandable without explaining permissions.

Security and privacy notes:

- The app still does not open, scan, upload, search, connect, or send any source.
- Task include choices are local routing hints only.
- Internal safety checks continue to evaluate source availability and task sensitivity.

Rollback or recovery path:

Re-add the `source-permissions` screen definition and App branch, restore `SourcePermissionsScreen`, and revert the task include section if the owner decides source setup belongs in onboarding after further testing.

Stop condition:

Reached. The standalone include screen is removed from the primary flow, task-specific include choices exist, and focused App validation passed.

Handoff note:

Chunk Fifteen should protect this UX with E2E coverage: no standalone `What To Include` navigation, Start Here's three-step path, `My Task` optional include question, `Nothing specific` default and clear behavior, shortcut-selected source IDs, blocked-source copy, and no horizontal overflow.

## Chunk Fifteen - E2E Tests And Fixture Suite

Status: integration complete
Status Updated: 2026-07-04T20:02:34-06:00

Completion target: Integration complete

Budget class: Medium

Objective:

Add a practical fixture suite and Playwright end-to-end tests for the MVP routing workflow.

User outcome:

The project has repeatable confidence that setup, task intake, routing, route card viewing, prompt package viewing, local save, export preparation, and feedback flows keep working.

Allowed files or folders:

- `src/tests/fixtures/*`
- `tests/e2e/*` or the existing Playwright test folder pattern
- `playwright.config.ts` only for necessary configuration
- `src/ui/*` only for testability fixes and accessible selectors
- `src/domain/*` only for defects uncovered by tests
- active pathway and status docs

Non-goals:

- Do not add broad visual regression infrastructure unless explicitly approved.
- Do not test external providers.
- Do not require network access for normal E2E runs.
- Do not turn fixtures into production seed data unless separately reviewed.

Product boundary reminders:

- E2E tests should prove no execution/provider workflow appears in the app.
- Browser-local storage setup/reset should be deterministic.
- Tests should cover local user actions only.

Domain terms to use:

- fixture task
- setup workflow
- routing workflow
- route card
- prompt package
- route log
- feedback
- no-execution boundary

Acceptance criteria:

- [x] Adds at least 20 fixture tasks covering public, internal, confidential, regulated, highly restricted, public-facing risk, current-facts, citation, coding, writing, planning, packaging, and review scenarios.
- [x] Adds E2E coverage for first-run setup or seeded defaults.
- [x] Adds E2E coverage for My AI Tools: one blank starter row, explicit `Add another tool`, researched provider-specific account dropdowns, Local model choices, `Remove tool`, selected-count updates, stale five-row migration, no selected-chip wrapping, and no horizontal overflow.
- [x] Adds E2E coverage that no standalone `What To Include` onboarding screen is present.
- [x] Adds E2E coverage for My Task's optional include question, `Nothing specific` default, source-choice selection, and clear behavior.
- [x] Adds E2E coverage for task intake to route results.
- [x] Adds E2E coverage for route card and prompt package viewing.
- [x] Adds E2E coverage for saving a route log entry and adding feedback.
- [x] Adds E2E coverage for export-preparation behavior if UI exists.
- [x] Adds a boundary test that no "execute", "connect account", or provider-send workflow is present.
- [x] E2E tests are deterministic and do not require external network calls after dependencies are installed.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test`
- `npm run build`
- `npx playwright test` or a documented npm script if added

UX/product finish expectations:

- Use accessible names/selectors rather than brittle implementation selectors where practical.
- Screens should be stable enough for tests without artificial waits.
- Test fixture labels should remain readable for manual debugging.

Security and privacy notes:

- Fixtures must not include real private data, credentials, tokens, or customer information.
- E2E tests must not contact external systems.
- Keep any browser storage cleanup scoped to the test app origin.

Rollback or recovery path:

E2E tests and fixtures can be reverted independently if they become flaky. Fix product issues discovered by E2E tests in small targeted patches.

Stop condition:

Stop when E2E and unit suites pass reliably. Do not perform MVP polish or documentation rewrite in this chunk.

Handoff note:

Reached. Chunk Fifteen adds the fixture suite and Playwright E2E coverage for the corrected web MVP workflows. The E2E browser cache dependency was installed with `npx playwright install chromium` on this Windows machine. Next release-path work should run D8 Web Release Candidate And Cybersecurity Pass before public hosting, or Chunk Sixteen if the owner wants a documentation/polish pass first.

## Desktop Chunk D8 - Web Release Candidate And Cybersecurity Pass

Status: task complete, release hold
Status Updated: 2026-07-04T20:27:56-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Run the web/PWA release-candidate and cybersecurity pass before any Cloudflare production hosting, public website links, social launch, GitHub Release, or desktop download.

User outcome:

The owner has evidence that the browser/PWA MVP is locally release-candidate-ready and a clear checklist for the next Cloudflare preview step without accidentally launching early.

Decision packet:

- [Web Release Candidate Security Pass](2026-07-04-web-release-candidate-security-pass.md)

Allowed files or folders:

- `scripts/*`
- `package.json`
- `docs/2026-07-04-web-release-candidate-security-pass.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/2026-07-04-desktop-trust-distribution-plan.md`
- `docs/2026-07-04-release-security-readiness-packet.md`
- `docs/deployment-guide.md`
- `docs/runbook.md`
- `docs/risks/risk-register.md`
- `docs/roadmap.md`
- `docs/CHANGELOG.md`
- `README.md`
- `IMPLEMENTATION_STATUS.md`
- `SESSION_STATE.md`

Non-goals:

- Do not create Cloudflare production deployment.
- Do not change DNS.
- Do not add public website links or social launch posts.
- Do not create a GitHub Release.
- Do not publish, upload, sign, or distribute desktop artifacts.
- Do not enable telemetry, provider calls, provider account connections, remote sync, uploads, file indexing, broad local discovery, updater, signing workflow, or execution workflow.

Acceptance criteria:

- [x] Governance preflight passes.
- [x] Current official GitHub, Cloudflare, and OWASP source basis is reviewed.
- [x] Clean install is attempted and final clean install passes.
- [x] Dependency audit passes.
- [x] Unit and script tests pass.
- [x] Production build passes.
- [x] Playwright E2E suite passes.
- [x] Adds repeatable no-secret/no-hidden-network/PWA artifact scan.
- [x] Production `dist/` artifact scan passes.
- [x] Local production-preview smoke verifies root page, manifest, install icons, and service worker.
- [x] Cloudflare Pages preview plan is recorded.
- [x] Rollback checklist is recorded.
- [x] Public launch go/no-go is explicit.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- `npm ci` initially hit a Windows `EPERM` lock because stale repo-owned Vite dev/preview servers were still running; those `agents\agent-picker` Node processes were stopped and `npm ci` then passed with 0 vulnerabilities.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `npm run test:scripts` passed with 4 Node script tests.
- `npm run test` passed with 12 files and 88 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run scan:web-rc` passed with no release-blocking findings.
- `npx playwright test` passed with 6 Chromium tests.
- Local production preview at `http://127.0.0.1:5185/` served the root page, manifest, Apple icon, 192px icon, 512px icon, and service worker with install/fetch handlers and same-origin-only guard.

Release decision:

Hold public launch. The current web/PWA artifact is ready for Cloudflare Pages preview configuration; D9 later completed the hosted preview smoke. Public release still needs owner confirmation of the canonical URL, custom-domain smoke if used, GitHub integration or direct-upload release-process decision, and final launch decision.

Handoff note:

Reached by D9: the Cloudflare Pages hosted preview exists at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`. Next release-engineering step is canonical URL selection plus the GitHub-integration/direct-upload decision before production. If a subpath is chosen, review Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links before public launch.

## Desktop Chunk D9 - Cloudflare Pages Hosted Preview Smoke

Status: task complete, release hold
Status Updated: 2026-07-04T21:05:03-06:00

Completion target: Task complete

Budget class: Small

Objective:

Use the owner-provided Cloudflare access from the master environment file to create a hosted Pages preview, smoke test it over HTTPS, and record the remaining public-launch gates without attaching a custom domain or adding public links.

User outcome:

The owner can open a real Cloudflare-hosted preview for testing while the project still avoids an accidental launch.

Decision packet:

- [Cloudflare Pages Hosted Preview Smoke](2026-07-04-cloudflare-pages-hosted-preview-smoke.md)

Allowed files or folders:

- `playwright.config.ts`
- `docs/2026-07-04-cloudflare-pages-hosted-preview-smoke.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/2026-07-04-desktop-trust-distribution-plan.md`
- `docs/2026-07-04-release-security-readiness-packet.md`
- `docs/2026-07-04-web-release-candidate-security-pass.md`
- `docs/deployment-guide.md`
- `docs/runbook.md`
- `docs/roadmap.md`
- `docs/CHANGELOG.md`
- `README.md`
- `IMPLEMENTATION_STATUS.md`
- `SESSION_STATE.md`

Non-goals:

- Do not attach a custom domain or change DNS.
- Do not add public website links or social launch posts.
- Do not create a GitHub Release.
- Do not publish, upload, sign, or distribute desktop artifacts.
- Do not enable telemetry, provider calls, provider account connections, remote sync, uploads, file indexing, broad local discovery, updater, signing workflow, or execution workflow.

Acceptance criteria:

- [x] Governance preflight passes.
- [x] Cloudflare credential presence is verified without printing token values.
- [x] Cloudflare Pages project is created or reused.
- [x] Hosted preview deployment is created.
- [x] Hosted root app, manifest, service worker, and PWA icons are checked over HTTPS.
- [x] Hosted Chromium smoke confirms title, heading, manifest, service-worker registration, and no observed external requests.
- [x] Hosted Playwright E2E suite passes.
- [x] Repeatable hosted Playwright base-URL support is added.
- [x] Public launch go/no-go remains explicit.

Validation:

- `bash scripts/governance-preflight.sh` passed with 0 warnings.
- `npx --yes wrangler whoami --env-file ...` accepted the Cloudflare account API token from the master environment file; token values were not printed or documented.
- `npx --yes wrangler pages project create ai-task-router --production-branch main --env-file ...` created the Pages project.
- `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch preview-20260704-0c7b253 --commit-hash 0c7b253 --commit-message "Preview ai-task-router web release candidate" --env-file ...` uploaded 9 files and created the preview deployment.
- Cloudflare deployment API check reported preview environment, successful deploy stage, no environment variables, no Functions, branch `preview-20260704-0c7b253`, and commit `0c7b253`.
- Node HTTPS/fetch check returned 200 for the preview root, `manifest.webmanifest`, `service-worker.js`, `/pwa/icon-192.png`, and `/pwa/icon-512.png`; both icon paths returned `image/png`.
- Chromium hosted smoke loaded title `AI Task Router | Guided AI Labs`, first heading `AI Task Router`, manifest link `/manifest.webmanifest`, registered the service worker, and observed 0 external requests during load.
- `npx playwright test` passed locally with 6 Chromium tests after the Playwright config change.
- `PLAYWRIGHT_BASE_URL=https://preview-20260704-0c7b253.ai-task-router.pages.dev npx playwright test` passed the same 6 Chromium tests against the Cloudflare preview.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `npm run test:scripts` passed with 4 Node script tests.
- `npm run test` passed with 12 files and 88 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run scan:web-rc` passed with no release-blocking findings.

Release decision:

Hold public launch. The Cloudflare hosted preview works, but the canonical public URL is not selected, no custom domain has been attached or smoked, the Cloudflare Pages project is not connected to GitHub yet, and the owner has not made the launch decision.

Caveat:

Windows `curl.exe` and PowerShell `Invoke-WebRequest` hit a TLS handshake failure against the preview alias, while Node HTTPS/fetch and Chromium succeeded over HTTPS. Retest normal browsers and the final custom domain before public launch.

Handoff note:

Next release-engineering step: choose the canonical public URL and decide whether to connect Cloudflare Pages to GitHub before production. Prefer a root app subdomain or Cloudflare Pages default URL for the PWA path; if a subpath is chosen, review Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links before release. Do not add public links from `oldskoolai.com`, `guidedailabs.com`, `guidedaijourney.com`, YouTube, Facebook, or LinkedIn until canonical URL/custom-domain smoke passes and the owner makes the launch decision.

## Chunk Sixteen - MVP Polish And Documentation

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

Completion target: Release ready candidate

Budget class: Medium

Objective:

Polish the v0.2 local web app, update documentation, and assemble release-readiness evidence without deploying or hosting yet.

User outcome:

The owner can run, inspect, share, and evaluate the local MVP with clear docs, known limits, validation evidence, and a clean next-step path toward future public hosting.

Allowed files or folders:

- `README.md`
- `docs/manual.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `docs/deployment-guide.md`
- `docs/runbook.md`
- `docs/CHANGELOG.md`
- `docs/risks/risk-register.md`
- `docs/2026-07-03-current-pathway.md`
- `IMPLEMENTATION_STATUS.md`
- `SESSION_STATE.md`
- targeted UI/CSS files for polish fixes
- targeted test files for defects discovered during polish

Non-goals:

- Do not deploy to `oldskoolai.com` in this chunk.
- Do not add links from `guidedailabs.com` or `guidedaijourney.com` yet.
- Do not add auth, cloud storage, provider APIs, OAuth, subscriptions, or account connections.
- Do not add new major product features.
- Do not claim final project completion; only a release-ready candidate can be claimed by the agent.

Product boundary reminders:

- v0.2 remains local-first and recommendation-only.
- Future hosting/distribution is a separate planning and deployment pathway.
- Proposed best-stack recommendations remain future work unless explicitly moved into scope later.

Domain terms to use:

- v0.2 Local Web App MVP
- release-ready candidate
- local-first
- recommendation-only
- route card
- prompt package
- route log
- known limits
- future hosting

Acceptance criteria:

- [ ] README accurately explains install, run, test, build, product boundary, and known limits.
- [ ] Manual explains setup, task intake, interpreting routes, using prompt packages, saving logs, feedback, and export/import behavior.
- [ ] Architecture doc reflects actual modules and data flow.
- [ ] Roadmap distinguishes v0.2 complete, near-term improvements, future best-stack planning, and future hosting/distribution.
- [ ] Deployment guide states that public hosting is not yet executed and names `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com` as future planning references only.
- [ ] Changelog records implemented MVP chunks.
- [ ] Risk register reflects local data, exports, no credentials, no external calls, and user misuse risks.
- [ ] UI polish pass fixes obvious layout, empty state, error state, and mobile issues.
- [ ] All tests/build pass and release-readiness evidence is recorded.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm audit --audit-level=moderate`
- `npm run test`
- `npm run build`
- `npx playwright test` if E2E suite exists
- Manual app walkthrough on desktop and narrow viewport

UX/product finish expectations:

- First screen should be the usable app, not a landing page.
- Navigation should make the setup-to-routing-to-log flow obvious.
- Empty, error, loading, invalid, saved, copied, and reset states should be clear.
- Text should fit containers and avoid overlap.
- Visual styling should feel like a focused operational tool.

Security and privacy notes:

- Reconfirm no secrets, provider SDKs, auth flows, telemetry, external fetches, or hidden account identifiers.
- Reconfirm exports are user-triggered and may contain user-entered task data.
- Reconfirm local reset/delete behavior is explicit.

Rollback or recovery path:

Polish/doc changes can be reverted independently. Any final bug fixes should be small and tied to failing evidence.

Stop condition:

Stop when docs, UI polish, validation evidence, and known limits support a v0.2 release-ready candidate. Do not deploy or declare project completion.

Handoff note:

After this chunk, decide whether to run a release-readiness review, plan future hosting on `oldskoolai.com`, continue to Desktop Chunk D2 in [docs/2026-07-04-desktop-trust-distribution-plan.md](2026-07-04-desktop-trust-distribution-plan.md), or open a v0.3 pathway for best-stack recommendation mode.

## Future Desktop Track - Trusted Installable App

Status: active planning
Status Updated: 2026-07-04T14:58:04-06:00

Completion target: D1 task complete; D2 shell spike is next; desktop local discovery remains outside v0.2

Budget class: Strategic

Planning source:

- [docs/2026-07-04-desktop-trust-distribution-plan.md](2026-07-04-desktop-trust-distribution-plan.md)
- [docs/decisions/adr-0001-desktop-wrapper.md](decisions/adr-0001-desktop-wrapper.md)

Objective:

Preserve a future path for a trusted installable AI Task Router desktop app on Windows, macOS, and Linux while keeping v0.2 focused on the local-first browser MVP.

User outcome:

Users eventually have both options: use the hosted/PWA version immediately, or download a signed desktop app when they want permissioned local AI tool/model discovery.

Current decisions:

- D0 is confirmed for planning: first desktop scope is AI tool and local model discovery only; user-selected folder inspection is deferred from the first public desktop release; Windows is first target OS; `Guided AI Labs Ltd` is provisional publisher identity if legally correct.
- D1 selected Tauri for the first desktop shell spike, keeps the hosted web/PWA track separate, and keeps Electron as a fallback if the Tauri spike blocks.
- D3 defines the desktop trust-boundary contract: future native commands are limited to `get_desktop_discovery_options` and `run_desktop_discovery`, validated by schemas, summary-first, redacted by default, and user-approved before every run.
- D6 adds an opt-in unsigned internal Windows NSIS package build and checksum inspection only. Public desktop release remains blocked until signing and platform trust checks pass.

Current desktop/release action after D7:

Resolve the Windows Application Control/signing/trusted-path blocker through an approved lab policy path before claiming interactive desktop smoke tests or controlled desktop beta readiness. For public web launch, D8 local web release-candidate evidence is complete; next create and smoke test the Cloudflare Pages HTTPS preview before Cloudflare production hosting, public website links, or social sharing.

D2 allowed scope:

- add the minimum Tauri scaffold needed to launch the current Vite/React UI on Windows
- confirm the browser app still builds
- document Tauri setup commands and prerequisites
- run existing tests, build, audit, and governance checks
- do not add native discovery or machine inspection

Current D2 state:

- the Tauri scaffold, desktop npm scripts, and branded desktop icon assets are present
- Rustup/Rust/Cargo and Visual Studio Build Tools with MSVC and Windows SDK components are installed
- `npm run desktop:info` passes and confirms WebView2 is present
- `npm run desktop:build` passes and builds `src-tauri\target\release\ai-task-router-desktop.exe`
- the release executable launches and shows the `AI Task Router` window title
- `npm run desktop:dev` is blocked by Windows Application Control policy when Cargo tries to run the generated debug `build-script-build.exe`

Current D3 state:

- the frontend/native trust-boundary model is documented in [docs/2026-07-04-desktop-trust-distribution-plan.md](2026-07-04-desktop-trust-distribution-plan.md)
- the tool permission matrix separates the current desktop shell from planned D4 discovery commands
- `src/domain/schemas.ts` defines future desktop discovery option, request, response, summary, result, and error schemas
- `src-tauri/tauri.conf.json` has explicit release and dev CSP entries
- no native discovery commands, filesystem permissions, shell/process plugin, folder inspection, telemetry, provider connection, credential storage, packaging, signing, updater, file indexing, or external actions were added
- `npm run desktop:build` passes after adding `C:\Users\adamg\.cargo\bin` to the current shell PATH, but the rebuilt unsigned release executable launch is blocked by Windows Application Control

Product boundary reminders:

- The web/PWA version must not pretend it can scan the user's computer.
- The desktop version must not silently scan, index files, upload data, connect provider accounts, store credentials, or execute actions.
- The current `npm run detect:local-models` script remains explicit and terminal-only until a reviewed desktop-native workflow replaces or imports it.

Stop condition:

Stop desktop planning or implementation if the scope expands into background scanning, broad folder indexing, file-content reading, telemetry, credentials, provider API calls, or execution workflows without a separate owner-approved security review.

## Desktop Chunk D10 - Desktop Technical-Preview Artifacts

Status: draft complete, public download hold
Status Updated: 2026-07-04T21:49:15-06:00

Completion target: Draft complete

Budget class: Medium

Objective:

Create a same-day Windows, macOS, and Linux desktop artifact path for technical review without publishing unsigned or unnotarized installers to ordinary users.

User outcome:

The owner has a credible path toward "Download for Windows/Mac/Linux" buttons while the repo remains honest that public downloads need signing, notarization, checksum, smoke-test, and support/withdrawal evidence first.

Allowed files or folders:

- `.github/workflows/desktop-technical-preview.yml`
- `src-tauri/tauri.technical-preview.conf.json`
- `package.json`
- `scripts/inspect-desktop-artifacts.mjs`
- `scripts/inspect-desktop-artifacts.node-test.mjs`
- release, deployment, runbook, changelog, README, and pathway docs

Non-goals:

- Public website download links
- Public GitHub Releases
- Code signing
- macOS notarization
- Microsoft Store/MSIX submission
- Linux GPG signing
- Updater artifacts
- Bypassing Windows Application Control

Security and privacy notes:

The D10 workflow is manual-only, uses read-only repository permissions, uploads short-retention GitHub Actions artifacts, and does not add provider connections, telemetry, credentials, broad filesystem permissions, external calls, or updater artifacts. Generated artifacts remain technical-preview evidence until public trust gates pass.

Implementation:

- Added [Desktop Technical Preview Artifacts](2026-07-04-desktop-technical-preview-artifacts.md).
- Added manual workflow `.github/workflows/desktop-technical-preview.yml`.
- Added shared Tauri technical-preview bundle config `src-tauri/tauri.technical-preview.conf.json`.
- Added platform package scripts for Windows NSIS, macOS DMG, Linux AppImage, and Linux `.deb`.
- Added `npm run desktop:checksums` and checksum-file generation to the desktop artifact inspector.

Release decision:

Hold public desktop downloads. Technical-preview artifacts may be generated for owner/developer inspection, but Old Skool AI public download buttons should wait for platform trust gates or a separately recorded technical-preview exception.

Rollback or recovery:

Remove `.github/workflows/desktop-technical-preview.yml`, `src-tauri/tauri.technical-preview.conf.json`, the new package scripts, and checksum writer changes. No provider-side releases, public download links, DNS changes, or updater state are created by this chunk.

Stop condition:

Stop if workflow syntax, package scripts, checksum generation, or local validation fails in a way that would make generated artifacts ambiguous or unsafe to label.

## Desktop Chunk D11 - Public Launch Master Plan

Status: task complete, release hold
Status Updated: 2026-07-04T22:10:36-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Create one structured public release execution plan so the Old Skool AI hub, hosted web/PWA release, desktop downloads, cybersecurity checks, support path, withdrawal path, and owner go/no-go decisions are controlled before launch work continues.

User outcome:

The owner can see the whole path to free public distribution without guessing which release lane comes next or accidentally treating unsigned desktop artifacts as ordinary-user downloads.

Allowed files or folders:

- `docs/2026-07-04-public-launch-master-plan.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/2026-07-04-desktop-trust-distribution-plan.md`
- `docs/context-map.md`
- `docs/deployment-guide.md`
- `docs/roadmap.md`
- `docs/runbook.md`
- `docs/CHANGELOG.md`
- `IMPLEMENTATION_STATUS.md`
- `README.md`

Non-goals:

- no DNS or custom-domain changes
- no Cloudflare production promotion
- no public website link publishing
- no social launch
- no public GitHub Release
- no desktop signing workflow
- no macOS notarization workflow
- no public desktop download buttons
- no D10 manual workflow run
- no provider connections, telemetry, backend storage, or execution workflow

Product boundary reminders:

- Old Skool AI is the preferred public product hub.
- The hosted app and desktop app remain separate release lanes.
- The browser/PWA cannot check the user's computer.
- Desktop downloads remain held until platform trust gates pass or a separately documented technical-preview exception is accepted.
- The current MVP remains recommendation-only and local-first.

Implementation:

- Added [Public Launch Master Plan](2026-07-04-public-launch-master-plan.md).
- Defined launch principles, recommended first public shape, release lanes, phase plan, cybersecurity checklist, copy requirements, and public go/no-go board.
- Recommended D12 as the Old Skool AI hub handoff package.
- Updated this pathway, desktop trust plan, deployment guide, runbook, changelog, README, and implementation status so the master plan is discoverable from normal entry points.

Release decision:

Hold public launch. D11 is a planning/control chunk only; public web links, DNS/custom-domain changes, social posts, GitHub Releases, and desktop download buttons remain blocked until their release gates pass and owner launch approval is recorded.

Rollback or recovery:

Remove `docs/2026-07-04-public-launch-master-plan.md` and revert the D11 documentation references. No provider-side state, DNS, public release, artifact publication, or desktop signing state is created by this chunk.

Stop condition:

Stop if the master plan blurs web/PWA and desktop release gates, implies public desktop downloads are ready, or creates any external release side effect.

## Desktop Chunk D12 - Old Skool AI Hub Handoff Package

Status: task complete, release hold
Status Updated: 2026-07-04T22:23:04-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Prepare a concrete Old Skool AI website handoff so the web doorway can move faster without mixing in desktop download risk.

User outcome:

The owner or Linux-side site builder has exact page/tab instructions, plain-language copy, cross-site link instructions, held desktop-download copy, and rollback/removal notes for the public hub.

Allowed files or folders:

- `docs/2026-07-04-old-skool-ai-hub-handoff.md`
- `docs/2026-07-04-public-launch-master-plan.md`
- `docs/2026-07-04-desktop-trust-distribution-plan.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/context-map.md`
- `docs/deployment-guide.md`
- `docs/roadmap.md`
- `docs/runbook.md`
- `docs/CHANGELOG.md`
- `IMPLEMENTATION_STATUS.md`
- `README.md`

Non-goals:

- no DNS or custom-domain changes
- no Cloudflare production promotion
- no public website publication from this repo
- no social launch
- no public GitHub Release
- no desktop signing workflow
- no macOS notarization workflow
- no public desktop download buttons
- no D10 manual workflow run
- no provider connections, telemetry, backend storage, lead capture, or execution workflow

Product boundary reminders:

- Old Skool AI is the public product doorway.
- The online app and desktop app remain separate release lanes.
- The browser/PWA cannot check the user's computer.
- Desktop downloads remain hidden or disabled until trust gates pass.
- The D9 preview URL is not the public launch destination.

Implementation:

- Added [Old Skool AI Hub Handoff Package](2026-07-04-old-skool-ai-hub-handoff.md).
- Recommended the Old Skool AI page route `/ai-task-router/`, subject to Linux-side site routing.
- Supplied ready-to-use hero, feature, online-version, desktop-hold, trust-note, metadata, and cross-site link copy.
- Added a publish checklist that blocks links to the D9 preview alias and blocks unsigned/unnotarized desktop artifacts.
- Added rollback/removal instructions for the Old Skool AI page and cross-site links.
- Updated the public launch master plan so Phase 1 is complete and D13 becomes the canonical online app URL and Cloudflare production-path decision.

Release decision:

Hold public launch. D12 prepares the website handoff only; public web links still wait for final URL selection, hosted smoke, public copy approval, support route confirmation, and owner launch approval. Desktop download buttons remain held until desktop gates pass or a separately documented technical-preview exception is accepted.

Rollback or recovery:

Remove `docs/2026-07-04-old-skool-ai-hub-handoff.md` and revert the D12 documentation references. No provider-side state, DNS, public link, public release artifact, desktop signing, or website publication is created by this chunk.

Stop condition:

Stop if the handoff points public users at the smoke-test preview, implies browser local discovery, creates a public desktop download path, or makes any external website/provider change.

## Desktop Chunk D13 - Cloudflare Production Launch Smoke

Status: task complete, web/PWA link-ready
Status Updated: 2026-07-05T07:22:04-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Select the first canonical online app URL, deploy the browser/PWA build to Cloudflare Pages production, and rerun the web/PWA release gate against the final URL before public website or social links.

User outcome:

The owner has a live, smoked online app URL that can be linked from the Old Skool AI hub without pointing users at a preview alias.

Allowed files or folders:

- `docs/2026-07-05-cloudflare-production-launch-smoke.md`
- `docs/2026-07-04-public-launch-master-plan.md`
- `docs/2026-07-04-old-skool-ai-hub-handoff.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/deployment-guide.md`
- `docs/runbook.md`
- `docs/roadmap.md`
- `docs/risks/risk-register.md`
- `docs/CHANGELOG.md`
- `START_HERE.md`
- `IMPLEMENTATION_STATUS.md`
- `SESSION_STATE.md`
- `README.md`
- `SECURITY.md`

Non-goals:

- no DNS or custom-domain changes
- no Old Skool AI website publication from this repo
- no Guided AI Labs or Guided AI Journey site edits from this repo
- no social launch posts
- no public GitHub Release
- no desktop signing workflow
- no macOS notarization workflow
- no public desktop download buttons
- no D10 manual workflow run
- no provider connections, telemetry, backend storage, lead capture, or execution workflow

Product boundary reminders:

- The online app is a browser/PWA path and cannot check the user's computer.
- Local computer checking remains desktop-only and is not public-download-ready.
- The Cloudflare Pages production URL is the canonical online app URL for the first public web release.
- The D9 preview URL remains historical smoke evidence only.

Implementation:

- Added [Cloudflare Production Launch Smoke](2026-07-05-cloudflare-production-launch-smoke.md).
- Treated the owner's 2026-07-05 request to get the project shared out as approval for D13 only.
- Selected `https://ai-task-router.pages.dev/` as the first canonical online app URL.
- Accepted Wrangler direct upload as the D13 production release process.
- Deployed the current `dist/` artifact to Cloudflare Pages production branch `main` from source commit `af2b367`.
- Reran local governance, audit, scripts, unit, build, artifact scan, and Playwright gates.
- Reran hosted asset, hosted Playwright, Windows client, Wrangler deployment-list, and Chromium metadata/network smoke against the final URL.
- Updated the public launch master plan, Old Skool AI hub handoff, deployment guide, runbook, roadmap, risk register, README, security policy, changelog, startup handoff, implementation status, and session state.

Release decision:

The web/PWA app is live and link-ready at `https://ai-task-router.pages.dev/`.

Hold Old Skool AI page publication, cross-site links, social launch, custom-domain/DNS work, GitHub Releases, and desktop downloads until their separate gates pass. Public desktop download buttons remain hidden or disabled.

Rollback or recovery:

Rollback the Cloudflare Pages production deployment, deploy a corrected `dist/` artifact to `main`, or remove public website links if the app or copy regresses. Website rollback remains separate: unpublish the Old Skool AI page and remove cross-site links if needed.

Stop condition:

Stop if the production URL fails hosted E2E, serves missing PWA assets, registers an unexpected service-worker scope, makes unexpected external requests on load, or if the chunk starts to include DNS, social launch, desktop downloads, GitHub Releases, signing, or website edits.

## Desktop Chunk D14 - Public Hub And Cross-Site Link Smoke

Status: task complete, public web doorway live
Status Updated: 2026-07-05T07:57:15-06:00

Completion target: Task complete

Budget class: Medium

Objective:

Publish and smoke the public Old Skool AI doorway for AI Task Router, add the Guided AI Labs and Guided AI Journey cross-site links, and keep social/desktop release gates separate.

User outcome:

Public users can find the AI Task Router hub from Old Skool AI, Guided AI Labs, and Guided AI Journey, then launch the browser/PWA app from the smoked Cloudflare Pages URL.

Allowed files or folders:

- `docs/2026-07-05-public-hub-and-cross-site-link-smoke.md`
- `docs/2026-07-04-public-launch-master-plan.md`
- `docs/2026-07-04-old-skool-ai-hub-handoff.md`
- `docs/2026-07-03-current-pathway.md`
- `docs/deployment-guide.md`
- `docs/runbook.md`
- `docs/risks/risk-register.md`
- `docs/CHANGELOG.md`
- `START_HERE.md`
- public website repos named in the D12/D14 handoff

Non-goals:

- no social launch posts
- no public desktop download buttons
- no custom app domain or DNS change
- no public GitHub Release
- no desktop signing workflow
- no macOS notarization workflow
- no provider connections, telemetry, backend storage, lead capture, or execution workflow

Implementation:

- Updated `oldskoolai.com` so `/ai-task-router/` links to `https://ai-task-router.pages.dev/`.
- Added `https://oldskoolai.com/security/` as a public support/security route.
- Added a Guided AI Labs footer link to `https://oldskoolai.com/ai-task-router/`.
- Added a Guided AI Journey footer link to `https://oldskoolai.com/ai-task-router/` through an isolated worktree based on `origin/main`, so pre-existing local unpushed commit `236fd7e` was not published.
- Deployed Guided AI Journey production through the correct Vercel project and smoked the live alias.

Release decision:

The public web doorway is live. Social launch remains held for a separate owner-approved copy/review chunk. Public desktop downloads remain held until desktop trust gates pass.

Rollback or recovery:

Revert `oldskoolai.com` commit `8be9b86`, Guided AI Labs commit `dc370e5`, and/or Guided AI Journey commit `610438b`, then let Vercel redeploy or manually promote a previous Guided AI Journey deployment. If the Cloudflare app URL fails, remove or disable the Old Skool AI online-app target until D13 rollback is complete.

Stop condition:

Stop if public pages point at the D9 preview alias, expose desktop artifacts, imply browser local discovery, fail desktop/mobile smoke, or if the chunk starts creating social posts, DNS/custom-domain changes, GitHub Releases, signing, or desktop downloads.

## Validation Log

| Timestamp | Command | Result | Notes |
|-----------|---------|--------|-------|
| 2026-07-05T07:57:15-06:00 | Old Skool AI, Guided AI Labs, and Guided AI Journey site validation; public HTTP smoke; desktop/mobile Chromium smoke; public boundary sweep | passed | D14 validation passed. Old Skool AI typecheck/lint/build passed; Guided AI Labs lint/build passed before and after rebase over remote; Guided AI Journey isolated temp worktree clean install/typecheck/lint/build passed with the existing repo-local env loaded for build. Public URLs returned 200; desktop/mobile Chromium confirmed expected text and links with 0 horizontal overflow; HTML sweep found no D9 preview alias or public desktop artifact strings. |
| 2026-07-05T07:30:44-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; release-boundary `rg` scans | passed | Final D13 documentation close-out validation passed. Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; scans found no stale canonical-URL-pending, preview-command, premature desktop-download, or install-safety wording in active release docs. |
| 2026-07-05T07:22:04-06:00 | `npm ci`; `npm audit --audit-level=moderate`; `npm run test:scripts`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `npx playwright test`; `bash scripts/governance-preflight.sh`; Cloudflare production deploy; hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test`; hosted asset checks; Windows `curl.exe`; PowerShell `Invoke-WebRequest`; Chromium metadata/network smoke | passed with existing build warning | D13 validation passed. Clean install, audit, script tests, unit tests, production build, web RC scan, local Playwright, and governance preflight passed; build retained the existing 519.84 kB Vite warning. Wrangler direct-upload deployed production branch `main` from source `af2b367`; `https://ai-task-router.pages.dev/` plus manifest, service worker, and PWA icons returned 200; hosted Playwright passed 6 Chromium tests; Windows `curl.exe` and PowerShell returned 200; Chromium smoke found title `AI Task Router | Guided AI Labs`, first heading `AI Task Router`, manifest `/manifest.webmanifest`, service-worker scope at the production root, and 0 observed external requests. |
| 2026-07-04T23:38:12-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; claim-boundary `rg` scan | passed | AI environmental impact information-session draft validation passed. Governance preflight reported 0 warnings; whitespace check passed; scan confirmed the new document frames fixed savings, exact savings, and public proof as caveats rather than promises. No app/runtime tests were run because this changed documentation only. |
| 2026-07-04T22:30:30-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; release-boundary `rg` scans; D12 handoff presence scan | passed | D12 close-out validation passed. Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; text scans found no stale D12-missing wording and only historical or negative-boundary references for the D9 preview alias, unconfirmed app subdomain, premature desktop-readiness claims, and install-safety claims; the D12 handoff doc exists and contains the online button, desktop hold copy, and D13 handoff. No app/runtime tests were run because D12 changed documentation and release-control notes only. |
| 2026-07-04T22:10:36-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; text scan for unconfirmed URL and premature desktop-download claims | passed | D11 close-out validation passed. Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; text scan found only correction/negative-boundary references for `app.oldskoolai.com`, "public desktop downloads are ready", and "safe to install". |
| 2026-07-04T22:03:36-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D11 public launch master planning. |
| 2026-07-04T21:52:19-06:00 | `bash scripts/governance-preflight.sh`; `node --check scripts/inspect-desktop-artifacts.mjs`; `node --check scripts/inspect-desktop-artifacts.node-test.mjs`; JSON parse check; `npx --yes yaml-lint .github/workflows/desktop-technical-preview.yml`; `npm audit --audit-level=moderate`; `npm run test:scripts`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `npm run desktop:package:windows:technical-preview`; `npm run desktop:artifacts`; `npm run desktop:checksums`; `Get-AuthenticodeSignature`; `git diff --check` | passed with public download hold | D10 validation passed. Governance preflight reported 0 warnings; syntax and JSON checks passed; workflow YAML parsed; audit found 0 vulnerabilities; script tests passed 4 tests; Vitest passed 12 files and 88 tests; production build passed with existing 519.84 kB chunk-size warning; web RC scan found no release-blocking findings; Windows technical-preview NSIS package built; `npm run desktop:artifacts` reported size `1.90 MiB` and SHA-256 `C6438D8EDBDFFEC8375D9538373F4C2E681DE02EE037474C1C0C11B006CA0B86`; `npm run desktop:checksums` wrote `SHA256SUMS.txt`; `Get-AuthenticodeSignature` reported `NotSigned` for both installer and rebuilt executable; whitespace check reported only normal Windows LF-to-CRLF notices. Remote macOS/Linux workflow artifacts were not generated in this local chunk. |
| 2026-07-04T21:05:03-06:00 | `bash scripts/governance-preflight.sh`; `npm audit --audit-level=moderate`; `npm run test:scripts`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `npx playwright test`; hosted `PLAYWRIGHT_BASE_URL=... npx playwright test`; Cloudflare Pages project/deployment checks | passed with existing build warning and Windows-curl caveat | D9 hosted preview validation passed. Cloudflare Pages project `ai-task-router` was created, Wrangler direct-upload preview `https://preview-20260704-0c7b253.ai-task-router.pages.dev` was deployed, Node/Chromium HTTPS smoke passed, hosted Playwright passed 6 Chromium tests, audit found 0 vulnerabilities, script tests passed 4 tests, Vitest passed 12 files and 88 tests, build retained the existing 519.84 kB chunk-size warning, and web RC scan found no release-blocking findings. Windows `curl.exe`/PowerShell hit a TLS handshake failure against the preview alias while Node and Chromium succeeded; retest browsers and the final custom domain before public launch. |
| 2026-07-04T20:35:49-06:00 | `bash scripts/governance-preflight.sh`; `npm audit --audit-level=moderate`; `npm run test:scripts`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `npx playwright test`; `git diff --check` | passed with existing build warning | D8 close-out validation passed. Governance reported 0 warnings; audit found 0 vulnerabilities; Node script tests passed 4 tests; Vitest passed 12 files and 88 tests; production build passed with the existing 519.84 kB chunk-size warning; web RC scan found no release-blocking findings; Playwright passed 6 Chromium tests; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T20:27:56-06:00 | `npm ci`; `npm audit --audit-level=moderate`; `npm run test:scripts`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `npx playwright test`; local production preview smoke at `http://127.0.0.1:5185/` | passed with existing build warning | D8 web release-candidate pass completed. Clean install passed after stale repo-owned Vite dev/preview servers were stopped; audit found 0 vulnerabilities; Node script tests passed 4 tests; Vitest passed 12 files and 88 tests; build passed with the existing 519.84 kB chunk-size warning; web RC scan found no release-blocking findings; Playwright passed 6 Chromium tests; local production preview served root, manifest, Apple icon, 192px icon, 512px icon, and service worker with install/fetch handlers and same-origin-only guard. |
| 2026-07-04T20:49:44-06:00 | `bash scripts/governance-preflight.sh`; URL recommendation text scan; `git diff --check` | passed | Corrected release documents after the owner clarified that `https://app.oldskoolai.com/` is not owned or confirmed. No deployment, DNS, Cloudflare, social, or website changes were made. |
| 2026-07-04T20:19:38-06:00 | `bash scripts/governance-preflight.sh`; official source review | passed | Governance preflight reported 0 warnings before D8 work. Cloudflare Pages Git integration, build configuration, preview deployments, custom domains, rollbacks, GitHub dependency/secret scanning, Dependabot, CodeQL, OWASP ASVS, and OWASP WSTG were reviewed. |
| 2026-07-04T16:30:17-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final D3 documentation close-out checks passed. Governance reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T16:25:09-06:00 | `npm run test -- domainSchemas`; `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:info`; `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:build`; `git diff --check` | passed | D3 trust-boundary validation passed. Focused schema suite passed with 1 file and 8 tests; full suite passed with 11 files and 83 tests; web build passed with the existing Vite chunk-size warning; audit found 0 vulnerabilities; governance passed with 0 warnings; Tauri info saw the explicit CSP and all desktop prerequisites after the current shell PATH included `.cargo\bin`; desktop no-bundle build produced the release executable; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T16:25:09-06:00 | release executable launch smoke test after D3 rebuild; `Get-AuthenticodeSignature`; Windows Code Integrity log review | blocked | The rebuilt unsigned `src-tauri\target\release\ai-task-router-desktop.exe` was blocked by Windows Application Control. Signature check reports unsigned; SHA-256 `079EF12762D987A877146E6051B32A1E2ED9BC42507B020959F00F2793C7512B`; Code Integrity event IDs `3033` and `3077` cite policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}`. |
| 2026-07-04T16:09:09-06:00 | `npm run desktop:info`; `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `npm run desktop:build`; `git diff --check` | passed | Final D2 prerequisite retry close-out checks passed. Desktop info reported all environment checks green; full unit suite passed with 11 files and 81 tests; web build passed with the existing Vite chunk-size warning; audit found 0 vulnerabilities; governance passed with 0 warnings; desktop no-bundle build produced the release executable; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T16:04:28-06:00 | `winget install --id Rustlang.Rustup --exact --source winget --accept-package-agreements --accept-source-agreements --silent`; `winget install --id Microsoft.VisualStudio.2022.BuildTools --exact --source winget --accept-package-agreements --accept-source-agreements --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"` | passed | Installed Rustup `1.29.0`, Rust/Cargo `1.96.1`, Visual Studio Build Tools 2022 `17.14.35`, MSVC `14.44.35207`, and Windows SDK `10.0.26100.0`. |
| 2026-07-04T16:04:28-06:00 | `npm run desktop:info`; `cargo metadata --manifest-path src-tauri/Cargo.toml --format-version 1 --no-deps`; `npm run desktop:build` | passed | Tauri environment checks passed; Cargo metadata passed; no-bundle release build produced `src-tauri\target\release\ai-task-router-desktop.exe`. |
| 2026-07-04T16:04:28-06:00 | release executable launch smoke test | passed | Started `src-tauri\target\release\ai-task-router-desktop.exe`, confirmed it stayed running after 12 seconds with main window title `AI Task Router`, then stopped it cleanly. |
| 2026-07-04T16:04:28-06:00 | `npm run desktop:dev`; `cargo build --manifest-path src-tauri/Cargo.toml`; Windows Code Integrity log review | blocked | Vite reached port `5173`, but Cargo debug build failed because Windows Application Control blocked generated `build-script-build.exe`; Code Integrity event IDs `3033` and `3077`, policy ID `{0283AC0F-FFF1-49AE-ADA1-8A933130CAD6}`. |
| 2026-07-04T15:43:13-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final D2 scaffold close-out checks passed. Full unit suite passed with 11 files and 81 tests; production web build passed with the existing Vite chunk-size warning; audit found 0 vulnerabilities; governance passed with 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T15:35:38-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before adding the D2 Tauri shell scaffold; timestamp captured. |
| 2026-07-04T15:35:38-06:00 | `npm install --save-dev @tauri-apps/cli@2.11.4`; `npx tauri init ...`; `npx tauri icon src-tauri/icon-source.svg` | passed | Added the Tauri CLI, initialized the `src-tauri` shell scaffold against the existing Vite app, and generated branded desktop icon assets from the Guided AI Labs mark. |
| 2026-07-04T15:35:38-06:00 | `npm run desktop:info` | partial | Tauri parsed the project and found WebView2, but reported missing Visual Studio/MSVC Build Tools, Rust, Cargo, rustup, and Rust toolchain. |
| 2026-07-04T15:35:38-06:00 | `npm run test`; `npm audit --audit-level=moderate`; `npm run build` | passed | Full unit suite passed with 11 files and 81 tests; audit found 0 vulnerabilities; browser production build passed with the existing Vite chunk-size warning. |
| 2026-07-04T15:35:38-06:00 | `npm run desktop:build` | blocked | Desktop no-bundle build failed before compilation because `cargo metadata` could not run: `cargo` is not installed. |
| 2026-07-04T15:22:04-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; stale desktop-plan path `rg` check; file presence check | passed | Date-first working-document correction passed. Governance reported 0 warnings; whitespace check had only normal Windows line-ending notices; stale `docs/desktop-trust-distribution-plan.md` links were not found; the new dated plan exists and the old undated plan path does not. |
| 2026-07-04T14:58:04-06:00 | stale desktop handoff `rg` check | passed | Corrected an older handoff sentence that still pointed back to Desktop Chunk D0 after D1 completion. |
| 2026-07-04T14:56:49-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; stale D0/D1 `rg` check | passed | Final Desktop Chunk D1 close-out validation passed. Governance reported 0 warnings; whitespace check had only normal Windows line-ending notices; stale D0 waiting/D1-not-started wording was not found. |
| 2026-07-04T14:51:54-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before confirming Desktop Chunk D0 for planning and creating the Desktop Chunk D1 ADR; timestamp captured. |
| 2026-07-04T11:35:38-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; D0/doc-control `rg` check | passed | Final document-control and Desktop Chunk D0 validation passed; governance found the new required standard, whitespace check had only normal Windows line-ending notices, and D0 references no longer point to opening D0 later. |
| 2026-07-04T11:28:22-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before adopting the document-control standard and opening Desktop Chunk D0; timestamp captured. |
| 2026-07-04T11:17:43-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before adding the desktop trust/distribution planning baseline; timestamp captured. |
| 2026-07-04T11:17:43-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; placeholder `rg` search | passed | Final planning validation passed with 0 governance warnings and no whitespace errors; placeholder search returned no matches. |
| 2026-07-03T11:16:47-06:00 | `git status --short` | failed | Folder was not a Git repository at session start. |
| 2026-07-03T11:35:41-06:00 | `bash scripts/governance-preflight.sh` | failed | `project-control.yaml` had invalid checker values before charter alignment. |
| 2026-07-03T11:35:41-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings after charter alignment. |
| 2026-07-03T11:35:41-06:00 | `git status --short` | failed | Still not a Git repository, so commit/push close-out cannot run yet. |
| 2026-07-03T11:35:41-06:00 | `rg -n "agent-picker|AI agent with tools|Agent Picker|autonomous" ...` | passed with expected boundary mentions | No stale Agent Picker identity found in updated planning files; remaining autonomous references state the no-agent boundary. |
| 2026-07-03T11:49:34-06:00 | document-control timestamp pass | passed | Markdown H1 titles and real `Status:` metadata lines received timestamp fields. |
| 2026-07-03T11:49:34-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Git initialization. |
| 2026-07-03T11:51:11-06:00 | `git init -b main`; `git commit`; `gh repo create ai-task-router --public --push` | passed | Created public repository `Adamgdwn/ai-task-router` and pushed `main`. |
| 2026-07-03T11:51:11-06:00 | `gh repo view Adamgdwn/ai-task-router --json nameWithOwner,visibility,url,defaultBranchRef` | passed | Confirmed visibility `PUBLIC`, default branch `main`. |
| 2026-07-03T11:54:20-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before scaffold work. |
| 2026-07-03T11:58:27-06:00 | `npm install` | passed | Generated `package-lock.json`; initial older Vitest line reported audit findings, then dependencies were upgraded. |
| 2026-07-03T11:58:27-06:00 | `npm audit --audit-level=moderate` | passed | Found 0 vulnerabilities after toolchain upgrade. |
| 2026-07-03T11:58:27-06:00 | `npm run test` | passed | Vitest smoke test passed: 1 file, 1 test. |
| 2026-07-03T11:58:27-06:00 | `npm run build` | passed | First build exposed missing CSS import declaration; passed after adding `src/vite-env.d.ts`; final script uses `tsc --noEmit` to avoid generated config artifacts. |
| 2026-07-03T11:58:27-06:00 | manual local app start check | passed | Vite returned HTTP 200 at `http://127.0.0.1:5173` and page content contained `AI Task Router`. |
| 2026-07-03T12:07:56-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Chunk Two schema work. |
| 2026-07-03T12:10:23-06:00 | `npm audit --audit-level=moderate` | passed | Found 0 vulnerabilities after adding Zod. |
| 2026-07-03T12:10:23-06:00 | `npm run test -- domainSchemas` | passed | Domain schema suite passed: 1 file, 6 tests. |
| 2026-07-03T12:10:23-06:00 | `npm run build` | passed | TypeScript and Vite production build passed after tightening typed test fixtures. |
| 2026-07-03T12:12:50-06:00 | `npm run test`; `npm run build`; `bash scripts/governance-preflight.sh` | passed | Full suite passed: 2 files, 7 tests; production build passed; governance check passed with 0 warnings. |
| 2026-07-03T12:20:24-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Chunk Three default registry work. |
| 2026-07-03T12:23:53-06:00 | `npm audit --audit-level=moderate` | passed | Found 0 vulnerabilities during Chunk Three validation. |
| 2026-07-03T12:23:53-06:00 | `npm run test -- defaultRegistries` | passed | Default registry suite passed: 1 file, 8 tests. |
| 2026-07-03T12:23:53-06:00 | `npm run test` | passed | Full suite passed: 3 files, 15 tests. |
| 2026-07-03T12:23:53-06:00 | `npm run build` | passed | TypeScript and Vite production build passed after tightening test helper typing. |
| 2026-07-03T12:28:19-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before expanding remaining build chunks. |
| 2026-07-03T12:28:19-06:00 | pathway planning expansion | passed | Chunks Four through Sixteen were expanded with detailed objectives, boundaries, acceptance criteria, tests, rollback paths, stop conditions, and handoffs. |
| 2026-07-03T12:43:29-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Chunk Four hard-gate implementation. |
| 2026-07-03T12:47:24-06:00 | `npm run test -- hardGates` | passed | Hard-gate suite passed: 1 file, 11 tests. |
| 2026-07-03T12:47:24-06:00 | `npm run test` | passed | Full unit suite passed after Chunk Four. |
| 2026-07-03T12:47:24-06:00 | `npm run build` | passed | TypeScript and Vite production build passed after tightening table fixture typing. |
| 2026-07-03T14:00:37-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Chunk Five route candidate generation. |
| 2026-07-03T14:08:55-06:00 | `npm run test -- routeCandidates` | passed | Route candidate suite passed: 1 file, 6 tests covering public writing, confidential synthesis, current-facts research, artifact packaging, public-facing draft, and highly restricted fallback. |
| 2026-07-03T14:08:55-06:00 | `npm run build` | passed | TypeScript and Vite production build passed after tightening permission-level typing. |
| 2026-07-03T14:08:55-06:00 | `npm run test` | passed | Full unit suite passed: 5 files, 32 tests. |
| 2026-07-03T14:08:55-06:00 | `git diff --check` | passed | No whitespace errors; Git printed normal Windows LF-to-CRLF notices. |
| 2026-07-03T14:37:52-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Chunk Six scoring engine work. |
| 2026-07-03T14:44:17-06:00 | `npm run test -- routeScoring` | passed | Route scoring suite passed: 1 file, 7 tests covering scoring components, policy shifts, warning penalties, no-candidate states, unavailable strategies, source fit, and tie-breakers. |
| 2026-07-03T14:44:17-06:00 | `npm run test` | passed | Full unit suite passed: 6 files, 39 tests. |
| 2026-07-03T14:44:17-06:00 | `npm run build` | passed | TypeScript and Vite production build passed after adding the scoring engine. |
| 2026-07-03T14:47:01-06:00 | `bash scripts/governance-preflight.sh`; `npm run test -- routeScoring`; `npm run test`; `npm run build`; `git diff --check` | passed | Final Chunk Six close-out checks passed; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-03T14:52:37-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Chunk Seven route-card generator work. |
| 2026-07-03T14:56:22-06:00 | `npm run test -- routeCardGenerator` | passed | Route card generator suite passed: 1 file, 5 tests covering schema-valid cards, blocked routes, warnings, human approval visibility, manual fallback, and prompt-package task mismatch. |
| 2026-07-03T14:56:22-06:00 | `npm run build` | passed | TypeScript and Vite production build passed after adding the route-card generator. |
| 2026-07-03T15:00:18-06:00 | `bash scripts/governance-preflight.sh`; `npm run test -- routeCardGenerator`; `npm run test`; `npm run build`; `git diff --check` | passed | Final Chunk Seven close-out checks passed; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-03T15:13:17-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance check passed with 0 warnings before Chunk Eight prompt-package generator work. |
| 2026-07-03T15:18:43-06:00 | `npm run test -- promptPackageGenerator` | passed | Prompt package generator suite passed: 1 file, 7 tests covering selected routes, current facts, citations, blocked sources, human approval, no-source routes, highly restricted fallback, and route-card attachment. |
| 2026-07-03T15:18:50-06:00 | `npm run build` | passed | TypeScript and Vite production build passed after adding the prompt package generator. |
| 2026-07-03T15:18:58-06:00 | `npm run test` | passed | Full unit suite passed: 8 files, 51 tests. |
| 2026-07-03T15:19:08-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final Chunk Eight close-out checks passed with 0 governance warnings and no whitespace errors. |
| 2026-07-03T17:13:33-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before Chunk Nine local persistence work; work timestamp captured. |
| 2026-07-03T17:19:32-06:00 | `npm install dexie && npm install --save-dev fake-indexeddb`; `npm audit --audit-level=moderate` | passed | Added Dexie for local IndexedDB persistence and fake-indexeddb for tests; audit found 0 vulnerabilities. |
| 2026-07-03T17:19:32-06:00 | `npm run test -- storage` | passed | Storage local store suite passed: 1 file, 7 tests covering seed, no-overwrite seed, save/load/update/reset, reseed, validation failure, and missing feedback target. |
| 2026-07-03T17:19:32-06:00 | `npm run test`; `npm run build`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Full unit suite passed: 9 files, 58 tests; TypeScript and Vite production build passed; governance check passed with 0 warnings; whitespace check only printed normal Windows LF-to-CRLF notices. |
| 2026-07-03T17:37:53-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before Chunk Ten export/import work; work timestamp captured. |
| 2026-07-03T17:44:01-06:00 | `npm run test -- exportImport` | passed | Export/import utility suite passed: 1 file, 7 tests covering schema-versioned JSON round trips, Markdown output, CSV headers and escaping, invalid JSON, unknown versions, schema-invalid imports, unexpected artifact kinds, and no hidden telemetry fields. |
| 2026-07-03T17:44:01-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Full unit suite passed: 10 files, 65 tests; TypeScript and Vite production build passed; audit found 0 vulnerabilities; governance check passed with 0 warnings; whitespace check passed. |
| 2026-07-03T19:24:21-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before Chunk Eleven setup UI work; work timestamp captured. |
| 2026-07-03T19:34:35-06:00 | `npm run test -- App storageLocalStore`; `npm run build` | passed | Focused setup UI/storage checks passed: 2 files, 11 tests; TypeScript and Vite production build passed. |
| 2026-07-03T19:34:35-06:00 | manual Playwright browser check using system Chrome at `http://127.0.0.1:5173` | passed | Desktop and mobile setup navigation, local persistence after refresh, and horizontal overflow checks passed. |
| 2026-07-03T19:36:52-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Full unit suite passed: 10 files, 68 tests; TypeScript and Vite production build passed; audit found 0 vulnerabilities; governance check passed with 0 warnings; whitespace check passed with normal Windows LF-to-CRLF notices. |
| 2026-07-03T19:48:36-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before Guided AI Labs brand polish detour; work timestamp captured. |
| 2026-07-03T19:54:49-06:00 | `npm run test -- App`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5173` | passed | App test passed: 1 file, 3 tests; TypeScript and Vite production build passed; desktop and mobile browser checks confirmed local logo load, branded title, setup navigation, and no horizontal overflow. |
| 2026-07-03T19:58:35-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Full unit suite passed: 10 files, 68 tests; TypeScript and Vite production build passed; audit found 0 vulnerabilities; governance check passed with 0 warnings; whitespace check passed with normal Windows LF-to-CRLF notices. |
| 2026-07-03T20:50:51-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before Chunk Twelve task intake/results UI work; work timestamp captured. |
| 2026-07-03T21:03:52-06:00 | `npm run test -- App`; `npm run test`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5174` | passed | App test passed: 1 file, 6 tests; full unit suite passed: 10 files, 71 tests; TypeScript and Vite production build passed; browser check covered public writing, current-facts research, public-facing copy, highly restricted fallback, local save, desktop/mobile layout, and no horizontal overflow. |
| 2026-07-03T21:05:56-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final Chunk Twelve close-out validation passed: 10 files and 71 tests, production build, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-03T21:59:53-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before Chunk Thirteen route-card/prompt-package UI work; work timestamp captured. |
| 2026-07-03T22:08:42-06:00 | `npm run test -- App`; `npm run test`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5175` | passed | App test passed: 1 file and 9 tests; full unit suite passed: 10 files and 74 tests; TypeScript and Vite production build passed; browser check covered saved route card viewing, saved prompt package viewing, local Markdown download links, desktop/mobile layout, screenshots, and no horizontal overflow. |
| 2026-07-03T22:10:56-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final Chunk Thirteen close-out validation passed: 10 files and 74 tests, production build, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-03T23:40:53-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before the conversational usability detour; work timestamp captured. |
| 2026-07-03T23:51:11-06:00 | `npm run test -- App` | passed | Focused App suite passed with 1 file and 9 tests after translating setup, task, result, and artifact UI labels. |
| 2026-07-03T23:54:46-06:00 | `npm run test`; `npm run build` | passed | Full unit suite passed with 10 files and 74 tests; TypeScript and Vite production build passed after plain-language default model labels. |
| 2026-07-03T23:55:54-06:00 | manual Playwright browser check using system Chrome at `http://127.0.0.1:5176` | passed | Browser walkthrough covered Start Here, My AI Tools, Information Comfort, Choosing Style, My Task, Best Options, Decision Card, Copy-Ready Prompts, desktop/mobile screenshots, and no horizontal overflow. |
| 2026-07-03T23:58:41-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final usability detour close-out validation passed: 10 files and 74 tests, production build, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T00:12:28-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before Chunk Fourteen route-log and feedback UI work; work timestamp captured. |
| 2026-07-04T00:19:28-06:00 | `npm run test -- App` | passed | Focused App suite passed with 1 file and 11 tests after adding Past Choices, local feedback editing, route-log save creation, and saved-card reopening. |
| 2026-07-04T00:23:54-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh` | passed | Full unit suite passed with 10 files and 76 tests; TypeScript and Vite production build passed; audit found 0 vulnerabilities; governance preflight passed with 0 warnings. |
| 2026-07-04T00:24:26-06:00 | manual Playwright browser check using system Chrome at `http://127.0.0.1:5177` | passed | Browser walkthrough covered saving a plan, Past Choices list, search no-match, outcome filtering, feedback save acknowledgement, opening a decision card, mobile layout screenshots, and no horizontal overflow. |
| 2026-07-04T00:26:37-06:00 | `git diff --check` | passed | Whitespace check passed; output only included normal Windows LF-to-CRLF notices. |
| 2026-07-04T00:32:20-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before the plain-language intake reset; work timestamp captured. |
| 2026-07-04T00:42:00-06:00 | `npm run test -- App` | passed | Focused App suite passed with 1 file and 11 tests after rebuilding My AI Tools, What To Include, My Task, and Best Options language. |
| 2026-07-04T00:43:07-06:00 | `npm run test` | passed | Full unit suite passed with 10 files and 76 tests after updating default-label expectations. |
| 2026-07-04T00:46:15-06:00 | `npm run test -- App`; `npm run build`; `npm audit --audit-level=moderate` | passed | Focused App suite, TypeScript/Vite production build, and audit passed after final What To Include and result-copy cleanup; audit found 0 vulnerabilities. |
| 2026-07-04T00:48:18-06:00 | manual Playwright browser check using system Chrome at `http://127.0.0.1:5178` | passed | Browser walkthrough covered My AI Tools, What To Include, My Task, Best Options, desktop/mobile screenshots, no horizontal overflow, and no primary-result leakage of Policy, permission-level, or raw score wording. |
| 2026-07-04T00:53:25-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final detour close-out validation passed: 10 files and 76 tests, production build, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T08:26:28-06:00 | `bash scripts/governance-preflight.sh`; `bash -lc "date -Iseconds"` | passed | Governance check passed with 0 warnings before the My AI Tools dropdown cleanup detour; work timestamp captured. |
| 2026-07-04T08:35:18-06:00 | `npm run test -- App` | passed | Focused App suite passed with 1 file and 11 tests after replacing My AI Tools text/subscription controls with provider/model/thinking dropdowns. |
| 2026-07-04T08:36:12-06:00 | `npm run test`; `npm run build` | passed | Full unit suite passed with 10 files and 76 tests; TypeScript/Vite production build passed after preserving default route behavior. |
| 2026-07-04T08:38:31-06:00 | manual Playwright browser check using system Chrome at `http://127.0.0.1:5179` | passed | Browser check covered My AI Tools dropdown behavior, What To Include extra-settings label, desktop/mobile screenshots, no horizontal overflow, and no old My AI Tools leakage of subscription/tier/details wording. |
| 2026-07-04T08:41:24-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Final dropdown cleanup close-out validation passed: 10 files and 76 tests, production build, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T09:03:11-06:00 | `npm run test -- App`; `npm run test`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5180`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Progressive My AI Tools app setup close-out validation passed: focused App suite 1 file and 11 tests, full unit suite 10 files and 76 tests, production build, browser checks for app/account/frequency rows and desktop/mobile overflow, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T09:18:42-06:00 | `npm run test -- App`; `npm run test -- storageLocalStore`; `npm run test`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5180`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Sparse selector correction passed: App suite 1 file and 12 tests, storage suite 1 file and 9 tests, full unit suite 10 files and 78 tests, production build, deliberate stale five-row IndexedDB browser migration to one `Tool selection`, Genspark selection, automatic next row, mobile overflow check, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T09:40:46-06:00 | `npm run test -- App everydayToolCatalog`; `npm run detect:local-models`; `npm run test`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5181`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Manual-add/local-model detour passed: focused suite 2 files and 14 tests, local detector summary with no model-name details, full unit suite 11 files and 80 tests, production build, browser checks for one starter row, no automatic second row after ChatGPT selection, branded add button, provider-specific account options, Local model dropdown, desktop/mobile overflow, screenshots, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T10:00:43-06:00 | `npm run test -- App everydayToolCatalog`; `npm run test`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5182`; `npm run detect:local-models`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Tailored account-level detour passed: focused suite 2 files and 15 tests, full unit suite 11 files and 81 tests, production build with existing Vite chunk-size warning, browser checks for researched account labels, long dropdown values, three selected rows, remove button behavior, selected-count update, desktop/mobile layout, no selected-chip wrapping, no horizontal overflow, detector summary only, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T10:20:07-06:00 | `npm run test -- App`; `npm run test`; `npm run build`; manual Playwright browser check using system Chrome at `http://127.0.0.1:5183`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Contextual task-include detour passed: focused App suite 1 file and 12 tests, full unit suite 11 files and 81 tests, production build with existing Vite chunk-size warning, browser checks for no standalone What To Include navigation, Start Here's three-step path, My Task optional include question, Nothing specific default/clear behavior, desktop/mobile layout, no horizontal overflow, 0 audit vulnerabilities, 0 governance warnings, and no whitespace errors; `git diff --check` only printed normal Windows LF-to-CRLF notices. |
| 2026-07-04T18:16:13-06:00 | `npm run test -- App`; `npm run test`; `npm run build`; `cargo test --manifest-path src-tauri\Cargo.toml --lib --release`; `cargo test --manifest-path src-tauri\Cargo.toml --lib --release --no-run`; `cargo fmt --manifest-path src-tauri\Cargo.toml --check`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `npm run desktop:info`; `npm run desktop:build`; `git diff --check` | passed with App Control launch/test-executable blocker | Desktop Chunk D4 validation passed for focused App suite 1 file and 13 tests, full unit suite 11 files and 84 tests, production build with existing Vite chunk-size warning, earlier Rust discovery test execution 4 passed, final Rust no-run compile, Rust format check, audit with 0 vulnerabilities, governance preflight with 0 warnings, Tauri environment check after prepending `C:\Users\adamg\.cargo\bin`, no-bundle desktop build to `src-tauri\target\release\ai-task-router-desktop.exe`, and whitespace check with only normal Windows LF-to-CRLF notices. Final Rust test executable launch and interactive desktop launch smoke remain blocked by the unresolved Windows Application Control policy. |
| 2026-07-04T18:41:17-06:00 | `npm run test -- App pwaServiceWorker`; `node --check public\service-worker.js`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `npm run test`; `npm run build`; local production preview at `http://127.0.0.1:5184/` | passed | Desktop Chunk D5 validation passed: focused App/PWA suite 2 files and 17 tests, service-worker syntax check, audit with 0 vulnerabilities, governance preflight with 0 warnings, full unit suite 12 files and 88 tests, production build with existing Vite chunk-size warning, build output included `manifest.webmanifest`, `service-worker.js`, and 192px/512px PWA icons, and local preview served the manifest link, Apple icon link, manifest name `AI Task Router | Guided AI Labs`, standalone display, start URL `/`, two icons, both icon URLs, service worker, and install/fetch handlers. |
| 2026-07-04T19:12:31-06:00 | `bash scripts/governance-preflight.sh`; `node --check scripts\inspect-desktop-artifacts.mjs`; JSON parse check for `package.json` and `src-tauri/tauri.internal-windows.conf.json`; `npm run desktop:artifacts`; `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:package:windows:internal`; `Get-AuthenticodeSignature`; `npm run test:scripts` | passed with unsigned internal artifact | Desktop Chunk D6 validation passed: governance preflight reported 0 warnings; script/config syntax checks passed; pre-package artifact scan correctly found no artifacts; internal Windows NSIS build passed with `--no-sign`; generated `src-tauri\target\release\bundle\nsis\AI Task Router_0.2.0_x64-setup.exe`, size `1,990,042` bytes, SHA-256 `FF170B0B681AA1954881767524E805C005AF72402C5B0AE7FCB0AF8934AC3BFD`; `Get-AuthenticodeSignature` reported `NotSigned` for both installer and release executable; artifact helper Node tests passed with 2 tests. |
| 2026-07-04T19:20:30-06:00 | `npm run test`; `npm run test:scripts`; `node --check scripts\inspect-desktop-artifacts.mjs`; `node --check scripts\inspect-desktop-artifacts.node-test.mjs`; `npm run build`; `$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"; npm run desktop:build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `npm run desktop:artifacts`; `git diff --check` | passed | D6 close-out validation passed after renaming the Node-only script test away from Vitest collection: Vitest suite passed 12 files and 88 tests; Node script suite passed 2 tests; production web build passed with the existing Vite chunk-size warning; no-bundle desktop build passed; audit found 0 vulnerabilities; governance preflight reported 0 warnings; artifact inspection still reported SHA-256 `FF170B0B681AA1954881767524E805C005AF72402C5B0AE7FCB0AF8934AC3BFD`; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T19:34:29-06:00 | `bash scripts/governance-preflight.sh`; official source review | passed | D7 readiness startup passed with 0 governance warnings. GitHub Releases/Pages/HTTPS, Cloudflare Pages/custom domains, Microsoft code signing, OWASP ASVS/WSTG, Tauri capabilities, and RustSec references were reviewed before recording the release/security packet. |
| 2026-07-04T19:41:25-06:00 | `npm run test`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh`; `git diff --check` | passed | D7 close-out validation passed: Vitest suite passed 12 files and 88 tests; audit found 0 vulnerabilities; governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-04T20:02:34-06:00 | `bash scripts/governance-preflight.sh`; `npm run test`; `npm run build`; `npx playwright test`; `git diff --check` | passed | Chunk Fifteen close-out validation passed: governance preflight reported 0 warnings; Vitest suite passed 12 files and 88 tests; TypeScript/Vite production build passed with the existing chunk-size warning; Playwright ran 6 Chromium tests covering fixtures, first-run setup, My AI Tools, stale local-store migration, routing/artifacts/feedback, no-execution controls, and narrow-viewport overflow; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-05T09:01:13-06:00 | `bash scripts/governance-preflight.sh`; official source review; `npm run test -- impactEstimator`; `npm run test`; `npm run build`; `git diff --check` | passed with existing build warning | Impact estimator methodology validation passed: governance preflight reported 0 warnings; official pricing/environmental source review covered OpenAI, Anthropic, Google Gemini, Perplexity, Mistral, DeepSeek, xAI, Google Cloud AI impact, and Jegham et al.; focused estimator suite passed 1 file and 5 tests; full Vitest passed 13 files and 93 tests; production build passed with the existing 519.84 kB Vite chunk-size warning; whitespace check reported only normal Windows LF-to-CRLF notices. |

## Next Handoff

D15 impact estimator methodology is draft complete. The public launch master plan is [docs/2026-07-04-public-launch-master-plan.md](2026-07-04-public-launch-master-plan.md), the Old Skool AI hub handoff package is [docs/2026-07-04-old-skool-ai-hub-handoff.md](2026-07-04-old-skool-ai-hub-handoff.md), the Cloudflare production evidence packet is [docs/2026-07-05-cloudflare-production-launch-smoke.md](2026-07-05-cloudflare-production-launch-smoke.md), the public hub evidence packet is [docs/2026-07-05-public-hub-and-cross-site-link-smoke.md](2026-07-05-public-hub-and-cross-site-link-smoke.md), and the impact calculation backbone is [docs/2026-07-05-impact-estimator-methodology.md](2026-07-05-impact-estimator-methodology.md). The web/PWA app is live at `https://ai-task-router.pages.dev/`, the Old Skool AI hub is live at `https://oldskoolai.com/ai-task-router/`, and the public security route is live at `https://oldskoolai.com/security/`. Do not point public users at the D9 preview alias. Do not publish or share unsigned/unnotarized desktop artifacts with non-technical users. Do not create public GitHub Releases, custom-domain/DNS changes, public desktop downloads, social launch posts, updater flows, signing workflows, live pricing tables, or exact public savings claims without a separate approved chunk and release gate evidence.

Recommended next sequence: run an owner-approved social/video launch copy-review chunk using the D15 safe impact language, publish a reviewed methodology page, build a local-only opt-in estimator UI, or switch to a separate desktop trust/signing chunk. Keep desktop download buttons hidden or disabled until signing and safety checks pass. Resolve the Windows Application Control/signing/trusted-path blocker before claiming interactive desktop discovery smoke or controlled desktop beta readiness.

Preserve the conversational UX direction now covered by E2E: Start Here, My AI Tools with one generic `Tool selection` row, no automatic second row after app selection, branded `Add another tool` button, researched provider-specific account dropdowns, `Remove tool`, selected-count updates, no selected-chip wrapping, Local model choices, optional desktop-only `Check this computer`, stale five-row local-store migration, Genspark and broader app options, Choosing Style, My Task with the optional `Do you want to include anything specific?` question and `Nothing specific` default/clear behavior, Best Options, Decision Card, Copy-Ready Prompts, Past Choices, and saved-plan language. Keep `npm run detect:local-models` as a separate explicit local command. Do not reintroduce a standalone `What To Include` onboarding screen, source-permission, policy-default, model-tier, scoring-weight, raw-score, permission-level, subscription-level, capability-score, routing-category, technical-routing-details, DMAIC, internal task ID, reference-name, task-local-route, or app/model/thinking terminology in primary user flows. Do not expand local discovery into broad filesystem permissions, arbitrary shell/process execution, startup/background scans, user-supplied paths, provider account connections, credential storage, authentication, telemetry, remote sync, provider API calls, external destinations, automatic uploads, file indexing, feedback analytics, best-stack recommendation logic, packaging, signing, updater, or execution workflows without a separate approved chunk.
