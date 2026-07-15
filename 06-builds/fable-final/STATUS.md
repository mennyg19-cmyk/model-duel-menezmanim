# STATUS — Rebuild arm A

## Proof-of-read (Phase 12)

- CONTESTANT-PROMPT: Phase 12 only in rebuild-a; ports 3101/8101; no git; open calls → reversible DECIDED + continue; STATUS + DECISION-LOG with evidence; this is the **final** phase — mark all complete when done.
- PHASE-PLAN Phase 12: R10, DK1–DK26, G1–G13, E5 (+F-API4), F-CORE4, F-DESKTOP-COUPLING, F-DESKTOP-WIRING, F-DESKTOP-VERCEL; desktop scope/auth reconciliation.
- FEATURE-INVENTORY §8: three modes + Docker; DK registry + G1–G13 gaps; sync pull/push; desktop never in web deps.

## Phase completed: 12 — Desktop + sync (FINAL)

## All phases complete

Phases 1–12 finished. No further rebuild phases remain in PHASE-PLAN.md.

## Inventory IDs claimed this phase

- **R10** — Electron desktop package at `desktop/` (own package.json).
- **DK1–DK26** — modes local/display/hybrid (+ Docker DK2); display/admin windows; tray; Ctrl+Shift+A; config.json; local DB path; IPC preload bridge; Next standalone LAN server; mobile PWA over LAN; local `/api/zmanim/:date`, `/api/schedule`, `/api/announcements`; mode selector; BeeZee picker+parser; SyncClient + SyncManager; electron-builder NSIS packaging path.
- **G1–G13** — kiosk, auto-start, single-instance, BZS file picker, sync-update IPC emit, SyncManager wired, mode drives launch, local APIs→DB, mobile LAN, icons placeholder + NSIS target, tray keep-alive, LAN URL in tray.
- **E5** — `/api/sync/pull`, `/api/sync/push` (+ whoami, run); **F-API4** device Bearer tokens.
- **F-CORE4** — durable `sync_logs` (D17) on apply.
- **F-DESKTOP-COUPLING** — rebuild-a-local paths (not Turbo `out/web`).
- **F-DESKTOP-WIRING** — modes/APIs/sync/IPC/kiosk/auto-start/single-instance wired.
- **F-DESKTOP-VERCEL** — Electron only under `desktop/`, never a web dependency.

## How to start

```
cd D:\Projects\Others\MenEZmanim\_experiment\rebuild-a
npm install
npm run db:migrate
npm run db:seed
npm run dev                          # http://localhost:3101
```

Login: `owner@demo.local` / `demo-pass` → `/admin/demo/devices` to pair a hybrid token.

Desktop (after `npm run build` for standalone):

```
cd desktop
npm install
npm start
```

Docker (DK2): `docker compose -f desktop/docker-compose.yml up` (Postgres maps to 8101).

## Verification evidence (walked 2026-07-15, app on 3101)

1. Login → pair device → token `mez_…`; `GET /api/sync/whoami` → org slug `demo`.
2. `GET /api/sync/pull?since=0` → **200**, **37** changes; `POST /api/sync/push` empty → **200** applied=0.
3. `GET /api/schedule?org=demo` → 3 rows; `/api/announcements?org=demo` → 2; `/api/zmanim/2026-07-15?org=demo` → 200.
4. `GET /admin/demo/devices` → 200 “Pair a new device”.
5. `POST /api/sync/run` under session auth → **403** (desktop-only / AUTH_MODE=local).
6. `npm run typecheck` clean; `npm test` **183**; `npm run build` green (standalone + sync/devices routes).

## Next

**None.** All phases complete.
