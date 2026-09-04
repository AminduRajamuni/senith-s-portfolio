"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  requestReelUploadSignature,
  finalizeReelUpload,
  deleteReelAction,
} from "../../actions";
import type { ReelSummary } from "@/lib/cloudinary";

export default function ReelGrid({ reels }: { reels: ReelSummary[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Choose a video file first.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const sig = await requestReelUploadSignature(title);
      if ("error" in sig) {
        setError(sig.error);
        return;
      }

      // Straight from the browser to Cloudinary — same reasoning as the
      // other uploads: no Server Action body-size limit to run into.
      const body = new FormData();
      body.set("file", file);
      body.set("api_key", sig.apiKey);
      body.set("timestamp", String(sig.timestamp));
      body.set("signature", sig.signature);
      body.set("folder", sig.folder);
      body.set("context", sig.context);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`
        );
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("Upload failed — check the file and try again."));
        };
        xhr.onerror = () =>
          reject(new Error("Upload failed — check your connection."));
        xhr.send(body);
      });

      await finalizeReelUpload();

      setTitle("");
      setFile(null);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function handleDelete(publicId: string) {
    if (!window.confirm("Delete this reel? This can't be undone.")) return;
    setDeletingId(publicId);
    try {
      await deleteReelAction(publicId);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        className="admin-upload-form"
        onSubmit={handleUpload}
      >
        <div className="admin-upload-row">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
            className="admin-upload-file"
          />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            maxLength={200}
            className="admin-upload-title"
          />
        </div>
        <div className="admin-upload-row admin-upload-actions">
          <button type="submit" disabled={uploading}>
            {uploading ? `Uploading… ${progress}%` : "Add reel"}
          </button>
          {error ? <p className="admin-upload-error">{error}</p> : null}
        </div>
        {uploading ? (
          <div className="admin-upload-bar" aria-hidden="true">
            <div
              className="admin-upload-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </form>

      {reels.length === 0 ? (
        <p className="admin-empty">No reels yet.</p>
      ) : (
        <div className="admin-video-grid admin-reel-grid">
          {reels.map((reel) => (
            <div className="admin-video-card" key={reel.publicId}>
              <video
                className="admin-video-preview admin-reel-preview"
                src={reel.url}
                poster={reel.thumbnailUrl}
                controls
                preload="metadata"
              />
              <div className="admin-video-info">
                <p className="admin-video-title">{reel.title}</p>
              </div>
              <button
                type="button"
                className="admin-video-delete"
                onClick={() => handleDelete(reel.publicId)}
                disabled={deletingId === reel.publicId}
              >
                {deletingId === reel.publicId ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
