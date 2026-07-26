# 2026-07-03T11:51:11-06:00 - Carry-Forward Flags

Last Updated: 2026-07-26T10:52:00-06:00
Status: open
Status Updated: 2026-07-26T10:52:00-06:00

Use this file to record anything that must survive a context reset:
blockers, unresolved decisions, open risks, next-chunk prerequisites.

Clear each item when it is resolved or handed off. If this file has open items,
the coding agent will surface them before suggesting /compact.

| Flag | Added | Owner | Status | Notes |
|---|---|---|---|---|
| Hosted smoke items need human eyes, not tests | 2026-07-25T16:58:01-06:00 | Project Owner | Open, now unblocked | The deploy this was waiting on landed 2026-07-26T10:21:53-06:00, so the live site is finally the build worth reading. The turnover note's Hosted Smoke Focus list asks whether routing detail is visible by default, whether route selection and the save panel name the chosen route, whether followed-choice impact increments, whether ordinary planning language stays out of app-build routing, whether the new Help screen reads as plain language, and now whether route costs read as ordinary dollars and cents in both the route card and the stage guidance panel, which used to disagree with each other. The E2E suite passed 7/7 against the live site; it cannot judge wording. About ten minutes on `https://ai-task-router.pages.dev/`. |
| Teaching-audit fixes are on `main` but undeployed | 2026-07-26T10:52:00-06:00 | Project Owner | Open | Three user-visible changes from the 2026-07-26 teaching audit: energy figures now carry an everyday restatement so watt-hours are readable, the followed-choice counter shows the lean/balanced/premium split, and route comparisons carry the multiple. Production still serves `69b31a2` without them. They need a deploy on owner authorization, using `docs/2026-07-09-cloudflare-deploy-turnover.md`. Three further findings from the same audit are open and listed in the active pathway's Next Handoff; they are coder work, not owner work. |
| Catalog review due 2026-10-03 | 2026-07-25T16:58:01-06:00 | Project Owner | Scheduled | R-009 in `docs/risks/risk-register.md`. The app starts telling users the model and pricing catalog is stale once it passes 90 days. Refreshing it is a deliberate review pass; move `everydayToolCatalogReviewedAt` and `impactCatalogReviewedAt` together or the freshness check keeps measuring from whichever one lagged. |
