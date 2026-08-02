import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createCustomerLoginSession, issueCustomerSessionResponse } from "@/lib/customers/session";
import { hashPassword } from "@/lib/passwords";
import { parseBody } from "@/lib/parse-body";
import { normalizeEmail, normalizeWhitespace } from "@/lib/text";
import { clientIp } from "@/lib/client-ip";
import { registerRateLimit } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";
import { safeNextPath } from "@/lib/safe-redirect";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  next: z.string().optional(),
});

// Self-service registration (R-108/UR-011). A guest-shadow customer row
// left over from a prior guest checkout (R-023, findOrCreateGuestCustomer)
// upgrades in place instead of creating a duplicate — same dedupe goal as
// lib/customers/dedupe.ts. A row that already has a password is a real,
// existing account: refuse and point at sign-in instead of silently
// overwriting someone else's credential.
export async function POST(request: Request) {
  const ip = clientIp(request.headers) ?? "unknown";
  if (!registerRateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const parsed = await parseBody(
    request,
    registerSchema,
    "Name, email, and an 8+ character password are required",
  );
  if (!parsed.ok) return parsed.response;
  const email = normalizeEmail(parsed.data.email);
  const name = normalizeWhitespace(parsed.data.name);
  const passwordHash = await hashPassword(parsed.data.password);

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return NextResponse.json(
      { error: "An account already exists for that email — sign in instead" },
      { status: 409 },
    );
  }

  let customer;
  try {
    customer = existing
      ? await prisma.customer.update({ where: { id: existing.id }, data: { passwordHash, name } })
      : await prisma.customer.create({ data: { email, name, passwordHash } });
  } catch (error) {
    // Lost a create race on the unique email index — the winner already has
    // (or is concurrently setting) a password; ask this caller to sign in.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "An account already exists for that email — sign in instead" },
        { status: 409 },
      );
    }
    throw error;
  }

  const session = await createCustomerLoginSession(customer.id);
  await recordAudit({
    actor: { id: customer.id, email: customer.email },
    action: "customer_create",
    targetType: "Customer",
    targetId: customer.id,
  });
  return issueCustomerSessionResponse(
    { customerId: customer.id, customerSessionId: session.id },
    { ok: true, next: safeNextPath(parsed.data.next, "/account") },
  );
}
