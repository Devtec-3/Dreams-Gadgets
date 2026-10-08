"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, login, isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/auth";

export async function loginAction(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const password = String(formData.get("password") ?? "");
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(`login:${ip}`)) {
    return "Too many attempts. Try again in 15 minutes.";
  }

  const ok = await checkPassword(password);
  if (!ok) {
    recordFailedAttempt(`login:${ip}`);
    return "Wrong password. Try again.";
  }
  clearAttempts(`login:${ip}`);
  await login();
  redirect("/");
}
