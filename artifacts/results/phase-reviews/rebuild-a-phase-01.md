# Phase review — rebuild-a / Phase 1: Foundation

Model: gpt-5.6-terra-high  
Runner: spawn  
Arm: rebuild-a  
Phase: 1  
Review date: 2026-07-15

## Meta

- Model (orchestrator-assigned): gpt-5.6-terra-high
- Arm reviewed: rebuild-a
- Phase number: 1
- Diff / files touched this phase: no Git commands were run by this reviewer. Review evidence came from the current `rebuild-a` Phase 1 files, migration/seed output, tests, build, and a local smoke test.

## Proof-of-read

### `results/PHASE-REVIEW-RUBRIC.md`
- Defines the required meta block, proof-of-read, thirteen review checks, findings list, and six aggregate scores.
- Requires every rubric item to have evidence or an explicit N/A reason.
- Requires assessment of inventory coverage, runtime verification, rules, plan fidelity, security, and code quality.

### `rebuild-a/PHASE-PLAN.md`
- Assigns D1–D17, C1–C12, E3, E4, the seed base, and the listed Phase 1 fixes to Foundation.
- Requires a seeded app on port 3101, both public compute APIs, the core tests, and typecheck.
- Assigns F-CORE3 to Phase 2, even though C9’s inventory description calls for its one-time migration.

### `rebuild-a/STATUS.md`
- Claims all Phase 1 schema, core, and public API IDs; it reports 14 test files / 132 passing tests and a green build.
- Describes the seeded demo org and expected public API responses, including unknown-org 404 behavior.
- Explicitly defers C11 screen-heartbeat behavior to Phase 8 and identifies Phase 2 as the next task.

### `rebuild-a/DECISION-LOG.md`
- Records the Next.js, Drizzle/libSQL, kosher-zmanim, and Luxon choices as preserving the tested core behavior.
- States that the core/schema were harvested from the parent implementation and that public APIs intentionally precede Clerk auth.
- Explains the no-index CodeGraph decision for the empty/read-only-reference setup.

### `inventory/FEATURE-INVENTORY.md`
- Defines D1–D17 as 17 data models, C1–C12 as the preserved core contract, and E3/E4 as public computed APIs.
- C9 requires a one-time `assignedStyleId` migration; C11 includes screen heartbeat, plan limits, date utilities, and cache.
- C12 specifies protocol contracts plus SyncServer and SyncClient; F-API3 requires calendar flags to come from C7.

### `rebuild-a/.cursor/rules/`
- `workflow` requires observable expectations before work, running-app verification, and gate discipline.
- `ponytail` and `clean-code` require the smallest complete change, no speculative abstractions, clear naming, and consistent patterns.
- `codegraph` allows fallback when no index is available; `git-discipline` prohibits contestant Git activity in this experiment.

### `rebuild-a` Phase 1 source (`app/`, `src/`, `package.json`, `drizzle/`)
- The Next App Router root page and E3/E4 route handlers load the seeded organization and call the core engines.
- `src/db/schema.ts`, migrations, client, JSON validation, and seed script provide the database foundation; the seed completed successfully.
- Core modules and fourteen Vitest files cover calculation, calendar, schedule, cache, board snapshot, and sync-conflict behavior.
- Package scripts ran migration, seed, typecheck, Vitest, development server, and production build successfully during this review.

## Checklist

### 1. Inventory coverage

| Claimed IDs | Status | Evidence |
|---|---|---|
| D1–D17 | PARTIAL | `schema.ts` documents mappings for D1–D17 and migrations applied cleanly. It contains 18 `sqliteTable` declarations, while its header and the plan call this a 17-table schema; `syncDevices` is not mapped to an inventory ID. |
| C1 | PRESENT | `zmanim-engine.ts`, refraction and Maaseh Nisim support are covered by the engine/refraction/Maaseh test files; seeded E3 returned 200. |
| C2–C3 | PRESENT | `zman-types.ts` defines 32 types, including Tukachinsky candle lighting and havdalah, plus the authority/default-opinion model. |
| C4–C6 | PRESENT | Refraction, Maaseh Nisim, Tukachinsky tables/profile/notes exist with dedicated tests; the profile/table behavior is covered by passing tests. |
| C7 | PRESENT | `calendar-engine.ts` backs E4; the live seeded response returned C7-derived calendar and tefilah information. |
| C8 | PRESENT | `scheduler.ts` has a 24-test suite; its Luxon-based time-zone behavior is part of the core implementation. |
| C9 | PARTIAL | The style engine resolves legacy `assignedStyleId` values in memory, but no one-time database migration for F-CORE3 exists; the plan defers it to Phase 2. |
| C10 | PRESENT | `DEFAULT_SCHEDULE_GROUPS` has 35 bilingual groups; the demo seed intentionally creates one org-level schedule group. |
| C11 | PARTIAL | Shared calendar utilities, cache, and breakpoint-aware style resolution are present. Required screen heartbeat and plan-limit support are absent from the Phase 1 source. |
| C12 | PARTIAL | `sync/protocol.ts` and `sync/conflicts.ts` define contracts and conflict strategies, but no SyncServer or polling SyncClient is present. |
| E3 | PRESENT | `GET /api/zmanim?org=demo` and a date override both returned 200; an unknown org returned 404. |
| E4 | PRESENT | `GET /api/calendar?org=demo` returned 200 from `CalendarEngine`, not a static response. |
| F-DB-DRIFT, F-DUP-DATEMATH, F-CORE-TZ, F-CORE1, F-CORE2, F-C2-TUK, F-API3 | PRESENT | Typed schema/migrations, shared date utilities, Luxon scheduler behavior, Tukachinsky profile/table support, 32 types, and live engine-derived calendar output substantiate these fixes. |
| F-CORE3 | PARTIAL | Runtime legacy fallback exists, but the inventory requires a one-time persisted migration and the plan assigns that work to Phase 2. |

### 2. Running app

PRESENT. On port 3101 after `npm run db:migrate` and `npm run db:seed`, the reviewer verified:

- `GET /` → 200
- `GET /api/zmanim?org=demo` → 200
- `GET /api/calendar?org=demo` → 200
- `GET /api/zmanim?org=demo&date=2026-09-12` → 200
- `GET /api/zmanim?org=nope` → 404

The server was stopped after the smoke test. The same run passed `npm run typecheck`, `npm test` (14 files, 132 tests), and `npm run build`.

### 3. No stubs

PRESENT for the Phase 1 public surface. The root page and both claimed APIs returned live seeded/engine-backed results. No Phase 1 buttons or handlers were found that claim a completed interaction without implementation. C11/C12 omissions are missing scope, not hidden placeholder behavior.

### 4. Rule: ponytail

PRESENT. The stack uses existing ecosystem components for the stated needs and keeps Phase 1 limited to schema, engine, seed data, and two compute endpoints. The extra unmapped `syncDevices` table should be justified or removed; it weakens the claimed 17-model boundary.

### 5. Rule: clean-code

PARTIAL. The schema is centrally typed and tests are focused by module; routes use the same org-context loading pattern. The inventory-contract gaps in C9, C11, and C12, plus the 17-versus-18 table mismatch, prevent a full pass.

### 6. Rule: workflow

PARTIAL. Runtime evidence, typecheck, tests, and build are concrete and reproducible. No `.scratch/phase-plan.md` exists, so the mandatory pre-build EXPECTED blocks and per-item post-build evidence are not available; STATUS is useful after-the-fact evidence but does not replace that artifact.

### 7. Rule: codegraph

PRESENT. The decision log records no local index and an intentionally read-only reference tree, matching the documented fallback condition. No contrary structural-lookup evidence was found in the review material.

### 8. Rule: git-discipline

PRESENT. No Git activity was performed by this reviewer, and no evidence in the supplied Phase 1 status/decision records shows contestant Git activity.

### 9. Todos / PHASE-PLAN fidelity

PARTIAL. The schema, seed base, core calculations, public APIs, and required verification are implemented. The plan claims all C1–C12 in Phase 1, but C9’s migration, C11’s heartbeat/plan support, and C12’s server/client are incomplete or deferred.

### 10. Context retention

PARTIAL. The build retains the inventory’s preserved calculation stack and the Phase 1/2 ordering. It conflicts with the Phase 1 claim by deferring pieces embedded in the C9, C11, and C12 inventory contracts, and it does not reconcile the declared 17-model schema with 18 tables.

### 11. Security

PRESENT. E3/E4 are intentionally public inventory endpoints; org lookup rejects an unknown slug with 404. No secrets were exposed in the reviewed source or command output, and the pre-auth public scope matches the decision log. Full authenticated-route review belongs to later phases.

### 12. Code quality

Score: **8/10**. The typed schema, engine modules, focused tests, seeded verification, and production build provide a solid foundation. The unfulfilled core-contract parts and schema count inconsistency need resolution before treating every C1–C12 claim as complete.

### 13. Findings

1. **C12 is incomplete:** protocol/conflict types exist, but the inventory also requires SyncServer and polling SyncClient; neither is in the Phase 1 source.
2. **C11 is incomplete:** date utilities/cache and style resolution exist, but screen heartbeat and plan-limit support are absent.
3. **C9/F-CORE3 is deferred despite the C9 claim:** read-time legacy conversion is not the required one-time database migration.
4. **The schema’s scope is internally inconsistent:** `schema.ts` says 17 tables/D1–D17, while it declares 18 tables and STATUS calls out `syncDevices`; map or justify the extra table.
5. **Workflow evidence is incomplete:** the required `.scratch/phase-plan.md` expectation artifact is absent, leaving only post-build STATUS evidence.

## Scores

- inventory_coverage: 7
- rule_adherence: 8
- plan_fidelity: 7
- context_retention: 8
- security: 9
- code_quality: 8
