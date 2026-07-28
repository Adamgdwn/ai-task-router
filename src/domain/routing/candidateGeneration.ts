import { defaultFinalApprovalRouteStep } from "../defaults/defaultPolicies";
import type { HardGateResult } from "./hardGates";
import type { ModelInventoryItem, PermissionLevel, PolicyDefault, RouteStep, SourcePermission, TaskIntake, WorkRole } from "../types";
import {
  decomposeTask,
  requestedDeliverableSummary,
  taskHasBuildIntent,
  type TaskDecomposition,
} from "./taskDecomposition";
import {
  buildToolModeCatalog,
  selectToolModeForRole,
  type ToolModeCandidate,
} from "./toolModeCatalog";
import {
  analyzeTaskReasoning,
  capabilityTargetForRole,
  taskReasoningSummary,
  type TaskReasoningProfile,
} from "./taskReasoning";
import {
  buildTaskWorkPlan,
  workStageForRole,
  type TaskWorkPlan,
} from "./taskWorkPlan";

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
  workPlan: TaskWorkPlan;
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
  const reasoning = analyzeTaskReasoning(task, decomposition);

  return {
    allowedModels: models.filter((model) => allowedModelIds.has(model.id)),
    allowedSourceIds,
    allowedSources: task.sourcePermissions.filter((source) => allowedSourceIdSet.has(source.id)),
    decomposition,
    reasoning,
    workPlan: buildTaskWorkPlan(task, decomposition, reasoning),
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
    context.workPlan.primaryWorkRole === "scope-framing" ? roleSelections.scopeFraming : null,
    context.workPlan.primaryWorkRole === "evidence-check" ? roleSelections.evidence : null,
    context.workPlan.primaryWorkRole === "plan-synthesis" ? roleSelections.planSynthesis : null,
    context.workPlan.primaryWorkRole === "prompt-design" ? roleSelections.promptDesign : null,
    context.workPlan.primaryWorkRole === "execution" || context.workPlan.primaryWorkRole === "build-slice"
      ? roleSelections.execution
      : null,
    context.workPlan.primaryWorkRole === "artifact-package" ? roleSelections.artifact : null,
    context.workPlan.primaryWorkRole === "quality-review" ? roleSelections.review : null,
  ].filter((mode): mode is ToolModeCandidate => mode !== null);
  const usableSelections = [
    roleSelections.scopeFraming,
    roleSelections.evidence,
    ...primarySelections,
    roleSelections.review,
    roleSelections.nextAction,
  ].filter((mode): mode is ToolModeCandidate => mode !== null);
  const usesManualPrimaryStep =
    primarySelections.length > 0 && primarySelections.every((mode) => mode.modeKind === "manual");
  const usesPremiumBenchmark =
    strategy === "premium" &&
    usableSelections.some((mode) => mode.modeKind === "benchmark") &&
    !context.allowedModels.some((model) => model.tier === "frontier");

  if (primarySelections.length === 0) {
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
  const scopeStep = roleSelections.scopeFraming
    ? buildRoleModeStep({
        routeId,
        task,
        context,
        mode: roleSelections.scopeFraming,
        workRole: "scope-framing",
        sourceIds: context.allowedSourceIds,
      })
    : null;
  if (scopeStep) {
    steps.push(scopeStep);
  }

  const researchStep = buildEvidenceStep({ routeId, task, context, mode: roleSelections.evidence });
  if (researchStep) {
    steps.push(researchStep);
  }

  const planStep = roleSelections.planSynthesis
    ? buildRoleModeStep({
        routeId,
        task,
        context,
        mode: roleSelections.planSynthesis,
        workRole: "plan-synthesis",
        sourceIds: context.allowedSourceIds,
      })
    : null;
  if (planStep) {
    steps.push(planStep);
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

  const nextActionStep = roleSelections.nextAction
    ? buildRoleModeStep({
        routeId,
        task,
        context,
        mode: roleSelections.nextAction,
        workRole: "next-action",
        sourceIds: context.allowedSourceIds,
      })
    : null;
  if (nextActionStep) {
    steps.push(nextActionStep);
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
      hasScopeStep: scopeStep !== null,
      hasResearchStep: researchStep !== null,
      hasPlanStep: planStep !== null,
      hasPromptStep: promptStep !== null,
      hasArtifactStep: artifactStep !== null,
      hasReviewStep: reviewStep !== null,
      hasNextActionStep: nextActionStep !== null,
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
  scopeFraming: ToolModeCandidate | null;
  evidence: ToolModeCandidate | null;
  planSynthesis: ToolModeCandidate | null;
  promptDesign: ToolModeCandidate | null;
  execution: ToolModeCandidate | null;
  artifact: ToolModeCandidate | null;
  review: ToolModeCandidate | null;
  nextAction: ToolModeCandidate | null;
} {
  const { strategy, task, context } = input;
  const scopeStage = workStageForRole(context.workPlan, "scope-framing");
  const scopeFraming = scopeStage
    ? withDecisionReasons(
        selectToolModeForRole({
          task,
          modes: context.modes,
          role: "scope-framing",
          strategy,
          minimumCapability: capabilityTargetForRole(task, context.reasoning, "scope-framing", strategy),
        }),
        [
          taskReasoningSummary(context.reasoning),
          ...scopeStage.selectionReasons,
          context.allowedSources.some((source) => source.sourceType === "web")
            ? "Approved public sources may be used where they materially improve the scope."
            : "No outside source is approved, so frame the scope from the request only and mark any fact that would need checking.",
        ],
        "scope-framing",
      )
    : null;
  const evidenceStage = workStageForRole(context.workPlan, "evidence-check");
  const evidence = evidenceStage
    ? withDecisionReasons(
        selectToolModeForRole({
          task,
          modes: context.modes,
          role: "evidence-check",
          strategy,
          minimumCapability: capabilityTargetForRole(task, context.reasoning, "evidence-check", strategy),
        }),
        [
          ...evidenceStage.selectionReasons,
        ],
      )
    : null;
  const planStage = workStageForRole(context.workPlan, "plan-synthesis");
  const planSynthesis = planStage
    ? withDecisionReasons(
        selectToolModeForRole({
          task,
          modes: context.modes,
          role: "plan-synthesis",
          strategy,
          minimumCapability: capabilityTargetForRole(task, context.reasoning, "plan-synthesis", strategy),
        }),
        [
          taskReasoningSummary(context.reasoning),
          ...planStage.selectionReasons,
        ],
        "plan-synthesis",
      )
    : null;
  const promptStage = workStageForRole(context.workPlan, "prompt-design");
  const promptDesign =
    promptStage
      ? withDecisionReasons(
          selectToolModeForRole({
            task,
            modes: context.modes,
            role: "prompt-design",
            strategy,
            minimumCapability: capabilityTargetForRole(task, context.reasoning, "prompt-design", strategy),
          }),
          [
            taskReasoningSummary(context.reasoning),
            ...promptStage.selectionReasons,
          ],
        )
      : null;
  const executionStage =
    workStageForRole(context.workPlan, "build-slice") ??
    workStageForRole(context.workPlan, "execution");
  const executionWorkRole: WorkRole =
    executionStage?.workRole === "build-slice" ? "build-slice" : "execution";
  const selectedExecution = executionStage
    ? selectExecutionModeForRoute({
          strategy,
          task,
          context,
          executionWorkRole,
          promptDesign: promptDesign ?? planSynthesis,
        })
    : null;
  const directExecution =
    !promptDesign && !planSynthesis && selectedExecution
      ? directWorkMode(selectedExecution, task, context.reasoning)
      : selectedExecution
        ? withDecisionReasons(selectedExecution, [
            `This mode is assigned to the ${executionWorkRole === "build-slice" ? "implementation" : "finished-output"} stage after the scope and planning work.`,
          ])
        : null;
  const artifact = workStageForRole(context.workPlan, "artifact-package")
    ? selectArtifactMode({ strategy, task, context, execution: directExecution })
    : null;
  const usedBeforeReview = [scopeFraming, evidence, planSynthesis, promptDesign, directExecution, artifact];
  const review = selectReviewMode({
    strategy,
    task,
    context,
    usedModelIds: usedBeforeReview.map((mode) => mode?.modelId).filter(
      (modelId): modelId is string => modelId !== undefined,
    ),
  });
  const nextAction =
    workStageForRole(context.workPlan, "next-action") && strategy !== "lean"
      ? selectNextActionMode({
          task,
          strategy,
          context,
          usedModelIds: [planSynthesis?.modelId, review?.modelId].filter(
            (modelId): modelId is string => modelId !== undefined,
          ),
        })
      : null;

  return {
    scopeFraming,
    evidence,
    planSynthesis,
    promptDesign,
    execution: directExecution,
    artifact,
    review,
    nextAction,
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

  if (
    !workStageForRole(context.workPlan, "quality-review") ||
    (strategy === "lean" && context.workPlan.primaryWorkRole !== "quality-review")
  ) {
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

function selectNextActionMode(input: {
  task: TaskIntake;
  strategy: RouteCandidateStrategy;
  context: CandidateContext;
  usedModelIds: string[];
}) {
  const { task, strategy, context, usedModelIds } = input;
  const target = capabilityTargetForRole(task, context.reasoning, "next-action", strategy);
  const usableModes = context.modes.filter((mode) => mode.modeKind !== "benchmark");
  const independent = selectToolModeForRole({
    task,
    modes: usableModes,
    role: "next-action",
    strategy: "lean",
    minimumCapability: target,
    requireMinimumCapability: true,
    excludedModelIds: usedModelIds,
  });
  const selected =
    independent ??
    selectToolModeForRole({
      task,
      modes: usableModes,
      role: "next-action",
      strategy: "lean",
      minimumCapability: target,
    });

  if (!selected) {
    return null;
  }

  return withDecisionReasons(selected, [
    independent
      ? "A different lightweight saved helper turns the approved plan into a short action handoff without spending another heavy reasoning pass."
      : "No adequate independent helper is available, so the lightest adequate saved mode handles the action handoff.",
    "This stage must operationalize the approved plan, not reopen its scope or rewrite its reasoning.",
  ], "next-action");
}

function withDecisionReasons(
  mode: ToolModeCandidate | null,
  decisionReasons: string[],
  assignedRole?: WorkRole,
): ToolModeCandidate | null {
  if (!mode) {
    return null;
  }

  const adaptedMode = assignedRole ? adaptModeForAssignedRole(mode, assignedRole) : mode;

  return {
    ...adaptedMode,
    selectionReasons: uniqueMessages([...decisionReasons, ...adaptedMode.selectionReasons]),
  };
}

function adaptModeForAssignedRole(mode: ToolModeCandidate, workRole: WorkRole): ToolModeCandidate {
  if (workRole !== "scope-framing" && workRole !== "plan-synthesis" && workRole !== "next-action") {
    return mode;
  }

  const roleLabel =
    workRole === "scope-framing"
      ? "for research-backed scope framing"
      : workRole === "plan-synthesis"
        ? "for the reasoning-heavy planning pass"
        : "for the lightweight action handoff";
  const modeLabel = mode.modeLabel
    .replace(
      /for current-facts framing, not final app execution/gi,
      "for scope framing and approved source checks, not final execution",
    )
    .replace(
      /for source-backed framing, not final app execution/gi,
      "for scope framing and approved source checks, not final execution",
    )
    .replace(/for the master prompt/gi, roleLabel)
    .replace(/after the master prompt is clear/gi, roleLabel)
    .replace(/after the prompt is clear/gi, roleLabel)
    .replace(/for prompt design/gi, roleLabel);
  const displayLabel =
    mode.providerId === "none"
      ? mode.displayLabel
      : `${mode.providerLabel} ${mode.accountLabel} - ${modeLabel}`;
  const selectionReasons =
    workRole === "next-action"
      ? mode.selectionReasons.filter((reason) => !/\b(master prompt|prompt design|downstream prompt)\b/i.test(reason))
      : mode.selectionReasons
          .filter((reason) => !/\bdownstream prompt\b/i.test(reason))
          .map((reason) =>
            workRole === "scope-framing" && /\buse perplexity for current facts\b/i.test(reason)
              ? "Use Perplexity to structure the scope; use current facts and citations only when outside sources are approved."
              : reason,
          );

  return {
    ...mode,
    modeLabel,
    displayLabel,
    selectionReasons,
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

  if (!workStageForRole(context.workPlan, "evidence-check") || !mode) {
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
    case "scope-framing":
      return "research-backed scope and execution brief";
    case "evidence-check":
      return "evidence and model availability check";
    case "plan-synthesis":
      return "synthesize the working plan";
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
  const plannedStage = workStageForRole(context.workPlan, workRole);
  const outputContract = plannedStage ? `Required output: ${plannedStage.outputContract}` : "";
  const usesPriorPlan = workStageForRole(context.workPlan, "plan-synthesis") !== null;

  switch (workRole) {
    case "scope-framing":
      return `Use ${mode.displayLabel} to turn the rough request into an execution-ready scope. Draft the outcome, audience, boundaries, assumptions, missing decisions, required deliverables, dependencies, risks, measures, and acceptance checks for ${deliverableSummary}. Make reasonable assumptions explicit and ask the user only about genuinely blocking unknowns. Finish with a copy-ready working brief for the reasoning stage. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger} The app does not send task data to the model.`;
    case "evidence-check":
      return `Manually use ${mode.displayLabel} for current facts, citations, model availability, and privacy notes before relying on the result. Use only allowed source IDs (${sourceText}). Cover ${deliverableSummary}. ${outputContract} ${reasonText} The app does not search, fetch, or call the tool.`;
    case "plan-synthesis":
      return `Use ${mode.displayLabel} for the reasoning-heavy pass. Starting from the framed scope and any evidence notes, produce the actual ${task.outputType} for ${deliverableSummary}. Build a real sequence from dependencies; name outputs, owners, assumptions, decisions, risks, measures, review points, acceptance checks, and the first action. Do not return prompt advice or ask the user to rebuild the scope. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`;
    case "prompt-design":
      return `Use ${mode.displayLabel} for the thinking-heavy prompt-design pass. Build a master prompt that covers ${deliverableSummary}, names allowed inputs, privacy limits, acceptance checks, four sections only (Plan, Do, Check, Act), the execution helper, and the upgrade trigger. ${context.decomposition.complexBuildPlan ? "Do not create only prompt advice; make the prompt require the actual build plan and first usable slice. " : ""}${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger} The app does not send task data to the model.`;
    case "execution":
      return usesSeparatePromptDesign
        ? `Run the approved master prompt in ${mode.displayLabel}. Produce the requested ${task.outputType} for ${deliverableSummary}, not another prompt-writing plan. Keep the first pass small enough to review. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`
        : usesPriorPlan
          ? `Use ${mode.displayLabel} to execute the approved scope and plan for ${deliverableSummary}. Preserve its decisions and boundaries; do not reopen the scope or replace the plan with generic advice. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`
          : `Use ${mode.displayLabel} to produce the requested ${task.outputType} directly for ${deliverableSummary}. Preserve the user's stated requirements and mark missing information instead of inventing it. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`;
    case "build-slice":
      return usesSeparatePromptDesign
        ? `Run the approved master prompt in ${mode.displayLabel} to produce the first usable build slice for ${deliverableSummary}. Include data flow, files or screens, acceptance checks, deferred features, and what to do if the first pass fails. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`
        : usesPriorPlan
          ? `Use ${mode.displayLabel} to implement the first usable slice from the approved scope and build plan for ${deliverableSummary}. Preserve its decisions, tests, boundaries, and deferred work. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`
          : `Use ${mode.displayLabel} to produce the first usable build slice directly for ${deliverableSummary}. Include data flow, files or screens, acceptance checks, deferred features, and what to do if the first pass fails. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`;
    case "artifact-package":
      return `Use ${mode.displayLabel} to package the reviewed result as ${task.outputType}. Keep sources limited to (${sourceText}) and keep warnings, checks, impact notes, and next action visible. ${outputContract} ${reasonText}`;
    case "quality-review":
      return `Use ${mode.displayLabel} to check the result against the original task, promised deliverables, privacy limits, and acceptance checks. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`;
    case "next-action":
      return `Use ${mode.displayLabel} to turn the approved plan into a short execution handoff: the first action, its owner, required inputs, completion check, and the next review point. Preserve the plan's decisions and boundaries; do not reopen the scope or redo the heavy reasoning. ${outputContract} ${reasonText} Upgrade trigger: ${upgradeTrigger}`;
  }
}

function upgradeTriggerForRole(
  workRole: WorkRole,
  mode: ToolModeCandidate,
  task: TaskIntake,
  usesSeparatePromptDesign: boolean,
) {
  if (workRole === "scope-framing") {
    return "upgrade only if the scope still has unresolved blockers, unsupported assumptions, or missing boundaries.";
  }

  if (workRole === "evidence-check") {
    return "upgrade only if source coverage, citations, or current model/privacy facts are thin.";
  }

  if (workRole === "prompt-design") {
    return task.qualityBar === "high" || task.qualityBar === "critical"
      ? "upgrade if the prompt misses deliverables, privacy limits, acceptance checks, or the execution model choice."
      : "upgrade if the prompt is vague enough that execution would require guessing.";
  }

  if (workRole === "plan-synthesis") {
    return "upgrade only if the plan still misses real dependencies, decisions, risks, measures, or acceptance checks after one focused retry.";
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
  hasScopeStep: boolean;
  hasPlanStep: boolean;
  hasPromptStep: boolean;
  hasArtifactStep: boolean;
  hasReviewStep: boolean;
  hasNextActionStep: boolean;
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
    input.hasScopeStep
      ? "A scope-framing pass drafts the brief, assumptions, boundaries, and blocking questions instead of handing that work back to the user."
      : null,
    input.hasResearchStep ? "A source check is included because evidence affects the answer." : null,
    input.hasPlanStep
      ? "A dedicated reasoning pass synthesizes the actual ordered plan from the framed scope."
      : null,
    input.hasPromptStep
      ? input.reasoning.promptArtifactRequested
        ? "Prompt design is the requested output."
        : "A prompt handoff is included because the request explicitly asks for one."
      : input.hasPlanStep
        ? "The plan is synthesized from the checked scope without adding a separate prompt-only relay."
        : "The main helper produces the requested output directly; a prompt-only handoff did not earn a place.",
    input.hasArtifactStep ? "A specialist packaging pass is included because it improves the requested artifact." : null,
    input.hasReviewStep ? "A separate AI review is included because an independent check adds value here." : null,
    input.hasNextActionStep
      ? "A lighter downstream pass turns the approved result into an immediate action without repeating the expensive reasoning."
      : null,
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
