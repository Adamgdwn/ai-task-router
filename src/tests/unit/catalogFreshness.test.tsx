import { cleanup, render, screen } from "@testing-library/react";
import {
  announcedCatalogChanges,
  assessCatalogFreshness,
  catalogReviewedAt,
  catalogStaleAfterDays,
} from "../../domain/catalog/catalogFreshness";
import { everydayToolCatalogReviewedAt } from "../../domain/defaults/everydayToolCatalog";
import { impactCatalogReviewedAt } from "../../domain/impact/impactEstimator";
import { CatalogStalenessNotice } from "../../ui/screens/TaskRoutingScreens";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function daysAfterReview(days: number) {
  return new Date(new Date(catalogReviewedAt).getTime() + days * 86_400_000);
}

// The age rule is exercised against an empty change list. While a change is pending there is no
// date that trips age without also tripping the change, so testing it any other way would be
// testing the calendar rather than the rule.
const noAnnouncedChanges: typeof announcedCatalogChanges = [];

describe("assessCatalogFreshness", () => {
  it("measures age from the older of the two catalog review dates", () => {
    const older =
      everydayToolCatalogReviewedAt < impactCatalogReviewedAt
        ? everydayToolCatalogReviewedAt
        : impactCatalogReviewedAt;

    expect(catalogReviewedAt).toBe(older);
  });

  it("reports a fresh catalog inside the threshold", () => {
    const freshness = assessCatalogFreshness(daysAfterReview(20), noAnnouncedChanges);

    expect(freshness.ageDays).toBe(20);
    expect(freshness.stale).toBe(false);
  });

  it("stays fresh on the threshold day and turns stale the day after", () => {
    expect(assessCatalogFreshness(daysAfterReview(catalogStaleAfterDays), noAnnouncedChanges).stale).toBe(false);
    expect(assessCatalogFreshness(daysAfterReview(catalogStaleAfterDays + 1), noAnnouncedChanges).stale).toBe(true);
  });

  it("never reports a negative age if the clock is behind the review date", () => {
    const freshness = assessCatalogFreshness(daysAfterReview(-30), noAnnouncedChanges);

    expect(freshness.ageDays).toBe(0);
    expect(freshness.stale).toBe(false);
  });
});

describe("CatalogStalenessNotice", () => {
  it("renders nothing while the catalog is inside the review threshold", () => {
    const { container } = render(
      <CatalogStalenessNotice
        freshness={assessCatalogFreshness(daysAfterReview(catalogStaleAfterDays), noAnnouncedChanges)}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("admits the age without implying the app can check current model data", () => {
    render(
      <CatalogStalenessNotice
        freshness={assessCatalogFreshness(daysAfterReview(catalogStaleAfterDays + 45), noAnnouncedChanges)}
      />,
    );

    const notice = screen.getByRole("status");

    expect(notice).toHaveTextContent(`${catalogStaleAfterDays + 45} days ago`);
    expect(notice).toHaveTextContent(/never reads live provider menus or prices/);
    expect(notice).toHaveTextContent(/check your tool's current model list/);
    expect(notice.textContent ?? "").not.toMatch(/updat|refresh|latest|fetch/i);
  });
});

/**
 * The age clock answers "how long since a human looked". It cannot answer "is this still true",
 * and a dated provider change is the one case where the app can know the answer is no.
 */
describe("announced provider changes", () => {
  const sonnetChange = announcedCatalogChanges.find(
    (change) => change.id === "anthropic-sonnet-5-introductory-pricing-ends",
  );

  it("records the announced Anthropic pricing change with a date", () => {
    expect(sonnetChange?.effectiveAt).toBe("2026-09-01T00:00:00.000Z");
  });

  it("reads as fresh the day before an announced change lands", () => {
    const freshness = assessCatalogFreshness(new Date("2026-08-31T23:59:00.000Z"));

    expect(freshness.stale).toBe(false);
    expect(freshness.landedChange).toBeUndefined();
  });

  // The point of the mechanism: stale on the day, even though a human reviewed it five weeks ago
  // and the 90-day clock has not run out.
  it("goes stale on the day the change lands, however recent the review", () => {
    const freshness = assessCatalogFreshness(new Date("2026-09-01T00:00:00.000Z"));

    expect(freshness.ageDays).toBeLessThan(catalogStaleAfterDays);
    expect(freshness.stale).toBe(true);
    expect(freshness.landedChange?.id).toBe("anthropic-sonnet-5-introductory-pricing-ends");
  });

  it("names the change in the notice rather than the review age", () => {
    render(<CatalogStalenessNotice freshness={assessCatalogFreshness(new Date("2026-09-02T00:00:00.000Z"))} />);

    expect(screen.getByRole("status")).toHaveTextContent("A provider change landed on");
    expect(screen.getByRole("status")).toHaveTextContent("Claude Sonnet 5 introductory API pricing ends");
  });
});
