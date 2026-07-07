import { useMemo } from "react";
import {
  serializePromptPackageMarkdown,
  serializeRouteCardMarkdown,
} from "../../domain/export/exportImport";
import { buildDefaultPublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
import type { PromptPackage, PromptStep, RouteCard, RouteOption, RouteStep } from "../../domain/types";
import type { RouteArtifactsController } from "../state/useRouteArtifacts";
import { ImpactInsightPanel } from "./ImpactInsightPanel";
import { ScreenHeader } from "./SetupScreens";
import type { ScreenDefinition } from "./screenDefinitions";
import { StageGuidancePanel } from "./StageGuidancePanel";

const publicImpactSnapshot = buildDefaultPublicImpactSnapshot();

type RouteArtifactScreenProps = {
  definition: ScreenDefinition;
  artifacts: RouteArtifactsController;
  onOpenTaskIntake: () => void;
};

export function SavedRouteCardScreen({ definition, artifacts, onOpenTaskIntake }: RouteArtifactScreenProps) {
  const routeCard = artifacts.selectedRouteCard;
  const promptPackage = artifacts.selectedPromptPackage;
  const recommendedRoute = routeCard ? recommendedOptionFor(routeCard) : null;
  const routeCardMarkdown = useMemo(() => {
    if (!routeCard || !promptPackage) {
      return "";
    }

    return serializeRouteCardMarkdown(routeCard, promptPackage);
  }, [promptPackage, routeCard]);

  return (
    <article className="screenPanel artifactPanel">
      <ScreenHeader definition={definition} />
      <RouteArtifactToolbar artifacts={artifacts} />

      <RouteArtifactStatus artifacts={artifacts} onOpenTaskIntake={onOpenTaskIntake} />

      {routeCard && promptPackage ? (
        <div className="artifactStack">
          <RouteReportHeader routeCard={routeCard} />
          <RouteCardSummary routeCard={routeCard} />
          <StageGuidancePanel
            stages={routeCard.stageGuidance}
            lead="This quick project plan was saved with the decision card so the route stays easy to follow later."
          />
          <ImpactInsightPanel recommended={recommendedRoute ?? undefined} snapshot={publicImpactSnapshot} />
          <MarkdownExportPanel
            copyLabel="Route card Markdown"
            downloadName={artifactFileName("route-card", routeCard.title, routeCard.id)}
            markdown={routeCardMarkdown}
            onPrintReport={printRouteReport}
            previewLabel="Prepared route card Markdown"
            artifacts={artifacts}
          />
          <RouteCardWarnings routeCard={routeCard} />
          <RouteOptionList routeCard={routeCard} />
        </div>
      ) : null}
    </article>
  );
}

export function SavedPromptPackageScreen({ definition, artifacts, onOpenTaskIntake }: RouteArtifactScreenProps) {
  const routeCard = artifacts.selectedRouteCard;
  const promptPackage = artifacts.selectedPromptPackage;
  const promptPackageMarkdown = useMemo(
    () => (promptPackage ? serializePromptPackageMarkdown(promptPackage) : ""),
    [promptPackage],
  );

  return (
    <article className="screenPanel artifactPanel">
      <ScreenHeader definition={definition} />
      <RouteArtifactToolbar artifacts={artifacts} />

      <RouteArtifactStatus artifacts={artifacts} onOpenTaskIntake={onOpenTaskIntake} />

      {routeCard && promptPackage ? (
        <div className="artifactStack">
          <PromptPackageSummary promptPackage={promptPackage} routeCard={routeCard} />
          <MarkdownExportPanel
            copyLabel="Prompt package Markdown"
            downloadName={artifactFileName("prompt-package", promptPackage.title, promptPackage.id)}
            markdown={promptPackageMarkdown}
            previewLabel="Prepared prompt package Markdown"
            artifacts={artifacts}
          />
          <PromptStepList artifacts={artifacts} promptPackage={promptPackage} />
        </div>
      ) : null}
    </article>
  );
}

function RouteReportHeader({ routeCard }: { routeCard: RouteCard }) {
  return (
    <section aria-hidden="true" className="printOnly routeReportHeader">
      <p>AI Task Router report</p>
      <h2>{routeCard.title}</h2>
      <span>Prepared locally on this device. No provider calls were made by this app.</span>
    </section>
  );
}

function RouteArtifactToolbar({ artifacts }: { artifacts: RouteArtifactsController }) {
  return (
    <section className="artifactToolbar" aria-labelledby="saved-route-selector-heading">
      <div>
        <h3 id="saved-route-selector-heading">Saved plan</h3>
        <p aria-live="polite" role="status">
          {artifacts.statusMessage}
        </p>
      </div>

      <label>
        <span>Saved decision card</span>
        <select
          aria-label="Saved decision card"
          disabled={artifacts.routeCards.length === 0}
          onChange={(event) => artifacts.selectRouteCard(event.target.value)}
          value={artifacts.selectedRouteCard ? artifacts.selectedRouteCard.id : ""}
        >
          <option value="">Choose saved decision card</option>
          {artifacts.routeCards.map((routeCard) => (
            <option key={routeCard.id} value={routeCard.id}>
              {routeCard.title} - {formatTimestamp(routeCard.createdAt)}
            </option>
          ))}
        </select>
      </label>

      <button disabled={artifacts.status === "loading"} onClick={() => void artifacts.refresh()} type="button">
        Refresh saved plans
      </button>
    </section>
  );
}

function RouteArtifactStatus({
  artifacts,
  onOpenTaskIntake,
}: {
  artifacts: RouteArtifactsController;
  onOpenTaskIntake: () => void;
}) {
  if (artifacts.status === "loading" && !artifacts.routeRecords) {
    return <div className="loadingPanel">Loading saved plans from this browser.</div>;
  }

  if (artifacts.status === "error") {
    return (
      <div className="setupAlert" role="alert">
        {artifacts.statusMessage}
      </div>
    );
  }

  if (artifacts.status === "empty" || artifacts.routeCards.length === 0) {
    return (
      <section className="emptyResultsState" aria-labelledby="empty-artifacts-heading">
        <h3 id="empty-artifacts-heading">No saved plans yet</h3>
        <p>Describe a task, choose an option, then save its decision card and prompts before viewing them here.</p>
        <button onClick={onOpenTaskIntake} type="button">
          Describe my task
        </button>
      </section>
    );
  }

  if (artifacts.selectedRouteCardMissing) {
    return (
      <div className="setupAlert" role="alert">
        The selected decision card is no longer available in this browser. Choose another saved plan or refresh the list.
      </div>
    );
  }

  return null;
}

function RouteCardSummary({ routeCard }: { routeCard: RouteCard }) {
  const recommendedRoute = recommendedOptionFor(routeCard);
  const approvalStepCount = routeCard.promptPackage.steps.filter((step) => step.requiresHumanApproval).length;

  return (
    <section className="artifactSummaryBand" aria-labelledby="route-card-summary-heading">
      <div>
        <p className="screenKicker">Decision card</p>
        <h3 id="route-card-summary-heading">{routeCard.title}</h3>
        <p>{recommendedRoute?.summary ?? "Review this decision card before using any prompts outside the app."}</p>
      </div>
      <dl>
        <div>
          <dt>Created</dt>
          <dd>{formatTimestamp(routeCard.createdAt)}</dd>
        </div>
        <div>
          <dt>Privacy</dt>
          <dd>{routeCard.sensitivityClass}</dd>
        </div>
        <div>
          <dt>Best fit</dt>
          <dd>{recommendedRoute?.label ?? routeCard.recommendedOptionId}</dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{recommendedRoute?.score ?? 0}</dd>
        </div>
        <div>
          <dt>Options</dt>
          <dd>{routeCard.options.length}</dd>
        </div>
        <div>
          <dt>Approval steps</dt>
          <dd>{approvalStepCount}</dd>
        </div>
      </dl>
    </section>
  );
}

function PromptPackageSummary({
  promptPackage,
  routeCard,
}: {
  promptPackage: PromptPackage;
  routeCard: RouteCard;
}) {
  const humanApprovalSteps = promptPackage.steps.filter((step) => step.requiresHumanApproval).length;

  return (
    <section className="artifactSummaryBand" aria-labelledby="prompt-package-summary-heading">
      <div>
        <p className="screenKicker">Copy-ready prompts</p>
        <h3 id="prompt-package-summary-heading">{promptPackage.title}</h3>
        <p>Ordered prompt steps for the saved decision card. The app prepares text only; you run each step manually.</p>
      </div>
      <dl>
        <div>
          <dt>Decision card</dt>
          <dd>{routeCard.title}</dd>
        </div>
        <div>
          <dt>Task ID</dt>
          <dd>{promptPackage.taskId}</dd>
        </div>
        <div>
          <dt>Prompt steps</dt>
          <dd>{promptPackage.steps.length}</dd>
        </div>
        <div>
          <dt>Approval steps</dt>
          <dd>{humanApprovalSteps}</dd>
        </div>
      </dl>
    </section>
  );
}

function MarkdownExportPanel({
  artifacts,
  copyLabel,
  downloadName,
  markdown,
  onPrintReport,
  previewLabel,
}: {
  artifacts: RouteArtifactsController;
  copyLabel: string;
  downloadName: string;
  markdown: string;
  onPrintReport?: () => void;
  previewLabel: string;
}) {
  return (
    <section className="localExportPanel" aria-labelledby={domIdFor(copyLabel)}>
      <div>
        <h3 id={domIdFor(copyLabel)}>Copy or download</h3>
        <p>Markdown is prepared in this browser from saved plans.</p>
      </div>
      <div className="artifactActions">
        <button
          disabled={!markdown || artifacts.copyStatus === "copying"}
          onClick={() => void artifacts.copyText(markdown, copyLabel)}
          type="button"
        >
          Copy {copyLabel}
        </button>
        <a download={downloadName} href={markdownDownloadHref(markdown)}>
          Download Markdown
        </a>
        {onPrintReport ? (
          <button disabled={!markdown} onClick={onPrintReport} type="button">
            Save PDF report
          </button>
        ) : null}
      </div>
      <span aria-live="polite" role="status">
        {artifacts.copyMessage}
      </span>
      <label>
        <span>{previewLabel}</span>
        <textarea aria-label={previewLabel} readOnly rows={8} value={markdown} />
      </label>
    </section>
  );
}

function RouteCardWarnings({ routeCard }: { routeCard: RouteCard }) {
  return (
    <div className="artifactTwoColumn">
      <section className="routingSection warningList" aria-labelledby="route-card-warnings-heading">
        <div className="sectionHeading">
          <h3 id="route-card-warnings-heading">Warnings</h3>
          <p>Review these before manually using the saved plan.</p>
        </div>
        <ArtifactList emptyLabel="No route card warnings." items={routeCard.warnings} />
      </section>

      <section className="routingSection blockedList" aria-labelledby="route-card-blocked-routes-heading">
        <div className="sectionHeading">
          <h3 id="route-card-blocked-routes-heading">Left out for safety</h3>
          <p>Items left out stay visible so the decision card explains what was excluded.</p>
        </div>
        {routeCard.blockedRoutes.length ? (
          <ul>
            {routeCard.blockedRoutes.map((blockedRoute) => (
              <li key={`${blockedRoute.routeId}-${blockedRoute.reason}`}>
                <strong>{blockedRoute.routeId}</strong>
                <span>
                  {blockedRoute.reason} ({blockedRoute.severity})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="emptySetupState">No blocked routes.</p>
        )}
      </section>
    </div>
  );
}

function RouteOptionList({ routeCard }: { routeCard: RouteCard }) {
  const recommendedOptionId = routeCard.recommendedOptionId;

  return (
    <section className="routingSection" aria-labelledby="route-card-options-heading">
      <div className="sectionHeading">
        <h3 id="route-card-options-heading">Options and tradeoffs</h3>
        <p>Scores, cost, effort, warnings, and steps are retained for the best fit and alternatives.</p>
      </div>
      <div className="artifactRouteOptionList">
        {routeCard.options.map((option) => (
          <RouteOptionDetail key={option.id} option={option} recommended={option.id === recommendedOptionId} />
        ))}
      </div>
    </section>
  );
}

function RouteOptionDetail({ option, recommended }: { option: RouteOption; recommended: boolean }) {
  return (
    <section className={recommended ? "artifactRouteOption selectedArtifactOption" : "artifactRouteOption"} aria-labelledby={`${option.id}-heading`}>
      <div className="routeCardHeader">
        <h4 id={`${option.id}-heading`}>{option.label}</h4>
        <span>{recommended ? "Recommended" : `${option.score} score`}</span>
      </div>
      <p>{option.summary}</p>
      <dl className="artifactMetricGrid">
        <div>
          <dt>Score</dt>
          <dd>{option.score}</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{option.estimatedCostLevel}</dd>
        </div>
        <div>
          <dt>Effort</dt>
          <dd>{option.estimatedEffortLevel}</dd>
        </div>
        <div>
          <dt>Steps</dt>
          <dd>{option.steps.length}</dd>
        </div>
      </dl>
      <RouteStepList steps={option.steps} />
      {option.warnings.length ? (
        <div className="stepWarningList">
          <strong>Option warnings</strong>
          <ArtifactList emptyLabel="No option warnings." items={option.warnings} />
        </div>
      ) : null}
    </section>
  );
}

function RouteStepList({ steps }: { steps: RouteStep[] }) {
  return (
    <ol className="artifactStepList">
      {steps.map((step) => (
        <li key={step.id}>
          <strong>{step.label}</strong>
          <span>{step.kind}</span>
          <p>{step.instruction}</p>
          <dl>
            <div>
              <dt>Permission</dt>
              <dd>Level {step.requiredPermissionLevel}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{step.modelId ?? "None"}</dd>
            </div>
            <div>
              <dt>Sources</dt>
              <dd>{inlineList(step.sourceIds)}</dd>
            </div>
          </dl>
          {step.warnings.length ? <ArtifactList emptyLabel="No step warnings." items={step.warnings} /> : null}
        </li>
      ))}
    </ol>
  );
}

function PromptStepList({
  artifacts,
  promptPackage,
}: {
  artifacts: RouteArtifactsController;
  promptPackage: PromptPackage;
}) {
  return (
    <section className="routingSection" aria-labelledby="prompt-steps-heading">
      <div className="sectionHeading">
        <h3 id="prompt-steps-heading">Prompt steps</h3>
        <p>Human approval requirements stay attached to the step where they matter.</p>
      </div>
      <ol className="promptStepList">
        {promptPackage.steps.map((step, stepIndex) => (
          <PromptStepDetail artifacts={artifacts} key={step.id} step={step} stepIndex={stepIndex} />
        ))}
      </ol>
    </section>
  );
}

function PromptStepDetail({
  artifacts,
  step,
  stepIndex,
}: {
  artifacts: RouteArtifactsController;
  step: PromptStep;
  stepIndex: number;
}) {
  const promptStepText = promptStepCopyText(step, stepIndex);

  return (
    <li className="promptStepDetail">
      <div className="promptStepHeader">
        <div>
          <span>Step {stepIndex + 1}</span>
          <h4>{step.title}</h4>
        </div>
        <span className={step.requiresHumanApproval ? "approvalRequiredPill" : "approvalNotRequiredPill"}>
          {step.requiresHumanApproval ? "Human approval required" : "Approval not required"}
        </span>
      </div>
      <p>{step.instruction}</p>
      <dl className="promptStepMeta">
        <div>
          <dt>Input refs</dt>
          <dd>{inlineList(step.inputRefs)}</dd>
        </div>
        <div>
          <dt>Expected output</dt>
          <dd>{step.expectedOutput}</dd>
        </div>
      </dl>
      <button
        disabled={artifacts.copyStatus === "copying"}
        onClick={() => void artifacts.copyText(promptStepText, `Prompt step ${stepIndex + 1}`)}
        type="button"
      >
        Copy prompt step text
      </button>
    </li>
  );
}

function ArtifactList({ emptyLabel, items }: { emptyLabel: string; items: string[] }) {
  if (items.length === 0) {
    return <p className="emptySetupState">{emptyLabel}</p>;
  }

  return (
    <ul>
      {items.map((item, itemIndex) => (
        <li key={`${item}-${itemIndex}`}>{item}</li>
      ))}
    </ul>
  );
}

function recommendedOptionFor(routeCard: RouteCard) {
  return routeCard.options.find((option) => option.id === routeCard.recommendedOptionId) ?? null;
}

function promptStepCopyText(step: PromptStep, stepIndex: number) {
  return [
    `Step ${stepIndex + 1}: ${step.title}`,
    "",
    step.instruction,
    "",
    `Input refs: ${inlineList(step.inputRefs)}`,
    `Expected output: ${step.expectedOutput}`,
    `Human approval: ${step.requiresHumanApproval ? "Required" : "Not required"}`,
  ].join("\n");
}

function markdownDownloadHref(markdown: string) {
  return `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;
}

function artifactFileName(prefix: string, title: string, id: string) {
  const label = title.trim() || id;
  const safeLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${prefix}-${safeLabel || id}.md`;
}

function printRouteReport() {
  if (typeof window.print === "function") {
    window.print();
  }
}

function inlineList(values: readonly string[]) {
  if (values.length === 0) {
    return "None";
  }

  return values.join(", ");
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
