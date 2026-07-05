# AI Environmental Impact Information Session

Document ID: GUI-ENG-001
Version: 0.3.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before exact public claims, source refresh, public methodology publication, or social launch
Last Updated: 2026-07-05T09:34:16-06:00
Status Updated: 2026-07-05T09:34:16-06:00

## Purpose

This document prepares an information session on how AI Task Router can help people reduce wasted AI compute by choosing a right-sized tool earlier.

The goal is not to claim that AI Task Router guarantees environmental savings for every user. The goal is to explain, with defensible numbers and clear caveats, why better AI tool choice can matter:

- per-prompt impacts are often small for ordinary text use
- small improvements can matter when repeated across millions or billions of uses
- the largest avoidable impacts come from unnecessary reasoning, agentic, image, video, and repeated failed workflow runs
- social benefit comes from helping people build better AI judgment, not from shaming ordinary AI use

## Intended Use

Use this document for:

- internal information sessions
- owner review of environmental positioning
- future impact-estimator design
- public-copy preparation after review
- education about right-sized AI use

For the calculation backbone and source-refresh procedure, use [AI Task Router Impact Estimator Methodology](2026-07-05-impact-estimator-methodology.md). That D15 methodology adds a local deterministic estimator module, 100k-token pricing examples, right-sizing cost formulas, and scenario-based energy/water calculations. It remains draft methodology, not live public marketing copy.

Do not use this document as:

- a public proof that the product saves a fixed amount of energy or water
- a carbon accounting report
- a lifecycle assessment
- an offset claim
- a claim that local AI is always better than cloud AI
- a claim that ordinary text prompts are environmentally harmless at global scale

## Core Session Message

AI Task Router's environmental value is not that it makes every AI interaction free or green.

Its value is that it can help users avoid wasted AI work:

- choosing a large reasoning model for a simple task
- repeatedly trying the wrong tool
- generating images or video before clarifying the actual need
- letting a coding agent loop when a smaller task or clearer prompt would work
- using a general-purpose model when a smaller or more direct tool is enough

For one person, avoiding a few ordinary text prompts may look tiny. Across very large adoption, tiny changes become meaningful. And for high-intensity users, avoiding one unnecessary reasoning call, image batch, video generation, or coding-agent loop can outweigh hundreds or thousands of simple text prompts.

The honest claim is:

> AI Task Router is designed to reduce wasted AI work by helping people choose a right-sized tool earlier. Environmental estimates should be shown as scenario-based ranges, with assumptions visible.

## Claim Boundaries

### Claims That Are Reasonable

- The app may reduce wasted AI compute when it helps a user choose a smaller, more appropriate, or more direct tool.
- The largest savings opportunities are in avoided retries, avoided reasoning calls, avoided agent loops, and avoided unnecessary media generation.
- Even small per-user improvements can matter when repeated across a large user population.
- Estimates should be shown as ranges because model, provider, hardware, cooling, grid mix, prompt length, batching, and task type all matter.

### Claims To Avoid

- "This app saves water every time you use it."
- "This app makes AI green."
- "Each user saves X gallons per month."
- "Local AI is always better for the environment."
- "Text prompts do not matter."
- "AI is harmless because one prompt is small."
- "These numbers prove exact savings."

### Safer Public Language

Use:

> Small AI choices can add up. AI Task Router helps people choose a right-sized tool earlier, which may reduce unnecessary AI compute from retries, oversized models, and avoidable media or agent workflows.

Use:

> Our impact estimates are scenario-based. We show the assumptions, use published ranges, and distinguish direct data-center water from broader operational water.

Avoid:

> AI Task Router saves X liters of water per user.

unless the product has measured user behavior, a clear baseline, and reviewed public methodology.

## Evidence Base

These values are suitable as initial anchors for an internal estimator. They should be reviewed before public publication because provider efficiency, model routing, and infrastructure change quickly.

| Source | Reported or estimated value | Use in estimator | Caveat |
|---|---:|---|---|
| Sam Altman, "The Gentle Singularity" | average ChatGPT query: about `0.34 Wh`; water about `0.000085 gallons`, or `0.32 mL` | lower-bound provider-stated average ChatGPT anchor | No detailed methodology was published. |
| Google, "Measuring the environmental impact of delivering AI at Google Scale" | median Gemini Apps text prompt: `0.24 Wh`, `0.26 mL` water, `0.03 gCO2e` | lower-bound provider-stated median text prompt anchor | Median text prompt only; not all prompts, not future performance, not independently verified. |
| Jegham et al., "How Hungry is AI?" | GPT-4o short/medium/long: `0.421`, `1.214`, `1.788 Wh`; o3 short/medium/long: `7.026`, `21.414`, `39.223 Wh` | model-and-prompt-length energy bands | Infrastructure-aware estimate, not direct provider telemetry. |
| Jegham et al., "How Hungry is AI?" | OpenAI/Microsoft Azure water multipliers: `0.30 L/kWh` on-site plus `3.142 L/kWh` off-site in the paper's assumptions | broader operational water conversion | Assumes provider/region multipliers; not all facilities. |
| Luccioni, Jernite, and Strubell, "Power Hungry Processing" | image generation average: `2.907 kWh` per 1,000 inferences, or `2.907 Wh` per image | image-generation anchor | Based on measured models/tasks in the study; modern products vary. |
| MIT Technology Review reporting summarized by KQED | 5-second AI video example: about `3.4 million joules`, or `944 Wh` | video-generation anchor | Based on a specific model/example; video tools vary widely. |
| Microsoft datacenter efficiency disclosure | FY25 global PUE `1.17`; FY25 global WUE `0.27 L/kWh` | direct data-center water lower band | WUE covers water used for humidification/cooling relative to IT energy, not full water footprint. |
| Li et al., "Making AI Less Thirsty" | GPT-3 training in Microsoft U.S. data centers: `700,000 L` direct evaporated freshwater; total training estimate `5.4 million L`; inference: `500 mL` for roughly `10-50` medium responses | broader water-footprint caution and historical water range | Older GPT-3 example; location and time strongly affect water footprint. |
| IEA, "Key Questions on Energy and AI" | data-center electricity demand grew in 2025; AI-focused data-center electricity grew faster; reasoning, video, and agentic tasks can use hundreds or thousands of times more energy than simple text | strategic framing | Sector-wide projection, not per-user product measurement. |

## Unit Conversions

Use these conversions in the session and any future estimator:

| Conversion | Value |
|---|---:|
| `1 kWh` | `1,000 Wh` |
| `1 Wh` | `0.001 kWh` |
| `1 gallon` | `3.785 L` |
| `0.000085 gallons` | about `0.32 mL` |
| `3.4 million joules` | about `944 Wh` |

## Water Accounting Bands

Water estimates need clear labels.

| Band | Formula | Suggested use |
|---|---|---|
| Direct/provider-stated water | `Wh * 0.27-1.10 mL/Wh` | Conservative direct cooling/humidification or provider-stated estimate. |
| Broader operational water | `Wh * 3.0-4.5 mL/Wh` | Includes off-site electricity-generation water in a U.S. cloud-style scenario. |
| High-water infrastructure scenario | `Wh * 7.0+ mL/Wh` | Use only when modeling less efficient or more water-intensive infrastructure. |

Always label whether the number means:

- direct data-center water
- broader operational water
- water withdrawal
- water consumption
- embodied/supply-chain water

Do not mix these in a single public claim.

## Estimation Model

The product should estimate avoided AI work, not magic savings.

### Core Formula

```text
net_energy_saved_Wh =
  avoided_short_text_calls * short_text_Wh
+ avoided_medium_text_calls * medium_text_Wh
+ avoided_long_text_calls * long_text_Wh
+ avoided_reasoning_calls * reasoning_Wh
+ avoided_images * image_Wh
+ avoided_videos * video_Wh
+ avoided_agent_sessions * agent_session_Wh
+ right_sizing_delta_Wh
- induced_extra_usage_Wh
```

Then:

```text
direct_water_saved_mL = net_energy_saved_Wh * direct_water_mL_per_Wh
broader_water_saved_mL = net_energy_saved_Wh * broader_water_mL_per_Wh
```

### Right-Sizing Formula

When the user still completes the task but uses a smaller or more appropriate tool:

```text
right_sizing_delta_Wh =
  task_count
* (baseline_tool_Wh - recommended_tool_Wh)
* successful_routing_rate
```

Example:

```text
10 tasks * (21 Wh reasoning baseline - 1.2 Wh medium text route) * 0.8
= 158.4 Wh avoided
```

This is a stronger and more honest model than counting all app usage as savings.

### Retry Reduction Formula

When the user avoids failed prompts:

```text
retry_savings_Wh =
  avoided_retry_count
* energy_per_attempt_Wh
```

Example:

```text
30 avoided medium text retries * 1.2 Wh
= 36 Wh avoided
```

### Agent Loop Formula

When the user avoids a coding-agent or agentic workflow loop:

```text
agent_loop_savings_Wh =
  avoided_agent_sessions
* estimated_session_Wh
```

Initial anchor:

```text
1 avoided median coding-agent session * 41 Wh
= 41 Wh avoided
```

For heavy development days, a separate published estimate puts one heavy coding-agent day around `1,300 Wh`. Use that only as a heavy-user scenario, not a normal user default.

## User Categories

These categories should be presented as scenarios, not guarantees.

### Category 1: Novice User

Profile:

- brand new to AI
- tries tools casually
- may ask simple questions
- may generate a few images for curiosity
- may use more AI because the app makes AI less intimidating

Impact pattern:

- savings from ordinary text retries are small per person
- education value is high
- net environmental impact may be neutral or negative if the user would not otherwise use AI
- the app's best role is preventing overuse of expensive features and teaching right-sized AI habits early

Example monthly scenario:

| Behavior change | Energy impact |
|---|---:|
| Avoids 10 average failed text prompts | `3.4 Wh` saved |
| Avoids 1 unnecessary image generation | `2.9 Wh` saved |
| Adds 10 extra average text prompts because AI is now easier | `3.4 Wh` added |
| Net scenario | about `2.9 Wh` saved |

This looks tiny for one person. At scale:

```text
2.9 Wh/month * 1,000,000,000 users
= 2.9 GWh/month
= 34.8 GWh/year
```

Broader operational water at `3.0-4.5 mL/Wh`:

```text
34.8 GWh/year = 34,800,000 kWh/year
34,800,000 kWh * 3.0-4.5 L/kWh
= 104-157 million liters/year
```

Message:

> For novice users, the environmental win is not dramatic per person. The win is building better habits before billions of small choices become default behavior.

### Category 2: Intermediate User

Profile:

- uses AI a few times per week
- compares tools
- asks for writing, planning, summarizing, brainstorming, coding help, or research setup
- may retry prompts several times when the first tool fails

Impact pattern:

- credible savings from fewer retries and fewer wrong-tool choices
- occasional savings from avoiding unnecessary reasoning or image generation
- best category for a balanced, defensible information-session estimate

Example monthly scenario:

| Behavior change | Energy impact |
|---|---:|
| Avoids 40 medium text retries | `48 Wh` saved |
| Routes 6 tasks from reasoning model to medium text model | about `119 Wh` saved if baseline `21 Wh` and route `1.2 Wh` |
| Avoids 3 unnecessary image generations | `8.7 Wh` saved |
| Adds 20 average text prompts due to easier use | `6.8 Wh` added |
| Net scenario | about `169 Wh` saved |

Broader operational water:

```text
169 Wh * 3.0-4.5 mL/Wh
= 507-761 mL/month
```

At 10 million intermediate users:

```text
169 Wh/month * 10,000,000
= 1.69 GWh/month
= 20.28 GWh/year
```

Message:

> Intermediate users are where right-sizing becomes plainly measurable. The gains are not from avoiding AI altogether; they are from reducing waste in repeated real workflows.

### Category 3: Heavy Development And Power User

Profile:

- uses AI daily
- runs coding agents, research agents, reasoning models, or long-context tools
- often has multiple attempts, tool calls, or agent loops
- uses AI like part of the workbench, not a novelty

Impact pattern:

- largest per-user potential savings
- highest uncertainty
- savings depend heavily on whether the tool prevents failed loops, overscoped agent work, or wrong-model use
- one avoided agent loop can be larger than hundreds of ordinary text prompts

Example monthly scenario:

| Behavior change | Energy impact |
|---|---:|
| Avoids 10 median coding-agent sessions | `410 Wh` saved |
| Avoids 20 long reasoning calls | about `784 Wh` saved if using `39.2 Wh` each |
| Routes 40 tasks from high reasoning to medium text | about `792 Wh` saved if baseline `21 Wh` and route `1.2 Wh` |
| Adds extra exploratory text usage | `50 Wh` added |
| Net scenario | about `1,936 Wh`, or `1.94 kWh`, saved |

Broader operational water:

```text
1,936 Wh * 3.0-4.5 mL/Wh
= 5.8-8.7 L/month
```

Heavy user higher scenario:

If a heavy developer reduces a `1,300 Wh` agentic day by only `10%` across `20` workdays:

```text
1,300 Wh/day * 10% * 20 days
= 2,600 Wh/month
= 2.6 kWh/month
```

Message:

> Heavy users are where the app can make the most obvious per-person difference, because the wasted work is no longer a few chat prompts. It can be agent loops, long-context retries, and high-reasoning calls.

## Scale Examples

Use these examples to explain why small changes are not meaningless.

| Per-user avoided energy | Population | Aggregate impact |
|---:|---:|---:|
| `1 Wh/month` | 1 billion users | `1 GWh/month`, `12 GWh/year` |
| `10 Wh/month` | 1 billion users | `10 GWh/month`, `120 GWh/year` |
| `100 Wh/month` | 100 million users | `10 GWh/month`, `120 GWh/year` |
| `1 avoided 5-second video/month` | 1 million users | about `944 MWh/month`, `11.3 GWh/year` |
| `1 avoided 5-second video/month` | 100 million users | about `94.4 GWh/month`, `1.13 TWh/year` |

Session language:

> A single normal text prompt is small. A billion repeated choices are not. The social improvement is helping people form better defaults before wasteful AI patterns become invisible habits.

## Sociological Framing

The environmental story should not shame users.

Better framing:

- AI literacy includes knowing when not to use the biggest tool.
- Good routing lowers confusion, cost, waiting time, and infrastructure waste.
- Ordinary people should not have to understand model architectures to make responsible choices.
- A helpful interface can turn invisible infrastructure costs into understandable decisions.
- Environmental benefit and user benefit align when the app reduces retries, wrong-tool selection, and unnecessary media generation.

Bad framing:

- "Every prompt is bad."
- "People should stop using AI."
- "This app fixes AI's environmental footprint."
- "Users are responsible for data-center expansion."

Session language:

> This is not about guilt. It is about giving people better defaults. Better defaults become culture, and culture becomes infrastructure demand.

## Future Product Estimator

A future estimator should be opt-in, local-first, and transparent.

### Inputs To Ask The User

- How often do you use AI?
- What kind of work do you do: simple text, research, coding, images, video, agents?
- How often do you retry before getting something useful?
- How often do you use reasoning or "deep thinking" modes?
- How often do you generate images or video?
- Did the recommended route avoid a retry, a larger model, or a media/agent workflow?

### Data The App Can Store Locally

- selected user category
- self-reported monthly usage estimate
- estimated avoided retries
- estimated right-sized model choices
- estimated avoided image/video/agent tasks
- confidence level
- source version used for calculation

### Data The App Should Not Need

- provider login
- API key
- user prompt content
- provider account usage history
- telemetry upload
- cloud sync

### Estimator Output Shape

```text
Estimated avoided AI work this month:
Energy: 0.2-1.1 kWh
Direct data-center water: 0.1-1.2 L
Broader operational water: 0.6-5.0 L
Confidence: early scenario estimate
Assumptions: 20 avoided retries, 4 right-sized reasoning tasks, no video
```

Always include:

- what changed
- assumptions
- source date
- confidence
- direct water vs broader water
- "not a guarantee" note

## Information Session Outline

### 1. Start With The Honest Tension

Talking point:

> A single normal AI text prompt is usually small. That does not mean AI's total impact is small, because usage scales across people, products, agents, images, video, and repeated retries.

### 2. Explain Right-Sizing

Talking point:

> The goal is not to stop people from using AI. The goal is to help them use the right amount of AI for the job.

### 3. Show The Numbers

Use the evidence table:

- average/median text prompt: roughly `0.24-0.34 Wh`
- GPT-4o short/medium/long: roughly `0.4-1.8 Wh`
- o3 long reasoning: roughly `39 Wh`
- average image: roughly `2.9 Wh`
- five-second video example: roughly `944 Wh`

### 4. Show The Three User Categories

Explain:

- novice: habit formation and avoiding expensive mistakes
- intermediate: retries and wrong-tool use
- heavy developer: agent loops and reasoning waste

### 5. Show Scale

Use:

```text
10 Wh/month/user * 1 billion users = 120 GWh/year
```

Then explain:

> Small savings are not a sales gimmick when they become a repeated default across large populations.

### 6. End With The Product Ethic

Talking point:

> We will not claim exact savings we cannot prove. We can show ranges, assumptions, and the practical behaviors that reduce waste.

## Review Notes Before Public Use

Before using this material publicly:

- confirm the latest available provider disclosures and independent estimates
- decide whether to show water as direct only or direct plus broader operational range
- add a public methodology note
- avoid fixed per-user savings claims
- label examples as scenarios
- have owner approval for public environmental language
- ensure the public launch hold in the active release plan has been lifted for any published page or social post

## Source Links

- Sam Altman, "The Gentle Singularity": https://blog.samaltman.com/the-gentle-singularity
- Google Cloud, "Measuring the environmental impact of AI inference": https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference
- Google/Google Scale paper, "Measuring the environmental impact of delivering AI at Google Scale": https://arxiv.org/html/2508.15734v1
- Jegham et al., "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference": https://arxiv.org/html/2505.09598v1
- Luccioni, Jernite, and Strubell, "Power Hungry Processing: Watts Driving the Cost of AI Deployment?": https://arxiv.org/html/2311.16863v3
- Li et al., "Making AI Less Thirsty": https://arxiv.org/html/2304.03271v4
- Microsoft datacenter efficiency and WUE/PUE disclosure: https://datacenters.microsoft.com/sustainability/efficiency/
- IEA, "Key Questions on Energy and AI": https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary
- KQED summary of MIT Technology Review AI video energy reporting: https://www.kqed.org/news/12071259/the-real-cost-of-ai-slop

## Current Status

Status: Draft complete

Completion target: Draft complete

Known gaps:

- This is an information-session draft, not public marketing copy.
- The D15 impact-estimator methodology now exists as a calculation backbone, and D16 wires a compact caveated impact insight into the public Best Options UI. It is still not a user-specific savings calculator or public methodology page.
- Source values should be refreshed before public publication because provider infrastructure and model routing change quickly.
- The app does not yet measure user-specific avoided retries, avoided agent loops, or actual provider usage.
- Public claims require a reviewed methodology and owner approval.

Next action:

- Decide whether to turn the now-public safe framing into reviewed social/video copy, a public methodology page, or an opt-in local estimator UI.
