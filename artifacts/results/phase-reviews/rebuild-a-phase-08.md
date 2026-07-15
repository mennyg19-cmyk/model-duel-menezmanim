# Phase review — rebuild-a / Phase 8

Model: gpt-5.6-terra-high | Runner: spawn | Arm: rebuild-a | Phase: 8

## Proof-of-read

**results/PHASE-REVIEW-RUBRIC.md**
- Requires evidence or an explicit N/A for all 13 checklist items and six 1–10 aggregation scores.
- Requires a separate inventory status rather than accepting a phase-complete claim at face value.
- Requires examination of running behavior, stubs, rules, plan fidelity, retention, and security.

**rebuild-a/PHASE-PLAN.md — Phase 8**
- Assigns P7.1–P7.9 and F6, E13; P8.1–P8.5 and E16/E17; and P9.1–P9.7 and F7/F8.
- Makes this phase responsible for screens/styles, members/invites, and settings rather than editor or mobile work.
- The plan places P7 schedule resolution on the existing style engine and expects all listed IDs to be complete.

**rebuild-a/STATUS.md**
- Claims Phase 8 complete and enumerates all P7, P8, P9, E13, E16, E17, F6, F7, and F8 IDs.
- Records authenticated API checks, custom-resolution creation, invite creation/revocation, settings save, and green typecheck/test/build.
- Says Phase 9 has not started and the claimant stopped its dev server after verification.

**rebuild-a/DECISION-LOG.md**
- Records the one Save-all settings model and the `Intl.supportedValuesOf("timeZone")` fallback decision.
- Records the settings-bag representation for Rabbeinu Tam type/value and the column sync for minutes.
- Records that invite links use the existing `/onboarding?invite=` acceptance path, without a separate invite page.

**inventory/FEATURE-INVENTORY.md — P7, E13, P8, E16, E17, P9, F6, F7, F8**
- P7 requires editable custom screen dimensions, fully configurable breakpoint-aware style schedules, screen actions, style management, mismatch warnings, and active-style previews.
- P8 requires an owner/admin-only member and invitation manager, including actual invite/resend/revoke behavior.
- P9 requires profile/location/halacha/zman overrides/display/kiosk/plan/name settings; F7 replaces independently clobbering saves and F8 requires a real timezone source.

**Phase 8 implementation**
- Reviewed the three route pages, `ScreensManager`, `MembersManager`, `SettingsPage`, shared form styles, navigation, E13/E16/E17/settings routes, and their guards.
- The UI is backed by real REST calls and server-side membership checks rather than placeholder components.
- The phase has no targeted test files for its new routes or client behaviors; the existing suite mostly covers prior core/editor work.

## Gate result

**FAIL — do not advance Phase 9.** Most of the surface is real, but P7.3 cannot configure the selected day-of-week or date-range schedule rules, and P8 exposes member management to viewers despite the inventory's owner/admin-only requirement. The claimed complete inventory coverage is therefore not established.

## Checklist

1. **Inventory coverage**
   - **P7.1, P7.2, P7.4–P7.9, E13, F6 — PRESENT.** `ScreensManager` lists screen state, supports create/edit/delete/activate, custom width/height, copy URL, preview, style CRUD, mismatch warnings, and active-style preview. E13 has guarded GET/POST/GET-one/PATCH/DELETE handlers.
   - **P7.3 — PARTIAL.** The form selects default, day-type, day-of-week, Gregorian-range, or Hebrew-range rules and persists `styleSchedules` with a breakpoint and priority. After selecting day-of-week or either date-range type, it offers no controls for the days or range boundaries; it silently stores all days or the full year. This does not meet the claimed editable mapping behavior.
   - **P8.1–P8.3 and E16 — PARTIAL.** Member list, role change, confirmation-based removal, and last-owner/self-removal protections exist. However, E16 GET permits every viewer and the page exposes the list to them, contrary to the inventory's owner/admin-only P8 constraint.
   - **P8.4–P8.5 and E17 — PARTIAL.** Invite rows are persisted, role-guarded, and copyable; revoke works. “Send invite” and “Resend” only create or rotate an on-screen token. No email is sent, so the stated email invite/resend action is not delivered.
   - **P9.1–P9.7, F7, F8 — PRESENT.** Tabs cover profile, location, halacha/zman settings, display/locale, kiosk, display-name overrides, and plan details. Save all submits a single settings/config payload; the timezone source uses `Intl.supportedValuesOf` with a fallback list.

2. **Running app**
   - Independently ran `npm run typecheck`, `npm test`, and `npm run build`: all succeeded. Vitest reported 17 files and 171 tests passed.
   - The existing 3101 server's logs show authenticated 200/201 results for screens, members, invites, settings, and all three admin routes.
   - I requested the three admin routes myself after the prior session had ended; each redirected unauthenticated access with HTTP 307. The server on port 3101 was then stopped and the port no longer listened.
   - No browser-driven authenticated interaction was available, so create/edit controls and visual behavior were traced in source rather than independently clicked.

3. **No stubs**
   - The major controls call real endpoints, reload state, and show API errors. There are no “coming soon” placeholders in the phase surface.
   - The invite controls are misleadingly named: no outbound email action exists. This is functional token management, not sending or resending an email invitation.
   - Day-of-week and date-range schedule choices are visible but lack the controls required to configure their values; these are partial controls, not completed schedule editing.

4. **Rule: ponytail**
   - Shared `formStyles.ts` removes repeated base styles across the three screens, and the code reuses Phase 7's style engine rather than introducing another scheduler.
   - The shortfall is incompleteness, not excess abstraction: `setRuleType` creates fixed default values without exposing their required parameters.
   - Result: **PARTIAL**.

5. **Rule: clean-code**
   - Strengths: focused manager components, a small shared style module with three real call sites, explicit API errors on major writes, and server-side role checks.
   - Problems: write handlers accept arbitrary screen resolution strings and unvalidated style-schedule structures. The settings route deletes all D10 rows and recreates them without validating uniqueness or field values before mutating data.
   - Result: **PARTIAL**.

6. **Rule: workflow**
   - STATUS has a meaningful claimed-ID list and records commands plus API output. The implementation stayed in the assigned Phase 8 area.
   - No expectation artifact or Phase 8-focused automated test covers the claimed screen schedule configuration, RBAC, invite delivery semantics, or settings save failure/round-trip.
   - Completion was claimed despite the incomplete schedule editor and P8 authorization mismatch.
   - Result: **PARTIAL**.

7. **Rule: codegraph**
   - **N/A.** DECISION-LOG records that the experiment workspace was unindexed and codegraph was intentionally skipped. This reviewer used direct source inspection.

8. **Rule: git-discipline**
   - The working tree contains the Phase 8 implementation as uncommitted changes plus experiment status files. No contestant `git` command can be established from the inspected evidence.
   - The contestant's no-git constraint is not violated by the available record.

9. **Todos / PHASE-PLAN fidelity**
   - The changed files and endpoint families align with the plan's screens, members, and settings scope; no Phase 9 mobile or super-admin implementation appears.
   - The plan promises P7.3 and P8.1–P8.5 as complete. Missing schedule parameters and viewer-visible membership management mean this is not complete plan fidelity.
   - Result: **PARTIAL**.

10. **Context retention**
   - Good: P7 reuses `resolveScreenStyleSchedules` and `resolveStyleForScreen` from the existing style engine, retaining the Phase 2/7 breakpoint-aware scheduling path.
   - Good: P9 follows the logged F7/F8 and Rabbeinu Tam decisions instead of creating competing persistence paths.
   - Weak: the reused schedule data model supports parameterized rules, but the new UI drops their configurability.
   - Result: **PARTIAL**.

11. **Security**
   - E13 writes require editor/admin roles as appropriate, E17 requires admin, and E16 prevents self-removal and removal/demotion of the last owner. The organization ID is used in membership/invite queries.
   - **High issue:** E16 GET uses `viewer`, and `MembersManager` intentionally displays member identities to viewers. The inventory explicitly requires P8 owner/admin-only. A viewer can enumerate member name, email, and role through `/api/org/[orgId]/members`.
   - **Medium issue:** screen POST/PATCH validates only the fallback `assignedStyleId` in PATCH. It does not validate custom `resolution` values or every scheduled `styleId`, allowing invalid/cross-org schedule references to be stored.
   - Result: **PARTIAL**.

12. **Code quality — 7/10**
   - The phase provides coherent, readable admin interfaces with real persistence, shared styling, typed response shapes, destructive-action confirmation, and passing project checks.
   - Missing rule configuration, incomplete email semantics, overly broad member reads, and weak request validation prevent a phase-ready score.

13. **Findings**
   1. **Blocking — P7.3 is not a configurable style-schedule editor.** `ScreensManager.setRuleType()` fixes day-of-week to all days and both date ranges to full-year defaults. The UI exposes no fields to change these values, even though the inventory requires editable day/date mappings per breakpoint.
   2. **High — P8 owner/admin-only access is violated.** `members/route.ts` accepts `viewer` for GET, and `MembersManager` displays all names, emails, and roles after that request. Restrict the page and E16 GET to the intended management roles or change the inventory requirement with an explicit decision.
   3. **Medium — “Send invite” and “Resend” do not send anything.** E17 persists or rotates an invitation token, while the UI only exposes a copied link. This cannot be described as email invitation delivery or resend.
   4. **Medium — E13 accepts invalid screen schedule data.** POST does not verify the requested fallback style belongs to the org; PATCH verifies only the fallback, never each scheduled style. Both routes accept arbitrary resolution strings. Validate the complete payload before persistence.
   5. **Medium — P9's full replacement of D10 configs has no transaction or input validation.** The route deletes existing configs before inserting caller-supplied rows. A malformed/duplicate payload can leave settings changed with missing overrides if insertion fails.
   6. **Medium — Phase 8 lacks focused tests.** The suite passes, but it does not exercise the new authorization boundaries, schedule rule inputs, invite lifecycle semantics, or Save-all replacement behavior.

## Scores

- inventory_coverage: 6
- rule_adherence: 6
- plan_fidelity: 6
- context_retention: 7
- security: 5
- code_quality: 7
