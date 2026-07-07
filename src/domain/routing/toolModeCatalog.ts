import {
  getEverydayToolProvider,
  inferEverydayToolSelection,
  type EverydayToolAccountId,
  type EverydayToolProviderId,
} from "../defaults/everydayToolCatalog";
import type { CapabilityScores, ModelInventoryItem, PermissionLevel, RouteStep, TaskIntake, WorkRole } from "../types";
import { pricingAnchorIdForModel } from "./modelGuidance";
import { taskHasBuildIntent, taskNeedsFullBuildPlan } from "./taskDecomposition";

export type ToolModeKind = "manual" | "research" | "prompt" | "execution" | "build" | "artifact" | "review" | "benchmark";
export type ToolModeResourceProfile = "manual" | "free" | "light" | "standard" | "reasoning" | "premium";
export type ToolModeEnergyProfile = "none" | "low" | "medium" | "high" | "reasoning";

export type ToolModeCandidate = {
  id: string;
  modelId: string;
  providerId: EverydayToolProviderId;
  accountId: EverydayToolAccountId;
  providerLabel: string;
  accountLabel: string;
  modeKind: ToolModeKind;
  modeLabel: string;
  displayLabel: string;
  roles: WorkRole[];
  capabilityScores: CapabilityScores;
  maxPermissionLevel: PermissionLevel;
  localOnly: boolean;
  requiresExternalCall: boolean;
  zeroMarginalCost: boolean;
  pricingAnchorId: string | null;
  energyAnchorId: string | null;
  energyProfile: ToolModeEnergyProfile;
  resourceProfile: ToolModeResourceProfile;
  catalogReviewedAt: string;
  sourceIds: string[];
  selectionReasons: string[];
};

export type SelectToolModeInput = {
  task: TaskIntake;
  modes: readonly ToolModeCandidate[];
  role: WorkRole;
  strategy: "lean" | "balanced" | "premium";
};

export const toolModeCatalogReviewedAt = "2026-07-06T22:57:59-06:00";

const officialSourceIdsByProvider: Partial<Record<EverydayToolProviderId, string[]>> = {
  chatgpt: ["openai-chatgpt-model-picker", "openai-chatgpt-go"],
  claude: ["anthropic-claude-plans", "anthropic-claude-code-subscription"],
  perplexity: ["perplexity-sonar-models", "perplexity-api-pricing"],
  gemini: ["google-gemini-models", "google-gemini-pricing"],
};

const manualCapabilities = {
  reasoning: 3,
  writing: 3,
  coding: 2,
  research: 2,
  packaging: 2,
} satisfies CapabilityScores;

const resourceRanks: Record<ToolModeResourceProfile, number> = {
  manual: 0,
  free: 1,
  light: 2,
  standard: 3,
  reasoning: 4,
  premium: 5,
};

export function buildToolModeCatalog(models: readonly ModelInventoryItem[], task: TaskIntake): ToolModeCandidate[] {
  return models.filter((model) => model.enabled).flatMap((model) => modesForModel(model, task));
}

export function selectToolModeForRole({ task, modes, role, strategy }: SelectToolModeInput): ToolModeCandidate | null {
  const eligibleModes = modes.filter((mode) => mode.roles.includes(role));

  if (eligibleModes.length === 0) {
    return null;
  }

  if (strategy === "lean" && (role === "prompt-design" || role === "execution" || role === "build-slice")) {
    return selectLeastResourceAdequateMode(eligibleModes, role, task);
  }

  if (
    strategy === "balanced" &&
    role === "prompt-design" &&
    !taskNeedsFullBuildPlan(task) &&
    (task.qualityBar === "quick" || task.qualityBar === "standard")
  ) {
    const everydayPromptModes = eligibleModes.filter(
      (mode) =>
        mode.modeKind === "prompt" &&
        (mode.resourceProfile === "free" || mode.resourceProfile === "light" || mode.resourceProfile === "standard"),
    );

    if (everydayPromptModes.length > 0) {
      return [...everydayPromptModes].sort((left, right) => modeScore(right, role, strategy, task) - modeScore(left, role, strategy, task))[0] ?? everydayPromptModes[0] ?? null;
    }
  }

  if (role === "build-slice") {
    const buildModes = eligibleModes.filter((mode) => mode.modeKind === "build");
    if (buildModes.length > 0) {
      return [...buildModes].sort((left, right) => modeScore(right, role, strategy, task) - modeScore(left, role, strategy, task))[0] ?? buildModes[0] ?? null;
    }
  }

  return [...eligibleModes].sort((left, right) => modeScore(right, role, strategy, task) - modeScore(left, role, strategy, task))[0] ?? null;
}

export function modeForRouteStep(
  step: Pick<RouteStep, "modeId" | "modelId" | "workRole">,
  models: readonly ModelInventoryItem[],
  task: TaskIntake,
): ToolModeCandidate | null {
  if (!step.modeId) {
    return null;
  }

  return buildToolModeCatalog(models, task).find((mode) => mode.id === step.modeId) ?? null;
}

export function modeEstimateAnchorsForRouteStep(
  step: Pick<RouteStep, "modeId" | "modelId" | "workRole">,
  model: ModelInventoryItem,
): Pick<ToolModeCandidate, "pricingAnchorId" | "energyAnchorId" | "energyProfile" | "zeroMarginalCost"> {
  const selection = inferEverydayToolSelection(model);
  const providerId = selection.providerId;
  const accountId = selection.accountId;
  const modeId = step.modeId ?? "";
  const zeroMarginalCost = hasZeroMarginalCostAccount(providerId, accountId, model);

  if (model.tier === "human" || model.localOnly) {
    return {
      pricingAnchorId: null,
      energyAnchorId: null,
      energyProfile: "none",
      zeroMarginalCost,
    };
  }

  return {
    pricingAnchorId: zeroMarginalCost ? null : pricingAnchorForProviderMode(providerId, accountId, modeId, model),
    energyAnchorId: energyAnchorForMode(providerId, modeId, model),
    energyProfile: energyProfileForMode(modeId, model),
    zeroMarginalCost,
  };
}

function modesForModel(model: ModelInventoryItem, task: TaskIntake): ToolModeCandidate[] {
  if (model.tier === "human") {
    return [manualMode(model)];
  }

  const selection = inferEverydayToolSelection(model);
  const provider = getEverydayToolProvider(selection.providerId);
  const account = provider.accountOptions.find((option) => option.id === selection.accountId) ?? provider.accountOptions[0];
  const providerId = provider.id;
  const accountId = account?.id ?? selection.accountId;
  const accountLabel = account?.label ?? selection.accountId;

  switch (providerId) {
    case "chatgpt":
      return chatGptModes(model, accountId, accountLabel);
    case "claude":
      return claudeModes(model, accountId, accountLabel, task);
    case "perplexity":
      return perplexityModes(model, accountId, accountLabel);
    case "gemini":
      return geminiModes(model, accountId, accountLabel);
    default:
      return genericModes(model, providerId, accountId, accountLabel, task);
  }
}

function manualMode(model: ModelInventoryItem): ToolModeCandidate {
  return mode({
    model,
    providerId: "none",
    accountId: "manual",
    accountLabel: "Human review",
    kind: "manual",
    suffix: "manual",
    modeLabel: "human judgment",
    roles: ["prompt-design", "execution", "build-slice", "quality-review", "next-action"],
    capabilityScores: manualCapabilities,
    resourceProfile: "manual",
    energyProfile: "none",
    pricingAnchorId: null,
    energyAnchorId: null,
    selectionReasons: ["No provider call is required; this is the safest route when privacy or setup blocks AI use."],
  });
}

function chatGptModes(model: ModelInventoryItem, accountId: EverydayToolAccountId, accountLabel: string): ToolModeCandidate[] {
  const paidReasoning = accountId === "pro" || accountId === "business" || accountId === "enterprise";
  const goOrPlus = accountId === "go" || accountId === "plus";
  const promptLabel = paidReasoning
    ? "highest reasoning or Pro mode for the master prompt"
    : goOrPlus
      ? "strongest reasoning mode included in this account for the master prompt"
      : "strongest Free ChatGPT mode available for the master prompt";
  const executionLabel =
    accountId === "basic"
      ? "current Free ChatGPT model or mini fallback after the prompt is clear"
      : "GPT-5.5 Instant or the fastest adequate lower-cost GPT-5.x/mini mode after the prompt is clear";

  return [
    mode({
      model,
      providerId: "chatgpt",
      accountId,
      accountLabel,
      kind: "prompt",
      suffix: "prompt-reasoning",
      modeLabel: promptLabel,
      roles: ["prompt-design", "quality-review"],
      resourceProfile: paidReasoning ? "reasoning" : "standard",
      energyProfile: paidReasoning ? "reasoning" : "medium",
      pricingAnchorId: paidReasoning ? "openai-premium-text-anchor" : "openai-low-cost-text-anchor",
      energyAnchorId: paidReasoning ? "o3-medium-estimate" : "gpt-4o-medium-estimate",
      selectionReasons: [
        "Use the stronger thinking pass once to make the downstream prompt precise enough for cheaper execution.",
        "OpenAI's ChatGPT picker uses simplified speed/reasoning modes, so the app labels the role instead of pretending a fixed submodel menu.",
      ],
    }),
    mode({
      model,
      providerId: "chatgpt",
      accountId,
      accountLabel,
      kind: "execution",
      suffix: "execution-fast",
      modeLabel: executionLabel,
      roles: ["execution", "build-slice"],
      resourceProfile: accountId === "basic" ? "free" : "light",
      energyProfile: "low",
      pricingAnchorId: "openai-low-cost-text-anchor",
      energyAnchorId: "google-median-gemini-apps-text-prompt",
      selectionReasons: [
        "After the master prompt is clear, execution should start on the fastest adequate lower-resource mode.",
      ],
    }),
    mode({
      model,
      providerId: "chatgpt",
      accountId,
      accountLabel,
      kind: "benchmark",
      suffix: "premium-benchmark",
      modeLabel: "premium comparison using the highest ChatGPT reasoning mode available to this account",
      roles: ["prompt-design", "execution", "build-slice", "quality-review"],
      resourceProfile: "premium",
      energyProfile: "reasoning",
      pricingAnchorId: paidReasoning ? "openai-frontier-reasoning-anchor" : "openai-premium-text-anchor",
      energyAnchorId: "o3-medium-estimate",
      selectionReasons: ["This shows the cost and energy benchmark for using high reasoning through the whole task."],
    }),
  ];
}

function claudeModes(
  model: ModelInventoryItem,
  accountId: EverydayToolAccountId,
  accountLabel: string,
  task: TaskIntake,
): ToolModeCandidate[] {
  const maxOrTeam = accountId === "max-5x" || accountId === "max-20x" || accountId === "team" || accountId === "enterprise";
  const baseModes = [
    mode({
      model,
      providerId: "claude",
      accountId,
      accountLabel,
      kind: "prompt",
      suffix: "prompt-reasoning",
      modeLabel: maxOrTeam ? "strongest Claude reasoning mode for the master prompt" : "default paid Claude model for the master prompt",
      roles: ["prompt-design", "quality-review"],
      resourceProfile: maxOrTeam ? "reasoning" : "standard",
      energyProfile: maxOrTeam ? "reasoning" : "medium",
      pricingAnchorId: maxOrTeam ? "anthropic-frontier-text-anchor" : "anthropic-premium-text-anchor",
      energyAnchorId: maxOrTeam ? "o3-medium-estimate" : "gpt-4o-medium-estimate",
      selectionReasons: ["Use Claude's stronger reasoning pass when prompt quality or architecture judgment prevents rework."],
    }),
    mode({
      model,
      providerId: "claude",
      accountId,
      accountLabel,
      kind: "execution",
      suffix: "execution-fast",
      modeLabel: "Claude fast/default mode after the master prompt is clear",
      roles: ["execution"],
      resourceProfile: "light",
      energyProfile: "low",
      pricingAnchorId: "anthropic-low-cost-text-anchor",
      energyAnchorId: "google-median-gemini-apps-text-prompt",
      selectionReasons: ["Use the lower-resource Claude pass only after the master prompt has removed ambiguity."],
    }),
    mode({
      model,
      providerId: "claude",
      accountId,
      accountLabel,
      kind: "benchmark",
      suffix: "premium-benchmark",
      modeLabel: "premium comparison using Claude's strongest available model",
      roles: ["prompt-design", "execution", "build-slice", "quality-review"],
      resourceProfile: "premium",
      energyProfile: "reasoning",
      pricingAnchorId: maxOrTeam ? "anthropic-highest-cost-anchor" : "anthropic-frontier-text-anchor",
      energyAnchorId: "o3-medium-estimate",
      selectionReasons: ["This benchmarks the heavier route where Claude is used at high intensity throughout."],
    }),
  ];

  if (!isBuildTask(task)) {
    return baseModes;
  }

  return [
    ...baseModes,
    mode({
      model,
      providerId: "claude",
      accountId,
      accountLabel,
      kind: "build",
      suffix: "claude-code-build",
      modeLabel: "Claude Code via this Claude subscription for build execution",
      roles: ["build-slice", "execution"],
      resourceProfile: maxOrTeam ? "reasoning" : "standard",
      energyProfile: "medium",
      pricingAnchorId: maxOrTeam ? "anthropic-frontier-text-anchor" : "anthropic-premium-text-anchor",
      energyAnchorId: "gpt-4o-medium-estimate",
      selectionReasons: [
        "Claude Code is treated as the build surface available through the selected Claude subscription, not as a separate subscription.",
        "Claude Code note: use the subscription's Claude Code surface when installed and authenticated; do not model it as a separate subscription or unrelated paid tool.",
        "Use it when the task needs files, implementation sequencing, or code-building assistance.",
      ],
    }),
  ];
}

function perplexityModes(model: ModelInventoryItem, accountId: EverydayToolAccountId, accountLabel: string): ToolModeCandidate[] {
  const paid = accountId === "pro" || accountId === "max" || accountId === "enterprise-pro" || accountId === "enterprise-max";
  const sonarLabel = paid ? "Perplexity Sonar Pro or Deep Research for evidence checks" : "Perplexity Sonar for evidence checks";

  return [
    mode({
      model,
      providerId: "perplexity",
      accountId,
      accountLabel,
      kind: "research",
      suffix: "sonar-research",
      modeLabel: sonarLabel,
      roles: ["evidence-check", "quality-review"],
      resourceProfile: paid ? "standard" : "free",
      energyProfile: "medium",
      pricingAnchorId: paid ? "perplexity-sonar-pro" : "perplexity-sonar",
      energyAnchorId: "gpt-4o-medium-estimate",
      selectionReasons: [
        "Use Perplexity for current facts, citations, and source-backed framing.",
        "Do not use Perplexity as the final app-build executor unless the task is primarily research.",
      ],
    }),
  ];
}

function geminiModes(model: ModelInventoryItem, accountId: EverydayToolAccountId, accountLabel: string): ToolModeCandidate[] {
  const strong = accountId === "google-ai-pro" || accountId === "google-ai-ultra" || accountId === "team" || accountId === "enterprise";

  return [
    mode({
      model,
      providerId: "gemini",
      accountId,
      accountLabel,
      kind: "prompt",
      suffix: "prompt-pro",
      modeLabel: strong ? "Gemini Pro/Ultra reasoning mode for the master prompt" : "best available Gemini reasoning mode for the master prompt",
      roles: ["prompt-design", "quality-review"],
      resourceProfile: strong ? "reasoning" : "standard",
      energyProfile: strong ? "reasoning" : "medium",
      pricingAnchorId: strong ? "google-premium-text-anchor" : "google-low-cost-text-anchor",
      energyAnchorId: strong ? "o3-medium-estimate" : "gpt-4o-medium-estimate",
      selectionReasons: ["Use Gemini's stronger reasoning mode when the prompt is the hard part."],
    }),
    mode({
      model,
      providerId: "gemini",
      accountId,
      accountLabel,
      kind: "execution",
      suffix: "execution-flash",
      modeLabel: "Gemini Flash or Flash-Lite after the master prompt is clear",
      roles: ["execution", "build-slice"],
      resourceProfile: accountId === "basic" ? "free" : "light",
      energyProfile: "low",
      pricingAnchorId: "google-low-cost-text-anchor",
      energyAnchorId: "google-median-gemini-apps-text-prompt",
      selectionReasons: ["Gemini Flash-style modes are the lower-resource execution pass after prompt design."],
    }),
    mode({
      model,
      providerId: "gemini",
      accountId,
      accountLabel,
      kind: "benchmark",
      suffix: "premium-benchmark",
      modeLabel: "premium comparison using Gemini Pro/Ultra reasoning",
      roles: ["prompt-design", "execution", "build-slice", "quality-review"],
      resourceProfile: "premium",
      energyProfile: "reasoning",
      pricingAnchorId: "google-premium-text-anchor",
      energyAnchorId: "o3-medium-estimate",
      selectionReasons: ["This benchmarks keeping the task on a heavier Gemini reasoning mode."],
    }),
  ];
}

function genericModes(
  model: ModelInventoryItem,
  providerId: EverydayToolProviderId,
  accountId: EverydayToolAccountId,
  accountLabel: string,
  task: TaskIntake,
): ToolModeCandidate[] {
  const baseRoles: WorkRole[] =
    model.tier === "research"
      ? ["evidence-check", "quality-review"]
      : model.tier === "artifact"
        ? ["artifact-package", "execution", "quality-review"]
        : ["prompt-design", "execution", "quality-review"];
  const codingRoles: WorkRole[] = isBuildTask(task) && model.capabilityScores.coding >= 4 ? ["build-slice"] : [];
  const resourceProfile = model.tier === "frontier" ? "reasoning" : model.tier === "small" ? "light" : "standard";

  return [
    mode({
      model,
      providerId,
      accountId,
      accountLabel,
      kind: model.tier === "research" ? "research" : model.tier === "artifact" ? "artifact" : "execution",
      suffix: "generic-mode",
      modeLabel:
        model.tier === "research"
          ? "default source-backed research mode"
          : model.tier === "artifact"
            ? "default artifact or document mode"
            : "best available mode in this account for the selected role",
      roles: [...baseRoles, ...codingRoles],
      resourceProfile,
      energyProfile: model.tier === "frontier" ? "reasoning" : model.tier === "small" ? "low" : "medium",
      pricingAnchorId: pricingAnchorIdForModel(model),
      energyAnchorId: model.tier === "frontier" ? "o3-medium-estimate" : model.tier === "small" ? "google-median-gemini-apps-text-prompt" : "gpt-4o-medium-estimate",
      selectionReasons: ["This provider is scored with generic role, capability, privacy, cost, and energy rules."],
    }),
  ];
}

function mode(input: {
  model: ModelInventoryItem;
  providerId: EverydayToolProviderId;
  accountId: EverydayToolAccountId;
  accountLabel: string;
  kind: ToolModeKind;
  suffix: string;
  modeLabel: string;
  roles: WorkRole[];
  capabilityScores?: CapabilityScores;
  resourceProfile: ToolModeResourceProfile;
  energyProfile: ToolModeEnergyProfile;
  pricingAnchorId: string | null;
  energyAnchorId: string | null;
  selectionReasons: string[];
}): ToolModeCandidate {
  const zeroMarginalCost = hasZeroMarginalCostAccount(input.providerId, input.accountId, input.model);
  const providerLabel = input.providerId === "none" ? "You" : getEverydayToolProvider(input.providerId).label;

  return {
    id: `${input.model.id}:${input.suffix}`,
    modelId: input.model.id,
    providerId: input.providerId,
    accountId: input.accountId,
    providerLabel,
    accountLabel: input.accountLabel,
    modeKind: input.kind,
    modeLabel: input.modeLabel,
    displayLabel: input.providerId === "none" ? "You first" : `${providerLabel} ${input.accountLabel} - ${input.modeLabel}`,
    roles: [...new Set(input.roles)],
    capabilityScores: input.capabilityScores ?? input.model.capabilityScores,
    maxPermissionLevel: input.model.maxPermissionLevel,
    localOnly: input.model.localOnly,
    requiresExternalCall: input.model.requiresExternalCall ?? !input.model.localOnly,
    zeroMarginalCost,
    pricingAnchorId: zeroMarginalCost ? null : input.pricingAnchorId,
    energyAnchorId: input.energyAnchorId,
    energyProfile: input.energyProfile,
    resourceProfile: zeroMarginalCost && input.resourceProfile !== "manual" ? "free" : input.resourceProfile,
    catalogReviewedAt: toolModeCatalogReviewedAt,
    sourceIds: officialSourceIdsByProvider[input.providerId] ?? [],
    selectionReasons: input.selectionReasons,
  };
}

function modeScore(mode: ToolModeCandidate, role: WorkRole, strategy: "lean" | "balanced" | "premium", task: TaskIntake) {
  const capability = roleCapability(mode.capabilityScores, role, task) * 20;
  const resourceRank = resourceRanks[mode.resourceProfile];
  const zeroCostBonus = mode.zeroMarginalCost ? 9 : 0;
  const privacyBonus = mode.localOnly || mode.modeKind === "manual" ? 6 : 0;
  const roleBonus = roleSpecificBonus(mode, role, task);
  const manualEffortPenalty =
    mode.modeKind === "manual" && (role === "prompt-design" || role === "execution" || role === "build-slice") ? 18 : 0;

  if (strategy === "lean") {
    return capability * 0.55 + (5 - resourceRank) * 12 + zeroCostBonus * 1.6 + privacyBonus + roleBonus - manualEffortPenalty;
  }

  if (strategy === "premium") {
    return capability * 1.08 + resourceRank * 5 + roleBonus + (mode.modeKind === "benchmark" ? 20 : 0);
  }

  return capability * 0.95 + (5 - Math.abs(resourceRank - 2.5)) * 4 + zeroCostBonus * 0.4 + privacyBonus * 0.4 + roleBonus;
}

function selectLeastResourceAdequateMode(
  eligibleModes: readonly ToolModeCandidate[],
  role: WorkRole,
  task: TaskIntake,
) {
  const nonManualModes = eligibleModes.filter((mode) => mode.modeKind !== "manual");
  const zeroMarginalModes = nonManualModes.filter((mode) => mode.zeroMarginalCost);

  if (zeroMarginalModes.length > 0) {
    return sortLeastResourceModes(zeroMarginalModes, role, task)[0] ?? zeroMarginalModes[0] ?? null;
  }

  const manualMode = eligibleModes.find((mode) => mode.modeKind === "manual");
  if (manualMode) {
    return manualMode;
  }

  return sortLeastResourceModes(nonManualModes.length ? nonManualModes : eligibleModes, role, task)[0] ?? null;
}

function sortLeastResourceModes(
  modes: readonly ToolModeCandidate[],
  role: WorkRole,
  task: TaskIntake,
) {
  return [...modes].sort((left, right) => {
    const resourceComparison = resourceRanks[left.resourceProfile] - resourceRanks[right.resourceProfile];
    const manualComparison = Number(left.modeKind === "manual") - Number(right.modeKind === "manual");
    const capabilityComparison = roleCapability(right.capabilityScores, role, task) - roleCapability(left.capabilityScores, role, task);

    return resourceComparison || manualComparison || capabilityComparison || left.displayLabel.localeCompare(right.displayLabel);
  });
}

function roleCapability(scores: CapabilityScores, role: WorkRole, task: TaskIntake) {
  switch (role) {
    case "evidence-check":
      return (scores.research * 0.75 + scores.reasoning * 0.25);
    case "prompt-design":
      return task.knowledgeWorkType === "coding" || taskHasBuildIntent(task)
        ? (scores.reasoning * 0.65 + scores.coding * 0.25 + scores.writing * 0.1)
        : (scores.reasoning * 0.7 + scores.writing * 0.3);
    case "execution":
      return (scores.reasoning * 0.4 + scores.writing * 0.3 + scores.coding * 0.2 + scores.packaging * 0.1);
    case "build-slice":
      return (scores.coding * 0.7 + scores.reasoning * 0.3);
    case "artifact-package":
      return (scores.packaging * 0.75 + scores.writing * 0.25);
    case "quality-review":
      return (scores.reasoning * 0.75 + scores.research * 0.15 + scores.writing * 0.1);
    case "next-action":
      return (scores.reasoning + scores.writing) / 2;
  }
}

function roleSpecificBonus(mode: ToolModeCandidate, role: WorkRole, task: TaskIntake) {
  let bonus = 0;

  if (role === "evidence-check" && mode.providerId === "perplexity") {
    bonus += 24;
  }

  if (role === "build-slice" && mode.modeKind === "build") {
    bonus += 30;
  }

  if (role === "prompt-design" && taskHasBuildIntent(task) && mode.resourceProfile === "reasoning") {
    bonus += 12;
  }

  if ((role === "execution" || role === "build-slice") && mode.resourceProfile === "light") {
    bonus += 8;
  }

  if (role === "execution" && mode.providerId === "perplexity" && taskHasBuildIntent(task)) {
    bonus -= 35;
  }

  return bonus;
}

function hasZeroMarginalCostAccount(providerId: EverydayToolProviderId, accountId: EverydayToolAccountId, model: ModelInventoryItem) {
  if (model.tier === "human" || model.localOnly) {
    return false;
  }

  if (providerId === "none") {
    return false;
  }

  const provider = getEverydayToolProvider(providerId);
  const account = provider.accountOptions.find((option) => option.id === accountId);
  const accountLabel = account?.label ?? accountId;

  return accountId === "basic" || /\bfree\b|\bbasic\b/i.test(accountLabel);
}

function pricingAnchorForProviderMode(
  providerId: EverydayToolProviderId,
  accountId: EverydayToolAccountId,
  modeId: string,
  model: ModelInventoryItem,
) {
  if (modeId.endsWith(":premium-benchmark")) {
    switch (providerId) {
      case "chatgpt":
        return accountId === "pro" || accountId === "business" || accountId === "enterprise"
          ? "openai-frontier-reasoning-anchor"
          : "openai-premium-text-anchor";
      case "claude":
        return accountId === "max-5x" || accountId === "max-20x" ? "anthropic-highest-cost-anchor" : "anthropic-frontier-text-anchor";
      case "gemini":
        return "google-premium-text-anchor";
      default:
        return pricingAnchorIdForModel(model);
    }
  }

  if (modeId.endsWith(":prompt-reasoning") || modeId.endsWith(":prompt-pro")) {
    switch (providerId) {
      case "chatgpt":
        return accountId === "pro" || accountId === "business" || accountId === "enterprise"
          ? "openai-premium-text-anchor"
          : "openai-low-cost-text-anchor";
      case "claude":
        return accountId === "max-5x" || accountId === "max-20x" ? "anthropic-frontier-text-anchor" : "anthropic-premium-text-anchor";
      case "gemini":
        return accountId === "google-ai-pro" || accountId === "google-ai-ultra" ? "google-premium-text-anchor" : "google-low-cost-text-anchor";
      default:
        return pricingAnchorIdForModel(model);
    }
  }

  if (modeId.endsWith(":claude-code-build")) {
    return accountId === "max-5x" || accountId === "max-20x" ? "anthropic-frontier-text-anchor" : "anthropic-premium-text-anchor";
  }

  return pricingAnchorIdForModel(model);
}

function energyAnchorForMode(providerId: EverydayToolProviderId, modeId: string, model: ModelInventoryItem) {
  if (modeId.endsWith(":premium-benchmark") || modeId.endsWith(":prompt-reasoning") || modeId.endsWith(":prompt-pro")) {
    return "o3-medium-estimate";
  }

  if (modeId.endsWith(":execution-fast") || modeId.endsWith(":execution-flash")) {
    return "google-median-gemini-apps-text-prompt";
  }

  if (providerId === "perplexity" || model.tier === "research" || model.tier === "artifact" || model.tier === "mid") {
    return "gpt-4o-medium-estimate";
  }

  if (model.tier === "frontier") {
    return "o3-medium-estimate";
  }

  return "google-median-gemini-apps-text-prompt";
}

function energyProfileForMode(modeId: string, model: ModelInventoryItem): ToolModeEnergyProfile {
  if (modeId.endsWith(":premium-benchmark") || modeId.endsWith(":prompt-reasoning") || modeId.endsWith(":prompt-pro")) {
    return "reasoning";
  }

  if (modeId.endsWith(":execution-fast") || modeId.endsWith(":execution-flash")) {
    return "low";
  }

  if (model.tier === "frontier") {
    return "high";
  }

  return "medium";
}

function isBuildTask(task: TaskIntake) {
  return task.knowledgeWorkType === "coding" || task.outputType === "code" || taskHasBuildIntent(task);
}
