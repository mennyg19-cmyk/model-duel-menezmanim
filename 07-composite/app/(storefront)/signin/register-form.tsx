"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-fetch";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsBusy(true);
    setError(null);
    const { ok, body } = await apiFetch<{ next?: string }>("/api/account/register", {
      method: "POST",
      body: { name, email, password, next },
    });
    if (!ok) {
      setError(body.error ?? "Could not create account");
      setIsBusy(false);
      return;
    }
    router.push(body.next ?? next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="register-name">Name</Label>
        <Input
          id="register-name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isBusy}>
        {isBusy ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
