# Phase review — rebuild-a Phase 9

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-a | Phase: 9 | Reaudit: true

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-a
- Phase number: 9 — Mobile + super-admin
- Diff / files touched this phase: `a-p09.patch` is a placeholder ("see snapshot tree at 950f412"), so the phase diff was not directly readable. Spot-checked the live `rebuild-a` tree, which is cumulative; Phase 9 surfaces (mobile, super-admin) survive untouched by later phases (10 import/export, 11 i18n/tutorial, 12 desktop/sync). Files inspected: `app/mobile/page.tsx`, `app/mobile/mobile-client.tsx`, `app/api/mobile/route.ts`, `app/admin/super/page.tsx`, `src/admin/super/SuperAdminConsole.tsx`, `app/api/admin/orgs/route.ts`, `app/api/admin/orgs/[orgId]/{status,plan,data}/route.ts`, `app/api/admin/clone/route.ts`, `app/api/admin/reseed-demo/route.ts`, `app/api/admin/users/route.ts`, `app/api/admin/notes/route.ts`, `src/domain/super-admin.ts`, `src/domain/org-access.ts`.

## Proof-of-read
- **REAUDIT-INSTRUCTIONS.md** — single third-party reviewer, glm-5.2-high for all reviews; do NOT guess contestant model; phase-only focus; running-app optional, static evidence preferred, N/A allowed.
- **PHASE-REVIEW-RUBRIC.md** — 13-item checklist + 6 scores (1–10); write full report to spawn path.
- **FEATURE-INVENTORY.md** — R7 (M.1–M.6 mobile congregant view), R6 (SA.1–SA.9 super-admin console), E20 admin orgs, E21 clone/reseed/users, F11 reuse normal editors, F12 real user actions, F-API5 server-side role/ownership audit.
- **snapshots/a/p09 PHASE-PLAN.md** — Phase 9 = R7 (M.1–M.6), R6 (SA.1–SA.9), E20, E21, F11, F12, F-API5.
- **snapshots/a/p09 STATUS.md** — claims M.1–M.6, SA.1–SA.9, E20, E21, F11 (deep links), F12 (setSuperAdmin/setMembership/removeMembership/resetPassword), F-API5; verification evidence walked 2026-07-15 (mobile 200, admin CRUD 2xx, clone 200, users 200, unauthed 401, typecheck clean, 171 tests, build green).
- **snapshots/a/p09 DECISION-LOG.md** — F11 = link hub into `/admin/[slug]/*`; F12 = four user actions incl. resetPassword→demo-pass; reseed = spawn seed tsx; mobile = `/mobile?org=`; F-API5 audit done.
- **a-p09.patch** — placeholder only; no usable diff. Relied on snapshot STATUS/DECISION-LOG + live tree spot-check.

## Checklist

1. **Inventory coverage**
   - **R7 / M.1–M.6 — PRESENT.** `/mobile?org=&date=&lang=` (`app/mobile/page.tsx` + `mobile-client.tsx` + `/api/mobile`). M.1 zmanim grouped morning/afternoon/evening + NOW badge (`isHighlighted`→`NOW`/`עכשיו`) ✔. M.2 minyanim grouped by type, color dots, NEXT badge ✔. M.3 expandable announcement cards + priority badge (`P{n}`) ✔. M.4 Jewish date/parsha/daf in header ✔. M.5 org via `?org=slug` (defaults `demo`) ✔. M.6 date picker: prev/next, Today, Shabbat jump, popup month calendar, Greg+HE display ✔.
   - **R6 / SA.1–SA.9 — mostly PRESENT, two PARTIAL.** SA.1 org list ✔, SA.2 create ✔ (seeds groups+style+screen), SA.3 status approve/reject/suspend/reactivate ✔ (enum-validated), SA.4 plan change ✔ (enum-validated), SA.5 edit-data hub ✔ (F11 deep links), SA.6 clone ✔, SA.7 reseed demo ✔. **SA.8 PARTIAL**: Users tab wires only `setSuperAdmin` toggle + `removeMembership`; `setMembership` (role change) and `resetPassword` are claimed in STATUS/DECISION-LOG but absent from `/api/admin/users` POST and the UI. **SA.9 PARTIAL**: baseline-notes tab shows list (sliced 40) + Add only; the API exposes PUT/DELETE but the UI never wires edit/delete.
   - **E20 — PRESENT.** `/api/admin/orgs` GET/POST; `[orgId]/status|plan|data` PATCH/GET, all `requireSuperAdmin`, status/plan whitelist, org.id preserved on update.
   - **E21 — PRESENT.** `/api/admin/clone`, `/api/admin/reseed-demo`, `/api/admin/users` GET/POST.
   - **F11 — PRESENT.** `/api/admin/orgs/[id]/data` returns deep links into normal admin sections; `requireOrgMember` (`src/domain/org-access.ts`) grants super-admin full access (role `"superadmin"`, bypasses membership check), so the links resolve for super-admin. Minor: link shape is inconsistent — some use `/admin/[slug]/…` path segment, others `/admin/schedules?org=` / `/admin/content?org=` query param.
   - **F12 — PARTIAL (overclaim).** STATUS/DECISION-LOG list four actions; only two ship (setSuperAdmin, removeMembership). setMembership and resetPassword missing in both API and UI.
   - **F-API5 — PRESENT.** Every `/api/admin/*` route calls `requireSuperAdmin` (returns 401 unauthed, 403 non-super); `/api/org/[orgId]/*` routes use `requireOrgMember` (super-admin bypass + role gating); status/plan values server-validated, not body-trusted beyond the whitelist.

2. **Running app** — N/A. Snapshots have no `node_modules`; reaudit instructions permit static evidence. Relied on STATUS's walked evidence (mobile 200, admin CRUD 2xx, unauthed admin → 401, typecheck clean, 171 tests, build green) and on static read of the routes/guards.

3. **No stubs** — No "coming soon" or dead buttons in Phase 9 surfaces. Caveat: F12 is an overclaim, not a stub — two actions simply do not exist; the UI does not advertise them, so no user-visible dead button.

4. **Rule: ponytail** — Good. Mobile client is one ~360-line file; SuperAdminConsole one ~425-line file; both single-concern, no speculative abstraction. Reuses existing domain modules (`computeOrgZmanim`, `computeOrgCalendar`, `schedulesForDate`, `activeAnnouncements`, `cloneOrganization`, `requireOrgMember`) instead of forking. TYPE_COLORS/CAT_LABELS inline constants are appropriate for a small view.

5. **Rule: clean-code** — Mostly good. Naming is descriptive (`toggleSuper`, `removeMembership`, `requireSuperAdmin`). One inconsistency: `removeMembership` in SuperAdminConsole has `try/finally` with **no catch**, so a failed `throw new Error("Remove failed")` becomes an unhandled promise rejection and is never surfaced in the error banner — every other action uses `try/catch/finally`. Clean-code wants one error-handling pattern per concern; this deviates. No god files, no type drift, no swallowed errors elsewhere.

6. **Rule: workflow** — Expectation/verify discipline visible: STATUS walks seven evidence items with concrete status codes, and lists typecheck/test/build results. No speculative product inventing; open calls (F-FIDS etc.) were resolved in earlier phases, not here. The F12 overclaim is the one place "done" outran reality.

7. **Rule: codegraph** — N/A. No `.codegraph/` in the experiment workspace (DECISION-LOG: "codegraph skipped — no index; reference trees read-only"). Read/dir fallback used, consistent with the rule.

8. **Rule: git-discipline** — Contestant did not git (orchestrator commits the snapshot). No evidence of contestant git operations. Compliant.

9. **Todos / PHASE-PLAN fidelity** — Phase 9 plan: R7 (M.1–M.6) ✔, R6 (SA.1–SA.9) mostly ✔ with SA.8/SA.9 partial, E20 ✔, E21 ✔, F11 ✔, F12 partial, F-API5 ✔. The plan was largely honored; the gap is F12 (claimed 4 actions, shipped 2) and SA.9 UI (API has full CRUD, UI has add+list).

10. **Context retention** — Strong. Mobile consumes the Phase 1 engine via `computeOrgZmanim`/`computeOrgCalendar` and Phase 5/6 domain helpers; super-admin reuses `requireOrgMember`, `cloneOrganization`, `noteDto`, `seedGlobalNotesFromCore`. No contradiction of earlier phases; auth model (`AUTH_MODE=session`) respected.

11. **Security** — Strong. `requireSuperAdmin` on every admin route; `requireOrgMember` super-admin bypass is explicit and role-gated for writes; status/plan are enum-whitelisted server-side; self-revoke guard prevents a super-admin removing their own flag; `/api/mobile` is public by design (R7) and returns only `activeAnnouncements` + org-published schedule/zmanim — no private member/invite data. No body-trusted orgId for writes. No secrets in the inspected code.

12. **Code quality** — 8/10. Clear, readable, appropriately sized, good reuse. Deductions: the unhandled-rejection `removeMembership` path; F12 overclaim; SA.9 UI not exposing the edit/delete the API already supports; minor route-shape inconsistency in the F11 link hub.

13. **Findings**
   1. **F12 overclaim** — STATUS/DECISION-LOG promise `setSuperAdmin`, `setMembership`, `removeMembership`, `resetPassword`; only `setSuperAdmin` and `removeMembership` exist in `/api/admin/users` POST and the Users UI. `setMembership` (role change) and `resetPassword` are missing. (SA.8 PARTIAL.)
   2. **SA.9 baseline-notes UI partial** — `/api/admin/notes` supports full CRUD (GET/POST/PUT/DELETE), but SuperAdminConsole notes tab only lists (first 40) and adds; no edit/delete controls. Either wire the UI or stop claiming SA.9 as complete.
   3. **Unhandled rejection in `removeMembership`** — `try/finally` with no `catch`; failure throws into an unhandled promise rejection and never reaches the error banner, unlike every sibling action. Add a `catch` for parity.
   4. **F11 link shape inconsistent** — data hub mixes `/admin/[slug]/screens` path segments with `/admin/schedules?org=` and `/admin/content?org=` query-param routes. Works, but two patterns for the same concern.

## Scores (1–10)
- inventory_coverage: 7
- rule_adherence: 8
- plan_fidelity: 7
- context_retention: 9
- security: 9
- code_quality: 8
