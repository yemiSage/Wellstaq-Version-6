// path: services/http.ts
import type { ApiErrorBody, ApiResponse, FastApiValidationItem } from "@/types/api";
import { getAuthTokens, updateAccessToken, clearAuthTokens } from "@/services/auth-token";
import { backendPath } from "@/services/config";
import { permissionDeniedMessage, permissionFromError } from "@/lib/permissions";

const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function extractFieldErrors(body: ApiErrorBody): Record<string, string[]> | undefined {
  if (!Array.isArray(body.detail)) return undefined;
  const fieldErrors: Record<string, string[]> = {};
  for (const item of body.detail as FastApiValidationItem[]) {
    if (!item || !Array.isArray(item.loc)) continue;
    const parts = item.loc.filter((p) => p !== "body" && p !== "query" && p !== "path");
    const field = String(parts[parts.length - 1] ?? "form");
    (fieldErrors[field] ??= []).push(item.msg);
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

function extractMessage(body: ApiErrorBody, status: number): string {
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail.length > 0) {
    return (body.detail[0] as FastApiValidationItem).msg || `Request failed with status ${status}`;
  }
  return body.message || `Request failed with status ${status}`;
}

function toFriendlyMessage(status: number, code: string | undefined, backendMessage: string): string {
  const knownCodes: Record<string, string> = {
    REQUEST_TIMEOUT: "That took too long to respond. Please try again.",
    NETWORK_ERROR: "We couldn't connect. Check your internet connection and try again.",
  };
  if (code && knownCodes[code]) return knownCodes[code];

  if (status === 403) {
    const permission = permissionFromError(backendMessage);
    return permission ? permissionDeniedMessage(permission) : "You don't have permission to perform this action.";
  }

  const byStatus: Record<number, string> = {
    401: "Your session has expired. Please sign in again.",
    404: "We couldn't find what you were looking for.",
    409: "That already exists — try a different value.",
    429: "You're doing that a bit too fast. Please wait a moment and try again.",
    500: "Something went wrong on our end. Please try again in a moment.",
    503: "The service is temporarily unavailable. Please try again shortly.",
  };
  if (byStatus[status]) return byStatus[status];

  if (backendMessage && /[.!?]\s*$/.test(backendMessage.trim())) return backendMessage;
  return "Something went wrong. Please try again.";
}

function notify(error: ApiError) {
  if (error.fieldErrors) return;
  if (typeof window !== "undefined") {
    const friendlyMessage = toFriendlyMessage(error.status, error.code, error.message);
    window.dispatchEvent(
      new CustomEvent("wellstaq:api-error", {
        detail: { message: friendlyMessage, status: error.status, code: error.code },
      }),
    );
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
  suppressErrorNotification?: boolean;
}

function requestId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof File);
}

function toSnakeCase(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(toSnakeCase);
  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        toSnakeCase(value),
      ]),
    );
  }
  return input;
}

function toCamelCase(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(toCamelCase);
  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase()),
        toCamelCase(value),
      ]),
    );
  }
  return input;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    body: requestBody,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    suppressErrorNotification = false,
    ...fetchOptions
  } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(fetchOptions.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Request-Id", headers.get("X-Request-Id") ?? requestId());

  const tokens = getAuthTokens();
  const method = (fetchOptions.method ?? "GET").toUpperCase();
  if (tokens?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `${tokens.tokenType || "Bearer"} ${tokens.accessToken}`);
  }

  let body: BodyInit | undefined;
  if (requestBody instanceof FormData) {
    body = requestBody;
  } else if (requestBody !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(toSnakeCase(requestBody));
  }

  try {
    const response = await fetch(path, {
      ...fetchOptions,
      body,
      headers,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });

    if (response.status === 401 && !path.includes("/auth/") && !headers.has("X-Auth-Retry")) {
      const currentTokens = getAuthTokens();
      if (currentTokens?.refreshToken) {
        const refreshResponse = await fetch(backendPath("/auth/refresh"), {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Request-Id": requestId() },
          body: JSON.stringify({ refresh_token: currentTokens.refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshed = await refreshResponse.json();
          updateAccessToken(refreshed.access_token, refreshed.token_type);
          headers.set("Authorization", `${refreshed.token_type} ${refreshed.access_token}`);
          headers.set("X-Auth-Retry", "1");
          return request<T>(path, { ...options, headers });
        }

        clearAuthTokens();
        if (typeof window !== "undefined") {
          window.location.assign("/login?error=session_revoked");
        }
      }
    }

    const contentType = response.headers.get("content-type") ?? "";
    const rawPayload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const payload = contentType.includes("application/json") ? toCamelCase(rawPayload) : rawPayload;

    if (!response.ok) {
      const errorBody = (typeof payload === "object" && payload ? payload : {}) as ApiErrorBody;
      throw new ApiError(
        extractMessage(errorBody, response.status),
        response.status,
        errorBody.code,
        extractFieldErrors(errorBody),
      );
    }

    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as ApiResponse<T>).data;
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      // Read permissions are rendered in the relevant card/page section. Keep
      // global notifications for user-triggered mutations only.
      if (!suppressErrorNotification && !(error.status === 403 && (method === "GET" || method === "HEAD"))) {
        notify(error);
      }
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      const apiError = new ApiError("The request timed out. Please try again.", 408, "REQUEST_TIMEOUT");
      if (!suppressErrorNotification) notify(apiError);
      throw apiError;
    }
    const apiError = new ApiError("Unable to reach the service. Please check your connection.", 0, "NETWORK_ERROR");
    if (!suppressErrorNotification) notify(apiError);
    throw apiError;
  } finally {
    clearTimeout(timeout);
  }
}
