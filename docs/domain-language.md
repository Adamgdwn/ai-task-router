# 2026-07-03T11:49:34-06:00 - Domain Language

Document type: shared vocabulary
Audience: project owner, builders, AI coding agents, reviewers, and operators
Purpose: define the terms used consistently across code, docs, tests, UI, prompts, runbooks, and release notes.

## Purpose

This file defines the shared vocabulary for the project.

Important domain terms should be named consistently across labels, database tables, functions, services, tests, docs, prompts, and runbooks.

When a term changes, update this file and the affected code or documentation in the same chunk where practical.

## Terms

| Term | Meaning | Avoid Saying | Code/Docs Usage |
|---|---|---|---|
| Route card | A saved decision record for one task, including recommended and alternative routes, warnings, blocked items, prompt package reference, stage guidance, and report-ready content. | plan, recommendation blob | Domain schemas, export/import, Best Options, Decision Card. |
| Prompt package | Ordered copy-ready prompt steps the user can run manually outside the app. | automation, execution package | Prompt generator, Copy-Ready Prompts, Markdown export. |
| Suggested stages | A compact set of rough work stages inferred from the task and recommended route. It is not a full project plan. | project plan, workflow automation | Route card `stageGuidance`, Best Options, Decision Card, Markdown export. |
| Recommended help | The user-visible tool/model or human review label suggested beside a stage. | executor, agent action | Stage guidance UI and Markdown export. |
| PDF report | A browser print/save-PDF view of a saved Decision Card. It is generated locally through the browser print dialog, not by a server renderer. | screenshot, server PDF job | Saved Decision Card report action and print CSS. |

## Naming Guidance

Use domain-specific names. A name should explain the responsibility it owns.

Challenge vague names when they hide unclear responsibility:

- `manager`
- `helper`
- `utils`
- `thing`
- `stuff`
- `data`
- `processor`
- `handler`
- `misc`
- `temp`
- `common`
- `general`

Prefer names that point to the actual domain concept, boundary, or behavior.

## Agent Guidance

When terminology is vague or inconsistent, the agent should:

1. Flag the naming issue.
2. Explain the risk to comprehension, tests, prompts, or future changes.
3. Recommend the smallest safe naming improvement.
4. Keep related code, docs, tests, UI, and prompts aligned when the owner accepts the change.

Do not rename broadly just for style. Improve names when the change fits the active chunk or the owner approves the refactor.

