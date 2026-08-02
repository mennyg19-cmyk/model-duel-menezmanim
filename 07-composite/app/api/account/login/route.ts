import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createCustomerLoginSession, issueCustomerSessionResponse } from "@/lib/customers/session";
import { verifyAgainstDummy, verifyPassword } from "@/lib/passwords";
import { parseBody } from "@/lib/parse-body";
import { normalizeEmail } from "@/lib/text";
import { clientIp } from "@/lib/client-ip";
import { loginRateLimit } from "@/lib/rate-limit";
import { safeNextPath } from "@/lib/safe-redirect";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

// The production customer sign-in path (R-108/UR-011). Same
// generic-error + dummy-hash anti-enumeration shape as /api/login.
export async function POST(request: Request) {
  const parsed = await parseBody(request, loginSchema, "Email and password are required");
  if (!parsed.ok) return parsed.response;
  const { email, password, next } = parsed.data;

  const ip = clientIp(request.headers) ?? "unknown";
  if (!loginRateLimit(ip, email)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const customer = await prisma.customer.findUnique({ where: { email: normalizeEmail(email) } });
  if (!customer || !customer.passwordHash) {
    await verifyAgainstDummy(password);
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session = await createCustomerLoginSession(customer.id);
  return issueCustomerSessionResponse(
    { customerId: customer.id, customerSessionId: session.id },
    { ok: true, next: safeNextPath(next, "/account") },
  );
}
