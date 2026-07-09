# 2026-07-09T03:04:01+00:00 - Start Here

Last Updated: 2026-07-08T22:03:18-06:00
Status: draft
Status Updated: 2026-07-08T22:03:18-06:00
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

Default live build route: [docs/2026-07-09-current-build-pathway.md](docs/2026-07-09-current-build-pathway.md).

Do not load superseded pathway archives during normal startup. Use the active pathway above for current chunks, validation expectations, and handoff.

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

The browser/PWA app is live at `https://ai-task-router.pages.dev/`, the Old Skool AI public hub is live at `https://oldskoolai.com/ai-task-router/`, and public desktop downloads remain held. Suggested-stage guidance currently lives in `src/domain/routing/stageGuidance.ts` and `src/ui/screens/StageGuidancePanel.tsx`.

The compact active pathway now lives in `docs/2026-07-09-current-build-pathway.md`. Superseded pathway archives are not part of startup or normal work routing. The active pathway contains the current chunk queue; Chunk 3 is integration complete and the next recommended build chunk is Chunk 4, the reviewed methodology page slice.

Do not publish public desktop downloads, GitHub Release artifacts, signing workflows, updater flows, social posts, custom-domain/DNS changes, live pricing tables, live pricing/model fetches, provider connections, exact public savings claims, Partner Center secrets, identity documents, tax/banking details, private account screenshots, or external execution workflows without a separate approved chunk and release gate evidence.

Update this file only when the top-level plan or handoff point changes. Put detailed step-by-step progress in the active plan named above.

After compaction or a context clear, restart from the latest handoff/work packet,
then run `git status --short`, read the short repo-local instructions, and open
only the active plan and files needed for the next objective.

