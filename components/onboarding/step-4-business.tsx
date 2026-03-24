import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectablePill } from "@/components/ui/selectable-pill";
import { OnboardingData } from "@/types";

interface Step4Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

const EMPLOYEE_COUNTS = ["0 - 5", "6 - 10", "10 - 20", "20 - 30", "Over 30"];

export function Step4Business({ data, updateData, onNext, isLoading }: Step4Props) {
  const isValid = data.businessName && data.businessWebsite && data.employeeCount;

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">Business Information</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="businessName">
            Business Name <span className="text-error-1">*</span>
          </Label>
          <Input
            id="businessName"
            placeholder="John Enterprise"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="businessWebsite">
            Business Website <span className="text-error-1">*</span>
          </Label>
          <Input
            id="businessWebsite"
            placeholder="wellstaq.com"
            value={data.businessWebsite}
            onChange={(e) => updateData({ businessWebsite: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-12">
        <Label>
          Number of Employee <span className="text-error-1">*</span>
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
