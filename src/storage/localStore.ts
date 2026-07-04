import Dexie, { type Table } from "dexie";
import { z } from "zod";
import { defaultModels } from "../domain/defaults/defaultModels";
import { defaultPolicies } from "../domain/defaults/defaultPolicies";
import { defaultSources } from "../domain/defaults/defaultSources";
import {
  modelInventoryItemSchema,
  policyDefaultIds,
  policyDefaultSchema,
  promptPackageSchema,
  routeCardSchema,
  routeLogEntrySchema,
  sourcePermissionSchema,
} from "../domain/schemas";
import type {
  ModelInventoryItem,
  PolicyDefault,
  PromptPackage,
  RouteCard,
  RouteLogEntry,
  SourcePermission,
} from "../domain/types";

export const localStoreDatabaseName = "ai-task-router-local-store";
export const localStoreSchemaVersion = 2;

export type LocalStoreTableName =
  | "modelInventory"
  | "sourcePermissions"
  | "policySettings"
  | "setupPreferences"
  | "routeCards"
  | "promptPackages"
  | "routeLogEntries";

export type LocalSetupPreferences = {
  id: "setup-preferences";
  activePolicyDefaultId: PolicyDefault["id"];
  preferredModelId?: ModelInventoryItem["id"];
};

export type LocalConfiguration = {
  modelInventory: ModelInventoryItem[];
  sourcePermissionRegistry: SourcePermission[];
  policySettings: PolicyDefault[];
};

export type LocalRouteRecords = {
  routeCards: RouteCard[];
  promptPackages: PromptPackage[];
  routeLogEntries: RouteLogEntry[];
};

export type LocalConfigurationSeedResult = {
  seeded: boolean;
  reason: "empty-configuration" | "existing-configuration" | "explicit-reseed";
  counts: {
    modelInventory: number;
    sourcePermissions: number;
    policySettings: number;
  };
};

export type LocalStoreValidationIssue = {
  path: string;
  message: string;
  code: string;
};

export type RouteLogFeedbackUpdate = {
  outcome: RouteLogEntry["outcome"];
  feedback?: RouteLogEntry["feedback"];
};

export const defaultSetupPreferences: LocalSetupPreferences = {
  id: "setup-preferences",
  activePolicyDefaultId: "balanced",
};

const setupPreferencesSchema = z
  .object({
    id: z.literal("setup-preferences"),
    activePolicyDefaultId: z.enum(policyDefaultIds),
    preferredModelId: z.string().trim().min(1).optional(),
  })
  .strict();

export class LocalStoreValidationError extends Error {
  readonly kind = "validation";
  readonly recoverable = true;

  constructor(
    readonly tableName: LocalStoreTableName,
    readonly issues: LocalStoreValidationIssue[],
  ) {
    super(`Local store data in '${tableName}' failed validation. Reset or reseed local data, then try again.`);
    this.name = "LocalStoreValidationError";
  }
}

export class LocalStoreRecordNotFoundError extends Error {
  readonly kind = "not-found";
  readonly recoverable = true;

  constructor(
    readonly tableName: LocalStoreTableName,
    readonly recordId: string,
  ) {
    super(`Local store record '${recordId}' was not found in '${tableName}'. Refresh local data and try again.`);
    this.name = "LocalStoreRecordNotFoundError";
  }
}

export class LocalStoreUnavailableError extends Error {
  readonly kind = "storage";
  readonly recoverable = true;

  constructor(
    readonly operation: string,
    readonly originalError: unknown,
  ) {
    super(`The local store could not ${operation}. Retry, reset local data, or continue without saved records.`);
    this.name = "LocalStoreUnavailableError";
  }
}

export class LocalStoreDatabase extends Dexie {
  modelInventory!: Table<ModelInventoryItem, string>;
  sourcePermissions!: Table<SourcePermission, string>;
  policySettings!: Table<PolicyDefault, string>;
  setupPreferences!: Table<LocalSetupPreferences, string>;
  routeCards!: Table<RouteCard, string>;
  promptPackages!: Table<PromptPackage, string>;
  routeLogEntries!: Table<RouteLogEntry, string>;

  constructor(databaseName = localStoreDatabaseName) {
    super(databaseName);

    this.version(1).stores({
      modelInventory: "id, enabled, tier",
      sourcePermissions: "id, sourceType, permissionLevel",
      policySettings: "id, strategy",
      routeCards: "id, taskId, recommendedOptionId, createdAt",
      promptPackages: "id, taskId",
      routeLogEntries: "id, taskId, routeCardId, selectedStrategy, outcome, createdAt",
    });

    this.version(localStoreSchemaVersion).stores({
      modelInventory: "id, enabled, tier",
      sourcePermissions: "id, sourceType, permissionLevel",
      policySettings: "id, strategy",
      setupPreferences: "id, activePolicyDefaultId",
      routeCards: "id, taskId, recommendedOptionId, createdAt",
      promptPackages: "id, taskId",
      routeLogEntries: "id, taskId, routeCardId, selectedStrategy, outcome, createdAt",
    });

    this.modelInventory = this.table("modelInventory");
    this.sourcePermissions = this.table("sourcePermissions");
    this.policySettings = this.table("policySettings");
    this.setupPreferences = this.table("setupPreferences");
    this.routeCards = this.table("routeCards");
    this.promptPackages = this.table("promptPackages");
    this.routeLogEntries = this.table("routeLogEntries");
  }
}

export class LocalStore {
  constructor(readonly database: LocalStoreDatabase = createLocalStoreDatabase()) {}

  async seedDefaultConfigurationIfEmpty(): Promise<LocalConfigurationSeedResult> {
    return withLocalStoreErrors("seed default configuration", async () => {
      if (await this.hasLocalConfiguration()) {
        return {
          seeded: false,
          reason: "existing-configuration",
          counts: await this.configurationCounts(),
        };
      }

      const modelInventory = validateRecordArray(defaultModels, "modelInventory", modelInventoryItemSchema);
      const sourcePermissions = validateRecordArray(defaultSources, "sourcePermissions", sourcePermissionSchema);
      const policySettings = validateRecordArray(defaultPolicies, "policySettings", policyDefaultSchema);

      await this.database.transaction(
        "rw",
        this.database.modelInventory,
        this.database.sourcePermissions,
        this.database.policySettings,
        this.database.setupPreferences,
        async () => {
          await this.database.modelInventory.bulkPut(modelInventory);
          await this.database.sourcePermissions.bulkPut(sourcePermissions);
          await this.database.policySettings.bulkPut(policySettings);
          await this.database.setupPreferences.put(defaultSetupPreferences);
        },
      );

      return {
        seeded: true,
        reason: "empty-configuration",
        counts: {
          modelInventory: modelInventory.length,
          sourcePermissions: sourcePermissions.length,
          policySettings: policySettings.length,
        },
      };
    });
  }

  async reseedDefaultConfiguration(): Promise<LocalConfigurationSeedResult> {
    return withLocalStoreErrors("reseed default configuration", async () => {
      const modelInventory = validateRecordArray(defaultModels, "modelInventory", modelInventoryItemSchema);
      const sourcePermissions = validateRecordArray(defaultSources, "sourcePermissions", sourcePermissionSchema);
      const policySettings = validateRecordArray(defaultPolicies, "policySettings", policyDefaultSchema);

      await this.database.transaction(
        "rw",
        this.database.modelInventory,
        this.database.sourcePermissions,
        this.database.policySettings,
        this.database.setupPreferences,
        async () => {
          await this.database.modelInventory.clear();
          await this.database.sourcePermissions.clear();
          await this.database.policySettings.clear();
          await this.database.setupPreferences.clear();
          await this.database.modelInventory.bulkPut(modelInventory);
          await this.database.sourcePermissions.bulkPut(sourcePermissions);
          await this.database.policySettings.bulkPut(policySettings);
          await this.database.setupPreferences.put(defaultSetupPreferences);
        },
      );

      return {
        seeded: true,
        reason: "explicit-reseed",
        counts: {
          modelInventory: modelInventory.length,
          sourcePermissions: sourcePermissions.length,
          policySettings: policySettings.length,
        },
      };
    });
  }

  async loadConfiguration(): Promise<LocalConfiguration> {
    return withLocalStoreErrors("load configuration", async () => {
      const [modelInventory, sourcePermissionRegistry, policySettings] = await Promise.all([
        loadValidatedTable(this.database.modelInventory, "modelInventory", modelInventoryItemSchema),
        loadValidatedTable(this.database.sourcePermissions, "sourcePermissions", sourcePermissionSchema),
        loadValidatedTable(this.database.policySettings, "policySettings", policyDefaultSchema),
      ]);

      return {
        modelInventory: orderBySeedThenLabel(modelInventory, defaultModelOrder),
        sourcePermissionRegistry: orderBySeedThenLabel(sourcePermissionRegistry, defaultSourceOrder),
        policySettings: orderBySeedThenLabel(policySettings, defaultPolicyOrder),
      };
    });
  }

  async saveModelInventory(modelInventory: ModelInventoryItem[]): Promise<ModelInventoryItem[]> {
    return this.replaceTable("save model inventory", this.database.modelInventory, "modelInventory", modelInventoryItemSchema, modelInventory);
  }

  async saveSourcePermissionRegistry(sourcePermissions: SourcePermission[]): Promise<SourcePermission[]> {
    return this.replaceTable(
      "save source permission registry",
      this.database.sourcePermissions,
      "sourcePermissions",
      sourcePermissionSchema,
      sourcePermissions,
    );
  }

  async savePolicySettings(policySettings: PolicyDefault[]): Promise<PolicyDefault[]> {
    return this.replaceTable("save policy settings", this.database.policySettings, "policySettings", policyDefaultSchema, policySettings);
  }

  async loadSetupPreferences(): Promise<LocalSetupPreferences> {
    return withLocalStoreErrors("load setup preferences", async () => {
      const storedPreferences = await this.database.setupPreferences.get(defaultSetupPreferences.id);

      if (!storedPreferences) {
        await this.database.setupPreferences.put(defaultSetupPreferences);

        return defaultSetupPreferences;
      }

      return validateRecord(storedPreferences, "setupPreferences", setupPreferencesSchema);
    });
  }

  async saveSetupPreferences(preferences: LocalSetupPreferences): Promise<LocalSetupPreferences> {
    return this.putRecord("save setup preferences", this.database.setupPreferences, "setupPreferences", setupPreferencesSchema, preferences);
  }

  async saveRouteCard(routeCard: RouteCard): Promise<RouteCard> {
    return withLocalStoreErrors("save route card", async () => {
      const validRouteCard = validateRecord(routeCard, "routeCards", routeCardSchema);
      const validPromptPackage = validateRecord(validRouteCard.promptPackage, "promptPackages", promptPackageSchema);

      await this.database.transaction(
        "rw",
        this.database.routeCards,
        this.database.promptPackages,
        async () => {
          await this.database.routeCards.put(validRouteCard);
          await this.database.promptPackages.put(validPromptPackage);
        },
      );

      return validRouteCard;
    });
  }

  async savePromptPackage(promptPackage: PromptPackage): Promise<PromptPackage> {
    return this.putRecord("save prompt package", this.database.promptPackages, "promptPackages", promptPackageSchema, promptPackage);
  }

  async loadRouteRecords(): Promise<LocalRouteRecords> {
    return withLocalStoreErrors("load route records", async () => {
      const [routeCards, promptPackages, routeLogEntries] = await Promise.all([
        loadValidatedTable(this.database.routeCards, "routeCards", routeCardSchema),
        loadValidatedTable(this.database.promptPackages, "promptPackages", promptPackageSchema),
        loadValidatedTable(this.database.routeLogEntries, "routeLogEntries", routeLogEntrySchema),
      ]);

      return {
        routeCards: orderNewestFirst(routeCards),
        promptPackages: orderById(promptPackages),
        routeLogEntries: orderNewestFirst(routeLogEntries),
      };
    });
  }

  async saveRouteLogEntry(routeLogEntry: RouteLogEntry): Promise<RouteLogEntry> {
    return this.putRecord("save route log entry", this.database.routeLogEntries, "routeLogEntries", routeLogEntrySchema, routeLogEntry);
  }

  async updateRouteLogFeedback(routeLogEntryId: string, update: RouteLogFeedbackUpdate): Promise<RouteLogEntry> {
    return withLocalStoreErrors("update route log feedback", async () => {
      const storedRouteLogEntry = await this.database.routeLogEntries.get(routeLogEntryId);

      if (!storedRouteLogEntry) {
        throw new LocalStoreRecordNotFoundError("routeLogEntries", routeLogEntryId);
      }

      const existingRouteLogEntry = validateRecord(storedRouteLogEntry, "routeLogEntries", routeLogEntrySchema);
      const updatedRouteLogEntry = validateRecord(
        {
          ...existingRouteLogEntry,
          outcome: update.outcome,
          feedback: update.feedback,
        },
        "routeLogEntries",
        routeLogEntrySchema,
      );

      await this.database.routeLogEntries.put(updatedRouteLogEntry);

      return updatedRouteLogEntry;
    });
  }

  async resetLocalStore(): Promise<void> {
    await withLocalStoreErrors("reset local store", async () => {
      await this.database.transaction(
        "rw",
        [
          this.database.modelInventory,
          this.database.sourcePermissions,
          this.database.policySettings,
          this.database.setupPreferences,
          this.database.routeCards,
          this.database.promptPackages,
          this.database.routeLogEntries,
        ],
        async () => {
          await Promise.all([
            this.database.modelInventory.clear(),
            this.database.sourcePermissions.clear(),
            this.database.policySettings.clear(),
            this.database.setupPreferences.clear(),
            this.database.routeCards.clear(),
            this.database.promptPackages.clear(),
            this.database.routeLogEntries.clear(),
          ]);
        },
      );
    });
  }

  close(): void {
    this.database.close();
  }

  async deleteDatabase(): Promise<void> {
    this.close();
    await Dexie.delete(this.database.name);
  }

  private async replaceTable<T extends { id: string }>(
    operation: string,
    table: Table<T, string>,
    tableName: LocalStoreTableName,
    schema: z.ZodType<T>,
    records: T[],
  ): Promise<T[]> {
    return withLocalStoreErrors(operation, async () => {
      const validRecords = validateRecordArray(records, tableName, schema);

      await this.database.transaction("rw", table, async () => {
        await table.clear();
        await table.bulkPut(validRecords);
      });

      return validRecords;
    });
  }

  private async putRecord<T extends { id: string }>(
    operation: string,
    table: Table<T, string>,
    tableName: LocalStoreTableName,
    schema: z.ZodType<T>,
    record: T,
  ): Promise<T> {
    return withLocalStoreErrors(operation, async () => {
      const validRecord = validateRecord(record, tableName, schema);
      await table.put(validRecord);

      return validRecord;
    });
  }

  private async hasLocalConfiguration(): Promise<boolean> {
    const counts = await this.configurationCounts();

    return counts.modelInventory > 0 || counts.sourcePermissions > 0 || counts.policySettings > 0;
  }

  private async configurationCounts() {
    const [modelInventory, sourcePermissions, policySettings] = await Promise.all([
      this.database.modelInventory.count(),
      this.database.sourcePermissions.count(),
      this.database.policySettings.count(),
    ]);

    return {
      modelInventory,
      sourcePermissions,
      policySettings,
    };
  }
}

export function createLocalStoreDatabase(databaseName = localStoreDatabaseName): LocalStoreDatabase {
  return new LocalStoreDatabase(databaseName);
}

export function createLocalStore(options: { databaseName?: string; database?: LocalStoreDatabase } = {}): LocalStore {
  return new LocalStore(options.database ?? createLocalStoreDatabase(options.databaseName));
}

async function loadValidatedTable<T extends { id: string }>(
  table: Table<T, string>,
  tableName: LocalStoreTableName,
  schema: z.ZodType<T>,
): Promise<T[]> {
  const records = await table.toArray();

  return validateRecordArray(records, tableName, schema);
}

function validateRecordArray<T extends { id: string }>(
  records: readonly unknown[],
  tableName: LocalStoreTableName,
  schema: z.ZodType<T>,
): T[] {
  const validRecords = records.map((record, recordIndex) => validateRecord(record, tableName, schema, recordIndex));
  assertUniqueRecordIds(validRecords, tableName);

  return validRecords;
}

function validateRecord<T extends { id: string }>(
  record: unknown,
  tableName: LocalStoreTableName,
  schema: z.ZodType<T>,
  recordIndex = 0,
): T {
  const result = schema.safeParse(record);

  if (!result.success) {
    throw new LocalStoreValidationError(
      tableName,
      result.error.issues.map((issue) => ({
        path: issuePath(recordIndex, issue.path),
        message: issue.message,
        code: issue.code,
      })),
    );
  }

  return result.data;
}

function assertUniqueRecordIds(records: readonly { id: string }[], tableName: LocalStoreTableName) {
  const seenIds = new Set<string>();
  const issues: LocalStoreValidationIssue[] = [];

  records.forEach((record, recordIndex) => {
    if (seenIds.has(record.id)) {
      issues.push({
        path: `[${recordIndex}].id`,
        message: `Duplicate local store record ID '${record.id}' is not allowed.`,
        code: "duplicate_id",
      });
    }

    seenIds.add(record.id);
  });

  if (issues.length > 0) {
    throw new LocalStoreValidationError(tableName, issues);
  }
}

function issuePath(recordIndex: number, issuePathSegments: readonly (string | number | symbol)[]) {
  if (issuePathSegments.length === 0) {
    return `[${recordIndex}]`;
  }

  return `[${recordIndex}].${issuePathSegments.map(String).join(".")}`;
}

async function withLocalStoreErrors<T>(operation: string, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (isLocalStoreError(error)) {
      throw error;
    }

    throw new LocalStoreUnavailableError(operation, error);
  }
}

function isLocalStoreError(error: unknown): error is LocalStoreValidationError | LocalStoreRecordNotFoundError {
  return error instanceof LocalStoreValidationError || error instanceof LocalStoreRecordNotFoundError;
}

const defaultModelOrder = orderMapFor(defaultModels);
const defaultSourceOrder = orderMapFor(defaultSources);
const defaultPolicyOrder = orderMapFor(defaultPolicies);

function orderMapFor(records: readonly { id: string }[]) {
  return new Map(records.map((record, index) => [record.id, index]));
}

function orderBySeedThenLabel<T extends { id: string; label: string }>(records: T[], seedOrder: Map<string, number>) {
  return [...records].sort((left, right) => {
    const leftOrder = seedOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = seedOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.label.localeCompare(right.label) || left.id.localeCompare(right.id);
  });
}

function orderNewestFirst<T extends { createdAt: string; id: string }>(records: T[]) {
  return [...records].sort((left, right) => {
    const dateComparison = right.createdAt.localeCompare(left.createdAt);

    return dateComparison || left.id.localeCompare(right.id);
  });
}

function orderById<T extends { id: string }>(records: T[]) {
  return [...records].sort((left, right) => left.id.localeCompare(right.id));
}
