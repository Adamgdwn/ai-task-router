# 2026-07-03T11:49:34-06:00 - Architecture Overview

Document status: draft baseline

## Summary

AI Task Router is a local-first React/TypeScript web app.

Its core responsibility is to recommend the right AI helper, model tier, mode, or manual step for each stage of a user-entered task while respecting tool availability, source permissions, sensitivity, privacy posture, cost preference, energy preference, and quality needs.

The MVP is intentionally not an AI agent. It does not execute actions, call provider APIs, connect to external systems, store credentials, search sources automatically, or modify external records.

## Components

Current MVP components:

- UI shell and screens for setup, task intake, route results, staged guidance, Decision Cards, prompt packages, route logs, and reference material
- domain types and runtime schemas
- editable default registries for models, sources, policies, and task templates
- deterministic hard gates
- route candidate generation
- weighted scoring engine
- route card generator
- prompt package generator
- local IndexedDB persistence
- Markdown, JSON, and CSV export/import utilities
- PWA web manifest, branded install icons, and a production-only service worker for the hosted/browser install path
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
8. App renders warnings, blocked routes, staged guidance, a Decision Card, and a prompt package.
9. User may save the local route log entry.
10. User may export the Decision Card, route log, or configuration.

All MVP data stays in browser-local storage or user-triggered exports.

The hosted/browser build can be installed from supported browsers through the web app manifest and service worker. The
service worker caches same-origin app-shell assets only; it does not add provider calls, telemetry, local machine
inspection, file indexing, account connections, or background data collection. The browser/PWA install path remains
separate from desktop local discovery.

## Dependencies

Planned implementation dependencies:

- Vite
- React
- TypeScript
- Zod
- Dexie / IndexedDB
- Vitest
- Playwright
- Web App Manifest and Service Worker
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

Public desktop packaging is intentionally excluded from v0.2. Desktop Chunk D6 adds only an opt-in unsigned internal Windows package build for evidence, documented in [desktop packaging and signing spike](2026-07-04-desktop-packaging-signing-spike.md). The future desktop track is documented in [desktop trust and distribution plan](2026-07-04-desktop-trust-distribution-plan.md).

The desktop architecture keeps the React frontend and adds a narrow Tauri native layer for desktop-only local discovery. The frontend does not receive broad filesystem access. Native commands are allowlisted, read-only, timeout-bound, schema-validated, and triggered only after explicit user approval.

ADR-0001 selected Tauri for the shell spike. Desktop Chunk D3 defined the `get_desktop_discovery_options` and `run_desktop_discovery` command contracts with Zod schemas in `src/domain/schemas.ts`. Desktop Chunk D4 implements those commands in `src-tauri/src/discovery.rs` and registers them through the Tauri invoke handler while keeping the default capability permission list free of broad `fs`, `shell`, process, upload, updater, provider, credential, telemetry, or database plugin permissions.

Desktop detection is limited to user-approved checks for allowlisted local AI tools and known model folders. It must not silently scan the machine, index files, expose paths, upload local data, store credentials, or execute provider actions.

## Key Decisions

- Use the uploaded coder build brief as the canonical product source until repo-local docs are expanded.
- Build directly in this repository unless the owner later chooses a nested app folder.
- Keep permission levels capped at local draft/export; there is no execute permission level.
- Treat route recommendations and prompt packages as local decision artifacts, not actions.
- Treat public installable desktop distribution as a separate future product surface requiring a signing plan, packaging review, and owner approval before release.

