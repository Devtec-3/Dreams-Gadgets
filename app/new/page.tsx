import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import NewReceiptForm from "./NewReceiptForm";

export const dynamic = "force-dynamic";

export default async function NewReceiptPage() {
  if (!(await isLoggedIn())) redirect("/login");
  return <NewReceiptForm />;
}
