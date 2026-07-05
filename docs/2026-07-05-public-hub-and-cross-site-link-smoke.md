# 2026-07-05 - Public Hub And Cross-Site Link Smoke

Document ID: AUD-ENG-005
Version: 1.0.0
Status: active
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-05
Last Reviewed: 2026-07-05
Next Review: Before social launch posts, public desktop download buttons, custom-domain/DNS work, or public GitHub Releases
Timestamp: 2026-07-05T07:57:15-06:00
Last Updated: 2026-07-05T07:57:15-06:00

## Purpose

This packet records Desktop Chunk D14: publication and smoke testing of the Old Skool AI public hub page and the Guided AI Labs / Guided AI Journey cross-site links for AI Task Router.

D14 makes the public doorway live. It does not create social posts, attach a custom app domain, create public GitHub Releases, publish desktop artifacts, sign installers, notarize macOS artifacts, enable telemetry, connect provider accounts, add a backend, or distribute desktop downloads.

## Public State

| Surface | Public URL | D14 state |
|---|---|---|
| Old Skool AI hub | `https://oldskoolai.com/ai-task-router/` | Live, smoked, links to the online app |
| Online app | `https://ai-task-router.pages.dev/` | Live from D13, linked from the Old Skool AI hub |
| Public security route | `https://oldskoolai.com/security/` | Live, linked from the hub |
| Guided AI Labs link | `https://www.guidedailabs.com/` | Footer links to the Old Skool AI hub |
| Guided AI Journey link | `https://www.guidedaijourney.com/` | Footer links to the Old Skool AI hub |

Desktop downloads remain hidden or disabled. The Old Skool AI hub still says desktop downloads are coming after signing and safety checks.

## External Commits And Deployments

| Site | Repo | Commit / deployment | Notes |
|---|---|---|---|
| Old Skool AI | `Adamgdwn/oldskoolai.com` | `8be9b86` (`Launch AI Task Router online link`) | Added the live app CTA and public `/security` route; pushed to `main`; Vercel auto-deploy path used. |
| Guided AI Labs | `Adamgdwn/guided-ai-labs-website` | `dc370e5` (`Link to AI Task Router hub`) | Added footer link to Old Skool AI hub; rebased over remote commit `819ccbb`; pushed to `main`; Vercel auto-deploy path used. |
| Guided AI Journey | `Adamgdwn/guided-ai-journey-website-and-tools` | `610438b` (`Link footer to AI Task Router hub`); Vercel production URL `https://guided-ai-journey-website-and-tools-o52d0mpul.vercel.app` | Pushed from a temporary worktree based on `origin/main` to avoid publishing pre-existing local commit `236fd7e`; deployed to production and aliased to `https://www.guidedaijourney.com`. |

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-05T07:40:00-06:00 | AI Task Router governance startup | passed | `bash scripts/governance-preflight.sh` reported 0 warnings; `project-control.yaml` reviewed; work timestamp captured. |
| 2026-07-05T07:48:33-06:00 | Old Skool AI validation | passed | `npm run typecheck`, `npm run lint`, and `npm run build` passed after the hub/security page changes. |
| 2026-07-05T07:48:33-06:00 | Old Skool AI governance check | passed with existing owner decision | Required gaps: 0. Existing accepted exception remains: owner-approved governance level 1 for a high-risk/auth/payment site. Owner-decision prompt remains that money-handling projects should periodically confirm whether governance level should remain below 3. |
| 2026-07-05T07:48:33-06:00 | Guided AI Labs validation | passed | `npm run lint` and `npm run build` passed before push; after rebasing over remote commit `819ccbb`, `npm run lint`, `npm run build`, governance preflight, and `git diff --check` passed again. |
| 2026-07-05T07:48:33-06:00 | Guided AI Journey isolated validation | passed | Temporary worktree from `origin/main` ran `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build`. Initial temp-worktree build failed only because local `.env.local` was absent; rerunning build with the existing repo-local env loaded into the process passed. No env values were printed or copied. |
| 2026-07-05T07:53:00-06:00 | Source control push | passed | Old Skool AI `8be9b86`, Guided AI Labs `dc370e5`, and Guided AI Journey `610438b` were pushed to their `main` branches. |
| 2026-07-05T07:54:00-06:00 | Guided AI Journey production deploy | passed | Correct Vercel project deployed successfully and aliased to `https://www.guidedaijourney.com`. |
| 2026-07-05T07:55:00-06:00 | Public HTTP smoke | passed | `https://oldskoolai.com/ai-task-router/`, `https://oldskoolai.com/security/`, `https://www.guidedailabs.com/`, `https://www.guidedaijourney.com/`, and `https://ai-task-router.pages.dev/` returned HTTP 200. Apex checks for `guidedailabs.com` and `guidedaijourney.com` redirect to their `www` hosts and return 200. |
| 2026-07-05T07:55:00-06:00 | Desktop and mobile Chromium smoke | passed | At 1440x900 and 390x844, Old Skool AI hub, Old Skool AI security, Guided AI Labs home, and Guided AI Journey home had expected titles/text, expected links, no rejected preview URL text, and 0 horizontal overflow. |
| 2026-07-05T07:56:00-06:00 | Public boundary sweep | passed | Public page HTML contained no `preview-20260704`, `.exe`, `.dmg`, `AppImage`, `x64-setup`, or `technical-preview` strings. |

## Known Gaps

- Social launch posts have not been created.
- Public desktop downloads remain blocked by signing/notarization, checksums, install/launch/uninstall smoke, local discovery smoke, support/withdrawal copy, and owner approval.
- No custom app domain or DNS change has been made; the app still uses the Cloudflare Pages URL.
- Cloudflare Pages is still not connected to GitHub; D13 accepted direct upload for the first production web release.
- Guided AI Journey's local Linux `main` worktree remains intentionally divergent: local `HEAD` is pre-existing unpushed commit `236fd7e`, while `origin/main` is D14 commit `610438b`. That local worktree was not reset, rebased, or pushed by D14.
- The first Guided AI Journey deploy attempt from the temporary worktree lacked `.vercel/project.json` and created/targeted a temporary Vercel project name before failing its build. The corrected deploy used the existing Guided AI Journey project and production alias. The failed temporary deployment URL redirected to Vercel login when checked and was not linked from public pages.

## Rollback

Website rollback:

1. Old Skool AI: revert `8be9b86` or remove the `/ai-task-router/` navigation/link targets and public app CTA.
2. Guided AI Labs: revert `dc370e5` to remove the footer link.
3. Guided AI Journey: promote the previous known-good Vercel deployment or revert `610438b` and redeploy the existing Guided AI Journey project.

App rollback remains D13's Cloudflare Pages rollback path. If the app URL fails while the hub stays healthy, remove or disable the Old Skool AI `Use the online tool` target until the app rollback is complete.

## Handoff

D14 is task complete. The web/PWA app is live, the Old Skool AI public hub is live, and Guided AI Labs plus Guided AI Journey now point to the hub.

The next bounded chunk should be an owner-approved social launch copy/review step for YouTube, Facebook, and/or LinkedIn, or a separate desktop trust/signing chunk. Do not add public desktop download links, GitHub Release artifacts, custom-domain/DNS changes, provider connections, telemetry, updater flows, signing workflows, or social posts without a separate approved chunk and matching release evidence.
