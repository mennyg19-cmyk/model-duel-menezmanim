import { cookies } from "next/headers";
import { authSecret } from "./actor";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, type SessionPayload } from "./session";

export async function startSession(payload: Omit<SessionPayload, "exp">): Promise<void> {
  const token = signSession({ ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }, authSecret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
