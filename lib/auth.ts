import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SHOP } from "@/lib/format";

const COOKIE_NAME = "dg_session";
const COMPANY_EMAIL = SHOP.email; // gadgetdreams2@gmail.com

/* ---------- password hashing (scrypt) ---------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* ---------- brute-force protection ---------- */

const loginAttempts = new Map<string, { count: number; until: number }>();

export function isRateLimited(key: string): boolean {
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    loginAttempts.delete(key);
    return false;
  }
  return true;
}

export function recordFailedAttempt(key: string): void {
  const entry = loginAttempts.get(key) ?? { count: 0, until: 0 };
  entry.count += 1;
  // 5 failed attempts -> lock that source out for 15 minutes
  if (entry.count >= 5) {
    entry.until = Date.now() + 15 * 60 * 1000;
    entry.count = 0;
  }
  loginAttempts.set(key, entry);
}

export function clearAttempts(key: string): void {
  loginAttempts.delete(key);
}

/* ---------- password verification against DB (env fallback for first run) ---------- */

async function currentPasswordHash(): Promise<string | null> {
  const setting = await prisma.passwordSetting.findUnique({ where: { id: "app" } });
  return setting?.passwordHash ?? null;
}

export async function checkPassword(password: string): Promise<boolean> {
  const stored = await currentPasswordHash();
  if (stored) return verifyPassword(password, stored);
  // First run: no password set yet — accept the env default and migrate it to the DB
  if (password === (process.env.APP_PASSWORD ?? "2005")) {
    await prisma.passwordSetting.create({
      data: { id: "app", passwordHash: hashPassword(password) },
    });
    return true;
  }
  return false;
}

export async function setPassword(password: string): Promise<void> {
  const passwordHash = hashPassword(password);
  await prisma.passwordSetting.upsert({
    where: { id: "app" },
    create: { id: "app", passwordHash },
    update: { passwordHash },
  });
  // Invalidate existing reset codes after any password change
  await prisma.passwordResetCode.deleteMany({});
}

/* ---------- session (token tied to current password hash) ---------- */

function tokenFor(passwordHash: string): string {
  return createHash("sha256").update(`dg-session:${passwordHash}`).digest("hex");
}

export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;
  const stored = await currentPasswordHash();
  if (!stored) return false;
  // Changing the password invalidates all old sessions
  const expected = tokenFor(stored);
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function login(): Promise<void> {
  const store = await cookies();
  const stored = await currentPasswordHash();
  store.set(COOKIE_NAME, tokenFor(stored ?? "unset"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/* ---------- forgot password: email codes ---------- */

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function createResetCode(): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  await prisma.passwordResetCode.deleteMany({ where: { usedAt: null } });
  await prisma.passwordResetCode.create({
    data: { codeHash: hashCode(code), expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });
  return code;
}

// Max verification attempts per code, so 6-digit codes can't be brute-forced
const resetAttempts = new Map<string, number>();

export async function useResetCode(code: string): Promise<boolean> {
  const key = "reset";
  if ((resetAttempts.get(key) ?? 0) >= 5) return false;
  const record = await prisma.passwordResetCode.findFirst({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return false;
  const expected = Buffer.from(record.codeHash, "hex");
  const candidate = Buffer.from(hashCode(code.trim()), "hex");
  const ok = expected.length === candidate.length && timingSafeEqual(expected, candidate);
  if (!ok) {
    resetAttempts.set(key, (resetAttempts.get(key) ?? 0) + 1);
    if ((resetAttempts.get(key) ?? 0) >= 5) {
      // Too many wrong guesses — kill the code
      await prisma.passwordResetCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      resetAttempts.delete(key);
    }
    return false;
  }
  resetAttempts.delete(key);
  await prisma.passwordResetCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return true;
}

export { COMPANY_EMAIL };
