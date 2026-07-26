# 2026-07-03T11:51:11-06:00 - Carry-Forward Flags

Last Updated: 2026-07-26T11:10:28-06:00
Status: open
Status Updated: 2026-07-26T11:10:28-06:00

Use this file to record anything that must survive a context reset:
blockers, unresolved decisions, open risks, next-chunk prerequisites.

Clear each item when it is resolved or handed off. If this file has open items,
the coding agent will surface them before suggesting /compact.

| Flag | Added | Owner | Status | Notes |
|---|---|---|---|---|
| Hosted smoke items need human eyes, not tests | 2026-07-25T16:58:01-06:00 | Project Owner | Open, now unblocked | The deploy this was waiting on landed 2026-07-26T10:21:53-06:00, so the live site is finally the build worth reading. The turnover note's Hosted Smoke Focus list asks whether routing detail is visible by default, whether route selection and the save panel name the chosen route, whether followed-choice impact increments, whether ordinary planning language stays out of app-build routing, whether the new Help screen reads as plain language, and now whether route costs read as ordinary dollars and cents in both the route card and the stage guidance panel, which used to disagree with each other. As of the 2026-07-26T11:10:28-06:00 deploy of `a34d839` the live site also carries the teaching-audit fixes, so add three wording judgements no test can make: whether "about a 10-watt LED bulb for 7 minutes" actually lands as a size a person can picture, whether "roughly 8x this route" reads as a comparison rather than a savings claim, and whether the lean/balanced/premium split reads as a neutral mirror rather than a scolding. The E2E suite passed 7/7 against the live site both times; it cannot judge any of this. About ten minutes on `https://ai-task-router.pages.dev/`. |
| ~~Teaching-audit fixes are on `main` but undeployed~~ | 2026-07-26T10:52:00-06:00 | Project Owner | Resolved 2026-07-26T11:10:28-06:00 | Deployed on owner authorization: source `a34d839` to `https://9d00dce4.ai-task-router.pages.dev`, canonical URL verified serving the same asset, live-bundle string check confirming the new copy shipped and no savings vocabulary came with it, hosted E2E 7/7. Three further findings from the same audit remain coder work; findings 1 and 2 were authorized in the same breath and are listed in the active pathway's Next Handoff. |
| Catalog review due 2026-10-03 | 2026-07-25T16:58:01-06:00 | Project Owner | Scheduled | R-009 in `docs/risks/risk-register.md`. The app starts telling users the model and pricing catalog is stale once it passes 90 days. Refreshing it is a deliberate review pass; move `everydayToolCatalogReviewedAt` and `impactCatalogReviewedAt` together or the freshness check keeps measuring from whichever one lagged. |
