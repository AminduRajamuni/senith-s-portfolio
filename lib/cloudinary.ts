import "server-only";
import { v2 as cloudinary } from "cloudinary";

/* ==========================================================================
   Cloudinary — storage AND "database" for the motion graphics section.
   Rather than standing up a separate DB, folders map 1:1 to Cloudinary's
   own folder entities, and each video's title/description live as
   Cloudinary "context" metadata on the asset itself. One free service
   covers both jobs.

   Requires three env vars (see ADMIN_SETUP.md):
     CLOUDINARY_CLOUD_NAME
     CLOUDINARY_API_KEY
     CLOUDINARY_API_SECRET
   ========================================================================== */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Everything this feature touches lives under this root, namespaced away
    from anything else that might one day land in the same Cloudinary account. */
export const ROOT_FOLDER = "portfolio/motion-graphics";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/** Letters (incl. accented/unicode), numbers, spaces, hyphens, underscores
    only — notably no `/`, so a folder name can never escape ROOT_FOLDER. */
export function sanitizeFolderName(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > 60) return null;
  if (!/^[\p{L}\p{N} _-]+$/u.test(trimmed)) return null;
  return trimmed;
}

function folderPath(name: string): string {
  return `${ROOT_FOLDER}/${name}`;
}

export type FolderSummary = {
  name: string;
  path: string;
};

export async function listFolders(): Promise<FolderSummary[]> {
  try {
    const res = await cloudinary.api.sub_folders(ROOT_FOLDER);
    return (res.folders as { name: string; path: string }[])
      .map((f) => ({ name: f.name, path: f.path }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // Root folder doesn't exist yet (first-ever use) — treat as empty.
    return [];
  }
}

export async function createFolder(name: string): Promise<void> {
  await cloudinary.api.create_folder(folderPath(name));
}

export async function deleteFolder(name: string): Promise<void> {
  const path = folderPath(name);
  // Cloudinary refuses to delete a non-empty folder, so clear its assets first.
  try {
    await cloudinary.api.delete_resources_by_prefix(`${path}/`, {
      resource_type: "video",
    });
  } catch {
    // No assets to delete — fine.
  }
  await cloudinary.api.delete_folder(path);
}

export type VideoSummary = {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  createdAt: string;
};

function readContext(raw: unknown): { title?: string; description?: string } {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const custom = obj.custom && typeof obj.custom === "object" ? obj.custom : obj;
  const c = custom as Record<string, unknown>;
  return {
    title: typeof c.title === "string" ? c.title : undefined,
    description: typeof c.description === "string" ? c.description : undefined,
  };
}

export async function listVideos(folderName: string): Promise<VideoSummary[]> {
  const prefix = `${folderPath(folderName)}/`;
  try {
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type: "video",
      prefix,
      context: true,
      max_results: 500,
    });
    type Resource = {
      public_id: string;
      secure_url: string;
      created_at: string;
      context?: unknown;
    };
    return (res.resources as Resource[])
      .map((r) => {
        const { title, description } = readContext(r.context);
        return {
          publicId: r.public_id,
          url: r.secure_url,
          thumbnailUrl: cloudinary.url(r.public_id, {
            resource_type: "video",
            format: "jpg",
            secure: true,
            transformation: [{ width: 480, crop: "fill", start_offset: "0" }],
          }),
          title: title || "Untitled",
          description: description || "",
          createdAt: r.created_at,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function deleteVideo(publicId: string): Promise<void> {
  // Defense in depth: never allow deleting anything outside our root folder,
  // even though callers already scope by folder.
  if (!publicId.startsWith(`${ROOT_FOLDER}/`)) {
    throw new Error("Refusing to delete an asset outside the managed root.");
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
}

/** Cloudinary's `context` string format needs `\`, `=` and `|` escaped. */
function escapeContextValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/=/g, "\\=");
}

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  context: string;
  signature: string;
};

/** Signs the exact params the browser will POST straight to Cloudinary, so
    the API secret never has to leave the server and the video's bytes never
    have to pass through our own server (avoiding Server Action / hosting
    body-size limits entirely). */
export function signVideoUpload(
  folderName: string,
  title: string,
  description: string
): UploadSignature {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = folderPath(folderName);
  const context = `title=${escapeContextValue(title)}|description=${escapeContextValue(description)}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, context },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    timestamp,
    folder,
    context,
    signature,
  };
}

/* ==========================================================================
   Graphic Designs — a flat set of images (no folders), each with just a
   title. Same storage/"database" approach as the videos above: Cloudinary
   context metadata instead of a separate DB row.
   ========================================================================== */

export const GRAPHICS_ROOT = "portfolio/graphic-designs";

export type GraphicSummary = {
  publicId: string;
  url: string;
  title: string;
  createdAt: string;
};

export async function listGraphics(): Promise<GraphicSummary[]> {
  try {
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: `${GRAPHICS_ROOT}/`,
      context: true,
      max_results: 500,
    });
    type Resource = {
      public_id: string;
      secure_url: string;
      created_at: string;
      context?: unknown;
    };
    return (res.resources as Resource[])
      .map((r) => {
        const { title } = readContext(r.context);
        return {
          publicId: r.public_id,
          url: r.secure_url,
          title: title || "Untitled",
          createdAt: r.created_at,
        };
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

export async function deleteGraphic(publicId: string): Promise<void> {
  if (!publicId.startsWith(`${GRAPHICS_ROOT}/`)) {
    throw new Error("Refusing to delete an asset outside the managed root.");
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export function signGraphicUpload(title: string): UploadSignature {
  const timestamp = Math.floor(Date.now() / 1000);
  const context = `title=${escapeContextValue(title)}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: GRAPHICS_ROOT, context },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    timestamp,
    folder: GRAPHICS_ROOT,
    context,
    signature,
  };
}

/* ==========================================================================
   Reel Creations — a flat set of vertical video reels (no folders), each
   with just a title. Same storage/"database" approach as everything above:
   Cloudinary context metadata instead of a separate DB row, a signed
   direct-to-Cloudinary upload, and a thumbnail derived from the video
   itself for the grid preview.
   ========================================================================== */

export const REELS_ROOT = "portfolio/reel-creations";

export type ReelSummary = {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  createdAt: string;
};

export async function listReels(): Promise<ReelSummary[]> {
  try {
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type: "video",
      prefix: `${REELS_ROOT}/`,
      context: true,
      max_results: 500,
    });
    type Resource = {
      public_id: string;
      secure_url: string;
      created_at: string;
      context?: unknown;
    };
    return (res.resources as Resource[])
      .map((r) => {
        const { title } = readContext(r.context);
        return {
          publicId: r.public_id,
          url: r.secure_url,
          thumbnailUrl: cloudinary.url(r.public_id, {
            resource_type: "video",
            format: "jpg",
            secure: true,
            transformation: [{ width: 480, crop: "fill", start_offset: "0" }],
          }),
          title: title || "Untitled",
          createdAt: r.created_at,
        };
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

export async function deleteReel(publicId: string): Promise<void> {
  if (!publicId.startsWith(`${REELS_ROOT}/`)) {
    throw new Error("Refusing to delete an asset outside the managed root.");
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
}

export function signReelUpload(title: string): UploadSignature {
  const timestamp = Math.floor(Date.now() / 1000);
  const context = `title=${escapeContextValue(title)}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: REELS_ROOT, context },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    timestamp,
    folder: REELS_ROOT,
    context,
    signature,
  };
}

/* ==========================================================================
   3D Works — Bedroom Model video. Lives at a fixed public_id (it was a
   one-time upload via a now-removed admin page, not managed on an ongoing
   basis), read here and wired into the Bedroom Model's slide set in
   app/page.tsx / public/page3.js. Re-uploading would need restoring the
   signed-upload helper this used to pair with — see git history.
   ========================================================================== */

export const SHOWCASE_ROOT = "portfolio/3d-works";
export const BEDROOM_VIDEO_PUBLIC_ID = `${SHOWCASE_ROOT}/bedroom-video`;

export async function getBedroomVideoUrl(): Promise<string | null> {
  try {
    const res = await cloudinary.api.resource(BEDROOM_VIDEO_PUBLIC_ID, {
      resource_type: "video",
    });
    return (res as { secure_url: string }).secure_url;
  } catch {
    return null; // Nothing uploaded yet.
  }
}
