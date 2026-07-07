import type { TaskIntake } from "../types";

export function requestedDeliverableLabels(task: TaskIntake): string[] {
  const text = normalizedTaskText(task);
  const deliverables: string[] = [];

  if (/\bprompt(s|ing)?\b|prompt package/.test(text)) {
    deliverables.push("copy-ready master prompt");
  }

  if (/\b(app|application|tool|tracker|dashboard|prototype|mini app|build)\b/.test(text)) {
    deliverables.push("first usable tool or app build");
  }

  if (/\b(spreadsheet|sheet|excel|csv|download|upload|import)\b/.test(text)) {
    deliverables.push("spreadsheet import or paste-in data flow");
  }

  if (/\bcategor(y|ies|ize|ise|ized|ised|ization|isation|izing|ising)\b/.test(text)) {
    deliverables.push("categorization rules");
  }

  if (/\b(monthly|month over month|month-over-month|track them month|track.*month|over month)\b/.test(text)) {
    deliverables.push("month-over-month tracking");
  }

  if (/\b(improve|improvement|where .*doing well|doing really well|strength|insight|recommendation)\b/.test(text)) {
    deliverables.push("improvement and strength insights");
  }

  if (/\b(best model|model pick|which model|model to execute|execute.*model|tool choice|ai toolkit)\b/.test(text)) {
    deliverables.push("model/tool choice for execution");
  }

  if (/\b(finance|financial|budget|expense|transaction|bank|income|spend|spending)\b/.test(text)) {
    deliverables.push("privacy check for financial data");
  }

  if (/\b(cost|saving|savings|energy|impact)\b/.test(text)) {
    deliverables.push("cost, savings, or energy comparison");
  }

  return uniqueLabels(deliverables);
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

function normalizedTaskText(task: TaskIntake) {
  return `${task.title} ${task.description} ${task.knowledgeWorkType} ${task.outputType}`.toLowerCase();
}

function uniqueLabels(labels: string[]) {
  return [...new Set(labels)];
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
