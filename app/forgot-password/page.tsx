"use client";

import { useState } from "react";
import Link from "next/link";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { getUserErrorMessage } from "@/lib/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.auth.forgotPassword(email.trim());
      setIsSent(true);
    } catch (err) {
      setError(getUserErrorMessage(err, "We couldn't send a reset link. Try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitLayout>
      <OnboardingPane>
        <div className="flex flex-1 flex-col justify-start">
          <div className="flex w-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/login" className="mb-8 text-sm font-medium text-grey-2 hover:text-primary-1">← Back to login</Link>
            <h1 className="mb-3 text-[24px] font-bold md:text-[30px]">Reset your password.</h1>
            <p className="mb-8 text-sm text-grey-2">
              {isSent ? "If that account exists, we sent a secure reset link to your inbox." : "Enter the email attached to your employee account."}
            </p>

            {isSent ? (
              <div className="flex flex-col gap-4">
                <Button type="button" variant="outline" onClick={() => setIsSent(false)}>Use another email</Button>
                <Link href="/login" className="text-center text-sm font-medium text-primary-1 hover:underline">Back to login</Link>
              </div>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="forgot-email">Email address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setError(null); }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "forgot-password-error" : undefined}
                  />
                  {error && <p id="forgot-password-error" role="alert" className="text-sm text-red-600">{error}</p>}
                </div>
                <Button type="submit" disabled={!isValid || isLoading}>{isLoading ? "Sending..." : "Send reset link"}</Button>
              </form>
            )}
          </div>
        </div>
      </OnboardingPane>
    </SplitLayout>
  );
}
