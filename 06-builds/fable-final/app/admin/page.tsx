import { redirect } from "next/navigation";
import { getActor } from "@/auth/actor";

export const dynamic = "force-dynamic";

/** R5 entry — send to last org or first membership. */
export default async function AdminIndexPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.memberships.length === 0) redirect("/onboarding");

  // Prefer demo if present; else first membership. Client also stores menez-last-org.
  const demo = actor.memberships.find((m) => m.orgSlug === "demo");
  redirect(`/admin/${demo?.orgSlug ?? actor.memberships[0]!.orgSlug}`);
}
