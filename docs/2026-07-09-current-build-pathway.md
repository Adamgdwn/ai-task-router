# 2026-07-09T03:04:01+00:00 - Current Build Pathway

Document ID: PATH-ENG-002
Version: 1.3.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-09
Last Reviewed: 2026-07-08
Next Review: During the next substantial build session
Last Updated: 2026-07-08T22:09:06-06:00
Status Updated: 2026-07-08T22:09:06-06:00

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
| Browser/PWA app | live | Production URL: `https://ai-task-router.pages.dev/`. |
| Old Skool AI hub | live | Public hub: `https://oldskoolai.com/ai-task-router/`; security route: `https://oldskoolai.com/security/`. |
| Public desktop downloads | held | Windows Store/MSIX is the preferred first trusted Windows path; ordinary-user downloads remain gated. |
| PDCA planning simplification | task complete | Visible planning now uses `Plan`, `Do`, `Check`, `Act`; expanded routing detail shows helper/model/mode and upgrade trigger. |
| Compact active pathway extraction | task complete | The active pathway is now this compact file; the long `2026-07-03` pathway is archive-only. |
| Retired pathway de-reference | task complete | No active docs, required-doc lists, or governance checks reference the retired pathway filename. |
| Active chunk | Chunk 4 draft complete | Reviewed methodology draft is complete; next recommended build chunk is Chunk 5. |

## Product Boundary

The project is an AI decision-support web application, not an autonomous AI agent.

The MVP may recommend routes, generate route cards, generate prompt packages, save route decisions locally, capture local feedback, and export artifacts.

The MVP must not call provider APIs, connect accounts, store credentials, perform live source search, index files, execute external actions, send prompts, deploy, publish, purchase, or automate work outside the app.

## Held Scope

Do not start any of these without a separate approved chunk and release-gate evidence:

- public desktop downloads, GitHub Release artifacts, signing workflows, updater flows, or ordinary-user installers
- social posts, custom-domain or DNS changes, exact public savings claims, live pricing tables, or live model fetches
- provider account connections, telemetry, remote sync, authentication, external execution, or server-side planning
- Partner Center secrets, identity documents, tax or banking details, private account screenshots, or public Store submission actions

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

The next work should prove the product promise for an individual user: the app helps them pick the right helper, model, or mode at the right stage, then gives them a practical handoff they can use outside the app.

Keep each chunk small enough to finish, validate, commit, and hand off without loading archived pathway history.

## Chunk Queue

| Order | Chunk | Status | Completion target | Why it matters |
|---:|---|---|---|---|
| 1 | Individual power story audit | task complete | Task complete | Confirms the app and public docs explain the personal value clearly before adding more surface area. |
| 2 | Right-agent UX proof slice | integration complete | Integration complete | Makes the live recommendation flow visibly show which helper or mode belongs at each stage. |
| 3 | Decision Card and prompt handoff polish | integration complete | Integration complete | Ensures exports carry the same staged agent-choice logic into the user's real workflow. |
| 4 | Reviewed methodology page | draft complete | Draft complete | Gives cautious, sourced backing for routing and impact claims without pretending to have live pricing. |
| 5 | Opt-in local estimator UI | next | Draft complete | Lets users explore local, caveated impact estimates without telemetry or provider connections. |
| 6 | Windows Store/MSIX trust slice | held | Draft complete | Keeps the trusted desktop lane moving only after the web/product story is clear. |

## Plan Chunks

### Chunk 1 - Individual Power Story Audit

Status: task complete
Status Updated: 2026-07-08T21:46:17-06:00
Completion target: Task complete
Budget class: Small

Objective:

Audit the current app copy, README, manual, product brief, and public-facing docs for one clean story: an individual uses AI Task Router to choose the right agent, model, mode, or manual step for each stage of a task.

User outcome:

A first-time individual user can understand why the router is useful before they care about governance, desktop packaging, or internal release history.

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
- no desktop release work

Acceptance criteria:

- The user-facing story names the practical value as choosing the right helper at the right time.
- Any copy that over-emphasizes governance, internal chunks, or release machinery is moved out of the primary user path or softened.
- The product boundary still says the app recommends and packages guidance; it does not execute.
- The next code or docs chunk can be selected without rereading archived pathway history.

Validation expectations:

- Run `rg` checks for stale or misleading terms such as autonomous-agent language, exact savings claims, and public desktop release wording.
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

Status: draft complete
Status Updated: 2026-07-08T22:09:06-06:00
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

The methodology page now opens with a date-prefixed controlled-doc title and a concise stage-first method: split work into Frame/Gather/Create/Package/Review/Act, apply hard gates, choose the lightest safe helper, show checks and upgrade triggers, and keep outside action manual. Impact math remains as bounded local decision-support scenarios with source snapshot rules, no live pricing fetches, no exact per-user savings claims, and explicit owner/source-refresh gates before public numbers.

### Chunk 5 - Opt-In Local Estimator UI

Status: planned
Status Updated: 2026-07-08T21:17:29-06:00
Completion target: Draft complete
Budget class: Medium

Objective:

Add a user-controlled estimator surface that explains local impact assumptions without sending data anywhere.

User outcome:

The user can see why smaller adequate routes may save time, cost, or compute, while understanding that the numbers are estimates and not guarantees.

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

### Chunk 6 - Windows Store/MSIX Trust Slice

Status: held
Status Updated: 2026-07-08T21:17:29-06:00
Completion target: Draft complete
Budget class: Medium

Objective:

Advance the trusted Windows desktop lane only after the web story and staged recommendation proof are clean.

User outcome:

The eventual desktop path is credible and trust-first, without exposing ordinary users to unsigned or unclear downloads.

Likely files:

- `docs/2026-07-06-windows-store-trust-prep.md`
- `docs/release/windows-store-package-identity.template.json`
- `scripts/prepare-windows-store-manifest.mjs`
- desktop release evidence and gate scripts

Non-goals:

- no public desktop download
- no Partner Center secrets, identity documents, tax, banking, or private screenshots in repo
- no updater or signing workflow unless separately approved

Acceptance criteria:

- Any work stays within proof, template, or gate preparation.
- Public desktop release gates continue to fail without real trust evidence and owner approval.
- Web/PWA remains the public user path.

Validation expectations:

- Run relevant desktop prep/gate commands only for the selected slice.
- Run `git diff --check`.
- Run broader tests only if shared app code changes.

Stop condition:

Stop before public submission, publishing, or any secret/private account handling.

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
| 2026-07-08T22:09:58-06:00 | `rg -n "Chunk 4 is draft complete\|next recommended build chunk is Chunk 5\|Immediate next chunk is Chunk 5\|\| 5 \| Opt-in local estimator UI \| next" START_HERE.md docs/2026-07-09-current-build-pathway.md` | pass | Startup and active pathway now route future work to Chunk 5. |
| 2026-07-08T22:09:58-06:00 | retired pathway filename search | pass | No references remain to the retired pathway filename. |
| 2026-07-08T22:09:58-06:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |

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

Immediate next chunk is Chunk 5, the opt-in local estimator UI slice, starting at the Plan Chunks section above. Keep this active pathway compact; put any new detailed evidence into a purpose-specific dated evidence doc instead of growing the active pathway.

After meaningful work, follow the chunk close-out protocol in `AGENTS.md`: check `CARRY_FORWARD.md`, commit and push the scoped change, then suggest `/compact`.
