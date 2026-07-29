import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function stampServiceWorker() {
  return {
    name: "stamp-service-worker",
    closeBundle() {
      const swPath = join("dist", "service-worker.js");
      let hash: string;
      try {
        hash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
      } catch {
        hash = Date.now().toString(36);
      }
      const content = readFileSync(swPath, "utf8");
      writeFileSync(swPath, `// build: ${hash}\n${content}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), stampServiceWorker()],
});
