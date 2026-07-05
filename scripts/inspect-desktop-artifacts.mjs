import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageExtensions = new Set([
  ".appimage",
  ".deb",
  ".dmg",
  ".exe",
  ".msi",
  ".msix",
  ".rpm",
  ".zip",
]);

const defaultBundleDir = path.resolve(process.cwd(), "src-tauri", "target", "release", "bundle");

export async function sha256File(filePath) {
  const hash = createHash("sha256");

  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  return hash.digest("hex").toUpperCase();
}

export async function listDesktopArtifacts(rootDir = defaultBundleDir) {
  const rootExists = await stat(rootDir)
    .then((entry) => entry.isDirectory())
    .catch(() => false);

  if (!rootExists) {
    return [];
  }

  const artifacts = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile() || !packageExtensions.has(path.extname(entry.name).toLowerCase())) {
        continue;
      }

      const fileStat = await stat(fullPath);
      artifacts.push({
        path: path.relative(process.cwd(), fullPath),
        sizeBytes: fileStat.size,
        sha256: await sha256File(fullPath),
      });
    }
  }

  await walk(rootDir);
  artifacts.sort((left, right) => left.path.localeCompare(right.path));
  return artifacts;
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const mib = bytes / (1024 * 1024);
  return `${mib.toFixed(2)} MiB`;
}

async function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : defaultBundleDir;
  const artifacts = await listDesktopArtifacts(rootDir);

  if (artifacts.length === 0) {
    console.log(`No desktop package artifacts found under ${path.relative(process.cwd(), rootDir) || "."}.`);
    return;
  }

  console.log("Desktop package artifacts:");
  for (const artifact of artifacts) {
    console.log(`- ${artifact.path}`);
    console.log(`  size: ${formatSize(artifact.sizeBytes)}`);
    console.log(`  sha256: ${artifact.sha256}`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
