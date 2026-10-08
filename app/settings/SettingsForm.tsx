"use client";

import { useState } from "react";
import { SHOP } from "@/lib/format";

export default function SettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 4) return setMsg({ ok: false, text: "New password must be at least 4 characters." });
    if (next !== confirm) return setMsg({ ok: false, text: "New passwords do not match." });
    setSaving(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setMsg({ ok: true, text: "Password changed successfully." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <a href="/receipts" className="text-sm text-slate-500 underline hover:text-slate-700">
          ← Back to receipts
        </a>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">
          If you forget the password, use &quot;Forgot password&quot; on the login page — a reset code
          will be emailed to <span className="font-semibold">{SHOP.email}</span>.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input className={inputCls} type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input className={inputCls} type="password" required minLength={4} value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input className={inputCls} type="password" required minLength={4} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {msg && (
            <p className={`rounded-md px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
