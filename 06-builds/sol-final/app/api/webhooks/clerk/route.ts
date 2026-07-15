import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { isSuperAdminEmail } from "../../../../src/auth/session";
import { upsertUserFromIdentity } from "../../../../src/domain/identity";

type ClerkEmailAddress = { email_address: string; id: string };
type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
  };
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  const devSecret = process.env.DEV_WEBHOOK_SECRET;

  let event: ClerkUserEvent;

  if (secret) {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }
    try {
      const webhook = new Webhook(secret);
      event = webhook.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkUserEvent;
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else if (devSecret && request.headers.get("x-dev-webhook-secret") === devSecret) {
    event = JSON.parse(body) as ClerkUserEvent;
  } else {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const primaryEmail = event.data.email_addresses.find(
      (entry) => entry.id === event.data.primary_email_address_id,
    );
    const email =
      primaryEmail?.email_address ?? event.data.email_addresses[0]?.email_address ?? "";
    const name =
      [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || "User";

    if (email) {
      const user = await upsertUserFromIdentity({
        clerkUserId: event.data.id,
        email,
        name,
      });
      return NextResponse.json({
        received: true,
        userId: user.id,
        isSuperAdmin: user.isSuperAdmin || isSuperAdminEmail(email),
      });
    }
  }

  return NextResponse.json({ received: true });
}
