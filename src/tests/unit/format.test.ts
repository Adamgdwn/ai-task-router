import { describe, expect, it } from "vitest";

import {
  formatEnergyAsEverydayEquivalent,
  formatUsd,
  formatWattHours,
  formatWattHoursWithEveryday,
} from "../../domain/format";

describe("formatUsd", () => {
  // The defect this module exists to fix: four copies of this formatter disagreed, and the
  // canonical copy rounded to two significant figures before printing two decimals, so a real
  // $12.35 estimate reached the user as "$12.00".
  it("shows real cents instead of rounding them away", () => {
    expect(formatUsd(12.3456)).toBe("$12.35");
    expect(formatUsd(1.2345)).toBe("$1.23");
    expect(formatUsd(0.999)).toBe("$1.00");
  });

  it("pads to two decimals so amounts read as money", () => {
    expect(formatUsd(0)).toBe("$0.00");
    expect(formatUsd(1)).toBe("$1.00");
    expect(formatUsd(0.5)).toBe("$0.50");
  });

  // Free and nearly free are different claims, so sub-cent estimates keep enough decimals to stay
  // visible rather than collapsing into "$0.00".
  it("extends precision below a cent rather than printing zero", () => {
    expect(formatUsd(0.0051)).toBe("$0.0051");
    expect(formatUsd(0.000123)).toBe("$0.000123");
    expect(formatUsd(0.0512)).toBe("$0.05");
  });

  // An unpinned locale renders this as "US$1.20", which reads as a second currency inside an
  // otherwise English sentence.
  it("pins the currency symbol rather than following the visitor locale", () => {
    expect(formatUsd(1.2)).toBe("$1.20");
  });

  it("never emits NaN into user-facing copy", () => {
    expect(formatUsd(Number.NaN)).toBe("$0.00");
    expect(formatUsd(Number.POSITIVE_INFINITY)).toBe("$0.00");
  });
});

describe("formatWattHours", () => {
  // Energy keeps the two-significant-figure cap: there is no billed figure underneath it that a
  // user could check, so extra digits would be inventing precision.
  it("caps precision at two significant figures", () => {
    expect(formatWattHours(11.619)).toBe("12 Wh");
    expect(formatWattHours(1.2345)).toBe("1.2 Wh");
    expect(formatWattHours(0.0512)).toBe("0.051 Wh");
  });

  it("returns zero for values that are not finite", () => {
    expect(formatWattHours(Number.NaN)).toBe("0 Wh");
  });
});

describe("formatEnergyAsEverydayEquivalent", () => {
  // A watt-hour is one watt for one hour, so these are checkable by hand against a 10 W rating.
  it("restates watt-hours as bulb time", () => {
    expect(formatEnergyAsEverydayEquivalent(1.2)).toBe("a 10-watt LED bulb for 7.2 minutes");
    expect(formatEnergyAsEverydayEquivalent(21.414)).toBe("a 10-watt LED bulb for 2.1 hours");
  });

  // The smallest per-use figures are the common case on a lean route, and "0.02 minutes" would be
  // less readable than the watt-hours it is meant to explain.
  it("collapses sub-minute figures instead of printing false precision", () => {
    expect(formatEnergyAsEverydayEquivalent(0.1)).toBe("a 10-watt LED bulb for under a minute");
  });

  it("does not print a plural unit for a single minute", () => {
    expect(formatEnergyAsEverydayEquivalent(10 / 60)).toBe("a 10-watt LED bulb for 1 minute");
  });

  // Minutes stay minutes up to an hour and a half, because "60 minutes" reads more plainly than
  // "1 hour" does at the boundary and the switch should feel like a change of scale, not a rule.
  it("switches to hours only once minutes stop being readable", () => {
    expect(formatEnergyAsEverydayEquivalent(10)).toBe("a 10-watt LED bulb for 60 minutes");
    expect(formatEnergyAsEverydayEquivalent(15)).toBe("a 10-watt LED bulb for 1.5 hours");
  });

  // Zero energy must not assert that a bulb ran for no time; the caller shows the bare figure.
  it("returns null rather than a phrase when there is nothing to picture", () => {
    expect(formatEnergyAsEverydayEquivalent(0)).toBeNull();
    expect(formatEnergyAsEverydayEquivalent(Number.NaN)).toBeNull();
    expect(formatEnergyAsEverydayEquivalent(-1)).toBeNull();
  });
});

describe("formatWattHoursWithEveryday", () => {
  it("keeps the sourced figure first and the restatement second", () => {
    expect(formatWattHoursWithEveryday(1.2)).toBe("1.2 Wh - about a 10-watt LED bulb for 7.2 minutes");
  });

  it("falls back to the bare figure when there is nothing to restate", () => {
    expect(formatWattHoursWithEveryday(0)).toBe("0 Wh");
  });
});
