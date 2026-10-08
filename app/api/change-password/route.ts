import { NextResponse } from "next/server";
import { checkPassword, isLoggedIn, setPassword } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const current = String(body.currentPassword ?? "");
  const next = String(body.newPassword ?? "");
  if (next.length < 4) {
    return NextResponse.json({ error: "New password must be at least 4 characters." }, { status: 400 });
  }
  if (!(await checkPassword(current))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 400 });
  }
  await setPassword(next);
  return NextResponse.json({ ok: true });
}
