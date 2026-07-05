# 2026-07-03T11:49:34-06:00 - Architecture Overview

Document status: draft baseline

## Summary

AI Task Router is planned as a local-first React/TypeScript web app.

Its core responsibility is to recommend AI tool/model/toolchain routes for a user-entered task while respecting tool availability, source permissions, sensitivity, privacy posture, cost preference, energy preference, and quality needs.

The MVP is intentionally not an AI agent. It does not execute actions, call provider APIs, connect to external systems, store credentials, search sources automatically, or modify external records.

## Components

Planned MVP components:

- UI shell and screens for setup, task intake, route results, route cards, prompt packages, route logs, and reference material
- domain types and runtime schemas
- editable default registries for models, sources, policies, and task templates
- deterministic hard gates
- route candidate generation
- weighted scoring engine
- route card generator
- prompt package generator
- local IndexedDB persistence
- Markdown, JSON, and CSV export/import utilities
- unit and end-to-end tests

## Data Flow

Planned v0.2 flow:

1. User configures available tools/models.
2. User configures source permissions and policy defaults.
3. User enters structured task intake.
4. App validates intake and local configuration.
5. App applies hard gates.
6. App generates lean, balanced, and premium route candidates.
7. App scores routes and selects a recommendation.
8. App renders warnings, blocked routes, route card, and prompt package.
9. User may save the local route log entry.
10. User may export route card, route log, or configuration.

All MVP data stays in browser-local storage or user-triggered exports.

## Dependencies

Planned implementation dependencies:

- Vite
- React
- TypeScript
- Zod
- Dexie / IndexedDB
- Vitest
- Playwright
- Mermaid for reference diagrams

Excluded from v0.2:

- provider SDKs
- external AI APIs
- auth providers
- OAuth connectors
- cloud databases
- vector databases
- background workers
- public desktop wrappers and installers
- hosted multi-user infrastructure

## Future Desktop Architecture

Desktop packaging is intentionally excluded from v0.2. The future desktop track is documented in [desktop trust and distribution plan](2026-07-04-desktop-trust-distribution-plan.md).

The desktop architecture keeps the React frontend and adds a narrow Tauri native layer for desktop-only local discovery. The frontend does not receive broad filesystem access. Native commands are allowlisted, read-only, timeout-bound, schema-validated, and triggered only after explicit user approval.

ADR-0001 selected Tauri for the shell spike. Desktop Chunk D3 defined the `get_desktop_discovery_options` and `run_desktop_discovery` command contracts with Zod schemas in `src/domain/schemas.ts`. Desktop Chunk D4 implements those commands in `src-tauri/src/discovery.rs` and registers them through the Tauri invoke handler while keeping the default capability permission list free of broad `fs`, `shell`, process, upload, updater, provider, credential, telemetry, or database plugin permissions.

Desktop detection is limited to user-approved checks for allowlisted local AI tools and known model folders. It must not silently scan the machine, index files, expose paths, upload local data, store credentials, or execute provider actions.

## Key Decisions

- Use the uploaded coder build brief as the canonical product source until repo-local docs are expanded.
- Build directly in this repository unless the owner later chooses a nested app folder.
- Keep permission levels capped at local draft/export; there is no execute permission level.
- Treat route recommendations and prompt packages as local decision artifacts, not actions.
- Treat public installable desktop distribution as a separate future product surface requiring a signing plan, packaging review, and owner approval before release.

