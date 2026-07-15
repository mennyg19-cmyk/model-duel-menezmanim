# Rebuild B — Test 3 fixes

1. `src/core/board/snapshot.ts`: `resolveMinyanTime` subtracted positive offsets. Changed it to add the configured offset.
2. `src/core/sync/server.ts`: the server-wins branch checked `client-wins`. Corrected the strategy check.
3. `src/core/board/snapshot.ts`: nearest rounding used `Math.floor`. Changed nearest to `Math.round`; up/down remain unchanged.
4. `app/api/org/[orgId]/members/route.ts`: role changes required general write access, which includes editors. Changed PATCH authorization to admin access.
5. `src/server/sync-auth.ts`: screen credentials checked the screen id but not the signed org id. Both must now match the requested active screen.
6. `src/auth/session.ts`, `middleware.ts`: session signatures used direct string comparison and ignored `issuedAt`. Added constant-time verification, exact token shape checks, and a seven-day lifetime check in both paths.
7. `src/io/weekly-export.ts`: `weekEnd` added five days to the start. Changed it to six, making Sunday–Saturday and Saturday–Friday full seven-day ranges.
8. `src/io/csv.ts`: `mapColumns` wrote source keys from target columns. Corrected it to write each target from its selected source.
9. `src/core/sync/server.ts`: an ascending pull cursor filtered for rows less than the cursor. Changed both timestamp and id tie-break filters to greater-than.

Verification: `npm run typecheck`, `npm run build`, Phase 11 sync checks, and targeted running-app checks on port 3102 passed. The app checks covered positive offsets, nearest rounding, server/client conflict policies, incremental cursors, editor role denial, cross-org screen-token denial, session expiry/signature checks, seven-day exports, and CSV mapping.
