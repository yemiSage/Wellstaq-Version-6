import { Button } from "@/components/ui/button";
import { SelectablePill } from "@/components/ui/selectable-pill";
import { OnboardingData } from "@/types";

interface Step7Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

const WORK_MODELS = ["Fully Remote", "Hybrid", "On-site"];

export function Step7WorkModel({ data, updateData, onNext, isLoading }: Step7Props) {
  const isValid = !!data.workModel;

  return (
    <div className="flex flex-col w-full items-start text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="mb-3 text-[24px] md:text-[30px] font-bold">Work model</h3>
      <p className="text-sm text-grey-2 mb-10">
        What work model do you operate at your organization?
      </p>
      
      <div className="flex flex-wrap justify-start gap-4 mb-12">
        {WORK_MODELS.map((model) => (
          <SelectablePill
            key={model}
            selected={data.workModel === model}
            onClick={() => updateData({ workModel: model })}
            className="min-w-[120px]"
          >
            {model}
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
