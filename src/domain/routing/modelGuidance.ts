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

export function modelLabelWithMinimumForTask(model: ModelInventoryItem, task: TaskIntake): string {
  return appendTaskSurfaceLabel(modelLabelWithMinimum(model), model, task);
}

export function modelLabelForPromptDesign(model: ModelInventoryItem): string {
  if (model.tier === "human") {
    return model.label;
  }

  const guidance = modelUseGuidance(model);
  return `${model.label} (prompt builder ${guidance.promptBuilderModelLabel}; run later with ${guidance.executionModelLabel})`;
}

export function modelLabelForPromptDesignForTask(model: ModelInventoryItem, task: TaskIntake): string {
  return appendTaskSurfaceLabel(modelLabelForPromptDesign(model), model, task);
}

export function modelLabelForExecution(model: ModelInventoryItem): string {
  if (model.tier === "human") {
    return model.label;
  }

  const guidance = modelUseGuidance(model);
  return `${model.label} (execution ${guidance.executionModelLabel}; upgrade only to ${guidance.upgradeModelLabel})`;
}

export function modelLabelForExecutionForTask(model: ModelInventoryItem, task: TaskIntake): string {
  return appendTaskSurfaceLabel(modelLabelForExecution(model), model, task);
}

export function modelInstructionGuidance(model: ModelInventoryItem): string {
  const guidance = modelUseGuidance(model);

  if (model.tier === "human") {
    return "Use human review as the decision point.";
  }

  return `Minimum model/version: ${guidance.minimumModelLabel}. Prompt-building mode: ${guidance.promptBuilderModelLabel}. Execution mode: ${guidance.executionModelLabel}. Upgrade trigger: use ${guidance.upgradeModelLabel} if the checks find weak reasoning, missing facts, or too much rework.`;
}

export function modelInstructionGuidanceForTask(model: ModelInventoryItem, task: TaskIntake): string {
  const baseGuidance = modelInstructionGuidance(model);
  const surfaceNote = claudeCodeSubscriptionSurfaceNote(model, task);

  return surfaceNote ? `${baseGuidance} ${surfaceNote}` : baseGuidance;
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

function claudeCodeSubscriptionSurfaceNote(model: ModelInventoryItem, task: TaskIntake): string | null {
  if (!usesClaudeSubscriptionBuildSurface(model, task)) {
    return null;
  }

  return "Claude Code note: for coding or app-build execution, treat Claude Code as the build surface available through the saved Claude subscription when installed and authenticated; do not model it as a separate subscription or unrelated paid tool.";
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
