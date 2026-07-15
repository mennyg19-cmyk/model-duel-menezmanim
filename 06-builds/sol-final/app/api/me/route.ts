import { NextResponse } from "next/server";
import { getSessionUser } from "../../../src/auth/session";
import { getMeByUserId } from "../../../src/domain/identity";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await getMeByUserId(session.id);
  if (!me) {
    return NextResponse.json({ error: "User not found in database" }, { status: 404 });
  }

  // Flat contract with top-level isSuperAdmin (F-ME-SHAPE).
  return NextResponse.json(me);
}
