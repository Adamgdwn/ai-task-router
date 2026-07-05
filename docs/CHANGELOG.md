# 2026-07-03T11:49:34-06:00 - Change Log

## Unreleased

- Initial project setup.
- Added the desktop trust and distribution planning baseline for future hosted/PWA and signed desktop release paths.
- Adopted the New Build Agent document-control standard locally and routed controlled docs, validation logs, ADRs, registers, and handoffs through it.
- Opened Desktop Chunk D0 as a proposed owner-decision and governance-review packet without adding desktop implementation.
- Confirmed Desktop Chunk D0 defaults for planning and added ADR-0001 selecting Tauri for the Desktop Chunk D2 shell spike, with Electron as fallback and hosted/PWA kept separate.
- Applied the owner-visible date-first naming convention to the desktop trust working document and recorded it in the document-control standard.
- Added the Desktop Chunk D2 Tauri shell scaffold, brand-aligned desktop icons, desktop npm scripts, and the Windows prerequisite blocker note for Rust/Cargo plus MSVC Build Tools.
- Installed and verified the Windows desktop build prerequisites, committed the generated Tauri `Cargo.lock`, confirmed the no-bundle release desktop executable launches, and documented the remaining Windows Application Control blocker for `desktop:dev`.
- Completed Desktop Chunk D3 trust-boundary work: explicit desktop CSP, future local discovery schema contracts, permission matrix updates, command/data handling rules, and D4 entry gates without adding native discovery; the no-bundle build passes, but the rebuilt unsigned release executable is blocked by Windows Application Control.
- Completed Desktop Chunk D4 permissioned local AI tool detection: custom Rust commands, desktop-only `Check this computer` UI, allowlisted Ollama/LM Studio/Jan/GPT4All checks, summary-first results, optional model-name reveal, no path return, no broad Tauri plugin permissions, and build-only desktop validation while Windows Application Control blocks launch smoke.
- Completed Desktop Chunk D5 PWA install path: added web app manifest, branded 192px/512px install icons, production-only service-worker registration, Start Here browser-install copy, service-worker registration tests, deployment/runbook notes, and explicit browser-vs-desktop local-discovery boundaries.
- Completed Desktop Chunk D6 packaging/signing spike: added an opt-in unsigned internal Windows NSIS packaging config/script, package artifact SHA-256 inspection helper, script tests, generated one internal unsigned package artifact for evidence, and documented Windows/macOS/Linux signing gates while keeping public desktop release blocked.
- Completed Desktop Chunk D7 release/security readiness: added the D7 readiness packet, recorded GitHub plus Cloudflare as the intended free distribution path, recommended one canonical Cloudflare Pages app URL linked from the three existing sites, added `SECURITY.md`, and held public launch until E2E, cybersecurity, hosting, signing, and smoke gates pass.
- Completed Chunk Fifteen E2E fixtures: added 22 safe fixture tasks plus Playwright coverage for first-run setup, manual AI tool selection, stale local-store migration, contextual task include choices, routing, saved route cards, prompt package export preparation, route-log feedback, no-execution controls, and narrow-viewport overflow.
- Completed Desktop Chunk D8 web release-candidate security pass: added `npm run scan:web-rc`, recorded the D8 evidence packet, verified clean install, audit, script tests, unit tests, production build, artifact scan, Playwright E2E, and local production preview, and kept public launch held until Cloudflare Pages HTTPS preview and canonical-domain smoke pass.
- Completed Desktop Chunk D9 Cloudflare Pages hosted preview smoke: created Cloudflare Pages project `ai-task-router`, deployed the direct-upload preview at `https://preview-20260704-0c7b253.ai-task-router.pages.dev`, added hosted Playwright base-URL support, verified hosted HTTPS/PWA behavior with Node and Chromium, ran hosted E2E, and kept public launch held until canonical URL/custom-domain/GitHub-integration decisions pass.


