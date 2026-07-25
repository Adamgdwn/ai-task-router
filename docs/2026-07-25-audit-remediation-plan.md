# 2026-07-25T08:17:12-06:00 - Audit Remediation Plan

Document ID: PATH-ENG-004
Version: 1.11.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-25
Last Reviewed: 2026-07-25
Next Review: When chunk R9 completes or the owner reprioritises
Last Updated: 2026-07-25T16:47:39-06:00
Status Updated: 2026-07-25T16:47:39-06:00

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
| R0 | Deploy current `main` | complete | Small | The fixes already written are not in front of users. |
| R1 | Artifacts follow the chosen route | complete | Medium | Correctness: the saved card currently documents a different plan than the user accepted. |
| R2 | Honest impact numbers | complete | Medium | Credibility: the app currently credits users with savings they did not make. |
| R3 | First-run honesty | complete | Small | A new user with no tools gets a confident answer built on an empty inventory. |
| R4 | Clean the copied prompt text | complete | Small | Internal IDs appear in the product's flagship deliverable. |
| R5 | Dead code and lint feedback loop | complete | Small | Removes ~200 lines of unreachable routing code and closes the missing feedback loop. |
| R6 | Catalog staleness signal | complete | Small | Hardcoded model names decay monthly with nothing to notice it. |
| R7 | Help screen | complete | Small | A developer placeholder is live in production nav. |
| R8 | Real first-run E2E coverage | not started | Medium | The journey every real user takes is not tested end to end. |
| R9 | Resolve the frequency question | not started | Small | Users answer a question that changes nothing. |
| R10 | Reframe the product promise | complete | Small | Docs promise provider-level judgement the engine does not have; the product's real value is teaching lower-impact choices. |
| R11 | Price each step by the model it names | complete | Medium | Owner found Lean priced above Balanced. Cost was blind to which mode a step uses, so effort alone decided the number. |
| R12 | Name the lean style by what it actually does | complete | Small | The lean style was labelled "Save time and cost". It weights speed lower than balanced does and leans on human review, so it promised the one axis it does not deliver. |

Recommended order: ~~R0~~ → ~~R1~~ → ~~R3~~ → ~~R4~~ → ~~R2~~ → ~~R11~~ → ~~R12~~ → ~~R10~~ → ~~R5~~ → ~~R7~~ → ~~R6~~ → R9 → R8.

R1, R2, R3, R4, R11, and R12 were the user-visible correctness wins and are done. R11 and R12 were not in the original audit; the owner found both, R11 by reading R2's own output table and asking why Lean priced above Balanced, R12 by recalling that the lean style claimed to save time. R10 carried the same reframe into the docs, reusing the language R2 had already set rather than inventing a second vocabulary. R5 through R9 are hygiene and can be reordered freely. R5 installed the compiler feedback loop that will catch the next dead branch, and R7 replaced the last developer-facing screen with a real one. R6 gave the app a way to admit its model knowledge is ageing. R9 and R8 remain, both test and hygiene work.

Every chunk serves one end goal, recorded by the owner on 2026-07-25: teach and guide people toward more efficient, lower-impact AI decisions, with as little friction as possible. If a change makes the app more accurate but harder to get through, it is the wrong change.

---

## Chunk R0 - Deploy Current `main`

Status: complete - 2026-07-25T16:28:35-06:00
Budget class: Small

This is operator work, not coder work. No code changes.

Production serves `9639840`. Current `main` is `59dd849`. The undeployed delta includes functional commit `f8e0a40` and `f673c44`, which add the route-selection UI and visible routing detail. Until this deploys, R1 through R9 are invisible to users.

Follow [2026-07-09-cloudflare-deploy-turnover.md](2026-07-09-cloudflare-deploy-turnover.md) exactly. Do not retry from public IP `184.67.69.66`.

Note: `npm audit --audit-level=moderate` now reports 1 high finding (postcss, build-time only). The turnover checklist includes that command. Either clear it in R5 first or record the finding and proceed; it is a dev-dependency advisory, not a shipped-code risk.

Acceptance Result, 2026-07-25T16:28:35-06:00: met.

The blocker was network location and nothing else. The same token, the same secure env file, and the same
`wrangler pages deploy` command shape that Cloudflare rejected twice with code `9109` from public IP
`184.67.69.66` succeeded on the first attempt from the owner's home network at public IP `70.65.205.71`. No token was
reissued or broadened, no IP was allowlisted, and no app code was changed - which is what the turnover note
required, since this was an operator/auth-location problem rather than a build artifact problem.

Deployed source `ab329e5` to `https://7c570b1d.ai-task-router.pages.dev`, confirmed `Environment: Production`, `Branch: main` by
`wrangler pages deployment list`, ahead of `ef92b270` from `9639840`. That closes a 16-commit undeployed delta.
Production now carries the route-selection UI, visible routing detail, and the completed work from R1, R2, R3,
R4, R5, R10, R11, and R12 - the remediation queue is visible to users for the first time.

Pre-deploy checklist ran clean: governance preflight 0 warnings, `npm audit --audit-level=moderate` 0
vulnerabilities, 134 tests across 14 files, production build clean, `npm run scan:web-rc` no release-blocking
findings. The postcss high finding noted against this chunk was cleared by R5, so there was nothing to record
and proceed on.

Hosted smoke passed on the canonical URL: root, manifest, and service worker all HTTP 200, and all 6 Chromium
E2E tests passed against `https://ai-task-router.pages.dev`.

One thing worth knowing for next time: the first canonical root fetch returned the **previous** bundle from a
stale edge-cache hit, while the immutable deployment URL served the correct one. A cache-busted refetch showed
the new bundle. The same false alarm is already in the pathway validation log from 2026-07-08. Check the
immutable deployment URL before concluding a deploy did not land.

Still owner-facing rather than automated: the hosted smoke focus list in the turnover note asks a human to
confirm routing detail is visible by default, that route selection and the save panel name the chosen route,
that followed-choice impact increments, and that ordinary planning language stays out of app-build routing.
The E2E suite covers intake through save and export, but it does not judge the wording. Worth ten minutes on
the live site.


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

Status: complete - 2026-07-25T11:07:22-06:00
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

Acceptance Result, 2026-07-25T11:07:22-06:00: met.

Pure deletion plus config: 388 lines removed, 2 lines of `tsconfig` added, 1 lockfile bump. No line of live logic
was rewritten and no test changed, so the 134 tests that passed before the chunk are the same 134 that pass after it.

Deleted from `candidateGeneration.ts` (223 lines): the eight-function cluster the audit named - `selectPreferredModel`,
`primaryModelTiersForStrategy`, `selectPremiumBenchmarkModel`, `buildResearchStep`, `selectResearchModel`,
`buildPrimaryStep`, `primaryActionLabel`, `buildArtifactStep`. Confirmed unreachable before deleting, not after: a
repo-wide grep for each name returned only the definitions and calls **inside the cluster itself**, so it was a closed
island with no entry point. The `buildPrimaryStep` comment claiming compatibility with "older route construction paths"
was false - no such path existed. Their private helpers `taskNeedsEvidenceFromDecomposition` (a one-line pass-through
to `taskNeedsEvidenceCheck`) and `averageCapability` fell with them, as did three now-unused imports
(`everydayToolFrequencyRank`, `modelLabelWithMinimum`, `modelInstructionGuidance`).

Deleted from `taskDecomposition.ts` (4 lines): unused `uniqueLabels`. Note `stageGuidance.ts` has its own local
`uniqueLabels` which is live - the duplicate is real but out of scope here, since removing it means choosing a shared
home for it and that is a refactor this chunk's stop condition forbids.

`noUnusedLocals` and `noUnusedParameters` are now on in `tsconfig.json`. As predicted, they surfaced their own
fallout, and this is the substance of the chunk rather than a side effect - none of it had ever been flagged by
anything:

- `everydayToolCatalog.ts`, 153 lines: `researchProvider`, `artifactProvider`, and `codingProvider` factories, plus
  the `researchAccountOptions`, `artifactAccountOptions`, and `codingAccountOptions` tables that only they read.
  Generic per-class builders superseded by the per-provider ones (`perplexityAccountOptions`, `canvaAccountOptions`,
  `githubCopilotAccountOptions`) and left behind. Removing the factories made the tables unused, which the flags then
  caught in a second pass - the cascade is the loop working.
- `TaskRoutingScreens.tsx`, 8 lines: `endY`, a computed chart coordinate nothing rendered, and `formatTimestamp`,
  a dead formatter.

`npm audit fix` cleared the postcss path-traversal advisory (GHSA-r28c-9q8g-f849) by moving the transitive
`vite` -> `postcss` pin from 8.5.16 to 8.5.23. Lockfile only; `package.json` is unchanged. `npm audit
--audit-level=moderate` now reports 0 vulnerabilities, and the build was re-run after the bump.

Not done, deliberately:

- **ESLint deferred.** The chunk offers it "only if the diff stays small". A flat config for this stack needs
  `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`, a config file, and
  a triage pass over whatever the first run reports. That is a chunk, not a footnote. The compiler flags already
  close the specific feedback gap the defect described, so the loop is installed either way.
- **The five deprecated savings fields in `routeOptionSchema` are still there.** The R10 handoff floated R5 as a
  place to drop them. They are not dead code - `routeOptionSchema` still accepts them so pre-2026-07-25 route cards
  keep parsing, and removing them without a store migration would break exactly the saved cards they exist for.
  Still waiting on a migration chunk.
- No live routing code was refactored, per the stop condition.


---

## Chunk R6 - Catalog Staleness Signal

Status: complete - 2026-07-25T16:47:39-06:00
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

Acceptance Result, 2026-07-25T16:47:39-06:00: met.

`catalogFreshness.ts` is a new domain module computing age from the review dates already recorded beside the two
catalogs. It measures from the **older** of `everydayToolCatalogReviewedAt` and `impactCatalogReviewedAt`. They are
the same date today and nothing forces that, so taking the older one means a half-refreshed catalog cannot read as
fresh. Threshold is 90 days, as suggested.

`CatalogStalenessNotice` renders on Best Options only when the catalog is past the threshold. Silence is the normal
state, so a user with a current catalog never reads a caveat that does not apply to them. **The notice does not
appear today** - the catalog was reviewed 2026-07-05 and is 20 days old - which is the correct behaviour and is why
the tests drive the clock rather than trusting today's date.

The wording had to admit the age without implying the app could fix it by checking: "Model and pricing details were
last reviewed [date], [n] days ago. This app never reads live provider menus or prices, so check your tool's current
model list before relying on a specific model name here." A test asserts the notice never contains the words
update, refresh, latest, or fetch, because any of those would read as a promise the boundary forbids.

Risk register gained two entries, neither of which had any coverage before:

- **R-009, recommendation-quality drift from a stale catalog.** Likelihood High - the catalog can only age, by
  design. The review cadence the chunk asked for is attached: re-review every 90 days or sooner on a provider model
  line change, next due 2026-10-03, which is the same 90 days the notice threshold uses so the control and the
  signal cannot drift apart.
- **R-010, impact-claim accuracy.** Records the fixed vocabulary, the on-screen basis and caveats, the
  single-source-of-truth rule for anchors in `modeEstimateProfile`, and the known Gemini benchmark understatement as
  an open gap rather than a silent one.

Not done, per the stop condition: no catalog contents were refreshed, and no model name was checked against a
current provider menu. That is the deliberate review pass R-009 now schedules.


---

## Chunk R7 - Help Screen

Status: complete - 2026-07-25T16:41:27-06:00
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

Acceptance Result, 2026-07-25T16:41:27-06:00: met. Help was written rather than the tab removed, which the chunk preferred.

`HelpScreen.tsx` is a new static screen answering the five questions the chunk named, in the order a stuck user
asks them: what the app does, what it will never do, what the three routes mean, what "How To Choose" changes,
what the numbers mean, and where the data lives. A sixth section, "If something looks wrong", covers the three
states most likely to read as a bug - no options at all, a premium route shown as a comparison benchmark, and a
model or price that looks stale. Each of those is real app behaviour, not a hypothetical.

Every claim on the screen was checked against the code that produces it rather than written from memory:

- Route descriptions come from `strategyDefinitions` in `candidateGeneration.ts`, including the lean route's real
  tradeoff - it costs the least and costs you the most time, which is the R12 correction restated where a confused
  user will actually meet it.
- Style descriptions match `friendlyPolicyDescription` in `SetupScreens.tsx` word for word in substance, so the
  Help text cannot drift from the labels on `How To Choose`.
- The number definitions use the exact `dt` labels the routing screens render - "If you paid per token", "Added to
  your bill", "Est. energy", "Followed choices" - so a user can map a phrase on Help to the figure in front of
  them. The per-token framing and the energy basis are restatements of `routeEconomics.ts`, including its own
  caveats about caching, free tiers, taxes, and retries.
- The route-unavailable explanation points at the Recommendation audit that already exists on Best Options.
- "Nothing is fetched live" matches the no-execution boundary and the hand-reviewed catalog date.

Deleted with the placeholder: `PlaceholderScreen` (18 lines), the `placeholderState` field and all nine of its
values, and the `purpose` field. `purpose` was not named in the chunk, but `PlaceholderScreen` was its only
consumer, so leaving it would have left a field nothing reads on every screen definition - the same dead weight
R5 spent a chunk removing. Removing them makes `ScreenDefinition` exactly the five fields the nav and the screen
header actually use.

`App.tsx` lost the `![...].includes(activeScreen.id)` fallback list, because every screen id now has an explicit
branch. That list was itself a small liability: it had to be kept in step with `screenDefinitions` by hand, and
nothing checked it. The invariant is now enforced by the existing App test that walks every tab and asserts a
level-2 heading and summary render, plus a comment at the branch site saying so.

Not done, per the stop condition: no help system, no search, no linked reference pages, no version-gate diagrams.
The placeholder promised those; promising them again in different words would have been the same defect.

Worth noting for the next deploy: this is user-visible, so it is not live until someone runs the deploy runbook.


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

Status: complete - 2026-07-25T10:33:23-06:00
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

Acceptance Result, 2026-07-25T10:33:23-06:00: met.

Docs only. No source file changed, confirmed by `git diff --stat`.

- README, the product brief, and the manual now open with the teaching goal - use AI more efficiently and with lower environmental impact, by staging the work and right-sizing the tool - instead of "recommends the right AI helper".
- Each of the three states what the router actually recommends: a **tier** and a **shape of work**, not a vendor. Each names the reason: capability data is bucketed by plan class, so accounts of the same class carry one capability vector and a paid ChatGPT plan scores identically to a paid Claude plan. Verified in `everydayToolCatalog.ts`, where every account option draws from one of seven shared score constants (`fastGeneralScores`, `balancedGeneralScores`, `strongGeneralScores`, `researchScores`, `strongResearchScores`, `artifactScores`, `codingScores`).
- The impact paragraph is now one sentence-for-sentence identical block in README, the product brief, the manual, and `ImpactInsightPanel.tsx`: "Dollar figures answer one question: if this work were metered per token at public API list prices, roughly what would it come to? A monthly subscription hides that number, which is why it is worth seeing. It is not your bill, not money you saved, and not a guarantee." It also matches "What A Dollar Figure Means" in the methodology doc, which R2 made the source of truth.
- The earned claims are stated as earned, in the product brief: staged prompt packages, sensitivity and permission gating that overrides scoring, right-sizing away from oversized models, and local-first operation with no provider calls, no credentials, no execution, and no data leaving the device.
- The README `Status:` line said "pick the right helper at the right stage". It now reads "choose the right weight of help at the right stage", and `Status Updated` moved to this chunk's timestamp because the status text changed.

Not changed, deliberately:

- No source file touched. The catalog's bucketing is a known limitation being described honestly, not a defect this chunk fixes. Richer per-provider capability data remains the separate future decision recorded below.
- The marketing site, the public hub at `oldskoolai.com`, and every launch document are untouched. Those are gated release work and the chunk's stop condition names them.
- The product brief's charter sections - Canonical Version Gate, Recommended MVP Stack, Core Domain Model, Sensitivity And Permission Rules - are unchanged. The reframe belongs in Purpose and in the new "What The Router Knows, And What It Does Not" section, not in the baseline the build was gated against.
- Wording in `docs/architecture.md`, `docs/roadmap.md`, and the dated evidence documents was left alone. They are internal or historical, and the chunk's acceptance criteria name the three user-facing docs.

Declared extension beyond the chunk's named files: the Build Plan line in `docs/2026-07-09-current-build-pathway.md` read "pick the right helper, model, or mode at the right stage" and now reads "choose the right weight of help at the right stage". It is the same claim in the doc that directs the next chunk, and leaving it would have pointed the next coder back at the wording this chunk removed.


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

| 2026-07-25T10:33:23-06:00 | `git diff --stat` after R10 | pass | Only `README.md`, `docs/PRODUCT_BRIEF.md`, `docs/manual.md`, `START_HERE.md`, and the two plan/pathway docs changed. No source file touched, as the chunk requires. |
| 2026-07-25T10:33:23-06:00 | impact paragraph identical across README, product brief, manual, and `ImpactInsightPanel.tsx` | pass | Verified by grep on the full sentence, not by reading. Also matches "What A Dollar Figure Means" in the methodology doc. |
| 2026-07-25T10:33:23-06:00 | grep for provider-level task-matching claims in the three docs | pass | No remaining "right AI helper", "right tool", "best model/provider", or "which provider" claim. |
| 2026-07-25T10:33:23-06:00 | plan-class bucketing claim checked against source before writing it | pass | `everydayToolCatalog.ts` builds every account option from seven shared capability-score constants, so same-class accounts across vendors are byte-identical. The docs now say so. |
| 2026-07-25T10:33:23-06:00 | `npm run test` | pass | 14 files, 134 tests. Docs-only chunk; run to confirm nothing was touched by accident. |
| 2026-07-25T10:33:23-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T10:33:23-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R10. |

| 2026-07-25T11:07:22-06:00 | each deleted function grepped repo-wide before removal | pass | All eight `candidateGeneration.ts` functions referenced only from inside their own cluster; `uniqueLabels` in `taskDecomposition.ts` had zero references. Unreachability was proven, not assumed. |
| 2026-07-25T11:07:22-06:00 | `npx tsc --noEmit` with `noUnusedLocals` + `noUnusedParameters` | pass | Clean after two cascade passes. First pass surfaced 7 findings, second surfaced the 3 option tables orphaned by removing their factories. |
| 2026-07-25T11:07:22-06:00 | `npm run test` | pass | 14 files, 134 tests - identical to the pre-chunk baseline. No test file was touched. (The chunk spec's "119 tests at time of writing" predates R4, R11, and R12; 134 is the current baseline, not a regression.) |
| 2026-07-25T11:07:22-06:00 | `npm run build` | pass | `tsc --noEmit && vite build`; 135 modules, built in 225ms. Re-run after `npm audit fix` to confirm the postcss bump did not affect the build. |
| 2026-07-25T11:07:22-06:00 | `npm audit --audit-level=moderate` | pass | 0 vulnerabilities. postcss moved 8.5.16 -> 8.5.23 in the lockfile only; `package.json` unchanged. |
| 2026-07-25T11:07:22-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T11:07:22-06:00 | `git diff --stat` reviewed for behaviour change | pass | 9 insertions, 395 deletions across 6 files. The only insertions are 2 `tsconfig` flags and 7 lockfile lines, so nothing executable was added. |
| 2026-07-25T11:07:22-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R5. |

| 2026-07-25T16:41:27-06:00 | `npx tsc --noEmit` | pass | Clean after removing `PlaceholderScreen`, `placeholderState`, and `purpose`. With `noUnusedLocals` on since R5, an orphaned import or local from the deletion would have failed here. |
| 2026-07-25T16:41:27-06:00 | `npm run test` | pass | 14 files, 135 tests, after R7. Up from 134; 1 new App test asserting the Help content renders and no placeholder copy survives. |
| 2026-07-25T16:41:27-06:00 | `npm run build` | pass | TypeScript and Vite build clean; existing large chunk warning remains. |
| 2026-07-25T16:41:27-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. The narrow-viewport test now also opens Help at 390x844 and checks for horizontal overflow, since the new screen is the widest block of prose in the app. |
| 2026-07-25T16:41:27-06:00 | `npm run scan:web-rc` | pass | No release-blocking findings. |
| 2026-07-25T16:41:27-06:00 | `git diff --check` | pass | Exit 0; only the usual Windows LF/CRLF notices. |
| 2026-07-25T16:41:27-06:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings, after R7. |

| 2026-07-25T16:47:39-06:00 | `npm run test` | pass | 15 files, 141 tests, after R6. Up from 135; 6 new tests covering the threshold boundary, the older-date rule, a clock behind the review date, and both rendered states of the notice. |
| 2026-07-25T16:47:39-06:00 | `npm run build` | pass | TypeScript and Vite build clean; existing large chunk warning remains. |
| 2026-07-25T16:47:39-06:00 | `npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium` | pass | 6 tests. No E2E change needed: the notice is correctly absent at today's catalog age, and the fake-clock cases live in the unit suite. |
| 2026-07-25T16:47:39-06:00 | `npm run scan:web-rc`; `git diff --check`; `bash scripts/governance-preflight.sh` | pass | No release-blocking findings; whitespace check exit 0 with the usual Windows LF-to-CRLF notices; governance preflight 0 warnings after R6. |

## Next Handoff

R0, R1, R2, R3, R4, R5, R6, R7, R10, R11, and R12 are complete as of 2026-07-25T16:47:39-06:00. R0 shipped the first eight of those to production; **R6 and R7 are not deployed**. R7 is user-visible, so the live site still shows the developer placeholder on the Help tab until someone runs the deploy runbook at `docs/2026-07-09-cloudflare-deploy-turnover.md`. That runbook is proven rather than theoretical as of the R0 deploy, and the deploy is an owner decision, not something a coder chunk should take on its own.

Next coder chunk is R9. R8 follows. Both are test and hygiene work with no user-visible surface, so neither adds urgency to the pending deploy.

The catalog now has a review cadence, recorded as R-009 in `docs/risks/risk-register.md`: re-review every 90 days, next due 2026-10-03. Refreshing catalog contents is that deliberate pass, not something to fold into an unrelated chunk. If the review happens, move `everydayToolCatalogReviewedAt` and `impactCatalogReviewedAt` together, or the freshness module will keep measuring from whichever one lagged.

`ScreenDefinition` is now exactly `id`, `label`, `title`, `stage`, and `summary`. Adding a screen means adding a definition **and** a branch in `App.tsx`; there is no placeholder fallback to catch a missing branch, and a missing branch renders an empty workspace. The App test that walks every tab is the guard.

`noUnusedLocals` and `noUnusedParameters` are now on. Any new chunk that leaves a local, an import, or a non-underscore parameter unused will fail `npm run build`, not just `npm run test` - `build` runs `tsc --noEmit` first. That is deliberate: it is the loop whose absence let 388 lines of dead code accumulate unnoticed.

The user-facing vocabulary is now fixed across code and docs and should not be reinvented: **"if you were paying per token"** for the API-equivalent figure, **"added to your bill"** for what a metered account is charged, and **no use of "saved", "savings", or "avoided" for money**. `docs/2026-07-05-impact-estimator-methodology.md` v0.6.0 has the full framing under "What A Dollar Figure Means" and is the source of truth for it.

Notes for whoever picks up the next code chunk:

- The router recommends a tier and a shape of work, not a vendor. That is now stated in README, the product brief, and the manual. Any new copy that implies the app knows which provider suits a task contradicts `everydayToolCatalog.ts`, where same-class accounts share one capability vector.
- Unused code now fails the build. Prefix a genuinely-needed unused parameter with `_` (as `routeEconomics.ts` already does for `_task`); do not disable the flags.
- `stageGuidance.ts` and `taskDecomposition.ts` each still define a local `inlineList`, and `stageGuidance.ts` keeps a local `uniqueLabels`. All are live, so the flags cannot see the duplication. Giving them one home is a refactor, not a deletion, and needs its own chunk.
- `noToolsConfiguredMessage` is exported from `hardGates.ts` if another surface needs to match on it.
- Prompt and export text names tools by `modeLabel`; reuse `toolLabelForRouteStep` in `promptPackageGenerator.ts` rather than reaching for `step.modelId` in any user-facing string.
- Any new dollar figure must come from `apiEquivalentCostUsd` or `estimatedCostUsd`, never from the five deprecated savings fields still accepted by `routeOptionSchema`. Those exist only so pre-2026-07-25 route cards keep parsing; R5 or a later migration chunk can drop them once a store migration exists.
- `accountIsMeteredPerUse` in `modelGuidance.ts` is the predicate for "does this add to the bill". Do not use the routing layer's `zeroMarginalCost` for that question — it carries a scoring bonus and only covers free tiers.
- User-facing style labels live once, in `friendlyPolicyLabel` in `SetupScreens.tsx`. A label must be true to the scoring weights in `defaultPolicies.ts`; if the two disagree, that is a defect in one of them, not a wording preference.
- `modeEstimateProfile` in `toolModeCatalog.ts` is the only place a mode's pricing anchor, energy anchor, or energy profile may be decided. Do not re-derive any of the three anywhere else; that duplication is exactly what R11 removed, and the two copies had already drifted by 5x on a Claude execution step.
- Anchors describe the model class a mode names, not the plan tier it is reached through. If a future chunk needs finer price resolution, add a reviewed anchor with its source; do not invent a value to fill a gap. The Gemini benchmark understatement is a known open gap of this kind.

Both owner decisions are recorded and no chunk is waiting on input. The whole queue serves one goal — teach people to make more efficient, lower-impact AI decisions, without adding friction.
