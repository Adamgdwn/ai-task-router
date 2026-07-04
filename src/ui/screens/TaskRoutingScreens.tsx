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
            <h3 id="task-template-heading">Start with a common job</h3>
            <p>Choose the closest starting point, then adjust anything that does not fit.</p>
          </div>

          <label className="wideField">
            <span>Start with</span>
            <select
              aria-label="Start with"
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
            <h3 id="task-basics-heading">What are you trying to get done?</h3>
            <p>Give the app enough context to choose a useful path without overcomplicating the job.</p>
          </div>

          <div className="formGrid compactFormGrid">
            <FieldShell field="id" label="Reference name" routing={routing}>
              <input
                aria-label="Reference name"
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
            <h3 id="task-context-heading">What should the finished thing look like?</h3>
            <p>These choices help the app avoid using a heavy path for a small job, or a light path for serious work.</p>
          </div>

          <div className="formGrid">
            <SelectField
              field="dmaicPhase"
              label="Where are you in the work?"
              onChange={(value) => routing.updateDraftField("dmaicPhase", value as TaskIntake["dmaicPhase"])}
              options={dmaicPhases}
              routing={routing}
              value={routing.draft.dmaicPhase}
            />
            <SelectField
              field="lifecycleStage"
              label="Stage"
              onChange={(value) => routing.updateDraftField("lifecycleStage", value as TaskIntake["lifecycleStage"])}
              options={lifecycleStages}
              routing={routing}
              value={routing.draft.lifecycleStage}
            />
            <SelectField
              field="knowledgeWorkType"
              label="Kind of work"
              onChange={(value) =>
                routing.updateDraftField("knowledgeWorkType", value as TaskIntake["knowledgeWorkType"])
              }
              options={knowledgeWorkTypes}
              routing={routing}
              value={routing.draft.knowledgeWorkType}
            />
            <SelectField
              field="outputType"
              label="Finished format"
              onChange={(value) => routing.updateDraftField("outputType", value as TaskIntake["outputType"])}
              options={outputTypes}
              routing={routing}
              value={routing.draft.outputType}
            />
            <SelectField
              field="qualityBar"
              label="How good does it need to be?"
              onChange={(value) => routing.updateDraftField("qualityBar", value as TaskIntake["qualityBar"])}
              options={qualityBars}
              routing={routing}
              value={routing.draft.qualityBar}
            />
            <SelectField
              field="sensitivityClass"
              label="How private is it?"
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
              label="Effort preference"
              onChange={(value) => routing.updateDraftField("energyPreference", value as TaskIntake["energyPreference"])}
              options={preferenceOptions}
              routing={routing}
              value={routing.draft.energyPreference}
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
            <h3 id="requested-sources-heading">What information should be considered?</h3>
            <p>Choose only the ingredients you intend to consult or paste manually outside the app.</p>
          </div>

          {setup.configuration?.sourcePermissionRegistry.length ? (
            <fieldset className="sourceChoiceGrid">
              <legend>Information ingredients</legend>
              {setup.configuration.sourcePermissionRegistry.map((source) => (
                <label key={source.id}>
                  <input
                    checked={routing.draft.requestedSourceIds.includes(source.id)}
                    onChange={() => routing.toggleRequestedSource(source.id)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{source.label}</strong>
                    <small>{sourceChoiceHint(source.permissionLevel)}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="emptySetupState">Information comfort choices are not loaded yet.</p>
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
          No safe option is available yet. Use manual review only until the task details or comfort choices are corrected.
        </div>
      ) : null}

      <section className="resultSummaryBand" aria-labelledby="result-summary-heading">
        <div>
          <p className="screenKicker">Best fit</p>
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
          <h3 id="route-comparison-heading">Your options</h3>
          <p>Each option is a recommendation only. You choose what to copy, paste, or ignore.</p>
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
          heading="Left out for safety"
          items={result.routeCard.blockedRoutes.map((blockedRoute) => blockedRoute.reason)}
          lead="These ingredients or helpers were removed because they do not fit your comfort choices."
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

function sourceChoiceHint(permissionLevel: number) {
  if (permissionLevel === 0) {
    return "Not allowed by your comfort choices";
  }

  if (permissionLevel === 1) {
    return "Public or shareable information";
  }

  if (permissionLevel === 2) {
    return "Ordinary work information";
  }

  if (permissionLevel === 3) {
    return "Confidential information when appropriate";
  }

  return "Sensitive information only when you explicitly choose it";
}

function domIdFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
