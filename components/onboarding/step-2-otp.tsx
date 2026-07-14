import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/types";
import { api } from "@/services/api";

interface Step2Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function Step2OTP({ data, updateData, onNext, isLoading }: Step2Props) {
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
      
      <div className="flex gap-3 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-lg font-medium rounded-xl border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1 transition-all"
            maxLength={1}
          />
        ))}
      </div>
      
      <div className="text-[12px] text-grey-3 mb-12 flex items-center gap-1">
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
        onClick={onNext} 
        disabled={!isValid || isLoading}
        className="w-full"
      >
        {isLoading ? "Verifying..." : "Continue"}
      </Button>
    </div>
  );
}
