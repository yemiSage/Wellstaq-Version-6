"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, Trophy, Users, Calendar, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useClickOutside } from "@/hooks/use-click-outside";
import { api } from "@/services/api";

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { challenges: sourceChallenges, activeBranch, members: INITIAL_MEMBERS, departments } = useDashboardData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [challenges, setChallenges] = useState(sourceChallenges);
  const [stats, setStats] = useState({
    activeChallenges: 0,
    totalParticipants: 0,
    completionRate: "0%"
  });

  const updateStats = useCallback((branch: string, challengeData: typeof sourceChallenges) => {
    const branchChallenges = challengeData.filter(c => c.branch === branch);
    const active = branchChallenges.filter(c => c.status === 'Active').length;
    const participants = branchChallenges.reduce((acc, c) => acc + c.participants, 0);
    const avgProgress = branchChallenges.length > 0
      ? Math.round(branchChallenges.reduce((acc, c) => acc + c.progress, 0) / branchChallenges.length)
      : 0;

    setStats({
      activeChallenges: active,
      totalParticipants: participants,
      completionRate: `${avgProgress}%`
    });
  }, []);

  useEffect(() => {
    setChallenges(sourceChallenges);
    setCurrentPage(1);
    updateStats(activeBranch, sourceChallenges);
  }, [activeBranch, sourceChallenges, updateStats]);

  const dashboardStats = [
    { label: "Active Challenges", value: stats.activeChallenges.toString(), trend: "+2 this week", trendColor: "text-green-600", icon: <Trophy className="w-5 h-5" />, iconBg: "bg-orange-50 text-orange-600" },
    { label: "Total Participants", value: stats.totalParticipants.toString(), trend: "+12% vs last month", trendColor: "text-green-600", icon: <Users className="w-5 h-5" />, iconBg: "bg-blue-50 text-blue-600" },
    { label: "Completion Rate", value: stats.completionRate, trend: "-2% vs last month", trendColor: "text-red-600", icon: <CheckCircle2 className="w-5 h-5" />, iconBg: "bg-green-50 text-green-600" },
  ];

  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("");
  const [reward, setReward] = useState("");
  useClickOutside(assigneeRef, () => setIsAssigneeOpen(false));

  const assigneeOptions = [
    ...departments.map((department) => ({ key: `department:${department.id}`, label: department.name, detail: "Department" })),
    ...INITIAL_MEMBERS.map((member) => ({ key: `member:${member.id}`, label: member.name, detail: `${member.department} · Individual` })),
  ].filter((option) => `${option.label} ${option.detail}`.toLowerCase().includes(assigneeQuery.toLowerCase()));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || challenge.status === activeTab;
    const matchesBranch = challenge.branch === activeBranch;
    return matchesSearch && matchesTab && matchesBranch;
  });

  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const paginatedChallenges = filteredChallenges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.resources.mutate({ resource: "challenges", action: "create", payload: { branch: activeBranch, category, reward, assignees: selectedAssignees } });
    toast.success("Challenge created and assigned successfully!");
    setIsCreateModalOpen(false);
    setAssigneeQuery("");
    setSelectedAssignees([]);
    setIsAssigneeOpen(false);
    setCategory("");
    setReward("");
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-[20px] pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-0">
        <div>
          <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Wellness Challenges</h1>
          <p className="text-sm text-grey-2">Join community challenges, track your progress, and earn rewards.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#C45700] text-white font-medium text-sm rounded-lg hover:bg-[#C45700]/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Challenge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-0">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-[14px] rounded-[12px] border border-grey-4">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <div className={`text-xs font-medium ${stat.trendColor}`}>
                {stat.trend}
              </div>
            </div>
            <div className="text-sm font-medium text-grey-2 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-grey-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[12px] p-6 flex flex-col gap-[20px] border border-grey-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9 pr-4 w-full rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {["All", "Active", "Starting Soon", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-white border border-[#C45700] text-[#C45700]"
                    : "bg-white border border-grey-4 text-grey-2 hover:bg-grey-5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {paginatedChallenges.map((challenge) => (
            <Link href={`/dashboard/challenges/${challenge.id}`} key={challenge.id} className="bg-[#FAFAFA] rounded-lg border border-[#F0F0F0] overflow-hidden flex flex-col p-2 gap-2 h-auto sm:h-[340px] relative group">
              <div className="relative h-[120px] w-full rounded-lg overflow-hidden shrink-0">
                <Image
                  src={challenge.image}
                  alt={challenge.title}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md ${
                    challenge.status === 'Active' ? 'bg-green-500/80 text-white' :
                    challenge.status === 'Starting Soon' ? 'bg-blue-500/80 text-white' :
                    'bg-grey-500/80 text-white'
                  }`}>
                    {challenge.status}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-grey-1 backdrop-blur-sm shadow-sm">
                    {challenge.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1 px-1 pb-2 pt-0 gap-[12px]">
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-[#4D4D4D] text-[14px] leading-[20px] line-clamp-1">{challenge.title}</h3>
                  <p className="text-[12px] leading-[16px] text-[#999999] line-clamp-2">{challenge.description}</p>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <div className="flex items-center justify-between text-[12px] leading-[18px] text-[#999999]">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{challenge.participants} joined</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{challenge.daysLeft} days left</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] leading-[14px]">
                      <span className="font-medium text-[#999999]">Progress</span>
                      <span className="font-bold text-[#C45700]">{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-grey-4 rounded-full h-1">
                      <div
                        className="bg-[#C45700] h-1 rounded-full transition-all duration-500"
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
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
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredChallenges.length)} of {filteredChallenges.length} challenges
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50 shrink-0"
              >
                <ChevronsLeft className="w-4 h-4 text-[#626262]" /> <span className="hidden sm:inline">First</span>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50 shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-[#626262]" /> <span className="hidden sm:inline">Prev</span>
              </button>
              <div className="flex items-center gap-1 px-2 shrink-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? "bg-[#C45700] text-white"
                        : "hover:bg-grey-5 text-grey-2"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50 shrink-0"
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4 text-[#626262]" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50 shrink-0"
              >
                <span className="hidden sm:inline">Last</span> <ChevronsRight className="w-4 h-4 text-[#626262]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setIsAssigneeOpen(false); }}
        title="Create New Challenge"
        footer={
          <>
            <Button type="button" variant="outline" className="border-grey-4 bg-white text-grey-2 hover:bg-grey-5" onClick={() => { setIsCreateModalOpen(false); setIsAssigneeOpen(false); }}>Cancel</Button>
            <Button type="submit" form="create-challenge-form">Create Challenge</Button>
          </>
        }
      >
        <form id="create-challenge-form" onSubmit={handleCreateChallenge} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-grey-2">Challenge Title</label>
            <Input placeholder="e.g. 10k Steps a Day" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-grey-2">Category</label>
              <Input placeholder="e.g. Physical wellness" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-grey-2">Duration (Days)</label>
              <Input type="number" placeholder="30" required />
            </div>
          </div>

          <div ref={assigneeRef} className="space-y-2">
            <label className="text-xs text-grey-2">Reward</label>
            <Input placeholder="e.g. Fitness tracker and gift card" value={reward} onChange={(e) => setReward(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-grey-2">Description</label>
            <textarea
              className="w-full p-4 rounded-[8px] border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 min-h-[100px] resize-none"
              placeholder="Describe the challenge goals and rules..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-grey-2">Select assignee</label>
            <div className="relative" onClick={() => setIsAssigneeOpen(true)}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-3" />
              <Input className="pl-9" placeholder="Search departments or individuals..." value={assigneeQuery} onChange={(e) => setAssigneeQuery(e.target.value)} />
            </div>
            {isAssigneeOpen && <div className="max-h-40 space-y-1 overflow-y-auto rounded-[8px] border border-grey-4 bg-white p-2">
              {assigneeOptions.map((option) => {
                const selected = selectedAssignees.includes(option.key);
                return <button key={option.key} type="button" onClick={() => setSelectedAssignees((current) => selected ? current.filter((key) => key !== option.key) : [...current, option.key])} className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left ${selected ? "bg-primary-5 text-primary-1" : "hover:bg-grey-5"}`}>
                  <span><span className="block text-sm font-medium text-grey-1">{option.label}</span><span className="block text-xs text-grey-3">{option.detail}</span></span>
                  {selected && <CheckCircle2 className="h-4 w-4 text-primary-1" />}
                </button>;
              })}
            </div>}
            {selectedAssignees.length > 0 && <p className="text-xs text-grey-3">{selectedAssignees.length} assignee{selectedAssignees.length === 1 ? "" : "s"} selected</p>}
          </div>

        </form>
      </Modal>
    </div>
  );
}
