import { CheckCircle2 } from "lucide-react";

export interface CompletedStep {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProgressTrackerProps {
  completedSteps: CompletedStep[];
}

export function ProgressTracker({ completedSteps }: ProgressTrackerProps) {
  if (!completedSteps || completedSteps.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-6">
      {completedSteps.map((step) => (
        <div key={step.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-grey-1">
            <div className="w-5 h-5 flex items-center justify-center">
              {step.icon}
            </div>
            <span className="text-body font-medium">{step.label}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-success-1" strokeWidth={1.5} />
        </div>
      ))}
    </div>
  );
}
