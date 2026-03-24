import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-medium text-grey-2 hover:text-grey-1 transition-colors mb-6 w-fit"
    >
      <ChevronLeft className="w-4 h-4" />
      Go Back
    </button>
  );
}
