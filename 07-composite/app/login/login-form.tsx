"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-fetch";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsBusy(true);
    setError(null);
    const { ok, body } = await apiFetch<{ next?: string }>("/api/login", {
      method: "POST",
      body: { email, password, next },
    });
    if (!ok) {
      setError(body.error ?? "Sign in failed");
      setIsBusy(false);
      return;
    }
    router.push(body.next ?? next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <Label htmlFor="staff-email">Email</Label>
        <Input
          id="staff-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="staff-password">Password</Label>
        <Input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isBusy}>
        {isBusy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
