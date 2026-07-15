import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../src/auth/session";
import { listPendingInvitesForEmail } from "../../../../src/domain/identity";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await listPendingInvitesForEmail(session.email);
  return NextResponse.json(invites);
}
