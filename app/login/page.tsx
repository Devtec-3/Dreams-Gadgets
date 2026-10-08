"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { SHOP } from "@/lib/format";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/image.png"
              alt={SHOP.name}
              className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
            />
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900">{SHOP.name}</div>
              <div className="text-sm text-slate-500">Receipt Generator</div>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoFocus
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login/forgot" className="text-sm text-slate-500 underline hover:text-slate-700">
              Forgot password?
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          {SHOP.tagline}
        </p>
      </div>
    </div>
  );
}
