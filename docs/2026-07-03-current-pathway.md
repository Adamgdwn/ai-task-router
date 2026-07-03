# 2026-07-03-current-pathway

Last Updated: 2026-07-03T14:08:55-06:00
Status: active
Status Updated: 2026-07-03T14:08:55-06:00
Owner: Technical Lead

> This is the live path from charter baseline to the v0.2 Local Web App MVP.

## Purpose

This document keeps AI Task Router work small, detailed, timestamped, testable, and easy to resume.

The current product source is [docs/PRODUCT_BRIEF.md](PRODUCT_BRIEF.md), derived from the uploaded coder build brief and Mermaid diagrams.

## Future Distribution Note

Reference only as of 2026-07-03T12:01:44-06:00: the likely future public hosting home is `oldskoolai.com`, with links planned from `guidedailabs.com` and `guidedaijourney.com`. Exact paths, placement, launch timing, deployment approach, and cross-site linking strategy are not decided yet.

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
4. Review `project-control.yaml` and open exceptions.
5. Capture a timestamp.
6. Work one detailed chunk only.
7. Update this pathway with status, validation, known gaps, and next action.

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
| Chunk Six scoring engine | active next | 2026-07-03T14:08:55-06:00 | Technical Lead | Score generated candidates with policy weights and select a recommended route without producing route cards yet. |
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

Status: active next
Status Updated: 2026-07-03T14:08:55-06:00

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

- [ ] Scores each unblocked candidate on a `0` to `100` scale.
- [ ] Applies policy default weights for least-resource, balanced, and quality-first modes.
- [ ] Incorporates task cost and energy preferences.
- [ ] Incorporates quality bar and knowledge work type fit using model capability scores.
- [ ] Penalizes routes that carry warnings without hiding those warnings.
- [ ] Uses least-resource-first tie-breakers when scores are equal or close enough to be ambiguous.
- [ ] Never recommends a blocked route.
- [ ] Returns transparent score components for later UI display.

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

Stop when route candidates can be scored and a recommendation can be selected in unit tests. Do not produce route cards in this chunk.

Handoff note:

Next chunk should assemble route cards from task intake, scored candidates, blocked routes, warnings, and prompt-package placeholders.

## Chunk Seven - Route Card Generator

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Creates a `RouteCard` that validates against `routeCardSchema`.
- [ ] Includes all generated route options that are safe to show.
- [ ] Sets `recommendedOptionId` to the selected scored candidate.
- [ ] Preserves hard-gate warnings and blocked route reasons.
- [ ] Includes task sensitivity class and task ID.
- [ ] Uses deterministic IDs where practical and a testable timestamp injection point.
- [ ] Handles no-safe-route cases with a clear manual-review route card.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test -- routeCardGenerator`
- `npm run build`
- Tests should validate route cards with `routeCardSchema.safeParse`.

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

Stop when route-card objects validate and tests pass. Do not build the prompt package generator or UI in this chunk.

Handoff note:

Next chunk should replace placeholder prompt package handling with a real deterministic prompt package generator.

## Chunk Eight - Prompt Package Generator

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Creates a `PromptPackage` that validates against `promptPackageSchema`.
- [ ] Includes one or more prompt steps aligned with the recommended route steps.
- [ ] Includes explicit expected output for each prompt step.
- [ ] Marks steps requiring human approval where public-facing risk, regulated, highly restricted, critical, or high-quality work requires it.
- [ ] Includes source-use reminders for allowed sources and excludes blocked sources.
- [ ] Includes current-facts and citation reminders when the task requires them.
- [ ] Avoids provider-specific prompt claims unless they come from user-configured inventory labels.

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

Stop when prompt packages validate and can be attached to route cards in tests. Do not add persistence or UI in this chunk.

Handoff note:

Next chunk should add local persistence for user inventory, source permissions, policy settings, route cards, prompt packages, route logs, and feedback.

## Chunk Nine - Local Persistence

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Adds Dexie only if it remains the selected IndexedDB dependency after dependency/audit check.
- [ ] Defines versioned local tables for inventories, sources, policy settings, route cards, prompt packages, route logs, and feedback-ready records.
- [ ] Seeds defaults only when no local user configuration exists.
- [ ] Validates loaded records against schemas before use.
- [ ] Surfaces validation failures as recoverable local errors.
- [ ] Provides clear reset/reseed functions for development and future UI.
- [ ] Includes tests for seed, save, load, update, validation failure, and reset behavior.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm install` if adding Dexie
- `npm audit --audit-level=moderate`
- `npm run test -- storage`
- `npm run build`

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

Stop when local storage APIs pass tests and build. Do not implement import/export or UI screens in this chunk.

Handoff note:

Next chunk should add explicit export/import utilities using the same schemas and local data shapes.

## Chunk Ten - Export And Import Functions

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Serializes a route card and prompt package to readable Markdown.
- [ ] Serializes configuration and route records to schema-versioned JSON.
- [ ] Serializes route logs to CSV-friendly text with stable headers.
- [ ] Validates imported JSON before returning usable data.
- [ ] Rejects malformed, unknown-version, or schema-invalid imports with actionable errors.
- [ ] Does not include secrets or hidden telemetry fields in any export format.
- [ ] Tests cover round-trip JSON, Markdown content, CSV headers, and invalid imports.

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

Stop when utility tests pass and no UI has been added. Do not implement setup screens in this chunk.

Handoff note:

Next chunk should build setup UI screens for tool inventory, source permissions, and policy defaults using local storage and existing domain modules.

## Chunk Eleven - Setup UI Screens

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Tool inventory screen lists default model/tool entries and lets users enable, disable, and edit key labels/capability assumptions.
- [ ] Tool inventory includes clear fields for free agents and paid subscriptions the user already has.
- [ ] Source permissions screen lets users set source permission levels and sensitivity allowances.
- [ ] Policy settings screen lets users choose least-resource, balanced, or quality-first defaults.
- [ ] Setup screens persist local changes through the storage API.
- [ ] UI copy reinforces that no provider connection or credential storage exists.
- [ ] Future best-stack prompt is represented only as a planning note or disabled/coming-later control, not functional logic.

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

Stop when setup screens are usable, local changes persist, tests/build pass, and task intake/results placeholders remain untouched.

Handoff note:

Next chunk should replace task intake and results placeholders using the routing modules already built.

## Chunk Twelve - Task Intake And Results UI

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Task intake form captures all required `taskIntakeSchema` fields.
- [ ] Form uses default task templates where helpful without hiding advanced fields.
- [ ] Validation errors are displayed near the relevant fields.
- [ ] Results screen shows lean, balanced, premium, and recommended route states.
- [ ] Results screen shows warnings and blocked routes clearly.
- [ ] Routing runs entirely in the browser from local inputs and stored configuration.
- [ ] User can save a generated route card/prompt package locally if storage is ready.
- [ ] Empty, invalid, no-safe-route, and success states are handled.

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

Rollback or recovery path:

The UI can fall back to placeholder screens while domain modules remain intact. Keep UI orchestration separate enough to debug routing without React.

Stop condition:

Stop when intake and results are usable and verified. Do not implement full route card/prompt package screens in this chunk.

Handoff note:

Next chunk should build the route card and prompt package viewing/copy/export-prep UI.

## Chunk Thirteen - Route Card And Prompt Package UI

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Route card screen shows recommended route, alternatives, scores/tradeoffs, warnings, blocked routes, and created timestamp.
- [ ] Prompt package screen shows ordered prompt steps, input refs, expected output, and approval requirements.
- [ ] User can copy prompt step text or prepared Markdown locally if browser support is straightforward.
- [ ] Local download/export preparation uses Chunk Ten utilities if available.
- [ ] Screens handle missing/deleted route card IDs gracefully.
- [ ] Human approval requirements remain visible near the relevant prompt steps.

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

Stop when route card and prompt package screens are usable and verified. Do not add route log feedback UI in this chunk.

Handoff note:

Next chunk should build route log and feedback workflows for saved recommendations.

## Chunk Fourteen - Route Log And Feedback UI

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Route log screen lists saved route decisions with task title, selected strategy, outcome, and timestamp.
- [ ] User can filter or sort enough to find recent decisions.
- [ ] User can add or edit feedback outcome and optional rating/notes.
- [ ] Feedback validates against `routeLogEntrySchema` or a clearly documented schema extension.
- [ ] User can open a saved route card from the log.
- [ ] Empty log and local storage error states are handled.
- [ ] No feedback leaves the browser.

Test expectations:

- `bash scripts/governance-preflight.sh`
- `npm run test`
- `npm run build`
- Manual local app check for creating, editing, filtering, and reopening route log entries.

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

Stop when route log and feedback flows are usable and verified. Do not move into E2E coverage expansion in this chunk.

Handoff note:

Next chunk should add end-to-end tests and fixture coverage for the MVP acceptance scenarios.

## Chunk Fifteen - E2E Tests And Fixture Suite

Status: planned
Status Updated: 2026-07-03T12:28:19-06:00

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

- [ ] Adds at least 20 fixture tasks covering public, internal, confidential, regulated, highly restricted, public-facing risk, current-facts, citation, coding, writing, planning, packaging, and review scenarios.
- [ ] Adds E2E coverage for first-run setup or seeded defaults.
- [ ] Adds E2E coverage for task intake to route results.
- [ ] Adds E2E coverage for route card and prompt package viewing.
- [ ] Adds E2E coverage for saving a route log entry and adding feedback.
- [ ] Adds E2E coverage for export-preparation behavior if UI exists.
- [ ] Adds a boundary test that no "execute", "connect account", or provider-send workflow is present.
- [ ] E2E tests are deterministic and do not require external network calls after dependencies are installed.

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

Next chunk should polish the MVP, update user/operator docs, and prepare a v0.2 release-readiness review.

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

After this chunk, decide whether to run a release-readiness review, plan future hosting on `oldskoolai.com`, or open a v0.3 pathway for best-stack recommendation mode.

## Validation Log

| Timestamp | Command | Result | Notes |
|-----------|---------|--------|-------|
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

## Next Handoff

Resume from Chunk Six only: score generated route candidates using policy weights, task preferences, quality needs, source fit, sensitivity fit, cost, energy, and speed. Select a recommended route with transparent score components. Do not generate route cards, prompt packages, persistence, exports, UI forms, external calls, provider connections, telemetry, or live provider cost lookups in that chunk.

