import { defaultFinalApprovalRouteStep } from "../defaults/defaultPolicies";
import { everydayToolFrequencyRank } from "../defaults/everydayToolCatalog";
import type { HardGateResult } from "./hardGates";
import type { ModelInventoryItem, PermissionLevel, PolicyDefault, RouteStep, SourcePermission, TaskIntake } from "../types";
import { modelInstructionGuidance, modelLabelWithMinimum } from "./modelGuidance";
import { requestedDeliverableSummary, taskHasBuildIntent, taskHasModelSelectionIntent } from "./taskDecomposition";

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
    posture: "Start small: get a usable first pass before spending time or money on heavier tools.",
  },
  balanced: {
    label: "Balanced route",
    estimatedCostLevel: "medium",
    estimatedEffortLevel: "medium",
    primaryModelTiers: ["mid", "frontier"],
    unavailableReasonCode: "no-safe-balanced-path",
    unavailableReason: "No safe mid-tier or synthesis route remains after hard gates.",
    posture: "Use an everyday AI helper for a clearer first draft without jumping to the heaviest option.",
  },
  premium: {
    label: "Premium route",
    estimatedCostLevel: "high",
    estimatedEffortLevel: "high",
    primaryModelTiers: ["frontier", "research", "artifact"],
    unavailableReasonCode: "no-safe-premium-path",
    unavailableReason: "No safe frontier, research, or artifact route remains after hard gates.",
    posture: "Use the strongest helper when quality, uncertainty, or rework cost matters.",
  },
};

const artifactOutputTypes = new Set(["table", "slide outline", "route card", "prompt package"]);
const premiumBenchmarkWarning =
  "No premium-capacity helper is saved for this task, so the premium route is shown as a comparison benchmark using the strongest safe helper currently selected.";

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
  const allowedSourceIds = hardGateResult.allowedSourceIds;
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

  const primaryModel = selectPreferredModel(context.allowedModels, primaryModelTiersForStrategy(strategy, task, definition));
  const premiumBenchmarkModel =
    strategy === "premium" && !primaryModel ? selectPremiumBenchmarkModel(context.allowedModels, task) : null;
  const resolvedPrimaryModel = primaryModel ?? premiumBenchmarkModel;
  const usesPremiumBenchmark = strategy === "premium" && !primaryModel && premiumBenchmarkModel !== null;
  const usesManualPrimaryStep = resolvedPrimaryModel?.tier === "human";

  if (!resolvedPrimaryModel) {
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

  steps.push(buildPrimaryStep({ routeId, strategy, task, model: resolvedPrimaryModel, context, usesPremiumBenchmark }));

  const artifactStep = buildArtifactStep({ routeId, task, primaryModel: resolvedPrimaryModel, context });
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
      usesManualPrimaryStep,
      usesPremiumBenchmark,
      hasResearchStep: researchStep !== null,
      hasArtifactStep: strategy === "premium" && artifactStep !== null,
      requiresHumanApproval: hardGateResult.requiresHumanApproval,
    }),
    estimatedCostLevel: definition.estimatedCostLevel,
    estimatedEffortLevel: usesManualPrimaryStep ? "high" : definition.estimatedEffortLevel,
    steps,
    warnings: usesPremiumBenchmark ? uniqueMessages([...context.warnings, premiumBenchmarkWarning]) : context.warnings,
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
  const preferredTierRank = new Map(preferredTiers.map((tier, index) => [tier, index]));
  const matchingModels = allowedModels.filter((candidateModel) => preferredTierRank.has(candidateModel.tier));

  return [...matchingModels].sort((left, right) => {
    const tierComparison = (preferredTierRank.get(left.tier) ?? 99) - (preferredTierRank.get(right.tier) ?? 99);
    const frequencyComparison = everydayToolFrequencyRank(right) - everydayToolFrequencyRank(left);
    const capabilityComparison = averageCapability(right) - averageCapability(left);

    return tierComparison || frequencyComparison || capabilityComparison || left.label.localeCompare(right.label);
  })[0] ?? null;
}

function primaryModelTiersForStrategy(
  strategy: RouteCandidateStrategy,
  task: TaskIntake,
  definition: StrategyDefinition,
): ModelInventoryItem["tier"][] {
  if (strategy !== "premium") {
    return definition.primaryModelTiers;
  }

  const premiumTiers: ModelInventoryItem["tier"][] = ["frontier"];

  if (task.knowledgeWorkType === "research" || (task.outputType === "answer" && (task.requiresCurrentFacts || task.requiresCitations))) {
    premiumTiers.push("research");
  }

  if (shouldAddArtifactStep(task)) {
    premiumTiers.push("artifact");
  }

  return premiumTiers;
}

function selectPremiumBenchmarkModel(
  allowedModels: ModelInventoryItem[],
  task: TaskIntake,
): ModelInventoryItem | null {
  const safeAiModels = allowedModels.filter((model) => model.tier !== "human");
  const fallbackTiers: ModelInventoryItem["tier"][] = ["frontier", "mid", "small", "artifact"];

  if (
    task.knowledgeWorkType === "research" ||
    (task.outputType === "answer" && (task.requiresCurrentFacts || task.requiresCitations))
  ) {
    fallbackTiers.splice(1, 0, "research");
  }

  return selectPreferredModel(safeAiModels, fallbackTiers);
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
    label: `${modelLabelWithMinimum(researchModel)}: current facts check`,
    instruction: `Manually consult ${researchModel.label} using only allowed research source IDs: ${formatSourceIds(
      researchSourceIds,
    )}. ${modelInstructionGuidance(
      researchModel,
    )} Capture current facts or citations outside the app before synthesis; the app does not search, fetch, or call the tool.`,
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
  usesPremiumBenchmark?: boolean;
}): RouteStep {
  const { routeId, strategy, task, model, context, usesPremiumBenchmark = false } = input;
  const sourceText = formatSourceIds(context.allowedSourceIds);

  if (model.tier === "human") {
    return {
      id: `${routeId}-manual`,
      kind: "manual",
      label: "You-first project plan",
      instruction: `Evaluate the task manually, write the master prompt first, then prepare the ${task.outputType} from allowed source IDs (${sourceText}). Note what would justify using an AI helper or premium route. Treat this app as a planning record only.`,
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
    label: `${modelLabelWithMinimum(model)}: ${primaryActionLabel(task, kind, usesPremiumBenchmark)}`,
    instruction: `${usesPremiumBenchmark ? "Premium comparison route: if you choose this path, use the strongest paid or premium mode you actually have access to; otherwise treat it as a cost and effort benchmark. " : ""}Use ${model.label} manually outside the app in two passes: first create the master prompt with the prompt-building mode, then run that prompt with the execution mode. The result must cover ${requestedDeliverableSummary(
      task,
    )}. ${taskHasBuildIntent(task) ? "For build-shaped work, include the first usable slice, data flow, acceptance checks, and what can wait. " : ""}${taskHasModelSelectionIntent(task) ? "Name the minimum execution model or mode and the upgrade trigger. " : ""}Call out savings or upgrade points for this ${task.knowledgeWorkType} task from allowed source IDs (${sourceText}). ${modelInstructionGuidance(
      model,
    )} The app does not send task data to the model.`,
    requiredPermissionLevel: permissionLevelForSources(context.allowedSources),
    modelId: model.id,
    sourceIds: context.allowedSourceIds,
    warnings: [],
  };
}

function primaryActionLabel(task: TaskIntake, kind: RouteStep["kind"], usesPremiumBenchmark = false) {
  if (usesPremiumBenchmark) {
    return "premium comparison pass";
  }

  if (kind === "artifact") {
    return "package the result";
  }

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return "design and run the plan prompt";
  }

  if (task.knowledgeWorkType === "coding") {
    return "design the build prompt";
  }

  if (task.knowledgeWorkType === "analysis" || task.knowledgeWorkType === "review") {
    return "design the evaluation prompt";
  }

  return "build and run the prompt";
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
    label: `${modelLabelWithMinimum(artifactModel)}: artifact packaging`,
    instruction: `Use ${artifactModel.label} manually outside the app to package the draft as a ${task.outputType}. Do not add sources beyond the allowed source IDs (${formatSourceIds(
      context.allowedSourceIds,
    )}). ${modelInstructionGuidance(artifactModel)}`,
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
  usesPremiumBenchmark: boolean;
  hasResearchStep: boolean;
  hasArtifactStep: boolean;
  requiresHumanApproval: boolean;
}) {
  const routeParts = [
    input.definition.posture,
    input.policy.description,
    input.usesManualPrimaryStep
      ? "Because no lighter AI helper is selected for this route, the work stays with you and should be treated as higher effort."
      : null,
    input.usesPremiumBenchmark
      ? "It stays visible as a premium benchmark so the lower-cost route can be compared with heavier premium-style use."
      : null,
    input.hasResearchStep ? "It includes a current-facts check before prompt design and execution." : null,
    input.hasArtifactStep ? "It includes a packaging step for the requested artifact shape." : null,
    input.requiresHumanApproval ? "It ends with human approval before anything important is used." : null,
    "It uses only the helpers and information allowed by your choices.",
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

function averageCapability(model: ModelInventoryItem) {
  const scores = Object.values(model.capabilityScores);
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}
