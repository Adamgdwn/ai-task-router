import { evaluateHardGates, type HardGateResult } from "../../domain/routing/hardGates";
import { defaultModels } from "../../domain/defaults/defaultModels";
import { defaultSources } from "../../domain/defaults/defaultSources";
import type { ModelInventoryItem, SourcePermission, TaskIntake } from "../../domain/types";

const createdAt = "2026-07-03T12:43:29-06:00";

function buildTask(overrides: Partial<TaskIntake> = {}): TaskIntake {
  const sourcePermissions = overrides.sourcePermissions ?? defaultSources;

  return {
    id: "task-hard-gates-001",
    title: "Prepare an internal planning brief",
    description: "Route a planning brief without taking any external action.",
    dmaicPhase: "define",
    lifecycleStage: "draft",
    knowledgeWorkType: "planning",
    outputType: "brief",
    qualityBar: "standard",
    sensitivityClass: "internal",
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

function getBlockedIds(result: HardGateResult, kind: "model" | "source", reasonCode: string) {
  const blocks = kind === "model" ? result.blockedModels : result.blockedSources;

  return blocks.filter((block) => block.reasonCode === reasonCode).map((block) => block.id);
}

describe("hard gates", () => {
  it("allows safe internal routes while blocking requested no-access sources", () => {
    const task = buildTask({
      sourcePermissions: defaultSources,
      requestedSourceIds: ["local-files", "uploaded-documents", "other-source"],
    });

    const result = evaluateHardGates({ task, models: defaultModels });

    expect(result.allowedSourceIds).toEqual(["local-files", "uploaded-documents"]);
    expect(getBlockedIds(result, "source", "source-no-access")).toEqual(["other-source"]);
    expect(result.blockedSources).toHaveLength(1);
    expect(result.allowedModelIds).toEqual([
      "manual-human-review",
      "user-mid-synthesis-model",
      "user-frontier-quality-model",
    ]);
    expect(result.requiresHumanApproval).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it("blocks sources that do not allow the task sensitivity class", () => {
    const task = buildTask({
      sensitivityClass: "confidential",
      requestedSourceIds: ["web", "github", "local-files"],
    });

    const result = evaluateHardGates({ task, models: defaultModels });

    expect(result.allowedSourceIds).toEqual(["local-files"]);
    expect(getBlockedIds(result, "source", "source-sensitivity-blocked")).toEqual(["web", "github"]);
    expect(result.blockedSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "web",
          reason: "Websites or web search does not allow confidential tasks.",
        }),
        expect.objectContaining({
          id: "github",
          reason: "GitHub or repo pages does not allow confidential tasks.",
        }),
      ]),
    );
  });

  it("blocks non-local model options for highly restricted tasks while preserving human review", () => {
    const localModel = {
      id: "local-confidential-model",
      label: "Local confidential model",
      provider: "Local inventory",
      tier: "mid",
      enabled: true,
      localOnly: true,
      capabilityScores: {
        reasoning: 4,
        writing: 4,
        coding: 2,
        research: 1,
        packaging: 3,
      },
      maxPermissionLevel: 4,
      requiresCredentials: false,
      requiresExternalCall: false,
    } satisfies ModelInventoryItem;
    const highlyRestrictedSource = {
      id: "secure-local-source",
      label: "Secure local source",
      sourceType: "local files",
      permissionLevel: 4,
      sensitivityAllowed: ["highly restricted"],
      requiresCredentials: false,
      requiresExternalCall: false,
    } satisfies SourcePermission;
    const task = buildTask({
      sensitivityClass: "highly restricted",
      qualityBar: "critical",
      sourcePermissions: [highlyRestrictedSource],
      requestedSourceIds: [highlyRestrictedSource.id],
    });

    const result = evaluateHardGates({ task, models: [...defaultModels, localModel] });

    expect(result.allowedModelIds).toEqual(["manual-human-review", "local-confidential-model"]);
    expect(getBlockedIds(result, "model", "highly-restricted-non-local")).toEqual([
      "user-free-small-model",
      "user-mid-synthesis-model",
      "user-frontier-quality-model",
      "user-research-tool",
      "user-artifact-tool",
    ]);
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        reasonCode: "human-approval-required",
      }),
    );
  });

  it("warns when current facts or citations lack allowed research support", () => {
    const task = buildTask({
      requiresCurrentFacts: true,
      requiresCitations: true,
      requestedSourceIds: ["local-files"],
    });

    const result = evaluateHardGates({ task, models: defaultModels });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        reasonCode: "research-context-missing",
      }),
    );
  });

  it("does not warn for current facts when an allowed web source and research-capable model are available", () => {
    const task = buildTask({
      sensitivityClass: "public",
      requiresCurrentFacts: true,
      requiresCitations: true,
      requestedSourceIds: ["web"],
    });

    const result = evaluateHardGates({ task, models: defaultModels });

    expect(result.allowedSourceIds).toEqual(["web"]);
    expect(result.allowedModelIds).toContain("user-research-tool");
    expect(result.warnings.some((warning) => warning.reasonCode === "research-context-missing")).toBe(false);
  });

  it.each([
    ["public-facing task", { publicFacing: true }],
    ["public-facing risk task", { sensitivityClass: "public-facing risk" }],
    ["regulated task", { sensitivityClass: "regulated" }],
    ["high quality task", { qualityBar: "high" }],
    ["critical quality task", { qualityBar: "critical" }],
  ] satisfies Array<[string, Partial<TaskIntake>]>)(
    "requires human approval for %s",
    (_label, overrides) => {
      const usesRegulatedSource = "sensitivityClass" in overrides && overrides.sensitivityClass === "regulated";
      const regulatedSource = {
        id: "regulated-source",
        label: "Regulated source",
        sourceType: "uploaded documents",
        permissionLevel: 3,
        sensitivityAllowed: ["regulated"],
        requiresCredentials: false,
        requiresExternalCall: false,
      } satisfies SourcePermission;
      const task = buildTask({
        sourcePermissions: usesRegulatedSource ? [regulatedSource] : defaultSources,
        requestedSourceIds: usesRegulatedSource ? [regulatedSource.id] : ["local-files"],
        ...overrides,
      });

      const result = evaluateHardGates({ task, models: defaultModels });

      expect(result.requiresHumanApproval).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          reasonCode: "human-approval-required",
        }),
      );
    },
  );

  it("returns stable output for repeated identical inputs", () => {
    const task = buildTask({
      publicFacing: true,
      requiresCitations: true,
      requestedSourceIds: ["web", "local-files", "other-source"],
    });

    const firstResult = evaluateHardGates({ task, models: defaultModels });
    const secondResult = evaluateHardGates({ task, models: defaultModels });

    expect(secondResult).toEqual(firstResult);
  });
});
