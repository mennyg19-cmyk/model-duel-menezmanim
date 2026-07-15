# Phase review: rebuild-b, Phase 3

Model: claude-sonnet-5-thinking-high | Runner: spawn | Arm: rebuild-b | Phase: 3

## Proof-of-read

**PHASE-REVIEW-RUBRIC.md** — 13-item checklist + 6 scores (1–10). Fill every item with evidence or `N/A` + why; write full report to the given path.

**PHASE-PLAN.md (Phase 3)** — IDs: `R7`; `M.1–M.6`; `D9–D11`; `C1–C7`, `C10`, `C11`; `E3`, `E4`; `F-CORE-TZ`, `F-CORE1`, `F-CORE2`, `F-C2-TUK`, `F-API3`, `F-DUP-DATEMATH`, `F-I18N2`. Done means seeded Jerusalem data produces checked zmanim/calendar and `/mobile?org=demo` supports grouping, NOW/NEXT, announcements, date nav.

**STATUS.md** — claims all Phase 3 IDs complete: 32 zman types incl. Tukachinsky candle/havdalah, 10 authorities, 35 groups, org-timezone scheduler, public zmanim/calendar/mobile APIs, `/mobile?org=demo` UI. Verification evidence section lists typecheck/build pass, live 200s, and a 5783 sunset-fallback check.

**DECISION-LOG.md** — Phase 3 entries: 32-type target with Tuk candle/havdalah (F-C2-TUK), 5783 sunset algorithmic fallback (F-CORE2), locale-name separation (F-I18N2), style-engine/scheduler shipped early for C11 without claiming C8/C9, org-timezone scheduler math (F-CORE-TZ) via Luxon.

**FEATURE-INVENTORY.md (Phase 3 sections)** — R7/M.1–M.6 mobile congregant view; D9–D11 schema; C1–C11 core engine (zmanim, 32 types, 10 authorities, BeeZee refraction, Maaseh Nisim, Tukachinsky, calendar/tefilah engine, scheduler, 35 groups, calendar-utils/screen-manager/plans/cache); E3/E4 public APIs; the F-* fix list for this phase.

**Rules (`.cursor/rules/*.mdc`)** — workflow (read-before-edit, expectation/verify discipline, PowerShell script-file rule), vocabulary (word scopes, six always-on files only), git-discipline (contestant does not git — orchestrator owns commits), codegraph (CLI/MCP before grep when indexed), ponytail (ladder, YAGNI, dead-code-out), clean-code (naming, one pattern per concern, dead code).

**Phase 3 code read directly**: `src/core/zmanim-engine.ts`, `calendar-engine.ts`, `halachic-opinions.ts`, `schedule-groups.ts`, `scheduler.ts`, `calendar-utils.ts`, `style-engine.ts`, `screen-manager.ts`, `tukachinsky*.ts`, `maaseh-nisim-tables.ts`; `src/domain/org-zmanim.ts`, `mobile-data.ts`; `app/api/{zmanim,calendar,mobile}/route.ts`; `app/mobile/{page,mobile-client}.tsx`; `prisma/schema.prisma` (D9–D11 models).

## Checklist

**1. Inventory coverage**

| ID | Status | Evidence |
|---|---|---|
| R7 / M.1–M.6 | PRESENT | `mobile-client.tsx`: category grouping + NOW badge (M.1), type-grouped schedule + NEXT badge (M.2), expandable announcement cards w/ priority (M.3), Jewish date/parsha/daf in header (M.4), `?org=` slug w/ `demo` fallback (M.5), prev/next/Today/Shabbat/popup calendar (M.6). Verified live (see §2). |
| D9–D11 | PRESENT | `prisma/schema.prisma` ScheduleGroup/ZmanimConfig/MinyanSchedule match inventory fields; seeded and returned live. |
| C1 (zmanim engine) | PRESENT | `zmanim-engine.ts`, all zman resolution paths implemented, TTL cache via `Map`. |
| C2 (32 types) | PRESENT | Counted `ZmanType` enum = 32 members, incl. `CANDLE_LIGHTING_TUKACHINSKY`/`HAVDALAH_TUKACHINSKY`. EN+HE label maps both 32 entries. Matches inventory target exactly. |
| C3 (10 authorities) | PRESENT | `HalachicAuthority` enum = exactly the 10 named authorities. |
| C4 (BeeZee refraction) | PRESENT | `beezee-refraction.ts`, consumed by `getTukachinskyBoundaries`. |
| C5 (Maaseh Nisim) | PRESENT | `maaseh-nisim-tables.ts`, actively consumed by `resolveTukFromTable`/`getMnBoundaries` — this is the real live path for Tukachinsky base times. |
| C6 (Tukachinsky tables/profile/content) | **STUB (dead code)** | `tukachinsky.ts` (`TUKACHINSKY_PROFILE`), `tukachinsky-tables.ts` (year tables + F-CORE2 fallback), `tukachinsky-content.ts` (`TUKACHINSKY_NOTES`) are exported from `core/index.ts` but **never imported by any consumer** — not `zmanim-engine.ts`, not the domain/API layer. Confirmed by grep: each symbol only self-references. The live SHKIAH_TUKACHINSKY/5783-fallback path actually runs through C5 (Maaseh Nisim, Gregorian-keyed, no year gap) plus `getTukachinskyBoundaries`' own elevation/refraction math, not through this file's dedicated `algorithmicJerusalemSunset`. DECISION-LOG's F-CORE2 entry describes the `tukachinsky-tables.ts` mechanism specifically — that description does not match what's actually running. |
| C7 (calendar engine) | PRESENT | `calendar-engine.ts`: JewishDateInfo, Parsha (with manual upcoming-Shabbos workaround for a documented kosher-zmanim clone bug), DafYomi, Holiday, Omer, full `TefilahRulesInfo`. |
| C10 (35 groups) | PRESENT | Counted `DEFAULT_SCHEDULE_GROUPS` = exactly 35, EN+HE names+colors. Confirmed live via `/api/mobile`. |
| C11 (calendar-utils/screen-manager/plans/cache) | PRESENT | `calendar-utils.ts` shared by scheduler+style-engine (no duplication); `screen-manager.ts` breakpoint-aware `resolveStyleForScreen`; `plans.ts`/`cache.ts` present (not exercised live this phase, acceptable — no consumer yet). |
| E3/E4 (public zmanim/calendar) | PRESENT | `app/api/zmanim`, `/api/calendar`, org-slug aware, verified live. |
| F-CORE-TZ | PRESENT | `orgLocalParts` (Luxon, IANA zone) used throughout `scheduler.ts` for day/time/recurring/one-time checks. |
| F-CORE1 | PRESENT | Single-sourced 20.32°/8.36° constants, flagged in comments for halachic review as the rule requires. |
| F-CORE2 | PRESENT (functionally) / see C6 note | Outcome verified live for a 5783 date, but via the Maaseh Nisim path, not the file the decision log names. |
| F-C2-TUK | PRESENT | Confirmed 32 types incl. both Tuk candle/havdalah variants. |
| F-API3 | PRESENT | `/api/calendar` calls `computeOrgCalendar` → `CalendarEngine.getAllInfo`, not hardcoded flags. |
| F-DUP-DATEMATH | PRESENT | `gregorianDayOfYear`/`hebrewOrdinal` live once in `calendar-utils.ts`, imported by both `scheduler.ts` and `style-engine.ts`. |
| F-I18N2 | PRESENT | `/api/mobile` returns `uiLocale`/`boardDefaultLocale`/`objectTextLocale` as three distinct fields, matching the decision log. |

**2. Running app** — verified live. A `next start` production server for this project was already running on port 3102 (PID 44176, confirmed via process list) when this review began; `npm run dev` correctly refused with `EADDRINUSE`, confirming it's this project. Queried directly:
- `GET /mobile?org=demo` → HTTP 200.
- `GET /api/mobile?org=demo&lang=he` → full payload: 32 zmanim w/ category+NOW highlight, calendar (Jewish date, Rosh Chodesh Av, Daf Yomi, tefilah rules), 3 schedule rows w/ NEXT flag, 2 announcements, 35 groups.
- `GET /api/zmanim?org=demo&date=2022-10-01...` (Hebrew year 5783) → `SHKIAH_TUKACHINSKY` = `18:28`, non-null, matching STATUS.md's claim exactly.
Did not start or stop this server — it predates this review session and isn't mine to kill; noted as a hygiene discrepancy below.

**3. No stubs** — none found in Phase 3 scope. Mobile UI has real interactive date nav, real tab content, no placeholder text. The one incomplete area (C6 Tukachinsky reference files) is dead/unwired code rather than a UI-visible stub — nothing renders "coming soon."

**4. Rule: ponytail** — Mostly clean: shared date math correctly deduplicated (F-DUP-DATEMATH), no speculative UI abstractions in the mobile client (plain function components, no premature wrapper components). Violation: three unused files (`tukachinsky.ts`, `tukachinsky-tables.ts`, `tukachinsky-content.ts`) are exactly the kind of "boilerplate for later" ponytail forbids — built, then left disconnected from the code that needed them.

**5. Rule: clean-code** — Naming is intention-revealing (`resolveGraTukachinsky`, `evaluateVisibilityCondition`), no vague `data`/`temp` names spotted in reviewed files. One pattern per concern holds for date math after the dedup. Dead-code violation: the three unused Tukachinsky files above should have been either wired in or deleted — this is the exact "dead code" category `clean-code.mdc` calls out.

**6. Rule: workflow** — STATUS.md's verification section shows real running-app evidence (typecheck, build, live curls, a specific 5783 edge case) — good expectation/verify discipline. Gap: STATUS.md states "Server stopped after checks," but a production server for this exact project was still live on 3102 at review time. Either that claim was inaccurate when written, or the server was restarted afterward and not stopped again — a minor Dev Server Hygiene lapse either way.

**7. Rule: codegraph** — N/A. No `.codegraph/` index present for this workspace at review time (per MCP server status); Read-based inspection was the correct fallback per the rule's own escape hatch.

**8. Rule: git-discipline** — Followed. `git log` in rebuild-b shows only orchestrator-authored "Experiment:" commits; no contestant commits for this phase.

**9. Todos / PHASE-PLAN fidelity** — All Phase 3 IDs claimed in STATUS.md are present and verifiable, matching the "Done when" criteria in PHASE-PLAN.md word for word (seeded Jerusalem data, checked zmanim/calendar, `/mobile?org=demo` grouping/NOW-NEXT/announcements/date-nav all confirmed).

**10. Context retention** — Consistent with Phase 2 decisions (schema-as-single-source from Phase 2 carries D9–D11 correctly; no contradiction of prior onboarding/auth work). DECISION-LOG correctly notes shipping `style-engine.ts`/`scheduler.ts` early for C11 without claiming Phase 6's C8/C9 — good scope discipline, no over-claim.

**11. Security** — Public reads only (`/api/zmanim`, `/api/calendar`, `/api/mobile`); no writes in this phase's surface, no secrets in reviewed files, no obvious injection surface (org lookup is a Prisma `findUnique` by slug, not raw SQL).

**12. Code quality: 8/10** — Halachic calculation code is dense but well-commented on non-obvious constraints (BeeZee correction sampling, sea-level vs. elevation choices, the kosher-zmanim clone-bug workaround). API/domain layer is thin and readable. Docked for the dead-code files under C6 and the STATUS.md/actual-code mismatch on how F-CORE2 is really satisfied.

**13. Findings**

1. `src/core/tukachinsky.ts`, `tukachinsky-tables.ts`, `tukachinsky-content.ts` are dead code — exported from `core/index.ts` but not imported by any consumer. DECISION-LOG's F-CORE2 entry describes `tukachinsky-tables.ts`'s fallback as the mechanism; the live behavior actually runs through `maaseh-nisim-tables.ts` instead. Outcome is correct, but the documented "why" doesn't match the shipped code path. Recommend: wire these files in (they're needed later for W14/E22 notes anyway) or delete the unused parts now and re-add when Phase 5/6 needs them.
2. STATUS.md says "Server stopped after checks," but a `next start` process for this exact project (port 3102) was still running at review time. Minor Dev Server Hygiene discrepancy — not blocking, but worth a note back to the contestant.

## Scores (1–10)

- inventory_coverage: 9
- rule_adherence: 8
- plan_fidelity: 9
- context_retention: 9
- security: 9
- code_quality: 8
