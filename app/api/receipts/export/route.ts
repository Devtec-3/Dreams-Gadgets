import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/auth";
import { filterReceipts, FilterState, emptyFilter } from "@/lib/filter";
import { ReceiptItem, formatDate } from "@/lib/format";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  // Escape quotes and prevent CSV injection in Excel
  if (/^[=+\-@\t]/.test(s)) return `'${s.replace(/"/g, '""')}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const filter: FilterState = {
    ...emptyFilter,
    q: url.searchParams.get("q") ?? "",
    location: url.searchParams.get("location") ?? "",
    device: url.searchParams.get("device") ?? "",
    month: url.searchParams.get("month") ?? "",
    date: url.searchParams.get("date") ?? "",
  };

  const receipts = await prisma.receipt.findMany({ orderBy: { createdAt: "asc" } });
  const filtered = filterReceipts(
    receipts.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    filter
  );

  const rows: string[] = [];
  rows.push(
    [
      "Receipt No",
      "Date",
      "Customer",
      "Customer Email",
      "Device(s)",
      "IMEI(s)",
      "Location",
      "Delivery Type",
      "Status",
      "Total (NGN)",
    ]
      .map(csvCell)
      .join(",")
  );

  for (const r of filtered) {
    const items = (Array.isArray(r.items) ? r.items : []) as unknown as ReceiptItem[];
    rows.push(
      [
        r.receiptNo,
        formatDate(r.createdAt),
        r.customerName,
        r.customerEmail ?? "",
        items.map((it) => it.name).join("; "),
        items.map((it) => it.imei ?? "").join("; "),
        r.address ?? "",
        r.deliveryType,
        r.status,
        r.total.toFixed(2),
      ]
        .map(csvCell)
        .join(",")
    );
  }

  // BOM so Excel opens UTF-8 (₦ etc.) correctly
  const csv = "\uFEFF" + rows.join("\r\n");
  const monthPart = filter.month || "all";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="receipts-${monthPart}.csv"`,
    },
  });
}
