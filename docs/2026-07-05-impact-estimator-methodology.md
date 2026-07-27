# 2026-07-08T22:07:13-06:00 - AI Task Router Impact Estimator Methodology

Document ID: GUI-ENG-002
Version: 0.10.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-26
Next Review: Before source refresh, exact public savings claims, social launch copy, live pricing tables, or opt-in estimator release
Timestamp: 2026-07-08T22:07:13-06:00
Last Updated: 2026-07-26T21:30:00-06:00

## Purpose

This document explains how AI Task Router frames right-sized help and cautious impact estimates.

The product promise is not "always use the cheapest model." The product promise is that an individual user can break a task into stages, choose the lightest safe helper for each stage, and upgrade only when the work actually earns stronger help.

Impact estimates are secondary. They explain why right-sized routing may reduce paid-tool waste, retries, and unnecessary heavyweight compute. They are local decision-support scenarios, not provider billing records, live pricing tables, telemetry, environmental proof, or guaranteed savings.

## What A Dollar Figure Means

Decided by the owner on 2026-07-25 and shipped in chunk R2 of the audit remediation plan.

Every dollar figure in the app answers one question: **if this work were metered per token at public API list prices, roughly what would it come to?** It is never presented as money the user saved.

The app reports two figures per route:

- **API-equivalent cost.** What the route's steps would cost at reviewed public API list prices for a 100k-token run, scaled by role, **including steps a plan the user already pays for would cover.** A monthly subscription hides what a single task consumes; making that visible is the teaching point.
- **Added to your bill.** What the route adds to a real bill, which is zero unless the account is metered per use. Free tiers and flat monthly plans are already paid for, so one more task on them costs nothing extra.

The gap between the two is the lesson, not a saving.

There is no premium baseline. Before 2026-07-25 the app compared every route against a premium API anchor the user was never going to buy, so a fresh install doing the work by hand was told it had saved $1.125 and 21.366 Wh. That baseline is gone. The comparison the app now offers is between the routes on the user's own screen, computed at display time from the sibling options, because those are the only routes the user can actually choose between.

Precision is capped at two significant figures for energy. The estimates come from hand-tuned role and mode multipliers over public anchors, and there is no measured figure underneath the watt-hour numbers that a user could check, so `11.619 Wh` would be claiming an accuracy the method never had. It displays as `12 Wh`.

Money is shown in real dollars and cents. Owner decision, 2026-07-26: *"I don't want rounding. I want dollars and cents. It absolutely is the way it needs to be."* The two-significant-figure cap introduced on 2026-07-25 applied to money as well, which meant a `$12.35` estimate reached the user as `$12.00` - it discarded real cents in the act of advertising the estimate's limits. Cents precision claims less than that rounding did, not more, so the argument above is unaffected: `$0.0512` now displays as `$0.05`, not as the `$0.051` the cap produced.

Below one cent the decimals extend rather than collapsing to `$0.00`, because free and nearly free are different claims. Route-to-route comparison at that scale belongs to the per-100-uses figures, which are large enough for cents to separate them.

All of this lives in one module, `src/domain/format.ts`. Four screens and the Markdown exporter previously each held their own copy, and they had drifted far enough that the stage guidance panel priced a route differently from the route card describing the same route.

The lifetime counter totals the API-equivalent estimate and energy of the routes the user actually followed. It no longer accumulates dollars from a fixed illustrative scenario. Followed routes saved before per-token estimates existed are counted separately and excluded from the totals rather than being credited with an invented figure.

The illustrative scenarios on the impact panel (100k-token example, right-sizing example, energy example) stay, and are labelled as examples that are not the user's own usage.

## Which Price Applies To Which Step

Added in chunk R11 of the audit remediation plan, 2026-07-25, after the owner found a route where the Lean option priced above the Balanced option.

**A step is priced against the model that step tells the user to open, not against the plan they reached it through.** A thinking pass costs what a thinking model costs whether it is opened from Plus or from Pro. Whether the user is *billed* for it is a separate question, decided by `accountIsMeteredPerUse`.

Before this rule, the anchor was chosen by provider and account tier. On ChatGPT Plus that gave the thinking pass and the fast execution pass the same anchor, so the only thing left to separate them was the role's token multiplier — and because execution is assumed to move more tokens than prompt design, the cheap instant pass priced *higher* than the reasoning pass it follows. The energy model, which has always been mode-aware, disagreed with the cost model by a factor of 210 on the same pair of steps.

There is one source of truth for a mode's anchors, `modeEstimateProfile` in `toolModeCatalog.ts`. It is used both when the catalog builds a mode and when the economics layer prices a saved step. These were computed separately until 2026-07-25 and had already drifted: the catalog declared a Claude execution pass at Haiku prices while route pricing charged it at frontier prices, a 5x gap on the same step, and Gemini's execution pass had the same defect.

A free tier still carries a pricing anchor. Free compute is not free to run, and showing what it would meter at is the entire point of the per-token figure; the billing question is answered separately.

Known coarseness, recorded rather than papered over:

- Only two Gemini anchors are on file, so the Gemini reasoning pass and the Gemini premium benchmark share one and the benchmark is understated. This is an anchor-set gap. Closing it needs a pricing review, not a mapping change, and no price may be invented to fill it.
- The anchors themselves were reviewed on 2026-07-05 and are representative tiers, not per-model prices. Re-reviewing them is a separate task with its own source snapshot; nothing in this chunk changed an anchor's value.

Each step records what it would meter at, what it consumes, and which anchor priced it, so a route total can be checked against its parts rather than trusted.

## Current Status

Status: Draft complete; owner-review ready

Completion target: Draft complete

Current implementation support:

- `src/domain/impact/impactEstimator.ts`
- `src/domain/impact/publicImpactSnapshot.ts`
- `src/tests/unit/impactEstimator.test.ts`
- `src/ui/screens/TaskRoutingScreens.tsx`

The public app shows a compact impact insight on the Best Options screen. It uses a reviewed source snapshot and visible caveats. It does not fetch provider pricing, inspect provider usage, connect accounts, run AI, send prompts, collect telemetry, or calculate a user's actual bill.

Deployment and smoke evidence are recorded in [2026-07-05-public-impact-insight-cloudflare-update.md](2026-07-05-public-impact-insight-cloudflare-update.md).

## Method Summary

The router treats work as a staged decision, not a single model choice.

1. Split the task into stages.
2. Apply privacy, sensitivity, source-permission, current-facts, and public-risk gates.
3. Pick the lightest safe helper for each stage.
4. Show why that helper fits, what to check, and when to upgrade.
5. Package the result as a manual Decision Card and prompt handoff.
6. Estimate impact only from visible assumptions, never from hidden telemetry or live provider data.

## User-Visible Route Contract

Each recommended stage should give the user a plain path:

1. What stage am I in?
2. Which helper, model tier, mode, or manual step should I use here?
3. Why is that choice safe enough for this stage?
4. What should I check before moving on?
5. What condition would justify upgrading to stronger help?
6. What action remains manual and outside the app?

The route detail should not hide this path behind internal implementation language. If a section is shown, it should add a decision, reason, check, or upgrade trigger that helps the user act. Repeating the same claim in several sections is a sign that the route explanation should be tightened.

## Stage Decision Model

| Stage | Typical right-sized help | Upgrade trigger |
|---|---|---|
| Frame | Manual checklist, local notes, or a small drafting model | The task is ambiguous, high-stakes, or needs expert decomposition. |
| Gather | Research-capable tool, citation workflow, or manual source review | The task needs current facts, citations, regulated sources, or high confidence. |
| Create | Small or mid model for routine drafting; stronger model for complex synthesis | The output has high consequence, complex reasoning, or repeated weak drafts. |
| Package | Artifact, formatting, spreadsheet, slide, or code-oriented helper | The deliverable has strict format, accessibility, code, or stakeholder requirements. |
| Review | Stronger reasoning model, checklist, second tool, or human review | The output is public-facing, costly to fix, regulated, or easy to misread. |
| Act | Manual action by the user | Any send, publish, merge, deploy, purchase, schedule, delete, or external change is required. |

The app does not execute the Act stage. It can describe the manual next step, but the user remains responsible for any outside action.

## Hard Gates

Hard gates override cost, speed, or convenience:

| Gate | Routing effect |
|---|---|
| Highly restricted content | Block external AI routes. Prefer manual or local-only guidance. |
| No-access source | Do not include the source in route cards or prompt packages. |
| Current facts or citations required | Require research-capable or manually verified source steps. |
| Public-facing risk | Require review warnings and human approval before publication. |
| Regulated or high-impact topic | Prefer review-heavy routes and visible uncertainty. |
| External action requested | Keep the app in guidance mode; do not execute. |

## Impact Estimate Rules

Impact estimates must be described as estimates, examples, scenarios, or local decision support.

They must not be described as:

- guaranteed savings
- a user's actual provider bill
- a live provider price
- a measured carbon or water result for the user's task
- proof that the product makes AI environmentally harmless

The app may show qualitative or scenario-based impact only when assumptions, source dates, and caveats are visible.

## Local Saved-Choice Tracking

Accepted routes are local records of the route the user chose to follow. The saved-choice count is useful as a behavior signal: it says the user accepted a route and saved its prompts or handoff on this device.

Per-token cost and energy numbers are different. They appear only when the followed route carries its own estimate. A followed route with no estimate is counted in a separate `plansWithoutEstimateCount` and shown to the user as such, so the totals are never quietly padded to look larger than the evidence.

This distinction keeps the product honest:

- tracked choice count = local user action
- API-equivalent cost or energy = scenario estimate from visible assumptions
- actual provider bill, energy, water, or carbon result = not known by the app

## Cost Formula

For an API model with reviewed per-million-token pricing:

```text
cost_usd =
  (input_tokens / 1,000,000) * input_usd_per_million
+ (cached_input_tokens / 1,000,000) * cached_input_usd_per_million
+ (output_tokens / 1,000,000) * output_usd_per_million
+ tool_or_search_addons
```

Default benchmark:

```text
100,000 total tokens = 75,000 input tokens + 25,000 output tokens
```

This benchmark represents a read, analyze, and draft style task. Other tasks should state their own input/output split.

Consumer subscriptions, credits, pooled allowances, request multipliers, batch pricing, regional pricing, search add-ons, media generation, and agent runtime can change the effective cost. Public copy should use "paid-tool waste" or "usage cost" unless the claim is tied to a reviewed API price snapshot.

## Right-Sizing Formula

```text
gross_avoided_cost_usd =
  task_count
* (baseline_cost_per_task - routed_cost_per_task)
* successful_routing_rate

net_avoided_cost_usd =
  gross_avoided_cost_usd
- induced_extra_usage_cost_usd
```

This formula is useful because it keeps the claim honest. Better routing does not need to make every AI call disappear. It can still matter if it helps a person avoid repeatedly using an oversized route when a lighter route would have been adequate.

## Environmental Scenario Formula

Environmental estimates are modeled separately from API price. Current public information does not give exact energy, water, or carbon results for every model, region, workload, and user path.

Use scenario anchors only:

```text
gross_avoided_Wh =
  task_count
* (baseline_Wh_per_run - routed_Wh_per_run)
* successful_routing_rate

net_avoided_Wh =
  gross_avoided_Wh
- induced_extra_usage_Wh
```

Then, if the source basis is still current:

```text
direct_water_mL = net_avoided_Wh * 0.27 to 1.10
broader_operational_water_mL = net_avoided_Wh * 3.0 to 4.5
```

These ranges are scenario anchors. They should not be converted into public per-user water claims without a fresh source review, owner review, and release evidence. They remain computed but unrendered for that reason.

## Everyday Restatement Of Energy

Added 2026-07-26. Watt-hours were the entire environmental argument in the app and almost no reader holds an intuition for them, so an honest, sourced figure was teaching nothing. Every energy figure a user decides on is now shown twice: the watt-hour figure first, then the same quantity restated as time on a stated device.

```text
bulb_minutes = watt_hours / 10 W * 60
```

This is deliberately **not** a second estimate and it introduces no new source dependency:

- A watt-hour is one watt for one hour. The conversion is arithmetic over a stated device rating, not a measurement or a research figure.
- It cannot be more or less accurate than the watt-hour figure it restates. All caveats live on that figure.
- One device is used across the whole range. Switching between bulbs, kettles, and phone charges to keep each number in a flattering range would make two routes incomparable at a glance, which is the only thing this restatement exists to serve.
- Sub-minute values collapse to "under a minute" rather than printing false precision, and zero or non-finite energy produces no phrase at all rather than asserting a bulb ran for no time.

The device rating is stated on screen and in Help, so a reader can check the arithmetic themselves. Changing the device is a copy change with no effect on any estimate.

## Comparison Multiples

Added 2026-07-26. Route comparisons previously printed two figures and left the reader to divide, which is where the lesson actually lives. The heaviest-sibling comparison now carries the multiple: "the heaviest route you were offered is about $2.40 on the same basis - roughly 8x this route."

A multiple is a ratio between two estimates computed on the same basis. It is not a claim about money kept, so it stays inside the fixed vocabulary below. Guards:

- no multiple when the candidate figure is zero, missing, or non-finite, because the ratio is undefined
- routes within 10% read as "about the same as this route" rather than "1.1x", which would overstate what the estimates support
- two significant figures, matching the display precision of the figures being compared

## Choice-Pattern Totals On Past Choices

Added 2026-07-26. Past Choices held every figure needed to show a pattern and rendered none of them. It now totals two things side by side for the whole log: what the routes the user followed would come to if metered, and what the heaviest route offered on each of those same tasks would have come to.

The pair is the same comparison as a single route's multiple, extended over the log. Both totals are API-equivalent estimates on the same basis, neither is a bill, and the second is a stated counterfactual over routes the app itself offered, not a reconstruction of what the user would otherwise have done. The rendered copy therefore uses comparison language only and stays inside the fixed vocabulary below.

Inclusion rules, chosen so the comparison cannot be quietly flattened:

- only choices the user marked `accepted` or `edited`, matching `plansWithoutEstimateCount` treatment elsewhere
- only choices where the chosen route carries an API-equivalent figure; choices saved before estimates existed are excluded, not counted as zero
- only choices where a heavier sibling was also on offer and carries a figure; a task with nothing heavier available has no comparison to make
- computed over the whole log rather than the filtered view, because a pattern a user can reshape by changing a filter is not a pattern

Excluding rather than zeroing matters in one direction specifically: a zero entry would add to the denominator of the comparison without adding to either total, dragging the pair toward "these routes barely differ" - the opposite of what the evidence supports.

## Pre-Task Placement Of Worked Examples

Added 2026-07-26. The three worked examples on Start Here - the 100k-token benchmark, the right-sizing example, and the environmental example - are the same figures from the same reviewed snapshot already rendered on Best Options. Showing them before a task is described is a placement change, not a new claim, and no figure is computed differently in the earlier position.

The right-sizing example is deliberately the middle of the three. It nets out induced extra runs, so it is the one example in the app that can honestly say a too-small route costs more, and it is stated that way rather than as a disclaimer under a cheaper-is-better headline. An app whose only pre-task lesson is "smaller is cheaper" teaches a habit its own estimator contradicts.

The panel repeats the existing hedges verbatim in substance: worked examples, not the user's usage, and nobody is claiming the reader ran them.

## Source Snapshot Policy

The current public app uses a source snapshot reviewed on `2026-07-26T21:30:00-06:00`. See the 2026-07-26 Catalog Review section for what was checked and what moved.

| Source area | Evidence or source |
|---|---|
| Public app deployment and smoke | [2026-07-05-public-impact-insight-cloudflare-update.md](2026-07-05-public-impact-insight-cloudflare-update.md) |
| Cloudflare production smoke | [2026-07-05-cloudflare-production-launch-smoke.md](2026-07-05-cloudflare-production-launch-smoke.md) |
| OpenAI pricing anchor | `https://developers.openai.com/api/docs/pricing` |
| Anthropic pricing anchor | `https://claude.com/pricing` |
| Google Gemini pricing anchor | `https://ai.google.dev/gemini-api/docs/pricing` |
| Perplexity pricing anchor | `https://docs.perplexity.ai/docs/getting-started/pricing` |
| Mistral pricing anchor | `https://mistral.ai/pricing/` |
| DeepSeek pricing anchor | `https://api-docs.deepseek.com/quick_start/pricing` |
| xAI pricing anchor | `https://docs.x.ai/developers/models` |
| Environmental anchor | Google Cloud AI impact disclosures and Jegham et al. infrastructure-aware estimates, as recorded in the validation log below. |

Before publishing exact public numbers, refresh the source snapshot:

1. Open official provider pages for the models being discussed.
2. Record the review timestamp.
3. Normalize API prices to USD per 1 million input tokens and USD per 1 million output tokens.
4. Record cached-input, search, reasoning, media, regional, priority, batch, subscription, and credit-system caveats separately.
5. Calculate benchmark costs from the formulas above.
6. Use environmental estimates only as scenario anchors unless provider-specific energy data exists for the exact workload.
7. Label the result as an estimate with assumptions visible.
8. Re-run tests and claim-boundary scans before public use.

Do not let the browser app fetch provider pricing live in the MVP. Live fetching would add external calls, stale parsing risk, and support obligations. Use reviewed snapshots until a dedicated update workflow exists.

## Public Claim Boundaries

Safe public language:

```text
AI Task Router helps people build better AI judgment. It shows where to start, how to shape the task, which helper fits each stage, and when a simpler route is enough. That can reduce paid-tool waste, reduce retries, and may reduce unnecessary heavyweight AI use.
```

Stronger but still bounded:

```text
The impact can be meaningful because model choice, tool mode, and retry count can change the cost of the same work. The goal is not to shame people for using AI. The goal is to give people better defaults so they can get useful work done with less confusion, less wasted spend, and less unnecessary infrastructure demand.
```

Avoid:

```text
AI Task Router saves every user money.
AI Task Router saves X gallons of water per month.
This tool makes AI green.
Use the cheapest model every time.
The app knows your provider bill.
```

## Product Implications

Near-term product:

- keep the app focused on right-helper-by-stage guidance
- keep cost and energy impact qualitative or clearly scenario-based
- keep Decision Cards and prompt packages manual-use only
- never present any figure as money the user saved; every dollar figure is an API-equivalent per-token estimate
- price each step against the model that step names, and show the per-step figures so a route total can be checked against its parts
- do not connect provider accounts, import usage history, or fetch live pricing

Future opt-in estimator:

- ask for task count, expected token size, baseline route, recommended route, and avoided retries
- calculate estimates locally only
- show source dates, assumptions, and confidence level
- let users edit the inputs
- avoid telemetry, account connections, provider billing imports, and guarantee language

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T08:52:38-06:00 | Official source review | passed | Reviewed official pricing/environmental pages for OpenAI, Anthropic, Google Gemini, Perplexity, Mistral, DeepSeek, xAI, Google Cloud AI impact, and Jegham et al. |
| 2026-07-05T08:58:00-06:00 | `npm run test -- impactEstimator` | passed | Focused Vitest suite passed: 1 file and 5 tests covering 100k-token math, cached input pricing, right-sizing savings, energy/water scenario ranges, and source anchoring. |
| 2026-07-05T08:58:09-06:00 | `npm run test` | passed | Full Vitest suite passed: 13 files and 93 tests. |
| 2026-07-05T08:58:09-06:00 | `npm run build` | passed with existing warning | TypeScript and Vite production build passed; existing 519.84 kB chunk-size warning remains. |
| 2026-07-05T09:01:13-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check` | passed | Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices. |
| 2026-07-05T09:30:02-06:00 | `npm run test -- impactEstimator`; `npm run test -- App` | passed | Focused D16 tests passed: impact suite 1 file and 7 tests; App suite 1 file and 14 tests. |
| 2026-07-05T09:30:21-06:00 | `npm run test`; `npm run build`; `npm run scan:web-rc`; `npx playwright test` | passed with existing build warning | Full Vitest passed 13 files and 95 tests; production build passed with existing Vite chunk-size warning; web RC scan passed; local Playwright passed 6 Chromium tests. |
| 2026-07-25T09:40:19-06:00 | Chunk R2 rewrite of the impact framing | passed | Removed the premium-API baseline and all savings fields; added the API-equivalent per-token figure beside the billed figure; capped display precision at two significant figures; rebuilt the lifetime counter on followed-route estimates. Doc updated in the same task. |
| 2026-07-26T09:49:39-06:00 | Money formatting unified and un-rounded | passed | Four divergent `formatUsd` copies collapsed into `src/domain/format.ts`. The stage guidance panel had been hardcoding `en-US` and skipping the significant-figure rounding, so it disagreed with the route card describing the same route. Money now shows real dollars and cents at owner direction; energy keeps the two-significant-figure cap. Fifteen assertions added in `src/tests/unit/format.test.ts`; `src/tests/unit/exportImport.test.ts` updated where the fixture's `$0.051` became `$0.05`. Full Vitest 16 files / 147 tests passed. Doc updated in the same task. |
| 2026-07-05T09:34:16-06:00 | Local visual smoke and hosted production smoke | passed | Desktop/mobile preview checks had no horizontal overflow; source details opened cleanly on mobile; Cloudflare production deployment and hosted Playwright/Chromium impact smoke passed. |
| 2026-07-26T10:52:00-06:00 | Usability audit remediation: readable energy, route mix, comparison multiples | passed | Three findings from the 2026-07-26 teaching audit. (1) Every energy figure a user decides on now carries an everyday restatement; see the section above for why this adds no estimate. (2) `followedByStrategy` was computed, tested, and never rendered - the lean/balanced/premium split now appears in the followed-choice counter, the only surface that answers "am I always reaching for the heaviest option?". (3) Heaviest-sibling comparisons now carry the multiple instead of leaving the reader to divide. Seven new assertions in `src/tests/unit/format.test.ts`, three in `src/tests/e2e/mvp-workflows.spec.ts` including a guard that the new copy did not reintroduce savings vocabulary. Full Vitest 16 files / 154 tests passed; Playwright 7/7; `npm run build` clean and within budget. Doc updated in the same task. |
| 2026-07-26T11:20:59-06:00 | Usability audit remediation: pre-task lesson and log-level pattern | passed | Two further findings from the same audit. (1) The whole pre-task case for routing was one hedged line, so a visitor who never described a task learned nothing; Start Here now carries the three worked examples from the existing reviewed snapshot, with the right-sizing one placed in the middle precisely because it admits a too-small route costs more. (2) Past Choices rendered neither cost nor energy despite holding both; each row now shows what the followed route would cost metered and how it compares to the heaviest route offered, and the log carries the choice-pattern totals described above. `heaviestSiblingRoute` and `comparisonMultipleClause` were extracted from `TaskRoutingScreens.tsx` into `src/domain/impact/routeComparison.ts` so the second consumer reuses them rather than starting a fourth drifted copy, which is the defect `src/domain/format.ts` was created to fix. Twelve new assertions in `src/tests/unit/routeComparison.test.ts`, six in `src/tests/e2e/mvp-workflows.spec.ts` including a narrow-viewport check on Start Here. Full Vitest 17 files / 166 tests passed; Playwright 7/7; `npm run build` clean and within budget. Doc updated in the same task. |

## Handoff

This methodology now supports a reviewed public methodology draft while preserving safe claim boundaries. It reinforces the main product story: split the task into stages, choose the right helper for each stage, keep the handoff manual, and treat impact numbers as local estimates rather than promises.

The 2026-07-09 review pass adds a user-visible route contract and saved-choice tracking boundaries. This supports owner testing of the Best Options screen without reopening the paused opt-in estimator UI.

Next bounded chunks can be:

- an opt-in local estimator UI that uses editable assumptions
- owner-reviewed public launch copy that stays inside these claim boundaries
- a fresh source snapshot before any exact public pricing, savings, energy, water, or carbon claims

Do not publish public environmental savings claims, live pricing tables, exact per-user savings, or provider-comparison tables without a fresh source review, owner review, and release evidence.

## 2026-07-26 Catalog Review

R-009's scheduled 90-day review, brought forward from 2026-10-03 and completed 2026-07-26T21:30:00-06:00. Every pricing source in `pricingSources` was fetched and compared against its anchor. Both review dates moved together, as R-009 requires.

**Fifteen of sixteen price anchors were verified unchanged**, which is the generic-tier design working: anchors name a tier ("low-cost text API anchor"), not a model, so a provider renaming or superseding a model does not invalidate them.

| Anchor | Verified against | Result |
|---|---|---|
| OpenAI low-cost / premium / frontier | gpt-5.4-nano $0.20/$1.25, gpt-5.5 $5/$30, gpt-5.5-pro $30/$180 | unchanged |
| Anthropic low-cost / premium / frontier / highest | Haiku 4.5 $1/$5, Sonnet 5 $2/$10, Opus 5 $5/$25, Fable 5 $10/$50 | unchanged, but see the announced change below |
| Google premium | Gemini 3.1 Pro $2/$12 | unchanged |
| **Google low-cost** | **Gemini 3.5 Flash-Lite $0.30/$2.50, cached $0.03** | **changed from $0.25/$1.50/$0.025** |
| Perplexity Sonar / Sonar Pro | $1/$1 and $3/$15 | unchanged |
| Mistral Large | $2/$6 | unchanged |
| DeepSeek low-cost / premium | v4-flash $0.14/$0.28, v4-pro $0.435/$0.87 | unchanged |
| xAI low-cost | grok-build-0.1 $1/$2 | unchanged |
| **xAI premium** | **grok-4.5 $2/$6 is now the flagship tier** | **re-tiered from grok-4.3 $1.25/$2.50** |

Neither changed anchor feeds the public snapshot, which draws on the two OpenAI anchors, so no user-facing worked example moved.

**The model names were the real finding.** R-009 anticipated exactly this: "a renamed, retired, or superseded model would be recommended by name with full confidence." The Gemini guidance named Gemini 2.5 Flash, 2.5 Flash-Lite, and 2.5 Pro throughout. The Gemini app picker now offers **Gemini 3 Flash** (as Fast and Thinking) and **Gemini 3 Pro**, with a Standard/Extended thinking level. A user following the old guidance would have been hunting for models that are not in their picker. Rewritten to the current picker names and modes. Claude Opus 4.8 references moved to Opus 5, and the Grok upgrade paths moved to Grok 4.5, which did not exist at the last review. ChatGPT's Instant/Thinking/Pro tiers and the GPT-5.5 family were verified still present; GPT-5.6 now sits above them, which the existing upgrade-trigger phrasing already accommodates.

**One announced change is dated and pending.** Claude Sonnet 5's introductory API pricing ends 2026-09-01, when $2/$10 becomes $3/$15. The anchor is correct today and was not pre-changed - the app states current list prices, not future ones.

That exposed a real gap in the freshness mechanism. The 90-day clock measures how long since a human looked; it cannot know about a change a provider has already dated, so on 2026-09-01 the catalog would have become wrong while still reading as fresh, five weeks after a review. `announcedCatalogChanges` in `catalogFreshness.ts` now records dated changes and makes the catalog stale on the day one lands, whatever the review age, with the notice naming the change instead of the age. Record a change there only when the provider has published both the change and its date; an undated rumour belongs in the risk register.

Note that the `pricingSources` entry IDs still carry the `-2026-07-05` suffix. They are stable internal keys referenced by every anchor, not dates the user sees; the displayed `reviewedAt` comes from `impactCatalogReviewedAt` and is current. Renaming them is churn, not correction.

