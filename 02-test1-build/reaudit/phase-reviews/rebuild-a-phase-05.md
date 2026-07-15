# Phase review — rebuild-a, Phase 5 (Schedules admin)

Header: Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 5 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 5
- Diff / files touched this phase: `a-p05.patch` is a stub ("PHASE 1 - no previous phase"), so evidence comes from the snapshot tree at `snapshots/a/p05`. Phase-5 surface = `src/admin/schedules/{ScheduleEditor.tsx, ScheduleRuleEditor.tsx, types.ts}`, `app/admin/[orgSlug]/schedules/page.tsx`, `app/api/org/[orgId]/schedules/{route,[id]/route,bulk/route}.ts`, `app/api/org/[orgId]/groups/{route,[id]/route}.ts`, plus seed rows.

## Proof-of-read
- **REAUDIT-INSTRUCTIONS.md**: I am the single third-party reviewer; rate this phase only against STATUS/PHASE-PLAN claims + snapshot/diff evidence; running-app optional, say N/A if not run; do not guess contestant model.
- **PHASE-REVIEW-RUBRIC.md**: fill every checklist item with evidence or N/A+why; six numeric scores 1–10; numbered findings or `zero findings`.
- **FEATURE-INVENTORY.md**: P4.1–P4.8 define the schedules section (grouped list, full D11 add/edit, row actions, reorder, group manager, bulk copy/move/delete, spacer rows, tri-state visibility + accordion + groups sidebar); E8 schedules CRUD, E15 groups CRUD; F3 no orphan `ScheduleForm`/`ScheduleListTable`, F4 one canonical rule editor.
- **snapshots/a/p05/PHASE-PLAN.md**: Phase 5 claims P4.1–P4.8, E8, E15, F3, F4. DECISION-LOG records single `ScheduleEditor` + shared `ScheduleRuleEditor`; placeholder via `type:"placeholder"`; tri-state in `details.rowVisibility`.
- **snapshots/a/p05/STATUS.md**: lists each P4.x + E8/E15 + F3/F4 as claimed; walked verification (route 200, 3 seeded schedules, 2 groups, spacer POST 201, PATCH rowVisibility, bulk_move, reorder, duplicate→5, typecheck clean, build green, 16 test files / 154 cases). Dev server stopped.
- **snapshots/a/p05/DECISION-LOG.md**: F3/F4 shape, placeholder/tri-state, plus prior-phase decisions carried forward (F1 real route shells, F2 client org switch, AUTH_MODE=session). No git, no codegraph index.
- **a-p05.patch**: stub, no per-phase diff available. Static evidence from snapshot tree used instead.
- **Snapshot spot-checks**: read `ScheduleEditor.tsx` (849 ln), `ScheduleRuleEditor.tsx` (373 ln), `types.ts`, all five schedule/group route handlers, the schedules admin page, `auth/guards.ts`, and `db/seed.ts` schedules/groups block.

## Checklist

1. **Inventory coverage** — P4.1 PRESENT (`byType` accordion grouped by `SCHEDULE_TYPES`, rows show name/HE, `formatTimeLabel`, room, `maskLabel` days, group tags, active toggle). P4.2 PRESENT (form: base zman | fixed time mutually exclusive, offset, earliest/latest, roundTo+roundDirection, day mask toggles, room, group multi-select, advanced details: duration, nearest-event window, refresh, hideIfMinMax, placeholder, displayOffset, visibility rules via `ScheduleRuleEditor`). P4.3 PRESENT (Edit/Dup/Active/Del row actions). P4.4 PRESENT (HTML5 drag reorder → `bulk {action:"reorder", orderedIds}`; also a reorder path in the bulk route). P4.5 PRESENT (groups sidebar: list with counts, active toggle, create with name/HE/color; `groups/[id]` PATCH/DELETE). P4.6 PRESENT (checkbox select set → bulk_copy / bulk_move / bulk_delete to chosen group). P4.7 PRESENT (`type:"placeholder"` + `details.isPlaceholder`, "Add spacer" button, `formatTimeLabel` renders "— spacer —"). P4.8 PRESENT (tri-state `inherit/show/hide` buttons mapping to `details.rowVisibility`, type accordion, always-visible groups sidebar). E8 PRESENT (`schedules` GET/POST, `[id]` PATCH/DELETE, `/bulk` POST). E15 PRESENT (`groups` GET/POST, `[id]` PATCH/DELETE). F3 PRESENT (no `ScheduleForm`/`ScheduleListTable` files; only mentioned in comments as "do not recreate"). F4 PRESENT (one `ScheduleRuleEditor` with all 10 rule types + all/any combine).

2. **Running app** — N/A. Snapshot has no `node_modules`; orchestrator instructions allow static-only. Evidence taken from STATUS walk + code/seed inspection. Seed confirms the claimed fixtures: `Weekday` + `Shabbat` groups and 3 schedules (Shacharit HANETZ, Mincha 13:30, Maariv TZAIS) — matches STATUS's "3 seeded rows" / "Weekday + Shabbat".

3. **No stubs** — No dead buttons or "coming soon" handlers. Every row action and bulk action calls a real endpoint. `confirm()` guards delete/bulk_delete. `duplicate` POSTs a real copy. The "Add spacer" path is a real `placeholder` insert, not a placeholder-of-code.

4. **Rule: ponytail** — Single module under `src/admin/schedules/`, no forked editors, no abstractions-for-later. Shared `CSSProperties` consts (`card`, `btn`, `input`, `lab`, `tinyBtn`) reused across the file. `ScheduleRuleEditor` is reused (rule of 2 will hold once content/editor phases land — already 1 site + explicit plan to reuse). No new deps. Shortest-working-diff posture visible. One mild stretch: `serialize()` is duplicated verbatim between `schedules/route.ts` and `schedules/[id]/route.ts` (rule of 2 reached but not extracted — ponytail allows leaving stable dup, so acceptable).

5. **Rule: clean-code** — Naming clear (`openCreate`, `onDropReorder`, `setVisibility`, `bulk`); `bulk` is borderline vague but disambiguated by its `action` param. Boolean-ish names present (`isActive`). One error-handling pattern across all routes (`AuthError` → JSON `{error}` with status; non-auth errors rethrow). One data-fetch pattern (`fetch` + `load()`). Inline styles via CSS vars (`--admin-*`) consistent with the arm's theme system. `ScheduleEditor.tsx` is 849 lines — above the 500-line god-file threshold and mixes list + form + bulk + group sidebar. Minor: a candidate to split form/sidebar when Phase 7 lands, but for a single admin section it is cohesive, not multi-concern sprawl.

6. **Rule: workflow** — STATUS carries an expectation + walked-verification block with evidence (route 200, API counts, POST 201, PATCH ok, bulk/reorder/duplicate, typecheck/build green). DECISION-LOG records F3/F4 shape + placeholder/tri-state as reversible DECIDED. No speculative product inventing — every choice maps to an inventory ID or a listed F-fix. Stop-before-Phase-6 respected.

7. **Rule: codegraph** — N/A. No `.codegraph/` in this workspace; DECISION-LOG logs the skip. Read/dir fallback used appropriately.

8. **Rule: git-discipline** — Contestant did not git (N/A — orchestrator commits). No `.git` activity in the snapshot. Compliant.

9. **Todos / PHASE-PLAN fidelity** — PHASE-PLAN Phase 5 lists P4.1–P4.8, E8, E15, F3, F4. STATUS claims exactly those. Code implements all of them. F3 honored (no orphan files created). F4 honored (single `ScheduleRuleEditor`). No scope creep into Phase 6 (content) or Phase 7 (editor).

10. **Context retention** — Built on prior phases without contradiction: reuses `/admin/[orgSlug]` real-route shell from the F1 decision, `requireOrgRole` guard from Phase 3 auth, `minyanSchedules`/`scheduleGroups` schema from Phase 1, theme CSS vars from Phase 4. No dropped prior work. `ScheduleRuleEditor` imports the Phase-1 `ScheduleRule` type from `@/core/scheduler`, keeping one rule shape.

11. **Security** — `requireOrgRole(orgId, ...)` derives `orgId` from the route param and checks it against session-derived memberships (`guards.ts`), not the body — server-side role/ownership correct. All writes are `and(eq(id,...), eq(orgId, orgId))` scoped — no cross-org read/write. Group DELETE requires `admin` (stricter than editor) — good. **Gap:** in `schedules/bulk` `bulk_move`/`bulk_copy`, `body.groupId` is taken from the client and written into `scheduleGroupIds` without verifying the group belongs to `orgId`. An editor could attach schedules to a foreign/foreign-org group id (or a non-existent one), creating dangling references. Not a privilege escalation (still scoped to own org's schedules) but a data-integrity / trust-boundary hole. Also `autoActivationRules` on group POST is accepted from the body unvalidated structurally (typed only) — low risk since editor role already granted.

12. **Code quality** — 7/10 → scored 8. Cohesive module, real end-to-end wiring, consistent patterns, observable evidence. Deductions: duplicated `serialize`, `ScheduleEditor.tsx` over 500 lines, no schedule-specific tests, unvalidated `groupId` in bulk ops. Net solid craft.

13. **Findings**
1. (Security/data-integrity, minor) `schedules/bulk` `bulk_move`/`bulk_copy` trust client-supplied `groupId` without confirming it belongs to `orgId`; can create cross-org/dangling group references. Fix: select the group `where(eq(scheduleGroups.id, groupId), eq(scheduleGroups.orgId, orgId))` and 404/400 if absent before writing.
2. (Clean-code, minor) `serialize()` duplicated between `schedules/route.ts` and `schedules/[id]/route.ts`. Rule of 2 reached — extract to a shared helper in `src/admin/schedules/types.ts` or a `serialize.ts`.
3. (God-file, minor) `ScheduleEditor.tsx` is 849 lines mixing list, form, bulk bar, and group sidebar. Cohesive today, but split the form (`ScheduleForm`) and/or group sidebar before Phase 7 adds the editor reusing `ScheduleRuleEditor`.
4. (Testing, minor) No `schedules.test.ts` / `groups.test.ts` added; all 16 test files are core/auth/widgets. New API behavior (reorder, bulk_copy adding to existing group set, placeholder `isPlaceholder` injection) is unverified by a test. testing-protocol is on-demand (not in the 6 always-on rules), so soft, but worth noting.

## Scores
- inventory_coverage: 9
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 7
- code_quality: 8
