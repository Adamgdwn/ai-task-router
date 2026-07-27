import { describe, expect, it } from "vitest";

import { formatUsd } from "../../domain/format";
import {
  comparisonMultipleClause,
  displayedCostMultiple,
  formatMultiple,
  heaviestSiblingRoute,
  summarizeFollowedChoicePattern,
} from "../../domain/impact/routeComparison";
import type { RouteCard, RouteLogEntry, RouteOption } from "../../domain/types";

function routeOption(overrides: Partial<RouteOption> & Pick<RouteOption, "id">): RouteOption {
  return {
    label: `Route ${overrides.id}`,
    strategy: "lean",
    estimatedCostLevel: "low",
    estimatedEffortLevel: "low",
    ...overrides,
  } as RouteOption;
}

function routeCard(id: string, options: RouteOption[]): RouteCard {
  return { id, title: `Card ${id}`, options } as RouteCard;
}

function logEntry(overrides: Partial<RouteLogEntry> & Pick<RouteLogEntry, "id" | "routeCardId">): RouteLogEntry {
  return {
    outcome: "accepted",
    selectedStrategy: "lean",
    createdAt: "2026-07-26T00:00:00.000Z",
    ...overrides,
  } as RouteLogEntry;
}

describe("heaviestSiblingRoute", () => {
  it("finds the costliest option other than the candidate", () => {
    const lean = routeOption({ id: "lean", apiEquivalentCostUsd: 0.3 });
    const premium = routeOption({ id: "premium", apiEquivalentCostUsd: 2.4 });

    expect(heaviestSiblingRoute(lean, [lean, premium])?.id).toBe("premium");
  });

  // A user already on the heaviest route has nothing to compare against, and inventing a
  // comparison would mean comparing the route to itself at 1x.
  it("returns nothing when the candidate is itself the heaviest", () => {
    const lean = routeOption({ id: "lean", apiEquivalentCostUsd: 0.3 });
    const premium = routeOption({ id: "premium", apiEquivalentCostUsd: 2.4 });

    expect(heaviestSiblingRoute(premium, [lean, premium])).toBeUndefined();
  });
});

describe("comparisonMultipleClause", () => {
  it("states the multiple so the reader does not do the division", () => {
    expect(comparisonMultipleClause(0.3, 2.4)).toBe("roughly 8x this route");
  });

  it("drops the decimal once the multiple is large enough not to need it", () => {
    expect(comparisonMultipleClause(0.1, 12.3)).toBe("roughly 120x this route");
  });

  // Two near-identical estimates do not support "1.05x"; the precision would be invented.
  it("reads near-equal routes as near-equal", () => {
    expect(comparisonMultipleClause(1, 1.05)).toBe("about the same as this route");
    expect(comparisonMultipleClause(1, 1)).toBe("about the same as this route");
  });

  it("has no multiple to state when the candidate figure is missing or zero", () => {
    expect(comparisonMultipleClause(undefined, 2.4)).toBeNull();
    expect(comparisonMultipleClause(0, 2.4)).toBeNull();
    expect(comparisonMultipleClause(Number.NaN, 2.4)).toBeNull();
  });
});

describe("formatMultiple", () => {
  it("keeps one decimal below 10 and drops it at or above", () => {
    expect(formatMultiple(2.34)).toBe("2.3");
    expect(formatMultiple(9.94)).toBe("9.9");
    expect(formatMultiple(12.4)).toBe("12");
  });
});

describe("summarizeFollowedChoicePattern", () => {
  const lean = routeOption({ id: "lean", apiEquivalentCostUsd: 0.3, estimatedEnergyWh: 1 });
  const premium = routeOption({ id: "premium", apiEquivalentCostUsd: 2.4, estimatedEnergyWh: 8 });

  it("totals the chosen routes against the heaviest offered each time", () => {
    const pattern = summarizeFollowedChoicePattern({
      routeCards: [routeCard("card-1", [lean, premium]), routeCard("card-2", [lean, premium])],
      routeLogEntries: [
        logEntry({ id: "a", routeCardId: "card-1", selectedOptionId: "lean" }),
        logEntry({ id: "b", routeCardId: "card-2", selectedOptionId: "lean", outcome: "edited" }),
      ],
    });

    expect(pattern.comparedCount).toBe(2);
    expect(pattern.lighterThanHeaviestCount).toBe(2);
    expect(pattern.chosenCostUsd).toBeCloseTo(0.6);
    expect(pattern.heaviestOfferedCostUsd).toBeCloseTo(4.8);
    expect(pattern.chosenEnergyWh).toBeCloseTo(2);
    expect(pattern.heaviestOfferedEnergyWh).toBeCloseTo(16);
  });

  it("counts only what the user said they followed", () => {
    const pattern = summarizeFollowedChoicePattern({
      routeCards: [routeCard("card-1", [lean, premium])],
      routeLogEntries: [
        logEntry({ id: "a", routeCardId: "card-1", selectedOptionId: "lean", outcome: "rejected" }),
        logEntry({ id: "b", routeCardId: "card-1", selectedOptionId: "lean", outcome: "deferred" }),
      ],
    });

    expect(pattern.comparedCount).toBe(0);
  });

  // The claim being protected: a choice with no stored estimate must not enter the totals as a
  // zero, because a zero would drag the comparison toward "these routes barely differ".
  it("leaves unestimated choices out instead of counting them as zero", () => {
    const unpriced = routeOption({ id: "unpriced" });
    const pattern = summarizeFollowedChoicePattern({
      routeCards: [routeCard("card-1", [unpriced, premium]), routeCard("card-2", [lean, premium])],
      routeLogEntries: [
        logEntry({ id: "a", routeCardId: "card-1", selectedOptionId: "unpriced" }),
        logEntry({ id: "b", routeCardId: "card-2", selectedOptionId: "lean" }),
      ],
    });

    expect(pattern.comparedCount).toBe(1);
    expect(pattern.chosenCostUsd).toBeCloseTo(0.3);
    expect(pattern.heaviestOfferedCostUsd).toBeCloseTo(2.4);
  });

  it("does not count a choice that was never offered anything heavier", () => {
    const pattern = summarizeFollowedChoicePattern({
      routeCards: [routeCard("card-1", [premium])],
      routeLogEntries: [logEntry({ id: "a", routeCardId: "card-1", selectedOptionId: "premium" })],
    });

    expect(pattern.comparedCount).toBe(0);
  });

  it("separates taking the heaviest route from having no comparison at all", () => {
    const pattern = summarizeFollowedChoicePattern({
      routeCards: [routeCard("card-1", [lean, premium])],
      routeLogEntries: [logEntry({ id: "a", routeCardId: "card-1", selectedOptionId: "premium" })],
    });

    // The premium option is the heaviest, so it has no heavier sibling and drops out entirely
    // rather than appearing as a 1x comparison against itself.
    expect(pattern.comparedCount).toBe(0);
    expect(pattern.lighterThanHeaviestCount).toBe(0);
  });
});

/**
 * A ratio shown beside two dollar figures is an invitation to check it. These hold the app to the
 * arithmetic the reader can actually do, rather than the more accurate arithmetic behind the screen.
 */
describe("displayedCostMultiple", () => {
  it("divides the figures as displayed, not the raw estimates", () => {
    // $0.047 renders as "$0.05". Raw division gives 24; the visible numbers give 22.6.
    expect(formatUsd(0.047)).toBe("$0.05");
    expect(displayedCostMultiple(0.047, 1.13)).toBe("23");
  });

  it("stays reproducible from the rendered figures across the sub-cent bands", () => {
    const pairs: ReadonlyArray<readonly [number, number]> = [
      [0.047, 1.13],
      [0.0004, 0.0071],
      [0.0123, 4.567],
      [1.239, 19.87],
    ];

    for (const [lighter, heavier] of pairs) {
      const shown = displayedCostMultiple(lighter, heavier);
      const fromScreen = formatMultiple(
        Number(formatUsd(heavier).replace(/[$,]/g, "")) / Number(formatUsd(lighter).replace(/[$,]/g, "")),
      );

      expect(shown).toBe(fromScreen);
    }
  });

  it("says nothing when a figure rounds away or the routes barely differ", () => {
    expect(displayedCostMultiple(0, 1.13)).toBeNull();
    expect(displayedCostMultiple(1.13, 0)).toBeNull();
    expect(displayedCostMultiple(1, 1.05)).toBeNull();
  });

  it("keeps comparisonMultipleClause reproducible from the same displayed figures", () => {
    expect(comparisonMultipleClause(0.047, 1.13)).toBe("roughly 23x this route");
  });
});
