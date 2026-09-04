import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listReels, isCloudinaryConfigured } from "@/lib/cloudinary";
import ReelGrid from "./reel-grid";
import LogoutButton from "../../logout-button";
import AdminSubnav from "../../subnav";
import "../../admin.css";

export const metadata: Metadata = {
  title: "Reel Creations — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReelCreationsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const configured = isCloudinaryConfigured();
  const reels = configured ? await listReels() : [];

  return (
    <div className="admin-shell">
      <div className="admin-bg" aria-hidden="true" />

      <div className="admin-panel">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Portfolio</p>
            <h1>Reel Creations</h1>
          </div>
          <LogoutButton />
        </header>

        <AdminSubnav active="/admin/dashboard/reel-creations" />

        {!configured ? (
          <p className="admin-warning">
            Cloudinary isn&rsquo;t configured yet — add the three env vars
            described in ADMIN_SETUP.md, then restart the dev server.
          </p>
        ) : (
          <ReelGrid reels={reels} />
        )}
      </div>
    </div>
  );
}
