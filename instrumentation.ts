export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  const appUrl = process.env.APP_URL;
  const isLocalPreview =
    process.env.ALLOW_LOCAL_MOCK_PREVIEW === "true" &&
    appUrl !== undefined &&
    ["localhost", "127.0.0.1"].includes(new URL(appUrl).hostname);

  if (isLocalPreview) return;

  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "api") {
    throw new Error("Production requires NEXT_PUBLIC_DATA_SOURCE=api");
  }

  for (const name of ["BACKEND_API_URL", "GEMINI_API_KEY", "GEMINI_MODEL", "APP_URL"] as const) {
    if (!process.env[name]) throw new Error(`Production requires ${name}`);
  }

  for (const name of ["BACKEND_API_URL", "APP_URL"] as const) {
    const url = new URL(process.env[name]!);
    if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS in production`);
  }
}
