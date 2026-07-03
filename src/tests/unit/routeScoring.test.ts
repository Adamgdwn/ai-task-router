import { defaultModels } from "../../domain/defaults/defaultModels";
import { defaultFinalApprovalRouteStep, defaultPolicies } from "../../domain/defaults/defaultPolicies";
import { defaultSources } from "../../domain/defaults/defaultSources";
import {
  generateRouteCandidates,
  type RouteCandidate,
  type RouteCandidateGenerationResult,
  type UnavailableRouteCandidate,
} from "../../domain/routing/candidateGeneration";
import { evaluateHardGates, type HardGateResult } from "../../domain/routing/hardGates";
import {
  scoreRouteCandidates,
  type RouteScoreComponentKey,
  type ScoredRouteCandidate,
} from "../../domain/routing/scoring";
import type { PolicyDefault, RouteStep, SourcePermission, TaskIntake } from "../../domain/types";

const createdAt = "2026-07-03T14:37:52-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  const sourcePermissions = overrides.sourcePermissions ?? defaultSources;

  return {
    id: "task-route-scoring-001",
    title: "Prepare a route scoring fixture",
    description: "Score local route recommendations without calling external providers.",
    dmaicPhase: "define",
    lifecycleStage: "draft",
    knowledgeWorkType: "writing",
    outputType: "draft",
    qualityBar: "standard",
    sensitivityClass: "public",
    requiresCurrentFacts: false,
    requiresCitations: false,
    publicFacing: false,
    costPreference: "balanced",
    energyPreference: "balanced",
    sourcePermissions,
    requestedSourceIds: sourcePermissions.map((source) => source.id),
    createdAt,
    ...overrides,
  };
}

function generateForTask(
  task: TaskIntake,
): { hardGateResult: HardGateResult; candidateResult: RouteCandidateGenerationResult } {
  const hardGateResult = evaluateHardGates({ task, models: defaultModels });
  const candidateResult = generateRouteCandidates({
    task,
    models: defaultModels,
    policies: defaultPolicies,
    hardGateResult,
    finalApprovalRouteStep: defaultFinalApprovalRouteStep,
  });

  return { hardGateResult, candidateResult };
}

function policyById(id: PolicyDefault["id"]) {
  const policy = defaultPolicies.find((candidatePolicy) => candidatePolicy.id === id);

  if (!policy) {
    throw new Error(`Expected ${id} policy to exist.`);
  }

  return policy;
}

function requireScoredCandidate(result: { scoredCandidates: ScoredRouteCandidate[] }, strategy: RouteCandidate["strategy"]) {
  const candidate = result.scoredCandidates.find((scoredCandidate) => scoredCandidate.strategy === strategy);

  if (!candidate) {
    throw new Error(`Expected ${strategy} scored candidate to exist.`);
  }

  return candidate;
}

function requireComponent(candidate: ScoredRouteCandidate, key: RouteScoreComponentKey) {
  const component = candidate.scoreComponents.find((scoreComponent) => scoreComponent.key === key);

  if (!component) {
    throw new Error(`Expected ${key} component to exist.`);
  }

  return component;
}

describe("route scoring", () => {
  it("scores generated candidates on a 0 to 100 scale with transparent components", () => {
    const task = buildTask({
      id: "task-score-public-writing",
      title: "Draft a public FAQ answer",
      requestedSourceIds: ["web", "github"],
    });
    const { candidateResult } = generateForTask(task);

    const result = scoreRouteCandidates({
      task,
      candidateResult,
      models: defaultModels,
      policy: policyById("least-resource"),
    });

    expect(result.selectedPolicyId).toBe("least-resource");
    expect(result.unavailable).toEqual([]);
    expect(result.scoredCandidates.map((candidate) => candidate.strategy)).toEqual(["lean", "balanced", "premium"]);
    expect(result.recommendedCandidateId).toBe("route-task-score-public-writing-lean");
    expect(result.tieBreakersApplied).toEqual([expect.stringContaining("least-resource safe route")]);

    for (const candidate of result.scoredCandidates) {
      expect(candidate.score).toBeGreaterThanOrEqual(0);
      expect(candidate.score).toBeLessThanOrEqual(100);
      expect(candidate.policyId).toBe("least-resource");
      expect(candidate.scoreComponents.map((component) => component.key)).toEqual([
        "cost",
        "energy",
        "quality",
        "speed",
        "sourceFit",
        "sensitivityFit",
        "warningPenalty",
      ]);
      expect(candidate.strengths.length).toBeGreaterThan(0);
    }

    const lean = requireScoredCandidate(result, "lean");
    expect(requireComponent(lean, "cost").rawScore).toBe(90);
    expect(requireComponent(lean, "energy").rawScore).toBe(88);
    expect(requireComponent(lean, "warningPenalty").contribution).toBe(0);
  });

  it("changes recommendation behavior across least-resource, balanced, and quality-first policies", () => {
    const everydayTask = buildTask({
      id: "task-policy-shift-everyday",
      requestedSourceIds: ["web", "github"],
    });
    const everydayCandidates = generateForTask(everydayTask).candidateResult;

    const leastResourceResult = scoreRouteCandidates({
      task: everydayTask,
      candidateResult: everydayCandidates,
      models: defaultModels,
      policy: policyById("least-resource"),
    });
    const balancedResult = scoreRouteCandidates({
      task: everydayTask,
      candidateResult: everydayCandidates,
      models: defaultModels,
      policy: policyById("balanced"),
    });

    expect(leastResourceResult.recommendedCandidate?.strategy).toBe("lean");
    expect(balancedResult.recommendedCandidate?.strategy).toBe("balanced");

    const criticalTask = buildTask({
      id: "task-policy-shift-critical",
      qualityBar: "critical",
      requestedSourceIds: ["web", "github"],
    });
    const criticalCandidates = generateForTask(criticalTask).candidateResult;
    const qualityFirstResult = scoreRouteCandidates({
      task: criticalTask,
      candidateResult: criticalCandidates,
      models: defaultModels,
      policy: policyById("quality-first"),
    });

    expect(qualityFirstResult.selectedPolicyId).toBe("quality-first");
    expect(qualityFirstResult.recommendedCandidate?.strategy).toBe("premium");
  });

  it("penalizes warnings while keeping them visible on the scored candidate", () => {
    const task = buildTask({
      id: "task-public-facing-warning",
      title: "Draft public launch copy",
      publicFacing: true,
      requestedSourceIds: ["web"],
    });
    const { hardGateResult, candidateResult } = generateForTask(task);

    expect(hardGateResult.requiresHumanApproval).toBe(true);

    const result = scoreRouteCandidates({
      task,
      candidateResult,
      models: defaultModels,
      policy: policyById("balanced"),
    });
    const lean = requireScoredCandidate(result, "lean");
    const warningComponent = requireComponent(lean, "warningPenalty");

    expect(lean.warnings).toContain(
      "Human approval is required before using public-facing, regulated, highly restricted, high-quality, or critical output.",
    );
    expect(warningComponent.contribution).toBeLessThan(0);
    expect(lean.score).toBeLessThan(lean.weightedScoreBeforePenalty);
    expect(lean.cautions).toEqual(expect.arrayContaining(lean.warnings));
  });

  it("uses the least-resource tie-breaker when scores are equal", () => {
    const task = buildTask({
      id: "task-equal-score-tie",
      requestedSourceIds: [],
    });
    const manualStep = {
      id: "tie-manual",
      kind: "manual",
      label: "Manual scoring fixture",
      instruction: "Manually prepare the requested draft without external calls.",
      requiredPermissionLevel: 0,
      modelId: "manual-human-review",
      sourceIds: [],
      warnings: [],
    } satisfies RouteStep;
    const candidates = [
      buildManualTieCandidate(task.id, "premium", manualStep),
      buildManualTieCandidate(task.id, "balanced", manualStep),
      buildManualTieCandidate(task.id, "lean", manualStep),
    ];

    const result = scoreRouteCandidates({
      task,
      candidateResult: { candidates, unavailable: [] },
      models: defaultModels,
      policy: policyById("balanced"),
    });
    const uniqueScores = new Set(result.scoredCandidates.map((candidate) => candidate.score));

    expect([...uniqueScores]).toHaveLength(1);
    expect(result.recommendedCandidate?.strategy).toBe("lean");
    expect(result.tieBreakersApplied).toEqual([expect.stringContaining("least-resource safe route")]);
  });

  it("returns a no-recommendation state when no safe candidates exist", () => {
    const task = buildTask({
      id: "task-no-safe-candidates",
      requestedSourceIds: ["web"],
    });
    const unavailable = {
      id: "route-task-no-safe-candidates-balanced-unavailable",
      taskId: task.id,
      strategy: "balanced",
      label: "Balanced route",
      reasonCode: "no-safe-balanced-path",
      reason: "No safe mid-tier or synthesis route remains after hard gates.",
      warnings: [],
    } satisfies UnavailableRouteCandidate;

    const result = scoreRouteCandidates({
      task,
      candidateResult: { candidates: [], unavailable: [unavailable] },
      models: defaultModels,
      policy: policyById("balanced"),
    });

    expect(result.scoredCandidates).toEqual([]);
    expect(result.recommendedCandidateId).toBeNull();
    expect(result.recommendedCandidate).toBeNull();
    expect(result.unavailable).toEqual([unavailable]);
  });

  it("never recommends unavailable strategies when hard gates leave only a manual safe route", () => {
    const secureLocalSource = {
      id: "secure-local-source",
      label: "Secure local source",
      sourceType: "local files",
      permissionLevel: 4,
      sensitivityAllowed: ["highly restricted"],
      requiresCredentials: false,
      requiresExternalCall: false,
    } satisfies SourcePermission;
    const task = buildTask({
      id: "task-score-highly-restricted",
      title: "Review highly restricted material",
      sensitivityClass: "highly restricted",
      qualityBar: "critical",
      sourcePermissions: [secureLocalSource],
      requestedSourceIds: [secureLocalSource.id],
    });
    const { candidateResult } = generateForTask(task);

    const result = scoreRouteCandidates({
      task,
      candidateResult,
      models: defaultModels,
      policy: policyById("quality-first"),
    });

    expect(result.scoredCandidates.map((candidate) => candidate.strategy)).toEqual(["lean"]);
    expect(result.unavailable.map((candidate) => candidate.strategy)).toEqual(["balanced", "premium"]);
    expect(result.recommendedCandidate?.strategy).toBe("lean");
  });

  it("shows lower source fit when hard gates remove a requested source", () => {
    const task = buildTask({
      id: "task-source-fit-after-gates",
      knowledgeWorkType: "synthesis",
      sensitivityClass: "confidential",
      requestedSourceIds: ["local-files", "uploaded-documents", "web"],
    });
    const { candidateResult } = generateForTask(task);

    const result = scoreRouteCandidates({
      task,
      candidateResult,
      models: defaultModels,
      policy: policyById("balanced"),
    });
    const balanced = requireScoredCandidate(result, "balanced");
    const sourceFit = requireComponent(balanced, "sourceFit");

    expect(sourceFit.rawScore).toBeCloseTo(66.7);
    expect(balanced.cautions).toContain("Some requested sources are not used by this route after hard gates.");
  });
});

function buildManualTieCandidate(
  taskId: string,
  strategy: RouteCandidate["strategy"],
  manualStep: RouteStep,
): RouteCandidate {
  return {
    id: `route-${taskId}-${strategy}`,
    taskId,
    strategy,
    label: `${strategy} route`,
    summary: "Manual scoring fixture with identical score inputs.",
    estimatedCostLevel: "low",
    estimatedEffortLevel: "low",
    steps: [
      {
        ...manualStep,
        id: `route-${taskId}-${strategy}-manual`,
      },
    ],
    warnings: [],
  };
}
