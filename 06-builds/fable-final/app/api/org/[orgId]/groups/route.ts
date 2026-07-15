import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { ScheduleRule } from "@/db/json";
import { minyanSchedules, scheduleGroups } from "@/db/schema";

export const dynamic = "force-dynamic";

/** E15 — list + create schedule groups. */
export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");

    const groups = await db
      .select()
      .from(scheduleGroups)
      .where(eq(scheduleGroups.orgId, orgId))
      .orderBy(asc(scheduleGroups.sortOrder), asc(scheduleGroups.name));

    const allSchedules = await db
      .select({ scheduleGroupIds: minyanSchedules.scheduleGroupIds })
      .from(minyanSchedules)
      .where(eq(minyanSchedules.orgId, orgId));

    const countMap = new Map<string, number>();
    for (const s of allSchedules) {
      for (const gid of s.scheduleGroupIds ?? []) {
        countMap.set(gid, (countMap.get(gid) ?? 0) + 1);
      }
    }

    return NextResponse.json({
      groups: groups.map((g) => ({
        id: g.id,
        orgId: g.orgId,
        name: g.name,
        hebrewName: g.hebrewName,
        color: g.color,
        active: g.active,
        sortOrder: g.sortOrder,
        isBuiltIn: g.isBuiltIn,
        autoActivationRules: g.autoActivationRules,
        scheduleCount: countMap.get(g.id) ?? 0,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      hebrewName?: string;
      color?: string;
      active?: boolean;
      autoActivationRules?: ScheduleRule[] | null;
    } | null;
    if (!body?.name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const existing = await db
      .select({ sortOrder: scheduleGroups.sortOrder })
      .from(scheduleGroups)
      .where(eq(scheduleGroups.orgId, orgId));
    const sortOrder = existing.length ? Math.max(...existing.map((r) => r.sortOrder)) + 1 : 0;

    const [row] = await db
      .insert(scheduleGroups)
      .values({
        orgId,
        name: body.name.trim(),
        hebrewName: body.hebrewName?.trim() || body.name.trim(),
        color: body.color?.trim() || "#2563eb",
        active: body.active ?? true,
        autoActivationRules: body.autoActivationRules ?? null,
        sortOrder,
        isBuiltIn: false,
      })
      .returning();

    return NextResponse.json(
      {
        group: row
          ? {
              id: row.id,
              orgId: row.orgId,
              name: row.name,
              hebrewName: row.hebrewName,
              color: row.color,
              active: row.active,
              sortOrder: row.sortOrder,
              isBuiltIn: row.isBuiltIn,
              autoActivationRules: row.autoActivationRules,
              scheduleCount: 0,
            }
          : null,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
