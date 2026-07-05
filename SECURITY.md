# Security Policy

Last Updated: 2026-07-05T07:22:04-06:00
Status: active
Owner: Project Owner

## Supported Status

The browser/PWA app is live at `https://ai-task-router.pages.dev/`. Public desktop downloads are not released.

The current browser/PWA build has D8 local release-candidate evidence, D9 Cloudflare Pages preview evidence, and D13 production URL smoke evidence. No custom domain has been attached. The current desktop build is an internal prototype. The D6/D10 Windows installers are unsigned evidence artifacts only and must not be shared as ordinary-user downloads.

## Security Model

The MVP does not:

- call external AI APIs
- connect AI accounts
- store credentials
- upload files
- add telemetry
- execute actions for the user
- inspect the computer from the browser/PWA build

The desktop prototype has a user-started `Check this computer` flow for selected local AI tools only. It must not run startup/background scans, broad filesystem searches, file indexing, provider account connections, arbitrary shell commands, or uploads.

## Reporting A Vulnerability

Please do not post secrets, exploit details, private file paths, or sensitive user data in a public issue.

Preferred route:

1. Use GitHub private vulnerability reporting if it is enabled for this repository.
2. If private reporting is not enabled, open a public GitHub issue with a brief non-sensitive summary and ask for a private contact route.

Include:

- affected version or commit
- browser/OS
- whether the issue affects browser/PWA or desktop
- steps to reproduce without sensitive data
- expected and actual behavior

## Release Gate

Before public links or desktop downloads are advertised, the project must pass the release/security gate recorded in [docs/2026-07-04-release-security-readiness-packet.md](docs/2026-07-04-release-security-readiness-packet.md) and the D8 web release-candidate gate recorded in [docs/2026-07-04-web-release-candidate-security-pass.md](docs/2026-07-04-web-release-candidate-security-pass.md).
