# 2026-07-08T22:07:13-06:00 - AI Task Router Impact Estimator Methodology

Document ID: GUI-ENG-002
Version: 0.4.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-08
Next Review: Before source refresh, exact public savings claims, social launch copy, live pricing tables, or opt-in estimator release
Timestamp: 2026-07-08T22:07:13-06:00
Last Updated: 2026-07-09T11:06:44-06:00

## Purpose

This document explains how AI Task Router frames right-sized help and cautious impact estimates.

The product promise is not "always use the cheapest model." The product promise is that an individual user can break a task into stages, choose the lightest safe helper for each stage, and upgrade only when the work actually earns stronger help.

Impact estimates are secondary. They explain why right-sized routing may reduce paid-tool waste, retries, and unnecessary heavyweight compute. They are local decision-support scenarios, not provider billing records, live pricing tables, telemetry, environmental proof, or guaranteed savings.

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

Avoided-cost and energy numbers are different. They should appear only when the selected route has enough reviewed scenario data to calculate a comparison. If the app cannot calculate a meaningful estimate, it should prefer clear unavailable or not-estimated language over implying that the accepted route avoided exactly zero cost or zero watt hours.

This distinction keeps the product honest:

- tracked choice count = local user action
- avoided cost or energy = scenario estimate from visible assumptions
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

These ranges are scenario anchors. They should not be converted into public per-user water claims without a fresh source review, owner review, and release evidence.

## Source Snapshot Policy

The current public app uses a source snapshot reviewed on `2026-07-05T08:52:38-06:00`.

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
- do not show exact user savings unless the user enters assumptions
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
| 2026-07-05T09:34:16-06:00 | Local visual smoke and hosted production smoke | passed | Desktop/mobile preview checks had no horizontal overflow; source details opened cleanly on mobile; Cloudflare production deployment and hosted Playwright/Chromium impact smoke passed. |

## Handoff

This methodology now supports a reviewed public methodology draft while preserving safe claim boundaries. It reinforces the main product story: split the task into stages, choose the right helper for each stage, keep the handoff manual, and treat impact numbers as local estimates rather than promises.

The 2026-07-09 review pass adds a user-visible route contract and saved-choice tracking boundaries. This supports owner testing of the Best Options screen without reopening the paused opt-in estimator UI.

Next bounded chunks can be:

- an opt-in local estimator UI that uses editable assumptions
- owner-reviewed public launch copy that stays inside these claim boundaries
- a fresh source snapshot before any exact public pricing, savings, energy, water, or carbon claims

Do not publish public environmental savings claims, live pricing tables, exact per-user savings, or provider-comparison tables without a fresh source review, owner review, and release evidence.
