import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/types";
import Image from "next/image";

interface Step7Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function Step7Invite({ data, updateData, onNext, isLoading }: Step7Props) {
  const isValid = data.invites.length > 3;

  return (
    <div className="flex flex-col w-full items-start text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-start -space-x-3 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative bg-grey-4">
            <Image 
              src={`https://picsum.photos/seed/avatar${i}/100/100`} 
              alt="Avatar" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </div>

      <h3 className="mb-3 text-[24px] md:text-[30px] font-bold">Invite team members</h3>
      <p className="text-sm text-grey-2 mb-10 max-w-md">
        Invite your team/organization members and start ... blablabla.. you can invite multiple by comma seperated
      </p>
      
      <div className="flex flex-col gap-2 mb-12 w-full text-left">
        <Label htmlFor="invites">
          Email Address <span className="text-error-1">*</span>
        </Label>
        <Input
          id="invites"
          placeholder="yemi@gmail.com, Tolu@gmail.com, Bala@gmail.com"
          value={data.invites}
          onChange={(e) => updateData({ invites: e.target.value })}
        />
      </div>

      <Button 
        onClick={onNext} 
        disabled={!isValid || isLoading}
        className="w-full"
      >
        {isLoading ? "Completing..." : "Continue"}
      </Button>
    </div>
  );
}
