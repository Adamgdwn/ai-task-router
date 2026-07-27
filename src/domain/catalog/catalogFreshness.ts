import { everydayToolCatalogReviewedAt } from "../defaults/everydayToolCatalog";
import { impactCatalogReviewedAt } from "../impact/impactEstimator";

/**
 * The app names specific models and prices with confidence and, by design, never fetches either
 * one. That is the right boundary, but it means the catalog can only get older, and nothing in the
 * product notices. This is the mechanism that notices: the review dates already recorded beside the
 * catalogs, compared against today.
 *
 * It cannot tell whether a model name is actually wrong. It only reports how long it has been since
 * a human checked, which is the honest claim available without a network call.
 */
export const catalogStaleAfterDays = 90;

/**
 * The two catalogs are reviewed together today, but nothing forces that. Age is measured from the
 * older review so a half-refreshed catalog cannot read as fresh.
 */
export const catalogReviewedAt =
  everydayToolCatalogReviewedAt < impactCatalogReviewedAt ? everydayToolCatalogReviewedAt : impactCatalogReviewedAt;

/**
 * Provider changes that are already announced and carry a date.
 *
 * The 90-day clock measures how long since a human looked, which is the only honest claim available
 * without a network call. It cannot know about a change a provider has already published a date for
 * - and on that date the catalog silently becomes wrong while still reading as fresh, because the
 * clock is measuring the wrong thing. Anything recorded here makes the catalog stale on the day the
 * change lands, however recently it was reviewed.
 *
 * Record a change here only when the provider has published both the change and its date. A rumour
 * with no date belongs in the risk register, not in a check the user sees.
 */
export type AnnouncedCatalogChange = {
  id: string;
  /** The moment the provider stated the change takes effect, as an ISO instant. */
  effectiveAt: string;
  summary: string;
};

export const announcedCatalogChanges: readonly AnnouncedCatalogChange[] = [
  {
    id: "anthropic-sonnet-5-introductory-pricing-ends",
    effectiveAt: "2026-09-01T00:00:00.000Z",
    summary:
      "Claude Sonnet 5 introductory API pricing ends and the premium text anchor moves from $2/$10 to $3/$15 per million tokens.",
  },
];

type CatalogFreshness = {
  reviewedAt: string;
  ageDays: number;
  stale: boolean;
  /** Set when an announced provider change has landed, whatever the review age. */
  landedChange?: { id: string; effectiveAt: string; summary: string };
};

const millisecondsPerDay = 86_400_000;

/**
 * `changes` is injectable because the two staleness reasons are independent rules that happen to
 * share a calendar. While a change is pending, no date exists that exercises the age rule alone -
 * every date past the age threshold is also past the change - so the age rule can only be tested
 * against an empty list. It becomes reachable again once the change is applied and removed.
 */
export function assessCatalogFreshness(
  now: Date = new Date(),
  changes: ReadonlyArray<AnnouncedCatalogChange> = announcedCatalogChanges,
): CatalogFreshness {
  const reviewedTime = new Date(catalogReviewedAt).getTime();
  const ageDays = Math.max(0, Math.floor((now.getTime() - reviewedTime) / millisecondsPerDay));
  const landedChange = changes
    .filter((change) => now.getTime() >= new Date(change.effectiveAt).getTime())
    .sort((a, b) => a.effectiveAt.localeCompare(b.effectiveAt))[0];

  return {
    reviewedAt: catalogReviewedAt,
    ageDays,
    stale: ageDays > catalogStaleAfterDays || landedChange !== undefined,
    ...(landedChange ? { landedChange: { ...landedChange } } : {}),
  };
}
