import { displayedUsdValue } from "../format";
import type { RouteCard, RouteLogEntry, RouteOption } from "../types";

/**
 * The only comparison a user can act on is between the routes in front of them, so this reads the
 * siblings rather than a stored figure measured against a premium baseline they never chose.
 */
export function heaviestSiblingRoute(candidate: RouteOption, options: readonly RouteOption[]) {
  const heaviest = options.reduce<RouteOption | undefined>(
    (currentHeaviest, option) =>
      (option.apiEquivalentCostUsd ?? 0) > (currentHeaviest?.apiEquivalentCostUsd ?? 0) ? option : currentHeaviest,
    undefined,
  );

  return heaviest && heaviest.id !== candidate.id ? heaviest : undefined;
}

/**
 * Two figures side by side still leave the reader doing the division, and the division is the
 * lesson. A multiple is a comparison between two estimates on the same basis, not a claim about
 * money kept, so it stays inside the fixed impact vocabulary in R-010.
 *
 * Returns null when the multiple would overstate what the estimates support: a zero or missing
 * candidate figure has no meaningful ratio, and near-equal routes should read as near-equal rather
 * than as "1.1x".
 *
 * The division runs on the figures as displayed, so a reader who checks it against the dollar
 * amounts beside it gets the same answer. See `displayedUsdValue`.
 */
export function comparisonMultipleClause(candidateValue: number | undefined, heaviestValue: number) {
  if (candidateValue === undefined || candidateValue <= 0 || !Number.isFinite(candidateValue)) {
    return null;
  }

  const multiple = displayedCostMultipleValue(candidateValue, heaviestValue);

  if (multiple === null || multiple < 1.1) {
    return "about the same as this route";
  }

  return `roughly ${formatMultiple(multiple)}x this route`;
}

/**
 * How many times the lighter figure the heavier one is, as both are shown on screen.
 *
 * Returns null when there is nothing worth stating: a missing or zero figure once rounded for
 * display, or two figures close enough that a multiple would dress up noise as a lesson.
 */
export function displayedCostMultiple(lighterUsd: number, heavierUsd: number): string | null {
  const multiple = displayedCostMultipleValue(lighterUsd, heavierUsd);

  return multiple === null || multiple < 1.1 ? null : formatMultiple(multiple);
}

function displayedCostMultipleValue(lighterUsd: number, heavierUsd: number): number | null {
  const lighter = displayedUsdValue(lighterUsd);
  const heavier = displayedUsdValue(heavierUsd);

  if (lighter <= 0 || heavier <= 0) {
    return null;
  }

  const multiple = heavier / lighter;

  return Number.isFinite(multiple) ? multiple : null;
}

export function formatMultiple(multiple: number): string {
  const rounded = Number(multiple.toPrecision(2));

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: rounded >= 10 ? 0 : 1 }).format(rounded);
}

export type FollowedChoicePattern = {
  /** Followed choices where both the chosen route and a heavier sibling carried figures. */
  comparedCount: number;
  /** Of those, how many times something lighter than the heaviest offered was taken. */
  lighterThanHeaviestCount: number;
  chosenCostUsd: number;
  heaviestOfferedCostUsd: number;
  chosenEnergyWh: number;
  heaviestOfferedEnergyWh: number;
};

export const emptyFollowedChoicePattern: FollowedChoicePattern = {
  comparedCount: 0,
  lighterThanHeaviestCount: 0,
  chosenCostUsd: 0,
  heaviestOfferedCostUsd: 0,
  chosenEnergyWh: 0,
  heaviestOfferedEnergyWh: 0,
};

type RouteChoiceRecords = {
  routeCards: readonly RouteCard[];
  routeLogEntries: readonly RouteLogEntry[];
};

/**
 * What a whole log of choices adds up to, against what the same choices would have added up to at
 * the heaviest route offered each time.
 *
 * A single decision card teaches "this route is lighter than that one". Only the log can teach
 * "this is how you tend to choose", which is the habit the app exists to build. Both totals are
 * API-equivalent figures on the same basis, so the pair is a comparison and not a claim that money
 * changed hands - the R-010 vocabulary applies to how this is rendered.
 *
 * A choice contributes only when the chosen route and a heavier sibling both carry figures.
 * Anything else - a saved choice from before estimates existed, or one where the user was already
 * offered nothing heavier - is left out rather than counted as a zero, because a zero here would
 * quietly flatten the comparison toward "no difference".
 */
export function summarizeFollowedChoicePattern(records: RouteChoiceRecords): FollowedChoicePattern {
  const routeCardsById = new Map(records.routeCards.map((routeCard) => [routeCard.id, routeCard]));
  const pattern = { ...emptyFollowedChoicePattern };

  for (const entry of records.routeLogEntries) {
    if (entry.outcome !== "accepted" && entry.outcome !== "edited") {
      continue;
    }

    const routeCard = routeCardsById.get(entry.routeCardId);
    const chosen = routeCard?.options.find((option) => option.id === entry.selectedOptionId);

    if (!routeCard || !chosen || chosen.apiEquivalentCostUsd === undefined) {
      continue;
    }

    const heaviest = heaviestSiblingRoute(chosen, routeCard.options);

    if (!heaviest || heaviest.apiEquivalentCostUsd === undefined) {
      continue;
    }

    pattern.comparedCount += 1;
    pattern.chosenCostUsd += chosen.apiEquivalentCostUsd;
    pattern.heaviestOfferedCostUsd += heaviest.apiEquivalentCostUsd;
    pattern.chosenEnergyWh += chosen.estimatedEnergyWh ?? 0;
    pattern.heaviestOfferedEnergyWh += heaviest.estimatedEnergyWh ?? 0;

    if (chosen.apiEquivalentCostUsd < heaviest.apiEquivalentCostUsd) {
      pattern.lighterThanHeaviestCount += 1;
    }
  }

  return pattern;
}
