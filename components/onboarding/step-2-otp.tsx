// path: components/onboarding/step-2-otp.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/types";
import { api } from "@/services/api";
import { FieldError } from "@/components/onboarding/field-error";

interface Step2Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: (otpCode?: string) => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string[]>;
}

export function Step2OTP({ data, updateData, onNext, isLoading, fieldErrors }: Step2Props) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(59);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    updateData({ otp: newOtp.join("") });

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimeLeft(59);
    void api.auth.sendOtp(data.email);
  };

  const isValid = otp.every((digit) => digit !== "");

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-2 text-[24px] md:text-[30px] font-bold">Email Address</h2>
      <p className="text-sm text-grey-1 mb-8">
        Input the OTP sent to <span className="text-primary-1 font-medium">{data.email}</span> below <span className="text-red-600">*</span>
      </p>
      
      <div className="mb-1 grid w-full grid-cols-6 gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-12 w-full min-w-0 rounded-xl border border-grey-4 text-center text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-1"
            maxLength={1}
          />
        ))}
      </div>
      <FieldError errors={fieldErrors} field="otp" />

      <div className="text-[12px] text-grey-3 mb-12 mt-3 flex items-center gap-1">
        Didn&apos;t receive the code? 
        {timeLeft > 0 ? (
          <span>0:{timeLeft.toString().padStart(2, '0')}</span>
        ) : (
          <button 
            onClick={handleResend}
            className="text-primary-1 font-medium hover:underline focus:outline-none"
          >
            Resend
          </button>
        )}
      </div>

      <Button 
        onClick={() => onNext(otp.join(""))}
        disabled={!isValid || isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? "Verifying..." : "Continue"}
      </Button>
    </div>
  );
}
