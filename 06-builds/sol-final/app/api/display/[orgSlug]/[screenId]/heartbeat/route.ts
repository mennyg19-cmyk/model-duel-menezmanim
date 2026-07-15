import { NextResponse } from "next/server";
import { prisma } from "../../../../../../src/db/client";

export const dynamic = "force-dynamic";

/** SH.7 — wall-screen heartbeat. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orgSlug: string; screenId: string }> },
) {
  const { orgSlug, screenId } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  const now = new Date();
  let screen = await prisma.screen.findFirst({ where: { orgId: org.id, id: screenId } });
  if (!screen) {
    const screens = await prisma.screen.findMany({ where: { orgId: org.id } });
    const needle = screenId.toLowerCase();
    screen =
      screens.find((s) => s.name.toLowerCase() === needle || s.name.toLowerCase().startsWith(needle)) ?? null;
  }
  if (!screen) return NextResponse.json({ error: "screen not found" }, { status: 404 });

  await prisma.screen.update({ where: { id: screen.id }, data: { lastSeenAt: now } });
  return NextResponse.json({ ok: true, at: now.toISOString() });
}
