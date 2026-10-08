import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/auth";
import { ReceiptItem } from "@/lib/format";
import ReceiptDocument from "@/components/ReceiptDocument";
import PrintButton from "@/components/PrintButton";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/login");
  const { id } = await params;

  const receipt = await prisma.receipt.findUnique({ where: { id } });
  if (!receipt) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify/${receipt.receiptNo}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 240, margin: 1 });

  return (
    <div className="min-h-screen bg-[#17181c] p-4 sm:p-6">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-between gap-3">
        <a href="/new" className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← New receipt
        </a>
        <div className="flex gap-2">
          <a href="/receipts" className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            History
          </a>
          <PrintButton />
        </div>
      </div>
      <div className="shadow-lg">
        <ReceiptDocument
          receiptNo={receipt.receiptNo}
          customerName={receipt.customerName}
          status={receipt.status}
          createdAt={receipt.createdAt}
          items={receipt.items as unknown as ReceiptItem[]}
          deliveryFee={receipt.deliveryFee}
          discount={receipt.discount}
          total={receipt.total}
          bankName={receipt.bankName}
          accountNumber={receipt.accountNumber}
          accountName={receipt.accountName}
          deliveryType={receipt.deliveryType}
          address={receipt.address}
          qrDataUrl={qrDataUrl}
        />
      </div>
    </div>
  );
}
