import { cp, mkdir, rm, stat, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { sha256File, writeDesktopChecksums } from "./inspect-desktop-artifacts.mjs";

const defaultRootDir = process.cwd();
const certificatePassword = "password";

export function createWindowsMsixProofPaths(rootDir = defaultRootDir) {
  const root = path.resolve(rootDir);
  const proofRoot = path.join(root, "src-tauri", "target", "msix-proof");
  const bundleRoot = path.join(root, "src-tauri", "target", "release", "bundle");
  const outputDir = path.join(bundleRoot, "msix");

  return {
    root,
    manifestPath: path.join(root, "src-tauri", "windows-msix", "Package.appxmanifest"),
    assetsDir: path.join(root, "src-tauri", "windows-msix", "Assets"),
    releaseExePath: path.join(root, "src-tauri", "target", "release", "ai-task-router-desktop.exe"),
    stageDir: path.join(proofRoot, "staged"),
    stageManifestPath: path.join(proofRoot, "staged", "Package.appxmanifest"),
    stageAssetsDir: path.join(proofRoot, "staged", "Assets"),
    stageExePath: path.join(proofRoot, "staged", "ai-task-router-desktop.exe"),
    certPath: path.join(proofRoot, "devcert.pfx"),
    certPublicPath: path.join(proofRoot, "devcert.cer"),
    bundleRoot,
    outputDir,
    outputPath: path.join(outputDir, "AI-Task-Router_0.2.0.0_x64.msix"),
  };
}

export function isPathInside(parentDir, candidatePath) {
  const relative = path.relative(path.resolve(parentDir), path.resolve(candidatePath));
  return relative === "" || (relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative));
}

export function createBuildEnvironment(baseEnv = process.env) {
  const cargoBin = path.join(baseEnv.USERPROFILE ?? "", ".cargo", "bin");
  const pathValue = [cargoBin, baseEnv.PATH ?? ""].filter(Boolean).join(path.delimiter);

  return {
    ...baseEnv,
    PATH: pathValue,
    WINAPP_CLI_TELEMETRY_OPTOUT: "1",
  };
}

function commandName(command) {
  return command;
}

async function pathExists(filePath) {
  return stat(filePath)
    .then(() => true)
    .catch(() => false);
}

async function requirePath(filePath, label) {
  if (!(await pathExists(filePath))) {
    throw new Error(`${label} is missing at ${path.relative(process.cwd(), filePath)}.`);
  }
}

async function resetStagingDirectory(paths) {
  if (!isPathInside(path.join(paths.root, "src-tauri", "target"), paths.stageDir)) {
    throw new Error(`Refusing to reset staging directory outside src-tauri/target: ${paths.stageDir}`);
  }

  await rm(paths.stageDir, { recursive: true, force: true });
  await mkdir(paths.stageDir, { recursive: true });
}

async function runCommand(command, args, options) {
  console.log(`> ${command} ${args.join(" ")}`);

  await new Promise((resolve, reject) => {
    const child = spawn(commandName(command), args, {
      cwd: options.cwd,
      env: options.env,
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}.`));
    });
  });
}

async function runNpm(args, options) {
  const npmCliPath = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

  if (await pathExists(npmCliPath)) {
    await runCommand(process.execPath, [npmCliPath, ...args], options);
    return;
  }

  await runCommand("npm", args, options);
}

function parseArgs(rawArgs) {
  return {
    skipBuild: rawArgs.includes("--skip-build"),
  };
}

export async function packageWindowsMsixProof(options = {}) {
  if (process.platform !== "win32") {
    throw new Error("Windows MSIX proof packaging must run on Windows.");
  }

  const paths = createWindowsMsixProofPaths(options.rootDir);
  const env = createBuildEnvironment(options.env ?? process.env);

  await requirePath(paths.manifestPath, "Windows MSIX manifest");
  await requirePath(paths.assetsDir, "Windows MSIX assets directory");

  await runCommand("winapp", ["--version"], { cwd: paths.root, env });

  if (!options.skipBuild) {
    await runNpm(["run", "desktop:build"], { cwd: paths.root, env });
  }

  await requirePath(paths.releaseExePath, "Tauri release executable");

  await resetStagingDirectory(paths);
  await mkdir(paths.outputDir, { recursive: true });
  await rm(paths.outputPath, { force: true });

  await copyFile(paths.releaseExePath, paths.stageExePath);
  await copyFile(paths.manifestPath, paths.stageManifestPath);
  await cp(paths.assetsDir, paths.stageAssetsDir, { recursive: true });

  await runCommand(
    "winapp",
    [
      "cert",
      "generate",
      "--manifest",
      paths.stageManifestPath,
      "--output",
      paths.certPath,
      "--password",
      certificatePassword,
      "--export-cer",
      "--if-exists",
      "Overwrite",
      "--quiet",
    ],
    { cwd: paths.root, env },
  );

  await runCommand(
    "winapp",
    [
      "package",
      paths.stageDir,
      "--manifest",
      paths.stageManifestPath,
      "--cert",
      paths.certPath,
      "--cert-password",
      certificatePassword,
      "--output",
      paths.outputPath,
      "--executable",
      "ai-task-router-desktop.exe",
      "--quiet",
    ],
    { cwd: paths.root, env },
  );

  await requirePath(paths.outputPath, "Windows MSIX proof package");
  const sha256 = await sha256File(paths.outputPath);
  await writeDesktopChecksums(paths.bundleRoot);

  return {
    outputPath: paths.outputPath,
    sha256,
    certPublicPath: paths.certPublicPath,
    checksumPath: path.join(paths.bundleRoot, "SHA256SUMS.txt"),
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  packageWindowsMsixProof(parseArgs(process.argv.slice(2)))
    .then((result) => {
      console.log("Windows MSIX proof package created.");
      console.log(`- ${path.relative(process.cwd(), result.outputPath)}`);
      console.log(`  sha256: ${result.sha256}`);
      console.log(`- ${path.relative(process.cwd(), result.checksumPath)}`);
      console.log("This proof package is signed with a local development certificate and is not public-download ready.");
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
