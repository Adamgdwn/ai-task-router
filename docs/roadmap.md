# 2026-07-03T11:49:34-06:00 - Roadmap

Document status: draft baseline
Status Updated: 2026-07-04T11:17:43-06:00

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
- Add at least 20 fixture tasks covering the MVP acceptance categories.
- Add end-to-end tests for setup, routing, export, and feedback.
- Polish documentation for v0.2 handoff.

## Future Distribution

- Host the web app publicly only after release-readiness review and deployment planning.
- Keep `oldskoolai.com` as the likely canonical product home, with links from `guidedailabs.com` and `guidedaijourney.com`.
- Add a PWA install path for the hosted app where supported.
- Plan a separate signed desktop app for Windows, macOS, and Linux when local machine discovery is ready.
- Use [desktop trust and distribution plan](desktop-trust-distribution-plan.md) as the baseline for desktop trust, signing, and release work.
- Run an owner governance review before desktop implementation because local machine inspection is a higher-trust surface than the v0.2 browser app.

## Explicitly Deferred

- External AI API calls
- Live source search
- File indexing
- OAuth connectors
- Auth and team mode
- Hosted/cloud storage
- Desktop packaging until the desktop trust plan is opened as a separate track
- PDF export unless trivial
- Agent mode or autonomous execution

