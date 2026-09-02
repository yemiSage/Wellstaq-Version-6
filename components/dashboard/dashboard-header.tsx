// path: components/dashboard/dashboard-header.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { FilterDropdown, type FilterDropdownOption } from "@/components/ui/filter-dropdown";
import type { StatsPeriod } from "@/services/api";

const TIME_FILTER_OPTIONS: FilterDropdownOption<StatsPeriod | "">[] = [
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
  const { currentUser } = useDashboardData();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="page-title">
          {greeting}{currentUser ? `, ${currentUser.firstName}` : ""}
        </h1>
        <p className="page-description">Here is how your team is doing today.</p>
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

        <FilterDropdown
          value={period}
          options={TIME_FILTER_OPTIONS}
          onValueChange={onPeriodChange}
          ariaLabel="Dashboard period"
          align="right"
          menuClassName="w-48"
        />
      </div>
    </div>
  );
}
