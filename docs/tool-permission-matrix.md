# Tool Permission Matrix

Last Updated: 2026-07-26T09:31:44-06:00
Status: active
Owner: Technical Lead
Status Updated: 2026-07-26T09:31:44-06:00

| Tool | Purpose | Allowed Actions | Prohibited Actions | Approval Required | Notes |
| --- | --- | --- | --- | --- | --- |
| Browser app / PWA | Recommend AI task routes from user-entered setup and task details; allow supported browsers to install the hosted app. | Read/write browser-local IndexedDB, generate local route cards, prompt packages, exports, and route logs; serve web app manifest, branded PWA icons, and same-origin app-shell service-worker cache in production. | Provider API calls, account connections, credential storage, telemetry, hidden uploads, file indexing, local computer discovery, external actions. | User action for exports, saves, resets, feedback entry, and browser install. | The only app surface. It cannot check the user's computer, and after the 2026-07-26 desktop abandonment there is no surface that can. |
