import { defaultFinalApprovalRouteStep } from "../defaults/defaultPolicies";
import type { HardGateResult } from "./hardGates";
import type { ModelInventoryItem, PermissionLevel, PolicyDefault, RouteStep, SourcePermission, TaskIntake } from "../types";

export const routeCandidateStrategies = ["lean", "balanced", "premium"] as const;

export type RouteCandidateStrategy = (typeof routeCandidateStrategies)[number];
export type RouteCandidateCostLevel = "low" | "medium" | "high";
export type RouteCandidateEffortLevel = "low" | "medium" | "high";

export type RouteCandidateUnavailableReasonCode =
  | "policy-default-missing"
  | "no-safe-lean-path"
  | "no-safe-balanced-path"
  | "no-safe-premium-path";

export type RouteCandidate = {
  id: string;
  taskId: string;
  strategy: RouteCandidateStrategy;
  label: string;
  summary: string;
  estimatedCostLevel: RouteCandidateCostLevel;
  estimatedEffortLevel: RouteCandidateEffortLevel;
  steps: RouteStep[];
  warnings: string[];
};

export type UnavailableRouteCandidate = {
  id: string;
  taskId: string;
  strategy: RouteCandidateStrategy;
  label: string;
  reasonCode: RouteCandidateUnavailableReasonCode;
  reason: string;
  warnings: string[];
};

export type RouteCandidateGenerationResult = {
  candidates: RouteCandidate[];
  unavailable: UnavailableRouteCandidate[];
};

export type GenerateRouteCandidatesInput = {
  task: TaskIntake;
  models: ModelInventoryItem[];
  policies: PolicyDefault[];
  hardGateResult: HardGateResult;
  finalApprovalRouteStep?: RouteStep;
};

type CandidateContext = {
  allowedModels: ModelInventoryItem[];
  allowedSourceIds: string[];
  allowedSources: SourcePermission[];
  warnings: string[];
};

type StrategyDefinition = {
  label: string;
  estimatedCostLevel: RouteCandidateCostLevel;
  estimatedEffortLevel: RouteCandidateEffortLevel;
  primaryModelTiers: ModelInventoryItem["tier"][];
  unavailableReasonCode: RouteCandidateUnavailableReasonCode;
  unavailableReason: string;
  posture: string;
};

const strategyDefinitions: Record<RouteCandidateStrategy, StrategyDefinition> = {
  lean: {
    label: "Lean route",
    estimatedCostLevel: "low",
    estimatedEffortLevel: "low",
    primaryModelTiers: ["small", "human"],
    unavailableReasonCode: "no-safe-lean-path",
    unavailableReason: "No safe small or manual route remains after hard gates.",
    posture: "Keeps the route small and uses the lightest safe path before any premium tooling.",
  },
  balanced: {
    label: "Balanced route",
    estimatedCostLevel: "medium",
    estimatedEffortLevel: "medium",
    primaryModelTiers: ["mid", "frontier"],
    unavailableReasonCode: "no-safe-balanced-path",
    unavailableReason: "No safe mid-tier or synthesis route remains after hard gates.",
    posture: "Uses a synthesis-oriented path for everyday quality without choosing a final recommendation.",
  },
  premium: {
    label: "Premium route",
    estimatedCostLevel: "high",
    estimatedEffortLevel: "high",
    primaryModelTiers: ["frontier", "research", "artifact"],
    unavailableReasonCode: "no-safe-premium-path",
    unavailableReason: "No safe frontier, research, or artifact route remains after hard gates.",
    posture: "Uses the strongest safe route components when quality or review cost matters.",
  },
};

const artifactOutputTypes = new Set(["table", "slide outline", "route card", "prompt package"]);

export function generateRouteCandidates({
  task,
  models,
  policies,
  hardGateResult,
  finalApprovalRouteStep = defaultFinalApprovalRouteStep,
}: GenerateRouteCandidatesInput): RouteCandidateGenerationResult {
  const context = buildCandidateContext(task, models, hardGateResult);
  const candidates: RouteCandidate[] = [];
  const unavailable: UnavailableRouteCandidate[] = [];

  for (const strategy of routeCandidateStrategies) {
    const policy = policies.find((candidatePolicy) => candidatePolicy.strategy === strategy);
    const result = buildStrategyCandidate({
      strategy,
      policy,
      task,
      context,
      hardGateResult,
      finalApprovalRouteStep,
    });

    if ("reasonCode" in result) {
      unavailable.push(result);
    } else {
      candidates.push(result);
    }
  }

  return { candidates, unavailable };
}

function buildCandidateContext(
  task: TaskIntake,
  models: ModelInventoryItem[],
  hardGateResult: HardGateResult,
): CandidateContext {
  const allowedModelIds = new Set(hardGateResult.allowedModelIds);
  const allowedSourceIds = task.requestedSourceIds.filter((sourceId) => hardGateResult.allowedSourceIds.includes(sourceId));
  const allowedSourceIdSet = new Set(allowedSourceIds);

  return {
    allowedModels: models.filter((model) => allowedModelIds.has(model.id)),
    allowedSourceIds,
    allowedSources: task.sourcePermissions.filter((source) => allowedSourceIdSet.has(source.id)),
    warnings: uniqueMessages(hardGateResult.warnings.map((warning) => warning.message)),
  };
}

function buildStrategyCandidate(input: {
  strategy: RouteCandidateStrategy;
  policy: PolicyDefault | undefined;
  task: TaskIntake;
  context: CandidateContext;
  hardGateResult: HardGateResult;
  finalApprovalRouteStep: RouteStep;
}): RouteCandidate | UnavailableRouteCandidate {
  const { strategy, policy, task, context, hardGateResult, finalApprovalRouteStep } = input;
  const definition = strategyDefinitions[strategy];
  const routeId = routeCandidateId(task.id, strategy);

  if (!policy) {
    return unavailableCandidate({
      taskId: task.id,
      strategy,
      label: definition.label,
      reasonCode: "policy-default-missing",
      reason: `No policy default is available for the ${strategy} strategy.`,
      warnings: context.warnings,
    });
  }

  const primaryModel = selectPreferredModel(context.allowedModels, definition.primaryModelTiers);

  if (!primaryModel) {
    return unavailableCandidate({
      taskId: task.id,
      strategy,
      label: definition.label,
      reasonCode: definition.unavailableReasonCode,
      reason: definition.unavailableReason,
      warnings: context.warnings,
    });
  }

  const steps: RouteStep[] = [];
  const researchStep = buildResearchStep({ routeId, task, context });
  if (researchStep) {
    steps.push(researchStep);
  }

  steps.push(buildPrimaryStep({ routeId, strategy, task, model: primaryModel, context }));

  const artifactStep = buildArtifactStep({ routeId, task, primaryModel, context });
  if (strategy === "premium" && artifactStep) {
    steps.push(artifactStep);
  }

  if (hardGateResult.requiresHumanApproval) {
    steps.push(buildHumanApprovalStep(routeId, finalApprovalRouteStep));
  }

  return {
    id: routeId,
    taskId: task.id,
    strategy,
    label: definition.label,
    summary: buildCandidateSummary({
      definition,
      policy,
      usesManualPrimaryStep: primaryModel.tier === "human",
      hasResearchStep: researchStep !== null,
      hasArtifactStep: strategy === "premium" && artifactStep !== null,
      requiresHumanApproval: hardGateResult.requiresHumanApproval,
    }),
    estimatedCostLevel: definition.estimatedCostLevel,
    estimatedEffortLevel: definition.estimatedEffortLevel,
    steps,
    warnings: context.warnings,
  };
}

function routeCandidateId(taskId: string, strategy: RouteCandidateStrategy) {
  return `route-${taskId}-${strategy}`;
}

function unavailableCandidate(input: {
  taskId: string;
  strategy: RouteCandidateStrategy;
  label: string;
  reasonCode: RouteCandidateUnavailableReasonCode;
  reason: string;
  warnings: string[];
}): UnavailableRouteCandidate {
  return {
    id: `${routeCandidateId(input.taskId, input.strategy)}-unavailable`,
    taskId: input.taskId,
    strategy: input.strategy,
    label: input.label,
    reasonCode: input.reasonCode,
    reason: input.reason,
    warnings: input.warnings,
  };
}

function selectPreferredModel(
  allowedModels: ModelInventoryItem[],
  preferredTiers: ModelInventoryItem["tier"][],
): ModelInventoryItem | null {
  for (const preferredTier of preferredTiers) {
    const model = allowedModels.find((candidateModel) => candidateModel.tier === preferredTier);
    if (model) {
      return model;
    }
  }

  return null;
}

function buildResearchStep(input: {
  routeId: string;
  task: TaskIntake;
  context: CandidateContext;
}): RouteStep | null {
  const { routeId, task, context } = input;

  if (!task.requiresCurrentFacts && !task.requiresCitations) {
    return null;
  }

  const researchSourceIds = context.allowedSources
    .filter((source) => source.sourceType === "web")
    .map((source) => source.id);
  const researchModel = selectResearchModel(context.allowedModels);

  if (!researchModel || researchSourceIds.length === 0) {
    return null;
  }

  return {
    id: `${routeId}-research`,
    kind: "research",
    label: "Research context check",
    instruction: `Manually consult ${researchModel.label} using only allowed research source IDs: ${formatSourceIds(
      researchSourceIds,
    )}. Capture current facts or citations outside the app before synthesis; the app does not search, fetch, or call the tool.`,
    requiredPermissionLevel: permissionLevelForSourceIds(researchSourceIds, context.allowedSources),
    modelId: researchModel.id,
    sourceIds: researchSourceIds,
    warnings: [],
  };
}

function selectResearchModel(allowedModels: ModelInventoryItem[]): ModelInventoryItem | null {
  const researchTierModel = allowedModels.find((model) => model.tier === "research");
  if (researchTierModel) {
    return researchTierModel;
  }

  return allowedModels.find((model) => model.capabilityScores.research >= 4) ?? null;
}

function buildPrimaryStep(input: {
  routeId: string;
  strategy: RouteCandidateStrategy;
  task: TaskIntake;
  model: ModelInventoryItem;
  context: CandidateContext;
}): RouteStep {
  const { routeId, strategy, task, model, context } = input;
  const sourceText = formatSourceIds(context.allowedSourceIds);

  if (model.tier === "human") {
    return {
      id: `${routeId}-manual`,
      kind: "manual",
      label: "Manual route preparation",
      instruction: `Review the task and allowed source IDs (${sourceText}) manually, then prepare the ${task.outputType}. Treat this app as a planning record only.`,
      requiredPermissionLevel: permissionLevelForSources(context.allowedSources),
      modelId: model.id,
      sourceIds: context.allowedSourceIds,
      warnings: [],
    };
  }

  const kind = model.tier === "artifact" ? "artifact" : "model";

  return {
    id: `${routeId}-${strategy === "premium" && model.tier === "artifact" ? "artifact" : "synthesis"}`,
    kind,
    label: `${model.label} ${kind === "artifact" ? "artifact preparation" : "synthesis"}`,
    instruction: `Use ${model.label} manually outside the app to prepare the ${task.outputType} for this ${task.knowledgeWorkType} task from allowed source IDs (${sourceText}). The app does not send task data to the model.`,
    requiredPermissionLevel: permissionLevelForSources(context.allowedSources),
    modelId: model.id,
    sourceIds: context.allowedSourceIds,
    warnings: [],
  };
}

function buildArtifactStep(input: {
  routeId: string;
  task: TaskIntake;
  primaryModel: ModelInventoryItem;
  context: CandidateContext;
}): RouteStep | null {
  const { routeId, task, primaryModel, context } = input;

  if (!shouldAddArtifactStep(task) || primaryModel.tier === "artifact") {
    return null;
  }

  const artifactModel = selectPreferredModel(context.allowedModels, ["artifact"]);
  if (!artifactModel) {
    return null;
  }

  return {
    id: `${routeId}-artifact`,
    kind: "artifact",
    label: "Artifact packaging",
    instruction: `Use ${artifactModel.label} manually outside the app to package the draft as a ${task.outputType}. Do not add sources beyond the allowed source IDs (${formatSourceIds(
      context.allowedSourceIds,
    )}).`,
    requiredPermissionLevel: permissionLevelForSources(context.allowedSources),
    modelId: artifactModel.id,
    sourceIds: context.allowedSourceIds,
    warnings: [],
  };
}

function shouldAddArtifactStep(task: TaskIntake) {
  return task.knowledgeWorkType === "packaging" || artifactOutputTypes.has(task.outputType);
}

function buildHumanApprovalStep(routeId: string, finalApprovalRouteStep: RouteStep): RouteStep {
  return {
    ...finalApprovalRouteStep,
    id: `${routeId}-human-approval`,
  };
}

function buildCandidateSummary(input: {
  definition: StrategyDefinition;
  policy: PolicyDefault;
  usesManualPrimaryStep: boolean;
  hasResearchStep: boolean;
  hasArtifactStep: boolean;
  requiresHumanApproval: boolean;
}) {
  const routeParts = [
    input.definition.posture,
    input.policy.description,
    input.usesManualPrimaryStep ? "It stays manual because hard gates removed the lighter model path." : null,
    input.hasResearchStep ? "It includes a manual research step for current facts or citations." : null,
    input.hasArtifactStep ? "It includes a packaging step for the requested artifact shape." : null,
    input.requiresHumanApproval ? "It ends with human approval before use." : null,
    "It uses only hard-gate-allowed models and sources.",
  ].filter((part): part is string => part !== null);

  return routeParts.join(" ");
}

function permissionLevelForSourceIds(sourceIds: string[], sources: SourcePermission[]): PermissionLevel {
  const sourceIdSet = new Set(sourceIds);
  return permissionLevelForSources(sources.filter((source) => sourceIdSet.has(source.id)));
}

function permissionLevelForSources(sources: SourcePermission[]): PermissionLevel {
  let highest = 0;

  for (const source of sources) {
    highest = Math.max(highest, source.permissionLevel);
  }

  return highest as PermissionLevel;
}

function formatSourceIds(sourceIds: string[]) {
  return sourceIds.length === 0 ? "none" : sourceIds.join(", ");
}

function uniqueMessages(messages: string[]) {
  return [...new Set(messages)];
}
