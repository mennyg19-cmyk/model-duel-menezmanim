# Phase review — rebuild-a Phase 5: Schedules admin

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 5

## Proof-of-read

### `results/PHASE-REVIEW-RUBRIC.md`
- Requires evidence or N/A for all 13 checklist items.
- Requires explicit coverage, running-app, rule, security, and finding reviews.
- Requires six 1–10 aggregation scores at the end.

### `rebuild-a/PHASE-PLAN.md` — Phase 5
- Claims P4.1–P4.8, E8, E15, F3, and F4.
- Scope is the schedules/minyanim admin, its schedules and groups APIs, and the canonical rule editor.
- It explicitly bans recreating `ScheduleForm` and `ScheduleListTable`.

### `rebuild-a/STATUS.md`
- Declares Phase 5 complete and lists the claimed controls and routes.
- Records seeded-data HTTP checks, bulk operations, a placeholder, and a tri-state update.
- Claims typecheck, tests, and build passed; Phase 6 is not started.

### `rebuild-a/DECISION-LOG.md`
- Sets `ScheduleEditor` and `ScheduleRuleEditor` as the Phase 5 module shape.
- Defines placeholder rows as `type: "placeholder"` with `details.isPlaceholder`.
- Defines the tri-state as `details.rowVisibility`: `inherit`, `show`, or `hide`.

### `inventory/FEATURE-INVENTORY.md` — P4.*, E8, E15, F3, F4
- P4 requires every D11 field, group-manager CRUD, bulk actions, spacers, and compact grouped rows.
- E8 and E15 require role-guarded CRUD for schedules and groups.
- F3 removes the orphan schedule files; F4 requires one canonical visibility-rule editor.

### `rebuild-a/.cursor/rules/`
- Workflow requires observable expectation evidence and running-app verification for a phase.
- Ponytail and clean-code require the smallest complete design and split god files over 500 lines.
- Git discipline is intentionally N/A to contestants; CodeGraph was uninitialized.

### Phase 5 code and commit `589a3e2`
- Reviewed all five E8/E15 route handlers, schedules page, `ScheduleEditor`, `ScheduleRuleEditor`, types, seed, and supporting diff.
- `ScheduleEditor` is 848 lines; `ScheduleRuleEditor` is 372 lines.
- `npm run typecheck` and `npm test` passed locally: 16 files, 154 tests.

## Meta
- Arm reviewed: rebuild-a
- Phase number: 5 — Schedules admin
- Diff/files touched this phase: 16 files in commit `589a3e2`, including five E8/E15 handlers, the schedules page, editor/rule-editor/types, seed data, navigation, STATUS, DECISION-LOG, and run state.
- Reviewer scope: no application files changed. The review report is the only created file.

## Checklist

1. **Inventory coverage — PARTIAL**
   - **P4.1:** PRESENT. The page groups rows by type, renders the required row information, and exposes active state.
   - **P4.2:** PARTIAL. The form handles most D11 fields and visibility rules, but omits `details.refreshBasis` and `details.refreshAnchor`; it also does not enforce exactly one of `baseZman` or `fixedTime`.
   - **P4.3:** PRESENT. Edit, duplicate, delete, and activate/deactivate paths exist.
   - **P4.4:** PRESENT. Native drag/drop sends the ordered IDs to the bulk reorder route.
   - **P4.5:** PARTIAL. E15 exposes API CRUD, but the visible sidebar only creates groups and toggles active state. It has no rename, Hebrew-name edit, color edit, or delete control.
   - **P4.6:** PRESENT. Selection, bulk copy, bulk move, and bulk delete are wired to `/schedules/bulk`.
   - **P4.7:** PRESENT. Spacer creation writes `type: "placeholder"` and `details.isPlaceholder`.
   - **P4.8:** PRESENT. Type accordion, permanent sidebar, and `inherit`/`show`/`hide` buttons are present.
   - **E8/E15:** PARTIAL. The CRUD handlers have role guards and org-scoped schedule/group row lookups, but bulk group references are not validated against the org.
   - **F3/F4:** PRESENT. No `ScheduleForm` or `ScheduleListTable` files exist; one `ScheduleRuleEditor` exists in the rebuild tree.

2. **Running app — NOT independently verified**
   - I did not start or alter the app/seed database because the reviewer scope permits only the report file to be created or overwritten.
   - STATUS records a 3101 run and API checks, then says the server was stopped. This is contestant evidence, not independent reviewer evidence.
   - Independent static checks passed: `npm run typecheck`; `npm test` with 16 passing files and 154 passing tests.

3. **No stubs — PARTIAL**
   - Schedule actions and API calls are implemented; I found no “coming soon” UI.
   - The group PATCH and DELETE APIs are effectively unreachable from the schedules UI, so the claimed group manager is incomplete rather than a complete user-facing CRUD flow.

4. **Rule: ponytail — PARTIAL**
   - No new dependency was introduced, F3 is respected, and F4 uses one visible rule-editor implementation.
   - The 848-line `ScheduleEditor` combines loading, groups, bulk actions, row rendering, drag logic, and the form. This exceeds the project’s 500-line split threshold.

5. **Rule: clean-code — PARTIAL**
   - Naming is generally clear and authorization handling is consistent.
   - `ScheduleEditor` is a god file. The schedule `serialize` mapping is also duplicated between collection and item routes.
   - Route bodies are TypeScript-cast but not runtime-validated. Invalid D11 data can enter through E8.

6. **Rule: workflow — PARTIAL**
   - STATUS records feature-level evidence and Phase 6 remains unstarted, matching gate discipline.
   - `.scratch/phase-plan.md` is absent, so there is no independently reviewable pre-build EXPECTED checklist or item-by-item completion evidence.

7. **Rule: codegraph — N/A with note**
   - `codegraph status` reported the target project is not initialized.
   - I did not initialize it because this review may only write the specified report file.

8. **Rule: git-discipline — PASS**
   - The phase is represented by orchestrator commit `589a3e2`.
   - Current uncommitted changes are under rebuild-b, not rebuild-a. No contestant git activity is evidenced.

9. **Todos / PHASE-PLAN fidelity — PARTIAL**
   - The commit targets the planned Phase 5 routes, APIs, seed data, and canonical editor.
   - The P4.2 “every D11 field” claim and P4.5 group CRUD claim are not fully delivered in the visible admin flow.

10. **Context retention — PASS**
   - Placeholder and tri-state storage match the Phase 5 DECISION-LOG decisions.
   - The route remains inside the Phase 4 admin shell and no Phase 6 work is claimed.

11. **Security — PARTIAL**
   - E8/E15 consistently call `requireOrgRole`; item routes additionally scope database mutations by `orgId`.
   - `/schedules/bulk` accepts `groupId` without proving that group belongs to `orgId`, allowing a known foreign group ID to be stored on this org’s schedule.
   - Deleting a group leaves its ID in `scheduleGroupIds`, creating dangling references. Request payloads also lack runtime schema validation.

12. **Code quality — 6/10**
   - The feature is substantially implemented and typechecks, but group CRUD is incomplete, validation/data integrity gaps are real, and the primary editor is too large for the project’s stated rule.
   - No Phase 5-specific tests were added; the 154 passing tests cover existing core/auth/widget behavior, not schedules/groups APIs or UI behavior.

13. **Findings**
   1. **High — P4.5 is not CRUD-complete in the UI.** `ScheduleEditor` only creates a group and toggles active state; it has no rename, Hebrew-name, color, or delete controls despite E15 supporting PATCH/DELETE.
   2. **High — bulk group assignment lacks tenant and referential validation.** `/api/org/[orgId]/schedules/bulk` stores any supplied `groupId` without checking that the group exists in the same org. E15 DELETE also leaves stale group IDs in schedules.
   3. **Medium — P4.2 omits D11 detail controls and permits invalid time configuration.** `refreshBasis` and `refreshAnchor` are not editable, while a schedule can be saved with neither or both of `baseZman` and `fixedTime`.
   4. **Medium — `ScheduleEditor.tsx` violates the >500-line god-file rule.** It is 848 lines and mixes multiple distinct UI concerns.
   5. **Medium — Phase 5 has no targeted automated tests.** The passing suite does not exercise E8, E15, bulk behavior, or the schedules UI.

## Scores (1–10 each, for orchestrator aggregation)
- inventory_coverage: 7
- rule_adherence: 6
- plan_fidelity: 7
- context_retention: 9
- security: 7
- code_quality: 6
