import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/auth";

export async function POST() {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.receipt.deleteMany({});
  return NextResponse.json({ ok: true });
}
