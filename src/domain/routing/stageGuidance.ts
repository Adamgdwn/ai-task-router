import type {
  ModelInventoryItem,
  ProjectStageGuidance,
  ProjectStageWorkItem,
  RouteOption,
  RouteStep,
  TaskIntake,
  WorkRole,
} from "../types";
import { estimateRouteStepApiEquivalentCostUsd, estimateRouteStepEnergyWh } from "./routeEconomics";
import {
  modelLabelForExecutionForTask,
  modelLabelForPromptDesignForTask,
  modelLabelWithMinimum,
} from "./modelGuidance";
import {
  decomposeTask,
  taskHasBuildIntent,
  taskHasModelSelectionIntent,
  taskNeedsEvidenceCheck,
  taskNeedsFullBuildPlan,
  type TaskDecomposition,
  type TaskDeliverable,
} from "./taskDecomposition";

type BuildProjectStageGuidanceInput = {
  task: TaskIntake;
  selectedOption: RouteOption;
  models: readonly ModelInventoryItem[];
};

type StageDraft = {
  stage: ProjectStageGuidance["stage"];
  methodLabel: string;
  label: string;
  purpose: string;
  actions: string[];
  reviewChecks: string[];
  routeStep?: RouteStep;
  fallbackModelLabel: string;
  recommendedModelLabel?: string;
  recommendedModelId?: string;
  workItems?: ProjectStageWorkItem[];
};

export function buildProjectStageGuidance({
  task,
  selectedOption,
  models,
}: BuildProjectStageGuidanceInput): ProjectStageGuidance[] {
  const modelById = new Map(models.map((model) => [model.id, model]));
  const manualReviewModel = models.find((model) => model.tier === "human");
  const decomposition = decomposeTask(task);
  const scopeStep = firstStepOfWorkRole(selectedOption, "scope-framing");
  const researchStep = firstStepOfWorkRole(selectedOption, "evidence-check");
  const planStep = firstStepOfWorkRole(selectedOption, "plan-synthesis");
  const promptStep = firstStepOfWorkRole(selectedOption, "prompt-design");
  const executionStep =
    firstStepOfWorkRole(selectedOption, "build-slice") ??
    firstStepOfWorkRole(selectedOption, "execution");
  const primaryStep = planStep ?? promptStep ?? executionStep ?? scopeStep ?? primaryWorkStep(selectedOption);
  const usesSeparatePromptDesign = promptStep !== null;
  const createWorkRole: WorkRole = planStep
    ? "plan-synthesis"
    : promptStep
      ? "prompt-design"
      : executionStep?.workRole === "build-slice"
        ? "build-slice"
        : "execution";
  const artifactStep = firstStepOfWorkRole(selectedOption, "artifact-package");
  const humanApprovalStep = firstStepOfKind(selectedOption, "human review");
  const reviewSupportStep = firstStepOfWorkRole(selectedOption, "quality-review");
  const nextActionStep = firstStepOfWorkRole(selectedOption, "next-action");
  const promptBuilderModelLabel = modelLabelForStageStep(
    task,
    promptStep,
    modelById,
    manualReviewModel,
    "You first",
    "prompt",
  );
  const executionModelLabel = modelLabelForStageStep(
    task,
    artifactStep ?? executionStep,
    modelById,
    manualReviewModel,
    modelLabelForStep(primaryStep, modelById, manualReviewModel, "You first"),
    "execution",
  );

  const stages: StageDraft[] = [
    {
      stage: "frame",
      methodLabel: "Plan",
      label: scopeStep ? "Build the scope and working brief" : "Frame the outcome",
      purpose: scopeStep
        ? "Most rough requests, handed directly to a production model, end up solving the wrong problem. This stage turns the request into a workable brief before anything expensive runs."
        : "Before a model can help, the task needs a clear goal, output type, and finish line. This is the cheapest step in the path.",
      actions: frameStageActions(task, scopeStep !== null),
      reviewChecks: frameStageChecks(task, scopeStep !== null),
      routeStep: scopeStep ?? undefined,
      fallbackModelLabel: "You first",
      recommendedModelLabel: scopeStep
        ? recommendedLabelForStageRole(
            task,
            "scope-framing",
            scopeStep,
            modelById,
            manualReviewModel,
            "You first",
          )
        : undefined,
      workItems: scopeStep
        ? buildStageWorkItems({
            task,
            decomposition,
            stage: "frame",
            workRole: "scope-framing",
            routeStep: scopeStep,
            usesSeparatePromptDesign,
            modelById,
            manualReviewModel,
            fallbackModelLabel: "You first",
          })
        : frameStageWorkItems(task, decomposition),
    },
  ];

  const scopeAlreadyHandlesResearch = researchStep === null && scopeStep?.kind === "research";

  if (shouldAddGatherStage(task) && !scopeAlreadyHandlesResearch) {
    stages.push({
      stage: "gather",
      methodLabel: "Plan",
      label: gatherStageLabel(task),
      purpose: gatherStagePurpose(task),
      actions: gatherStageActions(task, usesSeparatePromptDesign),
      reviewChecks: gatherStageChecks(task),
      routeStep: researchStep ?? primaryStep,
      fallbackModelLabel: "You first",
      workItems: buildStageWorkItems({
        task,
        decomposition,
        stage: "gather",
        workRole: "evidence-check",
        routeStep: researchStep ?? undefined,
        usesSeparatePromptDesign,
        modelById,
        manualReviewModel,
        fallbackModelLabel: "You first",
      }),
    });
  }

  stages.push({
    stage: "create",
    methodLabel: planStep || usesSeparatePromptDesign ? "Plan" : "Do",
    label: planStep
      ? "Synthesize the working plan"
      : usesSeparatePromptDesign
        ? createStageLabel(task)
        : directWorkStageLabel(task),
    purpose: planStep
      ? "Use the strongest adequate reasoning pass to turn the framed scope and evidence into the actual ordered plan."
      : usesSeparatePromptDesign
        ? createStagePurpose(task)
        : directWorkStagePurpose(task),
    actions: planStep
      ? directWorkStageActions(task)
      : usesSeparatePromptDesign
        ? createStageActions(task)
        : directWorkStageActions(task),
    reviewChecks: planStep
      ? directWorkStageChecks(task)
      : usesSeparatePromptDesign
        ? createStageChecks(task)
        : directWorkStageChecks(task),
    routeStep: planStep ?? (usesSeparatePromptDesign ? promptStep : executionStep) ?? undefined,
    fallbackModelLabel: "You first",
    recommendedModelLabel: planStep
      ? recommendedLabelForStageRole(
          task,
          "plan-synthesis",
          planStep,
          modelById,
          manualReviewModel,
          "You first",
        )
      : usesSeparatePromptDesign
        ? promptBuilderModelLabel
        : executionModelLabel,
    recommendedModelId: (planStep ?? (usesSeparatePromptDesign ? promptStep : executionStep))?.modelId,
    workItems: buildStageWorkItems({
      task,
      decomposition,
      stage: "create",
      workRole: createWorkRole,
      routeStep: planStep ?? (usesSeparatePromptDesign ? promptStep : executionStep),
      usesSeparatePromptDesign,
      modelById,
      manualReviewModel,
      fallbackModelLabel: "You first",
    }),
  });

  if (shouldAddPackageStage(artifactStep, promptStep, planStep, executionStep)) {
    stages.push({
      stage: "package",
      methodLabel: "Do",
      label: packageStageLabel(task, usesSeparatePromptDesign),
      purpose: packageStagePurpose(task, usesSeparatePromptDesign),
      actions: packageStageActions(task, usesSeparatePromptDesign),
      reviewChecks: packageStageChecks(task, usesSeparatePromptDesign),
      routeStep: artifactStep ?? executionStep ?? undefined,
      fallbackModelLabel: modelLabelForStep(primaryStep, modelById, manualReviewModel, "You first"),
      recommendedModelLabel: executionModelLabel,
      recommendedModelId: (artifactStep ?? executionStep)?.modelId,
      workItems: buildStageWorkItems({
        task,
        decomposition,
        stage: "package",
        workRole: artifactStep ? "artifact-package" : executionStep?.workRole === "build-slice" ? "build-slice" : "execution",
        routeStep: artifactStep ?? executionStep,
        usesSeparatePromptDesign,
        modelById,
        manualReviewModel,
        fallbackModelLabel: modelLabelForStep(primaryStep, modelById, manualReviewModel, "You first"),
      }),
    });
  }

  stages.push({
    stage: "review",
    methodLabel: "Check",
    label: reviewStageLabel(task),
    purpose: reviewStagePurpose(task, usesSeparatePromptDesign),
    actions: reviewStageActions(task, usesSeparatePromptDesign),
    reviewChecks: reviewStageChecks(task),
    routeStep: reviewSupportStep ?? humanApprovalStep ?? undefined,
    fallbackModelLabel: manualReviewModel?.label ?? "Your review",
    recommendedModelLabel: reviewSupportStep
      ? recommendedLabelForWorkItem(reviewSupportStep, modelById, manualReviewModel, manualReviewModel?.label ?? "Your review")
      : undefined,
    workItems: buildStageWorkItems({
      task,
      decomposition,
      stage: "review",
      workRole: "quality-review",
      routeStep: reviewSupportStep ?? undefined,
      usesSeparatePromptDesign,
      modelById,
      manualReviewModel,
      fallbackModelLabel: manualReviewModel?.label ?? "Your review",
    }),
  });

  stages.push({
    stage: "act",
    methodLabel: "Act",
    label: actStageLabel(task),
    purpose: actStagePurpose(task, usesSeparatePromptDesign, nextActionStep !== null),
    actions: actStageActions(task, usesSeparatePromptDesign, nextActionStep !== null),
    reviewChecks: actStageChecks(task),
    routeStep: nextActionStep ?? undefined,
    fallbackModelLabel: "You first",
    recommendedModelLabel: nextActionStep
      ? recommendedLabelForWorkItem(nextActionStep, modelById, manualReviewModel, "You first")
      : undefined,
    recommendedModelId: nextActionStep?.modelId,
    workItems: buildStageWorkItems({
      task,
      decomposition,
      stage: "act",
      workRole: "next-action",
      routeStep: nextActionStep ?? undefined,
      usesSeparatePromptDesign,
      modelById,
      manualReviewModel,
      fallbackModelLabel: "You first",
    }),
  });

  return stages.map((stageDraft) =>
    buildStageGuidance({
      task,
      stageDraft,
      modelById,
      manualReviewModel,
    }),
  );
}

function buildStageGuidance(input: {
  task: TaskIntake;
  stageDraft: StageDraft;
  modelById: Map<string, ModelInventoryItem>;
  manualReviewModel: ModelInventoryItem | undefined;
}): ProjectStageGuidance {
  const { task, stageDraft, modelById, manualReviewModel } = input;
  const recommendedModelLabel = modelLabelForStep(
    stageDraft.routeStep,
    modelById,
    manualReviewModel,
    stageDraft.fallbackModelLabel,
  );
  const recommendedModelId = stageDraft.recommendedModelId ?? stageDraft.routeStep?.modelId;

  return {
    id: `stage-${task.id}-${stageDraft.stage}`,
    stage: stageDraft.stage,
    methodLabel: stageDraft.methodLabel,
    label: stageDraft.label,
    purpose: stageDraft.purpose,
    actions: stageDraft.actions,
    reviewChecks: stageDraft.reviewChecks,
    recommendedModelLabel: stageDraft.recommendedModelLabel ?? recommendedModelLabel,
    ...(recommendedModelId ? { recommendedModelId } : {}),
    ...(stageDraft.routeStep?.id ? { routeStepId: stageDraft.routeStep.id } : {}),
    workItems: stageDraft.workItems ?? [],
  };
}

function frameStageWorkItems(task: TaskIntake, decomposition: TaskDecomposition): ProjectStageWorkItem[] {
  return [
    {
      id: `stage-${task.id}-frame-deliverables`,
      workRole: "next-action",
      deliverableIds: decomposition.deliverables.map((deliverable) => deliverable.id),
      label: "Confirm the full request",
      expectedOutput: `A visible checklist of everything the route must cover: ${inlineList(
        decomposition.deliverables.map((deliverable) => deliverable.label),
      )}.`,
      recommendedModelLabel: "You first",
      selectionReasons: ["The user should confirm scope and privacy before any helper is used."],
      reviewChecks: ["No requested deliverable has been dropped or merged into vague wording."],
      upgradeTrigger: "Ask for help only after the goal, inputs, privacy limits, and done state are clear.",
    },
  ];
}

function buildStageWorkItems(input: {
  task: TaskIntake;
  decomposition: TaskDecomposition;
  stage: ProjectStageGuidance["stage"];
  workRole: WorkRole;
  routeStep: RouteStep | undefined | null;
  usesSeparatePromptDesign: boolean;
  modelById: Map<string, ModelInventoryItem>;
  manualReviewModel: ModelInventoryItem | undefined;
  fallbackModelLabel: string;
}): ProjectStageWorkItem[] {
  const {
    task,
    decomposition,
    stage,
    workRole,
    routeStep,
    usesSeparatePromptDesign,
    modelById,
    manualReviewModel,
    fallbackModelLabel,
  } = input;
  const deliverables = deliverablesForStageRole(decomposition, workRole);
  const targets = targetDeliverableGroups(task, workRole, deliverables);
  // Per-token, not per-bill, so a work item reads the same way as the route it belongs to.
  const estimatedCostUsd = routeStep ? estimateRouteStepApiEquivalentCostUsd(routeStep, modelById) : undefined;
  const estimatedEnergyWh = routeStep ? estimateRouteStepEnergyWh(routeStep, modelById) : undefined;
  const perItemCost = estimatedCostUsd !== undefined ? estimatedCostUsd / targets.length : undefined;
  const perItemEnergy = estimatedEnergyWh !== undefined ? estimatedEnergyWh / targets.length : undefined;

  return targets.map((targetDeliverables, index) => {
    const deliverableIds = targetDeliverables.map((deliverable) => deliverable.id);
    const label = workItemLabel(task, workRole, targetDeliverables, stage, usesSeparatePromptDesign);
    const setupGapLabel = manualSetupGapLabel(task, workRole, routeStep);

    return {
      id: `stage-${task.id}-${stage}-${workRole}-${index + 1}`,
      workRole,
      deliverableIds,
      label,
      expectedOutput: expectedOutputForWorkItem(task, workRole, targetDeliverables, usesSeparatePromptDesign),
      recommendedModelLabel:
        setupGapLabel ??
        recommendedLabelForWorkItem(routeStep, modelById, manualReviewModel, fallbackModelLabel),
      ...(routeStep?.modelId ? { recommendedModelId: routeStep.modelId } : {}),
      ...(routeStep?.modeId ? { modeId: routeStep.modeId } : {}),
      ...(routeStep?.modeLabel ? { modeLabel: routeStep.modeLabel } : {}),
      selectionReasons: routeStep?.selectionReasons?.length
        ? routeStep.selectionReasons
        : setupGapLabel
          ? [
              workRole === "scope-framing" || workRole === "plan-synthesis" || workRole === "prompt-design"
                ? "The saved setup does not include a suitable planning helper for this stage; add or select one before relying on the route."
                : "A research-only or manual setup cannot execute this build stage; add or select a build-capable AI helper before relying on the route.",
            ]
          : ["This stage follows the selected route and the user's allowed tools."],
      reviewChecks: reviewChecksForWorkItem(task, workRole, targetDeliverables),
      upgradeTrigger: upgradeTriggerForWorkItem(task, workRole, usesSeparatePromptDesign),
      ...(perItemCost !== undefined ? { estimatedCostUsd: roundEstimate(perItemCost) } : {}),
      ...(perItemEnergy !== undefined ? { estimatedEnergyWh: roundEstimate(perItemEnergy) } : {}),
    };
  });
}

function targetDeliverableGroups(
  task: TaskIntake,
  workRole: WorkRole,
  deliverables: readonly TaskDeliverable[],
): TaskDeliverable[][] {
  if (deliverables.length === 0) {
    return [[]];
  }

  if (workRole === "build-slice" && (taskHasBuildIntent(task) || task.outputType === "code" || taskNeedsFullBuildPlan(task))) {
    return deliverables.map((deliverable) => [deliverable]);
  }

  return [[...deliverables]];
}

function deliverablesForStageRole(decomposition: TaskDecomposition, workRole: WorkRole): TaskDeliverable[] {
  const matching = decomposition.deliverables.filter((deliverable) => deliverable.roles.includes(workRole));

  return matching.length ? matching : decomposition.deliverables;
}

function workItemLabel(
  task: TaskIntake,
  workRole: WorkRole,
  deliverables: readonly TaskDeliverable[],
  stage: ProjectStageGuidance["stage"],
  usesSeparatePromptDesign: boolean,
) {
  const deliverableLabel = deliverables.length === 1 ? deliverables[0]?.label : "full request";

  switch (workRole) {
    case "scope-framing":
      return "Draft the scope and working brief";
    case "evidence-check":
      return taskHasModelSelectionIntent(task) ? "Check evidence and model availability" : `Check evidence for ${deliverableLabel}`;
    case "plan-synthesis":
      return "Synthesize the actual working plan";
    case "prompt-design":
      return deliverables.length > 1 || needsFullBuildPlan(task) ? "Build one master prompt" : `Build the prompt for ${deliverableLabel}`;
    case "execution":
      if (!usesSeparatePromptDesign) {
        return task.outputType === "plan"
          ? "Produce the requested working plan"
          : `Produce ${friendlyOutputName(task.outputType)}`;
      }
      return deliverables.length > 1 ? "Run the finished prompt" : `Execute ${deliverableLabel}`;
    case "build-slice":
      return deliverables.length === 1 ? buildSliceItemLabel(deliverables[0]) : "Create the first usable build slice";
    case "artifact-package":
      return `Package ${deliverableLabel}`;
    case "quality-review":
      return "Review the result";
    case "next-action":
      return stage === "act" ? "Pick the first action" : "Confirm scope";
  }
}

function buildSliceItemLabel(deliverable: TaskDeliverable | undefined) {
  if (!deliverable) {
    return "Create the first usable build slice";
  }

  const labels: Partial<Record<TaskDeliverable["kind"], string>> = {
    build: "Build the first usable shell",
    "data-flow": "Build the data import flow",
    categorization: "Build the categorization rules",
    tracking: "Build the tracking view",
    insight: "Build the insight and recommendation view",
  };

  return labels[deliverable.kind] ?? `Build ${deliverable.label}`;
}

function expectedOutputForWorkItem(
  task: TaskIntake,
  workRole: WorkRole,
  deliverables: readonly TaskDeliverable[],
  usesSeparatePromptDesign: boolean,
) {
  const deliverableText = compactDeliverableText(deliverables);

  switch (workRole) {
    case "scope-framing":
      return `An execution-ready scope covering ${deliverableText}, with reasonable assumptions stated, blocking unknowns separated, and a copy-ready brief for the reasoning stage.`;
    case "evidence-check":
      return `Current facts, source notes, model availability, and privacy notes that affect ${deliverableText}.`;
    case "plan-synthesis":
      return `The actual ordered ${task.outputType} for ${deliverableText}, including dependencies, owners, assumptions, decisions, risks, measures, review points, acceptance checks, and the first action.`;
    case "prompt-design":
      return `One master prompt that covers ${deliverableText}, names the execution helper or mode, and includes privacy limits, checks, and upgrade triggers.`;
    case "execution":
      return `The first usable ${task.outputType} output for ${deliverableText}.`;
    case "build-slice":
      return `The actual build plan or first usable slice for ${deliverableText}, including data flow, screens or files, tests, and deferred work.`;
    case "artifact-package":
      return `A saved or copy-ready ${task.outputType} package with warnings, checks, and next action visible.`;
    case "quality-review":
      return `A pass/fail review of ${deliverableText || "the result"} against ${
        usesSeparatePromptDesign ? "the approved prompt" : "the original task"
      }, privacy limits, and acceptance checks.`;
    case "next-action":
      return "The smallest next action, the measure to check next, and whether the route should be reused or upgraded.";
  }
}

function reviewChecksForWorkItem(
  task: TaskIntake,
  workRole: WorkRole,
  deliverables: readonly TaskDeliverable[],
) {
  const deliverableText = compactDeliverableText(deliverables);

  switch (workRole) {
    case "scope-framing":
      return [
        `The draft scope covers ${deliverableText} without handing the user a blank worksheet.`,
        "Assumptions are explicit, boundaries are visible, and only genuinely blocking questions remain.",
      ];
    case "evidence-check":
      return [
        "Current facts and model/privacy assumptions are dated or marked uncertain.",
        "No unapproved source is required for the next stage.",
      ];
    case "plan-synthesis":
      return [
        `The result is the actual ${task.outputType} for ${deliverableText}, not prompt advice or a restatement of the route.`,
        "The sequence follows dependencies and names owners, decisions, risks, measures, acceptance checks, and the first action.",
      ];
    case "prompt-design":
      return [
        `One prompt, not separate prompt chores, explicitly covers ${deliverableText}.`,
        "The prompt names the execution mode, checks, privacy limits, and upgrade trigger.",
      ];
    case "execution":
    case "build-slice":
      return [
        `The output produces ${deliverableText}, not another layer of prompt advice.`,
        taskHasBuildIntent(task) ? "The first slice is small enough to review before adding features." : "The first result is ready for review.",
      ];
    case "artifact-package":
      return ["The package keeps warnings, checks, impact notes, and next action visible."];
    case "quality-review":
      return ["Every requested deliverable is present or explicitly marked as missing.", "Privacy and sensitivity limits are still respected."];
    case "next-action":
      return ["The next action is small, visible, and tied to a measure."];
  }
}

function upgradeTriggerForWorkItem(
  task: TaskIntake,
  workRole: WorkRole,
  usesSeparatePromptDesign: boolean,
) {
  if (workRole === "scope-framing") {
    return "Upgrade scope framing only if important boundaries, assumptions, or blocking decisions remain unresolved.";
  }

  if (workRole === "plan-synthesis") {
    return "Upgrade plan synthesis only if one focused retry still misses dependencies, decisions, risks, measures, or acceptance checks.";
  }

  if (workRole === "prompt-design") {
    return "Upgrade the prompt-design helper only if the master prompt misses deliverables, checks, privacy, or the execution model choice.";
  }

  if (workRole === "execution" || workRole === "build-slice") {
    return usesSeparatePromptDesign
      ? "Upgrade execution only if the lighter mode ignores the master prompt or fails review after a focused retry."
      : "Upgrade execution only if the direct result misses requested deliverables or fails review after a focused retry.";
  }

  if (workRole === "evidence-check") {
    return "Upgrade research only if current facts, citations, or model/privacy details are too thin.";
  }

  return task.qualityBar === "critical"
    ? "Use stronger review if mistakes would be expensive or hard to reverse."
    : "Reuse the lighter route when the checks pass.";
}

function recommendedLabelForWorkItem(
  routeStep: RouteStep | undefined | null,
  modelById: Map<string, ModelInventoryItem>,
  manualReviewModel: ModelInventoryItem | undefined,
  fallbackModelLabel: string,
) {
  if (routeStep?.modeLabel) {
    const modelPrefix = routeStep.label.split(": ")[0];

    if (!modelPrefix) {
      return routeStep.modeLabel;
    }

    return modelPrefix.includes(routeStep.modeLabel) ? modelPrefix : `${modelPrefix} (${routeStep.modeLabel})`;
  }

  return modelLabelForStep(routeStep, modelById, manualReviewModel, fallbackModelLabel);
}

function recommendedLabelForStageRole(
  task: TaskIntake,
  workRole: WorkRole,
  routeStep: RouteStep | undefined | null,
  modelById: Map<string, ModelInventoryItem>,
  manualReviewModel: ModelInventoryItem | undefined,
  fallbackModelLabel: string,
) {
  return (
    manualSetupGapLabel(task, workRole, routeStep) ??
    recommendedLabelForWorkItem(routeStep, modelById, manualReviewModel, fallbackModelLabel)
  );
}

function roundEstimate(value: number) {
  return Math.round(value * 1000) / 1000;
}

function frameStageActions(_task: TaskIntake, usesScopeHelper: boolean) {
  if (usesScopeHelper) {
    return [
      "Scope framing is exploratory — you're figuring out what you're building, not producing yet. A lightweight model handles this well. Bringing your most capable model in before the goal is clear spends money correcting the wrong problem.",
    ];
  }

  return [
    "Before any model can help, the task needs a clear goal, audience, output, and finish line. Two minutes here prevents a wasted run — it is the cheapest step in the path.",
  ];
}

function frameStageChecks(task: TaskIntake, _usesScopeHelper: boolean) {
  if (task.sensitivityClass !== "public") {
    return [
      "Ready to move on when the goal, output type, and finish criteria are clear. Keep private or sensitive details out of tools that are not cleared for them.",
    ];
  }

  return [
    "Ready to move on when the goal, output type, and finish criteria are clear enough that a stranger could describe what you are building.",
  ];
}

function shouldAddGatherStage(task: TaskIntake) {
  return (
    task.requestedSourceIds.length > 0 ||
    taskNeedsEvidenceCheck(task)
  );
}

function gatherStageLabel(task: TaskIntake) {
  if (task.requiresCurrentFacts || task.requiresCitations || taskHasModelSelectionIntent(task)) {
    return "Check the evidence";
  }

  return "Gather the inputs";
}

function gatherStagePurpose(task: TaskIntake) {
  if (taskHasModelSelectionIntent(task)) {
    return "Check current tool/model availability, limits, and privacy notes before choosing the execution model.";
  }

  if (task.requiresCurrentFacts && task.requiresCitations) {
    return "Collect current facts and citation notes before asking any helper to make a recommendation.";
  }

  if (task.requiresCurrentFacts) {
    return "Check what has changed recently so the plan is not based on stale assumptions.";
  }

  if (task.requiresCitations) {
    return "Collect source notes so important claims can be checked before you rely on them.";
  }

  return "Gather only the information you intend to use, then move it into the chosen helper yourself.";
}

function gatherStageActions(task: TaskIntake, _usesSeparatePromptDesign: boolean) {
  if (taskHasModelSelectionIntent(task)) {
    return [
      "Model availability changes. Checking before prompting costs nothing and prevents building a route around a tool you cannot access.",
    ];
  }

  if (task.requiresCurrentFacts && task.requiresCitations) {
    return [
      "Facts and citations are the one input AI cannot reliably invent. Gather them yourself before prompting — a model that searches on your behalf often returns confident-sounding guesses.",
    ];
  }

  if (task.requiresCurrentFacts) {
    return [
      "Stale assumptions produce stale plans. A quick source check before prompting costs minutes and prevents corrections that cost much more.",
    ];
  }

  if (task.requiresCitations) {
    return [
      "Unsupported claims discovered after the fact require expensive rewrites. Collect source notes before prompting, not after.",
    ];
  }

  return [
    "Moving unfiltered context into a model raises cost and lowers quality. Gather only what the task needs, then bring it in cleanly.",
  ];
}

function gatherStageChecks(_task: TaskIntake) {
  return [
    "Ready to move on when the next stage has enough verified context to work without guessing.",
  ];
}

function createStageLabel(task: TaskIntake) {
  switch (task.outputType) {
    case "answer":
      return "Build the answer prompt";
    case "brief":
      return "Build the brief prompt";
    case "plan":
      return "Build the master prompt";
    case "draft":
      return "Build the drafting prompt";
    case "code":
      return "Build the coding prompt";
    case "table":
      return "Build the table prompt";
    case "slide outline":
      return "Build the slide prompt";
    case "route card":
      return "Build the route-card prompt";
    case "prompt package":
      return "Build the prompt package";
  }
}

function createStagePurpose(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return "Use the strongest prompt-building model and reasoning level actually available in the account you selected, then create the master prompt before any lower-cost execution run.";
  }

  if (task.knowledgeWorkType === "coding") {
    return "Use the recommended helper for the thinking-heavy part first: write a precise build prompt before asking anything to make the tool.";
  }

  if (taskHasBuildIntent(task) && (task.knowledgeWorkType === "planning" || task.outputType === "plan")) {
    return "Use the higher-thinking helper for the master prompt first, then hand that prompt to the lightest adequate execution mode for the actual build plan.";
  }

  if (task.knowledgeWorkType === "review") {
    return "Turn the review job into a clear prompt with criteria, evidence limits, issue categories, and a decision rule.";
  }

  if (task.knowledgeWorkType === "analysis") {
    return "Turn the analysis job into a prompt that asks for options, tradeoffs, assumptions, and a recommendation.";
  }

  if (task.knowledgeWorkType === "planning" || task.outputType === "plan") {
    return "Create the master prompt that will later produce the plan, including requested deliverables, phases, measures, risks, review checks, and upgrade triggers.";
  }

  return "Write the prompt before the output: define the role, inputs, constraints, format, review checks, and when to upgrade.";
}

function createStageActions(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return [
      "Prompt design is the most cognitively demanding stage — use your strongest available model here. The payoff: every execution run that follows can use a lighter, cheaper model because the quality lives in the prompt, not the run.",
    ];
  }

  if (task.knowledgeWorkType === "coding") {
    return [
      "A precise build prompt can run on a lighter execution model. One expensive prompt-design pass now replaces several expensive debugging runs later.",
    ];
  }

  if (task.knowledgeWorkType === "review") {
    return [
      "A structured review prompt produces consistent, actionable feedback. One good prompt design pass means the reviewer never has to re-derive what to look for.",
    ];
  }

  if (task.knowledgeWorkType === "analysis") {
    return [
      "The cognitive cost of analysis is in defining what to compare and why. A good prompt does that work once; a cheaper model then runs the comparison.",
    ];
  }

  if (task.knowledgeWorkType === "planning" || task.outputType === "plan") {
    return [
      "A master prompt designed at the highest available reasoning level can execute on a lighter model. The thinking cost is front-loaded so the production cost is light.",
    ];
  }

  return [
    "Designing the prompt before running it shifts cost to the right place. A precise prompt runs cheaper and produces better output on the first pass.",
  ];
}

function createStageChecks(_task: TaskIntake) {
  return [
    "Ready to move on when the prompt is specific enough that another model could execute it without reopening the task.",
  ];
}

function directWorkStageLabel(task: TaskIntake) {
  switch (task.outputType) {
    case "answer":
      return "Produce the answer";
    case "brief":
      return "Draft the brief";
    case "plan":
      return "Build the working plan";
    case "draft":
      return "Create the draft";
    case "code":
      return "Build the first code slice";
    case "table":
      return "Build the table";
    case "slide outline":
      return "Draft the slide outline";
    case "route card":
      return "Create the decision card";
    case "prompt package":
      return "Build the prompt package";
  }
}

function directWorkStagePurpose(task: TaskIntake) {
  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return "Produce the plan itself in one deliberate pass. A separate AI run that only rewrites the request as a master prompt would add a handoff without adding task knowledge.";
  }

  return `Produce ${friendlyOutputName(task.outputType)} directly with the selected helper. Use the task details as the working brief instead of asking one AI to write a prompt for another.`;
}

function directWorkStageActions(task: TaskIntake) {
  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return [
      "This route skips a separate prompt-design pass because the task is clear enough to execute directly. The recommended model is calibrated for this level of complexity — not over-powered, not under-powered.",
    ];
  }

  return [
    "A direct execution route skips the prompt-design overhead. The recommended model is calibrated for this specific task — use it directly with the task brief as context.",
  ];
}

function directWorkStageChecks(task: TaskIntake) {
  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return [
      "Ready to move on when the result is the actual plan, not advice about planning.",
    ];
  }

  return [
    "Ready to move on when every requested deliverable is present or explicitly noted as missing.",
  ];
}

function shouldAddPackageStage(
  artifactStep: RouteStep | null,
  promptStep: RouteStep | null,
  planStep: RouteStep | null,
  executionStep: RouteStep | null,
) {
  return artifactStep !== null || promptStep !== null || (planStep !== null && executionStep !== null);
}

function packageStageLabel(task: TaskIntake, usesSeparatePromptDesign: boolean) {
  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return "Build the first slice";
  }

  if (needsFullBuildPlan(task)) {
    return usesSeparatePromptDesign ? "Run the build-plan prompt" : "Implement the first build slice";
  }

  if (taskHasBuildIntent(task)) {
    return usesSeparatePromptDesign ? "Run the build prompt" : "Implement the approved build plan";
  }

  if (task.outputType === "plan") {
    return "Run the prompt on the execution model";
  }

  if (task.outputType === "prompt package") {
    return "Package the prompts";
  }

  if (task.outputType === "route card") {
    return "Create the decision card";
  }

  return "Run the prompt";
}

function packageStagePurpose(task: TaskIntake, usesSeparatePromptDesign: boolean) {
  if (needsFullBuildPlan(task)) {
    return usesSeparatePromptDesign
      ? "This is a manual handoff: run the finished master prompt in the recommended execution mode to produce the first usable slice."
      : "Use the approved scope and build plan to implement the first usable slice without reopening the planning decisions.";
  }

  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return usesSeparatePromptDesign
      ? "Use the master prompt to build the smallest useful version first, then leave bigger features for later passes."
      : "Implement the smallest useful version from the approved build plan, then leave bigger features for later passes.";
  }

  if (taskHasBuildIntent(task) && (task.outputType === "plan" || task.knowledgeWorkType === "planning")) {
    return usesSeparatePromptDesign
      ? "Use the master prompt with the lightest adequate execution model or mode to produce the first usable slice."
      : "Use the lightest adequate execution model or mode to implement the first usable slice from the approved plan.";
  }

  if (task.outputType === "plan") {
    return "Paste the master prompt into the lightest adequate execution helper and produce the actual working plan.";
  }

  if (task.outputType === "table") {
    return "Run the prompt to produce rows, columns, labels, and review notes that can be checked quickly.";
  }

  if (task.outputType === "slide outline") {
    return "Run the prompt to produce slide-sized sections with clear headings and talking points.";
  }

  if (task.outputType === "route card" || task.outputType === "prompt package") {
    return "Run the prompt and convert the result into copy-ready guidance that can be saved locally.";
  }

  return "Use the prompt to create the requested output with the smallest helper that can pass the checks.";
}

function packageStageActions(task: TaskIntake, _usesSeparatePromptDesign: boolean) {
  if (needsFullBuildPlan(task)) {
    return [
      "The expensive thinking is done. The execution model's job is to implement, not re-derive. A lighter or cheaper execution mode is appropriate here — the quality lives in the prompt.",
    ];
  }

  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return [
      "Build the smallest useful slice first. A model doing focused implementation work does not need to be your most powerful option — it needs a clear prompt, which you have already built.",
    ];
  }

  if (task.outputType === "plan") {
    return [
      "The reasoning cost is already paid. Paste the master prompt and let a lighter execution model produce the plan — execution is the cheap part of this route.",
    ];
  }

  return [
    "The prompt contains the thinking. The execution model's job is to follow it accurately on the first pass, using the smallest model that can pass the review checks.",
  ];
}

function packageStageChecks(task: TaskIntake, _usesSeparatePromptDesign: boolean) {
  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return ["Ready to move on when the first slice is complete enough to review before more features are added."];
  }

  if (needsFullBuildPlan(task)) {
    return ["Ready to move on when the first build slice is small enough to start, with decisions, data flow, acceptance checks, and deferred work visible."];
  }

  return ["Ready to move on when the result follows the master prompt and is ready for review."];
}

function reviewStageLabel(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return "Review the full build plan";
  }

  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    return "Review before sharing";
  }

  if (task.qualityBar === "high" || task.qualityBar === "critical") {
    return "Review for quality";
  }

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return "Check the plan";
  }

  return "Check and learn";
}

function reviewStagePurpose(task: TaskIntake, usesSeparatePromptDesign: boolean) {
  if (needsFullBuildPlan(task)) {
    return usesSeparatePromptDesign
      ? "Check the result against the original request, the master prompt, and the expected deliverables before spending more tool time."
      : "Check the result against the original request, approved scope, build plan, and expected deliverables before spending more tool time.";
  }

  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    return "Check facts, tone, permissions, and risk before anything leaves your hands.";
  }

  if (task.qualityBar === "critical") {
    return "Do a careful human pass before relying on the result.";
  }

  if (task.qualityBar === "high") {
    return "Compare the result against the goal and tighten anything weak or unsupported.";
  }

  return usesSeparatePromptDesign
    ? "Compare the executed result against the master prompt, acceptance checks, and original task before deciding what to do next."
    : "Compare the result against the original task, requested deliverables, and direct-work checks before deciding what to do next.";
}

function reviewStageActions(task: TaskIntake, _usesSeparatePromptDesign: boolean) {
  if (task.publicFacing || task.sensitivityClass === "public-facing risk" || task.qualityBar === "critical") {
    return [
      "Human review is required before anything public, sensitive, or high-stakes leaves your hands. Tone, facts, permissions, and risk are not reliably caught by automated checks — and every error caught here saves an expensive re-run.",
    ];
  }

  return [
    "A quick human pass costs less than a re-run. Models cannot verify their own accuracy against the real-world outcome — that is what this stage is for.",
  ];
}

function reviewStageChecks(task: TaskIntake) {
  if (task.publicFacing || task.sensitivityClass === "public-facing risk" || task.qualityBar === "critical") {
    return [
      "Ready to move on when a human has reviewed the result and made a decision: approve, revise, or stop.",
    ];
  }

  return [
    "Ready to move on when the result matches the task and the requested output format.",
  ];
}

function actStageLabel(task: TaskIntake) {
  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return "Choose the first action";
  }

  if (task.qualityBar === "critical" || task.publicFacing) {
    return "Decide the safe next move";
  }

  return "Act on the lesson";
}

function actStagePurpose(
  task: TaskIntake,
  usesSeparatePromptDesign: boolean,
  usesNextActionHelper: boolean,
) {
  if (usesNextActionHelper) {
    return "Use the recommended lighter helper to turn the approved plan into an immediate action without repeating the expensive reasoning.";
  }

  if (needsFullBuildPlan(task)) {
    return "Choose the smallest build action, save the prompt, and decide the measure that will prove the route saved time, cost, or energy.";
  }

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return usesSeparatePromptDesign
      ? "Pick the smallest next step, decide what to measure, and note whether the prompt should be reused, tightened, or rerun with stronger help."
      : "Pick the smallest next step, decide what to measure, and note whether the direct plan should be edited or rerun with stronger help.";
  }

  if (task.qualityBar === "critical" || task.publicFacing) {
    return "Use the review result to proceed, revise, or upgrade the route before anything important depends on it.";
  }

  return "Use what you learned to proceed, save the route if it worked, or adjust the prompt and setup for next time.";
}

function actStageActions(
  task: TaskIntake,
  _usesSeparatePromptDesign: boolean,
  usesNextActionHelper: boolean,
) {
  if (usesNextActionHelper) {
    return [
      "The approved plan is done. A lighter model can package it into an immediate action without repeating the expensive planning work.",
    ];
  }

  if (needsFullBuildPlan(task)) {
    return [
      "Record what this route cost and whether it was worth it. A library of working routes — validated prompts, model choices, and stage sequences — is what makes the next task cheaper.",
    ];
  }

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return [
      "The planning work is done. Pick the smallest next action and decide what measure will show whether it helped. Note whether this prompt is worth keeping.",
    ];
  }

  return [
    "Decide whether to use, save, or adjust the result. The pattern that builds efficiency over time is a library of tested routes — prompts and model choices you have already validated.",
  ];
}

function actStageChecks(task: TaskIntake) {
  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return [
      "Ready to move on when there is a clear first action, a measure, and a note on whether this prompt should be reused or adjusted.",
    ];
  }

  return [
    "Ready to move on when there is a clear next action or a decision to close the task.",
  ];
}

function needsFullBuildPlan(task: TaskIntake) {
  return taskNeedsFullBuildPlan(task);
}

function compactDeliverableText(deliverables: readonly TaskDeliverable[]) {
  return inlineList(compactDeliverableLabels(deliverables));
}

function compactDeliverableLabels(deliverables: readonly TaskDeliverable[]) {
  const specificLabels = deliverables
    .filter((deliverable) => deliverable.kind !== "generic")
    .map((deliverable) => deliverable.label);
  const labels = uniqueLabels(specificLabels.length ? specificLabels : deliverables.map((deliverable) => deliverable.label));
  const omittedGeneric = specificLabels.length > 0 && deliverables.some((deliverable) => deliverable.kind === "generic");
  const visibleLabels = labels.slice(0, 6);

  if (labels.length > visibleLabels.length || omittedGeneric) {
    visibleLabels.push("remaining stated constraints");
  }

  return uniqueLabels(visibleLabels);
}

function friendlyOutputName(value: TaskIntake["outputType"]) {
  const labels: Record<TaskIntake["outputType"], string> = {
    answer: "a direct answer",
    brief: "a short brief",
    plan: "a working plan",
    draft: "a draft",
    code: "code or a technical review",
    table: "a table",
    "slide outline": "a slide outline",
    "route card": "a decision card",
    "prompt package": "copy-ready prompts",
  };

  return labels[value];
}

function uniqueLabels(labels: readonly string[]) {
  return [...new Set(labels)];
}

function inlineList(items: readonly string[]) {
  if (items.length === 0) {
    return "the requested output";
  }

  if (items.length === 1) {
    return items[0] ?? "the requested output";
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function primaryWorkStep(option: RouteOption): RouteStep | undefined {
  return (
    option.steps.find((step) => step.kind === "model") ??
    option.steps.find((step) => step.kind === "artifact") ??
    option.steps.find((step) => step.kind === "manual") ??
    option.steps.find((step) => step.kind !== "human review")
  );
}

function firstStepOfKind(option: RouteOption, kind: RouteStep["kind"]): RouteStep | null {
  return option.steps.find((step) => step.kind === kind) ?? null;
}

function firstStepOfWorkRole(option: RouteOption, workRole: WorkRole): RouteStep | null {
  return option.steps.find((step) => step.workRole === workRole) ?? null;
}

function modelLabelForStep(
  step: RouteStep | undefined | null,
  modelById: Map<string, ModelInventoryItem>,
  manualReviewModel: ModelInventoryItem | undefined,
  fallbackLabel: string,
) {
  if (step?.kind === "manual") {
    return fallbackLabel;
  }

  if (step?.modelId) {
    const model = modelById.get(step.modelId);
    return model ? modelLabelWithMinimum(model) : step.modelId;
  }

  if (step?.kind === "human review") {
    return manualReviewModel?.label ?? "Your review";
  }

  return fallbackLabel;
}

function modelLabelForStageStep(
  task: TaskIntake,
  step: RouteStep | undefined | null,
  modelById: Map<string, ModelInventoryItem>,
  manualReviewModel: ModelInventoryItem | undefined,
  fallbackLabel: string,
  stageMode: "prompt" | "execution",
) {
  if (step?.kind === "manual") {
    return manualSetupGapLabel(task, stageMode === "prompt" ? "prompt-design" : "build-slice", step) ?? fallbackLabel;
  }

  if (step?.modelId) {
    const model = modelById.get(step.modelId);
    if (!model) {
      return step.modelId;
    }

    if (
      stageMode === "execution" &&
      step.modeLabel &&
      (step.workRole === "build-slice" || step.workRole === "execution")
    ) {
      return `${model.label} (execution ${step.modeLabel})`;
    }

    return stageMode === "prompt" ? modelLabelForPromptDesignForTask(model, task) : modelLabelForExecutionForTask(model, task);
  }

  if (step?.kind === "human review") {
    return manualReviewModel?.label ?? "Your review";
  }

  return fallbackLabel;
}

function manualSetupGapLabel(task: TaskIntake, workRole: WorkRole, step: RouteStep | undefined | null) {
  if (step?.kind !== "manual") {
    return null;
  }

  if (task.sensitivityClass !== "public" && task.sensitivityClass !== "internal") {
    return null;
  }

  if (
    !(
      needsFullBuildPlan(task) ||
      taskHasBuildIntent(task) ||
      task.outputType === "plan" ||
      task.knowledgeWorkType === "planning"
    )
  ) {
    return null;
  }

  if (workRole === "scope-framing" || workRole === "plan-synthesis" || workRole === "prompt-design") {
    return "Select a planning-capable AI helper first (Perplexity for research-backed scope; ChatGPT, Claude, Gemini, Grok, Poe, or similar for synthesis)";
  }

  if (workRole === "execution" || workRole === "build-slice" || workRole === "artifact-package") {
    return "Select a build or execution helper first (Claude Code, Cursor, Replit, Copilot, ChatGPT, Gemini, or Grok Build)";
  }

  return null;
}
