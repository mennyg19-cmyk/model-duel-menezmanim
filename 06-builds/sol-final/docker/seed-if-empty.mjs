import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const organizationCount = await prisma.organization.count();
await prisma.$disconnect();

if (organizationCount === 0) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const seeded = spawnSync(executable, ["tsx", "prisma/seed.ts"], { stdio: "inherit" });
  if (seeded.status !== 0) process.exit(seeded.status ?? 1);
}
