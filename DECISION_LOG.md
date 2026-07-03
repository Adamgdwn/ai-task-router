# 2026-07-03T12:10:23-06:00 - Decision Log

Last Updated: 2026-07-03T12:10:23-06:00
Status: active
Status Updated: 2026-07-03T12:10:23-06:00
Owner: Technical Lead

## Decisions

| Timestamp | Decision | Rationale | Consequence |
|---|---|---|---|
| 2026-07-03T11:54:20-06:00 | Create the Vite/React/TypeScript scaffold manually rather than running a generator in the non-empty repository. | The repo already contains governance and planning files; a manual scaffold keeps the diff narrow and avoids accidental overwrite. | Future chunks inherit a conventional Vite structure without generator noise. |
| 2026-07-03T11:54:20-06:00 | Include Playwright configuration but no runnable e2e spec yet. | Chunk One asks for a low-friction Playwright skeleton if straightforward, while acceptance only requires a smoke test. | E2E coverage can be added once real workflows exist. |
| 2026-07-03T11:54:20-06:00 | Keep placeholder screens data-driven through `screenDefinitions`. | The skeleton needs ten planned screens without scattering placeholder copy through many shallow components. | Future chunks can replace placeholders gradually while preserving navigation. |
| 2026-07-03T11:58:27-06:00 | Start on the current React 19, Vite 8, and Vitest 4 toolchain after checking local Node compatibility. | Initial install with older Vitest reported known audit findings; the current toolchain supports Node 24 and cleared the audit. | The baseline has fewer supply-chain warnings, but older Node versions are not the intended local runtime. |
| 2026-07-03T12:10:23-06:00 | Infer exported TypeScript domain types from Zod schemas. | Runtime schemas are the trust boundary for future imports, exports, and route records, so compile-time types should stay aligned with validation rules. | Future chunks should import domain types from `src/domain/types.ts` and validate seed data with schemas from `src/domain/schemas.ts`. |
| 2026-07-03T12:10:23-06:00 | Add Zod as the schema validation dependency in Chunk Two. | The product brief names Zod as the planned runtime schema tool, and this chunk explicitly requires Zod schemas. | Dependency audit remains clean; rollback is removing schema files and the Zod package before downstream chunks depend on them. |
