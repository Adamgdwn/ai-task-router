/**
 * One place where estimates become text.
 *
 * These formatters were copied into four screens and the Markdown exporter, and the copies drifted:
 * the stage guidance panel priced a route differently from the route card describing the same route.
 * Cost is the thing this app exists to make legible, so it gets exactly one implementation.
 *
 * Locale is pinned to en-US for money and quantities because both sit inside English sentences and
 * the currency is always USD - an unpinned locale renders "US$1.20" for a visitor outside the US,
 * which reads as a second currency rather than the dollars the rest of the sentence promised.
 * Dates are left to the visitor's locale, where local convention is a genuine improvement and there
 * is no ambiguity to introduce.
 */

/**
 * Dollars and cents, at owner direction (2026-07-26).
 *
 * Money is shown at its true value. An earlier pass rounded every figure to two significant figures
 * first, which turned $12.35 into "$12.00" - it discarded real cents to advertise the limits of the
 * estimate. Cents precision claims less than that rounding did, not more, so the methodology's
 * precision argument still holds; see docs/2026-07-05-impact-estimator-methodology.md.
 *
 * Below a cent the decimals extend, because a route that genuinely costs a fraction of a cent must
 * not read as "$0.00" - free and nearly free are different claims. Route comparison at that scale
 * belongs to the per-100-uses figures, which are large enough for cents to separate them.
 */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) {
    return "$0.00";
  }

  const magnitude = Math.abs(value);
  const maximumFractionDigits = magnitude === 0 || magnitude >= 0.01 ? 2 : magnitude >= 0.001 ? 4 : 6;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Energy keeps the two-significant-figure cap. The watt-hour estimates come from hand-tuned role and
 * mode multipliers over public anchors, and unlike money there is no billed figure underneath that a
 * user could check against a statement - "11.619 Wh" would be inventing precision the method never had.
 */
export function formatWattHours(value: number): string {
  const rounded = toSignificantFigures(value, 2);
  const magnitude = Math.abs(rounded);
  const maximumFractionDigits = magnitude >= 10 ? 0 : magnitude >= 1 ? 1 : 3;

  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(rounded)} Wh`;
}

export function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function toSignificantFigures(value: number, figures: number) {
  if (!Number.isFinite(value) || value === 0) {
    return 0;
  }

  return Number(value.toPrecision(figures));
}
