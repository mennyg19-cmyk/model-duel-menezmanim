// Org admin: list + pair sync devices (session auth). Token shown once on create.

import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireOrgRole } from "@/auth/guards";
import { createDevice, listDevices } from "@/server/sync-repo";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await ctx.params;
    await requireOrgRole(orgId, "admin");
    const devices = await listDevices(orgId);
    return NextResponse.json({
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        lastSeenAt: d.lastSeenAt ? new Date(d.lastSeenAt).getTime() : null,
        revokedAt: d.revokedAt ? new Date(d.revokedAt).getTime() : null,
        createdAt: d.createdAt ? new Date(d.createdAt).getTime() : 0,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

const createSchema = z.object({ name: z.string().min(1).max(120) });

export async function POST(request: Request, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await ctx.params;
    await requireOrgRole(orgId, "admin");
    const parsed = createSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Name required." }, { status: 400 });
    const { token, device } = await createDevice(orgId, parsed.data.name.trim());
    return NextResponse.json({
      token,
      device: {
        id: device.id,
        name: device.name,
        lastSeenAt: null,
        revokedAt: null,
        createdAt: device.createdAt ? new Date(device.createdAt).getTime() : Date.now(),
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
