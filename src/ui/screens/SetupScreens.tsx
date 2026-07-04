import type { ChangeEvent, ReactNode } from "react";
import { permissionLevels, sensitivityClasses } from "../../domain/schemas";
import type {
  CapabilityScores,
  ModelInventoryItem,
  PermissionLevel,
  PolicyDefault,
  ScoringWeights,
  SensitivityClass,
  SourcePermission,
} from "../../domain/types";
import type { LocalSetupPreferences } from "../../storage/localStore";
import type { SetupConfigurationController } from "../state/useSetupConfiguration";
import type { ScreenDefinition } from "./screenDefinitions";

const capabilityKeys = ["reasoning", "writing", "coding", "research", "packaging"] as const;
const scoringWeightKeys = ["cost", "energy", "quality", "speed", "sourceFit", "sensitivityFit"] as const;

type SetupScreenProps = {
  definition: ScreenDefinition;
  setup: SetupConfigurationController;
};

export function ToolInventoryScreen({ definition, setup }: SetupScreenProps) {
  return (
    <SetupScreenLayout definition={definition} setup={setup}>
      <SetupBoundaryNote>
        Tool inventory is descriptive. The router records which free agents and paid subscriptions the user already has,
        without account connection, verification, provider calls, or credential storage.
      </SetupBoundaryNote>

      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        setup={setup}
        title="Free agents"
        tiers={["small"]}
      />
      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        setup={setup}
        title="Paid subscriptions"
        tiers={["mid", "frontier"]}
      />
      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        setup={setup}
        title="Research, artifact, and review tools"
        tiers={["research", "artifact", "human"]}
      />
    </SetupScreenLayout>
  );
}

export function SourcePermissionsScreen({ definition, setup }: SetupScreenProps) {
  const sourcePermissions = setup.configuration?.sourcePermissionRegistry ?? [];

  return (
    <SetupScreenLayout definition={definition} setup={setup}>
      <SetupBoundaryNote>
        Source permissions are local routing assumptions only. The app does not scan files, search the web, or connect to
        GitHub, Microsoft 365, SharePoint, Google Drive, or any other external source.
      </SetupBoundaryNote>

      <div className="setupRecordList">
        {sourcePermissions.length === 0 ? (
          <EmptySetupState label="No source permissions are stored yet." />
        ) : (
          sourcePermissions.map((source) => (
            <SourcePermissionRow
              key={source.id}
              onChange={(updatedSource) =>
                setup.updateSourcePermissionRegistry(replaceRecord(sourcePermissions, updatedSource))
              }
              source={source}
            />
          ))
        )}
      </div>
    </SetupScreenLayout>
  );
}

export function PolicySettingsScreen({ definition, setup }: SetupScreenProps) {
  const policies = setup.configuration?.policySettings ?? [];

  return (
    <SetupScreenLayout definition={definition} setup={setup}>
      <SetupBoundaryNote>
        The selected policy default guides later local route scoring. Proposed best stack recommendations are a future
        planning mode only and do not buy, connect, or verify subscriptions.
      </SetupBoundaryNote>

      <fieldset className="segmentedControl" disabled={setup.status === "saving"}>
        <legend>Policy default</legend>
        {policies.map((policy) => (
          <label className="segmentedOption" key={policy.id}>
            <input
              checked={setup.preferences.activePolicyDefaultId === policy.id}
              name="active-policy-default"
              onChange={() =>
                setup.updateSetupPreferences({
                  ...setup.preferences,
                  activePolicyDefaultId: policy.id,
                })
              }
              type="radio"
            />
            <span>{policy.label}</span>
          </label>
        ))}
      </fieldset>

      <label className="comingLaterControl">
        <input disabled type="checkbox" />
        <span>
          Proposed best stack recommendations
          <small>Coming later as recommendation-only planning.</small>
        </span>
      </label>

      <div className="setupRecordList">
        {policies.length === 0 ? (
          <EmptySetupState label="No policy defaults are stored yet." />
        ) : (
          policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              onChange={(updatedPolicy) => setup.updatePolicySettings(replaceRecord(policies, updatedPolicy))}
              policy={policy}
              selected={setup.preferences.activePolicyDefaultId === policy.id}
            />
          ))
        )}
      </div>
    </SetupScreenLayout>
  );
}

export function PlaceholderScreen({ definition }: { definition: ScreenDefinition }) {
  return (
    <article className="screenPanel">
      <ScreenHeader definition={definition} />

      <div className="detailGrid">
        <section aria-labelledby="screen-purpose">
          <h3 id="screen-purpose">Purpose</h3>
          <p>{definition.purpose}</p>
        </section>

        <section aria-labelledby="screen-placeholder-state">
          <h3 id="screen-placeholder-state">Placeholder State</h3>
          <p>{definition.placeholderState}</p>
        </section>
      </div>
    </article>
  );
}

function SetupScreenLayout({ children, definition, setup }: SetupScreenProps & { children: ReactNode }) {
  const busy = setup.status === "loading" || setup.status === "saving";

  return (
    <article className="screenPanel setupPanel">
      <ScreenHeader definition={definition} />

      <div className="setupToolbar">
        <div aria-live="polite" className="setupStatus" role="status">
          <strong>{setup.statusMessage}</strong>
          {setup.dirty ? <span>Unsaved changes</span> : null}
          {setup.activePolicy ? <span>Default: {setup.activePolicy.label}</span> : null}
        </div>

        <div className="setupActions">
          <button disabled={busy} onClick={() => void setup.refresh()} type="button">
            Reload
          </button>
          <button disabled={busy} onClick={() => void setup.restoreDefaults()} type="button">
            Restore defaults
          </button>
          <button disabled={!setup.dirty || busy} onClick={() => void setup.saveChanges()} type="button">
            Save setup
          </button>
        </div>
      </div>

      {setup.errorMessage ? (
        <div className="setupAlert" role="alert">
          {setup.errorMessage}
        </div>
      ) : null}

      {setup.status === "loading" && !setup.configuration ? (
        <div className="loadingPanel">Loading local setup...</div>
      ) : null}

      {!setup.configuration && setup.status !== "loading" ? (
        <EmptySetupState label="Local setup could not be loaded." />
      ) : null}

      {setup.configuration ? <div className="setupContent">{children}</div> : null}
    </article>
  );
}

function ScreenHeader({ definition }: { definition: ScreenDefinition }) {
  return (
    <>
      <p className="screenKicker">{definition.stage}</p>
      <h2 id="screen-title">{definition.title}</h2>
      <p className="screenSummary">{definition.summary}</p>
    </>
  );
}

function SetupBoundaryNote({ children }: { children: ReactNode }) {
  return <p className="setupBoundaryNote">{children}</p>;
}

function InventoryGroup({
  models,
  setup,
  tiers,
  title,
}: {
  models: ModelInventoryItem[];
  setup: SetupConfigurationController;
  tiers: readonly ModelInventoryItem["tier"][];
  title: string;
}) {
  const groupedModels = models.filter((model) => tiers.includes(model.tier));

  return (
    <section className="setupGroup" aria-labelledby={domIdFor(title)}>
      <div className="groupHeader">
        <h3 id={domIdFor(title)}>{title}</h3>
        <span>{groupedModels.length} stored</span>
      </div>

      <div className="setupRecordList">
        {groupedModels.length === 0 ? (
          <EmptySetupState label={`No ${title.toLowerCase()} are stored yet.`} />
        ) : (
          groupedModels.map((model) => (
            <ModelInventoryRow
              key={model.id}
              model={model}
              onChange={(updatedModel) => setup.updateModelInventory(replaceRecord(models, updatedModel))}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ModelInventoryRow({
  model,
  onChange,
}: {
  model: ModelInventoryItem;
  onChange: (model: ModelInventoryItem) => void;
}) {
  return (
    <section className="setupRecord" aria-labelledby={`${model.id}-title`}>
      <div className="recordHeader">
        <div>
          <h4 id={`${model.id}-title`}>{model.label}</h4>
          <p>{inventoryDescriptor(model)}</p>
        </div>
        <label className="toggleField">
          <input checked={model.enabled} onChange={(event) => onChange({ ...model, enabled: event.target.checked })} type="checkbox" />
          <span>{model.enabled ? "Enabled" : "Disabled"}</span>
        </label>
      </div>

      <div className="formGrid">
        <label>
          <span>Tool label</span>
          <input
            aria-label={`Tool label for ${model.id}`}
            onChange={(event) => onChange({ ...model, label: event.target.value })}
            value={model.label}
          />
        </label>
        <label>
          <span>Provider or subscription</span>
          <input
            aria-label={`Provider or subscription for ${model.id}`}
            onChange={(event) => onChange({ ...model, provider: event.target.value })}
            value={model.provider}
          />
        </label>
        <label>
          <span>Tier</span>
          <select
            aria-label={`Tier for ${model.id}`}
            onChange={(event) => onChange({ ...model, tier: event.target.value as ModelInventoryItem["tier"] })}
            value={model.tier}
          >
            {["small", "mid", "frontier", "research", "artifact", "human"].map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Max permission</span>
          <select
            aria-label={`Max permission level for ${model.id}`}
            onChange={(event) =>
              onChange({
                ...model,
                maxPermissionLevel: Number(event.target.value) as PermissionLevel,
              })
            }
            value={model.maxPermissionLevel}
          >
            {permissionLevels.map((level) => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="toggleField localOnlyToggle">
        <input checked={model.localOnly} onChange={(event) => onChange({ ...model, localOnly: event.target.checked })} type="checkbox" />
        <span>Local-only option</span>
      </label>

      <div className="capabilityGrid" aria-label={`Capability assumptions for ${model.label}`}>
        {capabilityKeys.map((capabilityKey) => (
          <label key={capabilityKey}>
            <span>{capabilityLabel(capabilityKey)}</span>
            <input
              aria-label={`Capability ${capabilityKey} for ${model.id}`}
              max={5}
              min={0}
              onChange={(event) =>
                onChange({
                  ...model,
                  capabilityScores: {
                    ...model.capabilityScores,
                    [capabilityKey]: boundedNumber(event, 0, 5),
                  },
                })
              }
              step={1}
              type="number"
              value={model.capabilityScores[capabilityKey]}
            />
          </label>
        ))}
      </div>

      <label>
        <span>Notes</span>
        <textarea
          aria-label={`Notes for ${model.id}`}
          onChange={(event) => onChange({ ...model, notes: event.target.value })}
          rows={2}
          value={model.notes ?? ""}
        />
      </label>
    </section>
  );
}

function SourcePermissionRow({
  source,
  onChange,
}: {
  source: SourcePermission;
  onChange: (source: SourcePermission) => void;
}) {
  return (
    <section className="setupRecord" aria-labelledby={`${source.id}-title`}>
      <div className="recordHeader">
        <div>
          <h4 id={`${source.id}-title`}>{source.label}</h4>
          <p>{source.notes}</p>
        </div>
        <span className="recordPill">Level {source.permissionLevel}</span>
      </div>

      <div className="formGrid compactFormGrid">
        <label>
          <span>Permission level</span>
          <select
            aria-label={`Permission level for ${source.id}`}
            onChange={(event) =>
              onChange({
                ...source,
                permissionLevel: Number(event.target.value) as PermissionLevel,
              })
            }
            value={source.permissionLevel}
          >
            {permissionLevels.map((level) => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Source label</span>
          <input
            aria-label={`Source label for ${source.id}`}
            onChange={(event) => onChange({ ...source, label: event.target.value })}
            value={source.label}
          />
        </label>
      </div>

      <fieldset className="checkboxGrid">
        <legend>Sensitivity allowances</legend>
        {sensitivityClasses.map((sensitivityClass) => {
          const checked = source.sensitivityAllowed.includes(sensitivityClass);
          const onlyChecked = checked && source.sensitivityAllowed.length === 1;

          return (
            <label key={sensitivityClass}>
              <input
                checked={checked}
                disabled={onlyChecked}
                onChange={() => onChange(toggleSensitivity(source, sensitivityClass))}
                type="checkbox"
              />
              <span>{sensitivityClass}</span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}

function PolicyCard({
  policy,
  selected,
  onChange,
}: {
  policy: PolicyDefault;
  selected: boolean;
  onChange: (policy: PolicyDefault) => void;
}) {
  return (
    <section className={selected ? "setupRecord selectedRecord" : "setupRecord"} aria-labelledby={`${policy.id}-title`}>
      <div className="recordHeader">
        <div>
          <h4 id={`${policy.id}-title`}>{policy.label}</h4>
          <p>{policy.description}</p>
        </div>
        <span className="recordPill">{policy.strategy}</span>
      </div>

      <div className="formGrid compactFormGrid">
        <label>
          <span>Policy label</span>
          <input
            aria-label={`Policy label for ${policy.id}`}
            onChange={(event) => onChange({ ...policy, label: event.target.value })}
            value={policy.label}
          />
        </label>
        <label>
          <span>Description</span>
          <input
            aria-label={`Policy description for ${policy.id}`}
            onChange={(event) => onChange({ ...policy, description: event.target.value })}
            value={policy.description}
          />
        </label>
      </div>

      <div className="weightGrid" aria-label={`Scoring weights for ${policy.label}`}>
        {scoringWeightKeys.map((weightKey) => (
          <label key={weightKey}>
            <span>{weightLabel(weightKey)}</span>
            <input
              aria-label={`Weight ${weightKey} for ${policy.id}`}
              max={1}
              min={0}
              onChange={(event) =>
                onChange({
                  ...policy,
                  scoringWeights: {
                    ...policy.scoringWeights,
                    [weightKey]: boundedNumber(event, 0, 1),
                  },
                })
              }
              step={0.01}
              type="number"
              value={policy.scoringWeights[weightKey]}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function EmptySetupState({ label }: { label: string }) {
  return <p className="emptySetupState">{label}</p>;
}

function replaceRecord<T extends { id: string }>(records: readonly T[], updatedRecord: T): T[] {
  return records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record));
}

function toggleSensitivity(source: SourcePermission, sensitivityClass: SensitivityClass): SourcePermission {
  if (source.sensitivityAllowed.includes(sensitivityClass)) {
    if (source.sensitivityAllowed.length === 1) {
      return source;
    }

    return {
      ...source,
      sensitivityAllowed: source.sensitivityAllowed.filter((currentClass) => currentClass !== sensitivityClass),
    };
  }

  return {
    ...source,
    sensitivityAllowed: [...source.sensitivityAllowed, sensitivityClass],
  };
}

function boundedNumber(event: ChangeEvent<HTMLInputElement>, min: number, max: number) {
  const parsedValue = Number(event.target.value);

  if (!Number.isFinite(parsedValue)) {
    return min;
  }

  return Math.min(max, Math.max(min, parsedValue));
}

function inventoryDescriptor(model: ModelInventoryItem) {
  if (model.tier === "small") {
    return "Free agent field";
  }

  if (model.tier === "mid" || model.tier === "frontier") {
    return "Paid subscription field";
  }

  if (model.tier === "human") {
    return "Manual review path";
  }

  return "User-controlled tool field";
}

function domIdFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function capabilityLabel(capabilityKey: keyof CapabilityScores) {
  return capabilityKey === "packaging" ? "Packaging" : capitalize(capabilityKey);
}

function weightLabel(weightKey: keyof ScoringWeights) {
  if (weightKey === "sourceFit") {
    return "Source fit";
  }

  if (weightKey === "sensitivityFit") {
    return "Sensitivity fit";
  }

  return capitalize(weightKey);
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
