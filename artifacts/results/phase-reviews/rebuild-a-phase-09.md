# Phase 9 review — Mobile + super-admin

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 9

## Proof-of-read

### `results/PHASE-REVIEW-RUBRIC.md`
- Requires evidence or an explicit N/A for every checklist item.
- Requires coverage, running-app, stub, rule, plan, context, security, and code-quality checks.
- Requires six 1–10 aggregation scores at the bottom of this report.

### `rebuild-a/PHASE-PLAN.md`
- Phase 9 claims R7/M.1–M.6, R6/SA.1–SA.9, E20, E21, F11, F12, and F-API5.
- The intended mobile route is `/mobile?org=slug`; the intended super-admin route is `/admin/super`.
- Earlier plan work establishes the normal org-admin editors that F11 must reuse, rather than duplicate.

### `rebuild-a/STATUS.md`
- Claims mobile grouping, badges, date navigation, super-admin organization and user controls, baseline notes, and guarded APIs.
- Claims a completed manual run on port 3101 with 171 tests, typecheck, and build green.
- Claims Phase 10 was not started and Phase 9 changes are the active working-tree changes.

### `rebuild-a/DECISION-LOG.md`
- Records F11 as deep links to normal `/admin/[slug]/*` editors and F12 as real PATCH actions.
- Records a super-admin guard for every Phase 9 `/api/admin/*` endpoint and role guards for `/api/org/[orgId]/*`.
- Records `/mobile?org=` as the deliberate R7 route and reseed as the same script used by `db:seed`.

### `inventory/FEATURE-INVENTORY.md`
- Defines R7’s grouped zmanim/minyanim, NOW/NEXT/priority badges, org query parameter, Jewish context, and date controls.
- Defines R6’s organization lifecycle, cloning, user actions, baseline notes, and normal-editor reuse.
- Defines E20/E21 as super-admin-only, F11 as no duplicate editor, F12 as no stub actions, and F-API5 as a server-side audit.

### Phase 9 implementation under `rebuild-a`
- Read the mobile page/view, super-admin page/console, all nine admin API routes, auth guards, org access, admin helpers, and dashboard loader.
- Read the 28 org API route paths and confirmed 27 directly import `requireOrgRole`; the by-slug dashboard route delegates to `loadDashboardStats`, which uses `requireOrgBySlug`.
- Static review found one stale, broken display deep link in the F11 data hub and two user-action success-reporting gaps.

## Checklist

1. **Inventory coverage — PARTIAL**
   - **R7 / M.1–M.6: PRESENT.** `app/mobile/page.tsx` resolves `?org=` and an optional date, builds a mobile snapshot, and `src/mobile/MobileView.tsx` groups zmanim, groups/color-codes minyanim, marks next items, expands announcements, displays Hebrew date/parsha/daf, and provides previous/next/Today/Shabbat/native-calendar controls.
   - **R6 / SA.1–SA.9: PRESENT.** `app/admin/super/page.tsx` blocks non-super-admins. `SuperAdminConsole.tsx` supplies organization, user, and baseline-note tabs with the claimed lifecycle, plan, clone, reseed, and membership controls.
   - **E20/E21: PRESENT.** All nine `/api/admin/*` routes exist and each calls `requireSuperAdmin`.
   - **F11: PARTIAL.** The hub reuses normal admin URLs, but it also returns `display: /display/${org.slug}` in `app/api/admin/orgs/[orgId]/data/route.ts:41`. The inventory identifies `/display` as a known nonexistent route; this link is broken.
   - **F12: PRESENT with feedback gaps.** PATCH implements the four requested actions rather than returning placeholders. Some mutations return success even when their target ID matches no row.
   - **F-API5: PRESENT by static audit.** All org-id routes have direct role guards, the by-slug dashboard loader resolves and guards the slug server-side, and all admin routes have super-admin guards.

2. **Running app — NOT REVERIFIED**
   - I requested `http://localhost:3101/mobile?org=demo` and `/api/admin/orgs` without credentials; both returned `000`, so no server was running.
   - I did not start a server or change data. STATUS records the contestant’s prior port-3101 walkthrough, including public mobile 200 and unauthenticated admin 401.

3. **No stubs — PARTIAL**
   - No “coming soon” or empty event handler appears in the Phase 9 UI.
   - F12 actions issue real guarded PATCH requests, and their route performs database updates/inserts/deletes.
   - The F11 hub exposes one dead `/display/...` link, so the hub is not fully usable.

4. **Rule: ponytail — PASS**
   - The implementation reuses `buildDisplaySnapshot`, `requireSuperAdmin`, `requireOrgRole`, normal org-admin pages, and the existing seed script.
   - No duplicate super-admin data editor was added. The client console is large but is one route-specific screen with real interactions.

5. **Rule: clean-code — PARTIAL**
   - Auth logic is centralized in `src/auth/guards.ts`; slug access is centralized in `src/auth/org-access.ts`.
   - Validation for plan, status, role, and required bodies is clear. Error handling consistently converts `AuthError` to 401/403.
   - `users` PATCH should confirm affected rows for `setSuperAdmin`, `removeMembership`, and `resetPassword`; otherwise the UI reports “User updated” for unknown IDs.

6. **Rule: workflow — PASS with verification limitation**
   - STATUS includes claimed acceptance evidence and a clear stop before Phase 10.
   - The Plan, STATUS, and Decision Log agree on the core Phase 9 scope. This review could not independently exercise the app because port 3101 was unavailable.

7. **Rule: codegraph — N/A**
   - DECISION-LOG records that the experiment has no CodeGraph index. No CodeGraph tool was available for this review.
   - Static fallback review covered the Phase 9 routes and guard usage.

8. **Rule: git-discipline — PASS**
   - `git log -5` ends at the Phase 8 review/implementation commits; it contains no Phase 9 contestant commit.
   - The Phase 9 files are uncommitted working-tree additions/modifications, consistent with the contestant’s no-git instruction.

9. **Todos / PHASE-PLAN fidelity — PARTIAL**
   - The claimed mobile, super-admin, API, user-action, and guard work is implemented in the planned routes and modules.
   - The stale F11 display link contradicts the pre-existing F-NAV1 decision to use `/show/{slug}/{screenId}` rather than `/display`.

10. **Context retention — PARTIAL**
   - The implementation correctly carries forward the `?org=` mobile decision, normal editor reuse, existing snapshot builder, session roles, and baseline notes.
   - The `/display/${org.slug}` link regresses the earlier F-NAV1 route decision.

11. **Security — PASS with caveats**
   - Super-admin routes call `requireSuperAdmin`; unauthenticated calls are handled as 401 and non-super-admin calls as 403 by the shared guard.
   - Org routes require a membership-derived role. The slug dashboard path resolves the org server-side before applying the role check.
   - No secret or client-supplied authorization flag was found in Phase 9. The user-action false-success cases are integrity/UX defects, not authorization bypasses.

12. **Code quality — 7/10**
   - The core route boundaries and reuse choices are sound, and the UI is wired to actual APIs.
   - One known-dead navigation target and success responses for nonexistent user/membership IDs keep this below a clean phase gate.

13. **Findings**
   1. **P1 — Broken F11 display link.** `app/api/admin/orgs/[orgId]/data/route.ts:41` returns `/display/${org.slug}`, but the inventory and Decision Log say `/display` does not exist and F-NAV1 moved display navigation to `/show/{slug}/{screenId}`. The data hub should not expose this dead link.
   2. **P2 — F12 can report success for nonexistent targets.** In `app/api/admin/users/route.ts`, `setSuperAdmin`, `removeMembership`, and `resetPassword` do not inspect an affected row/result. A nonexistent `userId` or `membershipId` receives `{ ok: true }`, causing the console to display a false success message.

## Scores

- inventory_coverage: 8
- rule_adherence: 8
- plan_fidelity: 7
- context_retention: 7
- security: 8
- code_quality: 7
