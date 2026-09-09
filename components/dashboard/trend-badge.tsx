// path: components/dashboard/trend-badge.tsx
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { StatTrend } from "@/types/api";

export function TrendBadge({ trend }: { trend: StatTrend | null }) {
  // null trend (or null changePct) means no baseline to compare against —
  // either "Overall" is selected, or a custom range has no earlier data yet.
  if (!trend || trend.changePct === null) {
    return null;
  }

  if (trend.changePct === 0) {
    return (
      <span className="hidden sm:flex items-center text-[10px] sm:text-xs font-medium text-grey-3">
        <Minus className="w-3 h-3 mr-1" /> 0%
      </span>
    );
  }

  const isPositive = trend.changePct > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isPositive ? "text-green-600" : "text-red-600";

  return (
    <span className={`hidden sm:flex items-center text-[10px] sm:text-xs font-medium ${colorClass}`}>
      <Icon className="w-3 h-3 mr-1" /> {Math.abs(trend.changePct)}%
    </span>
  );
}
