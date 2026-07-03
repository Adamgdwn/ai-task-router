import { defaultModels } from "../../domain/defaults/defaultModels";
import { defaultFinalApprovalRouteStep, defaultPolicies } from "../../domain/defaults/defaultPolicies";
import { defaultSources } from "../../domain/defaults/defaultSources";
import { generatePromptPackage } from "../../domain/prompting/promptPackageGenerator";
import { generateRouteCandidates, type RouteCandidateGenerationResult } from "../../domain/routing/candidateGeneration";
import { evaluateHardGates, type HardGateResult } from "../../domain/routing/hardGates";
import { generateRouteCard } from "../../domain/routing/routeCardGenerator";
import { scoreRouteCandidates, type RouteScoringResult, type ScoredRouteCandidate } from "../../domain/routing/scoring";
import { promptPackageSchema, routeCardSchema } from "../../domain/schemas";
import type { PolicyDefault, SourcePermission, TaskIntake } from "../../domain/types";

const taskCreatedAt = "2026-07-03T15:13:17-06:00";
const cardCreatedAt = "2026-07-03T15:32:44-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  const sourcePermissions = overrides.sourcePermissions ?? defaultSources;

  return {
    id: "task-prompt-package-001",
    title: "Prepare a prompt package fixture",
    description: "Create detailed manual prompts without calling external providers.",
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

function generatePipeline(
  task: TaskIntake,
  policyId: PolicyDefault["id"] = "balanced",
): {
  hardGateResult: HardGateResult;
  candidateResult: RouteCandidateGenerationResult;
  scoringResult: RouteScoringResult;
} {
  const hardGateResult = evaluateHardGates({ task, models: defaultModels });
  const candidateResult = generateRouteCandidates({
    task,
    models: defaultModels,
    policies: defaultPolicies,
    hardGateResult,
    finalApprovalRouteStep: defaultFinalApprovalRouteStep,
  });
  const scoringResult = scoreRouteCandidates({
    task,
    candidateResult,
    models: defaultModels,
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

function requireRecommendedRoute(scoringResult: RouteScoringResult): ScoredRouteCandidate {
  if (!scoringResult.recommendedCandidate) {
    throw new Error("Expected a recommended route candidate.");
  }

  return scoringResult.recommendedCandidate;
}

function expectValidPromptPackage(promptPackage: unknown) {
  const result = promptPackageSchema.safeParse(promptPackage);

  expect(result.success).toBe(true);
  return result;
}

describe("prompt package generator", () => {
  it("creates schema-valid manual prompt steps from a selected route", () => {
    const task = buildTask({
      id: "task-prompt-public-writing",
      title: "Draft a public FAQ answer",
      requestedSourceIds: ["web", "github"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task, "least-resource");
    const selectedRoute = requireRecommendedRoute(scoringResult);

    const promptPackage = generatePromptPackage({
      task,
      selectedRoute,
      hardGateResult,
    });

    expectValidPromptPackage(promptPackage);
    expect(promptPackage).toMatchObject({
      id: "prompt-package-task-prompt-public-writing-lean",
      taskId: task.id,
      title: "Prompt package: Draft a public FAQ answer",
    });
    expect(promptPackage.steps).toHaveLength(selectedRoute.steps.length);
    expect(promptPackage.steps[0]).toMatchObject({
      id: "prompt-step-route-task-prompt-public-writing-lean-route-task-prompt-public-writing-lean-synthesis",
      title: "Step 1: Draft Output",
      requiresHumanApproval: false,
    });
    expect(promptPackage.steps[0]?.inputRefs).toEqual(
      expect.arrayContaining([task.id, selectedRoute.id, selectedRoute.steps[0]?.id, "user-free-small-model", "web", "github"]),
    );
    expect(promptPackage.steps[0]?.instruction).toContain("Use this prompt package as manual guidance only.");
    expect(promptPackage.steps[0]?.instruction).toContain("Work type: writing. Output type: draft.");
    expect(promptPackage.steps[0]?.instruction).toContain("Use only these allowed source IDs for this step: web (Web), github (GitHub).");
    expect(promptPackage.steps[0]?.expectedOutput).toContain("draft");
  });

  it("includes current-facts and citation reminders without implying the app searches", () => {
    const task = buildTask({
      id: "task-prompt-current-facts",
      title: "Research current public facts",
      knowledgeWorkType: "research",
      outputType: "answer",
      requiresCurrentFacts: true,
      requiresCitations: true,
      requestedSourceIds: ["web"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);
    const selectedRoute = requireRecommendedRoute(scoringResult);

    const promptPackage = generatePromptPackage({ task, selectedRoute, hardGateResult });
    const instructionText = promptPackage.steps.map((step) => step.instruction).join("\n");

    expectValidPromptPackage(promptPackage);
    expect(promptPackage.steps.map((step) => step.title)).toContain("Step 1: Check Research");
    expect(instructionText).toContain("Current-facts reminder");
    expect(instructionText).toContain("Citation reminder");
    expect(instructionText).toContain("this app does not search, fetch, or update facts");
    expect(instructionText).toContain("Include citations for external claims");
  });

  it("excludes blocked sources from usable prompt inputs", () => {
    const task = buildTask({
      id: "task-prompt-confidential",
      title: "Summarize confidential planning notes",
      description: "Create a careful brief from local planning material.",
      knowledgeWorkType: "synthesis",
      outputType: "brief",
      sensitivityClass: "confidential",
      requestedSourceIds: ["local-files", "web"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);
    const selectedRoute = requireRecommendedRoute(scoringResult);

    const promptPackage = generatePromptPackage({ task, selectedRoute, hardGateResult });
    const inputRefs = promptPackage.steps.flatMap((step) => step.inputRefs);
    const instructionText = promptPackage.steps.map((step) => step.instruction).join("\n");

    expect(hardGateResult.blockedSources.map((source) => source.id)).toContain("web");
    expectValidPromptPackage(promptPackage);
    expect(inputRefs).toContain("local-files");
    expect(inputRefs).not.toContain("web");
    expect(instructionText).toContain("local-files (Local files)");
    expect(instructionText).not.toContain("web (Web)");
  });

  it("marks explicit human approval steps when route or hard gates require approval", () => {
    const task = buildTask({
      id: "task-prompt-public-facing",
      title: "Draft public launch copy",
      publicFacing: true,
      requestedSourceIds: ["web"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);
    const selectedRoute = requireRecommendedRoute(scoringResult);

    const promptPackage = generatePromptPackage({ task, selectedRoute, hardGateResult });
    const approvalSteps = promptPackage.steps.filter((step) => step.requiresHumanApproval);

    expectValidPromptPackage(promptPackage);
    expect(approvalSteps).toHaveLength(1);
    expect(approvalSteps[0]).toMatchObject({
      title: "Step 2: Approve Before Use",
      expectedOutput: expect.stringContaining("human approval decision"),
    });
    expect(approvalSteps[0]?.instruction).toContain("Human review checklist");
    expect(approvalSteps[0]?.instruction).toContain("Human approval is required before using public-facing");

    const routeWithoutApprovalStep = {
      ...selectedRoute,
      id: `${selectedRoute.id}-without-approval-step`,
      steps: selectedRoute.steps.filter((step) => step.kind !== "human review"),
    };
    const packageWithAddedApproval = generatePromptPackage({
      task,
      selectedRoute: routeWithoutApprovalStep,
      hardGateResult,
    });

    expect(packageWithAddedApproval.steps[packageWithAddedApproval.steps.length - 1]).toMatchObject({
      id: `prompt-step-${routeWithoutApprovalStep.id}-added-human-approval`,
      title: "Approve Before Use",
      requiresHumanApproval: true,
    });
  });

  it("handles no-source routes without adding external source instructions", () => {
    const task = buildTask({
      id: "task-prompt-no-source",
      title: "Outline a planning checklist",
      knowledgeWorkType: "planning",
      outputType: "plan",
      requestedSourceIds: [],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);
    const selectedRoute = requireRecommendedRoute(scoringResult);

    const promptPackage = generatePromptPackage({ task, selectedRoute, hardGateResult });
    const inputRefs = promptPackage.steps.flatMap((step) => step.inputRefs);
    const instructionText = promptPackage.steps.map((step) => step.instruction).join("\n");

    expectValidPromptPackage(promptPackage);
    expect(inputRefs).not.toEqual(expect.arrayContaining(defaultSources.map((source) => source.id)));
    expect(instructionText).toContain("no source IDs are approved for this step");
    expect(instructionText).toContain("Use only these source IDs for this step: none.");
  });

  it("keeps highly restricted fallback prompts manual and approval-gated", () => {
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
      id: "task-prompt-highly-restricted",
      title: "Review highly restricted material",
      sensitivityClass: "highly restricted",
      qualityBar: "critical",
      sourcePermissions: [secureLocalSource],
      requestedSourceIds: [secureLocalSource.id],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);
    const selectedRoute = requireRecommendedRoute(scoringResult);

    const promptPackage = generatePromptPackage({ task, selectedRoute, hardGateResult });
    const instructionText = promptPackage.steps.map((step) => step.instruction).join("\n");
    const inputRefs = promptPackage.steps.flatMap((step) => step.inputRefs);

    expectValidPromptPackage(promptPackage);
    expect(selectedRoute.steps.map((step) => step.kind)).toEqual(["manual", "human review"]);
    expect(promptPackage.steps.map((step) => step.title)).toEqual(["Step 1: Prepare Manually", "Step 2: Approve Before Use"]);
    expect(promptPackage.steps[promptPackage.steps.length - 1]?.requiresHumanApproval).toBe(true);
    expect(inputRefs).toContain("manual-human-review");
    expect(inputRefs).toContain("secure-local-source");
    expect(inputRefs).not.toContain("user-frontier-quality-model");
    expect(instructionText).toContain("Sensitivity: highly restricted.");
    expect(instructionText).toContain("Human review checklist");
  });

  it("can be attached to route cards without placeholder prompt packages", () => {
    const task = buildTask({
      id: "task-prompt-route-card-integration",
      title: "Prepare a tested route card",
      requestedSourceIds: ["web", "github"],
    });
    const { hardGateResult, scoringResult } = generatePipeline(task);
    const selectedRoute = requireRecommendedRoute(scoringResult);
    const promptPackage = generatePromptPackage({ task, selectedRoute, hardGateResult });

    const card = generateRouteCard({
      task,
      hardGateResult,
      scoringResult,
      promptPackage,
      createdAt: cardCreatedAt,
    });

    expect(promptPackage.id).not.toContain("placeholder");
    expect(promptPackage.steps[0]?.instruction).not.toContain("handled by a later chunk");
    expect(routeCardSchema.safeParse(card).success).toBe(true);
    expect(card.promptPackage).toEqual(promptPackage);
  });
});
