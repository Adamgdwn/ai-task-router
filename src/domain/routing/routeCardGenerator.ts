import { routeCardSchema } from "../schemas";
import type {
  BlockedRoute,
  ModelInventoryItem,
  PermissionLevel,
  PromptPackage,
  RouteCard,
  RouteOption,
  RouteStep,
  TaskIntake,
} from "../types";
import type { HardGateBlock, HardGateResult } from "./hardGates";
import type { RouteScoringResult, ScoredRouteCandidate } from "./scoring";
import { buildProjectStageGuidance } from "./stageGuidance";
import { attachRouteEconomics } from "./routeEconomics";

export type GenerateRouteCardInput = {
  task: TaskIntake;
  models: ModelInventoryItem[];
  hardGateResult: HardGateResult;
  scoringResult: RouteScoringResult;
  promptPackage: PromptPackage;
  createdAt: string;
  routeCardId?: string;
};

const noSafeRouteWarning =
  "No safe generated route is available; use manual review only until source, model, or policy settings are corrected.";

export function generateRouteCard({
  task,
  models,
  hardGateResult,
  scoringResult,
  promptPackage,
  createdAt,
  routeCardId,
}: GenerateRouteCardInput): RouteCard {
  assertPromptPackageMatchesTask(task, promptPackage);

  const scoredOptions = attachRouteEconomics(scoringResult.scoredCandidates.map(routeOptionFromScoredCandidate), models);
  let recommendedOptionId =
    scoringResult.recommendedCandidateId && scoredOptions.some((option) => option.id === scoringResult.recommendedCandidateId)
      ? scoringResult.recommendedCandidateId
      : null;
  let fallbackOption: RouteOption | null = null;
  let options = scoredOptions;

  if (!recommendedOptionId) {
    fallbackOption = buildManualReviewFallbackRouteOption(task, hardGateResult);
    options = [fallbackOption, ...scoredOptions];
    recommendedOptionId = fallbackOption.id;
  }

  const recommendedOption = options.find((option) => option.id === recommendedOptionId);

  const card: RouteCard = {
    id: routeCardId ?? defaultRouteCardId(task.id),
    taskId: task.id,
    title: `Route card: ${task.title}`,
    sensitivityClass: task.sensitivityClass,
    recommendedOptionId,
    options,
    stageGuidance: recommendedOption
      ? buildProjectStageGuidance({
          task,
          recommendedOption,
          models,
        })
      : [],
    warnings: buildCardWarnings(hardGateResult, fallbackOption),
    blockedRoutes: buildBlockedRoutes(hardGateResult, scoringResult),
    promptPackage,
    createdAt,
  };

  return routeCardSchema.parse(card);
}

function routeOptionFromScoredCandidate(candidate: ScoredRouteCandidate): RouteOption {
  return {
    id: candidate.id,
    strategy: candidate.strategy,
    label: candidate.label,
    summary: candidate.summary,
    score: candidate.score,
    estimatedCostLevel: candidate.estimatedCostLevel,
    estimatedEffortLevel: candidate.estimatedEffortLevel,
    steps: candidate.steps,
    warnings: uniqueMessages([...candidate.warnings, ...candidate.cautions]),
  };
}

export function buildManualReviewFallbackRouteOption(task: TaskIntake, hardGateResult: HardGateResult): RouteOption {
  const optionId = `route-${task.id}-manual-review-fallback`;

  return {
    id: optionId,
    strategy: "lean",
    label: "Manual review required",
    summary:
      "No safe generated route is available. Review blocked routes, source permissions, and model settings before deciding what to do outside the app.",
    score: 0,
    estimatedCostLevel: "low",
    estimatedEffortLevel: "high",
    steps: [buildManualReviewFallbackStep(task, hardGateResult, optionId)],
    warnings: [noSafeRouteWarning],
  };
}

function buildManualReviewFallbackStep(
  task: TaskIntake,
  hardGateResult: HardGateResult,
  optionId: string,
): RouteStep {
  const allowedSourceText =
    hardGateResult.allowedSourceIds.length === 0 ? "No safe source IDs are available." : hardGateResult.allowedSourceIds.join(", ");

  return {
    id: `${optionId}-manual-review`,
    kind: "manual",
    label: "Manual safety review",
    instruction: `Review the task, blocked routes, and allowed source IDs (${allowedSourceText}) manually. Do not use blocked sources or treat this route card as execution approval.`,
    requiredPermissionLevel: highestAllowedSourcePermissionLevel(task, hardGateResult.allowedSourceIds),
    sourceIds: hardGateResult.allowedSourceIds,
    warnings: [noSafeRouteWarning],
  };
}

function buildCardWarnings(hardGateResult: HardGateResult, fallbackOption: RouteOption | null) {
  return uniqueMessages([
    ...hardGateResult.warnings.map((warning) => warning.message),
    ...(fallbackOption ? fallbackOption.warnings : []),
  ]);
}

function buildBlockedRoutes(hardGateResult: HardGateResult, scoringResult: RouteScoringResult) {
  const blocks: BlockedRoute[] = [
    ...hardGateResult.blockedSources.map(blockedRouteFromHardGateBlock),
    ...hardGateResult.blockedModels.map(blockedRouteFromHardGateBlock),
    ...scoringResult.unavailable.map((candidate) => ({
      routeId: candidate.id,
      reason: candidate.reason,
      severity: "blocked" as const,
    })),
  ];

  return uniqueBlockedRoutes(blocks);
}

function blockedRouteFromHardGateBlock(block: HardGateBlock): BlockedRoute {
  return {
    routeId: `blocked-${block.kind}-${block.id}`,
    reason: block.reason,
    severity: "blocked",
  };
}

function highestAllowedSourcePermissionLevel(task: TaskIntake, allowedSourceIds: string[]): PermissionLevel {
  const allowedSourceIdSet = new Set(allowedSourceIds);
  const highestPermissionLevel = task.sourcePermissions
    .filter((source) => allowedSourceIdSet.has(source.id))
    .reduce((highest, source) => Math.max(highest, source.permissionLevel), 0);

  return highestPermissionLevel as PermissionLevel;
}

function assertPromptPackageMatchesTask(task: TaskIntake, promptPackage: PromptPackage) {
  if (promptPackage.taskId !== task.id) {
    throw new Error(`Prompt package '${promptPackage.id}' belongs to task '${promptPackage.taskId}', not '${task.id}'.`);
  }
}

function defaultRouteCardId(taskId: string) {
  return `route-card-${taskId}`;
}

function uniqueMessages(messages: string[]) {
  return [...new Set(messages)];
}

function uniqueBlockedRoutes(blocks: BlockedRoute[]) {
  const seen = new Set<string>();
  const uniqueBlocks: BlockedRoute[] = [];

  for (const block of blocks) {
    const key = `${block.routeId}\n${block.reason}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueBlocks.push(block);
  }

  return uniqueBlocks;
}
