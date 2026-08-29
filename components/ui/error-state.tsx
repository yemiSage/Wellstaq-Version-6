"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  homeHref?: string;
}

export function ErrorState({
  title = "We couldn't load this page",
  message = "Try again. If the problem continues, come back shortly.",
  onRetry,
  homeHref = "/",
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm" role="alert">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-grey-1">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-grey-2">{message}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {onRetry && (
            <Button type="button" onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          )}
          <Link
            href={homeHref}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-grey-4 px-6 text-sm font-medium text-grey-2 transition-colors hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1"
          >
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
