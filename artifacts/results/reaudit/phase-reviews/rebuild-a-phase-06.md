# Phase Review — Rebuild arm A, Phase 6 (Content hub)

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 6 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 6 — Content hub (P5, E9–E12, E22, F5, F-DB3)
- Diff / files touched this phase: `a-p06.patch` is empty (Phase 1 marker only); evidence taken from the snapshot tree at `snapshots/a/p06`. New/changed files: `src/admin/content/ContentHub.tsx`, `src/admin/content/NotesPanel.tsx`, `src/admin/content/notes-service.ts`; API routes `app/api/org/[orgId]/{announcements,memorials,sponsors,media,notes}/**` and `app/api/admin/notes/**`; admin pages `app/admin/[orgSlug]/content/page.tsx` + `content/notes/page.tsx`; schema rows D12–D16 in `src/db/schema.ts`; seed rows in `src/db/seed.ts`.

## Proof-of-read
- REAUDIT-INSTRUCTIONS.md: single third-party reviewer, glm-5.2-high for all reviews, phase-only scope, running-app optional/N/A OK, no guessing the contestant model.
- PHASE-REVIEW-RUBRIC.md: 13-item checklist + 6 scores (1–10), evidence or N/A per item.
- FEATURE-INVENTORY.md: P5.1–P5.6 (announcements, yahrzeits+F5 relationship, sponsors, media+ordering, per-tab visibility, OP6 hybrid notes), E9–E12, E22, F5, F-DB3; trust boundary requires orgId+role server-side on every `/api/org/*` write and `isSuperAdmin` on `/api/admin/*`.
- PHASE-PLAN.md (Phase 6): P5, E9–E12, E22, F5, F-DB3 — matches what was built.
- STATUS.md: claims P5.1–P5.6, E9–E12, E22, F5, F-DB3 (67 baseline notes); walked evidence 2026-07-15 (routes 200, POSTs 201, /notes merge 67, /api/admin/notes 200, typecheck clean, tests 16 files/154, build green).
- DECISION-LOG.md: media=data-URL/path (DECIDED, reversible), F-DB3 seed C6→D16 baseline + org override/hide, P5.5 reuses ScheduleRuleEditor (F4), F3/F4 module shape — all logged with rationale.
- a-p06.patch: empty (Phase 1 marker); fell back to snapshot tree spot-check.
- Snapshot spot-check: read ContentHub, NotesPanel, notes-service, all 5 content API collection routes + their `[id]` routes, admin/notes + `[noteId]`, ScheduleRuleEditor, schema D12–D16, seed, guards, nav, TefilahNotes (W14), board-repo notes feed. `.git` absent (contestant did not git — correct).

## Checklist

1. **Inventory coverage** — P5.1 PRESENT (announcements list/add/edit, title/content+HE, priority, active, start/end, reorder via collection PATCH `orderedIds`); P5.2 PRESENT (memorials list/form with all D13 fields incl. `relationship` F5, search, edit/delete); P5.3 PRESENT (sponsors list/form: type, name, HE/EN, dates, recurring, active); P5.4 PRESENT (media upload as data-URL/path, thumbnails for data-URL images, `/media/ordering` reorder, active, visibility rules, delete); P5.5 PARTIAL→PRESENT-for-supported-tabs: ScheduleRuleEditor wired on announcements + media only; memorials/sponsors have no `scheduleRules` column in schema (D13/D14), so visibility scheduling is not representable there — scope matches the data model, not a gap; P5.6 PRESENT (`/admin/[orgSlug]/content/notes`, baseline from C6 + add/override/hide, merged view); E9–E12 PRESENT (CRUD + `[id]` + media `/ordering`); E22 PRESENT (org notes CRUD + `/api/admin/notes` super-admin baseline CRUD + `[noteId]`); F5 PRESENT (schema column + form select + API + seed); F-DB3 PRESENT (idempotent `seedBaselineNotes`, 67 rows, merge layer in `listMergedNotes`, W14 consumes `bundle.notes` via `resolveEffectiveNotes`).
2. **Running app** — N/A per reaudit rules (no node_modules in snapshot). Static evidence only: STATUS records routes 200, POSTs 201, merge 67, admin notes 200, typecheck clean, build green on 2026-07-15.
3. **No stubs** — no dead buttons or "coming soon" marked done. Media upload is a real data-URL/path write (DECIDED, reversible), not a stub. Notes hide inserts a real `(hidden)` row. Override uses `prompt()` — clunky but functional, not a stub.
4. **Rule: ponytail** — reused `ScheduleRuleEditor` from Phase 5 (F4) instead of forking; no new abstraction for one call site; `notes-service` is the single merge source shared by `/api/org/.../notes` and `/api/admin/notes`. Inline `Record<string, unknown>` typing in ContentHub is loose but matches the arm's existing client pattern. `fileSize: body.filePath.length` is a lazy proxy for byte size — `ponytail:`-worthy shortcut, not logged.
5. **Rule: clean-code** — naming clear (`load`, `openCreate`, `moveMedia`, `reorderAnnouncements`); one error shape (`{ error }`); one fetch pattern; one auth pattern (`requireOrgRole`/`requireSuperAdmin`); no god file (ContentHub ~600 lines, single concern). Minor: `ser()` duplicated across routes (announcements/memorials/sponsors each redefine a serializer) — under the Rule of 2 threshold for extraction across independent routes, acceptable.
6. **Rule: workflow** — STATUS walks an observable checklist (routes, POSTs, merge count, admin notes, typecheck, tests, build) with evidence; DECISION-LOG logs the open calls (media storage, F-DB3 shape, F4 reuse) as DECIDED + reversible. No speculative product inventing; F-FIDS stayed a Phase 2 call.
7. **Rule: codegraph** — N/A: no `.codegraph/` index in the experiment workspace (logged in DECISION-LOG "codegraph skipped"). Structural lookups done by Read/dir, which is the allowed fallback.
8. **Rule: git-discipline** — contestant must NOT git; `.git` absent in snapshot. No commit evidence. Pass.
9. **Todos / PHASE-PLAN fidelity** — Phase 6 plan = P5, E9–E12, E22, F5, F-DB3. Every claimed ID has a corresponding file/route in the tree. STATUS "Next: Phase 7 — not started" matches the stop boundary.
10. **Context retention** — builds on Phase 1 schema (D12–D16 already present), Phase 3 guards, Phase 5 `ScheduleRuleEditor`. Board-repo already feeds announcements/memorials/sponsors/media/notes to the display widgets, so content created here renders on `/show` (W9/W10/W11/W12/W14). No prior work dropped or contradicted.
11. **Security** — every `/api/org/[orgId]/*` write calls `requireOrgRole(orgId, "editor")` and scopes every query with `and(eq(id, ...), eq(orgId, orgId))` — orgId from path, never from body (F-API5 satisfied). `/api/admin/notes` + `[noteId]` call `requireSuperAdmin()`. Public display reads are a separate surface. No raw SQL (Drizzle parameterized). Two minor findings: (a) override/hide insert a new org row each time with no uniqueness on `(orgId, baselineId)` — duplicate hide/override rows can accumulate; (b) `/api/admin/notes/[noteId]` PATCH/DELETE selects with `isNull(orgId)` but the UPDATE/DELETE only filters by `eq(id)` — safe because the preceding select gates 404, but the write itself doesn't re-assert `orgId IS NULL`.
12. **Code quality** — 8/10. Consistent, readable, real end-to-end wiring (admin form → API → DB → board snapshot → widget). Loses points for: `prompt()`-based override UX, `Record<string, unknown>` form state, `fileSize` proxy, no content-API tests (the 16/154 tests are all core engine; no route-level coverage for E9–E12/E22 or the merge layer).
13. **Findings**
  1. No tests for content API routes or `listMergedNotes` merge logic — only `tukachinsky-notes.test.ts` (C6 source data) exists; the override/hide/add merge is unverified by a test.
  2. Override/hide rows are not unique on `(orgId, baselineId)` — repeated actions stack duplicates; merge reads the first non-hidden override, so behavior is mostly fine but the table grows.
  3. `/api/admin/notes/[noteId]` write filters by `eq(id)` only; the `isNull(orgId)` check lives only in the pre-select. Add `and(eq(id), isNull(orgId))` to the UPDATE/DELETE for defense-in-depth.
  4. `fileSize: body.filePath.length` is a character-count proxy, not bytes — fine for the local experiment, worth a `ponytail:` note.
  5. P5.5 visibility editor is announcements+media only; memorials/sponsors can't be visibility-scheduled because D13/D14 lack `scheduleRules`. Consistent with schema, but the inventory's "per-sub-tab" wording is only partially met — flag for the user if full per-tab scheduling is expected.

## Scores
- inventory_coverage: 9
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 8
- code_quality: 8
