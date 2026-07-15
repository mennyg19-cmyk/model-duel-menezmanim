import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import type { ScreenStyleSchedule } from "@/core/style-engine";
import { createScreen, listScreens, listStyles } from "@/server/styles-repo";

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

/** E13 — list / create screens. */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const [screenRows, styleRows] = await Promise.all([listScreens(orgId), listStyles(orgId)]);
    return NextResponse.json({
      screens: screenRows.map(serScreen),
      styles: styleRows.map((s) => ({
        id: s.id,
        name: s.name,
        isDefault: s.isDefault,
        canvasWidth: s.canvasWidth,
        canvasHeight: s.canvasHeight,
        backgroundColor: s.backgroundColor,
        sortOrder: s.sortOrder,
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
      resolution?: string;
      assignedStyleId?: string | null;
      styleSchedules?: ScreenStyleSchedule[] | null;
      isActive?: boolean;
    } | null;
    if (!body?.name?.trim()) return NextResponse.json({ error: "Name required." }, { status: 400 });
    const resolution = body.resolution?.trim() || "1920x1080";
    const styles = await listStyles(orgId);
    const assignedStyleId = body.assignedStyleId ?? styles.find((s) => s.isDefault)?.id ?? styles[0]?.id ?? null;
    const styleSchedules =
      body.styleSchedules ??
      (assignedStyleId
        ? [
            {
              id: crypto.randomUUID(),
              styleId: assignedStyleId,
              breakpoint: "all" as const,
              priority: 0,
              rules: [{ type: "default" as const }],
            },
          ]
        : []);
    const id = await createScreen({
      orgId,
      name: body.name.trim(),
      resolution,
      assignedStyleId,
      styleSchedules,
      isActive: body.isActive ?? true,
    });
    const [row] = (await listScreens(orgId)).filter((s) => s.id === id);
    return NextResponse.json({ screen: row ? serScreen(row) : { id } }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
