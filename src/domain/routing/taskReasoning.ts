import type { TaskIntake, WorkRole } from "../types";
import {
  decomposeTask,
  taskHasBuildIntent,
  taskNeedsEvidenceCheck,
  type TaskDecomposition,
} from "./taskDecomposition";

export type ReasoningDemand = "light" | "moderate" | "heavy";

export type TaskReasoningProfile = {
  taskId: string;
  demand: ReasoningDemand;
  demandScore: number;
  primaryWorkRole: "execution" | "build-slice";
  requiresEvidence: boolean;
  promptArtifactRequested: boolean;
  explicitPromptHandoff: boolean;
  benefitsFromPromptHandoff: boolean;
  benefitsFromIndependentReview: boolean;
  benefitsFromSpecialistPackaging: boolean;
  assessmentReasons: string[];
};

const reasoningDemandLabels: Record<ReasoningDemand, string> = {
  light: "light",
  moderate: "moderate",
  heavy: "heavy",
};

/**
 * Turn the structured intake and the user's own words into the decisions that shape a route.
 *
 * This is deliberately separate from route formatting. Candidate generation consumes this profile
 * to decide which stages earn a place; stage guidance only explains the route that was selected.
 */
export function analyzeTaskReasoning(
  task: TaskIntake,
  decomposition: TaskDecomposition = decomposeTask(task),
): TaskReasoningProfile {
  const text = normalizedTaskText(task);
  const primaryWorkRole =
    taskHasBuildIntent(task) || task.knowledgeWorkType === "coding" || task.outputType === "code"
      ? "build-slice"
      : "execution";
  const promptRequested =
    task.outputType === "prompt package" ||
    (decomposition.deliverables.some((deliverable) => deliverable.kind === "prompt") &&
      /\b(build|create|draft|write|make|produce|design)\b.{0,36}\bprompt\b/.test(text));
  const explicitPromptHandoff =
    task.outputType !== "prompt package" &&
    promptRequested &&
    (primaryWorkRole === "build-slice" ||
      /\bprompt\b.{0,140}\b(then|after|next|paste|run|use it|hand(?:\s|-)?off)\b/.test(text));
  const promptArtifactRequested =
    task.outputType === "prompt package" ||
    (promptRequested && !explicitPromptHandoff && primaryWorkRole === "execution");
  const substantiveDeliverableCount = decomposition.deliverables.filter(
    (deliverable) => deliverable.kind !== "privacy" && deliverable.kind !== "review",
  ).length;
  const hasOrderingWork =
    decomposition.deliverables.some((deliverable) => deliverable.kind === "dependencies") ||
    /\b(before|after|depends? on|sequence|in order|phase|first.+then)\b/.test(text);
  const hasConstraintWork = /\b(must|must not|only|without|except|constraint|limit|off limits|do not)\b/.test(text);
  const score = clampDemandScore(
    workTypeDemand(task.knowledgeWorkType) +
      outputDemand(task.outputType) +
      (substantiveDeliverableCount >= 4 ? 1 : 0) +
      (hasOrderingWork ? 1 : 0) +
      (hasConstraintWork ? 1 : 0) +
      qualityDemand(task.qualityBar),
  );
  const demand = demandForScore(score);
  const requiresEvidence = taskNeedsEvidenceCheck(task);
  const benefitsFromPromptHandoff =
    primaryWorkRole === "build-slice" &&
    (explicitPromptHandoff || demand === "heavy" || decomposition.complexBuildPlan);
  const benefitsFromIndependentReview =
    explicitlyRequestsOutputReview(task) ||
    task.publicFacing ||
    task.qualityBar === "high" ||
    task.qualityBar === "critical" ||
    task.sensitivityClass === "regulated" ||
    task.sensitivityClass === "highly restricted" ||
    (primaryWorkRole === "build-slice" && demand === "heavy");
  const benefitsFromSpecialistPackaging =
    task.knowledgeWorkType === "packaging" ||
    task.outputType === "table" ||
    task.outputType === "slide outline";

  return {
    taskId: task.id,
    demand,
    demandScore: score,
    primaryWorkRole,
    requiresEvidence,
    promptArtifactRequested,
    explicitPromptHandoff,
    benefitsFromPromptHandoff,
    benefitsFromIndependentReview,
    benefitsFromSpecialistPackaging,
    assessmentReasons: assessmentReasons({
      task,
      demand,
      substantiveDeliverableCount,
      hasOrderingWork,
      hasConstraintWork,
      requiresEvidence,
      benefitsFromIndependentReview,
    }),
  };
}

export function capabilityTargetForRole(
  task: TaskIntake,
  profile: TaskReasoningProfile,
  role: WorkRole,
  strategy: "lean" | "balanced" | "premium",
): number {
  const demandTarget: Record<ReasoningDemand, number> = {
    light: 2.8,
    moderate: 3.7,
    heavy: 4.45,
  };
  const strategyAdjustment = {
    lean: -0.65,
    balanced: 0,
    premium: 0.45,
  }[strategy];
  const roleAdjustment =
    role === "build-slice"
      ? 0.2
      : role === "quality-review"
        ? 0.15
        : role === "artifact-package"
          ? -0.45
          : role === "evidence-check"
            ? task.requiresCitations
              ? 0.15
              : 0
            : 0;

  return clampCapabilityTarget(demandTarget[profile.demand] + strategyAdjustment + roleAdjustment);
}

export function taskReasoningSummary(profile: TaskReasoningProfile): string {
  const reasons = profile.assessmentReasons.slice(0, 2).join(" ");

  return `The request has ${reasoningDemandLabels[profile.demand]} reasoning demand. ${reasons}`.trim();
}

function assessmentReasons(input: {
  task: TaskIntake;
  demand: ReasoningDemand;
  substantiveDeliverableCount: number;
  hasOrderingWork: boolean;
  hasConstraintWork: boolean;
  requiresEvidence: boolean;
  benefitsFromIndependentReview: boolean;
}) {
  const reasons: string[] = [];

  if (input.substantiveDeliverableCount >= 4) {
    reasons.push(`It combines ${input.substantiveDeliverableCount} distinct requested parts.`);
  } else if (input.substantiveDeliverableCount > 1) {
    reasons.push(`It combines ${input.substantiveDeliverableCount} requested parts.`);
  } else {
    reasons.push("It asks for one main finished output.");
  }

  if (input.hasOrderingWork) {
    reasons.push("Dependencies or ordering have to be reasoned through.");
  }

  if (input.hasConstraintWork) {
    reasons.push("The request includes an explicit limit that the result must preserve.");
  }

  if (input.requiresEvidence) {
    reasons.push("Current facts, citations, or model availability must be checked before relying on the result.");
  }

  if (input.benefitsFromIndependentReview) {
    reasons.push("The requested quality, risk, or review need makes a separate check useful.");
  }

  if (input.task.qualityBar === "quick" && input.demand === "light") {
    reasons.push("A fast first pass is enough unless its review check fails.");
  }

  return reasons;
}

function workTypeDemand(workType: TaskIntake["knowledgeWorkType"]) {
  const demand: Record<TaskIntake["knowledgeWorkType"], number> = {
    research: 2,
    synthesis: 2,
    analysis: 2,
    writing: 1,
    coding: 3,
    planning: 2,
    review: 2,
    packaging: 1,
  };

  return demand[workType];
}

function outputDemand(outputType: TaskIntake["outputType"]) {
  const demand: Record<TaskIntake["outputType"], number> = {
    answer: 0,
    brief: 0,
    plan: 1,
    draft: 0,
    code: 2,
    table: 1,
    "slide outline": 1,
    "route card": 1,
    "prompt package": 1,
  };

  return demand[outputType];
}

function qualityDemand(qualityBar: TaskIntake["qualityBar"]) {
  const demand: Record<TaskIntake["qualityBar"], number> = {
    quick: -1,
    standard: 0,
    high: 1,
    critical: 2,
  };

  return demand[qualityBar];
}

function explicitlyRequestsOutputReview(task: TaskIntake) {
  const text = normalizedTaskText(task)
    .replace(/\breview points?\b/g, "")
    .replace(/\breview meetings?\b/g, "")
    .replace(/\breview dates?\b/g, "");

  return /\b(review|check|validate|verify|test|critique|proofread|audit)\b.{0,30}\b(output|result|draft|plan|answer|brief|code|work|accuracy|quality)\b/.test(
    text,
  );
}

function normalizedTaskText(task: TaskIntake) {
  return `${task.title} ${task.description} ${task.knowledgeWorkType} ${task.outputType}`.toLowerCase();
}

function demandForScore(score: number): ReasoningDemand {
  if (score <= 2) {
    return "light";
  }

  if (score <= 5) {
    return "moderate";
  }

  return "heavy";
}

function clampDemandScore(score: number) {
  return Math.min(10, Math.max(0, score));
}

function clampCapabilityTarget(target: number) {
  return Math.min(5, Math.max(1, Math.round(target * 100) / 100));
}
