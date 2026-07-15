import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import { AuthError, requireSuperAdmin } from "@/auth/guards";

export const dynamic = "force-dynamic";

function runSeedScript(): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const root = process.cwd();
    const script = path.join(root, "src", "db", "seed.ts");
    const child = spawn("npx", ["tsx", script], {
      cwd: root,
      shell: true,
      env: { ...process.env },
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

/** E21 — reseed demo orgs/users (same wipe+create as `npm run db:seed`). */
export async function POST() {
  try {
    await requireSuperAdmin();
    const result = await runSeedScript();
    if (result.code !== 0) {
      return NextResponse.json(
        { error: "Seed failed.", detail: (result.stderr || result.stdout).slice(-800) },
        { status: 500 },
      );
    }
    return NextResponse.json({
      ok: true,
      message: "Demo reseeded (demo + demo-b, owner@demo.local).",
      logTail: result.stdout.slice(-500),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
