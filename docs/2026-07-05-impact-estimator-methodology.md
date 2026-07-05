# AI Task Router Impact Estimator Methodology

Document ID: GUI-ENG-002
Version: 0.2.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-05
Next Review: Before source refresh, exact public savings claims, social launch copy, live pricing tables, or opt-in estimator release
Timestamp: 2026-07-05T08:52:38-06:00
Last Updated: 2026-07-05T09:34:16-06:00

## Purpose

This document turns the environmental-impact information-session draft into a calculation method that can support public education, future in-app estimates, and social launch copy without making false claims.

The goal is to show that the benefit can be substantial when people choose a right-sized AI route earlier:

- fewer paid-token surprises
- fewer retries in the wrong tool
- fewer heavyweight reasoning calls for simple work
- fewer unnecessary media or agent workflows
- better user skill and judgment around AI tool choice

This is not a public proof that AI Task Router saves a fixed amount of money, energy, water, or carbon for every user.

## Current Status

Status: Task complete for public insight panel; methodology remains source-snapshot based

Completion target: Task complete for adding the safe public impact story to the online app

Implemented in this repo:

- `src/domain/impact/impactEstimator.ts`
- `src/domain/impact/publicImpactSnapshot.ts`
- `src/tests/unit/impactEstimator.test.ts`
- `src/ui/screens/TaskRoutingScreens.tsx`

D16 wires a compact public impact insight into the Best Options screen and adds a small Start Here skill-building cue. The public panel uses one reviewed-source snapshot and visible caveats. It is not a live pricing table, not a provider-usage import, and not a per-user savings calculator.

Deployment and smoke evidence are recorded in [2026-07-05-public-impact-insight-cloudflare-update.md](2026-07-05-public-impact-insight-cloudflare-update.md).

## Source Refresh Algorithm

Use this process before publishing impact claims:

1. Open official provider pricing pages for the models being discussed.
2. Record the review timestamp.
3. Normalize prices to USD per 1 million input tokens and USD per 1 million output tokens.
4. Record cached-input, search, reasoning, video, image, regional, priority, batch, subscription, and credit-system caveats separately.
5. Calculate benchmark costs from the formula below.
6. Use environmental estimates only as scenario anchors unless provider-specific energy data exists for the exact workload.
7. Label the result as an estimate, with assumptions visible.
8. Re-run tests and claim-boundary scans before public use.

Do not let the browser app fetch provider pricing live in the MVP. That would add external calls, stale parsing risk, and support obligations. Use reviewed source snapshots until a dedicated update workflow exists.

## Cost Formula

For any API model with per-million-token pricing:

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

This split represents a read/analyze/draft style task. Other tasks should show their own input/output split.

## Current Pricing Anchors

Reviewed at `2026-07-05T08:52:38-06:00`.

| Provider | Official source | Anchor values used |
|---|---|---|
| OpenAI | `https://developers.openai.com/api/docs/pricing` | gpt-5.4-nano `$0.20` input / `$1.25` output per 1M; gpt-5.5 `$5` / `$30`; gpt-5.5-pro `$30` / `$180`; image/video/tool prices recorded as separate add-ons. |
| Anthropic | `https://claude.com/pricing` | Haiku 4.5 `$1` / `$5`; Sonnet 5 introductory `$2` / `$10` through 2026-08-31; Opus 4.8 `$5` / `$25`; Fable 5 `$10` / `$50`; web search and managed-agent session prices are separate add-ons. |
| Google Gemini | `https://ai.google.dev/gemini-api/docs/pricing` | Gemini 3.1 Flash-Lite `$0.25` / `$1.50`; Gemini 3.1 Pro Preview `$2` / `$12` for prompts up to 200k tokens; grounding and video pricing are separate add-ons. |
| Perplexity | `https://docs.perplexity.ai/docs/getting-started/pricing` | Sonar `$1` / `$1`; Sonar Pro `$3` / `$15`; Sonar Deep Research has separate citation, search-query, and reasoning-token prices. |
| Mistral AI | `https://mistral.ai/pricing/` | Mistral Large example `$2` / `$6`; batch processing can discount pricing. |
| DeepSeek | `https://api-docs.deepseek.com/quick_start/pricing` | DeepSeek V4 Flash cache-miss `$0.14` / `$0.28`; DeepSeek V4 Pro cache-miss `$0.435` / `$0.87`; cache-hit rates are much lower. |
| xAI | `https://docs.x.ai/developers/models` | Grok Build 0.1 `$1` / `$2`; Grok 4.3 `$1.25` / `$2.50`; priority and batch pricing can change effective rates. |

Consumer tools such as ChatGPT, Claude, Gemini, Microsoft Copilot, GitHub Copilot, Perplexity, Cursor, and others may use subscriptions, credits, included usage, request multipliers, or pooled allowances instead of direct per-token billing. Public copy should say "paid-tool waste" or "usage cost" unless the claim is about an API model with a verified token price.

## 100k Token Benchmark Examples

Using the default 75k input / 25k output benchmark:

| Model anchor | Estimated API cost for 100k tokens |
|---|---:|
| DeepSeek V4 Flash, cache miss | `$0.018` |
| OpenAI gpt-5.4-nano | `$0.046` |
| DeepSeek V4 Pro, cache miss | `$0.054` |
| Google Gemini 3.1 Flash-Lite | `$0.056` |
| Perplexity Sonar | `$0.100` |
| xAI Grok Build 0.1 | `$0.125` |
| xAI Grok 4.3 | `$0.156` |
| Anthropic Haiku 4.5 | `$0.200` |
| Mistral Large | `$0.300` |
| Anthropic Sonnet 5 introductory | `$0.400` |
| Google Gemini 3.1 Pro Preview | `$0.450` |
| Perplexity Sonar Pro | `$0.600` |
| Anthropic Opus 4.8 | `$1.000` |
| OpenAI gpt-5.5 | `$1.125` |
| Anthropic Fable 5 | `$2.000` |
| OpenAI gpt-5.5-pro | `$6.750` |

The point is not that the lowest-cost model is always best. The point is that routing matters. A 100k-token task can vary from cents to multiple dollars before search, reasoning, media, agent runtime, priority, regional, or subscription effects are included.

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

Example:

```text
100 tasks
* ($1.125 gpt-5.5 benchmark - $0.04625 gpt-5.4-nano benchmark)
* 80% successful routing
= $86.30 gross avoided cost

If the easier tool causes 10 extra gpt-5.4-nano benchmark runs:
$86.30 - $0.46 = $85.84 net avoided cost
```

This is why right-sized AI tools can be exciting without exaggeration. They do not need to make every prompt disappear. They can help people avoid repeatedly using the expensive path when a lighter path is adequate.

## Environmental Formula

Environmental estimates should be modeled separately from API price because current providers do not publish exact energy data for every model and every user workflow.

Use scenario anchors:

```text
gross_avoided_Wh =
  task_count
* (baseline_Wh_per_run - routed_Wh_per_run)
* successful_routing_rate

net_avoided_Wh =
  gross_avoided_Wh
- induced_extra_usage_Wh
```

Then:

```text
direct_water_mL = net_avoided_Wh * 0.27 to 1.10
broader_operational_water_mL = net_avoided_Wh * 3.0 to 4.5
```

Energy anchors currently used:

| Anchor | Value | Source use |
|---|---:|---|
| Median Gemini Apps text prompt | `0.24 Wh` | Provider-stated median text prompt anchor. |
| GPT-4o medium text estimate | `1.214 Wh` | Independent infrastructure-aware estimate. |
| o3 medium reasoning estimate | `21.414 Wh` | Reasoning-workload scenario. |
| o3 long reasoning estimate | `39.223 Wh` | High-intensity reasoning scenario. |

Example:

```text
10 tasks
* (21.414 Wh o3 medium scenario - 1.214 Wh GPT-4o medium scenario)
* 50% successful routing
= 101 Wh net avoided
```

Direct data-center water range:

```text
101 Wh * 0.27 to 1.10 mL/Wh = 27 to 111 mL
```

Broader operational water range:

```text
101 Wh * 3.0 to 4.5 mL/Wh = 303 to 455 mL
```

## Public Message

Use this for video, social, or public page drafting after review:

```text
AI Task Router helps people build better AI judgment. It shows where to start, how to shape the task, and when a simpler tool is enough. That can reduce paid-tool waste, reduce retries, and may reduce unnecessary AI compute from oversized models, repeated failed prompts, and heavyweight media or agent workflows.
```

Stronger version, still safe:

```text
The impact can be substantial because model choice changes the cost of the same 100k-token task by orders of magnitude. The goal is not to shame people for using AI. The goal is to give people better defaults so they can get useful work done with less confusion, less wasted spend, and less unnecessary infrastructure demand.
```

Avoid:

```text
AI Task Router saves every user money.
AI Task Router saves X gallons of water per month.
This tool makes AI green.
Use the cheapest model every time.
```

## Product Implications

Near-term product:

- keep qualitative cost and energy preferences in the app
- use this estimator for education and public methodology
- do not show exact user savings unless the user enters assumptions
- do not connect provider accounts or fetch usage history

Future opt-in estimator:

- ask for task count, expected token size, baseline route, recommended route, and avoided retries
- calculate local-only estimates
- show assumptions, source dates, and confidence
- let users edit the inputs
- avoid telemetry, account connections, and provider billing imports

## Current Public UI

The public app now shows the impact story at the decision moment, directly after the Best Options recommendation summary.

Visible public claims are intentionally bounded:

- "This app does not run AI or promise savings."
- "Example estimates use reviewed public API pricing and energy research."
- "They are not your bill, and they are not a guarantee."

The visible examples include:

- a 100k-token API pricing comparison
- a right-sizing scenario for 100 similar tasks
- a scenario energy estimate
- a skill payoff statement about better defaults
- a recommendation-specific note based on the current best option's resource level
- a collapsed source list with official pricing and environmental references

The UI does not fetch provider pricing, inspect provider usage history, connect accounts, run AI, send prompts, or collect telemetry.

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

This methodology now supports the public in-app impact insight while preserving safe claim boundaries. The next bounded chunk can be either:

- public copy review for a video, LinkedIn, Facebook, or YouTube launch post using the safe language now visible in the app
- a small in-app estimator UI that remains local-only and opt-in
- an Old Skool AI methodology page, after owner review and a fresh source check

Do not publish public environmental savings claims, live pricing tables, or exact per-user savings without a source refresh, owner review, and release evidence.
