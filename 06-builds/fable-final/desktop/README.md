# Desktop (R10) — rebuild-a

Separate package so Electron never enters the Next web dependency graph (F-DESKTOP-VERCEL).

## Modes (DK1 / DK16)

- **local** — embed Next standalone + local SQLite; LAN serves `/show` and `/mobile` (DK12/G9)
- **display** — kiosk window on a remote board URL
- **hybrid** — local + `/api/sync/run` against `cloudUrl` + `deviceToken`
- **Docker** — `docker compose -f desktop/docker-compose.yml up` (session auth, Postgres on 8101)

## Dev

1. From rebuild-a root: `npm run build` (standalone output)
2. `cd desktop && npm install && npm start`

Config: `%APPDATA%/MenEZmanim/config.json` (or Electron userData). Tray: mode, LAN URL (G13), BeeZee picker (G4), kiosk (G1), auto-start (G2). Single-instance lock (G3). Ctrl+Shift+A opens admin (DK6).

## Package

`cd desktop && npm run package` → NSIS installer (G11). Icons: `resources/icons/icon.ico` (G10 placeholder README until branded assets land).
