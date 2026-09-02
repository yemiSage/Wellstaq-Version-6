// path: app/login/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/onboarding/field-error";
import { Eye, EyeOff, Mail } from "lucide-react";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { cacheCurrentUser, clearAuthTokens, getAuthTokens, setAuthTokens, type AuthTokens } from "@/services/auth-token";
import { getSwitchableScopes } from "@/lib/permissions";
import { getUserErrorMessage } from "@/lib/errors";
import type { TwoFaChallengeResponse } from "@/types/api";

function isInvalidCredentialsError(error: ApiError): boolean {
  const errorText = `${error.code ?? ""} ${error.message}`.toLowerCase();
  return (
    error.status === 401 ||
    /invalid[_\s-]?credentials?/.test(errorText) ||
    /(email|password).*(incorrect|invalid|not correct)/.test(errorText) ||
    /(incorrect|invalid|wrong).*(email|password)/.test(errorText)
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const emailParam = searchParams.get("email")?.trim() ?? "";
  const isReturningFromSignup = searchParams.get("from") === "signup";
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [twoFaChallenge, setTwoFaChallenge] = useState<TwoFaChallengeResponse | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");

  const displayedEmail = email;
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(displayedEmail.trim()) && password.length > 0;

  useEffect(() => {
    setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    router.prefetch("/dashboard");
    if (errorParam === "insufficient_permission") {
      clearAuthTokens();
      return;
    }
    if (getAuthTokens()?.accessToken) {
      router.replace("/dashboard");
    }
  }, [errorParam, router]);

  const finishLogin = async (tokens: AuthTokens) => {
    setAuthTokens(tokens);
    try {
      const me = await api.auth.me();
      if (!getSwitchableScopes(me.permissions).canViewOverview) {
        clearAuthTokens();
        setCredentialsError("You don't have permission to view this resource.");
        return;
      }
      cacheCurrentUser(me);
      const returnTo = searchParams.get("returnTo");
      router.replace(returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard");
      router.refresh();
    } catch (error) {
      clearAuthTokens();
      throw error;
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setFieldErrors({});
    setCredentialsError(null);
    try {
      const result = await api.auth.login(displayedEmail.trim(), password);
      if ("twoFaChallengeToken" in result) {
        setTwoFaChallenge(result);
        return;
      }
      await finishLogin(result);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        } else if (isInvalidCredentialsError(err)) {
          setCredentialsError("Email or password is incorrect.");
        } else {
          setCredentialsError(err.message);
        }
      } else {
        setCredentialsError(getUserErrorMessage(err, "We couldn't sign you in. Try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFaSubmit = async () => {
    if (!twoFaChallenge) return;
    setIsLoading(true);
    setCredentialsError(null);
    try {
      const tokens = await api.auth.verifyTwoFa(twoFaChallenge.twoFaChallengeToken, twoFaCode);
      await finishLogin(tokens);
    } catch (err) {
      setCredentialsError(getUserErrorMessage(err, "We couldn't verify that code. Try again."));
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
            <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">{twoFaChallenge ? "Verify your login" : "Get back into your account"}</h2>

            {errorParam === "insufficient_permission" && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-6">
                You don&apos;t have permission to view this resource. Contact your administrator if you believe this is a mistake.
              </p>
            )}
            {errorParam === "session_revoked" && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-6">
                This login session was revoked. Please sign in again.
              </p>
            )}

            {!twoFaChallenge ? <div className="flex flex-col gap-6 mb-6">
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
                    value={displayedEmail}
                    onChange={(e) => handleFieldChange(setEmail)(e.target.value)}
                    className={`pr-10 ${credentialsError ? "border-red-500" : ""}`}
                    aria-invalid={credentialsError ? true : undefined}
                    aria-describedby={credentialsError ? "credentials-error" : undefined}
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    autoFocus={isReturningFromSignup}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleFieldChange(setPassword)(e.target.value)}
                    className={`pr-12 ${credentialsError ? "border-red-500" : ""}`}
                    aria-invalid={credentialsError ? true : undefined}
                    aria-describedby={credentialsError ? "credentials-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-grey-3 transition-colors hover:text-grey-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/30"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
                <FieldError errors={fieldErrors} field="password" />
              </div>
            </div> : <div className="flex flex-col gap-3 mb-6">
              <p className="text-sm text-grey-2">
                {twoFaChallenge.twoFaMethod === "email"
                  ? `We sent a verification code to ${displayedEmail.trim()}. Enter it below to continue.`
                  : twoFaChallenge.twoFaMethod === "totp"
                    ? "Enter the current code from your authenticator app."
                    : "Enter the verification code sent to your phone."}
              </p>
              <Label htmlFor="two-fa-code">Verification code</Label>
              <Input
                id="two-fa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="Enter verification code"
                value={twoFaCode}
                onChange={(event) => {
                  setTwoFaCode(event.target.value.replace(/\D/g, ""));
                  setCredentialsError(null);
                }}
              />
            </div>}

            {credentialsError && (
              <p id="credentials-error" role="alert" className="text-sm text-red-600 mb-6">{credentialsError}</p>
            )}

            <Button
              onClick={twoFaChallenge ? handleTwoFaSubmit : handleSubmit}
              disabled={twoFaChallenge ? twoFaCode.length < 6 || isLoading : !isValid || isLoading}
              className="w-full"
            >
              {isLoading ? "Please wait..." : twoFaChallenge ? "Verify and log in" : "Log In"}
            </Button>

            {twoFaChallenge && (
              <button
                type="button"
                onClick={() => { setTwoFaChallenge(null); setTwoFaCode(""); setCredentialsError(null); }}
                className="mt-4 text-sm text-grey-3 hover:text-primary-1"
              >
                Back to login
              </button>
            )}

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-label="Loading login" />}>
      <LoginPageContent />
    </Suspense>
  );
}
