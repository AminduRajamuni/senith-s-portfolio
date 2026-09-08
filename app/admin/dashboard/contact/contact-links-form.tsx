"use client";

import { useActionState, useEffect, useState } from "react";
import {
  saveContactLinksAction,
  type ContactLinksActionState,
} from "../../actions";
import type { ContactLinks } from "@/lib/cloudinary";

export default function ContactLinksForm({ links }: { links: ContactLinks }) {
  const [state, formAction, pending] = useActionState<
    ContactLinksActionState,
    FormData
  >(saveContactLinksAction, undefined);

  // "Saved" confirmation fades after a bit rather than sitting there forever.
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (!state?.saved) return;
    setShowSaved(true);
    const t = window.setTimeout(() => setShowSaved(false), 2500);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <form action={formAction} className="admin-upload-form admin-contact-form">
      <label className="admin-contact-field">
        <span>Instagram URL</span>
        <input
          type="url"
          name="instagramUrl"
          placeholder="https://instagram.com/yourhandle"
          defaultValue={links.instagramUrl}
          disabled={pending}
          className="admin-upload-title"
        />
      </label>

      <label className="admin-contact-field">
        <span>LinkedIn URL</span>
        <input
          type="url"
          name="linkedinUrl"
          placeholder="https://linkedin.com/in/yourname"
          defaultValue={links.linkedinUrl}
          disabled={pending}
          className="admin-upload-title"
        />
      </label>

      <label className="admin-contact-field">
        <span>Email address</span>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          defaultValue={links.email}
          disabled={pending}
          className="admin-upload-title"
        />
      </label>

      <div className="admin-upload-row admin-upload-actions">
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save links"}
        </button>
        {state?.error ? (
          <p className="admin-upload-error">{state.error}</p>
        ) : showSaved ? (
          <p className="admin-contact-saved">Saved.</p>
        ) : null}
      </div>
    </form>
  );
}
