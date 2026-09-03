import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* ==========================================================================
   Admin auth — a single hardcoded password, no user accounts. This is a
   personal portfolio admin panel, not a multi-tenant app, so a lightweight
   signed cookie is enough: on successful login we hand back a token that's
   just a fixed value plus an HMAC of it, so it can't be forged without the
   secret below, but there's no session store to manage.

   Both the password and the signing secret are intentionally hardcoded
   (per request) rather than pulled from environment variables. If this
   repo is ever made public, change both.
   ========================================================================== */

const ADMIN_PASSWORD = "KusalPonzi123";
const SESSION_SECRET = "kz-admin-2025-9f3c1a7b-session-secret";

export const SESSION_COOKIE = "kz_admin_session";

const SESSION_VALUE = "authenticated";

function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(password: string): boolean {
  return timingSafeStringEqual(password, ADMIN_PASSWORD);
}

/** Value to store in the `kz_admin_session` cookie after a successful login. */
export function issueSessionToken(): string {
  return `${SESSION_VALUE}.${sign(SESSION_VALUE)}`;
}

/** Verifies a cookie value came from `issueSessionToken()` and wasn't tampered with. */
export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const value = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (value !== SESSION_VALUE) return false;
  return timingSafeStringEqual(signature, sign(value));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Throws if called by anyone without a valid admin session. Every Server
    Action that mutates data calls this itself — Proxy protects the pages,
    but Proxy coverage can silently drop on a route/matcher refactor, so the
    action is the real security boundary, not just a convenience check. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}
