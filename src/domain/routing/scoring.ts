import type { CapabilityScores, ModelInventoryItem, PolicyDefault, ScoringWeights, TaskIntake } from "../types";
import type {
  RouteCandidate,
  RouteCandidateCostLevel,
  RouteCandidateEffortLevel,
  RouteCandidateGenerationResult,
  RouteCandidateStrategy,
  UnavailableRouteCandidate,
} from "./candidateGeneration";

const weightedComponentKeys = ["cost", "energy", "quality", "speed", "sourceFit", "sensitivityFit"] as const;

export type WeightedScoreComponentKey = (typeof weightedComponentKeys)[number];
export type RouteScoreComponentKey = WeightedScoreComponentKey | "warningPenalty";

export type RouteScoreComponent = {
  key: RouteScoreComponentKey;
  label: string;
  rawScore: number;
  policyWeight: number;
  normalizedWeight: number;
  contribution: number;
  explanation: string;
};

export type ScoredRouteCandidate = RouteCandidate & {
  score: number;
  policyId: PolicyDefault["id"];
  weightedScoreBeforePenalty: number;
  warningPenalty: number;
  scoreComponents: RouteScoreComponent[];
  strengths: string[];
  cautions: string[];
};

export type RouteScoringResult = {
  selectedPolicyId: PolicyDefault["id"];
  selectedPolicyLabel: string;
  scoredCandidates: ScoredRouteCandidate[];
  unavailable: UnavailableRouteCandidate[];
  recommendedCandidateId: string | null;
  recommendedCandidate: ScoredRouteCandidate | null;
  tieBreakersApplied: string[];
};

export type ScoreRouteCandidatesInput = {
  task: TaskIntake;
  candidateResult: RouteCandidateGenerationResult;
  models: ModelInventoryItem[];
  policy: PolicyDefault;
};

type ComponentScore = {
  rawScore: number;
  explanation: string;
};

type CapabilityKey = keyof CapabilityScores;

const ambiguousScoreThreshold = 2;

const costPreferenceScores: Record<TaskIntake["costPreference"], Record<RouteCandidateCostLevel, number>> = {
  minimize: { low: 100, medium: 60, high: 25 },
  balanced: { low: 90, medium: 85, high: 65 },
  "quality first": { low: 78, medium: 88, high: 96 },
};

const energyPreferenceScores: Record<TaskIntake["energyPreference"], Record<RouteCandidateEffortLevel, number>> = {
  minimize: { low: 100, medium: 65, high: 30 },
  balanced: { low: 88, medium: 85, high: 65 },
  "quality first": { low: 75, medium: 88, high: 95 },
};

const effortSpeedScores: Record<RouteCandidateEffortLevel, number> = {
  low: 92,
  medium: 76,
  high: 60,
};

const qualityBarTargets: Record<TaskIntake["qualityBar"], number> = {
  quick: 45,
  standard: 65,
  high: 80,
  critical: 90,
};

const strategyResourceRank: Record<RouteCandidateStrategy, number> = {
  lean: 0,
  balanced: 1,
  premium: 2,
};

const levelResourceRank: Record<RouteCandidateCostLevel | RouteCandidateEffortLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function scoreRouteCandidates({
  task,
  candidateResult,
  models,
  policy,
}: ScoreRouteCandidatesInput): RouteScoringResult {
  const modelById = new Map(models.map((model) => [model.id, model]));
  const normalizedWeights = normalizeScoringWeights(policy.scoringWeights);
  const scoredCandidates = candidateResult.candidates.map((candidate) =>
    scoreCandidate({
      task,
      candidate,
      modelById,
      policy,
      normalizedWeights,
    }),
  );
  const selection = selectRecommendedCandidate(scoredCandidates);

  return {
    selectedPolicyId: policy.id,
    selectedPolicyLabel: policy.label,
    scoredCandidates,
    unavailable: candidateResult.unavailable,
    recommendedCandidateId: selection.recommendedCandidate?.id ?? null,
    recommendedCandidate: selection.recommendedCandidate,
    tieBreakersApplied: selection.tieBreakersApplied,
  };
}

function scoreCandidate(input: {
  task: TaskIntake;
  candidate: RouteCandidate;
  modelById: Map<string, ModelInventoryItem>;
  policy: PolicyDefault;
  normalizedWeights: ScoringWeights;
}): ScoredRouteCandidate {
  const { task, candidate, modelById, policy, normalizedWeights } = input;
  const weightedComponents = buildWeightedComponents({ task, candidate, modelById, policy, normalizedWeights });
  const weightedScoreBeforePenalty = clampScore(
    weightedComponents.reduce((total, component) => total + component.contribution, 0),
  );
  const warningPenalty = warningPenaltyFor(candidate);
  const warningPenaltyComponent = buildWarningPenaltyComponent(warningPenalty, candidate.warnings.length);
  const score = clampScore(weightedScoreBeforePenalty - warningPenalty);
  const scoreComponents = [...weightedComponents, warningPenaltyComponent];

  return {
    ...candidate,
    score: roundScore(score),
    policyId: policy.id,
    weightedScoreBeforePenalty: roundScore(weightedScoreBeforePenalty),
    warningPenalty,
    scoreComponents,
    strengths: buildStrengths(scoreComponents),
    cautions: buildCautions(candidate, scoreComponents, warningPenalty),
  };
}

function buildWeightedComponents(input: {
  task: TaskIntake;
  candidate: RouteCandidate;
  modelById: Map<string, ModelInventoryItem>;
  policy: PolicyDefault;
  normalizedWeights: ScoringWeights;
}): RouteScoreComponent[] {
  const { task, candidate, modelById, policy, normalizedWeights } = input;
  const componentScores: Record<WeightedScoreComponentKey, ComponentScore> = {
    cost: scoreCostFit(candidate, task),
    energy: scoreEnergyFit(candidate, task),
    quality: scoreQualityFit(candidate, task, modelById),
    speed: scoreSpeedFit(candidate),
    sourceFit: scoreSourceFit(candidate, task),
    sensitivityFit: scoreSensitivityFit(candidate, task, modelById),
  };

  return weightedComponentKeys.map((key) => {
    const rawScore = clampScore(componentScores[key].rawScore);
    const normalizedWeight = normalizedWeights[key];

    return {
      key,
      label: scoreComponentLabels[key],
      rawScore: roundScore(rawScore),
      policyWeight: policy.scoringWeights[key],
      normalizedWeight: roundWeight(normalizedWeight),
      contribution: roundScore(rawScore * normalizedWeight),
      explanation: componentScores[key].explanation,
    };
  });
}

const scoreComponentLabels: Record<WeightedScoreComponentKey, string> = {
  cost: "Cost fit",
  energy: "Energy fit",
  quality: "Quality fit",
  speed: "Speed fit",
  sourceFit: "Source fit",
  sensitivityFit: "Sensitivity fit",
};

function scoreCostFit(candidate: RouteCandidate, task: TaskIntake): ComponentScore {
  const rawScore = costPreferenceScores[task.costPreference][candidate.estimatedCostLevel];

  return {
    rawScore,
    explanation: `The ${candidate.estimatedCostLevel} qualitative cost level is compared with the ${task.costPreference} cost preference.`,
  };
}

function scoreEnergyFit(candidate: RouteCandidate, task: TaskIntake): ComponentScore {
  const rawScore = energyPreferenceScores[task.energyPreference][candidate.estimatedEffortLevel];

  return {
    rawScore,
    explanation: `The ${candidate.estimatedEffortLevel} qualitative effort level is compared with the ${task.energyPreference} energy preference.`,
  };
}

function scoreQualityFit(
  candidate: RouteCandidate,
  task: TaskIntake,
  modelById: Map<string, ModelInventoryItem>,
): ComponentScore {
  const capabilityKeys = capabilityKeysFor(task.knowledgeWorkType);
  const models = modelsUsedForQuality(candidate, modelById);
  const modelCapabilityScores = models.map((model) => averageCapabilityScore(model.capabilityScores, capabilityKeys));
  const bestCapabilityScore = modelCapabilityScores.length > 0 ? Math.max(...modelCapabilityScores) : 1.75;
  const supportingStepBonus = Math.min(10, Math.max(0, modelCapabilityScores.length - 1) * 5);
  const capabilityPercent = clampScore(bestCapabilityScore * 20 + supportingStepBonus);
  const target = qualityBarTargets[task.qualityBar];
  const shortfall = Math.max(0, target - capabilityPercent);
  const meetsTargetBonus = shortfall === 0 ? 25 : 10;
  const rawScore = clampScore(capabilityPercent * 0.75 + meetsTargetBonus - shortfall * 0.5);

  return {
    rawScore,
    explanation: `The best route capability for ${task.knowledgeWorkType} work is compared with the ${task.qualityBar} quality bar.`,
  };
}

function scoreSpeedFit(candidate: RouteCandidate): ComponentScore {
  const extraStepPenalty = Math.max(0, candidate.steps.length - 1) * 4;
  const rawScore = effortSpeedScores[candidate.estimatedEffortLevel] - extraStepPenalty;

  return {
    rawScore,
    explanation: `The ${candidate.estimatedEffortLevel} effort estimate and ${candidate.steps.length} planned step(s) shape the speed fit.`,
  };
}

function scoreSourceFit(candidate: RouteCandidate, task: TaskIntake): ComponentScore {
  const requestedSourceIds = unique(task.requestedSourceIds);

  if (requestedSourceIds.length === 0) {
    return {
      rawScore: 100,
      explanation: "No specific sources were requested, so source fit is not reduced.",
    };
  }

  const routeSourceIds = new Set(candidate.steps.flatMap((step) => step.sourceIds));
  const coveredSourceCount = requestedSourceIds.filter((sourceId) => routeSourceIds.has(sourceId)).length;
  const rawScore = (coveredSourceCount / requestedSourceIds.length) * 100;

  return {
    rawScore,
    explanation: `${coveredSourceCount} of ${requestedSourceIds.length} requested source(s) appear in the safe route steps.`,
  };
}

function scoreSensitivityFit(
  candidate: RouteCandidate,
  task: TaskIntake,
  modelById: Map<string, ModelInventoryItem>,
): ComponentScore {
  const usedModels = modelsUsedByCandidate(candidate, modelById);
  const usesOnlyLocalOrHuman = usedModels.every((model) => model.localOnly || model.tier === "human");
  const hasHumanApprovalStep = candidate.steps.some((step) => step.kind === "human review");
  const usesUnknownModel = candidate.steps.some((step) => step.modelId !== undefined && !modelById.has(step.modelId));
  let rawScore = baseSensitivityScore(task, usesOnlyLocalOrHuman, hasHumanApprovalStep);

  if (requiresHumanApprovalForTask(task) && !hasHumanApprovalStep) {
    rawScore -= 25;
  }

  if (usesUnknownModel) {
    rawScore -= 15;
  }

  return {
    rawScore,
    explanation: `The route is checked against ${task.sensitivityClass} sensitivity and any human approval requirement.`,
  };
}

function baseSensitivityScore(
  task: TaskIntake,
  usesOnlyLocalOrHuman: boolean,
  hasHumanApprovalStep: boolean,
) {
  if (task.sensitivityClass === "highly restricted") {
    if (!usesOnlyLocalOrHuman) {
      return 25;
    }

    return hasHumanApprovalStep ? 100 : 86;
  }

  if (task.sensitivityClass === "regulated" || task.sensitivityClass === "public-facing risk") {
    return hasHumanApprovalStep ? 95 : 70;
  }

  if (task.sensitivityClass === "confidential") {
    return 90;
  }

  if (task.sensitivityClass === "internal") {
    return 90;
  }

  return hasHumanApprovalStep ? 96 : 92;
}

function buildWarningPenaltyComponent(warningPenalty: number, warningCount: number): RouteScoreComponent {
  return {
    key: "warningPenalty",
    label: "Warning penalty",
    rawScore: roundScore(100 - warningPenalty),
    policyWeight: 0,
    normalizedWeight: 0,
    contribution: warningPenalty === 0 ? 0 : -warningPenalty,
    explanation:
      warningCount === 0
        ? "No route warnings reduced this score."
        : `${warningCount} warning(s) remain visible and reduce the final score by ${warningPenalty} point(s).`,
  };
}

function warningPenaltyFor(candidate: RouteCandidate) {
  return Math.min(candidate.warnings.length * 8, 24);
}

function selectRecommendedCandidate(scoredCandidates: ScoredRouteCandidate[]) {
  if (scoredCandidates.length === 0) {
    return {
      recommendedCandidate: null,
      tieBreakersApplied: [],
    };
  }

  const bestScore = Math.max(...scoredCandidates.map((candidate) => candidate.score));
  const closeCandidates = scoredCandidates.filter((candidate) => bestScore - candidate.score <= ambiguousScoreThreshold);
  const tieBreakersApplied: string[] = [];

  if (closeCandidates.length > 1) {
    tieBreakersApplied.push(
      `Scores within ${ambiguousScoreThreshold} points are treated as ambiguous, so the least-resource safe route wins the tie-breaker.`,
    );

    return {
      recommendedCandidate: [...closeCandidates].sort(compareLeastResourceFirst)[0],
      tieBreakersApplied,
    };
  }

  const recommendedCandidate = scoredCandidates.find((candidate) => candidate.score === bestScore) ?? scoredCandidates[0];

  return {
    recommendedCandidate,
    tieBreakersApplied,
  };
}

function compareLeastResourceFirst(left: ScoredRouteCandidate, right: ScoredRouteCandidate) {
  return (
    strategyResourceRank[left.strategy] - strategyResourceRank[right.strategy] ||
    levelResourceRank[left.estimatedCostLevel] - levelResourceRank[right.estimatedCostLevel] ||
    levelResourceRank[left.estimatedEffortLevel] - levelResourceRank[right.estimatedEffortLevel] ||
    right.score - left.score ||
    left.id.localeCompare(right.id)
  );
}

function normalizeScoringWeights(weights: ScoringWeights): ScoringWeights {
  const totalWeight = weightedComponentKeys.reduce((total, key) => total + weights[key], 0);

  if (totalWeight === 0) {
    return {
      cost: 0,
      energy: 0,
      quality: 0,
      speed: 0,
      sourceFit: 0,
      sensitivityFit: 0,
    };
  }

  return {
    cost: weights.cost / totalWeight,
    energy: weights.energy / totalWeight,
    quality: weights.quality / totalWeight,
    speed: weights.speed / totalWeight,
    sourceFit: weights.sourceFit / totalWeight,
    sensitivityFit: weights.sensitivityFit / totalWeight,
  };
}

function capabilityKeysFor(knowledgeWorkType: TaskIntake["knowledgeWorkType"]): CapabilityKey[] {
  switch (knowledgeWorkType) {
    case "research":
      return ["research", "reasoning"];
    case "synthesis":
      return ["reasoning", "writing"];
    case "analysis":
      return ["reasoning"];
    case "writing":
      return ["writing"];
    case "coding":
      return ["coding", "reasoning"];
    case "planning":
      return ["reasoning", "writing"];
    case "review":
      return ["reasoning"];
    case "packaging":
      return ["packaging", "writing"];
  }
}

function averageCapabilityScore(scores: CapabilityScores, keys: CapabilityKey[]) {
  return keys.reduce((total, key) => total + scores[key], 0) / keys.length;
}

function modelsUsedForQuality(candidate: RouteCandidate, modelById: Map<string, ModelInventoryItem>) {
  const modelIds = candidate.steps
    .filter((step) => step.kind !== "human review")
    .map((step) => step.modelId)
    .filter((modelId): modelId is string => modelId !== undefined);
  const uniqueModelIds = unique(modelIds);

  return uniqueModelIds.flatMap((modelId) => {
    const model = modelById.get(modelId);
    return model ? [model] : [];
  });
}

function modelsUsedByCandidate(candidate: RouteCandidate, modelById: Map<string, ModelInventoryItem>) {
  const modelIds = candidate.steps
    .map((step) => step.modelId)
    .filter((modelId): modelId is string => modelId !== undefined);
  const uniqueModelIds = unique(modelIds);

  return uniqueModelIds.flatMap((modelId) => {
    const model = modelById.get(modelId);
    return model ? [model] : [];
  });
}

function requiresHumanApprovalForTask(task: TaskIntake) {
  return (
    task.publicFacing ||
    task.sensitivityClass === "public-facing risk" ||
    task.sensitivityClass === "regulated" ||
    task.sensitivityClass === "highly restricted" ||
    task.qualityBar === "high" ||
    task.qualityBar === "critical"
  );
}

function buildStrengths(scoreComponents: RouteScoreComponent[]) {
  const componentByKey = componentMap(scoreComponents);
  const strengths: string[] = [];

  if ((componentByKey.get("cost")?.rawScore ?? 0) >= 85) {
    strengths.push("Strong cost fit for the selected cost preference.");
  }

  if ((componentByKey.get("energy")?.rawScore ?? 0) >= 85) {
    strengths.push("Strong energy fit for the selected energy preference.");
  }

  if ((componentByKey.get("quality")?.rawScore ?? 0) >= 85) {
    strengths.push("Strong quality fit for the requested work type and quality bar.");
  }

  if ((componentByKey.get("sourceFit")?.rawScore ?? 0) >= 90) {
    strengths.push("Uses the requested sources that passed hard gates.");
  }

  if ((componentByKey.get("sensitivityFit")?.rawScore ?? 0) >= 90) {
    strengths.push("Fits the task sensitivity and approval posture.");
  }

  return strengths;
}

function buildCautions(candidate: RouteCandidate, scoreComponents: RouteScoreComponent[], warningPenalty: number) {
  const componentByKey = componentMap(scoreComponents);
  const cautions = [...candidate.warnings];

  if (warningPenalty > 0) {
    cautions.push("Warnings reduce the score; review them before using this route.");
  }

  if ((componentByKey.get("cost")?.rawScore ?? 100) < 60) {
    cautions.push("Cost is a notable tradeoff for this route.");
  }

  if ((componentByKey.get("energy")?.rawScore ?? 100) < 60) {
    cautions.push("Energy use is a notable tradeoff for this route.");
  }

  if ((componentByKey.get("quality")?.rawScore ?? 100) < 70) {
    cautions.push("Quality fit may be weaker than the requested quality bar.");
  }

  if ((componentByKey.get("sourceFit")?.rawScore ?? 100) < 100) {
    cautions.push("Some requested sources are not used by this route after hard gates.");
  }

  return unique(cautions);
}

function componentMap(scoreComponents: RouteScoreComponent[]) {
  return new Map(scoreComponents.map((component) => [component.key, component]));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function clampScore(score: number) {
  return Math.min(100, Math.max(0, score));
}

function roundScore(score: number) {
  return Math.round(score * 10) / 10;
}

function roundWeight(weight: number) {
  return Math.round(weight * 1000) / 1000;
}
