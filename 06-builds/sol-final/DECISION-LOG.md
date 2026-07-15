# Proof of read

## `CONTESTANT-PROMPT.md`
- Work is confined to `D:\Projects\Others\MenEZmanim\_experiment\rebuild-b`; the other arm, parent app, and results folder are read-only.
- Arm B uses web port 3102 and reserves local database port 8102. Git belongs to the orchestrator.
- Each phase must run with seeded data, be checked in the running app, be recorded in `STATUS.md`, and stop before the next phase.

## `FEATURE-INVENTORY.md`
- The source of truth has 10 routes, 17 data models, 12 core capabilities, 17 widgets, 22 API groups, 26 desktop features, and 13 desktop gaps.
- Expanding inclusive ranges and counting section aliases gives 269 labeled inventory IDs; behavior comes from v1, v2, and the prior rebuild without copying their layouts.
- Calculations must retain their exact outcomes, org/admin writes need server-side authorization, and editor preview, public display, and desktop must share one board renderer.

## `EDITOR-INVENTORY.md`
- The old editor had about 4,660 lines across 16 components; the newer 900-line editor kept about 20% and lost live editing plus the Wix-style interaction layer.
- Its ledger has 63 `E0`/`E`/`EW` feature IDs and 10 `TF` fixes; with 11 numbered surfaces plus `S3W`, this plan tracks 85 editor labels.
- The target is a full-screen editor with a live shared renderer, floating panels, fit/fill/custom zoom, deep appearance controls, and purpose-built widget editors.

## `.cursor/rules/workflow.mdc`
- Read before editing, make the smallest complete change, keep the README current, and record business judgments rather than hiding them.
- A phase needs observable expectations before work and running-app evidence afterward; a successful response alone is not verification.
- PowerShell commands containing variables belong in a script file, command output stays concise, and a server started for testing must be stopped.

## `.cursor/rules/vocabulary.mdc`
- “Rebuild” preserves every feature while replacing the structure; it is not a pixel copy or a narrow tidy.
- Command words have fixed scopes, and load-on-demand protocols apply only when their named activity is available and requested.
- The contestant prompt narrows this run to the six local always-on rules, so no absent rebuild or review protocol is invented.

## `.cursor/rules/git-discipline.mdc`
- Work normally belongs on a task branch with one logical change per commit and fast checks before each commit.
- PowerShell commit messages use repeated `-m` flags, never a Bash heredoc.
- This experiment overrides normal commit behavior: no git command is run because the orchestrator owns commits and pushes.

## `.cursor/rules/codegraph.mdc`
- Structural lookup starts with CodeGraph status; a healthy index replaces symbol grep and directory discovery.
- CodeGraph handles symbols, callers, imports, and impact, while direct reads remain valid for known files, markdown, and literals.
- The empty arm was initialized once; read-only reference apps are not modified merely to add indexes.

## `.cursor/rules/ponytail.mdc`
- Use the first simple approach that works: platform features and installed dependencies before adding code or packages.
- Do not add speculative abstractions or drop awkward rebuild features without approval; explicit scope, security, and tests are never cut.
- Communication and project prose stay direct, short, and free of stock AI phrasing.

## `.cursor/rules/clean-code.mdc`
- New abstractions need two real uses; files split by concern, not to meet an arbitrary line count.
- Names state intent, errors explain the failed and expected states, and comments cover only non-obvious constraints.
- The project keeps one pattern per concern and verifies third-party APIs rather than relying on memory.

# Decisions

## 2026-07-15 — Desktop is an isolated Electron package (F-DESKTOP-COUPLING / VERCEL)

**Decision:** `desktop/` owns Electron 41.7.1, Express, packaging, and runtime files in a separate package. Root Next builds never install it. Electron embeds the standalone Next output as a resource and starts it against `{userData}/data/zmanim.db`; `/show` remains the only board renderer.

**Why:** This removes old monorepo path coupling and keeps Electron/node-gyp out of web and Vercel installs. The staging step renames traced `node_modules` only inside the generated package resource so electron-builder does not discard it. Reversible to a workspace once deployment filters can prove the same isolation.

## 2026-07-15 — Node SQLite and LAN Express for local mode (DK8 / DK10 / G8)

**Decision:** Electron's bundled `node:sqlite` reads the same local Prisma SQLite file. Express on port 3001 serves real schedules/announcements from that database, proxies zmanim to the embedded shared engine, and hosts the installable LAN mobile PWA.

**Why:** No native SQLite package is added, so installers and web isolation stay simple. Reversible if a later Electron release removes `node:sqlite` or the LAN API moves into Next.

## 2026-07-15 — Hybrid sync overlays a durable inbox

**Decision:** Hybrid mode pushes local `SyncLog` rows, pulls with the Phase 11 cursor protocol, persists responses in `DesktopSyncInbox`, and overlays announcement/schedule reads. Sync state is emitted through IPC.

**Why:** Remote changes affect local APIs without unsafe generic SQL mutation of heterogeneous Prisma tables. Reversible to per-model write adapters as more desktop editing surfaces need them.

## 2026-07-15 — Self-host uses the existing isolated session adapter

**Decision:** Docker sets `AUTH_MODE=self-hosted` and runs Next with Postgres. It uses the rebuild's signed-cookie session adapter rather than adding NextAuth beside the existing local/Clerk boundary.

**Why:** The inventory explicitly requires auth reconciliation. A second auth library would duplicate identity behavior; the mode switch keeps cloud Clerk, desktop, and self-host behavior separate. Reversible to NextAuth if external providers become a self-host requirement.

## 2026-07-15 — BeeZee desktop import parses nine file families

**Decision:** The desktop file picker accepts a file or folder, runs seven parsers for BZS/settings/rules/calendar/style/yahrzeit/RTF plus background and media asset classification, persists an import receipt, and applies `.bzs` content through the local guarded web importer.

**Why:** The primary migration path writes real zmanim configuration while retaining the other source material for later model-specific conversion. Reversible as each legacy shape gains a direct adapter.

## 2026-07-15 — SyncLog is an append-only transport journal (D17 / F-CORE4)

**Decision:** Pull/push persist every accepted envelope in `SyncLog`; clients consume an opaque server-receipt-timestamp-plus-id cursor. The separate client timestamp preserves last-write comparison without letting late offline changes fall behind a pull cursor. Manual conflicts are durable `operation="conflict"` entries, while heterogeneous domain-table application stays in the desktop adapter that consumes the protocol.

**Why:** D17 has the fields for a durable journal, not per-device state or a generic safe database mutation layer. This survives restarts and supports multiple clients without adding a speculative model. Reversible if Phase 12 needs per-device acknowledgements or server-side table adapters.

## 2026-07-15 — Sync accepts sessions or scoped screen credentials (F-API4)

**Decision:** `/api/sync/*` accepts either a server-derived org membership or an HMAC Bearer credential bound to one active screen and canonical org id. Screen credentials expire after one year by default and use `SYNC_DEVICE_SECRET`, with the session secret/dev value as local fallback.

**Why:** Desktop admins can sync through sessions while unattended displays/devices cannot impersonate another org. Disabling a screen revokes its credential. Reversible to persisted, rotatable device credentials in Phase 12.

## 2026-07-15 — Conflict strategies use base versions plus timestamps (C12)

**Decision:** A matching server `baseTimestamp` means no conflict. On mismatch: last-write-wins compares client timestamps, server-wins keeps the latest durable row, client-wins appends the incoming row, and manual appends both versions as a conflict record. Client timestamps more than five minutes ahead are rejected.

**Why:** All four inventory strategies are observable without hidden in-memory state. The clock guard prevents a bad device clock from permanently dominating. Reversible to server sequence numbers later.

## 2026-07-15 — One CSV helper + content-based BZS (F-DUP-CSV / F9)

**Decision:** All CSV import/export goes through `src/io/csv.ts` (BOM-aware). BeeZee import parses uploaded file text via `parseBzs`/`applyBzsImport`; empty content returns HTTP 400 explaining filename-only uploads fail.

**Why:** Inventory forbids two CSV families and filename-only BZS. Reversible if a binary BZS variant appears later.

## 2026-07-15 — Weekly HTML is the PDF path (F10)

**Decision:** Multi-week export offers CSV plus bilingual HTML marked for browser print-to-PDF. No PDF binary library was added.

**Why:** Matches the recoverable v1 HTML generator approach without a new dependency. Reversible to a server PDF renderer later.

## 2026-07-15 — Screenshot export is SVG of the live snapshot (F-SCREENSHOT)

**Decision:** `export?kind=screenshot` builds an SVG from `buildDisplaySnapshot` object boxes/names (shared board data path).

**Why:** Observable capture without a headless browser. Reversible to raster PNG when a renderer is available.

## 2026-07-15 — Super-admin data editing reuses org routes (F11)

**Decision:** `/api/admin/orgs/[orgId]/data` returns deep links into the normal admin sections scoped by slug; no duplicate editors.

**Why:** F11. Users actions (`setSuperAdmin`, `removeMembership`) are real (F12).

## 2026-07-15 — Settings use section-merge PUT (F7)

**Decision:** `PUT /api/org/[orgId]/settings` accepts named sections (`profile`, `location`, `halacha`, `locale`, `kiosk`, `displayNames`, `adminTheme`, `tutorial`, `zmanimConfigs`). Each section updates only its columns/JSON keys; unrelated settings keys stay intact.

**Why:** Inventory F7 forbids four independent saves that rewrite the whole settings blob. Reversible if a later UI wants a single Save All that still sends the same sectioned payload.

## 2026-07-15 — Timezones from Intl.supportedValuesOf (F8)

**Decision:** The settings timezone picker lists IANA zones from `Intl.supportedValuesOf("timeZone")`, with a short fallback list only if the runtime lacks the API.

**Why:** Replaces a hardcoded zone list. No new dependency.

## 2026-07-15 — Tutorial without react-joyride

**Decision:** Ship a fixed-position overlay tutorial with chapter picker and `data-tutorial` targets instead of adding `react-joyride`.

**Why:** Ponytail ladder — existing React is enough. Behavior (chapters, completed storage, on-screen tooltips) matches P11. Reversible if a later phase prefers joyride.

## 2026-07-15 — Admin deep links under `/admin/[orgSlug]`

**Decision:** Dashboard is `/admin/[orgSlug]`, Screens & Styles is `/admin/[orgSlug]/screens`, and `/admin` redirects to the first active org. Schedules/content keep query-org routes but share the same shell. Members/settings/import nav entries stay visible but disabled until Phase 9/10.

**Why:** F1 requires real deep-linkable routes. Org-scoped paths make F2 client org switching a `router.push` rewrite instead of a hard reload.

## 2026-07-15 — Soft plan usage caps on the dashboard

**Decision:** Plan/usage shows soft limits: free 1 screen / 3 styles, basic 3/10, pro 10/50, enterprise unlimited. Caps are display-only in Phase 8; saves are not blocked.

**Why:** P3.4 needs a plan indicator. Enforcing hard limits can wait until billing/settings work; this default is reversible.

## 2026-07-15 — Live Display always targets `/show`

**Decision:** Dashboard Live Display, open-screen, preview, and Screens copy-URL/open actions use `/show/{orgSlug}/{screenId}` only. No `/display` links.

**Why:** F-NAV1. Reversible only if a dedicated authenticated preview route is added later.

## 2026-07-15 — Screen selection changes preview context, not screen data

**Decision:** Keep the Phase 7 screen selector because `E6.3` requires it. Choosing a screen opens its assigned style and uses that screen's live data; every editor save still writes only the Style and DisplayObjects.

**Why:** This reconciles the editor ledger with `P6`'s rule that the editor must not mutate screens. It is reversible if screen context moves entirely to Phase 8.

## 2026-07-15 — Enforce the five-minute lock on editor writes

**Decision:** Style save, duplicate, default, and delete operations require the caller to hold the org edit lock. A second editor gets HTTP 409; the open editor refreshes its lock every two minutes.

**Why:** A display-only lock would not prevent lost edits. The policy is reversible if locking later moves from org scope to style scope.

## 2026-07-15 — Time-of-day style rules use local Date time

**Decision:** A `time_of_day` activation rule stores `HH:mm` start/end values and supports overnight ranges such as 18:00–06:00.

**Why:** `E6.2` requires time-of-day activation. This uses the same Date passed to style resolution and can later be made explicitly org-timezone-aware without changing saved rule data.

## 2026-07-15 — Count section and surface labels

**Decision:** Treat route, section, subsection, parent, child, fix, and expanded range members as inventory labels. This yields 269 labels from `FEATURE-INVENTORY.md` and 85 from `EDITOR-INVENTORY.md`.

**Why:** The prompt rejects missing IDs. Counting `P4area`, `P4o`, `S0–S10`, and `S3W` makes aliases and surfaces explicit instead of silently assuming they are headings only.

## 2026-07-15 — Use Next.js as the web foundation

**Decision:** Use Next.js App Router, strict TypeScript, server components by default, and global CSS tokens. Pin all direct dependencies and override PostCSS to the patched 8.5.10 release.

**Why:** Later phases require catch-all auth pages, dynamic public routes, and API handlers. Starting on the final web shape avoids replacing a Phase 1-only static server. The override makes `npm audit` report zero vulnerabilities without downgrading Next.

## 2026-07-15 — Seed Phase 1 copy in code

**Decision:** Keep the two Phase 1 locale records in `src/content/landing.ts` and select Hebrew with `?lang=he`.

**Why:** Phase 1 has no database model. A typed local seed is enough to exercise P1 and F-I18N1 without pulling tenancy or persistence forward from Phase 2.

## 2026-07-15 — Finish the FIDS board in Phase 6

**Decision:** Map `W16` and `F-FIDS` to Phase 6 as a complete widget, not a placeholder and not a drop.

**Why:** The inventory forbids unapproved drops and specifically says a “Coming Soon” renderer fails. Completing the existing behavior is the only preservation-safe default.

## 2026-07-15 — Preserve every desktop mode

**Decision:** Map fully-local, hybrid, display-only, and self-hosted Docker behavior to Phase 12. Cloud web remains Clerk-based; self-hosting gets an auth adapter isolated from the cloud provider.

**Why:** The desktop inventory describes all four deployment forms as existing scope. Isolation also prevents native desktop dependencies from entering the web deployment graph.

## 2026-07-15 — Local session auth by default (Phase 2)

**Decision:** Ship `/login` and `/register` as catch-all routes with local signed cookie sessions. Keep `/login/sso-callback` and `/register/sso-callback`. Clerk cloud components activate only when publishable + secret keys are present later.

**Why:** Phase 2 must be verifiable on port 3102 with seeded users. No Clerk keys are available in this experiment arm, and a non-runnable auth stack would fail the phase gate.

## 2026-07-15 — Flat `/api/me` contract (F-ME-SHAPE)

**Decision:** `GET /api/me` returns `{ id, clerkUserId, email, name, isSuperAdmin, memberships }` with `isSuperAdmin` at the top level. No nested `user` object.

**Why:** The inventory marks nested me-shape as a break-the-app bug. Locking the flat contract now prevents that regression.

## 2026-07-15 — Full Prisma schema + SQLite now (F-DB-DRIFT)

**Decision:** Commit the full D1–D17 Prisma schema in Phase 2, push to SQLite (`prisma/dev.db`), and seed users/orgs/invites. Port 8102 stays reserved for a later server DB; file SQLite needs no listen port.

**Why:** Schema-as-single-source stops drift before more models are written. Phase 2 only exercises D1/D3–D5, but later phases inherit one migrated shape.

## 2026-07-15 — New orgs start pending

**Decision:** `POST /api/onboarding` create-org sets `Organization.status = "pending"` and seeds default style, main screen, and the 35 built-in schedule groups.

**Why:** Matches P4o.4/P4o.6. Super-admin approval UI is Phase 10; pending state is still user-visible in onboarding now.

## 2026-07-15 — 32 zman types with Tuk candle/havdalah (F-C2-TUK)

**Decision:** Add `CANDLE_LIGHTING_TUKACHINSKY` (minutes before Tuk shkiah) and `HAVDALAH_TUKACHINSKY` (same path as `TZAIS_TUKACHINSKY` at 8.36°).

**Why:** Inventory target is 32; v1 shipped 30. Reversible if a later halachic review wants different candle/havdalah formulas.

## 2026-07-15 — 5783 sunset algorithmic fallback (F-CORE2)

**Decision:** When Tukachinsky table sunrise/sunset strings are empty, fall back to sea-level Jerusalem sunset/sunrise via `ComplexZmanimCalendar` in `Asia/Jerusalem`.

**Why:** Year 5783 sunset arrays are empty in the source tables. Algorithmic fallback keeps SHKIAH_TUKACHINSKY and dependents non-null without inventing table data.

## 2026-07-15 — Locale names on mobile (F-I18N2)

**Decision:** Mobile API returns `locales.uiLocale`, `boardDefaultLocale`, and `objectTextLocale` (object text follows UI locale for Phase 3).

**Why:** Separates chrome language from org board default and per-object text without overlapping a single “language” field.

## 2026-07-15 — Style-engine copied for C11 (not claiming C8/C9)

**Decision:** Ship `style-engine.ts` + `scheduler.ts` in Phase 3 so `screen-manager.resolveStyleForScreen` works. Do not claim Phase 6 IDs `C8`/`C9`.

**Why:** C11 requires breakpoint-aware style resolution; the dependency files are implementation support, not Phase 6 board work.

## 2026-07-15 — Org-timezone schedule math (F-CORE-TZ)

**Decision:** Scheduler day/time/recurring/one-time checks use Luxon `orgLocalParts` in `ScheduleContext.timezone`.

**Why:** Fixes the UTC “3h early” class of bugs; reversible only if a caller intentionally wants server-local time (none do).

## 2026-07-15 — One ScheduleWorkspace, no orphan form/list (F3)

**Decision:** Ship a single `/admin/schedules` workspace component. Do not add separate `ScheduleForm` / `ScheduleListTable` modules.

**Why:** Inventory F3 flags those as dead orphans. One accordion editor + sidebar groups covers P4.1–P4.8 without competing UIs.

## 2026-07-15 — Advanced schedule fields live in `details` JSON

**Decision:** Persist refresh mode, round mode, placeholder flags, duration, nearest-event window, priority, and tri-state visibility rules in `MinyanSchedule.details` JSON rather than new Prisma columns.

**Why:** Matches the schema’s intentional JSON bag for D11 advanced fields. Reversible later via a migration if columns become required for querying.

## 2026-07-15 — Bulk schedule ops via POST action on E8

**Decision:** Extend `POST /api/org/[orgId]/schedules` with `action`: create | duplicate | reorder | bulk-delete | bulk-move | bulk-copy. Keep PUT for single-row update and DELETE `?id=` for one delete.

**Why:** Inventory lists one schedules endpoint group (E8). Action-based POST avoids inventing extra routes while covering P4.3–P4.6.

## 2026-07-15 — OP6 notes merge contract (F-DB3 / E22)

**Decision:** Global baseline uses `orgId=null`. Org hide = row with `overridesNoteId` + `isHidden=true`. Override = same with new text and `isHidden=false`. Org-only add = org row with no `overridesNoteId`. `GET /api/org/.../notes` returns `{ merged, orgNotes }` with `origin` `global|org|override`.

**Why:** Matches inventory OP6 hybrid. Reversible if a later phase wants a dedicated Hide table.

## 2026-07-15 — Media files under public/uploads

**Decision:** Store uploads at `public/uploads/{orgId}/{filename}` and expose `publicUrl` as `/uploads/...`. Ordering via `PUT .../media/ordering` with ordered `ids`.

**Why:** No object-store in this arm; static files serve without an extra route. Reversible to blob storage later.

## 2026-07-15 — Announcement reorder via priority

**Decision:** E9 `POST` with `action: "reorder"` and `ids` sets `priority` to `length - index` (first = highest). List sorts by priority desc.

**Why:** D12 has priority, not sortOrder. Reversible if a sortOrder column is added later.

## 2026-07-15 — Content hub single workspace (P5)

**Decision:** One tabbed `ContentHub` at `/admin/content?org=` plus deep-link `/admin/[orgSlug]/content/notes` with `initialTab=notes`. No separate per-type admin pages.

**Why:** Inventory P5 is one hub; notes route satisfies P5.6 path without duplicating editors.

## 2026-07-15 — Finish FIDS board (F-FIDS / W16)

**Decision:** Ship a working `FIDS_BOARD` renderer (split-flap status rows), not a "Coming Soon" placeholder.

**Why:** Inventory forbids stubs as done; Phase-plan already mapped W16 as complete. Reversible only if product later drops the type.

## 2026-07-15 — One shared Board render path (F-NAV2)

**Decision:** `/show`, `/api/display`, and (later) editor preview all use `buildDisplaySnapshot` + `Board`/`BoardSurface`. No second renderer.

**Why:** Inventory flags preview≠live as the #1 recurring bug.

## 2026-07-15 — Demo screen id `main` + name fallback

**Decision:** Seed demo screen with id `main` so `/show/demo/main` works. Loader also resolves by name prefix if id misses.

**Why:** Inventory route examples use `main`, not a cuid. Reversible via slug field later.

## 2026-07-15 — Extra DisplayObjectType values for W11/W13/W14

**Decision:** Extend the enum with `SPONSOR_DISPLAY`, `SHAPE_DIVIDER`, `TEFILAH_NOTES` alongside the v1 14 types.

**Why:** Inventory requires dedicated renderers for those families; content-only hacks would blur the registry. Reversible if import maps them differently.

## 2026-07-15 — Screen.lastSeenAt for heartbeat (SH.7)

**Decision:** Persist heartbeat on `Screen.lastSeenAt` via public POST `/api/display/.../heartbeat`.

**Why:** Admins need last-seen later (P7); in-memory-only would lose data on restart.
