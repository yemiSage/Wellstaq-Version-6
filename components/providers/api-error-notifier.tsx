// path: components/providers/api-error-notifier.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface ApiErrorDetail {
  message: string;
  status: number;
  code?: string;
}

export function ApiErrorNotifier() {
  useEffect(() => {
    const handleError = (event: Event) => {
      const detail = (event as CustomEvent<ApiErrorDetail>).detail;
      toast.error(detail?.message || "Something went wrong. Please try again.");
    };
    window.addEventListener("wellstaq:api-error", handleError);
    return () => window.removeEventListener("wellstaq:api-error", handleError);
  }, []);

  return null;
}