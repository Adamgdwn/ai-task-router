import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { domIdFor } from "../domId";
import { formatUsd, formatWattHoursWithEveryday } from "../../domain/format";
import { buildDefaultPublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
import { displayedCostMultiple } from "../../domain/impact/routeComparison";
import {
  applyEverydayToolSelection,
  everydayToolCatalogReviewedAt,
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
  PolicyDefault,
  ScoringWeights,
} from "../../domain/types";
import type { SetupConfigurationController } from "../state/useSetupConfiguration";
import type { ScreenDefinition } from "./screenDefinitions";

const scoringWeightKeys = ["cost", "energy", "quality", "speed", "sourceFit", "sensitivityFit"] as const;
const publicImpactSnapshot = buildDefaultPublicImpactSnapshot();
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
    title: "How should recommendations choose?",
    body: "Tell the app whether to start light, stay balanced, or spend more effort when quality matters.",
    buttonLabel: "Pick how to choose",
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

type ToolInventoryScreenProps = SetupScreenProps & {
  onNextStep: () => void;
};

type PolicySettingsScreenProps = SetupScreenProps & {
  onNextStep: () => void;
};

export function StartHereScreen({ definition, onNavigate }: StartHereScreenProps) {
  return (
    <article className="screenPanel pathPanel">
      <ScreenHeader definition={definition} />

      <BrowserStorageNotice />

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

      <WhyRoutingMattersPanel />

      <section className="plainPromise" aria-labelledby="plain-promise-heading">
        <h3 id="plain-promise-heading">What this will and will not do</h3>
        <ul>
          <li>It helps choose a sensible AI path before you paste anything into a tool.</li>
          <li>It helps build judgment about when a smaller route is enough, and shows what each choice costs to run.</li>
          <li>It uses your browser storage for choices and saved plans.</li>
          <li>It does not log in, connect accounts, search files, send prompts, or run AI for you.</li>
        </ul>
      </section>
    </article>
  );
}

/**
 * The lesson, before the decision.
 *
 * Everything the app knows about why routing matters used to arrive only after a user described a
 * task - the entire pre-task case was one hedged line further down this screen, so a visitor who
 * landed, looked around, and left learned nothing. These are the same governed figures already
 * rendered on Best Options, from the same reviewed snapshot; showing them earlier is a placement
 * change, not a new claim, and no figure here is computed differently than it is there.
 *
 * The middle point is the one worth keeping. An app that only ever says "smaller is cheaper" earns
 * a reader who routes everything to the smallest tool and then re-runs half of it, which costs more
 * than choosing well. The right-sizing figure already nets out those extra runs, so it can carry
 * that caveat honestly rather than as a disclaimer.
 */
function WhyRoutingMattersPanel() {
  const { tokenBenchmark, rightSizingExample, environmentalExample } = publicImpactSnapshot;
  const benchmarkMultiple = displayedCostMultiple(tokenBenchmark.lowerCostUsd, tokenBenchmark.comparisonCostUsd);

  return (
    <section className="whyRoutingMatters" aria-labelledby="why-routing-matters-heading">
      <p className="screenKicker">Before you start</p>
      <h3 id="why-routing-matters-heading">Why which tool you pick matters</h3>
      <p>
        You do not need to describe a task to see the idea. Here it is in three numbers, all measured at public API list
        prices and published inference figures rather than anything about your own usage.
      </p>

      <ol className="whyRoutingMattersPoints">
        <li>
          <strong>The same job, two tools.</strong> One {formatInteger(tokenBenchmark.tokenCount)}-token run costs about{" "}
          {formatUsd(tokenBenchmark.lowerCostUsd)} on {tokenBenchmark.lowerCostModelLabel} and about{" "}
          {formatUsd(tokenBenchmark.comparisonCostUsd)} on {tokenBenchmark.comparisonModelLabel}
          {benchmarkMultiple ? `, roughly ${benchmarkMultiple}x` : ""}. Same work, same tokens. The only difference is
          which tool it was sent to.
        </li>
        <li>
          <strong>Smaller is not automatically better.</strong> Across {rightSizingExample.taskCount} similar tasks,
          sending the right ones to a lighter tool comes to about {formatUsd(rightSizingExample.netAvoidedCostUsd)} less
          than sending all of them to the heavier one - and that is after paying for{" "}
          {rightSizingExample.inducedExtraRuns} extra runs where the lighter tool was not enough. Routing well means
          matching the tool to the job, not always reaching for the cheapest one.
        </li>
        <li>
          <strong>Energy moves with it.</strong> Across {environmentalExample.taskCount} reasoning tasks, sending half to
          a lighter workload is a difference of about{" "}
          {formatWattHoursWithEveryday(environmentalExample.netAvoidedWattHours)}. Small per task, which is exactly why
          it is easy to stop noticing.
        </li>
      </ol>

      <p className="impactCaveat">
        These are worked examples, not your usage, and nobody is claiming you ran them. They are here so the idea is
        readable before you decide anything. Every route this app suggests later carries its own figures, and the Help
        tab explains where all of them come from.
      </p>
    </section>
  );
}

function formatInteger(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function BrowserStorageNotice() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <section className="browserStorageNotice" aria-labelledby="browser-storage-notice-heading">
      <div>
        <p className="screenKicker">Browser storage</p>
        <h3 id="browser-storage-notice-heading">How saved choices work</h3>
        <p>
          This app uses your browser storage to remember your AI tools, saved plans, ratings, and Past Choices on this
          device.
        </p>
      </div>

      <div className="browserStorageActions">
        <button onClick={() => setDismissed(true)} type="button">
          Got it
        </button>
        <button
          aria-controls="browser-storage-details"
          aria-expanded={expanded}
          className="secondaryActionButton"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          Learn more
        </button>
      </div>

      {expanded ? (
        <div className="browserStorageDetails" id="browser-storage-details">
          <p>
            The app does not use tracking cookies, analytics, or hidden uploads. Saved records stay in this browser
            unless you choose to export them, and clearing site data removes them.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function PwaInstallPanel() {
  const [installPrompt, setInstallPrompt] = useState<BrowserInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<"idle" | "available" | "accepted" | "dismissed" | "installed" | "error">(
    "idle",
  );

  useEffect(() => {
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
  }, []);

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
        Use it like a regular app where your browser supports install. It runs in your browser either way, and your
        saved choices stay on this device.
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

export function ToolInventoryScreen({ definition, setup, onNextStep }: ToolInventoryScreenProps) {
  return (
    <SetupScreenLayout definition={definition} setup={setup} showPrimarySaveAction={false}>
      <SetupBoundaryNote>
        Add one AI app at a time. Pick the app, the account level you use, and how often you reach for it. Account
        level shapes what gets recommended; how often is your own note about your habits and changes nothing about the
        recommendation. Use Add another tool only when you want another row. The app does not sign in, verify paid
        plans, call providers, or store credentials.
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

      <ToolCatalogMethodNote />

      <InventoryGroup
        models={setup.configuration?.modelInventory ?? []}
        onNextStep={onNextStep}
        setup={setup}
        title="AI apps on my screen"
      />
    </SetupScreenLayout>
  );
}

function ToolCatalogMethodNote() {
  return (
    <details className="toolMethodCard">
      <summary>How this treats tools, models, and privacy</summary>
      <ul>
        <li>
          Each saved app becomes a simple profile: account level, capability fit, research fit, and privacy ceiling.
          How often you use a tool is recorded with it but is deliberately kept out of that profile - the tool you
          reach for most is not evidence that it suits the task, and treating it as evidence is the habit this app
          exists to counter.
        </li>
        <li>
          The app does not read live provider model menus. Model labels are minimum capability guidance, with an upgrade
          trigger when review finds weak reasoning, missing facts, or rework.
        </li>
        <li>
          Current-facts tools, including Perplexity, are used for evidence stages when the task asks for current facts or
          citations and web research is allowed by the privacy setting.
        </li>
        <li>
          Confidential and restricted work is gated before scoring. Highly restricted work stays manual or local/private
          because outside AI accounts are blocked.
        </li>
      </ul>
      <p>Catalog last reviewed {formatCatalogReviewDate(everydayToolCatalogReviewedAt)}.</p>
    </details>
  );
}

function formatCatalogReviewDate(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(timestamp));
}

export function PolicySettingsScreen({ definition, setup, onNextStep }: PolicySettingsScreenProps) {
  const policies = setup.configuration?.policySettings ?? [];

  async function continueToNextStep() {
    if (setup.dirty) {
      await setup.saveChanges();
    }

    onNextStep();
  }

  return (
    <SetupScreenLayout definition={definition} setup={setup}>
      <SetupBoundaryNote>
        Pick how cautious the recommendation should be most of the time. This changes the route the app recommends; it
        does not buy, connect, verify, or run any tool.
      </SetupBoundaryNote>

      <fieldset className="choiceCardGrid" disabled={setup.status === "saving"}>
        <legend>When the app compares options, what should it favor?</legend>
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

      <div className="setupNavigationActions">
        <button
          className="nextStepButton"
          disabled={setup.status === "loading" || setup.status === "saving"}
          onClick={() => void continueToNextStep()}
          type="button"
        >
          Next step
        </button>
      </div>
    </SetupScreenLayout>
  );
}

function SetupScreenLayout({
  children,
  definition,
  setup,
  showPrimarySaveAction = true,
}: SetupScreenProps & { children: ReactNode; showPrimarySaveAction?: boolean }) {
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
          {showPrimarySaveAction ? (
            <button disabled={!setup.dirty || busy} onClick={() => void setup.saveChanges()} type="button">
              Save my choices
            </button>
          ) : null}
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
  onNextStep,
  setup,
  title,
}: {
  models: ModelInventoryItem[];
  onNextStep: () => void;
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
  }

  function addToolRow() {
    if (!canAddAnotherTool) {
      return;
    }

    setExtraEmptyRows((currentRows) => currentRows + 1);
  }

  async function continueToNextStep() {
    if (setup.dirty) {
      await setup.saveChanges();
    }

    onNextStep();
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

      <div className="toolInventoryActions">
        <button
          className="addToolButton"
          disabled={!canAddAnotherTool || setup.status === "saving"}
          onClick={addToolRow}
          type="button"
        >
          <span aria-hidden="true">+</span>
          Add another tool
        </button>
        <button
          className="saveToolChoicesButton"
          disabled={!setup.dirty || setup.status === "loading" || setup.status === "saving"}
          onClick={() => void setup.saveChanges()}
          type="button"
        >
          Save my choices
        </button>
        <button
          className="nextStepButton"
          disabled={setup.status === "loading" || setup.status === "saving"}
          onClick={() => void continueToNextStep()}
          type="button"
        >
          Next step
        </button>
      </div>
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

      <p className="policyPlainSummary">{policyPlainLanguageSummary(policy)}</p>

      <details className="advancedDrawer">
        <summary>Fine-tune how this style chooses</summary>
        <p className="advancedNote">
          These sliders are optional. The app turns the six sliders into a 100% balance, so moving one changes the
          percentage share of the others behind the scenes.
        </p>

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
                max={5}
                min={0}
                onChange={(event) =>
                  onChange({
                    ...policy,
                    scoringWeights: {
                      ...policy.scoringWeights,
                      [weightKey]: boundedScaleValue(event),
                    },
                  })
                }
                step={1}
                type="range"
                value={scaledWeightValue(policy.scoringWeights[weightKey])}
              />
              <small>
                {weightStrengthLabel(policy.scoringWeights[weightKey])};{" "}
                {weightShareLabel(policy.scoringWeights, weightKey)}. {weightHelpText(weightKey)}
              </small>
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

/**
 * A style's name has to be true to the weights it actually scores by, or it teaches the wrong lesson.
 *
 * `least-resource` weights cost and energy highest and speed *lower* than `balanced` does, and it
 * leans on human review for anything risky. It was labelled "Save time and cost", which named the one
 * thing it does not give you and omitted the one it is for.
 */
function friendlyPolicyLabel(policy: PolicyDefault) {
  if (policy.id === "least-resource") {
    return "Lower energy and cost";
  }

  if (policy.id === "quality-first") {
    return "Best quality when it matters";
  }

  return "Balanced for everyday work";
}

function friendlyPolicyDescription(policy: PolicyDefault) {
  if (policy.id === "least-resource") {
    return "Prefer the simplest good-enough option. Expect to spend more of your own time checking the result.";
  }

  if (policy.id === "quality-first") {
    return "Use stronger help and more review when mistakes would be expensive.";
  }

  return "Balance quality, speed, caution, and effort for normal work.";
}

function policyPlainLanguageSummary(policy: PolicyDefault) {
  if (policy.id === "least-resource") {
    return "Best when the task is routine, private experimentation is fine, or you want to avoid paying for heavy help before you know you need it.";
  }

  if (policy.id === "quality-first") {
    return "Best when mistakes would be visible, expensive, hard to undo, or when a human will rely on the result.";
  }

  return "Best default for normal work: start practical, keep quality in view, and upgrade only when the task calls for it.";
}

function visibleToolRows(models: ModelInventoryItem[], emptyRowsToShow: number): ModelInventoryItem[] {
  const selectedModels = models.filter(isEverydayToolSelected);
  const emptyModels = models.filter((model) => !isEverydayToolSelected(model)).slice(0, emptyRowsToShow);

  return [...selectedModels, ...emptyModels];
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

function boundedScaleValue(event: ChangeEvent<HTMLInputElement>) {
  return boundedNumber(event, 0, 5) / 5;
}

function scaledWeightValue(value: number) {
  return Math.round(Math.min(1, Math.max(0, value)) * 5);
}

function weightLabel(weightKey: keyof ScoringWeights) {
  if (weightKey === "sourceFit") {
    return "Uses my information";
  }

  if (weightKey === "sensitivityFit") {
    return "Protects sensitive details";
  }

  if (weightKey === "cost") {
    return "Keeps cost low";
  }

  if (weightKey === "energy") {
    return "Avoids waste";
  }

  if (weightKey === "quality") {
    return "Best quality";
  }

  return "Faster result";
}

function weightHelpText(weightKey: keyof ScoringWeights) {
  if (weightKey === "sourceFit") {
    return "prefer routes that can use the information you selected.";
  }

  if (weightKey === "sensitivityFit") {
    return "prefer routes that fit the privacy level of the task.";
  }

  if (weightKey === "cost") {
    return "prefer lower-cost helpers before premium ones.";
  }

  if (weightKey === "energy") {
    return "prefer lighter routes when they are good enough.";
  }

  if (weightKey === "quality") {
    return "prefer stronger helpers and more review.";
  }

  return "prefer routes that should get to a usable answer sooner.";
}

function weightStrengthLabel(value: number) {
  const scaledValue = scaledWeightValue(value);

  if (scaledValue <= 1) {
    return "Low";
  }

  if (scaledValue <= 3) {
    return "Medium";
  }

  return "High";
}

function weightShareLabel(weights: ScoringWeights, weightKey: keyof ScoringWeights) {
  const totalWeight = scoringWeightKeys.reduce((total, candidateKey) => total + weights[candidateKey], 0);

  if (totalWeight === 0) {
    return "0% of this style";
  }

  return `${Math.round((weights[weightKey] / totalWeight) * 100)}% of this style`;
}
