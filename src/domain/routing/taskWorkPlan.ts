import type { TaskIntake, WorkRole } from "../types";
import { decomposeTask, type TaskDecomposition } from "./taskDecomposition";
import {
  analyzeTaskReasoning,
  type TaskArchetype,
  type TaskReasoningProfile,
} from "./taskReasoning";

export type WorkStageSourceNeed = "task-only" | "research-helpful" | "research-required";

export type PlannedWorkStage = {
  id: string;
  workRole: WorkRole;
  sourceNeed: WorkStageSourceNeed;
  purpose: string;
  outputContract: string;
  selectionReasons: string[];
};

export type TaskWorkPlan = {
  taskId: string;
  archetype: TaskArchetype;
  primaryWorkRole: WorkRole;
  stages: PlannedWorkStage[];
  inferredDeliverableLabels: string[];
};

/**
 * Build the work before choosing tools.
 *
 * This is the planning grammar for the deterministic app. It deliberately accepts no model
 * inventory: adding or removing a provider can change who performs a stage, but it cannot erase
 * scope, evidence, planning, implementation, or review work that the task itself requires.
 */
export function buildTaskWorkPlan(
  task: TaskIntake,
  decomposition: TaskDecomposition = decomposeTask(task),
  reasoning: TaskReasoningProfile = analyzeTaskReasoning(task, decomposition),
): TaskWorkPlan {
  const stages = stagesForArchetype(task, decomposition, reasoning);

  return {
    taskId: task.id,
    archetype: reasoning.archetype,
    primaryWorkRole: reasoning.primaryWorkRole,
    stages,
    inferredDeliverableLabels: decomposition.deliverables.map((deliverable) => deliverable.label),
  };
}

export function workStageForRole(workPlan: TaskWorkPlan, workRole: WorkRole) {
  return workPlan.stages.find((stage) => stage.workRole === workRole) ?? null;
}

function stagesForArchetype(
  task: TaskIntake,
  decomposition: TaskDecomposition,
  reasoning: TaskReasoningProfile,
): PlannedWorkStage[] {
  const stages: PlannedWorkStage[] = [];
  const scopeSourceNeed = scopeSourceNeedFor(task, decomposition, reasoning);

  switch (reasoning.archetype) {
    case "working-plan":
      stages.push(
        scopeStage(task, scopeSourceNeed),
        planSynthesisStage(task),
      );
      if (reasoning.needsDownstreamActionPass) {
        stages.push(nextActionStage(task));
      }
      break;
    case "software-build":
      stages.push(scopeStage(task, scopeSourceNeed));
      if (reasoning.explicitPromptHandoff) {
        stages.push(promptDesignStage(task));
      } else {
        stages.push(planSynthesisStage(task));
      }
      stages.push(buildStage(task));
      break;
    case "research-synthesis":
      stages.push(evidenceStage(task), executionStage(task));
      break;
    case "decision-analysis":
      stages.push(scopeStage(task, scopeSourceNeed), executionStage(task));
      break;
    case "prompt-package":
      if (reasoning.needsScopeFraming) {
        stages.push(scopeStage(task, scopeSourceNeed));
      }
      stages.push(promptDesignStage(task));
      if (reasoning.explicitPromptHandoff) {
        stages.push(executionStage(task));
      }
      if (reasoning.benefitsFromSpecialistPackaging) {
        stages.push(artifactStage(task));
      }
      break;
    case "artifact-production":
      stages.push(executionStage(task), artifactStage(task));
      break;
    case "quality-review":
      stages.push(reviewStage(task));
      break;
    case "simple-output":
      stages.push(executionStage(task));
      break;
  }

  if (
    reasoning.benefitsFromIndependentReview &&
    !stages.some((stage) => stage.workRole === "quality-review")
  ) {
    const actionIndex = stages.findIndex((stage) => stage.workRole === "next-action");
    if (actionIndex === -1) {
      stages.push(reviewStage(task));
    } else {
      stages.splice(actionIndex, 0, reviewStage(task));
    }
  }

  return stages;
}

function scopeStage(task: TaskIntake, sourceNeed: WorkStageSourceNeed): PlannedWorkStage {
  const researchClause =
    sourceNeed === "task-only"
      ? "Use the request itself and mark missing facts."
      : "When public sources are approved, use relevant context and separate checked facts from assumptions; otherwise use only the request.";

  return stage(task, "scope-framing", sourceNeed, {
    purpose:
      "Turn the rough request into a usable scope before detailed planning or implementation starts.",
    outputContract:
      "A draft scope with the intended outcome, audience or user, boundaries, assumptions, blocking unknowns, required decisions, and finish criteria.",
    selectionReasons: [
      "The helper drafts the scope from the request; the user should not have to write a complete brief before AI can help.",
      `${researchClause} Ask only questions whose answers would materially change the route.`,
    ],
  });
}

function evidenceStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "evidence-check", "research-required", {
    purpose: "Collect the current or cited evidence that the requested result depends on.",
    outputContract:
      "A compact evidence note with dated facts, source references, uncertainties, and the assumptions the next stage may safely use.",
    selectionReasons: [
      "Evidence is a separate input because current facts or citations affect whether the result can be trusted.",
    ],
  });
}

function planSynthesisStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "plan-synthesis", "task-only", {
    purpose: "Convert the approved scope and evidence into the actual working plan or build specification.",
    outputContract:
      "An actionable plan with deliverables, workstreams or phases, dependencies, owners or first actions, decisions, risks, measures, review points, and the first usable result.",
    selectionReasons: [
      "This is the reasoning-heavy synthesis pass. It must produce the plan itself, not advice about how the user should build a scope.",
      "The sequence follows real dependencies and carries assumptions or open decisions forward without inventing answers.",
    ],
  });
}

function promptDesignStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "prompt-design", "task-only", {
    purpose: "Create the requested reusable prompt or an explicit prompt handoff for a later tool.",
    outputContract:
      "A copy-ready prompt that carries forward the approved scope, inputs, constraints, expected output, checks, and upgrade trigger.",
    selectionReasons: [
      "Prompt design appears because the user requested a prompt artifact or an explicit prompt-to-tool handoff.",
    ],
  });
}

function executionStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "execution", "task-only", {
    purpose: `Produce the requested ${task.outputType} from the task, scope, plan, or evidence already prepared.`,
    outputContract: `The first usable ${task.outputType}, with assumptions and missing information visible instead of invented.`,
    selectionReasons: [
      "Execution produces the requested result directly and does not add another prompt-only relay.",
    ],
  });
}

function buildStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "build-slice", "task-only", {
    purpose: "Implement the smallest usable slice from the approved scope and build plan.",
    outputContract:
      "A first usable build slice with files or screens, data flow, tests, acceptance checks, deferred work, and recovery notes.",
    selectionReasons: [
      "Implementation starts only after the scope and build plan are explicit enough to prevent avoidable rework.",
    ],
  });
}

function artifactStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "artifact-package", "task-only", {
    purpose: `Package the reviewed result as ${task.outputType}.`,
    outputContract:
      "A copy-ready or saved artifact that preserves the result, warnings, checks, impact notes, and next action.",
    selectionReasons: [
      "A specialist packaging stage is included only because the requested artifact benefits from it.",
    ],
  });
}

function reviewStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "quality-review", "task-only", {
    purpose: "Check the completed result independently against the task and approved scope.",
    outputContract:
      "A pass/fail review naming missing deliverables, unsupported claims, privacy problems, required revisions, and the approve, revise, stop, or reroute decision.",
    selectionReasons: [
      "A separate review is included because the requested quality, visibility, sensitivity, or failure cost justifies it.",
    ],
  });
}

function nextActionStage(task: TaskIntake): PlannedWorkStage {
  return stage(task, "next-action", "task-only", {
    purpose: "Turn the approved plan into an immediate, low-overhead starting action.",
    outputContract:
      "A concise immediate action or checklist with its owner, needed input, completion signal, and the condition that triggers a return to the full plan.",
    selectionReasons: [
      "A lighter downstream pass can package the approved reasoning for action without repeating the expensive planning work.",
    ],
  });
}

function scopeSourceNeedFor(
  task: TaskIntake,
  decomposition: TaskDecomposition,
  reasoning: TaskReasoningProfile,
): WorkStageSourceNeed {
  if (reasoning.requiresEvidence) {
    return "research-required";
  }

  const text = `${task.title} ${task.description}`.toLowerCase();
  const wordCount = task.description.split(/\s+/).filter(Boolean).length;
  const substantiveDeliverables = decomposition.deliverables.filter(
    (deliverable) =>
      !["outcome", "scope", "assumptions", "privacy", "review"].includes(deliverable.kind),
  ).length;
  const exploratory =
    /\b(help me|figure out|explore|options?|best way|what should|what would it take|not sure|rough plan|strategy|launch|market|campaign|community|trip|event|policy|industry)\b/.test(
      text,
    );
  const roughRequest = wordCount < 36 || substantiveDeliverables < 3;

  if (
    reasoning.archetype === "working-plan" &&
    (roughRequest || exploratory || reasoning.demand === "heavy")
  ) {
    return "research-helpful";
  }

  return "task-only";
}

function stage(
  task: TaskIntake,
  workRole: WorkRole,
  sourceNeed: WorkStageSourceNeed,
  details: Pick<PlannedWorkStage, "purpose" | "outputContract" | "selectionReasons">,
): PlannedWorkStage {
  return {
    id: `${task.id}-work-${workRole}`,
    workRole,
    sourceNeed,
    ...details,
  };
}
