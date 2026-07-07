import { type FormEvent, type ReactNode } from "react";
import { buildDefaultPublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
import {
  buildSuggestedToolkit,
  type SuggestedToolkit,
  type SuggestedToolkitItem,
} from "../../domain/routing/toolkitSuggestion";
import {
  knowledgeWorkTypes,
  outputTypes,
  qualityBars,
  routeStrategies,
  sensitivityClasses,
} from "../../domain/schemas";
import type { RouteOption, SourcePermission, TaskIntake } from "../../domain/types";
import type {
  GeneratedRouteResult,
  TaskRoutingController,
  TaskRoutingErrorField,
} from "../state/useTaskRouting";
import type { SetupConfigurationController } from "../state/useSetupConfiguration";
import type { ImpactCounterController } from "../state/useImpactCounter";
import { ImpactInsightPanel } from "./ImpactInsightPanel";
import { ScreenHeader } from "./SetupScreens";
import type { ScreenDefinition } from "./screenDefinitions";
import { StageGuidancePanel } from "./StageGuidancePanel";

const publicImpactSnapshot = buildDefaultPublicImpactSnapshot();

type TaskRoutingScreenProps = {
  definition: ScreenDefinition;
  impactCounter?: ImpactCounterController;
  routing: TaskRoutingController;
  setup: SetupConfigurationController;
};

type TaskIntakeScreenProps = TaskRoutingScreenProps & {
  onRouteGenerated: () => void;
};

type RouteResultsScreenProps = TaskRoutingScreenProps & {
  onOpenTaskIntake: () => void;
};

export function TaskIntakeScreen({ definition, routing, setup, onRouteGenerated }: TaskIntakeScreenProps) {
  const sourceChoices =
    setup.configuration?.sourcePermissionRegistry.filter(
      (source) => source.permissionLevel > 0 || routing.draft.requestedSourceIds.includes(source.id),
    ) ?? [];
  const nothingSpecificSelected = routing.draft.requestedSourceIds.length === 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (await routing.generateRoute()) {
      onRouteGenerated();
    }
  };

  return (
    <article className="screenPanel routingPanel">
      <ScreenHeader definition={definition} />

      <form className="taskIntakeForm" onSubmit={handleSubmit}>
        <RoutingStatus routing={routing} setup={setup} />

        <section className="routingSection taskConversationGrid" aria-labelledby="task-basics-heading">
          <div className="taskQuestionBlock">
            <div className="sectionHeading">
              <h3 id="task-basics-heading">Tell me what you are trying to do</h3>
              <p>Use normal language. A sentence, a paragraph, or rough notes are all fine.</p>
            </div>

            <FieldShell field="description" label="What do you need help with?" routing={routing}>
              <textarea
                aria-label="What do you need help with?"
                onChange={(event) => routing.updateDraftField("description", event.target.value)}
                placeholder="Example: I need to turn a messy client update into a clear email with next steps."
                rows={6}
                value={routing.draft.description}
              />
            </FieldShell>

            <FieldShell field="title" label="Short name (optional)" routing={routing}>
              <input
                aria-label="Short name optional"
                onChange={(event) => routing.updateDraftField("title", event.target.value)}
                placeholder="Example: Client update email"
                value={routing.draft.title}
              />
            </FieldShell>
          </div>

          <TaskStructurePreview routing={routing} setup={setup} />
        </section>

        <section className="routingSection" aria-labelledby="task-shortcut-heading">
          <div className="sectionHeading">
            <h3 id="task-shortcut-heading">Use a shortcut if one fits</h3>
            <p>These are only starting points. You can ignore them and just describe the job.</p>
          </div>

          <div className="taskShortcutGrid" aria-label="Common task shortcuts">
            <button
              aria-pressed={routing.draft.templateId === "custom"}
              className={routing.draft.templateId === "custom" ? "selectedShortcut" : undefined}
              onClick={() => routing.applyTemplate("custom")}
              type="button"
            >
              <strong>I will describe it myself</strong>
              <span>Keep my current words and choices.</span>
            </button>
            {routing.templates.map((template) => (
              <button
                aria-label={`Use shortcut ${template.label}`}
                aria-pressed={routing.draft.templateId === template.id}
                className={routing.draft.templateId === template.id ? "selectedShortcut" : undefined}
                key={template.id}
                onClick={() => routing.applyTemplate(template.id)}
                type="button"
              >
                <strong>{template.label}</strong>
                <span>{template.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="routingSection" aria-labelledby="task-context-heading">
          <div className="sectionHeading">
            <h3 id="task-context-heading">A few quick questions</h3>
            <p>These choices help evaluate the task, shape a simple plan, and point out where lighter help may save effort.</p>
          </div>

          <div className="formGrid">
            <SelectField
              field="knowledgeWorkType"
              label="What kind of help do you need?"
              onChange={(value) =>
                routing.updateDraftField("knowledgeWorkType", value as TaskIntake["knowledgeWorkType"])
              }
              options={knowledgeWorkTypes}
              routing={routing}
              value={routing.draft.knowledgeWorkType}
            />
            <SelectField
              field="outputType"
              label="What are you making?"
              onChange={(value) => routing.updateDraftField("outputType", value as TaskIntake["outputType"])}
              options={outputTypes}
              routing={routing}
              value={routing.draft.outputType}
            />
            <SelectField
              field="qualityBar"
              label="How polished should it be?"
              onChange={(value) => routing.updateDraftField("qualityBar", value as TaskIntake["qualityBar"])}
              options={qualityBars}
              routing={routing}
              value={routing.draft.qualityBar}
            />
            <SelectField
              field="sensitivityClass"
              label="What kind of information is involved?"
              onChange={(value) => routing.updateDraftField("sensitivityClass", value as TaskIntake["sensitivityClass"])}
              options={sensitivityClasses}
              routing={routing}
              value={routing.draft.sensitivityClass}
            />
          </div>
        </section>

        <section className="routingSection" aria-labelledby="task-needs-heading">
          <div className="sectionHeading">
            <h3 id="task-needs-heading">Anything that needs extra care?</h3>
            <p>Turn these on when the answer needs checking, current information, or public-ready care.</p>
          </div>

          <fieldset className="checkboxGrid routeToggleGrid">
            <legend>Extra care</legend>
            <label>
              <input
                checked={routing.draft.requiresCurrentFacts}
                onChange={(event) => routing.updateDraftField("requiresCurrentFacts", event.target.checked)}
                type="checkbox"
              />
              <span>Needs current facts</span>
            </label>
            <label>
              <input
                checked={routing.draft.requiresCitations}
                onChange={(event) => routing.updateDraftField("requiresCitations", event.target.checked)}
                type="checkbox"
              />
              <span>Needs citations</span>
            </label>
            <label>
              <input
                checked={routing.draft.publicFacing}
                onChange={(event) => routing.updateDraftField("publicFacing", event.target.checked)}
                type="checkbox"
              />
              <span>Will be public</span>
            </label>
          </fieldset>
        </section>

        <section className="routingSection" aria-labelledby="requested-sources-heading">
          <div className="sectionHeading">
            <h3 id="requested-sources-heading">Do you want to include anything specific?</h3>
            <p>Skip this when your description is enough. Pick only what you plan to paste, open, or check yourself.</p>
          </div>

          {sourceChoices.length ? (
            <fieldset className="sourceChoiceGrid">
              <legend>Optional information</legend>
              <button
                aria-pressed={nothingSpecificSelected}
                className={nothingSpecificSelected ? "selectedSourceChoice" : undefined}
                onClick={() => routing.updateDraftField("requestedSourceIds", [])}
                type="button"
              >
                <strong>Nothing specific</strong>
                <small>Use only what I wrote above.</small>
              </button>
              {sourceChoices.map((source) => (
                <label key={source.id}>
                  <input
                    checked={routing.draft.requestedSourceIds.includes(source.id)}
                    onChange={() => routing.toggleRequestedSource(source.id)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{taskSourceLabel(source)}</strong>
                    <small>{taskSourceHint(source)}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="emptySetupState">Optional information choices are not loaded yet.</p>
          )}
          <FieldError field="requestedSourceIds" routing={routing} />
        </section>

        <div className="routingActions">
          <button disabled={!routing.canRoute} type="submit">
            Show me my best options
          </button>
          <span aria-live="polite" role="status">
            {routing.routingMessage}
          </span>
        </div>
      </form>
    </article>
  );
}

export function RouteResultsScreen({
  definition,
  impactCounter,
  routing,
  setup,
  onOpenTaskIntake,
}: RouteResultsScreenProps) {
  const result = routing.routeResult;

  return (
    <article className="screenPanel routingPanel">
      <ScreenHeader definition={definition} />

      {routing.routingStatus === "error" ? (
        <div className="setupAlert" role="alert">
          {routing.validationErrors.form?.[0] ?? "Local routing could not finish."}
        </div>
      ) : null}

      {!result ? (
        <EmptyResultsState routing={routing} onOpenTaskIntake={onOpenTaskIntake} />
      ) : (
        <GeneratedResults impactCounter={impactCounter} result={result} routing={routing} setup={setup} />
      )}
    </article>
  );
}

function RoutingStatus({ routing, setup }: { routing: TaskRoutingController; setup: SetupConfigurationController }) {
  if (routing.validationErrors.form?.length) {
    return (
      <div className="setupAlert" role="alert">
        {routing.validationErrors.form[0]}
      </div>
    );
  }

  if (setup.status === "loading") {
    return <div className="loadingPanel">Loading your saved choices before choosing options.</div>;
  }

  if (setup.dirty) {
    return (
      <p className="setupBoundaryNote">
        You have unsaved choices. Save them first if these assumptions should stay after refresh.
      </p>
    );
  }

  return (
    <p className="setupBoundaryNote">
      Recommendations are prepared in this browser from your choices and task details. The app does not search, connect
      accounts, call providers, or run the work for you.
    </p>
  );
}

function FieldShell({
  children,
  field,
  label,
  routing,
}: {
  children: ReactNode;
  field: TaskRoutingErrorField;
  label: string;
  routing: TaskRoutingController;
}) {
  return (
    <label className="fieldShell">
      <span>{label}</span>
      {children}
      <FieldError field={field} routing={routing} />
    </label>
  );
}

function SelectField<TOption extends string>({
  field,
  label,
  options,
  routing,
  value,
  onChange,
}: {
  field: TaskRoutingErrorField;
  label: string;
  options: readonly TOption[];
  routing: TaskRoutingController;
  value: TOption;
  onChange: (value: TOption) => void;
}) {
  return (
    <FieldShell field={field} label={label} routing={routing}>
      <select aria-label={label} onChange={(event) => onChange(event.target.value as TOption)} value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {friendlyTaskOptionLabel(option)}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function FieldError({ field, routing }: { field: TaskRoutingErrorField; routing: TaskRoutingController }) {
  const error = routing.validationErrors[field]?.[0];

  return error ? <small className="fieldError">{error}</small> : null;
}

function EmptyResultsState({
  routing,
  onOpenTaskIntake,
}: {
  routing: TaskRoutingController;
  onOpenTaskIntake: () => void;
}) {
  const invalid = routing.routingStatus === "invalid";

  return (
    <section className="emptyResultsState" aria-labelledby="empty-results-heading">
      <h3 id="empty-results-heading">{invalid ? "This needs a bit more detail" : "No options yet"}</h3>
      <p>
        {invalid
          ? "Fix the highlighted task details, then ask for options again."
          : "Describe a task to compare quick, balanced, and higher-quality ways to handle it."}
      </p>
      <button onClick={onOpenTaskIntake} type="button">
        Describe my task
      </button>
    </section>
  );
}

function TaskStructurePreview({
  routing,
  setup,
}: {
  routing: TaskRoutingController;
  setup: SetupConfigurationController;
}) {
  const selectedSources =
    setup.configuration?.sourcePermissionRegistry
      .filter((source) => routing.draft.requestedSourceIds.includes(source.id))
      .map(taskSourceLabel) ?? [];

  return (
    <section className="taskShapePanel" aria-labelledby="task-shape-heading">
      <p className="screenKicker">Rough structure</p>
      <h3 id="task-shape-heading">What I will use to suggest options</h3>
      <dl>
        <div>
          <dt>Goal</dt>
          <dd>{routing.draft.description.trim() || "Your plain-language task description"}</dd>
        </div>
        <div>
          <dt>Output</dt>
          <dd>{friendlyTaskOptionLabel(routing.draft.outputType)}</dd>
        </div>
        <div>
          <dt>Information</dt>
          <dd>{selectedSources.length ? selectedSources.join(", ") : "Nothing specific"}</dd>
        </div>
        <div>
          <dt>Extra care</dt>
          <dd>{extraCareSummary(routing.draft)}</dd>
        </div>
      </dl>
    </section>
  );
}

function GeneratedResults({
  result,
  impactCounter,
  routing,
  setup,
}: {
  result: GeneratedRouteResult;
  impactCounter?: ImpactCounterController;
  routing: TaskRoutingController;
  setup: SetupConfigurationController;
}) {
  const recommended = result.routeCard.options.find((option) => option.id === result.routeCard.recommendedOptionId);
  const suggestedToolkit = buildSuggestedToolkit({
    task: result.task,
    models: setup.configuration?.modelInventory ?? [],
    recommended,
  });

  return (
    <div className="resultsStack">
      {result.noSafeGeneratedRoute ? (
        <div className="setupAlert" role="alert">
          No safe option is available yet. Use manual review only until the task details or information choices are adjusted.
        </div>
      ) : null}

      <section className="resultSummaryBand" aria-labelledby="result-summary-heading">
        <div>
          <p className="screenKicker">Task evaluation</p>
          <h3 id="result-summary-heading">{recommendationHeading(recommended)}</h3>
          <p>{taskEvaluationSummary(result.task, recommended)}</p>
          <p>{nextActionSummary(result, recommended)}</p>
        </div>
        <dl>
          <div>
            <dt>Kind of work</dt>
            <dd>{friendlyTaskOptionLabel(result.task.knowledgeWorkType)}</dd>
          </div>
          <div>
            <dt>Deliverable</dt>
            <dd>{friendlyTaskOptionLabel(result.task.outputType)}</dd>
          </div>
          <div>
            <dt>Best helper</dt>
            <dd>{primaryHelperLabel(recommended)}</dd>
          </div>
          <div>
            <dt>Savings aim</dt>
            <dd>{savingsAimLabel(recommended)}</dd>
          </div>
        </dl>
      </section>

      <StageGuidancePanel
        stages={result.routeCard.stageGuidance}
        lead="Follow these stages as a simple project plan. Each stage shows who or what should help, and where to review before moving on."
      />

      <ImpactInsightPanel
        recommended={recommended}
        snapshot={publicImpactSnapshot}
        task={result.task}
        trackedImpact={impactCounter?.summary}
        trackedImpactMessage={impactCounter?.message}
      />

      <ToolkitSuggestionPanel toolkit={suggestedToolkit} />

      <section className="routingSection" aria-labelledby="route-comparison-heading">
        <div className="sectionHeading">
          <h3 id="route-comparison-heading">Your options</h3>
          <p>Compare the likely cost, energy use, tradeoff, and safety fit before choosing what to copy or ignore.</p>
        </div>
        <RouteTrustPanel recommended={recommended} result={result} reviewedAt={publicImpactSnapshot.reviewedAt} />
        <RouteHundredUseComparison options={result.routeCard.options} />
        <div className="routeComparisonGrid">
          {routeStrategies.map((strategy) => (
            <RouteStrategyCard
              key={strategy}
              result={result}
              strategy={strategy}
            />
          ))}
        </div>
      </section>

      {result.routeCard.warnings.length ? (
        <ListSection
          className="warningList"
          heading="Warnings"
          items={result.routeCard.warnings}
          lead="Review these before using any route outside the app."
        />
      ) : null}

      {result.routeCard.blockedRoutes.length ? (
        <ListSection
          className="blockedList"
          heading="Left out for safety"
          items={uniqueMessages(result.routeCard.blockedRoutes.map((blockedRoute) => userFacingRouteMessage(blockedRoute.reason)))}
          lead="These ingredients or helpers were removed because they do not fit what you chose to include."
        />
      ) : null}

      {result.scoringResult.tieBreakersApplied.length ? (
        <ListSection
          className="tieBreakerList"
          heading="Tie breakers"
          items={result.scoringResult.tieBreakersApplied}
          lead="The recommendation used these deterministic selection rules."
        />
      ) : null}

      <section className="saveRoutePanel" aria-labelledby="save-route-heading">
        <div>
          <h3 id="save-route-heading">Keep this plan</h3>
          <p>Save the decision card and copy-ready prompts on this device.</p>
        </div>
        <button
          disabled={routing.saveStatus === "saving" || routing.saveStatus === "saved"}
          onClick={() => void routing.saveGeneratedRoute()}
          type="button"
        >
          {routing.saveStatus === "saved" ? "Saved on this device" : "Save decision and prompts"}
        </button>
        <span aria-live="polite" role="status">
          {routing.saveMessage}
        </span>
      </section>
    </div>
  );
}

function ToolkitSuggestionPanel({ toolkit }: { toolkit: SuggestedToolkit }) {
  return (
    <section className="routingSection toolkitSuggestionSection" aria-labelledby="toolkit-suggestion-heading">
      <div className="sectionHeading">
        <h3 id="toolkit-suggestion-heading">Suggested AI toolkit</h3>
        <p>{toolkit.summary}</p>
      </div>

      <div className="toolkitColumns">
        <ToolkitColumn
          heading="Close-enough starters"
          lead="Try these first for many normal tasks before paying for heavier help."
          items={toolkit.starters}
        />
        <ToolkitColumn
          heading="Paid upgrades"
          lead="Keep these for risk, polish, current research, or repeated work where rework would cost more."
          items={toolkit.paidUpgrades}
        />
      </div>
      <p className="toolkitBoundaryNote">
        This is a planning suggestion only. The app does not subscribe, connect accounts, verify plans, or call these tools.
      </p>
    </section>
  );
}

function ToolkitColumn({
  heading,
  items,
  lead,
}: {
  heading: string;
  items: readonly SuggestedToolkitItem[];
  lead: string;
}) {
  return (
    <section className="toolkitColumn" aria-labelledby={domIdFor(heading)}>
      <h4 id={domIdFor(heading)}>{heading}</h4>
      <p>{lead}</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.alreadySelected ? "Already in My AI Tools" : item.role}</span>
            </div>
            <p>{item.reason}</p>
            <small>{item.savingsAngle}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function recommendationHeading(recommended: RouteOption | undefined) {
  return recommended ? `Start with: ${recommended.label}` : "Pause before using a helper";
}

function taskEvaluationSummary(task: TaskIntake, recommended: RouteOption | undefined) {
  const workType = friendlyTaskOptionLabel(task.knowledgeWorkType).toLowerCase();
  const deliverable = friendlyTaskOptionLabel(task.outputType).toLowerCase();
  const quality = friendlyTaskOptionLabel(task.qualityBar).toLowerCase();
  const sourceNeed =
    task.requiresCurrentFacts || task.requiresCitations
      ? "a safe current-facts or citation check before prompt design and execution"
      : task.requestedSourceIds.length > 0
        ? "specific information you selected"
        : "the task description and anything you intentionally add later";

  if (!recommended) {
    return `This looks like a ${workType} job that should end in ${deliverable}, but the current setup does not leave a safe route. Adjust the helper or information choices before pasting the task into another tool.`;
  }

  return `This looks like a ${workType} job that should end in ${deliverable} at ${quality}. Use ${sourceNeed}, then follow the plan below to get a first usable result before upgrading to heavier help.`;
}

function nextActionSummary(result: GeneratedRouteResult, recommended: RouteOption | undefined) {
  const firstStage = result.routeCard.stageGuidance[0];
  const firstWorkStep = recommended?.steps.find((step) => step.kind !== "human review");

  if (!recommended || !firstStage) {
    return "First action: review what was left out, then change the task setup or use manual review only.";
  }

  return `First action: ${firstStage.purpose} Main helper: ${firstWorkStep?.label ?? firstStage.recommendedModelLabel}.`;
}

function primaryHelperLabel(recommended: RouteOption | undefined) {
  const firstWorkStep = recommended?.steps.find((step) => step.kind !== "human review");

  if (!firstWorkStep) {
    return "Review setup first";
  }

  if (firstWorkStep.kind === "manual") {
    return "You first";
  }

  return firstWorkStep.label;
}

function savingsAimLabel(recommended: RouteOption | undefined) {
  if (!recommended) {
    return "Avoid unsafe rework";
  }

  if (recommended.estimatedCostLevel === "low") {
    return recommended.estimatedEffortLevel === "high" ? "Save tool cost" : "Save paid-tool use";
  }

  if (recommended.estimatedCostLevel === "medium") {
    return "Save rework";
  }

  return "Reduce risk";
}

function routeCostLabel(candidate: RouteOption) {
  return candidate.estimatedCostUsd === undefined
    ? candidate.estimatedCostLevel
    : `${formatUsd(candidate.estimatedCostUsd)} (${candidate.estimatedCostLevel})`;
}

function routeSavingsLabel(candidate: RouteOption) {
  if (candidate.estimatedSavingsUsd === undefined || candidate.estimatedSavingsPercent === undefined) {
    return "Estimate unavailable";
  }

  return `${formatUsd(candidate.estimatedSavingsUsd)} (${candidate.estimatedSavingsPercent}%)`;
}

function routeEnergyLabel(candidate: RouteOption) {
  return candidate.estimatedEnergyWh === undefined
    ? "Estimate unavailable"
    : `${formatWattHours(candidate.estimatedEnergyWh)} per use`;
}

function routeEnergySavingsLabel(candidate: RouteOption) {
  if (candidate.estimatedEnergySavingsWh === undefined || candidate.estimatedEnergySavingsPercent === undefined) {
    return "Estimate unavailable";
  }

  return `${formatWattHours(candidate.estimatedEnergySavingsWh)} (${candidate.estimatedEnergySavingsPercent}%)`;
}

function RouteTrustPanel({
  recommended,
  result,
  reviewedAt,
}: {
  recommended: RouteOption | undefined;
  result: GeneratedRouteResult;
  reviewedAt: string;
}) {
  const blockedCount = result.routeCard.blockedRoutes.length;
  const warningCount = result.routeCard.warnings.length;
  const availableStrategyLabels = result.routeCard.options.map((option) => optionLabel(option.strategy)).join(", ");
  const unavailableStrategyLabels = result.scoringResult.unavailable.map((candidate) => optionLabel(candidate.strategy));

  return (
    <section className="routeTrustPanel" aria-labelledby="route-trust-heading">
      <div>
        <p className="screenKicker">Recommendation audit</p>
        <h4 id="route-trust-heading">Why this comparison is trustworthy enough to use</h4>
        <p>
          The app compares saved tools, allowed information, task risk, and choosing style in this browser. It does not
          call an AI provider or treat the estimate as a live quote.
        </p>
      </div>
      <dl>
        <div>
          <dt>Best fit</dt>
          <dd>{recommended ? `${recommended.label} at ${recommended.score}/100` : "Manual review only"}</dd>
        </div>
        <div>
          <dt>Safety checks</dt>
          <dd>{blockedCount || warningCount ? `${blockedCount} blocked, ${warningCount} warning(s)` : "No blocks or warnings"}</dd>
        </div>
        <div>
          <dt>Routes compared</dt>
          <dd>
            {availableStrategyLabels}
            {unavailableStrategyLabels.length ? `; left out: ${unavailableStrategyLabels.join(", ")}` : ""}
          </dd>
        </div>
        <div>
          <dt>Pricing and energy data</dt>
          <dd>{impactDataFreshnessLabel(reviewedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}

function RouteHundredUseComparison({ options }: { options: readonly RouteOption[] }) {
  const optionByStrategy = new Map(options.map((option) => [option.strategy, option]));
  const series = routeStrategies.map((strategy) => {
    const option = optionByStrategy.get(strategy);

    return {
      color: routeChartColor(strategy),
      costPerUse: numericChartValue(option?.estimatedCostUsd),
      energyPerUse: numericChartValue(option?.estimatedEnergyWh),
      id: option?.id ?? `${strategy}-route-unavailable-chart-series`,
      label: option?.label ?? `${optionLabel(strategy)} route`,
      strategy,
      unavailable: option === undefined,
    };
  });

  const usageTicks = [0, 25, 50, 75, 100];
  const maxCost = maxChartValue(series.map((item) => item.costPerUse));
  const maxEnergy = maxChartValue(series.map((item) => item.energyPerUse));
  const xStart = 76;
  const xEnd = 1134;
  const costTop = 48;
  const energyTop = 124;
  const plotHeight = 42;
  const xForUse = (uses: number) => xStart + ((xEnd - xStart) * uses) / 100;
  const yForValue = (value: number, maxValue: number, top: number, showZeroFloor = false) =>
    top + plotHeight - linearChartRatio(value, maxValue, showZeroFloor) * plotHeight;

  return (
    <div className="routeHundredUseChart" aria-label="100 use route cost and energy comparison">
      <svg aria-labelledby="route-chart-title route-chart-desc" role="img" viewBox="0 0 1200 200">
        <title id="route-chart-title">100-use comparison</title>
        <desc id="route-chart-desc">
          Compares cumulative estimated cost and energy for available lean, balanced, and premium routes from 0 to 100
          uses on a linear cumulative scale, with exact 100-use totals shown below.
        </desc>
        <text className="chartTitle" x="76" y="20">
          100-use scenario
        </text>
        <text className="chartSubtitle" x="248" y="20">
          linear scale; exact totals below
        </text>

        <ChartPanelAxes
          label="Cost"
          maxLabel={formatUsd(maxCost)}
          plotHeight={plotHeight}
          top={costTop}
          xEnd={xEnd}
          xStart={xStart}
        />
        <ChartPanelAxes
          label="Energy"
          maxLabel={formatEnergyAxis(maxEnergy)}
          plotHeight={plotHeight}
          top={energyTop}
          xEnd={xEnd}
          xStart={xStart}
        />

        {usageTicks.map((tick) => (
          <g key={tick}>
            <line className="chartGridLine" x1={xForUse(tick)} x2={xForUse(tick)} y1={costTop} y2={energyTop + plotHeight} />
            <text className="chartTickLabel" textAnchor="middle" x={xForUse(tick)} y="188">
              {tick}
            </text>
          </g>
        ))}
        <text className="chartAxisTitle" textAnchor="middle" x={(xStart + xEnd) / 2} y="198">
          times used
        </text>

        {series.map((item) => (
          <ChartTrendLine
            key={`${item.id}-cost`}
            color={item.color}
            maxValue={maxCost}
            perUseValue={item.costPerUse}
            plotTop={costTop}
            showZeroFloor
            usageTicks={usageTicks}
            xForUse={xForUse}
            yForValue={yForValue}
          />
        ))}
        {series.map((item) => (
          <ChartTrendLine
            dashed
            key={`${item.id}-energy`}
            color={item.color}
            maxValue={maxEnergy}
            perUseValue={item.energyPerUse}
            plotTop={energyTop}
            usageTicks={usageTicks}
            xForUse={xForUse}
            yForValue={yForValue}
          />
        ))}

        <g className="chartLegend">
          {series.map((item, index) => (
            <g key={item.id} transform={`translate(${720 + index * 138} 16)`}>
              <line stroke={item.color} strokeLinecap="round" strokeWidth="4" x1="0" x2="22" y1="0" y2="0" />
              <text x="30" y="5">
                {item.unavailable ? `${item.label.replace(" route", "")} blocked` : item.label.replace(" route", "")}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className="routeHundredUseKey" aria-label="comparison chart key">
        <span>Solid: cost</span>
        <span>Dashed: energy</span>
        <span>Zero-dollar routes draw on a visible floor</span>
      </div>
      <div className="routeHundredUseTotals" aria-label="100 use totals">
        {series.map((item) => (
          <div key={item.id}>
            <strong>{item.label}</strong>
            <span>
              {item.unavailable
                ? "not available for the current setup"
                : `${chartCostTotalLabel(item.costPerUse)} and ${chartEnergyTotalLabel(item.energyPerUse)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartTrendLine({
  color,
  dashed = false,
  maxValue,
  perUseValue,
  plotTop,
  showZeroFloor = false,
  usageTicks,
  xForUse,
  yForValue,
}: {
  color: string;
  dashed?: boolean;
  maxValue: number;
  perUseValue: number | null;
  plotTop: number;
  showZeroFloor?: boolean;
  usageTicks: readonly number[];
  xForUse: (uses: number) => number;
  yForValue: (value: number, maxValue: number, top: number, showZeroFloor?: boolean) => number;
}) {
  if (perUseValue === null) {
    return null;
  }

  const shouldUseZeroFloor = showZeroFloor && perUseValue === 0;
  const points = usageTicks
    .map((tick) => `${xForUse(tick)},${yForValue(perUseValue * tick, maxValue, plotTop, shouldUseZeroFloor)}`)
    .join(" ");
  const endY = yForValue(perUseValue * 100, maxValue, plotTop, shouldUseZeroFloor);
  const lineClassName = dashed ? "chartSeriesLine chartSeriesLineDashed" : "chartSeriesLine";

  return (
    <g>
      <polyline className="chartSeriesHalo" fill="none" points={points} />
      <polyline className={lineClassName} fill="none" points={points} stroke={color} />
      <circle className="chartSeriesEndpointHalo" cx={xForUse(100)} cy={endY} r="5.5" />
      <circle cx={xForUse(100)} cy={endY} fill={color} r="4" />
    </g>
  );
}

function numericChartValue(value: number | undefined) {
  return value === undefined || !Number.isFinite(value) ? null : Math.max(0, value);
}

function maxChartValue(values: Array<number | null>) {
  const hundredUseValues = values.filter((value): value is number => value !== null).map((value) => value * 100);

  return Math.max(0.01, ...hundredUseValues);
}

function linearChartRatio(value: number, maxValue: number, showZeroFloor = false) {
  if (value === 0 && showZeroFloor && maxValue > 0) {
    return 0.055;
  }

  if (value <= 0 || maxValue <= 0) {
    return 0;
  }

  return Math.min(1, value / maxValue);
}

function chartCostTotalLabel(costPerUse: number | null) {
  return costPerUse === null ? "cost not estimated" : formatUsd(costPerUse * 100);
}

function chartEnergyTotalLabel(energyPerUse: number | null) {
  return energyPerUse === null ? "energy not estimated" : formatWattHours(energyPerUse * 100);
}

function ChartPanelAxes({
  label,
  maxLabel,
  plotHeight,
  top,
  xEnd,
  xStart,
}: {
  label: string;
  maxLabel: string;
  plotHeight: number;
  top: number;
  xEnd: number;
  xStart: number;
}) {
  return (
    <g>
      <text className="chartAxisTitle" x={xStart} y={top - 8}>
        {label}
      </text>
      <text className="chartTickLabel" textAnchor="end" x="68" y={top + 5}>
        {maxLabel}
      </text>
      <text className="chartTickLabel" textAnchor="end" x="68" y={top + plotHeight + 4}>
        0
      </text>
      <line className="chartAxisLine" x1={xStart} x2={xStart} y1={top} y2={top + plotHeight} />
      <line className="chartAxisLine" x1={xStart} x2={xEnd} y1={top + plotHeight} y2={top + plotHeight} />
      <line className="chartGridLine" x1={xStart} x2={xEnd} y1={top} y2={top} />
    </g>
  );
}

function RouteStrategyCard({
  result,
  strategy,
}: {
  result: GeneratedRouteResult;
  strategy: RouteOption["strategy"];
}) {
  const candidate = result.routeCard.options.find((routeOption) => routeOption.strategy === strategy);
  const unavailable = result.scoringResult.unavailable.find((routeCandidate) => routeCandidate.strategy === strategy);
  const recommended = candidate?.id === result.routeCard.recommendedOptionId;

  if (!candidate) {
    return (
      <section className="routeResultCard blockedRouteCard" aria-labelledby={`${strategy}-route-heading`}>
        <div className="routeCardHeader">
          <h4 id={`${strategy}-route-heading`}>{optionLabel(strategy)} route</h4>
          <span>Blocked</span>
        </div>
        <p>{plainRouteSummary(unavailable?.reason ?? "No safe route is available for this strategy.")}</p>
        <p className="routeSavingsDetail">
          Savings: this option is left out so the user does not spend time or money on a route that conflicts with the
          current setup.
        </p>
      </section>
    );
  }

  return (
    <section
      className={routeCardClassName({ recommended })}
      aria-labelledby={`${strategy}-route-heading`}
    >
      <div className="routeCardHeader">
        <h4 id={`${strategy}-route-heading`}>{candidate.label}</h4>
        <span>{recommended ? "Best fit" : fitLabel(candidate.score)}</span>
      </div>
      <p>{plainRouteSummary(candidate.summary)}</p>
      <dl>
        <div>
          <dt>Est. cost</dt>
          <dd>{routeCostLabel(candidate)}</dd>
        </div>
        <div>
          <dt>Est. saved</dt>
          <dd>{routeSavingsLabel(candidate)}</dd>
        </div>
        <div>
          <dt>Est. energy</dt>
          <dd>{routeEnergyLabel(candidate)}</dd>
        </div>
        <div>
          <dt>Steps</dt>
          <dd>{candidate.steps.length}</dd>
        </div>
      </dl>
      <ol>
        {candidate.steps.map((step) => (
          <li key={step.id}>
            <strong>{step.label}</strong>
            <span>{routeStepKindLabel(step.kind)}</span>
          </li>
        ))}
      </ol>
      <RouteCostSavingsDetail candidate={candidate} recommended={recommended} />
    </section>
  );
}

function RouteCostSavingsDetail({
  candidate,
  recommended,
}: {
  candidate: RouteOption;
  recommended: boolean;
}) {
  return (
    <div className="routeSavingsDetail" aria-label={`${candidate.label} cost and savings detail`}>
      <h5>Cost and savings</h5>
      <dl>
        <div>
          <dt>Estimated cost</dt>
          <dd>{routeCostLabel(candidate)}</dd>
        </div>
        <div>
          <dt>Estimated savings</dt>
          <dd>
            {routeSavingsLabel(candidate)} vs {candidate.savingsComparedWith ?? "the heavier route"}
          </dd>
        </div>
        <div>
          <dt>Estimated energy</dt>
          <dd>{routeEnergyLabel(candidate)}</dd>
        </div>
        <div>
          <dt>Energy saved</dt>
          <dd>
            {routeEnergySavingsLabel(candidate)} vs {candidate.savingsComparedWith ?? "the heavier route"}
          </dd>
        </div>
        <div>
          <dt>Use this when</dt>
          <dd>{routeUseCase(candidate)}</dd>
        </div>
        <div>
          <dt>What it can save</dt>
          <dd>{routeSavingsExplanation(candidate)}</dd>
        </div>
        <div>
          <dt>Tradeoff</dt>
          <dd>{routeTradeoff(candidate)}</dd>
        </div>
        <div>
          <dt>{recommended ? "Why this is best fit" : "When to choose it instead"}</dt>
          <dd>{routeSelectionCue(candidate, recommended)}</dd>
        </div>
        <div>
          <dt>Basis</dt>
          <dd>
            {candidate.costEstimateBasis ?? "Cost estimate unavailable for this saved option."}{" "}
            {candidate.energyEstimateBasis ?? "Energy estimate unavailable for this saved option."}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function routeCardClassName({ recommended }: { recommended: boolean }) {
  const classNames = ["routeResultCard"];

  if (recommended) {
    classNames.push("recommendedRouteCard");
  }

  return classNames.join(" ");
}

function ListSection({
  className,
  heading,
  items,
  lead,
}: {
  className: string;
  heading: string;
  items: string[];
  lead: string;
}) {
  return (
    <section className={`routingSection ${className}`} aria-labelledby={domIdFor(heading)}>
      <div className="sectionHeading">
        <h3 id={domIdFor(heading)}>{heading}</h3>
        <p>{lead}</p>
      </div>
      <ul>
        {items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function optionLabel(value: string) {
  return value
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function friendlyPolicyName(policyId: string, fallbackLabel: string) {
  if (policyId === "least-resource") {
    return "Save time and cost";
  }

  if (policyId === "quality-first") {
    return "Best quality when it matters";
  }

  if (policyId === "balanced") {
    return "Balanced for everyday work";
  }

  return fallbackLabel;
}

function fitLabel(score: number) {
  if (score >= 90) {
    return "Strong fit";
  }

  if (score >= 80) {
    return "Good fit";
  }

  if (score >= 65) {
    return "Possible fit";
  }

  return "Needs review";
}

function routeUseCase(candidate: RouteOption) {
  if (candidate.estimatedCostLevel === "low") {
    return "Use first for routine work, rough planning, or tasks where a human can quickly review the result.";
  }

  if (candidate.estimatedCostLevel === "medium") {
    return "Use when the task needs a clearer first pass, better synthesis, or less back-and-forth than the lightest path.";
  }

  return "Use when risk, quality, visibility, or complexity makes mistakes more expensive than the extra helper cost.";
}

function routeSavingsExplanation(candidate: RouteOption) {
  if (candidate.estimatedCostLevel === "low") {
    return candidate.estimatedEffortLevel === "high"
      ? "Provider spend stays low because you do more framing and review yourself."
      : "Paid or premium use stays lower by starting with the smallest adequate helper.";
  }

  if (candidate.estimatedCostLevel === "medium") {
    return "Time and rework may drop because the route uses enough help to produce a cleaner first plan.";
  }

  return "The savings are mostly risk savings: fewer expensive mistakes, missed checks, or weak public-facing outputs.";
}

function routeTradeoff(candidate: RouteOption) {
  if (candidate.estimatedCostLevel === "low") {
    return "You may need more patience, clearer instructions, and a stronger human review pass.";
  }

  if (candidate.estimatedCostLevel === "medium") {
    return "It spends more tool capacity than the lean route, so it should earn that cost by reducing rework.";
  }

  return "It uses the most resource, so it should be reserved for tasks where quality or risk truly matters.";
}

function routeSelectionCue(candidate: RouteOption, recommended: boolean) {
  if (recommended) {
    return "It best matches the current task details, saved tools, and choosing style.";
  }

  if (candidate.strategy === "lean") {
    return "Choose it if you want to test the lightest path first and are comfortable reviewing more yourself.";
  }

  if (candidate.strategy === "balanced") {
    return "Choose it if the lean path feels too thin but premium help would be more than the task deserves.";
  }

  return "Choose it if the result will be public, critical, complex, or expensive to fix later.";
}

function formatUsd(value: number) {
  const minimumFractionDigits = value > 0 && value < 0.1 ? 3 : 2;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits: 3,
  }).format(value);
}

function formatWattHours(value: number) {
  const absValue = Math.abs(value);
  const maximumFractionDigits = absValue > 100 ? 0 : absValue >= 10 ? 1 : 3;

  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: absValue > 0 && absValue < 1 ? 3 : 0,
  }).format(value)} Wh`;
}

function formatEnergyAxis(value: number) {
  if (value >= 1000) {
    return `${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
    }).format(value / 1000)} kWh`;
  }

  return formatWattHours(value);
}

function formatReviewedDate(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(timestamp));
}

function impactDataFreshnessLabel(reviewedAt: string) {
  const reviewedTime = new Date(reviewedAt).getTime();
  const ageInDays = Number.isFinite(reviewedTime)
    ? Math.max(0, Math.floor((Date.now() - reviewedTime) / 86_400_000))
    : null;
  const reviewedLabel = formatReviewedDate(reviewedAt);

  if (ageInDays === null) {
    return "Static public pricing and energy snapshot; verify exact provider pricing before relying on exact savings.";
  }

  if (ageInDays > 30) {
    return `Reviewed ${reviewedLabel}; ${ageInDays} days old, so refresh provider pricing before quoting exact savings.`;
  }

  return `Reviewed ${reviewedLabel}; useful for comparison, not a live provider quote.`;
}

function routeChartColor(strategy: RouteOption["strategy"]) {
  const colors: Record<RouteOption["strategy"], string> = {
    lean: "#0b82a6",
    balanced: "#6f8f2f",
    premium: "#94505d",
  };

  return colors[strategy];
}

function plainRouteSummary(summary: string) {
  return summary
    .replace(/hard-gate-allowed/g, "allowed by your choices")
    .replace(/allowed by your choices models and sources/g, "helpers and information allowed by your choices")
    .replace(/hard gates/g, "safety checks")
    .replace(/Hard gates/g, "Safety checks")
    .replace(/model path/g, "helper path")
    .replace(/route components/g, "helpers")
    .replace(/mid-tier/g, "everyday paid")
    .replace(/frontier/g, "strongest paid");
}

function userFacingRouteMessage(message: string) {
  if (message === "Add an AI app is disabled in the user's inventory.") {
    return "Unused AI app slots are disabled in setup.";
  }

  const noAccessMatch = message.match(/^(.*) is set to no access and cannot be used in a route\.$/);

  if (noAccessMatch?.[1]) {
    return `${noAccessMatch[1]} is left out for this task.`;
  }

  const permissionMatch = message.match(/^(.*) only supports permission level \d+, but this task needs level \d+\.$/);

  if (permissionMatch?.[1]) {
    return `${permissionMatch[1]} is set for more public information than this task uses.`;
  }

  const sensitivityMatch = message.match(/^(.*) does not allow (.*) tasks\.$/);

  if (sensitivityMatch?.[1] && sensitivityMatch[2]) {
    return `${sensitivityMatch[1]} is not turned on for ${sensitivityMatch[2]} information.`;
  }

  return plainRouteSummary(message);
}

function uniqueMessages(messages: string[]) {
  return [...new Set(messages)];
}

function routeStepKindLabel(kind: RouteOption["steps"][number]["kind"]) {
  if (kind === "model") {
    return "AI helper";
  }

  if (kind === "human review") {
    return "human review";
  }

  if (kind === "artifact") {
    return "document/table helper";
  }

  return kind;
}

function friendlyTaskOptionLabel(value: string) {
  const labels: Record<string, string> = {
    research: "Research",
    synthesis: "Summarize or combine information",
    analysis: "Analyze or compare",
    writing: "Write or rewrite",
    coding: "Code or technical review",
    planning: "Planning",
    review: "Review or critique",
    packaging: "Package into a usable format",
    answer: "A direct answer",
    brief: "A short brief",
    plan: "A working plan",
    draft: "A draft",
    code: "Code",
    table: "A table",
    "slide outline": "A slide outline",
    "route card": "A decision card",
    "prompt package": "Copy-ready prompts",
    quick: "Quick and good enough",
    standard: "Solid everyday quality",
    high: "High quality",
    critical: "Very careful",
    public: "Public or shareable information",
    internal: "Ordinary work information",
    confidential: "Confidential or private information",
    regulated: "Regulated information",
    "highly restricted": "Very sensitive information",
    "public-facing risk": "Something that may be published",
  };

  return labels[value] ?? optionLabel(value);
}

function extraCareSummary(draft: TaskRoutingController["draft"]) {
  const items = [];

  if (draft.requiresCurrentFacts) {
    items.push("current facts");
  }

  if (draft.requiresCitations) {
    items.push("citations");
  }

  if (draft.publicFacing) {
    items.push("public-ready review");
  }

  return items.length ? items.join(", ") : "No extra checks selected";
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function taskSourceLabel(source: SourcePermission) {
  const labels: Record<string, string> = {
    "local-files": "A file or folder",
    "uploaded-documents": "Documents or text I will paste",
    web: "A website or current search",
    github: "A repo or code page",
    "m365-sharepoint": "Work docs or SharePoint",
    "google-drive": "Google Drive",
    "personal-memory": "Notes or background I already know",
    "other-source": "Something else I will supply",
  };

  return labels[source.id] ?? source.label;
}

function taskSourceHint(source: SourcePermission) {
  const hints: Record<string, string> = {
    "local-files": "Use when a document, spreadsheet, folder, or screenshot matters.",
    "uploaded-documents": "Use when you will paste the relevant text yourself.",
    web: "Use when a page, article, or fresh fact needs checking.",
    github: "Use when code, issues, docs, or repo context matter.",
    "m365-sharepoint": "Use only for work material you are allowed to use.",
    "google-drive": "Use when Drive docs or sheets should shape the answer.",
    "personal-memory": "Use when your own notes or background context matter.",
    "other-source": "Use when the information does not fit the other choices.",
  };

  if (source.permissionLevel === 0) {
    return "This was selected by a shortcut but is not available in this setup.";
  }

  return hints[source.id] ?? "Use when this information should shape the answer.";
}

function domIdFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
