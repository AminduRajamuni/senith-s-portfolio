import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";

/* ==========================================================================
   Optimistic auth gate for the admin section. Redirects unauthenticated
   visitors away from the dashboard, and already-authenticated visitors
   away from the login page. This is only the first line of defense —
   every mutating Server Action re-checks the session itself (see
   lib/admin-auth.ts#requireAdmin), since a matcher change here wouldn't
   otherwise be caught.
   ========================================================================== */

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isValidSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  if (pathname.startsWith("/admin/dashboard") && !authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/admin" && authenticated) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/dashboard/:path*"],
};
