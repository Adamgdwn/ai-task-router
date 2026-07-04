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
const sourceComfortLevels = ["none", "public", "work", "confidential", "restricted"] as const;
type SourceComfortLevel = (typeof sourceComfortLevels)[number];
const shoppingPathSteps = [
  {
    screenId: "tool-inventory",
    eyebrow: "Aisle 1",
    title: "What AI tools do you already use?",
    body: "Pick the helpers already on your shelf. The app will not connect to them; it only remembers that you can use them.",
    buttonLabel: "Choose my tools",
  },
  {
    screenId: "source-permissions",
    eyebrow: "Aisle 2",
    title: "What information feels okay?",
    body: "Choose whether public info, pasted documents, work notes, or sensitive material can be considered.",
    buttonLabel: "Set info comfort",
  },
  {
    screenId: "policy-settings",
    eyebrow: "Aisle 3",
    title: "How should tradeoffs be handled?",
    body: "Tell the app whether today is about speed, balance, or best quality when the stakes are higher.",
    buttonLabel: "Pick choosing style",
  },
  {
    screenId: "task-intake",
    eyebrow: "Checkout",
    title: "What are you trying to get done?",
    body: "Describe the task and get a few practical options, plus copy-ready prompts you can use manually.",
    buttonLabel: "Describe my task",
  },
] as const;

type StartHereScreenProps = {
  definition: ScreenDefinition;
  onNavigate: (screenId: string) => void;
};

type SetupScreenProps = {
  definition: ScreenDefinition;
  setup: SetupConfigurationController;
};

export function StartHereScreen({ definition, onNavigate }: StartHereScreenProps) {
  return (
    <article className="screenPanel pathPanel">
      <ScreenHeader definition={definition} />

      <section className="marketPath" aria-label="Guided setup path">
        {shoppingPathSteps.map((step) => (
          <section className="pathStep" key={step.screenId} aria-labelledby={`${step.screenId}-path-heading`}>
            <span>{step.eyebrow}</span>
            <h3 id={`${step.screenId}-path-heading`}>{step.title}</h3>
            <p>{step.body}</p>
            <button onClick={() => onNavigate(step.screenId)} type="button">
              {step.buttonLabel}
            </button>
          </section>
        ))}
      </section>

      <section className="plainPromise" aria-labelledby="plain-promise-heading">
        <h3 id="plain-promise-heading">What this will and will not do</h3>
        <ul>
          <li>It helps choose a sensible AI path before you paste anything into a tool.</li>
          <li>It keeps choices and saved plans in this browser.</li>
          <li>It does not log in, connect accounts, search files, send prompts, or run AI for you.</li>
        </ul>
      </section>
    </article>
  );
}

export function ToolInventoryScreen({ definition, setup }: SetupScreenProps) {
  return (
    <SetupScreenLayout definition={definition} setup={setup}>
      <SetupBoundaryNote>
        Pick broad shelves, not technical model settings. This only records what you already have available; it does not
        connect accounts, check subscriptions, call providers, or store credentials.
      </SetupBoundaryNote>

      <section className="conversationCard" aria-labelledby="tool-quick-check-heading">
        <div>
          <p className="screenKicker">Quick shelf check</p>
          <h3 id="tool-quick-check-heading">Which helpers can you use today?</h3>
        </div>
        <p>
          Leave a shelf off if you do not have it, do not trust it, or simply do not want it considered for today's
          recommendations.
        </p>
      </section>

      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        setup={setup}
        title="Everyday AI helpers"
        tiers={["small"]}
      />
      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        setup={setup}
        title="Stronger paid helpers"
        tiers={["mid", "frontier"]}
      />
      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        setup={setup}
        title="Research, making, and final review"
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
        This is about comfort, not automatic access. The app does not scan files, search the web, or connect to GitHub,
        Microsoft 365, SharePoint, Google Drive, or anything else.
      </SetupBoundaryNote>

      <section className="conversationCard" aria-labelledby="information-comfort-heading">
        <div>
          <p className="screenKicker">Information comfort</p>
          <h3 id="information-comfort-heading">What kind of ingredients can go into a recommendation?</h3>
        </div>
        <p>
          Choose the highest comfort level for each information shelf. You can still decide task by task what to include.
        </p>
      </section>

      <div className="setupRecordList">
        {sourcePermissions.length === 0 ? (
          <EmptySetupState label="No information shelves are stored yet." />
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
        Pick the kind of advice you want most often. This changes recommendations only; it does not buy, connect, verify,
        or run any tool.
      </SetupBoundaryNote>

      <fieldset className="choiceCardGrid" disabled={setup.status === "saving"}>
        <legend>What should matter most?</legend>
        {policies.map((policy) => (
          <label className="choiceCardOption" key={policy.id}>
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
            <span>
              <strong>{friendlyPolicyLabel(policy)}</strong>
              <small>{friendlyPolicyDescription(policy)}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="comingLaterControl">
        <input disabled type="checkbox" />
        <span>
          Suggest a full AI toolkit for me
          <small>Coming later as recommendation-only planning. No subscriptions are purchased here.</small>
        </span>
      </label>

      <div className="setupRecordList">
        {policies.length === 0 ? (
          <EmptySetupState label="No choosing styles are stored yet." />
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
          {setup.activePolicy ? <span>Style: {friendlyPolicyLabel(setup.activePolicy)}</span> : null}
        </div>

        <div className="setupActions">
          <button disabled={busy} onClick={() => void setup.refresh()} type="button">
            Reload
          </button>
          <button disabled={busy} onClick={() => void setup.restoreDefaults()} type="button">
            Restore starter choices
          </button>
          <button disabled={!setup.dirty || busy} onClick={() => void setup.saveChanges()} type="button">
            Save my choices
          </button>
        </div>
      </div>

      {setup.errorMessage ? (
        <div className="setupAlert" role="alert">
          {setup.errorMessage}
        </div>
      ) : null}

      {setup.status === "loading" && !setup.configuration ? (
        <div className="loadingPanel">Loading your saved choices...</div>
      ) : null}

      {!setup.configuration && setup.status !== "loading" ? (
        <EmptySetupState label="Your saved choices could not be loaded." />
      ) : null}

      {setup.configuration ? <div className="setupContent">{children}</div> : null}
    </article>
  );
}

export function ScreenHeader({ definition }: { definition: ScreenDefinition }) {
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
  const useValue = model.enabled ? "yes" : "no";

  return (
    <section className="setupRecord" aria-labelledby={`${model.id}-title`}>
      <div className="recordHeader">
        <div>
          <h4 id={`${model.id}-title`}>{model.label}</h4>
          <p>{inventoryDescriptor(model)}</p>
        </div>
        <span className="recordPill">{model.enabled ? "Available" : "Not in use"}</span>
      </div>

      <div className="quickQuestionGrid">
        <label>
          <span>Should this shelf be considered?</span>
          <select
            aria-label={`Use ${model.label}`}
            onChange={(event) => onChange({ ...model, enabled: event.target.value === "yes" })}
            value={useValue}
          >
            <option value="yes">Yes, I can use this</option>
            <option value="no">No, leave this out</option>
          </select>
        </label>

        <label>
          <span>What should we call it?</span>
          <input
            aria-label={`Tool label for ${model.id}`}
            onChange={(event) => onChange({ ...model, label: event.target.value })}
            value={model.label}
          />
        </label>
      </div>

      <details className="advancedDrawer">
        <summary>Advanced routing details</summary>

        <div className="formGrid">
          <label>
            <span>Provider or subscription</span>
            <input
              aria-label={`Provider or subscription for ${model.id}`}
              onChange={(event) => onChange({ ...model, provider: event.target.value })}
              value={model.provider}
            />
          </label>
          <label>
            <span>Internal shelf</span>
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
            <span>Maximum information comfort</span>
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
          <label className="toggleField localOnlyToggle">
            <input
              checked={model.localOnly}
              onChange={(event) => onChange({ ...model, localOnly: event.target.checked })}
              type="checkbox"
            />
            <span>Local-only option</span>
          </label>
        </div>

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
      </details>
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
  const comfortValue = comfortLevelForSource(source);

  return (
    <section className="setupRecord" aria-labelledby={`${source.id}-title`}>
      <div className="recordHeader">
        <div>
          <h4 id={`${source.id}-title`}>{source.label}</h4>
          <p>{sourceComfortDescription(source)}</p>
        </div>
        <span className="recordPill">{comfortLabel(comfortValue)}</span>
      </div>

      <div className="quickQuestionGrid">
        <label>
          <span>How comfortable are you using this?</span>
          <select
            aria-label={`Information comfort for ${source.id}`}
            onChange={(event) => onChange(sourceFromComfortLevel(source, event.target.value as SourceComfortLevel))}
            value={comfortValue}
          >
            {sourceComfortLevels.map((level) => (
              <option key={level} value={level}>
                {comfortLabel(level)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>What should we call it?</span>
          <input
            aria-label={`Source label for ${source.id}`}
            onChange={(event) => onChange({ ...source, label: event.target.value })}
            value={source.label}
          />
        </label>
      </div>

      <details className="advancedDrawer">
        <summary>Advanced routing details</summary>

        <div className="formGrid compactFormGrid">
          <label>
            <span>Routing level</span>
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
            <span>Source type</span>
            <input aria-label={`Source type for ${source.id}`} readOnly value={source.sourceType} />
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

        <p className="advancedNote">{source.notes}</p>
      </details>
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
          <h4 id={`${policy.id}-title`}>{friendlyPolicyLabel(policy)}</h4>
          <p>{friendlyPolicyDescription(policy)}</p>
        </div>
        <span className="recordPill">{selected ? "Current style" : policy.strategy}</span>
      </div>

      <details className="advancedDrawer">
        <summary>Advanced routing details</summary>

        <div className="formGrid compactFormGrid">
          <label>
            <span>Internal style label</span>
            <input
              aria-label={`Policy label for ${policy.id}`}
              onChange={(event) => onChange({ ...policy, label: event.target.value })}
              value={policy.label}
            />
          </label>
          <label>
            <span>Internal description</span>
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
      </details>
    </section>
  );
}

function EmptySetupState({ label }: { label: string }) {
  return <p className="emptySetupState">{label}</p>;
}

function comfortLevelForSource(source: SourcePermission): SourceComfortLevel {
  if (source.permissionLevel === 0) {
    return "none";
  }

  if (source.permissionLevel >= 4 || source.sensitivityAllowed.includes("regulated") || source.sensitivityAllowed.includes("highly restricted")) {
    return "restricted";
  }

  if (source.permissionLevel >= 3 || source.sensitivityAllowed.includes("confidential")) {
    return "confidential";
  }

  if (source.permissionLevel >= 2 || source.sensitivityAllowed.includes("internal")) {
    return "work";
  }

  return "public";
}

function sourceFromComfortLevel(source: SourcePermission, comfortLevel: SourceComfortLevel): SourcePermission {
  const comfortSettings: Record<SourceComfortLevel, Pick<SourcePermission, "permissionLevel" | "sensitivityAllowed">> = {
    none: {
      permissionLevel: 0,
      sensitivityAllowed: ["public"],
    },
    public: {
      permissionLevel: 1,
      sensitivityAllowed: ["public", "public-facing risk"],
    },
    work: {
      permissionLevel: 2,
      sensitivityAllowed: ["public", "internal"],
    },
    confidential: {
      permissionLevel: 3,
      sensitivityAllowed: ["public", "internal", "confidential"],
    },
    restricted: {
      permissionLevel: 4,
      sensitivityAllowed: [...sensitivityClasses],
    },
  };

  return {
    ...source,
    ...comfortSettings[comfortLevel],
  };
}

function comfortLabel(comfortLevel: SourceComfortLevel) {
  switch (comfortLevel) {
    case "none":
      return "Do not use this";
    case "public":
      return "Public info only";
    case "work":
      return "Work/internal info is okay";
    case "confidential":
      return "Confidential info is okay";
    case "restricted":
      return "Sensitive info is okay";
  }
}

function sourceComfortDescription(source: SourcePermission) {
  const comfortLevel = comfortLevelForSource(source);

  if (comfortLevel === "none") {
    return "This shelf will be left out of recommendations.";
  }

  if (comfortLevel === "public") {
    return "Use this only for public or already-shareable information.";
  }

  if (comfortLevel === "work") {
    return "Use this for ordinary work context that is not confidential.";
  }

  if (comfortLevel === "confidential") {
    return "Use this when confidential context is acceptable for the task.";
  }

  return "Use this only when sensitive context is explicitly okay for the task.";
}

function friendlyPolicyLabel(policy: PolicyDefault) {
  if (policy.id === "least-resource") {
    return "Save time and cost";
  }

  if (policy.id === "quality-first") {
    return "Best quality when it matters";
  }

  return "Balanced for everyday work";
}

function friendlyPolicyDescription(policy: PolicyDefault) {
  if (policy.id === "least-resource") {
    return "Prefer the simplest good-enough option and avoid extra effort.";
  }

  if (policy.id === "quality-first") {
    return "Use stronger help and more review when mistakes would be expensive.";
  }

  return "Balance quality, speed, caution, and effort for normal work.";
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
    return "Good for quick, low-stakes drafts.";
  }

  if (model.tier === "mid" || model.tier === "frontier") {
    return "Useful when quality or reasoning matters more.";
  }

  if (model.tier === "human") {
    return "The final human check before anything important is used.";
  }

  if (model.tier === "research") {
    return "Useful when the task needs current facts or citations.";
  }

  if (model.tier === "artifact") {
    return "Useful for turning work into a document, table, or slide outline.";
  }

  return "A helper you control outside this app.";
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
