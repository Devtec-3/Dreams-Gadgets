import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public health check for diagnosing deployment issues.
 * Reports which env vars are present (names only, never values)
 * and whether the database is reachable.
 */
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    APP_PASSWORD: Boolean(process.env.APP_PASSWORD),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    GMAIL_USER: Boolean(process.env.GMAIL_USER),
    GMAIL_APP_PASSWORD: Boolean(process.env.GMAIL_APP_PASSWORD),
  };

  let db: "ok" | "unreachable" = "ok";
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    db = "unreachable";
    dbError = e instanceof Error ? e.message.split("\n")[0].slice(0, 160) : "unknown";
  }

  const healthy = Object.values(env).every(Boolean) && db === "ok";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", env, db, dbError },
    { status: healthy ? 200 : 503 }
  );
}
