import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  listVideos,
  sanitizeFolderName,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import VideoManager from "./video-manager";
import LogoutButton from "../../logout-button";
import "../../admin.css";

export const metadata: Metadata = {
  title: "Folder — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminFolderPage({
  params,
}: {
  params: Promise<{ folder: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { folder: rawFolder } = await params;
  const folder = sanitizeFolderName(decodeURIComponent(rawFolder));
  if (!folder) notFound();

  const configured = isCloudinaryConfigured();
  const videos = configured ? await listVideos(folder) : [];

  return (
    <div className="admin-shell">
      <div className="admin-bg" aria-hidden="true" />

      <div className="admin-panel">
        <header className="admin-header">
          <div>
            <Link href="/admin/dashboard" className="admin-back">
              ← Folders
            </Link>
            <h1>{folder}</h1>
          </div>
          <LogoutButton />
        </header>

        {!configured ? (
          <p className="admin-warning">
            Cloudinary isn&rsquo;t configured yet — add the three env vars
            described in ADMIN_SETUP.md, then restart the dev server.
          </p>
        ) : (
          <VideoManager folder={folder} videos={videos} />
        )}
      </div>
    </div>
  );
}
