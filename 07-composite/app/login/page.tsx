import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { safeNextPath } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Staff sign in" };
export const dynamic = "force-dynamic";

// The production staff sign-in path (R-108). Distinct from /dev-login
// (APP_ENV=test only, see lib/dev-auth.ts) and from /invite/[token] (single
// use, sets the password this page then checks) — without this page a
// staff session expiry after the one-time invite link was a permanent
// lockout with no way back in.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNextPath(next, "/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md p-8">
        <CardTitle>Staff sign in</CardTitle>
        <p className="mt-2 text-sm text-stone-600">Sign in with the email and password from your invite.</p>
        <LoginForm next={target} />
      </Card>
    </main>
  );
}
