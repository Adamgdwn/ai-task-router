import { z } from "zod";

export const permissionLevels = [0, 1, 2, 3, 4] as const;

export const sensitivityClasses = [
  "public",
  "internal",
  "confidential",
  "regulated",
  "highly restricted",
  "public-facing risk",
] as const;

export const dmaicPhases = ["define", "measure", "analyze", "improve", "control", "not applicable"] as const;

export const lifecycleStages = ["idea", "draft", "review", "approval", "publish", "operate", "archive"] as const;

export const knowledgeWorkTypes = [
  "research",
  "synthesis",
  "analysis",
  "writing",
  "coding",
  "planning",
  "review",
  "packaging",
] as const;

export const outputTypes = [
  "answer",
  "brief",
  "plan",
  "draft",
  "code",
  "table",
  "slide outline",
  "route card",
  "prompt package",
] as const;

export const qualityBars = ["quick", "standard", "high", "critical"] as const;

export const routeStrategies = ["lean", "balanced", "premium"] as const;

export const routeStepKinds = ["model", "research", "artifact", "human review", "manual"] as const;

export const projectStageKinds = ["frame", "gather", "create", "package", "review", "act"] as const;

export const policyDefaultIds = ["least-resource", "balanced", "quality-first"] as const;

export const desktopDiscoveryPlatforms = ["windows", "macos", "linux", "unknown"] as const;

export const desktopDiscoveryToolIds = ["ollama", "lm-studio", "jan", "gpt4all"] as const;

export const desktopDiscoveryCheckKinds = ["fixed-cli", "known-folder"] as const;

export const desktopDiscoveryDetailLevels = ["summary", "details"] as const;

export const desktopDiscoveryStatuses = [
  "not-found",
  "installed-no-models-found",
  "folder-found",
  "models-found",
  "blocked",
  "error",
  "timed-out",
] as const;

export const desktopDiscoveryErrorCodes = [
  "invalid-request",
  "not-approved",
  "permission-denied",
  "tool-timeout",
  "tool-failed",
  "app-control-blocked",
  "unsupported-platform",
  "internal-error",
] as const;

export const permissionLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const sensitivityClassSchema = z.enum(sensitivityClasses);

const nonEmptyIdSchema = z.string().trim().min(1, "ID is required");
const nonEmptyTextSchema = z.string().trim().min(1);
const isoTimestampSchema = z.string().datetime({ offset: true });

export const capabilityScoresSchema = z
  .object({
    reasoning: z.number().min(0).max(5),
    writing: z.number().min(0).max(5),
    coding: z.number().min(0).max(5),
    research: z.number().min(0).max(5),
    packaging: z.number().min(0).max(5),
  })
  .strict();

export const modelInventoryItemSchema = z
  .object({
    id: nonEmptyIdSchema,
    label: nonEmptyTextSchema,
    provider: nonEmptyTextSchema,
    tier: z.enum(["small", "mid", "frontier", "research", "artifact", "human"]),
    enabled: z.boolean(),
    localOnly: z.boolean(),
    capabilityScores: capabilityScoresSchema,
    maxPermissionLevel: permissionLevelSchema,
    requiresCredentials: z.boolean().optional(),
    requiresExternalCall: z.boolean().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const sourcePermissionSchema = z
  .object({
    id: nonEmptyIdSchema,
    label: nonEmptyTextSchema,
    sourceType: z.enum([
      "local files",
      "uploaded documents",
      "web",
      "github",
      "m365 sharepoint",
      "google drive",
      "personal memory",
      "other",
    ]),
    permissionLevel: permissionLevelSchema,
    sensitivityAllowed: z.array(sensitivityClassSchema).min(1),
    requiresCredentials: z.boolean().optional(),
    requiresExternalCall: z.boolean().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const scoringWeightsSchema = z
  .object({
    cost: z.number().min(0).max(1),
    energy: z.number().min(0).max(1),
    quality: z.number().min(0).max(1),
    speed: z.number().min(0).max(1),
    sourceFit: z.number().min(0).max(1),
    sensitivityFit: z.number().min(0).max(1),
  })
  .strict();

export const policyDefaultSchema = z
  .object({
    id: z.enum(policyDefaultIds),
    label: nonEmptyTextSchema,
    strategy: z.enum(routeStrategies),
    description: nonEmptyTextSchema,
    scoringWeights: scoringWeightsSchema,
    requiresCredentials: z.boolean().optional(),
    requiresExternalCall: z.boolean().optional(),
  })
  .strict();

export const taskTemplateSchema = z
  .object({
    id: nonEmptyIdSchema,
    label: nonEmptyTextSchema,
    description: nonEmptyTextSchema,
    dmaicPhase: z.enum(dmaicPhases),
    lifecycleStage: z.enum(lifecycleStages),
    knowledgeWorkType: z.enum(knowledgeWorkTypes),
    outputType: z.enum(outputTypes),
    qualityBar: z.enum(qualityBars),
    defaultSensitivityClass: sensitivityClassSchema,
    requiresCurrentFacts: z.boolean(),
    requiresCitations: z.boolean(),
    publicFacing: z.boolean(),
    costPreference: z.enum(["minimize", "balanced", "quality first"]),
    energyPreference: z.enum(["minimize", "balanced", "quality first"]),
    suggestedSourceIds: z.array(nonEmptyIdSchema),
    requiresCredentials: z.boolean().optional(),
    requiresExternalCall: z.boolean().optional(),
  })
  .strict();

export const taskIntakeSchema = z
  .object({
    id: nonEmptyIdSchema,
    title: nonEmptyTextSchema,
    description: nonEmptyTextSchema,
    dmaicPhase: z.enum(dmaicPhases),
    lifecycleStage: z.enum(lifecycleStages),
    knowledgeWorkType: z.enum(knowledgeWorkTypes),
    outputType: z.enum(outputTypes),
    qualityBar: z.enum(qualityBars),
    sensitivityClass: sensitivityClassSchema,
    requiresCurrentFacts: z.boolean(),
    requiresCitations: z.boolean(),
    publicFacing: z.boolean(),
    costPreference: z.enum(["minimize", "balanced", "quality first"]),
    energyPreference: z.enum(["minimize", "balanced", "quality first"]),
    sourcePermissions: z.array(sourcePermissionSchema),
    requestedSourceIds: z.array(nonEmptyIdSchema),
    createdAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((task, context) => {
    const declaredSourceIds = new Set(task.sourcePermissions.map((source) => source.id));
    for (const requestedSourceId of task.requestedSourceIds) {
      if (!declaredSourceIds.has(requestedSourceId)) {
        context.addIssue({
          code: "custom",
          message: `Requested source '${requestedSourceId}' is not declared in sourcePermissions.`,
          path: ["requestedSourceIds"],
        });
      }
    }
  });

export const routeStepSchema = z
  .object({
    id: nonEmptyIdSchema,
    kind: z.enum(routeStepKinds),
    label: nonEmptyTextSchema,
    instruction: nonEmptyTextSchema,
    requiredPermissionLevel: permissionLevelSchema,
    modelId: nonEmptyIdSchema.optional(),
    sourceIds: z.array(nonEmptyIdSchema).default([]),
    warnings: z.array(nonEmptyTextSchema).default([]),
  })
  .strict();

export const routeOptionSchema = z
  .object({
    id: nonEmptyIdSchema,
    strategy: z.enum(routeStrategies),
    label: nonEmptyTextSchema,
    summary: nonEmptyTextSchema,
    score: z.number().min(0).max(100),
    estimatedCostLevel: z.enum(["low", "medium", "high"]),
    estimatedEffortLevel: z.enum(["low", "medium", "high"]),
    steps: z.array(routeStepSchema).min(1),
    warnings: z.array(nonEmptyTextSchema).default([]),
    blockedReason: nonEmptyTextSchema.optional(),
  })
  .strict();

export const projectStageGuidanceSchema = z
  .object({
    id: nonEmptyIdSchema,
    stage: z.enum(projectStageKinds),
    methodLabel: nonEmptyTextSchema.optional(),
    label: nonEmptyTextSchema,
    purpose: nonEmptyTextSchema,
    actions: z.array(nonEmptyTextSchema).max(5).default([]),
    reviewChecks: z.array(nonEmptyTextSchema).max(4).default([]),
    recommendedModelLabel: nonEmptyTextSchema,
    recommendedModelId: nonEmptyIdSchema.optional(),
    routeStepId: nonEmptyIdSchema.optional(),
  })
  .strict();

export const promptStepSchema = z
  .object({
    id: nonEmptyIdSchema,
    title: nonEmptyTextSchema,
    instruction: nonEmptyTextSchema,
    inputRefs: z.array(nonEmptyIdSchema).default([]),
    expectedOutput: nonEmptyTextSchema,
    requiresHumanApproval: z.boolean().default(false),
  })
  .strict();

export const promptPackageSchema = z
  .object({
    id: nonEmptyIdSchema,
    taskId: nonEmptyIdSchema,
    title: nonEmptyTextSchema,
    steps: z.array(promptStepSchema).min(1),
  })
  .strict();

export const blockedRouteSchema = z
  .object({
    routeId: nonEmptyIdSchema,
    reason: nonEmptyTextSchema,
    severity: z.enum(["warning", "blocked"]),
  })
  .strict();

export const routeCardSchema = z
  .object({
    id: nonEmptyIdSchema,
    taskId: nonEmptyIdSchema,
    title: nonEmptyTextSchema,
    sensitivityClass: sensitivityClassSchema,
    recommendedOptionId: nonEmptyIdSchema,
    options: z.array(routeOptionSchema).min(1),
    stageGuidance: z.array(projectStageGuidanceSchema).max(6).default([]),
    warnings: z.array(nonEmptyTextSchema).default([]),
    blockedRoutes: z.array(blockedRouteSchema).default([]),
    promptPackage: promptPackageSchema,
    createdAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((card, context) => {
    const optionIds = new Set(card.options.map((option) => option.id));
    if (!optionIds.has(card.recommendedOptionId)) {
      context.addIssue({
        code: "custom",
        message: `Recommended option '${card.recommendedOptionId}' is not present in options.`,
        path: ["recommendedOptionId"],
      });
    }
  });

const routeLogFeedbackSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    notes: z.string().trim().optional(),
  })
  .strict()
  .superRefine((feedback, context) => {
    if (feedback.rating === undefined && !feedback.notes?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Feedback needs a rating or note when feedback is present.",
        path: [],
      });
    }
  });

export const routeLogEntrySchema = z
  .object({
    id: nonEmptyIdSchema,
    taskId: nonEmptyIdSchema,
    routeCardId: nonEmptyIdSchema,
    selectedOptionId: nonEmptyIdSchema,
    selectedStrategy: z.enum(routeStrategies),
    outcome: z.enum(["accepted", "edited", "rejected", "deferred"]),
    feedback: routeLogFeedbackSchema.optional(),
    createdAt: isoTimestampSchema,
  })
  .strict();

export const desktopDiscoveryOptionSchema = z
  .object({
    toolId: z.enum(desktopDiscoveryToolIds),
    label: nonEmptyTextSchema,
    summary: nonEmptyTextSchema,
    checkKinds: z.array(z.enum(desktopDiscoveryCheckKinds)).min(1),
    defaultSelected: z.boolean(),
    detailsAvailable: z.boolean(),
  })
  .strict();

export const desktopDiscoveryOptionsResponseSchema = z
  .object({
    schemaVersion: z.literal(1),
    platform: z.enum(desktopDiscoveryPlatforms),
    options: z.array(desktopDiscoveryOptionSchema).min(1),
  })
  .strict();

export const desktopDiscoveryRequestSchema = z
  .object({
    requestId: nonEmptyIdSchema,
    selectedToolIds: z.array(z.enum(desktopDiscoveryToolIds)).min(1).max(desktopDiscoveryToolIds.length),
    detailLevel: z.enum(desktopDiscoveryDetailLevels).default("summary"),
    includePathDetails: z.literal(false).default(false),
  })
  .strict()
  .superRefine((request, context) => {
    const uniqueToolIds = new Set(request.selectedToolIds);
    if (uniqueToolIds.size !== request.selectedToolIds.length) {
      context.addIssue({
        code: "custom",
        message: "Selected desktop discovery tools must be unique.",
        path: ["selectedToolIds"],
      });
    }
  });

export const desktopDiscoveryToolResultSchema = z
  .object({
    toolId: z.enum(desktopDiscoveryToolIds),
    label: nonEmptyTextSchema,
    status: z.enum(desktopDiscoveryStatuses),
    detected: z.boolean(),
    modelCount: z.number().int().min(0).max(500),
    modelNames: z.array(z.string().trim().min(1).max(160)).max(30).default([]),
    checkedLocationCount: z.number().int().min(0).max(25),
    shownPathDetails: z.literal(false).default(false),
    note: z.string().trim().max(240).optional(),
  })
  .strict()
  .superRefine((result, context) => {
    if (!result.detected && result.modelCount > 0) {
      context.addIssue({
        code: "custom",
        message: "Undetected tools cannot report local models.",
        path: ["modelCount"],
      });
    }

    if (result.modelNames.length > result.modelCount) {
      context.addIssue({
        code: "custom",
        message: "Model names cannot exceed the reported model count.",
        path: ["modelNames"],
      });
    }
  });

export const desktopDiscoverySummarySchema = z
  .object({
    toolsChecked: z.number().int().min(0).max(desktopDiscoveryToolIds.length),
    toolsDetected: z.number().int().min(0).max(desktopDiscoveryToolIds.length),
    modelsFound: z.number().int().min(0).max(500),
  })
  .strict();

export const desktopDiscoveryResponseSchema = z
  .object({
    schemaVersion: z.literal(1),
    requestId: nonEmptyIdSchema,
    checkedAt: isoTimestampSchema,
    platform: z.enum(desktopDiscoveryPlatforms),
    summary: desktopDiscoverySummarySchema,
    results: z.array(desktopDiscoveryToolResultSchema).min(1).max(desktopDiscoveryToolIds.length),
  })
  .strict()
  .superRefine((response, context) => {
    const toolsDetected = response.results.filter((result) => result.detected).length;
    const modelsFound = response.results.reduce((total, result) => total + result.modelCount, 0);

    if (response.summary.toolsChecked !== response.results.length) {
      context.addIssue({
        code: "custom",
        message: "Desktop discovery summary must match the result count.",
        path: ["summary", "toolsChecked"],
      });
    }

    if (response.summary.toolsDetected !== toolsDetected) {
      context.addIssue({
        code: "custom",
        message: "Desktop discovery summary must match detected tools.",
        path: ["summary", "toolsDetected"],
      });
    }

    if (response.summary.modelsFound !== modelsFound) {
      context.addIssue({
        code: "custom",
        message: "Desktop discovery summary must match found model count.",
        path: ["summary", "modelsFound"],
      });
    }
  });

export const desktopDiscoveryErrorSchema = z
  .object({
    schemaVersion: z.literal(1),
    requestId: nonEmptyIdSchema.optional(),
    code: z.enum(desktopDiscoveryErrorCodes),
    message: nonEmptyTextSchema,
    safeDetail: z.string().trim().max(240).optional(),
    retryable: z.boolean(),
  })
  .strict();
