import { Button } from "@/components/ui/button";
import { SelectablePill } from "@/components/ui/selectable-pill";
import { OnboardingData } from "@/types";

interface Step5Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

const ORG_TYPES = [
  "Technology / SaaS", "Government", "Financial Services",
  "Startup", "Enterprise", "Manufacturing", "Education",
  "Healthcare", "Consulting", "Others"
];

export function Step5Organization({ data, updateData, onNext, isLoading }: Step5Props) {
  const isValid = !!data.organizationType;

  return (
    <div className="flex flex-col w-full items-start text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="mb-3 text-[24px] md:text-[30px] font-bold">What best describes your organization?</h3>
      <p className="text-sm text-grey-2 mb-10 max-w-md">
        Your ideas and input shapes the experience at wellstaq, this helps us tailor wellbeing insights and recommendations.
      </p>
      
      <div className="flex flex-wrap justify-start gap-4 mb-12 max-w-lg">
        {ORG_TYPES.map((type) => (
          <SelectablePill
            key={type}
            selected={data.organizationType === type}
            onClick={() => updateData({ organizationType: type })}
          >
            {type}
          </SelectablePill>
        ))}
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
