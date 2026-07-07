import {
  inferEverydayToolSelection,
  type EverydayToolAccountId,
  type EverydayToolProviderId,
} from "../defaults/everydayToolCatalog";
import type { ModelInventoryItem } from "../types";

export type ModelUseGuidance = {
  minimumModelLabel: string;
  upgradeModelLabel: string;
  pricingAnchorId: string | null;
};

export function modelUseGuidance(model: ModelInventoryItem): ModelUseGuidance {
  if (model.tier === "human") {
    return {
      minimumModelLabel: "human judgment",
      upgradeModelLabel: "a specialist or second reviewer",
      pricingAnchorId: null,
    };
  }

  if (model.localOnly) {
    return {
      minimumModelLabel: localMinimumModel(model),
      upgradeModelLabel: "a stronger local/private model if the first pass fails review",
      pricingAnchorId: null,
    };
  }

  const selection = inferEverydayToolSelection(model);
  return guidanceForProvider(selection.providerId, selection.accountId, model);
}

export function modelLabelWithMinimum(model: ModelInventoryItem): string {
  if (model.tier === "human") {
    return model.label;
  }

  return `${model.label} (minimum ${modelUseGuidance(model).minimumModelLabel})`;
}

export function modelInstructionGuidance(model: ModelInventoryItem): string {
  const guidance = modelUseGuidance(model);

  if (model.tier === "human") {
    return "Use human review as the decision point.";
  }

  return `Minimum model/version: ${guidance.minimumModelLabel}. Upgrade trigger: use ${guidance.upgradeModelLabel} if the checks find weak reasoning, missing facts, or too much rework.`;
}

export function pricingAnchorIdForModel(model: ModelInventoryItem): string | null {
  return modelUseGuidance(model).pricingAnchorId;
}

function guidanceForProvider(
  providerId: EverydayToolProviderId,
  accountId: EverydayToolAccountId,
  model: ModelInventoryItem,
): ModelUseGuidance {
  switch (providerId) {
    case "chatgpt":
      return chatGptGuidance(accountId);
    case "claude":
      return claudeGuidance(accountId);
    case "gemini":
      return geminiGuidance(accountId);
    case "perplexity":
      return perplexityGuidance(accountId);
    case "grok":
      return {
        minimumModelLabel: "Grok fast/default model",
        upgradeModelLabel: "Grok's strongest reasoning model",
        pricingAnchorId: "xai-grok-4-3",
      };
    case "mistral":
      return {
        minimumModelLabel: "Mistral Large or the smallest available Mistral model that passes review",
        upgradeModelLabel: "Mistral's strongest available model",
        pricingAnchorId: "mistral-large",
      };
    case "deepseek":
      return {
        minimumModelLabel: model.tier === "frontier" ? "DeepSeek V4 Pro" : "DeepSeek V4 Flash",
        upgradeModelLabel: "DeepSeek V4 Pro",
        pricingAnchorId: model.tier === "frontier" ? "deepseek-v4-pro-cache-miss" : "deepseek-v4-flash-cache-miss",
      };
    default:
      return genericProviderGuidance(model);
  }
}

function chatGptGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "pro" || accountId === "business" || accountId === "enterprise") {
    return {
      minimumModelLabel: "OpenAI gpt-5.5 equivalent",
      upgradeModelLabel: "OpenAI gpt-5.5-pro equivalent for hard reasoning",
      pricingAnchorId: "openai-gpt-5-5",
    };
  }

  return {
    minimumModelLabel: "OpenAI gpt-5.4-nano equivalent",
    upgradeModelLabel: "OpenAI gpt-5.5 equivalent when the first plan fails review",
    pricingAnchorId: "openai-gpt-5-4-nano",
  };
}

function claudeGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "max-5x" || accountId === "max-20x" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "Claude Sonnet 5 equivalent",
      upgradeModelLabel: "Claude Opus 4.8 equivalent for the highest-risk pass",
      pricingAnchorId: "anthropic-opus-4-8",
    };
  }

  if (accountId === "pro") {
    return {
      minimumModelLabel: "Claude Sonnet 5 equivalent",
      upgradeModelLabel: "Claude Opus 4.8 equivalent when quality checks fail",
      pricingAnchorId: "anthropic-sonnet-5",
    };
  }

  return {
    minimumModelLabel: "Claude Haiku 4.5 equivalent",
    upgradeModelLabel: "Claude Sonnet 5 equivalent",
    pricingAnchorId: "anthropic-haiku-4-5",
  };
}

function geminiGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "google-ai-pro" || accountId === "google-ai-ultra" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "Gemini 3.1 Pro equivalent",
      upgradeModelLabel: "the strongest available Gemini Pro/Ultra model",
      pricingAnchorId: "google-gemini-3-1-pro-preview",
    };
  }

  return {
    minimumModelLabel: "Gemini 3.1 Flash-Lite equivalent",
    upgradeModelLabel: "Gemini 3.1 Pro equivalent",
    pricingAnchorId: "google-gemini-3-1-flash-lite",
  };
}

function perplexityGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "pro" || accountId === "max" || accountId === "enterprise-pro" || accountId === "enterprise-max") {
    return {
      minimumModelLabel: "Perplexity Sonar Pro",
      upgradeModelLabel: "the highest available Perplexity research mode",
      pricingAnchorId: "perplexity-sonar-pro",
    };
  }

  return {
    minimumModelLabel: "Perplexity Sonar",
    upgradeModelLabel: "Perplexity Sonar Pro when citations or current facts are thin",
    pricingAnchorId: "perplexity-sonar",
  };
}

function genericProviderGuidance(model: ModelInventoryItem): ModelUseGuidance {
  if (model.tier === "frontier") {
    return {
      minimumModelLabel: "the strongest model included in this account",
      upgradeModelLabel: "human review or a specialist model",
      pricingAnchorId: "openai-gpt-5-5",
    };
  }

  if (model.tier === "research") {
    return {
      minimumModelLabel: "the default source-backed research model",
      upgradeModelLabel: "the paid or pro research mode",
      pricingAnchorId: "perplexity-sonar",
    };
  }

  if (model.tier === "small") {
    return {
      minimumModelLabel: "the fast/free model",
      upgradeModelLabel: "the paid everyday model",
      pricingAnchorId: "openai-gpt-5-4-nano",
    };
  }

  return {
    minimumModelLabel: "the everyday/default model",
    upgradeModelLabel: "the strongest available model for this provider",
    pricingAnchorId: "openai-gpt-5-4-nano",
  };
}

function localMinimumModel(model: ModelInventoryItem) {
  if (model.provider === "Local or private AI") {
    return "the smallest local model that can answer clearly";
  }

  return `${model.provider} local/default model`;
}
