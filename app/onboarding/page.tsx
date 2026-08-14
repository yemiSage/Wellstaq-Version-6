// path: app/onboarding/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { BackButton } from "@/components/onboarding/back-button";
import { ProgressTracker, CompletedStep } from "@/components/onboarding/progress-tracker";
import { Step1Email } from "@/components/onboarding/step-1-email";
import { Step2OTP } from "@/components/onboarding/step-2-otp";
import { Step3Password } from "@/components/onboarding/step-3-password";
import { Step4Personal } from "@/components/onboarding/step-4-personal";
import { Step5Business } from "@/components/onboarding/step-5-business";
import { Step6Organization } from "@/components/onboarding/step-6-organization";
import { Step7WorkModel } from "@/components/onboarding/step-7-work-model";
import { OnboardingData, initialData, Step } from "@/types";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { setAuthTokens } from "@/services/auth-token";
import { Mail, User, Briefcase } from "lucide-react";

function SkeletonLoader() {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      <div className="h-8 bg-grey-4 rounded-md w-3/4 mb-8 animate-pulse" />
      <div className="space-y-6 mb-12">
        <div className="space-y-2">
          <div className="h-4 bg-grey-4 rounded w-1/4 animate-pulse" />
          <div className="h-[44px] bg-grey-4 rounded-[8px] w-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-grey-4 rounded w-1/3 animate-pulse" />
          <div className="h-[44px] bg-grey-4 rounded-[8px] w-full animate-pulse" />
        </div>
      </div>
      <div className="h-[44px] bg-grey-4 rounded-[12px] w-full animate-pulse" />
    </div>
  );
}

// Maps a backend field name (snake_case, as returned in fieldErrors) to the
// step that collects it, so a rejected field sends the user back to the
// right screen instead of restarting the whole flow.
const FIELD_TO_STEP: Record<string, Step> = {
  password: 3,
  first_name: 4,
  last_name: 4,
  phone_number: 4,
  business_name: 5,
  business_website: 5,
  employee_count: 5,
  organization_type: 6,
  work_model: 7,
};

function earliestStepForErrors(fieldErrors: Record<string, string[]>): Step {
  const steps = Object.keys(fieldErrors)
    .map((field) => FIELD_TO_STEP[field])
    .filter((s): s is Step => s !== undefined);
  return steps.length > 0 ? (Math.min(...steps) as Step) : 4;
}

function isExistingUserError(error: ApiError): boolean {
  const errorText = `${error.code ?? ""} ${error.message}`.toLowerCase();
  return (
    error.status === 409 ||
    /already[_\s-]?(exists?|registered)/.test(errorText) ||
    /(user|email|account).*(exists?|registered)/.test(errorText)
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/login");
  }, [router]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
    if (newData.email !== undefined) setEmailError(null);
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors({});
    }
  };

  const handleNext = async (otpCode?: string) => {
    if (step === 1) {
      setIsLoading(true);
      setEmailError(null);
      try {
        await api.auth.sendOtp(data.email);
        setStep(2);
      } catch (err) {
        if (err instanceof ApiError && isExistingUserError(err)) {
          router.replace(`/login?email=${encodeURIComponent(data.email.trim())}`);
          return;
        }
        if (err instanceof ApiError) {
          setEmailError(err.fieldErrors?.email?.[0] ?? err.message);
        } else {
          setEmailError("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 2) {
      setIsLoading(true);
      try {
        const result = await api.auth.verifyOtp(data.email, otpCode ?? data.otp);
        if (result.emailVerificationToken) {
          updateData({ emailVerificationToken: result.emailVerificationToken });
          setStep(3);
        }
      } catch {
        // toast handles display
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step >= 3 && step < 7) {
      setStep((prev) => (prev + 1) as Step);
      return;
    }

    if (step === 7) {
      setIsLoading(true);
      let isNavigating = false;
      try {
        const tokens = await api.onboarding.complete(data);
        setAuthTokens(tokens);
        isNavigating = true;
        router.replace("/dashboard");
      } catch (err) {
        if (err instanceof ApiError && err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
          setStep(earliestStepForErrors(err.fieldErrors));
        }
      } finally {
        if (!isNavigating) {
          setIsLoading(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const getCompletedSteps = (): CompletedStep[] => {
    const steps: CompletedStep[] = [];
    if (step > 3) steps.push({ id: "email", label: "Email Address", icon: <Mail className="w-5 h-5" /> });
    if (step > 4) steps.push({ id: "personal", label: "Personal Information", icon: <User className="w-5 h-5" /> });
    if (step > 5) steps.push({ id: "business", label: "Business Information", icon: <Briefcase className="w-5 h-5" /> });
    return steps;
  };

  return (
    <SplitLayout>
      <OnboardingPane>
        {step > 1 && <BackButton onClick={handleBack} />}

        {(step === 4 || step === 5) && (
          <ProgressTracker completedSteps={getCompletedSteps()} />
        )}

        <div className="flex-1 flex flex-col justify-start">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              {step === 1 && <Step1Email data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} error={emailError} />}
              {step === 2 && <Step2OTP data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} fieldErrors={fieldErrors} />}
              {step === 3 && <Step3Password data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} fieldErrors={fieldErrors} />}
              {step === 4 && <Step4Personal data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} fieldErrors={fieldErrors} />}
              {step === 5 && <Step5Business data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} fieldErrors={fieldErrors} />}
              {step === 6 && <Step6Organization data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
              {step === 7 && <Step7WorkModel data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
            </>
          )}
        </div>
      </OnboardingPane>
    </SplitLayout>
  );
}
