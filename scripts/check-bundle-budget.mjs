import { gzipSync } from "node:zlib";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/**
 * The app ships as one JavaScript bundle on purpose. The service worker caches assets when they are
 * fetched rather than precaching a chunk list, so a single bundle is the thing that guarantees the app
 * still works offline after one visit. Splitting it lazily would break that for any tab the user had not
 * opened before going offline.
 *
 * One bundle means nothing stops it growing. Vite's own warning fires at 500 kB and has been recorded as
 * "passed with existing warning" in every validation log since 2026-07-05, which is how a warning stops
 * meaning anything. This is the replacement: a number that fails the build.
 *
 * Raising a budget is a deliberate act. When this fails, look at what was added first. If the growth is
 * genuinely earned, raise the number here in the same commit that earned it and say so in the message.
 */
const budgets = {
  // Measured 2026-07-26 at 661.30 kB raw / 188.91 kB gzip, from 519.84 kB raw on 2026-07-05.
  // Headroom is deliberately tight - roughly one feature's worth, not one release's worth.
  javascript: { rawBytes: 700 * 1024, gzipBytes: 200 * 1024 },
  stylesheet: { rawBytes: 60 * 1024, gzipBytes: 12 * 1024 },
};

/**
 * Pure so the comparison can be tested without a build on disk.
 * `assets` is a list of `{ name, kind, rawBytes, gzipBytes }`.
 */
export function evaluateBundleBudget(assets, limits = budgets) {
  const kinds = ["javascript", "stylesheet"];
  const results = kinds.map((kind) => {
    const matching = assets.filter((asset) => asset.kind === kind);
    const rawBytes = matching.reduce((total, asset) => total + asset.rawBytes, 0);
    const gzipBytes = matching.reduce((total, asset) => total + asset.gzipBytes, 0);
    const limit = limits[kind];

    return {
      kind,
      count: matching.length,
      rawBytes,
      gzipBytes,
      limit,
      overRaw: rawBytes > limit.rawBytes,
      overGzip: gzipBytes > limit.gzipBytes,
    };
  });

  return { ok: results.every((result) => !result.overRaw && !result.overGzip), results };
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

async function readAssets(distDir) {
  const assetDir = path.join(distDir, "assets");
  let entries;

  try {
    entries = await readdir(assetDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const assets = [];

  for (const entry of entries) {
    const kind = entry.endsWith(".js") ? "javascript" : entry.endsWith(".css") ? "stylesheet" : null;

    if (!kind) {
      continue;
    }

    const contents = await readFile(path.join(assetDir, entry));
    assets.push({ name: entry, kind, rawBytes: contents.byteLength, gzipBytes: gzipSync(contents).byteLength });
  }

  return assets;
}

async function main() {
  const distDir = path.resolve(process.cwd(), process.argv[2] ?? "dist");
  const assets = await readAssets(distDir);

  if (assets.length === 0) {
    console.error(`FAIL: no JavaScript or CSS assets found in ${distDir}. Run the build first.`);
    process.exitCode = 1;
    return;
  }

  const { ok, results } = evaluateBundleBudget(assets);

  for (const result of results) {
    const rawFlag = result.overRaw ? "OVER" : "ok";
    const gzipFlag = result.overGzip ? "OVER" : "ok";
    console.log(
      `${result.kind}: ${result.count} file(s), ` +
        `raw ${formatKb(result.rawBytes)} / ${formatKb(result.limit.rawBytes)} ${rawFlag}, ` +
        `gzip ${formatKb(result.gzipBytes)} / ${formatKb(result.limit.gzipBytes)} ${gzipFlag}`,
    );
  }

  if (!ok) {
    console.error(
      "\nFAIL: bundle budget exceeded. Check what was added before raising the budget. " +
        "If the growth is earned, raise it in scripts/check-bundle-budget.mjs in the same commit.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nPASS: bundle within budget.");
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("check-bundle-budget.mjs")) {
  await main();
}
