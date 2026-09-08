import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getContactLinks, isCloudinaryConfigured } from "@/lib/cloudinary";
import ContactLinksForm from "./contact-links-form";
import LogoutButton from "../../logout-button";
import AdminSubnav from "../../subnav";
import "../../admin.css";

export const metadata: Metadata = {
  title: "Contact Links — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminContactPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const configured = isCloudinaryConfigured();
  const links = configured
    ? await getContactLinks()
    : { instagramUrl: "", linkedinUrl: "", email: "" };

  return (
    <div className="admin-shell">
      <div className="admin-bg" aria-hidden="true" />

      <div className="admin-panel">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Portfolio</p>
            <h1>Contact Links</h1>
          </div>
          <LogoutButton />
        </header>

        <AdminSubnav active="/admin/dashboard/contact" />

        {!configured ? (
          <p className="admin-warning">
            Cloudinary isn&rsquo;t configured yet — add the three env vars
            described in ADMIN_SETUP.md, then restart the dev server.
          </p>
        ) : (
          <>
            <p className="admin-empty">
              These power the highlighted Instagram, LinkedIn and email links
              in the Contact section at the bottom of the homepage. Leave any
              field blank to show that word as plain, non-clickable text.
            </p>
            <ContactLinksForm links={links} />
          </>
        )}
      </div>
    </div>
  );
}
