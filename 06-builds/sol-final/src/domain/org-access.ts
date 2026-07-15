import { NextResponse } from "next/server";
import { getSessionUser } from "../auth/session";
import { prisma } from "../db/client";

const WRITE_ROLES = new Set(["owner", "admin", "editor"]);
const ADMIN_ROLES = new Set(["owner", "admin"]);

export type OrgAccess = {
  userId: string;
  orgId: string;
  role: string;
  isSuperAdmin: boolean;
};

export async function requireOrgMember(
  orgId: string,
  options?: { write?: boolean; admin?: boolean },
): Promise<OrgAccess | NextResponse> {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await prisma.organization.findFirst({
    where: { OR: [{ id: orgId }, { slug: orgId }] },
  });
  if (!org) {
    return NextResponse.json({ error: `Organization not found: ${orgId}` }, { status: 404 });
  }

  if (session.isSuperAdmin) {
    return { userId: session.id, orgId: org.id, role: "superadmin", isSuperAdmin: true };
  }

  const membership = await prisma.orgMembership.findUnique({
    where: { userId_orgId: { userId: session.id, orgId: org.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden: not a member of this organization" }, { status: 403 });
  }

  if (options?.admin && !ADMIN_ROLES.has(membership.role)) {
    return NextResponse.json(
      { error: `Forbidden: role "${membership.role}" cannot manage members or invites` },
      { status: 403 },
    );
  }

  if (options?.write && !WRITE_ROLES.has(membership.role)) {
    return NextResponse.json(
      { error: `Forbidden: role "${membership.role}" cannot write schedules/groups` },
      { status: 403 },
    );
  }

  return {
    userId: session.id,
    orgId: org.id,
    role: membership.role,
    isSuperAdmin: false,
  };
}

export function isAccessError(value: OrgAccess | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
