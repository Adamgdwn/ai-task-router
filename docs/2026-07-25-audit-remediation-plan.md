# 2026-07-25T08:17:12-06:00 - Audit Remediation Plan

Document ID: PATH-ENG-004
Version: 1.1.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-25
Last Reviewed: 2026-07-25
Next Review: When chunk R4 completes or the owner reprioritises
Last Updated: 2026-07-25T08:27:12-06:00
Status Updated: 2026-07-25T08:27:12-06:00

## Purpose

This is the remediation queue from the 2026-07-25 functional audit of `59dd849`. It exists so a coder agent can pick up any single chunk, load only the files named in that chunk, finish it, validate it, and hand off — without reading the audit conversation or the archived pathway history.

Use with the active pathway, [2026-07-09-current-build-pathway.md](2026-07-09-current-build-pathway.md). This file holds the detail; the active pathway holds the status pointer.

## Audit Summary

The safety machinery is sound: hard gates hold under pressure, the no-execution boundary is real, and the generated prompt packages are genuinely useful. The gaps are in what the app *claims* versus what it *does*:

1. Saved artifacts describe the recommended route, not the route the user chose.
2. Cost and energy savings are measured against a premium API baseline the user was never going to pay.
3. A first run with zero tools configured produces a confident, scored route and a savings claim with no warning.
4. Internal slot IDs leak into the prompt text users copy.
5. The tool-usage-frequency question affects nothing.
6. Model names and pricing anchors are hardcoded with no staleness signal.
7. The Help tab ships a developer placeholder.
8. ~200 lines of dead code in the core routing file; no linter; the real first-run path is not covered end to end.

## Scope Rules For Every Chunk

Applies to all chunks below. Do not restate; do not deviate without a new approved chunk.

Non-goals:

- do not redesign the routing engine, scoring weights, or capability model
- no provider API calls, live pricing fetches, live model-menu fetches, telemetry, account connections, or execution
- no public posting, social launch, custom-domain changes, or desktop release work
- no new artifact formats, no schema-breaking changes to saved records
- prefer small diffs; do not move or rename core files

Context discipline:

- open only the files listed in the chunk's Context Load
- do not load archived pathway history or unrelated evidence docs
- run only the validation named in the chunk, plus `git diff --check`

Close-out for each chunk:

1. Update this file's chunk Status and add an Acceptance Result.
2. Add rows to the Validation Log below.
3. Follow the chunk close-out protocol in `AGENTS.md`.

## Chunk Queue

| Order | Chunk | Status | Budget | Why it matters |
|---:|---|---|---|---|
| R0 | Deploy current `main` | blocked - operator | Small | The fixes already written are not in front of users. |
| R1 | Artifacts follow the chosen route | not started | Medium | Correctness: the saved card currently documents a different plan than the user accepted. |
| R2 | Honest impact numbers | not started - decision recorded | Medium | Credibility: the app currently credits users with savings they did not make. |
| R3 | First-run honesty | not started | Small | A new user with no tools gets a confident answer built on an empty inventory. |
| R4 | Clean the copied prompt text | not started | Small | Internal IDs appear in the product's flagship deliverable. |
| R5 | Dead code and lint feedback loop | not started | Small | Removes ~200 lines of unreachable routing code and closes the missing feedback loop. |
| R6 | Catalog staleness signal | not started | Small | Hardcoded model names decay monthly with nothing to notice it. |
| R7 | Help screen | not started | Small | A developer placeholder is live in production nav. |
| R8 | Real first-run E2E coverage | not started | Medium | The journey every real user takes is not tested end to end. |
| R9 | Resolve the frequency question | not started | Small | Users answer a question that changes nothing. |
| R10 | Reframe the product promise | not started | Small | Docs promise provider-level judgement the engine does not have; the product's real value is teaching lower-impact choices. |

Recommended order: R0 (operator, parallel) → R1 → R3 → R4 → R2 → R10 → R5 → R7 → R6 → R9 → R8.

R1, R3, R4 are the user-visible correctness wins and are cheap. R2 is the most valuable, and its owner decision is now recorded below, so it is ready to start. R10 lands directly after R2 because both change user-facing copy about impact. R5 through R9 are hygiene and can be reordered freely.

Every chunk serves one end goal, recorded by the owner on 2026-07-25: teach and guide people toward more efficient, lower-impact AI decisions, with as little friction as possible. If a change makes the app more accurate but harder to get through, it is the wrong change.

---

## Chunk R0 - Deploy Current `main`

Status: blocked - operator
Budget class: Small

This is operator work, not coder work. No code changes.

Production serves `9639840`. Current `main` is `59dd849`. The undeployed delta includes functional commit `f8e0a40` and `f673c44`, which add the route-selection UI and visible routing detail. Until this deploys, R1 through R9 are invisible to users.

Follow [2026-07-09-cloudflare-deploy-turnover.md](2026-07-09-cloudflare-deploy-turnover.md) exactly. Do not retry from public IP `184.67.69.66`.

Note: `npm audit --audit-level=moderate` now reports 1 high finding (postcss, build-time only). The turnover checklist includes that command. Either clear it in R5 first or record the finding and proceed; it is a dev-dependency advisory, not a shipped-code risk.

---

## Chunk R1 - Artifacts Follow The Chosen Route

Status: not started
Budget class: Medium

Objective:

Make the Decision Card, stage guidance, and prompt package describe the route the user actually selected, not the route the app recommended.

User outcome:

A user who picks the Lean route and saves it gets a card and prompts for the Lean route.

Defect:

`useTaskRouting.ts` builds `promptPackage` from `scoringResult.recommendedCandidate` at generate time. `routeCardGenerator.ts` builds `stageGuidance` from `recommendedOption`. `selectRouteOption` changes only `selectedRouteOptionId`; neither artifact regenerates. Verified: selecting the Lean route (manual, do-it-yourself) still saves a card and prompt package describing the Balanced route (ChatGPT Plus, two model steps).

Context load:

- `src/ui/state/useTaskRouting.ts` (lines ~230-360)
- `src/domain/routing/routeCardGenerator.ts` (lines ~30-80)
- `src/tests/unit/routeCardGenerator.test.ts`
- `src/tests/unit/App.test.tsx`

Change:

Regenerate `promptPackage` and `stageGuidance` for the currently selected option. Two viable shapes; pick the smaller diff:

- (a) rebuild both inside `selectRouteOption`, storing them on the existing `routeResult`, or
- (b) rebuild both inside `saveGeneratedRoute` before persisting, from the selected option.

Prefer (a) so the on-screen stage guidance updates when the user switches routes — otherwise the screen keeps showing the recommended route's stages while the save panel names a different one.

Keep `recommendedOptionId` on the card as-is; it is still meaningful as "what we suggested." The card should be able to show both "recommended" and "you chose" without ambiguity.

Acceptance criteria:

- Selecting a non-recommended route updates the visible stage guidance before saving.
- The saved route card's `stageGuidance` and `promptPackage` match the selected option's steps.
- `recommendedOptionId` still records the app's own suggestion.
- The manual-review fallback route still produces a coherent card.
- No schema change to `routeCardSchema` or `promptPackageSchema`.

Validation:

- `npm run test -- routeCardGenerator App promptPackageGenerator`
- `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium`
- `npm run build`
- `git diff --check`

Add a regression test: generate a route with three options, select a non-recommended one, assert the resulting prompt package step count and model IDs match that option.

Stop condition:

Stop when the selected route drives the artifacts. Do not change scoring, tie-breaking, or which route gets recommended.

---

## Chunk R2 - Honest Impact Numbers

Status: not started - owner decision recorded, ready to start
Budget class: Medium

Owner decision, 2026-07-25T08:27:12-06:00: option (1), with the comparison number kept and reframed. Every cost figure is presented as an API-equivalent per-token estimate — "if you were paying per token, this route would cost about X" — never as money the user saved. Subscriptions mask real per-task cost, and making that hidden cost visible is the teaching point. Options (2) and (3) are not taken.

Objective:

Stop reporting savings the user did not make, and show instead what each route would cost if it were metered per token, so the user learns the real shape of the choice.

Defect:

`routeEconomics.ts` sets the comparison baseline to `openai-premium-text-anchor` at a 100k-token run ($1.125) whenever the user's routes cost less. Observed outputs:

- Fresh install, zero tools, manual route: `cost=$0 saves=$1.125 (100%) energy saved=21.366Wh`. The user is doing the work by hand and is credited with saving money and energy.
- ChatGPT Plus user, blog post: Lean $0 / Balanced $0.051 / Premium $1.237, all three from the same subscription. Real marginal cost is $0 for all three. "You saved $1.19 by choosing balanced" is not true in any sense the user would recognise.

These per-route figures accumulate into the lifetime counter in `impactCounter.ts`. The project correctly gates "exact public savings claims" from launch, but the in-app counter makes that claim privately to every user.

Options:

1. Chosen. Stop calling any figure a saving. Present per-route cost as an API-equivalent per-token estimate, shown for every route including subscription-covered ones, always labelled as "if you were paying per token". Keep the relative comparison between the user's own three routes, since that is the decision the user actually makes. Keep the energy comparison, reduce it to one significant figure, and name the baseline anchor in the UI.
2. Not taken. Keep absolute figures but gate them behind an opt-in "show API-equivalent estimate" toggle, defaulted off, with the baseline named inline.
3. Not taken. Remove the per-route economics display entirely and keep only the followed-choice count.

Context load:

- `src/domain/routing/routeEconomics.ts`
- `src/domain/impact/impactCounter.ts` (lines ~30-60)
- `src/ui/screens/TaskRoutingScreens.tsx` — the "What this route can save" / "Cost and savings" blocks
- `src/ui/screens/ImpactInsightPanel.tsx`
- `src/tests/unit/impactEstimator.test.ts`
- `docs/2026-07-05-impact-estimator-methodology.md`

Change:

- Remove the savings framing from the domain layer and the UI copy. A route reports what it would cost per token, not what the user avoided. Delete or rename any field whose name asserts a saving.
- Keep the API-equivalent figure for subscription-covered routes rather than suppressing it — that number is the lesson. It must read as "if you were paying per token, about X", with the anchor named.
- Reduce displayed precision: `$0.051` and `11.619Wh` imply measurement accuracy that hand-tuned qualitative multipliers do not have. One or two significant figures.
- Fix the lifetime counter the same way. `impactCounter.ts` currently accumulates dollars from a fixed illustrative scenario; it must either accumulate real per-route API-equivalent estimates or be labelled illustrative in the UI.
- Update the methodology doc in the same task so docs and behaviour agree.

Acceptance criteria:

- No screen, card, export, or saved record claims the user saved money. Grep for "saved", "savings", "avoided" and confirm each remaining use is about energy comparison or is removed.
- Every dollar figure reads as an API-equivalent per-token estimate and names its anchor.
- A user whose routes are all subscription-covered still sees the per-token estimate, and it is unambiguous that their subscription already covers the run.
- The lifetime counter no longer accumulates dollars derived from a fixed illustrative scenario, or clearly labels them as illustrative.
- The methodology doc matches the shipped behaviour.
- Held scope respected: still no live pricing fetches and no public savings claims.

Validation:

- `npm run test -- impactEstimator routeCardGenerator App`
- `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` — note the E2E asserts `"Energy saved"`, `"Cost and savings"`, and `"100k-token example"` copy; update those assertions with the copy change
- `npm run build`
- `git diff --check`

Stop condition:

Stop at honest numbers and matching docs. Do not build a new estimator surface — that is the paused Chunk 5 in the active pathway.

---

## Chunk R3 - First-Run Honesty

Status: not started
Budget class: Small

Objective:

Tell a user with no configured tools that they have no configured tools.

Defect:

All eight tool slots default to `enabled: false`. With zero tools, balanced and premium are unavailable and lean is manual-only — but the card shows no warning, reports a score of 83.3, and displays a savings figure. The user gets a confident-looking plan built on an empty inventory.

Context load:

- `src/domain/routing/hardGates.ts` — `evaluateWarnings`
- `src/domain/routing/routeCardGenerator.ts` — `buildCardWarnings`
- `src/ui/screens/TaskRoutingScreens.tsx` — the results header area
- `src/tests/unit/hardGates.test.ts`

Change:

Add a hard-gate warning reason, e.g. `no-tools-configured`, raised when the allowed model set contains only `manual-human-review`. Surface it prominently on the results screen with a direct link back to My AI Tools. Phrase it as what it is: "You have not added any AI tools yet, so this plan is you doing the work by hand. Add your tools to get real routing."

Acceptance criteria:

- Zero-tool routing produces a visible, plain-language warning on the results screen.
- The warning offers a route back to the tool inventory screen.
- The warning does not fire once at least one AI tool is enabled.
- Existing hard-gate warnings are unchanged.

Validation:

- `npm run test -- hardGates App routeCardGenerator`
- `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium`
- `git diff --check`

Stop condition:

Stop at the warning. Do not add an onboarding wizard or block routing. Owner constraint: the warning is inline and non-blocking — no modal, no dialog the user must dismiss, no step between the user and their result.

---

## Chunk R4 - Clean The Copied Prompt Text

Status: not started
Budget class: Small

Objective:

Remove internal slot identifiers from the text users paste into an AI tool.

Defect:

`promptPackageGenerator.ts:431` emits: `Tool/model use: manually use the user-configured route step model ID 'user-mid-synthesis-model' outside the app.` The `inputRefs` line repeats the same ID. `promptStepCopyText` in `RouteArtifactScreens.tsx` copies the whole instruction, so `user-mid-synthesis-model` goes into the user's clipboard and into ChatGPT.

Secondary noise in the same text: `Source-use reminder: no source IDs are approved for this step ... Use only these source IDs for this step: none.` appears on ordinary tasks with no sources, which reads as a malfunction to a normal user.

Context load:

- `src/domain/prompting/promptPackageGenerator.ts` (lines ~200-215, ~420-440, ~550-565)
- `src/ui/screens/RouteArtifactScreens.tsx` (lines ~520-540)
- `src/tests/unit/promptPackageGenerator.test.ts`

Change:

- Replace the raw model ID with the user-facing tool label already available on the route step (`step.label` / mode display label).
- Suppress the source-use reminder when the step has no approved sources, or reduce it to one short sentence.
- Verify the Markdown export path carries the same cleanup.

Acceptance criteria:

- No `user-*-model` slot ID appears in prompt step instructions, `inputRefs`, copied text, or exported Markdown.
- The privacy and allowed-source constraint is still stated when sources exist.
- Prompt steps remain manual guidance only.

Validation:

- `npm run test -- promptPackageGenerator exportImport`
- Add an assertion that generated instruction text does not match `/user-[a-z-]+-model/`
- `git diff --check`

Stop condition:

Stop at text cleanup. Do not restructure the prompt package format.

---

## Chunk R5 - Dead Code And Lint Feedback Loop

Status: not started
Budget class: Small

Objective:

Delete unreachable routing code and turn on the compiler checks that would have caught it.

Defect:

Unreachable in `src/domain/routing/candidateGeneration.ts` (lines ~552-756): `selectPreferredModel`, `primaryModelTiersForStrategy`, `selectPremiumBenchmarkModel`, `buildResearchStep`, `selectResearchModel`, `buildPrimaryStep`, `primaryActionLabel`, `buildArtifactStep`. One carries the comment "Legacy primary route step kept for compatibility with older route construction paths" — there are no such paths. `uniqueLabels` in `taskDecomposition.ts` is also unused. `tsconfig.json` omits `noUnusedLocals` and `noUnusedParameters`; there is no ESLint config or dependency.

Context load:

- `src/domain/routing/candidateGeneration.ts`
- `src/domain/routing/taskDecomposition.ts`
- `tsconfig.json`
- `package.json`

Change:

- Delete the functions above and any imports left unused (`modelLabelWithMinimum`, `modelInstructionGuidance`, `everydayToolFrequencyRank` may become unused here — check R9 first if it is running).
- Enable `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json`. Note `estimateRouteCostUsd` / `estimateRouteEnergyWh` in `routeEconomics.ts` take an unused `_task` parameter; underscore-prefixed parameters are exempt, so this should be clean, but fix anything else the flags surface.
- Run `npm audit fix` for the postcss advisory. Build-time only; verify the build still passes.

Optional, only if the diff stays small: add ESLint with a minimal config. If it pulls in significant configuration, defer to a separate chunk rather than expanding this one.

Acceptance criteria:

- `npm run build` passes with the new compiler flags.
- Full test suite passes unchanged (119 tests at time of writing).
- No behaviour change — this chunk must be a pure deletion plus config.
- `npm audit --audit-level=moderate` is clean, or the remaining finding is recorded with a reason.

Validation:

- `npm run test`
- `npm run build`
- `npm audit --audit-level=moderate`
- `git diff --check`

Stop condition:

Stop when the build is clean under the new flags. Do not refactor live routing code in this chunk.

---

## Chunk R6 - Catalog Staleness Signal

Status: not started
Budget class: Small

Objective:

Make the app admit when its model knowledge is old.

Defect:

Roughly 60 specific model names are hardcoded across `toolModeCatalog.ts` and `providerModeProfiles.ts` — `GPT-5.5 Thinking High`, `Claude Opus 4.8`, `Gemini 2.5 Flash-Lite`, `o3-pro legacy`. `everydayToolCatalogReviewedAt` and `impactCatalogReviewedAt` are both `2026-07-05`. The product boundary correctly forbids live model and pricing fetches, so this catalog only ages. The app states model choices with high confidence ("the highest available GPT-5.5 Thinking level") and has no mechanism to notice when that is wrong.

Context load:

- `src/domain/defaults/everydayToolCatalog.ts` — `everydayToolCatalogReviewedAt` only
- `src/domain/impact/impactEstimator.ts` — `impactCatalogReviewedAt` only
- `src/ui/screens/TaskRoutingScreens.tsx` — results header
- `docs/risks/risk-register.md`

Change:

- Compute catalog age from the existing `reviewedAt` constants and show a quiet notice on the results screen past a threshold (suggest 90 days): "Model and pricing details were last reviewed 2026-07-05. Check your tool's current model menu before relying on specific model names."
- Add two entries to the risk register, which currently has no risk covering either of these: recommendation-quality drift from a stale catalog, and impact-claim accuracy. Attach a review cadence to the first.

Acceptance criteria:

- The staleness notice appears when the catalog is older than the threshold and is absent when it is fresh.
- The notice does not imply the app can fetch current model data.
- Risk register has entries for recommendation quality and impact-claim accuracy with owners and controls.

Validation:

- `npm run test -- App everydayToolCatalog`
- `bash scripts/governance-preflight.sh`
- `git diff --check`

Stop condition:

Stop at the notice and the risk entries. Do not refresh the catalog contents in this chunk — that is a separate, deliberate review pass.

---

## Chunk R7 - Help Screen

Status: not started
Budget class: Small

Objective:

Stop shipping a developer placeholder in production navigation.

Defect:

`screenDefinitions.ts` lines 84-92 define the `reference` screen, which falls through to `PlaceholderScreen` and renders: "Purpose: Keep product language visible to users and future builders. Placeholder State: Future reference pages will mirror the product brief and version-gate diagrams." This is the tab a confused user clicks.

Context load:

- `src/ui/screens/screenDefinitions.ts`
- `src/ui/screens/SetupScreens.tsx` — `PlaceholderScreen`
- `src/App.tsx`
- `docs/manual.md` — source material for the content

Change:

Either write a short real Help screen from the manual and product brief — what the app does, what it will never do, what the routes mean, what the numbers mean, where data is stored — or remove the tab until it exists. Writing it is preferred; the content already exists in the manual and it is the natural home for the boundary explanation.

If the content lands, delete `PlaceholderScreen` and the `placeholderState` field, since `reference` is its last consumer.

Acceptance criteria:

- No screen in production nav renders developer-facing placeholder copy.
- If Help ships, it explains the boundary, the routes, the numbers, and local storage in plain language.
- The `App.tsx` screen-id fallback list stays consistent with `screenDefinitions`.

Validation:

- `npm run test -- App`
- `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium`
- `git diff --check`

Stop condition:

Stop at one screen. No help system, search, or linked reference pages.

---

## Chunk R8 - Real First-Run E2E Coverage

Status: not started
Budget class: Medium

Objective:

Test the journey a real user actually takes.

Defect:

`openAppWithRouteReadyModels` injects the `routeReadyModels` fixture straight into IndexedDB, bypassing the tool-picker UI. The one test that does drive the real picker never proceeds to routing. So the path "open the app, add ChatGPT via the UI, describe a task, get a route, save it" is not covered end to end, and every routing assertion runs against a hand-built inventory that no user produces.

Context load:

- `src/tests/e2e/mvp-workflows.spec.ts`
- `src/tests/fixtures/routeReadyModels.ts`

Change:

Add one test that uses no fixture injection: select a provider and account level through the picker, navigate to My Task, describe a task in free text, generate options, and assert a sensible route appears and saves. Keep the existing fixture-based tests — they are useful for multi-tool scenarios — but this one must prove the cold path works.

While there: the fresh-install case from R3 is worth an assertion too, once R3 lands.

Acceptance criteria:

- At least one E2E test completes the full journey with no IndexedDB injection.
- The test asserts the recommended route names the tool the user actually selected.
- Existing E2E tests still pass.

Validation:

- `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium`
- `git diff --check`

Stop condition:

Stop at one cold-path test. Do not restructure the E2E suite.

---

## Chunk R9 - Resolve The Frequency Question

Status: not started
Budget class: Small

Objective:

Make "How often do you use this tool?" either matter or go away.

Defect:

The setup screen collects a frequency per tool. Its only routing consumer is `everydayToolFrequencyRank` at `candidateGeneration.ts:561`, inside `selectPreferredModel`, which is reachable only from `selectPremiumBenchmarkModel` and `buildArtifactStep` — both dead (see R5). Its only other use is a display hint in `SetupScreens.tsx:1115`. Users answer a question that never changes an answer.

Context load:

- `src/ui/screens/SetupScreens.tsx` (lines ~950-980, ~1110-1130)
- `src/domain/routing/toolModeCatalog.ts` — `modeScore` and `sortLeastResourceModes`, only if wiring it in

Options:

1. Recommended, lowest risk. Keep the control, relabel it honestly as a personal preference that orders the tool list, and stop implying it affects recommendations. Zero routing change.
2. Wire it in as an explicit final tie-breaker in `sortLeastResourceModes` and `modeScore`, so that when two tools score equally the familiar one wins. Changes routing output — if chosen, say so visibly in the route reasons ("you use this one most") rather than making it invisible.
3. Remove the control.

Do not do (2) silently. "The tool you already use most wins" is exactly the habit this product exists to counter, so if it becomes a tie-breaker the user must be able to see that it did.

Acceptance criteria:

- The setup UI does not imply the frequency answer affects routing unless it actually does.
- If option 2 is chosen, the tie-break is visible in the route's selection reasons.
- Routing output is unchanged under option 1 or 3.

Validation:

- `npm run test -- App routeCandidates`
- `git diff --check`

Stop condition:

Stop at one option. Do not extend into other setup fields.

---

## Chunk R10 - Reframe The Product Promise

Status: not started
Budget class: Small

Copy only. No source changes, no engine work.

Objective:

Make the written promise match what the app actually does, and state the end goal plainly: this is a guide that teaches people to make more efficient, lower-impact AI decisions.

Defect:

The docs imply the router picks the right tool for your task using provider-level judgement. It does not. `everydayToolCatalog.ts` collapses every provider and plan into three capability buckets, so ChatGPT Plus and Claude Pro carry identical capability vectors, and two unrelated tasks can produce the same recommendation with the same score. What the app genuinely does well — staged prompt packages, privacy-posture gating, right-sizing away from oversized models — is undersold by comparison.

Context load:

- `README.md`
- `docs/PRODUCT_BRIEF.md`
- `docs/manual.md`
- `docs/2026-07-25-audit-remediation-plan.md` (the Decision Recorded section below)

Change:

- Replace any claim that the app knows which provider or model is best for a given task. It recommends a *tier* and a *shape of work*, not a vendor.
- State the end goal in the opening lines of README and the product brief: help people use AI more efficiently and with lower environmental impact, by staging the work and right-sizing the tool.
- Keep every claim that is already earned: staged prompt packages, sensitivity and permission gating, local-first with no execution and no data leaving the device.
- Align impact wording with R2. If R2 is already done, reuse its exact phrasing rather than inventing a second vocabulary.

Acceptance criteria:

- No user-facing doc claims provider-level or model-level task matching.
- README and product brief open with the teaching goal, not a feature list.
- Impact wording is identical across README, product brief, manual, and the app UI.
- No source file changed by this chunk.

Validation:

- `bash scripts/governance-preflight.sh`
- `git diff --check`
- `git diff --stat` — confirm no files outside `README.md`, `docs/PRODUCT_BRIEF.md`, `docs/manual.md`, and this plan are touched

Stop condition:

Stop when the docs are honest. Do not rewrite the marketing site, the public hub, or any launch material — those are gated release work.

---

## Decision Recorded, Not A Chunk

Owner decision, 2026-07-25T08:27:12-06:00: take the reframe. The product's end goal is to teach and guide people toward more efficient, lower-impact AI decisions, and to do that with as little friction as possible. Tool selection is a teaching device, not a precision instrument, and the docs should say so. No engine work under any chunk in this file. Richer per-provider capability data stays a separate future decision.

This decision constrains the rest of the queue in two ways:

- Copy in README, product brief, and the manual should describe a guide that teaches efficient, lower-impact AI use — not a system that knows which provider is best for your task.
- Frictionless is a constraint, not a preference. Any chunk that adds a warning, a gate, or a screen must not add a step the user has to clear before getting a result. R3 in particular states its warning inline; it must not become a blocking dialog.

Background that produced the decision:

Routing is thinner than the docs claim. Two unrelated tasks — "write a blog post about composting" and "plan a two-week trip to Portugal" — produce an identical recommendation for the same user: Balanced route, score 95.3, same two steps. Root cause is that `everydayToolCatalog.ts` collapses every provider and plan into three capability buckets, so ChatGPT Plus and Claude Pro carry byte-identical capability vectors. The app cannot express "Claude is better for this, Gemini for that" because it never encodes it.

Two honest paths:

- Reframe the product as a prompt-staging coach that respects your privacy posture. The prompt output already earns this claim today, and no engine work is needed — only copy in README, product brief, and manual.
- Invest in per-provider, per-task-type capability data so tool selection means something. This is real work and needs a source of truth that will not go stale, which conflicts with the no-live-fetch boundary.

The reframe is the recorded decision above. Do not start engine work under any chunk in this file.

## Validation Log

| Timestamp | Command | Result | Notes |
|---|---|---|---|
| 2026-07-25T08:17:12-06:00 | `npm run test` | pass | 14 files, 119 tests, at `59dd849` before remediation. |
| 2026-07-25T08:17:12-06:00 | `npm run build` | pass | TypeScript and Vite build passed; existing large chunk warning remains. |
| 2026-07-25T08:17:12-06:00 | `npm run scan:web-rc` | pass | No release-blocking findings. |
| 2026-07-25T08:17:12-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings. |
| 2026-07-25T08:17:12-06:00 | `npm audit --audit-level=moderate` | fail | 1 high: postcss path traversal, build-time dependency only. Addressed in R5. |
| 2026-07-25T08:17:12-06:00 | domain pipeline probe, 8 user profiles | findings | Confirmed R1, R2, R3 defects against real generated output; hard gates and highly-restricted blocking verified correct. |
| 2026-07-25T08:27:12-06:00 | `bash scripts/governance-preflight.sh` | pass | After recording both owner decisions and adding chunk R10. Docs only; no app behaviour change. |

## Next Handoff

R0 is operator work and can proceed in parallel with any coder chunk. For coder work, start at R1 — it is the only outright correctness bug, it is cheap, and it sits directly on the "we recommend; you decide" promise.

Both owner decisions are now recorded and no chunk is waiting on input. R2 is unblocked: present every cost figure as an API-equivalent per-token estimate, never as a saving. R10 carries the reframe into the docs. The whole queue serves one goal — teach people to make more efficient, lower-impact AI decisions, without adding friction.
