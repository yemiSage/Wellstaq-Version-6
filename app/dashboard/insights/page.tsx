"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, HeartPulse, Medal, MessageSquareHeart, Trophy, UsersRound } from "lucide-react";
import Image from "next/image";
import { InsightsHeader } from "@/components/dashboard/insights/header";
import {
  MonthlyWellbeingTrendChart,
  HealthDistributionChart,
  DepartmentPerformanceChart,
  WeeklyWellbeingChart,
} from "@/components/dashboard/insights/charts-dynamic";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import type { EngagementWellbeingTrendPoint, InsightsOverviewResponse, InsightsPeriod, LivePulseResponse } from "@/types/api";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { hasPermission } from "@/lib/permissions";

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<InsightsPeriod>("nine_months");
  const [pulse, setPulse] = useState<LivePulseResponse | null>(null);
  const [wellbeingTrend, setWellbeingTrend] = useState<EngagementWellbeingTrendPoint[]>([]);
  const [wellbeingLoading, setWellbeingLoading] = useState(true);
  const { organizationId, currentUser } = useDashboardData();
  const { scope } = useDashboardScope();
  const selectedBranchId = scope.type === "branch" ? scope.branchId : undefined;
  const canViewWellbeing = currentUser
    ? hasPermission(currentUser.permissions, "wellbeing.view_team", selectedBranchId)
    : false;
  const selectedPeriodLabel: Record<InsightsPeriod, string> = {
    month: "This month",
    three_months: "Last 3 months",
    six_months: "Last 6 months",
    nine_months: "Last 9 months",
    year: "This year",
  };

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    setInsights(null);
    setIsLoading(true);
    setError(null);
    void api.kpiSnapshots
      .getOverview(organizationId, period, selectedBranchId)
      .then((result) => { if (!cancelled) setInsights(result); })
      .catch(() => { if (!cancelled) setError("Unable to load insights from the backend."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [organizationId, period, selectedBranchId]);

  useEffect(() => {
    if (!organizationId || !canViewWellbeing) {
      setPulse(null);
      setWellbeingTrend([]);
      setWellbeingLoading(false);
      return;
    }

    let cancelled = false;
    setWellbeingLoading(true);
    void Promise.allSettled([
      api.organization.getLivePulse(organizationId, selectedBranchId),
      api.organization.getEngagementWellbeingTrends(organizationId, "month", selectedBranchId),
    ]).then(([pulseResult, trendResult]) => {
      if (cancelled) return;
      setPulse(pulseResult.status === "fulfilled" ? pulseResult.value : null);
      setWellbeingTrend(trendResult.status === "fulfilled" ? trendResult.value.points ?? [] : []);
    }).finally(() => {
      if (!cancelled) setWellbeingLoading(false);
    });

    return () => { cancelled = true; };
  }, [canViewWellbeing, organizationId, selectedBranchId]);

  const weeklyWellbeingData = [
    { name: "Stress", value: pulse?.stressManageability?.percent ?? 0, status: pulse?.stressManageability?.status },
    { name: "Energy", value: pulse?.energyRecovery?.percent ?? 0, status: pulse?.energyRecovery?.status },
    { name: "Connection", value: pulse?.connectionBelonging?.percent ?? 0, status: pulse?.connectionBelonging?.status },
    { name: "Workload", value: pulse?.workloadSustainability?.percent ?? 0, status: pulse?.workloadSustainability?.status },
    { name: "Comfort", value: pulse?.workplaceComfort?.percent ?? 0, status: pulse?.workplaceComfort?.status },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <InsightsHeader period={period} onPeriodChange={setPeriod} />

      {isLoading && (
        <div className="space-y-4" aria-label="Loading insights">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-xl bg-grey-4" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-xl bg-grey-4" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && insights && (
        <>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        <div className="dashboard-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <span className="rounded-full bg-grey-5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-grey-2">Latest pulse</span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Weekly Check-ins</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">{wellbeingLoading ? "—" : canViewWellbeing ? pulse?.respondentCount ?? 0 : "—"}</h3>
          <p className="text-xs text-grey-3">{canViewWellbeing ? "employee wellbeing responses" : "wellbeing insights unavailable"}</p>
        </div>

        <div className="dashboard-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> {insights.summary.healthScoreTrend}
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Wellbeing Score</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">{insights.summary.healthScore}</h3>
          <p className="text-xs text-grey-3">overall average</p>
        </div>

        <div className="dashboard-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
              <UsersRound className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-red-500">
              <ArrowDownRight className="w-3 h-3 mr-1" /> {insights.summary.activeEmployeesTrend}
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Employee Engagement</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">{insights.summary.activeEmployees}</h3>
          <p className="text-xs text-grey-3">participation rate</p>
        </div>

        <div className="dashboard-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" /> {insights.summary.challengesWonTrend}
            </span>
          </div>
          <p className="text-sm text-[#4D4D4D] mb-1 font-medium">Wellness Challenges Won</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">{insights.summary.challengesWon}</h3>
          <p className="text-xs text-grey-3">{selectedPeriodLabel[period]}</p>
        </div>
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        <MonthlyWellbeingTrendChart data={wellbeingTrend} loading={wellbeingLoading} />
        <HealthDistributionChart data={insights.charts?.healthDistribution ?? []} />
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
        <DepartmentPerformanceChart data={insights.charts?.departmentPerformance ?? []} />
        <WeeklyWellbeingChart data={weeklyWellbeingData} respondentCount={pulse?.respondentCount ?? 0} loading={wellbeingLoading} />
      </div>

      {/* Top Performers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-grey-1">Top Performers This Month</h3>
          {insights.topPerformers.length > 0 && (
            <button className="text-sm font-medium text-[#EA6A05] hover:underline">
              View all
            </button>
          )}
        </div>

        {insights.topPerformers.length === 0 ? (
          <div className="rounded-[12px] border border-grey-4 bg-white">
            <DashboardEmptyState
              icon={Medal}
              title="No top performers yet"
              description="Top performers will appear here as team activity is recorded."
              className="min-h-[260px]"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
            {insights.topPerformers.map((performer) => (
              <div key={performer.id} className="bg-white p-[20px] rounded-[12px] flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-[12px] overflow-hidden border-2 border-white">
                  {performer.avatar ? (
                    <Image src={performer.avatar} alt={performer.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-grey-4 text-sm font-semibold text-grey-2">
                      {performer.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-[#EA6A05] text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                  {performer.id}
                </div>
              </div>
              <h4 className="mb-5 text-sm font-medium text-grey-1">{performer.name}</h4>

              <div className="w-full">
                <div className="h-1.5 w-full bg-grey-4 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#EA6A05] rounded-full"
                    style={{ width: `${performer.score}%` }}
                  ></div>
                </div>
                <p className="text-xs font-bold text-[#EA6A05]">Score: {performer.score}</p>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
