import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/auth";
import HistoryList from "./HistoryList";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  if (!(await isLoggedIn())) redirect("/login");

  const receipts = await prisma.receipt.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      receiptNo: true,
      customerName: true,
      customerEmail: true,
      total: true,
      status: true,
      deliveryType: true,
      address: true,
      items: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Receipt History</h1>
          <div className="flex gap-2">
            <a href="/new" className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              New receipt
            </a>
            <a href="/settings" className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Settings
            </a>
            <form action="/api/logout" method="post">
              <button className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Logout
              </button>
            </form>
          </div>
        </div>

        <HistoryList
          initial={receipts.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
