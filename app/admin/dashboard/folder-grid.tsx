"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  createFolderAction,
  deleteFolderAction,
  type FolderActionState,
} from "../actions";
import type { FolderSummary } from "@/lib/cloudinary";

export default function FolderGrid({ folders }: { folders: FolderSummary[] }) {
  const [creating, setCreating] = useState(false);
  const [state, formAction, pending] = useActionState<
    FolderActionState,
    FormData
  >(createFolderAction, undefined);

  const [isDeleting, startDelete] = useTransition();
  const [deletingName, setDeletingName] = useState<string | null>(null);

  function handleDelete(name: string) {
    if (
      !window.confirm(
        `Delete "${name}" and everything inside it? This can't be undone.`
      )
    ) {
      return;
    }
    setDeletingName(name);
    startDelete(async () => {
      await deleteFolderAction(name);
      setDeletingName(null);
    });
  }

  return (
    <>
      {folders.length === 0 ? (
        <p className="admin-empty">No folders yet — create one below.</p>
      ) : null}

      <div className="admin-folder-grid">
        {folders.map((folder) => (
          <div className="admin-folder-card" key={folder.path}>
            <Link
              href={`/admin/dashboard/${encodeURIComponent(folder.name)}`}
              className="admin-folder-link"
            >
              <span className="admin-folder-icon" aria-hidden="true">
                📁
              </span>
              <span className="admin-folder-name">{folder.name}</span>
            </Link>
            <button
              type="button"
              className="admin-folder-delete"
              onClick={() => handleDelete(folder.name)}
              disabled={isDeleting && deletingName === folder.name}
              aria-label={`Delete ${folder.name}`}
              title={`Delete ${folder.name}`}
            >
              {isDeleting && deletingName === folder.name ? "…" : "✕"}
            </button>
          </div>
        ))}

        {creating ? (
          <form
            action={formAction}
            className="admin-folder-card admin-folder-new-form"
          >
            <input
              name="name"
              placeholder="Folder name"
              autoFocus
              maxLength={60}
              className="admin-folder-new-input"
            />
            <div className="admin-folder-new-actions">
              <button type="submit" disabled={pending}>
                {pending ? "…" : "Create"}
              </button>
              <button type="button" onClick={() => setCreating(false)}>
                Cancel
              </button>
            </div>
            {state?.error ? (
              <p className="admin-folder-new-error">{state.error}</p>
            ) : null}
          </form>
        ) : (
          <button
            type="button"
            className="admin-folder-card admin-folder-add"
            onClick={() => setCreating(true)}
          >
            <span aria-hidden="true">+</span>
            <span>New folder</span>
          </button>
        )}
      </div>
    </>
  );
}
