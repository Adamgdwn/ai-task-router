import { useCallback, useEffect, useMemo, useState } from "react";
import type { ModelInventoryItem, PolicyDefault, SourcePermission } from "../../domain/types";
import {
  defaultSetupPreferences,
  type LocalConfiguration,
  type LocalSetupPreferences,
  type LocalStore,
} from "../../storage/localStore";

type SetupConfigurationDraft = {
  configuration: LocalConfiguration;
  preferences: LocalSetupPreferences;
};

export type SetupConfigurationStatus = "loading" | "ready" | "saving" | "error";

export type SetupConfigurationController = {
  status: SetupConfigurationStatus;
  configuration: LocalConfiguration | null;
  preferences: LocalSetupPreferences;
  dirty: boolean;
  statusMessage: string;
  errorMessage: string | null;
  activePolicy: PolicyDefault | null;
  refresh: () => Promise<void>;
  saveChanges: () => Promise<void>;
  restoreDefaults: () => Promise<void>;
  updateModelInventory: (modelInventory: ModelInventoryItem[]) => void;
  updateSourcePermissionRegistry: (sourcePermissionRegistry: SourcePermission[]) => void;
  updatePolicySettings: (policySettings: PolicyDefault[]) => void;
  updateSetupPreferences: (preferences: LocalSetupPreferences) => void;
};

export function useSetupConfiguration(store: LocalStore): SetupConfigurationController {
  const [draft, setDraft] = useState<SetupConfigurationDraft | null>(null);
  const [status, setStatus] = useState<SetupConfigurationStatus>("loading");
  const [dirty, setDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading your saved choices.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setStatusMessage("Loading your saved choices.");

    try {
      await store.seedDefaultConfigurationIfEmpty();

      const [configuration, preferences] = await Promise.all([
        store.loadConfiguration(),
        store.loadSetupPreferences(),
      ]);

      setDraft({
        configuration,
        preferences: normalizeSetupPreferences(preferences, configuration.policySettings),
      });
      setDirty(false);
      setStatus("ready");
      setStatusMessage("Your choices are ready.");
    } catch (error) {
      setStatus("error");
      setErrorMessage(setupErrorMessage(error));
      setStatusMessage("Your saved choices are unavailable.");
    }
  }, [store]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveChanges = useCallback(async () => {
    if (!draft) {
      return;
    }

    if (!draft.configuration.policySettings.some((policy) => policy.id === draft.preferences.activePolicyDefaultId)) {
      setStatus("error");
      setErrorMessage("Choose an available deciding style before saving your choices.");
      setStatusMessage("Your choices were not saved.");
      return;
    }

    setStatus("saving");
    setErrorMessage(null);
    setStatusMessage("Saving your choices.");

    try {
      const [modelInventory, sourcePermissionRegistry, policySettings, preferences] = await Promise.all([
        store.saveModelInventory(draft.configuration.modelInventory),
        store.saveSourcePermissionRegistry(draft.configuration.sourcePermissionRegistry),
        store.savePolicySettings(draft.configuration.policySettings),
        store.saveSetupPreferences(draft.preferences),
      ]);

      setDraft({
        configuration: {
          modelInventory,
          sourcePermissionRegistry,
          policySettings,
        },
        preferences,
      });
      setDirty(false);
      setStatus("ready");
      setStatusMessage("Your choices were saved on this device.");
    } catch (error) {
      setStatus("error");
      setErrorMessage(setupErrorMessage(error));
      setStatusMessage("Your choices were not saved.");
    }
  }, [draft, store]);

  const restoreDefaults = useCallback(async () => {
    setStatus("saving");
    setErrorMessage(null);
    setStatusMessage("Restoring starter choices.");

    try {
      await store.reseedDefaultConfiguration();

      const [configuration, preferences] = await Promise.all([
        store.loadConfiguration(),
        store.loadSetupPreferences(),
      ]);

      setDraft({
        configuration,
        preferences: normalizeSetupPreferences(preferences, configuration.policySettings),
      });
      setDirty(false);
      setStatus("ready");
      setStatusMessage("Starter choices restored.");
    } catch (error) {
      setStatus("error");
      setErrorMessage(setupErrorMessage(error));
      setStatusMessage("Starter choices were not restored.");
    }
  }, [store]);

  const updateDraft = useCallback((update: (currentDraft: SetupConfigurationDraft) => SetupConfigurationDraft) => {
    setDirty(true);
    setErrorMessage(null);
    setStatus((currentStatus) => (currentStatus === "loading" ? currentStatus : "ready"));
    setStatusMessage("You have unsaved choices.");
    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      return update(currentDraft);
    });
  }, []);

  const updateModelInventory = useCallback(
    (modelInventory: ModelInventoryItem[]) => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        configuration: {
          ...currentDraft.configuration,
          modelInventory,
        },
      }));
    },
    [updateDraft],
  );

  const updateSourcePermissionRegistry = useCallback(
    (sourcePermissionRegistry: SourcePermission[]) => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        configuration: {
          ...currentDraft.configuration,
          sourcePermissionRegistry,
        },
      }));
    },
    [updateDraft],
  );

  const updatePolicySettings = useCallback(
    (policySettings: PolicyDefault[]) => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        configuration: {
          ...currentDraft.configuration,
          policySettings,
        },
        preferences: normalizeSetupPreferences(currentDraft.preferences, policySettings),
      }));
    },
    [updateDraft],
  );

  const updateSetupPreferences = useCallback(
    (preferences: LocalSetupPreferences) => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        preferences: normalizeSetupPreferences(preferences, currentDraft.configuration.policySettings),
      }));
    },
    [updateDraft],
  );

  const activePolicy = useMemo(() => {
    if (!draft) {
      return null;
    }

    return (
      draft.configuration.policySettings.find((policy) => policy.id === draft.preferences.activePolicyDefaultId) ??
      null
    );
  }, [draft]);

  return {
    status,
    configuration: draft?.configuration ?? null,
    preferences: draft?.preferences ?? defaultSetupPreferences,
    dirty,
    statusMessage,
    errorMessage,
    activePolicy,
    refresh,
    saveChanges,
    restoreDefaults,
    updateModelInventory,
    updateSourcePermissionRegistry,
    updatePolicySettings,
    updateSetupPreferences,
  };
}

function normalizeSetupPreferences(
  preferences: LocalSetupPreferences,
  policySettings: readonly PolicyDefault[],
): LocalSetupPreferences {
  const availablePolicyIds = new Set(policySettings.map((policy) => policy.id));

  if (availablePolicyIds.has(preferences.activePolicyDefaultId)) {
    return preferences;
  }

  const fallbackPolicy =
    policySettings.find((policy) => policy.id === defaultSetupPreferences.activePolicyDefaultId) ??
    policySettings[0];

  return {
    ...preferences,
    activePolicyDefaultId: fallbackPolicy?.id ?? defaultSetupPreferences.activePolicyDefaultId,
  };
}

function setupErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Your saved choices could not be loaded or saved. Refresh and try again.";
}
