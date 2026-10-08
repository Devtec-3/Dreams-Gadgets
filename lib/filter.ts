import { ReceiptItem } from "@/lib/format";

export interface ReceiptLike {
  receiptNo: string;
  customerName: string;
  customerEmail?: string | null;
  items: ReceiptItem[] | unknown;
  address?: string | null;
  deliveryType?: string;
  total?: number;
  status?: string;
  createdAt: string | Date;
}

export interface FilterState {
  q: string; // customer name / receipt no search
  location: string;
  device: string; // item category or name keyword
  month: string; // "YYYY-MM" or "" for all
  date: string; // "YYYY-MM-DD" or "" for all
}

export const emptyFilter: FilterState = { q: "", location: "", device: "", month: "", date: "" };

function receiptItems(r: ReceiptLike): ReceiptItem[] {
  return Array.isArray(r.items) ? (r.items as ReceiptItem[]) : [];
}

function matches(r: ReceiptLike, f: FilterState): boolean {
  // text search: customer name or receipt number
  if (f.q) {
    const hay = `${r.customerName} ${r.receiptNo}`.toLowerCase();
    if (!hay.includes(f.q.toLowerCase().trim())) return false;
  }
  // location: address or delivery type
  if (f.location) {
    const loc = `${r.address ?? ""} ${r.deliveryType ?? ""}`.toLowerCase();
    if (!loc.includes(f.location.toLowerCase().trim())) return false;
  }
  // device: any item's category, name or model
  if (f.device) {
    const dev = receiptItems(r)
      .map((it) => `${it.category ?? ""} ${it.name ?? ""} ${it.model ?? ""}`)
      .join(" ")
      .toLowerCase();
    if (!dev.includes(f.device.toLowerCase().trim())) return false;
  }
  // month filter: "YYYY-MM"
  if (f.month) {
    const d = new Date(r.createdAt);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (m !== f.month) return false;
  }
  // exact date filter
  if (f.date) {
    const d = new Date(r.createdAt);
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (day !== f.date) return false;
  }
  return true;
}

export function filterReceipts<T extends ReceiptLike>(receipts: T[], f: FilterState): T[] {
  return receipts.filter((r) => matches(r, f));
}

/** Get the device categories present in the data, for the dropdown */
export function uniqueDevices(receipts: ReceiptLike[]): string[] {
  const set = new Set<string>();
  for (const r of receipts) {
    for (const it of receiptItems(r)) {
      if (it.category) set.add(it.category);
      else if (it.name) set.add(it.name);
    }
  }
  return Array.from(set).sort();
}

/** Get the locations present in the data, for the dropdown */
export function uniqueLocations(receipts: ReceiptLike[]): string[] {
  const set = new Set<string>();
  for (const r of receipts) {
    if (r.address) set.add(r.address);
  }
  return Array.from(set).sort();
}
