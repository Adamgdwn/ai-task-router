import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { desktopArtifactChecksumLine, listDesktopArtifacts } from "./inspect-desktop-artifacts.mjs";

const defaultBundleDir = path.resolve(process.cwd(), "src-tauri", "target", "release", "bundle");
const checksumFileName = "SHA256SUMS.txt";

const publicTrustRequirements = {
  windows:
    "Windows Store/MSIX trust or Authenticode signing evidence, checksum publication, install/launch/uninstall smoke, and local discovery smoke",
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
  const artifacts = await listDesktopArtifacts(rootDir);
  const findings = [];
  const holds = [];

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
      findings.push({
        check: "desktop-public-trust",
        path: artifact.path,
        message: `${classification.label} is missing ${classification.publicRequirement}. Public desktop downloads remain held.`,
        severity: "error",
      });
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
    artifacts: artifacts.map((artifact) => ({
      ...artifact,
      classification: classifyDesktopArtifact(artifact.path),
    })),
    findings,
    holds,
  };
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
      options.rootDir = path.resolve(rawArgs[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--root=")) {
      options.rootDir = path.resolve(arg.slice("--root=".length));
      continue;
    }

    options.rootDir = path.resolve(arg);
  }

  return options;
}

function printReport(report) {
  console.log("Desktop download readiness gate");
  console.log(`Mode: ${report.mode}`);

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
