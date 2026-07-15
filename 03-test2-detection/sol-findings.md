# Detection review — rebuild-b
Model: gpt-5.6-sol-high | Runner: spawn
## Proof-of-read
Brief: Read `STATUS.md` and inspected the auth/session and onboarding routes, organization role checks, public display/snapshot pipeline, schedule and announcement calculation paths, import/media APIs, durable sync server/client/desktop overlay, Electron main/preload/runtime configuration, LAN API, Docker defaults, Prisma schema, and screen credential flow. CodeGraph index was current (213 files, 2,522 nodes); targeted source reads covered the key trust boundaries and data paths. No `rebuild-a` files or external bug ledger were inspected.

## Findings
1. **critical — Self-hosted authentication allows unauthenticated account and super-admin takeover**
   - **Paths:** `app/api/auth/login/route.ts:5-35`, `app/api/auth/register/route.ts:5-31`, `src/domain/identity.ts:56-87`, `docker-compose.yml:24-27`
   - **Evidence:** Login accepts only an email and immediately signs a session for an existing user. Registration accepts any syntactically email-like string without password or email verification, upserts that identity, and immediately signs it in. These routes never check `AUTH_MODE`, so they remain available in the claimed `self-hosted` and Clerk modes. The default self-host deployment sets `SUPER_ADMIN_EMAILS=admin@menezmanim.local`; registering that address makes `isSuperAdmin` true in `upsertUserFromIdentity`.
   - **Why it matters:** Any network visitor can impersonate a known user such as the seeded owner, or claim the default super-admin address and gain every cross-organization admin API.

2. **high — Session and device credentials use known fallback secrets and sessions never expire**
   - **Paths:** `src/auth/session.ts:15-37`, `src/server/sync-auth.ts:21-39`, `docker-compose.yml:25-26`
   - **Evidence:** Session signing falls back to the public string `rebuild-b-dev-secret`; screen credentials fall back to another public string or the session secret. Compose defaults both secrets to `replace-this-*`. `signSession` writes `issuedAt`, but `verifySessionToken` ignores it and accepts the token forever. The cookie also has no `maxAge`/`expires` or `secure`.
   - **Why it matters:** Default deployments have forgeable authentication. Any recovered session remains valid indefinitely, including after role changes unless the user row is deleted.

3. **high — Editors can promote themselves or anyone else to owner**
   - **Paths:** `app/api/org/[orgId]/members/route.ts:37-67`, `src/domain/org-access.ts:5-6,42-53`
   - **Evidence:** The member role `PATCH` calls `requireOrgMember(orgId, { write: true })`, and `WRITE_ROLES` includes `editor`. The endpoint accepts every role including `owner`; it does not require `admin: true` despite the route comment saying owner/admin only.
   - **Why it matters:** A lower-privilege content editor can become owner, promote collaborators, and then manage invites and members.

4. **high — Remote web content receives privileged Electron IPC**
   - **Paths:** `desktop/src/main.cjs:67-95,136-179`, `desktop/src/preload.cjs:1-17`, `desktop/src/runtime-plan.cjs:1-16`
   - **Evidence:** The admin window is created with the privileged preload and later `openAdmin()` navigates that same window to `runtimePlan(...).adminUrl`. In display-only mode this is `${remoteDisplayUrl.origin}/admin`; an external origin can therefore call `window.menez.getConfig()`, read the screen credential and database path, rewrite config, open file dialogs/import data, and restart the app. The `ipcMain.handle` callbacks do not validate `event.senderFrame.url`, and navigation/new-window requests are not restricted.
   - **Why it matters:** A compromised or malicious configured server crosses from web code into native desktop control and can steal long-lived sync credentials or alter local runtime behavior.

5. **high — Sync pull pagination walks backward while sorting forward**
   - **Paths:** `src/core/sync/server.ts:51-83`, `src/core/sync/client.ts:24-35`, `desktop/src/sync-manager.cjs:107-117`
   - **Evidence:** Rows are ordered by `timestamp asc, id asc`, and the cursor is the last row returned. The next query filters for `timestamp < cursor` / `id < cursor`; it should request greater values. After a full first page, later pulls return older rows again instead of the next page.
   - **Why it matters:** Clients duplicate/replay old changes, can remain in a `hasMore` loop, and never receive newer rows beyond the first page.

6. **high — `client-wins` and `server-wins` conflict behavior is reversed**
   - **Paths:** `src/core/sync/server.ts:112-175`, `src/core/sync/types.ts:1-8`
   - **Evidence:** On conflict, `strategy === "client-wins"` enters the `serverWins` branch and returns `server-kept`. `strategy === "server-wins"` does not enter that branch and falls through to insert the incoming client change as `applied`.
   - **Why it matters:** Operators selecting either explicit policy get the opposite result, causing silent loss of the version they intended to preserve.

7. **high — “Applied” sync changes never reach domain tables, and normal cloud edits never enter the journal**
   - **Paths:** `src/core/sync/server.ts:98-176`, `desktop/src/sync-manager.cjs:65-117`, `src/domain/schedules.ts:62-227` (representative CRUD path)
   - **Evidence:** `pushChange` only creates a `SyncLog` row and returns status `applied`; it never upserts/deletes `MinyanSchedule`, `Announcement`, `Style`, or any other named syncable table. Conversely, ordinary CRUD functions mutate their domain rows without creating `SyncLog` records. Desktop pull reads only the sync log and overlays only schedules/announcements in `DesktopSyncInbox`.
   - **Why it matters:** Desktop changes do not update the cloud app, cloud admin edits do not propagate to desktop, and successful sync responses misreport persistence.

8. **high — Public display schedule offsets and “nearest” rounding compute the wrong time**
   - **Paths:** `src/core/board/snapshot.ts:129-165`, `src/domain/mobile-data.ts:24-56`
   - **Evidence:** The display snapshot applies `base - offsetMinutes`, while the mobile/admin calculation applies `base.plus({ minutes: schedule.offset })`; a configured `+10` therefore appears ten minutes before the zman on the board and ten minutes after it on mobile. `roundTime` also uses `Math.floor` for both `nearest` and `down`.
   - **Why it matters:** The same minyan has conflicting times across displays, and nearest rounding is systematically early.

9. **high — Public displays ignore each minyan’s day-of-week mask**
   - **Paths:** `src/server/board-repo.ts:125-152,239-286`, `src/core/board/snapshot.ts:260-264`, `src/domain/mobile-data.ts:76-100`
   - **Evidence:** `mapMinyan` drops `dayOfWeekMask`, and `buildDisplaySnapshot` maps every active minyan without weekday filtering. The mobile path correctly filters `dayOfWeekMask[weekday]`.
   - **Why it matters:** Weekday-only, Shabbat-only, and other restricted services appear on the wrong days on the main wall display.

10. **medium — Public displays ignore announcement date windows**
    - **Paths:** `src/server/board-repo.ts:239-301`, `src/core/board/snapshot.ts:287-304`, `src/domain/mobile-data.ts:116-133`
    - **Evidence:** Board loading selects every `isActive` announcement and maps only text/priority, dropping `startDate`, `endDate`, and schedule rules. The snapshot returns them all. The mobile path separately enforces start/end dates.
    - **Why it matters:** Expired notices remain on the board and future announcements publish early.

11. **medium — Suspended organizations and disabled screens remain publicly readable**
    - **Paths:** `src/server/board-repo.ts:200-214`, `app/api/display/[orgSlug]/[screenId]/route.ts:10-28`, `app/show/[orgSlug]/[screenId]/page.tsx:10-30`
    - **Evidence:** `loadBoardData` finds an organization by slug and a screen by ID/name without checking `Organization.status` or `Screen.isActive`. Both public routes use it directly; the JSON route then marks the response publicly cacheable.
    - **Why it matters:** Disabling a screen or suspending a tenant does not revoke public access to its schedules, announcements, memorial names, media, and board configuration.

12. **high — Replace imports can erase good data and leave a partial replacement**
    - **Paths:** `src/io/import-export.ts:128-257`, `app/api/org/[orgId]/import/route.ts:40-57,78-86`
    - **Evidence:** Replace mode runs `deleteMany` first, then inserts rows one at a time without a transaction. Numeric/date/domain fields are only coerced, not validated. If any later insert throws, the route reports `written: 0`, but the deletion and earlier inserts are already committed.
    - **Why it matters:** One malformed row can destroy the existing schedule/content set while the API misleadingly reports no writes.

13. **high — Media upload permits unbounded arbitrary same-origin files**
    - **Paths:** `app/api/org/[orgId]/media/route.ts:21-58`, `src/domain/content.ts:64-79`
    - **Evidence:** The route calls `request.formData()`, buffers the entire file, accepts any extension/MIME/content, and writes it under `public/uploads`. There is no size limit or allowlist. The resulting public URL is returned and served from the application origin.
    - **Why it matters:** An editor can exhaust server memory/disk or host active HTML/SVG content on the trusted origin for stored phishing/XSS-style attacks against higher-privilege users.

14. **medium — Hybrid sync credentials have no issuance path**
    - **Paths:** `src/server/sync-auth.ts:25-40`, `app/api/org/[orgId]/screens/route.ts:42-116`, `desktop/src/config.cjs:6-18`, `desktop/src/sync-manager.cjs:48-63`
    - **Evidence:** `createScreenCredential` has no caller. Screen CRUD never returns or rotates a credential, while the desktop sync manager refuses to run without a manually supplied `screenCredential`.
    - **Why it matters:** A normal user cannot configure the claimed hybrid mode through the app, and there is no revocation/rotation workflow short of changing a global secret or disabling the screen.

## Summary counts
- Critical: 1
- High: 10
- Medium: 3
- Low: 0
- Total: 14
