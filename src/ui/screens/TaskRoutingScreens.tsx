import type { FormEvent, ReactNode } from "react";
import {
  dmaicPhases,
  knowledgeWorkTypes,
  lifecycleStages,
  outputTypes,
  qualityBars,
  routeStrategies,
  sensitivityClasses,
} from "../../domain/schemas";
import type { RouteOption, TaskIntake } from "../../domain/types";
import type {
  GeneratedRouteResult,
  TaskRoutingController,
  TaskRoutingDraft,
  TaskRoutingErrorField,
} from "../state/useTaskRouting";
import type { SetupConfigurationController } from "../state/useSetupConfiguration";
import { ScreenHeader } from "./SetupScreens";
import type { ScreenDefinition } from "./screenDefinitions";

type TaskRoutingScreenProps = {
  definition: ScreenDefinition;
  routing: TaskRoutingController;
  setup: SetupConfigurationController;
};

type TaskIntakeScreenProps = TaskRoutingScreenProps & {
  onRouteGenerated: () => void;
};

type RouteResultsScreenProps = TaskRoutingScreenProps & {
  onOpenTaskIntake: () => void;
};

const preferenceOptions = ["minimize", "balanced", "quality first"] as const;

export function TaskIntakeScreen({ definition, routing, setup, onRouteGenerated }: TaskIntakeScreenProps) {
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

        <section className="routingSection" aria-labelledby="task-template-heading">
          <div className="sectionHeading">
            <h3 id="task-template-heading">Task template</h3>
            <p>Templates set sensible defaults while keeping every field editable.</p>
          </div>

          <label className="wideField">
            <span>Start from template</span>
            <select
              aria-label="Start from template"
              onChange={(event) => routing.applyTemplate(event.target.value as TaskRoutingDraft["templateId"])}
              value={routing.draft.templateId}
            >
              <option value="custom">Custom task</option>
              {routing.templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="routingSection" aria-labelledby="task-basics-heading">
          <div className="sectionHeading">
            <h3 id="task-basics-heading">Task intake</h3>
            <p>These fields become the local task record used by hard gates and scoring.</p>
          </div>

          <div className="formGrid compactFormGrid">
            <FieldShell field="id" label="Task reference" routing={routing}>
              <input
                aria-label="Task reference"
                onChange={(event) => routing.updateDraftField("id", event.target.value)}
                value={routing.draft.id}
              />
            </FieldShell>
            <FieldShell field="title" label="Task title" routing={routing}>
              <input
                aria-label="Task title"
                onChange={(event) => routing.updateDraftField("title", event.target.value)}
                value={routing.draft.title}
              />
            </FieldShell>
          </div>

          <FieldShell field="description" label="Task description" routing={routing}>
            <textarea
              aria-label="Task description"
              onChange={(event) => routing.updateDraftField("description", event.target.value)}
              rows={4}
              value={routing.draft.description}
            />
          </FieldShell>
        </section>

        <section className="routingSection" aria-labelledby="task-context-heading">
          <div className="sectionHeading">
            <h3 id="task-context-heading">Context and output</h3>
            <p>Route scoring uses work type, output type, quality, cost, energy, and lifecycle context.</p>
          </div>

          <div className="formGrid">
            <SelectField
              field="dmaicPhase"
              label="DMAIC phase"
              onChange={(value) => routing.updateDraftField("dmaicPhase", value as TaskIntake["dmaicPhase"])}
              options={dmaicPhases}
              routing={routing}
              value={routing.draft.dmaicPhase}
            />
            <SelectField
              field="lifecycleStage"
              label="Lifecycle stage"
              onChange={(value) => routing.updateDraftField("lifecycleStage", value as TaskIntake["lifecycleStage"])}
              options={lifecycleStages}
              routing={routing}
              value={routing.draft.lifecycleStage}
            />
            <SelectField
              field="knowledgeWorkType"
              label="Work type"
              onChange={(value) =>
                routing.updateDraftField("knowledgeWorkType", value as TaskIntake["knowledgeWorkType"])
              }
              options={knowledgeWorkTypes}
              routing={routing}
              value={routing.draft.knowledgeWorkType}
            />
            <SelectField
              field="outputType"
              label="Output type"
              onChange={(value) => routing.updateDraftField("outputType", value as TaskIntake["outputType"])}
              options={outputTypes}
              routing={routing}
              value={routing.draft.outputType}
            />
            <SelectField
              field="qualityBar"
              label="Quality bar"
              onChange={(value) => routing.updateDraftField("qualityBar", value as TaskIntake["qualityBar"])}
              options={qualityBars}
              routing={routing}
              value={routing.draft.qualityBar}
            />
            <SelectField
              field="sensitivityClass"
              label="Sensitivity class"
              onChange={(value) => routing.updateDraftField("sensitivityClass", value as TaskIntake["sensitivityClass"])}
              options={sensitivityClasses}
              routing={routing}
              value={routing.draft.sensitivityClass}
            />
            <SelectField
              field="costPreference"
              label="Cost preference"
              onChange={(value) => routing.updateDraftField("costPreference", value as TaskIntake["costPreference"])}
              options={preferenceOptions}
              routing={routing}
              value={routing.draft.costPreference}
            />
            <SelectField
              field="energyPreference"
              label="Energy preference"
              onChange={(value) => routing.updateDraftField("energyPreference", value as TaskIntake["energyPreference"])}
              options={preferenceOptions}
              routing={routing}
              value={routing.draft.energyPreference}
            />
          </div>
        </section>

        <section className="routingSection" aria-labelledby="task-needs-heading">
          <div className="sectionHeading">
            <h3 id="task-needs-heading">Output needs</h3>
            <p>These switches trigger warnings and human approval when the task needs extra care.</p>
          </div>

          <fieldset className="checkboxGrid routeToggleGrid">
            <legend>Needs and approval flags</legend>
            <label>
              <input
                checked={routing.draft.requiresCurrentFacts}
                onChange={(event) => routing.updateDraftField("requiresCurrentFacts", event.target.checked)}
                type="checkbox"
              />
              <span>Current facts</span>
            </label>
            <label>
              <input
                checked={routing.draft.requiresCitations}
                onChange={(event) => routing.updateDraftField("requiresCitations", event.target.checked)}
                type="checkbox"
              />
              <span>Citations</span>
            </label>
            <label>
              <input
                checked={routing.draft.publicFacing}
                onChange={(event) => routing.updateDraftField("publicFacing", event.target.checked)}
                type="checkbox"
              />
              <span>Public-facing</span>
            </label>
          </fieldset>
        </section>

        <section className="routingSection" aria-labelledby="requested-sources-heading">
          <div className="sectionHeading">
            <h3 id="requested-sources-heading">Requested sources</h3>
            <p>Choose only source classes the user intends to consult manually outside the app.</p>
          </div>

          {setup.configuration?.sourcePermissionRegistry.length ? (
            <fieldset className="sourceChoiceGrid">
              <legend>Requested source IDs</legend>
              {setup.configuration.sourcePermissionRegistry.map((source) => (
                <label key={source.id}>
                  <input
                    checked={routing.draft.requestedSourceIds.includes(source.id)}
                    onChange={() => routing.toggleRequestedSource(source.id)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{source.label}</strong>
                    <small>
                      {source.id} | level {source.permissionLevel}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="emptySetupState">Local source permissions are not loaded yet.</p>
          )}
          <FieldError field="requestedSourceIds" routing={routing} />
        </section>

        <div className="routingActions">
          <button disabled={!routing.canRoute} type="submit">
            Generate local routes
          </button>
          <span aria-live="polite" role="status">
            {routing.routingMessage}
          </span>
        </div>
      </form>
    </article>
  );
}

export function RouteResultsScreen({ definition, routing, setup, onOpenTaskIntake }: RouteResultsScreenProps) {
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
        <GeneratedResults result={result} routing={routing} setup={setup} />
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
    return <div className="loadingPanel">Loading local setup before route planning.</div>;
  }

  if (setup.dirty) {
    return (
      <p className="setupBoundaryNote">
        Local setup has unsaved changes. Save setup first if these route assumptions should persist after refresh.
      </p>
    );
  }

  return (
    <p className="setupBoundaryNote">
      Routing runs in this browser from the local setup, task intake, and policy default. The app does not search,
      connect accounts, call providers, or execute the route.
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
            {optionLabel(option)}
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
      <h3 id="empty-results-heading">{invalid ? "Task intake needs correction" : "No route results yet"}</h3>
      <p>
        {invalid
          ? "Fix the task intake fields with inline errors, then generate local routes again."
          : "Enter a task and generate local routes to compare lean, balanced, and premium options."}
      </p>
      <button onClick={onOpenTaskIntake} type="button">
        Open Task Intake
      </button>
    </section>
  );
}

function GeneratedResults({
  result,
  routing,
  setup,
}: {
  result: GeneratedRouteResult;
  routing: TaskRoutingController;
  setup: SetupConfigurationController;
}) {
  const recommended = result.routeCard.options.find((option) => option.id === result.routeCard.recommendedOptionId);

  return (
    <div className="resultsStack">
      {result.noSafeGeneratedRoute ? (
        <div className="setupAlert" role="alert">
          No safe generated route is available. Use manual review only until setup or task constraints are corrected.
        </div>
      ) : null}

      <section className="resultSummaryBand" aria-labelledby="result-summary-heading">
        <div>
          <p className="screenKicker">Recommended route</p>
          <h3 id="result-summary-heading">{recommended?.label ?? "Manual review required"}</h3>
          <p>{recommended?.summary ?? "Review blocked routes before deciding what to do outside the app."}</p>
        </div>
        <dl>
          <div>
            <dt>Policy</dt>
            <dd>{setup.activePolicy?.label ?? result.scoringResult.selectedPolicyLabel}</dd>
          </div>
          <div>
            <dt>Score</dt>
            <dd>{recommended ? recommended.score : 0}</dd>
          </div>
          <div>
            <dt>Prompt steps</dt>
            <dd>{result.promptPackage.steps.length}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{formatTimestamp(result.generatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="routingSection" aria-labelledby="route-comparison-heading">
        <div className="sectionHeading">
          <h3 id="route-comparison-heading">Route comparison</h3>
          <p>Each route remains recommendation-only and must be run manually outside the app.</p>
        </div>
        <div className="routeComparisonGrid">
          {routeStrategies.map((strategy) => (
            <RouteStrategyCard key={strategy} result={result} strategy={strategy} />
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
          heading="Blocked routes"
          items={result.routeCard.blockedRoutes.map((blockedRoute) => blockedRoute.reason)}
          lead="These sources, models, or route states were removed by local gates."
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
          <h3 id="save-route-heading">Save local records</h3>
          <p>Stores this route card and prompt package in IndexedDB on this device.</p>
        </div>
        <button
          disabled={routing.saveStatus === "saving" || routing.saveStatus === "saved"}
          onClick={() => void routing.saveGeneratedRoute()}
          type="button"
        >
          {routing.saveStatus === "saved" ? "Saved locally" : "Save route card and prompt package"}
        </button>
        <span aria-live="polite" role="status">
          {routing.saveMessage}
        </span>
      </section>
    </div>
  );
}

function RouteStrategyCard({
  result,
  strategy,
}: {
  result: GeneratedRouteResult;
  strategy: RouteOption["strategy"];
}) {
  const candidate = result.scoringResult.scoredCandidates.find((routeCandidate) => routeCandidate.strategy === strategy);
  const unavailable = result.scoringResult.unavailable.find((routeCandidate) => routeCandidate.strategy === strategy);
  const recommended = candidate?.id === result.scoringResult.recommendedCandidateId;

  if (!candidate) {
    return (
      <section className="routeResultCard blockedRouteCard" aria-labelledby={`${strategy}-route-heading`}>
        <div className="routeCardHeader">
          <h4 id={`${strategy}-route-heading`}>{optionLabel(strategy)} route</h4>
          <span>Blocked</span>
        </div>
        <p>{unavailable?.reason ?? "No safe route is available for this strategy."}</p>
      </section>
    );
  }

  return (
    <section className={recommended ? "routeResultCard recommendedRouteCard" : "routeResultCard"} aria-labelledby={`${strategy}-route-heading`}>
      <div className="routeCardHeader">
        <h4 id={`${strategy}-route-heading`}>{candidate.label}</h4>
        <span>{recommended ? "Recommended route" : `${candidate.score} score`}</span>
      </div>
      <p>{candidate.summary}</p>
      <dl>
        <div>
          <dt>Cost</dt>
          <dd>{candidate.estimatedCostLevel}</dd>
        </div>
        <div>
          <dt>Effort</dt>
          <dd>{candidate.estimatedEffortLevel}</dd>
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
            <span>{step.kind}</span>
          </li>
        ))}
      </ol>
    </section>
  );
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
        {items.map((item) => (
          <li key={item}>{item}</li>
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

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function domIdFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
