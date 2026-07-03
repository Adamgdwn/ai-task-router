import { defaultModels } from "../../domain/defaults/defaultModels";
import { defaultPolicies } from "../../domain/defaults/defaultPolicies";
import { defaultSources } from "../../domain/defaults/defaultSources";
import type { ModelInventoryItem, PromptPackage, RouteCard, RouteLogEntry } from "../../domain/types";
import {
  createLocalStore,
  createLocalStoreDatabase,
  LocalStoreRecordNotFoundError,
  LocalStoreValidationError,
  type LocalStore,
  type LocalStoreDatabase,
} from "../../storage/localStore";

let databaseCounter = 0;
let store: LocalStore;
let database: LocalStoreDatabase;

beforeEach(() => {
  databaseCounter += 1;
  database = createLocalStoreDatabase(`ai-task-router-storage-test-${databaseCounter}`);
  store = createLocalStore({ database });
});

afterEach(async () => {
  await store.deleteDatabase();
});

describe("local store", () => {
  it("seeds default configuration only when no local user configuration exists", async () => {
    const firstSeed = await store.seedDefaultConfigurationIfEmpty();
    const configuration = await store.loadConfiguration();
    const secondSeed = await store.seedDefaultConfigurationIfEmpty();

    expect(firstSeed).toEqual({
      seeded: true,
      reason: "empty-configuration",
      counts: {
        modelInventory: defaultModels.length,
        sourcePermissions: defaultSources.length,
        policySettings: defaultPolicies.length,
      },
    });
    expect(configuration.modelInventory).toEqual(defaultModels);
    expect(configuration.sourcePermissionRegistry).toEqual(defaultSources);
    expect(configuration.policySettings).toEqual(defaultPolicies);
    expect(secondSeed).toMatchObject({
      seeded: false,
      reason: "existing-configuration",
    });
  });

  it("does not overwrite a user configuration when seed defaults is called later", async () => {
    const customModel = {
      ...defaultModels[0],
      id: "custom-local-review",
      label: "Custom local review",
    } satisfies ModelInventoryItem;

    await store.saveModelInventory([customModel]);
    const seedResult = await store.seedDefaultConfigurationIfEmpty();
    const configuration = await store.loadConfiguration();

    expect(seedResult).toMatchObject({
      seeded: false,
      reason: "existing-configuration",
    });
    expect(configuration.modelInventory).toEqual([customModel]);
    expect(configuration.sourcePermissionRegistry).toEqual([]);
    expect(configuration.policySettings).toEqual([]);
  });

  it("saves, loads, updates, and resets local route records", async () => {
    const routeCard = buildRouteCard();
    const routeLogEntry = buildRouteLogEntry(routeCard);

    await store.saveRouteCard(routeCard);
    await store.saveRouteLogEntry(routeLogEntry);
    const updatedLogEntry = await store.updateRouteLogFeedback(routeLogEntry.id, {
      outcome: "edited",
      feedback: {
        rating: 4,
        notes: "Route was useful after a small source change.",
      },
    });
    const routeRecords = await store.loadRouteRecords();

    expect(updatedLogEntry).toMatchObject({
      id: routeLogEntry.id,
      outcome: "edited",
      feedback: {
        rating: 4,
        notes: "Route was useful after a small source change.",
      },
    });
    expect(routeRecords.routeCards).toEqual([routeCard]);
    expect(routeRecords.promptPackages).toEqual([routeCard.promptPackage]);
    expect(routeRecords.routeLogEntries).toEqual([updatedLogEntry]);

    await store.resetLocalStore();

    expect(await store.loadConfiguration()).toEqual({
      modelInventory: [],
      sourcePermissionRegistry: [],
      policySettings: [],
    });
    expect(await store.loadRouteRecords()).toEqual({
      routeCards: [],
      promptPackages: [],
      routeLogEntries: [],
    });
  });

  it("reseed default configuration replaces configuration tables without deleting route records", async () => {
    const routeCard = buildRouteCard();
    const customModel = {
      ...defaultModels[0],
      id: "custom-before-reseed",
      label: "Custom before reseed",
    } satisfies ModelInventoryItem;

    await store.saveModelInventory([customModel]);
    await store.saveRouteCard(routeCard);

    const reseedResult = await store.reseedDefaultConfiguration();
    const configuration = await store.loadConfiguration();
    const routeRecords = await store.loadRouteRecords();

    expect(reseedResult.seeded).toBe(true);
    expect(reseedResult.reason).toBe("explicit-reseed");
    expect(configuration.modelInventory).toEqual(defaultModels);
    expect(configuration.sourcePermissionRegistry).toEqual(defaultSources);
    expect(configuration.policySettings).toEqual(defaultPolicies);
    expect(routeRecords.routeCards).toEqual([routeCard]);
  });

  it("validates saved configuration records before they enter IndexedDB", async () => {
    await expect(
      store.saveModelInventory([
        {
          ...defaultModels[0],
          id: "duplicate-model",
        },
        {
          ...defaultModels[1],
          id: "duplicate-model",
        },
      ]),
    ).rejects.toMatchObject({
      name: "LocalStoreValidationError",
      tableName: "modelInventory",
      recoverable: true,
    });
  });

  it("surfaces corrupt stored records as recoverable validation failures on load", async () => {
    await database.table("modelInventory").put({
      id: "corrupt-model",
      label: "Corrupt model",
    });

    await expect(store.loadConfiguration()).rejects.toBeInstanceOf(LocalStoreValidationError);

    try {
      await store.loadConfiguration();
    } catch (error) {
      expect(error).toMatchObject({
        recoverable: true,
        tableName: "modelInventory",
      });
      expect(error).toBeInstanceOf(LocalStoreValidationError);
      expect((error as LocalStoreValidationError).issues.map((issue) => issue.path)).toEqual(
        expect.arrayContaining(["[0].provider", "[0].tier", "[0].enabled"]),
      );
    }
  });

  it("returns a recoverable not-found error when updating missing route log feedback", async () => {
    await expect(
      store.updateRouteLogFeedback("missing-log-entry", {
        outcome: "deferred",
      }),
    ).rejects.toBeInstanceOf(LocalStoreRecordNotFoundError);
  });
});

function buildPromptPackage(): PromptPackage {
  return {
    id: "prompt-package-storage-fixture",
    taskId: "task-storage-fixture",
    title: "Prompt package: Storage fixture",
    steps: [
      {
        id: "prompt-step-storage-fixture",
        title: "Step 1: Draft Output",
        instruction: "Use this local prompt fixture manually. The app does not call tools.",
        inputRefs: ["task-storage-fixture", "web"],
        expectedOutput: "A local draft fixture for storage tests.",
        requiresHumanApproval: false,
      },
    ],
  };
}

function buildRouteCard(): RouteCard {
  const promptPackage = buildPromptPackage();

  return {
    id: "route-card-storage-fixture",
    taskId: "task-storage-fixture",
    title: "Route card: Storage fixture",
    sensitivityClass: "public",
    recommendedOptionId: "route-storage-fixture-balanced",
    options: [
      {
        id: "route-storage-fixture-balanced",
        strategy: "balanced",
        label: "Balanced route",
        summary: "Use a balanced local route fixture without any external call.",
        score: 88,
        estimatedCostLevel: "medium",
        estimatedEffortLevel: "medium",
        steps: [
          {
            id: "route-storage-fixture-balanced-step",
            kind: "model",
            label: "Draft locally",
            instruction: "Manually use the chosen tool outside the app.",
            requiredPermissionLevel: 1,
            modelId: "user-mid-synthesis-model",
            sourceIds: ["web"],
            warnings: [],
          },
        ],
        warnings: [],
      },
    ],
    warnings: [],
    blockedRoutes: [],
    promptPackage,
    createdAt: "2026-07-03T17:13:33-06:00",
  };
}

function buildRouteLogEntry(routeCard: RouteCard): RouteLogEntry {
  return {
    id: "route-log-storage-fixture",
    taskId: routeCard.taskId,
    routeCardId: routeCard.id,
    selectedOptionId: routeCard.recommendedOptionId,
    selectedStrategy: "balanced",
    outcome: "accepted",
    createdAt: "2026-07-03T17:14:02-06:00",
  };
}
