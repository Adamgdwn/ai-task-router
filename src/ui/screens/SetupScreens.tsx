import { useState, type ChangeEvent, type ReactNode } from "react";
import { permissionLevels, sensitivityClasses } from "../../domain/schemas";
import {
  applyEverydayToolSelection,
  everydayToolFrequencyRank,
  everydayToolProviders,
  everydayToolSummary,
  getEverydayToolProvider,
  inferEverydayToolSelection,
  isEverydayToolSelected,
  type EverydayToolAccountId,
  type EverydayToolFrequencyId,
  type EverydayToolProviderId,
} from "../../domain/defaults/everydayToolCatalog";
import type {
  ModelInventoryItem,
  PermissionLevel,
  PolicyDefault,
  ScoringWeights,
  SensitivityClass,
  SourcePermission,
} from "../../domain/types";
import type { SetupConfigurationController } from "../state/useSetupConfiguration";
import type { ScreenDefinition } from "./screenDefinitions";

const scoringWeightKeys = ["cost", "energy", "quality", "speed", "sourceFit", "sensitivityFit"] as const;
const sourceComfortLevels = ["none", "public", "work", "confidential", "restricted"] as const;
type SourceComfortLevel = (typeof sourceComfortLevels)[number];
const visibleSourceComfortLevels = sourceComfortLevels.filter((level) => level !== "none");
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
    title: "What should be included?",
    body: "Choose whether public info, pasted documents, work notes, or sensitive material can be considered.",
    buttonLabel: "Choose what to include",
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
        Add one AI app at a time. Pick the app, the account level you use, and how often you reach for it. Use Add
        another tool only when you want another row. The app does not sign in, verify paid plans, call providers, or
        store credentials.
      </SetupBoundaryNote>

      <section className="conversationCard" aria-labelledby="tool-quick-check-heading">
        <div>
          <p className="screenKicker">Quick shelf check</p>
          <h3 id="tool-quick-check-heading">What do you actually click when you use AI?</h3>
        </div>
        <p>
          Start with the first app you recognize. When you genuinely want another one, use the add button below the
          selection.
        </p>
      </section>

      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        setup={setup}
        title="AI apps on my screen"
      />
    </SetupScreenLayout>
  );
}

export function SourcePermissionsScreen({ definition, setup }: SetupScreenProps) {
  const sourcePermissions = setup.configuration?.sourcePermissionRegistry ?? [];

  return (
    <SetupScreenLayout definition={definition} setup={setup}>
      <SetupBoundaryNote>
        Pick the sites, drives, folders, documents, and personal context you may want included in recommendations. The
        app still does not open, scan, upload, search, or connect to any of them.
      </SetupBoundaryNote>

      <section className="conversationCard" aria-labelledby="information-comfort-heading">
        <div>
          <p className="screenKicker">Information to include</p>
          <h3 id="information-comfort-heading">What should the app be allowed to consider?</h3>
        </div>
        <p>
          Turn on the places you may consult yourself, then choose the plain privacy level that best describes them.
          You can still narrow this down for each task.
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
  title,
}: {
  models: ModelInventoryItem[];
  setup: SetupConfigurationController;
  title: string;
}) {
  const toolSlots = models.filter((model) => model.id !== "manual-human-review");
  const [extraEmptyRows, setExtraEmptyRows] = useState(0);
  const selectedCount = toolSlots.filter(isEverydayToolSelected).length;
  const emptySlotCount = toolSlots.length - selectedCount;
  const emptyRowsToShow = selectedCount === 0 ? 1 : extraEmptyRows;
  const visibleModels = visibleToolRows(toolSlots, emptyRowsToShow);
  const canAddAnotherTool = emptySlotCount > emptyRowsToShow;

  function updateToolSlot(updatedModel: ModelInventoryItem) {
    const currentModel = models.find((model) => model.id === updatedModel.id);
    const rowBecameSelected =
      currentModel !== undefined && !isEverydayToolSelected(currentModel) && isEverydayToolSelected(updatedModel);
    const nextModels = replaceRecord(models, updatedModel);

    if (rowBecameSelected) {
      setExtraEmptyRows((currentRows) => Math.max(0, currentRows - 1));
    }

    setup.updateModelInventory(nextModels);
    setup.updateSetupPreferences({
      ...setup.preferences,
      preferredModelId: preferredToolIdFromFrequency(nextModels),
    });
  }

  function addToolRow() {
    if (!canAddAnotherTool) {
      return;
    }

    setExtraEmptyRows((currentRows) => currentRows + 1);
  }

  function removeToolRow(model: ModelInventoryItem) {
    if (!isEverydayToolSelected(model)) {
      setExtraEmptyRows((currentRows) => Math.max(0, currentRows - 1));
      return;
    }

    const nextModels = replaceRecord(
      models,
      applyEverydayToolSelection(model, {
        providerId: "none",
      }),
    );

    setup.updateModelInventory(nextModels);
    setup.updateSetupPreferences({
      ...setup.preferences,
      preferredModelId: preferredToolIdFromFrequency(nextModels),
    });
  }

  return (
    <section className="setupGroup" aria-labelledby={domIdFor(title)}>
      <div className="groupHeader">
        <h3 id={domIdFor(title)}>{title}</h3>
        <span>{selectedCount} selected</span>
      </div>

      <div className="setupRecordList">
        {visibleModels.length === 0 ? (
          <EmptySetupState label="No AI app choices are stored yet." />
        ) : (
          visibleModels.map((model) => (
            <ModelInventoryRow
              key={model.id}
              canRemove={isEverydayToolSelected(model) || selectedCount > 0}
              model={model}
              onChange={updateToolSlot}
              onRemove={removeToolRow}
            />
          ))
        )}
      </div>

      <button
        className="addToolButton"
        disabled={!canAddAnotherTool || setup.status === "saving"}
        onClick={addToolRow}
        type="button"
      >
        <span aria-hidden="true">+</span>
        Add another tool
      </button>
    </section>
  );
}

function ModelInventoryRow({
  canRemove,
  model,
  onChange,
  onRemove,
}: {
  canRemove: boolean;
  model: ModelInventoryItem;
  onChange: (model: ModelInventoryItem) => void;
  onRemove: (model: ModelInventoryItem) => void;
}) {
  const selectedTool = inferEverydayToolSelection(model);
  const provider = getEverydayToolProvider(selectedTool.providerId);
  const selected = isEverydayToolSelected(model);
  const rowTitle = "Tool selection";
  const accountLabel = provider.accountLabel ?? "Account level";

  return (
    <section className="setupRecord" aria-labelledby={`${model.id}-title`}>
      <div className="recordHeader">
        <div>
          <h4 id={`${model.id}-title`}>{rowTitle}</h4>
          <p>{everydayToolSummary(model)}</p>
        </div>
        <div className="recordActions">
          <span className="recordPill">{selected ? "Selected" : "Optional"}</span>
          {canRemove ? (
            <button
              aria-label={selected ? `Remove ${provider.label}` : "Remove empty tool row"}
              className="removeToolButton"
              onClick={() => onRemove(model)}
              type="button"
            >
              Remove tool
            </button>
          ) : null}
        </div>
      </div>

      <div className="toolChoiceGrid">
        <label>
          <span>AI app</span>
          <select
            aria-label={`AI app for ${model.id}`}
            onChange={(event) =>
              onChange(
                applyEverydayToolSelection(model, {
                  providerId: event.target.value as EverydayToolProviderId,
                }),
              )
            }
            value={selectedTool.providerId}
          >
            {everydayToolProviders.map((providerOption) => (
              <option key={providerOption.id} value={providerOption.id}>
                {providerOption.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{accountLabel}</span>
          <select
            aria-label={`${accountLabel} for ${model.id}`}
            disabled={!selected}
            onChange={(event) =>
              onChange(
                applyEverydayToolSelection(model, {
                  accountId: event.target.value as EverydayToolAccountId,
                }),
              )
            }
            value={selectedTool.accountId}
          >
            {provider.accountOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>How often</span>
          <select
            aria-label={`How often for ${model.id}`}
            disabled={!selected}
            onChange={(event) =>
              onChange(
                applyEverydayToolSelection(model, {
                  frequencyId: event.target.value as EverydayToolFrequencyId,
                }),
              )
            }
            value={selectedTool.frequencyId}
          >
            {provider.frequencyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
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
  const included = comfortValue !== "none";

  return (
    <section className="setupRecord" aria-labelledby={`${source.id}-title`}>
      <div className="recordHeader">
        <div>
          <h4 id={`${source.id}-title`}>{source.label}</h4>
          <p>{sourceComfortDescription(source)}</p>
        </div>
        <span className="recordPill">{included ? comfortLabel(comfortValue) : "Left out"}</span>
      </div>

      <div className="sourceIncludeGrid">
        <label className="toggleField sourceIncludeToggle">
          <input
            aria-label={`Include ${source.label}`}
            checked={included}
            onChange={(event) =>
              onChange(sourceFromComfortLevel(source, event.target.checked ? "public" : "none"))
            }
            type="checkbox"
          />
          <span>Include this</span>
        </label>

        <label>
          <span>Most of this information is</span>
          <select
            aria-label={`Information type for ${source.id}`}
            disabled={!included}
            onChange={(event) => onChange(sourceFromComfortLevel(source, event.target.value as SourceComfortLevel))}
            value={included ? comfortValue : "public"}
          >
            {visibleSourceComfortLevels.map((level) => (
              <option key={level} value={level}>
                {comfortLabel(level)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Name shown in the app</span>
          <input
            aria-label={`Source label for ${source.id}`}
            onChange={(event) => onChange({ ...source, label: event.target.value })}
            value={source.label}
          />
        </label>
      </div>

      <details className="advancedDrawer">
        <summary>Show extra settings</summary>

        <div className="formGrid compactFormGrid">
          <label>
            <span>Privacy guardrail</span>
            <select
              aria-label={`Privacy guardrail for ${source.id}`}
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
                  {permissionLevelLabel(level)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Information shelf type</span>
            <input aria-label={`Information shelf type for ${source.id}`} readOnly value={source.sourceType} />
          </label>
        </div>

        <fieldset className="checkboxGrid">
          <legend>Extra privacy categories</legend>
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
                <span>{sensitivityLabel(sensitivityClass)}</span>
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
        <span className="recordPill">{selected ? "Current style" : "Available"}</span>
      </div>

      <details className="advancedDrawer">
        <summary>Show extra settings</summary>

        <div className="formGrid compactFormGrid">
          <label>
            <span>Saved style name</span>
            <input
              aria-label={`Policy label for ${policy.id}`}
              onChange={(event) => onChange({ ...policy, label: event.target.value })}
              value={policy.label}
            />
          </label>
          <label>
            <span>Saved explanation</span>
            <input
              aria-label={`Policy description for ${policy.id}`}
              onChange={(event) => onChange({ ...policy, description: event.target.value })}
              value={policy.description}
            />
          </label>
        </div>

        <div className="weightGrid" aria-label={`Preference balance for ${policy.label}`}>
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
      return "Public or shareable";
    case "work":
      return "Ordinary work info";
    case "confidential":
      return "Confidential info";
    case "restricted":
      return "Sensitive info";
  }
}

function permissionLevelLabel(permissionLevel: PermissionLevel) {
  switch (permissionLevel) {
    case 0:
      return "Do not use this";
    case 1:
      return "Public or shareable only";
    case 2:
      return "Ordinary work info";
    case 3:
      return "Confidential info";
    case 4:
      return "Sensitive info";
  }
}

function sourceComfortDescription(source: SourcePermission) {
  const comfortLevel = comfortLevelForSource(source);

  if (comfortLevel === "none") {
    return "This will be left out of recommendations.";
  }

  if (comfortLevel === "public") {
    return "Include this when the information is public or already shareable.";
  }

  if (comfortLevel === "work") {
    return "Include this for ordinary work context that is not confidential.";
  }

  if (comfortLevel === "confidential") {
    return "Include this when confidential context is acceptable for the task.";
  }

  return "Include this only when sensitive context is explicitly okay for the task.";
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

function visibleToolRows(models: ModelInventoryItem[], emptyRowsToShow: number): ModelInventoryItem[] {
  const selectedModels = models.filter(isEverydayToolSelected);
  const emptyModels = models.filter((model) => !isEverydayToolSelected(model)).slice(0, emptyRowsToShow);

  return [...selectedModels, ...emptyModels];
}

function preferredToolIdFromFrequency(models: ModelInventoryItem[]): ModelInventoryItem["id"] | undefined {
  const selectedModels = models.filter((model) => model.id !== "manual-human-review" && isEverydayToolSelected(model));

  if (selectedModels.length === 0) {
    return undefined;
  }

  return [...selectedModels].sort((left, right) => {
    const frequencyComparison = everydayToolFrequencyRank(right) - everydayToolFrequencyRank(left);

    return frequencyComparison || left.id.localeCompare(right.id);
  })[0]?.id;
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

function domIdFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

function sensitivityLabel(sensitivityClass: SensitivityClass) {
  if (sensitivityClass === "public-facing risk") {
    return "public-facing";
  }

  if (sensitivityClass === "highly restricted") {
    return "very sensitive";
  }

  return sensitivityClass;
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
