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

export type CatalogFreshness = {
  reviewedAt: string;
  ageDays: number;
  stale: boolean;
};

const millisecondsPerDay = 86_400_000;

export function assessCatalogFreshness(now: Date = new Date()): CatalogFreshness {
  const reviewedTime = new Date(catalogReviewedAt).getTime();
  const ageDays = Math.max(0, Math.floor((now.getTime() - reviewedTime) / millisecondsPerDay));

  return {
    reviewedAt: catalogReviewedAt,
    ageDays,
    stale: ageDays > catalogStaleAfterDays,
  };
}
