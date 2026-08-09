// path: app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/onboarding/field-error";
import { Mail, LockKeyhole } from "lucide-react";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { getAuthTokens, setAuthTokens } from "@/services/auth-token";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [credentialsError, setCredentialsError] = useState<string | null>(null);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length > 0;

  useEffect(() => {
    if (getAuthTokens()?.accessToken) {
      router.replace("/dashboard");
    }
  }, [router]);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setFieldErrors({});
    setCredentialsError(null);
    try {
      const tokens = await api.auth.login(email.trim(), password);
      setAuthTokens(tokens);
      const returnTo = searchParams.get("returnTo");
      router.replace(returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        } else if (err.status === 401) {
          setCredentialsError(err.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    if (credentialsError) setCredentialsError(null);
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  return (
    <SplitLayout>
      <OnboardingPane>
        <div className="flex-1 flex flex-col justify-start">
          <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">Log In</h2>

            {errorParam === "insufficient_permission" && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-6">
                You don&apos;t have permission to access this dashboard. Contact your administrator if you believe this is a mistake.
              </p>
            )}

            <div className="flex flex-col gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => handleFieldChange(setEmail)(e.target.value)}
                    className={`pr-10 ${credentialsError ? "border-red-500" : ""}`}
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-3" />
                </div>
                <FieldError errors={fieldErrors} field="email" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">
                  Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleFieldChange(setPassword)(e.target.value)}
                    className={`pr-10 ${credentialsError ? "border-red-500" : ""}`}
                  />
                  <LockKeyhole className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-3" />
                </div>
                <FieldError errors={fieldErrors} field="password" />
              </div>
            </div>

            {credentialsError && (
              <p className="text-sm text-red-600 mb-6">{credentialsError}</p>
            )}

            <Button onClick={handleSubmit} disabled={!isValid || isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Log In"}
            </Button>

            <p className="text-sm text-grey-3 text-center mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/onboarding" className="text-primary-1 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </OnboardingPane>
    </SplitLayout>
  );
}