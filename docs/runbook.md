# 2026-07-03T11:49:34-06:00 - Runbook

Last Updated: 2026-07-06T15:24:36.2422654-06:00
Status: active
Owner: Technical Lead

## Purpose

Describe what this system does in operation.

## Alerts And Failures

List likely failure conditions and what to do first.

## Dependencies

List critical dependencies and how to check them.

## System Tools And Troubleshooting

### Hosted Web/PWA Preview

As of 2026-07-04T18:41:17-06:00, the browser build includes a PWA install path:

- `public/manifest.webmanifest`
- `public/service-worker.js`
- `public/pwa/icon-192.png`
- `public/pwa/icon-512.png`
- install metadata in `index.html`
- production-only service-worker registration in `src/pwa/registerServiceWorker.ts`

Preview command:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5184
```

Troubleshooting:

- The browser install prompt depends on browser support, HTTPS or local preview, and browser-specific engagement rules.
- The app may still be usable as a normal website even when a browser does not show an install prompt.
- The service worker is intentionally not registered during Vite dev mode.
- The app must not claim it can check the user's computer. It never could, and the desktop track that would have was abandoned on 2026-07-26.
- If hosting under a subpath, update Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links before release.

### Public Web Release Readiness

As of 2026-07-06T15:24:36.2422654-06:00, D7 selected the intended free distribution path, D8 completed local web/PWA release-candidate evidence, D9 created the first Cloudflare Pages hosted preview, D10 added the desktop technical-preview artifact lane, D11 added the [public launch master plan](2026-07-04-public-launch-master-plan.md), D12 added the [Old Skool AI hub handoff package](2026-07-04-old-skool-ai-hub-handoff.md), D13 deployed the production web/PWA app, D14 published the public hub/cross-site links, D16 redeployed the production app with the public impact insight panel, D17 added the [desktop download readiness gate](archive/2026-07-05-desktop-download-readiness-gate.md), D18 redeployed the production app with [public suggested-stage guidance](2026-07-05-public-stage-guidance-cloudflare-update.md), D19 redeployed the production app with [PDF-ready Decision Card reports](2026-07-05-public-pdf-report-cloudflare-update.md), D20 added the [desktop public distribution decision](archive/2026-07-06-desktop-public-distribution-decision.md), D21 added the [Windows MSIX proof](archive/2026-07-06-windows-msix-proof.md), and D22 added the [Windows Store trust prep](archive/2026-07-06-windows-store-trust-prep.md):

- GitHub remains the public source/release hub.
- Cloudflare Pages is the preferred public host.
- Current production app URL: `https://ai-task-router.pages.dev/`.
- Current public hub URL: `https://oldskoolai.com/ai-task-router/`.
- Current public security route: `https://oldskoolai.com/security/`.
- Historical test preview: `https://preview-20260704-0c7b253.ai-task-router.pages.dev`.
- Use one canonical app URL and link to it from the Old Skool AI hub; D12 recommends the hub route `/ai-task-router/`, pending Linux-side route confirmation.
- Link `guidedailabs.com` and `guidedaijourney.com` to the Old Skool AI hub rather than separate app copies; D14 published and smoked those links.
- The first canonical app URL is the Cloudflare Pages production URL; no custom domain has been attached.
- YouTube, Facebook, and LinkedIn links should wait for a separate owner-approved social launch copy/review chunk.
- Exact public savings, carbon, water, or bill-reduction claims should wait for a separate source-refresh and owner-review chunk.
- D8 added `npm run scan:web-rc` for production artifact checks.
- D9 added hosted Playwright support through `PLAYWRIGHT_BASE_URL`.
- D13 is the Cloudflare production launch smoke packet. D14 is the public hub and cross-site link smoke packet. D16 is the public impact insight Cloudflare update packet. D17 is the desktop download readiness gate. D18 is the public stage guidance Cloudflare update packet. D19 is the public PDF report Cloudflare update packet. D20 is the desktop public distribution decision and evidence-gate packet. D21 is the Windows MSIX proof packet. D22 is the Windows Store trust-prep packet. The next release step is owner approval for social/video launch copy, a reviewed methodology page, opt-in local estimator UI, or the next Windows Store submission slice after Partner Center app reservation.

Saved Decision Card report smoke:

- Generate and save a route.
- Open `Decision Card`.
- Confirm `Save PDF report` is visible.
- In print emulation or browser print preview, confirm app navigation/export controls are hidden and the report header, suggested stages, impact context, warnings, and route tradeoffs remain visible.

Minimum pre-public checks:

```bash
npm ci
npm audit --audit-level=moderate
npm run test
npm run build
npm run scan:web-rc
npx playwright test
npm run preview -- --host 127.0.0.1 --port 5184
```

Hosted preview E2E:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://ai-task-router.pages.dev"
npx playwright test
```

Release troubleshooting:

- If `npm ci` fails on Windows with a locked Rolldown native binding, check for stale `agents\agent-picker` Vite dev/preview `node.exe` processes and stop only the repo-owned processes before retrying.
- D13 confirmed Windows `curl.exe` and PowerShell `Invoke-WebRequest` return HTTP 200 against `https://ai-task-router.pages.dev/`.
- Do not launch from social channels until the Old Skool AI hub page and cross-site links are published and smoked.
- Do not create three independent app deployments unless the service-worker scope, cache, support, and rollback plan are explicit.
- Do not point public users at the D9 preview alias.
- If the owner chooses a subpath instead of a root app domain/subdomain, update Vite `base`, manifest `start_url`/`scope`, service-worker cache URLs, and public links first.
- Confirm public copy says the browser/PWA app cannot check the computer.
- Use [release and security readiness packet](2026-07-04-release-security-readiness-packet.md) as the D7 gate.
- Use [web release candidate security pass](2026-07-04-web-release-candidate-security-pass.md) as the D8 local evidence packet.
- Use [public launch master plan](2026-07-04-public-launch-master-plan.md) as the controlling release map.
- Use [Old Skool AI hub handoff package](2026-07-04-old-skool-ai-hub-handoff.md) for website page copy, cross-site links, and rollback notes.

## Recovery

Document service recovery or fallback actions.

## Escalation

Describe who to contact and when.
