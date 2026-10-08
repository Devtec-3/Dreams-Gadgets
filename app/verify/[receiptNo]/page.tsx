import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { ReceiptItem, SHOP } from "@/lib/format";
import ReceiptDocument from "@/components/ReceiptDocument";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ receiptNo: string }>;
}) {
  const { receiptNo } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { receiptNo: decodeURIComponent(receiptNo) },
  });

  if (!receipt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="text-5xl">❌</div>
          <h1 className="mt-4 text-xl font-bold text-red-600">Receipt Not Found</h1>
          <p className="mt-2 text-slate-600">
            No official receipt exists for this code. It may be fake — please contact {SHOP.name} directly.
          </p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qrDataUrl = await QRCode.toDataURL(`${baseUrl}/verify/${receipt.receiptNo}`, {
    width: 240,
    margin: 1,
  });

  return (
    <div className="min-h-screen bg-[#17181c] p-4 sm:p-6">
      <div className="mx-auto mb-4 max-w-[900px] rounded-lg border border-green-300 bg-green-50 p-4 text-center no-print">
        <span className="text-sm font-semibold text-green-800">✓ Verified — this is an authentic {SHOP.name} receipt</span>
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
      <div className="no-print mt-6 text-center text-sm text-slate-400">
        <Link href="/" className="underline">Go to receipt generator</Link>
      </div>
    </div>
  );
}
