# Model Registry

Last Updated: 2026-07-26T09:49:39-06:00
Status: active
Owner: Technical Lead
Status Updated: 2026-07-26T09:49:39-06:00

The app calls no models. It *describes* them: names, rough capability, published pricing, and energy
anchors, so a user can decide which tool to open themselves. Nothing listed here is a runtime
dependency, and no key, endpoint, or account is involved.

That makes this a catalog-freshness control rather than an approval control. The catalog is source
data in the repository rather than a table maintained by hand, so this document points at it and
records who owns keeping it true.

| Catalog | Source | Reviewed | Owner | What goes stale |
| --- | --- | --- | --- | --- |
| Everyday tools and pricing | `src/domain/defaults/everydayToolCatalog.ts` (`everydayToolCatalogReviewedAt`) | 2026-07-05 | Project Owner | Model names, tiers, and published per-token prices |
| Impact and energy anchors | `src/domain/impact/impactEstimator.ts` (`impactCatalogReviewedAt`) | 2026-07-05 | Project Owner | Public energy figures and the anchors estimates scale from |
| Tool modes | `src/domain/routing/toolModeCatalog.ts` (`toolModeCatalogReviewedAt`) | 2026-07-07 | Project Owner | Which modes each tool offers and what they are called |

## Review Obligation

The app tells the user its catalog is stale once a reviewed date passes 90 days, so these dates are
user-visible rather than internal bookkeeping. The next review is due 2026-10-03 and is tracked as
R-009 in `docs/risks/risk-register.md`.

Move `everydayToolCatalogReviewedAt` and `impactCatalogReviewedAt` together. The freshness check
reports from whichever one lagged, so advancing a single date silently keeps the warning alive.

Pricing shown to users stays a published-list-price estimate. Live pricing fetches, live pricing
tables, and exact public savings claims are release-gated and are not part of a catalog refresh.
