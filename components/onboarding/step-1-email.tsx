// path: components/onboarding/step-1-email.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { OnboardingData } from "@/types";
import Link from "next/link";

interface Step1Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function Step1Email({ data, updateData, onNext, isLoading, error }: Step1Props) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-2 text-[24px] md:text-[30px] font-bold">Let&apos;s get you started</h2>
      <p className="mb-8 text-sm text-grey-2">Enter your email address to get started.</p>

      <div className="flex flex-col gap-6 mb-12">
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
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className={`pr-10 ${error ? "border-red-500" : ""}`}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "signup-email-error" : undefined}
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-3" />
          </div>
          {error && <p id="signup-email-error" role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid || isLoading} className="w-full">
        {isLoading ? "Sending OTP..." : "Continue"}
      </Button>
      <p className="text-sm text-grey-3 text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-1 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
