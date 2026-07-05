import type { PublicImpactSnapshot } from "../../domain/impact/publicImpactSnapshot";
import type { RouteOption } from "../../domain/types";

type ImpactInsightPanelProps = {
  recommended: RouteOption | undefined;
  snapshot: PublicImpactSnapshot;
};

export function ImpactInsightPanel({ recommended, snapshot }: ImpactInsightPanelProps) {
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
