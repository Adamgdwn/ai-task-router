# 2026-07-03T11:49:34-06:00 - AI Task Router Product Brief

Document status: charter baseline
Source inputs:

- `uploaded ai_task_router_coder_build_brief.md`
- `uploaded ai_task_router_product_flow.mmd`
- `uploaded ai_task_router_version_gates.mmd`

## Purpose

AI Task Router is a local-first, single-user decision helper that recommends the right AI helper, model tier, mode, or manual step for each stage of a task.

It evaluates the user's available tools, source permissions, task details, sensitivity, privacy posture, cost preference, energy preference, and quality needs. It then produces lean, balanced, and premium route options with warnings, blocked routes, a staged project plan, a Decision Card, and a prompt package.

The product promise for an individual user is simple: do not use one AI helper for everything. Frame the job, gather evidence, create, package, review, and act with the lightest safe helper for that stage, then upgrade only when the checks show the task needs stronger help.

## Product Boundary

The MVP recommends routes, generates prompt packages, saves local route decisions, captures local feedback, and exports artifacts.

The MVP must not:

- call external AI APIs
- connect to GitHub, Microsoft 365, Google, CRM, ERP, email, calendar, or other external systems
- send messages, publish content, merge code, schedule meetings, or trigger automations
- store credentials
- perform live source search
- index local files
- include an agent mode or execution permission level
- include hidden telemetry

## Canonical Version Gate

The coder build brief is the canonical version gate source until this repo has a generated `docs/VERSION_GATES.md`.

Current target: v0.2 Local Web App MVP.

v0.2 is complete only when the app can answer:

> Given this task, this user's tools, these permission settings, this sensitivity class, and this output need, what is the least-resource route that can produce an acceptable result?

The answer must include:

- lean route
- balanced route
- premium route
- recommended route
- warnings
- blocked routes
- prompt package
- exportable route card
- local route log entry

## Recommended MVP Stack

- Vite
- React
- TypeScript
- Zod
- Dexie / IndexedDB
- Vitest
- Playwright
- Mermaid for reference diagrams

Do not add Next.js, Supabase, auth, billing, live provider APIs, OAuth connectors, vector databases, embeddings, background workers, desktop packaging, or multi-tenant admin features in v0.2.

## Core Domain Model

Core concepts:

- user tool/model inventory
- source permission registry
- policy defaults
- task intake
- hard gates
- route candidate generation
- route scoring
- Decision Card / route card
- prompt package
- route log entry
- feedback outcome

Key classifiers:

- work stage
- PDCA method label
- knowledge work type
- output type
- quality bar
- sensitivity class
- source permission level

## Sensitivity And Permission Rules

Permission levels stop at local draft/export. There is no execute level.

Sensitivity classes:

- public
- internal
- confidential
- regulated
- highly restricted
- public-facing risk

Hard gates override scoring. Highly restricted content blocks external AI routes. No-access sources must not appear in route cards. Current-facts or citation tasks require research/citation-capable steps or explicit warnings. Public-facing risk requires human approval warnings.

## Build Philosophy

Small model first. Mid model for synthesis. Frontier model for expensive mistakes. Research tool for current evidence. Artifact tool for packaging. Human approval for high-risk output.

The app should feel like a calm routing coach for one person: smarter than a spreadsheet, more bounded than an agent, and explicit about which helper belongs at which stage.

