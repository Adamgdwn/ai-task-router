# 2026-07-09 - Cloudflare Deploy Turnover

Document ID: PATH-ENG-003
Version: 1.5.0
Status: resolved
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-09
Last Reviewed: 2026-07-26
Next Review: During the next production deploy attempt; the recovery path in this note is now proven four times
Last Updated: 2026-07-26T11:41:28-06:00
Status Updated: 2026-07-25T16:28:35-06:00

## Purpose

This turnover note recorded the Cloudflare production deploy blocker and the next safe recovery path after the owner decided to wait until returning to a less restricted network.

**Resolved 2026-07-25T16:28:35-06:00.** The preferred recovery path worked on the first attempt from the owner's home network. Keep this note as the runbook for the next deploy and as the record of what the failure actually was.

Use this note with the active pathway, [2026-07-09-current-build-pathway.md](2026-07-09-current-build-pathway.md), when resuming production deployment of the latest pushed `main`.

## Outcome

| Item | Result |
|---|---|
| Root cause | Network location only. Cloudflare's token location policy did not include public IP `184.67.69.66`. |
| Fix | None applied. The same token, the same secure env file, and the same `wrangler pages deploy` command shape succeeded unchanged from public IP `70.65.205.71`. |
| Deployed | Source `ab329e5` to `https://7c570b1d.ai-task-router.pages.dev`, Environment `Production`, Branch `main`, at 2026-07-25T16:28:35-06:00. |
| Token changes | None. The token was not broadened, reissued, or allowlisted, and no app code was changed. |
| Attempts | One, per this note's stop rule. |

If a future deploy hits `9109` again, the token's allowed-IP list is the thing to look at first, and recovery option 4 below (CI-based deploys with a stable egress) is the durable fix.

**Re-run 2026-07-26T10:21:53-06:00 from the same home network, public IP `70.65.205.71`.** Source `69b31a2` deployed to `https://d81aef5b.ai-task-router.pages.dev` on the first attempt with no token, command, or code changes.

**Re-run 2026-07-26T11:10:28-06:00 from the same location.** Source `a34d839` deployed to `https://9d00dce4.ai-task-router.pages.dev` on the first attempt, again unchanged. The runbook below is now proven three times, and the canonical alias has followed the deploy within the session on both of the last two attempts.

**Re-run 2026-07-26T11:41:28-06:00 from the same location.** Source `b8069fa` deployed to `https://cc915a90.ai-task-router.pages.dev` on the first attempt, unchanged. Fourth consecutive success. This run is the one that exposed the verification traps below: the canonical alias appeared stale on the first plain fetch and was not, and the first bundle string check ran against an SPA fallback and reported a clean pass it had not earned.

## Verification Traps

Both of these produced a confident wrong answer on 2026-07-26T11:41:28-06:00. The deploy itself was fine; the checks were not.

**A single plain fetch cannot tell a stale alias from a stale edge cache.** The canonical URL served the previous asset on the first fetch while the per-deploy hash URL already served the new one. A cache-busted fetch returned the new asset, and an ordinary fetch immediately after did too — an edge-cache hit lasting seconds. Always re-check with cache-busting before recording that the alias failed to follow:

```powershell
$rx = [regex]'index-[A-Za-z0-9_-]+\.js'
$html = (Invoke-WebRequest "https://ai-task-router.pages.dev/?cb=verify" -UseBasicParsing -Headers @{"Cache-Control"="no-cache"}).Content
$rx.Match($html).Value
```

**Check the byte length before trusting a bundle string check.** A request for a not-yet-propagated asset path returns the SPA fallback HTML with HTTP 200. Roughly 962 characters of HTML contain none of the phrases being searched for, so every "must be present" reports missing *and every "must be absent" reports absent* — including the R-010 vocabulary, which reads as a clean pass. Assert the length matches the build output first:

```powershell
$asset = ($rx.Match($html).Value)
$js = (Invoke-WebRequest "https://ai-task-router.pages.dev/assets/$asset" -UseBasicParsing -Headers @{"Cache-Control"="no-cache"}).Content
if ($js.Length -lt 500000) { throw "Got $($js.Length) chars, not the bundle - do not trust any string check against this." }
```

Absence of a forbidden phrase is only evidence when the haystack is real.

## Which URL Is Live Right Now

Verified 2026-07-26T11:41:28-06:00 by fetching each URL and comparing the hashed asset it references.

| Item | Status | Notes |
|---|---|---|
| Canonical production URL | live and current with `main` | Re-verified 2026-07-26T11:41:28-06:00. `https://ai-task-router.pages.dev/` serves asset `index-Dc_ddyS3.js`, the same build as `https://cc915a90.ai-task-router.pages.dev/`. The alias did follow the deploy, but this time only a cache-busted fetch showed it — see Verification Traps above. Per R-008 the canonical URL is the only one that should appear on `oldskoolai.com`, `guidedailabs.com`, or `guidedaijourney.com`; hash URLs like `cc915a90.` are per-deploy and must not be published. |
| Live build contents | current with `main` at `b8069fa` | The live asset is 658,310 characters, matching the build output, so the string check below ran against the real bundle. It contains `Why which tool you pick matters`, `Smaller is not automatically better`, `Energy moves with it`, `How you have been choosing`, `If this run were metered`, `Against the heaviest offered`, `10-watt LED bulb`, and `Which routes you followed`, confirming all five teaching-audit fixes reached users, and still contains `What this app does` from the R7 Help screen. It contains none of `Estimated savings`, `Energy saved`, `Est. saved`, or `avoided cost`. Nothing on `main` is undeployed. |
| `https://9d00dce4.ai-task-router.pages.dev` | superseded | Serves `index-Dv6r8WOf.js` from source `a34d839`. It was the production deployment for roughly thirty minutes on 2026-07-26; it is no longer what the canonical URL points at. |
| `https://d81aef5b.ai-task-router.pages.dev` | superseded | Serves `index-CBWnLbEK.js` from source `69b31a2`. It was the production deployment for roughly fifty minutes on 2026-07-26; it is no longer what the canonical URL points at. |
| `https://7c570b1d.ai-task-router.pages.dev` | superseded | Serves `index--Sdj9Css.js` from source `ab329e5`. It was the production deployment from 2026-07-25 to 2026-07-26; it is no longer what the canonical URL points at. |
| `https://ef92b270.ai-task-router.pages.dev` | superseded | Serves the older `index-DOmdc2yL.js` from source `9639840`, the last production deployment before 2026-07-25. |

## Current State As Of The Blocker

Historical snapshot from 2026-07-09, kept as the record of what the failure looked like. The first two rows were
superseded by the 2026-07-25 deploy; see the table above for what is live now.

| Item | Status | Notes |
|---|---|---|
| Canonical production URL | live but stale | `https://ai-task-router.pages.dev/` served the prior production deployment. |
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
