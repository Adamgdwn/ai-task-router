export type PricingSourceId =
  | "openai-pricing-2026-07-05"
  | "anthropic-pricing-2026-07-05"
  | "google-gemini-pricing-2026-07-05"
  | "perplexity-pricing-2026-07-05"
  | "mistral-pricing-2026-07-05"
  | "deepseek-pricing-2026-07-05"
  | "xai-pricing-2026-07-05";

export type PricingSource = {
  id: PricingSourceId;
  label: string;
  url: string;
  reviewedAt: string;
};

export type ModelPricingAnchor = {
  id: string;
  provider: string;
  model: string;
  sourceId: PricingSourceId;
  inputUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
  cachedInputUsdPerMillionTokens?: number;
  notes: string;
};

export type TokenRun = {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
};

export type RightSizingScenario = {
  baselineModelId: string;
  routedModelId: string;
  tokenRun: TokenRun;
  taskCount: number;
  successfulRoutingRate: number;
  inducedExtraRuns?: Array<{
    modelId: string;
    tokenRun: TokenRun;
    count: number;
  }>;
};

export type RightSizingEstimate = {
  baselineCostUsd: number;
  routedCostUsd: number;
  grossAvoidedCostUsd: number;
  inducedExtraCostUsd: number;
  netAvoidedCostUsd: number;
};

export type EnergySourceId = "google-ai-impact-2026-07-05" | "how-hungry-is-ai-2026-07-05";

export type EnergyAnchor = {
  id: string;
  label: string;
  sourceId: EnergySourceId;
  wattHoursPerRun: number;
  notes: string;
};

export type EnergyScenario = {
  baselineEnergyAnchorId: string;
  routedEnergyAnchorId: string;
  taskCount: number;
  successfulRoutingRate: number;
  inducedExtraWattHours?: number;
};

export type AvoidedResourceEstimate = {
  grossAvoidedWattHours: number;
  inducedExtraWattHours: number;
  netAvoidedWattHours: number;
  directWaterMlRange: RangeEstimate;
  broaderOperationalWaterMlRange: RangeEstimate;
};

export type RangeEstimate = {
  low: number;
  high: number;
};

export const impactCatalogReviewedAt = "2026-07-05T08:52:38-06:00";

export const defaultHundredThousandTokenRun = {
  inputTokens: 75_000,
  outputTokens: 25_000,
} satisfies TokenRun;

export const pricingSources = [
  {
    id: "openai-pricing-2026-07-05",
    label: "OpenAI API pricing",
    url: "https://developers.openai.com/api/docs/pricing",
    reviewedAt: impactCatalogReviewedAt,
  },
  {
    id: "anthropic-pricing-2026-07-05",
    label: "Claude by Anthropic plans and API pricing",
    url: "https://claude.com/pricing",
    reviewedAt: impactCatalogReviewedAt,
  },
  {
    id: "google-gemini-pricing-2026-07-05",
    label: "Gemini Developer API pricing",
    url: "https://ai.google.dev/gemini-api/docs/pricing",
    reviewedAt: impactCatalogReviewedAt,
  },
  {
    id: "perplexity-pricing-2026-07-05",
    label: "Perplexity API pricing",
    url: "https://docs.perplexity.ai/docs/getting-started/pricing",
    reviewedAt: impactCatalogReviewedAt,
  },
  {
    id: "mistral-pricing-2026-07-05",
    label: "Mistral AI pricing",
    url: "https://mistral.ai/pricing/",
    reviewedAt: impactCatalogReviewedAt,
  },
  {
    id: "deepseek-pricing-2026-07-05",
    label: "DeepSeek API pricing",
    url: "https://api-docs.deepseek.com/quick_start/pricing",
    reviewedAt: impactCatalogReviewedAt,
  },
  {
    id: "xai-pricing-2026-07-05",
    label: "xAI models and pricing",
    url: "https://docs.x.ai/developers/models",
    reviewedAt: impactCatalogReviewedAt,
  },
] satisfies PricingSource[];

export const modelPricingAnchors = [
  anchor("openai-gpt-5-4-nano", "OpenAI", "gpt-5.4-nano", "openai-pricing-2026-07-05", 0.2, 1.25, 0.02),
  anchor("openai-gpt-5-5", "OpenAI", "gpt-5.5", "openai-pricing-2026-07-05", 5, 30, 0.5),
  anchor("openai-gpt-5-5-pro", "OpenAI", "gpt-5.5-pro", "openai-pricing-2026-07-05", 30, 180),
  anchor("anthropic-haiku-4-5", "Anthropic", "Haiku 4.5", "anthropic-pricing-2026-07-05", 1, 5, 0.1),
  anchor("anthropic-sonnet-5", "Anthropic", "Sonnet 5", "anthropic-pricing-2026-07-05", 2, 10, 0.2),
  anchor("anthropic-opus-4-8", "Anthropic", "Opus 4.8", "anthropic-pricing-2026-07-05", 5, 25, 0.5),
  anchor("anthropic-fable-5", "Anthropic", "Fable 5", "anthropic-pricing-2026-07-05", 10, 50, 1),
  anchor("google-gemini-3-1-flash-lite", "Google", "Gemini 3.1 Flash-Lite", "google-gemini-pricing-2026-07-05", 0.25, 1.5, 0.025),
  anchor("google-gemini-3-1-pro-preview", "Google", "Gemini 3.1 Pro Preview", "google-gemini-pricing-2026-07-05", 2, 12, 0.2),
  anchor("perplexity-sonar", "Perplexity", "Sonar", "perplexity-pricing-2026-07-05", 1, 1),
  anchor("perplexity-sonar-pro", "Perplexity", "Sonar Pro", "perplexity-pricing-2026-07-05", 3, 15),
  anchor("xai-grok-build-0-1", "xAI", "Grok Build 0.1", "xai-pricing-2026-07-05", 1, 2),
  anchor("xai-grok-4-3", "xAI", "Grok 4.3", "xai-pricing-2026-07-05", 1.25, 2.5),
  anchor("mistral-large", "Mistral AI", "Mistral Large", "mistral-pricing-2026-07-05", 2, 6),
  anchor("deepseek-v4-flash-cache-miss", "DeepSeek", "DeepSeek V4 Flash", "deepseek-pricing-2026-07-05", 0.14, 0.28, 0.0028),
  anchor("deepseek-v4-pro-cache-miss", "DeepSeek", "DeepSeek V4 Pro", "deepseek-pricing-2026-07-05", 0.435, 0.87, 0.003625),
] satisfies ModelPricingAnchor[];

export const energyAnchors = [
  {
    id: "google-median-gemini-apps-text-prompt",
    label: "Median Gemini Apps text prompt",
    sourceId: "google-ai-impact-2026-07-05",
    wattHoursPerRun: 0.24,
    notes: "Provider-stated comprehensive median Gemini Apps text-prompt estimate.",
  },
  {
    id: "gpt-4o-medium-estimate",
    label: "GPT-4o medium text estimate",
    sourceId: "how-hungry-is-ai-2026-07-05",
    wattHoursPerRun: 1.214,
    notes: "Infrastructure-aware estimate from Jegham et al.; not provider telemetry.",
  },
  {
    id: "o3-medium-estimate",
    label: "o3 medium reasoning estimate",
    sourceId: "how-hungry-is-ai-2026-07-05",
    wattHoursPerRun: 21.414,
    notes: "Infrastructure-aware estimate from Jegham et al.; useful for reasoning-workload scenarios.",
  },
  {
    id: "o3-long-estimate",
    label: "o3 long reasoning estimate",
    sourceId: "how-hungry-is-ai-2026-07-05",
    wattHoursPerRun: 39.223,
    notes: "Infrastructure-aware estimate from Jegham et al.; use for high-intensity reasoning scenarios.",
  },
] satisfies EnergyAnchor[];

const directWaterMlPerWh = { low: 0.27, high: 1.1 } satisfies RangeEstimate;
const broaderOperationalWaterMlPerWh = { low: 3, high: 4.5 } satisfies RangeEstimate;

export function estimateTokenRunCostUsd(pricing: ModelPricingAnchor, tokenRun: TokenRun): number {
  validateTokenRun(tokenRun);

  const cachedInputTokens = tokenRun.cachedInputTokens ?? 0;
  const uncachedInputTokens = tokenRun.inputTokens - cachedInputTokens;

  if (uncachedInputTokens < 0) {
    throw new Error("Cached input tokens cannot exceed total input tokens.");
  }

  const inputCost = priceTokens(uncachedInputTokens, pricing.inputUsdPerMillionTokens);
  const cachedInputCost = priceTokens(cachedInputTokens, pricing.cachedInputUsdPerMillionTokens ?? pricing.inputUsdPerMillionTokens);
  const outputCost = priceTokens(tokenRun.outputTokens, pricing.outputUsdPerMillionTokens);

  return inputCost + cachedInputCost + outputCost;
}

export function estimateHundredThousandTokenCostUsd(
  pricing: ModelPricingAnchor,
  tokenRun: TokenRun = defaultHundredThousandTokenRun,
): number {
  return estimateTokenRunCostUsd(pricing, tokenRun);
}

export function estimateRightSizingCostSavings(scenario: RightSizingScenario): RightSizingEstimate {
  validateScenarioCounts(scenario.taskCount, scenario.successfulRoutingRate);

  const baselinePricing = requirePricingAnchor(scenario.baselineModelId);
  const routedPricing = requirePricingAnchor(scenario.routedModelId);
  const baselineCostPerRun = estimateTokenRunCostUsd(baselinePricing, scenario.tokenRun);
  const routedCostPerRun = estimateTokenRunCostUsd(routedPricing, scenario.tokenRun);
  const grossAvoidedCostUsd = Math.max(0, baselineCostPerRun - routedCostPerRun) * scenario.taskCount * scenario.successfulRoutingRate;
  const inducedExtraCostUsd =
    scenario.inducedExtraRuns?.reduce((total, extraRun) => {
      const pricing = requirePricingAnchor(extraRun.modelId);
      return total + estimateTokenRunCostUsd(pricing, extraRun.tokenRun) * extraRun.count;
    }, 0) ?? 0;

  return {
    baselineCostUsd: baselineCostPerRun * scenario.taskCount,
    routedCostUsd: routedCostPerRun * scenario.taskCount,
    grossAvoidedCostUsd,
    inducedExtraCostUsd,
    netAvoidedCostUsd: grossAvoidedCostUsd - inducedExtraCostUsd,
  };
}

export function estimateAvoidedResourceUse(scenario: EnergyScenario): AvoidedResourceEstimate {
  validateScenarioCounts(scenario.taskCount, scenario.successfulRoutingRate);

  const baselineEnergy = requireEnergyAnchor(scenario.baselineEnergyAnchorId);
  const routedEnergy = requireEnergyAnchor(scenario.routedEnergyAnchorId);
  const grossAvoidedWattHours =
    Math.max(0, baselineEnergy.wattHoursPerRun - routedEnergy.wattHoursPerRun) *
    scenario.taskCount *
    scenario.successfulRoutingRate;
  const inducedExtraWattHours = scenario.inducedExtraWattHours ?? 0;
  const netAvoidedWattHours = grossAvoidedWattHours - inducedExtraWattHours;

  return {
    grossAvoidedWattHours,
    inducedExtraWattHours,
    netAvoidedWattHours,
    directWaterMlRange: multiplyRange(netAvoidedWattHours, directWaterMlPerWh),
    broaderOperationalWaterMlRange: multiplyRange(netAvoidedWattHours, broaderOperationalWaterMlPerWh),
  };
}

export function requirePricingAnchor(id: string): ModelPricingAnchor {
  const pricing = modelPricingAnchors.find((anchorCandidate) => anchorCandidate.id === id);

  if (!pricing) {
    throw new Error(`Unknown model pricing anchor: ${id}`);
  }

  return pricing;
}

export function requireEnergyAnchor(id: string): EnergyAnchor {
  const energyAnchor = energyAnchors.find((anchorCandidate) => anchorCandidate.id === id);

  if (!energyAnchor) {
    throw new Error(`Unknown energy anchor: ${id}`);
  }

  return energyAnchor;
}

function anchor(
  id: string,
  provider: string,
  model: string,
  sourceId: PricingSourceId,
  inputUsdPerMillionTokens: number,
  outputUsdPerMillionTokens: number,
  cachedInputUsdPerMillionTokens?: number,
): ModelPricingAnchor {
  return {
    id,
    provider,
    model,
    sourceId,
    inputUsdPerMillionTokens,
    outputUsdPerMillionTokens,
    cachedInputUsdPerMillionTokens,
    notes: "API pricing anchor for scenario estimates. Consumer subscriptions, regional uplifts, add-on tools, taxes, free tiers, and rate limits may differ.",
  };
}

function priceTokens(tokens: number, usdPerMillionTokens: number): number {
  return (tokens / 1_000_000) * usdPerMillionTokens;
}

function multiplyRange(value: number, range: RangeEstimate): RangeEstimate {
  return {
    low: value * range.low,
    high: value * range.high,
  };
}

function validateTokenRun(tokenRun: TokenRun): void {
  if (tokenRun.inputTokens < 0 || tokenRun.outputTokens < 0 || (tokenRun.cachedInputTokens ?? 0) < 0) {
    throw new Error("Token counts must be non-negative.");
  }
}

function validateScenarioCounts(taskCount: number, successfulRoutingRate: number): void {
  if (!Number.isFinite(taskCount) || taskCount < 0) {
    throw new Error("Task count must be a non-negative number.");
  }

  if (!Number.isFinite(successfulRoutingRate) || successfulRoutingRate < 0 || successfulRoutingRate > 1) {
    throw new Error("Successful routing rate must be between 0 and 1.");
  }
}
