import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runWebReleaseCandidateScan } from "./web-release-candidate-scan.mjs";

test("passes a minimal safe web release candidate artifact", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-web-rc-pass-"));

  try {
    await writeSafeDist(tempRoot);
    await mkdir(path.join(tempRoot, "src"), { recursive: true });
    await writeFile(path.join(tempRoot, "src", "app.ts"), "export const appName = 'AI Task Router';\n");

    const report = await runWebReleaseCandidateScan(tempRoot);

    assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("flags high-confidence secrets and external URLs without printing secret values", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-web-rc-fail-"));

  try {
    await writeSafeDist(tempRoot);
    await mkdir(path.join(tempRoot, "src"), { recursive: true });

    const fakeToken = "ghp_" + "A".repeat(40);
    await writeFile(path.join(tempRoot, "src", "leaky.ts"), `const token = '${fakeToken}';\n`);
    await writeFile(path.join(tempRoot, "dist", "index.html"), '<script src="https://example.com/analytics.js"></script>');

    const report = await runWebReleaseCandidateScan(tempRoot);

    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.check === "source-secret"));
    assert.ok(report.findings.some((finding) => finding.check === "dist-external-url"));
    assert.ok(!JSON.stringify(report.findings).includes(fakeToken));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

async function writeSafeDist(rootDir) {
  const distDir = path.join(rootDir, "dist");
  await mkdir(path.join(distDir, "pwa"), { recursive: true });

  await writeFile(
    path.join(distDir, "manifest.webmanifest"),
    JSON.stringify({
      name: "AI Task Router | Guided AI Labs",
      short_name: "AI Task Router",
      start_url: "/",
      scope: "/",
      display: "standalone",
      icons: [
        { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    }),
  );
  await writeFile(path.join(distDir, "pwa", "icon-192.png"), "not-real-png");
  await writeFile(path.join(distDir, "pwa", "icon-512.png"), "not-real-png");
  await writeFile(
    path.join(distDir, "service-worker.js"),
    `self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }
});`,
  );
  await writeFile(path.join(distDir, "index.html"), "<!doctype html><title>AI Task Router</title>");
}
