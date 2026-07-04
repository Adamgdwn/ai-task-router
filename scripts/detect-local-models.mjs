#!/usr/bin/env node

import { existsSync, readdirSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const includeDetails = process.argv.includes("--details") || process.argv.includes("--json");
const outputJson = process.argv.includes("--json");
const home = homedir();

const report = {
  checkedAt: new Date().toISOString(),
  platform: platform(),
  note: "Local-only check. No network calls, account sign-ins, or app changes are performed.",
  tools: [
    detectOllama(),
    detectKnownFolders("LM Studio", [
      join(home, ".lmstudio", "models"),
      join(home, ".cache", "lm-studio", "models"),
      join(home, "AppData", "Local", "LM Studio", "models"),
    ]),
    detectKnownFolders("Jan", [
      join(home, ".jan", "models"),
      join(home, "jan", "models"),
      join(home, "AppData", "Roaming", "Jan", "models"),
    ]),
    detectKnownFolders("GPT4All", [
      join(home, "AppData", "Local", "nomic.ai", "GPT4All"),
      join(home, ".local", "share", "nomic.ai", "GPT4All"),
      join(home, "Library", "Application Support", "nomic.ai", "GPT4All"),
    ]),
  ],
};

if (outputJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printTextReport(report);
}

function detectOllama() {
  const cliResult =
    platform() === "win32"
      ? spawnSync("ollama list", {
          encoding: "utf8",
          shell: true,
          timeout: 5000,
        })
      : spawnSync("ollama", ["list"], {
          encoding: "utf8",
          timeout: 5000,
        });
  const folderResult = detectKnownFolders("Ollama", [join(home, ".ollama", "models")]);

  if (cliResult.status === 0) {
    const models = parseOllamaList(cliResult.stdout);

    return {
      tool: "Ollama",
      status: models.length > 0 ? "models-found" : "installed-no-models-found",
      models,
      checkedPaths: folderResult.checkedPaths,
      note: "Detected with `ollama list`.",
    };
  }

  if (folderResult.status !== "not-found") {
    return {
      ...folderResult,
      note: "Detected an Ollama model folder. Install the Ollama CLI to list model names.",
    };
  }

  return {
    ...folderResult,
    note: "Ollama CLI was not available on PATH.",
  };
}

function detectKnownFolders(tool, candidatePaths) {
  const foundPaths = candidatePaths.filter((candidatePath) => existsSync(candidatePath));
  const models = foundPaths.flatMap((foundPath) => listLikelyModelNames(foundPath));

  return {
    tool,
    status: foundPaths.length > 0 ? (models.length > 0 ? "models-found" : "folder-found") : "not-found",
    models,
    checkedPaths: candidatePaths,
    foundPaths,
    note: foundPaths.length > 0 ? "Detected local folders only." : "No common local folder found.",
  };
}

function listLikelyModelNames(folderPath) {
  try {
    return readdirSync(folderPath, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith("."))
      .filter((entry) => entry.isDirectory() || /\.(gguf|bin|safetensors)$/i.test(entry.name))
      .map((entry) => entry.name)
      .slice(0, 30);
  } catch {
    return [];
  }
}

function parseOllamaList(stdout) {
  return stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function printTextReport(localReport) {
  console.log("Local model check");
  console.log(localReport.note);
  console.log("");

  for (const toolReport of localReport.tools) {
    const modelCount = toolReport.models.length;
    const suffix = modelCount > 0 ? ` (${modelCount} model${modelCount === 1 ? "" : "s"})` : "";
    console.log(`${toolReport.tool}: ${toolReport.status}${suffix}`);

    if (includeDetails && modelCount > 0) {
      for (const modelName of toolReport.models) {
        console.log(`  - ${modelName}`);
      }
    }
  }

  if (!includeDetails) {
    console.log("");
    console.log("Run with --details to show model names, or --json to export the full report.");
  }
}
