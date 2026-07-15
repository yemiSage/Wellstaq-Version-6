"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";

export function DashboardHeader() {
  const [timeFilter, setTimeFilter] = useState("Last 9 Months");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user } = useDashboardData();
  const [greeting, setGreeting] = useState("Good morning");
  const filterRef = useRef<HTMLDivElement>(null);

  useClickOutside(filterRef, () => setIsFilterOpen(false));

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">{greeting}, {user.firstName}</h1>
        <p className="text-grey-2">Here is how your team is doing today.</p>
      </div>
      <div className="relative" ref={filterRef}>
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
