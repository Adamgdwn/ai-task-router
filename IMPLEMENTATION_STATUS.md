# 2026-07-04T10:20:07-06:00 - Implementation Status

Last Updated: 2026-07-04T10:20:07-06:00
Status: contextual-task-include-detour-complete
Status Updated: 2026-07-04T10:20:07-06:00
Owner: Technical Lead

## Completed Chunk

Contextual Task Include Detour.

Completion target: Integration complete.

## Scope

The local app no longer asks users to configure a standalone `What To Include` setup screen. Information selection is now an optional task-context question inside `My Task`.

The completed slice provides:

- Start Here now routes through `My AI Tools`, `Choosing Style`, and `My Task`.
- The side navigation no longer exposes `What To Include`.
- `My Task` asks `Do you want to include anything specific?`.
- `Nothing specific` is the default include choice.
- Users can choose optional task ingredients such as a website/current search, file or folder, pasted documents, repo/code page, work docs, Google Drive, or notes/background.
- Shortcut-driven source choices still feed the existing local routing and hard-gate safety model.
- User-facing blocked-source copy now refers to task information choices instead of a removed setup screen.

## Product Boundary

This detour keeps the app local-first and recommendation-only. It does not add account connections, credential storage, authentication, telemetry, remote sync, provider API calls, external destinations, automatic uploads, file indexing, feedback analytics, best-stack recommendation logic, or execution workflows.

## Evidence

- `bash scripts/governance-preflight.sh` passed with 0 warnings before the detour.
- `npm run test -- App` passed with 1 test file and 12 tests.
- `npm run test` passed with 11 test files and 81 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- Manual Playwright browser check using system Chrome at `http://127.0.0.1:5183` passed for no standalone `What To Include` navigation, Start Here's three-step path, My Task's optional include question, `Nothing specific` default/clear behavior, desktop/mobile layout, and no horizontal overflow.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `bash scripts/governance-preflight.sh` passed with 0 warnings at close-out.
- `git diff --check` passed; output only included normal Windows LF-to-CRLF notices.
- Screenshots:
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-contextual-include-desktop.png`
  - `C:\Users\adamg\AppData\Local\Temp\agent-picker-contextual-include-mobile.png`

## Known Gaps

- Playwright is configured but still has no committed e2e specs; Chunk Fifteen is active next for fixtures and E2E coverage.
- Import/export UI remains a later chunk; pure export/import utilities and artifact download prep already exist.
- Proposed best stack remains a disabled planning note only.
- Provider/app wording will need periodic review because AI app names and plan labels change.
- Local detector results are not imported into the app yet; a future reviewed workflow would need an explicit import or confirmation step.
- The source registry remains an internal routing/safety input; there is no primary UI for editing those defaults now.

## Next Chunk

Chunk Fifteen - E2E Tests And Fixture Suite.
