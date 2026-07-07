import { defaultFinalApprovalRouteStep, defaultPolicies } from "../../domain/defaults/defaultPolicies";
import { createEverydayToolModel } from "../../domain/defaults/everydayToolCatalog";
import { defaultSources } from "../../domain/defaults/defaultSources";
import { generateRouteCandidates, type RouteCandidateGenerationResult } from "../../domain/routing/candidateGeneration";
import { evaluateHardGates, type HardGateResult } from "../../domain/routing/hardGates";
import { generateRouteCard } from "../../domain/routing/routeCardGenerator";
import { scoreRouteCandidates, type RouteScoringResult } from "../../domain/routing/scoring";
import { routeCardSchema } from "../../domain/schemas";
import type { ModelInventoryItem, PolicyDefault, PromptPackage, SourcePermission, TaskIntake } from "../../domain/types";
import { routeReadyModels } from "../fixtures/routeReadyModels";

const taskCreatedAt = "2026-07-03T14:52:37-06:00";
const cardCreatedAt = "2026-07-03T14:58:11-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  const sourcePermissions = overrides.sourcePermissions ?? defaultSources;

  return {
    id: "task-route-card-001",
    title: "Prepare a route card fixture",
    description: "Create a local route card artifact without executing any external action.",
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
    createdAt: taskCreatedAt,
    ...overrides,
  };
}

function buildPromptPackage(task: TaskIntake, overrides: Partial<PromptPackage> = {}): PromptPackage {
  return {
    id: `prompt-package-${task.id}-placeholder`,
    taskId: task.id,
    title: `Prompt package placeholder for ${task.title}`,
    steps: [
      {
        id: `prompt-step-${task.id}-placeholder`,
        title: "Placeholder prompt package",
        instruction: "Prompt package generation is handled by a later chunk; keep this as a local route-card reference.",
        inputRefs: [task.id],
        expectedOutput: "A future prompt package generator will replace this placeholder.",
        requiresHumanApproval: false,
      },
    ],
    ...overrides,
  };
}

function generatePipeline(
  task: TaskIntake,
  policyId: PolicyDefault["id"] = "balanced",
  models: ModelInventoryItem[] = routeReadyModels,
): {
  hardGateResult: HardGateResult;
  candidateResult: RouteCandidateGenerationResult;
  scoringResult: RouteScoringResult;
} {
  const hardGateResult = evaluateHardGates({ task, models });
  const candidateResult = generateRouteCandidates({
    task,
    models,
    policies: defaultPolicies,
    hardGateResult,
    finalApprovalRouteStep: defaultFinalApprovalRouteStep,
  });
  const scoringResult = scoreRouteCandidates({
    task,
    candidateResult,
    models,
    policy: policyById(policyId),
  });

  return { hardGateResult, candidateResult, scoringResult };
}

function policyById(id: PolicyDefault["id"]) {
  const policy = defaultPolicies.find((candidatePolicy) => candidatePolicy.id === id);

  if (!policy) {
    throw new Error(`Expected ${id} policy to exist.`);
  }

  return policy;
}

function expectValidRouteCard(card: unknown) {
  const result = routeCardSchema.safeParse(card);

  expect(result.success).toBe(true);
  return result;
}

describe("route card generator", () => {
  it("creates a schema-valid route card from scored candidates and a prompt package boundary object", () => {
    const task = buildTask({
      id: "task-card-public-writing",
      title: "Draft a public FAQ answer",
      requestedSourceIds: ["web", "github"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "least-resource");
    const promptPackage = buildPromptPackage(task);

    const card = generateRouteCard({
      task,
      models: routeReadyModels,
      hardGateResult,
      scoringResult,
      promptPackage,
      createdAt: cardCreatedAt,
    });

    expectValidRouteCard(card);
    expect(card).toMatchObject({
      id: "route-card-task-card-public-writing",
      taskId: task.id,
      title: "Route card: Draft a public FAQ answer",
      sensitivityClass: "public",
      createdAt: cardCreatedAt,
      promptPackage,
      recommendedOptionId: scoringResult.recommendedCandidateId,
    });
    expect(card.options.map((option) => option.strategy)).toEqual(["lean", "balanced", "premium"]);
    expect(card.options.map((option) => option.id)).toEqual(scoringResult.scoredCandidates.map((candidate) => candidate.id));
    expect(card.options.every((option) => option.estimatedCostUsd !== undefined)).toBe(true);
    expect(card.options.every((option) => option.estimatedSavingsUsd !== undefined)).toBe(true);
    expect(card.options.every((option) => option.costEstimateBasis?.includes("100k-token API-equivalent"))).toBe(true);
    expect(card.options.every((option) => option.estimatedEnergyWh !== undefined)).toBe(true);
    expect(card.options.every((option) => (option.estimatedEnergyWh ?? 0) > 0)).toBe(true);
    expect(card.options.every((option) => option.estimatedEnergySavingsWh !== undefined)).toBe(true);
    expect(card.options.every((option) => option.energyEstimateBasis?.includes("compute-energy estimate"))).toBe(true);
    expect(card.options.find((option) => option.id === card.recommendedOptionId)?.score).toBe(
      scoringResult.recommendedCandidate?.score,
    );
    expect(card.stageGuidance.map((stage) => stage.stage)).toEqual([
      "frame",
      "gather",
      "create",
      "package",
      "review",
      "act",
    ]);
    expect(card.stageGuidance[0]).toMatchObject({
      methodLabel: "Plan - Define",
      actions: expect.arrayContaining(["Restate the task in one plain sentence."]),
      reviewChecks: expect.arrayContaining(["The goal, audience, inputs, and finish line are clear."]),
    });
    expect(card.stageGuidance.find((stage) => stage.stage === "create")).toMatchObject({
      label: "Build the drafting prompt",
      methodLabel: "Plan - Analyze",
      recommendedModelLabel: expect.stringMatching(/Gemini|ChatGPT|Claude/),
    });
    expect(card.stageGuidance.find((stage) => stage.stage === "create")?.recommendedModelLabel).toContain("minimum");
    expect(card.stageGuidance.find((stage) => stage.stage === "package")).toMatchObject({
      label: "Run the prompt",
      methodLabel: "Do - Improve",
    });
  });

  it("preserves hard-gate warnings and blocked reasons on the route card", () => {
    const task = buildTask({
      id: "task-card-confidential-citations",
      title: "Summarize confidential notes with citations",
      knowledgeWorkType: "synthesis",
      sensitivityClass: "confidential",
      requiresCurrentFacts: true,
      requiresCitations: true,
      qualityBar: "high",
      requestedSourceIds: ["local-files", "web"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);

    const card = generateRouteCard({
      task,
      models: routeReadyModels,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });

    expectValidRouteCard(card);
    expect(card.warnings).toEqual(
      expect.arrayContaining([
        "Current facts or citations need an allowed research source and a research-capable model or tool; the app will not perform research itself.",
        "Human approval is required before using public-facing, regulated, highly restricted, high-quality, or critical output.",
      ]),
    );
    expect(card.blockedRoutes).toEqual(
      expect.arrayContaining([
        {
          routeId: "blocked-source-web",
          reason: "Websites or web search does not allow confidential tasks.",
          severity: "blocked",
        },
      ]),
    );
  });

  it("uses research-capable tools beside evidence stages when current facts are requested", () => {
    const task = buildTask({
      id: "task-card-current-facts",
      title: "Research current facts",
      knowledgeWorkType: "research",
      outputType: "answer",
      requiresCurrentFacts: true,
      requiresCitations: true,
      qualityBar: "high",
      requestedSourceIds: ["web"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "quality-first");

    const card = generateRouteCard({
      task,
      models: routeReadyModels,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });

    const gatherStage = card.stageGuidance.find((stage) => stage.stage === "gather");

    expectValidRouteCard(card);
    expect(gatherStage).toMatchObject({
      label: "Check the evidence",
      recommendedModelId: "user-research-tool",
      recommendedModelLabel: expect.stringContaining("Perplexity"),
    });
    expect(card.stageGuidance.map((stage) => stage.stage)).toContain("review");
    expect(card.stageGuidance.map((stage) => stage.stage)).toContain("act");
  });

  it("keeps a free research lean route at zero dollars while energy remains nonzero", () => {
    const manualReviewModel = routeReadyModels.find((model) => model.id === "manual-human-review");
    if (!manualReviewModel) {
      throw new Error("Manual review model is required for this test.");
    }
    const models = [
      manualReviewModel,
      createEverydayToolModel({
        id: "chatgpt-go",
        providerId: "chatgpt",
        accountId: "go",
        frequencyId: "daily",
      }),
      createEverydayToolModel({
        id: "perplexity-free",
        providerId: "perplexity",
        accountId: "basic",
        frequencyId: "weekly",
      }),
    ] satisfies ModelInventoryItem[];
    const task = buildTask({
      id: "task-card-chatgpt-go-perplexity-free",
      title: "Plan a finance app with current facts",
      knowledgeWorkType: "planning",
      outputType: "plan",
      requiresCurrentFacts: true,
      requestedSourceIds: [],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "balanced", models);

    const card = generateRouteCard({
      task,
      models,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });
    const lean = card.options.find((option) => option.strategy === "lean");
    const balanced = card.options.find((option) => option.strategy === "balanced");
    const premium = card.options.find((option) => option.strategy === "premium");

    expectValidRouteCard(card);
    expect(lean?.estimatedCostUsd).toBe(0);
    expect(lean?.estimatedEnergyWh).toBeGreaterThan(0);
    expect(balanced?.estimatedCostUsd).toBeGreaterThan(lean?.estimatedCostUsd ?? 0);
    expect(balanced?.estimatedEnergyWh).toBeGreaterThan(lean?.estimatedEnergyWh ?? 0);
    expect(premium?.estimatedCostUsd).toBeGreaterThan(balanced?.estimatedCostUsd ?? 0);
    expect(premium?.estimatedEnergyWh).toBeGreaterThan(balanced?.estimatedEnergyWh ?? 0);
  });

  it("keeps human approval requirements visible on card and option records", () => {
    const task = buildTask({
      id: "task-card-public-facing",
      title: "Draft public launch copy",
      publicFacing: true,
      requestedSourceIds: ["web"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);

    const card = generateRouteCard({
      task,
      models: routeReadyModels,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });

    const approvalWarning =
      "Human approval is required before using public-facing, regulated, highly restricted, high-quality, or critical output.";

    expectValidRouteCard(card);
    expect(card.warnings).toContain(approvalWarning);
    expect(card.options.every((option) => option.warnings.includes(approvalWarning))).toBe(true);
    expect(card.options.every((option) => option.steps.some((step) => step.kind === "human review"))).toBe(true);
  });

  it("creates a manual-review fallback card when scoring has no safe candidates", () => {
    const privateSource = {
      id: "private-source",
      label: "Private source",
      sourceType: "uploaded documents",
      permissionLevel: 3,
      sensitivityAllowed: ["regulated"],
      requiresCredentials: false,
      requiresExternalCall: false,
    } satisfies SourcePermission;
    const task = buildTask({
      id: "task-card-no-safe-route",
      title: "Review a regulated source with no route",
      sensitivityClass: "regulated",
      sourcePermissions: [privateSource],
      requestedSourceIds: [privateSource.id],
    });
    const hardGateResult = evaluateHardGates({ task, models: [] });
    const scoringResult = {
      selectedPolicyId: "balanced",
      selectedPolicyLabel: "Balanced",
      scoredCandidates: [],
      unavailable: [
        {
          id: "route-task-card-no-safe-route-lean-unavailable",
          taskId: task.id,
          strategy: "lean",
          label: "Lean route",
          reasonCode: "no-safe-lean-path",
          reason: "No safe small or manual route remains after hard gates.",
          warnings: [],
        },
        {
          id: "route-task-card-no-safe-route-balanced-unavailable",
          taskId: task.id,
          strategy: "balanced",
          label: "Balanced route",
          reasonCode: "no-safe-balanced-path",
          reason: "No safe mid-tier or synthesis route remains after hard gates.",
          warnings: [],
        },
      ],
      recommendedCandidateId: null,
      recommendedCandidate: null,
      tieBreakersApplied: [],
    } satisfies RouteScoringResult;

    const card = generateRouteCard({
      task,
      models: routeReadyModels,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });

    expectValidRouteCard(card);
    expect(card.recommendedOptionId).toBe("route-task-card-no-safe-route-manual-review-fallback");
    expect(card.options).toEqual([
      expect.objectContaining({
        id: "route-task-card-no-safe-route-manual-review-fallback",
        strategy: "lean",
        label: "Manual review required",
        score: 0,
        estimatedEffortLevel: "high",
      }),
    ]);
    expect(card.options[0]?.steps[0]).toMatchObject({
      kind: "manual",
      sourceIds: ["private-source"],
      requiredPermissionLevel: 3,
    });
    expect(card.stageGuidance.map((stage) => stage.recommendedModelLabel)).toContain("You first");
    expect(card.warnings).toContain(
      "No safe generated route is available; use manual review only until source, model, or policy settings are corrected.",
    );
    expect(card.blockedRoutes.map((blockedRoute) => blockedRoute.routeId)).toEqual([
      "route-task-card-no-safe-route-lean-unavailable",
      "route-task-card-no-safe-route-balanced-unavailable",
    ]);
  });

  it("rejects a prompt package that belongs to a different task", () => {
    const task = buildTask({
      id: "task-card-prompt-mismatch",
      requestedSourceIds: ["web"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);
    const promptPackage = buildPromptPackage(task, { taskId: "different-task" });

    expect(() =>
      generateRouteCard({
        task,
        models: routeReadyModels,
        hardGateResult,
        scoringResult,
        promptPackage,
        createdAt: cardCreatedAt,
      }),
    ).toThrow("belongs to task 'different-task', not 'task-card-prompt-mismatch'");
  });
});
