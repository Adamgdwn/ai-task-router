import { cleanup, render, screen } from "@testing-library/react";
import {
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

describe("assessCatalogFreshness", () => {
  it("measures age from the older of the two catalog review dates", () => {
    const older =
      everydayToolCatalogReviewedAt < impactCatalogReviewedAt
        ? everydayToolCatalogReviewedAt
        : impactCatalogReviewedAt;

    expect(catalogReviewedAt).toBe(older);
  });

  it("reports a fresh catalog inside the threshold", () => {
    const freshness = assessCatalogFreshness(daysAfterReview(20));

    expect(freshness.ageDays).toBe(20);
    expect(freshness.stale).toBe(false);
  });

  it("stays fresh on the threshold day and turns stale the day after", () => {
    expect(assessCatalogFreshness(daysAfterReview(catalogStaleAfterDays)).stale).toBe(false);
    expect(assessCatalogFreshness(daysAfterReview(catalogStaleAfterDays + 1)).stale).toBe(true);
  });

  it("never reports a negative age if the clock is behind the review date", () => {
    const freshness = assessCatalogFreshness(daysAfterReview(-30));

    expect(freshness.ageDays).toBe(0);
    expect(freshness.stale).toBe(false);
  });
});

describe("CatalogStalenessNotice", () => {
  it("renders nothing while the catalog is inside the review threshold", () => {
    vi.useFakeTimers();
    vi.setSystemTime(daysAfterReview(catalogStaleAfterDays));

    const { container } = render(<CatalogStalenessNotice />);

    expect(container).toBeEmptyDOMElement();
  });

  it("admits the age without implying the app can check current model data", () => {
    vi.useFakeTimers();
    vi.setSystemTime(daysAfterReview(catalogStaleAfterDays + 45));

    render(<CatalogStalenessNotice />);

    const notice = screen.getByRole("status");

    expect(notice).toHaveTextContent(`${catalogStaleAfterDays + 45} days ago`);
    expect(notice).toHaveTextContent(/never reads live provider menus or prices/);
    expect(notice).toHaveTextContent(/check your tool's current model list/);
    expect(notice.textContent ?? "").not.toMatch(/updat|refresh|latest|fetch/i);
  });
});
