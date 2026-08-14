// path: components/onboarding/step-4-business.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectablePill } from "@/components/ui/selectable-pill";
import { OnboardingData } from "@/types";
import { api } from "@/services/api";
import { useFieldAvailability } from "@/hooks/use-field-availability";
import { FieldError } from "@/components/onboarding/field-error";

interface Step5Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string[]>;
}

const EMPLOYEE_COUNTS = ["0 - 5", "6 - 10", "10 - 20", "20 - 30", "Over 30"];

export function Step5Business({ data, updateData, onNext, isLoading, fieldErrors }: Step5Props) {
  const businessNameStatus = useFieldAvailability(data.businessName, api.onboarding.checkBusinessName, {
    minLength: 3,
  });

  const isValid = data.businessName && data.employeeCount && businessNameStatus === "available";

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">Business Information</h2>

      <div className="grid grid-cols-2 gap-6 mb-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="businessName">
            Business Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="businessName"
            placeholder="John Enterprise"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
          />
          {businessNameStatus === "checking" && (
            <span className="text-sm text-grey-3">Checking availability...</span>
          )}
          {businessNameStatus === "available" && (
            <span className="text-sm text-green-600">This name is available</span>
          )}
          {businessNameStatus === "taken" && (
            <span className="text-sm text-red-600">This name is already taken</span>
          )}
          {businessNameStatus === "error" && (
            <span className="text-sm text-red-600">Couldn&apos;t verify right now, try again</span>
          )}
          <FieldError errors={fieldErrors} field="business_name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="businessWebsite">Business Website</Label>
          <Input
            id="businessWebsite"
            placeholder="wellstaq.com"
            value={data.businessWebsite}
            onChange={(e) => updateData({ businessWebsite: e.target.value })}
          />
          <FieldError errors={fieldErrors} field="business_website" />
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-12 mt-4">
        <Label>
          Number of Employee <span className="text-red-600">*</span>
        </Label>
        <div className="flex flex-wrap gap-3">
          {EMPLOYEE_COUNTS.map((count) => (
            <SelectablePill
              key={count}
              selected={data.employeeCount === count}
              onClick={() => updateData({ employeeCount: count })}
            >
              {count}
            </SelectablePill>
          ))}
        </div>
        <FieldError errors={fieldErrors} field="employee_count" />
      </div>

      <Button onClick={onNext} disabled={!isValid || isLoading} className="w-full">
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
