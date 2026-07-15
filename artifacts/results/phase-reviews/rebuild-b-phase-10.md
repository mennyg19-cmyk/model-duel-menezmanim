# Phase review — rebuild-b, Phase 10

Model: claude-sonnet-5-thinking-high | Runner: spawn | Arm: rebuild-b | Phase: 10

## Meta
- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Arm reviewed: rebuild-b
- Phase number: 10 — Import/export and super-admin
- Diff / files touched this phase: `app/admin/[orgSlug]/import/page.tsx`, `app/admin/super/page.tsx`, `app/api/admin/{users,reseed-demo,clone,notes}/route.ts`, `app/api/admin/orgs/route.ts` + `[orgId]/{data,plan,status}/route.ts`, `app/api/org/[orgId]/{import,export}/route.ts`, `src/admin/import-export/ImportExportHub.tsx`, `src/admin/super/SuperAdminConsole.tsx`, `src/io/{csv,import-export,weekly-export,screenshot,bzs-apply,beezee}.ts`, `src/domain/org-clone.ts`.

## Proof-of-read

**`PHASE-REVIEW-RUBRIC.md`** — 13-item checklist (inventory coverage, running-app verify, stubs, ponytail/clean-code/workflow/codegraph/git-discipline rules, plan fidelity, context retention, security, code quality, findings) plus 6 aggregation scores 1–10, written to the path given in the spawn prompt.

**`PHASE-PLAN.md` Phase 10** — claims `R6`; `P10`, `P10.1–P10.6`; `SA.1–SA.9`; `E19–E21`; `F9–F12`, `F-DUP-CSV`, `F-SCREENSHOT`, `F-API5`. Done means sample imports round-trip with preview/errors, exports open, and org vs super-admin auth boundaries hold. Build CSV/JSON/ICS/BZS imports, bilingual multi-week CSV/PDF + screenshot exports, one CSV implementation, guarded super-admin ops.

**`STATUS.md`** — self-reports Phase 10 complete: import hub with category samples/preview/commit/upload, BZS content parse, per-type + full-org + weekly + screenshot exports, super-admin orgs/users/notes console, 403 for non-super, empty-BZS-400. Lists `npm run typecheck`/`build` passed and specific running-app evidence (import 200, announcement preview/commit wrote 1, BZS preview count 26, empty BZS 400, weekly HTML 200, screenshot SVG 200, owner 403 on `/api/admin/orgs`, clone 201). Server stopped, stopped before Phase 11.

**`DECISION-LOG.md`** (Phase 10 entries) — one CSV helper (`src/io/csv.ts`, BOM-aware) for both import/export and content-based BZS parsing with a 400 on empty content (F-DUP-CSV/F9); weekly HTML marked for browser print-to-PDF instead of a PDF binary lib (F10); screenshot export is SVG built from the live `buildDisplaySnapshot` boxes, not a headless-browser raster (F-SCREENSHOT); super-admin data editing returns deep links into normal org routes instead of a duplicate editor (F11), with real `setSuperAdmin`/`removeMembership` actions (F12).

**`FEATURE-INVENTORY.md`** (Phase 10 IDs) — P10 wants an import wizard for CSV/JSON/ICS/BZS with column mapping, preview, commit, plus a two-file Groups+Events CSV flow (P10.5), multi-week CSV/PDF export (P10.3), and screenshot export (P10.4, previously a stub). R6/SA.1–SA.9 define the super-admin console: org list/create/status/plan, data deep-links (SA.5/F11), clone (SA.6), reseed (SA.7), users actions (SA.8/F12), baseline notes (SA.9/OP6/E22). F9 requires BZS to parse real content, not just the filename. F-API5 requires every `/api/admin/*` and `/api/org/*` write to verify role/ownership server-side.

**Phase 10 code under rebuild-b** — read `ImportExportHub.tsx`, `SuperAdminConsole.tsx`, both import/export API routes, `src/io/{csv,import-export,weekly-export,screenshot,bzs-apply,beezee}.ts`, `src/domain/{org-clone,super-admin,org-access}.ts`, `src/auth/session.ts`, and `src/admin/shell/nav.ts`. Import hub is a single-page category picker + textarea/file-upload + sample/preview/commit + export links grid. Super-admin console is a 3-tab (orgs/users/notes) client component hitting `/api/admin/*`. All admin writes gate through `requireSuperAdmin()` (fresh DB `isSuperAdmin` lookup per request, not a cached session claim); org writes gate through `requireOrgMember()` with role sets for write/admin.

## Checklist

**1. Inventory coverage**

| ID | Status | Evidence |
|---|---|---|
| R6 `/admin/super` | PRESENT | `app/admin/super/page.tsx`, guarded, verified 307-redirect for non-super in running app |
| P10.1 import wizard | PARTIAL | CSV/JSON/BZS categories, sample/preview/commit all work; **no column-mapping UI** — `mapColumns`/`mapping` param exists in the API (`import-export.ts`, `csv.ts`) but `ImportExportHub.tsx` never sends a `mapping` object, so the "map columns" half of the wizard is server-only, unreachable from the UI. ICS import isn't offered either (only ICS *export* exists) |
| P10.2 export (CSV/JSON/ICS + full-org) | PRESENT | verified running: full-org JSON 200 (45KB body), per-type CSV links present |
| P10.3 multi-week CSV export | PRESENT | `weekly-export.ts` `buildWeeklyScheduleCsv`, weeks 1–52 clamped, Sunday/Shabbos basis, parsha header column; verified via HTML variant (see below) |
| P10.4/F-SCREENSHOT | PRESENT (documented tradeoff) | `screenshot.ts` builds an SVG from the live snapshot's object boxes/names — verified 200 with `<svg` in running app. This is a labeled box outline, not a pixel-faithful capture; DECISION-LOG names the tradeoff and a reversible path to a real renderer, so this is an honest PRESENT, not a disguised stub |
| P10.5 two-file Groups+Events CSV | PARTIAL | Inventory wants one wizard step ingesting a Groups file + an Events file together. Rebuild-b splits this into two independent single-file categories (`groups-events` → `ScheduleGroup` only, `schedules` → `MinyanSchedule` only) run separately. Functionally covers groups and events with append/replace/preview/errors/BOM, but not the *paired two-file* flow the inventory describes, and this split isn't called out in DECISION-LOG |
| P10.6 per-list JSON import | PRESENT | `json-announcements`/`json-yahrzeit`/`json-sponsors` categories, sample JSON, preview, commit — verified announcements JSON sample cycle |
| F9 BZS content-based | PRESENT | `bzs-apply.ts` throws on empty content ("upload the file body, not only the filename") — verified 400 in running app; `beezee.ts` parses the real hex-CSV byte stream, not the filename |
| F10 PDF via HTML | PRESENT (documented tradeoff) | `weekly-export.ts` `buildWeeklyScheduleHtml` — bilingual (en/he) table marked "printable PDF via browser print"; verified 200 with `<table>` in running app. No PDF binary added — ponytail ladder, logged in DECISION-LOG |
| F-DUP-CSV | PRESENT | Single `src/io/csv.ts` used by both `import-export.ts` and `weekly-export.ts`; no second CSV family found |
| F11 super-admin reuse | PRESENT | `/api/admin/orgs/[orgId]/data` returns deep links (`dashboard`, `schedules`, `content`, `screens`, `editor`, `members`, `settings`, `import`, `notes`) into normal org routes, no duplicate editor UI |
| F12 real user actions | PRESENT | `setSuperAdmin` (blocks self-demotion) and `removeMembership` are real Prisma writes, not stubs — verified via code path (not exercised live to avoid corrupting the seeded owner/admin accounts) |
| F-API5 | PRESENT | every `/api/admin/*` route calls `requireSuperAdmin()`; every `/api/org/[orgId]/*` write route calls `requireOrgMember` with role checks; verified live (owner → 403 on `/api/admin/orgs` and `/api/admin/clone`, super-admin → 200/201) |
| SA.1–SA.4, SA.6, SA.7 | PRESENT | org list/create, status PATCH, plan PATCH, clone, reseed — all verified live (org count 2, clone created `clone-test-…` with 201, reseed function reviewed) |
| SA.5 | PRESENT | via F11 deep-links, see above |
| SA.8 | PRESENT | Users tab lists users + super badge + memberships, real toggle/remove actions (F12) |
| SA.9 (OP6 baseline notes) | PRESENT | `/api/admin/notes` full CRUD + `reseed-from-core` action, orgId=null scoping enforced with `findFirst({ id, orgId: null })` before update/delete |
| E19–E21 | PRESENT | import/export route, admin orgs/clone/reseed/users routes all exist and are wired to real domain logic |

**Inventory coverage overall: PRESENT for the large majority, two PARTIALs (P10.1 column-mapping UI, P10.5 two-file pairing) that are real gaps against the inventory text but don't block the phase's stated "done when" criterion (round-trip with preview/errors + auth boundaries).**

**2. Running app** — Verified live on port 3102 (npm run dev, `db:setup` already applied). Logged in via `/api/auth/login` as `owner@demo.local` and `admin@menezmanim.local` (local signed-cookie session), then exercised the actual HTTP endpoints:
- Owner `GET /api/admin/orgs` → 403; super-admin same call → 200, 2 orgs.
- Super-admin `GET /api/admin/users` → 200, 4 users.
- Owner `GET /admin/demo/import` → 200.
- Owner `GET /admin/super` → 307 (redirect away, not the console).
- BZS commit with empty content → 400, `"BZS content is empty — upload the file body, not only the filename."`
- Announcement CSV sample → preview → commit cycle (see Finding 1 below on the error message it produces).
- Weekly HTML export (2 weeks, Sunday basis) → 200, contains `<table>`.
- Screenshot SVG export → 200, contains `<svg`.
- Full-org JSON export → 200, 45KB body.
- Super-admin clone of the demo org → 201, `clone-test-<timestamp>` created.
- Owner attempting the same clone call → 403.
Server stopped after verification (background PID killed, confirmed dead).

**3. No stubs** — none found. Grepped `src/io`, `src/admin/import-export`, `src/admin/super` for TODO/FIXME/"coming soon"/stub markers: zero matches. Every button in `ImportExportHub.tsx` and `SuperAdminConsole.tsx` (Sample, Preview, Commit, export links, Create, Status/Plan selects, Data editors, Clone, Reseed, Make/Revoke super, Remove, Add note) calls a real API route with a real Prisma-backed implementation — verified above for the security-critical and previously-stubbed ones (F9, F10, F-SCREENSHOT, F12).

**4. Rule: ponytail** — Good adherence. No new dependency for PDF (HTML+browser-print) or screenshot (SVG from existing snapshot data, no headless browser) — both are the "first simple approach that works" and both are labeled with a reversible upgrade path in DECISION-LOG, matching the `ponytail:` shortcut convention in spirit. `src/io/csv.ts` is one ~100-line file doing parse/stringify/mapColumns, no premature CSV library. No unrequested abstractions spotted in the diff.

**5. Rule: clean-code** — Mostly clean. Naming is intention-revealing (`applyBzsImport`, `buildWeeklyScheduleHtml`, `requireSuperAdmin`). Error messages are specific ("BZS content is empty — upload the file body, not only the filename", "Slug already exists: {slug}"). One real defect however (see Finding 1): `parseCsvLine` in `src/io/csv.ts` produces a phantom trailing empty field on any line without a trailing comma, which is exactly what a normal CSV row without an intentional empty last column looks like — this is a boundary-condition bug, not a style issue, and it undermines the "one CSV implementation" being correct for the common case. God-file check: `import-export.ts` is ~410 lines mixing samples, preview, commit, and per-type export — borderline but stays one concern (CSV/JSON import-export) and isn't split arbitrarily; acceptable at this size.

**6. Rule: workflow** — `STATUS.md`'s verification evidence section lists concrete running-app checks (status codes, counts) rather than "build succeeded" alone, matching the "running-app evidence, not a successful response" bar. No speculative product invention noticed (screenshot/PDF tradeoffs were flagged as decisions, not just silently narrowed).

**7. Rule: codegraph** — N/A for this reviewer; this workspace (`MasterGenAIInstructions`) has no codegraph index and the contestant prompt for rebuild-b restricts the local rule set to the six always-on rules, no codegraph. Nothing to check here.

**8. Rule: git-discipline** — No `.git` operations expected or found in the reviewed files; the contestant prompt reserves git to the orchestrator. No violation.

**9. Todos / PHASE-PLAN fidelity** — Matches the phase's own "done when" bar (sample files round-trip with preview/errors, exports open, auth boundaries proven) closely; STATUS.md's claims line up with what's actually in the code and what I could reproduce live. The two inventory PARTIALs (column-mapping UI, two-file groups+events pairing) are gaps against the fuller `FEATURE-INVENTORY.md` text rather than against the Phase-Plan's own done-criterion, and STATUS.md doesn't call them out explicitly — a minor under-disclosure, not a fabricated claim.

**10. Context retention** — No contradictions with earlier phases found. Import nav entry flips from disabled to `phaseReady: true` in `src/admin/shell/nav.ts`, consistent with the Phase 9 STATUS note that it was disabled until Phase 10. Super-admin route continues to use the same `getSessionUser`/local-cookie auth model established in Phase 2, and `org-clone.ts` correctly copies every field the Phase 2–9 schema decisions added (styleSchedules, activationRules, memorial `relationship`, etc.) — no dropped fields spotted in the clone path.

**11. Security** — Strong. `requireSuperAdmin()` re-reads `isSuperAdmin` from the DB on every call via `getSessionUser()` (not a cached/signed claim in the session token), so revoking super-admin takes effect immediately — verified this isn't a stale-cookie trust issue by reading `session.ts`. `requireOrgMember` resolves org by id-or-slug then checks membership + role sets (`WRITE_ROLES`/`ADMIN_ROLES`) server-side; superadmins bypass membership but that's an explicit, intended escalation path, not a bypass bug. Super-admin baseline-notes routes scope every update/delete through `findFirst({ id, orgId: null })` before mutating, preventing a super-admin note-edit call from accidentally touching an org-scoped note by id collision. `setSuperAdmin` blocks self-demotion (can't remove your own flag), a sensible guard against lockout. No secrets, no obvious injection surface (Prisma parameterized throughout). One soft note: `/api/admin/orgs` POST accepts arbitrary `latitude`/`longitude`/`timezone` from the body without range/format validation — low severity for a super-admin-only route, not a trust-boundary break.

**12. Code quality — 8/10.** Consistent patterns (every admin API route: auth guard first, `NextResponse.json` early-return, then domain logic), decent error messages, honest DECISION-LOG entries for every place a corner was legitimately cut. Docked for the CSV trailing-field bug (Finding 1) and the two PARTIAL inventory items not being surfaced in STATUS.md.

**13. Findings**

1. **CSV parser bug — phantom trailing empty header on every normal row** (`src/io/csv.ts`, `parseCsvLine`). The line-parsing loop's terminal condition (`if (i === line.length) { out.push(""); break; }`) fires *after* the last real field has already been pushed by the inner value-scan, appending a spurious empty string to every parsed row — including the header row. This means `headers.some(h => !h)` is true for essentially every CSV that doesn't deliberately end with a trailing comma, so `parseCsv` emits `"Header row has empty column names"` on **every normal import**, including the app's own generated samples. Reproduced live: fetched the announcement CSV sample from `/api/org/{orgId}/import` (action=sample), fed it back verbatim to preview and commit — both returned `errors: ["Header row has empty column names"]` despite a well-formed 6-column CSV. Confirmed in isolation with a standalone Node repro of `parseCsvLine` against the literal header string, which returns 7 fields (`["title","titleHebrew","content","contentHebrew","priority","isActive",""]`) instead of 6. Data still writes correctly (the phantom empty-key field is simply unused), so `written` counts are unaffected, but every import surfaces a false-positive error to the user — this contradicts the "sample files round-trip with previews and errors" done-criterion in spirit, since the "errors" shown are noise rather than signal. Not currently caught by `npm run typecheck`/`build` since it's a runtime logic bug, not a type error.
2. **P10.1 import wizard has no column-mapping UI.** The `mapping`/`mapColumns` machinery exists end-to-end in `import-export.ts`/`csv.ts` and is wired into the API route, but `ImportExportHub.tsx` never constructs or sends a `mapping` object — there's no UI to let a user map arbitrary source columns to target fields. Users can only import files that already match the exact expected header names. Half of "map columns, preview, commit" (P10.1) is server-ready but not user-reachable.
3. **P10.5's two-file Groups+Events CSV flow is split into two independent single-file imports** rather than one paired wizard step, and this narrowing isn't recorded in DECISION-LOG. Functionally the underlying data (groups, events) can both be imported, just not together in one file pair with one combined preview/commit as the inventory describes.
4. **Minor:** `/api/admin/orgs` POST does not validate `latitude`/`longitude` are within valid ranges or that `timezone` is a real IANA zone before writing — low-risk given the super-admin-only trust boundary, but worth a follow-up validation pass.

## Scores (1–10 each)
- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 8
- context_retention: 9
- security: 9
- code_quality: 7
