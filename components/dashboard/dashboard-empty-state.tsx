import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div className={cn("flex min-h-[210px] flex-col items-center justify-center px-6 py-8 text-center", className)}>
      <div className="mb-5 flex h-16 w-16 items-center justify-center text-[#4D4D4D]" aria-hidden="true">
        <Icon className="h-8 w-8" strokeWidth={1.7} />
      </div>

      <p className="text-sm font-semibold text-grey-1">{title}</p>
      <p className="mt-1 max-w-[250px] text-xs leading-5 text-grey-3">{description}</p>
    </div>
  );
}
