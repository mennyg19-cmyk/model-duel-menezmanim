Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 4 | Reaudit: true

# Phase review — rebuild-b Phase 4 (Schedules and groups)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 4
- Diff / files touched this phase: `b-p04.patch` is a placeholder ("see snapshot tree"); reviewed the snapshot tree directly. Phase-4-relevant files: `app/admin/schedules/page.tsx`, `app/admin/schedules/schedule-workspace.tsx`, `app/api/org/[orgId]/schedules/route.ts`, `app/api/org/[orgId]/groups/route.ts`, `src/domain/schedules.ts`, `src/domain/groups.ts`, `src/domain/schedule-details.ts`, `prisma/seed.ts` (demo schedules + spacer), plus shared `src/domain/org-access.ts`, `src/domain/mobile-data.ts` reused from Phase 3.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, glm-5.2-high for all reviews, do not guess contestant model; phase review uses the rubric checklist + scores, focus on this phase only, running-app verification optional (snapshots have no node_modules) — say N/A if not run.
- `PHASE-REVIEW-RUBRIC.md`: fill every checklist item with evidence or N/A + why; record 1–10 scores for inventory_coverage, rule_adherence, plan_fidelity, context_retention, security, code_quality.
- `FEATURE-INVENTORY.md` (Phase 4 IDs): P4 / P4.1–P4.8 cover list-by-type, full D11 edit, row actions, reorder, group manager, bulk copy/move/delete, placeholders, tri-state visibility + compact sidebar; E8 = role-guarded `/api/org/[orgId]/schedules` CRUD; E15 = `/api/org/[orgId]/groups` CRUD; F3 = no orphan `ScheduleForm`/`ScheduleListTable`, one workspace only.
- `snapshots/b/p04/PHASE-PLAN.md`: Phase 4 = schedules/groups only; done = admin can create, compute, group, reorder, duplicate, bulk-move, delete seeded schedules with persisted results; Phase 5+ untouched.
- `snapshots/b/p04/STATUS.md`: claims Phase 4 complete; lists role-guarded schedule+group APIs, `/admin/schedules?org=demo` workspace, computed times, advanced fields in `details` JSON, seed = 4 minyanim + 1 spacer + 35 groups; verification evidence block (typecheck, build, live login → 200, GET 5 rows + 35 groups, create→duplicate→reorder→bulk-move→PUT dynamic MINCHA_GEDOLAH → computedTime=13:30, custom group create/delete, unauthenticated GET → 401, server stopped).
- `snapshots/b/p04/DECISION-LOG.md`: Phase 4 judgments logged — one ScheduleWorkspace (F3), advanced fields in `details` JSON, bulk ops via POST action on E8.
- `b-p04.patch`: placeholder only; no diff content. Reviewed snapshot tree instead.

## Checklist

1. **Inventory coverage** — Claimed: `P4`, `P4.1–P4.8`, `E8`, `E15`, `F3`.
   - P4.1 (list grouped by type, name+HE, computed/fixed time, room, days mask, group tags, active toggle): **PRESENT** — `schedule-workspace.tsx` groups by type via `typeOrder`, renders name/hebrewName/computedTime/fixedTime/baseZman, room, day mask, group tags, active checkbox.
   - P4.2 (add/edit every D11 field incl. advanced `details`): **PRESENT** — editor exposes base zman OR fixed time, offset, earliest/latest, roundTo + roundMode, day mask, room, group multi-select, refreshMode, refreshAnchorDay, durationMinutes, displayOffset, hideIfMinMaxReached, nearestEvent + before/after, priority, visibilityRules. `ScheduleDetails` type matches the inventory's advanced field list.
   - P4.3 (row actions edit/duplicate/delete/activate): **PRESENT** — duplicate (⎘), delete (⌫), active toggle (live PUT), inline editor.
   - P4.4 (reorder sortOrder, drag): **PARTIAL** — up/down arrow reorder via POST `reorder` works; drag not implemented. Functional but not the full spec.
   - P4.5 (group manager: color, HE/EN names, active, counts): **PRESENT** — sidebar create/edit (name/hebrewName/color), toggle active, delete (built-in protected), `scheduleCount` shown.
   - P4.6 (bulk copy/move/delete): **PRESENT** — bulk select + `bulk-move`/`bulk-copy`/`bulk-delete` actions; move supports "None" (ungroup).
   - P4.7 (placeholder/spacer rows): **PRESENT** — `isPlaceholder` detail, "Add spacer" button, spacer renders label only, skipped in computed-time path.
   - P4.8 (tri-state visibility + compact accordion + always-visible groups sidebar): **PRESENT** — 14 VIS_CONDITIONS rendered as —/✓/✗ cycling buttons; accordion expand; groups sidebar always visible.
   - E8 (role-guarded schedules CRUD): **PRESENT** — GET/POST(action)/PUT/DELETE, all gated by `requireOrgMember(orgId, {write:true})` for writes.
   - E15 (groups CRUD): **PRESENT** — GET/POST/PUT(single + array replace)/DELETE, write-gated; built-in delete protected.
   - F3 (no orphan ScheduleForm/ScheduleListTable): **PRESENT** — single `ScheduleWorkspace` component; no competing form/list modules in the tree.

2. **Running app** — **N/A**. Static snapshot, no `node_modules`. Could not boot port 3102. Relied on `STATUS.md` evidence block (typecheck, build, live 200, 5 rows/35 groups, create→duplicate→reorder→bulk-move→PUT→computedTime=13:30, 401 unauth). Not independently re-verified.

3. **No stubs** — No dead buttons, no "coming soon", no empty handlers. Every button calls `api()`/`groupApi()`; spacer and visibility toggles persist via PUT. Clean.

4. **Rule: ponytail** — Good. One workspace (F3) instead of orphan modules; action-based POST on E8 avoids inventing extra routes (logged decision); `details` JSON bag matches the schema's intentional JSON column. Shortest-working-diff posture visible. Minor: `schedule-workspace.tsx` is 925 lines — single concern (admin workspace UI) so acceptable under clean-code's "split by concern, not line count", but at the edge.

5. **Rule: clean-code** — Mostly good. Naming is descriptive (`bulkSetGroup`, `resolveScheduleTime`, `rulesToTriMap`). Errors carry message + status. One pattern per concern (single fetch wrapper, single DTO shape). **Finding:** `schedule-workspace.tsx` redeclares `TriState` and `ScheduleDetails` types locally instead of importing from `src/domain/schedule-details.ts` — drift risk if the domain type evolves. Rule of 2 would justify sharing.

6. **Rule: workflow** — Expectation/verify discipline visible: PHASE-PLAN, STATUS with observable evidence (routes, counts, computed time, 401), DECISION-LOG entries for the three Phase-4 judgment calls. No speculative product inventing; scope held to P4 IDs.

7. **Rule: codegraph** — N/A for this static snapshot review; no structural lookups performed. (Snapshot has `.codegraph/` but reviewer did not run CLI.)

8. **Rule: git-discipline** — Contestant did NOT git. STATUS and DECISION-LOG both state the orchestrator owns commits. No git artifacts in the patch/tree. Clean.

9. **Todos / PHASE-PLAN fidelity** — Plan said: schedule+group CRUD, computed/fixed times, all advanced detail fields, tri-state, reorder, duplicate, bulk, placeholders, compact group-aware workspace. All delivered. Reorder via arrows (not drag) is the only gap from the literal plan text.

10. **Context retention** — Builds correctly on Phase 2 (`requireOrgMember`, `getSessionUser`, flat `/api/me`) and Phase 3 (`resolveScheduleTime`, `ZmanimEngine`, `formatZmanTime`, `buildZmanimConfig`). No contradictions, no dropped prior work. Seed extends the existing demo org rather than replacing it.

11. **Security** — `requireOrgMember` verifies session, resolves org by id OR slug server-side, checks membership, enforces WRITE_ROLES (owner/admin/editor) on writes, super-admin bypass is explicit. All downstream DB ops use the resolved `access.orgId`, so no cross-org leak. Bulk ops filter by `orgId`. No secrets in tree; `.env.example` present. **Minor:** POST/PUT accept `details: body.details as never` — unvalidated JSON bag from client. Acceptable given `details` is an intentional JSON column and `parseDetails` falls back gracefully, but no shape guard.

12. **Code quality** — **8/10.** Clean, functional, well-organized domain layer; route handlers are thin and consistent; UI is dense but cohesive. Held back by: local type duplication, 925-line workspace file, hardcoded `ZMAN_OPTIONS` (13 entries) that omit the Phase-3 Tukachinsky variants — schedules depending on `CANDLE_LIGHTING_TUKACHINSKY`/`HAVDALAH_TUKACHINSKY`/etc. cannot be created from the UI even though the engine supports them.

## Findings
1. **P4.4 drag reorder missing.** Up/down arrow reorder works (POST `reorder`), but the inventory spec calls for drag. Functional, not full-spec.
2. **Type duplication.** `schedule-workspace.tsx` redeclares `TriState`/`ScheduleDetails` locally instead of importing from `src/domain/schedule-details.ts` — drift risk.
3. **Base-zman picker omits Tukachinsky variants.** `ZMAN_OPTIONS` in the workspace lists 13 zmanim; Phase 3 added Tuk variants to reach 32 (CANDLE_LIGHTING_TUKACHINSKY, HAVDALAH_TUKACHINSKY, etc.). The schedule editor's "Base zman" dropdown cannot select them, so dynamic schedules against Tuk base zmanim are not creatable from the UI. Engine supports them; UI does not surface them.
4. **`details` JSON bag unvalidated on write.** POST/PUT cast client `details` as `never` with no schema check. Low risk (org-scoped writer, parseDetails fallback), but no guard against malformed shapes.

## Scores (1–10)
- inventory_coverage: 9
- rule_adherence: 9
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
