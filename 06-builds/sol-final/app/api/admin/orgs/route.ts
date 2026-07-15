import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/db/client";
import { requireSuperAdmin } from "../../../../src/domain/super-admin";
import { DEFAULT_SCHEDULE_GROUPS } from "../../../../src/content/default-groups";

/** E20 — list/create orgs (super-admin only, F-API5). */
export async function GET() {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { memberships: true, screens: true, styles: true } },
    },
  });
  return NextResponse.json({
    orgs: orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      status: o.status,
      plan: o.plan,
      timezone: o.timezone,
      members: o._count.memberships,
      screens: o._count.screens,
      styles: o._count.styles,
      createdAt: o.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });

  const exists = await prisma.organization.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const org = await prisma.$transaction(async (tx) => {
    const created = await tx.organization.create({
      data: {
        name,
        slug,
        status: String(body.status ?? "pending"),
        latitude: Number(body.latitude ?? 31.7683),
        longitude: Number(body.longitude ?? 35.2137),
        elevation: Number(body.elevation ?? 0),
        timezone: String(body.timezone ?? "Asia/Jerusalem"),
        inIsrael: body.inIsrael !== false,
        plan: String(body.plan ?? "free"),
      },
    });
    await tx.scheduleGroup.createMany({
      data: DEFAULT_SCHEDULE_GROUPS.map((group, index) => ({
        orgId: created.id,
        name: group.name,
        hebrewName: group.hebrewName,
        color: group.color,
        active: true,
        sortOrder: index,
        isBuiltIn: true,
      })),
    });
    const style = await tx.style.create({
      data: {
        name: "Default Style",
        orgId: created.id,
        backgroundColor: "#0f172a",
        canvasWidth: 1920,
        canvasHeight: 1080,
        isDefault: true,
        activationRules: JSON.stringify([{ type: "default" }]),
      },
    });
    await tx.screen.create({
      data: {
        name: "Main Display",
        orgId: created.id,
        assignedStyleId: style.id,
        isActive: true,
        resolution: "1920x1080",
      },
    });
    return created;
  });

  return NextResponse.json({ org }, { status: 201 });
}
