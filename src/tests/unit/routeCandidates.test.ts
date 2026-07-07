import { defaultFinalApprovalRouteStep, defaultPolicies } from "../../domain/defaults/defaultPolicies";
import { createEverydayToolModel } from "../../domain/defaults/everydayToolCatalog";
import { defaultSources } from "../../domain/defaults/defaultSources";
import { generateRouteCandidates, type RouteCandidate, type RouteCandidateGenerationResult } from "../../domain/routing/candidateGeneration";
import { evaluateHardGates, type HardGateResult } from "../../domain/routing/hardGates";
import { decomposeTask } from "../../domain/routing/taskDecomposition";
import { routeStepSchema } from "../../domain/schemas";
import type { ModelInventoryItem, SourcePermission, TaskIntake } from "../../domain/types";
import { routeReadyModels } from "../fixtures/routeReadyModels";

const createdAt = "2026-07-03T14:00:37-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  const sourcePermissions = overrides.sourcePermissions ?? defaultSources;

  return {
    id: "task-route-candidates-001",
    title: "Prepare a route candidate fixture",
    description: "Create a local recommendation plan without calling external providers.",
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
  models: ModelInventoryItem[] = routeReadyModels,
): { hardGateResult: HardGateResult; candidateResult: RouteCandidateGenerationResult } {
  const hardGateResult = evaluateHardGates({ task, models });
  const candidateResult = generateRouteCandidates({
    task,
    models,
    policies: defaultPolicies,
    hardGateResult,
    finalApprovalRouteStep: defaultFinalApprovalRouteStep,
  });

  return { hardGateResult, candidateResult };
}

function requireCandidate(result: RouteCandidateGenerationResult, strategy: RouteCandidate["strategy"]) {
  const candidate = result.candidates.find((routeCandidate) => routeCandidate.strategy === strategy);

  if (!candidate) {
    throw new Error(`Expected ${strategy} candidate to exist.`);
  }

  return candidate;
}

function expectValidRouteSteps(candidate: RouteCandidate) {
  for (const step of candidate.steps) {
    expect(routeStepSchema.parse(step)).toEqual(step);
  }
}

describe("route candidate generation", () => {
  it("generates stable lean, balanced, and premium candidates for simple public writing", () => {
    const task = buildTask({
      id: "task-public-writing",
      title: "Draft a public FAQ answer",
      requestedSourceIds: ["web", "github"],
    });

    const { candidateResult } = generateForTask(task);

    expect(candidateResult.unavailable).toEqual([]);
    expect(candidateResult.candidates.map((candidate) => candidate.strategy)).toEqual(["lean", "balanced", "premium"]);

    const lean = requireCandidate(candidateResult, "lean");
    const balanced = requireCandidate(candidateResult, "balanced");
    const premium = requireCandidate(candidateResult, "premium");

    expect(lean).toMatchObject({
      id: "route-task-public-writing-lean",
      label: "Lean route",
      estimatedCostLevel: "low",
      estimatedEffortLevel: "low",
    });
    expect(lean.steps).toEqual([
      expect.objectContaining({
        id: "route-task-public-writing-lean-prompt-design",
        kind: "model",
        modelId: "user-free-small-model",
        workRole: "prompt-design",
        modeLabel: expect.stringContaining("master prompt"),
        sourceIds: ["web", "github"],
      }),
      expect.objectContaining({
        id: "route-task-public-writing-lean-execution",
        kind: "model",
        modelId: "user-free-small-model",
        workRole: "execution",
        sourceIds: ["web", "github"],
      }),
    ]);
    expect(balanced.steps[0]).toMatchObject({ modelId: "user-mid-synthesis-model", workRole: "prompt-design" });
    expect(balanced.steps[1]).toMatchObject({ modelId: "user-mid-synthesis-model", workRole: "execution" });
    expect(premium.steps[0]).toMatchObject({ modelId: "user-frontier-quality-model", workRole: "prompt-design" });

    for (const candidate of candidateResult.candidates) {
      expect(candidate.summary).not.toMatch(/score|scoring|weighted/i);
      expectValidRouteSteps(candidate);
    }
  });

  it("uses only allowed confidential sources and skips blocked model options", () => {
    const task = buildTask({
      id: "task-confidential-synthesis",
      title: "Summarize confidential planning notes",
      knowledgeWorkType: "synthesis",
      outputType: "brief",
      sensitivityClass: "confidential",
      requestedSourceIds: ["local-files", "uploaded-documents", "web"],
    });

    const { hardGateResult, candidateResult } = generateForTask(task);
    const blockedModelIds = new Set(hardGateResult.blockedModels.map((block) => block.id));
    const blockedSourceIds = new Set(hardGateResult.blockedSources.map((block) => block.id));

    expect(hardGateResult.allowedSourceIds).toEqual(["local-files", "uploaded-documents"]);
    expect(blockedModelIds).toContain("user-free-small-model");
    expect(blockedSourceIds).toContain("web");

    expect(requireCandidate(candidateResult, "lean").steps[0]).toMatchObject({
      kind: "manual",
      modelId: "manual-human-review",
      sourceIds: ["local-files", "uploaded-documents"],
    });
    expect(requireCandidate(candidateResult, "balanced").steps[0]).toMatchObject({
      modelId: "user-mid-synthesis-model",
      sourceIds: ["local-files", "uploaded-documents"],
    });
    expect(requireCandidate(candidateResult, "premium").steps[0]).toMatchObject({
      modelId: "user-frontier-quality-model",
      sourceIds: ["local-files", "uploaded-documents"],
    });

    for (const candidate of candidateResult.candidates) {
      expectValidRouteSteps(candidate);
      for (const step of candidate.steps) {
        if (step.modelId) {
          expect(blockedModelIds.has(step.modelId)).toBe(false);
        }
        for (const sourceId of step.sourceIds) {
          expect(blockedSourceIds.has(sourceId)).toBe(false);
        }
      }
    }
  });

  it("adds manual research steps for current-facts and citation tasks when research support is allowed", () => {
    const task = buildTask({
      id: "task-current-facts",
      title: "Research current public facts",
      knowledgeWorkType: "research",
      outputType: "answer",
      requiresCurrentFacts: true,
      requiresCitations: true,
      requestedSourceIds: ["web"],
    });

    const { hardGateResult, candidateResult } = generateForTask(task);

    expect(hardGateResult.warnings.some((warning) => warning.reasonCode === "research-context-missing")).toBe(false);

    for (const candidate of candidateResult.candidates) {
      expect(candidate.steps[0]).toMatchObject({
        id: `${candidate.id}-evidence-check`,
        kind: "research",
        modelId: "user-research-tool",
        workRole: "evidence-check",
        sourceIds: ["web"],
      });
      expect(candidate.steps[0]?.instruction.toLowerCase()).toContain("the app does not search, fetch, or call the tool");
      expectValidRouteSteps(candidate);
    }
  });

  it("uses Perplexity-style research help when current facts are requested without a manual source choice", () => {
    const modelsWithPerplexityFree = routeReadyModels.map((model) =>
      model.id === "user-research-tool"
        ? createEverydayToolModel({
            id: model.id,
            providerId: "perplexity",
            accountId: "basic",
            frequencyId: "weekly",
          })
        : model,
    );
    const task = buildTask({
      id: "task-implied-current-facts",
      title: "Research current public facts without setup expertise",
      knowledgeWorkType: "research",
      outputType: "answer",
      requiresCurrentFacts: true,
      requestedSourceIds: [],
    });

    const { hardGateResult, candidateResult } = generateForTask(task, modelsWithPerplexityFree);
    const lean = requireCandidate(candidateResult, "lean");

    expect(hardGateResult.allowedSourceIds).toEqual(["web"]);
    expect(lean.steps[0]).toMatchObject({
      kind: "research",
      modelId: "user-research-tool",
      workRole: "evidence-check",
      sourceIds: ["web"],
    });
    expect(lean.steps[0]?.label).toContain("Perplexity");
    expect(lean.steps[0]?.label).toContain("Perplexity Sonar");
    expect(lean.steps[0]?.label).not.toContain("Perplexity Sonar Pro");
  });

  it("uses Perplexity for evidence and keeps premium visible as a comparison benchmark", () => {
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
      id: "task-chatgpt-go-perplexity-free",
      title: "Plan a finance app with current facts",
      knowledgeWorkType: "planning",
      outputType: "plan",
      requiresCurrentFacts: true,
      requestedSourceIds: [],
    });

    const { candidateResult } = generateForTask(task, models);
    const balanced = requireCandidate(candidateResult, "balanced");

    expect(balanced.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "research", modelId: "perplexity-free", workRole: "evidence-check" }),
        expect.objectContaining({
          kind: "model",
          modelId: "chatgpt-go",
          workRole: "prompt-design",
          modeLabel: expect.stringContaining("strongest reasoning mode included in this account"),
        }),
        expect.objectContaining({
          kind: "model",
          modelId: "chatgpt-go",
          workRole: "build-slice",
          modeLabel: expect.stringContaining("fastest adequate lower-cost"),
        }),
      ]),
    );
    const deliverableIds = new Set(decomposeTask(task).deliverables.map((deliverable) => deliverable.id));
    const coveredDeliverableIds = new Set(balanced.steps.flatMap((step) => step.deliverableIds));
    expect([...deliverableIds].every((deliverableId) => coveredDeliverableIds.has(deliverableId))).toBe(true);
    const premium = requireCandidate(candidateResult, "premium");
    expect(premium.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "research", modelId: "perplexity-free", workRole: "evidence-check" }),
        expect.objectContaining({ kind: "model", modelId: "chatgpt-go", workRole: "prompt-design" }),
      ]),
    );
    expect(premium.summary).toContain("premium benchmark");
    expect(premium.warnings).toContain(
      "No premium-capacity helper is saved for this task, so the premium route is shown as a comparison benchmark using the strongest safe helper currently selected.",
    );
    expect(candidateResult.unavailable.map((candidate) => candidate.strategy)).not.toContain("premium");
  });

  it("uses Perplexity, strongest owned reasoning, Claude Code build execution, and lighter safe execution for a full paid stack", () => {
    const manualReviewModel = routeReadyModels.find((model) => model.id === "manual-human-review");
    if (!manualReviewModel) {
      throw new Error("Manual review model is required for this test.");
    }
    const models = [
      manualReviewModel,
      createEverydayToolModel({
        id: "chatgpt-pro",
        providerId: "chatgpt",
        accountId: "pro",
        frequencyId: "daily",
      }),
      createEverydayToolModel({
        id: "claude-max-build",
        providerId: "claude",
        accountId: "max-20x",
        frequencyId: "daily",
      }),
      createEverydayToolModel({
        id: "perplexity-pro",
        providerId: "perplexity",
        accountId: "pro",
        frequencyId: "daily",
      }),
    ] satisfies ModelInventoryItem[];
    const task = buildTask({
      id: "task-full-paid-build-stack",
      title: "Build a CRM dashboard with current model choices",
      description:
        "Plan and build a CRM dashboard that imports contacts, tracks pipeline trends, recommends next actions, checks current model choices, and creates the first usable code slice.",
      knowledgeWorkType: "coding",
      outputType: "code",
      qualityBar: "high",
      requiresCurrentFacts: true,
      requestedSourceIds: [],
    });

    const { candidateResult } = generateForTask(task, models);
    const balanced = requireCandidate(candidateResult, "balanced");

    expect(balanced.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          modelId: "perplexity-pro",
          workRole: "evidence-check",
          modeLabel: expect.stringContaining("Perplexity Sonar Pro"),
        }),
        expect.objectContaining({
          workRole: "prompt-design",
          modeLabel: expect.stringMatching(/strongest|highest/i),
        }),
        expect.objectContaining({
          modelId: "claude-max-build",
          workRole: "build-slice",
          modeLabel: expect.stringContaining("Claude Code via this Claude subscription"),
        }),
      ]),
    );
    expect(balanced.steps.find((step) => step.workRole === "build-slice")?.instruction).toContain(
      "Claude Code note: use the subscription's Claude Code surface",
    );
  });

  it("adds a premium artifact step for packaging-shaped outputs when the artifact tool is allowed", () => {
    const task = buildTask({
      id: "task-artifact-packaging",
      title: "Package the route as a prompt package",
      knowledgeWorkType: "packaging",
      outputType: "prompt package",
      requestedSourceIds: ["web"],
    });

    const { candidateResult } = generateForTask(task);
    const premium = requireCandidate(candidateResult, "premium");

    expect(premium.steps.map((step) => step.kind)).toEqual(["model", "model", "artifact"]);
    expect(premium.steps.map((step) => step.workRole)).toEqual(["prompt-design", "execution", "artifact-package"]);
    expect(premium.steps[2]).toMatchObject({
      id: "route-task-artifact-packaging-premium-artifact-package",
      modelId: "user-artifact-tool",
      sourceIds: ["web"],
    });
    expect(premium.summary).toContain("It includes a packaging step for the requested artifact shape.");
    expectValidRouteSteps(premium);
  });

  it("adds default final human approval steps for public-facing drafts", () => {
    const task = buildTask({
      id: "task-public-facing-draft",
      title: "Draft public launch copy",
      publicFacing: true,
      requestedSourceIds: ["web"],
    });

    const { hardGateResult, candidateResult } = generateForTask(task);

    expect(hardGateResult.requiresHumanApproval).toBe(true);

    for (const candidate of candidateResult.candidates) {
      const approvalStep = candidate.steps[candidate.steps.length - 1];
      expect(approvalStep).toMatchObject({
        id: `${candidate.id}-human-approval`,
        kind: defaultFinalApprovalRouteStep.kind,
        label: defaultFinalApprovalRouteStep.label,
        instruction: defaultFinalApprovalRouteStep.instruction,
        warnings: defaultFinalApprovalRouteStep.warnings,
      });
      expect(candidate.warnings).toContain(
        "Human approval is required before using public-facing, regulated, highly restricted, high-quality, or critical output.",
      );
      expectValidRouteSteps(candidate);
    }
  });

  it("falls back to a lean manual route and marks higher-resource strategies unavailable for highly restricted work", () => {
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
      id: "task-highly-restricted",
      title: "Review highly restricted material",
      sensitivityClass: "highly restricted",
      qualityBar: "critical",
      sourcePermissions: [secureLocalSource],
      requestedSourceIds: [secureLocalSource.id],
    });

    const { hardGateResult, candidateResult } = generateForTask(task);

    expect(hardGateResult.allowedModelIds).toEqual(["manual-human-review"]);
    expect(candidateResult.candidates.map((candidate) => candidate.strategy)).toEqual(["lean"]);
    expect(candidateResult.unavailable).toEqual([
      expect.objectContaining({
        strategy: "balanced",
        reasonCode: "no-safe-balanced-path",
      }),
      expect.objectContaining({
        strategy: "premium",
        reasonCode: "no-safe-premium-path",
      }),
    ]);

    const lean = requireCandidate(candidateResult, "lean");
    expect(lean.steps.map((step) => step.kind)).toEqual(["manual", "manual", "human review"]);
    expect(lean.steps.map((step) => step.workRole)).toEqual(["prompt-design", "execution", undefined]);
    expect(lean.steps[0]).toMatchObject({
      modelId: "manual-human-review",
      sourceIds: ["secure-local-source"],
      requiredPermissionLevel: 4,
    });

    for (const candidate of candidateResult.candidates) {
      expectValidRouteSteps(candidate);
      for (const step of candidate.steps) {
        if (step.modelId) {
          expect(step.modelId).toBe("manual-human-review");
        }
      }
    }
  });
});
