import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "../auth/session";
import { prisma } from "../db/client";

const WRITE_ROLES = new Set(["owner", "admin", "editor"]);

type ScreenCredentialPayload = {
  orgId: string;
  screenId: string;
  issuedAt: string;
  expiresAt: string;
};

export type SyncAccess = {
  orgId: string;
  actor: "user" | "screen";
  actorId: string;
};

function credentialSecret(): string {
  return process.env.SYNC_DEVICE_SECRET ?? process.env.SESSION_SECRET ?? "rebuild-b-sync-dev-secret";
}

export function createScreenCredential(
  orgId: string,
  screenId: string,
  expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1_000),
): string {
  const payload = Buffer.from(
    JSON.stringify({
      orgId,
      screenId,
      issuedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    } satisfies ScreenCredentialPayload),
  ).toString("base64url");
  const signature = createHmac("sha256", credentialSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyScreenCredential(token: string): ScreenCredentialPayload | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", credentialSecret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ScreenCredentialPayload;
    if (!parsed.orgId || !parsed.screenId || !parsed.issuedAt || !parsed.expiresAt) return null;
    if (Number.isNaN(Date.parse(parsed.issuedAt)) || Date.parse(parsed.expiresAt) <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function authorizeSyncRequest(
  request: NextRequest,
  orgRef: string,
  write: boolean,
): Promise<SyncAccess | NextResponse> {
  const org = await prisma.organization.findFirst({
    where: { OR: [{ id: orgRef }, { slug: orgRef }] },
    select: { id: true },
  });
  if (!org) return NextResponse.json({ error: `Organization not found: ${orgRef}` }, { status: 404 });

  const authorization = request.headers.get("authorization");
  const screenId = request.headers.get("x-screen-id");
  if (authorization || screenId) {
    if (!authorization?.startsWith("Bearer ") || !screenId) {
      return NextResponse.json(
        { error: "Screen sync requires Bearer credential and X-Screen-Id" },
        { status: 401 },
      );
    }
    const payload = verifyScreenCredential(authorization.slice(7));
    if (!payload) return NextResponse.json({ error: "Invalid or expired screen credential" }, { status: 401 });
    if (payload.orgId !== org.id || payload.screenId !== screenId) {
      return NextResponse.json({ error: "Screen credential does not match this organization" }, { status: 403 });
    }
    const screen = await prisma.screen.findFirst({
      where: { id: screenId, orgId: org.id, isActive: true },
      select: { id: true },
    });
    if (!screen) {
      return NextResponse.json({ error: "Screen credential is not attached to an active screen" }, { status: 403 });
    }
    return { orgId: org.id, actor: "screen", actorId: screen.id };
  }

  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.isSuperAdmin) return { orgId: org.id, actor: "user", actorId: session.id };

  const membership = await prisma.orgMembership.findUnique({
    where: { userId_orgId: { userId: session.id, orgId: org.id } },
    select: { role: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden: not a member of this organization" }, { status: 403 });
  }
  if (write && !WRITE_ROLES.has(membership.role)) {
    return NextResponse.json(
      { error: `Forbidden: role "${membership.role}" cannot push sync changes` },
      { status: 403 },
    );
  }
  return { orgId: org.id, actor: "user", actorId: session.id };
}

export function isSyncAccessError(value: SyncAccess | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
