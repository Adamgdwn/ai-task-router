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
    assert.ok(report.findings.some((finding) => finding.check === "desktop-public-evidence"));
    assert.match(report.findings[0].message, /public desktop release evidence manifest/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("public gate passes when a Windows MSIX has complete trust evidence", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-public-ready-"));

  try {
    await mkdir(path.join(tempRoot, "msix"), { recursive: true });
    await writeFile(path.join(tempRoot, "msix", "AI Task Router_0.2.0_x64.msix"), "windows-package");
    await writeDesktopChecksums(tempRoot);

    const evidencePath = path.join(tempRoot, "desktop-public-release-evidence.json");
    await writeFile(
      evidencePath,
      JSON.stringify(
        {
          schemaVersion: 1,
          productName: "AI Task Router",
          legalPublisher: "Guided AI Labs Ltd",
          ownerApproval: {
            status: "approved",
            timestamp: "2026-07-06T13:39:30-06:00",
          },
          support: {
            supportUrl: "https://oldskoolai.com/security/",
            withdrawalPlan: "Remove public links, withdraw the release, and publish a support notice.",
          },
          privacy: {
            localAccessUrl: "https://oldskoolai.com/ai-task-router/",
          },
          platforms: {
            windows: {
              status: "ready",
              distributionLane: "microsoft-store-msix",
              storeOrSigningEvidence: "Microsoft Store certification completed and package re-signed.",
              signatureVerification: "Package identity and signature verified after Store processing.",
              checksumPublished: true,
              installSmoke: "passed",
              launchSmoke: "passed",
              localDiscoverySmoke: "passed",
              uninstallSmoke: "passed",
              applicationControlSmoke: "passed",
              webView2RuntimePlan: "MSIX dependency or installer/runtime check documented.",
            },
          },
        },
        null,
        2,
      ),
    );

    const report = await runDesktopReleaseGate({ rootDir: tempRoot, mode: "public", evidencePath });

    assert.equal(report.ok, true);
    assert.equal(report.publicReady, true);
    assert.equal(report.findings.length, 0);
    assert.equal(report.holds.length, 0);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("public gate rejects artifacts that do not match the recorded distribution lane", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-public-lane-"));

  try {
    await mkdir(path.join(tempRoot, "nsis"), { recursive: true });
    await writeFile(path.join(tempRoot, "nsis", "AI Task Router_0.2.0_x64-setup.exe"), "windows-installer");
    await writeDesktopChecksums(tempRoot);

    const evidencePath = path.join(tempRoot, "desktop-public-release-evidence.json");
    await writeFile(
      evidencePath,
      JSON.stringify(
        {
          schemaVersion: 1,
          productName: "AI Task Router",
          legalPublisher: "Guided AI Labs Ltd",
          ownerApproval: {
            status: "approved",
            timestamp: "2026-07-06T13:39:30-06:00",
          },
          support: {
            supportUrl: "https://oldskoolai.com/security/",
            withdrawalPlan: "Remove public links and publish a support notice.",
          },
          privacy: {
            localAccessUrl: "https://oldskoolai.com/ai-task-router/",
          },
          platforms: {
            windows: {
              status: "ready",
              distributionLane: "microsoft-store-msix",
              storeOrSigningEvidence: "Microsoft Store certification completed.",
              signatureVerification: "Package signature verified.",
              checksumPublished: true,
              installSmoke: "passed",
              launchSmoke: "passed",
              localDiscoverySmoke: "passed",
              uninstallSmoke: "passed",
              applicationControlSmoke: "passed",
              webView2RuntimePlan: "Runtime plan documented.",
            },
          },
        },
        null,
        2,
      ),
    );

    const report = await runDesktopReleaseGate({ rootDir: tempRoot, mode: "public", evidencePath });

    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => /distribution lane/.test(finding.message)));
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
