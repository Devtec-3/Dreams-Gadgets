import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/lib/auth";
import { generateReceiptNo, ReceiptItem } from "@/lib/format";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const items: ReceiptItem[] = (body.items ?? []).filter(
      (it: ReceiptItem) => it.name && it.qty > 0
    );
    if (items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }
    const deliveryFee = Number(body.deliveryFee) || 0;
    const discount = Number(body.discount) || 0;
    const productsTotal = items.reduce((s, it) => s + it.qty * Number(it.unitPrice), 0);
    const total = productsTotal + deliveryFee - discount;

    const receipt = await prisma.receipt.create({
      data: {
        receiptNo: generateReceiptNo(),
        customerName: String(body.customerName ?? "").trim(),
        customerEmail: body.customerEmail ? String(body.customerEmail).trim() : null,
        status: String(body.status ?? "Paid"),
        items: items as unknown as Prisma.InputJsonValue,
        deliveryFee,
        discount,
        total,
        bankName: String(body.bankName ?? "Moniepoint"),
        accountNumber: String(body.accountNumber ?? "5663112025"),
        accountName: String(body.accountName ?? "Aremu Abdulwaris Olafimihan"),
        deliveryType: String(body.deliveryType ?? "Pickup"),
        address: body.address ? String(body.address).trim() : null,
      },
    });
    return NextResponse.json({ id: receipt.id, receiptNo: receipt.receiptNo });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save receipt" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const receipts = await prisma.receipt.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, receiptNo: true, customerName: true, total: true, status: true, createdAt: true },
  });
  return NextResponse.json(receipts);
}
