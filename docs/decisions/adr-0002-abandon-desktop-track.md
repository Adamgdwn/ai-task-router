# ADR-0002: Abandon The Desktop Track

Document ID: ADR-ENG-002
Version: 1.0.0
Status: accepted
Owner: Technical Lead
Approver: Project Owner
Date: 2026-07-26
Status Updated: 2026-07-26T09:31:44-06:00
Supersedes: [ADR-0001](adr-0001-desktop-wrapper.md)

## Context

ADR-0001 chose Tauri as a desktop wrapper so the app could offer permissioned local model discovery - the one capability a browser genuinely cannot provide. That work was built: a Rust shell, a trust-boundary contract, schema-validated IPC, a discovery panel, packaging scripts, a release gate, MSIX proof packaging, and Windows Store manifest preparation.

It never shipped. Public desktop release stayed blocked on signing, notarization, and platform trust evidence (R-005), which is a real cost in money and identity paperwork, not a coding task. The last commit to any desktop surface was 2026-07-06. In the nineteen days since, the browser app received seventeen commits, a full thirteen-chunk audit remediation pass, and a production deploy.

The 2026-07-26 leanness audit measured what the dormant track still cost: 2,287 lines of desktop documentation, 1,856 lines of desktop scripts and their tests, 114 tracked `src-tauri` files including 49 Windows MSIX assets and 18 iOS icons for a platform that appears in no plan, nine of fifteen npm scripts, and `@tauri-apps/api` as a *runtime* dependency statically imported by `src/desktop/desktopDiscovery.ts` - so every web visitor downloaded desktop IPC code they could never invoke.

It also cost honesty. The browser app rendered a "Desktop app - Coming Soon!" card on My AI Tools promising that a desktop app could check the user's computer for local AI tools. That promise was live on production and had no owner behind it. It is the same defect class as the Help placeholder that chunk R7 removed.

## Decision

Abandon the desktop track. Delete the Tauri shell, the desktop discovery feature, its schemas and types, the packaging and gate scripts, and the "Coming Soon" card. Archive the desktop planning and evidence documents rather than deleting them, and close the desktop risks.

The product is a web app that teaches people to make lower-impact AI decisions. Nothing about that intention requires an installer.

Owner decision, 2026-07-26: *"I don't imagine anybody's going to download this. It's not that great of a tool... it's a really good information tool that can just live online."*

## Consequences

Local model discovery is gone. Users who run Ollama, LM Studio, Jan, or GPT4All add those tools by hand in My AI Tools, which is what the browser app always did anyway - the discovery panel only ever worked inside the desktop shell, which no user had.

The install story is now one story instead of two. The PWA install panel no longer has to defer to a desktop shell that might be present, and the copy no longer points at an app that will not exist.

Reversing this is a real project, not a revert. The Rust shell, capability manifests, and packaging scripts are recoverable from git history at `7a5d139`, and the planning documents are in `docs/archive/`, but any future desktop attempt should re-derive the trust boundary from current requirements rather than resurrect a nineteen-day-dormant design.

Risks R-004, R-005, and R-006 are closed as no longer applicable. R-003 keeps only its hosted-app clause.

## Alternatives Considered

**Mothball in place.** Keep the code and mark the track paused. Rejected: this is what had already been happening by default for nineteen days, and it is precisely how the "Coming Soon" promise stayed live on production. A paused track that still ships code to users is not paused.

**Keep the desktop discovery UI, drop the packaging machinery.** Rejected: the UI cannot function without the shell, so keeping it would preserve the false promise while removing the only thing that could ever have honoured it.
