import { NextResponse } from "next/server";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { db } from "@/db/client";
import { announcements, memorials, minyanSchedules, sponsors } from "@/db/schema";

export const dynamic = "force-dynamic";

type Body = {
  kind?: "event" | "announcement" | "yahrzeit" | "sponsor";
  title?: string;
  content?: string;
  name?: string;
  hebrewName?: string;
  fixedTime?: string;
  type?: string;
  englishName?: string;
  relationship?: string;
  hebrewMonth?: number;
  hebrewDay?: number;
  sponsorName?: string;
  englishText?: string;
  hebrewText?: string;
};

/** P3.6 quick-add from dashboard. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { orgId } = await params;
    await requireOrgRole(orgId, "editor");
    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body?.kind) return NextResponse.json({ error: "Missing kind." }, { status: 400 });

    switch (body.kind) {
      case "announcement": {
        if (!body.title?.trim() || !body.content?.trim()) {
          return NextResponse.json({ error: "Title and content required." }, { status: 400 });
        }
        const [row] = await db
          .insert(announcements)
          .values({
            orgId,
            title: body.title.trim(),
            content: body.content.trim(),
            priority: 0,
          })
          .returning({ id: announcements.id });
        return NextResponse.json({ ok: true, id: row?.id });
      }
      case "event": {
        if (!body.name?.trim() || !body.fixedTime?.trim()) {
          return NextResponse.json({ error: "Name and fixed time required." }, { status: 400 });
        }
        const [row] = await db
          .insert(minyanSchedules)
          .values({
            orgId,
            name: body.name.trim(),
            hebrewName: body.hebrewName?.trim() || body.name.trim(),
            type: body.type?.trim() || "other",
            fixedTime: body.fixedTime.trim(),
            sortOrder: 999,
          })
          .returning({ id: minyanSchedules.id });
        return NextResponse.json({ ok: true, id: row?.id });
      }
      case "yahrzeit": {
        if (!body.hebrewName?.trim() || !body.hebrewMonth || !body.hebrewDay) {
          return NextResponse.json({ error: "Hebrew name, month, and day required." }, { status: 400 });
        }
        const [row] = await db
          .insert(memorials)
          .values({
            orgId,
            hebrewName: body.hebrewName.trim(),
            englishName: body.englishName?.trim() || null,
            relationship: body.relationship?.trim() || null,
            hebrewMonth: Number(body.hebrewMonth),
            hebrewDay: Number(body.hebrewDay),
            isYahrzeit: true,
          })
          .returning({ id: memorials.id });
        return NextResponse.json({ ok: true, id: row?.id });
      }
      case "sponsor": {
        if (!body.sponsorName?.trim()) {
          return NextResponse.json({ error: "Sponsor name required." }, { status: 400 });
        }
        const [row] = await db
          .insert(sponsors)
          .values({
            orgId,
            type: body.type?.trim() || "kiddush",
            sponsorName: body.sponsorName.trim(),
            englishText: body.englishText?.trim() || null,
            hebrewText: body.hebrewText?.trim() || null,
          })
          .returning({ id: sponsors.id });
        return NextResponse.json({ ok: true, id: row?.id });
      }
      default:
        return NextResponse.json({ error: "Unknown kind." }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
