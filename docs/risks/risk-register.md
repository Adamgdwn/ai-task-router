# 2026-07-03T11:49:34-06:00 - Risk Register

## Current Risk Classification

- Tier: low for v0.2 browser MVP
- Owner: Project Owner
- Last reviewed: 2026-07-04T11:17:43-06:00

## Key Risks

| ID | Risk | Likelihood | Impact | Controls | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | User misunderstands recommendations as actions already completed. | Medium | Medium | Plain-language no-execution copy, route cards explain user action required, no provider connections. | Project Owner | Open |
| R-002 | User enters sensitive task details into browser-local storage or exports. | Medium | Medium | Local-first boundary, user-triggered exports, sensitivity warnings, no hidden upload. | Project Owner | Open |
| R-003 | Future hosted release could imply cloud processing even though the app is local-first. | Medium | Medium | Deployment guide and product copy must distinguish hosted static app from cloud processing. | Project Owner | Planned |
| R-004 | Future desktop app could feel invasive if it inspects local tools or folders without clear consent. | Medium | High | Desktop trust plan requires no silent scan, explicit user approval, narrow checks, summary by default, clear reset. | Project Owner | Planned |
| R-005 | Unsigned or poorly explained desktop installers could undermine user trust or trigger platform warnings. | Medium | High | Public desktop release blocked until signing/notarization/checksum path is documented and reviewed. | Project Owner | Planned |
| R-006 | Local model discovery could leak private path or model details in logs, screenshots, or support reports. | Medium | Medium | Hide details by default, redact sensitive path details, avoid telemetry, document support-safe reporting. | Project Owner | Planned |


