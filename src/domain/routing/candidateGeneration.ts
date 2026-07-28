import { defaultFinalApprovalRouteStep } from "../defaults/defaultPolicies";
import type { HardGateResult } from "./hardGates";
import type { ModelInventoryItem, PermissionLevel, PolicyDefault, RouteStep, SourcePermission, TaskIntake, WorkRole } from "../types";
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
  toolModeCapabilityForRole,
  type ToolModeCandidate,
} from "./toolModeCatalog";
import {
  analyzeTaskReasoning,
  capabilityTargetForRole,
  taskReasoningSummary,
  type TaskReasoningProfile,
} from "./taskReasoning";

const routeCandidateStrategies = ["lean", "balanced", "premium"] as const;

export type RouteCandidateStrategy = (typeof routeCandidateStrategies)[number];
export type RouteCandidateCostLevel = "low" | "medium" | "high";
export type RouteCandidateEffortLevel = "low" | "medium" | "high";

type RouteCandidateUnavailableReasonCode =
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

type GenerateRouteCandidatesInput = {
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
  reasoning: TaskReasoningProfile;
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

  const decomposition = decomposeTask(task);

  return {
    allowedModels: models.filter((model) => allowedModelIds.has(model.id)),
    allowedSourceIds,
    allowedSources: task.sourcePermissions.filter((source) => allowedSourceIdSet.has(source.id)),
    decomposition,
    reasoning: analyzeTaskReasoning(task, decomposition),
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
  const primarySelections = [
    roleSelections.promptDesign,
    roleSelections.execution,
    roleSelections.artifact,
  ].filter((mode): mode is ToolModeCandidate => mode !== null);
  const usableSelections = [
    roleSelections.evidence,
    ...primarySelections,
    roleSelections.review,
  ].filter((mode): mode is ToolModeCandidate => mode !== null);
  const usesManualPrimaryStep =
    primarySelections.length > 0 && primarySelections.every((mode) => mode.modeKind === "manual");
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
        usesSeparatePromptDesign: true,
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
        usesSeparatePromptDesign: promptStep !== null,
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

  const reviewStep = roleSelections.review
    ? buildRoleModeStep({
        routeId,
        task,
        context,
        mode: roleSelections.review,
        workRole: "quality-review",
        sourceIds: context.allowedSourceIds,
      })
    : null;
  if (reviewStep) {
    steps.push(reviewStep);
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
      usesManualPrimaryStep,
      usesPremiumBenchmark,
      hasResearchStep: researchStep !== null,
      hasPromptStep: promptStep !== null,
      hasArtifactStep: artifactStep !== null,
      hasReviewStep: reviewStep !== null,
      requiresHumanApproval: hardGateResult.requiresHumanApproval,
      workItemCount: context.decomposition.deliverables.length,
      reasoning: context.reasoning,
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
  review: ToolModeCandidate | null;
} {
  const { strategy, task, context } = input;
  const executionWorkRole = context.reasoning.primaryWorkRole;
  const execution =
    context.reasoning.promptArtifactRequested && !context.reasoning.explicitPromptHandoff
      ? null
      : selectExecutionModeForRoute({
          strategy,
          task,
          context,
          executionWorkRole,
          promptDesign: null,
        });
  const promptCandidate = selectToolModeForRole({
    task,
    modes: context.modes,
    role: "prompt-design",
    strategy,
    minimumCapability: capabilityTargetForRole(task, context.reasoning, "prompt-design", strategy),
  });
  const promptDesign = shouldUseSeparatePromptPass({
    strategy,
    task,
    profile: context.reasoning,
    promptCandidate,
    execution,
  })
    ? withDecisionReasons(promptCandidate, [
        taskReasoningSummary(context.reasoning),
        "A separate planning handoff earns its place here because the build executor benefits from a checked specification before implementation starts.",
      ])
    : null;
  const selectedExecution =
    promptDesign && execution
      ? selectExecutionModeForRoute({
          strategy,
          task,
          context,
          executionWorkRole,
          promptDesign,
        })
      : execution;
  const directExecution =
    !promptDesign && selectedExecution
      ? directWorkMode(selectedExecution, task, context.reasoning)
      : selectedExecution
        ? withDecisionReasons(selectedExecution, [
            `This mode is assigned to the ${executionWorkRole === "build-slice" ? "implementation" : "finished-output"} stage after the planning handoff.`,
          ])
        : null;
  const artifact = selectArtifactMode({ strategy, task, context, execution: directExecution });
  const review = selectReviewMode({
    strategy,
    task,
    context,
    usedModelIds: [promptDesign?.modelId, directExecution?.modelId, artifact?.modelId].filter(
      (modelId): modelId is string => modelId !== undefined,
    ),
  });

  return {
    evidence: shouldAddEvidenceStep(task, context)
      ? withDecisionReasons(
          selectToolModeForRole({
            task,
            modes: context.modes,
            role: "evidence-check",
            strategy,
            minimumCapability: capabilityTargetForRole(task, context.reasoning, "evidence-check", strategy),
          }),
          [
            task.requiresCitations
              ? "This stage is required because the result needs citations that can be checked."
              : "This stage is required because current facts or source-backed assumptions affect the result.",
          ],
        )
      : null,
    promptDesign,
    execution: directExecution,
    artifact,
    review,
  };
}

function directWorkMode(mode: ToolModeCandidate, task: TaskIntake, profile: TaskReasoningProfile): ToolModeCandidate {
  const modeLabel = mode.modeLabel
    .replace("after the master prompt is clear", "for direct execution")
    .replace("after the prompt is clear", "for direct execution")
    .replace("for the master prompt", "for direct reasoning")
    .replace("once the master prompt is clear", "for direct execution");
  const displayLabel =
    mode.providerId === "none"
      ? mode.displayLabel
      : `${mode.providerLabel} ${mode.accountLabel} - ${modeLabel}`;

  return {
    ...mode,
    modeLabel,
    displayLabel,
    selectionReasons: [
      taskReasoningSummary(profile),
      `The selected mode meets the ${profile.demand} reasoning target for this ${task.knowledgeWorkType} task.`,
      "The route produces the requested output directly because no separate prompt handoff adds enough value for this task.",
      ...mode.selectionReasons.filter((reason) => !/\b(prompt|downstream)\b/i.test(reason)),
    ],
  };
}

function shouldUseSeparatePromptPass(input: {
  strategy: RouteCandidateStrategy;
  task: TaskIntake;
  profile: TaskReasoningProfile;
  promptCandidate: ToolModeCandidate | null;
  execution: ToolModeCandidate | null;
}) {
  const { strategy, task, profile, promptCandidate, execution } = input;

  if (!promptCandidate) {
    return false;
  }

  if (profile.promptArtifactRequested && !profile.explicitPromptHandoff) {
    return true;
  }

  if (profile.explicitPromptHandoff) {
    return true;
  }

  if (!profile.benefitsFromPromptHandoff || !execution || strategy === "lean") {
    return false;
  }

  if (promptCandidate.id === execution.id) {
    return false;
  }

  const promptCapability = toolModeCapabilityForRole(promptCandidate.capabilityScores, "prompt-design", task);
  const executionReasoning = execution.capabilityScores.reasoning;

  return (
    execution.modeKind === "build" ||
    strategy === "premium" ||
    promptCapability >= executionReasoning + 0.35
  );
}

function selectArtifactMode(input: {
  strategy: RouteCandidateStrategy;
  task: TaskIntake;
  context: CandidateContext;
  execution: ToolModeCandidate | null;
}) {
  const { strategy, task, context, execution } = input;

  if (!context.reasoning.benefitsFromSpecialistPackaging) {
    return null;
  }

  const artifact = selectToolModeForRole({
    task,
    modes: context.modes,
    role: "artifact-package",
    strategy,
    minimumCapability: capabilityTargetForRole(task, context.reasoning, "artifact-package", strategy),
  });

  if (!artifact || artifact.id === execution?.id) {
    return null;
  }

  const executionPackaging = execution?.capabilityScores.packaging ?? 0;
  if (artifact.capabilityScores.packaging <= executionPackaging && task.knowledgeWorkType !== "packaging") {
    return null;
  }

  return withDecisionReasons(artifact, [
    `A specialist packaging pass earns its place because the requested ${task.outputType} benefits from a tool built for that artifact.`,
  ]);
}

function selectReviewMode(input: {
  strategy: RouteCandidateStrategy;
  task: TaskIntake;
  context: CandidateContext;
  usedModelIds: string[];
}) {
  const { strategy, task, context, usedModelIds } = input;

  if (!context.reasoning.benefitsFromIndependentReview || strategy === "lean") {
    return null;
  }

  const reviewModes = context.modes.filter(
    (mode) => mode.modeKind !== "manual" && (context.reasoning.requiresEvidence || mode.modeKind !== "research"),
  );
  const target = capabilityTargetForRole(task, context.reasoning, "quality-review", strategy);
  const independentReview = selectToolModeForRole({
    task,
    modes: reviewModes,
    role: "quality-review",
    strategy,
    minimumCapability: target,
    requireMinimumCapability: true,
    excludedModelIds: usedModelIds,
  });
  const review =
    independentReview ??
    (task.qualityBar === "critical"
      ? selectToolModeForRole({
          task,
          modes: reviewModes,
          role: "quality-review",
          strategy,
          minimumCapability: target,
          requireMinimumCapability: true,
        })
      : null);

  if (!review) {
    return null;
  }

  return withDecisionReasons(review, [
    taskReasoningSummary(context.reasoning),
    independentReview
      ? "A different saved helper is used for review so the check is not performed by the same model that produced the result."
      : "No adequate independent helper is available, so a focused second pass is used before the required human decision.",
  ]);
}

function withDecisionReasons(
  mode: ToolModeCandidate | null,
  decisionReasons: string[],
): ToolModeCandidate | null {
  if (!mode) {
    return null;
  }

  return {
    ...mode,
    selectionReasons: uniqueMessages([...decisionReasons, ...mode.selectionReasons]),
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
  const baseCapabilityTarget = capabilityTargetForRole(task, context.reasoning, executionWorkRole, strategy);
  const minimumCapability = promptDesign
    ? Math.max(1, baseCapabilityTarget - 1.35)
    : baseCapabilityTarget;

  if (strategy === "balanced" && executionWorkRole === "execution" && promptDesign && !context.decomposition.complexBuildPlan) {
    const sameToolModes = context.modes.filter((mode) => mode.modelId === promptDesign.modelId);
    const sameToolExecution = selectToolModeForRole({
      task,
      modes: sameToolModes,
      role: executionWorkRole,
      strategy,
      minimumCapability,
    });

    if (sameToolExecution) {
      return sameToolExecution;
    }
  }

  return selectToolModeForRole({
    task,
    modes: context.modes,
    role: executionWorkRole,
    strategy,
    minimumCapability,
  });
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
  usesSeparatePromptDesign?: boolean;
}): RouteStep {
  const { routeId, task, context, mode, workRole, sourceIds, usesSeparatePromptDesign = false } = input;
  const deliverables = context.decomposition.deliverables.filter((deliverable) => deliverable.roles.includes(workRole));
  const deliverableIds = deliverables.length
    ? deliverables.map((deliverable) => deliverable.id)
    : context.decomposition.deliverables.map((deliverable) => deliverable.id);
  const stepKind = routeStepKindForMode(mode, workRole);

  return {
    id: `${routeId}-${workRole}`,
    kind: stepKind,
    label: `${mode.displayLabel}: ${roleActionLabel(workRole, task, usesSeparatePromptDesign)}`,
    instruction: roleInstruction({
      task,
      context,
      mode,
      workRole,
      sourceIds,
      usesSeparatePromptDesign,
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

function roleActionLabel(workRole: WorkRole, task: TaskIntake, usesSeparatePromptDesign: boolean) {
  switch (workRole) {
    case "evidence-check":
      return "evidence and model availability check";
    case "prompt-design":
      return taskHasBuildIntent(task) ? "master build prompt" : "master prompt";
    case "execution":
      return usesSeparatePromptDesign ? "run the finished prompt" : `produce the requested ${task.outputType} directly`;
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
  usesSeparatePromptDesign: boolean;
  deliverableSummary: string;
}) {
  const { task, context, mode, workRole, sourceIds, usesSeparatePromptDesign, deliverableSummary } = input;
  const sourceText = formatSourceIds(sourceIds);
  const reasonText = mode.selectionReasons.join(" ");
  const upgradeTrigger = upgradeTriggerForRole(workRole, mode, task, usesSeparatePromptDesign);

  switch (workRole) {
    case "evidence-check":
      return `Manually use ${mode.displayLabel} for current facts, citations, model availability, and privacy notes before relying on the result. Use only allowed source IDs (${sourceText}). Cover ${deliverableSummary}. ${reasonText} The app does not search, fetch, or call the tool.`;
    case "prompt-design":
      return `Use ${mode.displayLabel} for the thinking-heavy prompt-design pass. Build a master prompt that covers ${deliverableSummary}, names allowed inputs, privacy limits, acceptance checks, four sections only (Plan, Do, Check, Act), the execution helper, and the upgrade trigger. ${context.decomposition.complexBuildPlan ? "Do not create only prompt advice; make the prompt require the actual build plan and first usable slice. " : ""}${reasonText} Upgrade trigger: ${upgradeTrigger}. The app does not send task data to the model.`;
    case "execution":
      return usesSeparatePromptDesign
        ? `Run the approved master prompt in ${mode.displayLabel}. Produce the requested ${task.outputType} for ${deliverableSummary}, not another prompt-writing plan. Keep the first pass small enough to review. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`
        : `Use ${mode.displayLabel} to produce the requested ${task.outputType} directly for ${deliverableSummary}. Preserve the user's stated requirements and mark missing information instead of inventing it. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`;
    case "build-slice":
      return usesSeparatePromptDesign
        ? `Run the approved master prompt in ${mode.displayLabel} to produce the first usable build slice for ${deliverableSummary}. Include data flow, files or screens, acceptance checks, deferred features, and what to do if the first pass fails. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`
        : `Use ${mode.displayLabel} to produce the first usable build slice directly for ${deliverableSummary}. Include data flow, files or screens, acceptance checks, deferred features, and what to do if the first pass fails. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`;
    case "artifact-package":
      return `Use ${mode.displayLabel} to package the reviewed result as ${task.outputType}. Keep sources limited to (${sourceText}) and keep warnings, checks, impact notes, and next action visible. ${reasonText}`;
    case "quality-review":
      return `Use ${mode.displayLabel} to check the result against the original task, promised deliverables, privacy limits, and acceptance checks. ${reasonText} Upgrade trigger: ${upgradeTrigger}.`;
    case "next-action":
      return `Choose the smallest next action after review. Save what worked, what saved cost or energy, and when this route should be upgraded.`;
  }
}

function upgradeTriggerForRole(
  workRole: WorkRole,
  mode: ToolModeCandidate,
  task: TaskIntake,
  usesSeparatePromptDesign: boolean,
) {
  if (workRole === "evidence-check") {
    return "upgrade only if source coverage, citations, or current model/privacy facts are thin.";
  }

  if (workRole === "prompt-design") {
    return task.qualityBar === "high" || task.qualityBar === "critical"
      ? "upgrade if the prompt misses deliverables, privacy limits, acceptance checks, or the execution model choice."
      : "upgrade if the prompt is vague enough that execution would require guessing.";
  }

  if (workRole === "build-slice" || workRole === "execution") {
    return usesSeparatePromptDesign
      ? "upgrade only if the lighter execution pass ignores the master prompt, misses requested deliverables, or fails review twice."
      : "upgrade only if the direct result misses requested deliverables or fails review after a focused retry.";
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

function buildHumanApprovalStep(routeId: string, finalApprovalRouteStep: RouteStep): RouteStep {
  return {
    ...finalApprovalRouteStep,
    id: `${routeId}-human-approval`,
  };
}

function buildCandidateSummary(input: {
  definition: StrategyDefinition;
  usesManualPrimaryStep: boolean;
  usesPremiumBenchmark: boolean;
  hasResearchStep: boolean;
  hasPromptStep: boolean;
  hasArtifactStep: boolean;
  hasReviewStep: boolean;
  requiresHumanApproval: boolean;
  workItemCount: number;
  reasoning: TaskReasoningProfile;
}) {
  const routeParts = [
    taskReasoningSummary(input.reasoning),
    input.definition.posture,
    `It keeps ${input.workItemCount} requested part(s) visible while choosing only the stages that add value.`,
    input.usesManualPrimaryStep
      ? "Because no lighter AI helper is selected for this route, the work stays with you and should be treated as higher effort."
      : null,
    input.usesPremiumBenchmark
      ? "It stays visible as a premium benchmark so the lower-cost route can be compared with heavier premium-style use."
      : null,
    input.hasResearchStep ? "A source check is included because evidence affects the answer." : null,
    input.hasPromptStep
      ? input.reasoning.promptArtifactRequested
        ? "Prompt design is the requested output."
        : "A planning handoff is included because it adds useful structure before specialist execution."
      : "The main helper produces the requested output directly; a prompt-only handoff did not earn a place.",
    input.hasArtifactStep ? "A specialist packaging pass is included because it improves the requested artifact." : null,
    input.hasReviewStep ? "A separate AI review is included because an independent check adds value here." : null,
    input.requiresHumanApproval ? "It ends with human approval before anything important is used." : null,
    "It uses only the helpers and information allowed by your choices.",
  ].filter((part): part is string => part !== null);

  return routeParts.join(" ");
}

function shouldAddEvidenceStep(task: TaskIntake, context: Pick<CandidateContext, "decomposition">) {
  return taskNeedsEvidenceCheckFromDecomposition(task, context.decomposition);
}

function taskNeedsEvidenceCheckFromDecomposition(task: TaskIntake, decomposition: TaskDecomposition) {
  return (
    task.requiresCurrentFacts ||
    task.requiresCitations ||
    taskHasModelSelectionIntent(task) ||
    decomposition.deliverables.some((deliverable) => deliverable.roles.includes("evidence-check"))
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
