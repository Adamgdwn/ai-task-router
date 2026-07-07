import { defaultModels } from "../../domain/defaults/defaultModels";
import { defaultPolicies } from "../../domain/defaults/defaultPolicies";
import { defaultSources } from "../../domain/defaults/defaultSources";
import {
  ExportImportValidationError,
  type ExportedLocalConfiguration,
  exportImportSchemaVersion,
  parseConfigurationJsonImport,
  parseLocalExportBundleJsonImport,
  parseRouteRecordsJsonImport,
  routeLogCsvHeaders,
  serializeConfigurationToJson,
  serializeLocalExportBundleToJson,
  serializePromptPackageMarkdown,
  serializeRouteCardMarkdown,
  serializeRouteLogsCsv,
  serializeRouteRecordsToJson,
} from "../../domain/export/exportImport";
import type {
  ModelInventoryItem,
  PromptPackage,
  RouteCard,
  RouteLogEntry,
  SourcePermission,
} from "../../domain/types";

const exportedAt = "2026-07-03T17:37:53-06:00";

describe("export and import utilities", () => {
  it("round-trips configuration and route records through schema-versioned JSON", () => {
    const configuration = buildConfiguration();
    const routeRecords = buildRouteRecords();

    const configurationJson = serializeConfigurationToJson(configuration, { exportedAt });
    const routeRecordsJson = serializeRouteRecordsToJson(routeRecords, { exportedAt });
    const bundleJson = serializeLocalExportBundleToJson({ configuration, routeRecords }, { exportedAt });

    expect(JSON.parse(configurationJson)).toMatchObject({
      product: "ai-task-router",
      artifactKind: "configuration",
      schemaVersion: exportImportSchemaVersion,
      exportedAt,
    });
    expect(JSON.parse(routeRecordsJson)).toMatchObject({
      product: "ai-task-router",
      artifactKind: "route-records",
      schemaVersion: exportImportSchemaVersion,
      exportedAt,
    });
    expect(parseConfigurationJsonImport(configurationJson)).toEqual(configuration);
    expect(parseRouteRecordsJsonImport(routeRecordsJson)).toEqual(routeRecords);
    expect(parseLocalExportBundleJsonImport(bundleJson)).toEqual({
      configuration,
      routeRecords,
    });
  });

  it("serializes route cards and prompt packages as readable Markdown", () => {
    const routeCard = buildRouteCard();
    const promptPackageMarkdown = serializePromptPackageMarkdown(routeCard.promptPackage);
    const routeCardMarkdown = serializeRouteCardMarkdown(routeCard);

    expect(routeCardMarkdown).toContain("# Route card: Export fixture");
    expect(routeCardMarkdown).toContain("## Quick Project Plan");
    expect(routeCardMarkdown).toContain("Method: Plan - Define");
    expect(routeCardMarkdown).toContain("Recommended help: Local export model");
    expect(routeCardMarkdown).toContain("Do this: Use the recommended tool to create the first pass.");
    expect(routeCardMarkdown).toContain("## Route Options");
    expect(routeCardMarkdown).toContain("### 1. Balanced route");
    expect(routeCardMarkdown).toContain("## Prompt package: Export fixture");
    expect(routeCardMarkdown).toContain("Use this local prompt fixture manually.");
    expect(routeCardMarkdown).toContain("None.");
    expect(promptPackageMarkdown).toContain("# Prompt package: Export fixture");
    expect(promptPackageMarkdown).toContain("## Prompt Steps");
    expect(promptPackageMarkdown).toContain("Human approval: Not required");
  });

  it("serializes route logs with stable CSV headers and escaped feedback notes", () => {
    const routeLogEntry = buildRouteLogEntry(buildRouteCard());
    const csv = serializeRouteLogsCsv([routeLogEntry]);

    expect(csv.split("\n")[0]).toBe(routeLogCsvHeaders.join(","));
    expect(csv).toContain(
      'route-log-export-fixture,task-export-fixture,route-card-export-fixture,route-export-fixture-balanced,balanced,edited,4,"Useful, but ""manual review"" was required.",2026-07-03T17:39:02-06:00',
    );
  });

  it("rejects malformed JSON imports with a recoverable actionable error", () => {
    expect(() => parseConfigurationJsonImport("{not-json")).toThrow(ExportImportValidationError);

    try {
      parseConfigurationJsonImport("{not-json");
    } catch (error) {
      expect(error).toMatchObject({
        name: "ExportImportValidationError",
        operation: "import",
        recoverable: true,
        issues: [
          {
            path: "$",
            code: "invalid_json",
          },
        ],
      });
      expect((error as Error).message).toContain("not valid JSON");
    }
  });

  it("rejects unknown schema versions before returning import data", () => {
    const artifact = JSON.parse(serializeConfigurationToJson(buildConfiguration(), { exportedAt }));
    artifact.schemaVersion = exportImportSchemaVersion + 1;

    expect(() => parseConfigurationJsonImport(JSON.stringify(artifact))).toThrow(ExportImportValidationError);

    try {
      parseConfigurationJsonImport(JSON.stringify(artifact));
    } catch (error) {
      expect(error).toMatchObject({
        operation: "import",
        recoverable: true,
        issues: [
          {
            path: "schemaVersion",
            code: "unsupported_version",
          },
        ],
      });
    }
  });

  it("rejects schema-invalid imports and unexpected artifact kinds", () => {
    const configurationArtifact = JSON.parse(serializeConfigurationToJson(buildConfiguration(), { exportedAt }));
    const routeRecordsArtifact = JSON.parse(serializeRouteRecordsToJson(buildRouteRecords(), { exportedAt }));

    configurationArtifact.configuration.modelInventory[1].id = configurationArtifact.configuration.modelInventory[0].id;

    expect(() => parseConfigurationJsonImport(JSON.stringify(configurationArtifact))).toThrow(ExportImportValidationError);
    expect(() => parseConfigurationJsonImport(JSON.stringify(routeRecordsArtifact))).toThrow(ExportImportValidationError);

    try {
      parseConfigurationJsonImport(JSON.stringify(configurationArtifact));
    } catch (error) {
      expect((error as ExportImportValidationError).issues.map((issue) => issue.path)).toContain("configuration.modelInventory.1.id");
    }

    try {
      parseConfigurationJsonImport(JSON.stringify(routeRecordsArtifact));
    } catch (error) {
      expect(error).toMatchObject({
        issues: [
          {
            path: "artifactKind",
            code: "unexpected_artifact_kind",
          },
        ],
      });
    }
  });

  it("does not add hidden telemetry or secret fields to exported artifacts", () => {
    const configurationArtifact = JSON.parse(serializeConfigurationToJson(buildConfiguration(), { exportedAt }));
    const routeRecordsArtifact = JSON.parse(serializeRouteRecordsToJson(buildRouteRecords(), { exportedAt }));
    const bundleArtifact = JSON.parse(
      serializeLocalExportBundleToJson(
        {
          configuration: buildConfiguration(),
          routeRecords: buildRouteRecords(),
        },
        { exportedAt },
      ),
    );

    for (const artifact of [configurationArtifact, routeRecordsArtifact, bundleArtifact]) {
      expect(artifact).not.toHaveProperty("telemetry");
      expect(artifact).not.toHaveProperty("analytics");
      expect(artifact).not.toHaveProperty("secret");
      expect(Object.keys(artifact).sort()).not.toContain("credentials");
    }
  });
});

function buildConfiguration(): ExportedLocalConfiguration {
  const localModel = {
    ...defaultModels[0],
    id: "local-export-model",
    label: "Local export model",
  } satisfies ModelInventoryItem;

  const webSource = {
    ...defaultSource("web"),
    id: "web-export-source",
    label: "Web export source",
  } satisfies SourcePermission;

  return {
    modelInventory: [localModel, defaultModels[1]],
    sourcePermissionRegistry: [webSource, defaultSources[0]],
    policySettings: [defaultPolicies[0], defaultPolicies[1], defaultPolicies[2]],
  };
}

function defaultSource(sourceId: string): SourcePermission {
  const source = defaultSources.find((candidate) => candidate.id === sourceId);

  if (!source) {
    throw new Error(`Missing source fixture '${sourceId}'.`);
  }

  return source;
}

function buildRouteRecords() {
  const routeCard = buildRouteCard();
  const routeLogEntry = buildRouteLogEntry(routeCard);

  return {
    routeCards: [routeCard],
    promptPackages: [routeCard.promptPackage],
    routeLogEntries: [routeLogEntry],
  };
}

function buildPromptPackage(): PromptPackage {
  return {
    id: "prompt-package-export-fixture",
    taskId: "task-export-fixture",
    title: "Prompt package: Export fixture",
    steps: [
      {
        id: "prompt-step-export-fixture",
        title: "Step 1: Draft Output",
        instruction: "Use this local prompt fixture manually. The app does not call tools.",
        inputRefs: ["task-export-fixture", "web-export-source"],
        expectedOutput: "A local draft fixture for export/import tests.",
        requiresHumanApproval: false,
      },
    ],
  };
}

function buildRouteCard(): RouteCard {
  const promptPackage = buildPromptPackage();

  return {
    id: "route-card-export-fixture",
    taskId: "task-export-fixture",
    title: "Route card: Export fixture",
    sensitivityClass: "public",
    recommendedOptionId: "route-export-fixture-balanced",
    options: [
      {
        id: "route-export-fixture-balanced",
        strategy: "balanced",
        label: "Balanced route",
        summary: "Use a balanced local route fixture without any external call.",
        score: 88,
        estimatedCostLevel: "medium",
        estimatedEffortLevel: "medium",
        steps: [
          {
            id: "route-export-fixture-balanced-step",
            kind: "model",
            label: "Draft locally",
            instruction: "Manually use the chosen tool outside the app.",
            requiredPermissionLevel: 1,
            modelId: "local-export-model",
            sourceIds: ["web-export-source"],
            warnings: [],
          },
        ],
        warnings: [],
      },
    ],
    stageGuidance: [
      {
        id: "stage-task-export-fixture-frame",
        stage: "frame",
        methodLabel: "Plan - Define",
        label: "Frame the job",
        purpose: "Clarify the goal and success bar before using a tool.",
        actions: ["Clarify the goal and success bar."],
        reviewChecks: ["The goal is clear."],
        recommendedModelLabel: "You first",
      },
      {
        id: "stage-task-export-fixture-create",
        stage: "create",
        methodLabel: "Do - Improve",
        label: "Draft the brief",
        purpose: "Use the recommended tool to create the first pass.",
        actions: ["Use the recommended tool to create the first pass."],
        reviewChecks: ["The draft answers the task."],
        recommendedModelId: "local-export-model",
        recommendedModelLabel: "Local export model",
        routeStepId: "route-export-fixture-balanced-step",
      },
    ],
    warnings: [],
    blockedRoutes: [],
    promptPackage,
    createdAt: "2026-07-03T17:38:53-06:00",
  };
}

function buildRouteLogEntry(routeCard: RouteCard): RouteLogEntry {
  return {
    id: "route-log-export-fixture",
    taskId: routeCard.taskId,
    routeCardId: routeCard.id,
    selectedOptionId: routeCard.recommendedOptionId,
    selectedStrategy: "balanced",
    outcome: "edited",
    feedback: {
      rating: 4,
      notes: 'Useful, but "manual review" was required.',
    },
    createdAt: "2026-07-03T17:39:02-06:00",
  };
}
