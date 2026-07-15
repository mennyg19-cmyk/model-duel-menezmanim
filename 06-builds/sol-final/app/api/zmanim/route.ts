import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/db/client";
import { computeOrgZmanim, parseDateParam, zmanTypeCount } from "../../../src/domain/org-zmanim";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("org") ?? searchParams.get("orgSlug");
  if (!slug) {
    return NextResponse.json({ error: "Missing org slug (?org=)" }, { status: 400 });
  }

  const date = parseDateParam(searchParams.get("date"));
  if (!date) {
    return NextResponse.json({ error: "Invalid date parameter", expected: "ISO date string" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: { zmanimConfigs: true },
  });
  if (!org) {
    return NextResponse.json({ error: `Organization not found: ${slug}` }, { status: 404 });
  }

  const { config, zmanim } = computeOrgZmanim(org, date, org.zmanimConfigs);

  return NextResponse.json({
    date: date.toISOString(),
    org: { slug: org.slug, name: org.name, timezone: org.timezone },
    location: config.location,
    zmanTypeCount: zmanTypeCount(),
    zmanim,
  });
}
