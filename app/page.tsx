import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default async function Home() {
  if (!(await isLoggedIn())) redirect("/login");
  redirect("/new");
}
