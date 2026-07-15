import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import { announcementDto } from "../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string }> };

/** E9 — load org before resolving (inventory bug fix). */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;

  const org = await prisma.organization.findUnique({ where: { id: access.orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const rows = await prisma.announcement.findMany({
    where: { orgId: access.orgId },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ org: { id: org.id, slug: org.slug, name: org.name }, announcements: rows.map(announcementDto) });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const org = await prisma.organization.findUnique({ where: { id: access.orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const body = (await request.json()) as Record<string, unknown>;
  if (body.action === "reorder" && Array.isArray(body.ids)) {
    const ids = body.ids as string[];
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.announcement.updateMany({
          where: { id, orgId: access.orgId },
          data: { priority: ids.length - index },
        }),
      ),
    );
    const rows = await prisma.announcement.findMany({
      where: { orgId: access.orgId },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ announcements: rows.map(announcementDto) });
  }

  const row = await prisma.announcement.create({
    data: {
      orgId: access.orgId,
      title: String(body.title ?? "Untitled"),
      titleHebrew: (body.titleHebrew as string | null) ?? null,
      content: String(body.content ?? ""),
      contentHebrew: (body.contentHebrew as string | null) ?? null,
      scheduleRules: body.scheduleRules != null ? JSON.stringify(body.scheduleRules) : null,
      priority: Number(body.priority ?? 0),
      isActive: body.isActive !== false,
      startDate: (body.startDate as string | null) ?? null,
      endDate: (body.endDate as string | null) ?? null,
    },
  });
  return NextResponse.json({ announcement: announcementDto(row) }, { status: 201 });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const body = (await request.json()) as Record<string, unknown>;
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.announcement.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

  const row = await prisma.announcement.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title) : existing.title,
      titleHebrew: body.titleHebrew !== undefined ? (body.titleHebrew as string | null) : existing.titleHebrew,
      content: body.content !== undefined ? String(body.content) : existing.content,
      contentHebrew:
        body.contentHebrew !== undefined ? (body.contentHebrew as string | null) : existing.contentHebrew,
      scheduleRules:
        body.scheduleRules !== undefined
          ? body.scheduleRules == null
            ? null
            : JSON.stringify(body.scheduleRules)
          : existing.scheduleRules,
      priority: body.priority !== undefined ? Number(body.priority) : existing.priority,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      startDate: body.startDate !== undefined ? (body.startDate as string | null) : existing.startDate,
      endDate: body.endDate !== undefined ? (body.endDate as string | null) : existing.endDate,
    },
  });
  return NextResponse.json({ announcement: announcementDto(row) });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  const existing = await prisma.announcement.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
