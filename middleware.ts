import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "api") return NextResponse.next();
  if (request.cookies.has("wellstaq_access_token")) return NextResponse.next();

  const login = new URL("/onboarding", request.url);
  login.searchParams.set("returnTo", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
