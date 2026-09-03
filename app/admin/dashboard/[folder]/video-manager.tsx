"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  requestUploadSignature,
  finalizeUpload,
  deleteVideoAction,
} from "../../actions";
import type { VideoSummary } from "@/lib/cloudinary";

export default function VideoManager({
  folder,
  videos,
}: {
  folder: string;
  videos: VideoSummary[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      const sig = await requestUploadSignature(folder, title, description);
      if ("error" in sig) {
        setError(sig.error);
        return;
      }

      // Straight from the browser to Cloudinary — the file's bytes never
      // touch our own server, so there's no Server Action body-size limit
      // or hosting payload cap to run into.
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

      await finalizeUpload(folder);

      setTitle("");
      setDescription("");
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
    if (!window.confirm("Delete this video? This can't be undone.")) return;
    setDeletingId(publicId);
    try {
      await deleteVideoAction(folder, publicId);
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
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          maxLength={2000}
          rows={2}
          className="admin-upload-description"
        />
        <div className="admin-upload-row admin-upload-actions">
          <button type="submit" disabled={uploading}>
            {uploading ? `Uploading… ${progress}%` : "Add video"}
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

      {videos.length === 0 ? (
        <p className="admin-empty">No videos in this folder yet.</p>
      ) : (
        <div className="admin-video-grid">
          {videos.map((video) => (
            <div className="admin-video-card" key={video.publicId}>
              <video
                className="admin-video-preview"
                src={video.url}
                poster={video.thumbnailUrl}
                controls
                preload="metadata"
              />
              <div className="admin-video-info">
                <p className="admin-video-title">{video.title}</p>
                {video.description ? (
                  <p className="admin-video-description">
                    {video.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="admin-video-delete"
                onClick={() => handleDelete(video.publicId)}
                disabled={deletingId === video.publicId}
              >
                {deletingId === video.publicId ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
