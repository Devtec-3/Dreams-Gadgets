import { formatDate, formatNaira, ReceiptItem, SHOP } from "@/lib/format";

interface Props {
  receiptNo: string;
  customerName: string;
  status: string;
  createdAt: Date | string;
  items: ReceiptItem[];
  deliveryFee: number;
  discount: number;
  total: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  deliveryType: string;
  address?: string | null;
  qrDataUrl?: string | null;
}

const BLUE = "#2563eb";

function itemDetails(it: ReceiptItem): string[] {
  const lines: string[] = [];
  if (it.model) lines.push(`Model: ${it.model}`);
  if (it.grade) lines.push(`Grade: ${it.grade}`);
  if (it.imei) lines.push(`IMEI/Serial Number: ${it.imei}`);
  if (it.batteryHealth) lines.push(`Battery health: ${it.batteryHealth}`);
  if (it.carrier) lines.push(`Carrier: ${it.carrier}`);
  if (it.sim) lines.push(`SIM: ${it.sim}`);
  if (it.color) lines.push(`Color: ${it.color}`);
  if (it.storage) lines.push(`Storage: ${it.storage}`);
  return lines;
}

/* Box: white bg, thin blue-grey border, rounded */
const box = "rounded-xl border border-[#c9d8f5] bg-white p-5";
/* Row separator: dashed like the template */
const row = "border-b border-dashed border-[#c9d8f5] py-1.5";
const label = "text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function ReceiptDocument(p: Props) {
  const productsTotal = p.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

  return (
    <div className="receipt-doc mx-auto w-full max-w-[900px] bg-white px-8 py-9 text-[#111827] sm:px-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image.png"
            alt="Dreams Gadgets logo"
            className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
          />
          <div>
            <div className="text-2xl font-bold leading-tight text-[#1e2a3a]">{SHOP.name}</div>
            <div className="text-xl font-medium text-[#1e2a3a]">Receipt</div>
          </div>
        </div>
        <div className="border-l border-slate-300 pl-4 text-[13px] leading-7 text-slate-700 sm:text-sm">
          <div>+{SHOP.phone}</div>
          <div>{SHOP.email}</div>
        </div>
      </div>

      <div className="mt-4 h-[2px] w-full" style={{ background: BLUE }} />

      {/* Receipt info */}
      <div className={`mt-5 grid gap-4 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-[#dbe4f5] ${box}`}>
        <div className="sm:pr-6">
          <div className={label}>Receipt No.</div>
          <div className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: BLUE }}>
            {p.receiptNo}
          </div>
        </div>
        <div className="text-[13px] sm:pl-6 sm:text-sm">
          <div className={`flex items-center justify-between ${row}`}>
            <span className={label}>Date / Time</span>
            <span className="font-bold">{formatDate(p.createdAt)}</span>
          </div>
          <div className={`flex items-center justify-between ${row}`}>
            <span className={label}>Customer</span>
            <span className="font-bold uppercase">{p.customerName}</span>
          </div>
          <div className="flex items-center justify-between pt-1.5">
            <span className={label}>Status</span>
            <span className="font-semibold text-green-600">{p.status}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className={`mt-4 ${box}`}>
        <div className="mb-3 text-base font-bold uppercase tracking-wide" style={{ color: BLUE }}>
          Items
        </div>
        <table className="w-full text-[13px] sm:text-sm">
          <thead>
            <tr className="text-white" style={{ background: BLUE }}>
              <th className="rounded-l px-3 py-2.5 text-left font-semibold">Item</th>
              <th className="px-3 py-2.5 text-right font-semibold">Qty</th>
              <th className="px-3 py-2.5 text-right font-semibold">Unit Price</th>
              <th className="rounded-r px-3 py-2.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {p.items.map((it, i) => {
              const details = itemDetails(it);
              return (
                <tr key={i} className="align-top">
                  <td className="border-b border-dashed border-[#dbe4f5] px-3 py-3.5">
                    <div className="font-bold">{it.name}</div>
                    {(it.category || it.condition) && (
                      <div className="mt-0.5 text-[13px] font-medium text-slate-600">
                        {it.category}
                        {it.category && it.condition ? " • " : ""}
                        {it.condition}
                      </div>
                    )}
                    {details.length > 0 && (
                      <div className="mt-1.5 space-y-0.5 text-xs font-medium text-slate-600">
                        {details.map((d, j) => (
                          <div key={j}>{d}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="border-b border-dashed border-[#dbe4f5] px-3 py-3.5 text-right">{it.qty}</td>
                  <td className="border-b border-dashed border-[#dbe4f5] px-3 py-3.5 text-right font-semibold">
                    {formatNaira(it.unitPrice)}
                  </td>
                  <td className="border-b border-dashed border-[#dbe4f5] px-3 py-3.5 text-right font-semibold">
                    {formatNaira(it.qty * it.unitPrice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paid to */}
      <div className={`mt-4 grid gap-4 sm:grid-cols-[1fr_2fr] sm:gap-0 sm:divide-x sm:divide-[#dbe4f5] ${box}`}>
        <div className="sm:pr-6">
          <div className="text-base font-bold uppercase tracking-wide" style={{ color: BLUE }}>
            Paid To
          </div>
          <p className="mt-2.5 text-sm leading-6">
            Payment received. No further
            <br />
            action is required.
          </p>
        </div>
        <div className="text-[13px] sm:pl-6 sm:text-sm">
          <div className={`flex justify-between ${row}`}>
            <span className="font-semibold">Bank</span>
            <span className="font-bold">{p.bankName}</span>
          </div>
          <div className={`flex justify-between ${row}`}>
            <span className="font-semibold">Account number</span>
            <span className="font-bold">{p.accountNumber}</span>
          </div>
          <div className="flex justify-between pt-1.5">
            <span className="font-semibold">Account name</span>
            <span className="font-bold uppercase">{p.accountName}</span>
          </div>
        </div>
      </div>

      {/* Payment summary */}
      <div className={`mt-4 grid gap-4 sm:grid-cols-[1fr_2fr] sm:gap-0 sm:divide-x sm:divide-[#dbe4f5] ${box}`}>
        <div className="sm:pr-6">
          <div className="text-base font-bold uppercase tracking-wide" style={{ color: BLUE }}>
            Payment Summary
          </div>
          <p className="mt-2.5 text-sm leading-6">
            Thank you for your order.
            <br />
            Here is a summary of your
            <br />
            purchase.
          </p>
        </div>
        <div className="text-[13px] sm:pl-6 sm:text-sm">
          <div className={`flex justify-between ${row}`}>
            <span className="font-semibold">Products total</span>
            <span className="font-semibold">{formatNaira(productsTotal)}</span>
          </div>
          <div className={`flex justify-between ${row}`}>
            <span className="font-semibold">Delivery fee</span>
            <span className="font-semibold">{formatNaira(p.deliveryFee)}</span>
          </div>
          <div className={`flex justify-between ${row}`}>
            <span className="font-semibold">Discount</span>
            <span className="font-semibold text-green-600">-{formatNaira(p.discount)}</span>
          </div>
          <div className="flex justify-between pt-2.5" style={{ color: BLUE }}>
            <span className="text-base font-semibold uppercase">Order Total</span>
            <span className="text-xl font-bold sm:text-2xl">{formatNaira(p.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className={`mt-4 ${box}`}>
        <div className="mb-2.5 text-base font-bold uppercase tracking-wide" style={{ color: BLUE }}>
          Delivery
        </div>
        <div className="text-[13px] sm:text-sm">
          <div className={`flex ${row}`}>
            <span className="w-40 font-bold">Delivery</span>
            <span className="font-bold">{p.deliveryType}</span>
          </div>
          {p.address && (
            <div className="flex pt-1.5">
              <span className="w-40 font-bold">Address</span>
              <span className="font-bold">{p.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* QR + footer */}
      <div className="mt-9 text-center">
        {p.qrDataUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.qrDataUrl}
              alt="Verification QR code"
              className="mx-auto h-24 w-24 rounded-lg border border-slate-200 bg-white p-1.5"
            />
            <div className="mt-2 text-[13px] font-semibold text-slate-700">Scan to verify authenticity</div>
          </>
        )}
        <div className="mt-2 text-[15px] font-bold">
          Thank you. This is your official receipt from {SHOP.name}.
        </div>
      </div>
    </div>
  );
}
