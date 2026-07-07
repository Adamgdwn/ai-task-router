import type { PublicImpactSnapshot } from "./publicImpactSnapshot";
import type { RouteCard, RouteLogEntry, RouteOption } from "../types";

export type TrackedImpactSummary = {
  savedPlanCount: number;
  followedPlanCount: number;
  estimatedAvoidedCostUsd: number;
  estimatedAvoidedWattHours: number;
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
  estimatedAvoidedCostUsd: 0,
  estimatedAvoidedWattHours: 0,
  followedByStrategy: emptyFollowedByStrategy,
};

export function buildTrackedImpactSummary(
  routeRecords: ImpactCounterRouteRecords,
  snapshot: PublicImpactSnapshot,
): TrackedImpactSummary {
  const routeCardsById = new Map(routeRecords.routeCards.map((routeCard) => [routeCard.id, routeCard]));
  const perTaskCostUsd = snapshot.rightSizingExample.netAvoidedCostUsd / snapshot.rightSizingExample.taskCount;
  const perTaskWattHours =
    snapshot.environmentalExample.netAvoidedWattHours / snapshot.environmentalExample.taskCount;
  const followedByStrategy = { ...emptyFollowedByStrategy };
  let estimatedAvoidedCostUsd = 0;
  let estimatedAvoidedWattHours = 0;
  let followedPlanCount = 0;

  for (const routeLogEntry of routeRecords.routeLogEntries) {
    if (!countsAsFollowed(routeLogEntry)) {
      continue;
    }

    const routeCard = routeCardsById.get(routeLogEntry.routeCardId);
    const selectedOption = routeCard?.options.find((option) => option.id === routeLogEntry.selectedOptionId);
    const strategy = selectedOption?.strategy ?? routeLogEntry.selectedStrategy;
    const multiplier = routeImpactMultiplier(selectedOption);

    followedPlanCount += 1;
    followedByStrategy[strategy] += 1;
    estimatedAvoidedCostUsd += perTaskCostUsd * multiplier;
    estimatedAvoidedWattHours += perTaskWattHours * multiplier;
  }

  return {
    savedPlanCount: routeRecords.routeLogEntries.length,
    followedPlanCount,
    estimatedAvoidedCostUsd,
    estimatedAvoidedWattHours,
    followedByStrategy,
  };
}

function countsAsFollowed(routeLogEntry: RouteLogEntry) {
  return routeLogEntry.outcome === "accepted" || routeLogEntry.outcome === "edited";
}

function routeImpactMultiplier(option: RouteOption | undefined) {
  if (!option) {
    return 0.5;
  }

  if (option.estimatedCostLevel === "low") {
    return option.estimatedEffortLevel === "high" ? 0.85 : 1;
  }

  if (option.estimatedCostLevel === "medium") {
    return 0.55;
  }

  return 0.2;
}
