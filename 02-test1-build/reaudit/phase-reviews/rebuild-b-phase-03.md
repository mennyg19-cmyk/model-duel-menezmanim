# Phase Review — rebuild-b / Phase 3 (Reaudit)

Model: glm-5.2-high | Runner: spawn | Arm: rebuild-b | Phase: 3 | Reaudit: true

## Meta
- Arm reviewed: rebuild-b
- Phase number: 3 — Zmanim, calendar, and mobile
- Diff / files touched this phase: `audit/diffs/b-p03.patch` (placeholder only — see Finding 1); snapshot tree under `audit/snapshots/b/p03` (app/api/{zmanim,calendar,mobile}, app/mobile/*, src/core/*, src/domain/*, src/content/default-groups.ts, prisma schema)

## Proof-of-read
- `REAUDIT-INSTRUCTIONS.md`: GLM single third-party reviewer; blind to contestant model; phase-only scope; running-app optional, static evidence preferred, N/A acceptable.
- `PHASE-REVIEW-RUBRIC.md`: checklist + six 1–10 scores; fill every item with evidence or N/A+why.
- `FEATURE-INVENTORY.md`: Section 3 (C1–C12 core), Section 4 R7/M.1–M.6, Section 6 E3/E4, F-fix list (F-CORE-TZ/1/2, F-C2-TUK, F-API3, F-DUP-DATEMATH, F-I18N2). 32-zman target, 10 authorities, 35 groups, org-timezone resolution.
- `snapshots/b/p03/PHASE-PLAN.md`: Phase 3 IDs and done-when (seeded Jerusalem zmanim/calendar, `/mobile?org=demo` grouping/NOW/NEXT/announcements/date nav).
- `snapshots/b/p03/STATUS.md`: claims completion, lists verification evidence (typecheck/build pass, live 200, 32 zman types incl Tuk candle/havdalah, engine tefilah `hallel=half`, 5783 sunset fallback `18:28`, mobile bundle 3 schedules/2 announcements/35 groups, `uiLocale=he`/`boardDefaultLocale=en`).
- `snapshots/b/p03/DECISION-LOG.md`: Phase 3 decisions logged (32 zman types, 5783 fallback, locale naming, style-engine copied for C11 not claiming C8/C9, org-timezone schedule math).
- `b-p03.patch`: one line — `PHASE 1 - no previous phase; see snapshot tree at 10c6ea8`. No phase-3 diff content (Finding 1).
- Spot-checks: `app/api/{zmanim,calendar,mobile}/route.ts`, `app/mobile/{page,mobile-client}.tsx`, `src/domain/{org-zmanim,mobile-data}.ts`, `src/core/{zmanim-engine,halachic-opinions,calendar-utils,scheduler,calendar-engine}.ts`, `src/content/default-groups.ts`.

## Checklist

1. **Inventory coverage** — Claimed: `R7`; `M.1–M.6`; `D9–D11`; `C1–C7`, `C10`, `C11`; `E3`, `E4`; `F-CORE-TZ`, `F-CORE1`, `F-CORE2`, `F-C2-TUK`, `F-API3`, `F-DUP-DATEMATH`, `F-I18N2`.
   - `R7` PRESENT — `app/mobile/page.tsx` + `mobile-client.tsx`, `?org=` defaults to `demo`.
   - `M.1` PRESENT — zmanim grouped morning/afternoon/evening + NOW badge (`markNowZmanim`, `mob-nowBadge`).
   - `M.2` PRESENT — schedule grouped by type, color dot, NEXT badge (`schedulesForDate` → `isNext`).
   - `M.3` PRESENT — announcements expandable cards with `P{priority}` badge.
   - `M.4` PRESENT — Jewish date/parsha/daf in header from `computeOrgCalendar`.
   - `M.5` PRESENT — org via `?org=slug` (no `default` hardcode).
   - `M.6` PRESENT — prev/next day, Today, Shabbat jump, popup month calendar, HE/Greg display.
   - `D9` PRESENT — 35 default groups in `default-groups.ts` + seeded.
   - `D10` PRESENT — `buildZmanimConfig` honors `ZmanimConfig` overrides per type.
   - `D11` PRESENT — `MinyanSchedule` resolved via `resolveScheduleTime` (fixed/base-zman, offset, earliest/latest, roundTo).
   - `C1` PRESENT — `zmanim-engine.ts` (sea-level vs elevation, MN lookup, BeeZee correction, `applyLimits`).
   - `C2` PRESENT — 32 `ZmanType` enum members incl. `CANDLE_LIGHTING_TUKACHINSKY` + `HAVDALAH_TUKACHINSKY` (F-C2-TUK).
   - `C3` PRESENT — 10 `HalachicAuthority` values + `DEFAULT_OPINIONS` map.
   - `C4` PRESENT — `beezee-refraction.ts` `getDailyRefraction`.
   - `C5` PRESENT — `maaseh-nisim-tables.ts` `getMaasehNisimZman`/`mnMinutesToDate`.
   - `C6` PRESENT — `tukachinsky*.ts` content/tables; 5783 empty sunset falls back to sea-level Jerusalem sunset (F-CORE2, verified `SHKIAH_TUKACHINSKY` path).
   - `C7` PRESENT — `calendar-engine.ts` `getAllInfo` returns date/parsha/holiday/omer/dafYomi/tefilah.
   - `C10` PRESENT — 35 groups.
   - `C11` PRESENT — `calendar-utils.ts` (shared date math, F-DUP-DATEMATH) + `screen-manager.ts`.
   - `E3` PRESENT — `GET /api/zmanim?org=` public, org-scoped, 404 on missing org.
   - `E4` PRESENT — `GET /api/calendar?org=` uses `CalendarEngine` (engine-driven, not hardcoded flags → F-API3 satisfied); returns `tefilah`.
   - `F-CORE1` PRESENT — `TUKACHINSKY_ALOS_DEGREES = 20.32`, `TZAIS = 8.36` constants.
   - `F-CORE2` PRESENT — algorithmic sea-level fallback.
   - `F-C2-TUK` PRESENT — 32 types.
   - `F-API3` PRESENT — engine-based calendar.
   - `F-DUP-DATEMATH` PRESENT — `gregorianDayOfYear`/`hebrewOrdinal` centralized in `calendar-utils.ts`, imported by `scheduler.ts`.
   - `F-I18N2` PRESENT — `locales.uiLocale`/`boardDefaultLocale`/`objectTextLocale` in mobile API.
   - `F-CORE-TZ` PARTIAL — rule time/day-of-week/one-time use `orgLocalParts` (good), but DST detection and visibility-condition weekday use server-local time (Finding 2).
   Overall: claimed IDs materially delivered.

2. **Running app** — N/A (static snapshot, no `node_modules`). Relied on STATUS-reported evidence (typecheck/build pass, live 200, API outputs) + static code. Cannot independently re-run.

3. **No stubs** — No dead buttons or "coming soon" in Phase 3 surface. Mobile tabs all wired to real API data; date picker drives real fetch. `screen-manager`/`style-engine` shipped as C11 support (DECISION-LOG explicitly scopes them as support, not Phase 6 C8/C9 claims) — not stubs.

4. **Rule: ponytail** — Reuses `kosher-zmanim` + Luxon (installed deps) rather than reinventing astronomy. Mobile client is one file, no premature component split. No unrequested abstractions. Style-engine copied only because C11 needs it (justified in DECISION-LOG).

5. **Rule: clean-code** — Naming clear (`resolveScheduleTime`, `activeAnnouncements`, `markNowZmanim`). One fetch pattern (mobile client), one engine pattern. `zmanim-engine.ts` is ~760 lines but single-concern (zman resolution); acceptable. Minor: `roundToMinutes` duplicated across `zmanim-engine.ts` and `mobile-data.ts` (Finding 3); mobile-client inline `TYPE_COLORS` hex map (small, tolerable).

6. **Rule: workflow** — STATUS carries observable verification evidence (route, API outputs, specific values). DECISION-LOG records business/halachic judgments (32 zman types, 5783 fallback, locale naming). No speculative product inventing; F-FIDS and desktop correctly deferred to their phases.

7. **Rule: codegraph** — `.codegraph/` present in snapshot. No evidence of forbidden symbol-grep in artifacts. Static review used Read on known files (allowed for literals/known paths).

8. **Rule: git-discipline** — Contestant did NOT git (correct; orchestrator owns commits per prompt). No git artifacts in snapshot tree.

9. **Todos / PHASE-PLAN fidelity** — Done-when criteria met in code: seeded Jerusalem data path exists, 32 zman types, `/mobile?org=demo` supports grouping/NOW/NEXT/announcements/date nav. STATUS claims align with code.

10. **Context retention** — Phase 2 auth/onboarding/schema preserved (`app/login`, `app/register`, `app/onboarding`, `app/api/{auth,me,invites,onboarding,webhooks}`). DECISION-LOG appends without rewriting prior entries. No contradictions with earlier phases.

11. **Security** — Public reads E3/E4/Mobile are org-scoped by slug with 404 on missing org; no auth expected for public display (correct trust boundary). `org.settings` JSON parse wrapped in try/catch. No secrets in snapshot; `.env.example` present. No injection vectors (Prisma parameterized). No role/plan server-derivation needed in Phase 3 (write endpoints are later phases).

12. **Code quality** — 8/10. Engines are substantive and faithful to the BeeZee/Tukachinsky model (MN-table lookup with algorithmic fallback, daily refraction, degree-based Alos/Tzais). Mobile client is clean and accessible (dir=rtl, locale chips, error/loading states). Docked for the F-CORE-TZ leak (Finding 2) and intra-phase `roundToMinutes` duplication (Finding 3).

13. **Findings**
   1. `b-p03.patch` is a placeholder (`PHASE 1 - no previous phase; see snapshot tree at 10c6ea8`) — no phase-3 diff content. Review relied on the snapshot tree only. Likely an orchestrator artifact gap, not contestant code, but it prevents diff-level verification.
   2. F-CORE-TZ partially satisfied: `scheduler.ts buildScheduleContext` derives `isDST` from `date.getTimezoneOffset()` (server-local offset), and `evaluateVisibilityCondition` uses `date.getDay()` (server-local weekday). Both ignore the org timezone. The correct helper exists (`calendar-utils.isDstInZone` + `orgLocalParts`) but is not wired into these paths. For orgs outside the server's TZ this reintroduces the "3h early" class of bug the fix targets.
   3. `roundToMinutes` is duplicated in `src/core/zmanim-engine.ts` and `src/domain/mobile-data.ts` (different implementations: one ms-based, one Luxon-based). Minor, but drift within Phase 3 itself.

## Scores
- inventory_coverage: 9
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
