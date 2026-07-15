# FEATURE-INVENTORY — MenEZmanim Rebuild (merged: v1 + v2 + desktop)

This is the complete, canonical truth of what the old MenEZmanim apps do today, and the source of truth for WHAT the rebuild must preserve. It is NOT a layout to copy pixel-for-pixel — the rebuild fixes the structure (see the to-fix list, Section 7). **This file supersedes `baseline/FEATURE-INVENTORY.md`**, which covered only v2; this one merges BOTH old apps plus the Electron desktop app.

## Source apps (read-only reference — keep accessible all rebuild long)

- **v2 (web, newer):** `C:\Users\Menny\Documents\Personal\Program\app\zmanim-app-v2` — Turborepo (`apps/web` Next.js App Router + `packages/core|ui|db|importer|export`). Also live at https://menezmanim.vercel.app and on `master` of `MenEZmanim-v2`. v2 was itself an in-progress rebuild of v1's UI and never reached full editor/widget parity.
- **v1 (web + desktop, older but often more complete):** `C:\Users\Menny\Documents\Personal\Program\app\zmanim-app` — same Turborepo plus `apps/desktop` (Electron). v1 holds the working BZS importer, working PDF export HTML, the fuller WYSIWYG editor, several widgets v2 lacks, and the entire desktop app.
- **Prior rebuild (built code that may be reused if the stack survives re-debate):** `D:\Projects\Personal\ZmanimRebuild`.

## What the app is

A multi-tenant (per-synagogue/"org") **zmanim digital-signage system**. Admins design display boards in a drag-and-drop editor; those boards render full-screen on wall-mounted screens at `/show/...`, showing live zmanim (halachic prayer times), minyan schedules, Jewish-calendar info, announcements, memorials (yahrzeits), sponsors, and media. There is also a mobile congregant view, a super-admin console, and an **Electron desktop app** that runs the same display board natively/offline with a local DB, a LAN server, and a BeeZee file importer.

## How to read the IDs

`R#` = route, `P#` = page/section (`P#.#` = a control on it), `W#` = display widget, `E#` = API endpoint group, `D#` = data model, `C#` = core-engine capability, `DK#` = desktop feature, `G#` = desktop wiring gap, `F#` = a structural thing to FIX. **NEW/v1** marks items the v2-only baseline did not capture (recovered from the v1 audit). Every ID must be claimed by exactly one build todo in REBUILD-PLAN.md.

## Source audits

- v2 baseline: `baseline/rebuild-audit/area*.md` (6 areas × 2 families) + `baseline/BUILD-HISTORY.md`.
- v1 + desktop delta: `rebuild-audit/v1-delta/v1a-parity-*.md`, `v1b-desktop-*.md`, `v1c-import-core-*.md`, `BUILD-HISTORY-v1.md`.
- Each feature cites the old-code file to read for reference.

---

## 1. ROUTE MANIFEST (master checklist — every route/screen must have a working counterpart)

### 1a. Real user-facing routes

| ID | Route | Old file | Purpose |
|---|---|---|---|
| R1 | `/` | `apps/web/app/page.tsx` | Marketing/landing home |
| R2 | `/login` | `apps/web/app/login/[[...login]]/page.tsx` | Clerk sign-in (catch-all; OAuth needs the catch-all + `/login/sso-callback`) |
| R3 | `/register` | `apps/web/app/register/[[...register]]/page.tsx` | Clerk sign-up (catch-all) |
| R4 | `/onboarding` | `apps/web/app/onboarding/page.tsx` | New-org creation + invite-accept + pending-approval flow |
| R5 | `/admin` | `apps/web/app/admin/page.tsx` | Admin shell — hosts the sections P3–P12 |
| R6 | `/admin/super` | `apps/web/app/admin/super/page.tsx` | Super-admin console (super-admins only) |
| R7 | `/mobile?org=slug` | `apps/web/app/mobile/page.tsx` | Mobile congregant view |
| R8 | `/show/[orgSlug]/[screenId]` | `apps/web/app/show/[orgSlug]/[screenId]/page.tsx` | Public full-screen display board (the wall screen) |
| R9 | `/demo/:screenId` → `/show/demo/:screenId` | `next.config.ts` redirect | Demo-org shortcut |
| **R10 (NEW/v1)** | Electron desktop app | `apps/desktop/**` | Native two-window app (display board + admin), local DB, LAN server, BZS import, offline/kiosk. See Section 8 (DK1–DK26). |

**Known broken/legacy route reference:** the Dashboard "Live Display" button and other places navigate to **`/display`**, which has no route file — only `/show/[orgSlug]/[screenId]` exists. Flagged **F-NAV1**.

### 1b. Admin sections (perceived "pages", state-switched inside R5, not real routes — F1 turns each into a real route)

| ID | Section | Old entry file (v1 / v2) |
|---|---|---|
| P3 | Dashboard | `packages/ui/src/admin/AdminApp.tsx` + `DashboardWidgets.tsx` |
| P4 | Schedules (minyanim) | `packages/ui/src/admin/ScheduleEditor.tsx` (v1) / `ScheduleSection/*` (v2) |
| P5 | Content Hub (announcements / yahrzeit / sponsors / media [+ notes]) | `packages/ui/src/admin/ContentHub.tsx` |
| P6 | Visual Editor (display-board designer) | `packages/ui/src/editor/WysiwygCanvas.tsx` (v1) / `EditorSection/*` (v2) |
| P7 | Screens & Styles | `packages/ui/src/admin/ScreenManager.tsx` |
| P8 | Members | `packages/ui/src/admin/MemberManager.tsx` |
| P9 | Settings | `packages/ui/src/admin/SettingsPage.tsx` + `LocationSetup.tsx` |
| P10 | Import / Export | `packages/ui/src/admin/ImportExportHub.tsx` + `ImportWizard.tsx` + `ExportPanel.tsx` |
| **P11 (NEW/v1)** | Interactive admin tutorial | `packages/ui/src/tutorial/{chapters,TutorialProvider,TutorialLauncher}.tsx` |
| **P12 (NEW/v1)** | Admin shell theme picker | `packages/ui/src/admin/ThemePickerAdmin.tsx` |

### 1c. API routes — see Section 6 for detail

`/api/me`, `/api/onboarding`, `/api/zmanim`, `/api/calendar`, `/api/sync/pull`, `/api/sync/push`, `/api/webhooks/clerk`, `/api/invites/[token]`, `/api/invites/pending`, `/api/admin/*`, and the `/api/org/[orgId]/*` family (announcements, export, groups, import, invites, lock, media (+ordering), members, memorials, schedules, screens, sponsors, styles).

---

## 2. DATA MODEL (17 Prisma models — every field must survive; v1 and v2 schemas match)

Old file: `packages/db/prisma/schema.prisma` (identical in v1 and v2 per the v1-delta audit). JSON-string fields (`settings`, `activationRules`, `content`, `scheduleRules`, `styleSchedules`, etc.) carry a lot of behavior — their shapes matter.

| ID | Model | Notable fields (beyond id/createdAt/updatedAt) |
|---|---|---|
| D1 | **Organization** | name, slug (unique), status (pending/active/suspended), latitude, longitude, elevation, timezone, dialect, candleLightingMinutes (18), shabbatEndType, shabbatEndValue, rabbeinu_tam_minutes (72), amPmFormat, inIsrael, settings (JSON), plan (free/basic/pro/enterprise). Relations to all org-scoped models + 1:1 editLock |
| D2 | **Screen** | name, orgId, assignedStyleId?, styleSchedules? (JSON `ScreenStyleSchedule[]`, breakpoint-aware — NEW/v1), isActive, resolution |
| D3 | **User** | clerkUserId (unique), email (unique), name, isSuperAdmin |
| D4 | **OrgMembership** | userId, orgId, role (owner/admin/editor/viewer), unique[userId,orgId] |
| D5 | **OrgInvite** | orgId, email, role, token (unique), expiresAt, usedAt? |
| D6 | **EditLock** | orgId (unique), userId, lockedAt, expiresAt (5-min TTL) |
| D7 | **Style** (DisplayStyle) | name, orgId, backgroundImage?, backgroundColor, backgroundMode, backgroundGradient?, backgroundTexture?, backgroundFrameId?, backgroundFrameThickness?, canvasWidth (1920), canvasHeight (1080), isDefault, activationRules (JSON), sortOrder |
| D8 | **DisplayObject** | styleId, name, type (14+ widget types), posX/posY/width/height, layer, fontFamily, fontSize, fontBold, fontItalic, foreColor, backColor, language, content (JSON, per-type), scheduleRules (JSON), scheduleGroupVisibility (JSON), visible. NEW/v1 content keys seen: lineHeight, object-level background/frame/scroll, daysAhead, displayName overrides, eventBoxSchedule |
| D9 | **ScheduleGroup** (DaveningGroup) | orgId, name, hebrewName, color, active, autoActivationRules? (JSON), sortOrder, isBuiltIn |
| D10 | **ZmanimConfig** | orgId, zmanType, authority, degreesBelow?, fixedMinutes?, earliest?, latest?, roundTo?, offset?; unique[orgId,zmanType] |
| D11 | **MinyanSchedule** | orgId, name, hebrewName, type, baseZman?, fixedTime?, offset, earliest?, latest?, roundTo, room?, dayOfWeekMask, scheduleGroupIds? (CSV), details? (JSON — refresh mode/basis/anchor, rounding mode, hideIfMinMaxReached, visibility rules, placeholder, displayOffset, duration, nearest-event window — NEW/v1), isActive, sortOrder |
| D12 | **Announcement** | orgId, title, titleHebrew?, content, contentHebrew?, scheduleRules? (JSON), priority, isActive, startDate?, endDate? |
| D13 | **Memorial** (yahrzeit) | orgId, hebrewName, englishName?, hebrewFamilyName?, hebrewBenBat?, hebrewYear?, hebrewMonth, hebrewDay, hebrewAdar, civilDate?, isYahrzeit, donorInfo?, notes?, isActive. **Add `relationship` (F5).** |
| D14 | **Sponsor** | orgId, type, sponsorName, hebrewText?, englishText?, hebrewDate?, civilDate?, isRecurring, recurrenceRule?, isActive |
| D15 | **Media** | orgId, filename, originalName, mimeType, fileSize, filePath, scheduleRules? (JSON), sortOrder, isActive |
| D16 | **TukachinskyNote** | v1 = global only (hebrewMonth, hebrewDay, noteHebrew, noteEnglish?, category, source?). **Rebuild decision (OP6, hybrid): KEEP + extend** — add `orgId?` (null = global baseline seeded from C6, super-admin-edited; set = that shul's note), `overridesNoteId?` + active/hidden flag. W14 renders the merged set. (Resolves F-DB3.) |
| D17 | **SyncLog** | orgId, tableName, recordId, operation, data (JSON), timestamp, synced |

**Import-time data shapes (NEW/v1, not persisted as their own models — used by the BZS importer):** BeeZee `zmanimDefs` + `toladotEntries` (from `Default.Bzs`) and `CalendarFile.dat` Julian-day → groupId map. These map onto D9/D10/D11/D8 on import; document the mapping (see Section 6, E19).

---

## 3. CORE DOMAIN ENGINE (`packages/core/src/**`) — preserve calculations EXACTLY

Halachic/astronomical computations. The rebuild may restructure the code but must NOT change calculation outcomes. v1 and v2 cores match except where noted.

- **C1 — Zmanim engine** (`zmanim-engine.ts`): all configured zmanim for a date; sea-level vs elevation; BeeZee 13-point empirical correction; Tukachinsky `ALOS=20.32°`, `TZAIS=8.36°` (BeeZee-optimized, NOT 90min/16.1° — F-CORE1); Maaseh Nisim lookup with algorithmic fallback; `applyLimits` (offset, rounding, earliest/latest). TTL cached.
- **C2 — Zman types + labels**: target is 32 types (Alos/Misheyakir/Hanetz/Shma GRA+MGA/Tefillah GRA+MGA/Chatzos/MinchaGedolah/Ketanah/Plag/Shkiah/Tzais/ChatzosHalaila/CandleLighting/Havdalah/RabbeinuTam, most with +Tukachinsky variants) with EN + HE label maps. **NOTE (v1 delta): v1 defines 30 — missing Tuk variants for CandleLighting + Havdalah; the rebuild target keeps 32.**
- **C3 — 10 halachic authorities**: Magen Avraham, GRA, Rabbeinu Tam, Tukachinsky, Baal HaTanya, Ateret Torah, Fixed Minutes, Yereim, Shulchan Aruch HaRav, Mishna Berura. `DEFAULT_OPINIONS` map.
- **C4 — BeeZee refraction** (`beezee-refraction.ts`): daily refraction table (~0.773°–0.834°), `getDailyRefraction(month, day)`.
- **C5 — Maaseh Nisim tables** (`maaseh-nisim-tables.ts`): 392 daily rows × 14 zman values (minutes from midnight, IST); `getMaasehNisimZman`, `mnMinutesToDate` (DST-aware).
- **C6 — Tukachinsky tables/profile/content** (`tukachinsky*.ts`): pre-computed sunrise/sunset for Hebrew years 5783–5787 (5783 sunset empty — F-CORE2); `TUKACHINSKY_PROFILE`; `TUKACHINSKY_NOTES` (75+ Luach Eretz Yisrael annotations) + `getNotesForDate`/`getNotesForPeriod`.
- **C7 — Calendar engine** (`calendar-engine.ts`): JewishDateInfo, ParshaInfo (incl. a manual upcoming-Shabbos scan to work around a kosher-zmanim bug — NEW/v1 note), DafYomiInfo, HolidayInfo, OmerInfo, **TefilahRulesInfo** (mashivHaruach, moridHatal, veseinTalUmatar, veseinBeracha, yaalehVeyavo, alHanissim, hallel full/half/none, tachanun, sefirahCount, isShabbos, isMukafChoma). Public `/api/calendar` hardcodes some flags (F-API3) — the engine has the real logic.
- **C8 — Scheduler** (`scheduler.ts`): 11 schedule rule types (gregorian_range, hebrew_range, day_of_week, time_range w/ midnight wrap, dst_aware, zman_trigger ±offset, group_trigger, recurring, one_time, always) + combineMode all/any; 14 visibility CONDITIONS in code (weekday, shabbos, chol_hamoed, yom_tov, fast_day, erev_shabbos, erev_chag, erev_pesach, chanukah, behab, rosh_chodesh, purim, dst_on, dst_off) — date-range/day-of-week handled as rules, not conditions (the "17 vs 14" is semantic, not a gap). Dynamic resolution MUST run in the org timezone via Luxon (F-CORE-TZ — the "3h early" bug).
- **C9 — Style engine** (`style-engine.ts`): 12 DayTypes (incl. yom_kippur); 9 StyleScheduleRule types; the DisplayObjectType enum (see Section 5 — 14 types incl. v1's FIDS_BOARD/SEFIRA_COUNTER/DATE_PICKER/SCROLLING_TICKER); `getActiveStyle`, `getVisibleObjects`, `resolveScreenStyleSchedules` (legacy `assignedStyleId` migration → make a one-time DB migration, F-CORE3).
- **C10 — 35 default schedule groups** (`schedule-groups.ts`): weekday, shabbat, every yom-tov/fast/special-period group with EN+HE names + colors.
- **C11 — Supporting** (`calendar-utils.ts`, `screen-manager.ts`, `plans.ts`, `cache.ts`): date math (note `gregorianDayOfYear`/`hebrewOrdinal` are DUPLICATED across scheduler.ts + style-engine.ts — F-DUP-DATEMATH), screen heartbeat + breakpoint-aware `resolveStyleForScreen`, plan limits (free/basic/pro/enterprise), TTL cache.
- **C12 — Offline sync protocol** (`sync/*`): SyncMessage/Batch/Response, conflict strategies (last-write-wins default, server-wins, client-wins, manual), SyncServer (in-memory — F-CORE4), SyncClient polling. Used by desktop↔cloud (Section 8), not the display board.

---

## 4. PAGE-BY-PAGE FEATURE INVENTORY (every control must work in the rebuild)

### P1 — Landing / Home (R1, `app/page.tsx`)
**P1.1** hero + tagline; **P1.2** feature highlights; **P1.3** CTA to `/register` and `/login`; **P1.4** header nav. To-fix: English-only, internationalize (F-I18N1).

### P2 — Auth: Login (R2) + Register (R3)
Clerk `<SignIn>`/`<SignUp>` catch-all. **P2.1** sign-in; **P2.2** sign-up; **P2.3** OAuth (paths MUST be `/login`+`/register` in Clerk dashboard or OAuth 404s; needs `sso-callback`). After auth → `/admin`; new user with no org → `/onboarding`. Middleware must return a response for public routes (NEW/v1 bug — public 404s otherwise).

### P4area — Onboarding (R4, `app/onboarding/page.tsx`)
**P4o.1** create org: name + auto-suggested slug (editable, uniqueness-checked); **P4o.2** location: address → lat/lng/elevation/timezone + inIsrael; **P4o.3** minhag/dialect + candle-lighting + shabbat-end; **P4o.4** "Create" → POST `/api/onboarding`, seeds default groups/styles. **P4o.5 (v1)** accept invite tokens + show pending invitations; **P4o.6 (v1)** new org enters pending-approval until super-admin approves.

### P3 — Dashboard (`AdminApp.tsx`, `DashboardWidgets.tsx`)
**P3.1** stat cards (davening times, announcements, yahrzeits, sponsors, members, styles, screens); **P3.2** quick-action nav buttons; **P3.3** "Live Display"/open-screen (currently → `/display`, broken F-NAV1); **P3.4** plan/usage indicator; **P3.5** org switcher (full reload today — F2). **P3.6 (NEW/v1)** quick-add modals: create event/announcement/yahrzeit/sponsor from the dashboard. **P3.7 (NEW/v1)** embedded live preview widget — scaled `BoardRenderer`, screen selector, desktop/tablet/mobile breakpoint selector, "Edit in Editor", "Open Full Screen".

### P4 — Schedules / Minyanim (`ScheduleEditor.tsx`)
Manages `MinyanSchedule` (D11). **P4.1** list grouped by type with name(+HE), computed/fixed time, room, days, group tags, active toggle; **P4.2** add/edit — every D11 field: base zman OR fixed time, offset, earliest/latest, rounding (mode+minutes), day-of-week mask, room, group multi-select, advanced `details` (refresh mode/basis/anchor, hideIfMinMaxReached, placeholder, displayOffset, **duration + nearest-event window — NEW/v1**, visibility rules); **P4.3** row actions edit/duplicate/delete/activate; **P4.4** reorder (sortOrder, drag); **P4.5** schedule-group manager (D9: color, HE/EN names, active, counts). **P4.6 (NEW/v1)** bulk-select → copy/move selected events to a group, or bulk delete. **P4.7 (NEW/v1)** placeholder/spacer rows (non-minyan dividers, editable label, group-assignable). **P4.8 (v1)** tri-state visibility per row (— / ✓ / ✗), BeeZee-inspired compact accordion + always-visible groups sidebar. To-fix: orphaned `ScheduleForm`/`ScheduleListTable` (F3); overlapping rule editors (F4).

### P5 — Content Hub (`ContentHub.tsx`)
Tabbed/accordion manager. **P5.1 Announcements** (D12): list + add/edit (title/content +HE, priority, active, start/end, visibility rules), reorder. **P5.2 Yahrzeit/Memorials** (D13): list + form (all D13 fields; add `relationship` F5), search, row actions. **P5.3 Sponsors** (D14): list + form (type, name, HE/EN text, HE/civil date, recurring + rule, active). **P5.4 Media/Flyers** (D15): upload, thumbnails, drag-reorder (`/media/ordering`), active toggle, per-item visibility rules, delete. **P5.5** per-sub-tab visibility/scheduling editor. **P5.6 Daily notes (OP6 hybrid)** at `/admin/[orgSlug]/content/notes`: read-only global baseline (seeded from C6) + per-shul add / override / hide; feeds W14.

### P6 — Visual Editor (`WysiwygCanvas.tsx` ~2,800 lines in v1 — the centerpiece, v1 is the parity reference)
- **P6.1** canvas (default 1920×1080) zoom fit/fill/custom, grid, snap, rulers.
- **P6.2** add-widget palette (all DisplayObjectTypes — Section 5).
- **P6.3** select/multi-select (Shift/Ctrl)/move/resize handles/drag; **P6.4** align + distribute; **P6.5** snap + arrow-key nudge; **P6.6** z-order / layer reorder.
- **P6.7** layers/object-list panel (rename, toggle visible, select, reorder, delete, duplicate).
- **P6.8** PropertyPanel tabs: **General** (name, language he/en/yi, X/Y/W/H, z-index, visible); **Appearance** (font family/size/bold/italic/color, **auto-contrast sampled from the actual background — NEW/v1**, text + vertical alignment, **line height — NEW/v1**, object background modes solid/gradient/texture/image, **object-level frame — NEW/v1**, scrolling for any widget, table layout/border/header/row styling); **Content** (per-widget sub-editor — text/HTML, zmanim picker incl. Tukachinsky per-zman + daysAhead, clock options, media library/upload/slideshow, ticker announcement selection, countdown label, event-table settings, group selection, **event-box schedules — NEW/v1**, Jewish-info item toggles/order/layout/title).
- **P6.9** style manager: create/duplicate/delete styles, set default, canvas size (presets + custom W×H), background picker (solid/gradient/texture/image/frame + thickness), activation rules.
- **P6.10** preview-by-date.
- **P6.11** save (Style + objects); **P6.12** edit-lock acquire/release (D6, 5-min TTL); **P6.13** undo/redo.
- **P6.14 (NEW/v1)** display-board ThemePicker: 8 built-in color themes, custom theme save/delete, **auto-generate a theme from the background image palette** (`colorExtract.ts`).
- **P6.15 (NEW/v1)** cross-style object clipboard: copy/paste via localStorage + context menu + keyboard.
- **P6.16 (NEW/v1)** standalone reusable `ScheduleRuleEditor` (10 rule types, all/any) and `ZmanLimitEditor` (preview earliest/latest/round/offset for a zman).
To-fix: editor state is a god-store; rule editor duplicated (F4); **preview MUST equal live render via one shared path (F-NAV2 — the #1 recurring bug)**; editor must edit STYLES only (no screen selector — NEW/v1 fix).

### P7 — Screens & Styles (`ScreenManager.tsx`)
Manages `Screen` (D2). **P7.1** screen list (name, resolution, active, assigned style/schedule); **P7.2** add/edit (name, resolution — allow custom F6); **P7.3** **ScreenStyleSchedule editor — breakpoint-aware (NEW/v1):** each entry maps day-types/date-ranges → styleId AND a breakpoint (all/mobile/tablet/full), breakpoint-specific overriding all; this is canonical style scheduling, not `assignedStyleId`; **P7.4** copy public URL; **P7.5** open/preview; **P7.6** activate/deactivate, delete, heartbeat/last-seen. **P7.7 (NEW/v1)** StyleListPanel on this page: style thumbnails, create/rename/duplicate/delete, "Open in Editor". **P7.8 (NEW/v1)** resolution-mismatch warning across breakpoints; **P7.9 (NEW/v1)** today's active-style preview per breakpoint. (Canvas size lives on the Style, not the Screen — NEW/v1.)

### P8 — Members (`MemberManager.tsx`)
`OrgMembership` (D4) + `OrgInvite` (D5). **P8.1** member list (name, email, role); **P8.2** change role; **P8.3** remove (confirm); **P8.4** invite by email + role; **P8.5** pending invites (resend/revoke). RBAC owner/admin only.

### P9 — Settings (`SettingsPage.tsx`, `LocationSetup.tsx`)
Writes D1/D10. **P9.1** org/profile; **P9.2** location (lat/lng/elevation/timezone, inIsrael); **P9.3** zmanim/halacha (dialect, candleLightingMinutes, shabbatEndType degrees/value, **Rabbeinu Tam type/value pair — NEW/v1, not just minutes**, amPmFormat) + per-zman `ZmanimConfig` overrides (D10); **P9.4** display/locale defaults; **P9.5** plan info. **P9.6 (NEW/v1)** kiosk/display prefs: default display language, kiosk mode, hide cursor, auto-start on boot. **P9.7 (NEW/v1)** Display Names editor (`DisplayNamesEditor.tsx`): per-org EN+HE label overrides for every zman and tefilah item (Mashiv HaRuach, Yaaleh Veyavo, Hallel, …). To-fix: 4 independent Save buttons each rewriting the whole settings blob (F7); hardcoded timezone list (F8).

### P10 — Import / Export (`ImportExportHub.tsx`, `ImportWizard.tsx`, `ExportPanel.tsx`)
**P10.1 Import**: categories for schedules/announcements/yahrzeit/sponsors/media/BeeZee. CSV/JSON/ICS wizard (map columns, preview, commit). **P10.2 Export**: per-type CSV/JSON/ICS + full-org JSON backup. **P10.3 (NEW/v1)** multi-week schedule CSV export (1–52 weeks, parsha headers, group filters, names left/right, parsha rows/cols, Sunday/Shabbos basis, computed dynamic times — `weeklyExport.ts`). **P10.4 (NEW/v1)** image/screenshot export ("screenshot of current display" — concept/stub). **P10.5 (NEW/v1)** two-file Groups+Events CSV flow with sample downloads, append/replace, preview, parse errors, UTF-8 BOM for Excel (`csvImportExport.ts`). **P10.6 (NEW/v1)** per-list JSON import (announcements/yahrzeit/sponsors) with sample JSON + preview. To-fix: BZS import sends only the filename in the web app (F9 — v1 desktop has the real importer, Section 8); web PDF export was a stub (F10 — v1 has a working HTML generator to recover); two CSV helper families (F-DUP-CSV).

### P11 — Interactive admin tutorial (NEW/v1, `tutorial/*`)
react-joyride chapter system: chapter picker + guided overlays across dashboard, styles, screens, groups, events, editor, widgets, settings; `data-tutorial` hooks; completed-chapter storage. Tooltips must use fixed positioning to stay on-screen inside scroll regions (NEW/v1 bug).

### P12 — Admin shell theme picker (NEW/v1, `ThemePickerAdmin.tsx`)
Admin UI theming (separate from display-board styles): light, dark, monochrome-light, monochrome-dark, and custom persisted color slots via CSS variables.

### R6 — Super-Admin console (`app/admin/super/page.tsx`)
Super-admins only. **SA.1** all-orgs list; **SA.2** create org; **SA.3** approve/reject pending, suspend/reactivate (`/status`); **SA.4** change plan; **SA.5** edit any org's data (reuse normal editors scoped to org — F11) (`/data`); **SA.6** clone org (schedules/groups/announcements/memorials/styles/objects) (`/clone`); **SA.7** reseed demo; **SA.8** Users tab — list, super-admin badge, memberships; actions are stubs (F12); **SA.9 (OP6)** global daily-notes baseline editor (super-admin CRUD over `TukachinskyNote` orgId=null, seeded from C6).

### R7 — Mobile view (`app/mobile/page.tsx`, `mobile/*`)
Congregant read-only. **M.1** today's zmanim, **grouped morning/afternoon/evening + NOW badge (NEW/v1)**; **M.2** minyan schedule **grouped by type, color-coded, NEXT badge (NEW/v1)**; **M.3** announcements **as expandable cards with priority badges (NEW/v1)**; **M.4** Jewish date/parsha/daf; **M.5** org via `?org=slug` (v1 hardcodes `default` — fix to use slug). **M.6 (NEW/v1)** mobile date picker: prev/next day, Today, Shabbat jump, popup month calendar, HE/Greg display.

### R8 — Public Display Board (`app/show/[orgSlug]/[screenId]/page.tsx`, `DisplayApp.tsx`, `BoardRenderer.tsx`) — the wall screen
**SH.1** resolve active style via breakpoint-aware style-schedule/activation rules for current date/time; **SH.2** render all visible DisplayObjects (Section 5) absolutely positioned at canvas scale; **SH.3** live zmanim/clock/countdown; **SH.4** refresh on schedule boundaries (no flicker); **SH.5** scale to resolution; **SH.6** offline/kiosk via cache; **SH.7** heartbeat. **SH.8 (NEW/v1)** interactive public date override (driven by the DATE_PICKER widget W17) — recomputes zmanim/calendar/minyanim for the chosen date. **SH.9 (NEW/v1)** multi-offset prefetch for `daysAhead` widgets. **SH.10 (NEW/v1)** mobile display mode: width-fit scale + vertical scroll when canvas height exceeds viewport; style refresh ~10s, zmanim ~1min, secondary data ~5min. Preview (P6.10) MUST match this exactly (F-NAV2).

---

## 5. DISPLAY WIDGET TYPES (each needs an editor sub-panel AND a renderer, wired editor→save→snapshot→/show→preview)

v1 `DisplayObjectType` enum (the fuller set): `ZMANIM_TABLE`, `JEWISH_INFO`, `DIGITAL_CLOCK`, `ANALOG_CLOCK`, `PLAIN_TEXT`, `RICH_TEXT`, `MEDIA_VIEWER`, `EVENTS_TABLE`, `YAHRZEIT_DISPLAY`, `SCROLLING_TICKER`, `FIDS_BOARD`, `SEFIRA_COUNTER`, `COUNTDOWN_TIMER`, `DATE_PICKER`. Old renderers in `packages/ui/src/display/**`, editors in the PropertyPanel Content tab.

| ID | Type | What it shows / content shape |
|---|---|---|
| W1 | **text** | static rich text + **raw-HTML variant (v1 `RICH_TEXT` vs `PLAIN_TEXT` are two object types)**; RTL, vertical align, line height, font/background/frame/scroll |
| W2 | **zmanim** | one or more zman values (label+time), authority-aware; **v1 renders via `ZMANIM_TABLE` with regular/Tukachinsky per-zman checklist, `daysAhead` offset, display-name overrides** |
| W3 | **zmanim-table / schedule table** | grid of zmanim and/or minyanim (rows/columns label/time/room); multi-column layout, row colors, borders, separators, header toggle, 12/24h, seconds — shared `TableDisplaySettings` across W2/W3/W4 |
| W4 | **minyan / schedule (EVENTS_TABLE)** | minyan times (D11), grouped, group-filtered; **placeholders, event-box date-range group overrides, current/next emphasis by duration, sort by priority then time (NEW/v1)** |
| W5 | **analog-clock** | live analog clock; presets set face/hand/number colors + fonts |
| W6 | **digital-clock** | live digital clock (12/24h, seconds, AM/PM placement for RTL) |
| W7 | **countdown** | counts down to a target zman/time/event; label/HE label/completed text; selectable zmanim+minyanim subset |
| W8 | **date / hebrew-date (JEWISH_INFO)** | Jewish date, day of week, parsha/special Shabbos, holiday/Chanukah, Omer, Daf Yomi, and tefilah changes — item toggles, order, vertical/horizontal layout, separators (separate styling for tefilah-change vs general items), per-item title modes |
| W9 | **announcement / SCROLLING_TICKER** | active announcements (D12), visibility-aware; **v1 ticker uses all-by-priority or selected IDs, custom separator, RTL/LTR, generic ScrollWrapper**; shares interaction model with W8 |
| W10 | **memorial / yahrzeit** | today's/upcoming yahrzeits (D13), Hebrew-date matched; name/EN/relationship/HE date, optional title, border, scroll |
| W11 | **sponsor** | active sponsors (D14), rotates (no dedicated v1 display widget found — sponsors render via table/text; confirm during build) |
| W12 | **image / media (MEDIA_VIEWER)** | a Media item or **slideshow: selected media list or "use all", interval, fit mode, fade, editor-side upload (NEW/v1)** |
| W13 | **shape / divider** | rectangle/line/divider styling element (v2 concept; v1 achieves via table spacers + object backgrounds/frames — reconcile in build) |
| W14 | **tefilah-notes / calendar-notes** | live tefilah rules (C7) + merged Tukachinsky notes (C6 baseline + per-org, OP6); tefilah title customizations + display-name overrides |
| **W15 (NEW/v1)** | **SEFIRA_COUNTER** | dedicated Omer counter — Hebrew count + optional English "Day N of the Omer"; renders null outside Omer; line-height control. (v2 folded Omer inside W8; v1 has a standalone type — keep so v1 layouts round-trip.) |
| **W16 (NEW/v1)** | **FIDS_BOARD** | split-flap / flight-board-style minyan board: time/name/room/status columns, next-minyan highlight, passed/NOW/in-N-min status, type colors, countdown, optional flip animation. **CAVEAT: the real component exists but `BoardRenderer` renders a "FIDS Board (Coming Soon)" placeholder; not in any transcript. Build decision needed: finish or drop (F-FIDS).** |
| **W17 (NEW/v1)** | **DATE_PICKER** | interactive date-override control ON the public board: prev/next day, Today, Shabbat, popup Gregorian calendar, HE/Greg display; drives SH.8. (Distinct from editor preview-by-date P6.10.) |

Every widget supports: position/size/layer, font/color/language/style, object-level background/frame/scroll/auto-contrast, and per-widget **visibility scheduleRules** + **scheduleGroupVisibility** (via C8). All must be wired end-to-end; a backend-only or "coming soon" stub = FAIL.

---

## 6. API ENDPOINT INVENTORY (every endpoint + its trust boundary)

Old files under `apps/web/app/api/**`. Clerk auth; org-scoped writes verify membership + role. **Public reads** power the display board (no auth, org-scoped, cacheable). Middleware must return a response for public routes (NEW/v1 bug).

| ID | Endpoint(s) | Methods | Trust boundary / notes |
|---|---|---|---|
| E1 | `/api/me` | GET | authed user → memberships + super-admin flag (must be FLAT shape with top-level `isSuperAdmin` — NEW/v1 bug; nested shape broke the app) |
| E2 | `/api/onboarding` | POST | authed user, creates org + seeds defaults |
| E3 | `/api/zmanim` | GET | **public**; org by slug + date → computed zmanim (C1). Make org-aware |
| E4 | `/api/calendar` | GET | **public**; date → Jewish calendar + tefilah (C7). Use the engine, not hardcoded flags (F-API3) |
| E5 | `/api/sync/pull`, `/api/sync/push` | GET/POST | desktop/offline sync (C12); Clerk-protected today; needs screen-token review (F-API4) |
| E6 | `/api/webhooks/clerk` | POST | Clerk webhook (svix); upserts User, sets `isSuperAdmin` from `SUPER_ADMIN_EMAILS` |
| E7 | `/api/invites/[token]`, `/api/invites/pending` | GET/POST | accept invite; list pending for user |
| E8 | `/api/org/[orgId]/schedules` | CRUD | D11; role-guarded |
| E9 | `/api/org/[orgId]/announcements` | CRUD | D12 (load org before resolving — NEW/v1 bug) |
| E10 | `/api/org/[orgId]/memorials` (+`[memorialId]`) | CRUD | D13 |
| E11 | `/api/org/[orgId]/sponsors` (+`[sponsorId]`) | CRUD | D14 |
| E12 | `/api/org/[orgId]/media` (+`[mediaId]`, `/ordering`) | CRUD + reorder + upload | D15 |
| E13 | `/api/org/[orgId]/screens` (+`[screenId]`) | CRUD | D2 |
| E14 | `/api/org/[orgId]/styles` (+`[styleId]`) | CRUD | D7 + D8 objects; transactional |
| E15 | `/api/org/[orgId]/groups` | CRUD | D9 |
| E16 | `/api/org/[orgId]/members` (+`[membershipId]`) | GET/PATCH/DELETE | D4; owner/admin |
| E17 | `/api/org/[orgId]/invites` | GET/POST/DELETE | D5; owner/admin |
| E18 | `/api/org/[orgId]/lock` | GET/POST/DELETE | D6 edit-lock acquire/refresh/release |
| E19 | `/api/org/[orgId]/import`, `/export` | POST/GET | CSV/JSON/ICS import+export; multi-week CSV (P10.3); **BZS import broken in web (F9)**; **PDF recoverable from v1 (F10)** |
| E20 | `/api/admin/orgs` (+`[orgId]/data`, `/plan`, `/status`) | GET/POST/PATCH | **super-admin only** (verify each — F-API5). Preserve canonical org.id on PUT (NEW/v1 bug) |
| E21 | `/api/admin/clone`, `/api/admin/reseed-demo`, `/api/admin/users` | POST/GET | **super-admin only**; `users` actions stubs (F12) |
| **E22 (OP6)** | org notes CRUD + super-admin baseline CRUD | CRUD | D16 per-shul + global baseline; standard guards |

**Security (trust-boundary, per review-protocol):** every `/api/org/[orgId]/*` write verifies member + role AND orgId match (never trust client/body); every `/api/admin/*` verifies `isSuperAdmin`; public reads must not leak private data; role/plan/ownership server-derived (F-API5).

---

## 7. TO-FIX LIST (the "improve" half — each must be a build todo or an approved deferral)

### Structure & navigation
- **F1** — Admin sections are state-swapped inside `/admin` (no deep links/back/per-page URL). → Real routes.
- **F2** — Org switch full-page reload. → Client-side org context switch.
- **F-NAV1** — Links point at non-existent `/display`. → Point at `/show/{slug}/{screenId}`.
- **F-NAV2** — **Preview ≠ live (the #1 recurring bug).** Editor preview and `/show` must share ONE render path.

### Duplication & clashing modules
- **F3** — Orphaned dead files (`ScheduleForm`, `ScheduleListTable`); hardcoded `gan-machal-seed.ts`. → Delete / make a test fixture.
- **F4** — Multiple overlapping rule/visibility editors + two group editors. → One canonical rule editor everywhere.
- **F11** — Super-admin near-duplicate org-data editor. → Reuse the normal section editors scoped to the org.
- **F-DUP-CSV** — Two CSV helper families. → One.
- **F-DUP-DATEMATH (NEW/v1)** — `gregorianDayOfYear`/`hebrewOrdinal` duplicated across `scheduler.ts` + `style-engine.ts`. → One shared util.

### Broken / half-finished features
- **F5** — MemorialForm missing `relationship`. → Add it.
- **F6** — Screen resolution fixed dropdown. → Allow custom W×H.
- **F7** — Settings has 4 independent Save buttons clobbering the settings blob. → One coherent save model.
- **F8** — Hardcoded timezone list. → Real tz source.
- **F9** — **Web BZS import sends only the filename.** → Use the v1 desktop importer's real parse path (Section 8).
- **F10** — Web PDF export was a stub; **v1 has a working bilingual multi-week HTML generator to recover.** → Implement PDF from v1.
- **F12** — Super-admin Users actions are stubs. → Implement.
- **F-FIDS (NEW/v1)** — `FIDS_BOARD` (W16) component exists but the renderer shows "Coming Soon"; not in any transcript. → Decide finish or drop (needs user call).
- **F-SCREENSHOT (NEW/v1)** — Image/screenshot export (P10.4) is a placeholder. → Implement or defer.

### Core-engine correctness (do NOT change outputs without halachic sign-off)
- **F-CORE-TZ** — Schedule resolution must run in the org timezone (Luxon), not UTC. → Centralize tz.
- **F-CORE1** — Tukachinsky degrees single source (20.32/8.36). → Flag for review.
- **F-CORE2** — Tukachinsky 5783 sunset empty; tables cover 5783–5787. → Extend / fallback.
- **F-CORE3** — Legacy `assignedStyleId` → style-schedule migration at render time. → One-time DB migration.
- **F-CORE4** — SyncServer in-memory. → Durable store (D17) if sync is kept.
- **F-C2-TUK (NEW/v1)** — v1 has 30 zman types (missing Tuk CandleLighting/Havdalah). → Target the full 32.

### API / security
- **F-API3** — `/api/calendar` hardcodes tefilah flags. → Use C7.
- **F-API4** — `/api/sync/*` auth/screen-token model. → Review.
- **F-API5** — Audit every `/api/org/*` + `/api/admin/*` for server-side role/ownership.
- **F-ME-SHAPE (NEW/v1)** — `/api/me` must be flat with top-level `isSuperAdmin`; nested shape broke the whole app. → Lock the contract with a test.

### Data / schema
- **F-DB3** — `TukachinskyNote` unused. → **RESOLVED (OP6 hybrid):** keep + extend + seed from C6 + per-org override layer + W14 merge + E22.
- **F-DB-DRIFT** — Schema drift code↔DB. → Schema is single source; clean migrate on the fresh DB.

### i18n / locale
- **F-I18N1** — Landing page English-only. → Internationalize.
- **F-I18N2** — Overlapping "language" concepts. → Name UI locale vs board default locale vs per-object text locale distinctly; RTL from locale.
- **F-I18N3 (NEW/v1)** — In v1, `t()` was defined but never called and ~700 inline `style={{}}` / ~160 hardcoded hex bypassed theming. → Every applicable string through `t()`; no inline colors; one design system (already a v2 goal — keep enforced).

### Desktop (NEW/v1 — see Section 8 for DK/G detail)
- **F-DESKTOP-COUPLING** — Desktop is tightly coupled to the Turbo monorepo paths/build artifacts (`out/web`, `../../assets`). → If the rebuild changes repo shape, the desktop packaging must be reworked as part of the same change.
- **F-DESKTOP-WIRING** — Mode selector, local API routes, local DB wiring, sync manager, file-picker dialog, kiosk/auto-start/single-instance are stubs/unwired (G1–G13). → Wire them.
- **F-DESKTOP-VERCEL** — `apps/desktop`'s `better-sqlite3`/node-gyp breaks Vercel installs. → The web deploy must never build the desktop workspace.

---

## 8. DESKTOP APP (NEW/v1 — R10, `apps/desktop/**`; full detail in `rebuild-audit/v1-delta/v1b-desktop-sonnet.md`)

The Electron app runs the SAME `DisplayApp`/`BoardRenderer` as `/show` (one render path — satisfies F-NAV2 + the desktop at once). Three app modes + a separate Docker target.

**Modes:** **fully-local** (local SQLite at `{exeDir}/data/zmanim.db`, no cloud/Clerk, LAN server feeds wall screens/phones); **hybrid** (local SQLite primary + SyncClient push/pull to cloud); **display-only** (kiosk browser pointed at a remote `/show` URL). Plus **self-hosted Docker** (`docker-compose.yml`: Next.js + Postgres, NextAuth not Clerk) — reconcile auth with the rebuild's choice.

**Feature registry (DK1–DK26)** — Working as built: DK3 main display window (1920×1080), DK4 admin window (1200×800, single-instance), DK6 global shortcut Ctrl+Shift+A, DK11 LAN IP discovery. Library/skeleton needing wiring: DK1 three-mode arch, DK5 tray menu (icons missing), DK7 local config.json, DK8 local SQLite path, DK9 5-method IPC bridge (`getConfig/saveConfig/getDbPath/onSyncUpdate/getMode`), DK10 Express server (port 3001), DK16 mode-selector UI, DK17–DK23 **BeeZee importer (7 parsers, 9 file types: `.bzs` hex-CSV zmanim defs+toladot, `Setting.txt`, `RulesGroupFile.dat`, `CalendarFile.dat`, `.StyleConfig`, `.yrz`, `.rtf`, backgrounds, media)**, DK24 sync protocol (4 conflict strategies), DK25 SyncClient. Stubs: DK12 mobile-PWA LAN hosting, DK13–DK15 local API routes (`/api/zmanim/:date`, `/api/schedule`, `/api/announcements` all return empty), DK26 electron-builder packaging (dir target only, icons missing, no installers). DK2 Docker mode works.

**Gaps (G1–G13):** G1 kiosk/fullscreen, G2 auto-start, G3 single-instance lock, G4 file-picker dialog for BZS path, G5 sync-update IPC never emitted, G6 SyncManager stub unused, G7 mode not driving behavior, G8 local API not connected to DB, G9 mobile PWA not built, G10 app icons missing, G11 no installer targets, G12 tray doesn't keep app alive on Win/Linux, G13 LAN URL not surfaced to user.

**Highest priority for a real desktop build:** DK3/DK4 two-window UX; DK8+DK13–DK15 local DB feeding real data; DK17+G4 BeeZee import (primary customer migration path); DK12+G9 mobile PWA over LAN; G1+G2+G3 kiosk/auto-start/single-instance for unattended wall screens.

---

## 9. v1 ↔ v2 COVERAGE DIFF (so nothing from either app is dropped)

The merge rule: **take the more complete behavior of the two.** The audits (gpt55 parity: 25 PRESENT / 28 DIFFERENT / 18 MISSING; codex import/core: 35 PRESENT / 9 DIFFERENT / 4 MISSING) found v1 is frequently the fuller one.

**v1 is MORE complete than v2 — recover from v1:**
- Working BZS file importer (DK17–DK23 / F9); working bilingual multi-week PDF/HTML export (F10); multi-week schedule CSV export (P10.3).
- Fuller WYSIWYG editor (~2,800 lines): board ThemePicker + palette-from-image (P6.14), object clipboard (P6.15), line-height + object-level backgrounds/frames/scroll/auto-contrast (P6.8).
- Extra widgets: Sefira counter (W15), FIDS board (W16, placeholder — decide), display date-picker (W17), distinct PLAIN/RICH text (W1), scrolling ticker (W9).
- Admin extras: Display-Names editor (P9.7), admin theme picker (P12), interactive tutorial (P11), dashboard quick-add + live preview (P3.6/P3.7), bulk schedule ops + spacer rows (P4.6/P4.7), breakpoint-aware style schedules + StyleListPanel on Screens (P7.3/P7.7).
- Mobile extras: date picker, grouping, NOW/NEXT/priority badges (M.1–M.6).
- The entire desktop app (R10 / DK1–DK26).

**v2 is MORE complete than v1 — keep from v2 (already in baseline):**
- The proven planning + the prior rebuild's tested core-engine port; the 32-zman target (v1 has 30 — F-C2-TUK); fuller announcement fields (HE title/content, start/end dates); the inventory's per-item media scheduleRules; the OP6 hybrid notes design (D16 + W14 + E22).

**Equal / shared (build once):** core engine C1–C12, the 17-model schema D1–D17, the 35 default groups, the 10 authorities, one shared `BoardRenderer` render path.

---

## 10. COVERAGE NOTE

Every route (R1–R10), admin section (P3–P12) + onboarding (P4o) + super-admin (SA.*) + mobile (M.*) + display (SH.*), all widgets (W1–W17), 17 data models (D1–D17), 12 core capabilities (C1–C12), 22 API groups (E1–E22), 26 desktop features (DK1–DK26) + 13 gaps (G1–G13), and every fix item (F*) above must each be claimed by exactly one todo in REBUILD-PLAN.md (Phase 3). Nothing here may be dropped without explicit user approval logged in DECISION-LOG.md. Open product calls already surfaced: **F-FIDS** (finish or drop the FIDS board) and the **desktop scope/auth reconciliation** (which app modes ship, Clerk vs NextAuth for Docker).

