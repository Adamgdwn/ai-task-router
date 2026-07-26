# 2026-07-09T03:04:01+00:00 - AI Task Router

AI Task Router is a local-first guide that helps people use AI more efficiently and with lower environmental impact, by staging the work and right-sizing the tool.

For an individual user, the core value is practical: break the task into stages, start each stage with the smallest adequate help, upgrade only when the task shows it needs more, and leave with a staged plan that can be followed manually outside the app.

It recommends lean, balanced, and premium routes while respecting task information choices, sensitivity, privacy posture, cost, energy, quality needs, and user-configured tool availability.

## What It Recommends, And What It Does Not

It recommends a **tier** — small, mid, frontier, research, or artifact — and a **shape of work**: which weight of help belongs at which stage, and where a person should review.

It does not know which vendor suits your task. Capability data is bucketed by plan class, not by vendor, so a paid ChatGPT plan and a paid Claude plan carry the same capability profile in the scoring. Where a route names a specific app, that is because you told the app which tools you have, not because it judged one provider better than another for this task.

## What It Helps You Do

- see which weight of help belongs at each stage of the work, instead of using one tool for everything
- separate framing, fact-checking, drafting, reviewing, and packaging
- see when a lighter route is enough and when a stronger model or research-capable tool earns its cost
- see what the work would cost if it were metered per token at public API list prices, which a monthly subscription otherwise hides
- save a local Decision Card and copy-ready prompt package without sending the task anywhere

Dollar figures answer one question: if this work were metered per token at public API list prices, roughly what would it come to? A monthly subscription hides that number, which is why it is worth seeing. It is not your bill, not money you saved, and not a guarantee.

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

Status: v0.2 browser/PWA app is live. The current product focus is making the individual user story clear: choose the right weight of help at the right stage, then save local guidance for manual use. The desktop track was abandoned on 2026-07-26; this is a web app and there is nothing to install beyond the browser's own install option. Social launch, custom domains, live pricing/model fetches, and exact public savings claims remain separate gated chunks.
Status Updated: 2026-07-25T10:33:23-06:00

Public repository: https://github.com/Adamgdwn/ai-task-router

Current online app: https://ai-task-router.pages.dev/

Current public hub: https://oldskoolai.com/ai-task-router/

Current target: v0.2 Local Web App MVP

Active plan: [docs/2026-07-09-current-build-pathway.md](docs/2026-07-09-current-build-pathway.md)

Product brief: [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md)

Impact-estimator methodology: [docs/2026-07-05-impact-estimator-methodology.md](docs/2026-07-05-impact-estimator-methodology.md)

Public impact insight update: [docs/2026-07-05-public-impact-insight-cloudflare-update.md](docs/2026-07-05-public-impact-insight-cloudflare-update.md)

## Planned Stack

- Vite
- React
- TypeScript
- Zod
- Dexie / IndexedDB
- Vitest
- Playwright
- Web app manifest and service worker for the hosted/PWA install path

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

Run the web release-candidate artifact scan after a production build:

```bash
npm run build
npm run scan:web-rc
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

Preview the production web/PWA build locally:

```bash
npm run preview -- --host 127.0.0.1 --port 5184
```

The hosted browser app now includes an install manifest, Guided AI Labs app icons, and a production-only service worker.
Supported browsers may offer an Install app option when the site is served over HTTPS or local preview. The app never
checks the user's computer; local AI tools are added by hand in My AI Tools.

Run Playwright against the hosted production app:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://ai-task-router.pages.dev"
npx playwright test
```

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
- [Current build pathway](docs/2026-07-09-current-build-pathway.md)
- [Manual](docs/manual.md)
- [Roadmap](docs/roadmap.md)
- [Public launch master plan](docs/2026-07-04-public-launch-master-plan.md)
- [Old Skool AI hub handoff package](docs/2026-07-04-old-skool-ai-hub-handoff.md)
- [Cloudflare production launch smoke](docs/2026-07-05-cloudflare-production-launch-smoke.md)
- [Public hub and cross-site link smoke](docs/2026-07-05-public-hub-and-cross-site-link-smoke.md)
- [Public impact insight Cloudflare update](docs/2026-07-05-public-impact-insight-cloudflare-update.md)
- [Public stage guidance Cloudflare update](docs/2026-07-05-public-stage-guidance-cloudflare-update.md)
- [Public PDF report Cloudflare update](docs/2026-07-05-public-pdf-report-cloudflare-update.md)
- [Release and security readiness packet](docs/2026-07-04-release-security-readiness-packet.md)
- [Web release candidate security pass](docs/2026-07-04-web-release-candidate-security-pass.md)
- [ADR-0002: abandon the desktop track](docs/decisions/adr-0002-abandon-desktop-track.md)
- [Security policy](SECURITY.md)
- [Durable development policy](docs/policy/durable-development-engineering-policy.md)
- [Engineering standards](docs/standards/README.md)
- [Document control standard](docs/standards/document-control-standard.md)
- [Ship-ready standard](docs/standards/ship-ready-engineering-standard.md)
