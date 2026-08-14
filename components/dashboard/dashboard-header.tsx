// path: components/dashboard/dashboard-header.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import type { StatsPeriod } from "@/services/api";

const TIME_FILTER_OPTIONS: { label: string; value: StatsPeriod | "" }[] = [
  { label: "Overall", value: "" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Months", value: "three_months" },
  { label: "Last 6 Months", value: "six_months" },
  { label: "Last 9 Months", value: "nine_months" },
  { label: "This Year", value: "year" },
  { label: "Custom range", value: "custom" },
];

interface DashboardHeaderProps {
  period: StatsPeriod | "";
  onPeriodChange: (period: StatsPeriod | "") => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}

export function DashboardHeader({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: DashboardHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { currentUser } = useDashboardData();
  const [greeting, setGreeting] = useState("Good morning");
  const filterRef = useRef<HTMLDivElement>(null);

  useClickOutside(filterRef, () => setIsFilterOpen(false));

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const currentLabel = TIME_FILTER_OPTIONS.find((opt) => opt.value === period)?.label ?? "Overall";

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">
          {greeting}{currentUser ? `, ${currentUser.firstName}` : ""}
        </h1>
        <p className="text-grey-2">Here is how your team is doing today.</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {period === "custom" && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-grey-4 bg-white text-sm text-grey-1 focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
            <span className="text-grey-3 text-sm">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-grey-4 bg-white text-sm text-grey-1 focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </>
        )}

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-grey-4 rounded-lg text-sm font-medium text-grey-1 hover:bg-grey-5"
          >
            {currentLabel}
            <ChevronDown className="w-4 h-4" />
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-grey-4 rounded-lg shadow-lg z-10 py-1">
              {TIME_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.label}
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
    </div>
  );
}