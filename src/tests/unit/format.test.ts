import { describe, expect, it } from "vitest";

import { formatUsd, formatWattHours } from "../../domain/format";

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
