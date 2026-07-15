export type Role = "owner" | "admin" | "editor" | "viewer";

export interface ActorMembership {
  orgId: string;
  orgSlug: string;
  role: Role;
}

export interface Actor {
  userId: string;
  clerkUserId: string | null;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  memberships: ActorMembership[];
}
