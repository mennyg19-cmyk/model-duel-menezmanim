// === What's in this file ===
// The one place that opens a database connection. Same driver (libSQL) for all
// three homes: Turso in the cloud, a local file on the desktop, and sqld in
// Docker -- so the rest of the app never knows or cares which one it's talking to.
//
// createDb() -- opens a connection to a given url (+ optional auth token) and
//   returns a Drizzle client wired to our schema. For a local "file:" url it
//   first makes sure the folder exists (libSQL won't create it). `casing:
//   "snake_case"` is what lets schema.ts use camelCase keys while the DB stores
//   snake_case columns.
// db -- the default connection the web app uses, picked from env (DATABASE_URL,
//   or a local dev file when unset). It connects LAZILY on first use, so merely
//   importing this file -- e.g. during `next build` -- never opens a database.
// Db -- the connection type, for passing a handle around.

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const LOCAL_DEV_URL = "file:local-data/dev.db";

function ensureLocalDir(url: string): void {
  if (!url.startsWith("file:")) return;
  const dir = dirname(url.slice("file:".length));
  if (dir && dir !== ".") mkdirSync(dir, { recursive: true });
}

export function createDb(config: { url: string; authToken?: string }) {
  ensureLocalDir(config.url);
  const client = createClient(config);
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;

// Reads an env var but treats an empty/whitespace value as "not set" -- otherwise
// an empty TURSO_DATABASE_URL would win over DATABASE_URL and crash with an
// invalid-URL error instead of falling through to the local file.
function envOr(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

// Where the default connection points, from env. Prefers the TURSO_* names the
// Vercel project already uses; falls back to DATABASE_* and then a local file.
export function resolveDbConfig(): { url: string; authToken?: string } {
  return {
    url: envOr("TURSO_DATABASE_URL") ?? envOr("DATABASE_URL") ?? LOCAL_DEV_URL,
    authToken: envOr("TURSO_AUTH_TOKEN") ?? envOr("DATABASE_AUTH_TOKEN"),
  };
}

let cached: Db | undefined;
function resolveDb(): Db {
  if (!cached) cached = createDb(resolveDbConfig());
  return cached;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = resolveDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
