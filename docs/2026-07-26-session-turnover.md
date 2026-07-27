# 2026-07-26 - Session Turnover

Document ID: PATH-ENG-004
Version: 1.5.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-26
Last Reviewed: 2026-07-26
Next Review: At the start of the next working session
Last Updated: 2026-07-26T21:40:00-06:00
Status Updated: 2026-07-26T21:40:00-06:00

## Purpose

Turnover for the 2026-07-26 session, written at the owner's request as the stopping point for the day. Read this first on resume, then `START_HERE.md`, then the Next Handoff in [2026-07-09-current-build-pathway.md](2026-07-09-current-build-pathway.md).

This note is a resume point, not a history. Detailed evidence stays in the active pathway's validation log.

## Where Things Stand

**Production is current with `main` at `0c81132`.** Nothing is committed and undeployed. All six teaching-audit findings are live. The app is live at `https://ai-task-router.pages.dev/` and the public hub at `https://oldskoolai.com/ai-task-router/`.

Five owner-authorized deploys landed today:

| Time | Source | Deployment | Carried |
|---|---|---|---|
| 10:21:53-06:00 | `69b31a2` | `https://d81aef5b.` | R6, R7, R8, R9, bundle budget gate, desktop-track removal, leanness pass |
| 11:10:28-06:00 | `a34d839` | `https://9d00dce4.` | Teaching-audit fixes 4, 5, 6: readable energy figures, followed-route lean/balanced/premium split, comparison multiples |
| 11:41:28-06:00 | `b8069fa` | `https://cc915a90.` | Teaching-audit findings 1 and 2: pre-task worked examples on Start Here, per-row and whole-log figures on Past Choices |
| 21:12:00-06:00 | `e58f81b` | `https://3db20d3b.` | Teaching-audit finding 3: Best Options panel rebalance, plus comparison multiples reconciled with the figures as displayed |
| 21:40:00-06:00 | `0c81132` | `https://743db3ef.` | R-009 catalog review: Gemini 3 model names, two corrected price anchors, and dated-change staleness |

Per R-008, only the canonical URL may be published. The per-deploy hash URLs above are internal evidence and must not appear on `oldskoolai.com`, `guidedailabs.com`, or `guidedaijourney.com`.

## What Changed Today, And Why

The 2026-07-25 functional audit asked "does the app work". A teaching audit on 2026-07-26 asked a narrower question: **does the app teach why right-sizing matters?** It found six gaps. All six are fixed and live.

The through-line in all six: the app was *honest* before it was *readable*. Every figure was sourced and every hedge was true, but the lesson was arriving in a form, at a time, or at a size the user could not act on.

- **Energy figures were unreadable.** Watt-hours are correct and mean nothing to most readers. Every energy figure a user decides on now carries an everyday restatement.
- **A computed insight was being discarded.** The lean/balanced/premium split of followed routes had been calculated and thrown away since it was written. It is now rendered.
- **The reader was doing the division.** Heaviest-sibling comparisons showed two figures side by side. They now state the multiple, because the division *is* the lesson.
- **The lesson arrived after the decision.** Start Here now carries three worked examples before any task is described. The figures come from the reviewed snapshot already used on Best Options, so this changed placement, not claims.
- **Past Choices taught nothing.** It was a receipt. Rows now carry metered cost, energy, and a comparison against the heaviest route offered, and the log carries choice-pattern totals across every saved choice.
- **The disclaimers were the first thing read.** Three of the four Best Options impact cards opened with their own hedge, in a rail too narrow to hold an argument. The hedges now sit once at the group level, and each example leads with its lesson.

## Judgement Calls Worth Preserving

These are the decisions a future session could plausibly reverse without realizing what it was giving up.

**The right-sizing example sits in the middle of Start Here on purpose.** It nets out induced extra runs, so it is the only example in the app that can honestly say going *too small* costs more. An app whose sole pre-task lesson is "smaller is cheaper" teaches a habit its own estimator contradicts. Do not demote it to a footnote or lead with the cheaper-is-better example.

**Choice-pattern totals exclude three kinds of choice rather than counting them as zero:** choices saved before estimates existed, choices where nothing heavier was offered, and outcomes the user never marked as followed. A zero entry would add to the compared count without adding to either total, dragging the pair toward "these routes barely differ" — the opposite of what the evidence supports. Six of the twelve tests in `src/tests/unit/routeComparison.test.ts` exist to hold this line.

**The pattern is computed over the whole log, not the filtered view.** A pattern a user can reshape by picking a filter is not a pattern.

**Nothing in the Past Choices panel congratulates the reader.** A run of premium choices may be exactly right for the work. The copy shown to someone who took the heaviest route every time says so.

**The comparison primitives were extracted, not copied.** `heaviestSiblingRoute` and `comparisonMultipleClause` moved to `src/domain/impact/routeComparison.ts`. `src/domain/format.ts` exists precisely because four copies of a formatter had drifted; a fifth copy of a comparison rule would have been the same defect.

**The Best Options hedges were moved, not softened.** "Not your usage" and "nobody is claiming you ran these" now appear once each, in the group heading and the shared caveat, instead of three times inside the teaching text. Anyone tempted to trim further should read that as the floor, not a direction of travel: the panel earns its numbers by being obviously careful with them.

**Price anchors name a tier, not a model, and that is why the review was cheap.** The 2026-07-26 catalog review verified 15 of 16 anchors unchanged despite three months of provider churn, because an anchor called "low-cost text API anchor" survives a model being renamed or superseded. What did break was the guidance that names models directly - Gemini 2.5 models are no longer in the picker. Keep anchors generic and accept that model names are the part needing a human every quarter.

**A multiple divides the figures as displayed, never the raw estimates.** `formatUsd` rounds to cents above a cent, so drafting a multiple for the 100k-token card exposed a defect already live on Start Here and latent in the Past Choices pattern: "roughly 24x" printed beside two figures that visibly divide to 22.6. `displayedUsdValue` and `displayedCostMultiple` now make reproducibility structural rather than a property of the current catalog, so a catalog refresh cannot quietly reintroduce it. Roughly six percent of ratio accuracy went; what came back is that the app never invites a reader to check arithmetic it will fail. Do not "simplify" these back to dividing raw values.

**R-010 stands.** No user-facing "saved", "savings", or "avoided" for money. The reconciliation with the owner's "cost savings" framing is comparison and ratio language: a multiple is a ratio between two estimates on the same basis, not a claim that money changed hands. Do not loosen the vocabulary without an owner decision in the risk register.

## Two Verification Lessons

Both produced a confident wrong answer today. Both are now written into the Verification Traps section of [2026-07-09-cloudflare-deploy-turnover.md](2026-07-09-cloudflare-deploy-turnover.md).

**A plain fetch cannot distinguish a stale alias from a stale edge cache.** The canonical URL served the previous asset on first fetch while the hash URL already served the new one. A cache-busted fetch showed the alias had followed. Verify with cache-busting before recording which build is live.

**The second one is the dangerous one.** The first live-bundle string check requested an asset path that had not propagated, got the SPA fallback back with HTTP 200, and searched 962 characters of HTML. Every "must be present" reported missing, and every "must be absent" reported absent — including the R-010 forbidden phrases, which read as a clean pass. Assert the fetched byte length matches the build output before trusting any string check. **Absence of a forbidden phrase is only evidence when the haystack is real.**

## Open Items

Two, neither blocking.

1. **Hosted smoke needs human eyes.** The automated half is done and has passed on every deploy. What no test can judge is wording and feel, and the list has grown to nine items across the five shipped fixes. It is enumerated in `CARRY_FORWARD.md`. Roughly ten to fifteen minutes on the live site. This is owner work, not coder work.

2. **Catalog review due before 2026-09-01.** R-009. The scheduled review was done early on 2026-07-26 and both dates moved together, so the 90-day clock now runs to 2026-10-24 - but Claude Sonnet 5's introductory API pricing ends 2026-09-01, and that is the real deadline. It is recorded in `announcedCatalogChanges`, so the app will call itself stale on that date even though it was reviewed recently. When the review happens: set `anthropic-premium-text-anchor` to 3/15/0.30, remove the entry, move both dates together.

One low-priority loose end is recorded in the pathway's Next Handoff: three user-reachable strings contain "savings" while describing the *user's own requested deliverable* rather than an app claim about money. Not an R-010 violation, and not introduced by today's work — but `App.test.tsx` asserts rendered output never matches `/\bsavings\b/i`, a guard that reads broader than it actually is.

## Validation At The Stopping Point

| Check | Result |
|---|---|
| `npm run test` | 17 files, 166 tests, pass |
| `npm run build` | Clean; javascript raw 658.31 kB / 700.00 kB, stylesheet raw 43.03 kB / 60.00 kB |
| `npm run scan:web-rc` | No release-blocking findings |
| `bash scripts/governance-preflight.sh` | 0 warnings |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |
| Hosted E2E against the live site | 7/7 in 10.1s, first run |
| Live bundle string check | All five deployed fixes present; no R-010 vocabulary |
| Finding 3 and the multiple fix | 170 tests, clean build, local E2E 7/7, preflight 0 warnings, scan clean, no R-010 vocabulary added |
| Finding 3 visual check | `.impactSection` screenshotted at 1440px and 820px through a temporary Playwright capture, since no test can judge visual weight. Capture removed afterwards. |

One build failure occurred during the session and was fixed: `TS2783` from a duplicate `id` in a test fixture helper. Worth remembering that **Vitest and Playwright both passed while `npm run build` did not** — `tsc --noEmit` covers test files and the runners do not typecheck.

## Constraints Still In Force

- A production deploy is an owner decision. Today's authorization covered today's commits; the next deploy needs fresh authorization.
- Do not print, paste, or commit Cloudflare token values or any environment file.
- Do not publish GitHub Release artifacts, signing workflows, updater flows, installable builds, social posts, custom-domain/DNS changes, live pricing tables, live pricing/model fetches, provider connections, exact public savings claims, identity documents, tax/banking details, private account screenshots, or external execution workflows without a separate approved chunk and release-gate evidence.
- Water ranges must not become public per-user water claims without a fresh source review, owner review, and release evidence.
- Deploy stop rule: one attempt, then record evidence and choose a recovery option rather than retrying from a blocked location.
