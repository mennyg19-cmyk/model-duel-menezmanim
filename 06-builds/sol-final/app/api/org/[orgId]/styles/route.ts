import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";

type Ctx = { params: Promise<{ orgId: string }> };

async function styleWithObjects(styleId: string) {
  const style = await prisma.style.findUnique({ where: { id: styleId } });
  if (!style) return null;
  const objects = await prisma.displayObject.findMany({
    where: { styleId },
    orderBy: [{ layer: "asc" }, { createdAt: "asc" }],
  });
  return {
    ...style,
    activationRules: safeJson(style.activationRules),
    objects: objects.map((o) => ({
      ...o,
      content: o.content ? safeJson(o.content) : {},
      scheduleRules: o.scheduleRules ? safeJson(o.scheduleRules) : null,
      scheduleGroupVisibility: o.scheduleGroupVisibility ? safeJson(o.scheduleGroupVisibility) : null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
    createdAt: style.createdAt.toISOString(),
    updatedAt: style.updatedAt.toISOString(),
  };
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** E14 — styles CRUD (+ objects on GET). */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const styles = await prisma.style.findMany({ where: { orgId: access.orgId }, orderBy: { sortOrder: "asc" } });
  const full = await Promise.all(styles.map((s) => styleWithObjects(s.id)));
  return NextResponse.json({ styles: full.filter(Boolean) });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const count = await prisma.style.count({ where: { orgId: access.orgId } });
  const row = await prisma.style.create({
    data: {
      name: String(body.name ?? "New Style"),
      orgId: access.orgId,
      backgroundColor: String(body.backgroundColor ?? "#0f172a"),
      backgroundMode: String(body.backgroundMode ?? "solid"),
      canvasWidth: Number(body.canvasWidth ?? 1920),
      canvasHeight: Number(body.canvasHeight ?? 1080),
      isDefault: count === 0 || body.isDefault === true,
      activationRules: JSON.stringify(body.activationRules ?? [{ type: "default" }]),
      sortOrder: Number(body.sortOrder ?? count),
    },
  });
  return NextResponse.json({ style: await styleWithObjects(row.id) }, { status: 201 });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.style.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Style not found" }, { status: 404 });

  // Transactional replace of objects when provided (E14)
  if (Array.isArray(body.objects)) {
    await prisma.$transaction(async (tx) => {
      await tx.style.update({
        where: { id },
        data: {
          name: body.name !== undefined ? String(body.name) : existing.name,
          backgroundColor:
            body.backgroundColor !== undefined ? String(body.backgroundColor) : existing.backgroundColor,
          backgroundMode:
            body.backgroundMode !== undefined ? String(body.backgroundMode) : existing.backgroundMode,
          backgroundImage:
            body.backgroundImage !== undefined ? (body.backgroundImage as string | null) : existing.backgroundImage,
          backgroundGradient:
            body.backgroundGradient !== undefined
              ? (body.backgroundGradient as string | null)
              : existing.backgroundGradient,
          canvasWidth: body.canvasWidth !== undefined ? Number(body.canvasWidth) : existing.canvasWidth,
          canvasHeight: body.canvasHeight !== undefined ? Number(body.canvasHeight) : existing.canvasHeight,
          isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : existing.isDefault,
          activationRules:
            body.activationRules !== undefined
              ? JSON.stringify(body.activationRules)
              : existing.activationRules,
          sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
        },
      });
      await tx.displayObject.deleteMany({ where: { styleId: id } });
      const objects = body.objects as Record<string, unknown>[];
      for (const [index, obj] of objects.entries()) {
        await tx.displayObject.create({
          data: {
            styleId: id,
            name: String(obj.name ?? `Object ${index + 1}`),
            type: String(obj.type ?? "PLAIN_TEXT"),
            posX: Number(obj.posX ?? (obj.position as { x?: number } | undefined)?.x ?? 0),
            posY: Number(obj.posY ?? (obj.position as { y?: number } | undefined)?.y ?? 0),
            width: Number(obj.width ?? (obj.position as { width?: number } | undefined)?.width ?? 200),
            height: Number(obj.height ?? (obj.position as { height?: number } | undefined)?.height ?? 80),
            layer: Number(obj.layer ?? obj.zIndex ?? index),
            fontFamily: String(obj.fontFamily ?? (obj.font as { family?: string } | undefined)?.family ?? "David Libre"),
            fontSize: Number(obj.fontSize ?? (obj.font as { size?: number } | undefined)?.size ?? 16),
            fontBold: Boolean(obj.fontBold ?? (obj.font as { bold?: boolean } | undefined)?.bold ?? false),
            fontItalic: Boolean(obj.fontItalic ?? (obj.font as { italic?: boolean } | undefined)?.italic ?? false),
            foreColor: String(obj.foreColor ?? (obj.font as { color?: string } | undefined)?.color ?? "#ffffff"),
            backColor: String(obj.backColor ?? obj.backgroundColor ?? "transparent"),
            language: String(obj.language ?? "hebrew"),
            content: obj.content != null ? JSON.stringify(obj.content) : null,
            scheduleRules: obj.scheduleRules != null ? JSON.stringify(obj.scheduleRules) : null,
            scheduleGroupVisibility:
              obj.scheduleGroupVisibility != null ? JSON.stringify(obj.scheduleGroupVisibility) : null,
            visible: obj.visible !== false,
          },
        });
      }
    });
    return NextResponse.json({ style: await styleWithObjects(id) });
  }

  await prisma.style.update({
    where: { id },
    data: {
      name: body.name !== undefined ? String(body.name) : existing.name,
      backgroundColor:
        body.backgroundColor !== undefined ? String(body.backgroundColor) : existing.backgroundColor,
      isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : existing.isDefault,
      activationRules:
        body.activationRules !== undefined ? JSON.stringify(body.activationRules) : existing.activationRules,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
    },
  });
  return NextResponse.json({ style: await styleWithObjects(id) });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  const existing = await prisma.style.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Style not found" }, { status: 404 });
  await prisma.style.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
