// path: components/onboarding/step-3-password.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, LockKeyhole, X } from "lucide-react";
import { OnboardingData } from "@/types";
import { FieldError } from "@/components/onboarding/field-error";
import { PASSWORD_RULES, isPasswordValid } from "@/lib/password-validation";

interface Step3PasswordProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
  fieldErrors?: Record<string, string[]>;
}

export function Step3Password({ data, updateData, onNext, isLoading, fieldErrors }: Step3PasswordProps) {
  const isValid = isPasswordValid(data.password);

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-8 text-[24px] md:text-[30px] font-bold">Set Password</h2>

      <div className="flex flex-col gap-2 mb-4">
        <Label htmlFor="password">
          Password <span className="text-red-600">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter a secure password"
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
            className="pr-10"
          />
          <LockKeyhole className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-3" />
        </div>
        <FieldError errors={fieldErrors} field="password" />
      </div>

      <ul className="flex flex-col gap-1.5 mb-12">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(data.password);
          return (
            <li key={rule.id} className="flex items-center gap-2 text-sm">
              {passed ? (
                <Check className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-grey-3 shrink-0" />
              )}
              <span className={passed ? "text-green-600" : "text-grey-3"}>{rule.label}</span>
            </li>
          );
        })}
      </ul>

      <Button onClick={onNext} disabled={!isValid || isLoading} className="w-full">
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}