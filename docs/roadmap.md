# 2026-07-03T11:49:34-06:00 - Roadmap

Document status: draft baseline
Status Updated: 2026-07-04T22:10:36-06:00

## Now

- Lock the AI Task Router charter and product boundary.
- Keep the coder build brief as the canonical source until repo-local docs are expanded.
- Define detailed build chunks before implementation.
- Initialize the Vite/React/TypeScript app skeleton.
- Add placeholder screens and smoke validation.

## Next

- Implement domain types and Zod schemas.
- Add editable default registries for models, sources, policies, and task templates.
- Implement hard gates with clear reason strings.
- Generate lean, balanced, and premium route candidates.
- Add weighted scoring and least-resource-first tie-breakers.
- Generate route cards and prompt packages.

## Later

- Add local persistence with IndexedDB.
- Add Markdown, JSON, and CSV export/import.
- Build setup, task intake, results, route card, prompt package, route log, and feedback UI.
- Polish documentation for v0.2 handoff.

## Future Distribution

- Host the web app publicly only after release-readiness review and deployment planning.
- Use GitHub plus Cloudflare as the intended free distribution path after the release/security gate passes.
- Prefer one canonical Cloudflare Pages app URL, not three app copies; the canonical URL is not selected yet and should be chosen from an owner-controlled root site, subpath, Cloudflare Pages default URL, or newly created subdomain before public launch.
- Keep the D5 PWA install path for the hosted app where supported; public hosting still needs a separate release/deployment chunk.
- Plan a separate signed desktop app for Windows, macOS, and Linux when local machine discovery is ready.
- Use [public launch master plan](2026-07-04-public-launch-master-plan.md) as the controlling release map and [desktop trust and distribution plan](2026-07-04-desktop-trust-distribution-plan.md) as the baseline for desktop trust, signing, and release work.
- Desktop Chunk D0 is confirmed for planning, and Desktop Chunk D1 selected Tauri for the first desktop shell spike.
- Desktop Chunks D2 through D11 now cover the Tauri shell, trust boundary, permissioned local discovery, PWA install path, an opt-in unsigned internal Windows package artifact for evidence, release/security readiness, web release-candidate evidence, Cloudflare Pages hosted preview smoke, technical-preview desktop artifact lane, and public launch master plan. Public desktop release, signing, updater, provider connections, credentials, telemetry, broad folder access, and file indexing are not approved.
- Chunk Fifteen added 22 fixture tasks and Playwright E2E coverage for setup, routing, export preparation, feedback, no-execution controls, and narrow-viewport overflow.
- Desktop Chunk D8 completed local web/PWA release-candidate security evidence and added `npm run scan:web-rc`; Desktop Chunk D9 created a Cloudflare Pages hosted preview at `https://preview-20260704-0c7b253.ai-task-router.pages.dev` and passed hosted E2E; Desktop Chunk D10 added the manual desktop technical-preview artifact lane; Desktop Chunk D11 added the public launch master plan. Public launch still waits for D12 Old Skool AI hub handoff, canonical URL confirmation, custom-domain smoke if used, Cloudflare GitHub-integration/direct-upload decision, and owner launch decision.
- Run an owner governance review before desktop implementation because local machine inspection is a higher-trust surface than the v0.2 browser app.

## Explicitly Deferred

- External AI API calls
- Live source search
- File indexing
- OAuth connectors
- Auth and team mode
- Hosted/cloud storage
- Public desktop packaging, signing, updater, and installer publishing until the desktop trust plan reaches a controlled beta or release chunk
- PDF export unless trivial
- Agent mode or autonomous execution

