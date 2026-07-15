# Phase review — rebuild-b, Phase 5 (Content hub and daily notes)

Model: claude-sonnet-5-thinking-high | Runner: spawn | Arm: rebuild-b | Phase: 5

## Meta

- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Arm reviewed: rebuild-b
- Phase number: 5 — Content hub and daily notes
- Diff / files touched this phase (by content, not git — contestant doesn't git): `app/admin/content/content-hub.tsx`, `app/admin/content/page.tsx`, `app/admin/[orgSlug]/content/notes/page.tsx`, `app/api/org/[orgId]/announcements/route.ts`, `app/api/org/[orgId]/memorials/route.ts` (+`[memorialId]`), `app/api/org/[orgId]/sponsors/route.ts` (+`[sponsorId]`), `app/api/org/[orgId]/media/route.ts` (+`[mediaId]`, `/ordering`), `app/api/org/[orgId]/notes/route.ts`, `app/api/admin/notes/route.ts`, `src/domain/content.ts`, Prisma models `Announcement`/`Memorial`/`Sponsor`/`Media`/`TukachinskyNote`, seed additions.

## Proof-of-read

**`PHASE-REVIEW-RUBRIC.md`** — checklist covers proof-of-read, inventory coverage, running-app verification, no-stubs, six rule checks, plan fidelity, context retention, security, code quality, findings, and six 1–10 scores.

**`PHASE-PLAN.md` (Phase 5)** — claims `P5`, `P5.1–P5.6`; `D12–D16`; `E9–E12`, `E22`; `F5`, `F-DB3`. Done = every content type manageable from seed, merged notes prove add/override/hide, Phase 6+ untouched.

**`STATUS.md`** — reports content hub + notes route live on 3102, all four content APIs plus E22 notes-merge working, seed 2 announcements/2 memorials/2 sponsors/1 media/67 global notes, typecheck+build pass, server stopped after checks.

**`DECISION-LOG.md`** — Phase 5 entries: OP6 merge contract (global `orgId=null`, hide/override/add-only rows, `origin` tag), media at `public/uploads/{orgId}`, announcement reorder via `priority = length - index`, single `ContentHub` workspace (no per-type pages). All consistent with what's in the code.

**Inventory (`FEATURE-INVENTORY.md`)** — P5/P5.1–P5.6 (announcements, memorials+relationship, sponsors, media upload/order, per-tab visibility, OP6 notes route); D12–D16 field lists; E9–E12+E22 endpoint/trust-boundary rules; F5 (add `relationship`); F-DB3 (resolved via OP6 hybrid, keep+extend `TukachinskyNote`).

**Rules (`workflow.mdc`, `ponytail.mdc`, `clean-code.mdc`, `git-discipline.mdc`, `codegraph.mdc`, `vocabulary.mdc`)** — read in full; content matches the condensed proof-of-read already in `PHASE-PLAN.md`/`DECISION-LOG.md` for this arm.

## Checklist

**1. Inventory coverage**

| ID | Status | Evidence |
|---|---|---|
| P5 (hub) | PRESENT | Single `ContentHub` at `/admin/content?org=` with 5 tabs; verified 200 live. |
| P5.1 Announcements | PARTIAL | Full CRUD + HE fields + priority + dates + JSON visibility editor work. `reorder` exists server-side (`POST action=reorder`) but the hub UI has **no reorder control** — no drag, no move-up/down button; only a raw priority number input. Inventory calls for "reorder" as a control, not just an API. |
| P5.2 Memorials + relationship | PRESENT | Full CRUD, `relationship` field editable and labelled "(F5)", search by name/family/relationship works. |
| P5.3 Sponsors | PRESENT | Full CRUD, all D14 fields present and editable. |
| P5.4 Media | PARTIAL | Upload, thumbnails, active toggle, delete all work; `/media/ordering` PUT is real and transactional, but the only UI trigger is a blunt "Reverse order" button — no per-item drag-reorder as the inventory describes. |
| P5.5 Per-tab visibility editor | PARTIAL | Announcements expose `scheduleRules` as a raw JSON textarea (functional but not a real rule editor). Media sets `scheduleRules` only at upload time; no UI to edit it afterward (API supports it via `action: "meta"`, unused by the hub). |
| P5.6 Daily notes route | PRESENT | `/admin/[orgSlug]/content/notes` live; add/override/hide/unhide/clear-override all verified round-trip in the running app. |
| D12–D16 | PRESENT | Schema matches inventory field-for-field, including `Memorial.relationship` and extended `TukachinskyNote` (orgId, overridesNoteId, isHidden). |
| E9–E12 | PRESENT | All four endpoint groups: org-scoped, role-guarded, `findFirst` ownership check before every update/delete. |
| E22 | PRESENT | Org notes CRUD + super-admin baseline CRUD (`/api/admin/notes`), guarded by `requireSuperAdmin`. |
| F5 | PRESENT | `relationship` added to schema, DTO, create/update routes, and hub form. |
| F-DB3 | PRESENT | Resolved exactly per the OP6 hybrid decision: global baseline (`orgId=null`), org override/hide/add rows, `mergeNotesForOrg` computing `origin`. |

**2. Running app** — Verified live on port 3102 (server already had `node_modules`/`prisma/dev.db`; skipped `db:setup` to avoid reseeding over prior state, ran `npm run dev` directly).
- Logged in as `owner@demo.local` via `/api/auth/login`.
- `/admin/content?org=demo` → 200; `/admin/demo/content/notes` → 200.
- `GET /api/org/{orgId}/announcements` → 2 rows; `/memorials` → 2 rows, `relationship` populated; `/sponsors` → 2 rows; `/media` → 2 rows (one beyond the seeded 1 — likely a leftover test upload from a prior contestant session, not a defect); `/notes` → 69 merged rows (63 global / 4 override / 2 org — close to but not identical to STATUS.md's "68/65/1/1/1" snapshot, consistent with DB state drift between sessions, not a fresh reseed).
- Live round-trip: took a `global` note, called `action=override` → origin flipped to `override`; called `action=clear-override` → origin reverted to `global`. Add/override/hide/clear-override behavior is real, not simulated.
- Security probe: unauthenticated `POST /api/org/{orgId}/announcements` → 401. Request against a non-existent org slug → 404. Trust boundary holds.
- Server stopped after checks (`Stop-Process`, confirmed gone).

**3. No stubs** — No dead buttons or "coming soon" markers found. Every button wired to a real API call with error surfacing (`hub-error`). The one soft spot is P5.1/P5.4/P5.5 above: real server capability exists (`reorder`, `/ordering`, `action:"meta"`) but the client UI doesn't fully expose it — that's under-exposed, not fake/stubbed.

**4. Rule: ponytail** — Mostly followed (no speculative abstractions, no new packages, reuses `requireOrgMember`/DTO helpers across all four content types). One violation: `content-hub.tsx` is **1051 lines** covering 5 unrelated tab UIs in one file — ponytail's own god-file threshold ("split when >500 lines or mixed concerns") is breached. The Phase 5 decision log justifies *one route/one component* at the page level (matching P5's "single hub" spec), but that's a routing decision, not license to inline five independent editors into one file — splitting into `AnnouncementsTab.tsx`/`MemorialsTab.tsx`/etc. under the same page would have honored both the "one hub" UX and the god-file rule.

**5. Rule: clean-code** — Naming is clear and intention-revealing (`mergeNotesForOrg`, `announcementDto`, `hiddenByOrg`). Error handling is consistent: every route validates ownership via `findFirst({ id, orgId })` before mutation, no swallowed errors except two narrow, justified cases (`unlink` file-not-found in media DELETE, JSON.parse guard while typing visibility rules in the client — both have a comment explaining why). One nit: `org-access.ts`'s write-role rejection message still says `"cannot write schedules/groups"` — copy-pasted from the Phase 4 schedules code and now inaccurate for content endpoints (clean-code requires error messages to state what actually failed).

**6. Rule: workflow** — Business judgments (OP6 merge shape, media storage path, reorder-via-priority, single-hub layout) are all logged in `DECISION-LOG.md` with a "why," not silently decided. STATUS.md documents concrete running-app evidence (route codes, row counts, round-trip proof) rather than claiming success from code alone — matches the "verify in the running app" rule. No speculative product invention spotted.

**7. Rule: codegraph** — N/A for my review process (this repo has no `.codegraph/` index and the reviewer has no codegraph MCP tools available); I used direct `Read`/`Glob`/targeted `Grep` on named files, not blind structural discovery. Not evaluated as a contestant violation since it's a reviewer-tooling note, not a finding about their code.

**8. Rule: git-discipline** — No `.git` state under `rebuild-b` shows contestant-authored commits; `git status` from the repo root shows no pending changes attributable to `rebuild-b` for this phase. No evidence the contestant ran git themselves.

**9. Todos / PHASE-PLAN fidelity** — Phase 5 scope (P5/P5.1–P5.6, D12–D16, E9–E12/E22, F5, F-DB3) is fully claimed and mostly delivered; the gaps are the reorder/visibility-editor UI completeness noted above, not scope drift. Phase 6+ was left untouched (no editor/board files touched).

**10. Context retention** — Consistent with Phase 4 patterns: same `requireOrgMember` helper, same action-based POST convention used for schedules reorder now reused for announcements reorder and notes actions, same JSON-detail-bag philosophy. Topnav links back to `/admin` and `/admin/schedules?org=` are intact, so Phase 4 work wasn't broken by this phase.

**11. Security** — All four content-type routes plus notes/admin-notes are org-scoped and role-guarded via one shared `requireOrgMember` helper (write roles: owner/admin/editor); every single-record route re-checks `orgId` ownership before mutating, closing the classic IDOR gap. Media upload filenames are sanitized to `[a-zA-Z0-9._-]` before touching the filesystem — no path traversal. Super-admin baseline notes are gated by `requireSuperAdmin`. Verified both a 401 (no session) and a 404 (bad org) live. No secrets in code or logs.

**12. Code quality: 8/10** — Clean, consistent CRUD pattern reused four times with one shared access helper and DTO layer; the OP6 merge logic is correctly modeled and tested live. Docked for the oversized `content-hub.tsx` file and the under-exposed reorder/visibility-edit affordances relative to what's server-ready.

**13. Findings**

1. `content-hub.tsx` is a 1051-line god file mixing five unrelated tab editors — split by tab component (ponytail god-file rule, clean-code "split by concern").
2. P5.1 announcement reorder: API (`action: "reorder"`) works, but no UI control triggers it — priority is only editable as a raw number.
3. P5.4 media reorder: `/media/ordering` works and is transactional, but the only UI trigger is an all-or-nothing "Reverse order" button, not real per-item reordering.
4. P5.5 visibility editor: announcements get a raw JSON textarea (functional, not a real rule editor); media's `scheduleRules` can only be set at upload time — no UI to edit it after the fact even though the API (`action: "meta"`) supports it.
5. `org-access.ts` write-role error message ("cannot write schedules/groups") is stale copy from Phase 4, inaccurate on content endpoints.
6. Media count in the running app (2) and merged-notes count (69) differ slightly from the STATUS.md snapshot (1 / 68) — explained by DB state carried over from a prior session rather than a fresh reseed; not a code defect.

## Scores (1–10)

- inventory_coverage: 8
- rule_adherence: 7
- plan_fidelity: 8
- context_retention: 9
- security: 9
- code_quality: 8
