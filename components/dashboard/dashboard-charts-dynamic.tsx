"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const DepartmentPerformanceRadar = dynamic(() => import("@/components/dashboard/dashboard-charts").then(mod => mod.DepartmentPerformanceRadar), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-[12px]" />
});

export const EngagementChart = dynamic(() => import("@/components/dashboard/dashboard-charts").then(mod => mod.EngagementChart), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-[12px]" />
});

export const Leaderboard = dynamic(() => import("@/components/dashboard/dashboard-charts").then(mod => mod.Leaderboard), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-[12px]" />
});
