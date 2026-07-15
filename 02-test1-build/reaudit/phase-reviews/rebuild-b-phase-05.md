Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 5 | Reaudit: true

# Phase 5 review — rebuild-b (Content hub and daily notes)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 5
- Diff / files touched this phase: `b-p05.patch` is a placeholder ("PHASE 1 - no previous phase"); reviewed the full snapshot tree at `audit/snapshots/b/p05`. Phase-5-relevant files: `app/admin/content/{page, content-hub}.tsx`, `app/admin/[orgSlug]/content/notes/page.tsx`, `app/api/org/[orgId]/{announcements,memorials,memorials/[memorialId],sponsors,sponsors/[sponsorId],media,media/[mediaId],media/ordering,notes}/route.ts`, `app/api/admin/notes/route.ts`, `src/domain/content.ts`, `prisma/{schema.prisma, seed.ts}`.

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, do not guess contestant model, use `PHASE-REVIEW-RUBRIC.md`, focus on this phase only, running-app verification optional (no node_modules), say N/A if not run.
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist + 6 scores (1-10) for orchestrator aggregation.
- `FEATURE-INVENTORY.md`: P5 hub (announcements/memorials/sponsors/media/notes), D12-D16 models, E9-E12 + E22 APIs, F5 relationship, F-DB3 OP6 hybrid notes.
- `snapshots/b/p05/PHASE-PLAN.md`: Phase 5 claims `P5`, `P5.1-P5.6`; `D12-D16`; `E9-E12`, `E22`; `F5`, `F-DB3`. Done when every content type manageable from seed and merged notes prove add/override/hide.
- `snapshots/b/p05/STATUS.md`: claims Phase 5 complete; evidence = typecheck + build pass, live HTTP 200 on hub and notes routes, seed counts (2/2/2/1 + 67 globals), notes merge 68 rows proving override/hide/add, super-admin baseline 67 rows, server stopped.
- `snapshots/b/p05/DECISION-LOG.md`: Phase-5 judgments logged — OP6 merge origins, media under `public/uploads/{orgId}`, announcement reorder via priority, E9 load-org-first, single ContentHub workspace.
- `diffs/b-p05.patch`: placeholder, no per-phase diff available; static snapshot tree used instead.

## Checklist

1. **Inventory coverage** — Claimed: `P5`, `P5.1-P5.6`; `D12-D16`; `E9-E12`, `E22`; `F5`, `F-DB3`.
   - `P5` hub: PRESENT — one tabbed `ContentHub` at `/admin/content?org=` plus deep-link `/admin/[orgSlug]/content/notes` with `initialTab=notes` (matches DECISION-LOG "single workspace").
   - `P5.1` Announcements: PRESENT — list, inline edit (title/content +HE, priority, active, start/end, scheduleRules JSON), add, delete; reorder API exists (`action=reorder` sets `priority=length-index`) but the UI exposes NO reorder button for announcements (only media has "Reverse order"). Reorder = PARTIAL on the UI side.
   - `P5.2` Memorials: PRESENT — list + search (name/relationship/family) + add/edit/delete; `relationship` field present (F5). UI editor omits `civilDate`, `hebrewAdar`, `hebrewYear` (only month/day/yahrzeit/active/names/relationship/donor/notes). PARTIAL on full D13 surface.
   - `P5.3` Sponsors: PRESENT — list + add/edit/delete; type, name, HE/EN text, HE date, recurrence rule, recurring, active. UI omits `civilDate`. Minor PARTIAL.
   - `P5.4` Media: PRESENT — multipart upload to `public/uploads/{orgId}/`, thumbnails, active toggle, delete, ordering PUT (`/media/ordering` with `ids`). Reorder UI is "Reverse order" only (no drag), and per-item visibility `scheduleRules` is reachable only via the `action=meta` API, not exposed as an editor in the card. PARTIAL on per-item visibility UI.
   - `P5.5` per-sub-tab visibility/scheduling editor: PARTIAL — only the announcements tab shows a `scheduleRules` JSON textarea; media exposes it via API only; memorials and sponsors have no visibility editor at all.
   - `P5.6` Daily notes at `/admin/[orgSlug]/content/notes`: PRESENT — route renders `ContentHub` with `initialTab=notes`; merged view with add / override / hide / unhide / clear-override / delete; origins `global|org|override` surfaced in the UI.
   - `D12-D16`: PRESENT in `schema.prisma`; D16 `TukachinskyNote` has `orgId?`, `overridesNoteId?`, `isActive`, `isHidden` — matches OP6 hybrid (F-DB3 RESOLVED).
   - `E9` announcements, `E10` memorials (+`[memorialId]`), `E11` sponsors (+`[sponsorId]`), `E12` media (+`[mediaId]` + `/ordering`), `E22` org notes + admin baseline: all PRESENT and role-guarded.
   - `F5` relationship: PRESENT (schema + seed + form + API).
   - `F-DB3`: RESOLVED via OP6 hybrid; `seedGlobalNotesFromCore` seeds baseline from C6, `mergeNotesForOrg` produces the merged set with origins.

2. **Running app** — N/A. Snapshot has no `node_modules`; per reaudit instructions, static evidence preferred. STATUS.md records live evidence (typecheck, build, HTTP 200 on `/admin/content?org=demo` and `/admin/demo/content/notes`, seed counts, notes merge 68 rows, super-admin baseline 67 rows, server stopped). Not independently re-run.

3. **No stubs** — No dead buttons or "coming soon" found. Every add/edit/delete/reorder/override/hide path wires to a real handler. The notes tab actions (override/hide/unhide/clear-override/delete) all map to real API actions. No empty handlers.

4. **Rule: ponytail** — Mostly followed. One `ContentHub` component at 1051 lines with five tab renderers is a god file (mixed concerns); clean-code/ponytail would split by tab. No unrequested abstractions; `parseCivilDate` is duplicated across four route files (memorials collection + `[memorialId]`, sponsors collection + `[sponsorId]`) — a small dedupe candidate, but stable. No new packages. Shortest-diff intent visible (single workspace, action-based POST avoids extra routes).

5. **Rule: clean-code** — Naming clear (`requireOrgMember`, `mergeNotesForOrg`, `seedGlobalNotesFromCore`). Error messages state what failed. One error-handling pattern per concern (all org routes via `requireOrgMember`, baseline via `requireSuperAdmin`). DTOs centralized in `src/domain/content.ts`. Findings: god file (1051 lines), duplicated `parseCivilDate`, `safeJson` returns `unknown`/raw string on parse failure (acceptable for a JSON bag).

6. **Rule: workflow** — Expectation/verify discipline visible: STATUS.md lists observable evidence (routes built, seed counts, merge-row count, super-admin count) and explicitly stops before Phase 6. No speculative product inventing; Phase-5 scope held. DECISION-LOG records the business judgments (OP6 origins, reorder-via-priority, media path, E9 load-org-first).

7. **Rule: codegraph** — N/A for this phase. No structural-exploration artifact in the snapshot; contestant used direct reads of known files. Not a finding.

8. **Rule: git-discipline** — Contestant did NOT run git. DECISION-LOG and STATUS both state the orchestrator owns commits/pushes. Compliant.

9. **Todos / PHASE-PLAN fidelity** — High. PHASE-PLAN Phase 5 = content hub + daily notes; STATUS claims exactly that with evidence matching the done-when clause ("every content type can be managed from seeded records and the merged notes response proves add, override, and hide behavior"). Phase 6 marked not started. No scope creep into Phase 6.

10. **Context retention** — Prior phases intact in the tree (landing, auth, onboarding, mobile, schedules, core engine). No contradictions with earlier-phase decisions (flat `/api/me`, OP6 hybrid, role guards reused). `requireOrgMember` reused from prior phases.

11. **Security** — Solid. Every `/api/org/[orgId]/*` write calls `requireOrgMember(orgId, {write:true})`; `requireOrgMember` resolves the org server-side (by id OR slug) and re-scopes every `findFirst`/`updateMany`/`update`/`delete` with `orgId: access.orgId` before mutating — no client-supplied orgId is trusted on the row path. Super-admin baseline (`/api/admin/notes`) guarded by `requireSuperAdmin`. Media upload sanitizes the filename (`[^a-zA-Z0-9._-]` → `_`) and stores under `public/uploads/{orgId}/`. Minor gaps: no MIME or file-size cap on upload; `scheduleRules` JSON is accepted from the client and stored raw (by design for the JSON bag). No secrets in tree; `.env.example` present.

12. **Code quality** — 7/10. Clean, consistent, role-guarded, seeded, and verified. Deductions: 1051-line god-file `ContentHub` with five mixed-concern tab renderers; `parseCivilDate` duplicated across four routes; several D13/D14 fields (`civilDate`, `hebrewAdar`, `hebrewYear`) not surfaced in the editor UI; announcement reorder has no UI button; P5.5 per-sub-tab visibility editor only partial; media per-item visibility rule editor missing from the card.

13. **Findings**
   1. `app/admin/content/content-hub.tsx` is 1051 lines with five tab renderers — split by tab (announcements/memorials/sponsors/media/notes) per clean-code god-file rule.
   2. `parseCivilDate` duplicated in four route files — move to `src/domain/content.ts`.
   3. Announcement reorder API exists but the hub UI exposes no reorder control for announcements (only media "Reverse order").
   4. Memorial/sponsor editor UI omits `civilDate` (and `hebrewAdar`/`hebrewYear` for memorials) — D13/D14 fields not fully editable.
   5. P5.5 per-sub-tab visibility/scheduling editor is partial: only announcements expose `scheduleRules`; memorials/sponsors have none; media only via API `action=meta`.
   6. Media upload has no MIME-type or file-size validation; relies on filesystem under `public/`.

## Scores (1-10)
- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 7
