import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/db/client";
import { computeOrgCalendar, parseDateParam } from "../../../src/domain/org-zmanim";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("org") ?? searchParams.get("orgSlug");
  const date = parseDateParam(searchParams.get("date"));
  if (!date) {
    return NextResponse.json({ error: "Invalid date parameter", expected: "ISO date string" }, { status: 400 });
  }

  let inIsrael = searchParams.get("inIsrael") !== "false";
  if (slug) {
    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) {
      return NextResponse.json({ error: `Organization not found: ${slug}` }, { status: 404 });
    }
    inIsrael = org.inIsrael;
    const payload = computeOrgCalendar(org, date);
    return NextResponse.json({ ...payload, org: { slug: org.slug, name: org.name } });
  }

  const payload = computeOrgCalendar({ inIsrael }, date);
  return NextResponse.json(payload);
}
