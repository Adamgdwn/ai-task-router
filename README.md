# 2026-07-03T11:51:11-06:00 - AI Task Router

AI Task Router is a local-first decision helper for choosing the smallest adequate AI route for a task.

It recommends lean, balanced, and premium tool/model routes while respecting source permissions, sensitivity, privacy posture, cost, energy, quality needs, and user-configured tool availability.

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

Status: charter/planning baseline
Status Updated: 2026-07-03T11:51:11-06:00

Public repository: https://github.com/Adamgdwn/ai-task-router

Current target: v0.2 Local Web App MVP

Active plan: [docs/current-build-pathway.md](docs/current-build-pathway.md)

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

The app scaffold has not been created yet. Chunk 0 will add package scripts and local setup commands.

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
- [Current build pathway](docs/current-build-pathway.md)
- [Manual](docs/manual.md)
- [Roadmap](docs/roadmap.md)
- [Durable development policy](docs/policy/durable-development-engineering-policy.md)
- [Engineering standards](docs/standards/README.md)
- [Ship-ready standard](docs/standards/ship-ready-engineering-standard.md)

