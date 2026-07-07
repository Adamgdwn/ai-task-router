import type { ModelInventoryItem, ProjectStageGuidance, RouteOption, RouteStep, TaskIntake } from "../types";
import { modelLabelWithMinimum } from "./modelGuidance";

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
};

const artifactOutputTypes = new Set<TaskIntake["outputType"]>([
  "table",
  "slide outline",
  "route card",
  "prompt package",
]);

export function buildProjectStageGuidance({
  task,
  recommendedOption,
  models,
}: BuildProjectStageGuidanceInput): ProjectStageGuidance[] {
  const modelById = new Map(models.map((model) => [model.id, model]));
  const manualReviewModel = models.find((model) => model.tier === "human");
  const researchStep = firstStepOfKind(recommendedOption, "research");
  const primaryStep = primaryWorkStep(recommendedOption);
  const artifactStep = firstStepOfKind(recommendedOption, "artifact");
  const reviewStep = firstStepOfKind(recommendedOption, "human review");

  const stages: StageDraft[] = [
    {
      stage: "frame",
      methodLabel: "Plan - Define",
      label: "Frame the outcome",
      purpose: "Write down the goal, who will use the result, what inputs are allowed, and what done looks like.",
      actions: frameStageActions(task),
      reviewChecks: frameStageChecks(task),
      fallbackModelLabel: "You first",
    },
  ];

  if (shouldAddGatherStage(task)) {
    stages.push({
      stage: "gather",
      methodLabel: "Plan - Measure",
      label: gatherStageLabel(task),
      purpose: gatherStagePurpose(task),
      actions: gatherStageActions(task),
      reviewChecks: gatherStageChecks(task),
      routeStep: researchStep ?? primaryStep,
      fallbackModelLabel: "You first",
    });
  }

  stages.push({
    stage: "create",
    methodLabel: "Do - Analyze/Improve",
    label: createStageLabel(task),
    purpose: createStagePurpose(task),
    actions: createStageActions(task),
    reviewChecks: createStageChecks(task),
    routeStep: primaryStep,
    fallbackModelLabel: "You first",
  });

  if (shouldAddPackageStage(task, artifactStep)) {
    stages.push({
      stage: "package",
      methodLabel: "Do - Improve",
      label: packageStageLabel(task),
      purpose: packageStagePurpose(task),
      actions: packageStageActions(task),
      reviewChecks: packageStageChecks(task),
      routeStep: artifactStep ?? primaryStep,
      fallbackModelLabel: modelLabelForStep(primaryStep, modelById, manualReviewModel, "You first"),
    });
  }

  stages.push({
    stage: "review",
    methodLabel: "Check - Control",
    label: reviewStageLabel(task),
    purpose: reviewStagePurpose(task),
    actions: reviewStageActions(task),
    reviewChecks: reviewStageChecks(task),
    routeStep: reviewStep ?? undefined,
    fallbackModelLabel: manualReviewModel?.label ?? "Your review",
  });

  stages.push({
    stage: "act",
    methodLabel: "Act - Control",
    label: actStageLabel(task),
    purpose: actStagePurpose(task),
    actions: actStageActions(task),
    reviewChecks: actStageChecks(task),
    fallbackModelLabel: "You first",
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

  return {
    id: `stage-${task.id}-${stageDraft.stage}`,
    stage: stageDraft.stage,
    methodLabel: stageDraft.methodLabel,
    label: stageDraft.label,
    purpose: stageDraft.purpose,
    actions: stageDraft.actions,
    reviewChecks: stageDraft.reviewChecks,
    recommendedModelLabel,
    ...(stageDraft.routeStep?.modelId ? { recommendedModelId: stageDraft.routeStep.modelId } : {}),
    ...(stageDraft.routeStep?.id ? { routeStepId: stageDraft.routeStep.id } : {}),
  };
}

function frameStageActions(task: TaskIntake) {
  return [
    "Restate the task in one plain sentence.",
    `Name the finished output: ${friendlyOutputName(task.outputType)}.`,
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
  return task.requestedSourceIds.length > 0 || task.requiresCurrentFacts || task.requiresCitations;
}

function gatherStageLabel(task: TaskIntake) {
  if (task.requiresCurrentFacts || task.requiresCitations) {
    return "Check the evidence";
  }

  return "Gather the inputs";
}

function gatherStagePurpose(task: TaskIntake) {
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
  if (task.requiresCurrentFacts && task.requiresCitations) {
    return [
      "Open the allowed sources yourself.",
      "Capture the claim, source link or citation note, and date checked.",
      "Separate confirmed facts from assumptions or guesses.",
      "Bring only the relevant notes into the next stage.",
    ];
  }

  if (task.requiresCurrentFacts) {
    return [
      "Check the newest allowed source before drafting.",
      "Write down what changed and what still looks stable.",
      "Mark anything that should be verified again later.",
    ];
  }

  if (task.requiresCitations) {
    return [
      "Collect source notes for any claim that matters.",
      "Keep citation details beside the fact they support.",
      "Leave unsupported claims out of the first draft.",
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
      return "Draft the answer";
    case "brief":
      return "Draft the brief";
    case "plan":
      return "Build the working plan";
    case "draft":
      return "Create the first draft";
    case "code":
      return "Build or inspect the code";
    case "table":
      return "Shape the table";
    case "slide outline":
      return "Outline the slides";
    case "route card":
      return "Draft the decision card";
    case "prompt package":
      return "Draft the prompts";
  }
}

function createStagePurpose(task: TaskIntake) {
  if (task.knowledgeWorkType === "coding") {
    return "Use the recommended helper to turn the goal into a build plan, first version, or code-review checklist.";
  }

  if (task.knowledgeWorkType === "review") {
    return "Use the recommended helper to surface issues, gaps, improvement options, and the safest next step.";
  }

  if (task.knowledgeWorkType === "analysis") {
    return "Use the recommended helper to compare options, reason through tradeoffs, and recommend what to do next.";
  }

  if (task.knowledgeWorkType === "planning" || task.outputType === "plan") {
    return "Ask for a beginner-friendly plan with ordered steps, tool choices, review checks, and savings or upgrade points.";
  }

  return "Use the recommended helper to create the requested output from the allowed inputs.";
}

function createStageActions(task: TaskIntake) {
  if (task.knowledgeWorkType === "coding") {
    return [
      "Ask for the smallest safe build or review plan first.",
      "Name files, constraints, and test expectations before implementing.",
      "Keep risky changes separate from obvious cleanup.",
    ];
  }

  if (task.knowledgeWorkType === "review") {
    return [
      "Ask the helper to find issues, missing context, and improvement options.",
      "Sort the feedback into must-fix, nice-to-have, and questions.",
      "Keep the final decision with you.",
    ];
  }

  if (task.knowledgeWorkType === "analysis") {
    return [
      "Ask for options, tradeoffs, and a recommendation.",
      "Make the helper show assumptions and unknowns.",
      "Keep a short decision note beside the result.",
    ];
  }

  if (task.knowledgeWorkType === "planning" || task.outputType === "plan") {
    return [
      "Ask for goals, milestones, dependencies, and risks.",
      "Request beginner-friendly steps with a clear order.",
      "Ask for tool choices, review points, and upgrade triggers.",
      "Keep the first action small enough to start immediately.",
    ];
  }

  return [
    "Ask for a first usable version, not a perfect final answer.",
    "Include the allowed inputs and the finish line from stage 1.",
    "Ask the helper to flag assumptions or missing information.",
  ];
}

function createStageChecks(task: TaskIntake) {
  const checks = ["The output answers the original task in the requested format."];

  if (task.qualityBar === "high" || task.qualityBar === "critical") {
    checks.push("Weak claims, vague steps, and unsupported recommendations are marked for review.");
  }

  return checks;
}

function shouldAddPackageStage(
  task: TaskIntake,
  artifactStep: RouteStep | null,
) {
  return (
    task.knowledgeWorkType === "packaging" ||
    task.outputType === "plan" ||
    artifactOutputTypes.has(task.outputType) ||
    Boolean(artifactStep)
  );
}

function packageStageLabel(task: TaskIntake) {
  if (task.outputType === "plan") {
    return "Turn it into a checklist";
  }

  return "Package the result";
}

function packageStagePurpose(task: TaskIntake) {
  if (task.outputType === "plan") {
    return "Turn the plan into a short checklist with the first action, dependencies, review points, and upgrade triggers.";
  }

  if (task.outputType === "table") {
    return "Turn the useful parts into rows, columns, and labels that can be checked quickly.";
  }

  if (task.outputType === "slide outline") {
    return "Turn the draft into slide-sized sections with clear headings and talking points.";
  }

  if (task.outputType === "route card" || task.outputType === "prompt package") {
    return "Convert the work into copy-ready guidance that can be saved or shared locally.";
  }

  return "Clean up the result so it matches the format you actually need.";
}

function packageStageActions(task: TaskIntake) {
  if (task.outputType === "plan") {
    return [
      "Turn the draft into phases or numbered steps.",
      "Add the first action, needed inputs, blockers, and review points.",
      "Mark when to stay lightweight and when to upgrade to stronger help.",
    ];
  }

  if (task.outputType === "table") {
    return [
      "Convert useful details into clear rows and columns.",
      "Use labels that a non-expert can scan quickly.",
      "Leave unknown values blank or marked for review.",
    ];
  }

  if (task.outputType === "slide outline") {
    return [
      "Break the result into slide-sized sections.",
      "Give each slide one job and a short talking point.",
      "Move extra detail into notes instead of crowding the outline.",
    ];
  }

  if (task.outputType === "route card" || task.outputType === "prompt package") {
    return [
      "Convert the result into copy-ready instructions.",
      "Keep inputs, constraints, review checks, and stop points visible.",
      "Remove anything you would not actually paste or follow.",
    ];
  }

  return [
    "Trim the result into the format you need.",
    "Put the most useful part first.",
    "Add any missing labels, next steps, or review notes.",
  ];
}

function packageStageChecks(task: TaskIntake) {
  if (task.outputType === "plan") {
    return ["A novice can see what to do first and what to check before moving on."];
  }

  return ["The package is easy to scan and ready for your next manual action."];
}

function reviewStageLabel(task: TaskIntake) {
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
  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    return "Check facts, tone, permissions, and risk before anything leaves your hands.";
  }

  if (task.qualityBar === "critical") {
    return "Do a careful human pass before relying on the result.";
  }

  if (task.qualityBar === "high") {
    return "Compare the result against the goal and tighten anything weak or unsupported.";
  }

  return "Confirm the result is clear, useful, and safe enough before deciding what to do next.";
}

function reviewStageActions(task: TaskIntake) {
  const actions = [
    "Read the result from the perspective of the person who has to use it.",
    "Fix unclear steps, unsupported claims, or missing context.",
    "Mark anything that needs one more pass before action.",
  ];

  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    actions.splice(1, 0, "Check tone, permissions, facts, and risk before sharing.");
  }

  return actions;
}

function reviewStageChecks(task: TaskIntake) {
  const checks = ["The result is clear enough to act on without guessing."];

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
  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return "Pick the smallest next step, decide what to measure, and note when the plan should loop back for another check.";
  }

  if (task.qualityBar === "critical" || task.publicFacing) {
    return "Use the review result to proceed, revise, or upgrade the route before anything important depends on it.";
  }

  return "Use what you learned to proceed, save the route if it worked, or adjust the setup for next time.";
}

function actStageActions(task: TaskIntake) {
  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    return [
      "Choose one first action that can be started today.",
      "Name the measure that will show whether the plan helped.",
      "Decide the trigger for looping back to Plan or upgrading the helper.",
    ];
  }

  return [
    "Decide whether to use, edit, or reject the result.",
    "Save the recommendation if you followed it.",
    "Carry one lesson into the next similar task.",
  ];
}

function actStageChecks(task: TaskIntake) {
  const checks = ["There is a clear next action, owner, or decision."];

  if (task.outputType === "plan" || task.knowledgeWorkType === "planning") {
    checks.push("The plan says what to check after the first action.");
  }

  return checks;
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
