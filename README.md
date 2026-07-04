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

Status: v0.2 browser MVP validation lane, with Desktop Chunk D2 queued as a Tauri shell spike
Status Updated: 2026-07-04T14:56:49-06:00

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

