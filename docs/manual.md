# 2026-07-09T03:04:01+00:00 - Manual

## What This Project Is

Describe the project in operator-friendly terms.

## How To Work In This Repo

For ordinary scoped work, start lean:

1. Check `git status --short`.
2. Read `START_HERE.md` and the short repo-local agent instructions.
3. Use `docs/context-map.md` to choose only the docs and source areas needed for the task.
4. Review the active plan named by `START_HERE.md` for the active chunk, completion target, stop condition, and validation expectations.
5. Run task-relevant validation.

For material or risk-triggering work, add the full governance path:

1. Review `docs/standards/README.md`.
2. Review `docs/standards/engineering-governance-by-use-case.md`.
3. Review `docs/policy/durable-development-engineering-policy.md`.
4. Review `docs/standards/ship-ready-engineering-standard.md`.
5. Run `bash scripts/governance-preflight.sh`.
6. Review `project-control.yaml`.
7. Capture a timestamp with `date -Iseconds`.
8. Confirm the current roadmap and runbook still match reality.
9. Update docs when behavior or operating expectations change.

## Expected Outputs

- working code or deliverables
- current operational documentation
- a maintained roadmap
- timestamped build pathway updates for material work
- scoped context and budget notes for meaningful chunks
- reviewable governance records

## Operator Notes

The browser app stays local-first and recommendation-only. It does not sign in to providers, verify paid plans, call AI
APIs, scan files, or run local model tools.

The hosted browser app can be installed from supported browsers after a production build is served over HTTPS or local
preview. The installable browser version still runs as the browser app: it saves choices locally in the browser and does
not check the computer for local AI tools.

To preview the installable browser build locally:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5184
```

To inspect this machine for common local model tooling, run:

```bash
npm run detect:local-models
```

The detector checks common local folders and the Ollama CLI only. It prints a summary by default and does not change app
settings. Add `-- --details` if local model names should be printed, or `-- --json` if a report is needed for a later
manual import workflow.

