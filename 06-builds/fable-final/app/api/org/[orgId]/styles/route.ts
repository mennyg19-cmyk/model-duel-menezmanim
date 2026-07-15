import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { createStyle, listStyles } from "@/server/styles-repo";
import { toEditorStyle } from "@/admin/editor/map-rows";
import type { StyleActivationRule } from "@/core/style-engine";

export const dynamic = "force-dynamic";

/** E14 — list / create styles. */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "viewer");
    const rows = await listStyles(orgId);
    return NextResponse.json({
      styles: rows.map((s) => ({
        ...toEditorStyle(s),
        isDefault: s.isDefault,
        sortOrder: s.sortOrder,
        activationRules: (s.activationRules as StyleActivationRule[]) ?? [],
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
    const body = (await request.json().catch(() => null)) as { name?: string } | null;
    const existing = await listStyles(orgId);
    const sortOrder = existing.length === 0 ? 0 : Math.max(...existing.map((s) => s.sortOrder)) + 1;
    const id = await createStyle({
      orgId,
      name: body?.name?.trim() || "New style",
      sortOrder,
      isDefault: existing.length === 0,
      activationRules: [{ type: "default" }],
    });
    return NextResponse.json({ styleId: id }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
