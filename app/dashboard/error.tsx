"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Dashboard page error:", error);
  }, [error]);

  return (
    <ErrorState
      title="We couldn't load this dashboard page"
      message="Try again. Your saved data is safe."
      onRetry={reset}
      homeHref="/dashboard"
    />
  );
}
