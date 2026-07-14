import type { ApiErrorBody, ApiResponse } from "@/types/api";

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

function notify(error: ApiError) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wellstaq:api-error", { detail: error.message }));
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
}

function requestId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Request-Id", headers.get("X-Request-Id") ?? requestId());

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(path, {
      ...options,
      body,
      headers,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });

    if (response.status === 401 && !path.includes("/auth/") && !headers.has("X-Auth-Retry")) {
      const refresh = await fetch("/api/backend/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {"X-Request-Id": requestId()},
      });
      if (refresh.ok) {
        headers.set("X-Auth-Retry", "1");
        return request<T>(path, {...options, headers});
      }
    }

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const error = (typeof payload === "object" && payload ? payload : {}) as ApiErrorBody;
      throw new ApiError(
        error.message || `Request failed with status ${response.status}`,
        response.status,
        error.code,
        error.fieldErrors,
      );
    }

    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as ApiResponse<T>).data;
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      notify(error);
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      const apiError = new ApiError("The request timed out. Please try again.", 408, "REQUEST_TIMEOUT");
      notify(apiError);
      throw apiError;
    }
    const apiError = new ApiError("Unable to reach the service. Please check your connection.", 0, "NETWORK_ERROR");
    notify(apiError);
    throw apiError;
  } finally {
    clearTimeout(timeout);
  }
}
