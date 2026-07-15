# Fix log — rebuild-a (Test 3, vague bug fixing)

All 9 symptoms reproduced and fixed. Verified against the running app on port 3101
(seeded db, API calls as owner/editor/screen) plus a tsx unit check for the time math.
Typecheck clean. Server killed after verification.

## 1. Shacharis earlier than expected with +15 offset
`src/core/board/snapshot.ts` — `resolveMinyanTime` subtracted the offset
(`base.getTime() - offsetMinutes`) while every other consumer (`mobile-data.ts`,
`scheduler.ts`) adds it. Changed `-` to `+`.
Verified: 06:48 base + 15 now resolves to 07:05, not 06:30.

## 2. Server-wins sync overwritten by phone
`src/core/sync/server.ts` — the `serverWins` condition tested
`strategy === "client-wins"` instead of `"server-wins"`, so server-wins applied the
client change and client-wins kept the server. Swapped to `"server-wins"`.
Verified: conflicting push with `strategy=server-wins` now returns `server-kept`.

## 3. Nearest-5 rounding always rounds down
`src/core/board/snapshot.ts` — `roundTime` ternary ended with `Math.floor` for the
"nearest" branch (`up ? ceil : down ? floor : floor`). Changed the fallback to
`Math.round`. Verified: 07:03 rounds to 07:05 on nearest, still 07:00 on down.

## 4. Editor demoted an admin from the members page
`app/api/org/[orgId]/members/route.ts` — PATCH (role change) used
`requireOrgMember(orgId, { write: true })`, which includes editors; GET/DELETE
already required admin. Changed PATCH to `{ admin: true }`.
Verified: editor's PATCH now gets HTTP 403.

## 5. Lobby screen token opened sync against the wrong shul
`src/server/sync-auth.ts` — `authorizeSyncRequest` verified the credential's
screenId but never compared `payload.orgId` to the target org (the error message
even says "does not match this organization"). Added `payload.orgId !== org.id`
to the check. Verified: token minted for another org is rejected 403; correct
token still pulls.

## 6. Security review flagged session cookie checks
Two issues:
- `src/auth/session.ts` — `verifySessionToken` compared signatures with `!==`
  (timing-unsafe; `timingSafeEqual` was imported but unused). Now uses
  `timingSafeEqual`, matching `sync-auth.ts`.
- `app/api/auth/login/route.ts` + `register/route.ts` — session cookie lacked the
  `secure` flag. Added `secure: NODE_ENV === "production"` (HttpOnly + SameSite=lax
  were already set).

## 7. Weekly export week ends on Friday
`src/io/weekly-export.ts` — `weekEnd = weekStart.plus({ days: 5 })` (6-day week).
Changed to `days: 6`. Verified: sunday-basis export now shows
start=2026-07-12 Sun, end=2026-07-18 Sat.

## 8. CSV import mapped Name into the Hebrew column
`src/io/csv.ts` — `mapColumns` had the assignment inverted:
`out[source] = row[target]` (writing values under CSV header names and reading by
target field names). Fixed to `out[target] = row[source]`.
Verified: preview with mapping `{name: "Full Name", hebrewName: "Hebrew"}` now
fills `name` and `hebrewName` correctly.

## 9. Second sync pull with cursor brings nothing
`src/core/sync/server.ts` — `pull` paged with `timestamp lt cursor` / `id lt` while
ordering ascending, so the cursor walked backwards past the oldest row and returned
nothing. Changed both comparisons to `gt`. Verified: pull limit=1 returns the seed
row + cursor; second pull with that cursor returns the next change.
