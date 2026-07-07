import { promptPackageSchema } from "../schemas";
import type { PromptPackage, PromptStep, RouteOption, RouteStep, SourcePermission, TaskIntake } from "../types";
import type { HardGateResult } from "../routing/hardGates";
import {
  decomposeTask,
  requestedDeliverableSummary,
  taskHasBuildIntent,
  taskHasModelSelectionIntent,
} from "../routing/taskDecomposition";

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
  const decomposition = decomposeTask(task);
  const routeDeliverables = routeStep.deliverableIds.length
    ? decomposition.deliverables.filter((deliverable) => routeStep.deliverableIds.includes(deliverable.id))
    : decomposition.deliverables;
  const deliverableText = routeDeliverables.length
    ? routeDeliverables.map((deliverable) => deliverable.label).join(", ")
    : requestedDeliverableSummary(task);
  const lines = [
    manualUseBoundary,
    stepPosition,
    `Recommended route: ${selectedRoute.label} (${selectedRoute.strategy}); score ${selectedRoute.score}.`,
    routeStep.workRole ? `Work role: ${routeStep.workRole}.` : "",
    routeStep.modeLabel ? `Recommended mode: ${routeStep.modeLabel}.` : "",
    routeStep.selectionReasons.length ? `Why this helper/mode: ${routeStep.selectionReasons.join(" ")}` : "",
    `Deliverables this step must cover: ${deliverableText}.`,
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

  return lines.filter((line): line is string => typeof line === "string" && line.length > 0).join("\n\n");
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

  if (routeStep.workRole) {
    return promptTextForWorkRole({ task, routeStep, sourceRefs, expectedOutput });
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
    "First build a master prompt before creating the final output:",
    "- Restate the goal and the finished deliverable.",
    `- Explicitly carry forward these requested pieces: ${requestedDeliverableSummary(task)}.`,
    "- Name the allowed inputs, constraints, output format, review checks, and stop conditions.",
    "- Include the minimum helper/model needed for execution and the trigger for upgrading to stronger help.",
    "Then use that master prompt to create the first usable result:",
    taskHasBuildIntent(task)
      ? "- For build-shaped work, produce the first usable slice, data flow, acceptance checks, and deferred features."
      : "",
    taskHasModelSelectionIntent(task)
      ? "- Name the specific execution model or mode to start with, plus the upgrade trigger."
      : "",
    "- Identify the main assumptions, missing information, and review risks.",
    "- Say whether a lighter, everyday, or premium helper is enough for this task.",
    "Create a novice-friendly project plan:",
    "- Use a light DMAIC structure when it fits: Define, Measure, Analyze, Improve, Control.",
    "- At minimum, make the steps follow Plan, Do, Check, Act.",
    "- For each step, name the method phase, what I should do, what helper to use, and what good enough looks like.",
    "- Include a short savings recommendation: where this route saves time, cost, or rework, and when I should upgrade.",
    "- End with the first action I should take next.",
    `Expected output: ${expectedOutput}`,
  ].filter((line) => line.length > 0).join("\n");
}

function promptTextForWorkRole(input: {
  task: TaskIntake;
  routeStep: RouteStep;
  sourceRefs: string;
  expectedOutput: string;
}) {
  const { task, routeStep, sourceRefs, expectedOutput } = input;
  const deliverableText = requestedDeliverableSummary(task);
  const reviewLines = [
    "- Check that every requested deliverable is present or explicitly marked missing.",
    "- Check privacy, allowed sources, current-facts needs, acceptance checks, and upgrade trigger.",
  ];

  switch (routeStep.workRole) {
    case "evidence-check":
      return [
        "Evidence-check instruction:",
        `Use only these source IDs: ${sourceRefs}.`,
        "Collect current facts, citation notes, model availability, privacy notes, and any uncertainties before prompt design.",
        "Do not draft the final result yet.",
        `Expected output: ${expectedOutput}`,
      ].join("\n");
    case "prompt-design":
      return [
        "Prompt to paste manually into the prompt-design helper:",
        `Create a master prompt for this ${task.knowledgeWorkType} task.`,
        `Task title: ${task.title}`,
        `Task description: ${task.description}`,
        `Requested output type: ${task.outputType}`,
        `Carry forward every requested piece: ${deliverableText}.`,
        `Use only these source IDs in the later execution pass: ${sourceRefs}.`,
        "The master prompt must require Plan-Do-Check-Act or light DMAIC.",
        "The master prompt must name the specific execution model or mode, privacy limits, acceptance checks, first usable slice, deferred work, savings note, and upgrade trigger.",
        "Return the master prompt only, plus a short note explaining why the chosen execution mode is adequate.",
        `Expected output: ${expectedOutput}`,
      ].join("\n");
    case "execution":
      return [
        "Execution instruction:",
        "Paste the approved master prompt into this lighter execution helper.",
        "Produce the requested output, not another layer of prompt advice.",
        `The result must cover: ${deliverableText}.`,
        ...reviewLines,
        `Expected output: ${expectedOutput}`,
      ].join("\n");
    case "build-slice":
      return [
        "Build-slice execution instruction:",
        "Paste the approved master prompt into this build helper or mode.",
        "Produce the first usable build slice before adding polish or extra features.",
        "Include data flow, screens or files, tests, acceptance checks, deferred features, and the smallest next implementation action.",
        `The result must cover: ${deliverableText}.`,
        ...reviewLines,
        `Expected output: ${expectedOutput}`,
      ].join("\n");
    case "artifact-package":
      return [
        "Packaging instruction:",
        "Package the reviewed result into the requested saved or copy-ready format.",
        "Keep inputs, warnings, checks, savings, and next action visible.",
        `Expected output: ${expectedOutput}`,
      ].join("\n");
    case "quality-review":
      return [
        "Quality review instruction:",
        ...reviewLines,
        "Decide whether to approve, revise, stop, or reroute before relying on the result.",
        `Expected output: ${expectedOutput}`,
      ].join("\n");
    case "next-action":
      return [
        "Next-action instruction:",
        "Choose the smallest useful action, the measure to check next, and whether this route should be reused or upgraded.",
        `Expected output: ${expectedOutput}`,
      ].join("\n");
  }
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
    ? "Source-use reminder: no source IDs are approved for this step; rely only on the task description and user-provided context already in the destination tool. Use only these source IDs for this step: none."
    : `Source-use reminder: Use only these allowed source IDs for this step: ${sourceRefs}.`;
}

function expectedOutputForStep(task: TaskIntake, routeStep: RouteStep) {
  if (routeStep.workRole) {
    switch (routeStep.workRole) {
      case "evidence-check":
        return `Evidence notes for "${task.title}" with current facts, source notes, model/privacy assumptions, and uncertainty.`;
      case "prompt-design":
        return `A master prompt for "${task.title}" that covers ${requestedDeliverableSummary(task)}, names the execution mode, and includes checks and upgrade triggers.`;
      case "execution":
        return `The first usable ${task.outputType} for "${task.title}" produced from the approved master prompt.`;
      case "build-slice":
        return `A first usable build-plan slice for "${task.title}" with data flow, screens or files, tests, acceptance checks, deferred work, and next action.`;
      case "artifact-package":
        return `A packaged ${task.outputType} for "${task.title}" with route warnings, checks, savings, and next action visible.`;
      case "quality-review":
        return `A review decision for "${task.title}" with required fixes, missing deliverables, privacy issues, and reroute or upgrade notes.`;
      case "next-action":
        return `The smallest next action for "${task.title}" plus the measure and route lesson to save.`;
    }
  }

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
      return `A master prompt plus a ${task.outputType} for "${task.title}" that covers ${requestedDeliverableSummary(task)}, gives a novice-friendly plan, respects source limits, and recommends where to save or upgrade.`;
  }
}

function promptStepTitle(routeStep: RouteStep, routeStepIndex: number) {
  if (routeStep.workRole) {
    const actionByRole: Record<NonNullable<RouteStep["workRole"]>, string> = {
      "evidence-check": "Check Evidence",
      "prompt-design": "Build Master Prompt",
      execution: "Run Finished Prompt",
      "build-slice": "Execute Build Slice",
      "artifact-package": "Package Output",
      "quality-review": "Review Quality",
      "next-action": "Choose Next Action",
    };

    return `Step ${routeStepIndex + 1}: ${actionByRole[routeStep.workRole]}`;
  }

  const actionByKind: Record<RouteStep["kind"], string> = {
    research: "Check Research",
    model: "Build Master Prompt Then Execute",
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
    reminders.push("Citation reminder: Include citations for external claims and review citation quality before outside use.");
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
