import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { OnboardingData } from "@/types";

interface Step1Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function Step1Email({ data, updateData, onNext, isLoading }: Step1Props) {
  const isValid = data.email.length > 3 && data.email.includes("@");

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">Email Address</h2>
      
      <div className="flex flex-col gap-2 mb-12">
        <Label htmlFor="email">
          Work Mail Address <span className="text-error-1">*</span>
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="pr-10"
          />
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-3" />
        </div>
      </div>

      <Button 
        onClick={onNext} 
        disabled={!isValid || isLoading}
        className="w-full"
      >
        {isLoading ? "Sending OTP..." : "Continue"}
      </Button>
    </div>
  );
}
