import type { PublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
import type { RouteOption, TaskIntake } from "../../domain/types";

type ImpactInsightPanelProps = {
  recommended: RouteOption | undefined;
  snapshot: PublicImpactSnapshot;
  task?: Pick<
    TaskIntake,
    "costPreference" | "energyPreference" | "knowledgeWorkType" | "outputType" | "qualityBar"
  >;
};

export function ImpactInsightPanel({ recommended, snapshot, task }: ImpactInsightPanelProps) {
  return (
    <section className="impactSection" aria-labelledby="impact-insight-heading">
      <div className="impactLead">
        <p className="screenKicker">Savings recommendation</p>
        <h3 id="impact-insight-heading">What this route can save</h3>
        <p>{savingsLead(recommended, task)}</p>
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
          <dd>{savingsHeadline(recommended)}</dd>
          <span>{savingsDetail(recommended)}</span>
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

function savingsLead(
  recommended: RouteOption | undefined,
  task: ImpactInsightPanelProps["task"],
) {
  const taskShape = task
    ? `For this ${friendlyTaskShape(task.knowledgeWorkType)} task, the goal is a ${friendlyOutputShape(
        task.outputType,
      )} at ${friendlyQuality(task.qualityBar)}.`
    : "For this saved plan, use the selected route as the starting point.";

  if (!recommended) {
    return `${taskShape} The savings move is to pause before using a tool that does not fit the setup.`;
  }

  if (recommended.estimatedCostLevel === "low") {
    return `${taskShape} Start with the lighter path, then upgrade only if the plan fails review.`;
  }

  if (recommended.estimatedCostLevel === "medium") {
    return `${taskShape} Use the everyday helper to save rework while avoiding the heaviest option as the default.`;
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

function savingsHeadline(recommended: RouteOption | undefined) {
  if (!recommended) {
    return "Pause first";
  }

  if (recommended.estimatedCostLevel === "low") {
    return recommended.estimatedEffortLevel === "high" ? "Tool cost down" : "Start small";
  }

  if (recommended.estimatedCostLevel === "medium") {
    return "Avoid rework";
  }

  return "Pay for certainty";
}

function savingsDetail(recommended: RouteOption | undefined) {
  if (!recommended) {
    return "Changing the setup is cheaper than forcing a blocked or unclear route.";
  }

  if (recommended.estimatedCostLevel === "low") {
    return recommended.estimatedEffortLevel === "high"
      ? "This saves provider spend, but it costs more of your attention."
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
