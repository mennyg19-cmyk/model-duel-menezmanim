# DECISION-LOG — Rebuild arm A (newest first)

## Proof-of-read

- CONTESTANT-PROMPT: workspace rebuild-a only, ports 3101/8101, no git; resume = next unfinished phase only; open product calls → reversible DECIDED default.
- FEATURE-INVENTORY: R1–R10, P3–P12 (+P4o/SA/M/SH), D1–D17, C1–C12, W1–W17, E1–E22, DK1–DK26 + G1–G13, 36 F-fixes.
- EDITOR-INVENTORY: S0–S10, 63 E/EW IDs, TF1–TF10; live-render parity is #1 (Phase 7).
- Rules (6): ponytail, spec/gate, verify-in-running-app, clean-code, PowerShell script-file, git N/A.

---

### 2026-07-15 — Phase 12 desktop scope/auth (Status: DECIDED)
**Modes that ship:** `local` | `display` | `hybrid` (+ Docker compose as DK2). **Sync auth (F-API4):** device Bearer token for `/api/sync/*`; session cookie for admin device CRUD — not Clerk-only. **Docker auth:** `AUTH_MODE=session` (same as web default), not Clerk. **LAN server:** Next standalone child (not a separate Express app) — same real `/api/*` routes (DK10/G8). **Package boundary:** `rebuild-a/desktop/` own package.json — never a web dependency (F-DESKTOP-VERCEL). Paths self-contained under rebuild-a (F-DESKTOP-COUPLING). Icons remain placeholder README until branded assets (G10); NSIS target wired (G11). Reversible.

### 2026-07-15 — Phase 11 i18n + tutorial (Status: DECIDED)
No react-joyride — dependency-free overlay (same approach as parent harvest). UI locale cookie via `POST /api/locale` (not server actions). F-I18N3 scoped to landing + admin shell/nav chrome this phase (not every admin form string). Three locale types documented in `src/i18n/index.ts`. Reversible.

### 2026-07-15 — Phase 10 import/export defaults (Status: DECIDED)
E19 under `/api/org/[orgId]/import|export` (admin role). F9 = ported `parseBzs` + apply into `zmanim_configs`/`minyan_schedules` (index→ZmanType map). F10 = v1 HTML luach + browser print-to-PDF (no PDF engine). F-SCREENSHOT = SVG board capture + print HTML (no html2canvas). F-DUP-CSV = one `src/io/csv.ts`. Harvested parent `apps/web/src/io/*` read-only. Reversible.

### 2026-07-15 — Phase 9 F11/F12/reseed/mobile route (Status: DECIDED)
F11 = `/api/admin/orgs/[id]/data` hub of links into normal `/admin/[slug]/*` (no duplicate editors). F12 users PATCH actions: setSuperAdmin, setMembership, removeMembership, resetPassword→`demo-pass`. Reseed = spawn same `tsx src/db/seed.ts` as `db:seed`. Mobile = `/mobile?org=` (inventory R7), not path slug. Reversible.

### 2026-07-15 — F-API5 org+admin guard audit (Status: DECIDED)
All Phase 9 `/api/admin/*` call `requireSuperAdmin`. Existing `/api/org/[orgId]/*` call `requireOrgRole`; dashboard by-slug uses `requireOrgBySlug` in loader. Verified unauthed admin list → 401. No gap fixes required this phase.

### 2026-07-15 — P9.3 Rabbeinu Tam type/value in settings JSON (Status: DECIDED)
Schema column remains `rabbeinuTamMinutes` for the engine. Settings bag stores `rabbeinuTamType` (`minutes`|`degrees`) + `rabbeinuTamValue`; Save syncs minutes into the column when type=minutes. Reversible with a dedicated column later.

### 2026-07-15 — F7 one Save all; F8 Intl timezones (Status: DECIDED)
Settings UI has a single Save that PUTs org columns + settings JSON + full zmanimConfigs replace. Timezone dropdown uses `Intl.supportedValuesOf("timeZone")` with a short fallback list.

### 2026-07-15 — Invite links via /onboarding?invite= (Status: DECIDED)
E17 returns tokens; UI copies `/onboarding?invite=<token>` (existing Phase 3 accept path). No separate `/invite` page.

### 2026-07-15 — Phase 7 editor: harvest parent geometry + zustand, plain CSS shell (Status: DECIDED)
Ported `geometry/`, SelectionLayer math, doc/ui stores from `apps/web` (read-only). UI rebuilt with inline styles (no Tailwind/shadcn in rebuild-a). Added pinned `zustand@5.0.2`. Save/lock/shared-data via REST (E14/E18), not server actions. Reversible by swapping shell styling later.

### 2026-07-15 — Board themes + clipboard localStorage (P6.14/P6.15) (Status: DECIDED)
Eight built-in board themes + custom themes and palette-from-image in `localStorage`. Object clipboard dual: in-memory + `menez-editor-clipboard-v1` for cross-style paste. Reversible.

### 2026-07-15 — Editor Back → `/screens` (E0.5) (Status: DECIDED)
Top bar “Admin” links to `/admin/[orgSlug]/screens` per EDITOR-INVENTORY E0.5 (Phase 8 shell until that phase fills it).

### 2026-07-15 — Content hub media = data URL / path (Status: DECIDED)
No Blob store in the experiment. Uploads accept `filePath` (data URL or path string); blank create generates a tiny SVG. Reversible when Vercel Blob lands.

### 2026-07-15 — F-DB3 notes: seed C6 → D16 baseline (Status: DECIDED)
`seedBaselineNotes()` loads `TUKACHINSKY_NOTES` into `tukachinsky_notes` (orgId null, isBaseline). Org layer: add / override (`baselineId`) / hide. Categories mapped (halacha→other, seasonal→calendar). E22 covers org + `/api/admin/notes` for super-admin baseline.

### 2026-07-15 — P5.5 reuses ScheduleRuleEditor (F4) (Status: DECIDED)
Announcement + media forms use the same canonical rule editor from Phase 5 — no second visibility editor.

### 2026-07-15 — F3/F4 schedules module shape (Status: DECIDED)
One `ScheduleEditor` + shared `ScheduleRuleEditor` under `src/admin/schedules/`. Do **not** recreate orphaned `ScheduleForm` / `ScheduleListTable` (F3). Rule editor is the single visibility-rule UI for schedules (F4); content/editor phases reuse it.

### 2026-07-15 — Placeholder rows + tri-state visibility (Status: DECIDED)
P4.7 spacers use `type: "placeholder"` + `details.isPlaceholder`. P4.8 tri-state stored as `details.rowVisibility`: `inherit` | `show` | `hide` (UI — / ✓ / ✗). Reversible if a dedicated column is preferred later.

### 2026-07-15 — F1 later sections = real route shells (Status: DECIDED)
Admin nav links to real `/admin/[orgSlug]/…` URLs (F1). Schedules/content/editor/screens/members/settings/import-export pages are thin shells until their phases — not claimed as P4–P11 done. Reversible by filling those routes in place.

### 2026-07-15 — F2 client org switch + seed demo-b (Status: DECIDED)
Org switcher uses `router.push` (no `window.location`). Seed adds `demo-b` so owner has two orgs without onboarding. Last-org hint stored in `localStorage` (`menez-last-org`).

### 2026-07-15 — F-NAV1 Live Display → /show (Status: DECIDED)
Dashboard Live Display and preview “Open Full Screen” use `/show/{slug}/{screenId}` only. No `/display` route.

### 2026-07-15 — P12 themes in localStorage (Status: DECIDED)
Admin themes (light/dark/mono/custom) persist per browser via CSS variables — not org-scoped DB. Reversible later with user/org preference column.

### 2026-07-15 — Plan caps table in admin/plan-limits.ts (Status: DECIDED)
C11 `plans.ts` was not in the harvested core. Local caps table powers P3.4 until a shared plans module exists.

### 2026-07-15 — AUTH_MODE=session (no Clerk keys) (Status: DECIDED)
Experiment has no Clerk publishable/secret keys. Default **session**: email/password + HMAC cookie (`AUTH_SECRET`). Catch-all `/login`+`/register` paths kept so Clerk/OAuth can drop in later. `AUTH_MODE=local` remains for keyless super-admin. Reversible by setting Clerk keys + `AUTH_MODE=clerk`.

### 2026-07-15 — E6 webhook: Svix or X-Dev-Webhook-Secret (Status: DECIDED)
When `CLERK_WEBHOOK_SIGNING_SECRET` is set, verify Svix `t.v1`. Otherwise accept JSON if `X-Dev-Webhook-Secret` matches `AUTH_SECRET` so E6 is exerciseable without Clerk. Reversible once real Clerk webhooks are wired.

### 2026-07-15 — New orgs status=pending (P4o.6) (Status: DECIDED)
`POST /api/onboarding` writes `orgs.status = "pending"` until super-admin approval (Phase 9). Owner membership still created so the user can reach the Phase 4 admin stub.

### 2026-07-15 — /admin stub for post-auth redirect (Status: DECIDED)
Phase 3 needs somewhere after login/onboarding. Minimal membership list + logout; real shell is Phase 4. Not claiming P3 inventory IDs.

### 2026-07-15 — F-FIDS: FINISH the FIDS board (Status: DECIDED)
Inventory: finish or drop. Chose **finish** — real split-flap FidsBoard in the registry (W16). Reversible later by dropping one registry entry + seed widget; finishing now avoids a "coming soon" stub (FAIL under definition of done).

### 2026-07-15 — W3 covered by shared ZMANIM_TABLE table frame
Inventory lists W2 and W3 separately; DisplayObjectType has one `ZMANIM_TABLE` with shared TableDisplaySettings (also EVENTS_TABLE). Matches parent registry. W3 multi-column/header/stripe = table layout content, not a second type.

### 2026-07-15 — LiveBoard client polls snapshot every 10s
SH.4/SH.10 need refresh without flicker. `LiveBoard` re-fetches `/api/display` (~10s) and posts heartbeat (~30s). Clocks tick client-side (SH.3). SW caches last good `/show` + `/api/display` (SH.6).

### 2026-07-15 — F-CORE3: DB backfill + seed writes styleSchedules
Runtime migration in `resolveScreenStyleSchedules` stays as safety net. Added `db:migrate-style-schedules`; seed inserts default styleSchedules so fresh DBs do not depend on the fallback.

### 2026-07-15 — Board/widgets harvested from parent (read-only reference)
Same rationale as Phase 1 engine: snapshot contracts must not drift; parent has F-NAV2 Board + W1–W17. Routes/LiveBoard/heartbeat/SW wired in this workspace.

### 2026-07-15 — Stack: Next.js + Drizzle/libSQL local file + kosher-zmanim/Luxon
Inventory names the prior rebuild's tested core port a KEEP. Local `file:` DB; port 8101 reserved.

### 2026-07-15 — Core engine + schema harvested from parent rebuild
Preserve calculations EXACTLY — copy tested C1–C12 / D1–D17 sources; this workspace owns them from here.

### 2026-07-15 — codegraph skipped
No index in empty workspace; reference trees are read-only (prompt). Read/dir fallback.

### 2026-07-15 — Phase 1 scope = data + engine + public compute APIs
Smallest shippable base for later phases.

### 2026-07-15 — Clerk deferred to Phase 3
No Clerk keys in experiment; Phase 1–2 surfaces are public by design. Phase 3 delivered session auth instead.
