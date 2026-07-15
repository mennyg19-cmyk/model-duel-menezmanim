import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { getWidget } from "@/widgets/registry";
import {
  deleteStyle,
  duplicateStyle,
  getStyleWithObjects,
  saveStyleLayout,
  setDefaultStyle,
  updateStyle,
  type DisplayObjectInsert,
} from "@/server/styles-repo";
import { toEditorObject, toEditorStyle } from "@/admin/editor/map-rows";
import type { DisplayObjectAppearance } from "@/core/board/appearance";
import type { ScheduleRule } from "@/core/scheduler";
import type { ScheduleGroupVisibility } from "@/db/json";
import type { StyleActivationRule } from "@/core/style-engine";

export const dynamic = "force-dynamic";

/** E14 — get / update / delete one style (+ transactional object save on PUT). */
export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string; styleId: string }> }) {
  try {
    const { orgId, styleId } = await params;
    await requireOrgRole(orgId, "viewer");
    const loaded = await getStyleWithObjects(orgId, styleId);
    if (!loaded) return NextResponse.json({ error: "Style not found." }, { status: 404 });
    return NextResponse.json({
      style: {
        ...toEditorStyle(loaded.style),
        isDefault: loaded.style.isDefault,
        activationRules: (loaded.style.activationRules as StyleActivationRule[]) ?? [],
      },
      objects: loaded.objects.map(toEditorObject),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
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
    appearance: DisplayObjectAppearance;
    content: Record<string, unknown>;
    visible: boolean;
    scheduleRules: ScheduleRule[] | null;
    scheduleGroupVisibility: ScheduleGroupVisibility | null;
  }>;
};

export async function PUT(request: Request, { params }: { params: Promise<{ orgId: string; styleId: string }> }) {
  try {
    const { orgId, styleId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as SaveBody | null;
    if (!body) return NextResponse.json({ error: "Body required." }, { status: 400 });

    const loaded = await getStyleWithObjects(orgId, styleId);
    if (!loaded) return NextResponse.json({ error: "Style not found." }, { status: 404 });

    if (body.isDefault) await setDefaultStyle(orgId, styleId);

    if (body.objects) {
      const objects: DisplayObjectInsert[] = body.objects.map((o) => {
        const widget = getWidget(o.type);
        if (!widget) throw new Error(`Unknown widget type "${o.type}".`);
        const parsed = widget.contentSchema.safeParse(o.content);
        if (!parsed.success) {
          throw new Error(`"${o.name}" has invalid settings: ${parsed.error.issues[0]?.message ?? "check fields"}.`);
        }
        const a = o.appearance;
        return {
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
          content: parsed.data as Record<string, unknown>,
          visible: o.visible,
          scheduleRules: o.scheduleRules,
          scheduleGroupVisibility: o.scheduleGroupVisibility,
        };
      });

      await saveStyleLayout(orgId, styleId, {
        style: {
          name: (body.name ?? loaded.style.name).trim(),
          canvasWidth: body.canvasWidth ?? loaded.style.canvasWidth,
          canvasHeight: body.canvasHeight ?? loaded.style.canvasHeight,
          backgroundColor: body.backgroundColor ?? loaded.style.backgroundColor,
          backgroundMode: body.backgroundMode ?? loaded.style.backgroundMode,
          backgroundImage: body.backgroundImage !== undefined ? body.backgroundImage : loaded.style.backgroundImage,
          backgroundGradient:
            body.backgroundGradient !== undefined ? body.backgroundGradient : loaded.style.backgroundGradient,
          backgroundTexture:
            body.backgroundTexture !== undefined ? body.backgroundTexture : loaded.style.backgroundTexture,
          backgroundFrameId:
            body.backgroundFrameId !== undefined ? body.backgroundFrameId : loaded.style.backgroundFrameId,
          backgroundFrameThickness:
            body.backgroundFrameThickness !== undefined
              ? body.backgroundFrameThickness
              : loaded.style.backgroundFrameThickness,
        },
        objects,
      });
      if (body.activationRules) {
        await updateStyle(orgId, styleId, { activationRules: body.activationRules });
      }
    } else {
      await updateStyle(orgId, styleId, {
        name: body.name?.trim(),
        canvasWidth: body.canvasWidth,
        canvasHeight: body.canvasHeight,
        backgroundColor: body.backgroundColor,
        backgroundMode: body.backgroundMode,
        backgroundImage: body.backgroundImage,
        backgroundGradient: body.backgroundGradient,
        backgroundTexture: body.backgroundTexture,
        backgroundFrameId: body.backgroundFrameId,
        backgroundFrameThickness: body.backgroundFrameThickness,
        activationRules: body.activationRules,
      });
    }

    return NextResponse.json({ savedAt: new Date().toISOString() });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof Error) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string; styleId: string }> }) {
  try {
    const { orgId, styleId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action === "duplicate") {
      const newId = await duplicateStyle(orgId, styleId);
      return NextResponse.json({ styleId: newId }, { status: 201 });
    }
    if (body.action === "setDefault") {
      await setDefaultStyle(orgId, styleId);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof Error) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ orgId: string; styleId: string }> }) {
  try {
    const { orgId, styleId } = await params;
    await requireOrgRole(orgId, "editor");
    await deleteStyle(orgId, styleId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
