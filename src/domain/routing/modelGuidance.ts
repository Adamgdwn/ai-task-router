import {
  getEverydayToolProvider,
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
  if (hasZeroMarginalCostAccount(model)) {
    return null;
  }

  return modelUseGuidance(model).pricingAnchorId;
}

function hasZeroMarginalCostAccount(model: ModelInventoryItem) {
  if (model.localOnly || model.tier === "human") {
    return false;
  }

  const selection = inferEverydayToolSelection(model);
  if (selection.providerId === "none") {
    return false;
  }

  const provider = getEverydayToolProvider(selection.providerId);
  const accountOption = provider.accountOptions.find((option) => option.id === selection.accountId);
  const accountLabel = accountOption?.label ?? selection.accountId;

  return selection.accountId === "basic" || /\bfree\b|\bbasic\b/i.test(accountLabel);
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
        minimumModelLabel: "the fast/default Grok mode included in this account",
        upgradeModelLabel: "the strongest Grok reasoning mode available in this account",
        pricingAnchorId: "xai-premium-text-anchor",
      };
    case "mistral":
      return {
        minimumModelLabel: "the smallest available Mistral model that passes review",
        upgradeModelLabel: "the strongest available Mistral model",
        pricingAnchorId: "mistral-large",
      };
    case "deepseek":
      return {
        minimumModelLabel:
          model.tier === "frontier"
            ? "the stronger DeepSeek reasoning/API model available in this account"
            : "the fast/default DeepSeek model available in this account",
        upgradeModelLabel: "the stronger DeepSeek reasoning/API model available in this account",
        pricingAnchorId: model.tier === "frontier" ? "deepseek-premium-text-anchor" : "deepseek-low-cost-text-anchor",
      };
    default:
      return genericProviderGuidance(model);
  }
}

function chatGptGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "pro" || accountId === "business" || accountId === "enterprise") {
    return {
      minimumModelLabel: "the strongest general ChatGPT model included in this account",
      upgradeModelLabel: "ChatGPT's highest reasoning mode available in this account",
      pricingAnchorId: "openai-premium-text-anchor",
    };
  }

  if (accountId === "plus") {
    return {
      minimumModelLabel: "the default paid ChatGPT model included in Plus",
      upgradeModelLabel: "a stronger ChatGPT reasoning mode when the first plan fails review",
      pricingAnchorId: "openai-low-cost-text-anchor",
    };
  }

  return {
    minimumModelLabel: "the fast/default ChatGPT model included in this account",
    upgradeModelLabel: "a stronger ChatGPT plan or reasoning mode when the first plan fails review",
    pricingAnchorId: "openai-low-cost-text-anchor",
  };
}

function claudeGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "max-5x" || accountId === "max-20x" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "the strongest everyday Claude model included in this account",
      upgradeModelLabel: "Claude's strongest available model for the highest-risk pass",
      pricingAnchorId: "anthropic-frontier-text-anchor",
    };
  }

  if (accountId === "pro") {
    return {
      minimumModelLabel: "the default paid Claude model included in Pro",
      upgradeModelLabel: "Claude's strongest available model when quality checks fail",
      pricingAnchorId: "anthropic-premium-text-anchor",
    };
  }

  return {
    minimumModelLabel: "the fast/default Claude model included in this account",
    upgradeModelLabel: "the default paid Claude model or strongest available Claude model",
    pricingAnchorId: "anthropic-low-cost-text-anchor",
  };
}

function geminiGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "google-ai-pro" || accountId === "google-ai-ultra" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "the default paid Gemini model included in this account",
      upgradeModelLabel: "the strongest available Gemini Pro/Ultra model",
      pricingAnchorId: "google-premium-text-anchor",
    };
  }

  return {
    minimumModelLabel: "the fast/default Gemini model included in this account",
    upgradeModelLabel: "the default paid Gemini model",
    pricingAnchorId: "google-low-cost-text-anchor",
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
      pricingAnchorId: "openai-premium-text-anchor",
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
      pricingAnchorId: "openai-low-cost-text-anchor",
    };
  }

  return {
    minimumModelLabel: "the everyday/default model",
    upgradeModelLabel: "the strongest available model for this provider",
    pricingAnchorId: "openai-low-cost-text-anchor",
  };
}

function localMinimumModel(model: ModelInventoryItem) {
  if (model.provider === "Local or private AI") {
    return "the smallest local model that can answer clearly";
  }

  return `${model.provider} local/default model`;
}
