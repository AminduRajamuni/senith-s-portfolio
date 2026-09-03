"use client";

import { useTransition } from "react";
import { logout } from "./actions";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="admin-logout"
      disabled={pending}
      onClick={() => startTransition(() => logout())}
    >
      {pending ? "…" : "Log out"}
    </button>
  );
}
