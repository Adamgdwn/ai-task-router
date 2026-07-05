# 2026-07-05 - Public PDF Report Cloudflare Update

Document ID: AUD-ENG-009
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-05
Next Review: Before changing public export/report behavior
Timestamp: 2026-07-05T11:12:24-06:00

## Executive Summary

D19 adds a PDF-ready report path to saved Decision Cards in the public browser/PWA app.

Users can save a route, open the saved Decision Card, and choose `Save PDF report`. The app uses the browser print dialog and print-specific styling so the saved PDF contains the decision summary, suggested stages, impact context, warnings, and route tradeoffs without relying on a screenshot. The report is prepared locally in the browser.

The production app was redeployed to Cloudflare Pages:

- Canonical URL: `https://ai-task-router.pages.dev/`
- Production deployment: `https://49d21829.ai-task-router.pages.dev`
- Cloudflare deployment ID: `49d21829-e6de-4ef0-b2e0-170621b9d16e`
- Source commit: `9c870ce`
- Previous production deployment: `https://98a58ca6.ai-task-router.pages.dev`

## Scope

- Add `Save PDF report` to saved Decision Cards.
- Share the public impact insight panel between Best Options and saved Decision Cards.
- Add print styling that hides navigation/export controls and keeps report content visible.
- Keep Markdown export intact.
- Keep all report generation local to the browser.

## Non-Goals

- No server-side PDF rendering.
- No screenshot capture workflow.
- No new dependency.
- No provider calls.
- No telemetry.
- No account connections.
- No live pricing/model fetches.
- No exact public savings claims.
- No social launch posts.
- No custom-domain/DNS changes.
- No desktop download publication.

## Implementation

- Added `src/ui/screens/ImpactInsightPanel.tsx` as the shared impact panel.
- Updated `src/ui/screens/TaskRoutingScreens.tsx` to use the shared impact panel.
- Updated `src/ui/screens/RouteArtifactScreens.tsx` so saved Decision Cards include impact context and a `Save PDF report` action.
- Added print-only report header and print CSS in `src/styles.css`.
- Updated `src/tests/unit/App.test.tsx` to verify saved Decision Cards show impact context and call the browser print path.
- Fixed duplicate list keys for repeated warning text in static route warning lists.

## Validation Run

| Timestamp | Command or Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T11:00:19-06:00 | `bash scripts/governance-preflight.sh` | passed | Governance preflight reported 0 warnings before D19 work. |
| 2026-07-05T11:04:51-06:00 | `npx tsc --noEmit`; `npm run test -- App` | passed | Focused TypeScript and App tests passed; App suite ran 14 tests. |
| 2026-07-05T11:05:12-06:00 | `npm run test` | passed | Full Vitest suite passed: 13 files, 96 tests. |
| 2026-07-05T11:05:12-06:00 | `npm run build` | passed with existing warning | Production build passed; existing Vite chunk-size warning remains. |
| 2026-07-05T11:05:12-06:00 | `npm audit --audit-level=moderate` | passed | Found 0 vulnerabilities. |
| 2026-07-05T11:05:12-06:00 | `bash scripts/governance-preflight.sh` | passed | Close-out preflight reported 0 warnings. |
| 2026-07-05T11:05:40-06:00 | `npm run scan:web-rc` | passed | Web release candidate scan found no release-blocking findings. |
| 2026-07-05T11:05:40-06:00 | `npx playwright test` | passed | Local Playwright passed 6 Chromium tests. |
| 2026-07-05T11:05:40-06:00 | `git diff --check` | passed | Only normal Windows LF-to-CRLF notices were printed. |
| 2026-07-05T11:09:56-06:00 | Local production preview PDF-report smoke | passed | Generated and saved a route, opened Decision Card, verified `Save PDF report`, no desktop/mobile overflow, and print CSS state: report header visible, side rail/export panel hidden, impact and stage content visible. |
| 2026-07-05T11:11:14-06:00 | Wrangler production deploy | passed | Deployed `dist/` to Cloudflare Pages production from source `9c870ce`; deployment `49d21829`. |
| 2026-07-05T11:11:32-06:00 | Hosted asset checks | passed | Canonical root, manifest, and service worker returned HTTP 200. |
| 2026-07-05T11:11:32-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test` | passed | Hosted Playwright passed 6 Chromium tests. |
| 2026-07-05T11:11:58-06:00 | Hosted PDF-report smoke | passed | Public app rendered `Save PDF report`, showed impact context, had no desktop/mobile overflow, observed 0 external requests, and print CSS hid app chrome/export controls while keeping report content visible. |

## Release Decision

D19 is task complete and deployed for the browser/PWA production app.

This does not make the broader project complete. Desktop downloads, social launch posts, custom domains, live pricing/model fetches, exact public savings claims, provider connections, and GitHub Releases remain separate gated chunks.

## Rollback Or Recovery

If the PDF report path causes problems, roll Cloudflare Pages production back from deployment `49d21829-e6de-4ef0-b2e0-170621b9d16e` to `98a58ca6-a75a-4ff6-9cd9-ab8af31c834b`, or deploy a corrected `dist/` artifact.

Source rollback is to revert commit `9c870ce` if the shared impact panel, saved Decision Card impact section, print button, or print CSS should be removed.

## Handoff

Preserve the saved Decision Card as the report source. The main Best Options flow should stay light; users save a decision before producing the durable report.

Future export work should stay local-first unless a separate approved chunk adds a server-side report renderer with privacy, cost, and rollback evidence.
