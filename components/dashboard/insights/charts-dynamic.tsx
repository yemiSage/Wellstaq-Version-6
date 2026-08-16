"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const MonthlyWellbeingTrendChart = dynamic(() => import("@/components/dashboard/insights/charts").then(mod => mod.MonthlyWellbeingTrendChart), {
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

export const WeeklyWellbeingChart = dynamic(() => import("@/components/dashboard/insights/charts").then(mod => mod.WeeklyWellbeingChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full rounded-[12px]" />
});
