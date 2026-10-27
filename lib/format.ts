import { randomBytes } from "crypto";

export const NARIAN = "₦";

export function formatNaira(amount: number): string {
  return (
    NARIAN +
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function generateReceiptNo(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = randomBytes(4).toString("hex").toUpperCase(); // 8 hex chars
  return `ORD-${y}${m}${d}-${rand}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export interface ReceiptItem {
  name: string;
  category?: string;
  condition?: string;
  model?: string;
  grade?: string;
  imei?: string;
  batteryHealth?: string;
  carrier?: string;
  sim?: string;
  color?: string;
  storage?: string;
  qty: number;
  unitPrice: number;
}

// Offices selectable on the "New Receipt" form (printed in the Delivery box)
export const OFFICES: Record<"Lagos" | "Kwara", { label: string; address: string }> = {
  Lagos: {
    label: "Lagos office (Ikeja)",
    address: "Shop S25, Tairas Plaza, Oshitelu Street, Computer Village, Ikeja, Lagos",
  },
  Kwara: {
    label: "Kwara office (Ilorin)",
    address: "Shop 85, Computer Village Phase 2, Matanmi Complex, Challenge, Ilorin",
  },
};

export const SHOP = {
  name: "Dreams Gadgets",
  tagline: "…Smart gadgets for smarter living",
  email: "gadgetdreams2@gmail.com",
  phone: "07062390539",
  bankName: "Moniepoint",
  accountNumber: "5663112025",
  accountHolder: "Aremu Abdulwaris Olafimihan",
};
