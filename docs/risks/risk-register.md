# Risk Register

Last Updated: 2026-07-25T16:41:27-06:00
Status: active
Owner: Project Owner

## Current Risk Classification

- Tier: low for v0.2 browser MVP
- Owner: Project Owner
- Last reviewed: 2026-07-05T07:57:15-06:00

## Key Risks

| ID | Risk | Likelihood | Impact | Controls | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | User misunderstands recommendations as actions already completed. | Medium | Medium | Plain-language no-execution copy, route cards explain user action required, no provider connections. | Project Owner | Open |
| R-002 | User enters sensitive task details into browser-local storage or exports. | Medium | Medium | Local-first boundary, user-triggered exports, sensitivity warnings, no hidden upload. | Project Owner | Open |
| R-003 | Future hosted release could imply cloud processing or local computer checking even though the browser/PWA app is local-first. | Medium | Medium | Deployment guide, Start Here install copy, manifest/service-worker scope, and permission matrix distinguish the hosted browser/PWA from desktop local discovery; PWA service worker caches same-origin app-shell assets only and does not add telemetry, provider calls, uploads, or machine inspection. | Project Owner | Controlled for D5 |
| R-004 | Desktop app could feel invasive if it inspects local tools or folders without clear consent. | Medium | High | Desktop trust plan, confirmed D0 defaults, ADR-0001, D3 trust-boundary contract, and D4 implementation require explicit user approval, narrow allowlisted checks, summary by default, schema validation, path rejection, clear result clearing, no startup/background scans, and no broad Tauri plugin permissions. | Project Owner | Controlled for D4 |
| R-005 | Unsigned or poorly explained desktop installers could undermine user trust or trigger platform warnings. | Medium | High | D6 documents signing requirements and creates only an internal unsigned NSIS artifact for evidence. Public desktop release remains blocked until signing/notarization where relevant, checksums, install/launch/uninstall smoke tests, Application Control behavior, and publisher identity are reviewed. | Project Owner | Controlled for D6, public release blocked |
| R-006 | Local model discovery could leak private path or model details in logs, screenshots, or support reports. | Medium | Medium | D4 hides model names by default, rejects path details, returns no full paths, caps optional model-name details, avoids telemetry, and keeps discovery results local unless the user adds a tool or saves setup. | Project Owner | Controlled for D4 |
| R-007 | Public website or social links could launch before the web/PWA release and cybersecurity gates pass. | Medium | High | D7 release/security readiness packet held public launch; D8 local release-candidate evidence passed; D9 hosted preview passed; D13 production URL `https://ai-task-router.pages.dev/` passed hosted smoke; D14 published and smoked the Old Skool AI hub, public security route, and Guided AI Labs / Guided AI Journey links. Social posts remain a separate owner-approved chunk. | Project Owner | Controlled for D14; social launch held |
| R-008 | Three independent public app copies could create service-worker, cache, version, and support drift across domains. | Medium | Medium | D13 selected one canonical Cloudflare Pages production URL, `https://ai-task-router.pages.dev/`, to be linked from `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com`; duplicate app deployments need explicit service-worker scope and rollback review. | Project Owner | Controlled for D13 |
| R-009 | Recommendation quality drifts as the hardcoded model catalog ages. Roughly 60 specific model names live in `toolModeCatalog.ts` and `providerModeProfiles.ts`; the product boundary forbids live model fetches, so the catalog can only get older, and a renamed, retired, or superseded model would be recommended by name with full confidence. | High | Medium | `catalogFreshness.ts` computes catalog age from the review dates already recorded beside the catalogs and shows a notice on Best Options past 90 days, telling the user to check their tool's current model list. Model labels are stated as minimum capability guidance with an upgrade trigger, not as vendor selection. **Review cadence: re-review the catalog every 90 days, or sooner when a provider announces a model line change.** Next due 2026-10-03. Refreshing catalog contents is a deliberate review pass, not incidental work in an unrelated chunk. | Project Owner | Open |
| R-010 | Impact figures could be read as a bill, a measurement, or a guarantee rather than an estimate. Dollar figures are API-equivalent per-token estimates against reviewed public list prices; energy figures are order-of-magnitude estimates from public inference anchors with a nonzero floor for manual and local work. Both age with the same catalog as R-009. | Medium | Medium | One vocabulary is fixed across app and docs: "if you were paying per token" for the API-equivalent figure, "added to your bill" for what a metered account is charged, and no use of "saved", "savings", or "avoided" for money. Every figure carries its basis and caveats on screen; `docs/2026-07-05-impact-estimator-methodology.md` is the source of truth. Anchors live once, in `modeEstimateProfile`, and a new anchor needs a cited source rather than an invented value. Known open gap: the Gemini benchmark understatement. | Project Owner | Open |


