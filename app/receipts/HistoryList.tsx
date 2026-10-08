"use client";

import { useMemo, useState } from "react";
import { formatDate, formatNaira } from "@/lib/format";
import { emptyFilter, filterReceipts, FilterState, uniqueDevices, uniqueLocations } from "@/lib/filter";

interface Row {
  id: string;
  receiptNo: string;
  customerName: string;
  customerEmail: string | null;
  total: number;
  status: string;
  deliveryType: string;
  address: string | null;
  items: unknown;
  createdAt: string;
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900";

export default function HistoryList({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [filter, setFilter] = useState<FilterState>(emptyFilter);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const devices = useMemo(() => uniqueDevices(rows), [rows]);
  const locations = useMemo(() => uniqueLocations(rows), [rows]);
  const filtered = useMemo(() => filterReceipts(rows, filter), [rows, filter]);
  const filteredTotal = useMemo(() => filtered.reduce((s, r) => s + r.total, 0), [filtered]);
  const hasFilter = filter.q || filter.location || filter.device || filter.month || filter.date;

  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }

  async function deleteOne(id: string, receiptNo: string) {
    if (!window.confirm(`Delete receipt ${receiptNo}? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Could not delete the receipt. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function clearAll() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts/clear", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setRows([]);
      setConfirmClear(false);
    } catch {
      setError("Could not clear history. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const exportUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (filter.q) p.set("q", filter.q);
    if (filter.location) p.set("location", filter.location);
    if (filter.device) p.set("device", filter.device);
    if (filter.month) p.set("month", filter.month);
    if (filter.date) p.set("date", filter.date);
    const qs = p.toString();
    return `/api/receipts/export${qs ? `?${qs}` : ""}`;
  }, [filter]);

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Search customer name / receipt no.</label>
            <input
              className={inputCls}
              placeholder="e.g. warris or ORD-…"
              value={filter.q}
              onChange={(e) => set("q", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Location / area</label>
            <input
              className={inputCls}
              list="location-options"
              placeholder="e.g. Ikeja"
              value={filter.location}
              onChange={(e) => set("location", e.target.value)}
            />
            <datalist id="location-options">
              {locations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Device type</label>
            <input
              className={inputCls}
              list="device-options"
              placeholder="e.g. iPhone"
              value={filter.device}
              onChange={(e) => set("device", e.target.value)}
            />
            <datalist id="device-options">
              {devices.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Month</label>
            <input className={inputCls} type="month" value={filter.month} onChange={(e) => set("month", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Exact date</label>
            <input className={inputCls} type="date" value={filter.date} onChange={(e) => set("date", e.target.value)} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "receipt" : "receipts"}
            {hasFilter && " (filtered)"} • Total:{" "}
            <span className="font-semibold text-slate-900">{formatNaira(filteredTotal)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasFilter && (
              <button
                onClick={() => setFilter(emptyFilter)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
            <a
              href={exportUrl}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                filtered.length === 0
                  ? "pointer-events-none border border-slate-200 text-slate-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Export CSV {filter.month ? `(${filter.month})` : ""}
            </a>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Delete ALL {rows.length} receipts?</span>
                <button
                  onClick={clearAll}
                  disabled={busy}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Yes, delete all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                disabled={busy}
                className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                Clear history
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            {rows.length === 0 ? "No receipts yet. Create your first one!" : "No receipts match these filters."}
          </div>
        ) : (
          filtered.map((r) => {
            const isFilteredView = hasFilter;
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 transition last:border-0 hover:bg-slate-50"
              >
                <a href={`/receipt/${r.id}`} className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{r.receiptNo}</div>
                  <div className="text-sm text-slate-600">
                    {r.customerName} • {formatDate(r.createdAt)}
                  </div>
                  {isFilteredView && (r.address || r.deliveryType) && (
                    <div className="text-xs text-slate-400">
                      {[r.deliveryType, r.address].filter(Boolean).join(" — ")}
                    </div>
                  )}
                </a>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatNaira(r.total)}</div>
                    <div className={`text-sm font-semibold ${r.status === "Paid" ? "text-green-600" : "text-amber-600"}`}>
                      {r.status}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOne(r.id, r.receiptNo)}
                    disabled={busy}
                    title="Delete this receipt"
                    className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
