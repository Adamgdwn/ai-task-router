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
- desktop wrappers
- hosted multi-user infrastructure

## Future Desktop Architecture

Desktop packaging is intentionally excluded from v0.2. The future desktop track is documented in [desktop trust and distribution plan](desktop-trust-distribution-plan.md).

The likely future architecture keeps the React frontend and adds a narrow native layer for desktop-only local discovery. The frontend should not receive broad filesystem access. Native commands should be allowlisted, read-only, timeout-bound, and triggered only after explicit user approval.

The first desktop architecture decision should compare Tauri and Electron in an ADR. Tauri is the current leading candidate because it can wrap the existing Vite app while keeping local system access behind a Rust command boundary.

Future desktop detection should remain limited to user-approved checks for local AI tools and model folders. It must not silently scan the machine, index files, upload local data, store credentials, or execute provider actions.

## Key Decisions

- Use the uploaded coder build brief as the canonical product source until repo-local docs are expanded.
- Build directly in this repository unless the owner later chooses a nested app folder.
- Keep permission levels capped at local draft/export; there is no execute permission level.
- Treat route recommendations and prompt packages as local decision artifacts, not actions.
- Treat installable desktop distribution as a separate future product surface requiring a trust-boundary design, governance review, and signing plan before implementation.

