import nodemailer from "nodemailer";
import { SHOP } from "@/lib/format";

/**
 * Sends the password reset code to the company email.
 *
 * Requires Gmail App Password credentials in .env:
 *   GMAIL_USER=gadgetdreams2@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 *
 * If they are not set, the email cannot be sent (returns false) and the
 * reset flow will show the code requirement with an error message.
 */
export async function sendResetCodeEmail(code: string, to: string): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return false;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${SHOP.name}" <${user}>`,
    to,
    subject: `Password reset code — ${SHOP.name} Receipt Generator`,
    text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#16224a;margin:0 0 8px">${SHOP.name}</h2>
        <p style="color:#374151">Use this code to reset your password:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1d4ed8;margin:16px 0">${code}</p>
        <p style="color:#6b7280;font-size:13px">This code expires in 15 minutes. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
  return true;
}
