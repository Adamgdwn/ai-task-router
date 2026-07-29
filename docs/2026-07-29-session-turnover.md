# 2026-07-29 - Session Turnover

Document ID: PATH-ENG-006
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-29
Last Reviewed: 2026-07-29
Next Review: At the start of the next working session
Last Updated: 2026-07-29T17:40:45-06:00
Status Updated: 2026-07-29T17:40:45-06:00

## Purpose

Handoff written at the close of the 2026-07-29 session after chart accuracy and interactivity work (no named chunk). Production remains on source `1b5054f`; two sets of commits are on `main` and not yet deployed to the canonical URL.

## Where Work Stopped

Three chart improvements landed on `main` in this session:

**`9bf2e1f` — Fix chart using billed cost instead of API-equivalent, and lean line draw order**

The 100-use scenario chart was reading `estimatedCostUsd` (user's actual bill — $0 for subscription routes) for the cost lines, making every line appear flat at zero. Switched to `apiEquivalentCostUsd`, which shows what the same work would cost at API list prices — the meaningful comparison. The Lean energy line was also invisible because SVG draws in document order and balanced covered lean when both have the same value. Reversed the draw order (`.reverse()`) so lean always renders on top.

**`902f33b` — Add crosshair tooltip showing all three series on chart hover**

Adds a combined hover tooltip to the 100-use scenario chart. Mouse movement over the plot area:
- draws a dashed vertical crosshair at the hover x position
- places filled colored dots where the crosshair intersects each cost and energy line
- shows an HTML tooltip with `N uses` title, a Cost (API equivalent) section, and an Energy section — each row has a colored dot, route name, and formatted value
- tooltip flips to the left side when `hoverUse > 55` to stay on screen

Mouse capture uses a transparent SVG overlay rect. Coordinates convert screen → SVG viewBox → use count. Tooltip left percent maps via `(xForUse(hoverUse) / 1200) * 100` to stay in sync with the crosshair.

## Production State

| Source | Where |
|---|---|
| `1b5054f` | Canonical `https://ai-task-router.pages.dev/` |
| `b565331` | `main`, integration complete, not deployed — stage-first planning grammar |
| `902f33b` | `main`, deployed to `https://5d772046.ai-task-router.pages.dev` (immutable) — chart fixes |

The canonical URL carries none of the chart improvements. Deploying from `main` HEAD (`902f33b`) would deliver: stage-first planning grammar + chart accuracy fix + crosshair tooltip in one deploy.

## Validation At The Stopping Point

Chart changes are non-logic UI additions (SVG rendering and an HTML overlay). Prior validation from `b565331` remains the baseline:

| Check | Result (b565331 baseline) |
|---|---|
| `npm run test` | 190/190 tests, pass |
| `npm run test:scripts` | 5/5, pass |
| `npm run build` | Pass; JS 702.36 kB raw, bundle gate pass |
| Local Chromium E2E | 8/8, pass |
| `npm run scan:web-rc` | No release-blocking findings |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |

Chart additions do not touch domain logic, routing, or test-covered paths.

## Exact Next Step

No open coder blocker.

Owner decisions:
1. Authorize deployment of `main` HEAD to the canonical URL — this delivers stage-first planning grammar, chart accuracy, and crosshair tooltip in one deploy. Follow [2026-07-09-cloudflare-deploy-turnover.md](2026-07-09-cloudflare-deploy-turnover.md) and assert served asset length matches `dist` before trusting marker checks.
2. Continue treating the canonical URL as locked to `1b5054f` until a fuller set of changes is ready.

## Carry-Forward Items At Session Close

| Flag | Owner | Notes |
|---|---|---|
| Stage-first planning (`b565331`) integration complete, not deployed | Project Owner | Fresh owner authorization required before deploying |
| Chart accuracy + tooltip (`902f33b`) on `main`, not on canonical URL | Project Owner | Ships in same deploy as above if `main` HEAD is used |
| Duplicate `CLOUDFLARE_API_TOKEN` in master env | Project Owner | Private consolidation; never paste into chat |
| Hosted smoke checklist | Project Owner | ~15 min on live site; see CARRY_FORWARD.md for checklist items |
| Catalog review due before 2026-09-01 | Project Owner | Claude Sonnet 5 price anchor; `announcedCatalogChanges` will auto-flag the live app |
