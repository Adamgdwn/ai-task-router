import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import {
  getDesktopDiscoveryOptions,
  isDesktopDiscoveryAvailable,
  runDesktopDiscovery,
} from "../../desktop/desktopDiscovery";
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
  DesktopDiscoveryOption,
  DesktopDiscoveryRequest,
  DesktopDiscoveryResponse,
  DesktopDiscoveryToolResult,
  ModelInventoryItem,
  PolicyDefault,
  ScoringWeights,
} from "../../domain/types";
import type { SetupConfigurationController } from "../state/useSetupConfiguration";
import type { ScreenDefinition } from "./screenDefinitions";

const scoringWeightKeys = ["cost", "energy", "quality", "speed", "sourceFit", "sensitivityFit"] as const;
const shoppingPathSteps = [
  {
    screenId: "tool-inventory",
    eyebrow: "Aisle 1",
    title: "What AI tools do you already use?",
    body: "Pick the helpers already on your shelf. The app will not connect to them; it only remembers that you can use them.",
    buttonLabel: "Choose my tools",
  },
  {
    screenId: "policy-settings",
    eyebrow: "Aisle 2",
    title: "How should tradeoffs be handled?",
    body: "Tell the app whether today is about speed, balance, or best quality when the stakes are higher.",
    buttonLabel: "Pick choosing style",
  },
  {
    screenId: "task-intake",
    eyebrow: "Checkout",
    title: "What are you trying to get done?",
    body: "Describe the task, choose anything specific to include, and get practical options you can use manually.",
    buttonLabel: "Describe my task",
  },
] as const;

type BrowserInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

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
        <PwaInstallPanel />
      </section>

      <section className="plainPromise" aria-labelledby="plain-promise-heading">
        <h3 id="plain-promise-heading">What this will and will not do</h3>
        <ul>
          <li>It helps choose a sensible AI path before you paste anything into a tool.</li>
          <li>It helps build judgment about when a smaller route is enough, reducing waste in the right scenario.</li>
          <li>It keeps choices and saved plans in this browser.</li>
          <li>It does not log in, connect accounts, search files, send prompts, or run AI for you.</li>
        </ul>
      </section>
    </article>
  );
}

function PwaInstallPanel() {
  const desktopAvailable = isDesktopDiscoveryAvailable();
  const [installPrompt, setInstallPrompt] = useState<BrowserInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<"idle" | "available" | "accepted" | "dismissed" | "installed" | "error">(
    "idle",
  );

  useEffect(() => {
    if (desktopAvailable) {
      return undefined;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BrowserInstallPromptEvent);
      setInstallState("available");
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setInstallState("installed");
    }

    if (isStandaloneBrowserApp()) {
      setInstallState("installed");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [desktopAvailable]);

  if (desktopAvailable) {
    return null;
  }

  async function installBrowserApp() {
    if (!installPrompt) {
      return;
    }

    const promptEvent = installPrompt;
    setInstallPrompt(null);

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      setInstallState(choice.outcome === "accepted" ? "accepted" : "dismissed");
    } catch (_error) {
      setInstallState("error");
    }
  }

  return (
    <section className="pathStep pwaInstallStep" aria-labelledby="pwa-install-heading">
      <span>Install</span>
      <h3 id="pwa-install-heading">Install the browser version</h3>
      <p>
        Use it like a regular app where your browser supports install. Computer checking still needs the desktop app.
      </p>
      {installPrompt && installState === "available" ? (
        <button onClick={() => void installBrowserApp()} type="button">
          Install browser app
        </button>
      ) : (
        <p className="pwaInstallStatus">{pwaInstallStatusMessage(installState)}</p>
      )}
    </section>
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
  const [desktopDiscoveryAddMessage, setDesktopDiscoveryAddMessage] = useState<string | null>(null);

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

  function addDiscoveredTool(result: DesktopDiscoveryToolResult) {
    const accountId = localAccountIdForDesktopTool(result.toolId);

    if (!result.detected || !accountId) {
      setDesktopDiscoveryAddMessage(`${result.label} was not added because it was not found on this computer.`);
      return;
    }

    const existingTool = toolSlots.find((model) => {
      const selection = inferEverydayToolSelection(model);

      return model.enabled && selection.providerId === "local" && selection.accountId === accountId;
    });

    if (existingTool) {
      setDesktopDiscoveryAddMessage(`${result.label} is already in My AI Tools.`);
      return;
    }

    const emptyToolSlot = toolSlots.find((model) => !isEverydayToolSelected(model));

    if (!emptyToolSlot) {
      setDesktopDiscoveryAddMessage("There is no empty tool row left. Remove one before adding another local tool.");
      return;
    }

    const nextModels = replaceRecord(
      models,
      applyEverydayToolSelection(emptyToolSlot, {
        providerId: "local",
        accountId,
        frequencyId: "weekly",
      }),
    );

    setExtraEmptyRows((currentRows) => Math.max(0, currentRows - 1));
    setup.updateModelInventory(nextModels);
    setup.updateSetupPreferences({
      ...setup.preferences,
      preferredModelId: preferredToolIdFromFrequency(nextModels),
    });
    setDesktopDiscoveryAddMessage(`${result.label} was added. Save my choices when you are ready.`);
  }

  return (
    <section className="setupGroup" aria-labelledby={domIdFor(title)}>
      <div className="groupHeader">
        <h3 id={domIdFor(title)}>{title}</h3>
        <span>{selectedCount} selected</span>
      </div>

      <DesktopDiscoveryPanel
        addMessage={desktopDiscoveryAddMessage}
        disabled={setup.status === "saving"}
        onAddFoundTool={addDiscoveredTool}
      />

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

function DesktopDiscoveryPanel({
  addMessage,
  disabled,
  onAddFoundTool,
}: {
  addMessage: string | null;
  disabled: boolean;
  onAddFoundTool: (result: DesktopDiscoveryToolResult) => void;
}) {
  const desktopAvailable = isDesktopDiscoveryAvailable();
  const [options, setOptions] = useState<DesktopDiscoveryOption[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<DesktopDiscoveryRequest["selectedToolIds"]>([]);
  const [result, setResult] = useState<DesktopDiscoveryResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading-options" | "choosing" | "checking" | "results" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [showingDetails, setShowingDetails] = useState(false);
  const busy = status === "loading-options" || status === "checking";

  async function loadOptions() {
    setStatus("loading-options");
    setMessage("Opening the local checklist.");
    setResult(null);
    setShowingDetails(false);

    try {
      const response = await getDesktopDiscoveryOptions();
      setOptions(response.options);
      setSelectedToolIds(response.options.filter((option) => option.defaultSelected).map((option) => option.toolId));
      setStatus("choosing");
      setMessage("Choose the tools you want checked on this computer.");
    } catch (error) {
      setStatus("error");
      setMessage(desktopDiscoveryErrorMessage(error));
    }
  }

  async function runCheck(detailLevel: "summary" | "details") {
    if (selectedToolIds.length === 0) {
      setMessage("Choose at least one local AI tool before running the check.");
      return;
    }

    setStatus("checking");
    setMessage("Checking only the tools you selected. Nothing is uploaded.");

    try {
      const response = await runDesktopDiscovery({
        requestId: `desktop-check-${Date.now()}`,
        selectedToolIds,
        detailLevel,
        includePathDetails: false,
      });

      setResult(response);
      setStatus("results");
      setShowingDetails(detailLevel === "details");
      setMessage(desktopDiscoverySummaryMessage(response));
    } catch (error) {
      setStatus("error");
      setMessage(desktopDiscoveryErrorMessage(error));
    }
  }

  function toggleTool(toolId: DesktopDiscoveryRequest["selectedToolIds"][number]) {
    setSelectedToolIds((currentToolIds) =>
      currentToolIds.includes(toolId)
        ? currentToolIds.filter((currentToolId) => currentToolId !== toolId)
        : [...currentToolIds, toolId],
    );
  }

  function cancelCheck() {
    setStatus("idle");
    setOptions([]);
    setSelectedToolIds([]);
    setResult(null);
    setShowingDetails(false);
    setMessage("Computer check cancelled.");
  }

  function clearResults() {
    setStatus("idle");
    setResult(null);
    setShowingDetails(false);
    setMessage("Computer check results cleared.");
  }

  function hideModelNames() {
    if (!result) {
      return;
    }

    setResult({
      ...result,
      results: result.results.map((toolResult) => ({
        ...toolResult,
        modelNames: [],
      })),
    });
    setShowingDetails(false);
    setMessage("Model names are hidden again.");
  }

  if (!desktopAvailable) {
    return (
      <section className="desktopDiscoveryCard" aria-labelledby="desktop-discovery-heading">
        <div>
          <p className="screenKicker">Desktop app - Coming Soon!</p>
          <h4 id="desktop-discovery-heading">Check this computer</h4>
        </div>
        <p>
          The desktop app can look for local AI tools with your approval. In this browser, add tools manually below.
        </p>
      </section>
    );
  }

  return (
    <section className="desktopDiscoveryCard" aria-labelledby="desktop-discovery-heading">
      <div className="desktopDiscoveryHeader">
        <div>
          <p className="screenKicker">Desktop app - Coming Soon!</p>
          <h4 id="desktop-discovery-heading">Check this computer</h4>
        </div>
        <span>Local only</span>
      </div>

      <p>
        We can check for local AI tools already on this computer. You choose what we check. We will not read your
        documents, upload anything, or connect accounts.
      </p>

      {status === "idle" ? (
        <button disabled={disabled} onClick={() => void loadOptions()} type="button">
          Check this computer
        </button>
      ) : null}

      {status === "loading-options" || status === "checking" ? <p className="desktopDiscoveryStatus">{message}</p> : null}

      {status === "choosing" ? (
        <div className="desktopDiscoveryChooser">
          <fieldset disabled={busy || disabled}>
            <legend>What should we check?</legend>
            <div className="desktopDiscoveryOptions">
              {options.map((option) => (
                <label key={option.toolId}>
                  <input
                    checked={selectedToolIds.includes(option.toolId)}
                    onChange={() => toggleTool(option.toolId)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.summary}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="desktopDiscoveryActions">
            <button disabled={busy || disabled || selectedToolIds.length === 0} onClick={() => void runCheck("summary")} type="button">
              Run check
            </button>
            <button className="secondaryButton" disabled={busy} onClick={cancelCheck} type="button">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {status === "results" && result ? (
        <div className="desktopDiscoveryResults" aria-live="polite">
          <div>
            <strong>{desktopDiscoverySummaryMessage(result)}</strong>
            <p>Results are shown without file paths. Model names stay hidden unless you ask to see them.</p>
          </div>

          <div className="desktopDiscoveryResultList">
            {result.results.map((toolResult) => (
              <section key={toolResult.toolId} className="desktopDiscoveryResult">
                <div>
                  <h5>{toolResult.label}</h5>
                  <p>{friendlyDesktopDiscoveryStatus(toolResult)}</p>
                  {toolResult.note ? <small>{toolResult.note}</small> : null}
                  {toolResult.modelNames.length > 0 ? (
                    <ul>
                      {toolResult.modelNames.map((modelName) => (
                        <li key={modelName}>{modelName}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {toolResult.detected ? (
                  <button disabled={disabled} onClick={() => onAddFoundTool(toolResult)} type="button">
                    Add {toolResult.label} to My AI Tools
                  </button>
                ) : null}
              </section>
            ))}
          </div>

          <div className="desktopDiscoveryActions">
            {result.summary.modelsFound > 0 && !showingDetails ? (
              <button disabled={busy || disabled} onClick={() => void runCheck("details")} type="button">
                Show model names
              </button>
            ) : null}
            {showingDetails ? (
              <button className="secondaryButton" disabled={busy} onClick={hideModelNames} type="button">
                Hide model names
              </button>
            ) : null}
            <button className="secondaryButton" disabled={busy} onClick={clearResults} type="button">
              Clear results
            </button>
          </div>
        </div>
      ) : null}

      {status === "error" && message ? (
        <div className="setupAlert" role="alert">
          {message}
        </div>
      ) : null}

      {message && status !== "error" && status !== "loading-options" && status !== "checking" ? (
        <p className="desktopDiscoveryStatus" role="status">
          {message}
        </p>
      ) : null}

      {addMessage ? (
        <p className="desktopDiscoveryStatus" role="status">
          {addMessage}
        </p>
      ) : null}
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

function localAccountIdForDesktopTool(toolId: DesktopDiscoveryToolResult["toolId"]): EverydayToolAccountId | undefined {
  const localAccountIds: Partial<Record<DesktopDiscoveryToolResult["toolId"], EverydayToolAccountId>> = {
    ollama: "local-ollama",
    "lm-studio": "local-lm-studio",
    jan: "local-jan",
    gpt4all: "local-gpt4all",
  };

  return localAccountIds[toolId];
}

function desktopDiscoverySummaryMessage(response: DesktopDiscoveryResponse) {
  const { toolsChecked, toolsDetected, modelsFound } = response.summary;
  const toolWord = toolsChecked === 1 ? "tool" : "tools";
  const detectedWord = toolsDetected === 1 ? "tool" : "tools";
  const modelWord = modelsFound === 1 ? "local model" : "local models";

  if (modelsFound > 0) {
    return `Checked ${toolsChecked} ${toolWord}. Found ${toolsDetected} ${detectedWord} and ${modelsFound} ${modelWord}.`;
  }

  return `Checked ${toolsChecked} ${toolWord}. Found ${toolsDetected} ${detectedWord}.`;
}

function friendlyDesktopDiscoveryStatus(result: DesktopDiscoveryToolResult) {
  if (result.status === "models-found") {
    const modelWord = result.modelCount === 1 ? "local model" : "local models";

    return `Found ${result.label} with ${result.modelCount} ${modelWord}.`;
  }

  if (result.status === "folder-found" || result.status === "installed-no-models-found") {
    return `Found ${result.label}, but no local models were listed.`;
  }

  if (result.status === "blocked") {
    return `${result.label} could not be checked because the operating system blocked the read-only check.`;
  }

  if (result.status === "timed-out") {
    return `${result.label} took too long to answer.`;
  }

  if (result.status === "error") {
    return `${result.label} could not finish the local check.`;
  }

  return `${result.label} was not found in the common local places checked.`;
}

function desktopDiscoveryErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "The computer check could not finish. You can still add tools manually.";
}

function pwaInstallStatusMessage(
  installState: "idle" | "available" | "accepted" | "dismissed" | "installed" | "error",
) {
  if (installState === "accepted") {
    return "Install started. Your browser will finish it.";
  }

  if (installState === "dismissed") {
    return "No problem. You can install later from the browser menu when it is available.";
  }

  if (installState === "installed") {
    return "Installed. Open it from your app list when you want the browser version.";
  }

  if (installState === "error") {
    return "The browser install prompt was not available. Try the browser menu instead.";
  }

  return "Your browser may show Install app in the address bar or menu after the hosted site is loaded over HTTPS.";
}

function isStandaloneBrowserApp() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || navigatorWithStandalone.standalone);
}

function replaceRecord<T extends { id: string }>(records: readonly T[], updatedRecord: T): T[] {
  return records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record));
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

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
