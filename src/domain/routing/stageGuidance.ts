import type { ModelInventoryItem, ProjectStageGuidance, RouteOption, RouteStep, TaskIntake } from "../types";

export type BuildProjectStageGuidanceInput = {
  task: TaskIntake;
  recommendedOption: RouteOption;
  models: readonly ModelInventoryItem[];
};

type StageDraft = {
  stage: ProjectStageGuidance["stage"];
  label: string;
  purpose: string;
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
      label: "Frame the job",
      purpose: "Name the goal, audience, constraints, and what good enough looks like before opening an AI tool.",
      fallbackModelLabel: "You first",
    },
  ];

  if (shouldAddGatherStage(task)) {
    stages.push({
      stage: "gather",
      label: gatherStageLabel(task),
      purpose: gatherStagePurpose(task),
      routeStep: researchStep ?? primaryStep,
      fallbackModelLabel: "You first",
    });
  }

  stages.push({
    stage: "create",
    label: createStageLabel(task),
    purpose: createStagePurpose(task),
    routeStep: primaryStep,
    fallbackModelLabel: "You first",
  });

  if (shouldAddPackageStage(task, artifactStep)) {
    stages.push({
      stage: "package",
      label: "Package the result",
      purpose: packageStagePurpose(task),
      routeStep: artifactStep ?? primaryStep,
      fallbackModelLabel: modelLabelForStep(primaryStep, modelById, manualReviewModel, "You first"),
    });
  }

  stages.push({
    stage: "review",
    label: reviewStageLabel(task),
    purpose: reviewStagePurpose(task),
    routeStep: reviewStep ?? undefined,
    fallbackModelLabel: manualReviewModel?.label ?? "Your review",
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
    label: stageDraft.label,
    purpose: stageDraft.purpose,
    recommendedModelLabel,
    ...(stageDraft.routeStep?.modelId ? { recommendedModelId: stageDraft.routeStep.modelId } : {}),
    ...(stageDraft.routeStep?.id ? { routeStepId: stageDraft.routeStep.id } : {}),
  };
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
    return "Collect current facts and citation notes before asking for synthesis.";
  }

  if (task.requiresCurrentFacts) {
    return "Check what has changed recently before drafting an answer.";
  }

  if (task.requiresCitations) {
    return "Collect source notes so claims can be traced before drafting.";
  }

  return "Keep only the information you intend to use, then move it into the chosen tool yourself.";
}

function createStageLabel(task: TaskIntake) {
  switch (task.outputType) {
    case "answer":
      return "Draft the answer";
    case "brief":
      return "Draft the brief";
    case "plan":
      return "Sketch the plan";
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
    return "Use the recommended tool for the technical pass, then inspect the result yourself.";
  }

  if (task.knowledgeWorkType === "review") {
    return "Use the recommended tool to surface issues, gaps, and possible improvements.";
  }

  if (task.knowledgeWorkType === "analysis") {
    return "Use the recommended tool to compare, reason through, and summarize the important tradeoffs.";
  }

  return "Use the recommended tool to create the requested output from the allowed inputs.";
}

function shouldAddPackageStage(
  task: TaskIntake,
  artifactStep: RouteStep | null,
) {
  return (
    task.knowledgeWorkType === "packaging" ||
    artifactOutputTypes.has(task.outputType) ||
    Boolean(artifactStep)
  );
}

function packageStagePurpose(task: TaskIntake) {
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

function reviewStageLabel(task: TaskIntake) {
  if (task.publicFacing || task.sensitivityClass === "public-facing risk") {
    return "Review before sharing";
  }

  if (task.qualityBar === "high" || task.qualityBar === "critical") {
    return "Review for quality";
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

  return "Notice whether this route was enough, then use that lesson to choose faster next time.";
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
  if (step?.modelId) {
    return modelById.get(step.modelId)?.label ?? step.modelId;
  }

  if (step?.kind === "human review") {
    return manualReviewModel?.label ?? "Your review";
  }

  return fallbackLabel;
}
