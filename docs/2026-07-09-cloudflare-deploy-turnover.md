# 2026-07-09 - Cloudflare Deploy Turnover

Document ID: PATH-ENG-003
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-09
Last Reviewed: 2026-07-09
Next Review: During the next production deploy attempt
Last Updated: 2026-07-09T12:41:50-06:00
Status Updated: 2026-07-09T12:41:50-06:00

## Purpose

This turnover note records the Cloudflare production deploy blocker and the next safe recovery path after the owner decided to wait until returning to a less restricted network.

Use this note with the active pathway, [2026-07-09-current-build-pathway.md](2026-07-09-current-build-pathway.md), when resuming production deployment of the latest pushed `main`.

## Current State

| Item | Status | Notes |
|---|---|---|
| Canonical production URL | live but stale | `https://ai-task-router.pages.dev/` currently serves the prior production deployment. |
| Latest known production deployment | live | `https://ef92b270.ai-task-router.pages.dev` from source `9639840`. |
| Latest pushed main before this turnover note | ready for deploy | `2bedbf1` includes the Best Options UX fixes, deploy-blocker documentation, and Chunk 4 methodology review boundaries. |
| Production deployment from current network | blocked | Cloudflare rejected the deploy token from public IP `184.67.69.66` with code `9109`, meaning the access token cannot be used from this location. |
| Secure token source | available | The Cloudflare token is in the secure environment file outside the repo. Do not print, paste, or commit token values. |
| Direct-link fallback | unavailable | `ssh linux-direct` to `10.77.77.2` timed out and the configured Windows direct-link adapter was not present. |

## Blocker

The deploy key exists and the secure environment file is known, but Cloudflare is rejecting use of that token from the current network location.

Observed failures:

- `9109 Cannot use the access token from location`
- authentication error `10000`
- one follow-up deployment-list retry also hit a too-many-auth-failures response

Do not keep retrying Wrangler from public IP `184.67.69.66` unless the Cloudflare token location policy has changed or the machine is on an allowed VPN/network. Repeated retries add noise and may trigger more temporary auth throttling.

## Recovery Options

Preferred next attempt:

1. Move to the home network or another Cloudflare-allowed token location.
2. Confirm the public IP differs from the blocked network before retrying.
3. Use the existing secure environment file without printing secret values.
4. Build, deploy latest `main`, and run hosted smoke checks.

Other valid options:

- Add the home or VPN public IP as a `/32` allowed client IP on the Cloudflare API token.
- Use a stable VPN exit IP and add that VPN IP/range to the token allowlist.
- Create a fresh least-privilege Cloudflare Pages deploy token with the correct location policy.
- Move deploys to GitHub Actions with Cloudflare credentials stored as repository secrets, if the owner wants a CI-based release path later.

## Resume Checklist

Run these from an allowed Cloudflare token location/session:

```powershell
git status --short --branch
git pull --ff-only
bash scripts/governance-preflight.sh
npm audit --audit-level=moderate
npm run test
npm run build
npm run scan:web-rc
```

Set local variables without printing token values:

```powershell
$envFile = "C:\Users\adamg\01. Code Projects\.env.master"
$commitHash = git rev-parse --short HEAD
$commitMessage = git log -1 --pretty=%s
```

Deploy the already-built `dist` directory:

```powershell
npx --yes wrangler pages deploy dist --project-name ai-task-router --branch main --commit-hash $commitHash --commit-message "$commitMessage" --env-file "$envFile"
```

Smoke the hosted app:

```powershell
$base = "https://ai-task-router.pages.dev"
Invoke-WebRequest "$base/" -UseBasicParsing | Select-Object StatusCode
Invoke-WebRequest "$base/manifest.webmanifest" -UseBasicParsing | Select-Object StatusCode
Invoke-WebRequest "$base/service-worker.js" -UseBasicParsing | Select-Object StatusCode
$env:PLAYWRIGHT_BASE_URL = $base
npx playwright test src/tests/e2e/mvp-workflows.spec.ts --project=chromium
```

## Hosted Smoke Focus

After deployment, verify the owner-facing fixes on `https://ai-task-router.pages.dev/`:

- Best Options routing detail is visible by default, not hidden behind a disclosure or pull-down.
- Each stage path has a clear user action, helper/model/mode recommendation, reason, check, and upgrade trigger where applicable.
- Route cards let the user select which route to accept.
- The save panel names the selected route before saving.
- Followed-choice impact increments after saving an accepted route.
- If avoided cost or energy cannot be meaningfully estimated, the UI does not imply exact zero cost or watt-hours.
- True software/app/workflow build tasks still get concrete build-stage items.
- Ordinary planning language such as "build an itinerary" stays in planning/execution/table routing rather than app-build routing.

## Post-Deploy Documentation

If the deploy succeeds:

1. Update `docs/2026-07-09-current-build-pathway.md` with the deployment URL, source commit, validation commands, and hosted smoke result.
2. Update `START_HERE.md` if the top-level handoff should no longer say production is stale.
3. Commit and push the deploy evidence.

If Cloudflare still rejects the token:

1. Stop after one failed deploy attempt.
2. Record the public IP, Cloudflare error code, command shape, and timestamp without printing secrets.
3. Update this turnover note or the active pathway with the new evidence.
4. Choose one of the recovery options above rather than repeatedly retrying from the same blocked location.

## Security Notes

- Do not print or paste values from `.env.master`.
- Do not commit any environment file or Cloudflare token.
- Do not broaden the token beyond the minimum permissions needed for Cloudflare Pages deploy unless the owner explicitly chooses that tradeoff.
- No app code should be changed merely to work around the Cloudflare token-location issue; this is an operator/auth-location problem, not a build artifact problem.
