# 2026-07-09T03:04:01+00:00 - Current Build Pathway

Document ID: PATH-ENG-002
Version: 1.6.12
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-09
Last Reviewed: 2026-07-25
Next Review: During the next substantial build session
Last Updated: 2026-07-25T16:58:01-06:00
Status Updated: 2026-07-25T16:58:01-06:00

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
| Browser/PWA app | live, one chunk behind `main` | Production URL: `https://ai-task-router.pages.dev/`; latest deployment `https://7c570b1d.ai-task-router.pages.dev` from source `ab329e5`, which carried the audit remediation work from R1, R2, R3, R4, R5, R10, R11, and R12. R6, R7, R8, and R9 landed after that deploy. R7 is user-visible, so the live Help tab still shows the developer placeholder until the next deploy. |
| Old Skool AI hub | live | Public hub: `https://oldskoolai.com/ai-task-router/`; security route: `https://oldskoolai.com/security/`. |
| Public desktop downloads | held | Windows Store/MSIX is the preferred first trusted Windows path; ordinary-user downloads remain gated. |
| PDCA planning simplification | task complete | Visible planning now uses `Plan`, `Do`, `Check`, `Act`; expanded routing detail shows helper/model/mode and upgrade trigger. |
| Owner routing feedback | task complete | Cost chart points now expose hover/focus values; routing detail shows explicit decisions, reasons, checks, and upgrade triggers; complex build requests split build-stage detail into concrete build items instead of collapsing into prompting only. Average-person routing probes now keep ordinary phrases like "build an itinerary" out of software-build routing unless the task asks for an app, tool, code, automation, workflow, or build slice. Best Options now shows stage paths without a hidden disclosure, lets the user choose which route to accept, and counts accepted saved routes in local followed-choice impact. |
| Compact active pathway extraction | task complete | The active pathway is now this compact file; the long `2026-07-03` pathway is archive-only. |
| Retired pathway de-reference | task complete | No active docs, required-doc lists, or governance checks reference the retired pathway filename. |
| Active chunk | Audit queue complete, undeployed | Chunk R0 is complete as of 2026-07-25T16:28:35-06:00. The blocker was network location, not the token or the build: Cloudflare rejected the token from public IP `184.67.69.66` with code `9109`, and the same token, command shape, and secure env file succeeded unchanged from the owner's home network at public IP `70.65.205.71`. Production now serves source `ab329e5`. Nothing in the app, the build, or the token was modified to make this work. R7 then replaced the Help placeholder with a real screen, R6 added the catalog staleness signal, R9 made the tool frequency question honest, and R8 added cold-path E2E coverage. All four are on `main` and not yet deployed. The whole audit remediation queue, R0 through R12, is now complete. |

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
| 6 | Windows Store/MSIX trust slice | held | Draft complete | Keeps the trusted desktop lane moving only after the web/product story is clear. |
| 7 | Audit remediation queue (R0-R12) | complete | Integration complete | Closes the gaps found by the 2026-07-25 functional audit between what the app claims and what it does. R0 (deploy current `main`), R1 (artifacts follow the chosen route), R2 (honest impact numbers), R3 (first-run honesty), R4 (clean the copied prompt text), R10 (reframe the product promise), R11 (price each step by the model it names), and R12 (name the lean style by what it actually does), R5 (dead code and lint feedback loop), R6 (catalog staleness signal), R7 (help screen), R9 (resolve the frequency question), and R8 (real first-run E2E coverage) are complete. All thirteen chunks are done. R0 shipped all of the above to production, so the remediation work is now visible to users rather than sitting on `main`. The docs now say the app recommends a tier and a shape of work, not a vendor, and use one impact vocabulary shared with the app UI. Each step is now priced against the model that step tells the user to open, and the per-step figures are shown so a route total can be checked against its parts. Cost figures are now API-equivalent per-token estimates shown beside what is actually billed, and no surface claims the user saved money. R5 removed 388 lines of unreachable code and turned on `noUnusedLocals` and `noUnusedParameters`, so unused code now fails `npm run build`; it changed nothing a user sees. R7 replaced the developer placeholder on the Help tab with a real screen explaining what the app does, what it will never do, what the three routes and the numbers mean, and where saved choices live, and deleted `PlaceholderScreen` with it. R6 gave the app a way to admit its model knowledge is ageing: catalog age is computed from the review dates already recorded beside the catalogs, and Best Options shows a notice past 90 days telling the user to check their tool's current model list. The catalog is 20 days old, so the notice is correctly silent today. Two risks were added to the register, R-009 for recommendation-quality drift with a 90-day review cadence and R-010 for impact-claim accuracy. R9 resolved the setup question that collected how often each tool is used and then changed nothing: the app no longer computes a `preferredModelId` from it, and the setup screen now says plainly that account level shapes recommendations while frequency is the user's own note. A guard test asserts routing decisions are identical whether every tool is marked rarely used or used many times a day. R8 closed the last gap with a cold-path E2E test that injects nothing into IndexedDB: it routes once before any tool exists to prove the app admits the plan is manual, then adds ChatGPT Plus through the picker, describes a task in free text, and checks the saved decision card names the tool the user actually chose. Owner decisions on impact framing and product promise are recorded; no chunk is blocked on input. Detail lives in `docs/2026-07-25-audit-remediation-plan.md`. |

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

The Cloudflare deploy blocker is resolved. It was the network location the token was used from, not the token or the build, and the recovery path in [docs/2026-07-09-cloudflare-deploy-turnover.md](2026-07-09-cloudflare-deploy-turnover.md) worked unchanged from the owner's home network. Use that note as the deploy runbook.

**There is undeployed user-visible work on `main`.** R7's Help screen is not live; production still shows the developer placeholder on that tab. R6's catalog staleness notice is also undeployed, though it is silent until the catalog passes 90 days on 2026-10-03. R8 and R9 are test and internal work with no user-visible surface. Deploying is an owner decision, so a coder chunk should leave it alone and say so in its handoff rather than deploying on its own.

At the next deploy, alongside the hosted smoke in the runbook, verify by hand what the E2E suite cannot judge: that each stage shows a visible path with no disclosure/pull-down, that route cards let the user choose which route to accept, that the save panel names the selected route, that the followed-choice impact counter increments after saving, and that the new Help tab reads as plain language rather than product copy. Also re-check both a difficult build-planning task and an ordinary planning task: true build tasks should use the strongest available reasoning pass for the master prompt, then move execution/build to the lighter or build-capable helper with concrete build items; ordinary wording such as "build an itinerary" should stay in planning/execution/table routing rather than app-build routing. Keep this active pathway compact; put any new detailed evidence into a purpose-specific dated evidence doc instead of growing the active pathway. Chunk 5 is paused until explicitly reopened; Chunk 6 remains held.

After meaningful work, follow the chunk close-out protocol in `AGENTS.md`: check `CARRY_FORWARD.md`, commit and push the scoped change, then suggest `/compact`.
