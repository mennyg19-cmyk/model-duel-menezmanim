import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../../src/domain/org-access";
import { getWidget } from "../../../../../../src/widgets/registry";
import { toEditorObject, toEditorStyle } from "../../../../../../src/admin/editor/map-rows";
import type { DisplayObjectAppearance } from "../../../../../../src/core/board/appearance";
import type { ScheduleRule } from "../../../../../../src/core/scheduler";
import type { StyleActivationRule } from "../../../../../../src/core/style-engine";
import { defaultAppearance } from "../../../../../../src/core/board/appearance";
import { getActiveLock } from "../../../../../../src/server/lock-repo";
import { z } from "zod/v4";

type Ctx = { params: Promise<{ orgId: string; styleId: string }> };
const contentSchema = z.record(z.string(), z.unknown());

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToEditorObject(row: {
  id: string;
  type: string;
  name: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  layer: number;
  fontFamily: string;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
  foreColor: string;
  backColor: string;
  language: string;
  textAlign: string;
  verticalAlign: string;
  lineHeight: number | null;
  backgroundMode: string;
  backgroundImage: string | null;
  backgroundGradient: string | null;
  backgroundTexture: string | null;
  frameId: string | null;
  frameThickness: number;
  scrollingEnabled: boolean;
  scrollingDirection: string;
  scrollingSpeed: number;
  content: string | null;
  visible: boolean;
  scheduleRules: string | null;
  scheduleGroupVisibility: string | null;
}) {
  return toEditorObject({
    ...row,
    content: parseJson<Record<string, unknown> | null>(row.content, {}),
    scheduleRules: parseJson(row.scheduleRules, null),
    scheduleGroupVisibility: parseJson(row.scheduleGroupVisibility, null),
  });
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId, styleId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const style = await prisma.style.findFirst({ where: { id: styleId, orgId: access.orgId } });
  if (!style) return NextResponse.json({ error: "Style not found." }, { status: 404 });
  const objects = await prisma.displayObject.findMany({ where: { styleId }, orderBy: { layer: "asc" } });
  return NextResponse.json({
    style: {
      ...toEditorStyle({
        ...style,
        activationRules: parseJson(style.activationRules, [{ type: "default" }]),
      }),
      isDefault: style.isDefault,
      activationRules: parseJson(style.activationRules, [{ type: "default" }]),
    },
    objects: objects.map(rowToEditorObject),
  });
}

type SaveBody = {
  name?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
  backgroundMode?: string;
  backgroundImage?: string | null;
  backgroundGradient?: string | null;
  backgroundTexture?: string | null;
  backgroundFrameId?: string | null;
  backgroundFrameThickness?: number | null;
  activationRules?: StyleActivationRule[];
  isDefault?: boolean;
  objects?: Array<{
    id: string;
    type: string;
    name: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
    layer: number;
    fontFamily: string;
    fontSize: number;
    fontBold: boolean;
    fontItalic: boolean;
    foreColor: string;
    backColor: string;
    language: string;
    appearance?: DisplayObjectAppearance;
    content: Record<string, unknown>;
    visible: boolean;
    scheduleRules: ScheduleRule[] | null;
    scheduleGroupVisibility: Record<string, boolean> | null;
  }>;
};

async function requireOwnedLock(orgId: string, userId: string) {
  const lock = await getActiveLock(orgId);
  if (lock?.userId === userId) return null;
  return NextResponse.json(
    { error: lock ? "Another editor holds the lock." : "Editor lock expired. Reopen the editor and try again." },
    { status: 409 },
  );
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId, styleId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const lockError = await requireOwnedLock(access.orgId, access.userId);
  if (lockError) return lockError;
  const body = (await request.json().catch(() => null)) as SaveBody | null;
  if (!body) return NextResponse.json({ error: "Body required." }, { status: 400 });

  const existing = await prisma.style.findFirst({ where: { id: styleId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Style not found." }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      if (body.isDefault) {
        await tx.style.updateMany({ where: { orgId: access.orgId }, data: { isDefault: false } });
      }
      await tx.style.update({
        where: { id: styleId },
        data: {
          name: body.name !== undefined ? String(body.name) : existing.name,
          canvasWidth: body.canvasWidth ?? existing.canvasWidth,
          canvasHeight: body.canvasHeight ?? existing.canvasHeight,
          backgroundColor: body.backgroundColor ?? existing.backgroundColor,
          backgroundMode: body.backgroundMode ?? existing.backgroundMode,
          backgroundImage:
            body.backgroundImage !== undefined ? body.backgroundImage : existing.backgroundImage,
          backgroundGradient:
            body.backgroundGradient !== undefined ? body.backgroundGradient : existing.backgroundGradient,
          backgroundTexture:
            body.backgroundTexture !== undefined ? body.backgroundTexture : existing.backgroundTexture,
          backgroundFrameId:
            body.backgroundFrameId !== undefined ? body.backgroundFrameId : existing.backgroundFrameId,
          backgroundFrameThickness:
            body.backgroundFrameThickness !== undefined
              ? body.backgroundFrameThickness
              : existing.backgroundFrameThickness,
          activationRules:
            body.activationRules !== undefined
              ? JSON.stringify(body.activationRules)
              : existing.activationRules,
          isDefault: body.isDefault === true ? true : existing.isDefault,
        },
      });

      if (body.objects) {
        await tx.displayObject.deleteMany({ where: { styleId } });
        for (const o of body.objects) {
          const widget = getWidget(o.type);
          if (!widget) throw new Error(`Unknown widget type "${o.type}".`);
          const parsed = contentSchema.safeParse(o.content ?? {});
          if (!parsed.success) {
            const msg =
              "error" in parsed && parsed.error && typeof parsed.error === "object" && "issues" in parsed.error
                ? String((parsed.error as { issues: { message?: string }[] }).issues[0]?.message ?? "check fields")
                : "check fields";
            throw new Error(`"${o.name}" has invalid settings: ${msg}.`);
          }
          const a = o.appearance ?? defaultAppearance(o.backColor);
          await tx.displayObject.create({
            data: {
              id: o.id,
              styleId,
              name: o.name.trim() || widget.label,
              type: o.type,
              posX: Math.round(o.posX),
              posY: Math.round(o.posY),
              width: Math.round(o.width),
              height: Math.round(o.height),
              layer: o.layer,
              fontFamily: o.fontFamily,
              fontSize: o.fontSize,
              fontBold: o.fontBold,
              fontItalic: o.fontItalic,
              foreColor: o.foreColor,
              backColor: o.backColor,
              language: o.language,
              textAlign: a.textAlign,
              verticalAlign: a.verticalAlign,
              lineHeight: a.lineHeight,
              backgroundMode: a.backgroundMode,
              backgroundImage: a.backgroundImage,
              backgroundGradient: a.backgroundGradient,
              backgroundTexture: a.backgroundTexture,
              frameId: a.frameId,
              frameThickness: a.frameThickness,
              scrollingEnabled: a.scrollingEnabled,
              scrollingDirection: a.scrollingDirection,
              scrollingSpeed: a.scrollingSpeed,
              content: JSON.stringify(parsed.data ?? o.content ?? {}),
              scheduleRules: o.scheduleRules ? JSON.stringify(o.scheduleRules) : null,
              scheduleGroupVisibility: o.scheduleGroupVisibility
                ? JSON.stringify(o.scheduleGroupVisibility)
                : null,
              visible: o.visible !== false,
            },
          });
        }
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 400 },
    );
  }

  const style = await prisma.style.findUniqueOrThrow({ where: { id: styleId } });
  const objects = await prisma.displayObject.findMany({ where: { styleId }, orderBy: { layer: "asc" } });
  return NextResponse.json({
    style: toEditorStyle({
      ...style,
      activationRules: parseJson(style.activationRules, [{ type: "default" }]),
    }),
    objects: objects.map(rowToEditorObject),
  });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId, styleId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const lockError = await requireOwnedLock(access.orgId, access.userId);
  if (lockError) return lockError;

  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  const existing = await prisma.style.findFirst({
    where: { id: styleId, orgId: access.orgId },
    include: { displayObjects: true },
  });
  if (!existing) return NextResponse.json({ error: "Style not found." }, { status: 404 });

  if (body?.action === "setDefault") {
    await prisma.$transaction([
      prisma.style.updateMany({ where: { orgId: access.orgId }, data: { isDefault: false } }),
      prisma.style.update({ where: { id: styleId }, data: { isDefault: true } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "duplicate") {
    const copy = await prisma.$transaction(async (tx) => {
      const sortOrder = await tx.style.count({ where: { orgId: access.orgId } });
      const created = await tx.style.create({
        data: {
          orgId: access.orgId,
          name: `${existing.name} (copy)`,
          backgroundImage: existing.backgroundImage,
          backgroundColor: existing.backgroundColor,
          backgroundMode: existing.backgroundMode,
          backgroundGradient: existing.backgroundGradient,
          backgroundTexture: existing.backgroundTexture,
          backgroundFrameId: existing.backgroundFrameId,
          backgroundFrameThickness: existing.backgroundFrameThickness,
          canvasWidth: existing.canvasWidth,
          canvasHeight: existing.canvasHeight,
          isDefault: false,
          activationRules: existing.activationRules,
          sortOrder,
        },
      });
      for (const object of existing.displayObjects) {
        await tx.displayObject.create({
          data: {
            styleId: created.id,
            name: object.name,
            type: object.type,
            posX: object.posX,
            posY: object.posY,
            width: object.width,
            height: object.height,
            layer: object.layer,
            fontFamily: object.fontFamily,
            fontSize: object.fontSize,
            fontBold: object.fontBold,
            fontItalic: object.fontItalic,
            foreColor: object.foreColor,
            backColor: object.backColor,
            language: object.language,
            textAlign: object.textAlign,
            verticalAlign: object.verticalAlign,
            lineHeight: object.lineHeight,
            backgroundMode: object.backgroundMode,
            backgroundImage: object.backgroundImage,
            backgroundGradient: object.backgroundGradient,
            backgroundTexture: object.backgroundTexture,
            frameId: object.frameId,
            frameThickness: object.frameThickness,
            scrollingEnabled: object.scrollingEnabled,
            scrollingDirection: object.scrollingDirection,
            scrollingSpeed: object.scrollingSpeed,
            content: object.content,
            scheduleRules: object.scheduleRules,
            scheduleGroupVisibility: object.scheduleGroupVisibility,
            visible: object.visible,
          },
        });
      }
      return created;
    });
    return NextResponse.json({ styleId: copy.id });
  }

  return NextResponse.json({ error: "Unknown style action." }, { status: 400 });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const { orgId, styleId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const lockError = await requireOwnedLock(access.orgId, access.userId);
  if (lockError) return lockError;
  const existing = await prisma.style.findFirst({ where: { id: styleId, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Style not found" }, { status: 404 });
  const replacement = await prisma.style.findFirst({
    where: { orgId: access.orgId, id: { not: styleId } },
    orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }],
  });
  if (!replacement) {
    return NextResponse.json({ error: "An organization must keep at least one style." }, { status: 409 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.style.delete({ where: { id: styleId } });
    if (existing.isDefault) {
      await tx.style.update({ where: { id: replacement.id }, data: { isDefault: true } });
    }
  });
  return NextResponse.json({ ok: true });
}
