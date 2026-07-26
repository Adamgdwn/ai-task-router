# Agent Inventory

Last Updated: 2026-07-26T09:49:39-06:00
Status: active
Owner: Technical Lead
Status Updated: 2026-07-26T09:49:39-06:00

This register lists autonomous agents the product operates. **There are none, by design.**

The app runs entirely in the user's browser. It never calls a model, sends a prompt, connects an
account, approves output, or takes an action outside the page. What it produces is guidance the user
carries to a tool by hand. That boundary is stated to the user in every export and enforced by
`docs/tool-permission-matrix.md`.

| Agent ID | Name | Purpose | Autonomy | Model | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| - | - | - | - | - | - | No agents operated |

## When This Stops Being Empty

Add an entry before shipping, not after, if the product ever gains any of:

- a provider API call made by the app rather than by the user
- a stored credential or connected account
- a background or scheduled task that runs without a user action
- any step that acts on the user's behalf outside the browser tab

Each of those also reopens `docs/tool-permission-matrix.md`, the manual-use boundary copy, and the
privacy claims in the Help screen. None of them is a code change on its own.

An empty register is a real control. A register full of `Example Agent` was not - it looked like
oversight while recording nothing, the same defect class as the Help placeholder removed in chunk R7
and the "Coming Soon" desktop card removed by [ADR-0002](decisions/adr-0002-abandon-desktop-track.md).
