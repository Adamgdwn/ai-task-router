import type { TaskIntake, WorkRole } from "../types";

export type TaskDeliverableKind =
  | "prompt"
  | "build"
  | "data-flow"
  | "categorization"
  | "tracking"
  | "insight"
  | "model-selection"
  | "privacy"
  | "cost-energy"
  | "research"
  | "writing"
  | "review"
  | "generic";

export type TaskDeliverable = {
  id: string;
  kind: TaskDeliverableKind;
  label: string;
  sourceText: string;
  roles: WorkRole[];
};

export type TaskDecomposition = {
  taskId: string;
  deliverables: TaskDeliverable[];
  complexBuildPlan: boolean;
};

type DeliverableDetector = {
  kind: TaskDeliverableKind;
  label: string;
  patterns: RegExp[];
  roles: WorkRole[];
};

const detectorDefinitions: DeliverableDetector[] = [
  {
    kind: "prompt",
    label: "copy-ready master prompt",
    patterns: [/\bprompt(s|ing)?\b/, /\bprompt package\b/],
    roles: ["prompt-design"],
  },
  {
    kind: "build",
    label: "first usable tool or app build",
    patterns: [/\b(app|application|tool|tracker|dashboard|prototype|mini app|build|code)\b/],
    roles: ["prompt-design", "execution", "build-slice", "quality-review"],
  },
  {
    kind: "data-flow",
    label: "spreadsheet import or paste-in data flow",
    patterns: [/\b(spreadsheets?|sheets?|excel|csv|downloads?|uploads?|imports?|exports?|paste)\b/],
    roles: ["prompt-design", "execution", "build-slice", "quality-review"],
  },
  {
    kind: "categorization",
    label: "categorization rules",
    patterns: [/\bcategor(y|ies|ize|izes|ise|ises|ized|ised|ization|isation|izing|ising)\b/, /\bclassif(y|ication|y into)\b/],
    roles: ["prompt-design", "execution", "build-slice", "quality-review"],
  },
  {
    kind: "tracking",
    label: "month-over-month tracking",
    patterns: [/\b(monthly|months?|month over month|month-over-month|tracks?|tracking|track them month|track.*month|over month|trends?|timeline)\b/],
    roles: ["prompt-design", "execution", "build-slice", "quality-review"],
  },
  {
    kind: "insight",
    label: "improvement and strength insights",
    patterns: [/\b(improves?|improvement|where .*doing well|doing really well|strength|insights?|recommends?|recommendations?|next actions?|opportunit(y|ies))\b/],
    roles: ["prompt-design", "execution", "build-slice", "quality-review"],
  },
  {
    kind: "model-selection",
    label: "model/tool choice for execution",
    patterns: [/\b(best model|model pick|which model|model to execute|execute.*model|tool choice|ai toolkit|stack)\b/],
    roles: ["evidence-check", "prompt-design", "execution", "quality-review"],
  },
  {
    kind: "privacy",
    label: "privacy check for sensitive data",
    patterns: [/\b(finance|financial|budget|expense|transaction|bank|income|spend|spending|private|confidential|regulated|privacy)\b/],
    roles: ["prompt-design", "quality-review"],
  },
  {
    kind: "cost-energy",
    label: "cost, savings, or energy comparison",
    patterns: [/\b(cost|saving|savings|energy|impact|carbon|compute)\b/],
    roles: ["prompt-design", "execution", "quality-review"],
  },
  {
    kind: "research",
    label: "current facts and source notes",
    patterns: [/\b(current facts|citations?|sources?|research|changed recently|latest|newest)\b/],
    roles: ["evidence-check", "prompt-design", "quality-review"],
  },
  {
    kind: "review",
    label: "review and acceptance checks",
    patterns: [/\b(review|check|acceptance|test|quality|validate|verify)\b/],
    roles: ["prompt-design", "quality-review"],
  },
  {
    kind: "writing",
    label: "finished written output",
    patterns: [/\b(draft|write|copy|brief|answer|outline|summary|slides?)\b/],
    roles: ["prompt-design", "execution", "quality-review"],
  },
];

export function requestedDeliverableLabels(task: TaskIntake): string[] {
  return decomposeTask(task).deliverables.map((deliverable) => deliverable.label);
}

export function requestedDeliverableSummary(task: TaskIntake): string {
  const deliverables = requestedDeliverableLabels(task);

  if (deliverables.length === 0) {
    return friendlyOutputName(task.outputType);
  }

  return inlineList(deliverables);
}

export function taskHasBuildIntent(task: TaskIntake): boolean {
  return /\b(app|application|tool|tracker|dashboard|prototype|mini app|build|code)\b/.test(normalizedTaskText(task));
}

export function taskHasModelSelectionIntent(task: TaskIntake): boolean {
  return /\b(best model|model pick|which model|model to execute|execute.*model|tool choice|ai toolkit)\b/.test(
    normalizedTaskText(task),
  );
}

export function taskNeedsEvidenceCheck(task: TaskIntake): boolean {
  return (
    task.requiresCurrentFacts ||
    task.requiresCitations ||
    taskHasModelSelectionIntent(task) ||
    decomposeTask(task).deliverables.some((deliverable) => deliverable.roles.includes("evidence-check"))
  );
}

export function decomposeTask(task: TaskIntake): TaskDecomposition {
  const text = normalizedTaskText(task);
  const matched: TaskDeliverable[] = [];
  const seenKinds = new Set<TaskDeliverableKind>();

  for (const detector of detectorDefinitions) {
    if (!detector.patterns.some((pattern) => pattern.test(text))) {
      continue;
    }

    matched.push(buildDeliverable(task, detector.kind, detector.label, matchingSourceText(task.description, detector.patterns), detector.roles));
    seenKinds.add(detector.kind);
  }

  for (const clause of unmatchedTaskClauses(task.description, matched)) {
    matched.push(buildDeliverable(task, "generic", clauseLabel(clause), clause, rolesForGenericClause(clause)));
  }

  if (matched.length === 0) {
    matched.push(
      buildDeliverable(task, "generic", friendlyOutputName(task.outputType), task.description || task.title, [
        "prompt-design",
        "execution",
        "quality-review",
      ]),
    );
  }

  if (task.requiresCurrentFacts || task.requiresCitations) {
    ensureDeliverable(
      matched,
      seenKinds,
      task,
      "research",
      "current facts and source notes",
      task.description,
      ["evidence-check", "prompt-design", "quality-review"],
    );
  }

  if (task.publicFacing || task.qualityBar === "high" || task.qualityBar === "critical") {
    ensureDeliverable(
      matched,
      seenKinds,
      task,
      "review",
      "review and acceptance checks",
      task.description,
      ["quality-review"],
    );
  }

  return {
    taskId: task.id,
    deliverables: renumberDeliverables(matched),
    complexBuildPlan: isComplexBuildPlan(task, matched),
  };
}

export function deliverablesForWorkRole(task: TaskIntake, workRole: WorkRole): TaskDeliverable[] {
  return decomposeTask(task).deliverables.filter((deliverable) => deliverable.roles.includes(workRole));
}

export function taskNeedsFullBuildPlan(task: TaskIntake): boolean {
  return decomposeTask(task).complexBuildPlan;
}

function normalizedTaskText(task: TaskIntake) {
  return `${task.title} ${task.description} ${task.knowledgeWorkType} ${task.outputType}`.toLowerCase();
}

function buildDeliverable(
  task: TaskIntake,
  kind: TaskDeliverableKind,
  label: string,
  sourceText: string,
  roles: WorkRole[],
): TaskDeliverable {
  return {
    id: `${task.id}-deliverable-${kind}`,
    kind,
    label,
    sourceText: sourceText.trim() || label,
    roles: uniqueRoles(roles),
  };
}

function ensureDeliverable(
  deliverables: TaskDeliverable[],
  seenKinds: Set<TaskDeliverableKind>,
  task: TaskIntake,
  kind: TaskDeliverableKind,
  label: string,
  sourceText: string,
  roles: WorkRole[],
) {
  if (seenKinds.has(kind)) {
    return;
  }

  deliverables.push(buildDeliverable(task, kind, label, sourceText, roles));
  seenKinds.add(kind);
}

function renumberDeliverables(deliverables: TaskDeliverable[]): TaskDeliverable[] {
  const seenLabels = new Set<string>();
  const unique = deliverables.filter((deliverable) => {
    const key = `${deliverable.kind}:${deliverable.label}`;
    if (seenLabels.has(key)) {
      return false;
    }

    seenLabels.add(key);
    return true;
  });

  return unique.map((deliverable, index) => ({
    ...deliverable,
    id: `${deliverable.id}-${index + 1}`,
  }));
}

function matchingSourceText(description: string, patterns: RegExp[]) {
  const clauses = splitTaskClauses(description);
  const clause = clauses.find((candidateClause) =>
    patterns.some((pattern) => new RegExp(pattern.source, pattern.flags).test(candidateClause.toLowerCase())),
  );

  return clause ?? "";
}

function unmatchedTaskClauses(description: string, matched: TaskDeliverable[]) {
  const matchedText = matched.map((deliverable) => deliverable.sourceText.toLowerCase());

  return splitTaskClauses(description).filter((clause) => {
    const normalized = clause.toLowerCase();
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    const useful =
      wordCount >= 5 ||
      (wordCount >= 3 && /\b(build|check|create|draft|explain|identify|map|plan|review|write)\b/.test(normalized));
    const alreadyCovered = matchedText.some((matchedClause) => matchedClause.includes(normalized) || normalized.includes(matchedClause));

    return useful && !alreadyCovered;
  });
}

function splitTaskClauses(description: string) {
  return description
    .replace(/\b(and then|then|also|after that|afterward|next)\b/gi, ". ")
    .split(/[.;\n]+/)
    .map((clause) => clause.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function clauseLabel(clause: string) {
  const cleaned = clause.replace(/\s+/g, " ").trim();
  const short = cleaned.length > 72 ? `${cleaned.slice(0, 69).trim()}...` : cleaned;

  return `address: ${short}`;
}

function rolesForGenericClause(clause: string): WorkRole[] {
  const normalized = clause.toLowerCase();

  if (/\b(build|code|app|tool|dashboard|tracker)\b/.test(normalized)) {
    return ["prompt-design", "execution", "build-slice", "quality-review"];
  }

  if (/\b(research|source|current|citation|latest|newest)\b/.test(normalized)) {
    return ["evidence-check", "prompt-design", "quality-review"];
  }

  return ["prompt-design", "execution", "quality-review"];
}

function isComplexBuildPlan(task: TaskIntake, deliverables: readonly TaskDeliverable[]) {
  const buildLike = taskHasBuildIntent(task) || task.outputType === "code" || task.knowledgeWorkType === "coding";
  const planningLike = task.outputType === "plan" || task.knowledgeWorkType === "planning" || taskHasModelSelectionIntent(task);
  const multiPart = deliverables.filter((deliverable) => deliverable.kind !== "privacy" && deliverable.kind !== "review").length >= 3;

  return buildLike && (planningLike || multiPart);
}

function uniqueLabels(labels: string[]) {
  return [...new Set(labels)];
}

function uniqueRoles(roles: WorkRole[]) {
  return [...new Set(roles)];
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
