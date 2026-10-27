"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNaira, OFFICES, ReceiptItem, SHOP } from "@/lib/format";

const emptyItem: ReceiptItem = {
  name: "",
  category: "iPhone",
  condition: "New",
  model: "",
  grade: "",
  imei: "",
  batteryHealth: "",
  carrier: "",
  sim: "",
  color: "",
  storage: "",
  qty: 1,
  unitPrice: 0,
};

export default function NewReceiptPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [status, setStatus] = useState("Paid");
  const [items, setItems] = useState<ReceiptItem[]>([{ ...emptyItem }]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryType, setDeliveryType] = useState("Pickup");
  const [office, setOffice] = useState<keyof typeof OFFICES | "Other">("Lagos");
  const [customAddress, setCustomAddress] = useState("");
  const address = office === "Other" ? customAddress : OFFICES[office].address;

  const productsTotal = items.reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0);
  const total = productsTotal + (deliveryFee || 0) - (discount || 0);

  function updateItem(i: number, patch: Partial<ReceiptItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function save() {
    setError(null);
    if (!customerName.trim()) return setError("Customer name is required.");
    if (!items.some((it) => it.name.trim() && it.qty > 0)) {
      return setError("Add at least one item with a name and quantity.");
    }
    setSaving(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          status,
          items,
          deliveryFee,
          discount,
          bankName: SHOP.bankName,
          accountNumber: SHOP.accountNumber,
          accountName: SHOP.accountHolder,
          deliveryType,
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.push(`/receipt/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-900";
  const labelCls = "mb-1 block text-sm font-medium text-slate-700";
  const sectionTitle = "text-sm font-semibold uppercase tracking-wide text-slate-900";
  const card = "rounded-lg border border-slate-200 bg-white p-6 shadow-sm";

  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-28">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt={SHOP.name} className="h-11 w-11 rounded-lg border border-slate-200 object-cover" />
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900">New Receipt</div>
              <div className="text-xs text-slate-500">{SHOP.name}</div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <a href="/receipts" className="rounded-md border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              History
            </a>
            <a href="/settings" className="rounded-md border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Settings
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        {/* Customer */}
        <section className={card}>
          <h2 className={sectionTitle}>Customer</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Customer name *</label>
              <input className={inputCls} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. DREAM GADGET WARRIS" />
            </div>
            <div>
              <label className={labelCls}>Customer email (optional)</label>
              <input className={inputCls} type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@gmail.com" />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </section>

        {/* Items */}
        <section className={`${card} mt-5`}>
          <div className="flex items-center justify-between">
            <h2 className={sectionTitle}>Items</h2>
            <button
              type="button"
              onClick={() => setItems((p) => [...p, { ...emptyItem }])}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Add item
            </button>
          </div>
          {items.map((it, i) => (
            <div key={i} className="mt-4 rounded-md border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Item {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} className="text-sm text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-3.5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Item name *</label>
                  <input className={inputCls} value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="e.g. 18 pro max" />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <input className={inputCls} value={it.category ?? ""} onChange={(e) => updateItem(i, { category: e.target.value })} placeholder="iPhone" />
                </div>
                <div>
                  <label className={labelCls}>Condition</label>
                  <input className={inputCls} value={it.condition ?? ""} onChange={(e) => updateItem(i, { condition: e.target.value })} placeholder="New / Uk used" />
                </div>
                <div>
                  <label className={labelCls}>Model</label>
                  <input className={inputCls} value={it.model ?? ""} onChange={(e) => updateItem(i, { model: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Grade</label>
                  <input className={inputCls} value={it.grade ?? ""} onChange={(e) => updateItem(i, { grade: e.target.value })} />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelCls}>IMEI / Serial number</label>
                  <input className={inputCls} value={it.imei ?? ""} onChange={(e) => updateItem(i, { imei: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Battery health</label>
                  <input className={inputCls} value={it.batteryHealth ?? ""} onChange={(e) => updateItem(i, { batteryHealth: e.target.value })} placeholder="100%" />
                </div>
                <div>
                  <label className={labelCls}>Carrier</label>
                  <input className={inputCls} value={it.carrier ?? ""} onChange={(e) => updateItem(i, { carrier: e.target.value })} placeholder="Unlocked" />
                </div>
                <div>
                  <label className={labelCls}>SIM</label>
                  <input className={inputCls} value={it.sim ?? ""} onChange={(e) => updateItem(i, { sim: e.target.value })} placeholder="eSIM" />
                </div>
                <div>
                  <label className={labelCls}>Color</label>
                  <input className={inputCls} value={it.color ?? ""} onChange={(e) => updateItem(i, { color: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Storage</label>
                  <input className={inputCls} value={it.storage ?? ""} onChange={(e) => updateItem(i, { storage: e.target.value })} placeholder="256 GB" />
                </div>
                <div>
                  <label className={labelCls}>Quantity</label>
                  <input className={inputCls} type="number" min={1} value={it.qty} onChange={(e) => updateItem(i, { qty: Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Unit price (₦)</label>
                  <input className={inputCls} type="number" min={0} value={it.unitPrice || ""} onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Charges + Delivery */}
        <section className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className={card}>
            <h2 className={sectionTitle}>Charges</h2>
            <div className="mt-4">
              <label className={labelCls}>Delivery fee (₦)</label>
              <input className={inputCls} type="number" min={0} value={deliveryFee || ""} onChange={(e) => setDeliveryFee(Number(e.target.value))} />
            </div>
            <div className="mt-4">
              <label className={labelCls}>Discount (₦)</label>
              <input className={inputCls} type="number" min={0} value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex justify-between py-1"><span className="text-slate-600">Products</span><span className="font-semibold text-slate-900">{formatNaira(productsTotal)}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-600">Delivery</span><span className="font-semibold text-slate-900">{formatNaira(deliveryFee || 0)}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-600">Discount</span><span className="font-semibold text-green-700">-{formatNaira(discount || 0)}</span></div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2.5 text-sm font-bold text-slate-900"><span>TOTAL</span><span>{formatNaira(total)}</span></div>
            </div>
          </div>
          <div className={card}>
            <h2 className={sectionTitle}>Delivery</h2>
            <div className="mt-4">
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                <option>Pickup</option>
                <option>Delivery</option>
              </select>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Address on receipt</label>
              <select
                className={inputCls}
                value={office}
                onChange={(e) => setOffice(e.target.value as keyof typeof OFFICES | "Other")}
              >
                <option value="Lagos">{OFFICES.Lagos.label}</option>
                <option value="Kwara">{OFFICES.Kwara.label}</option>
                <option value="Other">Other / custom address</option>
              </select>
            </div>
            {office === "Other" && (
              <div className="mt-4">
                <label className={labelCls}>Custom address</label>
                <input className={inputCls} value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} placeholder="e.g. customer's delivery address" />
              </div>
            )}
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
              <div className="mb-1 text-sm font-semibold text-slate-900">Bank details on receipt</div>
              <div className="font-medium">{SHOP.bankName}</div>
              <div>{SHOP.accountNumber}</div>
              <div className="uppercase">{SHOP.accountHolder}</div>
            </div>
          </div>
        </section>

        {error && (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
        )}
      </div>

      {/* Sticky generate bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Order total</div>
            <div className="text-lg font-bold text-slate-900">{formatNaira(total)}</div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-md bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:max-w-xs"
          >
            {saving ? "Saving…" : "Generate Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}
