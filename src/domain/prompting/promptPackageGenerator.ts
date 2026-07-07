import { promptPackageSchema } from "../schemas";
import type { PromptPackage, PromptStep, RouteOption, RouteStep, SourcePermission, TaskIntake } from "../types";
import type { HardGateResult } from "../routing/hardGates";

export type GeneratePromptPackageInput = {
  task: TaskIntake;
  selectedRoute: RouteOption;
  hardGateResult: HardGateResult;
  promptPackageId?: string;
};

type PromptPackageContext = {
  sourceById: Map<string, SourcePermission>;
  allowedSourceIds: Set<string>;
  allowedModelIds: Set<string>;
  routeWarnings: string[];
  safeRouteSourceIds: string[];
};

const manualUseBoundary =
  "Use this prompt package as manual guidance only. The app does not send prompts, call tools, connect accounts, approve output, or record outside-tool results.";

const sourceBoundary =
  "Use only the source IDs listed for this step. Do not use blocked, no-access, undeclared, or sensitivity-disallowed sources.";

export function generatePromptPackage({
  task,
  selectedRoute,
  hardGateResult,
  promptPackageId,
}: GeneratePromptPackageInput): PromptPackage {
  const context = buildPromptPackageContext(task, selectedRoute, hardGateResult);
  const routePromptSteps = selectedRoute.steps.map((routeStep, index) =>
    buildPromptStep({
      task,
      selectedRoute,
      routeStep,
      routeStepIndex: index,
      routeStepCount: selectedRoute.steps.length,
      context,
    }),
  );
  const steps =
    hardGateResult.requiresHumanApproval && !routeHasHumanApprovalStep(selectedRoute)
      ? [...routePromptSteps, buildAddedHumanApprovalStep(task, selectedRoute, context)]
      : routePromptSteps;

  const promptPackage: PromptPackage = {
    id: promptPackageId ?? defaultPromptPackageId(task.id, selectedRoute.strategy),
    taskId: task.id,
    title: `Prompt package: ${task.title}`,
    steps,
  };

  return promptPackageSchema.parse(promptPackage);
}

function buildPromptPackageContext(
  task: TaskIntake,
  selectedRoute: RouteOption,
  hardGateResult: HardGateResult,
): PromptPackageContext {
  const sourceById = new Map(task.sourcePermissions.map((source) => [source.id, source]));
  const allowedSourceIds = new Set(hardGateResult.allowedSourceIds);
  const safeRouteSourceIds = safeSourceIdsForRoute(selectedRoute, sourceById, allowedSourceIds);

  return {
    sourceById,
    allowedSourceIds,
    allowedModelIds: new Set(hardGateResult.allowedModelIds),
    routeWarnings: uniqueMessages([
      ...hardGateResult.warnings.map((warning) => warning.message),
      ...selectedRoute.warnings,
    ]),
    safeRouteSourceIds,
  };
}

function buildPromptStep(input: {
  task: TaskIntake;
  selectedRoute: RouteOption;
  routeStep: RouteStep;
  routeStepIndex: number;
  routeStepCount: number;
  context: PromptPackageContext;
}): PromptStep {
  const { task, selectedRoute, routeStep, routeStepIndex, routeStepCount, context } = input;
  const safeSourceIds =
    routeStep.kind === "human review"
      ? context.safeRouteSourceIds
      : safeSourceIdsForStep(routeStep, context.sourceById, context.allowedSourceIds);
  const expectedOutput = expectedOutputForStep(task, routeStep);
  const inputRefs = buildInputRefs({
    task,
    selectedRoute,
    routeStep,
    safeSourceIds,
    allowedModelIds: context.allowedModelIds,
  });

  return {
    id: `prompt-step-${selectedRoute.id}-${routeStep.id}`,
    title: promptStepTitle(routeStep, routeStepIndex),
    instruction: buildPromptInstruction({
      task,
      selectedRoute,
      routeStep,
      routeStepIndex,
      routeStepCount,
      safeSourceIds,
      expectedOutput,
      context,
    }),
    inputRefs,
    expectedOutput,
    requiresHumanApproval: routeStep.kind === "human review",
  };
}

function buildPromptInstruction(input: {
  task: TaskIntake;
  selectedRoute: RouteOption;
  routeStep: RouteStep;
  routeStepIndex: number;
  routeStepCount: number;
  safeSourceIds: string[];
  expectedOutput: string;
  context: PromptPackageContext;
}) {
  const { task, selectedRoute, routeStep, routeStepIndex, routeStepCount, safeSourceIds, expectedOutput, context } = input;
  const sourceRefs = formatSourceRefs(safeSourceIds, context.sourceById);
  const stepPosition = `Route step ${routeStepIndex + 1} of ${routeStepCount}: ${routeStep.label}.`;
  const lines = [
    manualUseBoundary,
    stepPosition,
    `Recommended route: ${selectedRoute.label} (${selectedRoute.strategy}); score ${selectedRoute.score}.`,
    `Task: ${task.title}.`,
    `Task description: ${task.description}`,
    `Work type: ${task.knowledgeWorkType}. Output type: ${task.outputType}. Quality bar: ${task.qualityBar}. Sensitivity: ${task.sensitivityClass}.`,
    toolUseReminder(routeStep, context.allowedModelIds),
    sourceUseReminder(routeStep, safeSourceIds, sourceRefs),
    sourceBoundary,
    ...factAndCitationReminders(task),
    warningReminder(context.routeWarnings),
    promptTextForStep({ task, routeStep, sourceRefs, expectedOutput }),
  ];

  return lines.filter((line) => line.length > 0).join("\n\n");
}

function promptTextForStep(input: {
  task: TaskIntake;
  routeStep: RouteStep;
  sourceRefs: string;
  expectedOutput: string;
}) {
  const { task, routeStep, sourceRefs, expectedOutput } = input;

  if (routeStep.kind === "human review") {
    return [
      "Human review checklist:",
      `- Confirm the output answers "${task.title}" and matches the requested ${task.outputType}.`,
      `- Confirm source use stayed within: ${sourceRefs}.`,
      "- Confirm route warnings and sensitivity reminders were addressed before any outside use.",
      "- Decide whether to approve, revise, stop, or reroute outside the app.",
    ].join("\n");
  }

  return [
    "Prompt to paste manually into the chosen tool:",
    `Please help with this ${task.knowledgeWorkType} task.`,
    `Task title: ${task.title}`,
    `Task description: ${task.description}`,
    `Requested output type: ${task.outputType}`,
    `Quality bar: ${task.qualityBar}`,
    `Sensitivity class: ${task.sensitivityClass}`,
    `Use only these source IDs for this step: ${sourceRefs}.`,
    ...factAndCitationPromptLines(task),
    "First evaluate the task in plain language:",
    "- Restate the goal and the finished deliverable.",
    "- Identify the main assumptions, missing information, and review risks.",
    "- Say whether a lighter, everyday, or premium helper is enough for this task.",
    "Then create a novice-friendly project plan:",
    "- Give 3 to 6 ordered steps.",
    "- For each step, name what I should do, what helper to use, and what good enough looks like.",
    "- Include a short savings recommendation: where this route saves time, cost, or rework, and when I should upgrade.",
    "- End with the first action I should take next.",
    `Expected output: ${expectedOutput}`,
  ].join("\n");
}

function buildAddedHumanApprovalStep(
  task: TaskIntake,
  selectedRoute: RouteOption,
  context: PromptPackageContext,
): PromptStep {
  const expectedOutput =
    "A human decision to approve, revise, stop, or reroute before any public, regulated, highly restricted, critical, or high-quality use outside the app.";
  const sourceRefs = formatSourceRefs(context.safeRouteSourceIds, context.sourceById);

  return {
    id: `prompt-step-${selectedRoute.id}-added-human-approval`,
    title: "Approve Before Use",
    instruction: [
      manualUseBoundary,
      "Hard gates require human approval for this task, but the selected route did not include a human review route step.",
      `Task: ${task.title}.`,
      `Review that source use stayed within: ${sourceRefs}.`,
      warningReminder(context.routeWarnings),
      "Human review checklist:",
      "- Review the generated or manually prepared output outside the app.",
      "- Confirm the sensitivity class, source-use limits, current-facts needs, citation needs, and route warnings.",
      "- Decide whether to approve, revise, stop, or reroute before any outside use.",
    ].join("\n\n"),
    inputRefs: uniqueIds([task.id, selectedRoute.id, ...context.safeRouteSourceIds]),
    expectedOutput,
    requiresHumanApproval: true,
  };
}

function toolUseReminder(routeStep: RouteStep, allowedModelIds: Set<string>) {
  if (routeStep.kind === "human review") {
    return "Tool/model use: use a human reviewer. Do not treat this app as approval authority.";
  }

  if (routeStep.modelId && allowedModelIds.has(routeStep.modelId)) {
    return `Tool/model use: manually use the user-configured route step model ID '${routeStep.modelId}' outside the app.`;
  }

  if (routeStep.modelId) {
    return "Tool/model use: the route step model ID is not allowed by the current hard gates, so do not use it until the route is corrected.";
  }

  return "Tool/model use: complete this as a manual route step outside the app.";
}

function sourceUseReminder(routeStep: RouteStep, safeSourceIds: string[], sourceRefs: string) {
  if (routeStep.kind === "human review") {
    return safeSourceIds.length === 0
      ? "Source-use reminder: review that no source IDs were used by this route before outside use."
      : `Source-use reminder: review that earlier route work used only these allowed source IDs: ${sourceRefs}.`;
  }

  return safeSourceIds.length === 0
    ? "Source-use reminder: no source IDs are approved for this step; rely only on the task description and user-provided context already in the destination tool."
    : `Source-use reminder: Use only these allowed source IDs for this step: ${sourceRefs}.`;
}

function expectedOutputForStep(task: TaskIntake, routeStep: RouteStep) {
  switch (routeStep.kind) {
    case "research":
      return task.requiresCitations
        ? `A concise research note for "${task.title}" with current facts, source citations, and unresolved uncertainty.`
        : `A concise research note for "${task.title}" with current facts and unresolved uncertainty.`;
    case "artifact":
      return `A packaged ${task.outputType} for "${task.title}" with a clear plan, review checks, and savings or upgrade notes.`;
    case "human review":
      return `A human approval decision for "${task.title}" with any required revisions or stop/reroute notes.`;
    case "manual":
      return `A manually prepared ${task.outputType} for "${task.title}" with task evaluation, ordered steps, review checks, and a savings recommendation.`;
    case "model":
      return `A ${task.outputType} for "${task.title}" that evaluates the task, gives a novice-friendly plan, respects source limits, and recommends where to save or upgrade.`;
  }
}

function promptStepTitle(routeStep: RouteStep, routeStepIndex: number) {
  const actionByKind: Record<RouteStep["kind"], string> = {
    research: "Check Research",
    model: "Draft Output",
    artifact: "Package Output",
    "human review": "Approve Before Use",
    manual: "Prepare Manually",
  };

  return `Step ${routeStepIndex + 1}: ${actionByKind[routeStep.kind]}`;
}

function factAndCitationReminders(task: TaskIntake) {
  const reminders: string[] = [];

  if (task.requiresCurrentFacts) {
    reminders.push(
      "Current-facts reminder: verify current facts manually in the chosen tool or by user review; this app does not search, fetch, or update facts.",
    );
  }

  if (task.requiresCitations) {
    reminders.push("Citation reminder: ask for citations for external claims and review citation quality before outside use.");
  }

  return reminders;
}

function factAndCitationPromptLines(task: TaskIntake) {
  const promptLines: string[] = [];

  if (task.requiresCurrentFacts) {
    promptLines.push("Verify any current facts before relying on them.");
  }

  if (task.requiresCitations) {
    promptLines.push("Include citations for external claims and clearly mark anything that cannot be cited.");
  }

  return promptLines;
}

function warningReminder(routeWarnings: string[]) {
  return routeWarnings.length === 0
    ? "Route warnings: none."
    : `Route warnings to keep visible: ${routeWarnings.join(" | ")}`;
}

function buildInputRefs(input: {
  task: TaskIntake;
  selectedRoute: RouteOption;
  routeStep: RouteStep;
  safeSourceIds: string[];
  allowedModelIds: Set<string>;
}) {
  const { task, selectedRoute, routeStep, safeSourceIds, allowedModelIds } = input;
  const modelRefs = routeStep.modelId && allowedModelIds.has(routeStep.modelId) ? [routeStep.modelId] : [];

  return uniqueIds([task.id, selectedRoute.id, routeStep.id, ...modelRefs, ...safeSourceIds]);
}

function safeSourceIdsForRoute(
  selectedRoute: RouteOption,
  sourceById: Map<string, SourcePermission>,
  allowedSourceIds: Set<string>,
) {
  return uniqueIds(
    selectedRoute.steps.flatMap((routeStep) => safeSourceIdsForStep(routeStep, sourceById, allowedSourceIds)),
  );
}

function safeSourceIdsForStep(
  routeStep: RouteStep,
  sourceById: Map<string, SourcePermission>,
  allowedSourceIds: Set<string>,
) {
  return uniqueIds(routeStep.sourceIds.filter((sourceId) => sourceById.has(sourceId) && allowedSourceIds.has(sourceId)));
}

function formatSourceRefs(sourceIds: string[], sourceById: Map<string, SourcePermission>) {
  if (sourceIds.length === 0) {
    return "none";
  }

  return sourceIds
    .map((sourceId) => {
      const source = sourceById.get(sourceId);
      return source ? `${sourceId} (${source.label})` : sourceId;
    })
    .join(", ");
}

function routeHasHumanApprovalStep(selectedRoute: RouteOption) {
  return selectedRoute.steps.some((routeStep) => routeStep.kind === "human review");
}

function defaultPromptPackageId(taskId: string, strategy: RouteOption["strategy"]) {
  return `prompt-package-${taskId}-${strategy}`;
}

function uniqueMessages(messages: string[]) {
  return [...new Set(messages.filter((message) => message.trim().length > 0))];
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids.filter((id) => id.trim().length > 0))];
}
