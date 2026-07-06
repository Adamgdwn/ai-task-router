# 2026-07-03T11:49:34-06:00 - Start Here

Last Updated: 2026-07-06T15:24:36.2422654-06:00
Status: draft
Status Updated: 2026-07-06T15:24:36.2422654-06:00
Owner: Project Owner

## Current Plan

For ordinary scoped work, agents should start with the lean startup checklist below. Read this file and follow the active plan named here for material work, unclear scope, handoffs, or changes that affect the active plan. Keep it short, current, and pointed at the active build path.

Current priorities:

- confirm project scope and governance level
- confirm use-case classification in `project-control.yaml`
- apply `docs/policy/durable-development-engineering-policy.md` during implementation
- apply `docs/standards/ship-ready-engineering-standard.md` before declaring meaningful work complete
- apply `docs/standards/document-control-standard.md` when creating or materially updating controlled docs, pathway notes, ADRs, runbooks, registers, validation logs, or handoffs
- use `docs/context-map.md` as the short routing map for task-specific context loads
- keep startup lean: use short repo orientation first, then trigger governance, Graphify, plugins, MCP tools, and release checks by task risk or scope
- use Graphify before broad source exploration or architecture analysis, using workspace routing plus repo-local semantic graphs for heavy active repos
- fill in project commands in `AI_BOOTSTRAP.md`
- keep work in context-window-friendly chunks
- timestamp material work, decisions, validation, and handoffs

## Current Build Pathway

Default live build route: [docs/2026-07-03-current-pathway.md](docs/2026-07-03-current-pathway.md).

If this project later promotes a different active plan, name it here and route
agents there instead of rereading archived pathway history.

For ordinary scoped work:

1. Run `git status --short`.
2. Read the repo-local agent instructions.
3. Use `docs/context-map.md` when context routing is unclear.
4. Inspect the specific files, errors, or docs needed for the task.
5. Run targeted validation after the change.

For material or risk-triggering changes:

1. Run `bash scripts/governance-preflight.sh`.
2. Review `docs/standards/README.md`.
3. Review `docs/standards/engineering-governance-by-use-case.md`.
4. Review `docs/policy/durable-development-engineering-policy.md`.
5. Review `docs/standards/ship-ready-engineering-standard.md`.
6. Review `docs/standards/document-control-standard.md` when the work creates or materially updates controlled documentation, validation records, ADRs, pathway logs, or handoffs.
7. Review `project-control.yaml`.
8. Check `exceptions` in `project-control.yaml` and any exception records.
9. For broad source exploration, architecture analysis, dependency tracing, or cross-repo planning, use the Graphify policy at `local Graphify governance file, when available` before reading raw source broadly. Reference `local Graphify workspace graph, when available` for cross-repo routing, set up repo-local Graphify when a new repo becomes active, run `/graphify /path/to/repo` from Claude Code for full semantic repo graphs on heavy active repos, and update the relevant graph after code changes.
10. Capture the work timestamp with `date -Iseconds`.
11. Work in the smallest complete chunk that can be reviewed safely.

Risk-triggering work includes production, deployment, authentication, authorization, payments, secrets, sensitive data, database migrations, customer communications, external side effects, infrastructure or provider settings, destructive actions, autonomous tool use, risk classification, governance policy changes, or release readiness.

## Agent Handoff

D22 Windows Store trust prep is task complete with public downloads still held. The browser/PWA app is live at `https://ai-task-router.pages.dev/`, the Old Skool AI public hub is live at `https://oldskoolai.com/ai-task-router/`, the public security route is live at `https://oldskoolai.com/security/`, and Guided AI Labs plus Guided AI Journey now link to the hub. Evidence is recorded in `docs/2026-07-05-cloudflare-production-launch-smoke.md`, `docs/2026-07-05-public-hub-and-cross-site-link-smoke.md`, `docs/2026-07-05-public-impact-insight-cloudflare-update.md`, `docs/2026-07-05-desktop-download-readiness-gate.md`, `docs/2026-07-05-public-stage-guidance-cloudflare-update.md`, `docs/2026-07-05-public-pdf-report-cloudflare-update.md`, `docs/2026-07-06-desktop-public-distribution-decision.md`, `docs/2026-07-06-windows-msix-proof.md`, and `docs/2026-07-06-windows-store-trust-prep.md`. The impact calculation backbone is recorded in `docs/2026-07-05-impact-estimator-methodology.md` and implemented in `src/domain/impact/impactEstimator.ts` plus `src/domain/impact/publicImpactSnapshot.ts`. Desktop artifact/checksum and public evidence gating is implemented in `scripts/desktop-release-gate.mjs`; public mode looks for real evidence at `docs/release/desktop-public-release-evidence.json`, while `docs/release/desktop-public-release-evidence.template.json` remains a hold-state template. Windows MSIX proof packaging is implemented in `scripts/package-windows-msix-proof.mjs`, with checked-in manifest/assets under `src-tauri/windows-msix/` and manual workflow support in `.github/workflows/desktop-technical-preview.yml`. Windows Store manifest preparation is implemented in `scripts/prepare-windows-store-manifest.mjs`; it expects real Partner Center values in `docs/release/windows-store-package-identity.json`, using `docs/release/windows-store-package-identity.template.json` as the owner fill-in template. Suggested-stage guidance is implemented in `src/domain/routing/stageGuidance.ts` and rendered in `src/ui/screens/StageGuidancePanel.tsx`. PDF-ready reports are implemented in saved Decision Cards through `src/ui/screens/RouteArtifactScreens.tsx`, shared impact copy in `src/ui/screens/ImpactInsightPanel.tsx`, and print CSS in `src/styles.css`.

The next chunk should be an owner-approved social/video launch copy-review step using the now-public safe impact, stage-guidance, and PDF-report language; a reviewed public methodology page; an opt-in local estimator UI; or the next Windows Store submission slice. For desktop downloads, D20-D22 keep Windows Store/MSIX first with direct signed installer as fallback; the next desktop step is owner-controlled Partner Center account/app reservation, then copying non-secret package identity values into `docs/release/windows-store-package-identity.json` and running `npm run desktop:prepare:windows-store-manifest -- --write`. Do not publish public desktop downloads, GitHub Release artifacts, signing workflows, updater flows, social posts, custom-domain/DNS changes, live pricing tables, live pricing/model fetches, provider connections, exact public savings claims, Partner Center secrets, identity documents, tax/banking details, or private account screenshots without a separate approved chunk and release gate evidence.

Update this file only when the top-level plan or handoff point changes. Put detailed step-by-step progress in the active plan named above.

After compaction or a context clear, restart from the latest handoff/work packet,
then run `git status --short`, read the short repo-local instructions, and open
only the active plan and files needed for the next objective.

