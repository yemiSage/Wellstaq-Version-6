"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

export function InsightsHeader() {
  const [timeFilter, setTimeFilter] = useState("Last 9 Months");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef, () => setIsFilterOpen(false));

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Insights</h1>
        <p className="text-sm text-grey-2">Deep dive into your team&apos;s health & performance data.</p>
      </div>
      <div ref={filterRef} className="relative">
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-grey-4 rounded-lg text-sm font-medium text-grey-1 hover:bg-grey-5"
        >
          {timeFilter}
          <ChevronDown className="w-4 h-4" />
        </button>
        {isFilterOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-grey-4 rounded-lg shadow-lg z-10 py-1">
            {["This Month", "Last 3 Months", "Last 6 Months", "Last 9 Months", "This Year"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setTimeFilter(option);
                  setIsFilterOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-grey-1 hover:bg-grey-5"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
