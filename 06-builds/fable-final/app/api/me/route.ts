import { NextResponse } from "next/server";
import { getActor } from "@/auth/actor";
import { meResponse } from "@/auth/me";

export const dynamic = "force-dynamic";

/** E1 — flat actor shape with top-level isSuperAdmin (F-ME-SHAPE). */
export async function GET() {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json(meResponse(actor));
}
