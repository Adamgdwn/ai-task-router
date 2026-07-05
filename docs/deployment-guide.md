# 2026-07-03T11:49:34-06:00 - Deployment Guide

Status Updated: 2026-07-04T21:05:03-06:00

## Current Release State

AI Task Router is not publicly launched yet.

Desktop Chunk D7 records the release/security readiness packet. Desktop Chunk D8 records the local web/PWA release-candidate security pass. Desktop Chunk D9 records the first Cloudflare Pages hosted preview smoke. Public release remains on hold until canonical URL selection, custom-domain smoke if used, GitHub integration or direct-upload release process decision, owner launch decision, and desktop signing/trust gates pass where applicable.

The current app is a local-first Vite/React static web app with a PWA install path. A production web artifact can be
created with:

```bash
npm ci
npm run build
```

The output is `dist/`.

The current MVP does not require a backend, server database, provider API credentials, OAuth, telemetry, or external storage.

The production web artifact includes:

- `manifest.webmanifest`
- `service-worker.js`
- Guided AI Labs PWA icons at `pwa/icon-192.png` and `pwa/icon-512.png`
- install metadata in `index.html`

The browser/PWA build does not perform local AI tool discovery. Local computer checking requires the desktop app.

## Environments

- `dev`: local Vite development server.
- `staging`: not created yet.
- `prod`: not created yet.

Future public hosting decision:

- primary host: Cloudflare Pages
- public source/release hub: GitHub
- current hosted preview: `https://preview-20260704-0c7b253.ai-task-router.pages.dev`
- canonical app URL: not selected yet; use one owner-controlled root site, subpath, Cloudflare Pages default URL, or a newly created subdomain under `oldskoolai.com`, `guidedailabs.com`, or `guidedaijourney.com`
- planned link sources: `oldskoolai.com`, `guidedailabs.com`, and `guidedaijourney.com`
- planned social link sources after release gate: YouTube, Facebook, and LinkedIn

The canonical public URL still needs owner confirmation before public launch. Prefer one app URL linked from all three websites instead of three independent app copies.

## Deployment Steps

D9 created a Cloudflare Pages direct-upload preview for smoke testing. No custom domain, DNS change, public website link, social launch post, GitHub Release, or desktop download has been created.

Future hosted web/PWA release should use this shape:

1. Use the D8 evidence packet as the local release-candidate baseline.
2. Use the D9 hosted preview packet as the first Cloudflare Pages smoke baseline.
3. Decide whether production uses Cloudflare Pages GitHub integration or a documented Wrangler direct-upload release process.
4. Use build command `npm ci && npm run build`.
5. Use output directory `dist`.
6. Confirm the manifest, 192px and 512px icons, service worker, and install copy are present over HTTPS.
7. Confirm no provider calls, credentials, telemetry, hidden uploads, or browser-based desktop-discovery claims are present in the hosted web build.
8. Confirm HTTPS and canonical URL behavior.
9. Smoke test primary flows on desktop and mobile browsers.
10. Confirm rollback to a previous Pages production deployment before public launch.
11. Add public website and social links only after the preview and custom-domain smoke pass.

Local production preview command:

```bash
npm run preview -- --host 127.0.0.1 --port 5184
```

If the hosted app is deployed under a subpath rather than a domain root, review Vite `base`, `manifest.webmanifest`
`start_url`/`scope`, service-worker cache URLs, and public link paths before release.

Run hosted Playwright E2E against a preview or canonical URL:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://preview-20260704-0c7b253.ai-task-router.pages.dev"
npx playwright test
```

D9 caveat: Windows `curl.exe` and PowerShell `Invoke-WebRequest` hit a TLS handshake failure against the preview alias while Node HTTPS/fetch and Chromium succeeded. Retest normal browsers and the final custom domain before public launch.

Future desktop distribution is separate from web hosting. Desktop Chunk D6 added an internal unsigned Windows NSIS package path for evidence only; use [desktop packaging and signing spike](2026-07-04-desktop-packaging-signing-spike.md) and [desktop trust and distribution plan](2026-07-04-desktop-trust-distribution-plan.md) before any signing, notarization, checksums, public installers, or public download links.

Internal Windows packaging evidence command:

```powershell
$env:PATH="$env:USERPROFILE\.cargo\bin;$env:PATH"
npm run desktop:package:windows:internal
npm run desktop:artifacts
```

The D6 artifact is unsigned and must not be published. Before public desktop release, choose the Windows Store/MSIX or direct signed-installer path, confirm legal publisher identity, sign/notarize where required, publish checksums, and pass install/launch/uninstall smoke tests on target OSes.

## Rollback

For future static hosting:

- keep the previous release artifact or previous site revision
- switch the web server, static host, or symlink back to the previous release
- remove public links if the issue affects user trust or data safety
- document the rollback in the active pathway or changelog

For future desktop distribution:

- public installer rollback requires a signed replacement release or withdrawn download
- signing certificate, notarization, Store, and checksum concerns must be handled in the desktop release checklist
- do not treat desktop rollback as equivalent to static web rollback

## Validation

Before any public web release:

- `bash scripts/governance-preflight.sh`
- `npm audit --audit-level=moderate`
- `npm run test`
- `npm run build`
- `npm run scan:web-rc`
- local production preview check for `manifest.webmanifest`, `service-worker.js`, and both PWA icon sizes
- `npx playwright test` if E2E coverage exists
- manual browser smoke test on desktop and narrow viewport
- no-secrets and no-hidden-network review
- Cloudflare Pages preview over HTTPS
- canonical URL, service-worker scope, and rollback check
- public copy review for browser-vs-desktop capability boundaries

Before any public desktop release:

- complete the desktop trust plan phases through signing/public trust readiness
- install, launch, local discovery, clear-results, and uninstall smoke tests on each advertised OS
- signed or notarized artifacts where platform trust requires them
- checksums and release notes
- support and withdrawal path


