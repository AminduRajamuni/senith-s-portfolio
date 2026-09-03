import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import LoginForm from "./login-form";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — Kusal Senith",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Proxy already redirects an authenticated visitor away from /admin, but
  // it only does the optimistic cookie check — this covers the rest.
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-bg" aria-hidden="true" />
      <LoginForm />
    </div>
  );
}
