import {
  defaultHundredThousandTokenRun,
  estimateTokenRunCostUsd,
  requireEnergyAnchor,
  requirePricingAnchor,
  type TokenRun,
} from "../impact/impactEstimator";
import type { ModelInventoryItem, RouteOption, RouteStep, TaskIntake, WorkRole } from "../types";
import { accountIsMeteredPerUse, apiEquivalentPricingAnchorIdForModel } from "./modelGuidance";
import { modeEstimateAnchorsForRouteStep } from "./toolModeCatalog";

type RouteCostBasis = {
  apiEquivalentCostUsd: number;
  billedCostUsd: number;
  energyWh: number;
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

/**
 * Prices each route two ways: what a metered API run of the same steps would cost, and what the
 * user is actually billed given the plans they already pay for.
 *
 * There is deliberately no baseline here. An earlier version compared every route against a
 * premium API anchor the user was never going to buy, which turned a $0 manual route into
 * "$1.125 saved". The routes a user can compare are the other routes on the same screen, so the
 * comparison belongs at the point of display, not baked into each stored option.
 */
export function attachRouteEconomics(
  options: RouteOption[],
  models: readonly ModelInventoryItem[],
  task?: TaskIntake,
): RouteOption[] {
  const modelById = new Map(models.map((model) => [model.id, model]));

  return options.map((option) =>
    attachEconomicsToOption(option, {
      apiEquivalentCostUsd: estimateRouteApiEquivalentCostUsd(option, modelById, task),
      billedCostUsd: estimateRouteCostUsd(option, modelById, task),
      energyWh: estimateRouteEnergyWh(option, modelById, task),
    }),
  );
}

/** What the route adds to the user's bill, given the accounts they already pay for. */
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

/**
 * What the same steps would cost if every one of them were metered per token at public API list
 * prices, including the steps a subscription covers. A monthly plan hides what one task consumes,
 * and this is the figure that makes that visible.
 */
export function estimateRouteApiEquivalentCostUsd(
  option: Pick<RouteOption, "steps">,
  modelById: ReadonlyMap<string, ModelInventoryItem>,
  _task?: TaskIntake,
): number {
  const total = option.steps.reduce((sum, step) => {
    return sum + estimateRouteStepApiEquivalentCostUsd(step, modelById);
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
  return stepCostUsd(step, modelById, billedPricingAnchorIdForStep);
}

export function estimateRouteStepApiEquivalentCostUsd(
  step: RouteStep,
  modelById: ReadonlyMap<string, ModelInventoryItem>,
): number {
  return stepCostUsd(step, modelById, apiEquivalentPricingAnchorIdForStep);
}

function stepCostUsd(
  step: RouteStep,
  modelById: ReadonlyMap<string, ModelInventoryItem>,
  resolvePricingAnchorId: (step: RouteStep, model: ModelInventoryItem) => string | null,
): number {
  if (!step.modelId) {
    return 0;
  }

  const model = modelById.get(step.modelId);
  if (!model) {
    return 0;
  }

  const pricingAnchorId = resolvePricingAnchorId(step, model);
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
  return {
    ...option,
    estimatedCostUsd: roundUsd(basis.billedCostUsd),
    apiEquivalentCostUsd: roundUsd(basis.apiEquivalentCostUsd),
    costEstimateBasis:
      "The per-token figure prices a 100k-token run of these steps (75k in, 25k out) against reviewed public API list prices, including steps a plan you already pay for would cover. The billed figure counts only what a metered account would add to your bill. Subscriptions, search add-ons, taxes, caching, free tiers, and provider limits change the real bill.",
    estimatedEnergyWh: roundWh(basis.energyWh),
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

function billedPricingAnchorIdForStep(step: RouteStep, model: ModelInventoryItem) {
  // A free tier or a flat monthly plan is already paid for; only a metered account adds to the
  // bill for this one task.
  if (!accountIsMeteredPerUse(model)) {
    return null;
  }

  return modeEstimateAnchorsForRouteStep(step, model).pricingAnchorId ?? apiEquivalentPricingAnchorIdForModel(model);
}

function apiEquivalentPricingAnchorIdForStep(step: RouteStep, model: ModelInventoryItem) {
  // Work done by hand, or by a model on the user's own machine, has no per-token price to quote.
  if (model.tier === "human" || model.localOnly) {
    return null;
  }

  return modeEstimateAnchorsForRouteStep(step, model).pricingAnchorId ?? apiEquivalentPricingAnchorIdForModel(model);
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
