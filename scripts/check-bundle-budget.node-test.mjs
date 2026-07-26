import assert from "node:assert/strict";
import test from "node:test";

import { evaluateBundleBudget } from "./check-bundle-budget.mjs";

const limits = {
  javascript: { rawBytes: 1000, gzipBytes: 400 },
  stylesheet: { rawBytes: 500, gzipBytes: 200 },
};

test("passes when every kind is inside its budget", () => {
  const report = evaluateBundleBudget(
    [
      { name: "index.js", kind: "javascript", rawBytes: 900, gzipBytes: 300 },
      { name: "index.css", kind: "stylesheet", rawBytes: 400, gzipBytes: 150 },
    ],
    limits,
  );

  assert.equal(report.ok, true);
});

test("sums every file of a kind rather than checking the largest one", () => {
  const report = evaluateBundleBudget(
    [
      { name: "a.js", kind: "javascript", rawBytes: 600, gzipBytes: 150 },
      { name: "b.js", kind: "javascript", rawBytes: 600, gzipBytes: 150 },
    ],
    limits,
  );

  assert.equal(report.ok, false, "splitting a bundle in two must not sneak past the budget");
  assert.equal(report.results.find((result) => result.kind === "javascript").overRaw, true);
});

test("fails on gzip alone, since that is what the user actually downloads", () => {
  const report = evaluateBundleBudget(
    [{ name: "index.js", kind: "javascript", rawBytes: 900, gzipBytes: 401 }],
    limits,
  );

  assert.equal(report.ok, false);
  const javascript = report.results.find((result) => result.kind === "javascript");
  assert.equal(javascript.overRaw, false);
  assert.equal(javascript.overGzip, true);
});
