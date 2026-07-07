import {
  defaultHundredThousandTokenRun,
  estimateTokenRunCostUsd,
  requireEnergyAnchor,
  requirePricingAnchor,
  type TokenRun,
} from "../impact/impactEstimator";
import type { ModelInventoryItem, RouteOption, RouteStep } from "../types";
import { pricingAnchorIdForModel } from "./modelGuidance";

type RouteCostBasis = {
  costUsd: number;
  comparedWithCostUsd: number;
  comparedWithLabel: string;
  energyWh: number;
  comparedWithEnergyWh: number;
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
  const premiumBenchmarkEnergyWh = estimateEnergyAnchorWh("o3-medium-estimate", 1);
  const optionCosts = options.map((option) => ({
    option,
    costUsd:
      option.strategy === "premium"
        ? Math.max(estimateRouteCostUsd(option, modelById), premiumBenchmarkCostUsd)
        : estimateRouteCostUsd(option, modelById),
    energyWh:
      option.strategy === "premium"
        ? Math.max(estimateRouteEnergyWh(option, modelById), premiumBenchmarkEnergyWh)
        : estimateRouteEnergyWh(option, modelById),
  }));
  const baseline = optionCosts.reduce(
    (currentBaseline, candidate) =>
      candidate.costUsd > currentBaseline.costUsd || candidate.energyWh > currentBaseline.energyWh
        ? { costUsd: candidate.costUsd, energyWh: candidate.energyWh, label: candidate.option.label }
        : currentBaseline,
    { costUsd: 0, energyWh: 0, label: "the heaviest safe option" },
  );
  const usesPremiumBenchmark = baseline.costUsd < premiumBenchmarkCostUsd || baseline.energyWh < premiumBenchmarkEnergyWh;
  const comparedWithLabel = usesPremiumBenchmark ? "premium API-equivalent help" : baseline.label;
  const comparedWithCostUsd = usesPremiumBenchmark ? premiumBenchmarkCostUsd : baseline.costUsd;
  const comparedWithEnergyWh = usesPremiumBenchmark ? premiumBenchmarkEnergyWh : baseline.energyWh;

  return optionCosts.map(({ option, costUsd, energyWh }) =>
    attachEconomicsToOption(option, {
      costUsd,
      comparedWithCostUsd,
      comparedWithLabel,
      energyWh,
      comparedWithEnergyWh,
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

export function estimateRouteEnergyWh(
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

    const energyAnchorId = energyAnchorIdForModel(model);
    if (!energyAnchorId) {
      return sum;
    }

    return sum + estimateEnergyAnchorWh(energyAnchorId, stepCostMultipliers[step.kind]);
  }, 0);

  return roundWh(total);
}

function attachEconomicsToOption(option: RouteOption, basis: RouteCostBasis): RouteOption {
  const estimatedSavingsUsd = Math.max(0, basis.comparedWithCostUsd - basis.costUsd);
  const estimatedSavingsPercent =
    basis.comparedWithCostUsd > 0 ? (estimatedSavingsUsd / basis.comparedWithCostUsd) * 100 : 0;
  const estimatedEnergySavingsWh = Math.max(0, basis.comparedWithEnergyWh - basis.energyWh);
  const estimatedEnergySavingsPercent =
    basis.comparedWithEnergyWh > 0 ? (estimatedEnergySavingsWh / basis.comparedWithEnergyWh) * 100 : 0;

  return {
    ...option,
    estimatedCostUsd: roundUsd(basis.costUsd),
    estimatedSavingsUsd: roundUsd(estimatedSavingsUsd),
    estimatedSavingsPercent: roundPercent(estimatedSavingsPercent),
    savingsComparedWith: basis.comparedWithLabel,
    costEstimateBasis:
      "100k-token API-equivalent estimate using representative pricing anchors reviewed from public sources; subscriptions, free tiers, search add-ons, taxes, caching, and provider limits can change the real bill.",
    estimatedEnergyWh: roundWh(basis.energyWh),
    estimatedEnergySavingsWh: roundWh(estimatedEnergySavingsWh),
    estimatedEnergySavingsPercent: roundPercent(estimatedEnergySavingsPercent),
    energyEstimateBasis:
      "Per-use compute-energy estimate using representative public inference energy anchors. Local device energy, provider routing, media generation, caching, data-center conditions, and repeated retries can change the real footprint.",
  };
}

function estimatePricingAnchorCost(pricingAnchorId: string, tokenRun: TokenRun) {
  return estimateTokenRunCostUsd(requirePricingAnchor(pricingAnchorId), tokenRun);
}

function estimateEnergyAnchorWh(energyAnchorId: string, multiplier: number) {
  return requireEnergyAnchor(energyAnchorId).wattHoursPerRun * multiplier;
}

function scaledTokenRun(multiplier: number): TokenRun {
  return {
    inputTokens: Math.round(defaultHundredThousandTokenRun.inputTokens * multiplier),
    outputTokens: Math.round(defaultHundredThousandTokenRun.outputTokens * multiplier),
  };
}

function energyAnchorIdForModel(model: ModelInventoryItem): string | null {
  if (model.localOnly || model.tier === "human") {
    return null;
  }

  if (model.tier === "frontier") {
    return "o3-medium-estimate";
  }

  if (model.tier === "research" || model.tier === "artifact" || model.tier === "mid") {
    return "gpt-4o-medium-estimate";
  }

  return "google-median-gemini-apps-text-prompt";
}

function roundUsd(value: number) {
  return Math.round(value * 1000) / 1000;
}

function roundWh(value: number) {
  return Math.round(value * 1000) / 1000;
}

function roundPercent(value: number) {
  return Math.round(value);
}
