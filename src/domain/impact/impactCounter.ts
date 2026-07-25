import type { RouteCard, RouteLogEntry, RouteOption } from "../types";

export type TrackedImpactSummary = {
  savedPlanCount: number;
  followedPlanCount: number;
  apiEquivalentCostUsd: number;
  estimatedEnergyWh: number;
  plansWithoutEstimateCount: number;
  followedByStrategy: Record<RouteOption["strategy"], number>;
};

export type ImpactCounterRouteRecords = {
  routeCards: readonly RouteCard[];
  routeLogEntries: readonly RouteLogEntry[];
};

const emptyFollowedByStrategy: TrackedImpactSummary["followedByStrategy"] = {
  lean: 0,
  balanced: 0,
  premium: 0,
};

export const emptyTrackedImpactSummary: TrackedImpactSummary = {
  savedPlanCount: 0,
  followedPlanCount: 0,
  apiEquivalentCostUsd: 0,
  estimatedEnergyWh: 0,
  plansWithoutEstimateCount: 0,
  followedByStrategy: emptyFollowedByStrategy,
};

/**
 * Totals what the routes the user actually followed would have cost and consumed.
 *
 * This used to accumulate dollars from a fixed illustrative scenario whenever a route carried no
 * figure of its own, which meant the counter grew even when nothing had been measured. Now a route
 * contributes only its own estimate, and routes saved before those estimates existed are counted
 * separately so the total is never quietly padded.
 */
export function buildTrackedImpactSummary(routeRecords: ImpactCounterRouteRecords): TrackedImpactSummary {
  const routeCardsById = new Map(routeRecords.routeCards.map((routeCard) => [routeCard.id, routeCard]));
  const followedByStrategy = { ...emptyFollowedByStrategy };
  let apiEquivalentCostUsd = 0;
  let estimatedEnergyWh = 0;
  let plansWithoutEstimateCount = 0;
  let followedPlanCount = 0;

  for (const routeLogEntry of routeRecords.routeLogEntries) {
    if (!countsAsFollowed(routeLogEntry)) {
      continue;
    }

    const routeCard = routeCardsById.get(routeLogEntry.routeCardId);
    const selectedOption = routeCard?.options.find((option) => option.id === routeLogEntry.selectedOptionId);
    const strategy = selectedOption?.strategy ?? routeLogEntry.selectedStrategy;

    followedPlanCount += 1;
    followedByStrategy[strategy] += 1;

    if (selectedOption?.apiEquivalentCostUsd === undefined) {
      plansWithoutEstimateCount += 1;
      continue;
    }

    apiEquivalentCostUsd += selectedOption.apiEquivalentCostUsd;
    estimatedEnergyWh += selectedOption.estimatedEnergyWh ?? 0;
  }

  return {
    savedPlanCount: routeRecords.routeLogEntries.length,
    followedPlanCount,
    apiEquivalentCostUsd,
    estimatedEnergyWh,
    plansWithoutEstimateCount,
    followedByStrategy,
  };
}

function countsAsFollowed(routeLogEntry: RouteLogEntry) {
  return routeLogEntry.outcome === "accepted" || routeLogEntry.outcome === "edited";
}
