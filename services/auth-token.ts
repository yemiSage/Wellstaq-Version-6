// path: services/auth-token.ts
const STORAGE_KEY = "wellstaq_auth";
const COOKIE_NAME = "wellstaq_access_token";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

let cachedTokens: AuthTokens | null = null;

function setCookie(accessToken: string) {
  if (typeof document === "undefined") return;
  // Not httpOnly (JS-set cookies can't be), just enough for middleware to
  // see "a token exists" and let the request through. Expires in 1 day —
  // adjust to match your actual access token lifetime.
  //TODO on the server side, change to httponly rather than local storagae for accest token
  document.cookie = `${COOKIE_NAME}=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
}

function clearCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function setAuthTokens(tokens: AuthTokens) {
  cachedTokens = tokens;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }
  setCookie(tokens.accessToken);
}

export function updateAccessToken(accessToken: string, tokenType: string) {
  const current = getAuthTokens();
  setAuthTokens({
    accessToken,
    tokenType,
    refreshToken: current?.refreshToken ?? "",
  });
}

export function getAuthTokens(): AuthTokens | null {
  if (cachedTokens) return cachedTokens;
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedTokens = JSON.parse(raw) as AuthTokens;
      return cachedTokens;
    }
  }
  return null;
}

export function clearAuthTokens() {
  cachedTokens = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  clearCookie();
}