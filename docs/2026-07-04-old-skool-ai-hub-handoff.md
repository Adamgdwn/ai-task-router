# 2026-07-04 - Old Skool AI Hub Handoff Package

Document ID: PATH-ENG-006
Version: 0.1.0
Status: draft
Owner: Technical Lead
Approver: Project Owner
Effective Date: 2026-07-04
Last Reviewed: 2026-07-04
Next Review: Before publishing Old Skool AI public hub links or desktop download buttons
Last Updated: 2026-07-05T07:22:04-06:00
Status Updated: 2026-07-05T07:22:04-06:00

## Purpose

This package gives the Linux-side website build a concrete handoff for the first public AI Task Router doorway.

The goal is to move faster on the web launch while keeping the desktop app behind trust checks. Old Skool AI should become the public hub for the tool, Guided AI Labs and Guided AI Journey should link to that hub, and ordinary-user desktop downloads should stay hidden or clearly held until signing, notarization, checksums, smoke testing, support, withdrawal, and owner approval are complete.

## Current Release Boundary

As of 2026-07-04T22:23:04-06:00:

- Old Skool AI is the preferred public doorway.
- The online app has release-candidate evidence and a Cloudflare Pages smoke-test preview.
- The D13 production URL is the first canonical public app URL: `https://ai-task-router.pages.dev/`.
- The browser/PWA version cannot check the user's computer.
- The desktop app is the future path for local machine discovery.
- Desktop technical-preview artifacts are not ordinary-user downloads.
- No DNS, Cloudflare production promotion, public GitHub Release, social launch, or public desktop download link is created by this handoff.

## Recommended Site Shape

Use one public product page on Old Skool AI.

Recommended route:

```text
https://oldskoolai.com/ai-task-router/
```

If the current Old Skool AI site uses a different page-routing convention, keep the page title and navigation label the same and record the actual final route in the next release chunk.

Navigation:

- Add a top-level or resources-menu item named `AI Task Router`.
- Link Guided AI Labs and Guided AI Journey to the Old Skool AI page, not to separate copies of the app.
- Do not iframe the app into the page for first release; link out to the canonical app URL after it is selected and smoked.

Primary page actions:

| Action | Label | Target | Current state |
|---|---|---|---|
| Online app | `Use the online tool` | `https://ai-task-router.pages.dev/` | Ready after D13 production smoke |
| Desktop app | `Desktop app coming after safety checks` | None | Hidden or disabled |
| Support/security | `Report a security issue` | `<PUBLIC_SUPPORT_OR_SECURITY_URL>` | Needs owner-confirmed support route |

Do not point public users to `https://preview-20260704-0c7b253.ai-task-router.pages.dev`. That URL is a smoke-test preview, not the public launch destination.

## Old Skool AI Page Copy

### Hero

Eyebrow:

```text
Free planning tool from Guided AI Labs
```

Headline:

```text
AI Task Router
```

Intro:

```text
Tell it what you are trying to get done, which AI tools you already use, and how careful the work needs to be. It gives you a plain-language plan for where to start and copy-ready prompts you can use in your own AI apps.
```

Primary button:

```text
Use the online tool
```

Supporting trust line:

```text
The online version runs in your browser. It does not connect your AI accounts, upload your files, or check your computer.
```

### What It Helps With

Section heading:

```text
Use the AI tools you already have
```

Body:

```text
AI Task Router helps you choose a sensible starting point instead of guessing. Pick the AI apps you know, describe the job in normal language, and get a simple route with prompts you can copy into ChatGPT, Claude, Gemini, Copilot, Perplexity, local tools, or another app you already use.
```

Short bullets:

- Choose which AI app to start with.
- Turn a messy idea into a cleaner working prompt.
- Keep more private or sensitive work away from the wrong tools.
- Save or download the plan for your own records.

### Online Version

Section heading:

```text
Use it online first
```

Body:

```text
The online version is the fastest way to try the tool. Your setup, saved choices, and prompt packages are stored locally in your browser unless you choose to export them.
```

Boundary copy:

```text
Because this runs in a browser, it cannot inspect your computer for installed local AI tools. That feature belongs in the future desktop app.
```

### Desktop Version Hold State

Preferred first-launch behavior:

- Hide public desktop download buttons entirely until desktop gates pass.
- If the page needs to mention desktop, show a non-clickable coming-soon area.

Coming-soon heading:

```text
Desktop app coming after signing and safety checks
```

Coming-soon body:

```text
The desktop version is being prepared for Windows, Mac, and Linux so it can help check for local AI tools on your own computer. We will publish downloads only after the installers pass signing, safety, checksum, install, launch, and uninstall checks.
```

Disabled platform labels if shown:

- `Windows - coming after signing checks`
- `Mac - coming after notarization checks`
- `Linux - coming after package smoke tests`

Do not make these look like active download buttons. Use disabled controls, muted cards, or a short note.

### Trust Notes

Section heading:

```text
What it does not do
```

Body:

```text
This first version does not run AI for you, buy subscriptions, connect accounts, upload files, or send your work to a database. It helps you make a better plan, then you decide what to copy, save, or use elsewhere.
```

## Cross-Site Link Instructions

### Guided AI Labs

Add one link from Guided AI Labs to the Old Skool AI hub.

Recommended placements:

- Resources or Tools navigation
- footer resources
- any existing free-tools page

Recommended link text:

```text
AI Task Router - free tool for choosing where to start with AI
```

Target:

```text
https://oldskoolai.com/ai-task-router/
```

### Guided AI Journey

Add one link from Guided AI Journey to the Old Skool AI hub.

Recommended placements:

- resources
- next steps
- footer

Recommended link text:

```text
Try AI Task Router on Old Skool AI
```

Target:

```text
https://oldskoolai.com/ai-task-router/
```

Do not host separate app copies on Guided AI Labs or Guided AI Journey for the first release. Separate copies would multiply service-worker scope, support, rollback, analytics, and stale-copy risk.

## SEO And Metadata

Recommended title:

```text
AI Task Router | Old Skool AI
```

Recommended meta description:

```text
Use AI Task Router to choose which AI app to start with, shape your task into copy-ready prompts, and keep sensitive work in the right place.
```

Recommended Open Graph title:

```text
AI Task Router
```

Recommended Open Graph description:

```text
A free Old Skool AI tool that helps you choose the right AI app and prompt path for the job in front of you.
```

Recommended canonical page URL:

```text
https://oldskoolai.com/ai-task-router/
```

## Publish Checklist

Before the Old Skool AI page becomes public:

- [ ] The page route is confirmed.
- [ ] The primary online button uses only the final smoked app URL: `https://ai-task-router.pages.dev/`.
- [ ] No public link points at the D9 preview alias.
- [ ] The page says the browser version cannot check the user's computer.
- [ ] The page says the MVP does not connect AI provider accounts or upload files.
- [ ] Desktop buttons are hidden or disabled.
- [ ] No unsigned or unnotarized desktop artifacts are linked.
- [ ] Guided AI Labs links to the Old Skool AI hub.
- [ ] Guided AI Journey links to the Old Skool AI hub.
- [ ] A support or security contact route is visible or linked.
- [ ] Desktop and mobile page views are checked.
- [ ] The page can be unpublished or the navigation link removed quickly.

## Rollback Or Removal

If the hub page has to be withdrawn:

1. Remove the Old Skool AI navigation link.
2. Unpublish or draft the `AI Task Router` page.
3. Remove the Guided AI Labs link.
4. Remove the Guided AI Journey link.
5. If users may already have seen the page, replace it with a short maintenance note:

```text
AI Task Router is temporarily unavailable while we finish launch checks.
```

6. Record the rollback in the active pathway, deployment guide, or runbook.

If only the online app URL fails after publication, keep the Old Skool AI page but remove the `Use the online tool` target until the hosted app rollback is complete.

## Open Decisions

These decisions remain for the next release chunk:

- final Old Skool AI page route if `/ai-task-router/` does not fit the existing site
- whether to later replace the Cloudflare Pages default URL with a custom domain
- whether to later connect Cloudflare Pages to GitHub for production automation
- support/security contact URL for ordinary users
- whether the desktop section is fully hidden or shown as a disabled coming-soon section
- owner approval to publish website links after hosted app smoke passes

## Validation

| Timestamp | Check | Result | Notes |
|---|---|---|---|
| 2026-07-04T22:30:30-06:00 | `bash scripts/governance-preflight.sh`; `git diff --check`; release-boundary `rg` scans | passed | Governance preflight reported 0 warnings; whitespace check reported only normal Windows LF-to-CRLF notices; scans found no stale D12-missing wording and only historical or negative-boundary references for preview URLs, unconfirmed app subdomain, and premature desktop-download claims. No app/runtime tests were run because D12 changed documentation and release-control notes only. |

## Handoff

D12 prepares the website package only. D13 has since selected and smoked the production online app URL: `https://ai-task-router.pages.dev/`. The next release chunk should publish or update the Old Skool AI page with that URL, confirm the support/security route, add cross-site links, and smoke the public pages before social sharing.

Desktop download buttons remain held until the desktop trust gates pass or the owner separately accepts a documented technical-preview exception.
