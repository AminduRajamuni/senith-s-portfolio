import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  listVideos,
  sanitizeFolderName,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import FolderBrowser from "./folder-browser";
import "../../motion.css";
import "../mac.css";

type Params = { folder: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { folder: rawFolder } = await params;
  const folder = sanitizeFolderName(decodeURIComponent(rawFolder)) ?? "Folder";
  return {
    title: `${folder} — Motion Graphics — Kusal Senith`,
    description: `${folder} — motion graphics reel by Kusal Senith.`,
  };
}

export default async function MotionFolderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { folder: rawFolder } = await params;
  const folder = sanitizeFolderName(decodeURIComponent(rawFolder));
  if (!folder) notFound();

  const videos = isCloudinaryConfigured() ? await listVideos(folder) : [];

  return (
    <div className="mac-page">
      <div className="motion-bg" aria-hidden="true" />

      <div className="mac-toolbar">
        <div className="mac-traffic-lights" aria-hidden="true">
          <span className="mac-dot mac-dot-red" />
          <span className="mac-dot mac-dot-yellow" />
          <span className="mac-dot mac-dot-green" />
        </div>

        {/* A plain <a>, not next/link: the homepage's interactivity (hero
            intro, side-nav, .enter fade-ins) comes from plain <script>
            tags that only run once per real page load. Next's <Link> would
            remount "/" client-side without re-running them, leaving it
            stuck in its pre-JS state — see the back-navigation bug this
            fixed. A normal navigation reloads the page, so they fire fresh. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/#motion-graphics" className="mac-back">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="M15 5 L8 12 L15 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Motion Graphics
        </a>

        <h1 className="mac-title">{folder}</h1>

        <div className="mac-toolbar-spacer" aria-hidden="true" />
      </div>

      <FolderBrowser folder={folder} videos={videos} />

      <div className="mac-statusbar">
        {videos.length} {videos.length === 1 ? "item" : "items"}
      </div>
    </div>
  );
}
