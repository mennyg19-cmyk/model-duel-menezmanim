import { count, eq } from "drizzle-orm";
import { requireOrgBySlug } from "@/auth/org-access";
import { db } from "@/db/client";
import {
  announcements,
  memorials,
  minyanSchedules,
  orgMemberships,
  screens,
  sponsors,
  styles,
} from "@/db/schema";
import type { DashboardStats } from "./Dashboard";

export async function loadDashboardStats(orgSlug: string): Promise<DashboardStats> {
  const { org } = await requireOrgBySlug(orgSlug, "viewer");

  const [schedules] = await db.select({ n: count() }).from(minyanSchedules).where(eq(minyanSchedules.orgId, org.id));
  const [anns] = await db.select({ n: count() }).from(announcements).where(eq(announcements.orgId, org.id));
  const [mems] = await db.select({ n: count() }).from(memorials).where(eq(memorials.orgId, org.id));
  const [spons] = await db.select({ n: count() }).from(sponsors).where(eq(sponsors.orgId, org.id));
  const [members] = await db.select({ n: count() }).from(orgMemberships).where(eq(orgMemberships.orgId, org.id));
  const [styleCount] = await db.select({ n: count() }).from(styles).where(eq(styles.orgId, org.id));
  const screenRows = await db
    .select({ id: screens.id, name: screens.name })
    .from(screens)
    .where(eq(screens.orgId, org.id));

  return {
    orgId: org.id,
    orgSlug: org.slug,
    orgName: org.name,
    plan: org.plan,
    status: org.status,
    counts: {
      schedules: schedules?.n ?? 0,
      announcements: anns?.n ?? 0,
      memorials: mems?.n ?? 0,
      sponsors: spons?.n ?? 0,
      members: members?.n ?? 0,
      styles: styleCount?.n ?? 0,
      screens: screenRows.length,
    },
    screens: screenRows,
    primaryScreenId: screenRows[0]?.id ?? null,
  };
}
