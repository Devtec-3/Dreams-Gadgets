import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!(await isLoggedIn())) redirect("/login");
  return <SettingsForm />;
}
