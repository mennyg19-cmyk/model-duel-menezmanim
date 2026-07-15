import { NextResponse } from "next/server";
import { getSessionUser } from "../auth/session";

export async function requireSuperAdmin(): Promise<
  | { userId: string; isSuperAdmin: true }
  | NextResponse
> {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden: super-admin only" }, { status: 403 });
  }
  return { userId: session.id, isSuperAdmin: true };
}
