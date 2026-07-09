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
      methodLabel: "Plan",
      actions: expect.arrayContaining(["Restate the task in one plain sentence."]),
      reviewChecks: expect.arrayContaining(["The goal, audience, inputs, and finish line are clear."]),
    });
    expect(card.stageGuidance.find((stage) => stage.stage === "create")).toMatchObject({
      label: "Build the drafting prompt",
      methodLabel: "Plan",
      recommendedModelLabel: expect.stringMatching(/Gemini|ChatGPT|Claude/),
    });
    expect(card.stageGuidance.find((stage) => stage.stage === "create")?.recommendedModelLabel).toContain("prompt builder");
    expect(card.stageGuidance.find((stage) => stage.stage === "package")).toMatchObject({
      label: "Run the prompt",
      methodLabel: "Do",
    });
    expect(card.stageGuidance.map((stage) => stage.methodLabel)).toEqual(["Plan", "Plan", "Plan", "Do", "Check", "Act"]);
    expect(card.stageGuidance.map((stage) => stage.methodLabel).join(" ")).not.toMatch(
      /\b(DMAIC|Define|Measure|Analyze|Improve|Control)\b/,
    );
  });

  it("expands prompt-first planning into requested deliverables, execution model, and first build slice", () => {
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
      id: "task-card-finance-prompt-build",
      title: "Personal Finance Test 1",
      description:
        "I need to build a prompt that will build out a tool that will take my monthly finances from a spreadsheet, categorize them, track them month over month, and show me where I need to improve and where I'm doing really well. Then I need the best model to actually execute and build this mini application for me.",
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
    const gatherStage = card.stageGuidance.find((stage) => stage.stage === "gather");
    const createStage = card.stageGuidance.find((stage) => stage.stage === "create");
    const packageStage = card.stageGuidance.find((stage) => stage.stage === "package");
    const reviewStage = card.stageGuidance.find((stage) => stage.stage === "review");
    const actStage = card.stageGuidance.find((stage) => stage.stage === "act");

    expectValidRouteCard(card);
    expect(card.recommendedOptionId).toBe("route-task-card-finance-prompt-build-balanced");
    expect(gatherStage).toMatchObject({
      recommendedModelLabel: expect.stringContaining("Perplexity Sonar"),
    });
    expect(createStage).toMatchObject({
      label: "Build the master prompt",
      recommendedModelLabel: expect.stringContaining("GPT-5.5 Thinking Medium"),
    });
    expect(createStage?.recommendedModelLabel).not.toContain("Instant first");
    expect(createStage?.workItems).toHaveLength(1);
    expect(createStage?.workItems[0]).toMatchObject({
      label: "Build one master prompt",
      recommendedModelLabel: expect.stringContaining("GPT-5.5 Thinking Medium"),
      modeLabel: expect.stringContaining("Thinking Medium"),
      upgradeTrigger: expect.stringContaining("Upgrade the prompt-design helper only if"),
    });
    expect(createStage?.workItems.map((item) => item.label).join(" ")).not.toContain("Prompt section");
    expect(createStage?.workItems[0]?.expectedOutput).toContain("One master prompt");
    expect(createStage?.actions.join(" ")).toContain("spreadsheet import or paste-in data flow");
    expect(createStage?.actions.join(" ")).toContain("categorization rules");
    expect(createStage?.actions.join(" ")).toContain("month-over-month tracking");
    expect(createStage?.actions.join(" ")).toContain("model and tool choice for execution");
    expect(packageStage).toMatchObject({
      label: "Execute the build plan prompt",
      recommendedModelLabel: expect.stringContaining("execution GPT-5.5 Instant"),
    });
    expect(packageStage?.workItems).toHaveLength(1);
    expect(packageStage?.workItems[0]).toMatchObject({
      label: "Create the first usable build slice",
      recommendedModelLabel: expect.stringContaining("GPT-5.5 Instant"),
      modeLabel: expect.stringContaining("Instant"),
      upgradeTrigger: expect.stringContaining("Upgrade execution only if"),
    });
    expect(packageStage?.actions.join(" ")).toContain("actual plan or build brief");
    expect(packageStage?.actions.join(" ")).toContain("model and tool choice for execution");
    expect(packageStage?.reviewChecks.join(" ")).toContain("first build slice");
    expect(reviewStage?.recommendedModelLabel).toContain("GPT-5.5 Thinking Medium");
    expect(reviewStage?.actions.join(" ")).toContain("improvement and strength insights");
    expect(reviewStage?.reviewChecks.join(" ")).toContain("full requested build path");
    expect(actStage?.reviewChecks.join(" ")).toContain("smallest useful build slice");
  });

  it("keeps least-resource public build guidance on concrete AI modes when ChatGPT Go is available", () => {
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
      id: "task-card-lean-chatgpt-build",
      title: "Personal Finance Test Least Resource",
      description:
        "Build a prompt and plan for a tool that imports spreadsheet finances, categorizes expenses, tracks month over month trends, shows improvement opportunities, and chooses the best model to execute the mini application.",
      knowledgeWorkType: "planning",
      outputType: "plan",
      costPreference: "minimize",
      energyPreference: "minimize",
      requiresCurrentFacts: true,
      requestedSourceIds: [],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "least-resource", models);

    const card = generateRouteCard({
      task,
      models,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });
    const createStage = card.stageGuidance.find((stage) => stage.stage === "create");
    const packageStage = card.stageGuidance.find((stage) => stage.stage === "package");

    expectValidRouteCard(card);
    expect(card.recommendedOptionId).toBe("route-task-card-lean-chatgpt-build-lean");
    expect(createStage?.recommendedModelLabel).toContain("GPT-5.5 Thinking Medium");
    expect(createStage?.recommendedModelLabel).not.toContain("You first");
    expect(createStage?.actions.join(" ")).not.toContain("best model to execute the mini application");
    expect(createStage?.actions.join(" ")).toContain("spreadsheet import or paste-in data flow");
    expect(packageStage?.recommendedModelLabel).toContain("GPT-5.5 Instant");
    expect(packageStage?.recommendedModelLabel).not.toContain("You first");
  });

  it("uses SuperGrok submodes for prompt design and build execution instead of generic best-model wording", () => {
    const manualReviewModel = routeReadyModels.find((model) => model.id === "manual-human-review");
    if (!manualReviewModel) {
      throw new Error("Manual review model is required for this test.");
    }
    const models = [
      manualReviewModel,
      createEverydayToolModel({
        id: "grok-super",
        providerId: "grok",
        accountId: "supergrok",
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
      id: "task-card-supergrok-build",
      title: "Plan a small finance app",
      description:
        "Research current model choices, build a master prompt, and create a first usable app slice that imports spreadsheet expenses, categorizes them, tracks trends, and shows improvement opportunities.",
      knowledgeWorkType: "planning",
      outputType: "plan",
      costPreference: "minimize",
      energyPreference: "minimize",
      requiresCurrentFacts: true,
      requestedSourceIds: [],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "least-resource", models);

    const card = generateRouteCard({
      task,
      models,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });
    const gatherStage = card.stageGuidance.find((stage) => stage.stage === "gather");
    const createStage = card.stageGuidance.find((stage) => stage.stage === "create");
    const packageStage = card.stageGuidance.find((stage) => stage.stage === "package");

    expectValidRouteCard(card);
    expect(gatherStage?.recommendedModelLabel).toContain("Perplexity Sonar");
    expect(createStage?.recommendedModelLabel).toContain("Grok 4.3 with reasoning high");
    expect(packageStage?.recommendedModelLabel).toContain("execution Grok Build 0.1");
    expect(`${createStage?.recommendedModelLabel} ${packageStage?.recommendedModelLabel}`).not.toContain("best available model");
  });

  it("labels the setup gap when a complex build request only has a research helper", () => {
    const manualReviewModel = routeReadyModels.find((model) => model.id === "manual-human-review");
    if (!manualReviewModel) {
      throw new Error("Manual review model is required for this test.");
    }
    const models = [
      manualReviewModel,
      createEverydayToolModel({
        id: "perplexity-free",
        providerId: "perplexity",
        accountId: "basic",
        frequencyId: "weekly",
      }),
    ] satisfies ModelInventoryItem[];
    const task = buildTask({
      id: "task-card-research-only-build",
      title: "Plan a small finance app with only Perplexity",
      description:
        "Research current model choices, build a master prompt, and create a first usable app slice that imports spreadsheet expenses, categorizes them, tracks trends, and shows improvement opportunities.",
      knowledgeWorkType: "planning",
      outputType: "plan",
      costPreference: "minimize",
      energyPreference: "minimize",
      requiresCurrentFacts: true,
      requestedSourceIds: [],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "least-resource", models);

    const card = generateRouteCard({
      task,
      models,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });
    const createStage = card.stageGuidance.find((stage) => stage.stage === "create");
    const packageStage = card.stageGuidance.find((stage) => stage.stage === "package");

    expectValidRouteCard(card);
    expect(createStage?.recommendedModelLabel).toContain("Select a prompt-capable AI helper first");
    expect(packageStage?.recommendedModelLabel).toContain("Select a build or execution helper first");
    expect(createStage?.recommendedModelLabel).not.toBe("You first");
    expect(packageStage?.recommendedModelLabel).not.toBe("You first");
  });

  it("treats Claude Code as a build surface from the selected Claude subscription", () => {
    const manualReviewModel = routeReadyModels.find((model) => model.id === "manual-human-review");
    if (!manualReviewModel) {
      throw new Error("Manual review model is required for this test.");
    }
    const models = [
      manualReviewModel,
      createEverydayToolModel({
        id: "claude-max-build",
        providerId: "claude",
        accountId: "max-20x",
        frequencyId: "daily",
      }),
    ] satisfies ModelInventoryItem[];
    const task = buildTask({
      id: "task-card-claude-code-build",
      title: "Build a finance tracker app",
      description:
        "Plan and build a small app that imports spreadsheet expenses, categorizes them, tracks month over month trends, and shows improvement opportunities.",
      knowledgeWorkType: "coding",
      outputType: "code",
      qualityBar: "high",
      requestedSourceIds: [],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "quality-first", models);

    const card = generateRouteCard({
      task,
      models,
      hardGateResult,
      scoringResult,
      promptPackage: buildPromptPackage(task),
      createdAt: cardCreatedAt,
    });
    const packageStage = card.stageGuidance.find((stage) => stage.stage === "package");
    const claudeStepText = card.options
      .flatMap((option) => option.steps)
      .filter((step) => step.modelId === "claude-max-build")
      .map((step) => `${step.label} ${step.instruction}`)
      .join(" ");

    expectValidRouteCard(card);
    expect(packageStage?.recommendedModelLabel).toContain("Claude Code via this Claude subscription");
    expect(claudeStepText).toContain("Claude Code note");
    expect(claudeStepText).toContain("do not model it as a separate subscription");
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
      title: "Research current AI model choices",
      description: "Research current model availability and summarize the practical evidence for a novice.",
      knowledgeWorkType: "research",
      outputType: "answer",
      requiresCurrentFacts: true,
      requiresCitations: true,
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
