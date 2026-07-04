import {
  permissionLevelSchema,
  promptStepSchema,
  routeCardSchema,
  routeLogEntrySchema,
  routeOptionSchema,
  routeStepSchema,
  sensitivityClassSchema,
  taskIntakeSchema,
} from "../../domain/schemas";
import type { PromptStep, RouteCard, RouteOption, RouteStep, TaskIntake } from "../../domain/types";

const createdAt = "2026-07-03T12:07:56-06:00";

const validTaskIntake = {
  id: "task-001",
  title: "Summarize customer discovery notes",
  description: "Create a concise synthesis with citations to uploaded notes.",
  dmaicPhase: "analyze",
  lifecycleStage: "review",
  knowledgeWorkType: "synthesis",
  outputType: "brief",
  qualityBar: "high",
  sensitivityClass: "confidential",
  requiresCurrentFacts: false,
  requiresCitations: true,
  publicFacing: false,
  costPreference: "balanced",
  energyPreference: "minimize",
  sourcePermissions: [
    {
      id: "uploaded-notes",
      label: "Uploaded discovery notes",
      sourceType: "uploaded documents",
      permissionLevel: 2,
      sensitivityAllowed: ["public", "internal", "confidential"],
    },
  ],
  requestedSourceIds: ["uploaded-notes"],
  createdAt,
} satisfies TaskIntake;

const validRouteStep = {
  id: "step-001",
  kind: "model",
  label: "Synthesize notes",
  instruction: "Use the permitted uploaded notes to create the synthesis.",
  requiredPermissionLevel: 2,
  modelId: "small-local-model",
  sourceIds: ["uploaded-notes"],
  warnings: [],
} satisfies RouteStep;

const validPromptStep = {
  id: "prompt-step-001",
  title: "Brief the model",
  instruction: "Summarize the source notes and preserve any quoted source labels.",
  inputRefs: ["uploaded-notes"],
  expectedOutput: "A concise discovery brief with cited source references.",
  requiresHumanApproval: false,
} satisfies PromptStep;

const validRouteOption = {
  id: "route-balanced",
  strategy: "balanced",
  label: "Balanced synthesis route",
  summary: "Use a mid-resource synthesis step and human review before export.",
  score: 84,
  estimatedCostLevel: "medium",
  estimatedEffortLevel: "medium",
  steps: [validRouteStep],
  warnings: ["Human review recommended before using this externally."],
} satisfies RouteOption;

const validRouteCard = {
  id: "route-card-001",
  taskId: "task-001",
  title: "Route card for customer discovery synthesis",
  sensitivityClass: "confidential",
  recommendedOptionId: "route-balanced",
  options: [validRouteOption],
  warnings: ["No external execution is allowed."],
  blockedRoutes: [
    {
      routeId: "route-external-frontier",
      reason: "Confidential content blocks external AI routes without approval.",
      severity: "blocked",
    },
  ],
  promptPackage: {
    id: "prompt-package-001",
    taskId: "task-001",
    title: "Prompt package for discovery synthesis",
    steps: [validPromptStep],
  },
  createdAt,
} satisfies RouteCard;

describe("domain schemas", () => {
  it("accepts only permission levels 0 through 4", () => {
    for (const level of [0, 1, 2, 3, 4]) {
      expect(permissionLevelSchema.safeParse(level).success).toBe(true);
    }

    expect(permissionLevelSchema.safeParse(5).success).toBe(false);
    expect(permissionLevelSchema.safeParse(-1).success).toBe(false);
    expect(permissionLevelSchema.safeParse("2").success).toBe(false);
  });

  it("accepts only product-defined sensitivity classes", () => {
    for (const sensitivity of [
      "public",
      "internal",
      "confidential",
      "regulated",
      "highly restricted",
      "public-facing risk",
    ]) {
      expect(sensitivityClassSchema.safeParse(sensitivity).success).toBe(true);
    }

    expect(sensitivityClassSchema.safeParse("secret").success).toBe(false);
  });

  it("validates a representative task intake", () => {
    expect(taskIntakeSchema.parse(validTaskIntake)).toEqual(validTaskIntake);
  });

  it("rejects invalid task sensitivity and permission references", () => {
    const invalidSensitivity = {
      ...validTaskIntake,
      sensitivityClass: "secret",
    };
    const invalidSourceReference = {
      ...validTaskIntake,
      requestedSourceIds: ["missing-source"],
    };

    expect(taskIntakeSchema.safeParse(invalidSensitivity).success).toBe(false);
    expect(taskIntakeSchema.safeParse(invalidSourceReference).success).toBe(false);
  });

  it("validates route step, route option, prompt step, route card, and route log entry shapes", () => {
    expect(routeStepSchema.parse(validRouteStep)).toEqual(validRouteStep);
    expect(routeOptionSchema.parse(validRouteOption)).toEqual(validRouteOption);
    expect(promptStepSchema.parse(validPromptStep)).toEqual(validPromptStep);
    expect(routeCardSchema.parse(validRouteCard)).toEqual(validRouteCard);

    expect(
      routeLogEntrySchema.parse({
        id: "route-log-001",
        taskId: "task-001",
        routeCardId: "route-card-001",
        selectedOptionId: "route-balanced",
        selectedStrategy: "balanced",
        outcome: "accepted",
        feedback: {
          rating: 5,
          notes: "Useful route.",
        },
        createdAt,
      }),
    ).toMatchObject({
      routeCardId: "route-card-001",
      selectedStrategy: "balanced",
      outcome: "accepted",
    });

    expect(
      routeLogEntrySchema.parse({
        id: "route-log-note-only",
        taskId: "task-001",
        routeCardId: "route-card-001",
        selectedOptionId: "route-balanced",
        selectedStrategy: "balanced",
        outcome: "edited",
        feedback: {
          notes: "Useful after edits.",
        },
        createdAt,
      }),
    ).toMatchObject({
      feedback: {
        notes: "Useful after edits.",
      },
    });
  });

  it("rejects route cards whose recommendation does not reference an available option", () => {
    expect(
      routeCardSchema.safeParse({
        ...validRouteCard,
        recommendedOptionId: "missing-route",
      }).success,
    ).toBe(false);
  });
});
