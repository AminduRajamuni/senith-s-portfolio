"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  issueSessionToken,
  verifyPassword,
  requireAdmin,
} from "@/lib/admin-auth";
import {
  createFolder as createFolderInCloudinary,
  deleteFolder as deleteFolderInCloudinary,
  deleteVideo as deleteVideoInCloudinary,
  sanitizeFolderName,
  signVideoUpload,
  isCloudinaryConfigured,
  type UploadSignature,
} from "@/lib/cloudinary";

/* ---------------------------------------------------------------- */
/* Login / logout                                                     */
/* ---------------------------------------------------------------- */

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!verifyPassword(password)) {
    return { error: "Wrong password." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, issueSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin/dashboard");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin");
}

/* ---------------------------------------------------------------- */
/* Folders                                                             */
/* ---------------------------------------------------------------- */

export type FolderActionState = { error?: string } | undefined;

export async function createFolderAction(
  _prevState: FolderActionState,
  formData: FormData
): Promise<FolderActionState> {
  await requireAdmin();

  const name = sanitizeFolderName(String(formData.get("name") ?? ""));
  if (!name) {
    return { error: "Use letters, numbers, spaces, - or _ (max 60 chars)." };
  }

  try {
    await createFolderInCloudinary(name);
  } catch {
    return { error: "Couldn't create that folder — try a different name." };
  }

  revalidatePath("/admin/dashboard");
  // The public Motion Graphics page (app/page.tsx) lists these same folders.
  revalidatePath("/");
}

export async function deleteFolderAction(name: string): Promise<void> {
  await requireAdmin();
  const safe = sanitizeFolderName(name);
  if (!safe) return;
  await deleteFolderInCloudinary(safe);
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

/* ---------------------------------------------------------------- */
/* Videos — the file itself uploads straight from the browser to      */
/* Cloudinary (see video-manager.tsx); these actions only hand out a  */
/* short-lived signature beforehand and revalidate the cache after.   */
/* ---------------------------------------------------------------- */

export async function requestUploadSignature(
  folder: string,
  title: string,
  description: string
): Promise<UploadSignature | { error: string }> {
  await requireAdmin();

  if (!isCloudinaryConfigured()) {
    return { error: "Cloudinary isn't configured yet — see ADMIN_SETUP.md." };
  }

  const safeFolder = sanitizeFolderName(folder);
  if (!safeFolder) return { error: "Invalid folder." };

  const trimmedTitle = title.trim().slice(0, 200);
  if (!trimmedTitle) return { error: "Title is required." };

  return signVideoUpload(
    safeFolder,
    trimmedTitle,
    description.trim().slice(0, 2000)
  );
}

export async function finalizeUpload(folder: string): Promise<void> {
  await requireAdmin();
  revalidatePath(`/admin/dashboard/${encodeURIComponent(folder)}`);
}

export async function deleteVideoAction(
  folder: string,
  publicId: string
): Promise<void> {
  await requireAdmin();
  await deleteVideoInCloudinary(publicId);
  revalidatePath(`/admin/dashboard/${encodeURIComponent(folder)}`);
}
