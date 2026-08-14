// path: components/onboarding/step-3-personal.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { OnboardingData } from "@/types";
import { api } from "@/services/api";
import { useFieldAvailability } from "@/hooks/use-field-availability";
import { FieldError } from "@/components/onboarding/field-error";

interface Step4Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string[]>;
}

export function Step4Personal({ data, updateData, onNext, isLoading, fieldErrors }: Step4Props) {
  const phoneStatus = useFieldAvailability(data.phoneNumber, api.onboarding.checkPhoneNumber, {
    minLength: 6,
  });

  const isValid =
    data.firstName && data.lastName && data.phoneNumber && phoneStatus === "available";

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">Personal Information</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
          />
          <FieldError errors={fieldErrors} field="first_name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
          />
          <FieldError errors={fieldErrors} field="last_name" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-2">
        <Label htmlFor="phone">
          Phone Number <span className="text-red-600">*</span>
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
        {phoneStatus === "checking" && (
          <span className="text-sm text-grey-3">Checking availability...</span>
        )}
        {phoneStatus === "available" && (
          <span className="text-sm text-green-600">This number is available</span>
        )}
        {phoneStatus === "taken" && (
          <span className="text-sm text-red-600">This number is already registered</span>
        )}
        {phoneStatus === "error" && (
          <span className="text-sm text-red-600">Couldn&apos;t verify right now, try again</span>
        )}
        <FieldError errors={fieldErrors} field="phone_number" />
      </div>

      <div className="mb-12" />

      <Button onClick={onNext} disabled={!isValid || isLoading} className="w-full">
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
