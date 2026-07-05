import {
  defaultHundredThousandTokenRun,
  estimateAvoidedResourceUse,
  estimateHundredThousandTokenCostUsd,
  estimateRightSizingCostSavings,
  estimateTokenRunCostUsd,
  modelPricingAnchors,
  requirePricingAnchor,
} from "../../domain/impact/impactEstimator";

describe("impact estimator", () => {
  it("calculates 100k-token benchmark costs from per-million-token pricing", () => {
    const gpt55 = requirePricingAnchor("openai-gpt-5-5");
    const gpt54Nano = requirePricingAnchor("openai-gpt-5-4-nano");

    expect(estimateHundredThousandTokenCostUsd(gpt55)).toBeCloseTo(1.125);
    expect(estimateHundredThousandTokenCostUsd(gpt54Nano)).toBeCloseTo(0.04625);
  });

  it("applies cached-input rates only to cached input tokens", () => {
    const gpt55 = requirePricingAnchor("openai-gpt-5-5");

    expect(
      estimateTokenRunCostUsd(gpt55, {
        inputTokens: 75_000,
        cachedInputTokens: 50_000,
        outputTokens: 25_000,
      }),
    ).toBeCloseTo(0.9);
  });

  it("estimates right-sizing savings while subtracting induced extra use", () => {
    const estimate = estimateRightSizingCostSavings({
      baselineModelId: "openai-gpt-5-5",
      routedModelId: "openai-gpt-5-4-nano",
      tokenRun: defaultHundredThousandTokenRun,
      taskCount: 100,
      successfulRoutingRate: 0.8,
      inducedExtraRuns: [
        {
          modelId: "openai-gpt-5-4-nano",
          tokenRun: defaultHundredThousandTokenRun,
          count: 10,
        },
      ],
    });

    expect(estimate.baselineCostUsd).toBeCloseTo(112.5);
    expect(estimate.routedCostUsd).toBeCloseTo(4.625);
    expect(estimate.grossAvoidedCostUsd).toBeCloseTo(86.3);
    expect(estimate.inducedExtraCostUsd).toBeCloseTo(0.4625);
    expect(estimate.netAvoidedCostUsd).toBeCloseTo(85.8375);
  });

  it("estimates energy and water as scenario ranges rather than exact proof", () => {
    const estimate = estimateAvoidedResourceUse({
      baselineEnergyAnchorId: "o3-medium-estimate",
      routedEnergyAnchorId: "gpt-4o-medium-estimate",
      taskCount: 10,
      successfulRoutingRate: 0.5,
    });

    expect(estimate.netAvoidedWattHours).toBeCloseTo(101);
    expect(estimate.directWaterMlRange.low).toBeCloseTo(27.27);
    expect(estimate.directWaterMlRange.high).toBeCloseTo(111.1);
    expect(estimate.broaderOperationalWaterMlRange.low).toBeCloseTo(303);
    expect(estimate.broaderOperationalWaterMlRange.high).toBeCloseTo(454.5);
  });

  it("keeps every pricing anchor tied to a reviewed source", () => {
    for (const pricingAnchor of modelPricingAnchors) {
      expect(pricingAnchor.sourceId).toMatch(/2026-07-05$/);
      expect(pricingAnchor.inputUsdPerMillionTokens).toBeGreaterThanOrEqual(0);
      expect(pricingAnchor.outputUsdPerMillionTokens).toBeGreaterThanOrEqual(0);
    }
  });
});
