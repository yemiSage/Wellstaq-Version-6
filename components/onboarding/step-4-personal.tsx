// path: components/onboarding/step-3-personal.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11}
          placeholder="08012345678"
          value={data.phoneNumber}
          onChange={(e) => updateData({ phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 11) })}
        />
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

      <Button onClick={onNext} disabled={!isValid || isLoading} size="lg" className="w-full">
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
