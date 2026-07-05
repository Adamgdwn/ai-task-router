# 2026-07-03T11:58:27-06:00 - AI Task Router

AI Task Router is a local-first decision helper for choosing the smallest adequate AI route for a task.

It recommends lean, balanced, and premium tool/model routes while respecting task information choices, sensitivity, privacy posture, cost, energy, quality needs, and user-configured tool availability.

## Product Boundary

This project is not an autonomous agent.

The MVP may:

- recommend AI tool/model/toolchain routes
- generate route cards
- generate step-by-step prompt packages
- save local route decisions
- capture local route feedback
- export Markdown, JSON, and CSV artifacts

The MVP must not:

- call external AI APIs
- connect to external systems
- execute actions
- send, publish, merge, schedule, delete, deploy, or modify external records
- store credentials
- perform live source search or file indexing
- include hidden telemetry

## Current Status

Status: v0.2 browser MVP validation lane, with Desktop Chunk D4 permissioned local AI tool detection implemented for the desktop app; desktop build passes, but dev mode and unsigned release executable launch are blocked by Windows Application Control
Status Updated: 2026-07-04T18:16:13-06:00

Public repository: https://github.com/Adamgdwn/ai-task-router

Current target: v0.2 Local Web App MVP

Active plan: [docs/2026-07-03-current-pathway.md](docs/2026-07-03-current-pathway.md)

Product brief: [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md)

## Planned Stack

- Vite
- React
- TypeScript
- Zod
- Dexie / IndexedDB
- Vitest
- Playwright
- Tauri, for the desktop shell and permissioned local discovery prototype

## Local Setup

Install dependencies:

```bash
npm install
```

Run the local app:

```bash
npm run dev
```

Run the smoke test:

```bash
npm run test
```

Check for local model tools on this machine:

```bash
npm run detect:local-models
```

This local check does not change the browser app, connect accounts, call AI providers, or send data anywhere.
Use `npm run detect:local-models -- --details` only when you want local model names printed in the terminal.

Build the app:

```bash
npm run build
```

Check the desktop shell environment:

```bash
npm run desktop:info
```

Run the desktop shell in dev mode after Tauri prerequisites are installed:

```bash
npm run desktop:dev
```

Current Windows lab note: `npm run desktop:dev` reaches the Vite dev server but the debug Rust build is blocked by Windows Application Control policy when Cargo tries to execute a generated `build-script-build.exe`.

After the D4 rebuild, the unsigned release executable launch remains blocked by the same Application Control policy family. The no-bundle desktop build still succeeds when the current shell can see `C:\Users\adamg\.cargo\bin`.

Build the desktop shell without packaging:

```bash
npm run desktop:build
```

Desktop prerequisites installed on this Windows machine:

- Rustup `1.29.0` with Rust/Cargo `1.96.1`, default `stable-x86_64-pc-windows-msvc`
- Visual Studio Build Tools 2022 `17.14.35`
- MSVC `14.44.35207`
- Windows SDK `10.0.26100.0`
- WebView2 `149.0.4022.98`

The desktop app is still an internal prototype. It now has a desktop-only `Check this computer` flow for selected local AI tools, but it does not add packaging, signing, updater, provider connections, telemetry, credentials, file indexing, arbitrary folder inspection, or external actions.

Desktop Chunk D4 implements the first native local discovery path: custom Rust commands check only allowlisted local tools after user approval, hide model names by default, reject path details, and return schema-validated results to the UI. Browser users still add tools manually.

Manual local start check used for Chunk One:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Project Classification

Primary use case: AI decision-support web application

Selected risk tier: low

Selected governance level: 1

Sensitive data: No external sensitive-data processing in MVP. User-entered task metadata and local route logs only.

Production action capability: None. No execution mode exists.

Human approval required: Required for public-facing risk, regulated/highly restricted scenarios, and any future high-impact route recommendation.

## Documentation

- [Product brief](docs/PRODUCT_BRIEF.md)
- [Architecture](docs/architecture.md)
- [Context map](docs/context-map.md)
- [Current build pathway](docs/2026-07-03-current-pathway.md)
- [Manual](docs/manual.md)
- [Roadmap](docs/roadmap.md)
- [Desktop trust and distribution plan](docs/2026-07-04-desktop-trust-distribution-plan.md)
- [Desktop wrapper ADR](docs/decisions/adr-0001-desktop-wrapper.md)
- [Durable development policy](docs/policy/durable-development-engineering-policy.md)
- [Engineering standards](docs/standards/README.md)
- [Document control standard](docs/standards/document-control-standard.md)
- [Ship-ready standard](docs/standards/ship-ready-engineering-standard.md)

