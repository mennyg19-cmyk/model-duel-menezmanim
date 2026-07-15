// Assembles Next standalone + drizzle + seed into desktop/resources/ for packaging.
// Paths are rebuild-a local (F-DESKTOP-COUPLING) — not Turbo monorepo out/web.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(here, "..");
const webDir = resolve(desktopDir, "..");
const standalone = join(webDir, ".next", "standalone");
const resources = join(desktopDir, "resources");

function run(cmd, args, cwd, env) {
  execFileSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: env || process.env,
  });
}

console.log("[prepare] building web (standalone)...");
run("npm", ["run", "build"], webDir);

if (!existsSync(join(standalone, "server.js"))) {
  throw new Error("standalone server.js missing — is output:'standalone' set in next.config?");
}

console.log("[prepare] resetting resources/...");
rmSync(resources, { recursive: true, force: true });
mkdirSync(resources, { recursive: true });

const copy = (from, to) => cpSync(from, to, { recursive: true, dereference: true });

console.log("[prepare] copying server bundle...");
copy(standalone, join(resources, "app-server"));
const staticSrc = join(webDir, ".next", "static");
if (existsSync(staticSrc)) {
  copy(staticSrc, join(resources, "app-server", ".next", "static"));
}
if (existsSync(join(webDir, "public"))) {
  copy(join(webDir, "public"), join(resources, "app-server", "public"));
}

console.log("[prepare] copying migrations...");
copy(join(webDir, "drizzle"), join(resources, "drizzle"));

console.log("[prepare] building seeded demo database...");
const seedDb = join(resources, "seed", "demo.db");
mkdirSync(dirname(seedDb), { recursive: true });
const seedEnv = { ...process.env, DATABASE_URL: `file:${seedDb.replace(/\\/g, "/")}` };
delete seedEnv.TURSO_DATABASE_URL;
delete seedEnv.TURSO_AUTH_TOKEN;
run("npm", ["run", "db:migrate"], webDir, seedEnv);
run("npm", ["run", "db:seed"], webDir, seedEnv);

mkdirSync(join(resources, "icons"), { recursive: true });
// Minimal placeholder icon note — replace with branded assets for production installers (DK26/G10).
writeFileSync(
  join(resources, "icons", "README.txt"),
  "Place icon.ico / icon.png here for electron-builder (DK26/G10). Packaging still targets NSIS (G11).\n",
);

console.log("[prepare] done -> " + resources);
