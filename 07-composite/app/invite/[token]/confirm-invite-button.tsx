"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-fetch";

export function ConfirmInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsBusy(true);
    setError(null);
    const { ok, body } = await apiFetch<{ next?: string }>(`/api/invite/${token}`, {
      method: "POST",
      body: { password },
    });
    if (!ok) {
      setError(body.error ?? "Could not confirm invite");
      setIsBusy(false);
      return;
    }
    router.push(body.next ?? "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={confirm} className="mt-6 flex flex-col gap-4">
      <div>
        <Label htmlFor="invite-password">Choose a password</Label>
        <Input
          id="invite-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="invite-password-confirm">Confirm password</Label>
        <Input
          id="invite-password-confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isBusy}>
        {isBusy ? "Confirming…" : "Confirm and sign in"}
      </Button>
      <p className="text-xs text-stone-500">
        This password is how you&apos;ll sign back in at <code>/login</code> after this link is used.
      </p>
    </form>
  );
}
