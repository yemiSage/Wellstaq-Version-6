// path: components/providers/api-error-notifier.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";

interface ApiErrorDetail {
  message: string;
  status: number;
  code?: string;
}

export function ApiErrorNotifier() {
  useEffect(() => {
    const handleError = (event: Event) => {
      const detail = (event as CustomEvent<ApiErrorDetail>).detail;
      const message = detail?.message?.trim() || getUserErrorMessage(detail);
      toast.error(message, {
        id: `api-error:${detail?.status ?? "unknown"}:${detail?.code ?? message}`,
      });
    };
    window.addEventListener("wellstaq:api-error", handleError);
    return () => window.removeEventListener("wellstaq:api-error", handleError);
  }, []);

  return null;
}
