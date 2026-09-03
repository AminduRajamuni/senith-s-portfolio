"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  // `state` gets a fresh object identity on every completed submission, so
  // this advances even when the same error message repeats back to back.
  // Calling setState conditionally during render (comparing against a
  // value stored from the previous render) is the documented way to derive
  // this without an Effect — see
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders.
  const [prevState, setPrevState] = useState(state);
  const [shakeKey, setShakeKey] = useState(0);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.error) setShakeKey((k) => k + 1);
  }

  return (
    <form action={formAction} className="admin-login-card" key={shakeKey}>
      <img
        src="/assets/kusal.png"
        alt=""
        className="admin-login-mark"
        draggable={false}
      />

      <label htmlFor="admin-password" className="sr-only">
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        placeholder="••••••••"
        autoFocus
        autoComplete="current-password"
        className="admin-login-input"
      />

      <button
        type="submit"
        className="admin-login-submit"
        disabled={pending}
        aria-label="Enter"
      >
        {pending ? "…" : "→"}
      </button>

      {state?.error ? (
        <p className="admin-login-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
