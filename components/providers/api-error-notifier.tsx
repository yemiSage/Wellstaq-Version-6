"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ApiErrorNotifier() {
  useEffect(() => {
    const handleError = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      toast.error(message || "Something went wrong. Please try again.");
    };
    window.addEventListener("wellstaq:api-error", handleError);
    return () => window.removeEventListener("wellstaq:api-error", handleError);
  }, []);

  return null;
}
