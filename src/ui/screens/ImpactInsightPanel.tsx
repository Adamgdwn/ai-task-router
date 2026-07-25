import type { PublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
import type { TrackedImpactSummary } from "../../domain/impact/impactCounter";
import type { RouteOption, TaskIntake } from "../../domain/types";

type ImpactInsightPanelProps = {
  recommended: RouteOption | undefined;
  snapshot: PublicImpactSnapshot;
  task?: Pick<
    TaskIntake,
    "costPreference" | "energyPreference" | "knowledgeWorkType" | "outputType" | "qualityBar"
  >;
  trackedImpact?: TrackedImpactSummary;
  trackedImpactMessage?: string;
};

export function ImpactInsightPanel({
  recommended,
  snapshot,
  task,
  trackedImpact,
  trackedImpactMessage,
}: ImpactInsightPanelProps) {
  return (
    <section className="impactSection" aria-labelledby="impact-insight-heading">
      <div className="impactLead">
        <p className="screenKicker">Impact estimate</p>
        <h3 id="impact-insight-heading">What this route costs to run</h3>
        <p>{routeImpactLead(recommended, task)}</p>
        <p className="impactCaveat">
          Dollar figures answer one question: if this work were metered per token at public API list prices, roughly what
          would it come to? A monthly subscription hides that number, which is why it is worth seeing. It is not your
          bill, not money you saved, and not a guarantee.
        </p>
      </div>

      {trackedImpact ? (
        <div className="impactCounterPanel" aria-label="Cumulative followed-route impact">
          <div>
            <span>Followed choices</span>
            <strong>{formatInteger(trackedImpact.followedPlanCount)}</strong>
            <small>{trackedImpactMessage ?? "Accepted or edited recommendations counted on this device."}</small>
          </div>
          <dl>
            <div>
              <dt>If those runs were metered</dt>
              <dd>{formatUsd(trackedImpact.apiEquivalentCostUsd)}</dd>
            </div>
            <div>
              <dt>Estimated energy used</dt>
              <dd>{formatWattHours(trackedImpact.estimatedEnergyWh)}</dd>
            </div>
            <div>
              <dt>Saved plans</dt>
              <dd>{formatInteger(trackedImpact.savedPlanCount)}</dd>
            </div>
          </dl>
          {trackedImpact.plansWithoutEstimateCount > 0 ? (
            <p className="impactCaveat">
              {formatInteger(trackedImpact.plansWithoutEstimateCount)} followed plan(s) were saved before per-token
              estimates existed and are not included in these totals.
            </p>
          ) : null}
        </div>
      ) : null}

      <dl className="impactMetricGrid">
        <div>
          <dt>This route, if metered</dt>
          <dd>{routeCostHeadline(recommended)}</dd>
          <span>{routeCostDetail(recommended)}</span>
        </div>
        <div>
          <dt>100k-token example</dt>
          <dd>
            {formatUsd(snapshot.tokenBenchmark.lowerCostUsd)} vs {formatUsd(snapshot.tokenBenchmark.comparisonCostUsd)}
          </dd>
          <span>
            Textbook example, not your usage: {snapshot.tokenBenchmark.lowerCostModelLabel} compared with{" "}
            {snapshot.tokenBenchmark.comparisonModelLabel} on the same 100k-token run.
          </span>
        </div>
        <div>
          <dt>Right-sizing example</dt>
          <dd>{formatUsd(snapshot.rightSizingExample.netAvoidedCostUsd)}</dd>
          <span>
            Illustrative only: the difference a smaller model makes across {snapshot.rightSizingExample.taskCount}{" "}
            similar tasks, after {snapshot.rightSizingExample.inducedExtraRuns} extra smaller-model runs. Nobody is
            claiming you ran these.
          </span>
        </div>
        <div>
          <dt>Energy example</dt>
          <dd>{formatWattHours(snapshot.environmentalExample.netAvoidedWattHours)}</dd>
          <span>
            Illustrative only: the compute difference across {snapshot.environmentalExample.taskCount} reasoning tasks
            when half route to a lighter text workload.
          </span>
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

// Two significant figures; the underlying multipliers do not earn any more precision than that.
function toSignificantFigures(value: number, figures: number) {
  if (!Number.isFinite(value) || value === 0) {
    return 0;
  }

  return Number(value.toPrecision(figures));
}

function formatUsd(value: number) {
  const rounded = toSignificantFigures(value, 2);

  return new Intl.NumberFormat(undefined, {
    currency: "USD",
    maximumFractionDigits: Math.abs(rounded) > 0 && Math.abs(rounded) < 0.1 ? 3 : 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(rounded);
}

function formatWattHours(value: number) {
  const rounded = toSignificantFigures(value, 2);
  const absValue = Math.abs(rounded);
  const maximumFractionDigits = absValue >= 10 ? 0 : absValue >= 1 ? 1 : 3;

  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(rounded)} Wh`;
}

function routeImpactLead(
  recommended: RouteOption | undefined,
  task: ImpactInsightPanelProps["task"],
) {
  const taskShape = task
    ? `For this ${friendlyTaskShape(task.knowledgeWorkType)} task, the goal is a ${friendlyOutputShape(
        task.outputType,
      )} at ${friendlyQuality(task.qualityBar)}.`
    : "For this saved plan, use the selected route as the starting point.";

  if (!recommended) {
    return `${taskShape} The lower-impact move is to pause before using a tool that does not fit the setup.`;
  }

  if (recommended.estimatedCostLevel === "low") {
    return `${taskShape} Start with the lighter path, then upgrade only if the plan fails review.`;
  }

  if (recommended.estimatedCostLevel === "medium") {
    return `${taskShape} Use the everyday helper to cut rework while avoiding the heaviest option as the default.`;
  }

  return `${taskShape} Spend the extra helper effort where quality or risk makes mistakes more expensive than the tool cost.`;
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

function routeCostHeadline(recommended: RouteOption | undefined) {
  if (!recommended) {
    return "Pause first";
  }

  if (recommended.apiEquivalentCostUsd !== undefined) {
    return `about ${formatUsd(recommended.apiEquivalentCostUsd)}`;
  }

  if (recommended.estimatedCostLevel === "low") {
    return recommended.estimatedEffortLevel === "high" ? "Light on compute" : "Start small";
  }

  if (recommended.estimatedCostLevel === "medium") {
    return "Everyday helper";
  }

  return "Heaviest helper";
}

function routeCostDetail(recommended: RouteOption | undefined) {
  if (!recommended) {
    return "Changing the setup is cheaper than forcing a blocked or unclear route.";
  }

  if (recommended.apiEquivalentCostUsd !== undefined && recommended.estimatedCostUsd !== undefined) {
    // The gap between the two figures is the whole lesson: a plan already paid for still consumes
    // something, and this is the only place the user gets to see how much.
    return recommended.estimatedCostUsd === 0
      ? "Tools you already have cover this run, so nothing is added to your bill. The figure is what the same work costs at API list prices."
      : `About ${formatUsd(recommended.estimatedCostUsd)} of that would be added to your bill on a metered account.`;
  }

  if (recommended.estimatedCostLevel === "low") {
    return recommended.estimatedEffortLevel === "high"
      ? "This spends less compute, but it costs more of your attention."
      : "Use lightweight help first and reserve stronger tools for gaps.";
  }

  if (recommended.estimatedCostLevel === "medium") {
    return "Use enough help to get a clear first plan without defaulting to premium.";
  }

  return "Use premium help because review cost, risk, or uncertainty is likely higher.";
}

function friendlyTaskShape(value: TaskIntake["knowledgeWorkType"]) {
  const labels: Record<TaskIntake["knowledgeWorkType"], string> = {
    research: "research",
    synthesis: "summarizing",
    analysis: "analysis",
    writing: "writing",
    coding: "technical",
    planning: "planning",
    review: "review",
    packaging: "packaging",
  };

  return labels[value];
}

function friendlyOutputShape(value: TaskIntake["outputType"]) {
  const labels: Record<TaskIntake["outputType"], string> = {
    answer: "direct answer",
    brief: "short brief",
    plan: "working plan",
    draft: "draft",
    code: "code result",
    table: "table",
    "slide outline": "slide outline",
    "route card": "decision card",
    "prompt package": "prompt package",
  };

  return labels[value];
}

function friendlyQuality(value: TaskIntake["qualityBar"]) {
  const labels: Record<TaskIntake["qualityBar"], string> = {
    quick: "quick quality",
    standard: "solid everyday quality",
    high: "high quality",
    critical: "critical quality",
  };

  return labels[value];
}
