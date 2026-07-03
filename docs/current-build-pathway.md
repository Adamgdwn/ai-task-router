# 2026-07-03T11:58:27-06:00 - Current Build Pathway

Last Updated: 2026-07-03T11:35:41-06:00
Status: active
Status Updated: 2026-07-03T11:58:27-06:00
Owner: Technical Lead

> This is the live path from charter baseline to the v0.2 Local Web App MVP.

## Purpose

This document keeps AI Task Router work small, detailed, timestamped, testable, and easy to resume.

The current product source is [docs/PRODUCT_BRIEF.md](PRODUCT_BRIEF.md), derived from the uploaded coder build brief and Mermaid diagrams.

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
| Chunk 1 domain schemas | active next | 2026-07-03T11:58:27-06:00 | Technical Lead | Implement core types and Zod schemas after the skeleton exists. |
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
- `docs/current-build-pathway.md`
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

Status: planned
Status Updated: 2026-07-03T11:49:34-06:00

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

- [ ] Permission level accepts only `0 | 1 | 2 | 3 | 4`.
- [ ] Sensitivity class accepts only the product-defined values.
- [ ] Task intake schema validates a representative valid task.
- [ ] Task intake schema rejects invalid sensitivity and invalid permission references.
- [ ] Route card schema validates a representative route card.
- [ ] Route option, route step, prompt step, and route log entry schemas are covered.
- [ ] Types infer cleanly from schemas or schemas are aligned with explicit interfaces.

Test expectations:

- `npm run test -- domainSchemas`
- `npm run build`

Security and privacy notes:

Runtime schemas are the first trust boundary for imported/exported config and route records. Validation errors should be clear enough for future UI display.

Rollback or recovery:

Schema-only changes can be reverted before routing logic depends on them.

Stop condition:

Stop when schemas and tests pass. Do not add seed registries in this chunk.

## Chunk Three - Default Registries And Policy Seeds

Status: planned
Status Updated: 2026-07-03T11:49:34-06:00

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

- [ ] Default models load and validate against schemas.
- [ ] Each enabled model has capability scores.
- [ ] Human/manual review is always available as a final approval route step.
- [ ] Default source registry includes local files, uploaded docs, web, GitHub, M365/SharePoint, Google Drive, personal memory, and other.
- [ ] Default policies include least-resource, balanced, and quality-first scoring weights.
- [ ] Tests reject duplicate IDs.
- [ ] Tests confirm no seed item requires credentials or external calls.

Test expectations:

- `npm run test -- defaultRegistries`
- `npm run build`

Stop condition:

Stop when all seed data validates and no routing behavior has been implemented.

## Later Planned Chunks

These will be expanded with the same level of detail before execution:

- Chunk Four - Hard Gates
- Chunk Five - Route Candidate Generation
- Chunk Six - Scoring Engine
- Chunk Seven - Route Card Generator
- Chunk Eight - Prompt Package Generator
- Chunk Nine - Local Persistence
- Chunk Ten - Export And Import Functions
- Chunk Eleven - Setup UI Screens
- Chunk Twelve - Task Intake And Results UI
- Chunk Thirteen - Route Card And Prompt Package UI
- Chunk Fourteen - Route Log And Feedback UI
- Chunk Fifteen - E2E Tests And Fixture Suite
- Chunk Sixteen - MVP Polish And Documentation

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

## Next Handoff

Resume from Chunk Two only: implement TypeScript domain types and Zod schemas from the product brief. Do not add seed registries, routing behavior, persistence, exports, or external calls in that chunk.

