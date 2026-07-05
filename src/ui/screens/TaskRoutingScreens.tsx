import type { FormEvent, ReactNode } from "react";
import { buildDefaultPublicImpactSnapshot, type PublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
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
import { ScreenHeader } from "./SetupScreens";
import type { ScreenDefinition } from "./screenDefinitions";

const publicImpactSnapshot = buildDefaultPublicImpactSnapshot();

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
            <p>These choices keep the recommendation practical without turning this into a project plan.</p>
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
          No safe option is available yet. Use manual review only until the task details or information choices are adjusted.
        </div>
      ) : null}

      <section className="resultSummaryBand" aria-labelledby="result-summary-heading">
        <div>
          <p className="screenKicker">Best fit</p>
          <h3 id="result-summary-heading">{recommended?.label ?? "Manual review required"}</h3>
          <p>{plainRouteSummary(recommended?.summary ?? "Review what was left out before deciding what to do outside the app.")}</p>
        </div>
        <dl>
          <div>
            <dt>Style</dt>
            <dd>{friendlyPolicyName(result.scoringResult.selectedPolicyId, setup.activePolicy?.label ?? result.scoringResult.selectedPolicyLabel)}</dd>
          </div>
          <div>
            <dt>Fit</dt>
            <dd>{recommended ? fitLabel(recommended.score) : "Needs review"}</dd>
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

      <ImpactInsightPanel recommended={recommended} snapshot={publicImpactSnapshot} />

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
          items={result.routeCard.blockedRoutes.map((blockedRoute) => userFacingRouteMessage(blockedRoute.reason))}
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

function ImpactInsightPanel({
  recommended,
  snapshot,
}: {
  recommended: RouteOption | undefined;
  snapshot: PublicImpactSnapshot;
}) {
  return (
    <section className="impactSection" aria-labelledby="impact-insight-heading">
      <div className="impactLead">
        <p className="screenKicker">Why choosing well matters</p>
        <h3 id="impact-insight-heading">Every task is a chance to build better AI judgment.</h3>
        <p>
          This app does not run AI or promise savings. It shows when a smaller, cheaper, lower-effort route may be
          enough before you paste anything into a provider.
        </p>
        <p className="impactCaveat">
          Example estimates use reviewed public API pricing and energy research. They are not your bill, and they are not
          a guarantee.
        </p>
      </div>

      <dl className="impactMetricGrid">
        <div>
          <dt>100k-token example</dt>
          <dd>
            {formatUsd(snapshot.tokenBenchmark.lowerCostUsd)} vs {formatUsd(snapshot.tokenBenchmark.comparisonCostUsd)}
          </dd>
          <span>
            {snapshot.tokenBenchmark.lowerCostModelLabel} compared with {snapshot.tokenBenchmark.comparisonModelLabel}.
          </span>
        </div>
        <div>
          <dt>Right-sizing scenario</dt>
          <dd>{formatUsd(snapshot.rightSizingExample.netAvoidedCostUsd)}</dd>
          <span>
            Example net avoided API cost across {snapshot.rightSizingExample.taskCount} similar tasks after{" "}
            {snapshot.rightSizingExample.inducedExtraRuns} extra smaller-model runs.
          </span>
        </div>
        <div>
          <dt>Energy scenario</dt>
          <dd>{formatWattHours(snapshot.environmentalExample.netAvoidedWattHours)}</dd>
          <span>
            Example avoided compute for {snapshot.environmentalExample.taskCount} reasoning tasks when half route to a
            lighter text workload.
          </span>
        </div>
        <div>
          <dt>Skill payoff</dt>
          <dd>Better defaults</dd>
          <span>Learn when simple, review, or premium help is the right starting point.</span>
        </div>
      </dl>

      <p className="impactRouteNote">{routeImpactMessage(recommended)}</p>

      <details className="impactDetails">
        <summary>Method and sources</summary>
        <p>
          Snapshot reviewed {formatReviewedDate(snapshot.reviewedAt)}. The 100k-token example uses{" "}
          {formatInteger(snapshot.tokenBenchmark.inputTokens)} input tokens and{" "}
          {formatInteger(snapshot.tokenBenchmark.outputTokens)} output tokens. Add-ons, subscriptions, taxes, regional
          pricing, free tiers, rate limits, caching, media, search, and provider changes can alter the real result.
        </p>
        <ul className="impactSourceLinks">
          {snapshot.sourceLinks.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noreferrer" target="_blank">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
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
        <p>{plainRouteSummary(unavailable?.reason ?? "No safe route is available for this strategy.")}</p>
      </section>
    );
  }

  return (
    <section className={recommended ? "routeResultCard recommendedRouteCard" : "routeResultCard"} aria-labelledby={`${strategy}-route-heading`}>
      <div className="routeCardHeader">
        <h4 id={`${strategy}-route-heading`}>{candidate.label}</h4>
        <span>{recommended ? "Best fit" : fitLabel(candidate.score)}</span>
      </div>
      <p>{plainRouteSummary(candidate.summary)}</p>
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
            <span>{routeStepKindLabel(step.kind)}</span>
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
    planning: "Make a rough plan",
    review: "Review or critique",
    packaging: "Package into a usable format",
    answer: "A direct answer",
    brief: "A short brief",
    plan: "A rough structure",
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

function formatReviewedDate(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(timestamp));
}

function formatInteger(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatUsd(value: number) {
  return new Intl.NumberFormat(undefined, {
    currency: "USD",
    maximumFractionDigits: Math.abs(value) < 1 ? 3 : 2,
    minimumFractionDigits: Math.abs(value) < 1 ? 3 : 2,
    style: "currency",
  }).format(value);
}

function formatWattHours(value: number) {
  return `${formatInteger(Math.round(value))} Wh`;
}

function routeImpactMessage(recommended: RouteOption | undefined) {
  if (!recommended) {
    return "When no safe route is available, the lowest-impact move is to pause and adjust the task instead of forcing a tool.";
  }

  if (recommended.estimatedCostLevel === "low") {
    return "Your current best option is already a low-cost path. Treat that as a learning signal: smaller can be enough when the task is straightforward.";
  }

  if (recommended.estimatedCostLevel === "medium") {
    return "Your current best option balances resource use and quality. If this is routine, compare the lean route before using a heavier tool.";
  }

  return "Your current best option spends more resource because quality or risk appears to matter. Use it intentionally, then keep lighter routes for simpler follow-ups.";
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
