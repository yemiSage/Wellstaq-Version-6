"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { InsightsPeriod } from "@/types/api";

const PERIOD_OPTIONS: Array<{ label: string; value: InsightsPeriod }> = [
  { label: "This Month", value: "month" },
  { label: "Last 3 Months", value: "three_months" },
  { label: "Last 6 Months", value: "six_months" },
  { label: "Last 9 Months", value: "nine_months" },
  { label: "This Year", value: "year" },
];

export function InsightsHeader({
  period,
  onPeriodChange,
}: {
  period: InsightsPeriod;
  onPeriodChange: (period: InsightsPeriod) => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef, () => setIsFilterOpen(false));

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Insights</h1>
        <p className="text-sm text-grey-2">Understand your team&apos;s wellbeing and engagement through weekly check-ins.</p>
      </div>
      <div ref={filterRef} className="relative">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-grey-4 rounded-lg text-sm font-medium text-grey-1 hover:bg-grey-5"
        >
          {PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? "Select period"}
          <ChevronDown className="w-4 h-4" />
        </button>
        {isFilterOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-grey-4 rounded-lg shadow-lg z-10 py-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onPeriodChange(option.value);
                  setIsFilterOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-grey-1 hover:bg-grey-5"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
