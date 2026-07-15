import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import type { ScreenStyleSchedule } from "@/core/style-engine";
import { deleteScreen, getStyleWithObjects, listScreens, updateScreen } from "@/server/styles-repo";

export const dynamic = "force-dynamic";

function serScreen(row: Awaited<ReturnType<typeof listScreens>>[number]) {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    assignedStyleId: row.assignedStyleId,
    styleSchedules: (row.styleSchedules as ScreenStyleSchedule[] | null) ?? [],
    isActive: row.isActive,
    resolution: row.resolution,
    lastSeenAt: row.lastSeenAt ? row.lastSeenAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** E13 — get / update / delete one screen. */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string; screenId: string }> }) {
  try {
    const { orgId, screenId } = await params;
    await requireOrgRole(orgId, "viewer");
    const row = (await listScreens(orgId)).find((s) => s.id === screenId);
    if (!row) return NextResponse.json({ error: "Screen not found." }, { status: 404 });
    return NextResponse.json({ screen: serScreen(row) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ orgId: string; screenId: string }> }) {
  try {
    const { orgId, screenId } = await params;
    await requireOrgRole(orgId, "editor");
    const existing = (await listScreens(orgId)).find((s) => s.id === screenId);
    if (!existing) return NextResponse.json({ error: "Screen not found." }, { status: 404 });
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      resolution?: string;
      assignedStyleId?: string | null;
      styleSchedules?: ScreenStyleSchedule[] | null;
      isActive?: boolean;
    } | null;
    if (!body) return NextResponse.json({ error: "Body required." }, { status: 400 });
    if (body.assignedStyleId) {
      const style = await getStyleWithObjects(orgId, body.assignedStyleId);
      if (!style) return NextResponse.json({ error: "Style not found." }, { status: 400 });
    }
    await updateScreen(orgId, screenId, {
      name: body.name?.trim() ?? existing.name,
      resolution: body.resolution?.trim() ?? existing.resolution,
      assignedStyleId: body.assignedStyleId !== undefined ? body.assignedStyleId : existing.assignedStyleId,
      styleSchedules: body.styleSchedules !== undefined ? body.styleSchedules : existing.styleSchedules,
      isActive: body.isActive ?? existing.isActive,
    });
    const row = (await listScreens(orgId)).find((s) => s.id === screenId)!;
    return NextResponse.json({ screen: serScreen(row) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ orgId: string; screenId: string }> }) {
  try {
    const { orgId, screenId } = await params;
    await requireOrgRole(orgId, "admin");
    const existing = (await listScreens(orgId)).find((s) => s.id === screenId);
    if (!existing) return NextResponse.json({ error: "Screen not found." }, { status: 404 });
    await deleteScreen(orgId, screenId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
