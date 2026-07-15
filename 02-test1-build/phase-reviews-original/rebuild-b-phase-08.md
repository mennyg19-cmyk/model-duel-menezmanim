# Phase review: rebuild-b, Phase 8

## Meta
- Model (orchestrator-assigned): claude-sonnet-5-thinking-high
- Runner: spawn
- Arm reviewed: rebuild-b
- Phase number: 8 — Admin shell, dashboard, screens, and styles
- Diff / files touched this phase (git status, `_experiment` root): `rebuild-b/DECISION-LOG.md`, `rebuild-b/STATUS.md`, `rebuild-b/app/admin/content/page.tsx`, `rebuild-b/app/admin/logout-button.tsx`, `rebuild-b/app/admin/page.tsx`, `rebuild-b/app/admin/schedules/page.tsx`, `rebuild-b/app/globals.css` (modified); new: `rebuild-b/app/admin/[orgSlug]/page.tsx`, `rebuild-b/app/admin/[orgSlug]/screens/`, `rebuild-b/src/admin/dashboard/`, `rebuild-b/src/admin/screens/`, `rebuild-b/src/admin/shell/`. rebuild-a changes in the same working tree are the other arm's parallel work, out of scope here.

## Proof-of-read

**PHASE-REVIEW-RUBRIC.md** — 13-item checklist plus 6 orchestrator scores; write full report with evidence per item, `N/A` + reason where not applicable.

**PHASE-PLAN.md (Phase 8)** — Claims `R5`; `P3`, `P3.1–P3.7`; `P7`, `P7.1–P7.9`; `F1`, `F2`, `F6`, `F-NAV1`. Done-when: each admin section deep-links, and dashboard/screen actions open `/show/...` never `/display`. Phase 9 (members/settings/tutorial/themes) explicitly out of scope for this stop.

**STATUS.md** — Contestant records real routes `/admin/{orgSlug}` and `/admin/{orgSlug}/screens`, client org switch via `router.push`, dashboard stats/quick-add/embedded preview, screens/styles manager with custom resolution, breakpoint schedules, heartbeat, mismatch warnings. Lists its own verification: typecheck/build passed, 200s on admin routes, PUT saved custom resolution, `/show` 200, no `/display` links in HTML, server stopped after.

**DECISION-LOG.md** — Five Phase-8-dated decisions: org-scoped `/admin/[orgSlug]` deep links (F1/F2), soft plan caps (display-only, P3.4), Live Display always `/show` (F-NAV1), screen-selector reconciliation with the editor (carries forward a Phase 7 decision), 5-minute edit lock enforcement on style writes. All logged with a "why" and reversibility note, consistent with autonomous-mode expectations.

**FEATURE-INVENTORY.md IDs for this phase** — R5 (admin shell), P3/P3.1–7 (dashboard: stats, quick actions, Live Display, plan/usage, org switcher, quick-add modals, embedded preview with breakpoint controls), P7/P7.1–9 (screens & styles: list/CRUD, custom resolution F6, breakpoint style schedules, copy URL, open/preview, activate/heartbeat, StyleListPanel, mismatch warnings, today's-active-style-per-breakpoint), F1 (real routes), F2 (client org switch), F6 (custom resolution), F-NAV1 (`/show` not `/display`).

**Phase 8 code** — Read `app/admin/page.tsx`, `app/admin/[orgSlug]/page.tsx`, `app/admin/[orgSlug]/screens/page.tsx`, `src/admin/shell/{AdminShell,nav,types,load-admin}.ts(x)`, `src/admin/dashboard/{DashboardClient,LivePreviewWidget,QuickAddModals}.tsx`, `src/admin/screens/ScreenManager.tsx`, `src/domain/org-access.ts`, `app/api/org/[orgId]/screens/{route.ts,[screenId]/route.ts}`.

## Checklist

**1. Inventory coverage**

- `R5` (admin shell hosting sections) — PRESENT. `AdminShell.tsx` renders sidebar nav + org switcher + all phase-ready sections.
- `F1` (real routes, no state-swap) — PRESENT for dashboard/screens (`/admin/[orgSlug]`, `/admin/[orgSlug]/screens`). Schedules/content stay on query-param routes (`/admin/schedules?org=`) per a logged decision — these were already real Next.js routes from earlier phases, just not org-path-based. Confirmed live: all three return 200 and are independently bookmarkable.
- `F2` (client-side org switch) — PRESENT. `AdminShell.switchOrg` does `router.push(rewriteOrgPath(...))`, no full reload.
- `P3.1–P3.7` — PRESENT. Stat cards with hrefs, quick-action nav, Live Display → `/show`, plan/usage grid, org switcher (shared with F2), 4 quick-add modals (event/announcement/yahrzeit/sponsor) each POSTing to the right endpoint, embedded `LivePreviewWidget` using `BoardSurface` with screen + breakpoint selectors and "Edit in Editor"/"Open Full Screen" actions.
- `P7.1–P7.9` — PRESENT. Screen list with resolution/active/heartbeat, add/edit incl. custom W×H, breakpoint-aware schedule editor (`ScreenStyleSchedule[]`), copy-URL, open/preview, activate/delete, `StyleListPanel`-equivalent style grid (rename/duplicate/set-default/delete/open-in-editor), mismatch warnings (`mismatchWarnings` memo comparing style canvas size to screen resolution), today's-active-style-per-breakpoint preview (`todayByBreakpoint` + live `BoardSurface` thumbnails).
- `F6` (custom resolution) — PRESENT and verified live (see item 2): PUT accepted `1600x900`, distinct from the 4 presets.
- `F-NAV1` (no `/display`) — PRESENT in every UI surface checked (dashboard, live preview, screen manager all build URLs via `publicShowUrl()` → `/show/{slug}/{screenId}`). One regression in the API layer, see Findings #1.

**2. Running app**

Started `npm run dev` (port 3102, already `npm install`'d and seeded from a prior phase). Logged in as `owner@demo.local` via `POST /api/auth/login`, cookie-authenticated for the rest:

- `GET /admin/demo` → 200; `GET /admin/demo/screens` → 200; `GET /admin/schedules?org=demo` → 200; `GET /admin/content?org=demo` → 200; `GET /admin/demo/editor` → 200 (no regression from earlier phases).
- `GET /show/demo/main` → 200; `GET /api/display/demo/main?bp=full` → 200; `POST /api/display/demo/main/heartbeat` → 200.
- Dashboard HTML scanned for `/display` — zero matches.
- `PUT /api/org/{orgId}/screens {id:"main", resolution:"1600x900"}` → 200, screen row updated (F6 live-verified); then restored to `1920x1080`.
- Server stopped after verification (PID killed, confirmed gone).

**3. No stubs** — Quick-add modals actually POST and refresh (not fake success). Schedule editor, style actions (duplicate/rename/default/delete), and lock acquire/release all hit real endpoints with error surfacing. No "coming soon" markers found in this phase's files.

**4. Rule: ponytail** — Mostly clean. One god-file flag: `ScreenManager.tsx` is 695 lines mixing screen CRUD, resolution editor, breakpoint schedule editor, style management, and dual preview rendering — five distinct concerns in one file, over the 500-line/mixed-concern split threshold. Not a correctness bug, but it's the kind of file that should have been split (e.g. schedule-editor and style-panel as siblings) rather than grown in place.

**5. Rule: clean-code** — Naming is intention-revealing (`mismatchWarnings`, `todayByBreakpoint`, `withStyleLock`). Errors state what failed (`Save failed (${status})`) though don't always say the expected state. One pattern per concern held: single `requireOrgMember` helper reused by every route instead of ad hoc auth checks. Minor: the write-role rejection message is hardcoded to `"cannot write schedules/groups"` in `org-access.ts` and reused verbatim by the screens route, so a screens 403 says "schedules/groups" — copy-paste message that doesn't match its call site.

**6. Rule: workflow** — Expectation-then-verify discipline is visible in STATUS.md (typecheck/build, then live 200s, then a real write, then revert, then stop). No speculative product invention — plan caps and lock behavior are logged as explicit, reversible decisions rather than silently assumed.

**7. Rule: codegraph** — N/A. This workspace's `.codegraph/` isn't part of the rebuild-b arm; DECISION-LOG confirms only the empty arm was indexed once, not modified further. No structural-lookup violation observed in the diff.

**8. Rule: git-discipline** — PASS. `git log` shows only orchestrator-authored commits; the contestant's phase-8 changes sit unstaged/untracked in the working tree, consistent with "git belongs to the orchestrator." No contestant-run git commands found.

**9. Todos / PHASE-PLAN fidelity** — Matches the plan's done-when: sections deep-link (dashboard/screens fully, schedules/content via query param — logged tradeoff), and Live Display/preview/copy-URL all resolve to `/show/...`. Phase 9 areas (members/settings/import) correctly left as disabled nav stubs, not built early and not claimed.

**10. Context retention** — Builds correctly on Phase 7: reuses the same `BoardSurface` render path for both the dashboard preview and the screens breakpoint previews (no second renderer introduced), and explicitly reconciles the Phase 7 screen-selector decision instead of dropping or contradicting it. Plan/usage caps and lock enforcement are additive, not conflicting with earlier schema decisions.

**11. Security** — Every screens route call goes through `requireOrgMember`, which 401s with no session, 404s for a non-existent/foreign org, 403s for non-members, and gates writes to owner/admin/editor roles. Screen and style lookups are scoped with `orgId: access.orgId` in the `where` clause (not trusting the client-supplied org), preventing cross-org reads/writes via a mismatched `id`. Public display reads (`/api/display`, `/show`) stay unauthenticated by design (matches the inventory's "public reads" contract) and don't leak admin-only fields based on this review's spot checks.

**12. Code quality: 8/10** — Solid, consistent patterns (one auth helper, one nav helper, one render path); real server-side authorization; genuine live-write verification recorded and independently reproduced. Docked for the `ScreenManager.tsx` god-file and the `publicUrl` API bug below — both are real but contained issues, not architectural problems.

**13. Findings**

1. **`publicUrl` bug in screens API (F-NAV1-adjacent).** `screenDto()` in `app/api/org/[orgId]/screens/route.ts` builds `publicUrl: /show/${row.orgId}/${row.id}` — using the raw org **id**, not the slug. `GET /screens` overrides this correctly with `org?.slug` before returning, but `POST` and `PUT` do not, so their responses carry a broken link. Verified live: `GET /show/{orgId}/main` → 404 (`loadBoardData` in `board-repo.ts` only looks up by `slug`). Currently harmless because the UI (`ScreenManager`, `LivePreviewWidget`, dashboard) all build their own correct URL via `publicShowUrl(orgSlug, screenId)` and ignore the API's `publicUrl` field — but any other consumer of `POST`/`PUT /screens` would get a dead link. One-line fix: reuse the same slug lookup `screenDto` callers use in `GET`.
2. **God file:** `src/admin/screens/ScreenManager.tsx` (695 lines) bundles screen CRUD, resolution editor, breakpoint schedule editor, style management, and two separate live-preview renderers. Candidate for a split (e.g., extract the schedule-entry editor and the style-grid into siblings) next time this file is touched.
3. **Copy-paste error message:** `org-access.ts`'s write-role rejection text ("cannot write schedules/groups") is generic and misleading when returned from the screens/styles/media routes that reuse it.

## Scores (1–10 each)
- inventory_coverage: 9
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 8
- code_quality: 8
