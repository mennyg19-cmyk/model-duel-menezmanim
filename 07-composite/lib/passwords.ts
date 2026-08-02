// PBKDF2-SHA256 password hashing via Web Crypto — same "runs everywhere, no
// new dependency" discipline as lib/hmac.ts (used by both the staff invite
// confirm flow and customer registration). Encoded as
// `pbkdf2$<iterations>$<saltB64url>$<hashB64url>` so the iteration count can
// be raised later without invalidating existing hashes.

import { base64UrlDecode, base64UrlEncode, encodeText, safeEqual } from "@/lib/hmac";

const ITERATIONS = 210_000; // OWASP 2023 minimum for PBKDF2-HMAC-SHA256
const KEY_LENGTH_BITS = 256;
const SALT_LENGTH_BYTES = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${base64UrlEncode(salt)}$${base64UrlEncode(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;
  const salt = base64UrlDecode(parts[2]);
  const hash = await derive(password, salt, iterations);
  return safeEqual(base64UrlEncode(hash), parts[3]);
}

// Constant-shape dummy verify for the "user not found" branch of a login
// route — runs the same PBKDF2 work as a real check so responses for
// unknown vs known emails take comparable time (anti-enumeration, same goal
// as lib/checkout/server checkoutToken's timing-safe compares).
const DUMMY_HASH = `pbkdf2$${ITERATIONS}$${base64UrlEncode(new Uint8Array(SALT_LENGTH_BYTES))}$AA`;
export async function verifyAgainstDummy(password: string): Promise<void> {
  await verifyPassword(password, DUMMY_HASH);
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey("raw", encodeText(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, key, KEY_LENGTH_BITS);
  return new Uint8Array(bits);
}
