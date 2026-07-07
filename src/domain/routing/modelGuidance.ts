import {
  getEverydayToolProvider,
  inferEverydayToolSelection,
  type EverydayToolAccountId,
  type EverydayToolProviderId,
} from "../defaults/everydayToolCatalog";
import type { ModelInventoryItem } from "../types";

export type ModelUseGuidance = {
  minimumModelLabel: string;
  promptBuilderModelLabel: string;
  executionModelLabel: string;
  upgradeModelLabel: string;
  pricingAnchorId: string | null;
};

export function modelUseGuidance(model: ModelInventoryItem): ModelUseGuidance {
  if (model.tier === "human") {
    return {
      minimumModelLabel: "human judgment",
      promptBuilderModelLabel: "human judgment before any helper is used",
      executionModelLabel: "manual execution or a reviewed specialist handoff",
      upgradeModelLabel: "a specialist or second reviewer",
      pricingAnchorId: null,
    };
  }

  if (model.localOnly) {
    return {
      minimumModelLabel: localMinimumModel(model),
      promptBuilderModelLabel: localMinimumModel(model),
      executionModelLabel: "the smallest local model that passes the review checks",
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

export function modelLabelForPromptDesign(model: ModelInventoryItem): string {
  if (model.tier === "human") {
    return model.label;
  }

  const guidance = modelUseGuidance(model);
  return `${model.label} (minimum ${guidance.minimumModelLabel}; prompt builder ${guidance.promptBuilderModelLabel})`;
}

export function modelLabelForExecution(model: ModelInventoryItem): string {
  if (model.tier === "human") {
    return model.label;
  }

  const guidance = modelUseGuidance(model);
  return `${model.label} (execution ${guidance.executionModelLabel}; upgrade ${guidance.upgradeModelLabel})`;
}

export function modelInstructionGuidance(model: ModelInventoryItem): string {
  const guidance = modelUseGuidance(model);

  if (model.tier === "human") {
    return "Use human review as the decision point.";
  }

  return `Minimum model/version: ${guidance.minimumModelLabel}. Prompt-building mode: ${guidance.promptBuilderModelLabel}. Execution mode: ${guidance.executionModelLabel}. Upgrade trigger: use ${guidance.upgradeModelLabel} if the checks find weak reasoning, missing facts, or too much rework.`;
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
        promptBuilderModelLabel: "the strongest Grok reasoning mode available in this account when the prompt is the hard part",
        executionModelLabel: "the fast/default Grok mode after the master prompt is clear",
        upgradeModelLabel: "the strongest Grok reasoning mode available in this account",
        pricingAnchorId: "xai-premium-text-anchor",
      };
    case "mistral":
      return {
        minimumModelLabel: "the smallest available Mistral model that passes review",
        promptBuilderModelLabel: "the strongest available Mistral reasoning mode when the prompt is the hard part",
        executionModelLabel: "the smallest available Mistral model that can follow the finished prompt",
        upgradeModelLabel: "the strongest available Mistral model",
        pricingAnchorId: "mistral-large",
      };
    case "deepseek":
      return {
        minimumModelLabel:
          model.tier === "frontier"
            ? "the stronger DeepSeek reasoning/API model available in this account"
            : "the fast/default DeepSeek model available in this account",
        promptBuilderModelLabel:
          model.tier === "frontier"
            ? "the stronger DeepSeek reasoning/API model available in this account"
            : "the fast/default DeepSeek model with an upgrade trigger",
        executionModelLabel: "the fast/default DeepSeek model once the prompt is clear",
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
      minimumModelLabel: "GPT-5.5 Instant or the account's current Instant mode",
      promptBuilderModelLabel: "GPT-5.5 Thinking High/Extra High or Pro mode for the master prompt when stakes justify it",
      executionModelLabel: "GPT-5.5 Instant after the master prompt is clear",
      upgradeModelLabel: "ChatGPT's highest reasoning or Pro mode available in this account",
      pricingAnchorId: "openai-premium-text-anchor",
    };
  }

  if (accountId === "plus" || accountId === "go") {
    return {
      minimumModelLabel: "GPT-5.5 Instant",
      promptBuilderModelLabel: "GPT-5.5 Instant first; switch on Thinking Medium only if the master prompt fails review",
      executionModelLabel: "GPT-5.5 Instant, or the mini fallback when limits require it, once the prompt is clear",
      upgradeModelLabel: "GPT-5.5 Thinking Medium/High when the first plan fails review",
      pricingAnchorId: "openai-low-cost-text-anchor",
    };
  }

  return {
    minimumModelLabel: "GPT-5.5 when available in the Free account",
    promptBuilderModelLabel: "the current Free ChatGPT model; keep the prompt small and upgrade if it cannot follow the brief",
    executionModelLabel: "the current Free ChatGPT model or mini fallback after the prompt is clear",
    upgradeModelLabel: "a paid ChatGPT reasoning mode when the first plan fails review",
    pricingAnchorId: "openai-low-cost-text-anchor",
  };
}

function claudeGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "max-5x" || accountId === "max-20x" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "the strongest everyday Claude model included in this account",
      promptBuilderModelLabel: "Claude's strongest everyday reasoning mode when the prompt is the hard part",
      executionModelLabel: "Claude's fast/default mode after the master prompt is clear",
      upgradeModelLabel: "Claude's strongest available model for the highest-risk pass",
      pricingAnchorId: "anthropic-frontier-text-anchor",
    };
  }

  if (accountId === "pro") {
    return {
      minimumModelLabel: "the default paid Claude model included in Pro",
      promptBuilderModelLabel: "the default paid Claude model for the master prompt",
      executionModelLabel: "Claude's fast/default mode after the master prompt is clear",
      upgradeModelLabel: "Claude's strongest available model when quality checks fail",
      pricingAnchorId: "anthropic-premium-text-anchor",
    };
  }

  return {
    minimumModelLabel: "the fast/default Claude model included in this account",
    promptBuilderModelLabel: "the fast/default Claude model with a clear review trigger",
    executionModelLabel: "the fast/default Claude model after the prompt is clear",
    upgradeModelLabel: "the default paid Claude model or strongest available Claude model",
    pricingAnchorId: "anthropic-low-cost-text-anchor",
  };
}

function geminiGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "google-ai-pro" || accountId === "google-ai-ultra" || accountId === "team" || accountId === "enterprise") {
    return {
      minimumModelLabel: "the default paid Gemini model included in this account",
      promptBuilderModelLabel: "the default paid Gemini model for the master prompt",
      executionModelLabel: "Gemini Flash/fast mode after the master prompt is clear",
      upgradeModelLabel: "the strongest available Gemini Pro/Ultra model",
      pricingAnchorId: "google-premium-text-anchor",
    };
  }

  return {
    minimumModelLabel: "the fast/default Gemini model included in this account",
    promptBuilderModelLabel: "the fast/default Gemini model with a clear review trigger",
    executionModelLabel: "Gemini Flash/fast mode after the prompt is clear",
    upgradeModelLabel: "the default paid Gemini model",
    pricingAnchorId: "google-low-cost-text-anchor",
  };
}

function perplexityGuidance(accountId: EverydayToolAccountId): ModelUseGuidance {
  if (accountId === "pro" || accountId === "max" || accountId === "enterprise-pro" || accountId === "enterprise-max") {
    return {
      minimumModelLabel: "Perplexity Sonar Pro",
      promptBuilderModelLabel: "Perplexity Sonar Pro for source-backed framing, not final app execution",
      executionModelLabel: "Perplexity Sonar Pro only for evidence checks; use a general model to execute builds",
      upgradeModelLabel: "the highest available Perplexity research mode",
      pricingAnchorId: "perplexity-sonar-pro",
    };
  }

  return {
    minimumModelLabel: "Perplexity Sonar",
    promptBuilderModelLabel: "Perplexity Sonar for current-facts framing, not final app execution",
    executionModelLabel: "Perplexity Sonar only for evidence checks; use a general model to execute builds",
    upgradeModelLabel: "Perplexity Sonar Pro when citations or current facts are thin",
    pricingAnchorId: "perplexity-sonar",
  };
}

function genericProviderGuidance(model: ModelInventoryItem): ModelUseGuidance {
  if (model.tier === "frontier") {
    return {
      minimumModelLabel: "the strongest model included in this account",
      promptBuilderModelLabel: "the strongest reasoning mode included in this account",
      executionModelLabel: "the fast/default mode after the master prompt is clear",
      upgradeModelLabel: "human review or a specialist model",
      pricingAnchorId: "openai-premium-text-anchor",
    };
  }

  if (model.tier === "research") {
    return {
      minimumModelLabel: "the default source-backed research model",
      promptBuilderModelLabel: "the source-backed research model for evidence framing",
      executionModelLabel: "the source-backed research model only for evidence checks",
      upgradeModelLabel: "the paid or pro research mode",
      pricingAnchorId: "perplexity-sonar",
    };
  }

  if (model.tier === "small") {
    return {
      minimumModelLabel: "the fast/free model",
      promptBuilderModelLabel: "the fast/free model with a clear upgrade trigger",
      executionModelLabel: "the fast/free model after the prompt is clear",
      upgradeModelLabel: "the paid everyday model",
      pricingAnchorId: "openai-low-cost-text-anchor",
    };
  }

  return {
    minimumModelLabel: "the everyday/default model",
    promptBuilderModelLabel: "the everyday/default model for the master prompt",
    executionModelLabel: "the fastest adequate mode after the prompt is clear",
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
