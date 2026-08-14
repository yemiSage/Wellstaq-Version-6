// path: app/dashboard/challenges/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, Trophy, Users, Calendar, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { hasPermission } from "@/lib/permissions";
import { CreateChallengeModal } from "@/components/challenges/create-challenge-modal";
import type { ChallengeItem, ChallengeStatus, TrendData } from "@/types/api";

const STATUS_TABS: { label: string; value: ChallengeStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_BADGE_CLASS: Record<string, string> = {
  upcoming: "bg-blue-500/80 text-white",
  active: "bg-green-500/80 text-white",
  completed: "bg-grey-500/80 text-white",
  cancelled: "bg-red-500/80 text-white",
};

const ITEMS_PER_PAGE = 4;

type ChallengeFilter = "all" | "branch" | "org_wide";
type Period = "all" | "week" | "month" | "six_months" | "custom";

function daysLeft(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function TrendLabel({ trend }: { trend: TrendData | null }) {
  if (!trend) return <span className="text-xs font-medium text-grey-3">No trend data yet</span>;
  const isUp = trend.changePct >= 0;
  return (
    <span className={`text-xs font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
      {isUp ? "+" : ""}{trend.changePct}% vs last period
    </span>
  );
}

export default function ChallengesPage() {
  const { organizationId, currentUser } = useDashboardData();
  const { scope } = useDashboardScope();

  const [activeTab, setActiveTab] = useState<ChallengeStatus | "All">("All");
  const [challengeFilter, setChallengeFilter] = useState<ChallengeFilter>("all");
  const [period, setPeriod] = useState<Period>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [wellbeingNames, setWellbeingNames] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({
    activeChallenges: 0, activeChallengesTrend: null as TrendData | null,
    totalParticipants: 0, totalParticipantsTrend: null as TrendData | null,
    completionRate: 0, completionRateTrend: null as TrendData | null,
  });

  const canCreate = currentUser ? hasPermission(currentUser.permissions, "challenge.create") : false;

  useEffect(() => {
    if (canCreate && new URLSearchParams(window.location.search).get("create") === "1") {
      setIsCreateModalOpen(true);
      window.history.replaceState(null, "", "/dashboard/challenges");
    }
    const openCreateModal = () => {
      if (canCreate) setIsCreateModalOpen(true);
    };
    window.addEventListener("wellstaq:open-create-challenge", openCreateModal);
    return () => window.removeEventListener("wellstaq:open-create-challenge", openCreateModal);
  }, [canCreate]);

  // Overview has no single branch, so "branch only" isn't a valid choice there.
  useEffect(() => {
    if (scope.type === "overview" && challengeFilter === "branch") {
      setChallengeFilter("all");
    }
  }, [scope, challengeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [scope, activeTab, challengeFilter]);

  useEffect(() => {
    api.wellbeing.getChallenges().then((res) => {
      const map: Record<string, string> = {};
      res.items.forEach((w) => { map[w.id] = w.name; });
      setWellbeingNames(map);
    }).catch(() => setWellbeingNames({}));
  }, []);

  // Maps (dashboard scope × challengeFilter) -> API params, per the backend's actual filter semantics.
  const scopeParams = useMemo(() => {
    if (scope.type === "overview") {
      return challengeFilter === "org_wide"
        ? { scope: "organization" as const }        // org-wide only, no branch_id
        : { scope: "all" as const };                  // every challenge, all branches + org-wide
    }
    if (challengeFilter === "branch") {
      return { branchId: scope.branchId };            // exact branch only, org-wide excluded
    }
    if (challengeFilter === "org_wide") {
      return { scope: "organization" as const };      // org-wide only, no branch_id
    }
    return { branchId: scope.branchId, scope: "organization" as const }; // branch + org-wide
  }, [scope, challengeFilter]);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;

    async function load(orgId: string) {
      setIsLoading(true);
      try {
        const response = await api.organization.getChallenges(orgId, {
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          status: activeTab === "All" ? undefined : activeTab,
          ...scopeParams,
        });
        if (cancelled) return;
        setChallenges(response.items);
        setTotal(response.total);
      } catch {
        if (!cancelled) { setChallenges([]); setTotal(0); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load(organizationId);
    return () => { cancelled = true; };
  }, [organizationId, scopeParams, activeTab, currentPage, refreshKey]);

  useEffect(() => {
    if (!organizationId) return;
    if (period === "custom" && !customStart) return;
    let cancelled = false;

    async function loadStats(orgId: string) {
      try {
        const res = await api.organization.getChallengeStats(orgId, {
          ...scopeParams,
          period: period === "all" ? undefined : period,
          startDate: period === "custom" ? customStart : undefined,
          endDate: period === "custom" && customEnd ? customEnd : undefined,
        });
        if (!cancelled) setStats(res);
      } catch {
        if (!cancelled) setStats({
          activeChallenges: 0, activeChallengesTrend: null,
          totalParticipants: 0, totalParticipantsTrend: null,
          completionRate: 0, completionRateTrend: null,
        });
      }
    }
    void loadStats(organizationId);
    return () => { cancelled = true; };
  }, [organizationId, scopeParams, period, customStart, customEnd, refreshKey]);

  const filteredChallenges = challenges.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-[20px] pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-0 flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Wellness Challenges</h1>
          <p className="text-sm text-grey-2">Join community challenges, track your progress, and earn rewards.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="h-10 px-3 rounded-lg border border-grey-4 bg-white text-sm text-grey-2 focus:outline-none focus:ring-2 focus:ring-primary-1"
          >
            <option value="all">Overall</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="six_months">Last 6 months</option>
            <option value="custom">Custom range</option>
          </select>
          {period === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-10 px-3 rounded-lg border border-grey-4 bg-white text-sm text-grey-2 focus:outline-none focus:ring-2 focus:ring-primary-1"
              />
              <span className="text-grey-3 text-sm">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-10 px-3 rounded-lg border border-grey-4 bg-white text-sm text-grey-2 focus:outline-none focus:ring-2 focus:ring-primary-1"
              />
            </>
          )}
          {canCreate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#C45700] text-white font-medium text-sm rounded-lg hover:bg-[#C45700]/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Challenge
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-0">
        <div className="bg-white p-[14px] rounded-[12px] border border-grey-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
              <Trophy className="w-5 h-5" />
            </div>
            <TrendLabel trend={stats.activeChallengesTrend} />
          </div>
          <div className="text-sm font-medium text-grey-2 mb-1">Active Challenges</div>
          <div className="text-2xl font-bold text-grey-1">{stats.activeChallenges}</div>
        </div>
        <div className="bg-white p-[14px] rounded-[12px] border border-grey-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <TrendLabel trend={stats.totalParticipantsTrend} />
          </div>
          <div className="text-sm font-medium text-grey-2 mb-1">Total Participants</div>
          <div className="text-2xl font-bold text-grey-1">{stats.totalParticipants}</div>
        </div>
        <div className="bg-white p-[14px] rounded-[12px] border border-grey-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <TrendLabel trend={stats.completionRateTrend} />
          </div>
          <div className="text-sm font-medium text-grey-2 mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-grey-1">{stats.completionRate}%</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[12px] p-6 flex flex-col gap-[20px] border border-grey-4">
        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 w-full rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.value
                      ? "bg-white border border-[#C45700] text-[#C45700]"
                      : "bg-white border border-grey-4 text-grey-2 hover:bg-grey-5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope-of-challenges toggle: works in BOTH branch view and org overview */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setChallengeFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${challengeFilter === "all" ? "bg-primary-5 text-primary-1 font-medium" : "text-grey-2 hover:bg-grey-5"}`}
            >
              {scope.type === "overview" ? "All (overall branches + org-wide)" : "All (branch + org-wide)"}
            </button>
            {scope.type === "branch" && (
              <button
                onClick={() => setChallengeFilter("branch")}
                className={`px-3 py-1.5 rounded-md transition-colors ${challengeFilter === "branch" ? "bg-primary-5 text-primary-1 font-medium" : "text-grey-2 hover:bg-grey-5"}`}
              >
                This branch only
              </button>
            )}
            <button
              onClick={() => setChallengeFilter("org_wide")}
              className={`px-3 py-1.5 rounded-md transition-colors ${challengeFilter === "org_wide" ? "bg-primary-5 text-primary-1 font-medium" : "text-grey-2 hover:bg-grey-5"}`}
            >
              Org-wide only
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[340px] bg-grey-5 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredChallenges.map((challenge) => {
              const categoryLabel = challenge.wellbeingChallengeId ? wellbeingNames[challenge.wellbeingChallengeId] : null;
              const progress = challenge.completionRate ?? 0;

              return (
                <Link
                  href={`/dashboard/challenges/${challenge.id}`}
                  key={challenge.id}
                  className="bg-[#FAFAFA] rounded-lg border border-[#F0F0F0] overflow-hidden flex flex-col p-2 gap-2 h-auto sm:h-[340px] relative group"
                >
                  <div className="relative h-[120px] w-full rounded-lg overflow-hidden shrink-0 bg-grey-4">
                    {challenge.imageUrl && (
                      <Image src={challenge.imageUrl} alt={challenge.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md capitalize ${STATUS_BADGE_CLASS[challenge.status] ?? "bg-grey-500/80 text-white"}`}>
                        {challenge.status}
                      </span>
                    </div>
                    {categoryLabel && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-grey-1 backdrop-blur-sm shadow-sm">
                          {categoryLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 px-1 pb-2 pt-0 gap-[12px]">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-[#4D4D4D] text-[14px] leading-[20px] line-clamp-1">{challenge.name}</h3>
                      <p className="text-[12px] leading-[16px] text-[#999999] line-clamp-2">{challenge.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex items-center justify-between text-[12px] leading-[18px] text-[#999999]">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{challenge.participantCount} joined</span>
                          
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{daysLeft(challenge.endDate)} days left</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] leading-[14px]">
                          <span className="font-medium text-[#999999]">Progress</span>
                          <span className="font-bold text-[#C45700]">{progress}%</span>
                        </div>
                        <div className="w-full bg-grey-4 rounded-full h-1">
                          <div
                            className="bg-[#C45700] h-1 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && filteredChallenges.length === 0 && (
          <div className="text-center py-12 bg-[#FAFAFA] rounded-xl border border-[#F0F0F0]">
            <Trophy className="w-12 h-12 text-grey-3 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-grey-1 mb-1">No challenges found</h3>
            <p className="text-grey-2">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-grey-4 mt-4 gap-4">
            <div className="text-[14px] leading-[20px] text-[#1A1A1A]">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} challenges
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] text-[#1A1A1A] hover:bg-grey-5 flex items-center gap-1 h-[36px] disabled:opacity-50 shrink-0">
                <ChevronsLeft className="w-4 h-4 text-[#626262]" /> <span className="hidden sm:inline">First</span>
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] text-[#1A1A1A] hover:bg-grey-5 flex items-center gap-1 h-[36px] disabled:opacity-50 shrink-0">
                <ChevronLeft className="w-4 h-4 text-[#626262]" /> <span className="hidden sm:inline">Prev</span>
              </button>
              <div className="flex items-center gap-1 px-2 shrink-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
                      currentPage === page ? "bg-[#C45700] text-white" : "hover:bg-grey-5 text-grey-2"
                    }`}>
                    {page}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] text-[#1A1A1A] hover:bg-grey-5 flex items-center gap-1 h-[36px] disabled:opacity-50 shrink-0">
                <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4 text-[#626262]" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] text-[#1A1A1A] hover:bg-grey-5 flex items-center gap-1 h-[36px] disabled:opacity-50 shrink-0">
                <span className="hidden sm:inline">Last</span> <ChevronsRight className="w-4 h-4 text-[#626262]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
