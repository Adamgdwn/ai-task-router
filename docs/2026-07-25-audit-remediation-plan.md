# 2026-07-25T08:17:12-06:00 - Audit Remediation Plan

Document ID: PATH-ENG-004
Version: 1.6.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-25
Last Reviewed: 2026-07-25
Next Review: When chunk R10 completes or the owner reprioritises
Last Updated: 2026-07-25T10:31:44-06:00
Status Updated: 2026-07-25T10:31:44-06:00

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
| R1 | Artifacts follow the chosen route | complete | Medium | Correctness: the saved card currently documents a different plan than the user accepted. |
| R2 | Honest impact numbers | complete | Medium | Credibility: the app currently credits users with savings they did not make. |
| R3 | First-run honesty | complete | Small | A new user with no tools gets a confident answer built on an empty inventory. |
| R4 | Clean the copied prompt text | complete | Small | Internal IDs appear in the product's flagship deliverable. |
| R5 | Dead code and lint feedback loop | not started | Small | Removes ~200 lines of unreachable routing code and closes the missing feedback loop. |
| R6 | Catalog staleness signal | not started | Small | Hardcoded model names decay monthly with nothing to notice it. |
| R7 | Help screen | not started | Small | A developer placeholder is live in production nav. |
| R8 | Real first-run E2E coverage | not started | Medium | The journey every real user takes is not tested end to end. |
| R9 | Resolve the frequency question | not started | Small | Users answer a question that changes nothing. |
| R10 | Reframe the product promise | not started | Small | Docs promise provider-level judgement the engine does not have; the product's real value is teaching lower-impact choices. |
| R11 | Price each step by the model it names | complete | Medium | Owner found Lean priced above Balanced. Cost was blind to which mode a step uses, so effort alone decided the number. |
| R12 | Name the lean style by what it actually does | complete | Small | The lean style was labelled "Save time and cost". It weights speed lower than balanced does and leans on human review, so it promised the one axis it does not deliver. |

Recommended order: R0 (operator, parallel) → ~~R1~~ → ~~R3~~ → ~~R4~~ → ~~R2~~ → ~~R11~~ → ~~R12~~ → R10 → R5 → R7 → R6 → R9 → R8.

R1, R2, R3, R4, R11, and R12 were the user-visible correctness wins and are done. R11 and R12 were not in the original audit; the owner found both, R11 by reading R2's own output table and asking why Lean priced above Balanced, R12 by recalling that the lean style claimed to save time. R10 is next: it carries the same reframe into the docs, and R2 has already established the in-app language it should match. R5 through R9 are hygiene and can be reordered freely.

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

Status: complete - 2026-07-25T08:48:23-06:00
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

Acceptance Result, 2026-07-25T08:48:23-06:00: met, using shape (a).

- `rebuildRouteCardForSelectedOption` was added to `routeCardGenerator.ts`. It re-points `stageGuidance` and `promptPackage` at the chosen option, re-parses through `routeCardSchema`, and leaves `recommendedOptionId` and `options` untouched.
- `selectRouteOption` in `useTaskRouting.ts` now regenerates both artifacts at selection time, so on-screen stage guidance changes the moment the user picks a different route. A regeneration failure surfaces as a save-status error rather than a silent mismatch.
- `BuildProjectStageGuidanceInput.recommendedOption` was renamed to `selectedOption`. The old name was what made the defect easy to miss.
- The saved Decision Card now shows both "You chose" and "We suggested", and its summary, score, and impact panel follow the accepted route. The accepted option comes from the route log entry, so no schema change was needed.
- No schema change to `routeCardSchema` or `promptPackageSchema`. Scoring, tie-breaking, and recommendation are unchanged.
- Known remaining seam, deliberately left for R4: the exported route-card Markdown still leads with "Recommended option". The line is true, but R4 already edits export text and should add the chosen route beside it. Closed by R4 on 2026-07-25T09:08:00-06:00.

Tests added: `routeCardGenerator.test.ts` covers rebuild-follows-selection and rejects an unknown option id; `App.test.tsx` covers choosing the non-recommended Lean route and asserts the saved card, prompt package, route log, stage guidance step IDs, and the Decision Card labels.

---

## Chunk R2 - Honest Impact Numbers

Status: complete - 2026-07-25T09:40:19-06:00
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

Acceptance Result, 2026-07-25T09:40:19-06:00: met.

Two figures replaced the savings machinery. `apiEquivalentCostUsd` is what the route's steps would cost at reviewed public API list prices for a 100k-token run, **including steps a plan the user already pays for covers**. `estimatedCostUsd` keeps its meaning of what actually lands on the bill. The gap between them is the lesson the owner asked for, and it needed no new comparison field.

- The premium baseline is gone. `attachRouteEconomics` no longer computes a shared baseline, no longer floors the premium route at the `openai-premium-text-anchor` figure, and no longer writes `estimatedSavingsUsd`, `estimatedSavingsPercent`, `savingsComparedWith`, `estimatedEnergySavingsWh`, or `estimatedEnergySavingsPercent`. The premium floor went with it: fabricating a number to preserve an expected ordering is the same dishonesty in a smaller place. Premium now prices at whatever its own anchors say, which on the standard fixture is about $2.20 rather than the floored $1.125.
- Verified against real generated output before settling the copy. A ChatGPT Plus / Claude Max user now sees lean about $0.06, balanced about $0.05, premium about $2.20, all with **$0.00 added to the bill**. A fresh install with only manual review sees $0.00 / $0.00 / 0.048 Wh. The old build told that same fresh install it had saved $1.125 and 21.366 Wh.
- Subscription coverage got its own predicate. `accountIsMeteredPerUse` in `modelGuidance.ts` treats only pay-as-you-go and API accounts as adding to the bill; flat consumer plans and free tiers do not. The routing layer's existing `zeroMarginalCost` was left untouched on purpose — it carries a +9 scoring bonus, and widening it would have changed which tools get recommended, which is outside this chunk. This predicate changes only what the user is told they will pay.
- `modeEstimateAnchorsForRouteStep` no longer folds `zeroMarginalCost` into `pricingAnchorId`. The anchor prices the work; the flag says whether a plan covers it. Conflating them was why a subscription route reported no cost at all rather than a covered one.
- Precision capped at two significant figures in every formatter (routing screen, impact panel, export). `$0.0512` became `$0.051` and `11.619 Wh` became `12 Wh`. Stored values keep full precision so totals still sum correctly; the rounding is at display only.
- The lifetime counter was rebuilt. `buildTrackedImpactSummary` no longer takes a `PublicImpactSnapshot` and no longer derives dollars from a fixed illustrative scenario. It totals the followed routes' own estimates, and counts followed routes that carry no estimate in a separate `plansWithoutEstimateCount` that the UI surfaces, so old records cannot silently pad the total.
- The route comparison moved to display time. `heaviestSiblingRoute` in `TaskRoutingScreens.tsx` reads the other options on screen, which are the only routes the user can actually choose between. Nothing about a comparison is stored on the option any more.
- No schema-breaking change. `apiEquivalentCostUsd` was added as optional; the five savings fields remain accepted by `routeOptionSchema` with a dated deprecation comment so route cards saved before today still parse under `.strict()`. Nothing writes or reads them.

Declared extensions beyond the chunk's Context Load, each the same defect on an adjacent line:

- Stage guidance per-work-item cost now uses the API-equivalent figure (`stageGuidance.ts`), and `StageGuidancePanel.tsx` labels it "If metered". Leaving it on the billed figure would have shown $0.00 per item beside a route saying "about $0.42".
- The exported Markdown replaced "Estimated savings ... vs ..." with the two per-token lines plus energy.
- Prospective savings language in generated prompt and stage text was reworded to impact language (`promptPackageGenerator.ts`, `candidateGeneration.ts`, `stageGuidance.ts`), because the prompt package is a saved record and told the external model to write savings claims.
- `SuggestedToolkitItem.savingsAngle` was renamed to `impactAngle` and its copy reworded; a field name that asserts a saving was the thing this chunk set out to remove.

Not changed, deliberately: the "cost, savings, or energy comparison" deliverable label in `taskDecomposition.ts` names something the *user* asked for, not a claim the app makes, and the regex behind it must keep matching users who type "savings". `estimatedCostLevel` and `estimatedEffortLevel` are unchanged — they are qualitative and were never dishonest. Scoring, tie-breaking, and recommendation are untouched.

Tests: one existing test was asserting the old ordering of billed costs across strategies and now asserts that a flat-plan user is billed nothing on every route while the per-token figure still rises; a new counter test proves a followed route with no estimate is set aside rather than credited with an invented figure; `App.test.tsx` and `exportImport.test.ts` gained assertions that no surface says "savings" or "avoided"; the E2E copy assertions were updated in the same pass.

---

## Chunk R3 - First-Run Honesty

Status: complete - 2026-07-25T08:48:23-06:00
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

Acceptance Result, 2026-07-25T08:48:23-06:00: met.

- New hard-gate warning reason `no-tools-configured`, raised in `evaluateWarnings`. It keys off the tool inventory (no enabled non-human model), not the allowed model set: a highly restricted task can narrow a well-stocked inventory down to manual review, and blaming the user's tool list there would be wrong. A test covers that case.
- The results screen shows it as an inline `.setupNotice` with `role="status"` and an "Add my AI tools" button that navigates to My AI Tools. No modal, no dialog, no dismissal step; the full results stay on screen behind it.
- The message is filtered out of the generic "Warnings" list on that screen so it appears once. The saved route card still carries it in `warnings`.
- The notice does not appear once any AI tool is enabled, covered by its own test.

---

## Chunk R4 - Clean The Copied Prompt Text

Status: complete - 2026-07-25T09:08:00-06:00
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

Acceptance Result, 2026-07-25T09:08:00-06:00: met.

- `toolUseReminder` now reads "Tool/model use: do this step yourself, outside the app, using `<tool or mode label>`." The tool name comes from `routeStep.modeLabel` via a new `toolLabelForRouteStep` helper, falling back to `routeStep.label`. No schema change was needed: every reachable route step that carries a `modelId` also carries a `modeLabel`. The name is placed last in the sentence because mode labels are full phrases, not short nouns.
- `recommendedHelpForRouteStep` lost its `model ID '<id>'` fallback branch. The blocked-tool variant no longer says "route step model ID", it says the tool "is not allowed by the current privacy and permission limits".
- `buildInputRefs` no longer lists the model. The tool is not an input to the step, and listing it was the second path by which a slot ID reached the clipboard. `inputRefs` is display-only — UI, copied text, and Markdown export — so nothing downstream depends on it.
- Secondary noise fixed: with no approved sources the reminder is now one sentence ("no outside sources are approved for this step. Work only from the task description and anything you paste in yourself. Do not pull in blocked, no-access, or undeclared sources.") and the generic source-boundary line is suppressed, because it restated a limit about an empty list. When sources exist, both the allowed-source list and the boundary line are unchanged.
- Export path carries the cleanup: the route-option step line is now `Tool or mode: <label>` instead of `Model: <slot id>`.
- Deviation, small and in the same objective: the on-screen Route Options step list in `RouteArtifactScreens.tsx` also rendered `step.modelId` raw under a "Model" heading. It now renders `step.modeLabel` under "Tool or mode". Same defect, adjacent line, one-line fix.
- Carried-forward seam from R1 closed here: `serializeRouteCardMarkdown` gained an optional third `acceptedOption` argument and now emits both `- You chose:` and `- We suggested:`, with the summary following the accepted route. `SavedRouteCardScreen` passes `artifacts.selectedRouteOption`. When no accepted option is supplied the export falls back to the recommendation rather than guessing.
- Prompt package format is unchanged. `recommendedModelId` inside stage guidance is untouched: it is stored data, never rendered, and the guidance panel and export already resolve labels from the inventory.

Tests added: `promptPackageGenerator.test.ts` asserts across three task shapes that no step's instruction, `inputRefs`, or expected output matches `/user-[a-z0-9-]*model/`, contains the phrase "model ID", or contains any inventory model ID; `exportImport.test.ts` asserts the export shows `Tool or mode: build mode` with no raw model ID, and covers both the accepted-option and fall-back forms of the chosen/suggested header. Three existing assertions that encoded the defect (a model ID expected in `inputRefs`, and the duplicated "source IDs for this step: none" text) were updated to assert its absence.

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

---

## Chunk R11 - Price Each Step By The Model It Names

Status: complete - 2026-07-25T10:01:49-06:00
Budget class: Medium

Objective:

Make the per-token figure reflect which model each step actually uses, and show the per-step figures so a route total can be checked against its parts.

User outcome:

A user comparing routes sees numbers that move with the models being recommended, and can see which step carries the cost.

Trigger:

Not from the original audit. The owner read the R2 acceptance table, saw Lean at about $0.06 against Balanced at about $0.05, and asked why a lighter route priced higher.

Defect:

Two defects, one causing the other.

1. **Cost was blind to the mode.** `pricingAnchorForProviderMode` chose an anchor from provider and account tier only. On ChatGPT Plus the thinking pass and the fast execution pass got the same anchor, so the only thing left to separate them was the role's token multiplier. Because execution is assumed to move more tokens than prompt design, the cheap instant pass priced *higher* than the reasoning pass it follows: $0.030 against $0.021, while the energy model put the same pair at 0.055 Wh against 11.564 Wh. Cost and energy disagreed by a factor of 210 on which step was heavy.

2. **The mapping was duplicated and had already drifted.** Every mode declared `pricingAnchorId`, `energyAnchorId`, and `energyProfile` inline in `toolModeCatalog.ts`, and `modeEstimateAnchorsForRouteStep` re-derived all three by parsing the mode ID. The two copies disagreed: a Claude execution pass was declared at Haiku prices and charged at frontier prices, a 5x gap on the same step; Gemini's execution pass had the same defect; and Claude `team`/`enterprise` accounts resolved differently in each copy.

Change:

- Added `modeEstimateProfile` in `toolModeCatalog.ts` as the single source of truth for a mode's pricing anchor, energy anchor, and energy profile. Both the catalog builder and the economics layer call it. Deleted `pricingAnchorForProviderMode` and folded the two energy helpers into it.
- Anchors now follow the model class the mode names, not the plan tier it is reached through. Perplexity is the deliberate exception: Sonar and Sonar Pro are genuinely different models, so the account still decides.
- Removed the zero-marginal-cost null-out in `mode()`. A free tier keeps its anchor, because free compute still has a list price and showing it is the point; the billing question is answered separately by `accountIsMeteredPerUse`.
- Added optional `apiEquivalentCostUsd`, `estimatedEnergyWh`, and `pricingAnchorLabel` to `routeStepSchema`, written by `attachRouteEconomics` in the same pass that computes the totals.
- Surfaced the per-step line in the route card step list and in the exported Markdown, naming the anchor so the figure can be checked rather than trusted.

Acceptance Result:

Pass, 2026-07-25T10:01:49-06:00.

Verified against real generated output before and after, ChatGPT Plus plus Claude Max:

| Route | Step | Before | After |
|---|---|---|---|
| Balanced, writing task | prompt-design, GPT-5.5 Thinking Medium | $0.021 | $0.506 |
| Balanced, writing task | execution, GPT-5.5 Instant | $0.030 | $0.030 |

The reasoning pass now prices seventeen times the execution pass that follows it, in the same direction as the energy model. On the build task the route totals are monotonic for the first time: Lean $0.489, Balanced $0.79, Premium $1.24.

Declared extensions beyond the stated objective:

- Export Markdown gained the per-step lines. The route card and the export are the same record; showing the breakdown in one and not the other would have made them disagree.
- `costEstimateBasis` gained a sentence saying each step is priced against the model that step names, because the previous wording implied a single blended rate.

Not changed, deliberately:

- No anchor value was altered. The anchors were reviewed on 2026-07-05 and re-reviewing them is a separate task with its own source snapshot. This chunk changed only which existing anchor applies to which mode.
- No routing or scoring change. The Lean route still selects a frontier thinking model for prompt design, which is why Lean is not far below Balanced on the build task. That is a routing question, out of scope here, and it is now visible rather than hidden behind a flat price.
- The Gemini reasoning pass and Gemini premium benchmark still share an anchor because only two Gemini anchors are on file. Recorded as an anchor-set gap in the methodology rather than filled with an invented price.
- No schema break. The three new step fields are optional, so route cards saved before today still parse under `.strict()`.

---

## Chunk R12 - Name The Lean Style By What It Actually Does

Status: complete - 2026-07-25T10:31:44-06:00
Budget class: Small

Objective:

Make the lean style's name and description true to the weights it scores by, so the option that carries the product's environmental point is not sold on a benefit it does not provide.

User outcome:

A user choosing a style sees what that style trades away, not only what it gives.

Trigger:

Not from the original audit. The owner recalled that the lean choice was described as saving time and money, and said it saves energy and money at the expense of time.

Defect:

The `least-resource` policy weights `cost` at 0.30 and `energy` at 0.25, its two highest, and weights `speed` at 0.15 - *lower* than `balanced` at 0.18. Its own catalog description reads "low cost, low energy use, and human review for risky output", and the route comparison screen already told users to choose it "if you want to test the lightest path first and are comfortable reviewing more yourself".

It was labelled "Save time and cost". That named the one axis the policy de-prioritises, omitted energy entirely - the axis the product exists to teach - and contradicted the app's own route-level copy. The description, "Prefer the simplest good-enough option and avoid extra effort", reads as though it saves the *user* effort, when the lean route adds human review.

Change:

- `friendlyPolicyLabel` in `SetupScreens.tsx`: "Save time and cost" becomes "Lower energy and cost".
- `friendlyPolicyDescription` in `SetupScreens.tsx`: the lean description now states the trade directly - "Prefer the simplest good-enough option. Expect to spend more of your own time checking the result."
- Deleted `friendlyPolicyName` from `TaskRoutingScreens.tsx`. It was a second, unused copy of the same three labels, carrying the same wrong claim. Nothing referenced it.
- Corrected the same claim in the Chunk 5 user outcome in `docs/2026-07-09-current-build-pathway.md`, which read "may save time, cost, or compute". Chunk 5 is paused, not complete, so this is a live objective rather than a historical record.
- Added a test asserting the lean route is strictly below the premium route on both API-equivalent cost and estimated energy, so the label is held to the routes the engine actually generates.

Acceptance Result:

Pass, 2026-07-25T10:31:44-06:00.

The lean route on the standard writing fixture is strictly below the premium route on both named axes, verified by assertion rather than by reading. The two duplicated label sets are now one.

Not changed, deliberately:

- No policy weights changed. The label was wrong about the policy; the policy was not wrong.
- The `balanced` and `quality-first` labels and descriptions are untouched. Only the claim the owner identified was false.
- `policyPlainLanguageSummary` for the lean style is unchanged. It already describes when to choose the style and makes no time claim.
- `noUnusedLocals` is still off in `tsconfig`, which is why the dead second copy of the labels went unnoticed. Turning it on is a separate chunk with its own fallout to clear.

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
| 2026-07-25T08:48:23-06:00 | `npm run test` | pass | 14 files, 127 tests, after R1 and R3. Up from 119; 8 new tests across `hardGates`, `routeCardGenerator`, and `App`. |
| 2026-07-25T08:48:23-06:00 | `npm run build` | pass | TypeScript and Vite build clean; existing large chunk warning remains. |
| 2026-07-25T08:48:23-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. No E2E assertion needed changing for R1 or R3. |
| 2026-07-25T08:48:23-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T08:48:23-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R1 and R3. |
| 2026-07-25T09:08:00-06:00 | `npm run test` | pass | 14 files, 129 tests, after R4. Up from 127; 2 new tests in `promptPackageGenerator` and `exportImport`. |
| 2026-07-25T09:08:00-06:00 | `npm run build` | pass | TypeScript and Vite build clean; existing large chunk warning remains. |
| 2026-07-25T09:08:00-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. No E2E assertion needed changing for R4. |
| 2026-07-25T09:08:00-06:00 | generated prompt text read end to end, sourced and source-free tasks | pass | Confirmed the reworded tool-use and source-use lines read as plain instructions, not as a malfunction. Throwaway harness deleted, not committed. |
| 2026-07-25T09:08:00-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T09:08:00-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R4. |
| 2026-07-25T09:40:19-06:00 | `npm run test` | pass | 14 files, 130 tests, after R2. Up from 129; 1 new counter test, plus strengthened assertions across `routeCardGenerator`, `App`, `exportImport`, and `impactEstimator`. |
| 2026-07-25T09:40:19-06:00 | `npx tsc --noEmit` | pass | Clean. |
| 2026-07-25T09:40:19-06:00 | `npm run build` | pass | TypeScript and Vite build clean; existing large chunk warning remains. |
| 2026-07-25T09:40:19-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. The `Cost and savings`, `Energy saved`, and `What this route can save` assertions were updated to the new copy, and `Estimated savings` / `Energy saved` / `Est. saved` are now asserted absent. |
| 2026-07-25T09:40:19-06:00 | route economics read end to end, subscription and fresh-install inventories | pass | ChatGPT Plus / Claude Max: about $0.06 / $0.05 / $2.20 per token, $0.00 billed on all three. Fresh install, manual only: $0.00 and 0.048 Wh with no saving claimed. Throwaway harness deleted, not committed. |
| 2026-07-25T09:40:19-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T09:40:19-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R2. |

| 2026-07-25T10:01:49-06:00 | `npm run test` | pass | 14 files, 133 tests, after R11. Up from 130; 3 new tests covering per-step pricing, catalog/estimator anchor agreement, and free-tier anchors. |
| 2026-07-25T10:01:49-06:00 | `npx tsc --noEmit` | pass | Clean. |
| 2026-07-25T10:01:49-06:00 | `npm run build` | pass | TypeScript and Vite build clean; existing large chunk warning remains. |
| 2026-07-25T10:01:49-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. No E2E assertion needed changing; the per-step line is additive. |
| 2026-07-25T10:01:49-06:00 | per-step economics read end to end, before and after | pass | ChatGPT Plus balanced route: reasoning pass moved from $0.021 to $0.506 against a $0.030 execution pass, matching the 11.564 Wh against 0.055 Wh energy split. Build-task totals became monotonic. Throwaway harness deleted, not committed. |
| 2026-07-25T10:01:49-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T10:01:49-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R11. |

| 2026-07-25T10:31:44-06:00 | `npm run test` | pass | 14 files, 134 tests, after R12. Up from 133; 1 new test holding the lean label to the routes the engine generates. |
| 2026-07-25T10:31:44-06:00 | `npx tsc --noEmit` | pass | Clean. |
| 2026-07-25T10:31:44-06:00 | `npm run build` | pass | TypeScript and Vite build clean; existing large chunk warning remains. |
| 2026-07-25T10:31:44-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. No E2E assertion referenced the changed label. |
| 2026-07-25T10:31:44-06:00 | lean-versus-premium claim checked strictly, not with a tolerance | pass | Asserted with `toBeLessThan` rather than `toBeLessThanOrEqual` after confirming the two routes are not tied, so a lean route that stopped being lighter would fail. |
| 2026-07-25T10:31:44-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T10:31:44-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R12. |

## Next Handoff

R1, R2, R3, R4, R11, and R12 are complete as of 2026-07-25T10:31:44-06:00. R0 is still operator work and can proceed in parallel with any coder chunk; it now has six chunks' worth of user-visible fixes waiting behind it.

Next coder chunk is R10, the docs-side reframe. R2 has already set the in-app language, so R10's job is to make README, the product brief, and the manual say the same thing rather than invent new wording. The vocabulary to match: **"if you were paying per token"** for the API-equivalent figure, **"added to your bill"** for what a metered account is charged, and **no use of "saved", "savings", or "avoided" for money**. `docs/2026-07-05-impact-estimator-methodology.md` v0.6.0 has the full framing under "What A Dollar Figure Means" and is the source of truth for it.

Notes for whoever picks up the next code chunk:

- `noToolsConfiguredMessage` is exported from `hardGates.ts` if another surface needs to match on it.
- Prompt and export text names tools by `modeLabel`; reuse `toolLabelForRouteStep` in `promptPackageGenerator.ts` rather than reaching for `step.modelId` in any user-facing string.
- Any new dollar figure must come from `apiEquivalentCostUsd` or `estimatedCostUsd`, never from the five deprecated savings fields still accepted by `routeOptionSchema`. Those exist only so pre-2026-07-25 route cards keep parsing; R5 or a later migration chunk can drop them once a store migration exists.
- `accountIsMeteredPerUse` in `modelGuidance.ts` is the predicate for "does this add to the bill". Do not use the routing layer's `zeroMarginalCost` for that question — it carries a scoring bonus and only covers free tiers.
- User-facing style labels live once, in `friendlyPolicyLabel` in `SetupScreens.tsx`. A label must be true to the scoring weights in `defaultPolicies.ts`; if the two disagree, that is a defect in one of them, not a wording preference.
- `modeEstimateProfile` in `toolModeCatalog.ts` is the only place a mode's pricing anchor, energy anchor, or energy profile may be decided. Do not re-derive any of the three anywhere else; that duplication is exactly what R11 removed, and the two copies had already drifted by 5x on a Claude execution step.
- Anchors describe the model class a mode names, not the plan tier it is reached through. If a future chunk needs finer price resolution, add a reviewed anchor with its source; do not invent a value to fill a gap. The Gemini benchmark understatement is a known open gap of this kind.

Both owner decisions are recorded and no chunk is waiting on input. The whole queue serves one goal — teach people to make more efficient, lower-impact AI decisions, without adding friction.
