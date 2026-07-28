# 2026-07-27 - Session Turnover

Document ID: PATH-ENG-005
Version: 1.0.1
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-27
Last Reviewed: 2026-07-27
Next Review: At the start of the next working session
Last Updated: 2026-07-27T22:22:45-06:00
Status Updated: 2026-07-27T22:22:45-06:00

## Purpose

Night handoff written after the coding session error during Chunk 12, Stage-first Planning Grammar. This is the next resume point. Read this note, then `START_HERE.md`, then the Chunk 12 acceptance result and Next Handoff in [2026-07-09-current-build-pathway.md](2026-07-09-current-build-pathway.md).

This note is a resume point, not a full history. Detailed implementation and validation evidence stays in the active pathway.

## Where Work Stopped

Chunk 12 is **Integration complete and not deployed**. Source `b565331` is committed and pushed to `main`. Production remains on source `1b5ea8f` at `https://ai-task-router.pages.dev/`; a production deployment requires fresh owner authorization.

The completed chunk replaces the remaining shallow planning route with a task-first work grammar:

1. classify the task into a reusable archetype;
2. infer the work and deliverables the task requires before looking at saved tools;
3. create composable stages such as scope framing, plan synthesis, build, review, packaging, and next action;
4. assign the lightest adequate saved model or mode to each required stage;
5. carry those stages into route cards, stage guidance, scoring, cost estimates, and copy-ready prompts.

The new `src/domain/routing/taskWorkPlan.ts` module is the central boundary. It accepts no model inventory, so changing saved tools can change who performs a stage without erasing work the task itself requires.

## Proven Behavior

With the same Perplexity Free, ChatGPT Go, and Copilot Free inventory, a rough community open-house plan now routes through:

- Perplexity for scope framing from the user-approved inputs;
- ChatGPT's highest available GPT-5.5 Thinking level for the actual plan;
- Copilot for a lightweight immediate-action handoff.

The same inventory still sends a simple rewrite through one GPT-5.5 Instant pass. Planning no longer collapses into one generic ChatGPT response or manufactures a prompt relay. Software builds get scope, plan synthesis, build, and review without inventing prompt-only work. Explicit prompt requests, research-only work, reviews, artifact packaging, privacy gates, and manual fallbacks remain conditional stages rather than becoming another fixed script.

Browser verification caught one final integration defect: the lightweight next-action helper was also being interpreted as a package/execution step, producing a duplicate and nonsensical Stage 3. The route-step kind/null fallback was corrected, and the browser regression now proves that the bogus package stage is absent.

## Files And Design Surface

The checkpoint includes the new work-plan module and test plus changes to task decomposition and reasoning, candidate generation and scoring, tool-mode selection, route economics, stage guidance, prompt-package generation, schemas, Stage Guidance UI labels, behavior-focused unit tests, the same-tools E2E regression, and the bundle budget.

The raw JavaScript bundle ceiling moved narrowly from 700 kB to 705 kB after the final build measured 702.36 kB. The compressed-download ceiling remains unchanged at 200 kB. This leaves little headroom; future growth should trigger a deliberate bundle reduction rather than another automatic ceiling increase.

## Validation At The Stopping Point

| Check | Result |
|---|---|
| `npm run test` | 19 files, 190 tests, pass |
| `npm run test:scripts` | 5/5, pass |
| `npm run build` | Pass; JavaScript 702.36 kB raw, CSS 43.76 kB raw, bundle gate pass |
| `npm run scan:web-rc` | No release-blocking findings |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |
| Local Chromium E2E | 8/8, pass |
| Browser load check | Content present; no Vite overlay or captured console errors |
| `bash scripts/governance-preflight.sh` | 0 warnings |
| `git diff --check` | Pass |

No provider call, live search, account connection, telemetry, external execution, schema migration, production change, or visual redesign was added.

## Exact Next Step

There is no open coder blocker inside Chunk 12.

The next decision is the owner's:

1. leave production on `1b5ea8f` and test the committed checkpoint locally; or
2. explicitly authorize a production deployment as a separate action.

If deployment is authorized, start from [2026-07-09-cloudflare-deploy-turnover.md](2026-07-09-cloudflare-deploy-turnover.md). Re-run the release gates from the committed source, deploy once, cache-bust the HTML, request the asset path without a query string, and assert the served asset length matches `dist` before trusting marker checks. Then run hosted Chromium E2E and record the immutable deployment URL and canonical result.

## Carry-Forward Items

`CARRY_FORWARD.md` remains open and must be surfaced before the next compaction:

- Chunk 12 is committed/pushed but undeployed until fresh owner authorization.
- Privately consolidate the duplicate `CLOUDFLARE_API_TOKEN` assignment without printing either value.
- Complete the human-eyes wording and feel smoke on the live site.
- Preserve the documented deploy-verification cache and asset-length safeguards.
- Refresh the Claude Sonnet 5 price anchor before 2026-09-01.

## Completion Status

Status: Integration complete

Release status: Held; deployment not authorized

Rollback: Revert the bounded Chunk 12 commit. No migration, remote data, credential, provider, or production change is part of the committed chunk.
