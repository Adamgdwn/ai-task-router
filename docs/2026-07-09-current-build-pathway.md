# 2026-07-09T03:04:01+00:00 - Current Build Pathway

Document ID: PATH-ENG-002
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-09
Last Reviewed: 2026-07-09
Next Review: During the next substantial build session
Last Updated: 2026-07-09T03:04:01+00:00
Status Updated: 2026-07-09T03:04:01+00:00

## Purpose

This is the compact active pathway for AI Task Router work after the original live pathway grew too large for context-friendly startup.

Use this file for current chunks, validation notes, and handoff. Treat [2026-07-03 Current Pathway](2026-07-03-current-pathway.md) as historical archive only. Search it with `rg` or open targeted excerpts when older evidence is needed; do not load the whole archive during normal startup.

## Active Source Of Truth

| Area | Source |
|---|---|
| Startup route | `START_HERE.md` |
| Active pathway | This document |
| Historical pathway archive | `docs/2026-07-03-current-pathway.md` |
| Product boundary | `README.md`, `project-control.yaml`, `docs/architecture.md` |
| Standards map | `docs/standards/README.md` |
| Context routing | `docs/context-map.md` |

## Current State

| Item | Status | Notes |
|---|---|---|
| Browser/PWA app | live | Production URL: `https://ai-task-router.pages.dev/`. |
| Old Skool AI hub | live | Public hub: `https://oldskoolai.com/ai-task-router/`; security route: `https://oldskoolai.com/security/`. |
| Public desktop downloads | held | Windows Store/MSIX is the preferred first trusted Windows path; ordinary-user downloads remain gated. |
| PDCA planning simplification | task complete | Visible planning now uses `Plan`, `Do`, `Check`, `Act`; expanded routing detail shows helper/model/mode and upgrade trigger. |
| Compact active pathway extraction | task complete | The active pathway is now this compact file; the long `2026-07-03` pathway is archive-only. |
| Active chunk | none selected | Next chunk is owner choice. |

## Product Boundary

The project is an AI decision-support web application, not an autonomous AI agent.

The MVP may recommend routes, generate route cards, generate prompt packages, save route decisions locally, capture local feedback, and export artifacts.

The MVP must not call provider APIs, connect accounts, store credentials, perform live source search, index files, execute external actions, send prompts, deploy, publish, purchase, or automate work outside the app.

## Held Scope

Do not start any of these without a separate approved chunk and release-gate evidence:

- public desktop downloads, GitHub Release artifacts, signing workflows, updater flows, or ordinary-user installers
- social posts, custom-domain or DNS changes, exact public savings claims, live pricing tables, or live model fetches
- provider account connections, telemetry, remote sync, authentication, external execution, or server-side planning
- Partner Center secrets, identity documents, tax or banking details, private account screenshots, or public Store submission actions

## Work Pattern

For ordinary scoped work:

1. Run `git status --short`.
2. Read `AGENTS.md`.
3. Use `docs/context-map.md` when context routing is unclear.
4. Inspect only files needed for the current objective.
5. Run targeted validation after the change.

For material or risk-triggering work:

1. Start from `START_HERE.md`.
2. Run `bash scripts/governance-preflight.sh`.
3. Review `project-control.yaml` and relevant standards from `docs/standards/README.md`.
4. Review `docs/standards/document-control-standard.md` for controlled docs, pathway notes, validation logs, or handoffs.
5. Capture a timestamp with `date -Iseconds`; if the local shell date and session date differ, record the exact timestamp used.
6. Work one bounded chunk.
7. Update this pathway with status, validation, known gaps, and next handoff.

## Chunk Template

Use this shape for the next selected chunk:

```md
## Active Chunk - <Name>

Status: active
Status Updated: <timestamp>
Completion target: Draft complete / Task complete / Integration complete / Release ready / Blocked
Budget class: Tiny / Small / Medium / Large / Strategic

Objective:

User outcome:

Likely files:

Non-goals:

Acceptance criteria:

Validation expectations:

Handoff note:
```

## Next Chunk Options

| Option | Why | Guardrails |
|---|---|---|
| Social/video launch copy review | Helps public explanation catch up to the working app. | No posting, exact savings claims, or public commitments without owner approval. |
| Reviewed methodology page | Turns impact/routing methodology into a cleaner public or semi-public explanation. | Keep claims sourced and cautious; avoid live pricing/model fetches. |
| Opt-in local estimator UI | Builds on the impact methodology with user-visible education. | No telemetry, account connections, or exact guaranteed savings claims. |
| Windows Store submission slice | Moves the trusted desktop lane forward. | No public desktop release until Store/trust evidence, smoke checks, and owner approval exist. |

## Validation Log

| Timestamp | Command | Result | Notes |
|---|---|---|---|
| 2026-07-09T03:04:01+00:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings before extracting the compact active pathway. |
| 2026-07-09T03:04:01+00:00 | `bash scripts/governance-preflight.sh` | pass | 0 warnings after updating active-plan routing references. |
| 2026-07-09T03:04:01+00:00 | `rg -n "docs/2026-07-09-current-build-pathway.md\|2026-07-09-current-build-pathway" START_HERE.md AGENTS.md AI_BOOTSTRAP.md docs/context-map.md README.md project-control.yaml` | pass | Startup, bootstrap, context map, README, and control docs point to the compact active pathway. |
| 2026-07-09T03:04:01+00:00 | `git diff --check` | pass | Only normal Windows LF-to-CRLF notices. |
| 2026-07-09T03:04:01+00:00 | `wc -l docs/2026-07-09-current-build-pathway.md docs/2026-07-03-current-pathway.md` | pass | Compact pathway is 159 lines after closeout; historical archive is 3,789 lines and no longer the startup surface. |

## Completed Chunk - Compact Active Pathway Extraction

Status: task complete
Status Updated: 2026-07-09T03:04:01+00:00
Completion target: Task complete
Budget class: Small

Objective:

Move the live plan out of the oversized historical pathway and into a compact date-prefixed active pathway.

User outcome:

A human or agent can follow the current plan without loading a multi-thousand-line history file.

Files updated:

- `docs/2026-07-09-current-build-pathway.md`
- `docs/2026-07-03-current-pathway.md`
- `START_HERE.md`
- `AGENTS.md`
- `AI_BOOTSTRAP.md`
- `docs/context-map.md`
- `README.md`
- `project-control.yaml`

Acceptance result:

The active route now points to this compact pathway. The old pathway is marked `superseded` and retained as a historical archive. Date-prefixed controlled-doc headers were updated on touched routing documents.

## Next Handoff

Immediate next chunk is owner choice from the options above. Keep this active pathway compact; move detailed historical evidence into dated evidence docs or leave it in the archived `2026-07-03` pathway and link to it only when needed.

After meaningful work, follow the chunk close-out protocol in `AGENTS.md`: check `CARRY_FORWARD.md`, commit and push the scoped change, then suggest `/compact`.
