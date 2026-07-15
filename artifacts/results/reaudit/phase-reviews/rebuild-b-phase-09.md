Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 9 | Reaudit: true

# Phase 9 review — rebuild-b (Members, settings, tutorial, admin themes)

## Meta
- Model (orchestrator-assigned): glm-5.2-high
- Arm reviewed: rebuild-b
- Phase number: 9
- Diff / files touched this phase: `app/admin/[orgSlug]/members/page.tsx`, `app/admin/[orgSlug]/settings/page.tsx`, `app/api/org/[orgId]/members/route.ts`, `app/api/org/[orgId]/invites/route.ts`, `app/api/org/[orgId]/settings/route.ts`, `src/admin/members/MembersManager.tsx`, `src/admin/settings/SettingsClient.tsx`, `src/admin/tutorial/{TutorialLauncher.tsx,chapters.ts}`, `src/admin/theme/{ThemePickerAdmin.tsx,admin-themes.ts}`, `src/admin/i18n/admin-strings.ts`, `src/domain/org-settings.ts`, plus `AdminShell.tsx` wiring for theme/tutorial/locale. (No phase diff patch was produced — `diffs/b-p09.patch` contains only a Phase 1 placeholder line — so evidence is taken from the snapshot tree.)

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: single third-party reviewer, GLM model for all reviews, do not guess contestant model; phase review uses the rubric, focus on claimed IDs at the snapshot + phase diff, running-app optional (say N/A if not run).
- `PHASE-REVIEW-RUBRIC.md`: 13-item checklist (meta, proof-of-read, inventory coverage, running app, no stubs, ponytail, clean-code, workflow, codegraph, git-discipline, plan fidelity, context retention, security, code quality, findings) + 6 scores 1–10.
- `FEATURE-INVENTORY.md`: Phase 9 IDs are `P8.1–P8.5` (members CRUD + invites, owner/admin RBAC), `P9.1–P9.7` (profile, location, halacha + Rabbeinu Tam type/value pair, per-zman overrides, locales, plan, kiosk prefs, Display Names editor), `P11` (interactive tutorial chapters), `P12` (admin theme picker via CSS vars), `E16`/`E17` (members + invites API), `F7` (one coherent settings save), `F8` (real timezone source), `F-I18N3` (shell strings through `t()`, no inline colors).
- `snapshots/b/p09/PHASE-PLAN.md` (Phase 9): claims the same IDs; done = role guards hold, settings don't clobber, every tutorial target reachable, theme/locale survive reload.
- `snapshots/b/p09/STATUS.md`: lists completed members/settings/tutorial/theme work, typecheck/build pass, running-app evidence (200s, invite 201, settings PUT set `uiLocale=he`/`theme=light`/tutorial `dashboard`, location-only save kept locale/theme with `merge_ok=true`, viewer got 403 on members GET and invites POST), stopped before Phase 10.
- `snapshots/b/p09/DECISION-LOG.md`: section-merge settings PUT (F7), `Intl.supportedValuesOf("timeZone")` (F8), joyride-free fixed-overlay tutorial (P11), admin deep links under `/admin/[orgSlug]`, flat `/api/me`, plus many earlier-phase decisions carried forward.
- `diffs/b-p09.patch`: only a Phase 1 placeholder line — no real diff. Reviewed the snapshot tree directly.
- Spot-check of `snapshots/b/p09`: confirmed members/settings routes + APIs, tutorial launcher + 7 chapters, theme picker + 4 built-in themes + custom, admin-strings `t(en|he)`, `org-settings.ts` merge function, `org-access.ts` role guards.

## Checklist

1. **Inventory coverage** —
   - `P8.1` member list: PRESENT (`MembersManager.tsx` renders name/email/role).
   - `P8.2` change role: PRESENT (PATCH `/api/org/[orgId]/members`, role validated against `ROLES` set, last-owner guard).
   - `P8.3` remove with confirm: PRESENT (`confirm("Remove this member?")` + DELETE `?membershipId=`; cannot remove self; last-owner guard).
   - `P8.4` invite by email + role: PRESENT (POST `/api/org/[orgId]/invites`, 14-day expiry, dedupes existing pending, rejects existing member with 409).
   - `P8.5` pending resend/revoke: PRESENT (resend via `resendId` rotates token + resets expiry; revoke via DELETE `?id=`).
   - `P9.1` profile: PRESENT (name edit + Save profile section).
   - `P9.2` location (lat/lng/elevation/timezone/inIsrael): PRESENT; timezone select is populated from `Intl.supportedValuesOf("timeZone")` with a 5-zone fallback (F8 satisfied).
   - `P9.3` halacha + Rabbeinu Tam type/value pair: PRESENT (dialect, candleLightingMinutes, shabbatEndType/Value, amPmFormat, `rabbeinuTam.type` minutes|degrees + value). Note: only the minutes branch writes the `rabbeinu_tam_minutes` column; the degrees value lives only in the settings blob — acceptable given the schema has no degrees column.
   - `P9.3` per-zman `ZmanimConfig` overrides: PARTIAL — UI renders only the first 12 of 32 zman types (`ZMAN_KEYS.slice(0, 12)`); admins cannot edit the other 20 from the page. Save still writes only edited rows, so persistence is correct, but editor coverage is incomplete.
   - `P9.4` display/locale defaults: PRESENT (`uiLocale`, `boardDefaultLocale`, `objectTextLocale` selects).
   - `P9.5` plan info: PRESENT (read-only; defers changes to Phase 10 super-admin).
   - `P9.6` kiosk prefs: PRESENT (defaultDisplayLanguage, kioskMode, hideCursor, autoStartOnBoot).
   - `P9.7` Display Names editor: PARTIAL — renders only the first 8 zman keys + the 8 tefilah keys; the other 24 zman display names have no UI editor. Persistence is correct, coverage is incomplete.
   - `P11` tutorial: PRESENT (chapter launcher, fixed-position spotlight + card, `data-tutorial` hooks, completed-chapter persistence via settings PUT). Chapters cover dashboard, screens, schedules, content, editor, settings, members. PARTIAL against the inventory's "across dashboard, styles, screens, groups, events, editor, widgets, settings" — no dedicated styles/groups/events/widgets chapters; each chapter is 1–2 steps, thin.
   - `P12` admin theme picker: PRESENT (dark/light/mono-dark/mono-light/custom, CSS-variable application on `documentElement`, persisted in org settings blob, custom color slots).
   - `E16`/`E17`: PRESENT (members + invites route groups, role-guarded).
   - `F7`: PRESENT — single `PUT /settings` accepts named sections and merges via `mergeSettingsBlob`; unrelated keys are preserved (STATUS shows location-only save kept `uiLocale`/`theme` with `merge_ok=true`). The four independent Save buttons still exist in the UI, but each sends only its section, so the clobber bug is fixed.
   - `F8`: PRESENT (`Intl.supportedValuesOf`).
   - `F-I18N3`: PARTIAL — admin shell nav strings go through `t(en|he)` and theme tokens are CSS variables (no inline hex in components). But `SettingsClient` and `MembersManager` hardcode section headers, labels, and button text in English ("Organization profile", "Save location", "Team access", "Send invite", etc.); `admin-strings.ts` only carries nav + a handful of keys. Inventory says "every applicable string through `t()`" — not met for page bodies.

2. **Running app** — N/A. No `node_modules` in the snapshot; per reaudit instructions, static evidence only. STATUS reports typecheck/build pass and running-app evidence (200s, invite 201, settings PUT persisted, viewer 403), but I did not re-run.

3. **No stubs** — No dead buttons or "coming soon" marked done. Members/settings/tutorial/theme all have real handlers. The per-zman and display-names editors are truncated to a subset but the controls that exist are wired and persist. Plan-info section intentionally defers writes to Phase 10 with an explicit note — not a stub.

4. **Rule: ponytail** — Good. Avoided `react-joyride` and used a hand-rolled fixed-overlay tutorial (ladder rung 3: native React). No new deps. No unrequested abstractions. `mergeSettingsBlob` is the one shared helper and it has multiple real call sites. Shortest working diff for the scope.

5. **Rule: clean-code** — Good. Names state intent (`memberDto`, `inviteDto`, `requireOrgMember`, `mergeSettingsBlob`). One fetch/error pattern per component. Errors carry status + body message. No god files; members and settings are split into route + client component. `OrgSettingsBlob` is the single source for the settings shape. Minor: `SettingsClient` repeats the `setData((p) => ({ ...p, settings: { ...p.settings, kiosk: { ...kiosk, [key]: ... } } }))` nested-update shape several times — readable but a small helper would reduce repetition; leaving it inline is defensible under Rule of 2.

6. **Rule: workflow** — Expectation/verify discipline visible: STATUS records observable evidence (HTTP codes, persisted `uiLocale=he`, `merge_ok=true`, viewer 403) and explicitly stopped before Phase 10. DECISION-LOG logs the F7/F8/P11 design choices with rationale and reversibility. No speculative product inventing — plan changes are limited to mapping the claimed IDs.

7. **Rule: codegraph** — N/A for review (reviewer is read-only on the snapshot; structural lookups not required). The snapshot has a `.codegraph/` dir; contestant's own protocol compliance is not assessable from the tree alone.

8. **Rule: git-discipline** — Contestant did not git (orchestrator owns commits/pushes per the experiment prompt). No violation.

9. **Todos / PHASE-PLAN fidelity** — Plan said: members controls, invitations, coherent settings, real timezones, display names, kiosk prefs, tutorial chapters, persisted admin themes. Delivered: all present, with the partials noted above (per-zman 12/32, display-names 8+8, tutorial chapters lighter than the inventory's full list, F-I18N3 page bodies not localized). Core fidelity holds; breadth is short on the long-tail editors.

10. **Context retention** — Good. Reuses the Phase 8 `AdminShell`, `load-admin` helpers, `requireOrgMember`, `orgSettingsDto`, flat `/api/me` contract, and `/admin/[orgSlug]` deep-link convention. Settings route reuses the existing `prisma` client and `mergeSettingsBlob`. No contradictions with earlier phases; members/settings nav entries are now enabled (were disabled in Phase 8).

11. **Security** — Good. Every `/api/org/[orgId]/{members,invites,settings}` write calls `requireOrgMember` with `admin:true` (members/invites) or `write:true` (settings) and uses `access.orgId` — never the body `orgId` — for all DB queries. Last-owner demote/remove guarded. Cannot remove self. Invite tokens are DB-generated (unique). `isSuperAdmin` bypass is explicit. Settings PUT validates role enums implicitly via Prisma and trims name. No secrets in code; `.env.example` present. One minor: invite `token` is returned in the invite list DTO (`inviteDto` includes `token` and `acceptPath`) — convenient for the demo but the token is the invite bearer; acceptable in this arm since only owner/admin can list invites, worth a note for production.

12. **Code quality** — 8/10. Clean, consistent, one pattern per concern, real RBAC, coherent settings merge, no stubs. Held back by the truncated editors (12/32 zman configs, 8/24 zman display names), partial F-I18N3 (page bodies hardcoded English), thin tutorial chapters, and a `ThemePickerAdmin` that sets state before the fetch and doesn't revert on failure.

13. **Findings**
   1. `F-I18N3` partial: `SettingsClient` and `MembersManager` hardcode section headers, field labels, and button text in English; only shell nav uses `t()`. Inventory requires every applicable string through `t()`.
   2. Per-zman overrides editor renders only 12 of 32 zman types (`ZMAN_KEYS.slice(0, 12)`); 20 zman configs have no UI editor.
   3. Display Names editor renders only 8 zman keys + 8 tefilah keys; the remaining 24 zman display names have no UI editor.
   4. Tutorial chapters are thin (1–2 steps each) and omit the inventory's styles/groups/events/widgets chapters; P11 is functional but not full coverage.
   5. `ThemePickerAdmin.persist` sets `themeId`/`custom` optimistically before the fetch and shows "Theme save failed" without reverting the UI on error.
   6. `invites` GET DTO exposes the bearer `token` in the list response; acceptable for owner/admin-only access in this arm, flag for production.
   7. `SettingsClient` halacha degrees branch persists the value only in the settings blob; the `rabbeinu_tam_minutes` column is stale when `type=degrees`. Acceptable given the schema, but the column and blob can disagree.

## Scores (1–10 each, for orchestrator aggregation)
- inventory_coverage: 7
- rule_adherence: 8
- plan_fidelity: 8
- context_retention: 9
- security: 8
- code_quality: 8
