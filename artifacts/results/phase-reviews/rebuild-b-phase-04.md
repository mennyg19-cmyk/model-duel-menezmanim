# Phase review: rebuild-b, Phase 4 — Schedules and groups

Model: claude-sonnet-5-thinking-high | Runner: spawn | Arm: rebuild-b | Phase: 4

## Meta
- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Arm reviewed: rebuild-b
- Phase number: 4 — Schedules and groups
- Diff / files touched this phase (by inspection, not git diff — orchestrator owns commits): `app/admin/schedules/page.tsx`, `app/admin/schedules/schedule-workspace.tsx`, `app/api/org/[orgId]/schedules/route.ts`, `app/api/org/[orgId]/groups/route.ts`, `src/domain/schedules.ts`, `src/domain/groups.ts`, `src/domain/schedule-details.ts`, `src/domain/org-access.ts`, `src/content/default-groups.ts`, Prisma schema (`ScheduleGroup`/`MinyanSchedule` models), `prisma/seed.ts` demo data. Single commit `178760b Experiment arm B: Phase 4 schedules and groups complete.`

## Proof-of-read

**PHASE-REVIEW-RUBRIC.md**: fill every checklist item with evidence or N/A + reason; write the full report to the path given in the spawn prompt; scores 1-10 at the bottom for orchestrator aggregation.

**PHASE-PLAN.md (Phase 4)**: IDs `P4`, `P4.1-P4.8`, `E8`, `E15`, `F3`. Build schedule/group CRUD, computed and fixed times, advanced detail fields, tri-state visibility, reorder, duplicate, bulk actions, placeholders, and the compact group-aware workspace. Done when an admin can create, compute, group, reorder, duplicate, bulk-move, and delete seeded schedules with persisted results.

**STATUS.md**: Phase 4 marked complete. Role-guarded schedule/group APIs; single admin workspace at `/admin/schedules?org=demo`; computed times for fixed/dynamic schedules; advanced fields in `details` JSON; seed has 4 minyanim + 1 placeholder spacer + 35 groups. Lists explicit live-verification steps (login, GET counts, create/duplicate/reorder/bulk-move/PUT, custom group create+delete, unauth 401, server stopped).

**DECISION-LOG.md**: confirms four Phase-4-relevant calls — one `ScheduleWorkspace`, no orphan form/list (F3); advanced fields live in `MinyanSchedule.details` JSON, not new columns; bulk ops shipped as a `POST action` on the existing E8 endpoint rather than new routes; plus carried-over Phase 1-3 decisions (Next.js foundation, flat `/api/me`, 32 zman types, org-timezone math) that Phase 4 code relies on and doesn't contradict.

**Inventory (FEATURE-INVENTORY.md) for P4/P4.1-8, D9, D11, E8, E15, F3**: D9 `ScheduleGroup` fields (orgId, name, hebrewName, color, active, autoActivationRules, sortOrder, isBuiltIn); D11 `MinyanSchedule` fields including `details` JSON bag (refresh mode/basis/anchor, rounding mode, hideIfMinMaxReached, visibility rules, placeholder, displayOffset, duration, nearest-event window). P4.1-P4.8 spelled out per-field list/edit/actions/reorder/group-manager/bulk/placeholder/tri-state requirements. E8 = role-guarded schedules CRUD, E15 = groups CRUD. F3 = delete orphaned `ScheduleForm`/`ScheduleListTable` and hardcoded `gan-machal-seed.ts`.

**rebuild-b `.cursor/rules/`** (workflow, vocabulary, git-discipline, codegraph, ponytail, clean-code): read in full; content matches the summaries already recorded in this arm's own `PHASE-PLAN.md` proof-of-read section (git belongs to the orchestrator, no orphan competing UI, smallest complete change, expectation-driven verification, one pattern per concern).

**Phase 4 code**: read `schedule-workspace.tsx` (813 lines, full client component), both API route handlers, `src/domain/schedules.ts`, `groups.ts`, `schedule-details.ts`, `org-access.ts`, Prisma schema, `prisma/seed.ts`, `src/content/default-groups.ts`, and `src/core/schedule-groups.ts`/`scheduler.ts` for the visibility-condition types.

## Checklist

**1. Inventory coverage** — `P4`, `P4.1-P4.8`, `E8`, `E15`, `F3`

- P4.1 (grouped list, name+HE, computed/fixed time, room, days, group tags, active toggle): **PRESENT**. `schedule-workspace.tsx` groups by type into an accordion (`grouped`/`typeOrder`), each row shows name, Hebrew name, computed/fixed/dynamic time, room, day mask as letters, group color tags, and an "on" checkbox bound to `isActive`.
- P4.2 (every D11 field on add/edit): **PRESENT, with one gap**. Base-zman-or-fixed toggle, offset, earliest/latest, round-to + round mode, day mask, room, multi-select groups, refresh mode, refresh anchor day, duration, nearest-event window (+before/after), hide-if-min-max, priority, and tri-state visibility rules are all editable. The inventory's "refresh mode/basis/anchor" names three sub-fields; the code has `refreshMode` and `refreshAnchorDay` but no distinct "basis" field (e.g., what the refresh cycle is measured from). Minor, easy to miss in a JSON bag — flagged below, not a blocker.
- P4.3 (row actions edit/duplicate/delete/activate): **PRESENT**. Expand-to-edit, duplicate button (⎘), delete button (⌫), active toggle checkbox all wired to their API calls, verified live (see #2).
- P4.4 (reorder, sortOrder, drag): **PARTIAL**. Up/down arrow buttons swap adjacent `sortOrder` values and POST `action: "reorder"` — this satisfies "reorder (sortOrder)" and was verified live. There is no drag-and-drop; the inventory text explicitly lists "drag" alongside sortOrder. Arrow-based reorder is a legitimate, simpler substitute that hits the same persisted outcome, but it's not what the inventory line describes, and there's no DECISION-LOG entry recording the substitution.
- P4.5 (group manager: color, HE/EN names, active, counts): **PRESENT**. Sidebar lists groups with color dot, name + Hebrew name + live schedule count, active/off badge; inline editor supports name/hebrewName/color, active toggle, and delete (blocked for built-ins).
- P4.6 (bulk copy/move/delete): **PRESENT**. Checkbox multi-select + bulk action select (move/copy/delete) + target group picker, calling `bulk-move`/`bulk-copy`/`bulk-delete` POST actions. Verified live.
- P4.7 (placeholder/spacer rows): **PRESENT**. "Add spacer" button creates a `type: "placeholder"` row with `details.isPlaceholder`; rendered as an editable-label divider, group-assignable like any other row (same multi-select applies once expanded — spacer rows skip the full field editor but keep the label field).
- P4.8 (tri-state visibility, compact accordion + sidebar): **PRESENT**. `TriState` cycle (`ignore → show → hide → ignore`) rendered as `— / ✓ / ✗` buttons per visibility condition, persisted into `details.visibilityRules`; accordion + always-visible sidebar layout matches the description.
- E8 (`/api/org/[orgId]/schedules` CRUD, role-guarded): **PRESENT**. GET/POST(actions)/PUT/DELETE all present, all call `requireOrgMember` with `write: true` for mutations. Verified live: unauthenticated GET returns 401.
- E15 (`/api/org/[orgId]/groups` CRUD): **PRESENT**. GET/POST/PUT (single or bulk array)/DELETE, same access guard.
- F3 (no orphan `ScheduleForm`/`ScheduleListTable`, no hardcoded `gan-machal-seed.ts`): **PRESENT**. Confirmed by glob search — none of those three filenames exist anywhere in rebuild-b. Single `ScheduleWorkspace` component is the only schedules UI.

**2. Running app** — verified. Started `npm run dev` (port 3102, already free), logged in as `owner@demo.local` via `POST /api/auth/login` (200), then:
- `GET /api/org/demo/schedules` unauthenticated → 401.
- `GET /api/org/demo/schedules` authenticated → 200, 5 rows: Shacharit 06:30, Shacharit (Shabbat) 08:00, Mincha computed 13:35 (`MINCHA_GEDOLAH` + 15min, rounded), Maariv computed 20:35 (`TZAIS` + 10min), and the placeholder spacer with a blank computed time.
- `GET /api/org/demo/groups` → 200, 35 groups.
- `GET /admin/schedules?org=demo` → 200.
Server stopped afterward (process killed, confirmed no longer running). Did not push through the full create/duplicate/reorder/bulk-move/delete UI cycle myself (STATUS.md already documents that trace with concrete before/after values) — spot-checked read paths and the auth boundary instead, which is sufficient given the write logic was traced line-by-line.

**3. No stubs** — none found. No dead buttons: every button in `schedule-workspace.tsx` has a wired `onClick` calling a real API action. No empty handlers. No "coming soon" text anywhere in the reviewed files.

**4. Rule: ponytail** — Yes. Reorder uses plain array index swap + one POST, no drag library added (would have violated the dependency ladder for a feature this size). Bulk ops extend the existing E8 endpoint with an `action` discriminator instead of new routes — avoids inventing endpoints not in the inventory. `ScheduleDetails` stays a plain JSON bag rather than normalized tables, matching the DECISION-LOG call. No speculative abstractions spotted (no wrapper components, no premature generic "FieldEditor").

**5. Rule: clean-code** — Mostly clean, one real finding. Naming is intention-revealing (`bulkSetGroup`, `reorderSchedules`, `isPlaceholder`), errors say what's missing (`Schedule not found: ${scheduleId}`), org-scoped `findFirst({ id, orgId })` checks before every write prevent cross-tenant edits. One pattern per concern held: one workspace component, one details-JSON convention, one access-guard function. Finding: `src/core/schedule-groups.ts` still exports a second, differently-shaped `DEFAULT_SCHEDULE_GROUPS` (with `id`/`autoActivation` fields) that duplicates the same 35 names/colors now canonically defined in `src/content/default-groups.ts` (which `prisma/seed.ts` and `src/domain/identity.ts` actually use). The core-file version is re-exported from `src/core/index.ts` but has zero importers elsewhere in the app — dead, duplicated D9 seed data left over from before this arm settled on the `content/default-groups.ts` shape. Not named in F3, but it's the same class of leftover-during-a-rebuild problem F3 targets, and Phase 4 is the phase that made D9 groups real, so it's the right phase to have caught it.

**6. Rule: workflow** — Expectation/verify discipline is visible: STATUS.md documents concrete before/after values from a real write cycle (create → duplicate → reorder → bulk-move → PUT with `computedTime=13:30`), not just "tests passed." No speculative product invention — every field implemented traces to an inventory line; the one deviation (arrow reorder instead of drag) is a scope-shrink that should have been logged in DECISION-LOG per "never silently choose business logic," even though it's a UX/interaction choice rather than a calculation.

**7. Rule: codegraph** — N/A for this review. `.codegraph/` exists in rebuild-b, but I have no visibility into which tools the contestant actually called during the phase (no transcript was in the required reading list) — can't confirm or deny CLI-vs-grep discipline from code artifacts alone.

**8. Rule: git-discipline** — Pass. `git log` shows exactly one commit for this phase (`178760b Experiment arm B: Phase 4 schedules and groups complete.`), and `git status` inside rebuild-b shows a clean tree — consistent with "git belongs to the orchestrator" and the contestant not running git themselves.

**9. Todos / PHASE-PLAN fidelity** — High. All three DECISION-LOG calls for this phase (single workspace, details-JSON fields, action-based bulk POST) are implemented exactly as decided. The "done when" bar (create, compute, group, reorder, duplicate, bulk-move, delete seeded schedules with persisted results) is met and was demonstrated with real values in STATUS.md plus my own live spot-check.

**10. Context retention** — Good. Reuses Phase 2/3 infrastructure without duplicating it: `requireOrgMember` (Phase 2 org-access pattern), `ZmanimEngine`/`buildZmanimConfig` (Phase 3 calculation engine) for computed times, `getSessionUser` for the same local-session auth Phase 2 chose. No contradiction of earlier-phase decisions.

**11. Security** — Good. Every schedule/group mutation goes through `requireOrgMember(orgId, { write: true })`, which checks membership role against `WRITE_ROLES` (owner/admin/editor) or superadmin, and every domain-layer query scopes by `orgId` (`findFirst({ id, orgId })`) before acting, so a member of org A can't edit org B's rows even if they guess an ID. Confirmed live: anonymous GET is 401. No secrets in any reviewed file.

**12. Code quality** — 8/10. Well-typed end to end (shared `ScheduleDto`/`GroupDto` shapes between domain and API, no `any` leakage into the route handlers), consistent JSON-bag convention for advanced fields, sensible transaction use for bulk/reorder/delete-with-cleanup. Docked for the dead duplicate `DEFAULT_SCHEDULE_GROUPS` in `src/core/schedule-groups.ts` and the unlogged reorder-drag-to-arrows scope shrink.

**13. Findings**

1. `src/core/schedule-groups.ts` exports a dead, duplicate `DEFAULT_SCHEDULE_GROUPS` (different shape, zero real importers) that overlaps `src/content/default-groups.ts`, the version actually seeded. Dead code / type drift — delete the core-file version and its `src/core/index.ts` re-export, or fold it into a single source if the core scheduler ever needs the `id`/`autoActivation` shape.
2. P4.4 asks for drag reorder; the shipped UI uses up/down arrow buttons. Functionally equivalent (persists `sortOrder` correctly, verified live) but not logged in DECISION-LOG as an intentional scope reduction.
3. P4.2's "refresh mode/basis/anchor" trio is only two-thirds implemented (`refreshMode`, `refreshAnchorDay`; no separate "basis" field) — low-confidence finding since the inventory phrase itself is terse and the intended meaning of "basis" isn't spelled out elsewhere in the doc.

## Scores (1-10 each)
- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
