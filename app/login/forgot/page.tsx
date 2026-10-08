"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestResetAction } from "../forgot-actions";
import { SHOP } from "@/lib/format";

export default function ForgotPage() {
  const [error, formAction, pending] = useActionState(requestResetAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt={SHOP.name} className="mx-auto h-16 w-16 rounded-lg border border-slate-200 object-cover" />
            <h1 className="mt-4 text-lg font-bold text-slate-900">Forgot password</h1>
            <p className="mt-1 text-sm text-slate-500">
              We&apos;ll send a 6-digit reset code to the company email
              <br />
              <span className="font-semibold text-slate-700">{SHOP.email}</span>
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                Company email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={SHOP.email}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Sending code…" : "Send reset code"}
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
