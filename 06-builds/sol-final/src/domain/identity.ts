import { prisma } from "../db/client";
import { DEFAULT_SCHEDULE_GROUPS } from "../content/default-groups";
import { isSuperAdminEmail } from "../auth/session";

export type MembershipSummary = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  orgStatus: string;
  role: string;
};

/** Flat /api/me contract (F-ME-SHAPE). */
export type MeResponse = {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  memberships: MembershipSummary[];
};

export async function getMeByClerkId(clerkUserId: string): Promise<MeResponse | null> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      memberships: {
        include: { organization: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name,
    isSuperAdmin: user.isSuperAdmin,
    memberships: user.memberships.map((membership) => ({
      orgId: membership.orgId,
      orgName: membership.organization.name,
      orgSlug: membership.organization.slug,
      orgStatus: membership.organization.status,
      role: membership.role,
    })),
  };
}

export async function getMeByUserId(userId: string): Promise<MeResponse | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return getMeByClerkId(user.clerkUserId);
}

export async function upsertUserFromIdentity(input: {
  clerkUserId: string;
  email: string;
  name: string;
}) {
  const email = input.email.toLowerCase();
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail && existingByEmail.clerkUserId !== input.clerkUserId) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkUserId: input.clerkUserId,
        name: input.name,
        isSuperAdmin: existingByEmail.isSuperAdmin || isSuperAdminEmail(email),
      },
    });
  }

  return prisma.user.upsert({
    where: { clerkUserId: input.clerkUserId },
    create: {
      clerkUserId: input.clerkUserId,
      email,
      name: input.name,
      isSuperAdmin: isSuperAdminEmail(email),
    },
    update: {
      email,
      name: input.name,
      isSuperAdmin: isSuperAdminEmail(email),
    },
  });
}

export async function seedOrganizationDefaults(orgId: string) {
  const style = await prisma.style.create({
    data: {
      name: "Default Style",
      orgId,
      backgroundColor: "#0f172a",
      backgroundMode: "solid",
      canvasWidth: 1920,
      canvasHeight: 1080,
      isDefault: true,
      activationRules: JSON.stringify({ type: "always" }),
      sortOrder: 0,
    },
  });

  await prisma.screen.create({
    data: {
      name: "Main Display",
      orgId,
      assignedStyleId: style.id,
      isActive: true,
      resolution: "1920x1080",
    },
  });

  await prisma.scheduleGroup.createMany({
    data: DEFAULT_SCHEDULE_GROUPS.map((group, index) => ({
      orgId,
      name: group.name,
      hebrewName: group.hebrewName,
      color: group.color,
      active: true,
      sortOrder: index,
      isBuiltIn: true,
    })),
  });
}

export async function createOrganizationForOwner(
  ownerUserId: string,
  input: {
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    timezone: string;
    inIsrael?: boolean;
    dialect?: string;
    candleLightingMinutes?: number;
    shabbatEndType?: string;
    shabbatEndValue?: number;
  },
) {
  const slug = input.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`Slug "${slug}" is already taken`);
  }

  const org = await prisma.organization.create({
    data: {
      name: input.name,
      slug,
      status: "pending",
      latitude: input.latitude,
      longitude: input.longitude,
      elevation: input.elevation ?? 0,
      timezone: input.timezone,
      inIsrael: input.inIsrael ?? false,
      dialect: input.dialect ?? "Ashkenazi",
      candleLightingMinutes: input.candleLightingMinutes ?? 18,
      shabbatEndType: input.shabbatEndType ?? "degrees",
      shabbatEndValue: input.shabbatEndValue ?? 8.5,
      settings: JSON.stringify({ nameHebrew: input.name, locationName: input.name }),
    },
  });

  await prisma.orgMembership.create({
    data: { userId: ownerUserId, orgId: org.id, role: "owner" },
  });
  await seedOrganizationDefaults(org.id);
  return org;
}

export async function acceptInviteToken(token: string, clerkUserId: string) {
  const invite = await prisma.orgInvite.findUnique({ where: { token } });
  if (!invite) throw new Error("Invite not found");
  if (invite.usedAt) throw new Error("Invite already used");
  if (invite.expiresAt < new Date()) throw new Error("Invite expired");

  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new Error(`Invite was issued for ${invite.email}, not ${user.email}`);
  }

  await prisma.orgMembership.upsert({
    where: { userId_orgId: { userId: user.id, orgId: invite.orgId } },
    create: { userId: user.id, orgId: invite.orgId, role: invite.role },
    update: { role: invite.role },
  });
  await prisma.orgInvite.update({
    where: { id: invite.id },
    data: { usedAt: new Date() },
  });

  return { orgId: invite.orgId };
}

export async function listPendingInvitesForEmail(email: string) {
  const invites = await prisma.orgInvite.findMany({
    where: { email: email.toLowerCase(), usedAt: null, expiresAt: { gt: new Date() } },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  return invites.map((invite) => ({
    id: invite.id,
    token: invite.token,
    role: invite.role,
    expiresAt: invite.expiresAt.toISOString(),
    organization: {
      id: invite.organization.id,
      name: invite.organization.name,
      slug: invite.organization.slug,
      status: invite.organization.status,
    },
  }));
}

export async function slugAvailable(slug: string): Promise<boolean> {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!normalized) return false;
  const existing = await prisma.organization.findUnique({ where: { slug: normalized } });
  return !existing;
}
