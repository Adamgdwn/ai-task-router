# 2026-07-03T14:08:55-06:00 - Decision Log

Last Updated: 2026-07-03T14:08:55-06:00
Status: active
Status Updated: 2026-07-03T14:08:55-06:00
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
| 2026-07-03T12:23:53-06:00 | Add minimal schemas for policy defaults and task templates during Chunk Three. | The chunk requires policy and task template seeds to validate against runtime schemas, but Chunk Two had not yet defined those shapes. | The schema boundary now covers all default registries without adding routing, scoring, persistence, UI forms, or external calls. |
| 2026-07-03T12:23:53-06:00 | Keep default model seeds generic and user-configured rather than provider-specific. | Provider lineups change, and the MVP should recommend routes based on user inventory without claiming permanent model catalogs. | Future UI can ask users which free agents and paid subscriptions they have, while defaults remain editable and non-connector based. |
| 2026-07-03T12:28:19-06:00 | Expand remaining build chunks before implementing more code. | The owner requested consistent, detailed future chunks so later implementation does not drift or lose focus. | Chunks Four through Sixteen now have objectives, boundaries, acceptance criteria, tests, security notes, rollback paths, stop conditions, and handoffs before execution. |
| 2026-07-03T12:47:24-06:00 | Keep hard-gate output as a typed domain result instead of adding new Zod schemas in Chunk Four. | Hard gates are an internal pure calculation boundary right now; route cards, imports, exports, and persistence are not consuming this shape yet. | Candidate generation can use the typed result immediately, and a runtime schema can be added later only if the result becomes persisted or imported/exported. |
| 2026-07-03T12:47:24-06:00 | Report blocked source details only for requested sources that the gate rejects. | Unrequested sources are not route blockers; showing them as blocked would make later UI noisy and misleading. | Route results can focus on meaningful blocked reasons such as no access and sensitivity mismatch. |
| 2026-07-03T14:08:55-06:00 | Keep route candidates score-free instead of reusing `RouteOption` with placeholder scores. | Chunk Five must generate route plans before weighted scoring exists; placeholder numeric scores would blur the product boundary and make tests assert fake precision. | Chunk Six can score candidates deliberately and convert or map them into scored route options when recommendation selection is implemented. |
