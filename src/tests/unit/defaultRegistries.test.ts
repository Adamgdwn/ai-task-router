import {
  modelInventoryItemSchema,
  policyDefaultSchema,
  routeStepSchema,
  sourcePermissionSchema,
  taskTemplateSchema,
} from "../../domain/schemas";
import { defaultModels } from "../../domain/defaults/defaultModels";
import { defaultFinalApprovalRouteStep, defaultPolicies } from "../../domain/defaults/defaultPolicies";
import { defaultSources } from "../../domain/defaults/defaultSources";
import { defaultTaskTemplates } from "../../domain/defaults/defaultTaskTemplates";

type SeedItem = {
  id: string;
  requiresCredentials?: boolean;
  requiresExternalCall?: boolean;
};

function duplicateIds(items: SeedItem[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  return [...duplicates];
}

function expectNoDuplicateIds(items: SeedItem[]) {
  expect(duplicateIds(items)).toEqual([]);
}

describe("default registries", () => {
  it("loads default models that validate against the model inventory schema", () => {
    for (const model of defaultModels) {
      expect(modelInventoryItemSchema.parse(model)).toEqual(model);
    }

    expectNoDuplicateIds(defaultModels);
  });

  it("gives each enabled model capability scores", () => {
    const enabledModels = defaultModels.filter((model) => model.enabled);

    expect(enabledModels.length).toBeGreaterThan(0);

    for (const model of enabledModels) {
      expect(model.capabilityScores).toEqual(
        expect.objectContaining({
          reasoning: expect.any(Number),
          writing: expect.any(Number),
          coding: expect.any(Number),
          research: expect.any(Number),
          packaging: expect.any(Number),
        }),
      );
    }
  });

  it("keeps human approval available as a final route step", () => {
    expect(routeStepSchema.parse(defaultFinalApprovalRouteStep)).toEqual(defaultFinalApprovalRouteStep);
    expect(defaultFinalApprovalRouteStep.kind).toBe("human review");
    expect(defaultFinalApprovalRouteStep.id).toBe("final-human-approval");
  });

  it("loads default source permissions for every planned source type", () => {
    for (const source of defaultSources) {
      expect(sourcePermissionSchema.parse(source)).toEqual(source);
    }

    expectNoDuplicateIds(defaultSources);
    expect(defaultSources.map((source) => source.sourceType).sort()).toEqual([
      "github",
      "google drive",
      "local files",
      "m365 sharepoint",
      "other",
      "personal memory",
      "uploaded documents",
      "web",
    ]);
  });

  it("loads least-resource, balanced, and quality-first policy defaults", () => {
    for (const policy of defaultPolicies) {
      expect(policyDefaultSchema.parse(policy)).toEqual(policy);
    }

    expectNoDuplicateIds(defaultPolicies);
    expect(defaultPolicies.map((policy) => policy.id).sort()).toEqual(["balanced", "least-resource", "quality-first"]);
  });

  it("loads task templates and only suggests known default sources", () => {
    const sourceIds = new Set(defaultSources.map((source) => source.id));

    for (const template of defaultTaskTemplates) {
      expect(taskTemplateSchema.parse(template)).toEqual(template);
      expect(template.suggestedSourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    }

    expectNoDuplicateIds(defaultTaskTemplates);
  });

  it("rejects duplicate IDs in any registry", () => {
    const duplicatedModels = [...defaultModels, { ...defaultModels[0] }];
    const duplicatedSources = [...defaultSources, { ...defaultSources[0] }];
    const duplicatedPolicies = [...defaultPolicies, { ...defaultPolicies[0] }];
    const duplicatedTemplates = [...defaultTaskTemplates, { ...defaultTaskTemplates[0] }];

    expect(duplicateIds(duplicatedModels)).toEqual([defaultModels[0].id]);
    expect(duplicateIds(duplicatedSources)).toEqual([defaultSources[0].id]);
    expect(duplicateIds(duplicatedPolicies)).toEqual([defaultPolicies[0].id]);
    expect(duplicateIds(duplicatedTemplates)).toEqual([defaultTaskTemplates[0].id]);
  });

  it("confirms no seed item requires credentials or external calls from the app", () => {
    const seedItems: SeedItem[] = [
      ...defaultModels,
      ...defaultSources,
      ...defaultPolicies,
      ...defaultTaskTemplates,
      defaultFinalApprovalRouteStep,
    ];

    for (const seedItem of seedItems) {
      expect(seedItem.requiresCredentials ?? false).toBe(false);
      expect(seedItem.requiresExternalCall ?? false).toBe(false);
    }
  });
});
