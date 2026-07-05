import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { listDesktopArtifacts, sha256File, writeDesktopChecksums } from "./inspect-desktop-artifacts.mjs";

test("lists desktop package artifacts with size and checksum", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-artifacts-"));

  try {
    await mkdir(path.join(tempRoot, "nsis"), { recursive: true });
    await mkdir(path.join(tempRoot, "deb"), { recursive: true });

    const installerPath = path.join(tempRoot, "nsis", "AI Task Router_0.2.0_x64-setup.exe");
    const debPath = path.join(tempRoot, "deb", "ai-task-router_0.2.0_amd64.deb");
    const ignoredPath = path.join(tempRoot, "notes.txt");

    await writeFile(installerPath, "installer");
    await writeFile(debPath, "debian-package");
    await writeFile(ignoredPath, "not an artifact");

    const artifacts = await listDesktopArtifacts(tempRoot);

    assert.equal(artifacts.length, 2);
    assert.deepEqual(
      artifacts.map((artifact) => artifact.path),
      [path.relative(process.cwd(), debPath), path.relative(process.cwd(), installerPath)],
    );
    assert.deepEqual(
      artifacts.map((artifact) => artifact.sizeBytes),
      ["debian-package".length, "installer".length],
    );
    assert.equal(
      artifacts[0].sha256,
      createHash("sha256").update("debian-package").digest("hex").toUpperCase(),
    );

    const checksumPath = path.join(tempRoot, "SHA256SUMS.txt");
    await writeDesktopChecksums(tempRoot, checksumPath);

    const checksumBody = await readFile(checksumPath, "utf8");
    assert.match(checksumBody, /AI Task Router_0\.2\.0_x64-setup\.exe/);
    assert.match(checksumBody, /ai-task-router_0\.2\.0_amd64\.deb/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("calculates a SHA-256 checksum for a file", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "ai-task-router-checksum-"));

  try {
    const filePath = path.join(tempRoot, "artifact.exe");
    await writeFile(filePath, "checksum-target");

    assert.equal(
      await sha256File(filePath),
      createHash("sha256").update("checksum-target").digest("hex").toUpperCase(),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
