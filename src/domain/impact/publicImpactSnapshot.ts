import {
  defaultHundredThousandTokenRun,
  energySources,
  estimateAvoidedResourceUse,
  estimateHundredThousandTokenCostUsd,
  estimateRightSizingCostSavings,
  impactCatalogReviewedAt,
  pricingSources,
  requirePricingAnchor,
  type RangeEstimate,
} from "./impactEstimator";

export type PublicImpactSnapshot = {
  reviewedAt: string;
  tokenBenchmark: {
    tokenCount: number;
    inputTokens: number;
    outputTokens: number;
    lowerCostModelLabel: string;
    lowerCostUsd: number;
    comparisonModelLabel: string;
    comparisonCostUsd: number;
  };
  rightSizingExample: {
    taskCount: number;
    successfulRoutingRate: number;
    inducedExtraRuns: number;
    netAvoidedCostUsd: number;
  };
  environmentalExample: {
    taskCount: number;
    successfulRoutingRate: number;
    netAvoidedWattHours: number;
    directWaterMlRange: RangeEstimate;
    broaderOperationalWaterMlRange: RangeEstimate;
  };
  sourceLinks: Array<{
    label: string;
    url: string;
  }>;
};

export function buildDefaultPublicImpactSnapshot(): PublicImpactSnapshot {
  const lowerCostModel = requirePricingAnchor("openai-gpt-5-4-nano");
  const comparisonModel = requirePricingAnchor("openai-gpt-5-5");
  const rightSizingEstimate = estimateRightSizingCostSavings({
    baselineModelId: comparisonModel.id,
    routedModelId: lowerCostModel.id,
    tokenRun: defaultHundredThousandTokenRun,
    taskCount: 100,
    successfulRoutingRate: 0.8,
    inducedExtraRuns: [
      {
        modelId: lowerCostModel.id,
        tokenRun: defaultHundredThousandTokenRun,
        count: 10,
      },
    ],
  });
  const environmentalEstimate = estimateAvoidedResourceUse({
    baselineEnergyAnchorId: "o3-medium-estimate",
    routedEnergyAnchorId: "gpt-4o-medium-estimate",
    taskCount: 10,
    successfulRoutingRate: 0.5,
  });

  return {
    reviewedAt: impactCatalogReviewedAt,
    tokenBenchmark: {
      tokenCount: defaultHundredThousandTokenRun.inputTokens + defaultHundredThousandTokenRun.outputTokens,
      inputTokens: defaultHundredThousandTokenRun.inputTokens,
      outputTokens: defaultHundredThousandTokenRun.outputTokens,
      lowerCostModelLabel: `${lowerCostModel.provider} ${lowerCostModel.model}`,
      lowerCostUsd: estimateHundredThousandTokenCostUsd(lowerCostModel),
      comparisonModelLabel: `${comparisonModel.provider} ${comparisonModel.model}`,
      comparisonCostUsd: estimateHundredThousandTokenCostUsd(comparisonModel),
    },
    rightSizingExample: {
      taskCount: 100,
      successfulRoutingRate: 0.8,
      inducedExtraRuns: 10,
      netAvoidedCostUsd: rightSizingEstimate.netAvoidedCostUsd,
    },
    environmentalExample: {
      taskCount: 10,
      successfulRoutingRate: 0.5,
      netAvoidedWattHours: environmentalEstimate.netAvoidedWattHours,
      directWaterMlRange: environmentalEstimate.directWaterMlRange,
      broaderOperationalWaterMlRange: environmentalEstimate.broaderOperationalWaterMlRange,
    },
    sourceLinks: [...pricingSources, ...energySources].map((source) => ({
      label: source.label,
      url: source.url,
    })),
  };
}
