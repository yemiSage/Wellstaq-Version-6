// path: app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarDays, Lock } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  DepartmentPerformanceRadar,
  EngagementChart,
  Leaderboard
} from "@/components/dashboard/dashboard-charts-dynamic";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { api, type StatsPeriod } from "@/services/api";
import { TrendBadge } from "@/components/dashboard/trend-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { useDashboardScope } from "@/lib/scope";
import { hasPermission, readablePermission } from "@/lib/permissions";
import type { StatTrend, ChallengeItem, ChallengeListResponse, LivePulseResponse, EngagementWellbeingTrendPeriod, EngagementWellbeingTrendPoint } from "@/types/api";

const PULSE_QUESTION_META: {
  key: keyof Omit<LivePulseResponse, "windowId" | "respondentCount" | "prioritySupportPct" | "needsAttentionPct" | "doingWellPct">;
  name: string;
}[] = [
  { key: "stressManageability", name: "Stress Manageability" },
  { key: "energyRecovery", name: "Energy & Recovery" },
  { key: "connectionBelonging", name: "Connection & Belonging" },
  { key: "workloadSustainability", name: "Workload Sustainability" },
  { key: "workplaceComfort", name: "Workplace Comfort" },
];

function statusBarClass(status: string | null): string {
  if (status === "Priority focus") return "bg-[#D84315]";
  if (status === "Needs attention") return "bg-[#FF9800]";
  if (status === "Doing well") return "bg-[#4CAF50]";
  return "bg-grey-4"; // no data yet
}

export default function DashboardPage() {
  const {
    leaderboard: dashboardLeaderboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
    organizationId,
    currentUser,
  } = useDashboardData();
  const { scope } = useDashboardScope();

  const [period, setPeriod] = useState<StatsPeriod | "">("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [stats, setStats] = useState<{
    staff: number;
    staffActive: number;
    activity: number;
    events: number;
    departments: number;
    usersTrend: StatTrend;
    eventsTrend: StatTrend;
    departmentsTrend: StatTrend;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [trendPeriod, setTrendPeriod] = useState<EngagementWellbeingTrendPeriod>("week");
  const [trendPoints, setTrendPoints] = useState<EngagementWellbeingTrendPoint[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);

  // Wellbeing pulse — permission-gated before any request is made, not
  // caught after a 403. hasPermission is checked against the branch
  // currently in scope (undefined in Overview = org-wide check).
  const canViewPulse = currentUser
    ? hasPermission(currentUser.permissions, "wellbeing.view_team", scope.type === "branch" ? scope.branchId : undefined)
    : false;
  const [pulse, setPulse] = useState<LivePulseResponse | null>(null);
  const [pulseLoading, setPulseLoading] = useState(true);
  const pulseData: LivePulseResponse = pulse ?? {
    windowId: "",
    respondentCount: 0,
    stressManageability: { percent: null, status: null },
    energyRecovery: { percent: null, status: null },
    connectionBelonging: { percent: null, status: null },
    workloadSustainability: { percent: null, status: null },
    workplaceComfort: { percent: null, status: null },
    prioritySupportPct: null,
    needsAttentionPct: null,
    doingWellPct: null,
  };

  useEffect(() => {
    if (!organizationId || !canViewPulse) {
      setTrendPoints([]);
      setTrendsLoading(false);
      return;
    }
    let cancelled = false;
    setTrendsLoading(true);
    api.organization
      .getEngagementWellbeingTrends(
        organizationId,
        trendPeriod,
        scope.type === "branch" ? scope.branchId : undefined,
      )
      .then((result) => { if (!cancelled) setTrendPoints(result.points ?? []); })
      .catch(() => { if (!cancelled) setTrendPoints([]); })
      .finally(() => { if (!cancelled) setTrendsLoading(false); });
    return () => { cancelled = true; };
  }, [organizationId, scope, trendPeriod, canViewPulse]);

  useEffect(() => {
    if (!organizationId) return;
    if (period === "custom" && !customStart) return;
    let cancelled = false;

    async function loadStats(orgId: string) {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const statsParams = {
          period: period || undefined,
          startDate: period === "custom" ? customStart : undefined,
          endDate: period === "custom" && customEnd ? customEnd : undefined,
        };

        const [orgStats, activeStats, activitySummary] =
          scope.type === "overview"
            ? await Promise.all([
              api.organization.getStats(orgId, statsParams),
              api.organization.getActiveUserStats(orgId),
              api.organization.getActivitySummary(orgId),
            ])
            : await Promise.all([
              api.organization.getBranchStats(orgId, scope.branchId, statsParams),
              api.organization.getBranchActiveUserStats(orgId, scope.branchId),
              api.organization.getBranchActivitySummary(orgId, scope.branchId),
            ]);

        if (cancelled) return;

        setStats({
          staff: orgStats.totalUsers,
          staffActive: activeStats.totalUsers,
          activity: activitySummary.totalCount,
          events: orgStats.totalEvents,
          departments: orgStats.totalDepartments,
          usersTrend: orgStats.usersTrend,
          eventsTrend: orgStats.eventsTrend,
          departmentsTrend: orgStats.departmentsTrend,
        });
      } catch {
        if (!cancelled) setStatsError("We couldn't load organization stats. Try again.");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    void loadStats(organizationId);
    return () => {
      cancelled = true;
    };
  }, [organizationId, scope, period, customStart, customEnd]);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;

    async function loadChallenges(orgId: string) {
      setChallengesLoading(true);
      try {
        const response: ChallengeListResponse =
          scope.type === "overview"
            ? await api.organization.getChallenges(orgId, { scope: "all", status: "upcoming" })
            : await api.organization.getChallenges(orgId, {
              branchId: scope.branchId,
              scope: "organization",
              status: "upcoming",
            });

        if (cancelled) return;

        const upcoming = [...response.items].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );

        setChallenges(upcoming);
      } catch {
        if (!cancelled) setChallenges([]);
      } finally {
        if (!cancelled) setChallengesLoading(false);
      }
    }

    void loadChallenges(organizationId);
    return () => {
      cancelled = true;
    };
  }, [organizationId, scope]);

  useEffect(() => {
    if (!organizationId) return;
    if (!canViewPulse) {
      // No permission for this scope — never fire the request, just
      // stop "loading" so the restricted-access message renders.
      setPulse(null);
      setPulseLoading(false);
      return;
    }
    let cancelled = false;

    async function loadPulse(orgId: string) {
      setPulseLoading(true);
      try {
        const result = await api.organization.getLivePulse(
          orgId,
          scope.type === "branch" ? scope.branchId : undefined,
        );
        if (!cancelled) setPulse(result);
      } catch {
        if (!cancelled) setPulse(null);
      } finally {
        if (!cancelled) setPulseLoading(false);
      }
    }

    void loadPulse(organizationId);
    return () => { cancelled = true; };
  }, [organizationId, scope, canViewPulse]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      {isDashboardLoading && (
        <div className="text-center py-16 text-grey-3">Loading your dashboard...</div>
      )}

      {!isDashboardLoading && (
        <>
          {dashboardError && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              Some dashboard data couldn&apos;t load. Stats and other sections below are still live.
            </p>
          )}

          {/* Stats Cards */}
          {statsLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="dashboard-card border border-grey-4 animate-pulse h-24" />
              ))}
            </div>
          )}

          {!statsLoading && statsError && (
            <p className="text-sm text-red-600">{statsError}</p>
          )}

          {!statsLoading && !statsError && stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
              <StatCard
                title="Total Staff"
                value={stats.staff}
                subtitle={`${stats.staffActive} active`}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                iconClassName="bg-red-100 text-red-500"
                trend={stats.usersTrend}
              />

              <div className="dashboard-card border border-grey-4">
                <div className="flex items-start justify-between mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                  </div>
                </div>
                <p className="text-[10px] sm:text-sm text-[#4D4D4D] mb-1 font-medium truncate">Total Activity</p>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{stats.activity.toLocaleString()}</h3>
                <p className="text-[10px] text-grey-3 truncate">From last week</p>
              </div>

              <div className="dashboard-card border border-grey-4">
                <div className="flex items-start justify-between mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                  </div>
                  <TrendBadge trend={stats.eventsTrend} />
                </div>
                <p className="text-[10px] sm:text-sm text-[#4D4D4D] mb-1 font-medium truncate">Events Created</p>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{stats.events}</h3>
                <p className="text-[10px] text-grey-3 truncate">Scheduled</p>
              </div>

              <div className="dashboard-card border border-grey-4">
                <div className="flex items-start justify-between mb-2 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-lime-100 text-lime-600 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M12 2v2" /><path d="M12 22v-2" /><path d="m17 20.66-1-1.73" /><path d="M11 10.27 7 3.34" /><path d="m20.66 17-1.73-1" /><path d="m3.34 7 1.73 1" /><path d="M14 12h8" /><path d="M2 12h2" /><path d="m20.66 7-1.73 1" /><path d="m3.34 17 1.73-1" /><path d="m17 3.34-1 1.73" /><path d="m11 13.73-4 6.93" /></svg>
                  </div>
                  <TrendBadge trend={stats.departmentsTrend} />
                </div>
                <p className="text-[10px] sm:text-sm text-[#4D4D4D] mb-1 font-medium truncate">Departments</p>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{stats.departments}</h3>
                <p className="text-[10px] text-grey-3 truncate">Wellness</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
            {/* Left Column */}
            <div className="space-y-[12px]">
              {/* Wellbeing Pulse */}
              <div className="bg-white p-2 rounded-[12px] border border-grey-4">
                <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-4">Wellbeing Pulse</h3>

                {!canViewPulse && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <Lock className="w-6 h-6 text-grey-3" />
                    <p className="text-sm text-grey-3">You don&apos;t have permission to {readablePermission("wellbeing.view_team").toLowerCase()}.</p>
                  </div>
                )}

                {canViewPulse && pulseLoading && (
                  <div className="h-40 bg-grey-5 rounded-md animate-pulse" />
                )}

                {canViewPulse && !pulseLoading && (
                  <>
                    {/* Progress Bar */}
                    <div className="flex h-4 mb-4 gap-0.5 rounded-sm bg-grey-5 overflow-hidden">
                      {Array.from({ length: Math.round(pulseData.prioritySupportPct ?? 0) }).map((_, i) => (
                        <div key={`red-${i}`} className="bg-[#E64A19] w-1.5 h-full rounded-sm" />
                      ))}
                      {Array.from({ length: Math.round(pulseData.needsAttentionPct ?? 0) }).map((_, i) => (
                        <div key={`orange-${i}`} className="bg-[#FFCC80] w-1.5 h-full rounded-sm" />
                      ))}
                      {Array.from({ length: Math.round(pulseData.doingWellPct ?? 0) }).map((_, i) => (
                        <div key={`green-${i}`} className="bg-[#4CAF50] w-1.5 h-full rounded-sm" />
                      ))}
                    </div>

                    <div className="mb-6 grid w-full grid-cols-3 text-sm text-grey-2">
                      <div className="flex min-w-0 items-start gap-1.5 pr-2">
                        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#E64A19]" />
                        <span className="min-w-0 text-left text-[12px] font-medium leading-4 text-[#4D4D4D]">{pulseData.prioritySupportPct ?? 0}% Priority support</span>
                      </div>
                      <div className="flex min-w-0 items-start gap-1.5 border-l border-grey-4 px-2">
                        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FFCC80]" />
                        <span className="min-w-0 text-left text-[12px] font-medium leading-4 text-[#4D4D4D]">{pulseData.needsAttentionPct ?? 0}% Needs attention</span>
                      </div>
                      <div className="flex min-w-0 items-start gap-1.5 border-l border-grey-4 pl-2">
                        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#4CAF50]" />
                        <span className="min-w-0 text-left text-[12px] font-medium leading-4 text-[#4D4D4D]">{pulseData.doingWellPct ?? 0}% Doing well</span>
                      </div>
                    </div>

                    <div className="bg-[#FAFAFA] rounded-[12px] p-3 space-y-6">
                      {PULSE_QUESTION_META.map(({ key, name }) => {
                        const q = pulseData[key] ?? { status: null, percent: null };
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-[16px] text-grey-1 font-medium mb-1">
                              <span className="text-[#4D4D4D] text-[14px] leading-[20px] font-bold">{name}</span>
                            </div>
                            <div className="flex justify-between text-[12px] text-grey-2 mb-2">
                              <span>{q.status ?? "No data yet"}</span>
                              <span className="text-grey-1 font-medium">{q.percent ?? 0}%</span>
                            </div>
                            <div className="h-1.5 bg-grey-4 rounded-full overflow-hidden">
                              <div className={`h-full ${statusBarClass(q.status)}`} style={{ width: `${q.percent ?? 0}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Department Performance */}
              <DepartmentPerformanceRadar />
            </div>

            {/* Right Column (spans 2) */}
            <div className="lg:col-span-2 space-y-[12px]">
              {/* Employee Engagement */}
              <EngagementChart
                data={trendPoints}
                period={trendPeriod}
                onPeriodChange={setTrendPeriod}
                loading={trendsLoading}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                {/* Upcoming Challenge */}
                <div className="flex h-full flex-col bg-white p-[14px] rounded-[12px] border border-grey-4">
                  <h3 className="text-[16px] font-bold font-sans text-grey-1 mb-6">Upcoming Challenge</h3>

                  {challengesLoading && (
                    <div className="space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 bg-grey-5 rounded-md animate-pulse" />
                      ))}
                    </div>
                  )}

                  {!challengesLoading && challenges.length === 0 && (
                    <DashboardEmptyState
                      icon={CalendarDays}
                      title="No upcoming challenges yet"
                      description="Scheduled challenges will appear here when your team is ready to begin."
                      className="min-h-[260px] flex-1"
                    />
                  )}

                  {!challengesLoading && challenges.length > 0 && (
                    <div className="space-y-6">
                      {challenges.slice(0, 4).map((challenge) => {
                        const date = new Date(challenge.startDate);
                        const day = date.getDate();
                        const suffix =
                          day % 10 === 1 && day !== 11 ? "st" :
                            day % 10 === 2 && day !== 12 ? "nd" :
                              day % 10 === 3 && day !== 13 ? "rd" : "th";
                        const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

                        return (
                          <div key={challenge.id} className="flex gap-4">
                            <div className="text-center min-w-[50px]">
                              <div className="text-[16px] font-normal text-[#4D4D4D] border-[#4D4D4D]">{day}{suffix}</div>
                              <div className="text-xs text-green-600 font-medium">{monthYear}</div>
                            </div>
                            <div className="w-0.5 bg-grey-4" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-[#4D4D4D] text-sm leading-[20px] truncate">{challenge.name}</h4>
                                {scope.type === "overview" && !challenge.branchId && (
                                  <span className="shrink-0 text-[10px] font-medium text-primary-1 bg-primary-5 px-1.5 py-0.5 rounded">General</span>
                                )}
                              </div>
                              <p className="text-xs text-grey-3 line-clamp-1">{challenge.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <Link href="/dashboard/challenges" className="text-sm font-bold text-primary-1 hover:underline">View all challenge</Link>
                  </div>
                </div>

                {/* Leaderboard */}
                <Leaderboard data={dashboardLeaderboard.map((entry) => ({
                  rank: entry.rank,
                  name: entry.name,
                  steps: `${entry.steps.toLocaleString()} Steps`,
                  avatar: String(entry.id),
                  trend: entry.trend,
                }))} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
