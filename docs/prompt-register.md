# Prompt Register

Last Updated: 2026-07-26T09:49:39-06:00
Status: active
Owner: Technical Lead
Status Updated: 2026-07-26T09:49:39-06:00

The app sends no prompts. It composes them and hands them to the user, who decides whether to paste
one into a tool. Every generated package carries the manual-use boundary, and no step in a package is
executed by the app.

So there is no prompt that runs unattended and needs version control against drift. What does need
recording is the shape of what the app writes on a user's behalf, because that text reaches a model
under the user's account and the wording is the product.

| Prompt surface | Source | Composed from | Reaches a model when |
| --- | --- | --- | --- |
| Prompt package steps | `src/domain/prompting/promptPackageGenerator.ts` | The accepted route's steps, the user's own task description, and the sources the user marked as includable | The user copies a step and pastes it themselves |
| Route step instructions | `src/domain/routing/` | Task intake, tool inventory, and the selected route strategy | Same - only by hand |
| Stage guidance actions | `src/domain/routing/stageGuidance.ts` | The project stages the task decomposes into | Same - only by hand |

Step kinds are fixed by `routeStepKinds` in `src/domain/schemas.ts`: `model`, `research`,
`artifact`, `human review`, `manual`. Only `model` steps produce text intended for a tool; the rest
are instructions to the person.

## Review Obligation

Wording changes to these surfaces are product copy changes, not refactors. Anything that alters what
a user is told to paste - or that adds user content to a prompt the user did not choose to include -
needs the same review as user-facing copy, and re-checks the source-permission rules in
`docs/tool-permission-matrix.md`.

If the app ever sends a prompt itself, this register stops describing composed text and starts
governing executed prompts. That change also requires an entry in `docs/agent-inventory.md`.
