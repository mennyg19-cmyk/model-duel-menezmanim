import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL ?? "file:local-data/dev.db" },
});
