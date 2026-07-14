"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SplitLayout } from "@/components/layout/split-layout";
import { OnboardingPane } from "@/components/layout/onboarding-pane";
import { BackButton } from "@/components/onboarding/back-button";
import { ProgressTracker, CompletedStep } from "@/components/onboarding/progress-tracker";
import { Step1Email } from "@/components/onboarding/step-1-email";
import { Step2OTP } from "@/components/onboarding/step-2-otp";
import { Step3Personal } from "@/components/onboarding/step-3-personal";
import { Step4Business } from "@/components/onboarding/step-4-business";
import { Step5Organization } from "@/components/onboarding/step-5-organization";
import { Step6WorkModel } from "@/components/onboarding/step-6-work-model";
import { OnboardingData, initialData, Step } from "@/types";
import { api } from "@/services/api";
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const handleNext = async () => {
    setIsLoading(true);
    let isNavigating = false;
    try {
      if (step === 1) {
        await api.auth.sendOtp(data.email);
        setStep(2);
      } else if (step === 2) {
        const result = await api.auth.verifyOtp(data.email, data.otp, data.password);
        if (result.verified) setStep(3);
      } else if (step === 3) {
        await api.onboarding.save(data);
        setStep(4);
      } else if (step === 4) {
        await api.onboarding.save(data);
        setStep(5);
      } else if (step === 5) {
        await api.onboarding.save(data);
        setStep(6);
      } else if (step === 6) {
        await api.onboarding.complete(data);
        isNavigating = true;
        router.replace("/dashboard");
      }
    } finally {
      if (!isNavigating) {
        setIsLoading(false);
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
    if (step > 2) steps.push({ id: "email", label: "Email Address", icon: <Mail className="w-5 h-5" /> });
    if (step > 3) steps.push({ id: "personal", label: "Personal Information", icon: <User className="w-5 h-5" /> });
    if (step > 4) steps.push({ id: "business", label: "Business Information", icon: <Briefcase className="w-5 h-5" /> });
    return steps;
  };

  return (
    <SplitLayout>
      <OnboardingPane>
        {step > 1 && <BackButton onClick={handleBack} />}
        
        {/* Progress Tracker for Steps 3 and 4 */}
        {(step === 3 || step === 4) && (
          <ProgressTracker completedSteps={getCompletedSteps()} />
        )}

        <div className="flex-1 flex flex-col justify-start">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              {step === 1 && <Step1Email data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
              {step === 2 && <Step2OTP data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
              {step === 3 && <Step3Personal data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
              {step === 4 && <Step4Business data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
              {step === 5 && <Step5Organization data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
              {step === 6 && <Step6WorkModel data={data} updateData={updateData} onNext={handleNext} isLoading={isLoading} />}
            </>
          )}
        </div>
      </OnboardingPane>
    </SplitLayout>
  );
}
