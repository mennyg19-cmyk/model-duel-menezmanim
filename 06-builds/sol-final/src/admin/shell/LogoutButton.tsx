"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ className = "button button-primary" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      className={className}
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
