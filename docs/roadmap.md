# 2026-07-03T11:49:34-06:00 - Roadmap

Document status: draft baseline
Status Updated: 2026-07-05T07:57:15-06:00

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

- Host the web app publicly through the D13 Cloudflare Pages production URL at `https://ai-task-router.pages.dev/`.
- Use GitHub plus Cloudflare as the intended free distribution path.
- Prefer one canonical Cloudflare Pages app URL, not three app copies; D13 selected the Cloudflare Pages production URL for the first public web release.
- Keep the D5 PWA install path for the hosted app where supported.
- Plan a separate signed desktop app for Windows, macOS, and Linux when local machine discovery is ready.
- Use [public launch master plan](2026-07-04-public-launch-master-plan.md) as the controlling release map and [desktop trust and distribution plan](2026-07-04-desktop-trust-distribution-plan.md) as the baseline for desktop trust, signing, and release work.
- Desktop Chunk D0 is confirmed for planning, and Desktop Chunk D1 selected Tauri for the first desktop shell spike.
- Desktop Chunks D2 through D14 now cover the Tauri shell, trust boundary, permissioned local discovery, PWA install path, an opt-in unsigned internal Windows package artifact for evidence, release/security readiness, web release-candidate evidence, Cloudflare Pages hosted preview smoke, technical-preview desktop artifact lane, public launch master plan, Old Skool AI hub handoff package, Cloudflare Pages production web deployment, and the live Old Skool AI hub/cross-site link publication. Public desktop release, signing, updater, provider connections, credentials, telemetry, broad folder access, and file indexing are not approved.
- Chunk Fifteen added 22 fixture tasks and Playwright E2E coverage for setup, routing, export preparation, feedback, no-execution controls, and narrow-viewport overflow.
- Desktop Chunk D8 completed local web/PWA release-candidate security evidence and added `npm run scan:web-rc`; Desktop Chunk D9 created a Cloudflare Pages hosted preview at `https://preview-20260704-0c7b253.ai-task-router.pages.dev` and passed hosted E2E; Desktop Chunk D10 added the manual desktop technical-preview artifact lane; Desktop Chunk D11 added the public launch master plan; Desktop Chunk D12 added the Old Skool AI hub handoff package; Desktop Chunk D13 deployed and smoked the production app at `https://ai-task-router.pages.dev/`; Desktop Chunk D14 published and smoked the Old Skool AI hub at `https://oldskoolai.com/ai-task-router/`, support/security route at `https://oldskoolai.com/security/`, and Guided AI Labs/Journey links to the hub. Social launch still waits for owner approval.
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

