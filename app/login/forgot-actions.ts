"use server";

import { redirect } from "next/navigation";
import { createResetCode, useResetCode, setPassword, COMPANY_EMAIL } from "@/lib/auth";
import { sendResetCodeEmail } from "@/lib/mailer";

export async function requestResetAction(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const sentTo = String(formData.get("email") ?? "").trim().toLowerCase();
  if (sentTo !== COMPANY_EMAIL) {
    return "Enter the company email: " + COMPANY_EMAIL;
  }
  const code = await createResetCode();
  const sent = await sendResetCodeEmail(code, COMPANY_EMAIL);
  if (!sent) {
    // Do NOT leak the code. Tell the owner to configure the mail credentials.
    return "Email service is not configured yet. The owner must add GMAIL_USER and GMAIL_APP_PASSWORD to the server settings.";
  }
  redirect("/login/reset");
}

export async function resetPasswordAction(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const code = String(formData.get("code") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 4) return "New password must be at least 4 characters.";
  if (newPassword !== confirmPassword) return "Passwords do not match.";

  const ok = await useResetCode(code);
  if (!ok) return "Invalid or expired code.";
  await setPassword(newPassword);
  redirect("/login?reset=done");
}
