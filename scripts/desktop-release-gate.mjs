import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { desktopArtifactChecksumLine, listDesktopArtifacts } from "./inspect-desktop-artifacts.mjs";

const defaultBundleDir = path.resolve(process.cwd(), "src-tauri", "target", "release", "bundle");
const checksumFileName = "SHA256SUMS.txt";
const defaultPublicEvidencePath = path.resolve(
  process.cwd(),
  "docs",
  "release",
  "desktop-public-release-evidence.json",
);

const publicTrustRequirements = {
  windows:
    "Windows Store/MSIX trust or Authenticode signing evidence, checksum publication, Application Control smoke, WebView2 runtime plan, install/launch/uninstall smoke, and local discovery smoke",
  macos:
    "Developer ID signing, notarization evidence, checksum publication, Gatekeeper launch smoke, and uninstall notes",
  linux:
    "Linux launch/install/uninstall smoke, checksum publication, dependency notes, and a checksum-signature decision",
  unknown: "platform-specific trust evidence and smoke tests",
};

export function classifyDesktopArtifact(artifactPath) {
  const normalizedPath = artifactPath.split(path.sep).join("/");
  const extension = path.extname(normalizedPath).toLowerCase();
  const lowerPath = normalizedPath.toLowerCase();

  if (extension === ".exe" || extension === ".msi" || extension === ".msix") {
    return {
      platform: "windows",
      label: "Windows installer/package",
      publicRequirement: publicTrustRequirements.windows,
    };
  }

  if (extension === ".dmg" || (extension === ".zip" && lowerPath.includes("macos"))) {
    return {
      platform: "macos",
      label: "macOS desktop package",
      publicRequirement: publicTrustRequirements.macos,
    };
  }

  if (extension === ".appimage" || extension === ".deb" || extension === ".rpm") {
    return {
      platform: "linux",
      label: "Linux desktop package",
      publicRequirement: publicTrustRequirements.linux,
    };
  }

  return {
    platform: "unknown",
    label: "Desktop package",
    publicRequirement: publicTrustRequirements.unknown,
  };
}

export async function runDesktopReleaseGate(options = {}) {
  const mode = options.mode ?? "technical-preview";
  const rootDir = path.resolve(options.rootDir ?? defaultBundleDir);
  const publicEvidencePath = path.resolve(options.evidencePath ?? defaultPublicEvidencePath);
  const artifacts = await listDesktopArtifacts(rootDir);
  const findings = [];
  const holds = [];
  const publicEvidence =
    mode === "public" && artifacts.length > 0 ? await loadPublicReleaseEvidence(publicEvidencePath, findings) : null;

  if (mode !== "technical-preview" && mode !== "public") {
    findings.push({
      check: "gate-mode",
      path: ".",
      message: `Unsupported desktop release gate mode: ${mode}.`,
      severity: "error",
    });
  }

  if (artifacts.length === 0) {
    findings.push({
      check: "desktop-artifacts",
      path: path.relative(process.cwd(), rootDir) || ".",
      message: "No desktop package artifacts were found. Build desktop packages before running this gate.",
      severity: "error",
    });
  }

  await validateChecksumFile(rootDir, artifacts, findings);

  for (const artifact of artifacts) {
    const classification = classifyDesktopArtifact(artifact.path);

    if (mode === "public") {
      findings.push(
        ...validatePublicTrustEvidence({
          artifact,
          classification,
          evidence: publicEvidence,
          evidencePath: publicEvidencePath,
        }),
      );
      continue;
    }

    holds.push({
      check: "desktop-public-trust-hold",
      path: artifact.path,
      platform: classification.platform,
      message: `${classification.label} is technical-preview only until ${classification.publicRequirement} pass.`,
      severity: "hold",
    });
  }

  return {
    ok: findings.length === 0,
    publicReady: mode === "public" && findings.length === 0,
    mode,
    rootDir,
    publicEvidencePath,
    artifacts: artifacts.map((artifact) => ({
      ...artifact,
      classification: classifyDesktopArtifact(artifact.path),
    })),
    findings,
    holds,
  };
}

async function loadPublicReleaseEvidence(evidencePath, findings) {
  const body = await readFile(evidencePath, "utf8").catch((error) => {
    if (error && error.code === "ENOENT") {
      return null;
    }

    findings.push({
      check: "desktop-public-evidence",
      path: path.relative(process.cwd(), evidencePath),
      message: `Could not read public desktop release evidence: ${error instanceof Error ? error.message : String(error)}.`,
      severity: "error",
    });
    return null;
  });

  if (body === null) {
    return null;
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    findings.push({
      check: "desktop-public-evidence",
      path: path.relative(process.cwd(), evidencePath),
      message: `Public desktop release evidence is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }.`,
      severity: "error",
    });
    return null;
  }
}

function validatePublicTrustEvidence({ artifact, classification, evidence, evidencePath }) {
  if (!evidence) {
    return [
      {
        check: "desktop-public-evidence",
        path: artifact.path,
        message: `No public desktop release evidence manifest was found at ${path.relative(
          process.cwd(),
          evidencePath,
        )}. ${classification.label} needs ${classification.publicRequirement}. Public desktop downloads remain held.`,
        severity: "error",
      },
    ];
  }

  const platformEvidence = evidence.platforms?.[classification.platform];
  const findings = [
    ...validateCommonReleaseEvidence(evidence, evidencePath, artifact.path),
    ...validatePlatformReleaseEvidence(classification.platform, platformEvidence, artifact),
  ];

  if (findings.length === 0) {
    return [];
  }

  return findings.map((finding) => ({
    ...finding,
    path: finding.path ?? artifact.path,
  }));
}

function validateCommonReleaseEvidence(evidence, evidencePath, artifactPath) {
  const findings = [];
  const evidenceLabel = path.relative(process.cwd(), evidencePath);

  if (evidence.schemaVersion !== 1) {
    findings.push(publicEvidenceFinding(evidenceLabel, "Evidence manifest schemaVersion must be 1."));
  }

  if (!isNonEmptyString(evidence.productName)) {
    findings.push(publicEvidenceFinding(evidenceLabel, "Evidence manifest must record the desktop product name."));
  }

  if (!isNonEmptyString(evidence.legalPublisher)) {
    findings.push(publicEvidenceFinding(evidenceLabel, "Evidence manifest must record the legal publisher name."));
  }

  if (evidence.ownerApproval?.status !== "approved") {
    findings.push(
      publicEvidenceFinding(artifactPath, "Owner desktop launch approval must be recorded with status approved."),
    );
  }

  if (!isNonEmptyString(evidence.ownerApproval?.timestamp)) {
    findings.push(publicEvidenceFinding(artifactPath, "Owner desktop launch approval timestamp is missing."));
  }

  if (!isNonEmptyString(evidence.support?.supportUrl)) {
    findings.push(publicEvidenceFinding(artifactPath, "Support or vulnerability reporting URL is missing."));
  }

  if (!isNonEmptyString(evidence.support?.withdrawalPlan)) {
    findings.push(publicEvidenceFinding(artifactPath, "Artifact withdrawal plan is missing."));
  }

  if (!isNonEmptyString(evidence.privacy?.localAccessUrl)) {
    findings.push(publicEvidenceFinding(artifactPath, "Privacy/local-access explanation URL is missing."));
  }

  return findings;
}

function validatePlatformReleaseEvidence(platform, platformEvidence, artifact) {
  if (!platformEvidence) {
    return [
      publicEvidenceFinding(
        artifact.path,
        `Public release evidence for platform ${platform} is missing. ${classifyDesktopArtifact(
          artifact.path,
        ).publicRequirement} must pass.`,
      ),
    ];
  }

  const findings = [];

  if (platformEvidence.status !== "ready") {
    findings.push(publicEvidenceFinding(artifact.path, "Platform release evidence status must be ready."));
  }

  if (platformEvidence.checksumPublished !== true) {
    findings.push(publicEvidenceFinding(artifact.path, "Checksum publication must be recorded."));
  }

  for (const field of ["installSmoke", "launchSmoke", "localDiscoverySmoke", "uninstallSmoke"]) {
    if (platformEvidence[field] !== "passed") {
      findings.push(publicEvidenceFinding(artifact.path, `${field} must be recorded as passed.`));
    }
  }

  if (!artifactMatchesDistributionLane(platform, artifact.path, platformEvidence.distributionLane)) {
    findings.push(
      publicEvidenceFinding(
        artifact.path,
        `Artifact type does not match the recorded ${platform} distribution lane.`,
      ),
    );
  }

  if (platform === "windows") {
    return findings.concat(validateWindowsPublicEvidence(platformEvidence, artifact.path));
  }

  if (platform === "macos") {
    return findings.concat(validateMacosPublicEvidence(platformEvidence, artifact.path));
  }

  if (platform === "linux") {
    return findings.concat(validateLinuxPublicEvidence(platformEvidence, artifact.path));
  }

  findings.push(publicEvidenceFinding(artifact.path, "Unknown platform artifacts need explicit trust evidence."));
  return findings;
}

function validateWindowsPublicEvidence(platformEvidence, artifactPath) {
  const findings = [];

  if (!["microsoft-store-msix", "direct-signed-installer", "both"].includes(platformEvidence.distributionLane)) {
    findings.push(
      publicEvidenceFinding(
        artifactPath,
        "Windows distributionLane must be microsoft-store-msix, direct-signed-installer, or both.",
      ),
    );
  }

  if (!isNonEmptyString(platformEvidence.storeOrSigningEvidence)) {
    findings.push(publicEvidenceFinding(artifactPath, "Windows Store/MSIX or Authenticode evidence is missing."));
  }

  if (!isNonEmptyString(platformEvidence.signatureVerification)) {
    findings.push(publicEvidenceFinding(artifactPath, "Windows signature verification evidence is missing."));
  }

  if (platformEvidence.applicationControlSmoke !== "passed") {
    findings.push(publicEvidenceFinding(artifactPath, "Windows Application Control smoke must be recorded as passed."));
  }

  if (!isNonEmptyString(platformEvidence.webView2RuntimePlan)) {
    findings.push(publicEvidenceFinding(artifactPath, "Windows WebView2 runtime plan is missing."));
  }

  return findings;
}

function validateMacosPublicEvidence(platformEvidence, artifactPath) {
  const findings = [];

  if (!["developer-id-dmg", "app-store", "both"].includes(platformEvidence.distributionLane)) {
    findings.push(publicEvidenceFinding(artifactPath, "macOS distributionLane must be developer-id-dmg, app-store, or both."));
  }

  if (!isNonEmptyString(platformEvidence.developerIdSigningEvidence)) {
    findings.push(publicEvidenceFinding(artifactPath, "macOS Developer ID signing evidence is missing."));
  }

  if (!isNonEmptyString(platformEvidence.notarizationEvidence)) {
    findings.push(publicEvidenceFinding(artifactPath, "macOS notarization evidence is missing."));
  }

  if (platformEvidence.gatekeeperSmoke !== "passed") {
    findings.push(publicEvidenceFinding(artifactPath, "macOS Gatekeeper smoke must be recorded as passed."));
  }

  return findings;
}

function validateLinuxPublicEvidence(platformEvidence, artifactPath) {
  const findings = [];

  if (!["appimage", "deb", "appimage-and-deb"].includes(platformEvidence.distributionLane)) {
    findings.push(publicEvidenceFinding(artifactPath, "Linux distributionLane must be appimage, deb, or appimage-and-deb."));
  }

  if (!isNonEmptyString(platformEvidence.checksumSignatureDecision)) {
    findings.push(publicEvidenceFinding(artifactPath, "Linux checksum-signature decision is missing."));
  }

  if (!isNonEmptyString(platformEvidence.dependencyNotes)) {
    findings.push(publicEvidenceFinding(artifactPath, "Linux dependency notes are missing."));
  }

  return findings;
}

function artifactMatchesDistributionLane(platform, artifactPath, distributionLane) {
  const extension = path.extname(artifactPath).toLowerCase();

  if (platform === "windows") {
    if (distributionLane === "microsoft-store-msix") {
      return extension === ".msix";
    }

    if (distributionLane === "direct-signed-installer") {
      return extension === ".exe" || extension === ".msi";
    }

    return distributionLane === "both" && [".exe", ".msi", ".msix"].includes(extension);
  }

  if (platform === "macos") {
    return [".dmg", ".zip"].includes(extension);
  }

  if (platform === "linux") {
    if (distributionLane === "appimage") {
      return extension === ".appimage";
    }

    if (distributionLane === "deb") {
      return extension === ".deb";
    }

    return distributionLane === "appimage-and-deb" && [".appimage", ".deb"].includes(extension);
  }

  return false;
}

function publicEvidenceFinding(pathValue, message) {
  return {
    check: "desktop-public-trust",
    path: pathValue,
    message: `${message} Public desktop downloads remain held.`,
    severity: "error",
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function validateChecksumFile(rootDir, artifacts, findings) {
  if (artifacts.length === 0) {
    return;
  }

  const checksumPath = path.join(rootDir, checksumFileName);
  const checksumBody = await readFile(checksumPath, "utf8").catch(() => null);

  if (checksumBody === null) {
    findings.push({
      check: "desktop-checksums",
      path: path.relative(process.cwd(), checksumPath),
      message: "SHA256SUMS.txt is missing. Run npm run desktop:checksums after packaging.",
      severity: "error",
    });
    return;
  }

  const expectedLines = artifacts.map(desktopArtifactChecksumLine).sort();
  const actualLines = checksumBody
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .sort();
  const actualSet = new Set(actualLines);
  const expectedSet = new Set(expectedLines);

  for (const line of expectedLines) {
    if (!actualSet.has(line)) {
      findings.push({
        check: "desktop-checksums",
        path: path.relative(process.cwd(), checksumPath),
        message: `Missing or stale checksum line for ${line.slice(66)}.`,
        severity: "error",
      });
    }
  }

  for (const line of actualLines) {
    if (!expectedSet.has(line)) {
      findings.push({
        check: "desktop-checksums",
        path: path.relative(process.cwd(), checksumPath),
        message: `Unexpected checksum line: ${line.slice(0, 120)}`,
        severity: "error",
      });
    }
  }

  if (actualLines.length !== actualSet.size) {
    findings.push({
      check: "desktop-checksums",
      path: path.relative(process.cwd(), checksumPath),
      message: "SHA256SUMS.txt contains duplicate checksum lines.",
      severity: "error",
    });
  }
}

function parseArgs(rawArgs) {
  const options = {
    mode: "technical-preview",
    rootDir: defaultBundleDir,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === "--mode") {
      options.mode = rawArgs[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--mode=")) {
      options.mode = arg.slice("--mode=".length);
      continue;
    }

    if (arg === "--root") {
      if (!rawArgs[index + 1]) {
        options.rootDir = "";
        continue;
      }
      options.rootDir = path.resolve(rawArgs[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--root=")) {
      options.rootDir = path.resolve(arg.slice("--root=".length));
      continue;
    }

    if (arg === "--evidence") {
      if (!rawArgs[index + 1]) {
        options.evidencePath = "";
        continue;
      }
      options.evidencePath = path.resolve(rawArgs[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--evidence=")) {
      options.evidencePath = path.resolve(arg.slice("--evidence=".length));
      continue;
    }

    options.rootDir = path.resolve(arg);
  }

  return options;
}

function printReport(report) {
  console.log("Desktop download readiness gate");
  console.log(`Mode: ${report.mode}`);
  if (report.mode === "public") {
    console.log(`Evidence: ${path.relative(process.cwd(), report.publicEvidencePath)}`);
  }

  if (report.artifacts.length > 0) {
    console.log(`Artifacts checked: ${report.artifacts.length}`);
    for (const artifact of report.artifacts) {
      console.log(`- ${artifact.path}`);
      console.log(`  sha256: ${artifact.sha256}`);
      console.log(`  platform: ${artifact.classification.platform}`);
    }
  }

  if (report.holds.length > 0) {
    console.log(`HOLD: ${report.holds.length} public-download trust gate(s) remain.`);
    for (const hold of report.holds) {
      console.log(`- ${hold.path}: ${hold.message}`);
    }
  }

  if (report.ok) {
    console.log("PASS: desktop artifact hygiene checks passed.");
    if (!report.publicReady) {
      console.log("Public downloads are still held.");
    }
    return;
  }

  console.error(`FAIL: ${report.findings.length} release-blocking finding(s).`);
  for (const finding of report.findings) {
    console.error(`- ${finding.check}: ${finding.path} - ${finding.message}`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  runDesktopReleaseGate(parseArgs(process.argv.slice(2)))
    .then((report) => {
      printReport(report);
      process.exitCode = report.ok ? 0 : 1;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
