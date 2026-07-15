import { NextResponse } from "next/server";
import { endSession } from "@/auth/cookie";

export const dynamic = "force-dynamic";

export async function POST() {
  await endSession();
  return NextResponse.json({ ok: true });
}
