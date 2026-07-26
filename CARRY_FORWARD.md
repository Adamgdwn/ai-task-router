# 2026-07-03T11:51:11-06:00 - Carry-Forward Flags

Last Updated: 2026-07-25T16:58:01-06:00
Status: open
Status Updated: 2026-07-25T16:58:01-06:00

Use this file to record anything that must survive a context reset:
blockers, unresolved decisions, open risks, next-chunk prerequisites.

Clear each item when it is resolved or handed off. If this file has open items,
the coding agent will surface them before suggesting /compact.

| Flag | Added | Owner | Status | Notes |
|---|---|---|---|---|
| Production is behind `main` by four chunks, one of them user-visible | 2026-07-25T16:58:01-06:00 | Project Owner | Open | R6, R7, R8, and R9 landed after the R0 deploy of `ab329e5`. R7 is user-visible: the live Help tab still shows the old developer placeholder. Deploying is an owner decision, not coder work. Runbook: `docs/2026-07-09-cloudflare-deploy-turnover.md`, proven from the home network on 2026-07-25. Verified 2026-07-26: the canonical URL `https://ai-task-router.pages.dev/` is current with the 2026-07-25 deploy, and its live asset still contains `Placeholder State` and not `What this app does`, so the old Help placeholder is what visitors see today. Public links belong on the canonical URL, never a per-deploy hash URL. Clear this flag when the deploy lands. |
| Hosted smoke items need human eyes, not tests | 2026-07-25T16:58:01-06:00 | Project Owner | Open | The turnover note's Hosted Smoke Focus list asks whether routing detail is visible by default, whether route selection and the save panel name the chosen route, whether followed-choice impact increments, whether ordinary planning language stays out of app-build routing, and now whether the new Help screen reads as plain language. The E2E suite proves the flow works; it cannot judge wording. About ten minutes on the live site after the deploy. |
| Catalog review due 2026-10-03 | 2026-07-25T16:58:01-06:00 | Project Owner | Scheduled | R-009 in `docs/risks/risk-register.md`. The app starts telling users the model and pricing catalog is stale once it passes 90 days. Refreshing it is a deliberate review pass; move `everydayToolCatalogReviewedAt` and `impactCatalogReviewedAt` together or the freshness check keeps measuring from whichever one lagged. |

