import {
  getEverydayToolProvider,
  inferEverydayToolSelection,
  type EverydayToolAccountId,
  type EverydayToolProviderId,
} from "../defaults/everydayToolCatalog";
import type { CapabilityScores, ModelInventoryItem, PermissionLevel, RouteStep, TaskIntake, WorkRole } from "../types";
import { pricingAnchorIdForModel } from "./modelGuidance";
import {
  chatGptGuidanceLabels,
  claudeGuidanceLabels,
  geminiGuidanceLabels,
  grokGuidanceLabels,
  perplexityGuidanceLabels,
} from "./providerModeProfiles";
import { taskHasBuildIntent, taskNeedsFullBuildPlan } from "./taskDecomposition";

export type ToolModeKind = "manual" | "research" | "prompt" | "execution" | "build" | "artifact" | "review" | "benchmark";
export type ToolModeResourceProfile = "manual" | "free" | "light" | "standard" | "reasoning" | "premium";
export type ToolModeEnergyProfile = "none" | "low" | "medium" | "high" | "reasoning";

export type ToolModeCandidate = {
  id: string;
  modelId: string;
  modelTier: ModelInventoryItem["tier"];
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

export const toolModeCatalogReviewedAt = "2026-07-07T00:27:03-06:00";

const officialSourceIdsByProvider: Partial<Record<EverydayToolProviderId, string[]>> = {
  chatgpt: ["openai-chatgpt-model-picker", "openai-chatgpt-go"],
  claude: ["anthropic-claude-plans", "anthropic-claude-code-subscription"],
  perplexity: ["perplexity-sonar-models", "perplexity-api-pricing"],
  gemini: ["google-gemini-models", "google-gemini-pricing"],
  grok: ["xai-models", "xai-grok-4-3", "xai-grok-build"],
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

  if (strategy === "balanced" && role === "prompt-design" && shouldUseStrongestPromptDesignPass(task)) {
    return selectStrongestPromptDesignMode(eligibleModes, role, strategy, task);
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
        mode.resourceProfile !== "premium",
    );
    const nonFrontierPromptModes = everydayPromptModes.filter((mode) => mode.modelTier !== "frontier");

    if (nonFrontierPromptModes.length > 0) {
      return [...nonFrontierPromptModes].sort((left, right) => modeScore(right, role, strategy, task) - modeScore(left, role, strategy, task))[0] ?? nonFrontierPromptModes[0] ?? null;
    }

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

function shouldUseStrongestPromptDesignPass(task: TaskIntake) {
  return taskNeedsFullBuildPlan(task) || taskHasBuildIntent(task) || task.qualityBar === "high" || task.qualityBar === "critical";
}

function selectStrongestPromptDesignMode(
  eligibleModes: readonly ToolModeCandidate[],
  role: WorkRole,
  strategy: "lean" | "balanced" | "premium",
  task: TaskIntake,
) {
  const promptModes = eligibleModes.filter((mode) => mode.modeKind === "prompt");
  const normalPromptModes = promptModes.filter((mode) => mode.resourceProfile !== "premium");
  const candidates = normalPromptModes.length ? normalPromptModes : promptModes.length ? promptModes : eligibleModes;

  return [...candidates].sort((left, right) => {
    const capabilityComparison = roleCapability(right.capabilityScores, role, task) - roleCapability(left.capabilityScores, role, task);
    const resourceComparison = resourceRanks[right.resourceProfile] - resourceRanks[left.resourceProfile];
    const scoreComparison = modeScore(right, role, strategy, task) - modeScore(left, role, strategy, task);

    return capabilityComparison || resourceComparison || scoreComparison || left.displayLabel.localeCompare(right.displayLabel);
  })[0] ?? null;
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
    case "grok":
      return grokModes(model, accountId, accountLabel, task);
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
  const profile = chatGptGuidanceLabels(accountId);
  const goOrPlus = accountId === "go" || accountId === "plus";
  const promptIsReasoning = paidReasoning || goOrPlus;

  return [
    mode({
      model,
      providerId: "chatgpt",
      accountId,
      accountLabel,
      kind: "prompt",
      suffix: "prompt-reasoning",
      modeLabel: profile.promptBuilderModelLabel,
      roles: ["prompt-design", "quality-review"],
      resourceProfile: promptIsReasoning ? "reasoning" : "standard",
      energyProfile: promptIsReasoning ? "reasoning" : "medium",
      pricingAnchorId: paidReasoning ? "openai-premium-text-anchor" : "openai-low-cost-text-anchor",
      energyAnchorId: promptIsReasoning ? "o3-medium-estimate" : "gpt-4o-medium-estimate",
      selectionReasons: [
        "Use the stronger thinking pass once to make the downstream prompt precise enough for cheaper execution.",
        "Use the actual ChatGPT picker label: Instant for cheap execution; Medium, High, Extra High, or Pro for the thinking pass when your account exposes it.",
      ],
    }),
    mode({
      model,
      providerId: "chatgpt",
      accountId,
      accountLabel,
      kind: "execution",
      suffix: "execution-fast",
      modeLabel: profile.executionModelLabel,
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
      modeLabel: `premium comparison using ${profile.upgradeModelLabel}`,
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
  const profile = claudeGuidanceLabels(accountId);
  const baseModes = [
    mode({
      model,
      providerId: "claude",
      accountId,
      accountLabel,
      kind: "prompt",
      suffix: "prompt-reasoning",
      modeLabel: profile.promptBuilderModelLabel,
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
      modeLabel: profile.executionModelLabel,
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
      modeLabel: `premium comparison using ${profile.upgradeModelLabel}`,
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
      modeLabel: `Claude Code via this Claude subscription using ${maxOrTeam ? "Sonnet 5 for most coding; Opus 4.8 effort xhigh only when stuck or wide" : "Sonnet 5 for most coding when available"}`,
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
  const profile = perplexityGuidanceLabels(accountId);

  return [
    mode({
      model,
      providerId: "perplexity",
      accountId,
      accountLabel,
      kind: "research",
      suffix: "sonar-research",
      modeLabel: profile.promptBuilderModelLabel,
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
  const profile = geminiGuidanceLabels(accountId);

  return [
    mode({
      model,
      providerId: "gemini",
      accountId,
      accountLabel,
      kind: "prompt",
      suffix: "prompt-pro",
      modeLabel: profile.promptBuilderModelLabel,
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
      modeLabel: profile.executionModelLabel,
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
      modeLabel: `premium comparison using ${profile.upgradeModelLabel}`,
      roles: ["prompt-design", "execution", "build-slice", "quality-review"],
      resourceProfile: "premium",
      energyProfile: "reasoning",
      pricingAnchorId: "google-premium-text-anchor",
      energyAnchorId: "o3-medium-estimate",
      selectionReasons: ["This benchmarks keeping the task on a heavier Gemini reasoning mode."],
    }),
  ];
}

function grokModes(
  model: ModelInventoryItem,
  accountId: EverydayToolAccountId,
  accountLabel: string,
  task: TaskIntake,
): ToolModeCandidate[] {
  const profile = grokGuidanceLabels(accountId);
  const paid = accountId === "supergrok" || accountId === "x-premium-plus" || accountId === "xai-api";
  const baseModes = [
    mode({
      model,
      providerId: "grok",
      accountId,
      accountLabel,
      kind: "research",
      suffix: "grok-search-evidence",
      modeLabel: "Grok 4.3 with Web Search or X Search enabled for evidence checks",
      roles: ["evidence-check", "quality-review"],
      resourceProfile: paid ? "standard" : "free",
      energyProfile: "medium",
      pricingAnchorId: "xai-premium-text-anchor",
      energyAnchorId: "gpt-4o-medium-estimate",
      selectionReasons: [
        "Grok needs Web Search or X Search enabled for current facts; without search, do not treat it as current.",
        "Use Perplexity instead when it is available and the task is mainly research or citations.",
      ],
    }),
    mode({
      model,
      providerId: "grok",
      accountId,
      accountLabel,
      kind: "prompt",
      suffix: "prompt-reasoning",
      modeLabel: profile.promptBuilderModelLabel,
      roles: ["prompt-design", "quality-review"],
      resourceProfile: paid ? "reasoning" : "standard",
      energyProfile: paid ? "reasoning" : "medium",
      pricingAnchorId: "xai-premium-text-anchor",
      energyAnchorId: paid ? "o3-medium-estimate" : "gpt-4o-medium-estimate",
      selectionReasons: [
        "Use Grok 4.3's named reasoning setting for the thinking-heavy prompt pass instead of a generic best-model label.",
        "Set reasoning lower for repeated execution once the prompt is clear.",
      ],
    }),
    mode({
      model,
      providerId: "grok",
      accountId,
      accountLabel,
      kind: "execution",
      suffix: "execution-fast",
      modeLabel: profile.executionModelLabel,
      roles: ["execution"],
      resourceProfile: paid ? "light" : "free",
      energyProfile: "low",
      pricingAnchorId: "xai-low-cost-text-anchor",
      energyAnchorId: "google-median-gemini-apps-text-prompt",
      selectionReasons: [
        "After prompt design, use Grok 4.3 with reasoning none or low so execution does not burn the heavy setting unnecessarily.",
      ],
    }),
    mode({
      model,
      providerId: "grok",
      accountId,
      accountLabel,
      kind: "benchmark",
      suffix: "premium-benchmark",
      modeLabel: `premium comparison using ${profile.upgradeModelLabel}`,
      roles: ["prompt-design", "execution", "build-slice", "quality-review"],
      resourceProfile: "premium",
      energyProfile: "reasoning",
      pricingAnchorId: "xai-premium-text-anchor",
      energyAnchorId: "o3-medium-estimate",
      selectionReasons: ["This benchmarks leaving the whole task on Grok's heavier reasoning or code mode."],
    }),
  ];

  if (!isBuildTask(task)) {
    return baseModes;
  }

  return [
    ...baseModes,
    mode({
      model,
      providerId: "grok",
      accountId,
      accountLabel,
      kind: "build",
      suffix: "grok-build",
      modeLabel: "Grok Build 0.1 (grok-code-fast) for code/build execution",
      roles: ["build-slice", "execution"],
      resourceProfile: paid ? "standard" : "light",
      energyProfile: "medium",
      pricingAnchorId: "xai-premium-text-anchor",
      energyAnchorId: "gpt-4o-medium-estimate",
      selectionReasons: [
        "xAI names Grok Build as the coding model; use it for build execution when Grok is the chosen build helper.",
        "Keep Grok 4.3 reasoning high for prompt design, then switch to Grok Build for the code/build slice.",
      ],
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
  const profile = genericProviderModeProfile(providerId, accountId, accountLabel, model, task);
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
      kind: profile.kind ?? (model.tier === "research" ? "research" : model.tier === "artifact" ? "artifact" : "execution"),
      suffix: "generic-mode",
      modeLabel: profile.modeLabel,
      roles: profile.roles ?? [...baseRoles, ...codingRoles],
      resourceProfile,
      energyProfile: model.tier === "frontier" ? "reasoning" : model.tier === "small" ? "low" : "medium",
      pricingAnchorId: pricingAnchorIdForModel(model),
      energyAnchorId: model.tier === "frontier" ? "o3-medium-estimate" : model.tier === "small" ? "google-median-gemini-apps-text-prompt" : "gpt-4o-medium-estimate",
      selectionReasons: profile.selectionReasons,
    }),
  ];
}

function genericProviderModeProfile(
  providerId: EverydayToolProviderId,
  accountId: EverydayToolAccountId,
  accountLabel: string,
  model: ModelInventoryItem,
  task: TaskIntake,
): {
  kind?: ToolModeKind;
  modeLabel: string;
  roles?: WorkRole[];
  selectionReasons: string[];
} {
  const buildTask = isBuildTask(task);
  const accountContext = accountLabel ? ` (${accountLabel})` : "";

  switch (providerId) {
    case "copilot":
      return {
        kind: "artifact",
        modeLabel:
          "Microsoft Copilot Chat for planning; Copilot in Word, Excel, or PowerPoint when the output is a document, table, or slide",
        roles: ["prompt-design", "execution", "artifact-package", "quality-review"],
        selectionReasons: [
          "Copilot is strongest when the result belongs in Microsoft 365 or a work-approved Copilot chat.",
          "Use a specialist research helper first when current facts or citations matter.",
        ],
      };
    case "genspark":
      return {
        kind: "research",
        modeLabel: "Genspark research or agent mode for source-backed planning and synthesis",
        roles: ["evidence-check", "prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Use Genspark when the task benefits from source-backed research, agents, or assembled content.",
          "Keep final build execution on a coding/build tool when the task is software-heavy.",
        ],
      };
    case "meta-ai":
      return {
        modeLabel: "Meta AI default chat for quick public drafting or brainstorming",
        selectionReasons: [
          "Use Meta AI for low-stakes drafting and everyday ideation, not private work or precise build execution.",
        ],
      };
    case "poe":
      return {
        modeLabel: `Poe${accountContext}: choose the named underlying bot for this stage, such as Claude/GPT/Gemini for reasoning or a search bot for research`,
        roles: ["evidence-check", "prompt-design", "execution", "build-slice", "quality-review"],
        selectionReasons: [
          "Poe is a multi-model hub, so the useful instruction is to pick the underlying bot/model inside Poe for each stage.",
          "Do not treat Poe itself as the model; route by the model or bot selected inside Poe.",
        ],
      };
    case "you-com":
      return {
        kind: "research",
        modeLabel: "You.com Research or agent mode for current web-backed evidence and synthesis",
        roles: ["evidence-check", "prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Use You.com when search-grounded research is part of the job.",
          "Prefer a coding/build helper for implementation after the research frame is clear.",
        ],
      };
    case "notebooklm":
      return {
        kind: "research",
        modeLabel: "NotebookLM source-grounded answer from the approved notebook sources",
        roles: ["evidence-check", "quality-review"],
        selectionReasons: [
          "NotebookLM is strongest when the user already has source documents loaded and wants grounded synthesis.",
          "Use it to check evidence, not to invent app architecture outside the supplied sources.",
        ],
      };
    case "canva":
      return {
        kind: "artifact",
        modeLabel: "Canva Magic Write, Magic Design, or presentation tools for the final visual/document artifact",
        roles: ["artifact-package", "execution", "quality-review"],
        selectionReasons: [
          "Canva is an artifact and design surface; use it after the plan, copy, or structure is clear.",
          "Keep reasoning-heavy prompt design on a stronger general model when the task is complex.",
        ],
      };
    case "github-copilot":
      return {
        kind: "build",
        modeLabel: "GitHub Copilot Chat or Agent in the IDE for code changes; use ask/edit/agent based on task size",
        roles: buildTask
          ? ["prompt-design", "execution", "build-slice", "quality-review"]
          : ["prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "GitHub Copilot belongs closest to the repository and editor, so use it for code implementation and review loops.",
          "For broad architecture uncertainty, create the master prompt or plan before opening the code agent.",
        ],
      };
    case "cursor":
      return {
        kind: "build",
        modeLabel: "Cursor Agent for multi-file work; Cursor Edit or Chat for smaller code changes",
        roles: buildTask
          ? ["prompt-design", "execution", "build-slice", "quality-review"]
          : ["prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Cursor is a codebase surface; use Agent for a build slice only after the acceptance checks are clear.",
          "Use lighter chat/edit modes for narrow changes and reserve agent mode for multi-file work.",
        ],
      };
    case "replit":
      return {
        kind: "build",
        modeLabel: "Replit Agent or App Builder for the first runnable app slice",
        roles: buildTask
          ? ["prompt-design", "execution", "build-slice", "quality-review"]
          : ["prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Replit is strongest when the user wants a runnable app environment, not just advice.",
          "Keep the first slice small enough to test before asking Replit to expand it.",
        ],
      };
    case "deepseek":
      return {
        modeLabel:
          model.tier === "frontier"
            ? "DeepSeek reasoning mode for prompt design; DeepSeek chat/coder mode for execution"
            : "DeepSeek chat for quick execution with an upgrade trigger to the reasoning mode",
        roles: buildTask
          ? ["prompt-design", "execution", "build-slice", "quality-review"]
          : ["prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Use DeepSeek's reasoning mode for the hard thinking pass and a lighter chat/coder pass after the prompt is clear.",
        ],
      };
    case "qwen":
      return {
        modeLabel:
          accountId.includes("code") || accountId.includes("coding")
            ? "Qwen Code or Qwen coding plan for code/build execution"
            : "Qwen reasoning/chat mode for prompt design; Qwen fast chat for execution",
        roles: buildTask
          ? ["prompt-design", "execution", "build-slice", "quality-review"]
          : ["prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Use the Qwen coding surface for build work and the general chat/reasoning surface for planning.",
        ],
      };
    case "kimi":
      return {
        modeLabel: "Kimi long-context chat for source-heavy synthesis and planning",
        selectionReasons: [
          "Use Kimi when long context or document-heavy reasoning matters more than artifact polish.",
        ],
      };
    case "doubao":
      return {
        modeLabel:
          accountId.includes("coding") ? "Doubao/Ark coding plan for code execution" : "Doubao chat or Ark model for reasoning and execution",
        roles: buildTask
          ? ["prompt-design", "execution", "build-slice", "quality-review"]
          : ["prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Use the coding plan for build work; otherwise use the chat/model surface for planning and drafting.",
        ],
      };
    case "minimax":
      return {
        modeLabel: "MiniMax chat or agent mode for multimodal planning, drafting, and agent workflows",
        selectionReasons: [
          "Use MiniMax for general agent or multimodal work when it is already in the user's toolkit.",
        ],
      };
    case "zhipu":
      return {
        modeLabel:
          accountId.includes("coding") ? "Z.ai/GLM coding mode for build work" : "Z.ai or GLM chat/reasoning mode for planning",
        roles: buildTask
          ? ["prompt-design", "execution", "build-slice", "quality-review"]
          : ["prompt-design", "execution", "quality-review"],
        selectionReasons: [
          "Use the GLM coding surface for build execution and the chat/reasoning surface for planning or review.",
        ],
      };
    case "hunyuan":
      return {
        modeLabel: "Tencent Hunyuan chat/reasoning mode for planning, synthesis, or approved enterprise work",
        selectionReasons: [
          "Use Hunyuan when that provider is already approved for the user's account and information class.",
        ],
      };
    case "mistral":
      return {
        modeLabel: "Mistral Le Chat or large/reasoning model for prompt design; smaller Mistral model for execution",
        selectionReasons: [
          "Use Mistral's stronger reasoning surface for the thinking pass, then a smaller model for repeatable execution.",
        ],
      };
    case "local":
      return {
        modeLabel: "the smallest local/private model that passes the review checks",
        selectionReasons: [
          "Local models protect privacy and avoid provider calls, but should be checked carefully for reasoning gaps.",
        ],
      };
    case "other":
      return {
        modeLabel: "the specific named model or mode in this account that matches the stage",
        selectionReasons: [
          "This row is user-defined, so the safest guidance is to pick the named model/mode they recognize for the current stage.",
        ],
      };
    default:
      return {
        modeLabel:
          model.tier === "research"
            ? "the provider's source-backed research mode"
            : model.tier === "artifact"
              ? "the provider's artifact, document, table, slide, or design mode"
              : model.tier === "frontier"
                ? "the provider's named reasoning mode for prompt design and lighter mode for execution"
                : "the provider's fast/default mode for execution with a clear upgrade trigger",
        selectionReasons: [
          "This provider is scored with role, capability, privacy, cost, and energy rules while keeping the instruction tied to the provider's visible mode names.",
        ],
      };
  }
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
    modelTier: input.model.tier,
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

  if (shouldPreferAiOverManualLeanMode(task, role) && nonManualModes.length > 0) {
    return sortLeastResourceModes(nonManualModes, role, task)[0] ?? nonManualModes[0] ?? null;
  }

  const manualMode = eligibleModes.find((mode) => mode.modeKind === "manual");
  if (manualMode) {
    return manualMode;
  }

  return sortLeastResourceModes(nonManualModes.length ? nonManualModes : eligibleModes, role, task)[0] ?? null;
}

function shouldPreferAiOverManualLeanMode(task: TaskIntake, role: WorkRole) {
  if (task.sensitivityClass !== "public" && task.sensitivityClass !== "internal") {
    return false;
  }

  if (role === "prompt-design" && (taskNeedsFullBuildPlan(task) || taskHasBuildIntent(task))) {
    return true;
  }

  if ((role === "execution" || role === "build-slice") && taskHasBuildIntent(task)) {
    return true;
  }

  return false;
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
      case "grok":
        return "xai-premium-text-anchor";
      default:
        return pricingAnchorIdForModel(model);
    }
  }

  if (providerId === "grok") {
    if (modeId.endsWith(":execution-fast")) {
      return "xai-low-cost-text-anchor";
    }

    return "xai-premium-text-anchor";
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
  if (providerId === "grok" && (modeId.endsWith(":execution-fast") || modeId.endsWith(":grok-build"))) {
    return modeId.endsWith(":execution-fast") ? "google-median-gemini-apps-text-prompt" : "gpt-4o-medium-estimate";
  }

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
  if (modeId.endsWith(":grok-search-evidence") || modeId.endsWith(":grok-build")) {
    return "medium";
  }

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
