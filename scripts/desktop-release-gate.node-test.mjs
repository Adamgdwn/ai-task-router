import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { classifyDesktopArtifact, runDesktopReleaseGate } from "./desktop-release-gate.mjs";
import { writeDesktopChecksums } from "./inspect-desktop-artifacts.mjs";

test("technical-preview gate passes artifact hygiene while holding public downloads", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-desktop-gate-"));

  try {
    await mkdir(path.join(tempRoot, "nsis"), { recursive: true });
    await writeFile(path.join(tempRoot, "nsis", "AI Task Router_0.2.0_x64-setup.exe"), "installer");
    await writeDesktopChecksums(tempRoot);

    const report = await runDesktopReleaseGate({ rootDir: tempRoot, mode: "technical-preview" });

    assert.equal(report.ok, true);
    assert.equal(report.publicReady, false);
    assert.equal(report.findings.length, 0);
    assert.equal(report.holds.length, 1);
    assert.equal(report.holds[0].platform, "windows");
    assert.match(report.holds[0].message, /technical-preview only/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("public gate fails desktop artifacts without trust evidence", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-public-gate-"));

  try {
    await mkdir(path.join(tempRoot, "dmg"), { recursive: true });
    await writeFile(path.join(tempRoot, "dmg", "AI Task Router_0.2.0_aarch64.dmg"), "macos-package");
    await writeDesktopChecksums(tempRoot);

    const report = await runDesktopReleaseGate({ rootDir: tempRoot, mode: "public" });

    assert.equal(report.ok, false);
    assert.equal(report.publicReady, false);
    assert.equal(report.holds.length, 0);
    assert.equal(report.findings.length, 1);
    assert.equal(report.findings[0].check, "desktop-public-trust");
    assert.match(report.findings[0].message, /Developer ID signing/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("gate fails when SHA256SUMS is missing or stale", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-stale-gate-"));

  try {
    await mkdir(path.join(tempRoot, "appimage"), { recursive: true });
    const artifactPath = path.join(tempRoot, "appimage", "ai-task-router.AppImage");
    await writeFile(artifactPath, "linux-package");
    await writeFile(path.join(tempRoot, "SHA256SUMS.txt"), `BAD  ${path.relative(process.cwd(), artifactPath)}\n`);

    const report = await runDesktopReleaseGate({ rootDir: tempRoot, mode: "technical-preview" });

    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.check === "desktop-checksums"));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("classifies desktop package platforms by artifact extension", () => {
  assert.equal(classifyDesktopArtifact("bundle/nsis/setup.exe").platform, "windows");
  assert.equal(classifyDesktopArtifact("bundle/dmg/app.dmg").platform, "macos");
  assert.equal(classifyDesktopArtifact("bundle/appimage/app.AppImage").platform, "linux");
  assert.equal(classifyDesktopArtifact("bundle/deb/app.deb").platform, "linux");
});
