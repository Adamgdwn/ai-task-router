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


