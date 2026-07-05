# 2026-07-05 - Public Stage Guidance Cloudflare Update

Document ID: AUD-ENG-008
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-05
Next Review: Before social launch posts, custom-domain DNS work, exact public savings claims, live provider/pricing fetches, or public desktop download buttons
Timestamp: 2026-07-05T10:49:02-06:00
Last Updated: 2026-07-05T10:49:02-06:00

## Purpose

This packet records D18: adding compact suggested stages beside the recommended route in the public browser/PWA app and redeploying the Cloudflare Pages production URL.

D18 helps users organize the work and choose the right AI help for each stage without turning AI Task Router into a full project-planning tool. It does not add provider calls, telemetry, live model lookup, account connections, automation, file indexing, desktop downloads, social posts, DNS/custom-domain changes, or exact public savings claims.

## Owner Direction

On 2026-07-05, the owner asked for the app to infer and frame rough project stages, with the recommended model beside each stage, so users can organize themselves, apply light governance, and choose the proper tool.

This was treated as approval for a bounded public web/PWA update with these constraints:

- keep the guidance compact and beside the existing route recommendation
- infer stages from the task and selected route, not from live provider calls
- save the stage guidance with route cards and Markdown exports
- keep the app local-first and recommendation-only
- keep desktop downloads, social posts, DNS/custom-domain work, live pricing/model fetches, provider connections, and exact public savings claims out of this chunk

## Release Decision

Completion target: Task complete with public web update evidence.

Result: The hosted web/PWA app at the existing canonical URL now includes suggested stages in Best Options and saved Decision Cards:

```text
https://ai-task-router.pages.dev/
```

Release process accepted for D18: Wrangler direct upload from the local `dist/` artifact to the Cloudflare Pages `main` production branch.

## Production Details

| Item | Value |
|---|---|
| Cloudflare Pages project | `ai-task-router` |
| Canonical app URL | `https://ai-task-router.pages.dev/` |
| Production deployment URL | `https://98a58ca6.ai-task-router.pages.dev` |
| Production deployment ID | `98a58ca6-a75a-4ff6-9cd9-ab8af31c834b` |
| Branch | `main` |
| Source commit | `9d3154d` |
| Deployment source | Wrangler direct upload from local `dist/` |
| Build output | 9 static files |
| Custom domain | Not attached |
| GitHub integration | Not connected yet |

Previous production deployment:

```text
https://cd2c5112.ai-task-router.pages.dev
```

## Public UI Behavior

D18 adds:

- a `stageGuidance` route-card field with backward-compatible defaulting for older saved cards
- deterministic stage generation from the task and recommended route
- stages such as frame, gather/check, create, package when relevant, and review
- the recommended tool/model or human review label beside each stage
- a Suggested stages panel in Best Options
- the same panel in saved Decision Cards
- Suggested Stages in route-card Markdown export

The guidance is educational and organizational. It does not execute work, call providers, verify subscriptions, search the web, scan files, or create a full project plan.

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T10:36:41-06:00 | `bash scripts/governance-preflight.sh`; timestamp capture | passed | Governance preflight reported 0 warnings before D18 work. |
| 2026-07-05T10:43:24-06:00 | `npx tsc --noEmit`; `npm run test -- routeCardGenerator domainSchemas exportImport App` | passed | Focused schema, generator, export, and app tests passed: 4 files, 35 tests. |
| 2026-07-05T10:44:58-06:00 | `npm run test`; `npm run build`; `npm audit --audit-level=moderate`; `bash scripts/governance-preflight.sh` | passed with existing build warning | Full Vitest passed 13 files and 96 tests. Production build passed with the existing Vite chunk-size warning; built JS chunk was 536.63 kB. Audit found 0 vulnerabilities; governance preflight reported 0 warnings. |
| 2026-07-05T10:45:30-06:00 | `npm run scan:web-rc`; `npx playwright test`; `git diff --check` | passed | Web release-candidate scan passed; local Playwright passed 6 Chromium tests; whitespace check only printed normal Windows LF-to-CRLF notices. |
| 2026-07-05T10:46:35-06:00 | Local production preview visual smoke at `http://127.0.0.1:5186/` | passed | Desktop 1440px and mobile 390px generated a public-facing-copy route, rendered Suggested stages, and had no horizontal overflow. |
| 2026-07-05T10:47:20-06:00 | `npx --yes wrangler whoami --env-file ...` | passed | Wrangler accepted the Cloudflare API token from the secure master environment file. Token values were not printed or documented. |
| 2026-07-05T10:47:50-06:00 | Source commit | passed | Committed tested source as `9d3154d` with message `Add suggested stage guidance`. |
| 2026-07-05T10:48:05-06:00 | `npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash 9d3154d --commit-message "Add suggested stage guidance" --env-file ...` | passed | Cloudflare deployed the `main` branch production build and returned deployment URL `https://98a58ca6.ai-task-router.pages.dev`. |
| 2026-07-05T10:48:24-06:00 | `npx --yes wrangler pages deployment list --project-name ai-task-router --env-file ...` | passed | Latest production deployment reported branch `main`, source `9d3154d`, deployment `https://98a58ca6.ai-task-router.pages.dev`. |
| 2026-07-05T10:48:24-06:00 | Hosted asset smoke | passed | Canonical URL, manifest, service worker, and PWA icons returned HTTP 200 with expected content types. |
| 2026-07-05T10:48:40-06:00 | Hosted `PLAYWRIGHT_BASE_URL=https://ai-task-router.pages.dev npx playwright test` | passed | Production URL passed the 6 Chromium E2E tests. |
| 2026-07-05T10:49:02-06:00 | Hosted Chromium stage-guidance smoke | passed | Production app rendered Suggested stages for a generated route, showed 4 stage cards, had no desktop horizontal overflow, and observed 0 external requests during the smoke. |

## Known Gaps

- Suggested stages are deterministic guidance, not a full project plan or project-management workflow.
- The app stores the recommended tool/model label from the user's local setup; it does not verify current provider model availability or subscription entitlements.
- Cloudflare Pages is still not connected to GitHub; D18 used the accepted direct-upload process.
- Social launch posts have not been created.
- No custom app domain or DNS change has been made.
- Public desktop downloads remain blocked by signing/notarization, checksums, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner approval.

## Rollback

Cloudflare web rollback:

1. In Cloudflare Pages, roll production back from deployment `98a58ca6-a75a-4ff6-9cd9-ab8af31c834b` to previous production deployment `cd2c5112-e554-407f-a631-114fc189651c`, or deploy a corrected `dist/` artifact to `main`.
2. In Git, revert `9d3154d` to remove the suggested-stage code if the issue is content, schema, or UX related.
3. If the app URL becomes unhealthy while the hub stays healthy, remove or disable the Old Skool AI online-app CTA until the app rollback is complete.

No database, credentials, provider accounts, user records, or external integrations are changed by D18.

## Handoff

D18 is task complete. The public online app now shows compact suggested stages with recommended help beside each stage in Best Options, saved Decision Cards, and route-card Markdown exports.

The next bounded chunk can be owner-reviewed social/video launch copy, a reviewed public methodology page, a future opt-in local estimator UI, or a separate desktop trust/signing chunk. Keep public desktop downloads, exact public savings claims, live pricing/model fetches, provider connections, DNS/custom-domain work, and social launch posts gated behind separate approval and evidence.
