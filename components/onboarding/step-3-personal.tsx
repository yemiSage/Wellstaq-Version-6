import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { OnboardingData } from "@/types";

interface Step3Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function Step3Personal({ data, updateData, onNext, isLoading }: Step3Props) {
  const isValid = data.firstName && data.lastName && data.phoneNumber;

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">Personal Information</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">
            First Name <span className="text-error-1">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-error-1">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-12">
        <Label htmlFor="phone">
          Phone Number <span className="text-error-1">*</span>
        </Label>
        <div className="flex gap-3">
          <div className="relative flex items-center w-28 h-[44px] rounded-[8px] border border-grey-4 bg-white px-3">
            <span className="text-sm font-medium">{data.phoneCode || '+1'}</span>
            <ChevronDown className="absolute right-3 w-4 h-4 text-grey-3 pointer-events-none" />
            <select 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={data.phoneCode || '+1'}
              onChange={(e) => updateData({ phoneCode: e.target.value })}
            >
              <option value="+1">+1 (US/CA)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+234">+234 (NG)</option>
              <option value="+91">+91 (IN)</option>
              <option value="+61">+61 (AU)</option>
              <option value="+49">+49 (DE)</option>
              <option value="+33">+33 (FR)</option>
              <option value="+81">+81 (JP)</option>
              <option value="+86">+86 (CN)</option>
              <option value="+55">+55 (BR)</option>
              <option value="+27">+27 (ZA)</option>
              <option value="+971">+971 (AE)</option>
            </select>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="+234"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <Button 
        onClick={onNext} 
        disabled={!isValid || isLoading}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
