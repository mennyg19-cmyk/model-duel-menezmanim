import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import { mergeNotesForOrg, noteDto } from "../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string }> };

/** E22 org notes — merged view + add / override / hide. */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const merged = await mergeNotesForOrg(access.orgId);
  const orgRows = await prisma.tukachinskyNote.findMany({ where: { orgId: access.orgId } });
  return NextResponse.json({
    merged,
    orgNotes: orgRows.map(noteDto),
  });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const action = String(body.action ?? "add");

  if (action === "hide") {
    const baselineId = String(body.baselineId ?? body.overridesNoteId ?? "");
    if (!baselineId) return NextResponse.json({ error: "baselineId required" }, { status: 400 });
    const baseline = await prisma.tukachinskyNote.findFirst({
      where: { id: baselineId, orgId: null },
    });
    if (!baseline) return NextResponse.json({ error: "Baseline note not found" }, { status: 404 });

    const existing = await prisma.tukachinskyNote.findFirst({
      where: { orgId: access.orgId, overridesNoteId: baselineId },
    });
    const row = existing
      ? await prisma.tukachinskyNote.update({
          where: { id: existing.id },
          data: { isHidden: true, isActive: true },
        })
      : await prisma.tukachinskyNote.create({
          data: {
            orgId: access.orgId,
            overridesNoteId: baselineId,
            hebrewMonth: baseline.hebrewMonth,
            hebrewDay: baseline.hebrewDay,
            noteHebrew: baseline.noteHebrew,
            noteEnglish: baseline.noteEnglish,
            category: baseline.category,
            source: baseline.source,
            isActive: true,
            isHidden: true,
          },
        });
    return NextResponse.json({
      note: noteDto(row),
      merged: await mergeNotesForOrg(access.orgId),
    });
  }

  if (action === "override") {
    const baselineId = String(body.baselineId ?? body.overridesNoteId ?? "");
    if (!baselineId) return NextResponse.json({ error: "baselineId required" }, { status: 400 });
    const baseline = await prisma.tukachinskyNote.findFirst({
      where: { id: baselineId, orgId: null },
    });
    if (!baseline) return NextResponse.json({ error: "Baseline note not found" }, { status: 404 });

    const existing = await prisma.tukachinskyNote.findFirst({
      where: { orgId: access.orgId, overridesNoteId: baselineId },
    });
    const row = existing
      ? await prisma.tukachinskyNote.update({
          where: { id: existing.id },
          data: {
            noteHebrew: String(body.noteHebrew ?? existing.noteHebrew),
            noteEnglish:
              body.noteEnglish !== undefined
                ? (body.noteEnglish as string | null)
                : existing.noteEnglish,
            category: body.category !== undefined ? String(body.category) : existing.category,
            isHidden: false,
            isActive: true,
          },
        })
      : await prisma.tukachinskyNote.create({
          data: {
            orgId: access.orgId,
            overridesNoteId: baselineId,
            hebrewMonth: baseline.hebrewMonth,
            hebrewDay: baseline.hebrewDay,
            noteHebrew: String(body.noteHebrew ?? baseline.noteHebrew),
            noteEnglish:
              body.noteEnglish !== undefined
                ? (body.noteEnglish as string | null)
                : baseline.noteEnglish,
            category: String(body.category ?? baseline.category),
            source: baseline.source,
            isActive: true,
            isHidden: false,
          },
        });
    return NextResponse.json({
      note: noteDto(row),
      merged: await mergeNotesForOrg(access.orgId),
    });
  }

  if (action === "unhide" || action === "clear-override") {
    const baselineId = String(body.baselineId ?? "");
    if (!baselineId) return NextResponse.json({ error: "baselineId required" }, { status: 400 });
    await prisma.tukachinskyNote.deleteMany({
      where: { orgId: access.orgId, overridesNoteId: baselineId },
    });
    return NextResponse.json({ merged: await mergeNotesForOrg(access.orgId) });
  }

  // add org-only note
  const row = await prisma.tukachinskyNote.create({
    data: {
      orgId: access.orgId,
      hebrewMonth: Number(body.hebrewMonth ?? 1),
      hebrewDay: Number(body.hebrewDay ?? 1),
      noteHebrew: String(body.noteHebrew ?? ""),
      noteEnglish: (body.noteEnglish as string | null) ?? null,
      category: String(body.category ?? "minhag"),
      source: (body.source as string | null) ?? null,
      isActive: true,
      isHidden: false,
    },
  });
  return NextResponse.json(
    { note: noteDto(row), merged: await mergeNotesForOrg(access.orgId) },
    { status: 201 },
  );
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.tukachinskyNote.findFirst({
    where: { id, orgId: access.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Org note not found" }, { status: 404 });

  const row = await prisma.tukachinskyNote.update({
    where: { id },
    data: {
      noteHebrew: body.noteHebrew !== undefined ? String(body.noteHebrew) : existing.noteHebrew,
      noteEnglish:
        body.noteEnglish !== undefined ? (body.noteEnglish as string | null) : existing.noteEnglish,
      category: body.category !== undefined ? String(body.category) : existing.category,
      hebrewMonth: body.hebrewMonth !== undefined ? Number(body.hebrewMonth) : existing.hebrewMonth,
      hebrewDay: body.hebrewDay !== undefined ? Number(body.hebrewDay) : existing.hebrewDay,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      isHidden: body.isHidden !== undefined ? Boolean(body.isHidden) : existing.isHidden,
    },
  });
  return NextResponse.json({ note: noteDto(row), merged: await mergeNotesForOrg(access.orgId) });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  const existing = await prisma.tukachinskyNote.findFirst({
    where: { id, orgId: access.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Org note not found" }, { status: 404 });
  await prisma.tukachinskyNote.delete({ where: { id } });
  return NextResponse.json({ merged: await mergeNotesForOrg(access.orgId) });
}
