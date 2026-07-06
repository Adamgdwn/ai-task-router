import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  createBuildEnvironment,
  createWindowsMsixProofPaths,
  isPathInside,
} from "./package-windows-msix-proof.mjs";

test("Windows MSIX proof paths stay under the repo build output", () => {
  const root = path.resolve("C:/work/agent-picker");
  const paths = createWindowsMsixProofPaths(root);

  assert.equal(paths.manifestPath, path.join(root, "src-tauri", "windows-msix", "Package.appxmanifest"));
  assert.ok(isPathInside(path.join(root, "src-tauri", "target"), paths.stageDir));
  assert.ok(isPathInside(path.join(root, "src-tauri", "target", "release", "bundle"), paths.outputPath));
  assert.match(paths.outputPath, /AI-Task-Router_0\.2\.0\.0_x64\.msix$/);
});

test("path containment rejects sibling directories", () => {
  const root = path.resolve("C:/work/agent-picker/src-tauri/target");

  assert.equal(isPathInside(root, path.join(root, "msix-proof", "staged")), true);
  assert.equal(isPathInside(root, path.resolve("C:/work/agent-picker/src-tauri/target-other")), false);
  assert.equal(isPathInside(root, path.resolve("C:/work/agent-picker")), false);
});

test("WinApp build environment opts out of telemetry and preserves PATH", () => {
  const env = createBuildEnvironment({
    USERPROFILE: "C:\\Users\\tester",
    PATH: "C:\\Windows\\System32",
  });

  assert.equal(env.WINAPP_CLI_TELEMETRY_OPTOUT, "1");
  assert.ok(env.PATH.startsWith("C:\\Users\\tester\\.cargo\\bin"));
  assert.ok(env.PATH.endsWith("C:\\Windows\\System32"));
});
