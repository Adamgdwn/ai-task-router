# Risk Register

Last Updated: 2026-07-04T18:41:17-06:00
Status: active
Owner: Project Owner

## Current Risk Classification

- Tier: low for v0.2 browser MVP
- Owner: Project Owner
- Last reviewed: 2026-07-04T18:41:17-06:00

## Key Risks

| ID | Risk | Likelihood | Impact | Controls | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | User misunderstands recommendations as actions already completed. | Medium | Medium | Plain-language no-execution copy, route cards explain user action required, no provider connections. | Project Owner | Open |
| R-002 | User enters sensitive task details into browser-local storage or exports. | Medium | Medium | Local-first boundary, user-triggered exports, sensitivity warnings, no hidden upload. | Project Owner | Open |
| R-003 | Future hosted release could imply cloud processing or local computer checking even though the browser/PWA app is local-first. | Medium | Medium | Deployment guide, Start Here install copy, manifest/service-worker scope, and permission matrix distinguish the hosted browser/PWA from desktop local discovery; PWA service worker caches same-origin app-shell assets only and does not add telemetry, provider calls, uploads, or machine inspection. | Project Owner | Controlled for D5 |
| R-004 | Desktop app could feel invasive if it inspects local tools or folders without clear consent. | Medium | High | Desktop trust plan, confirmed D0 defaults, ADR-0001, D3 trust-boundary contract, and D4 implementation require explicit user approval, narrow allowlisted checks, summary by default, schema validation, path rejection, clear result clearing, no startup/background scans, and no broad Tauri plugin permissions. | Project Owner | Controlled for D4 |
| R-005 | Unsigned or poorly explained desktop installers could undermine user trust or trigger platform warnings. | Medium | High | Public desktop release blocked until signing/notarization/checksum path is documented, reviewed, and matched to the selected publisher identity. D2 is not allowed to create public packages. | Project Owner | Planned |
| R-006 | Local model discovery could leak private path or model details in logs, screenshots, or support reports. | Medium | Medium | D4 hides model names by default, rejects path details, returns no full paths, caps optional model-name details, avoids telemetry, and keeps discovery results local unless the user adds a tool or saves setup. | Project Owner | Controlled for D4 |


