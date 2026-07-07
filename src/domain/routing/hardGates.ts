import type { ModelInventoryItem, SourcePermission, TaskIntake } from "../types";
import { taskNeedsEvidenceCheck } from "./taskDecomposition";

export type HardGateBlockKind = "model" | "source";
export type HardGateBlockReason =
  | "model-disabled"
  | "model-permission-too-low"
  | "highly-restricted-non-local"
  | "source-no-access"
  | "source-sensitivity-blocked";
export type HardGateWarningReason = "research-context-missing" | "human-approval-required";

export type HardGateBlock = {
  kind: HardGateBlockKind;
  id: string;
  label: string;
  reasonCode: HardGateBlockReason;
  reason: string;
};

export type HardGateWarning = {
  reasonCode: HardGateWarningReason;
  message: string;
};

export type HardGateResult = {
  allowedModelIds: string[];
  blockedModels: HardGateBlock[];
  allowedSourceIds: string[];
  blockedSources: HardGateBlock[];
  warnings: HardGateWarning[];
  requiresHumanApproval: boolean;
};

export type EvaluateHardGatesInput = {
  task: TaskIntake;
  models: ModelInventoryItem[];
};

const humanApprovalMessage =
  "Human approval is required before using public-facing, regulated, highly restricted, high-quality, or critical output.";

export function evaluateHardGates({ task, models }: EvaluateHardGatesInput): HardGateResult {
  const requestedSourceIds = sourceIdsRequestedOrImpliedByTask(task);
  const sourceEvaluation = evaluateSources(task, requestedSourceIds);
  const sourcePermissionCeiling = highestPermissionLevel(sourceEvaluation.allowedSources);
  const modelEvaluation = evaluateModels(task, models, sourcePermissionCeiling);
  const warnings = evaluateWarnings(task, sourceEvaluation.allowedSources, modelEvaluation.allowedModels);
  const requiresHumanApproval = needsHumanApproval(task);

  if (requiresHumanApproval) {
    warnings.push({
      reasonCode: "human-approval-required",
      message: humanApprovalMessage,
    });
  }

  return {
    allowedModelIds: modelEvaluation.allowedModels.map((model) => model.id),
    blockedModels: modelEvaluation.blockedModels,
    allowedSourceIds: sourceEvaluation.allowedSources.map((source) => source.id),
    blockedSources: sourceEvaluation.blockedSources,
    warnings,
    requiresHumanApproval,
  };
}

function sourceIdsRequestedOrImpliedByTask(task: TaskIntake) {
  const requestedSourceIds = new Set(task.requestedSourceIds);

  if (taskNeedsEvidenceCheck(task)) {
    for (const source of task.sourcePermissions) {
      if (source.sourceType === "web") {
        requestedSourceIds.add(source.id);
      }
    }
  }

  return requestedSourceIds;
}

function evaluateSources(task: TaskIntake, requestedSourceIds: Set<string>) {
  const allowedSources: SourcePermission[] = [];
  const blockedSources: HardGateBlock[] = [];

  for (const source of task.sourcePermissions) {
    if (!requestedSourceIds.has(source.id)) {
      continue;
    }

    if (source.permissionLevel === 0) {
      blockedSources.push({
        kind: "source",
        id: source.id,
        label: source.label,
        reasonCode: "source-no-access",
        reason: `${source.label} is set to no access and cannot be used in a route.`,
      });
      continue;
    }

    if (!source.sensitivityAllowed.includes(task.sensitivityClass)) {
      blockedSources.push({
        kind: "source",
        id: source.id,
        label: source.label,
        reasonCode: "source-sensitivity-blocked",
        reason: `${source.label} does not allow ${task.sensitivityClass} tasks.`,
      });
      continue;
    }

    allowedSources.push(source);
  }

  return { allowedSources, blockedSources };
}

function evaluateModels(task: TaskIntake, models: ModelInventoryItem[], requiredPermissionLevel: number) {
  const allowedModels: ModelInventoryItem[] = [];
  const blockedModels: HardGateBlock[] = [];

  for (const model of models) {
    if (!model.enabled) {
      blockedModels.push({
        kind: "model",
        id: model.id,
        label: model.label,
        reasonCode: "model-disabled",
        reason: `${model.label} is disabled in the user's inventory.`,
      });
      continue;
    }

    if (task.sensitivityClass === "highly restricted" && model.tier !== "human" && !model.localOnly) {
      blockedModels.push({
        kind: "model",
        id: model.id,
        label: model.label,
        reasonCode: "highly-restricted-non-local",
        reason: `${model.label} is not local-only, so it cannot handle highly restricted tasks.`,
      });
      continue;
    }

    if (model.maxPermissionLevel < requiredPermissionLevel) {
      blockedModels.push({
        kind: "model",
        id: model.id,
        label: model.label,
        reasonCode: "model-permission-too-low",
        reason: `${model.label} only supports permission level ${model.maxPermissionLevel}, but this task needs level ${requiredPermissionLevel}.`,
      });
      continue;
    }

    allowedModels.push(model);
  }

  return { allowedModels, blockedModels };
}

function evaluateWarnings(task: TaskIntake, allowedSources: SourcePermission[], allowedModels: ModelInventoryItem[]) {
  const warnings: HardGateWarning[] = [];

  if (taskNeedsEvidenceCheck(task)) {
    const hasAllowedResearchSource = allowedSources.some((source) => source.sourceType === "web");
    const hasAllowedResearchModel = allowedModels.some(
      (model) => model.tier === "research" || model.capabilityScores.research >= 4,
    );

    if (!hasAllowedResearchSource || !hasAllowedResearchModel) {
      warnings.push({
        reasonCode: "research-context-missing",
        message:
          "Current facts or citations need an allowed research source and a research-capable model or tool; the app will not perform research itself.",
      });
    }
  }

  return warnings;
}

function needsHumanApproval(task: TaskIntake) {
  return (
    task.publicFacing ||
    task.sensitivityClass === "public-facing risk" ||
    task.sensitivityClass === "regulated" ||
    task.sensitivityClass === "highly restricted" ||
    task.qualityBar === "high" ||
    task.qualityBar === "critical"
  );
}

function highestPermissionLevel(sources: SourcePermission[]) {
  return sources.reduce((highest, source) => Math.max(highest, source.permissionLevel), 0);
}
