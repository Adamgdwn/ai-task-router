# Tool Permission Matrix

Last Updated: 2026-07-04T14:56:49-06:00
Status: active
Owner: Technical Lead
Status Updated: 2026-07-04T14:56:49-06:00

| Tool | Purpose | Allowed Actions | Prohibited Actions | Approval Required | Notes |
| --- | --- | --- | --- | --- | --- |
| Browser app | Recommend AI task routes from user-entered setup and task details. | Read/write browser-local IndexedDB, generate local route cards, prompt packages, exports, and route logs. | Provider API calls, account connections, credential storage, telemetry, hidden uploads, file indexing, external actions. | User action for exports, saves, resets, and feedback entry. | Current v0.2 surface. |
| `npm run detect:local-models` | Explicit local terminal check for common local model tools. | Read-only checks for Ollama and common local model folders; summary output by default. | Browser state changes, network calls, provider login, file content indexing, hidden telemetry, arbitrary shell execution. | User must run the command manually. | `--details` and `--json` can reveal more local details and should be used intentionally. |
| Future desktop native local discovery | Let a signed desktop app check selected local AI tools and model folders. | Read-only, user-approved, allowlisted checks with timeouts and summarized results. | Silent scanning, startup/background inventory, whole-drive search, file-content reading by default, uploads, telemetry, credentials, provider actions, destructive actions. | User must explicitly choose what to check before each discovery run. | Planned only. D1 selected Tauri for a shell spike, but no desktop native discovery code is approved yet. See `docs/2026-07-04-desktop-trust-distribution-plan.md` and `docs/decisions/adr-0001-desktop-wrapper.md`. |
