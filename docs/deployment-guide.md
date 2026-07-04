# 2026-07-03T11:49:34-06:00 - Deployment Guide

Status Updated: 2026-07-04T11:17:43-06:00

## Current Release State

AI Task Router is not publicly deployed yet.

The current app is a local-first Vite/React static web app. A production web artifact can be created with:

```bash
npm ci
npm run build
```

The output is `dist/`.

The current MVP does not require a backend, server database, provider API credentials, OAuth, telemetry, or external storage.

## Environments

- `dev`: local Vite development server.
- `staging`: not created yet.
- `prod`: not created yet.

Future public hosting references:

- likely canonical product home: `oldskoolai.com`
- planned link sources: `guidedailabs.com` and `guidedaijourney.com`

Exact public paths, preview URL, launch timing, and cross-site link placement are not decided yet.

## Deployment Steps

No public deployment has been executed.

Future hosted web/PWA release should use this shape:

1. Complete v0.2 release-readiness review.
2. Build from a clean install.
3. Smoke test `dist/` locally or in a private preview.
4. Confirm no provider calls, credentials, telemetry, hidden uploads, or desktop-discovery claims are present in the web build.
5. Deploy to the chosen static site path.
6. Smoke test primary flows on desktop and mobile browsers.
7. Add public links only after the preview passes.

Future desktop distribution is separate from web hosting. Use [desktop trust and distribution plan](2026-07-04-desktop-trust-distribution-plan.md) before adding desktop packaging, signing, notarization, checksums, or public installers.

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
- `npx playwright test` if E2E coverage exists
- manual browser smoke test on desktop and narrow viewport
- no-secrets and no-hidden-network review

Before any public desktop release:

- complete the desktop trust plan phases through signing/public trust readiness
- install, launch, local discovery, clear-results, and uninstall smoke tests on each advertised OS
- signed or notarized artifacts where platform trust requires them
- checksums and release notes
- support and withdrawal path


