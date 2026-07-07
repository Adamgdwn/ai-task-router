import {
  defaultHundredThousandTokenRun,
  estimateTokenRunCostUsd,
  requireEnergyAnchor,
  requirePricingAnchor,
  type TokenRun,
} from "../impact/impactEstimator";
import type { ModelInventoryItem, RouteOption, RouteStep, TaskIntake, WorkRole } from "../types";
import { pricingAnchorIdForModel } from "./modelGuidance";
import { modeEstimateAnchorsForRouteStep } from "./toolModeCatalog";

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

const roleCostMultipliers: Record<WorkRole, number> = {
  "evidence-check": 0.25,
  "prompt-design": 0.45,
  execution: 0.65,
  "build-slice": 0.85,
  "artifact-package": 0.35,
  "quality-review": 0.15,
  "next-action": 0,
};

const energyProfileMultipliers = {
  none: 0,
  low: 0.35,
  medium: 0.65,
  high: 1,
  reasoning: 1.2,
} as const;

const minimumActionableRouteEnergyWh = 0.024;

export function attachRouteEconomics(
  options: RouteOption[],
  models: readonly ModelInventoryItem[],
  task?: TaskIntake,
): RouteOption[] {
  const modelById = new Map(models.map((model) => [model.id, model]));
  const premiumBenchmarkCostUsd = estimatePricingAnchorCost("openai-premium-text-anchor", defaultHundredThousandTokenRun);
  const premiumBenchmarkEnergyWh = estimateEnergyAnchorWh("o3-medium-estimate", 1);
  const optionCosts = options.map((option) => ({
    option,
    costUsd:
      option.strategy === "premium"
        ? Math.max(estimateRouteCostUsd(option, modelById, task), premiumBenchmarkCostUsd)
        : estimateRouteCostUsd(option, modelById, task),
    energyWh:
      option.strategy === "premium"
        ? Math.max(estimateRouteEnergyWh(option, modelById, task), premiumBenchmarkEnergyWh)
        : estimateRouteEnergyWh(option, modelById, task),
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
  _task?: TaskIntake,
): number {
  const total = option.steps.reduce((sum, step) => {
    return sum + estimateRouteStepCostUsd(step, modelById);
  }, 0);

  return roundUsd(total);
}

export function estimateRouteEnergyWh(
  option: Pick<RouteOption, "steps">,
  modelById: ReadonlyMap<string, ModelInventoryItem>,
  _task?: TaskIntake,
): number {
  const total = option.steps.reduce((sum, step) => {
    return sum + estimateRouteStepEnergyWh(step, modelById);
  }, 0);

  if (option.steps.length > 0 && total === 0) {
    return minimumActionableRouteEnergyWh;
  }

  return roundWh(total);
}

export function estimateRouteStepCostUsd(
  step: RouteStep,
  modelById: ReadonlyMap<string, ModelInventoryItem>,
): number {
  if (!step.modelId) {
    return 0;
  }

  const model = modelById.get(step.modelId);
  if (!model) {
    return 0;
  }

  const pricingAnchorId = pricingAnchorIdForStep(step, model);
  if (!pricingAnchorId) {
    return 0;
  }

  return roundUsd(estimatePricingAnchorCost(pricingAnchorId, scaledTokenRun(multiplierForStep(step))));
}

export function estimateRouteStepEnergyWh(
  step: RouteStep,
  modelById: ReadonlyMap<string, ModelInventoryItem>,
): number {
  if (!step.modelId) {
    return 0;
  }

  const model = modelById.get(step.modelId);
  if (!model) {
    return 0;
  }

  const anchors = modeEstimateAnchorsForRouteStep(step, model);
  const energyAnchorId = anchors.energyAnchorId ?? energyAnchorIdForModel(model);
  if (!energyAnchorId) {
    return step.kind === "manual" ? minimumActionableRouteEnergyWh : 0;
  }

  const profileMultiplier = energyProfileMultipliers[anchors.energyProfile];
  return roundWh(estimateEnergyAnchorWh(energyAnchorId, multiplierForStep(step) * profileMultiplier));
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
      "Per-use estimate using zero marginal dollars for selected free/basic tools and 100k-token API-equivalent pricing anchors for paid or premium model-equivalent work; subscriptions, search add-ons, taxes, caching, and provider limits can change the real bill.",
    estimatedEnergyWh: roundWh(basis.energyWh),
    estimatedEnergySavingsWh: roundWh(estimatedEnergySavingsWh),
    estimatedEnergySavingsPercent: roundPercent(estimatedEnergySavingsPercent),
    energyEstimateBasis:
      "Per-use compute-energy estimate using representative public inference energy anchors, with a small nonzero floor for manual or local routes because real device use is not zero. Local device energy, provider routing, media generation, caching, data-center conditions, and repeated retries can change the real footprint.",
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

function pricingAnchorIdForStep(step: RouteStep, model: ModelInventoryItem) {
  const anchors = modeEstimateAnchorsForRouteStep(step, model);

  if (anchors.zeroMarginalCost) {
    return null;
  }

  return anchors.pricingAnchorId ?? pricingAnchorIdForModel(model);
}

function multiplierForStep(step: RouteStep) {
  return step.workRole ? roleCostMultipliers[step.workRole] : stepCostMultipliers[step.kind];
}

export function energyAnchorIdForModel(model: ModelInventoryItem): string | null {
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
