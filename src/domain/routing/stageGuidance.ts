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
    methodLabel: "Plan - Analyze",
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
      "Check the newest allowed source before prompt design or execution.",
      "Write down what changed and what still looks stable.",
      "Mark anything that should be verified again later.",
    ];
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
  if (task.knowledgeWorkType === "coding") {
    return "Use the recommended helper for the thinking-heavy part first: write a precise build prompt before asking anything to make the tool.";
  }

  if (task.knowledgeWorkType === "review") {
    return "Turn the review job into a clear prompt with criteria, evidence limits, issue categories, and a decision rule.";
  }

  if (task.knowledgeWorkType === "analysis") {
    return "Turn the analysis job into a prompt that asks for options, tradeoffs, assumptions, and a recommendation.";
  }

  if (task.knowledgeWorkType === "planning" || task.outputType === "plan") {
    return "Create the master prompt that will later produce the plan, including phases, measures, risks, review checks, and upgrade triggers.";
  }

  return "Write the prompt before the output: define the role, inputs, constraints, format, review checks, and when to upgrade.";
}

function createStageActions(task: TaskIntake) {
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
      "Ask for a master prompt that will create a beginner-friendly plan later.",
      "Make it require Plan-Do-Check-Act, or light DMAIC when useful.",
      "Include goals, measures, dependencies, risks, first action, review points, and upgrade triggers.",
      "Require a savings note that compares the lean route with heavier premium use.",
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

  if (task.outputType === "plan") {
    return "Run the prompt for the plan";
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
  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return "Use the master prompt to build the smallest useful version first, then leave bigger features for later passes.";
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
  if (task.knowledgeWorkType === "coding" || task.outputType === "code") {
    return [
      "Paste the master prompt into the selected execution helper.",
      "Build only the first useful slice before adding polish or extra features.",
      "Ask for the files, components, tests, and manual checks needed for that slice.",
      "Stop and upgrade only if the build plan is confused, unsafe, or repeatedly failing review.",
    ];
  }

  if (task.outputType === "plan") {
    return [
      "Paste the master prompt into the selected execution helper.",
      "Create the ordered plan with phases or numbered steps.",
      "Add owners or first actions, needed inputs, blockers, measures, and review points.",
      "Mark when to stay lightweight and when a stronger helper would be worth it.",
    ];
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

  if (task.outputType === "plan") {
    return ["A novice can see the first action, the sequence, the measure, and the next review point."];
  }

  return ["The result follows the master prompt and is ready for review before outside use."];
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

  return "Compare the executed result against the master prompt, acceptance checks, and original task before deciding what to do next.";
}

function reviewStageActions(task: TaskIntake) {
  const actions = [
    "Read the prompt and the result together, from the perspective of the person who has to use it.",
    "Fix unclear steps, unsupported claims, missing context, or places where the helper ignored the prompt.",
    "Mark anything that needs one more pass before action.",
  ];

  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    actions.splice(1, 0, "Check tone, permissions, facts, and risk before sharing.");
  }

  return actions;
}

function reviewStageChecks(task: TaskIntake) {
  const checks = ["The result matches the prompt, the original task, and the promised output format."];

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
    return "Pick the smallest next step, decide what to measure, and note whether the prompt should be reused, tightened, or rerun with stronger help.";
  }

  if (task.qualityBar === "critical" || task.publicFacing) {
    return "Use the review result to proceed, revise, or upgrade the route before anything important depends on it.";
  }

  return "Use what you learned to proceed, save the route if it worked, or adjust the prompt and setup for next time.";
}

function actStageActions(task: TaskIntake) {
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
