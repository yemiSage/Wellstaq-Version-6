import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const FORWARDED_RESPONSE_HEADERS = ["content-type", "cache-control", "etag"];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ message: "BACKEND_API_URL is not configured", code: "API_NOT_CONFIGURED" }, { status: 503 });
  }
  if (!ALLOWED_METHODS.has(request.method)) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }
  const origin = request.headers.get("origin");
  if (request.method !== "GET" && origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Cross-origin request blocked" }, { status: 403 });
  }

  const { path } = await context.params;
  if (!path.length || path.some((segment) => !/^[a-zA-Z0-9._~-]+$/.test(segment))) {
    return NextResponse.json({ message: "Invalid API path" }, { status: 400 });
  }

  const target = new URL(path.map(encodeURIComponent).join("/"), `${backendUrl.replace(/\/$/, "")}/`);
  const routePath = path.join("/");
  const publicRoutes = new Set(["v1/auth/otp", "v1/auth/otp/verify", "v1/auth/refresh", "v1/public/demo-requests"]);
  if (routePath === "v1/auth/refresh" && !request.cookies.has("wellstaq_refresh_token")) {
    return NextResponse.json({ message: "Session expired", code: "SESSION_EXPIRED" }, { status: 401 });
  }
  if (!publicRoutes.has(routePath) && !request.cookies.has("wellstaq_access_token")) {
    return NextResponse.json({ message: "Authentication required", code: "UNAUTHENTICATED" }, { status: 401 });
  }
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of ["accept", "content-type", "x-request-id", "user-agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const accessToken = request.cookies.get("wellstaq_access_token")?.value;
  const refreshTokenCookie = request.cookies.get("wellstaq_refresh_token")?.value;
  const token = routePath === "v1/auth/refresh" ? refreshTokenCookie : accessToken;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const body = request.method === "GET" ? undefined : await request.arrayBuffer();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    if (upstream.ok && (routePath === "v1/auth/otp/verify" || routePath === "v1/auth/refresh") && upstream.headers.get("content-type")?.includes("application/json")) {
      const payload = await upstream.json();
      const auth = payload?.data ?? payload;
      if (typeof auth?.accessToken === "string") {
        const { accessToken, refreshToken, ...safeAuth } = auth;
        const response = NextResponse.json({ data: safeAuth }, { status: upstream.status });
        response.cookies.set("wellstaq_access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: Number(auth.expiresIn) || 3_600,
        });
        if (typeof refreshToken === "string") {
          response.cookies.set("wellstaq_refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/backend/v1/auth",
            maxAge: 60 * 60 * 24 * 30,
          });
        }
        return response;
      }
    }
    const responseHeaders = new Headers();
    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    const response = new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
    if (routePath === "v1/auth/logout") {
      response.cookies.delete("wellstaq_access_token");
      response.cookies.delete("wellstaq_refresh_token");
    }
    return response;
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return NextResponse.json({
      message: timedOut ? "The upstream API timed out" : "The upstream API is unavailable",
      code: timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
    }, { status: timedOut ? 504 : 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
