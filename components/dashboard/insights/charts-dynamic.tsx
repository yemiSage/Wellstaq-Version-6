"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const MonthlyStepsChart = dynamic(() => import("@/components/dashboard/insights/charts").then(mod => mod.MonthlyStepsChart), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-[12px]" />
});

export const HealthDistributionChart = dynamic(() => import("@/components/dashboard/insights/charts").then(mod => mod.HealthDistributionChart), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-[12px]" />
});

export const DepartmentPerformanceChart = dynamic(() => import("@/components/dashboard/insights/charts").then(mod => mod.DepartmentPerformanceChart), { 
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full rounded-[12px]" />
});

export const WeeklyActivityChart = dynamic(() => import("@/components/dashboard/insights/charts").then(mod => mod.WeeklyActivityChart), { 
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full rounded-[12px]" />
});
