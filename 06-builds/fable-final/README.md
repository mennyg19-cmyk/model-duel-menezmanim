# Rebuild arm A

Workspace for experiment contestant A.
Ports: web **3101**, local DB **8101** (reserved; Phase 1 uses a local `file:` DB, no server).
Do not touch `../rebuild-b` or parent `apps/`.

## Stack (picked Phase 1, one pattern per concern)

Next.js App Router (TypeScript) · Drizzle ORM on libSQL (`local-data/dev.db`) · kosher-zmanim + Luxon (dates/zmanim) · Vitest. Engine and schema harvested from the parent rebuild's tested port — calculations must not change (inventory Section 3).

## Run

```
npm install
npm run db:migrate
npm run db:seed
npm run db:migrate-style-schedules   # F-CORE3 (noop if seed already wrote schedules)
npm run dev                          # http://localhost:3101
```

Boards: `/show/demo` · Widget Showcase under `/show/demo/<id>` (see hub `/`).

Checks: `npm run typecheck` · `npm test` · `npm run build`.

## What exists (Phase 1–2)

- `src/db/` — 17-model schema (D1–D17, + sync_devices, screens.lastSeenAt), client, migrate, seed, F-CORE3 style-schedule backfill.
- `src/core/` — C1–C12 engine + board snapshot builder (151 tests).
- `src/board/` — Board / BoardSurface / ScaleToFit / LiveBoard (F-NAV2).
- `src/widgets/` — W1–W17 registry + renderers (incl. finished FIDS).
- `/api/zmanim`, `/api/calendar`, `/api/display/:org/:screen` (+ heartbeat).
- `/show`, `/show/:org`, `/show/:org/:screen`; `/demo/:screen` → show (R9).
- `/` — temporary hub with links into live boards (landing is Phase 3).

Plan: `PHASE-PLAN.md` · state: `STATUS.md` · calls: `DECISION-LOG.md`.
