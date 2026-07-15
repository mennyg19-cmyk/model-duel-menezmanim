import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import type { MinyanDetails } from "@/db/json";
import { minyanSchedules } from "@/db/schema";
import type { ScheduleWriteBody } from "@/admin/schedules/types";

export const dynamic = "force-dynamic";

function serialize(row: typeof minyanSchedules.$inferSelect) {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    hebrewName: row.hebrewName,
    type: row.type,
    baseZman: row.baseZman,
    fixedTime: row.fixedTime,
    offset: row.offset,
    earliest: row.earliest,
    latest: row.latest,
    roundTo: row.roundTo,
    roundDirection: row.roundDirection,
    room: row.room,
    dayOfWeekMask: row.dayOfWeekMask,
    scheduleGroupIds: row.scheduleGroupIds,
    details: row.details,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

/** E8 — list + create schedules. */
export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const rows = await db
      .select()
      .from(minyanSchedules)
      .where(eq(minyanSchedules.orgId, orgId))
      .orderBy(asc(minyanSchedules.sortOrder), asc(minyanSchedules.name));
    return NextResponse.json({ schedules: rows.map(serialize) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as ScheduleWriteBody | null;
    if (!body?.name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const existing = await db
      .select({ sortOrder: minyanSchedules.sortOrder })
      .from(minyanSchedules)
      .where(eq(minyanSchedules.orgId, orgId));
    const nextOrder =
      body.sortOrder ?? (existing.length ? Math.max(...existing.map((r) => r.sortOrder)) + 1 : 0);

    const type = body.type?.trim() || "other";
    const details: MinyanDetails | null =
      type === "placeholder"
        ? { ...(body.details ?? {}), isPlaceholder: true }
        : (body.details ?? null);

    const [row] = await db
      .insert(minyanSchedules)
      .values({
        orgId,
        name: body.name.trim(),
        hebrewName: body.hebrewName?.trim() || body.name.trim(),
        type,
        baseZman: body.baseZman ?? null,
        fixedTime: body.fixedTime ?? null,
        offset: body.offset ?? 0,
        earliest: body.earliest ?? null,
        latest: body.latest ?? null,
        roundTo: body.roundTo ?? 5,
        roundDirection: body.roundDirection ?? "nearest",
        room: body.room ?? null,
        dayOfWeekMask: body.dayOfWeekMask ?? "1111111",
        scheduleGroupIds: body.scheduleGroupIds ?? null,
        details,
        isActive: body.isActive ?? true,
        sortOrder: nextOrder,
      })
      .returning();

    return NextResponse.json({ schedule: row ? serialize(row) : null }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
