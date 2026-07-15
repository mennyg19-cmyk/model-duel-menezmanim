import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { minyanSchedules } from "@/db/schema";

export const dynamic = "force-dynamic";

/** P4.4 reorder + P4.6 bulk ops. */
export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as {
      action?: "reorder" | "bulk_delete" | "bulk_move" | "bulk_copy";
      orderedIds?: string[];
      ids?: string[];
      groupId?: string;
    } | null;

    if (!body?.action) return NextResponse.json({ error: "Missing action." }, { status: 400 });

    if (body.action === "reorder") {
      const ids = body.orderedIds ?? [];
      for (let i = 0; i < ids.length; i++) {
        await db
          .update(minyanSchedules)
          .set({ sortOrder: i })
          .where(and(eq(minyanSchedules.id, ids[i]!), eq(minyanSchedules.orgId, orgId)));
      }
      return NextResponse.json({ ok: true });
    }

    const ids = body.ids ?? [];
    if (!ids.length) return NextResponse.json({ error: "No ids." }, { status: 400 });

    const rows = await db
      .select()
      .from(minyanSchedules)
      .where(and(eq(minyanSchedules.orgId, orgId), inArray(minyanSchedules.id, ids)));

    if (body.action === "bulk_delete") {
      await db
        .delete(minyanSchedules)
        .where(and(eq(minyanSchedules.orgId, orgId), inArray(minyanSchedules.id, ids)));
      return NextResponse.json({ ok: true, deleted: rows.length });
    }

    if (!body.groupId) return NextResponse.json({ error: "groupId required." }, { status: 400 });

    if (body.action === "bulk_move") {
      for (const row of rows) {
        await db
          .update(minyanSchedules)
          .set({ scheduleGroupIds: [body.groupId] })
          .where(eq(minyanSchedules.id, row.id));
      }
      return NextResponse.json({ ok: true, updated: rows.length });
    }

    if (body.action === "bulk_copy") {
      const created = [];
      for (const row of rows) {
        const groups = new Set(row.scheduleGroupIds ?? []);
        groups.add(body.groupId);
        const [copy] = await db
          .insert(minyanSchedules)
          .values({
            orgId,
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
            scheduleGroupIds: [...groups],
            details: row.details,
            isActive: row.isActive,
            sortOrder: row.sortOrder + 1,
          })
          .returning({ id: minyanSchedules.id });
        if (copy) created.push(copy.id);
      }
      return NextResponse.json({ ok: true, created });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
