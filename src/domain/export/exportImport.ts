import { z } from "zod";
import {
  modelInventoryItemSchema,
  policyDefaultSchema,
  promptPackageSchema,
  routeCardSchema,
  routeLogEntrySchema,
  sourcePermissionSchema,
} from "../schemas";
import type {
  ModelInventoryItem,
  PolicyDefault,
  PromptPackage,
  RouteCard,
  RouteLogEntry,
  SourcePermission,
} from "../types";

export const exportImportSchemaVersion = 1;
export const exportArtifactProduct = "ai-task-router";
export const exportArtifactKinds = ["configuration", "route-records", "local-bundle"] as const;

export type ExportArtifactKind = (typeof exportArtifactKinds)[number];

export type ExportedLocalConfiguration = {
  modelInventory: ModelInventoryItem[];
  sourcePermissionRegistry: SourcePermission[];
  policySettings: PolicyDefault[];
};

export type ExportedLocalRouteRecords = {
  routeCards: RouteCard[];
  promptPackages: PromptPackage[];
  routeLogEntries: RouteLogEntry[];
};

export type ConfigurationExportArtifact = {
  product: typeof exportArtifactProduct;
  artifactKind: "configuration";
  schemaVersion: typeof exportImportSchemaVersion;
  exportedAt: string;
  configuration: ExportedLocalConfiguration;
};

export type RouteRecordsExportArtifact = {
  product: typeof exportArtifactProduct;
  artifactKind: "route-records";
  schemaVersion: typeof exportImportSchemaVersion;
  exportedAt: string;
  routeRecords: ExportedLocalRouteRecords;
};

export type LocalExportBundleArtifact = {
  product: typeof exportArtifactProduct;
  artifactKind: "local-bundle";
  schemaVersion: typeof exportImportSchemaVersion;
  exportedAt: string;
  configuration: ExportedLocalConfiguration;
  routeRecords: ExportedLocalRouteRecords;
};

export type LocalExportBundle = {
  configuration: ExportedLocalConfiguration;
  routeRecords: ExportedLocalRouteRecords;
};

export type ExportJsonOptions = {
  exportedAt?: string;
};

export type ExportImportOperation = "export" | "import";

export type ExportImportValidationIssue = {
  path: string;
  message: string;
  code: string;
};

export class ExportImportValidationError extends Error {
  readonly kind = "export-import-validation";
  readonly recoverable = true;

  constructor(
    readonly operation: ExportImportOperation,
    readonly issues: ExportImportValidationIssue[],
  ) {
    super(messageForValidationFailure(operation, issues));
    this.name = "ExportImportValidationError";
  }
}

export const routeLogCsvHeaders = [
  "id",
  "taskId",
  "routeCardId",
  "selectedOptionId",
  "selectedStrategy",
  "outcome",
  "feedbackRating",
  "feedbackNotes",
  "createdAt",
] as const;

const isoTimestampSchema = z.string().datetime({ offset: true });

const modelInventoryExportSchema = z.array(modelInventoryItemSchema).superRefine(addDuplicateIdIssues);
const sourcePermissionRegistryExportSchema = z.array(sourcePermissionSchema).superRefine(addDuplicateIdIssues);
const policySettingsExportSchema = z.array(policyDefaultSchema).superRefine(addDuplicateIdIssues);
const routeCardsExportSchema = z.array(routeCardSchema).superRefine(addDuplicateIdIssues);
const promptPackagesExportSchema = z.array(promptPackageSchema).superRefine(addDuplicateIdIssues);
const routeLogEntriesExportSchema = z.array(routeLogEntrySchema).superRefine(addDuplicateIdIssues);

const exportedLocalConfigurationSchema = z
  .object({
    modelInventory: modelInventoryExportSchema,
    sourcePermissionRegistry: sourcePermissionRegistryExportSchema,
    policySettings: policySettingsExportSchema,
  })
  .strict();

const exportedLocalRouteRecordsSchema = z
  .object({
    routeCards: routeCardsExportSchema,
    promptPackages: promptPackagesExportSchema,
    routeLogEntries: routeLogEntriesExportSchema,
  })
  .strict()
  .superRefine(addRouteRecordConsistencyIssues);

const configurationExportArtifactSchema = z
  .object({
    product: z.literal(exportArtifactProduct),
    artifactKind: z.literal("configuration"),
    schemaVersion: z.literal(exportImportSchemaVersion),
    exportedAt: isoTimestampSchema,
    configuration: exportedLocalConfigurationSchema,
  })
  .strict();

const routeRecordsExportArtifactSchema = z
  .object({
    product: z.literal(exportArtifactProduct),
    artifactKind: z.literal("route-records"),
    schemaVersion: z.literal(exportImportSchemaVersion),
    exportedAt: isoTimestampSchema,
    routeRecords: exportedLocalRouteRecordsSchema,
  })
  .strict();

const localExportBundleArtifactSchema = z
  .object({
    product: z.literal(exportArtifactProduct),
    artifactKind: z.literal("local-bundle"),
    schemaVersion: z.literal(exportImportSchemaVersion),
    exportedAt: isoTimestampSchema,
    configuration: exportedLocalConfigurationSchema,
    routeRecords: exportedLocalRouteRecordsSchema,
  })
  .strict();

export function serializeConfigurationToJson(configuration: ExportedLocalConfiguration, options: ExportJsonOptions = {}): string {
  const artifact = validateExportArtifact(configurationExportArtifactSchema, {
    product: exportArtifactProduct,
    artifactKind: "configuration",
    schemaVersion: exportImportSchemaVersion,
    exportedAt: exportTimestamp(options.exportedAt),
    configuration,
  });

  return stringifyArtifact(artifact);
}

export function serializeRouteRecordsToJson(routeRecords: ExportedLocalRouteRecords, options: ExportJsonOptions = {}): string {
  const artifact = validateExportArtifact(routeRecordsExportArtifactSchema, {
    product: exportArtifactProduct,
    artifactKind: "route-records",
    schemaVersion: exportImportSchemaVersion,
    exportedAt: exportTimestamp(options.exportedAt),
    routeRecords,
  });

  return stringifyArtifact(artifact);
}

export function serializeLocalExportBundleToJson(bundle: LocalExportBundle, options: ExportJsonOptions = {}): string {
  const artifact = validateExportArtifact(localExportBundleArtifactSchema, {
    product: exportArtifactProduct,
    artifactKind: "local-bundle",
    schemaVersion: exportImportSchemaVersion,
    exportedAt: exportTimestamp(options.exportedAt),
    configuration: bundle.configuration,
    routeRecords: bundle.routeRecords,
  });

  return stringifyArtifact(artifact);
}

export function parseConfigurationJsonImport(jsonText: string): ExportedLocalConfiguration {
  return parseExpectedImport(jsonText, "configuration", configurationExportArtifactSchema).configuration;
}

export function parseRouteRecordsJsonImport(jsonText: string): ExportedLocalRouteRecords {
  return parseExpectedImport(jsonText, "route-records", routeRecordsExportArtifactSchema).routeRecords;
}

export function parseLocalExportBundleJsonImport(jsonText: string): LocalExportBundle {
  const artifact = parseExpectedImport(jsonText, "local-bundle", localExportBundleArtifactSchema);

  return {
    configuration: artifact.configuration,
    routeRecords: artifact.routeRecords,
  };
}

export function serializePromptPackageMarkdown(promptPackage: PromptPackage): string {
  const validPromptPackage = validateExportArtifact(promptPackageSchema, promptPackage);

  return `${promptPackageMarkdownSection(validPromptPackage, 1)}\n`;
}

export function serializeRouteCardMarkdown(routeCard: RouteCard, promptPackage: PromptPackage = routeCard.promptPackage): string {
  const validRouteCard = validateExportArtifact(routeCardSchema, routeCard);
  const validPromptPackage = validateExportArtifact(promptPackageSchema, promptPackage);

  assertPromptPackageMatchesRouteCard(validRouteCard, validPromptPackage);

  const recommendedOption = validRouteCard.options.find((option) => option.id === validRouteCard.recommendedOptionId);
  const lines = [
    `# ${validRouteCard.title}`,
    "",
    `- Route card ID: \`${validRouteCard.id}\``,
    `- Task ID: \`${validRouteCard.taskId}\``,
    `- Sensitivity: ${validRouteCard.sensitivityClass}`,
    `- Recommended option: ${recommendedOption?.label ?? validRouteCard.recommendedOptionId}`,
    `- Created: ${validRouteCard.createdAt}`,
    "",
    "## Summary",
    recommendedOption?.summary ?? "No recommended route summary is available.",
    "",
    "## Suggested Stages",
    stageGuidanceMarkdown(validRouteCard),
    "",
    "## Warnings",
    markdownList(validRouteCard.warnings),
    "",
    "## Route Options",
    ...validRouteCard.options.flatMap((option, optionIndex) => routeOptionMarkdownLines(option, optionIndex + 1)),
    "",
    "## Blocked Routes",
    markdownList(validRouteCard.blockedRoutes.map((blockedRoute) => `${blockedRoute.routeId}: ${blockedRoute.reason} (${blockedRoute.severity})`)),
    "",
    promptPackageMarkdownSection(validPromptPackage, 2),
  ];

  return `${lines.join("\n")}\n`;
}

export function serializeRouteLogsCsv(routeLogEntries: RouteLogEntry[]): string {
  const validRouteLogEntries = validateExportArtifact(routeLogEntriesExportSchema, routeLogEntries);
  const rows = validRouteLogEntries.map((routeLogEntry) => routeLogCsvHeaders.map((header) => csvEscape(routeLogCsvValue(routeLogEntry, header))).join(","));

  return `${[routeLogCsvHeaders.join(","), ...rows].join("\n")}\n`;
}

function parseExpectedImport<T>(
  jsonText: string,
  expectedKind: ExportArtifactKind,
  schema: z.ZodType<T>,
): T {
  const parsed = parseJsonText(jsonText);

  assertSupportedSchemaVersion(parsed);
  assertExpectedArtifactKind(parsed, expectedKind);

  return validateImportArtifact(schema, parsed);
}

function parseJsonText(jsonText: string): unknown {
  try {
    return JSON.parse(jsonText);
  } catch {
    throw new ExportImportValidationError("import", [
      {
        path: "$",
        code: "invalid_json",
        message: "Import data is not valid JSON.",
      },
    ]);
  }
}

function assertSupportedSchemaVersion(parsed: unknown) {
  if (!isRecord(parsed) || !Number.isInteger(parsed.schemaVersion)) {
    return;
  }

  if (parsed.schemaVersion !== exportImportSchemaVersion) {
    throw new ExportImportValidationError("import", [
      {
        path: "schemaVersion",
        code: "unsupported_version",
        message: `Schema version '${parsed.schemaVersion}' is not supported. Supported version: ${exportImportSchemaVersion}.`,
      },
    ]);
  }
}

function assertExpectedArtifactKind(parsed: unknown, expectedKind: ExportArtifactKind) {
  if (!isRecord(parsed) || typeof parsed.artifactKind !== "string" || parsed.artifactKind === expectedKind) {
    return;
  }

  throw new ExportImportValidationError("import", [
    {
      path: "artifactKind",
      code: "unexpected_artifact_kind",
      message: `Expected a '${expectedKind}' import bundle, but received '${parsed.artifactKind}'.`,
    },
  ]);
}

function validateExportArtifact<T>(schema: z.ZodType<T>, artifact: unknown): T {
  const result = schema.safeParse(artifact);

  if (!result.success) {
    throw new ExportImportValidationError("export", zodIssuesToValidationIssues(result.error.issues));
  }

  return result.data;
}

function validateImportArtifact<T>(schema: z.ZodType<T>, artifact: unknown): T {
  const result = schema.safeParse(artifact);

  if (!result.success) {
    throw new ExportImportValidationError("import", zodIssuesToValidationIssues(result.error.issues));
  }

  return result.data;
}

function zodIssuesToValidationIssues(issues: readonly z.ZodIssue[]): ExportImportValidationIssue[] {
  return issues.map((issue) => ({
    path: issuePath(issue.path),
    message: issue.message,
    code: issue.code,
  }));
}

function addDuplicateIdIssues(records: readonly { id: string }[], context: z.RefinementCtx) {
  const seenIds = new Map<string, number>();

  records.forEach((record, recordIndex) => {
    const previousIndex = seenIds.get(record.id);

    if (previousIndex !== undefined) {
      context.addIssue({
        code: "custom",
        path: [recordIndex, "id"],
        message: `Duplicate record ID '${record.id}' is not allowed. First seen at index ${previousIndex}.`,
      });
      return;
    }

    seenIds.set(record.id, recordIndex);
  });
}

function addRouteRecordConsistencyIssues(routeRecords: ExportedLocalRouteRecords, context: z.RefinementCtx) {
  const routeCardsById = new Map(routeRecords.routeCards.map((routeCard) => [routeCard.id, routeCard]));
  const promptPackagesById = new Map(routeRecords.promptPackages.map((promptPackage) => [promptPackage.id, promptPackage]));

  routeRecords.routeCards.forEach((routeCard, routeCardIndex) => {
    if (routeCard.promptPackage.taskId !== routeCard.taskId) {
      context.addIssue({
        code: "custom",
        path: ["routeCards", routeCardIndex, "promptPackage", "taskId"],
        message: `Route card '${routeCard.id}' has a prompt package for a different task.`,
      });
    }

    const linkedPromptPackage = promptPackagesById.get(routeCard.promptPackage.id);
    if (linkedPromptPackage && !recordsMatch(linkedPromptPackage, routeCard.promptPackage)) {
      context.addIssue({
        code: "custom",
        path: ["promptPackages"],
        message: `Prompt package '${routeCard.promptPackage.id}' does not match the copy embedded in route card '${routeCard.id}'.`,
      });
    }
  });

  routeRecords.routeLogEntries.forEach((routeLogEntry, routeLogIndex) => {
    const routeCard = routeCardsById.get(routeLogEntry.routeCardId);

    if (!routeCard) {
      context.addIssue({
        code: "custom",
        path: ["routeLogEntries", routeLogIndex, "routeCardId"],
        message: `Route log '${routeLogEntry.id}' references missing route card '${routeLogEntry.routeCardId}'.`,
      });
      return;
    }

    if (routeLogEntry.taskId !== routeCard.taskId) {
      context.addIssue({
        code: "custom",
        path: ["routeLogEntries", routeLogIndex, "taskId"],
        message: `Route log '${routeLogEntry.id}' references a route card for a different task.`,
      });
    }

    const optionIds = new Set(routeCard.options.map((option) => option.id));
    if (!optionIds.has(routeLogEntry.selectedOptionId)) {
      context.addIssue({
        code: "custom",
        path: ["routeLogEntries", routeLogIndex, "selectedOptionId"],
        message: `Route log '${routeLogEntry.id}' references missing option '${routeLogEntry.selectedOptionId}'.`,
      });
    }
  });
}

function assertPromptPackageMatchesRouteCard(routeCard: RouteCard, promptPackage: PromptPackage) {
  const issues: ExportImportValidationIssue[] = [];

  if (promptPackage.id !== routeCard.promptPackage.id) {
    issues.push({
      path: "promptPackage.id",
      code: "record_mismatch",
      message: `Prompt package '${promptPackage.id}' does not match route card prompt package '${routeCard.promptPackage.id}'.`,
    });
  }

  if (promptPackage.taskId !== routeCard.taskId) {
    issues.push({
      path: "promptPackage.taskId",
      code: "record_mismatch",
      message: `Prompt package '${promptPackage.id}' does not belong to route card task '${routeCard.taskId}'.`,
    });
  }

  if (issues.length > 0) {
    throw new ExportImportValidationError("export", issues);
  }
}

function stringifyArtifact(artifact: unknown): string {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

function exportTimestamp(exportedAt?: string): string {
  return exportedAt ?? new Date().toISOString();
}

function routeOptionMarkdownLines(option: RouteCard["options"][number], displayIndex: number): string[] {
  return [
    `### ${displayIndex}. ${option.label}`,
    "",
    `- Option ID: \`${option.id}\``,
    `- Strategy: ${option.strategy}`,
    `- Score: ${option.score}/100`,
    `- Cost: ${option.estimatedCostLevel}`,
    `- Effort: ${option.estimatedEffortLevel}`,
    "",
    option.summary,
    "",
    "#### Steps",
    ...option.steps.flatMap((step, stepIndex) => [
      `${stepIndex + 1}. **${step.label}** (${step.kind})`,
      `   - Instruction: ${step.instruction}`,
      `   - Permission level: ${step.requiredPermissionLevel}`,
      `   - Model: ${step.modelId ?? "None"}`,
      `   - Sources: ${inlineList(step.sourceIds)}`,
      `   - Warnings: ${inlineList(step.warnings)}`,
    ]),
    "",
    "#### Option Warnings",
    markdownList(option.warnings),
    "",
  ];
}

function stageGuidanceMarkdown(routeCard: RouteCard): string {
  if (routeCard.stageGuidance.length === 0) {
    return "None.";
  }

  return routeCard.stageGuidance
    .map((stage, stageIndex) =>
      [
        `${stageIndex + 1}. **${stage.label}**`,
        `   - Recommended help: ${stage.recommendedModelLabel}`,
        `   - Purpose: ${stage.purpose}`,
      ].join("\n"),
    )
    .join("\n");
}

function promptPackageMarkdownSection(promptPackage: PromptPackage, headingLevel: 1 | 2): string {
  const heading = "#".repeat(headingLevel);
  const stepHeading = "#".repeat(headingLevel + 1);

  return [
    `${heading} ${promptPackage.title}`,
    "",
    `- Prompt package ID: \`${promptPackage.id}\``,
    `- Task ID: \`${promptPackage.taskId}\``,
    "",
    `${stepHeading} Prompt Steps`,
    ...promptPackage.steps.flatMap((step, stepIndex) => [
      "",
      `${stepIndex + 1}. **${step.title}**`,
      `   - Instruction: ${step.instruction}`,
      `   - Inputs: ${inlineList(step.inputRefs)}`,
      `   - Expected output: ${step.expectedOutput}`,
      `   - Human approval: ${step.requiresHumanApproval ? "Required" : "Not required"}`,
    ]),
  ].join("\n");
}

function markdownList(values: readonly string[]): string {
  if (values.length === 0) {
    return "None.";
  }

  return values.map((value) => `- ${value}`).join("\n");
}

function inlineList(values: readonly string[]): string {
  if (values.length === 0) {
    return "None";
  }

  return values.join(", ");
}

function routeLogCsvValue(routeLogEntry: RouteLogEntry, header: (typeof routeLogCsvHeaders)[number]): string {
  switch (header) {
    case "id":
      return routeLogEntry.id;
    case "taskId":
      return routeLogEntry.taskId;
    case "routeCardId":
      return routeLogEntry.routeCardId;
    case "selectedOptionId":
      return routeLogEntry.selectedOptionId;
    case "selectedStrategy":
      return routeLogEntry.selectedStrategy;
    case "outcome":
      return routeLogEntry.outcome;
    case "feedbackRating":
      return routeLogEntry.feedback?.rating?.toString() ?? "";
    case "feedbackNotes":
      return routeLogEntry.feedback?.notes ?? "";
    case "createdAt":
      return routeLogEntry.createdAt;
  }
}

function csvEscape(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.split('"').join('""')}"`;
}

function messageForValidationFailure(operation: ExportImportOperation, issues: readonly ExportImportValidationIssue[]): string {
  if (operation === "export") {
    return "Export data failed validation. Fix local data, then try again.";
  }

  if (issues.some((issue) => issue.code === "invalid_json")) {
    return "Import bundle is not valid JSON. Choose an AI Task Router JSON export and try again.";
  }

  if (issues.some((issue) => issue.code === "unsupported_version")) {
    return `Import bundle schema version is not supported. This app supports version ${exportImportSchemaVersion}.`;
  }

  if (issues.some((issue) => issue.code === "unexpected_artifact_kind")) {
    return "Import bundle type does not match the selected import action. Choose the matching AI Task Router export file.";
  }

  return "Import bundle failed schema validation. Review the file and try again.";
}

function issuePath(path: readonly (string | number | symbol)[]): string {
  if (path.length === 0) {
    return "$";
  }

  return path.map(String).join(".");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordsMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
