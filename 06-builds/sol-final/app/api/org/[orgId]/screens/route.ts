import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";

type Ctx = { params: Promise<{ orgId: string }> };

function screenDto(row: {
  id: string;
  name: string;
  orgId: string;
  assignedStyleId: string | null;
  styleSchedules: string | null;
  isActive: boolean;
  resolution: string;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  let styleSchedules: unknown = null;
  if (row.styleSchedules) {
    try {
      styleSchedules = JSON.parse(row.styleSchedules);
    } catch {
      styleSchedules = null;
    }
  }
  return {
    id: row.id,
    name: row.name,
    orgId: row.orgId,
    assignedStyleId: row.assignedStyleId,
    styleSchedules,
    isActive: row.isActive,
    resolution: row.resolution,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    publicUrl: `/show/${row.orgId}/${row.id}`,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** E13 — screens CRUD. */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const org = await prisma.organization.findUnique({ where: { id: access.orgId } });
  const rows = await prisma.screen.findMany({ where: { orgId: access.orgId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({
    screens: rows.map((r) => ({
      ...screenDto(r),
      publicUrl: `/show/${org?.slug ?? access.orgId}/${r.id === "main" ? "main" : r.id}`,
    })),
  });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const defaultStyle = await prisma.style.findFirst({
    where: { orgId: access.orgId, isDefault: true },
  });
  const row = await prisma.screen.create({
    data: {
      name: String(body.name ?? "New Screen"),
      orgId: access.orgId,
      assignedStyleId: (body.assignedStyleId as string | null) ?? defaultStyle?.id ?? null,
      styleSchedules: body.styleSchedules != null ? JSON.stringify(body.styleSchedules) : null,
      isActive: body.isActive !== false,
      resolution: String(body.resolution ?? "1920x1080"),
    },
  });
  return NextResponse.json({ screen: screenDto(row) }, { status: 201 });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.screen.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  const row = await prisma.screen.update({
    where: { id },
    data: {
      name: body.name !== undefined ? String(body.name) : existing.name,
      assignedStyleId:
        body.assignedStyleId !== undefined ? (body.assignedStyleId as string | null) : existing.assignedStyleId,
      styleSchedules:
        body.styleSchedules !== undefined
          ? body.styleSchedules == null
            ? null
            : JSON.stringify(body.styleSchedules)
          : existing.styleSchedules,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      resolution: body.resolution !== undefined ? String(body.resolution) : existing.resolution,
    },
  });
  return NextResponse.json({ screen: screenDto(row) });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  const existing = await prisma.screen.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  await prisma.screen.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
