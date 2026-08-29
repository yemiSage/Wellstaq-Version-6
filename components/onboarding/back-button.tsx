import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-lg px-2 text-sm font-medium text-grey-2 transition-colors hover:text-grey-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/30 sm:mb-6"
    >
      <ChevronLeft className="w-4 h-4" />
      Go Back
    </button>
  );
}
