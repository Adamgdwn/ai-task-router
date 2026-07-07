import { defaultFinalApprovalRouteStep } from "../defaults/defaultPolicies";
import { everydayToolFrequencyRank } from "../defaults/everydayToolCatalog";
import type { HardGateResult } from "./hardGates";
import type { ModelInventoryItem, PermissionLevel, PolicyDefault, RouteStep, SourcePermission, TaskIntake, WorkRole } from "../types";
import {
  modelInstructionGuidance,
  modelInstructionGuidanceForTask,
  modelLabelWithMinimum,
  modelLabelWithMinimumForTask,
} from "./modelGuidance";
import {
  decomposeTask,
  requestedDeliverableSummary,
  taskHasBuildIntent,
  taskHasModelSelectionIntent,
  type TaskDecomposition,
} from "./taskDecomposition";
import {
  buildToolModeCatalog,
  selectToolModeForRole,
  type ToolModeCandidate,
} from "./toolModeCatalog";

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
  decomposition: TaskDecomposition;
  modes: ToolModeCandidate[];
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
    decomposition: decomposeTask(task),
    modes: buildToolModeCatalog(models.filter((model) => allowedModelIds.has(model.id)), task),
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

  if (strategy !== "lean" && !context.allowedModels.some((model) => model.tier !== "human")) {
    return unavailableCandidate({
      taskId: task.id,
      strategy,
      label: definition.label,
      reasonCode: definition.unavailableReasonCode,
      reason: definition.unavailableReason,
      warnings: context.warnings,
    });
  }

  const roleSelections = selectRouteRoleModes({ strategy, task, context });
  const usableSelections = [
    roleSelections.evidence,
    roleSelections.promptDesign,
    roleSelections.execution,
    roleSelections.artifact,
  ].filter((mode): mode is ToolModeCandidate => mode !== null);
  const usesManualPrimaryStep = usableSelections.length > 0 && usableSelections.every((mode) => mode.modeKind === "manual");
  const usesPremiumBenchmark =
    strategy === "premium" &&
    usableSelections.some((mode) => mode.modeKind === "benchmark") &&
    !context.allowedModels.some((model) => model.tier === "frontier");

  if (!roleSelections.promptDesign && !roleSelections.execution) {
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
  const researchStep = buildEvidenceStep({ routeId, task, context, mode: roleSelections.evidence });
  if (researchStep) {
    steps.push(researchStep);
  }

  const promptStep = roleSelections.promptDesign
    ? buildRoleModeStep({
        routeId,
        task,
        context,
        mode: roleSelections.promptDesign,
        workRole: "prompt-design",
        sourceIds: context.allowedSourceIds,
      })
    : null;
  if (promptStep) {
    steps.push(promptStep);
  }

  const executionWorkRole = taskHasBuildIntent(task) || task.outputType === "code" ? "build-slice" : "execution";
  const executionStep = roleSelections.execution
    ? buildRoleModeStep({
        routeId,
        task,
        context,
        mode: roleSelections.execution,
        workRole: executionWorkRole,
        sourceIds: context.allowedSourceIds,
      })
    : null;
  if (executionStep) {
    steps.push(executionStep);
  }

  const artifactStep = roleSelections.artifact
    ? buildRoleModeStep({
        routeId,
        task,
        context,
        mode: roleSelections.artifact,
        workRole: "artifact-package",
        sourceIds: context.allowedSourceIds,
      })
    : null;
  if (artifactStep) {
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
      hasArtifactStep: artifactStep !== null,
      requiresHumanApproval: hardGateResult.requiresHumanApproval,
      workItemCount: context.decomposition.deliverables.length,
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

function selectRouteRoleModes(input: {
  strategy: RouteCandidateStrategy;
  task: TaskIntake;
  context: CandidateContext;
}): {
  evidence: ToolModeCandidate | null;
  promptDesign: ToolModeCandidate | null;
  execution: ToolModeCandidate | null;
  artifact: ToolModeCandidate | null;
} {
  const { strategy, task, context } = input;
  const executionWorkRole = taskHasBuildIntent(task) || task.outputType === "code" ? "build-slice" : "execution";
  const promptDesign = selectToolModeForRole({ task, modes: context.modes, role: "prompt-design", strategy });
  const execution = selectExecutionModeForRoute({
    strategy,
    task,
    context,
    executionWorkRole,
    promptDesign,
  });

  return {
    evidence: shouldAddEvidenceStep(task, context)
      ? selectToolModeForRole({ task, modes: context.modes, role: "evidence-check", strategy })
      : null,
    promptDesign,
    execution,
    artifact: shouldAddArtifactStep(task)
      ? selectToolModeForRole({ task, modes: context.modes, role: "artifact-package", strategy })
      : null,
  };
}

function selectExecutionModeForRoute(input: {
  strategy: RouteCandidateStrategy;
  task: TaskIntake;
  context: CandidateContext;
  executionWorkRole: WorkRole;
  promptDesign: ToolModeCandidate | null;
}) {
  const { strategy, task, context, executionWorkRole, promptDesign } = input;

  if (strategy === "balanced" && executionWorkRole === "execution" && promptDesign && !context.decomposition.complexBuildPlan) {
    const sameToolModes = context.modes.filter((mode) => mode.modelId === promptDesign.modelId);
    const sameToolExecution = selectToolModeForRole({ task, modes: sameToolModes, role: executionWorkRole, strategy });

    if (sameToolExecution) {
      return sameToolExecution;
    }
  }

  return selectToolModeForRole({ task, modes: context.modes, role: executionWorkRole, strategy });
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

function buildEvidenceStep(input: {
  routeId: string;
  task: TaskIntake;
  context: CandidateContext;
  mode: ToolModeCandidate | null;
}): RouteStep | null {
  const { routeId, task, context, mode } = input;

  if (!shouldAddEvidenceStep(task, context) || !mode) {
    return null;
  }

  const researchSourceIds = context.allowedSources
    .filter((source) => source.sourceType === "web")
    .map((source) => source.id);

  if (researchSourceIds.length === 0) {
    return null;
  }

  return buildRoleModeStep({
    routeId,
    task,
    context,
    mode,
    workRole: "evidence-check",
    sourceIds: researchSourceIds,
  });
}

function buildRoleModeStep(input: {
  routeId: string;
  task: TaskIntake;
  context: CandidateContext;
  mode: ToolModeCandidate;
  workRole: WorkRole;
  sourceIds: string[];
}): RouteStep {
  const { routeId, task, context, mode, workRole, sourceIds } = input;
  const deliverables = context.decomposition.deliverables.filter((deliverable) => deliverable.roles.includes(workRole));
  const deliverableIds = deliverables.length
    ? deliverables.map((deliverable) => deliverable.id)
    : context.decomposition.deliverables.map((deliverable) => deliverable.id);
  const stepKind = routeStepKindForMode(mode, workRole);

  return {
    id: `${routeId}-${workRole}`,
    kind: stepKind,
    label: `${mode.displayLabel}: ${roleActionLabel(workRole, task)}`,
    instruction: roleInstruction({
      task,
      context,
      mode,
      workRole,
      sourceIds,
      deliverableSummary: deliverableIds.length ? deliverableSummaryForIds(context, deliverableIds) : requestedDeliverableSummary(task),
    }),
    requiredPermissionLevel: permissionLevelForSourceIds(sourceIds, context.allowedSources),
    modelId: mode.modelId,
    workRole,
    modeId: mode.id,
    modeLabel: mode.modeLabel,
    deliverableIds,
    selectionReasons: mode.selectionReasons,
    sourceIds,
    warnings: [],
  };
}

function routeStepKindForMode(mode: ToolModeCandidate, workRole: WorkRole): RouteStep["kind"] {
  if (mode.modeKind === "manual") {
    return "manual";
  }

  if (workRole === "evidence-check" || mode.modeKind === "research") {
    return "research";
  }

  if (workRole === "artifact-package" || mode.modeKind === "artifact") {
    return "artifact";
  }

  return "model";
}

function roleActionLabel(workRole: WorkRole, task: TaskIntake) {
  switch (workRole) {
    case "evidence-check":
      return "evidence and model availability check";
    case "prompt-design":
      return taskHasBuildIntent(task) ? "master build prompt" : "master prompt";
    case "execution":
      return "run the finished prompt";
    case "build-slice":
      return "first usable build slice";
    case "artifact-package":
      return "package the result";
    case "quality-review":
      return "quality review";
    case "next-action":
      return "choose the next action";
  }
}

function roleInstruction(input: {
  task: TaskIntake;
  context: CandidateContext;
  mode: ToolModeCandidate;
  workRole: WorkRole;
  sourceIds: string[];
  deliverableSummary: string;
}) {
  const { task, context, mode, workRole, sourceIds, deliverableSummary } = input;
  const sourceText = formatSourceIds(sourceIds);
  const reasonText = mode.selectionReasons.join(" ");
  const upgradeTrigger = upgradeTriggerForRole(workRole, mode, task);

  switch (workRole) {
    case "evidence-check":
      return `Manually use ${mode.displayLabel} for current facts, citations, model availability, and privacy notes before prompt design. Use only allowed source IDs (${sourceText}). Cover ${deliverableSummary}. ${reasonText} The app does not search, fetch, or call the tool.`;
    case "prompt-design":
      return `Use ${mode.displayLabel} for the thinking-heavy prompt-design pass. Build a master prompt that covers ${deliverableSummary}, names allowed inputs, privacy limits, acceptance checks, Plan-Do-Check-Act or light DMAIC stages, the execution helper, and the upgrade trigger. ${context.decomposition.complexBuildPlan ? "Do not create only prompt advice; make the prompt require the actual build plan and first usable slice. " : ""}${reasonText} Upgrade trigger: ${upgradeTrigger}. The app does not send task data to the model.`;
    case "execution":
      return `Run the approved master prompt in ${mode.displayLabel}. Produce the requested ${task.outputType} for ${deliverableSummary}, not another prompt-writing plan. Keep the first pass small enough to review. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`;
    case "build-slice":
      return `Run the approved master prompt in ${mode.displayLabel} to produce the first usable build slice for ${deliverableSummary}. Include data flow, files or screens, acceptance checks, deferred features, and what to do if the first pass fails. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`;
    case "artifact-package":
      return `Use ${mode.displayLabel} to package the reviewed result as ${task.outputType}. Keep sources limited to (${sourceText}) and keep warnings, checks, savings, and next action visible. ${reasonText}`;
    case "quality-review":
      return `Use ${mode.displayLabel} to check the result against the original task, promised deliverables, privacy limits, and acceptance checks. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`;
    case "next-action":
      return `Choose the smallest next action after review. Save what worked, what saved cost or energy, and when this route should be upgraded.`;
  }
}

function upgradeTriggerForRole(workRole: WorkRole, mode: ToolModeCandidate, task: TaskIntake) {
  if (workRole === "evidence-check") {
    return "upgrade only if source coverage, citations, or current model/privacy facts are thin.";
  }

  if (workRole === "prompt-design") {
    return task.qualityBar === "high" || task.qualityBar === "critical"
      ? "upgrade if the prompt misses deliverables, privacy limits, acceptance checks, or the execution model choice."
      : "upgrade if the prompt is vague enough that execution would require guessing.";
  }

  if (workRole === "build-slice" || workRole === "execution") {
    return "upgrade only if the lighter execution pass ignores the master prompt, misses requested deliverables, or fails review twice.";
  }

  if (mode.resourceProfile === "premium") {
    return "downgrade future similar work if this pass did not improve quality enough to justify the added cost and energy.";
  }

  return "upgrade if review finds missing reasoning, missing facts, unsafe handling, or expensive rework.";
}

function deliverableSummaryForIds(context: CandidateContext, deliverableIds: readonly string[]) {
  const deliverableIdSet = new Set(deliverableIds);
  const labels = context.decomposition.deliverables
    .filter((deliverable) => deliverableIdSet.has(deliverable.id))
    .map((deliverable) => deliverable.label);

  return labels.length ? inlineList(labels) : "the requested output";
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

  if (task.knowledgeWorkType === "research" || taskNeedsEvidenceFromDecomposition(task)) {
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
    taskNeedsEvidenceFromDecomposition(task)
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
    deliverableIds: [],
    selectionReasons: ["Current facts and citations require a research-capable helper before synthesis."],
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
      deliverableIds: [],
      selectionReasons: ["Manual preparation remains available when it is the safest or lightest adequate path."],
      sourceIds: context.allowedSourceIds,
      warnings: [],
    };
  }

  const kind = model.tier === "artifact" ? "artifact" : "model";

  return {
    id: `${routeId}-${strategy === "premium" && model.tier === "artifact" ? "artifact" : "synthesis"}`,
    kind,
    label: `${modelLabelWithMinimumForTask(model, task)}: ${primaryActionLabel(task, kind, usesPremiumBenchmark)}`,
    instruction: `${usesPremiumBenchmark ? "Premium comparison route: if you choose this path, use the strongest paid or premium mode you actually have access to; otherwise treat it as a cost and effort benchmark. " : ""}Use ${model.label} manually outside the app in two passes: first create the master prompt with the prompt-building mode, then run that prompt with the execution mode. The result must cover ${requestedDeliverableSummary(
      task,
    )}. ${taskHasBuildIntent(task) ? "For build-shaped work, include the first usable slice, data flow, acceptance checks, and what can wait. " : ""}${taskHasModelSelectionIntent(task) ? "Name the minimum execution model or mode and the upgrade trigger. " : ""}Call out savings or upgrade points for this ${task.knowledgeWorkType} task from allowed source IDs (${sourceText}). ${modelInstructionGuidanceForTask(
      model,
      task,
    )} The app does not send task data to the model.`,
    requiredPermissionLevel: permissionLevelForSources(context.allowedSources),
    modelId: model.id,
    deliverableIds: [],
    selectionReasons: ["Legacy primary route step kept for compatibility with older route construction paths."],
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
    label: `${modelLabelWithMinimumForTask(artifactModel, task)}: artifact packaging`,
    instruction: `Use ${artifactModel.label} manually outside the app to package the draft as a ${task.outputType}. Do not add sources beyond the allowed source IDs (${formatSourceIds(
      context.allowedSourceIds,
    )}). ${modelInstructionGuidanceForTask(artifactModel, task)}`,
    requiredPermissionLevel: permissionLevelForSources(context.allowedSources),
    modelId: artifactModel.id,
    deliverableIds: [],
    selectionReasons: ["An artifact-capable helper is useful for packaging the reviewed result."],
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
  workItemCount: number;
}) {
  const routeParts = [
    input.definition.posture,
    input.policy.description,
    `It decomposes the request into ${input.workItemCount} deliverable-focused part(s), then assigns help by work stage instead of using one helper for everything.`,
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

function shouldAddEvidenceStep(task: TaskIntake, context: Pick<CandidateContext, "decomposition">) {
  return (
    task.requiresCurrentFacts ||
    task.requiresCitations ||
    taskHasModelSelectionIntent(task) ||
    context.decomposition.deliverables.some((deliverable) => deliverable.roles.includes("evidence-check"))
  );
}

function taskNeedsEvidenceFromDecomposition(task: TaskIntake) {
  return (
    task.requiresCurrentFacts ||
    task.requiresCitations ||
    taskHasModelSelectionIntent(task) ||
    decomposeTask(task).deliverables.some((deliverable) => deliverable.roles.includes("evidence-check"))
  );
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

function inlineList(items: readonly string[]) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0] ?? "";
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function uniqueMessages(messages: string[]) {
  return [...new Set(messages)];
}

function averageCapability(model: ModelInventoryItem) {
  const scores = Object.values(model.capabilityScores);
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}
