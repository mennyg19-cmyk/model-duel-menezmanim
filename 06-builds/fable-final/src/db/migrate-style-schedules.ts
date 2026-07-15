// F-CORE3 — one-time: screens with assignedStyleId but empty styleSchedules get a
// default schedule entry written so render no longer relies on runtime migration forever.
// Safe to re-run (skips screens that already have schedules).

import { eq } from "drizzle-orm";
import { createDb, resolveDbConfig } from "./client";
import { screens } from "./schema";
import type { ScreenStyleSchedule } from "@/core/style-engine";

const db = createDb(resolveDbConfig());

const rows = await db.select().from(screens);
let migrated = 0;

for (const row of rows) {
  const existing = row.styleSchedules as ScreenStyleSchedule[] | null;
  if (existing && existing.length > 0) continue;
  if (!row.assignedStyleId) continue;

  const schedule: ScreenStyleSchedule[] = [
    {
      id: `mig-${row.assignedStyleId}-def`,
      styleId: row.assignedStyleId,
      priority: 0,
      breakpoint: "all",
      rules: [{ type: "default" }],
    },
  ];

  await db.update(screens).set({ styleSchedules: schedule }).where(eq(screens.id, row.id));
  migrated += 1;
}

console.log(`[db:migrate-style-schedules] migrated ${migrated} of ${rows.length} screens (F-CORE3).`);
