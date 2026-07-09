import type {
  ModelInventoryItem,
  ProjectStageGuidance,
  ProjectStageWorkItem,
  RouteOption,
  RouteStep,
  TaskIntake,
  WorkRole,
} from "../types";
import { estimateRouteStepCostUsd, estimateRouteStepEnergyWh } from "./routeEconomics";
import {
  modelLabelForExecutionForTask,
  modelLabelForPromptDesignForTask,
  modelLabelWithMinimum,
} from "./modelGuidance";
import {
  decomposeTask,
  requestedDeliverableLabels,
  taskHasBuildIntent,
  taskHasModelSelectionIntent,
  taskNeedsEvidenceCheck,
  taskNeedsFullBuildPlan,
  type TaskDecomposition,
  type TaskDeliverable,
} from "./taskDecomposition";

export type BuildProjectStageGuidanceInput = {
  task: TaskIntake;
  recommendedOption: RouteOption;
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
  recommendedOption,
  models,
}: BuildProjectStageGuidanceInput): ProjectStageGuidance[] {
  const modelById = new Map(models.map((model) => [model.id, model]));
  const manualReviewModel = models.find((model) => model.tier === "human");
  const decomposition = decomposeTask(task);
  const researchStep = firstStepOfWorkRole(recommendedOption, "evidence-check") ?? firstStepOfKind(recommendedOption, "research");
  const promptStep = firstStepOfWorkRole(recommendedOption, "prompt-design") ?? primaryWorkStep(recommendedOption);
  const primaryStep = promptStep;
  const executionStep =
    firstStepOfWorkRole(recommendedOption, "build-slice") ??
    firstStepOfWorkRole(recommendedOption, "execution") ??
    primaryWorkStep(recommendedOption);
  const artifactStep = firstStepOfKind(recommendedOption, "artifact");
  const humanApprovalStep = firstStepOfKind(recommendedOption, "human review");
  const reviewSupportStep = firstStepOfWorkRole(recommendedOption, "quality-review") ?? aiReviewSupportStep(task, promptStep);
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
      label: "Frame the outcome",
      purpose: "Write down the goal, who will use the result, what inputs are allowed, and what done looks like.",
      actions: frameStageActions(task),
      reviewChecks: frameStageChecks(task),
      fallbackModelLabel: "You first",
      workItems: frameStageWorkItems(task, decomposition),
    },
  ];

  if (shouldAddGatherStage(task)) {
    stages.push({
      stage: "gather",
      methodLabel: "Plan",
      label: gatherStageLabel(task),
      purpose: gatherStagePurpose(task),
      actions: gatherStageActions(task),
      reviewChecks: gatherStageChecks(task),
      routeStep: researchStep ?? primaryStep,
      fallbackModelLabel: "You first",
      workItems: buildStageWorkItems({
        task,
        decomposition,
        stage: "gather",
        workRole: "evidence-check",
        routeStep: researchStep ?? undefined,
        modelById,
        manualReviewModel,
        fallbackModelLabel: "You first",
      }),
    });
  }

  stages.push({
    stage: "create",
    methodLabel: "Plan",
    label: createStageLabel(task),
    purpose: createStagePurpose(task),
    actions: createStageActions(task),
    reviewChecks: createStageChecks(task),
    routeStep: primaryStep,
    fallbackModelLabel: "You first",
    recommendedModelLabel: promptBuilderModelLabel,
    recommendedModelId: primaryStep?.modelId,
    workItems: buildStageWorkItems({
      task,
      decomposition,
      stage: "create",
      workRole: "prompt-design",
      routeStep: promptStep,
      modelById,
      manualReviewModel,
      fallbackModelLabel: "You first",
    }),
  });

  if (shouldAddPackageStage(task, artifactStep)) {
    stages.push({
      stage: "package",
      methodLabel: "Do",
      label: packageStageLabel(task),
      purpose: packageStagePurpose(task),
      actions: packageStageActions(task),
      reviewChecks: packageStageChecks(task),
      routeStep: artifactStep ?? executionStep,
      fallbackModelLabel: modelLabelForStep(primaryStep, modelById, manualReviewModel, "You first"),
      recommendedModelLabel: executionModelLabel,
      recommendedModelId: (artifactStep ?? executionStep)?.modelId,
      workItems: buildStageWorkItems({
        task,
        decomposition,
        stage: "package",
        workRole: artifactStep ? "artifact-package" : executionStep?.workRole === "build-slice" ? "build-slice" : "execution",
        routeStep: artifactStep ?? executionStep,
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
    purpose: reviewStagePurpose(task),
    actions: reviewStageActions(task),
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
      modelById,
      manualReviewModel,
      fallbackModelLabel: manualReviewModel?.label ?? "Your review",
    }),
  });

  stages.push({
    stage: "act",
    methodLabel: "Act",
    label: actStageLabel(task),
    purpose: actStagePurpose(task),
    actions: actStageActions(task),
    reviewChecks: actStageChecks(task),
    fallbackModelLabel: "You first",
    workItems: buildStageWorkItems({
      task,
      decomposition,
      stage: "act",
      workRole: "next-action",
      routeStep: undefined,
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
  modelById: Map<string, ModelInventoryItem>;
  manualReviewModel: ModelInventoryItem | undefined;
  fallbackModelLabel: string;
}): ProjectStageWorkItem[] {
  const { task, decomposition, stage, workRole, routeStep, modelById, manualReviewModel, fallbackModelLabel } = input;
  const deliverables = deliverablesForStageRole(decomposition, workRole);
  const targets = [deliverables];
  const estimatedCostUsd = routeStep ? estimateRouteStepCostUsd(routeStep, modelById) : undefined;
  const estimatedEnergyWh = routeStep ? estimateRouteStepEnergyWh(routeStep, modelById) : undefined;
  const perItemCost = estimatedCostUsd !== undefined ? estimatedCostUsd / targets.length : undefined;
  const perItemEnergy = estimatedEnergyWh !== undefined ? estimatedEnergyWh / targets.length : undefined;

  return targets.map((targetDeliverables, index) => {
    const deliverableIds = targetDeliverables.map((deliverable) => deliverable.id);
    const label = workItemLabel(task, workRole, targetDeliverables, stage);
    const setupGapLabel = manualSetupGapLabel(task, workRole, routeStep);

    return {
      id: `stage-${task.id}-${stage}-${workRole}-${index + 1}`,
      workRole,
      deliverableIds,
      label,
      expectedOutput: expectedOutputForWorkItem(task, workRole, targetDeliverables),
      recommendedModelLabel:
        setupGapLabel ??
        recommendedLabelForWorkItem(routeStep, modelById, manualReviewModel, fallbackModelLabel),
      ...(routeStep?.modelId ? { recommendedModelId: routeStep.modelId } : {}),
      ...(routeStep?.modeId ? { modeId: routeStep.modeId } : {}),
      ...(routeStep?.modeLabel ? { modeLabel: routeStep.modeLabel } : {}),
      selectionReasons: routeStep?.selectionReasons?.length
        ? routeStep.selectionReasons
        : setupGapLabel
          ? ["A research-only or manual setup cannot execute this build stage; add or select a build-capable AI helper before relying on the route."]
          : ["This stage follows the selected route and the user's allowed tools."],
      reviewChecks: reviewChecksForWorkItem(task, workRole, targetDeliverables),
      upgradeTrigger: upgradeTriggerForWorkItem(task, workRole),
      ...(perItemCost !== undefined ? { estimatedCostUsd: roundEstimate(perItemCost) } : {}),
      ...(perItemEnergy !== undefined ? { estimatedEnergyWh: roundEstimate(perItemEnergy) } : {}),
    };
  });
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
) {
  const deliverableLabel = deliverables.length === 1 ? deliverables[0]?.label : "full request";

  switch (workRole) {
    case "evidence-check":
      return taskHasModelSelectionIntent(task) ? "Check evidence and model availability" : `Check evidence for ${deliverableLabel}`;
    case "prompt-design":
      return deliverables.length > 1 || needsFullBuildPlan(task) ? "Build one master prompt" : `Build the prompt for ${deliverableLabel}`;
    case "execution":
      return deliverables.length > 1 ? "Run the finished prompt" : `Execute ${deliverableLabel}`;
    case "build-slice":
      return "Create the first usable build slice";
    case "artifact-package":
      return `Package ${deliverableLabel}`;
    case "quality-review":
      return "Review the result";
    case "next-action":
      return stage === "act" ? "Pick the first action" : "Confirm scope";
  }
}

function expectedOutputForWorkItem(
  task: TaskIntake,
  workRole: WorkRole,
  deliverables: readonly TaskDeliverable[],
) {
  const deliverableText = compactDeliverableText(deliverables);

  switch (workRole) {
    case "evidence-check":
      return `Current facts, source notes, model availability, and privacy notes that affect ${deliverableText}.`;
    case "prompt-design":
      return `One master prompt that covers ${deliverableText}, names the execution helper or mode, and includes privacy limits, checks, and upgrade triggers.`;
    case "execution":
      return `The first usable ${task.outputType} output for ${deliverableText}.`;
    case "build-slice":
      return `The actual build plan or first usable slice for ${deliverableText}, including data flow, screens or files, tests, and deferred work.`;
    case "artifact-package":
      return `A saved or copy-ready ${task.outputType} package with warnings, checks, and next action visible.`;
    case "quality-review":
      return `A pass/fail review of ${deliverableText || "the result"} against the prompt, privacy limits, and acceptance checks.`;
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
    case "evidence-check":
      return [
        "Current facts and model/privacy assumptions are dated or marked uncertain.",
        "No unapproved source is required for the next stage.",
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
      return ["The package keeps warnings, checks, savings, and next action visible."];
    case "quality-review":
      return ["Every requested deliverable is present or explicitly marked as missing.", "Privacy and sensitivity limits are still respected."];
    case "next-action":
      return ["The next action is small, visible, and tied to a measure."];
  }
}

function upgradeTriggerForWorkItem(task: TaskIntake, workRole: WorkRole) {
  if (workRole === "prompt-design") {
    return "Upgrade the prompt-design helper only if the master prompt misses deliverables, checks, privacy, or the execution model choice.";
  }

  if (workRole === "execution" || workRole === "build-slice") {
    return "Upgrade execution only if the lighter mode ignores the master prompt or fails review after a focused retry.";
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
    return modelPrefix ? `${modelPrefix} (${routeStep.modeLabel})` : routeStep.modeLabel;
  }

  return modelLabelForStep(routeStep, modelById, manualReviewModel, fallbackModelLabel);
}

function roundEstimate(value: number) {
  return Math.round(value * 1000) / 1000;
}

function frameStageActions(task: TaskIntake) {
  return [
    "Restate the task in one plain sentence.",
    `Name the finished output: ${friendlyOutputName(task.outputType)}.`,
    `Split the request into visible deliverables: ${compactTaskDeliverableSummary(task)}.`,
    "List the information you will use and anything that is off limits.",
    "Decide what good enough looks like before opening a helper.",
  ];
}

function frameStageChecks(task: TaskIntake) {
  const checks = ["The goal, audience, inputs, and finish line are clear."];

  if (task.sensitivityClass !== "public") {
    checks.push("Private or sensitive details stay out of tools that are not allowed for them.");
  }

  return checks;
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

function gatherStageActions(task: TaskIntake) {
  if (taskHasModelSelectionIntent(task)) {
    return [
      "Check which models or modes are actually available in the tools you selected.",
      "Write down the minimum execution mode, the stronger prompt-design mode, and the upgrade trigger.",
      "Note privacy limits before moving any project details into a helper.",
      "Bring only the relevant availability notes into the master prompt.",
    ];
  }

  if (task.requiresCurrentFacts && task.requiresCitations) {
    return [
      "Open the allowed sources yourself.",
      "Capture the claim, source link or citation note, and date checked.",
      "Separate confirmed facts from assumptions or guesses.",
      "Bring only the relevant notes into the next stage.",
    ];
  }

  if (task.requiresCurrentFacts) {
    const actions = [
      "Check the newest allowed source before prompt design or execution.",
      "Write down what changed and what still looks stable.",
      "Mark anything that should be verified again later.",
    ];

    if (taskHasModelSelectionIntent(task)) {
      actions.push("Check current tool/model availability, limits, and privacy notes before choosing the execution model.");
    }

    return actions;
  }

  if (task.requiresCitations) {
    return [
      "Collect source notes for any claim that matters.",
      "Keep citation details beside the fact they support.",
      "Leave unsupported claims out of the prompt and first output.",
    ];
  }

  return [
    "Gather only the files, links, notes, or context you plan to use.",
    "Remove unrelated material before pasting anything into a helper.",
    "Put the most important details at the top.",
  ];
}

function gatherStageChecks(task: TaskIntake) {
  const checks = ["The next stage has enough context to work without guessing."];

  if (taskHasModelSelectionIntent(task)) {
    checks.push("The model or mode choice is named clearly enough for a novice to select it.");
  }

  if (task.requiresCurrentFacts) {
    checks.push("Current facts have been checked recently.");
  }

  if (task.requiresCitations) {
    checks.push("Important claims have source notes.");
  }

  return checks;
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
    return "Use the highest-level helper or reasoning mode you already own for the thinking-heavy part: create the master prompt before any lower-cost execution run.";
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
      "Ask the highest-level model or reasoning mode you own to create the master prompt before any lower-mode execution run.",
      `Make one prompt cover the main deliverables: ${compactTaskDeliverableSummary(task)}.`,
      `Require the prompt to produce the actual build path: ${buildPlanCoverageSummary(task)}.`,
      "Include four sections only: Plan, Do, Check, and Act, plus privacy limits, acceptance checks, exact execution mode, and upgrade trigger.",
    ];
  }

  if (task.knowledgeWorkType === "coding") {
    return [
      "Ask for a master build prompt, not the finished app yet.",
      "Make the prompt name the smallest usable version, data flow, screens, files, tests, and acceptance checks.",
      "Include what to avoid, what to ask before building, and what can wait for a later version.",
      "Ask which execution helper is the minimum safe choice and what would justify upgrading.",
    ];
  }

  if (task.knowledgeWorkType === "review") {
    return [
      "Ask for a review prompt with categories for defects, risks, missing context, and improvement options.",
      "Require the prompt to separate must-fix items, nice-to-have ideas, and open questions.",
      "Add a human decision rule for approve, revise, stop, or reroute.",
    ];
  }

  if (task.knowledgeWorkType === "analysis") {
    return [
      "Ask for a prompt that compares options, tradeoffs, assumptions, unknowns, and a recommendation.",
      "Require a short decision table or ranked list if that would make the result easier to inspect.",
      "Add a check for unsupported claims or stale information.",
    ];
  }

  if (task.knowledgeWorkType === "planning" || task.outputType === "plan") {
    return [
      "Ask for a master prompt, not the finished output yet.",
      `Make the prompt cover every main deliverable: ${compactTaskDeliverableSummary(task)}.`,
      "Make it require four sections only: Plan, Do, Check, and Act.",
      "Require the prompt to name the minimum execution model or mode and what would justify upgrading.",
    ];
  }

  return [
    "Ask for the exact prompt you should run next, not the final answer yet.",
    "Include the allowed inputs, finish line, output format, tone, and constraints from stage 1.",
    "Require checks for assumptions, missing information, and when to use stronger help.",
  ];
}

function createStageChecks(task: TaskIntake) {
  const checks = ["The prompt is specific enough that another helper could execute it without guessing."];

  if (task.qualityBar === "high" || task.qualityBar === "critical") {
    checks.push("The prompt includes acceptance checks, stop conditions, and an upgrade trigger.");
  }

  return checks;
}

function shouldAddPackageStage(
  _task: TaskIntake,
  _artifactStep: RouteStep | null,
) {
  return true;
}

function packageStageLabel(task: TaskIntake) {
  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return "Build the first slice";
  }

  if (needsFullBuildPlan(task)) {
    return "Execute the build plan prompt";
  }

  if (taskHasBuildIntent(task)) {
    return "Run the build prompt";
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

function packageStagePurpose(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return "Paste the approved master prompt into the lightest adequate execution mode and make it produce the actual build plan, model choice, and first usable slice.";
  }

  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return "Use the master prompt to build the smallest useful version first, then leave bigger features for later passes.";
  }

  if (taskHasBuildIntent(task) && (task.outputType === "plan" || task.knowledgeWorkType === "planning")) {
    return "Use the master prompt with the lightest adequate execution model or mode to produce the actual build plan and first usable slice.";
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

function packageStageActions(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return [
      "Paste the approved master prompt into the chosen lighter execution model or mode.",
      `Generate the actual plan or build brief, not more prompt advice: ${buildPlanCoverageSummary(task)}.`,
      "Require data flow, screens or files, acceptance tests, and what can wait for a later pass.",
      "Stop after the first usable slice is clear enough for a human review.",
    ];
  }

  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return [
      "Paste the master prompt into the selected execution helper.",
      "Build only the first useful slice before adding polish or extra features.",
      "Ask for the files, components, tests, and manual checks needed for that slice.",
      "Stop and upgrade only if the build plan is confused, unsafe, or repeatedly failing review.",
    ];
  }

  if (task.outputType === "plan") {
    const actions = [
      "Paste the master prompt into the selected execution helper.",
      "Create the ordered plan with phases or numbered steps.",
      "Add owners or first actions, needed inputs, blockers, measures, and review points.",
      "Mark when to stay lightweight and when a stronger helper would be worth it.",
    ];

    if (taskHasBuildIntent(task) || requestedDeliverableLabels(task).length > 0) {
      actions.splice(
        2,
        0,
        `Make the output explicitly cover: ${compactTaskDeliverableSummary(task)}.`,
      );
      return actions.slice(0, 5);
    }

    return actions;
  }

  if (task.outputType === "table") {
    return [
      "Paste the prompt and produce clear rows and columns.",
      "Use labels that a non-expert can scan quickly.",
      "Leave unknown values blank or marked for review.",
    ];
  }

  if (task.outputType === "slide outline") {
    return [
      "Paste the prompt and break the result into slide-sized sections.",
      "Give each slide one job and a short talking point.",
      "Move extra detail into notes instead of crowding the outline.",
    ];
  }

  if (task.outputType === "route card" || task.outputType === "prompt package") {
    return [
      "Paste the prompt and convert the result into copy-ready instructions.",
      "Keep inputs, constraints, review checks, and stop points visible.",
      "Remove anything you would not actually paste or follow.",
    ];
  }

  return [
    "Paste the master prompt into the selected execution helper.",
    "Create the first usable version before asking for polish.",
    "Put the most useful part first.",
    "Add any missing labels, next steps, or review notes.",
  ];
}

function packageStageChecks(task: TaskIntake) {
  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return ["The first slice works well enough to review before more features are added."];
  }

  if (needsFullBuildPlan(task)) {
    return [
      "The output includes the master prompt, execution model choice, build sequence, checks, privacy limits, and savings comparison.",
      "The first build slice is small enough to start without trying to build the whole product at once.",
    ];
  }

  if (taskHasBuildIntent(task)) {
    return ["The plan names the first build slice, execution model, data flow, checks, and what can wait."];
  }

  if (task.outputType === "plan") {
    return ["A novice can see the first action, the sequence, the measure, and the next review point."];
  }

  return ["The result follows the master prompt and is ready for review before outside use."];
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

function reviewStagePurpose(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return "Check the result against the original request, the master prompt, and the expected deliverables before spending more tool time.";
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

  return "Compare the executed result against the master prompt, acceptance checks, and original task before deciding what to do next.";
}

function reviewStageActions(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return [
      "Read the master prompt and execution result together.",
      `Confirm the result covers: ${compactTaskDeliverableSummary(task)}.`,
      "Check that the model choice, data flow, privacy limits, cost, energy, and acceptance checks are explicit.",
      "Mark any unclear build step, missing input, unsupported claim, or upgrade trigger.",
      "Decide whether the same prompt can be reused or needs one stronger prompt-design pass.",
    ];
  }

  const actions = [
    "Read the prompt and the result together, from the perspective of the person who has to use it.",
    "Fix unclear steps, unsupported claims, missing context, or places where the helper ignored the prompt.",
    "Mark anything that needs one more pass before action.",
  ];

  if (requestedDeliverableLabels(task).length > 0) {
    actions.splice(1, 0, `Check that the result covers: ${compactTaskDeliverableSummary(task)}.`);
  }

  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    actions.splice(1, 0, "Check tone, permissions, facts, and risk before sharing.");
  }

  return actions.slice(0, 5);
}

function reviewStageChecks(task: TaskIntake) {
  const checks = ["The result matches the prompt, the original task, and the promised output format."];

  if (needsFullBuildPlan(task)) {
    checks.push("The plan covers the full requested build path, not only the prompt-writing setup.");
  }

  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    checks.push("Nothing public leaves your hands without human approval.");
  }

  if (task.qualityBar === "critical") {
    checks.push("A careful human pass is complete before relying on it.");
  }

  return checks;
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

function actStagePurpose(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return "Choose the smallest build action, save the prompt, and decide the measure that will prove the route saved time, cost, or energy.";
  }

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return "Pick the smallest next step, decide what to measure, and note whether the prompt should be reused, tightened, or rerun with stronger help.";
  }

  if (task.qualityBar === "critical" || task.publicFacing) {
    return "Use the review result to proceed, revise, or upgrade the route before anything important depends on it.";
  }

  return "Use what you learned to proceed, save the route if it worked, or adjust the prompt and setup for next time.";
}

function actStageActions(task: TaskIntake) {
  if (needsFullBuildPlan(task)) {
    return [
      "Choose one first build action, such as the spreadsheet import, category rules, or first tracking view.",
      "Save the master prompt and the execution model choice beside the plan.",
      "Record the expected cost, energy, or rework savings so the route can be learned from later.",
    ];
  }

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return [
      "Choose one first action that can be started today.",
      "Name the measure that will show whether the plan helped.",
      "Decide the trigger for looping back to the prompt or upgrading the helper.",
    ];
  }

  return [
    "Decide whether to use, edit, or reject the result.",
    "Save the recommendation if you followed it.",
    "Carry one prompt or routing lesson into the next similar task.",
  ];
}

function actStageChecks(task: TaskIntake) {
  const checks = ["There is a clear next action, owner, or decision."];

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    checks.push("The plan says what to check after the first action.");
    if (taskHasBuildIntent(task)) {
      checks.push("The first action starts the smallest useful build slice, not the whole product at once.");
    }
  }

  return checks;
}

function needsFullBuildPlan(task: TaskIntake) {
  return taskNeedsFullBuildPlan(task);
}

function buildPlanCoverageSummary(task: TaskIntake) {
  const deliverables = requestedDeliverableLabels(task);
  const coverage = [
    deliverables.includes("spreadsheet import or paste-in data flow") ? "spreadsheet import or paste-in data flow" : null,
    deliverables.includes("categorization rules") ? "category rules" : null,
    deliverables.includes("month-over-month tracking") ? "month-over-month tracking view" : null,
    deliverables.includes("improvement and strength insights") ? "improvement and strength signals" : null,
    deliverables.includes("model/tool choice for execution") ? "model and tool choice for execution" : null,
    deliverables.includes("privacy check for sensitive data") ? "sensitive-data privacy limits" : null,
    deliverables.includes("cost, savings, or energy comparison") ? "cost, savings, and energy comparison" : null,
    taskHasBuildIntent(task) ? "first usable build slice" : null,
  ].filter((item): item is string => item !== null);

  return inlineList(uniqueLabels(coverage.length ? coverage : compactDeliverableLabels(decomposeTask(task).deliverables)));
}

function compactTaskDeliverableSummary(task: TaskIntake) {
  return inlineList(compactDeliverableLabels(decomposeTask(task).deliverables));
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

function primaryWorkStep(recommendedOption: RouteOption): RouteStep | undefined {
  return (
    recommendedOption.steps.find((step) => step.kind === "model") ??
    recommendedOption.steps.find((step) => step.kind === "artifact") ??
    recommendedOption.steps.find((step) => step.kind === "manual") ??
    recommendedOption.steps.find((step) => step.kind !== "human review")
  );
}

function firstStepOfKind(recommendedOption: RouteOption, kind: RouteStep["kind"]): RouteStep | null {
  return recommendedOption.steps.find((step) => step.kind === kind) ?? null;
}

function firstStepOfWorkRole(recommendedOption: RouteOption, workRole: WorkRole): RouteStep | null {
  return recommendedOption.steps.find((step) => step.workRole === workRole) ?? null;
}

function aiReviewSupportStep(task: TaskIntake, promptStep: RouteStep | undefined | null): RouteStep | null {
  if (!promptStep || promptStep.kind === "manual") {
    return null;
  }

  if (
    needsFullBuildPlan(task) ||
    task.qualityBar === "high" ||
    task.qualityBar === "critical" ||
    task.publicFacing
  ) {
    return promptStep;
  }

  return null;
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

    if (stageMode === "execution" && step.workRole === "build-slice" && step.modeLabel) {
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

  if (!(needsFullBuildPlan(task) || taskHasBuildIntent(task))) {
    return null;
  }

  if (workRole === "prompt-design") {
    return "Select a prompt-capable AI helper first (ChatGPT, Claude, Gemini, Grok, Poe, or similar)";
  }

  if (workRole === "execution" || workRole === "build-slice" || workRole === "artifact-package") {
    return "Select a build or execution helper first (Claude Code, Cursor, Replit, Copilot, ChatGPT, Gemini, or Grok Build)";
  }

  return null;
}
