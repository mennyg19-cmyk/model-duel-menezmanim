"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { safeNextPath } from "@/lib/safe-redirect";
import { useSearchParams } from "next/navigation";
import { SigninForm } from "./signin-form";
import { RegisterForm } from "./register-form";

// R-108/UR-011: the production customer sign-in + self-service registration
// page. Without this the storefront "Sign in" link (components/storefront/
// user-menu.tsx) pointed at the auth-gated /account, which just bounced
// signed-out visitors back to "/" with nowhere to actually sign in.
export default function SigninPage() {
  const searchParams = useSearchParams();
  const target = safeNextPath(searchParams.get("next"), "/account");
  const [mode, setMode] = useState<"signin" | "register">("signin");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full p-8">
        <div className="flex gap-1 rounded-md bg-stone-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded px-3 py-1.5 font-medium ${mode === "signin" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded px-3 py-1.5 font-medium ${mode === "register" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"}`}
          >
            Create account
          </button>
        </div>
        <CardTitle className="mt-4">{mode === "signin" ? "Sign in" : "Create your account"}</CardTitle>
        <div className="mt-4">
          {mode === "signin" ? <SigninForm next={target} /> : <RegisterForm next={target} />}
        </div>
      </Card>
    </main>
  );
}
