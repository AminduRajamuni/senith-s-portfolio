import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listGraphics, isCloudinaryConfigured } from "@/lib/cloudinary";
import GraphicGrid from "./graphic-grid";
import LogoutButton from "../../logout-button";
import AdminSubnav from "../../subnav";
import "../../admin.css";

export const metadata: Metadata = {
  title: "Graphic Designs — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGraphicDesignsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const configured = isCloudinaryConfigured();
  const graphics = configured ? await listGraphics() : [];

  return (
    <div className="admin-shell">
      <div className="admin-bg" aria-hidden="true" />

      <div className="admin-panel">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Portfolio</p>
            <h1>Graphic Designs</h1>
          </div>
          <LogoutButton />
        </header>

        <AdminSubnav active="/admin/dashboard/graphic-designs" />

        {!configured ? (
          <p className="admin-warning">
            Cloudinary isn&rsquo;t configured yet — add the three env vars
            described in ADMIN_SETUP.md, then restart the dev server.
          </p>
        ) : (
          <GraphicGrid graphics={graphics} />
        )}
      </div>
    </div>
  );
}
