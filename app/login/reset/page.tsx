"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "../forgot-actions";

export default function ResetPage() {
  const [error, formAction, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-lg font-bold text-slate-900">Enter reset code</h1>
            <p className="mt-1 text-sm text-slate-500">
              Check the company email inbox for the 6-digit code.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="code">
                Reset code
              </label>
              <input
                id="code"
                name="code"
                required
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-slate-900"
                placeholder="000000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Resetting…" : "Reset password"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-slate-500 underline hover:text-slate-700">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
