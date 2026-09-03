import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listFolders, isCloudinaryConfigured } from "@/lib/cloudinary";
import FolderGrid from "./folder-grid";
import LogoutButton from "../logout-button";
import "../admin.css";

export const metadata: Metadata = {
  title: "Motion Graphics — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const configured = isCloudinaryConfigured();
  const folders = configured ? await listFolders() : [];

  return (
    <div className="admin-shell">
      <div className="admin-bg" aria-hidden="true" />

      <div className="admin-panel">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Motion Graphics</p>
            <h1>Folders</h1>
          </div>
          <LogoutButton />
        </header>

        {!configured ? (
          <p className="admin-warning">
            Cloudinary isn&rsquo;t configured yet — add the three env vars
            described in ADMIN_SETUP.md, then restart the dev server.
          </p>
        ) : (
          <FolderGrid folders={folders} />
        )}
      </div>
    </div>
  );
}
