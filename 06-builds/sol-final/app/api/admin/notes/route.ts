import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/db/client";
import { requireSuperAdmin } from "../../../../src/domain/super-admin";
import { noteDto, seedGlobalNotesFromCore } from "../../../../src/domain/content";

/** E22 super-admin baseline notes (orgId=null). */
export async function GET() {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const rows = await prisma.tukachinskyNote.findMany({
    where: { orgId: null },
    orderBy: [{ hebrewMonth: "asc" }, { hebrewDay: "asc" }],
  });
  return NextResponse.json({ notes: rows.map(noteDto), count: rows.length });
}

export async function POST(request: NextRequest) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const body = (await request.json()) as Record<string, unknown>;

  if (body.action === "reseed-from-core") {
    const count = await seedGlobalNotesFromCore();
    return NextResponse.json({ reseeding: true, count });
  }

  const row = await prisma.tukachinskyNote.create({
    data: {
      orgId: null,
      hebrewMonth: Number(body.hebrewMonth ?? 1),
      hebrewDay: Number(body.hebrewDay ?? 1),
      noteHebrew: String(body.noteHebrew ?? ""),
      noteEnglish: (body.noteEnglish as string | null) ?? null,
      category: String(body.category ?? "minhag"),
      source: (body.source as string | null) ?? null,
      isActive: body.isActive !== false,
      isHidden: false,
    },
  });
  return NextResponse.json({ note: noteDto(row) }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const body = (await request.json()) as Record<string, unknown>;
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.tukachinskyNote.findFirst({ where: { id, orgId: null } });
  if (!existing) return NextResponse.json({ error: "Baseline note not found" }, { status: 404 });

  const row = await prisma.tukachinskyNote.update({
    where: { id },
    data: {
      noteHebrew: body.noteHebrew !== undefined ? String(body.noteHebrew) : existing.noteHebrew,
      noteEnglish:
        body.noteEnglish !== undefined ? (body.noteEnglish as string | null) : existing.noteEnglish,
      category: body.category !== undefined ? String(body.category) : existing.category,
      hebrewMonth: body.hebrewMonth !== undefined ? Number(body.hebrewMonth) : existing.hebrewMonth,
      hebrewDay: body.hebrewDay !== undefined ? Number(body.hebrewDay) : existing.hebrewDay,
      source: body.source !== undefined ? (body.source as string | null) : existing.source,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
    },
  });
  return NextResponse.json({ note: noteDto(row) });
}

export async function DELETE(request: NextRequest) {
  const access = await requireSuperAdmin();
  if (access instanceof NextResponse) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  const existing = await prisma.tukachinskyNote.findFirst({ where: { id, orgId: null } });
  if (!existing) return NextResponse.json({ error: "Baseline note not found" }, { status: 404 });
  await prisma.tukachinskyNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
