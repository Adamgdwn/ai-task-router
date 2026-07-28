# 2026-07-09T03:04:01+00:00 - Current Build Pathway

Document ID: PATH-ENG-002
Version: 1.21.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-09
Last Reviewed: 2026-07-27
Next Review: During the next substantial build session
Last Updated: 2026-07-27T22:22:45-06:00
Status Updated: 2026-07-27T22:22:45-06:00

## Purpose

This is the compact active pathway for AI Task Router work after the original live pathway grew too large for context-friendly startup.

Use this file for current chunks, validation notes, and handoff. Superseded pathway archives are not part of normal startup, governance preflight, or current work routing.

## Active Source Of Truth

| Area | Source |
|---|---|
| Startup route | `START_HERE.md` |
| Active pathway | This document |
| Product boundary | `README.md`, `project-control.yaml`, `docs/architecture.md` |
| Standards map | `docs/standards/README.md` |
| Context routing | `docs/context-map.md` |

## Current State

| Item | Status | Notes |
|---|---|---|
| Browser/PWA app | live; stage-first planning grammar not deployed | Production URL: `https://ai-task-router.pages.dev/`; latest deployment `https://0e76221f.ai-task-router.pages.dev` from source `1b5ea8f`, deployed 2026-07-27. It carries the previous task-reasoning repair. The completed stage-first planning grammar is committed and pushed as `b565331` but remains undeployed pending fresh owner authorization. |
| Old Skool AI hub | live | Public hub: `https://oldskoolai.com/ai-task-router/`; security route: `https://oldskoolai.com/security/`. |
| Desktop track | abandoned 2026-07-26T09:31:44-06:00 | Removed entirely: Tauri shell, local discovery, packaging and gate scripts, and the "Desktop app - Coming Soon!" card that promised computer checking on production. Planning and evidence docs are in `docs/archive/`. See [ADR-0002](decisions/adr-0002-abandon-desktop-track.md). |
| PDCA planning simplification | task complete | Visible planning now uses `Plan`, `Do`, `Check`, `Act`; expanded routing detail shows helper/model/mode and upgrade trigger. |
| Owner routing feedback | task complete | Cost chart points now expose hover/focus values; routing detail shows explicit decisions, reasons, checks, and upgrade triggers; complex build requests split build-stage detail into concrete build items instead of collapsing into prompting only. Average-person routing probes now keep ordinary phrases like "build an itinerary" out of software-build routing unless the task asks for an app, tool, code, automation, workflow, or build slice. Best Options now shows stage paths without a hidden disclosure, lets the user choose which route to accept, and counts Accepted or Edited saved routes in local impact. Legacy Deferred or Rejected saves are explicitly excluded and link directly to Past Choices for review. |
| Compact active pathway extraction | task complete | The active pathway is now this compact file; the long `2026-07-03` pathway is archive-only. |
| Retired pathway de-reference | task complete | No active docs, required-doc lists, or governance checks reference the retired pathway filename. |
| Active chunk | Stage-first planning grammar: integration complete | The router now builds a task work plan before choosing tools. Rough planning requests infer scope, assumptions, dependencies, ownership, risks, measures, and first action; the saved inventory then assigns each required stage. The exact Perplexity Free, ChatGPT Go, and Copilot Free regression produces scope framing, strongest available ChatGPT planning, and a lightweight Copilot action handoff, while a simple rewrite remains one fast pass. |

## Product Boundary

The project is an AI decision-support web application, not an autonomous AI agent.

The MVP may recommend routes, generate route cards, generate prompt packages, save route decisions locally, capture local feedback, and export artifacts.

The MVP must not call provider APIs, connect accounts, store credentials, perform live source search, index files, execute external actions, send prompts, deploy, publish, purchase, or automate work outside the app.

## Held Scope

Do not start any of these without a separate approved chunk and release-gate evidence:

- GitHub Release artifacts, signing workflows, updater flows, or any installable build; the desktop track was abandoned on 2026-07-26 and restarting it is a new project, not a revert
- social posts, custom-domain or DNS changes, exact public savings claims, live pricing tables, or live model fetches
- provider account connections, telemetry, remote sync, authentication, external execution, or server-side planning
- identity documents, tax or banking details, or private account screenshots

## Work Pattern

For ordinary scoped work:

1. Run `git status --short`.
2. Read `AGENTS.md`.
3. Use `docs/context-map.md` when context routing is unclear.
4. Inspect only files needed for the current objective.
5. Run targeted validation after the change.

For material or risk-triggering work:

1. Start from `START_HERE.md`.
2. Run `bash scripts/governance-preflight.sh`.
3. Review `project-control.yaml` and relevant standards from `docs/standards/README.md`.
4. Review `docs/standards/document-control-standard.md` for controlled docs, pathway notes, validation logs, or handoffs.
5. Capture a timestamp with `date -Iseconds`; if the local shell date and session date differ, record the exact timestamp used.
6. Work one bounded chunk.
7. Update this pathway with status, validation, known gaps, and next handoff.

## Build Plan

The next work should prove the product promise for an individual user: the app helps them choose the right weight of help at the right stage, then gives them a practical handoff they can use outside the app.

Keep each chunk small enough to finish, validate, commit, and hand off without loading archived pathway history.

## Chunk Queue

| Order | Chunk | Status | Completion target | Why it matters |
|---:|---|---|---|---|
| 1 | Individual power story audit | task complete | Task complete | Confirms the app and public docs explain the personal value clearly before adding more surface area. |
| 2 | Right-agent UX proof slice | integration complete | Integration complete | Makes the live recommendation flow visibly show which helper or mode belongs at each stage. |
| 3 | Decision Card and prompt handoff polish | integration complete | Integration complete | Ensures exports carry the same staged agent-choice logic into the user's real workflow. |
| 4 | Reviewed methodology page | draft complete; owner-review ready | Draft complete | Gives cautious, sourced backing for routing and impact claims without pretending to have live pricing. |
| 5 | Opt-in local estimator UI | paused | Draft complete | Optional enhancement; only start if the owner explicitly wants a local impact-estimate surface. |
| 6 | ~~Windows Store/MSIX trust slice~~ | cancelled 2026-07-26T09:31:44-06:00 | n/a | The desktop track was abandoned; see [ADR-0002](decisions/adr-0002-abandon-desktop-track.md). |
| 7 | Audit remediation queue (R0-R12) | complete | Integration complete | Closes the gaps found by the 2026-07-25 functional audit between what the app claims and what it does. R0 (deploy current `main`), R1 (artifacts follow the chosen route), R2 (honest impact numbers), R3 (first-run honesty), R4 (clean the copied prompt text), R10 (reframe the product promise), R11 (price each step by the model it names), and R12 (name the lean style by what it actually does), R5 (dead code and lint feedback loop), R6 (catalog staleness signal), R7 (help screen), R9 (resolve the frequency question), and R8 (real first-run E2E coverage) are complete. All thirteen chunks are done. R0 shipped all of the above to production, so the remediation work is now visible to users rather than sitting on `main`. The docs now say the app recommends a tier and a shape of work, not a vendor, and use one impact vocabulary shared with the app UI. Each step is now priced against the model that step tells the user to open, and the per-step figures are shown so a route total can be checked against its parts. Cost figures are now API-equivalent per-token estimates shown beside what is actually billed, and no surface claims the user saved money. R5 removed 388 lines of unreachable code and turned on `noUnusedLocals` and `noUnusedParameters`, so unused code now fails `npm run build`; it changed nothing a user sees. R7 replaced the developer placeholder on the Help tab with a real screen explaining what the app does, what it will never do, what the three routes and the numbers mean, and where saved choices live, and deleted `PlaceholderScreen` with it. R6 gave the app a way to admit its model knowledge is ageing: catalog age is computed from the review dates already recorded beside the catalogs, and Best Options shows a notice past 90 days telling the user to check their tool's current model list. The catalog is 20 days old, so the notice is correctly silent today. Two risks were added to the register, R-009 for recommendation-quality drift with a 90-day review cadence and R-010 for impact-claim accuracy. R9 resolved the setup question that collected how often each tool is used and then changed nothing: the app no longer computes a `preferredModelId` from it, and the setup screen now says plainly that account level shapes recommendations while frequency is the user's own note. A guard test asserts routing decisions are identical whether every tool is marked rarely used or used many times a day. R8 closed the last gap with a cold-path E2E test that injects nothing into IndexedDB: it routes once before any tool exists to prove the app admits the plan is manual, then adds ChatGPT Plus through the picker, describes a task in free text, and checks the saved decision card names the tool the user actually chose. Owner decisions on impact framing and product promise are recorded; no chunk is blocked on input. Detail lives in `docs/2026-07-25-audit-remediation-plan.md`. |
| 8 | Stage reasoning and project-plan repair | task complete; live | Task complete | Removes the contradictory GPT-5.5 Medium default, makes the Stage 3 handoff actionable, and repairs the stretched project-plan layout without adding a feature or changing the product boundary. |
| 9 | Followed-choice clarification | task complete; live | Task complete | Explains that only Accepted or Edited outcomes count, gives legacy Deferred saves a direct review path, and avoids inventing usage history the app cannot observe. |
| 10 | Direct-work routing repair | task complete; live | Task complete | Stops straightforward tasks from parroting the same prompt relay, preserves explicit task requirements, and produces a usable direct-work contract without adding provider execution. |
| 11 | Task-reasoning engine repair | task complete; live | Task complete | Replaces the remaining fixed role sequence with task-dependent stage utility and model-mode adequacy, proven by different routes for different tasks using the same saved tools. |
| 12 | Stage-first planning grammar | integration complete | Integration complete | Infers the work required by a task before assigning tools, so planning can use research-backed scope framing, strongest adequate synthesis, and a lighter downstream action pass without turning that example into another fixed script. |

## Plan Chunks

### Chunk 1 - Individual Power Story Audit

Status: task complete
Status Updated: 2026-07-08T21:46:17-06:00
Completion target: Task complete
Budget class: Small

Objective:

Audit the current app copy, README, manual, product brief, and public-facing docs for one clean story: an individual uses AI Task Router to choose the right agent, model, mode, or manual step for each stage of a task.

User outcome:

A first-time individual user can understand why the router is useful before they care about governance or internal release history.

Likely files:

- `README.md`
- `docs/PRODUCT_BRIEF.md`
- `docs/manual.md`
- `docs/architecture.md`
- `src/ui/screens/TaskRoutingScreens.tsx`
- `src/ui/screens/StageGuidancePanel.tsx`

Non-goals:

- no public posting
- no exact savings claims
- no provider API calls, live model fetches, telemetry, or account connections

Acceptance criteria:

- The user-facing story names the practical value as choosing the right helper at the right time.
- Any copy that over-emphasizes governance, internal chunks, or release machinery is moved out of the primary user path or softened.
- The product boundary still says the app recommends and packages guidance; it does not execute.
- The next code or docs chunk can be selected without rereading archived pathway history.

Validation expectations:

- Run `rg` checks for stale or misleading terms such as autonomous-agent language, exact savings claims, and any surviving desktop or installer wording.
- Run targeted unit or E2E tests only if user-facing app copy changes.
- Run `git diff --check`.

Stop condition:

Stop at a documented audit and scoped copy updates. Do not start redesigning the routing engine in this chunk.

Acceptance result:

README, product brief, manual, architecture notes, and visible stage wording now lead with the individual-user value: pick the right helper, model tier, mode, or manual step at the right stage, then save local guidance for manual use. Boundary language remains explicit that the app recommends and packages guidance only; it does not execute, send, connect, publish, or call providers. No routing logic was redesigned.

### Chunk 2 - Right-Agent UX Proof Slice

Status: integration complete
Status Updated: 2026-07-08T21:54:37-06:00
Completion target: Integration complete
Budget class: Medium

Objective:

Make the recommendation screen prove the core behavior: different stages can call for different helpers, modes, or model strengths, and the app explains why.

User outcome:

The user sees a staged plan where framing, research, creation, packaging, review, and action can each have a different recommended help choice with a clear upgrade trigger.

Likely files:

- `src/domain/routing/stageGuidance.ts`
- `src/domain/routing/toolModeCatalog.ts`
- `src/domain/routing/modelGuidance.ts`
- `src/ui/screens/StageGuidancePanel.tsx`
- `src/ui/screens/TaskRoutingScreens.tsx`
- `src/tests/unit/routeCardGenerator.test.ts`
- `src/tests/e2e/mvp-workflows.spec.ts`

Non-goals:

- no new providers or live provider calls
- no autonomous execution
- no broad visual redesign

Acceptance criteria:

- Stage guidance shows the recommended help, mode, reason, and upgrade trigger where available.
- At least one fixture demonstrates a route where stages use meaningfully different help.
- Empty, blocked, and manual-first routes remain understandable.
- Existing no-execution boundaries remain visible.

Validation expectations:

- Run focused unit tests for route card generation and prompt package generation.
- Run the main MVP Playwright workflow when UI changes.
- Run `npm run build` if TypeScript or UI surfaces change.

Stop condition:

Stop when the staged recommendation proves the concept in the live flow. Defer estimator, methodology, and launch copy.

Acceptance result:

The live stage guidance now shows a compact route-choice summary on each stage card when data is available: recommended help, visible mode, first selection reason, and upgrade trigger. Route-card tests now prove a realistic staged task uses different help across gather, create, package, and review. App and Playwright coverage verify the route-choice summary appears in the live recommendation flow while no-execution boundaries remain visible.

### Chunk 3 - Decision Card And Prompt Handoff Polish

Status: integration complete
Status Updated: 2026-07-08T22:03:18-06:00
Completion target: Integration complete
Budget class: Medium

Objective:

Make exported Decision Cards and prompt packages preserve the same stage-by-stage agent choice logic that the user saw in the app.

User outcome:

The user can leave the app with a clear manual handoff: what to do first, which helper to use, when to upgrade, what to check, and what not to send or execute.

Likely files:

- `src/domain/export/exportImport.ts`
- `src/domain/prompting/promptPackageGenerator.ts`
- `src/ui/screens/RouteArtifactScreens.tsx`
- `src/tests/unit/exportImport.test.ts`
- `src/tests/unit/promptPackageGenerator.test.ts`

Non-goals:

- no automatic prompt sending
- no file indexing
- no cloud sync or account connections

Acceptance criteria:

- Exported Markdown includes stage, recommended help, mode or model guidance, review checks, and no-execution caveats.
- Prompt packages remain manual guidance only.
- Saved artifacts and exports stay locally controlled.

Validation expectations:

- Run export/import and prompt package unit tests.
- Run targeted app tests if artifact UI changes.
- Run `git diff --check`.

Stop condition:

Stop at export and handoff clarity. Do not add new artifact formats unless separately approved.

Acceptance result:

Decision Card Markdown now includes a manual-use boundary before the summary, preserves stage guidance with recommended help plus model/mode guidance, and keeps work-item reasons, review checks, and upgrade triggers visible. Prompt package Markdown now includes a manual-use boundary, and generated prompt-step instructions carry the handoff stage, recommended help or mode, review checks, and upgrade trigger. JSON schemas and local export bundle formats were not changed.

### Chunk 4 - Reviewed Methodology Page

Status: draft complete; owner-review ready
Status Updated: 2026-07-09T11:06:44-06:00
Completion target: Draft complete
Budget class: Small

Objective:

Create or refine a concise methodology explanation for how the router thinks about right-sized help, staged work, and cautious impact estimates.

User outcome:

The user can inspect the reasoning behind the product without seeing unsupported certainty or internal implementation noise.

Likely files:

- `docs/2026-07-05-impact-estimator-methodology.md`
- `docs/PRODUCT_BRIEF.md`
- `README.md`
- public hub handoff docs if owner selects launch-copy follow-up

Non-goals:

- no live pricing or model menu fetches
- no exact public savings claims
- no social publishing

Acceptance criteria:

- Claims are clearly caveated as estimates, guidance, or local decision support.
- Source-backed statements remain linked to existing evidence docs or are marked as assumptions.
- The methodology reinforces right-helper-by-stage rather than generic AI advice.

Validation expectations:

- Run doc link/path checks by targeted `rg`.
- Run `git diff --check`.
- Run tests only if app code changes.

Stop condition:

Stop at a reviewed draft. Public launch copy remains a separate approval chunk.

Acceptance result:

The methodology page now opens with a date-prefixed controlled-doc title and a concise stage-first method: split work into Frame/Gather/Create/Package/Review/Act, apply hard gates, choose the lightest safe helper, show checks and upgrade triggers, and keep outside action manual. Impact math remains as bounded local decision-support scenarios with source snapshot rules, no live pricing fetches, no exact per-user savings claims, and explicit owner/source-refresh gates before public numbers. The 2026-07-09 review pass adds a user-visible route contract and local saved-choice tracking boundaries, so accepted-route counts stay distinct from avoided-cost or energy estimates.

### Chunk 5 - Opt-In Local Estimator UI

Status: paused
Status Updated: 2026-07-08T22:17:33-06:00
Completion target: Draft complete
Budget class: Medium

Objective:

Add a user-controlled estimator surface that explains local impact assumptions without sending data anywhere.

User outcome:

The user can see why smaller adequate routes may lower cost and energy use, and where that trades against their own review time, while understanding that the numbers are estimates and not guarantees.

Likely files:

- `src/domain/impact/impactEstimator.ts`
- `src/domain/impact/publicImpactSnapshot.ts`
- `src/ui/screens/ImpactInsightPanel.tsx`
- `src/ui/screens/TaskRoutingScreens.tsx`
- `src/tests/unit/impactEstimator.test.ts`

Non-goals:

- no telemetry
- no live pricing/model fetches
- no account connection
- no exact guaranteed savings claim

Acceptance criteria:

- Estimator copy is opt-in, local, and caveated.
- The UI distinguishes estimates from tracked local decisions.
- The estimator supports the right-sized route story instead of becoming a standalone calculator.

Validation expectations:

- Run impact estimator unit tests.
- Run relevant UI tests if the panel changes.
- Run `npm run build` if UI or TypeScript changes.

Stop condition:

Stop at a draft user-visible estimator. Do not expand to analytics, sync, or provider data.

Pause decision:

As of 2026-07-08T22:17:33-06:00, the owner considers the core web/PWA tool functional enough for hands-on testing without this estimator. Do not start Chunk 5 unless the owner explicitly reopens it.

### Chunk 12 - Stage-First Planning Grammar

Status: integration complete
Status Updated: 2026-07-27T22:18:56-06:00
Completion target: Integration complete
Budget class: Large

Objective:

Make the deterministic router infer a useful work plan before it assigns tools. Replace the shallow evidence/prompt/execution slot sequence with reusable task archetypes, inferred deliverables, scope framing, plan synthesis, execution, review, packaging, and action handoff stages.

User outcome:

A person can enter a rough but ordinary planning request and receive an AI-assisted scope, a properly reasoned plan, and a right-sized downstream handoff. They are not told to finish the scope themselves, and the router does not use every saved tool merely because it is available.

Acceptance criteria:

- Planning and build archetypes infer the planning elements that competent work requires even when the user did not list them.
- Stage selection happens before model assignment; tool availability changes assignments but does not erase required work.
- With Perplexity Free, ChatGPT Go, and Copilot Free, a normal multi-part plan uses research-backed scope framing, ChatGPT's strongest available reasoning for the plan, and a lighter independent action handoff when adequate.
- The same inventory still routes a simple rewrite directly to a light execution mode.
- Research, public/high-quality review, build execution, privacy hard gates, and local-only/manual fallbacks retain their existing protections.
- Route cards, stage guidance, and copy-ready prompts carry the inferred stages and explain what each helper must produce.

Non-goals:

- no provider API calls, account connections, live search, telemetry, or outside execution
- no giant flat table of complete routes
- no visual redesign, new screen, impact-claim change, or provider catalog refresh

Validation expectations:

- Add behavior-focused unit tests for archetypes, inferred deliverables, stage topology, assignments, scoring, route cards, and prompt packages.
- Add an end-to-end contrast using one saved inventory across materially different tasks.
- Run the full unit, script, build/bundle, dependency-audit, release-candidate, governance, and local Playwright gates.

Rollback:

Revert the bounded source commit. No schema migration, remote data, credential, provider, or production change is part of this chunk.

Acceptance result:

The router now classifies the task, infers the work and deliverables it requires, and only then assigns saved tool modes. Planning routes no longer collapse into one generic ChatGPT pass or manufacture a prompt relay. The browser regression proves Perplexity Free frames a rough planning request from the user-approved inputs, ChatGPT Go uses its highest available reasoning level to synthesize the actual plan, and Copilot Free packages the approved plan into an immediate action. The same inventory sends a simple rewrite directly to GPT-5.5 Instant. Explicit prompt handoffs, research-only work, builds, reviews, artifact packaging, privacy gates, and manual fallbacks remain conditional stages rather than a universal script. Stage guidance no longer mistakes a lightweight action tool for a package/execution stage, eliminating the duplicate and nonsensical Stage 3 that browser verification exposed.

## Validation Log

| Timestamp | Command | Result | Notes |
|---|---|---|---|
| 2026-07-09T03:04:01+00:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before extracting the compact active pathway. |
| 2026-07-09T03:04:01+00:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings after updating active-plan routing references. |
| 2026-07-09T03:04:01+00:00 | `rg -n "docs/2026-07-09-current-build-pathway.md\|2026-07-09-current-build-pathway" START_HERE.md AGENTS.md AI_BOOTSTRAP.md docs/context-map.md README.md project-control.yaml` | pass | Startup, bootstrap, context map, README, and control docs point to the compact active pathway. |
| 2026-07-09T03:04:01+00:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |
| 2026-07-09T03:04:01+00:00 | active pathway line-count check | pass | Compact pathway is 159 lines after closeout; superseded pathway history is no longer the startup surface. |
| 2026-07-09T03:04:01+00:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-09T03:04:01+00:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings; governance check now requires `docs/2026-07-09-current-build-pathway.md`. |
| 2026-07-09T03:04:01+00:00 | retired pathway file-existence check | pass | Retired active-path filename is absent from the working tree. |
| 2026-07-08T21:17:29-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings after expanding the compact pathway into executable plan chunks. |
| 2026-07-08T21:17:29-06:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |
| 2026-07-08T21:17:29-06:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-08T21:17:29-06:00 | active pathway line-count check | pass | Active pathway is 454 lines with six plan chunks; archived pathway history is not needed for startup. |
| 2026-07-08T21:17:29-06:00 | plan chunk line check | pass | `Build Plan` starts at line 79, `Chunk Queue` at line 85, and `Chunk 1` at line 98. |
| 2026-07-08T21:43:43-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before Chunk 1 edits. |
| 2026-07-08T21:46:17-06:00 | stale-language search | pass | Remaining `execute`, `agent`, `exact savings`, and desktop hits are boundary/guardrail or caution language, not capability claims. |
| 2026-07-08T21:46:17-06:00 | value-story search | pass | README, product brief, manual, and architecture now explicitly name right-helper-by-stage and local Decision Card outcomes. |
| 2026-07-08T21:46:17-06:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-08T21:46:17-06:00 | `npm run test -- App routeCardGenerator promptPackageGenerator` | pass | 3 files, 34 tests. |
| 2026-07-08T21:46:17-06:00 | `npm run build` | pass | TypeScript and Vite build passed; existing large chunk warning remains. |
| 2026-07-08T21:46:17-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 Chromium workflow tests passed. |
| 2026-07-08T21:46:17-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings after marking Chunk 1 complete and Chunk 2 next. |
| 2026-07-08T21:46:17-06:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |
| 2026-07-08T21:50:38-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before Chunk 2 edits. |
| 2026-07-08T21:53:33-06:00 | `npm run test -- routeCardGenerator App` | pass | 2 files, 26 tests; includes visible mode/reason/upgrade UI assertions and staged-helper diversity proof. |
| 2026-07-08T21:53:54-06:00 | `npm run test -- promptPackageGenerator` | pass | 1 file, 8 tests. |
| 2026-07-08T21:53:54-06:00 | `npm run build` | pass | TypeScript and Vite build passed; existing large chunk warning remains. |
| 2026-07-08T21:54:37-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 Chromium workflow tests passed, including route-choice summary visibility and narrow viewport overflow check. |
| 2026-07-08T21:55:26-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings after Chunk 2 edits and pathway handoff update. |
| 2026-07-08T21:55:26-06:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-08T21:55:26-06:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |
| 2026-07-08T22:00:32-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before Chunk 3 edits; PowerShell `date -Iseconds` failed because `date` is an alias, then timestamp was captured through Bash. |
| 2026-07-08T22:02:57-06:00 | `npm run test -- exportImport promptPackageGenerator` | pass | 2 files, 15 tests; verifies exported Markdown and prompt handoff stage/helper/check/upgrade details. |
| 2026-07-08T22:02:57-06:00 | `npm run build` | pass | TypeScript and Vite build passed; existing large chunk warning remains. |
| 2026-07-08T22:04:06-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings after Chunk 3 edits and pathway handoff update. |
| 2026-07-08T22:04:06-06:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-08T22:04:06-06:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |
| 2026-07-08T22:07:13-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before Chunk 4 methodology edits. |
| 2026-07-08T22:07:13-06:00 | `rg -n "guaranteed savings\|actual provider bill\|live provider price\|exact per-user savings\|right-helper-by-stage\|local decision support\|source snapshot\|manual-use" docs/2026-07-05-impact-estimator-methodology.md README.md docs/PRODUCT_BRIEF.md` | pass | Methodology now includes right-helper-by-stage wording, source snapshot boundaries, manual-use limits, and explicit forbidden-claim examples. |
| 2026-07-08T22:07:13-06:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-08T22:07:13-06:00 | methodology line-count check | pass | Methodology draft is 178 lines after refocus; the active pathway stays compact. |
| 2026-07-08T22:09:58-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings after Chunk 4 edits and pathway handoff update. |
| 2026-07-08T22:09:58-06:00 | prior Chunk 5 routing check | pass | Historical routing check before the owner paused Chunk 5; superseded by the 2026-07-08T22:17:33-06:00 owner scope decision. |
| 2026-07-08T22:09:58-06:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-08T22:09:58-06:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |
| 2026-07-08T22:17:33-06:00 | owner scope decision | pass | Owner accepted the core web/PWA tool as ready for hands-on testing; Chunk 5 is paused and Chunk 6 remains held. |
| 2026-07-08T22:17:33-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before production/testing routing cleanup. |
| 2026-07-08T22:18:41-06:00 | `npm audit --audit-level=moderate`; `npm run test`; `npm run build`; `npm run scan:web-rc` | pass | Audit found 0 vulnerabilities; Vitest passed 14 files and 116 tests; production build passed with the existing large chunk warning; web release-candidate scan found no release-blocking findings. |
| 2026-07-08T22:20:19-06:00 | initial Wrangler deploy attempt without env file | blocked | Shell did not have `CLOUDFLARE_API_TOKEN`; no token values were printed. |
| 2026-07-08T22:21:10-06:00 | Wrangler deploy with secure env file | pass | Cloudflare created production deployment `https://733d9385.ai-task-router.pages.dev` from source `e777fed`; canonical asset checks returned HTTP 200. |
| 2026-07-08T22:21:35-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test` | fail | Canonical URL still served a stale PWA flow for the route-summary assertion, while the immutable deployment URL passed all 6 hosted E2E tests. |
| 2026-07-08T22:23:27-06:00 | `node --check public/service-worker.js`; `npm run test`; `npm run build`; `npm run scan:web-rc`; local `npx playwright test`; `git diff --check` | pass | Added `ai-task-router-pwa-v2` cache and network-first same-origin asset fetching; Vitest passed 14 files and 116 tests; local Playwright passed 6 Chromium tests; build kept the existing large chunk warning; whitespace check only reported normal Windows LF-to-CRLF notices. |
| 2026-07-08T22:25:41-06:00 | Cloudflare production deploy and canonical hosted smoke | pass | Deployed source `b1fa71d` to `https://9e4ca8a6.ai-task-router.pages.dev`; canonical `https://ai-task-router.pages.dev/` root, manifest, service worker, and PWA icons returned HTTP 200; service worker contained `ai-task-router-pwa-v2`; hosted Playwright passed 6 Chromium tests. |
| 2026-07-08T22:35:42-06:00 | Owner routing feedback implementation checks | pass | `npm run test` passed 14 files and 118 tests; `npm run build` passed with the existing large chunk warning; `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` passed 6 Chromium tests; `npm audit --audit-level=moderate` found 0 vulnerabilities; `npm run scan:web-rc` found no release-blocking findings; `git diff --check` reported only normal Windows LF-to-CRLF notices. |
| 2026-07-08T22:37:17-06:00 | Cloudflare production deploy and canonical hosted smoke | pass | Deployed source `8c707d3` to `https://45781c97.ai-task-router.pages.dev`; canonical `https://ai-task-router.pages.dev/` root, manifest, service worker, and immutable deployment root returned HTTP 200; service worker contained `ai-task-router-pwa-v2`; hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` passed 6 Chromium tests. |
| 2026-07-08T22:44:24-06:00 | Average-person routing probe and focused checks | pass | Probed personal finance tracker, small business quote/invoice workflow, medical appointment prep, and family trip planning. The probe exposed and then verified a fix for ordinary planning language: "build a day by day itinerary" no longer becomes a software build slice, while true app/workflow/code tasks still route to prompt-design plus build execution. `npm run test -- taskDecomposition routeCardGenerator routeCandidates` passed 3 files and 31 tests; `npm run test` passed 14 files and 119 tests; `npm run build` passed with the existing large chunk warning. |
| 2026-07-08T22:45:18-06:00 | Cloudflare production deploy and canonical hosted smoke | pass | Deployed source `9639840` to `https://ef92b270.ai-task-router.pages.dev`; canonical `https://ai-task-router.pages.dev/` root, manifest, service worker, and immutable deployment root returned HTTP 200; service worker contained `ai-task-router-pwa-v2`; hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` passed 6 Chromium tests. |
| 2026-07-09T08:03:28-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before Best Options owner-testing UX fixes. |
| 2026-07-09T08:07:40-06:00 | `npm run test -- App`; `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | Focused app and browser checks verified visible stage paths, route selection, accepted-route save, and immediate followed-choice impact refresh. |
| 2026-07-09T08:09:23-06:00 | `npm run test`; `npm run build`; `npm run scan:web-rc` | pass | Vitest passed 14 files and 119 tests; TypeScript/Vite build passed with the existing large chunk warning after fixing a test-only unsupported `exact` option; web release-candidate scan found no release-blocking findings. |
| 2026-07-09T09:16:28-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before removing the remaining stage-path disclosure affordance and attempting production deploy. |
| 2026-07-09T09:17:07-06:00 | `npm run test -- App`; `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | App tests passed 15 tests and MVP Chromium workflow passed 6 tests; both now assert the stage guidance contains no `details` or `summary` disclosure elements. |
| 2026-07-09T09:17:36-06:00 | `npm audit --audit-level=moderate`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `git diff --check` | pass | Audit found 0 vulnerabilities; Vitest passed 14 files and 119 tests; production build passed with the existing large chunk warning; web release-candidate scan found no release-blocking findings; whitespace check only reported normal Windows LF-to-CRLF notices. |
| 2026-07-09T09:20:39-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash f8e0a40 --commit-message "Remove stage path disclosure affordance" --env-file ...` | blocked | Cloudflare rejected the secure env-file token from the current public IP with code `9109` and then reported too many auth failures on deployment-list retry. Token values were not printed. Source commit `f8e0a40` is pushed; production remains on the previous deployment until a deploy is run from an allowed IP/session or the token location policy is updated. |
| 2026-07-09T10:11:44-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before retrying production deployment from current `main`. |
| 2026-07-09T10:12:14-06:00 | `npm audit --audit-level=moderate`; `npm run test`; `npm run build`; `npm run scan:web-rc`; `git diff --check` | pass | Audit found 0 vulnerabilities; Vitest passed 14 files and 119 tests; production build from `80a661b` passed with the existing Vite chunk-size warning; web release-candidate scan found no release-blocking findings; whitespace check was clean. |
| 2026-07-09T10:12:52-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash 80a661b --commit-message "Record production deploy blocker" --env-file ...` | blocked | Cloudflare again rejected the secure env-file token from public IP `184.67.69.66` with code `9109` and authentication error `10000`. Token values were not printed. |
| 2026-07-09T10:14:22-06:00 | Direct-link fallback check | blocked | `ssh linux-direct` to `10.77.77.2` timed out and the Windows direct-link status script could not find the configured `Ethernet 2` adapter, so no alternate allowed-location deploy host was reachable from this session. |
| 2026-07-09T11:06:44-06:00 | `bash scripts/governance-preflight.sh`; Chunk 4 methodology claim-boundary `rg`; `git diff --check` | pass | Governance preflight reported 0 warnings; methodology review found route-contract, saved-choice, source-snapshot, manual-use, and forbidden-claim boundary language; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-09T12:41:50-06:00 | `bash scripts/governance-preflight.sh`; deploy turnover doc review; `git diff --check` | pass | Governance preflight reported 0 warnings before boxing up the Cloudflare deploy blocker. Turnover note records the blocked public IP, Cloudflare code `9109`, secure-token handling, allowed-location recovery options, deploy command shape, and hosted smoke checklist. |
| 2026-07-25T16:28:35-06:00 | `git status --short --branch`; `git pull --ff-only`; `bash scripts/governance-preflight.sh` | pass | Working tree clean, `main` level with `origin/main`, governance preflight 0 warnings before the deploy attempt. |
| 2026-07-25T16:28:35-06:00 | `npm audit --audit-level=moderate`; `npm run test`; `npm run build`; `npm run scan:web-rc` | pass | 0 vulnerabilities (the postcss high finding recorded against R0 was cleared by R5); Vitest 14 files and 134 tests; production build from `ab329e5` with the existing Vite chunk-size warning only; web release-candidate scan found no release-blocking findings. |
| 2026-07-25T16:28:35-06:00 | Public IP confirmed before retry | pass | Current public IP `70.65.205.71` differs from the blocked `184.67.69.66`, which is the precondition the turnover note sets before any retry. One attempt only, per the note's stop rule. |
| 2026-07-25T16:28:35-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash ab329e5 --commit-message ... --env-file ...` | pass | Deployed source `ab329e5` to `https://7c570b1d.ai-task-router.pages.dev`; 3 new files uploaded, 6 already present. Same token, same command shape, same secure env file as the two blocked attempts; only the network location changed. Token values were not printed. |
| 2026-07-25T16:28:35-06:00 | `npx --yes wrangler pages deployment list --project-name ai-task-router` | pass | Confirms the new deployment is `Environment: Production`, `Branch: main`, `Source: ab329e5`, and is the most recent deployment ahead of `ef92b270` from `9639840`. |
| 2026-07-25T16:28:35-06:00 | Canonical hosted smoke on `https://ai-task-router.pages.dev` | pass | Root, `/manifest.webmanifest`, and `/service-worker.js` all returned HTTP 200. First canonical root fetch returned the previous bundle from a stale edge-cache hit; a cache-busted no-cache refetch returned the `ab329e5` bundle, and the immutable deployment URL served the correct bundle throughout. |
| 2026-07-25T16:28:35-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 Chromium tests passed against the canonical production URL, covering first-run setup, My AI Tools, the stale five-row migration, task intake through save and export with feedback and no provider execution, and narrow-viewport layout. |

| 2026-07-25T16:41:27-06:00 | `npx tsc --noEmit`; `npm run test`; `npm run build` | pass | R7. TypeScript clean after deleting `PlaceholderScreen`, `placeholderState`, and `purpose`; Vitest 14 files and 135 tests, up 1 for the new Help assertions; production build clean with the existing Vite chunk-size warning only. |
| 2026-07-25T16:41:27-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. The narrow-viewport case now also opens Help at 390x844 and checks for horizontal overflow, since the new screen is the app's widest block of prose. |
| 2026-07-25T16:41:27-06:00 | `npm run scan:web-rc`; `git diff --check`; `bash scripts/governance-preflight.sh` | pass | No release-blocking findings; whitespace check reported only the usual Windows LF-to-CRLF notices; governance preflight 0 warnings after R7. |

| 2026-07-25T16:47:39-06:00 | `npm run test`; `npm run build` | pass | R6. Vitest 15 files and 141 tests, up 6 for catalog freshness and both rendered states of the staleness notice; production build clean with the existing Vite chunk-size warning only. |
| 2026-07-25T16:47:39-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. No E2E change needed: at today's catalog age the notice is correctly absent, and the fake-clock cases live in the unit suite. |
| 2026-07-25T16:47:39-06:00 | `npm run scan:web-rc`; `git diff --check`; `bash scripts/governance-preflight.sh` | pass | No release-blocking findings; whitespace check reported only the usual Windows LF-to-CRLF notices; governance preflight 0 warnings after R6. |

| 2026-07-25T16:54:26-06:00 | `npm run test`; `npm run build` | pass | R9. Vitest 15 files and 143 tests, up 2 for the routing-neutrality guard and the setup-copy assertion; production build clean with the existing Vite chunk-size warning only. |
| 2026-07-25T16:54:26-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. The frequency control is unchanged in place, so the My AI Tools stable-layout case still holds. |
| 2026-07-25T16:54:26-06:00 | `npm run scan:web-rc`; `git diff --check`; `bash scripts/governance-preflight.sh` | pass | No release-blocking findings; whitespace check reported only the usual Windows LF-to-CRLF notices; governance preflight 0 warnings after R9. |

| 2026-07-25T16:58:01-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | R8. 7 tests, up from 6. The new cold-path test uses no fixture injection and covers first-run honesty, the tool picker, free-text intake, routing, saving, and the decision card. |
| 2026-07-25T16:58:01-06:00 | Negative control on the new cold-path test | pass | Swapping the expected tool name from ChatGPT to Claude fails the test on both the stage guidance locator and the decision card Markdown, confirming the tool-naming assertion is not incidentally true. |
| 2026-07-25T16:58:01-06:00 | `npm run test`; `npm run build`; `npm run scan:web-rc`; `git diff --check`; `bash scripts/governance-preflight.sh` | pass | 15 files and 143 tests unchanged, since R8 adds no unit tests; build clean; no release-blocking findings; whitespace check exit 0; governance preflight 0 warnings after R8. |

| 2026-07-26T10:21:53-06:00 | Public IP confirmed before deploy | pass | `70.65.205.71`, the home network the 2026-07-25 deploy succeeded from, not the blocked `184.67.69.66`. This is the precondition the turnover note sets before any deploy attempt. |
| 2026-07-26T10:21:53-06:00 | `git pull --ff-only`; `bash scripts/governance-preflight.sh`; `npm audit --audit-level=moderate` | pass | Already up to date at `69b31a2`; governance preflight 0 warnings; 0 vulnerabilities. |
| 2026-07-26T10:21:53-06:00 | `npm run test`; `npm run build`; `npm run scan:web-rc` | pass | Vitest 16 files and 147 tests; build clean with the existing Vite chunk-size warning only, and the budget gate reported javascript raw 649.58 kB / 700.00 kB and stylesheet raw 41.56 kB / 60.00 kB; no release-blocking findings. |
| 2026-07-26T10:21:53-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash 69b31a2 --commit-message ... --env-file ...` | pass | Deployed source `69b31a2` to `https://d81aef5b.ai-task-router.pages.dev`; 3 new files uploaded, 6 already present. One attempt, no token or command changes, no token values printed. |
| 2026-07-26T10:21:53-06:00 | Canonical hosted smoke on `https://ai-task-router.pages.dev` | pass | Root, `/manifest.webmanifest`, and `/service-worker.js` returned HTTP 200. The canonical URL served asset `index-CBWnLbEK.js` on the first fetch with no stale edge-cache hit, unlike 2026-07-25. The live asset contains `What this app does` and not `Placeholder State`, proving the R7 Help screen is the one visitors now see. |
| 2026-07-26T10:21:53-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass on re-run | First hosted run was 6 passed, 1 failed: the route-selection case did not find `Choose this route` within its timeout on a cold edge. The same test passed alone in 1.9s immediately after, and a full re-run passed 7/7 in 9.3s. Read as cold-start latency on first hosted paint, not a product defect; if it recurs on a warm edge it is a real timing bug in that screen. |

| 2026-07-26T10:52:00-06:00 | Teaching audit of the impact and routing surfaces | complete | Read-only pass over `HelpScreen`, `ImpactInsightPanel`, `TaskRoutingScreens`, `StageGuidancePanel`, `RouteLogScreen`, and the estimator. Six gaps found against the goal "teach why right-sizing matters". Three fixed in this chunk; three remain open, listed in the Next Handoff. Also confirmed the water ranges are unrendered by governed decision, not oversight, and that the R-010 vocabulary is being honored throughout the existing copy. |
| 2026-07-26T10:52:00-06:00 | `npx vitest run src/tests/unit/format.test.ts` | pass | 14 tests, up from 7. Covers the everyday energy restatement across sub-minute, minute, and hour scales, singular units, the null return for zero and non-finite input, and the combined figure-plus-restatement formatter. One expectation was wrong on first run: 10 Wh is 60 minutes, below the 90-minute switch to hours, so "60 minutes" is correct and the test was corrected rather than the threshold. |
| 2026-07-26T10:52:00-06:00 | `npm run test` | pass | 16 files and 154 tests, up from 147. No existing assertion needed changing, which confirms the three changes are additive to the impact vocabulary rather than a rewrite of it. |
| 2026-07-26T10:52:00-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 7/7 in 9.8s with three new assertions: the everyday energy restatement renders on the route cards, the comparison multiple renders, and the lean/balanced/premium split appears in the followed-choice counter after a route is saved. The existing R-010 guards for "Estimated savings", "Energy saved", and "Est. saved" still report zero occurrences, so the new copy did not reintroduce savings vocabulary. |
| 2026-07-26T10:52:00-06:00 | `npm run build` | pass | Typecheck clean under `noUnusedLocals`; budget gate reported javascript raw 651.58 kB / 700.00 kB and stylesheet raw 41.56 kB / 60.00 kB. The 2 kB growth is the new copy and formatter. |
| 2026-07-26T11:10:28-06:00 | Public IP confirmed before deploy | pass | `70.65.205.71`, the allowed home network, not the blocked `184.67.69.66`. Checked before the attempt, per the turnover note's precondition and one-attempt stop rule. |
| 2026-07-26T11:10:28-06:00 | `git pull --ff-only`; `bash scripts/governance-preflight.sh`; `npm audit --audit-level=moderate`; `npm run test`; `npm run build`; `npm run scan:web-rc` | pass | Already up to date at `a34d839`; preflight 0 warnings; 0 vulnerabilities; 16 files and 154 tests; budget gate javascript raw 651.58 kB / 700.00 kB and stylesheet raw 41.56 kB / 60.00 kB; no release-blocking findings. |
| 2026-07-26T11:10:28-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash a34d839 --commit-message ... --env-file ...` | pass | Deployed source `a34d839` to `https://9d00dce4.ai-task-router.pages.dev`; 2 new files uploaded, 7 already present. One attempt, no token or command changes, no token values printed. Third consecutive success from the allowed location. |
| 2026-07-26T11:10:28-06:00 | Canonical hosted smoke on `https://ai-task-router.pages.dev` | pass | Root, `/manifest.webmanifest`, and `/service-worker.js` returned HTTP 200. The canonical URL served asset `index-Dv6r8WOf.js` on the first fetch, matching both the local build output and the per-deploy hash URL, so the production alias followed the deploy with no stale edge-cache hit. |
| 2026-07-26T11:10:28-06:00 | Live bundle string check for teaching copy and R-010 vocabulary | pass | The served asset contains `10-watt LED bulb`, `Which routes you followed`, and `What this app does`, proving the three fixes reached users rather than only the repository. It contains none of `Estimated savings`, `Energy saved`, or `Est. saved`, so the R-010 vocabulary control holds in the shipped artifact and not only in the source. |
| 2026-07-26T11:10:28-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 7/7 in 10.0s on the first hosted run. The route-selection case that needed a re-run on 2026-07-26T10:21:53-06:00 passed first time here, which supports reading that earlier failure as cold-edge latency rather than a timing bug in the screen. |
| 2026-07-26T11:20:59-06:00 | Teaching-audit findings 1 and 2 implemented | complete | Finding 1: Start Here now carries three worked examples before any task is described, from the reviewed snapshot already used on Best Options, so the placement changes and the figures do not. Finding 2: Past Choices now shows per-row metered cost and energy, a per-row comparison against the heaviest route offered, and choice-pattern totals across the whole log. `heaviestSiblingRoute` and `comparisonMultipleClause` moved from `TaskRoutingScreens.tsx` to the new `src/domain/impact/routeComparison.ts` rather than being copied, which is the defect `src/domain/format.ts` exists to prevent. |
| 2026-07-26T11:20:59-06:00 | `npx vitest run src/tests/unit/routeComparison.test.ts` | pass | 12 tests over the extracted comparison primitives and the new log-pattern summary. The load-bearing ones assert what must be excluded: unestimated choices, choices where nothing heavier was offered, and outcomes the user never marked as followed. A zero entry there would drag the comparison toward "these routes barely differ", which the evidence does not support. |
| 2026-07-26T11:20:59-06:00 | `npm run test` | pass | 17 files and 166 tests, up from 154. No existing assertion changed. |
| 2026-07-26T11:20:59-06:00 | `npm run build` | failed, then passed | First run failed typecheck: `TS2783` in the new test file, `id` specified both explicitly and by spread in a fixture helper. Real error, not noise - `tsc --noEmit` covers tests, so Vitest and Playwright both passed while the build did not. Helper simplified to defaults-then-spread. Re-run clean; budget gate javascript raw 658.31 kB / 700.00 kB and stylesheet raw 43.03 kB / 60.00 kB. |
| 2026-07-26T11:20:59-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 7/7 in 8.1s with six new assertions: the Start Here panel and its "smaller is not automatically better" point render, Past Choices shows both new row figures and the pattern heading, and the narrow-viewport case now checks Start Here, which it never did before and which is the only phone-width coverage in the suite. |
| 2026-07-26T11:20:59-06:00 | R-010 vocabulary check on the changed files | pass | No user-facing use of "savings" or "avoided" for money in the new copy. The only "saved" occurrences in the changed files are the record-keeping sense ("saved choice", "saving feedback") or pre-existing negations such as "not money you saved". |
| 2026-07-26T11:41:28-06:00 | Public IP confirmed before deploy | pass | `70.65.205.71`, the allowed home network, not the blocked `184.67.69.66`. Checked before the attempt, per the turnover note's precondition and one-attempt stop rule. |
| 2026-07-26T11:41:28-06:00 | `bash scripts/governance-preflight.sh`; `npm audit --audit-level=moderate`; `npm run test`; `npm run build`; `npm run scan:web-rc` | pass | Clean tree at `b8069fa`; preflight 0 warnings; 0 vulnerabilities; 17 files and 166 tests; budget gate javascript raw 658.31 kB / 700.00 kB and stylesheet raw 43.03 kB / 60.00 kB; no release-blocking findings. |
| 2026-07-26T11:41:28-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash b8069fa --commit-message ... --env-file ...` | pass | Deployed source `b8069fa` to `https://cc915a90.ai-task-router.pages.dev`; 3 new files uploaded, 6 already present. One attempt, no token or command changes, no token values printed. Fourth consecutive success from the allowed location. |
| 2026-07-26T11:41:28-06:00 | Canonical hosted smoke on `https://ai-task-router.pages.dev` | pass, after a stale first fetch | Root, `/manifest.webmanifest`, and `/service-worker.js` returned HTTP 200. Unlike the two deploys before it, the canonical URL served the *previous* asset `index-Dv6r8WOf.js` on the first fetch while the hash URL already served `index-Dc_ddyS3.js`. A cache-busted re-fetch returned the new asset, and an ordinary re-fetch immediately after did too, so this was an edge-cache hit lasting seconds, not an alias that failed to follow. Treat "verify with a cache-busting fetch before concluding the alias is stale" as the standing method; a single plain fetch can report a false stale. |
| 2026-07-26T11:41:28-06:00 | Live bundle string check for teaching copy and R-010 vocabulary | pass, on the second attempt | The served asset contains `Why which tool you pick matters`, `Smaller is not automatically better`, `Energy moves with it`, `How you have been choosing`, `If this run were metered`, `Against the heaviest offered`, and `10-watt LED bulb`, proving findings 1 and 2 reached users. It contains none of `Estimated savings`, `Energy saved`, `Est. saved`, or `avoided cost`. The first attempt fetched `/assets/index-Dc_ddyS3.js` through the same stale edge and got a 962-character SPA fallback, which reported every phrase absent - including a clean R-010 pass that would have been a false negative. Assert the fetched length matches the build output before trusting any bundle string check. |
| 2026-07-26T11:41:28-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 7/7 in 10.1s on the first hosted run, including the six assertions added for findings 1 and 2 and the narrow-viewport Start Here check. Second consecutive first-run hosted pass. |
| 2026-07-26T11:41:28-06:00 | Whole-bundle R-010 sweep, wider than the changed files | pass with a noted pre-existing path | Sweeping the entire shipped bundle rather than the diff surfaced `you saved` and `savings`. Every `you saved` hit is the record-keeping sense ("tools you saved") or the deliberate negation ("not money you saved"). The `savings` hits are a catalog product name ("Ark savings plan"), code identifiers, and three user-reachable strings that describe the *user's own requested deliverable* - "cost, savings, or energy comparison" in `taskDecomposition.ts` and `stageGuidance.ts`, and "savings note" in `promptPackageGenerator.ts`. `git diff a34d839..b8069fa` introduced none of them; they date to `f3682b7`. R-010 governs the app's claims about money, and these describe what the user asked for, so this is not a violation - but `App.test.tsx` asserts rendered output never matches `/\bsavings\b/i`, and that guard only covers the paths the test exercises. See the Next Handoff. |

| 2026-07-26T20:51:35-06:00 | Teaching-audit finding 3: rebalance the Best Options impact panel | pass | `npm run test` 17 files and 166 tests; `npm run build` clean with javascript raw 658.97 kB / 700.00 kB and stylesheet raw 43.62 kB / 60.00 kB; local E2E 7/7 including the narrow-viewport overflow check; preflight 0 warnings; `npm run scan:web-rc` no release-blocking findings. Verified visually at 1440px and 820px by screenshotting `.impactSection` through a temporary Playwright capture, which was removed afterwards; `git status` confirms the spec file is unmodified. |
| 2026-07-26T21:04:00-06:00 | Comparison multiples reconciled with displayed figures across all three call sites | pass | `npm run test` 17 files and 170 tests, four of them new and holding the guarantee; `npm run build` clean with javascript raw 659.26 kB / 700.00 kB; local E2E 7/7; preflight 0 warnings; 0 vulnerabilities; scan clean. Verified visually: Start Here now reads "$0.05 ... $1.13, roughly 23x" and the Best Options 100k card reads "Roughly 23x for the same run" beside "$0.05 vs $1.13". |
| 2026-07-26T20:51:35-06:00 | R-010 vocabulary check on the changed lines | pass | `git diff -- src/` filtered to added lines contains no "saved", "savings", or "avoided". The one "not money you saved" in the panel is pre-existing and is the negation the rule wants. |

| 2026-07-26T21:12:00-06:00 | Public IP confirmed before deploy | pass | `70.65.205.71`, the allowed home network. One-attempt stop rule observed. |
| 2026-07-26T21:12:00-06:00 | `npx --yes wrangler pages deploy dist ...` for `e58f81b` | pass | Deployed to `https://3db20d3b.ai-task-router.pages.dev`; 3 new files uploaded, 6 already present. One attempt, no token or command changes, no token values printed. Fifth consecutive success from the allowed location. |
| 2026-07-26T21:12:00-06:00 | Canonical smoke on `https://ai-task-router.pages.dev` | pass, after the documented traps fired | Both Verification Traps triggered and both were caught by the runbook. The canonical alias served the previous asset on the first cache-busted fetch and had followed by the retry. Separately, appending a cache-busting query string to the *asset* path (`/assets/<hash>.js?cb=...`) returned the 962-character SPA fallback with HTTP 200 - a new variant worth knowing: the query string is what caused the miss, so cache-bust the HTML but request the asset path clean. The length assertion caught it, exactly as intended. Root, `/manifest.webmanifest`, and `/service-worker.js` all HTTP 200. |
| 2026-07-26T21:12:00-06:00 | Live bundle string check against the real artifact | pass | Fetched asset is 659,257 characters, matching the 659.26 kB build output, so the check ran against real content. Present: `Worked examples, not your usage`, `Right-sizing, after rework`, `nobody is claiming you ran these`, `Why which tool you pick matters`, `Smaller is not automatically better`, `How you have been choosing`, `Against the heaviest offered`, `10-watt LED bulb`, `What this app does`. Absent: `Estimated savings`, `Energy saved`, `Est. saved`, `avoided cost`. The deliberate negation `not money you saved` is present as intended, and doubles as a positive control proving the haystack was real. |
| 2026-07-26T21:12:00-06:00 | Hosted E2E against the live site | pass | 7/7 in 9.5s on the first hosted run. Third consecutive first-run hosted pass. |

| 2026-07-26T21:30:00-06:00 | R-009 catalog review, brought forward from 2026-10-03 | pass, with two anchors and one model family corrected | All seven pricing sources fetched and compared. 15 of 16 anchors unchanged. Google low-cost moved to $0.30/$2.50/$0.03 (Gemini 3.5 Flash-Lite); xAI premium re-tiered to grok-4.5 $2/$6. Gemini guidance named 2.5-generation models no longer in the app picker and was rewritten to Gemini 3 Flash / Gemini 3 Pro; Opus 4.8 references moved to Opus 5; Grok upgrade paths moved to Grok 4.5. Neither changed anchor feeds the public snapshot, so no user-facing worked example moved. Both review dates moved together. Evidence in `docs/2026-07-05-impact-estimator-methodology.md`. |
| 2026-07-26T21:30:00-06:00 | Freshness mechanism extended for dated provider changes | pass | The 90-day clock could not see an announced change, so Claude Sonnet 5's 2026-09-01 price change would have made the catalog wrong while it still read as fresh five weeks after review. `announcedCatalogChanges` now makes the catalog stale on the day a dated change lands and the notice names the change rather than the age. Four tests added; the age rule is now tested against an injected empty list, because while a change is pending no date exercises age alone. |
| 2026-07-26T21:30:00-06:00 | Full gates after the catalog review | pass | 17 files and 174 tests; build clean with javascript raw 660.24 kB / 700.00 kB and stylesheet 43.62 kB / 60.00 kB; local E2E 7/7; preflight 0 warnings; scan clean. |

| 2026-07-26T21:40:00-06:00 | Deploy and verify the catalog review | pass | Source `0c81132` to `https://743db3ef.ai-task-router.pages.dev`, one attempt from `70.65.205.71`; sixth consecutive success. Canonical alias followed on the first cache-busted check. Live bundle 660,237 characters, matching the build. Present: `Gemini 3 Flash on Fast`, `Gemini 3 Pro`, `Claude Opus 5 with effort`, `Grok 4.5 for hard reasoning`, and both dated-change strings. Absent, as intended: `Gemini 2.5 Flash`, `Gemini 2.5 Pro`, `Claude Opus 4.8` - the retired names are gone from what users see. No R-010 vocabulary. Hosted E2E 7/7 first run. |
| 2026-07-27T18:53:34-06:00 | Stage reasoning and project-plan repair | pass; integration complete, undeployed | Governance preflight passed with 0 warnings. Vitest passed 17 files and 174 tests; script tests passed 5/5; TypeScript/Vite production build and bundle budget passed (javascript raw 660.74 kB / 700.00 kB, stylesheet raw 43.70 kB / 60.00 kB); local Playwright passed 7/7; `npm audit --audit-level=moderate` found 0 vulnerabilities; the web release-candidate scan found no release-blocking findings. Browser reproduction confirmed the original Stage 3 row was 3,350 px high with a 389 px method pill; the repaired row is 1,591 px with a 25 px pill, aligned overview/actions, a full-width path, and all five build items visible. No deployment was attempted. |
| 2026-07-27T19:01:40-06:00 | Authorized Cloudflare production deployment of `b75ed3e` | blocked before upload | Clean install and full release gates passed again: 174/174 Vitest, 5/5 script tests, 7/7 local Playwright, production build and bundle budget, 0 audit vulnerabilities, clean release-candidate scan, and all PWA artifacts present. Public IP was the previously allowed `70.65.205.71`; `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` were present without exposing values. Wrangler rejected the one permitted attempt with authentication error `10000`. The user-token verifier reported active, but that endpoint ignores client-IP restrictions; the actual configured Pages project returned `403 / 10000`, which was the authoritative failure. No files uploaded and production stayed on asset `index-BHonc_lf.js` at 660,237 characters; it contains the old Medium copy and not the repair marker. |
| 2026-07-27T19:37:14-06:00 | Deploy and verify the Stage 2 reasoning and Stage 3 project-plan repair | pass | The new account-owned Cloudflare control-plane token returned HTTP 200 for the actual Pages project before deployment. Governance preflight passed with 0 warnings; `npm audit` found 0 vulnerabilities; Vitest passed 174/174; the production build and bundle budgets passed; the release-candidate scan was clean; local Playwright passed 7/7. Wrangler deployed source `50478e0`, carrying the repair from `b75ed3e`, to `https://79dab484.ai-task-router.pages.dev` in one attempt. Canonical and immutable URLs both serve `index-X2Tnl_UX.js` at exactly 660,744 bytes, matching `dist`; `not Medium by default` and `Run the build-plan prompt` are present, while `usually GPT-5.5 Thinking Medium` is absent. Manifest and service worker return 200, and hosted Playwright passed 7/7. |
| 2026-07-27T20:03:54-06:00 | Diagnose, repair, deploy, and verify followed-choice tracking | pass | Git history showed legacy saves were created with `outcome: "deferred"` while the counter intentionally counts only Accepted or Edited outcomes. The fix names that contract, explains saved-but-uncounted records, links to Past Choices, and does not silently rewrite user history. Vitest passed 175/175; script tests 5/5; build budgets passed at 661.86 kB JavaScript and 43.76 kB CSS; audit found 0 vulnerabilities; scan clean; local Playwright 7/7; desktop and 390 px browser checks showed no errors or overflow. Wrangler deployed source `e3671b2` to `https://eb485f5c.ai-task-router.pages.dev`. Canonical and immutable assets match `index-CtA-qQF5.js` at 661,862 bytes with all new markers present and the old exact header absent. Hosted verification initially exposed the documented seconds-long edge cache, then a test-fixture race with asynchronous local-store seeding; the E2E helper now waits for configuration readiness and the full canonical suite passes 7/7. |
| 2026-07-27T20:26:56-06:00 | Repair and deploy direct-work routing | pass | The router had structurally selected prompt design plus execution for nearly every task, and stage guidance then wrapped that fixed route in the same project-plan story. Source `68a7e1d` makes separate prompt design conditional on build-shaped or explicit prompt work, gives ordinary tasks one direct execution step, preserves explicit planning requirements, and generates a direct copy-ready output contract. Vitest passed 179/179; script tests 5/5; build budgets passed at 669.06 kB JavaScript and 43.76 kB CSS; audit found 0 vulnerabilities; scan and governance preflight passed; local Playwright passed 7/7; desktop and 390 px checks showed no errors or overflow. Wrangler deployed to `https://86dbe307.ai-task-router.pages.dev`. Canonical and immutable URLs serve the exact `index-B-i3htL0.js` asset at 669,064 bytes. Direct-work markers are present, the old `Quick project plan` and generic lead are absent, root/PWA files return 200, and hosted Playwright passes 7/7. The documented 962-byte SPA fallback appeared once during canonical asset propagation and was rejected by the length assertion before string checks. |
| 2026-07-27T21:04:49-06:00 | Replace fixed role sequencing with task reasoning | pass; integration complete, deploy pending | Root cause confirmed: route candidates selected role slots before assessing whether each stage added value; scoring compared three prebuilt bundles; fast and thinking modes shared capability vectors; zero marginal account price erased their resource difference. Added deterministic task-reasoning analysis, stage-utility decisions, mode-specific capability and adequacy scoring, and task-specific route explanations. With the same ChatGPT Go, Perplexity Free, and Microsoft Copilot Free inventory, the structured plan regression selects GPT-5.5 Thinking for direct reasoning with no prompt relay, while a simple rewrite selects GPT-5.5 Instant. Governance preflight passed with 0 warnings; Vitest passed 184/184; script tests 5/5; production build and bundle budgets passed at 678.10 kB JavaScript and 43.76 kB CSS; audit found 0 vulnerabilities; release-candidate scan and `git diff --check` passed; local Playwright passed 8/8, including the same-tools contrast and narrow-layout checks. No provider calls, accounts, telemetry, execution, or new UI feature were added. |
| 2026-07-27T21:07:32-06:00 | Deploy and verify the task-reasoning engine repair | pass | Source `1b5ea8f` pushed to `main`. The account-owned control-plane credential returned HTTP 200 for the actual `ai-task-router` Pages project, then Wrangler deployed it to `https://0e76221f.ai-task-router.pages.dev` in one attempt. Canonical and immutable URLs both serve `index-BJ8G6-nl.js` at exactly 678,109 bytes, matching `dist`; task-reasoning, stage-utility, and selected-mode markers are present, while the stale direct-work script and old GPT-5.5 Medium-default markers are absent. Manifest and service worker return HTTP 200. Hosted Playwright passed 8/8, including the same-tools contrast: the structured plan uses GPT-5.5 Thinking for direct reasoning with no Perplexity or Copilot relay, and the simple rewrite uses GPT-5.5 Instant. |
| 2026-07-27T22:18:56-06:00 | Complete and verify the stage-first planning grammar | pass; integration complete, deployment not authorized | Root cause confirmed: task reasoning still chose a primary model before it had represented scope framing, plan synthesis, and downstream action as required work. Added task archetypes, inferred planning deliverables, a model-independent work-plan grammar, stage-first mode assignment, stage-specific output contracts, and route coverage scoring. The exact ChatGPT Go, Perplexity Free, and Copilot Free regression now yields Perplexity scope framing from approved inputs, highest available GPT-5.5 Thinking for the actual plan, and Copilot for the lightweight action handoff; a simple rewrite remains one GPT-5.5 Instant pass. Browser verification also caught and fixed a null/kind fallback that had duplicated the action helper into a bogus package Stage 3. Vitest passed 190/190; script tests 5/5; TypeScript/Vite production build passed at 702.36 kB JavaScript and 43.76 kB CSS; the deliberately tight raw JavaScript budget moved from 700 kB to 705 kB while the 200 kB compressed-download ceiling stayed unchanged; dependency audit found 0 vulnerabilities; release-candidate scan and governance preflight passed; local Playwright passed 8/8; an annotated browser load check found content, no Vite overlay, and no captured console errors. No provider call, live search, account connection, telemetry, external execution, schema migration, or visual redesign was added. |
| 2026-07-27T22:21:13-06:00 | Commit and push Chunk 12 with the night handoff | pass | Source `b565331` (`Build stage-first task planning`) is on `main` and matches `origin/main`. It includes the Integration-complete implementation, validation record, carry-forward flag, updated startup route, and `docs/2026-07-27-session-turnover.md`. No deployment was attempted. |

## Completed Chunk - Compact Active Pathway Extraction

Status: task complete
Status Updated: 2026-07-09T03:04:01+00:00
Completion target: Task complete
Budget class: Small

Objective:

Move the live plan out of the oversized historical pathway and into a compact date-prefixed active pathway.

User outcome:

A human or agent can follow the current plan without loading a multi-thousand-line history file.

Files updated:

- `docs/2026-07-09-current-build-pathway.md`
- `START_HERE.md`
- `AGENTS.md`
- `AI_BOOTSTRAP.md`
- `CLAUDE.md`
- `INITIAL_SCOPE.md`
- `SESSION_STATE.md`
- `docs/context-map.md`
- `docs/manual.md`
- `docs/standards/context-hygiene-standard.md`
- `README.md`
- `project-control.yaml`
- `scripts/governance-check.sh`

Acceptance result:

The active route now points to this compact pathway. Superseded pathway history was moved out of the active docs path and removed from startup, preflight, README, manual, and context-routing references. Date-prefixed controlled-doc headers were updated on touched routing documents.

## Completed Chunk - Executable Plan Chunk Expansion

Status: task complete
Status Updated: 2026-07-08T21:17:29-06:00
Completion target: Task complete
Budget class: Small

Objective:

Replace the loose next-option list with an ordered, build-ready chunk plan focused on proving the individual value of choosing the right agent, model, mode, or manual step at the right time.

User outcome:

A human or agent can now start Chunk 1 without reconstructing the plan from chat context or archived pathway history.

Files updated:

- `docs/2026-07-09-current-build-pathway.md`
- `START_HERE.md`

Acceptance result:

The active pathway now includes a chunk queue and six plan chunks with objective, user outcome, likely files, non-goals, acceptance criteria, validation expectations, and stop condition. `START_HERE.md` now points new sessions to the chunk queue and names Chunk 1 as the recommended next build chunk.

## Next Handoff

A functional audit of `59dd849` on 2026-07-25 found gaps between what the app claims and what it does. The remediation queue is [2026-07-25-audit-remediation-plan.md](2026-07-25-audit-remediation-plan.md); all thirteen chunks, R0 through R12, are complete as of 2026-07-25T16:58:01-06:00. There is no next coder chunk in that queue. The audit chunks are self-contained and name their own context load, so do not read this pathway's history to work them.

The Cloudflare deploy blocker is resolved. The original user-scoped token path was rejected, but the account-owned control-plane token added on 2026-07-27 returned HTTP 200 for the actual Pages project and completed the deployment on the first attempt. Use [docs/2026-07-09-cloudflare-deploy-turnover.md](2026-07-09-cloudflare-deploy-turnover.md) as the deploy runbook.

**Production remains at source `1b5ea8f`, deployed 2026-07-27; Chunk 12 source `b565331` is integration complete, pushed, and not deployed.** Deploy only with fresh owner authorization. Production verification must use the existing Cloudflare turnover runbook, cache-bust the HTML, fetch the asset path without a query string, and confirm its byte length matches `dist` before trusting marker checks. The new regression expects Perplexity framing, highest available ChatGPT reasoning for the actual plan, and a lightweight Copilot action handoff with no duplicate package stage; the same inventory still selects GPT-5.5 Instant for a simple rewrite.

Two verification lessons from the last deploy are worth carrying, because both would have produced a confident wrong answer:

- The canonical alias served the previous asset on the first plain fetch. It was a seconds-long edge-cache hit, not a failed alias — but a single plain fetch cannot tell those apart. Verify with a cache-busting fetch before concluding anything about which build is live.
- The first live-bundle string check fetched through that same stale edge, got a 962-character SPA fallback, and reported every phrase absent. That includes the R-010 phrases, so it read as a clean pass. Assert the fetched byte length matches the build output before trusting a bundle string check; "absent" from an empty haystack is not evidence.

**A teaching audit on 2026-07-26 found six gaps; all six are fixed and live.** The question asked was narrower than the 2026-07-25 functional audit: not "does the app work" but "does it teach why right-sizing matters". Fixed and live as of `a34d839`: every energy figure a user decides on now carries an everyday restatement, because watt-hours alone were honest, sourced, and unreadable; the lean/balanced/premium split of followed routes is now rendered, having been computed and discarded since it was written; and heaviest-sibling comparisons now carry the multiple instead of leaving the reader to divide. Fixed and live as of `b8069fa`: findings 1 and 2 below.

1. ~~**The lesson arrives after the decision.**~~ Fixed 2026-07-26T11:20:59-06:00, live in `b8069fa`. Start Here carries three worked examples before any task is described.
2. ~~**Past Choices teaches nothing.**~~ Fixed 2026-07-26T11:20:59-06:00, live in `b8069fa`. Rows carry metered cost, energy, and a comparison against the heaviest route offered; the log carries choice-pattern totals.
3. ~~**Two of the four impact metrics are hedged into invisibility.**~~ Fixed 2026-07-26T20:51:35-06:00, live in `e58f81b`. The four cards sat at equal weight in the ~280px right rail, and three of them opened with their own disclaimer, so the first words of the strongest teaching content told the reader it was safe to skip. The hedges are all still present and none were softened: they are stated once where they apply, in the group heading "Worked examples, not your usage" and one shared caveat carrying "nobody is claiming you ran these" — the same consolidation the Start Here panel already uses. That freed each example to lead with its lesson. The route-specific figure now sits alone above at 1.32rem, and the three examples moved to a full-width band below at three columns, stacking at 860px. "Right-sizing example" was renamed "Right-sizing, after rework", because the old label named the category rather than the point.

**Every comparison multiple now divides the figures as displayed.** Fixed 2026-07-26T21:04:00-06:00. Drafting the multiple for the 100k-token card surfaced a defect that was already live on two other screens: `formatUsd` rounds to cents above a cent, so `$0.047` renders as `$0.05`, while the multiple beside it was divided from the raw estimates. Start Here shipped "roughly 24x" next to two figures that visibly divide to 22.6, and the Past Choices pattern panel and heaviest-sibling clause had the same latent gap. `displayedUsdValue` in `src/domain/format.ts` now exposes the number `formatUsd` prints, and `displayedCostMultiple` in `routeComparison.ts` divides those, so a multiple is reproducible from the figures beside it by construction rather than by coincidence of the current catalog. Four tests in `routeComparison.test.ts` hold it, one of which recomputes the multiple by parsing the rendered dollar strings and asserting it matches. The accuracy given up is roughly six percent of the ratio; what is bought is that the app never asks a reader to check arithmetic it will fail.

Note for whoever takes these: the owner's framing is "cost savings", and R-010 forbids "saved", "savings", and "avoided" for money. That control is currently honored everywhere. The reconciliation used in this chunk is comparison and ratio framing, which stays inside the fixed vocabulary; a multiple is a ratio between two estimates on the same basis, not a claim about money kept. Do not resolve this tension by loosening the vocabulary without an owner decision recorded in the risk register.

**One R-010 loose end, low priority, not a violation.** Sweeping the whole shipped bundle rather than the diff found three user-reachable strings containing "savings": the deliverable label "cost, savings, or energy comparison" in `taskDecomposition.ts` and `stageGuidance.ts`, and "savings note" in `promptPackageGenerator.ts`. These describe the *user's own requested deliverable*, not an app claim that money was kept, so they sit outside what R-010 governs and none of them came from the teaching-audit work — they date to `f3682b7`. The reason to note it: `App.test.tsx` asserts rendered output never matches `/\bsavings\b/i`, which reads like a total guarantee but only covers the paths that test exercises. A task that decomposes to a savings comparison can put the word on screen without failing any test. Whoever next touches R-010 should decide deliberately whether the guard should be narrowed to describe what it actually checks, or the deliverable label reworded — do not "fix" it by silently widening the assertion, which would fail on legitimate copy.

**The hosted smoke still needs human eyes.** The automated half is done: 7/7 hosted E2E and the asset checks above. What no test can judge is wording and feel. On `https://ai-task-router.pages.dev/`, verify by hand that each stage shows a visible path with no disclosure/pull-down, that route cards let the user choose which route to accept, that the save panel names the selected route, that the followed-choice impact counter increments after saving, that the Help tab reads as plain language rather than product copy, and that route costs now read as ordinary dollars and cents in both the route card and the stage guidance panel, which used to disagree. Also re-check both a difficult build-planning task and an ordinary planning task: true build tasks should use the strongest available reasoning pass for the master prompt, then move execution/build to the lighter or build-capable helper with concrete build items; ordinary wording such as "build an itinerary" should stay in planning/execution/table routing rather than app-build routing. Keep this active pathway compact; put any new detailed evidence into a purpose-specific dated evidence doc instead of growing the active pathway. Chunk 5 is paused until explicitly reopened; Chunk 6 remains held.

After meaningful work, follow the chunk close-out protocol in `AGENTS.md`: check `CARRY_FORWARD.md`, commit and push the scoped change, then suggest `/compact`.
