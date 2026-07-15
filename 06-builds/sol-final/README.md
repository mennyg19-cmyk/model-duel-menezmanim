# MenEZmanim — rebuild arm B

Fresh rebuild of the MenEZmanim synagogue display and scheduling system.

## Run

```powershell
npm install
npm run db:setup
npm run dev
```

Web: `http://localhost:3102`. Local/desktop mode uses SQLite at `prisma/dev.db`. Docker publishes Postgres on port **8102**.

Seeded logins: `owner@demo.local`, `newcomer@demo.local`, `invitee@demo.local`, `admin@menezmanim.local`.

## Desktop

The Electron package is isolated under `desktop/`; root installs and web/Vercel builds do not install Electron or native desktop modules.

```powershell
npm install
npm run db:setup
npm run build
npm --prefix desktop install
npm run desktop:smoke
npm run desktop:dist
```

`desktop:dist` produces `desktop/dist/MenEZmanim-1.0.0-win-x64.exe`. The app supports fully-local, hybrid, and display-only modes. Fully-local/hybrid embed the same Next `/show` renderer, use `{userData}/data/zmanim.db`, and serve the LAN PWA at `http://<lan-ip>:3001/mobile/`.

## Self-hosted Docker

```powershell
docker compose up --build
```

Web is `http://localhost:3102`; Postgres is published at `localhost:8102`. Set `SESSION_SECRET`, `SYNC_DEVICE_SECRET`, and `POSTGRES_PASSWORD` before non-local use. Docker selects the isolated `self-hosted` signed-cookie auth mode and excludes `desktop/` from its build context.

## Project conventions

- Next.js App Router with strict TypeScript.
- Server components by default; client components only for browser interaction.
- Prisma schema is the single source of truth for persistence.
- Auth modes are explicit: local, Clerk cloud, desktop, or self-hosted signed-cookie sessions.
- `GET /api/me` is flat with top-level `isSuperAdmin`.
- Global CSS with shared custom properties; no component-level inline colors.
- English is the default UI locale. `?lang=he` selects Hebrew and RTL on the landing page.
- Desktop fully-local/hybrid loads the same `/show` route as web; there is no second board renderer.

## Reference ownership

- v1 owns the fuller editor, widgets, BeeZee import, export, and desktop behavior.
- v2 owns the 32-zman target and fields recovered after v1.
- The merged inventories own required behavior. This rebuild owns layout and code structure.

## Experiment boundary

Build only in this folder. Do not modify `../rebuild-a`, the parent app, source references, or experiment results. The orchestrator owns git.
