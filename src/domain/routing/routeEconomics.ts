import {
  defaultHundredThousandTokenRun,
  estimateTokenRunCostUsd,
  requirePricingAnchor,
  type TokenRun,
} from "../impact/impactEstimator";
import type { ModelInventoryItem, RouteOption, RouteStep } from "../types";
import { pricingAnchorIdForModel } from "./modelGuidance";

type RouteCostBasis = {
  costUsd: number;
  comparedWithCostUsd: number;
  comparedWithLabel: string;
};

const stepCostMultipliers: Record<RouteStep["kind"], number> = {
  model: 1,
  research: 0.25,
  artifact: 0.35,
  manual: 0,
  "human review": 0,
};

export function attachRouteEconomics(
  options: RouteOption[],
  models: readonly ModelInventoryItem[],
): RouteOption[] {
  const modelById = new Map(models.map((model) => [model.id, model]));
  const premiumBenchmarkCostUsd = estimatePricingAnchorCost("openai-premium-text-anchor", defaultHundredThousandTokenRun);
  const optionCosts = options.map((option) => ({
    option,
    costUsd:
      option.strategy === "premium"
        ? Math.max(estimateRouteCostUsd(option, modelById), premiumBenchmarkCostUsd)
        : estimateRouteCostUsd(option, modelById),
  }));
  const baseline = optionCosts.reduce(
    (currentBaseline, candidate) =>
      candidate.costUsd > currentBaseline.costUsd
        ? { costUsd: candidate.costUsd, label: candidate.option.label }
        : currentBaseline,
    { costUsd: 0, label: "the heaviest safe option" },
  );
  const usesPremiumBenchmark = baseline.costUsd < premiumBenchmarkCostUsd;
  const comparedWithLabel = usesPremiumBenchmark ? "premium API-equivalent help" : baseline.label;
  const comparedWithCostUsd = usesPremiumBenchmark ? premiumBenchmarkCostUsd : baseline.costUsd;

  return optionCosts.map(({ option, costUsd }) =>
    attachEconomicsToOption(option, {
      costUsd,
      comparedWithCostUsd,
      comparedWithLabel,
    }),
  );
}

export function estimateRouteCostUsd(
  option: Pick<RouteOption, "steps">,
  modelById: ReadonlyMap<string, ModelInventoryItem>,
): number {
  const total = option.steps.reduce((sum, step) => {
    if (!step.modelId) {
      return sum;
    }

    const model = modelById.get(step.modelId);
    if (!model) {
      return sum;
    }

    const pricingAnchorId = pricingAnchorIdForModel(model);
    if (!pricingAnchorId) {
      return sum;
    }

    const multiplier = stepCostMultipliers[step.kind];
    return sum + estimatePricingAnchorCost(pricingAnchorId, scaledTokenRun(multiplier));
  }, 0);

  return roundUsd(total);
}

function attachEconomicsToOption(option: RouteOption, basis: RouteCostBasis): RouteOption {
  const estimatedSavingsUsd = Math.max(0, basis.comparedWithCostUsd - basis.costUsd);
  const estimatedSavingsPercent =
    basis.comparedWithCostUsd > 0 ? (estimatedSavingsUsd / basis.comparedWithCostUsd) * 100 : 0;

  return {
    ...option,
    estimatedCostUsd: roundUsd(basis.costUsd),
    estimatedSavingsUsd: roundUsd(estimatedSavingsUsd),
    estimatedSavingsPercent: roundPercent(estimatedSavingsPercent),
    savingsComparedWith: basis.comparedWithLabel,
    costEstimateBasis:
      "100k-token API-equivalent estimate using representative pricing anchors reviewed from public sources; subscriptions, free tiers, search add-ons, taxes, caching, and provider limits can change the real bill.",
  };
}

function estimatePricingAnchorCost(pricingAnchorId: string, tokenRun: TokenRun) {
  return estimateTokenRunCostUsd(requirePricingAnchor(pricingAnchorId), tokenRun);
}

function scaledTokenRun(multiplier: number): TokenRun {
  return {
    inputTokens: Math.round(defaultHundredThousandTokenRun.inputTokens * multiplier),
    outputTokens: Math.round(defaultHundredThousandTokenRun.outputTokens * multiplier),
  };
}

function roundUsd(value: number) {
  return Math.round(value * 1000) / 1000;
}

function roundPercent(value: number) {
  return Math.round(value);
}
