import {
  getEverydayToolProvider,
  inferEverydayToolSelection,
  type EverydayToolAccountId,
  type EverydayToolProviderId,
} from "../defaults/everydayToolCatalog";
import type { ModelInventoryItem, TaskIntake } from "../types";
import {
  chatGptGuidanceLabels,
  claudeGuidanceLabels,
  geminiGuidanceLabels,
  grokGuidanceLabels,
  perplexityGuidanceLabels,
} from "./providerModeProfiles";
import { taskHasBuildIntent } from "./taskDecomposition";

type ModelUseGuidance = {
  minimumModelLabel: string;
  promptBuilderModelLabel: string;
  executionModelLabel: string;
  upgradeModelLabel: string;
  pricingAnchorId: string | null;
};

function modelUseGuidance(model: ModelInventoryItem): ModelUseGuidance {
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

function modelLabelForPromptDesign(model: ModelInventoryItem): string {
  if (model.tier === "human") {
    return model.label;
  }

  const guidance = modelUseGuidance(model);
  return `${model.label} (prompt builder ${guidance.promptBuilderModelLabel})`;
}

export function modelLabelForPromptDesignForTask(model: ModelInventoryItem, task: TaskIntake): string {
  return appendTaskSurfaceLabel(modelLabelForPromptDesign(model), model, task);
}

function modelLabelForExecution(model: ModelInventoryItem): string {
  if (model.tier === "human") {
    return model.label;
  }

  const guidance = modelUseGuidance(model);
  return `${model.label} (execution ${guidance.executionModelLabel}; upgrade only to ${guidance.upgradeModelLabel})`;
}

export function modelLabelForExecutionForTask(model: ModelInventoryItem, task: TaskIntake): string {
  return appendTaskSurfaceLabel(modelLabelForExecution(model), model, task);
}

/**
 * The anchor for "what would this work cost per token", whether or not a plan the user already
 * pays for covers it. `accountIsMeteredPerUse` below answers the different question of what the
 * user is actually billed. Human and local-only work has no per-token price under either.
 */
export function apiEquivalentPricingAnchorIdForModel(model: ModelInventoryItem): string | null {
  return modelUseGuidance(model).pricingAnchorId;
}

/**
 * True only for accounts billed per use. A flat-rate plan is already paid for, so one more task on
 * it adds nothing to the bill however much compute it consumes — which is exactly why the
 * per-token figure beside it is worth showing.
 *
 * Deliberately separate from the routing layer's `zeroMarginalCost`, which carries a scoring bonus
 * and covers only free tiers. Widening that would change which tools get recommended; this
 * predicate only changes what the user is told they will pay.
 */
export function accountIsMeteredPerUse(model: ModelInventoryItem): boolean {
  if (model.tier === "human" || model.localOnly) {
    return false;
  }

  const selection = inferEverydayToolSelection(model);
  if (selection.providerId === "none") {
    return false;
  }

  const provider = getEverydayToolProvider(selection.providerId);
  const accountOption = provider.accountOptions.find((option) => option.id === selection.accountId);

  return /\bapi\b|pay-as-you-go|recharged|credits/i.test(accountOption?.label ?? selection.accountId);
}

function appendTaskSurfaceLabel(label: string, model: ModelInventoryItem, task: TaskIntake): string {
  const surfaceLabel = claudeCodeSubscriptionSurfaceLabel(model, task);

  return surfaceLabel ? `${label}; ${surfaceLabel}` : label;
}

function claudeCodeSubscriptionSurfaceLabel(model: ModelInventoryItem, task: TaskIntake): string | null {
  if (!usesClaudeSubscriptionBuildSurface(model, task)) {
    return null;
  }

  return "Claude Code via this Claude subscription for build execution";
}

function usesClaudeSubscriptionBuildSurface(model: ModelInventoryItem, task: TaskIntake): boolean {
  if (model.tier === "human" || model.localOnly) {
    return false;
  }

  const selection = inferEverydayToolSelection(model);

  return selection.providerId === "claude" && isCodeOrBuildTask(task);
}

function isCodeOrBuildTask(task: TaskIntake): boolean {
  return task.knowledgeWorkType === "coding" || task.outputType === "code" || taskHasBuildIntent(task);
}

function guidanceForProvider(
  providerId: EverydayToolProviderId,
  accountId: EverydayToolAccountId,
  model: ModelInventoryItem,
): ModelUseGuidance {
  switch (providerId) {
    case "chatgpt":
      return {
        ...chatGptGuidanceLabels(accountId),
        pricingAnchorId:
          accountId === "pro" || accountId === "business" || accountId === "enterprise"
            ? "openai-premium-text-anchor"
            : "openai-low-cost-text-anchor",
      };
    case "claude":
      return {
        ...claudeGuidanceLabels(accountId),
        pricingAnchorId:
          accountId === "max-5x" || accountId === "max-20x" || accountId === "team" || accountId === "enterprise"
            ? "anthropic-frontier-text-anchor"
            : accountId === "pro"
              ? "anthropic-premium-text-anchor"
              : "anthropic-low-cost-text-anchor",
      };
    case "gemini":
      return {
        ...geminiGuidanceLabels(accountId),
        pricingAnchorId:
          accountId === "google-ai-pro" || accountId === "google-ai-ultra" || accountId === "team" || accountId === "enterprise"
            ? "google-premium-text-anchor"
            : "google-low-cost-text-anchor",
      };
    case "perplexity":
      return {
        ...perplexityGuidanceLabels(accountId),
        pricingAnchorId:
          accountId === "pro" || accountId === "max" || accountId === "enterprise-pro" || accountId === "enterprise-max"
            ? "perplexity-sonar-pro"
            : "perplexity-sonar",
      };
    case "grok":
      return {
        ...grokGuidanceLabels(accountId),
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
