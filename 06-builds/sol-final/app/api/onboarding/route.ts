import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "../../../src/auth/session";
import {
  acceptInviteToken,
  createOrganizationForOwner,
  slugAvailable,
} from "../../../src/domain/identity";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const available = await slugAvailable(slug);
  return NextResponse.json({ slug, available });
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action;

  try {
    if (action === "create-org") {
      const name = String(body.name ?? "").trim();
      const slug = String(body.slug ?? "").trim();
      const timezone = String(body.timezone ?? "").trim();
      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);
      if (!name || !slug || !timezone || Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const org = await createOrganizationForOwner(session.id, {
        name,
        slug,
        latitude,
        longitude,
        elevation: body.elevation == null ? undefined : Number(body.elevation),
        timezone,
        inIsrael: Boolean(body.inIsrael),
        dialect: body.dialect ? String(body.dialect) : undefined,
        candleLightingMinutes:
          body.candleLightingMinutes == null ? undefined : Number(body.candleLightingMinutes),
        shabbatEndType: body.shabbatEndType ? String(body.shabbatEndType) : undefined,
        shabbatEndValue: body.shabbatEndValue == null ? undefined : Number(body.shabbatEndValue),
      });

      return NextResponse.json({ orgId: org.id, status: org.status, slug: org.slug });
    }

    if (action === "accept-invite") {
      const token = String(body.token ?? "").trim();
      if (!token) {
        return NextResponse.json({ error: "Missing invite token" }, { status: 400 });
      }
      const result = await acceptInviteToken(token, session.clerkUserId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
