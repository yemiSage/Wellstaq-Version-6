// path: middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "api") return NextResponse.next();

  const isAuthenticated = request.cookies.has("wellstaq_access_token");
  const { pathname } = request.nextUrl;

  // Authenticated users shouldn't see the login/onboarding screens —
  // send them straight to the dashboard, before any page renders.
  if (isAuthenticated && (pathname === "/login" || pathname.startsWith("/onboarding"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users can't reach protected dashboard routes.
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/onboarding/:path*"],
};