import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ignoredDirectoryNames = new Set([
  ".cache",
  ".git",
  ".idea",
  ".vite",
  ".vscode",
  "build",
  "coverage",
  "node_modules",
  "playwright-report",
  "test-results",
]);

const ignoredSourceDirectories = new Set(["dist", "src-tauri/target"]);

const textExtensions = new Set([
  ".conf",
  ".css",
  ".html",
  ".js",
  ".json",
  ".lock",
  ".md",
  ".mjs",
  ".rs",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".webmanifest",
  ".xml",
  ".yaml",
  ".yml",
]);

const highConfidenceSecretPatterns = [
  {
    id: "private-key",
    pattern: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/i,
  },
  {
    id: "aws-access-key",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  },
  {
    id: "github-token",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  },
  {
    id: "gitlab-token",
    pattern: /\bglpat-[A-Za-z0-9_-]{20,}\b/,
  },
  {
    id: "openai-style-key",
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
  },
  {
    id: "google-api-key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/,
  },
  {
    id: "slack-token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  },
];

const allowedBuildUrlPrefixes = [
  "http://bit.ly/2kdckMn",
  "http://json-schema.org/",
  "http://sodipodi.sourceforge.net/",
  "http://www.inkscape.org/",
  "http://www.w3.org/",
  "https://json-schema.org/",
  "https://ai.google.dev/gemini-api/docs/pricing",
  "https://api-docs.deepseek.com/quick_start/pricing",
  "https://arxiv.org/html/2505.09598v1",
  "https://claude.com/pricing",
  "https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference",
  "https://developers.openai.com/api/docs/pricing",
  "https://docs.perplexity.ai/docs/getting-started/pricing",
  "https://docs.x.ai/developers/models",
  "https://mistral.ai/pricing/",
  "https://react.dev/errors/",
  "https://tinyurl.com/y2uuvskb",
  "https://www.w3.org/",
];

export async function runWebReleaseCandidateScan(rootDir = process.cwd()) {
  const absoluteRoot = path.resolve(rootDir);
  const findings = [];
  const warnings = [];

  await scanEnvFiles(absoluteRoot, findings);
  await scanSourceFilesForSecrets(absoluteRoot, findings, warnings);

  const distDir = path.join(absoluteRoot, "dist");
  if (!(await isDirectory(distDir))) {
    findings.push({
      check: "dist-present",
      path: "dist",
      message: "Production build output was not found. Run npm run build before this scan.",
      severity: "error",
    });
  } else {
    await scanBuiltArtifactForSecrets(distDir, findings, warnings);
    await scanBuiltArtifactForExternalUrls(distDir, findings, warnings);
    await validateManifest(distDir, findings);
    await validateServiceWorker(distDir, findings);
  }

  return {
    ok: findings.length === 0,
    findings,
    warnings,
  };
}

async function scanEnvFiles(rootDir, findings) {
  const entries = await readdir(rootDir, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.startsWith(".env") || entry.name === ".env.example") {
      continue;
    }

    findings.push({
      check: "env-file",
      path: entry.name,
      message: "Local environment file is present in the repository root. Do not release or commit environment files.",
      severity: "error",
    });
  }
}

async function scanSourceFilesForSecrets(rootDir, findings, warnings) {
  const files = await listTextFiles(rootDir, { mode: "source", rootDir });

  for (const filePath of files) {
    await scanTextFileForSecrets(rootDir, filePath, findings, warnings, "source-secret");
  }
}

async function scanBuiltArtifactForSecrets(distDir, findings, warnings) {
  const files = await listTextFiles(distDir, { mode: "dist", rootDir: distDir });

  for (const filePath of files) {
    await scanTextFileForSecrets(distDir, filePath, findings, warnings, "dist-secret");
  }
}

async function scanTextFileForSecrets(rootDir, filePath, findings, warnings, check) {
  const relativePath = normalizePath(path.relative(rootDir, filePath));
  const content = await readTextFile(filePath, warnings, check, relativePath);
  if (content === null) {
    return;
  }

  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const secretPattern of highConfidenceSecretPatterns) {
      if (!secretPattern.pattern.test(line)) {
        continue;
      }

      findings.push({
        check,
        line: index + 1,
        path: relativePath,
        message: `High-confidence ${secretPattern.id} pattern detected. The matching value was intentionally not printed.`,
        severity: "error",
      });
    }
  }
}

async function scanBuiltArtifactForExternalUrls(distDir, findings, warnings) {
  const files = await listTextFiles(distDir, { mode: "dist", rootDir: distDir });
  const urlPattern = /https?:\/\/[^\s"'<>)]*/g;

  for (const filePath of files) {
    const relativePath = normalizePath(path.relative(distDir, filePath));
    const content = await readTextFile(filePath, warnings, "dist-external-url", relativePath);
    if (content === null) {
      continue;
    }

    const urls = new Set(content.match(urlPattern) ?? []);
    for (const url of urls) {
      if (url.includes("${") || url.startsWith("http://[")) {
        continue;
      }

      if (allowedBuildUrlPrefixes.some((prefix) => url.startsWith(prefix))) {
        continue;
      }

      findings.push({
        check: "dist-external-url",
        path: relativePath,
        message: `Unexpected external URL in production artifact: ${url}`,
        severity: "error",
      });
    }
  }
}

async function validateManifest(distDir, findings) {
  const manifestPath = path.join(distDir, "manifest.webmanifest");
  const relativePath = "manifest.webmanifest";
  const content = await readFile(manifestPath, "utf8").catch(() => null);

  if (!content) {
    findings.push({
      check: "manifest",
      path: relativePath,
      message: "PWA manifest is missing from the production build.",
      severity: "error",
    });
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(content);
  } catch (error) {
    findings.push({
      check: "manifest",
      path: relativePath,
      message: `PWA manifest is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      severity: "error",
    });
    return;
  }

  const expectedFields = [
    ["name", "AI Task Router | Guided AI Labs"],
    ["short_name", "AI Task Router"],
    ["start_url", "/"],
    ["scope", "/"],
    ["display", "standalone"],
  ];

  for (const [field, expectedValue] of expectedFields) {
    if (manifest[field] !== expectedValue) {
      findings.push({
        check: "manifest",
        path: relativePath,
        message: `Expected manifest ${field} to be ${JSON.stringify(expectedValue)}, found ${JSON.stringify(manifest[field])}.`,
        severity: "error",
      });
    }
  }

  const iconSizes = new Set((Array.isArray(manifest.icons) ? manifest.icons : []).map((icon) => icon?.sizes));
  for (const requiredSize of ["192x192", "512x512"]) {
    if (!iconSizes.has(requiredSize)) {
      findings.push({
        check: "manifest",
        path: relativePath,
        message: `Expected a ${requiredSize} PWA icon in the manifest.`,
        severity: "error",
      });
    }
  }
}

async function validateServiceWorker(distDir, findings) {
  const serviceWorkerPath = path.join(distDir, "service-worker.js");
  const relativePath = "service-worker.js";
  const content = await readFile(serviceWorkerPath, "utf8").catch(() => null);

  if (!content) {
    findings.push({
      check: "service-worker",
      path: relativePath,
      message: "Service worker is missing from the production build.",
      severity: "error",
    });
    return;
  }

  const forbiddenPatterns = [
    { id: "background-sync", pattern: /addEventListener\(\s*["']sync["']/ },
    { id: "periodic-background-sync", pattern: /addEventListener\(\s*["']periodicsync["']/ },
    { id: "push", pattern: /addEventListener\(\s*["']push["']/ },
    { id: "import-scripts", pattern: /\bimportScripts\s*\(/ },
    { id: "send-beacon", pattern: /\bsendBeacon\s*\(/ },
    { id: "websocket", pattern: /\bWebSocket\s*\(/ },
    { id: "event-source", pattern: /\bEventSource\s*\(/ },
    { id: "xhr", pattern: /\bXMLHttpRequest\b/ },
  ];

  for (const forbiddenPattern of forbiddenPatterns) {
    if (!forbiddenPattern.pattern.test(content)) {
      continue;
    }

    findings.push({
      check: "service-worker",
      path: relativePath,
      message: `Service worker contains forbidden ${forbiddenPattern.id} behavior for the web/PWA release candidate.`,
      severity: "error",
    });
  }

  if (!content.includes('url.origin !== self.location.origin')) {
    findings.push({
      check: "service-worker",
      path: relativePath,
      message: "Service worker should explicitly ignore cross-origin requests.",
      severity: "error",
    });
  }

  if (!content.includes('request.method !== "GET"')) {
    findings.push({
      check: "service-worker",
      path: relativePath,
      message: "Service worker should explicitly ignore non-GET requests.",
      severity: "error",
    });
  }
}

async function listTextFiles(rootDir, options) {
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true }).catch(() => []);

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = normalizePath(path.relative(options.rootDir, fullPath));

      if (entry.isDirectory()) {
        if (shouldSkipDirectory(entry.name, relativePath, options.mode)) {
          continue;
        }

        await walk(fullPath);
        continue;
      }

      if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  await walk(rootDir);
  files.sort((left, right) => left.localeCompare(right));
  return files;
}

function shouldSkipDirectory(name, relativePath, mode) {
  if (ignoredDirectoryNames.has(name)) {
    return true;
  }

  if (mode === "source" && ignoredSourceDirectories.has(relativePath)) {
    return true;
  }

  return false;
}

async function readTextFile(filePath, warnings, check, relativePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    warnings.push({
      check,
      path: relativePath,
      message: `Could not read text file during scan: ${error instanceof Error ? error.message : String(error)}`,
      severity: "warning",
    });
    return null;
  }
}

async function isDirectory(candidatePath) {
  return stat(candidatePath)
    .then((entry) => entry.isDirectory())
    .catch(() => false);
}

function normalizePath(candidatePath) {
  return candidatePath.split(path.sep).join("/");
}

function printReport(report) {
  console.log("Web release candidate scan");

  if (report.warnings.length > 0) {
    console.log(`Warnings: ${report.warnings.length}`);
    for (const warning of report.warnings) {
      console.log(`- ${warning.check}: ${warning.path} - ${warning.message}`);
    }
  }

  if (report.ok) {
    console.log("PASS: no release-blocking findings.");
    return;
  }

  console.error(`FAIL: ${report.findings.length} release-blocking finding(s).`);
  for (const finding of report.findings) {
    const line = finding.line ? `:${finding.line}` : "";
    console.error(`- ${finding.check}: ${finding.path}${line} - ${finding.message}`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  runWebReleaseCandidateScan()
    .then((report) => {
      printReport(report);
      process.exitCode = report.ok ? 0 : 1;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
