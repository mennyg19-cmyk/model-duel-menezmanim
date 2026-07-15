// === What's in this file ===
// Applies the generated SQL migrations (the drizzle/ folder) to whatever database
// DATABASE_URL points at -- or the local dev file when it's unset. Run it with
// `pnpm db:migrate`. This is deliberately a separate, hand-run step: migrations
// must NEVER run inside the Vercel build (deploy-awareness rule).

import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb, resolveDbConfig } from "./client";

const db = createDb(resolveDbConfig());

await migrate(db, { migrationsFolder: "drizzle" });
console.log("[db:migrate] migrations applied.");
