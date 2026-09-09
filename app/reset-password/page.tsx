"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { getUserErrorMessage } from "@/lib/errors";
import { isPasswordValid } from "@/lib/password-validation";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isValid = Boolean(token) && isPasswordValid(password) && password === confirmPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.auth.resetPassword(token, password);
      router.replace("/login?reset=success");
    } catch (err) {
      setError(getUserErrorMessage(err, "We couldn't reset your password. The link may have expired."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitLayout>
      <OnboardingPane>
        <div className="flex flex-1 flex-col justify-start">
          <div className="flex w-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="mb-3 text-[24px] font-bold md:text-[30px]">Create a new password.</h1>
            <p className="mb-8 text-sm text-grey-2">Use at least 8 characters with an uppercase letter, number, and special character.</p>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(null); }} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(null); }} />
                {confirmPassword && password !== confirmPassword && <p className="text-sm text-red-600">Passwords do not match.</p>}
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={!isValid || isLoading}>{isLoading ? "Updating..." : "Update password"}</Button>
            </form>
            <Link href="/login" className="mt-6 text-center text-sm font-medium text-primary-1 hover:underline">Back to login</Link>
          </div>
        </div>
      </OnboardingPane>
    </SplitLayout>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white" aria-label="Loading password reset" />}><ResetPasswordPageContent /></Suspense>;
}
