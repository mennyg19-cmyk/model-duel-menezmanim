import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/db/client";
import { isAccessError, requireOrgMember } from "../../../../../src/domain/org-access";
import { mediaDto } from "../../../../../src/domain/content";

type Ctx = { params: Promise<{ orgId: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId);
  if (isAccessError(access)) return access;
  const rows = await prisma.media.findMany({
    where: { orgId: access.orgId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ media: rows.map(mediaDto) });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const relDir = path.join("uploads", access.orgId);
    const absDir = path.join(process.cwd(), "public", relDir);
    await mkdir(absDir, { recursive: true });
    await writeFile(path.join(absDir, safeName), bytes);

    const max = await prisma.media.aggregate({ where: { orgId: access.orgId }, _max: { sortOrder: true } });
    const scheduleRulesRaw = form.get("scheduleRules");
    const row = await prisma.media.create({
      data: {
        orgId: access.orgId,
        filename: safeName,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: bytes.length,
        filePath: path.join(relDir, safeName).replace(/\\/g, "/"),
        scheduleRules:
          typeof scheduleRulesRaw === "string" && scheduleRulesRaw
            ? scheduleRulesRaw
            : null,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        isActive: true,
      },
    });
    return NextResponse.json({ media: mediaDto(row) }, { status: 201 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  if (body.action === "meta") {
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const existing = await prisma.media.findFirst({ where: { id, orgId: access.orgId } });
    if (!existing) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    const row = await prisma.media.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        scheduleRules:
          body.scheduleRules !== undefined
            ? body.scheduleRules == null
              ? null
              : JSON.stringify(body.scheduleRules)
            : existing.scheduleRules,
        originalName:
          body.originalName !== undefined ? String(body.originalName) : existing.originalName,
      },
    });
    return NextResponse.json({ media: mediaDto(row) });
  }

  return NextResponse.json({ error: "multipart upload or action=meta required" }, { status: 400 });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { orgId } = await ctx.params;
  const access = await requireOrgMember(orgId, { write: true });
  if (isAccessError(access)) return access;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  const existing = await prisma.media.findFirst({ where: { id, orgId: access.orgId } });
  if (!existing) return NextResponse.json({ error: "Media not found" }, { status: 404 });
  try {
    await unlink(path.join(process.cwd(), "public", existing.filePath));
  } catch {
    /* file may already be gone */
  }
  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
