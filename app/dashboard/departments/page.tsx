"use client";

import { AnimatePresence } from "motion/react";
import { DrawerLayer } from "@/components/ui/drawer";

import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Users, Activity, Calendar, ChevronDown, Check, UserPlus, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useClickOutside } from "@/hooks/use-click-outside";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { toast } from "sonner";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { api } from "@/services/api";
import { useDashboardScope } from "@/lib/scope";
import { StatCard } from "@/components/dashboard/stat-card";
import type { DepartmentItem, DepartmentMemberInfo, OrganizationMemberInfo, StatTrend } from "@/types/api";
import { hasPermission } from "@/lib/permissions";
import { getUserErrorMessage } from "@/lib/errors";

export default function DepartmentsPage() {
  const { organizationId, branches, currentUser } = useDashboardData();
  const { scope } = useDashboardScope();
  const permissionBranchId = scope.type === "branch" ? scope.branchId : undefined;
  const canCreateDepartment = currentUser ? hasPermission(currentUser.permissions, "department.create", permissionBranchId) : false;
  const canUpdateDepartment = currentUser ? hasPermission(currentUser.permissions, "department.update", permissionBranchId) : false;
  const canDeleteDepartment = currentUser ? hasPermission(currentUser.permissions, "department.delete", permissionBranchId) : false;
  type Department = {
    id: string; name: string; members: number; activities: number; rank: number | null;
    branch: string; branchId: string; avatars: string[]; healthScore?: number; avgDailySteps: number | null;
  };
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMemberInfo[]>([]);
  const [departmentMembers, setDepartmentMembers] = useState<DepartmentMemberInfo[]>([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    totalActivity: 0,
    eventsCreated: 0,
    totalDepartments: 0,
    usersTrend: null as StatTrend | null,
    eventsTrend: null as StatTrend | null,
    departmentsTrend: null as StatTrend | null,
  });

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    const branchId = scope.type === "branch" ? scope.branchId : undefined;
    const load = async () => {
      try {
        // Department records are the primary data for this screen. Auxiliary
        // stats must never turn a valid department list into an empty/404 page.
        const departmentResponse = await api.organization.getDepartments(organizationId, branchId);
        const [rankResult, overallResult, activeResult, activityResult] = await Promise.allSettled([
          api.organization.getDepartmentRanks(organizationId, branchId),
          branchId ? api.organization.getBranchStats(organizationId, branchId) : api.organization.getStats(organizationId),
          branchId ? api.organization.getBranchActiveUserStats(organizationId, branchId) : api.organization.getActiveUserStats(organizationId),
          branchId ? api.organization.getBranchActivitySummary(organizationId, branchId) : api.organization.getActivitySummary(organizationId),
        ]);
        if (cancelled) return;
        const rankResponse = rankResult.status === "fulfilled" ? rankResult.value : { items: [] };
        const overallStats = overallResult.status === "fulfilled" ? overallResult.value : null;
        const activeStats = activeResult.status === "fulfilled" ? activeResult.value : null;
        const activitySummary = activityResult.status === "fulfilled" ? activityResult.value : null;
        const ranks = new Map(rankResponse.items.map((item) => [item.departmentId, item]));
        const branchNames = new Map(branches.map((branch) => [branch.id, branch.name]));
        setDepartments(departmentResponse.items.map((item: DepartmentItem) => {
          const rank = ranks.get(item.id);
          return {
            id: item.id, name: item.name, members: item.memberCount,
            activities: rank?.totalActivities ?? 0, rank: rank?.rank ?? null,
            branchId: item.branchId, branch: branchNames.get(item.branchId) ?? "Unknown branch",
            avatars: [], healthScore: rank?.performanceScore ? Number(rank.performanceScore) : undefined,
            avgDailySteps: rank?.avgDailySteps ? Number(rank.avgDailySteps) : null,
          };
        }));
        setSelectedDepartment(null);
        setStats({
          totalStaff: overallStats?.totalUsers ?? 0,
          activeStaff: activeStats?.totalUsers ?? 0,
          totalActivity: activitySummary?.totalCount ?? 0,
          eventsCreated: overallStats?.totalEvents ?? 0,
          totalDepartments: overallStats?.totalDepartments ?? departmentResponse.total,
          usersTrend: overallStats?.usersTrend ?? null,
          eventsTrend: overallStats?.eventsTrend ?? null,
          departmentsTrend: overallStats?.departmentsTrend ?? null,
        });
      } catch (error) {
        toast.error(getUserErrorMessage(error, "We couldn't load departments. Try again."));
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [organizationId, scope, branches]);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    api.organization.getMembers(organizationId).then((response) => {
      if (!cancelled) setOrganizationMembers(response.items);
    }).catch(() => {
      if (!cancelled) setOrganizationMembers([]);
    });
    return () => { cancelled = true; };
  }, [organizationId]);

  const dashboardStats = [
    {
      title: "Total Staff",
      value: stats.totalStaff.toString(),
      icon: Users,
      color: "text-red-500",
      bg: "bg-red-100",
      trend: stats.usersTrend,
    },
    {
      title: "Total Activity",
      value: stats.totalActivity.toLocaleString(),
      icon: Activity,
      color: "text-purple-500",
      bg: "bg-purple-100",
      trend: null,
    },
    {
      title: "Events Created",
      value: stats.eventsCreated.toString(),
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-100",
      trend: stats.eventsTrend,
    },
    {
      title: "Total Departments",
      value: stats.totalDepartments.toString(),
      icon: Users,
      color: "text-lime-600",
      bg: "bg-lime-100",
      trend: stats.departmentsTrend,
    }
  ];

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredDepartments = departments.filter((department) =>
    !normalizedSearch || department.name.toLowerCase().includes(normalizedSearch)
      || department.branch.toLowerCase().includes(normalizedSearch),
  );
  const selectedBranchName = scope.type === "branch"
    ? branches.find((branch) => branch.id === scope.branchId)?.name ?? "Branch"
    : "Organization overview";
  const filteredMembers = scope.type === "branch"
    ? organizationMembers.filter((member) => member.branchId === scope.branchId)
    : organizationMembers;

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    if (!organizationId || !selectedDepartment) {
      setDepartmentMembers([]);
      return;
    }
    let cancelled = false;
    api.organization.getDepartmentMembers(organizationId, selectedDepartment.id).then((response) => {
      if (!cancelled) setDepartmentMembers(response.items);
    }).catch(() => {
      if (!cancelled) setDepartmentMembers([]);
    });
    return () => { cancelled = true; };
  }, [organizationId, selectedDepartment]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editDepartmentName, setEditDepartmentName] = useState("");

  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(memberDropdownRef, () => setIsMemberDropdownOpen(false));

  const [activeTab, setActiveTab] = useState("Overview");
  const handleCreateDepartment = async () => {
    if (!organizationId || scope.type !== "branch") return;
    const created = await api.organization.createDepartment(
      organizationId, scope.branchId, newDepartmentName.trim() || "New Department",
    );
    await Promise.all(selectedMembers.map((id) =>
      api.organization.assignDepartmentMember(organizationId, created.id, id),
    ));
    const newDepartment: Department = {
      id: created.id, name: created.name, members: selectedMembers.length,
      activities: 0, rank: null, branch: selectedBranchName, branchId: created.branchId,
      avatars: selectedMembers.map(id => organizationMembers.find(m => m.id === id)?.avatarUrl).filter((avatar): avatar is string => Boolean(avatar)),
      avgDailySteps: null,
    };
    setDepartments([newDepartment, ...departments]);
    setIsCreateModalOpen(false);
    toast.success("Department created successfully!");

    // Reset form
    setNewDepartmentName("");
    setSelectedMembers([]);
  };

  const handleAddMembers = async () => {
    if (!organizationId || !selectedDepartment) return;
    await Promise.all(selectedMembers.map((id) =>
      api.organization.assignDepartmentMember(organizationId, selectedDepartment.id, id),
    ));
    setIsAddMemberModalOpen(false);
    toast.success("Members added successfully!");
    setSelectedMembers([]);
  };

  const handleEditDepartment = async () => {
    if (!selectedDepartment) return;
    if (!organizationId) return;
    await api.organization.updateDepartment(organizationId, selectedDepartment.id, editDepartmentName);
    const updatedDepartments = departments.map(dept =>
      dept.id === selectedDepartment.id ? { ...dept, name: editDepartmentName } : dept
    );
    setDepartments(updatedDepartments);
    setSelectedDepartment({ ...selectedDepartment, name: editDepartmentName });
    setIsEditModalOpen(false);
    toast.success("Department updated successfully!");
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    if (!organizationId) return;
    await api.organization.deleteDepartment(organizationId, selectedDepartment.id);
    const updatedDepartments = departments.filter(dept => dept.id !== selectedDepartment.id);
    setDepartments(updatedDepartments);
    setSelectedDepartment(null);
    setIsDeleteModalOpen(false);
    toast.success("Department deleted successfully!");
  };

  const toggleMemberSelection = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(mId => mId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-[12px]">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-description">Manage and track your organization&apos;s departments.</p>
        </div>
        {canCreateDepartment && scope.type === "branch" && <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#EA6A05] text-white rounded-lg text-sm font-medium hover:bg-[#C45700]"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </button>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={<stat.icon className="w-5 h-5" />}
            iconClassName={`${stat.bg} ${stat.color}`}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="m-0 p-0 lg:p-[12px] bg-transparent lg:bg-white rounded-[12px] flex flex-col lg:flex-row gap-6 lg:h-[600px]">
        {/* Left Sidebar - Department List */}
        <div className={`w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4 rounded-[12px] border-[1.5px] border-[#E6E6E6] p-[12px] bg-white ${selectedDepartment ? 'hidden lg:flex' : 'flex'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-0 no-scrollbar min-h-[400px] lg:min-h-0">
            {filteredDepartments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-[12px]">
                <h3 className="text-lg font-bold text-grey-1 mb-2">No department available</h3>
                <p className="text-sm text-grey-2 mb-6">
                  {scope.type === "overview"
                    ? "To create a department, kindly switch to a branch and create the department from that branch."
                    : "No department has been created for this branch yet."}
                </p>
                {canCreateDepartment && scope.type === "branch" && <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-white border border-[#EA6A05] text-[#EA6A05] rounded-lg text-sm font-medium hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4" />
                  Create Department
                </button>}
              </div>
            ) : (
              filteredDepartments.map((department) => (
                <div
                  key={department.id}
                  role="button" tabIndex={0}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedDepartment(department); } }}
                  onClick={() => setSelectedDepartment(department)}
                  className={`p-[12px] rounded-[12px] cursor-pointer transition-colors border-[1.5px] ${selectedDepartment?.id === department.id ? 'bg-white border-[#EA6A05] shadow-sm' : 'bg-white border-[#E6E6E6] hover:bg-grey-5'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border-[1.5px] ${selectedDepartment?.id === department.id ? 'bg-white border-[#EA6A05] text-[#EA6A05]' : 'bg-grey-5 border-transparent text-grey-2'}`}>
                        {department.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate font-bold text-sm text-grey-1">{department.name}</span>
                        {scope.type === "overview" && (
                          <span className="mt-0.5 inline-flex rounded-full bg-primary-5 px-2 py-0.5 text-[10px] font-medium text-primary-1">
                            {department.branch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-4 text-xs mb-3 text-grey-2`}>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {department.members} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      {department.activities} activities
                    </div>
                  </div>
                  {department.avatars && department.avatars.length > 0 && (
                    <div className="flex -space-x-2">
                      {department.avatars.slice(0, 4).map((avatar: string, i: number) => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 overflow-hidden relative border-white`}>
                          <Image src={avatar} alt="Member" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area - Department Details */}
        <div className={`flex-1 bg-white rounded-[12px] overflow-hidden flex flex-col ${!selectedDepartment ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedDepartment ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="empty-state-icon w-16 h-16 bg-grey-5 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-grey-1 mb-2">Please choose a department.</h3>
              <p className="text-sm text-grey-2">Pick a department from the list to see its details.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto border-[#E6E6E6] rounded-[12px] border-[1.5px] no-scrollbar">
              <div className="m-[12px] bg-[#FAFAFA] rounded-[12px] p-[12px]">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="lg:hidden flex items-center gap-2 text-sm font-medium text-grey-2 mb-4 hover:text-grey-1"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Back to List
                </button>

                <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-2xl font-bold text-orange-500 shrink-0">
                      {selectedDepartment.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-semibold text-grey-1">{selectedDepartment.name}</h2>
                        <span className="text-xs font-bold text-green-600">{selectedDepartment.rank ? `Rank #${selectedDepartment.rank}` : "Not ranked yet"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canUpdateDepartment && <button onClick={() => setIsAddMemberModalOpen(true)} className="w-8 h-8 rounded-lg bg-[#EA6A05] text-white flex items-center justify-center hover:bg-[#C45700]">
                      <UserPlus className="w-4 h-4" />
                    </button>}
                    {canUpdateDepartment && <button
                      onClick={() => {
                        setEditDepartmentName(selectedDepartment.name);
                        setIsEditModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg border border-grey-4 text-grey-2 flex items-center justify-center hover:bg-grey-5"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>}
                    {canDeleteDepartment && <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-8 h-8 rounded-lg border border-red-100 text-red-500 bg-red-50 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-[12px] border border-[#E6E6E6] bg-white">
                    <h3 className="text-xl font-bold text-grey-1 mb-1">{selectedDepartment.members}</h3>
                    <p className="text-xs text-grey-3">Members</p>
                  </div>
                  <div className="p-4 rounded-[12px] border border-[#E6E6E6] bg-white">
                    <h3 className={`${selectedDepartment.avgDailySteps === null ? "text-base" : "text-xl"} font-bold text-grey-1 mb-1`}>{selectedDepartment.avgDailySteps === null ? "N/A" : selectedDepartment.avgDailySteps.toLocaleString()}</h3>
                    <p className="text-xs text-grey-3">Avg Daily Steps</p>
                  </div>
                  <div className="p-4 rounded-[12px] border border-[#E6E6E6] bg-white">
                    <h3 className="text-xl font-bold text-grey-1 mb-1">{selectedDepartment.activities}</h3>
                    <p className="text-xs text-grey-3">Total Activities</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-[12px]">
                <div className="flex items-center gap-4 sm:gap-6 border-b border-grey-4 mb-6 overflow-x-auto no-scrollbar">
                  {["Overview", "Members", "Activities"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-[#EA6A05] text-[#EA6A05]' : 'border-transparent text-grey-2 hover:text-grey-1'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-[12px] pb-[12px]">
                {activeTab === "Overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-grey-1 mb-4">Department Performance</h3>
                      <div className="bg-[#FAFAFA] rounded-xl p-4 h-[250px] relative group">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { subject: 'Performance', A: selectedDepartment.healthScore ?? 0, fullMark: 100 },
                            { subject: 'Members', A: Math.min(selectedDepartment.members, 100), fullMark: 100 },
                            { subject: 'Activities', A: Math.min(selectedDepartment.activities, 100), fullMark: 100 },
                          ]}>
                            <PolarGrid stroke="#F2F4F7" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{ fill: '#475467', fontSize: 10, fontWeight: 500 }}
                            />
                            <Radar
                              name="Performance"
                              dataKey="A"
                              stroke="#EA6A05"
                              strokeWidth={2}
                              fill="#EA6A05"
                              fillOpacity={0.1}
                              dot={{ r: 3, fill: '#EA6A05', strokeWidth: 1, stroke: '#fff' }}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  let description = "";
                                  if (data.subject === 'Health Score') description = "Physical well-being and health metrics of members.";
                                  if (data.subject === 'Engagement') description = "Participation rate in challenges and activities.";

                                  return (
                                    <div className="bg-white p-2 border border-grey-4 rounded-lg shadow-sm">
                                      <p className="text-xs font-bold text-grey-1">{data.subject}: {data.A}%</p>
                                      {description && <p className="text-[10px] text-grey-2 max-w-[150px] mt-1">{description}</p>}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-grey-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#EA6A05]"></div>
                            <span>Health Score: Physical well-being</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#4B7BFF]"></div>
                            <span>Engagement: Activity participation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-grey-1 mb-4">Wellness Engagement Index</h3>
                      <div className="bg-[#FAFAFA] rounded-xl p-4 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{ name: "Current", score: selectedDepartment.healthScore ?? 0 }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 10 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 10 }} tickFormatter={(val) => `${val}`} ticks={[0, 20, 40, 60, 80, 100]} domain={[0, 100]} />
                            <Tooltip
                              cursor={{ fill: '#F2F4F7' }}
                              formatter={(value) => [`${value}`, 'Engagement Index']}
                              labelStyle={{ color: '#667085', fontSize: '12px' }}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #E4E7EC' }}
                            />
                            <Bar dataKey="score" fill="#FFA768" radius={[2, 2, 0, 0]} barSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Members" && (
                  <div>
                    <div className="space-y-4">
                      {departmentMembers.length === 0 ? <p className="py-8 text-center text-sm text-grey-3">No members have been assigned to this department.</p> : departmentMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E6E6E6] bg-white">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-xs font-bold text-grey-2">
                              {member.avatarUrl ? <Image src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" /> : `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-grey-1">{member.firstName} {member.lastName}</p>
                              <p className="text-[11px] text-grey-2">{member.email}</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium capitalize text-grey-3">{member.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Activities" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-grey-1 mb-4">Recent Activities</h3>
                    {(selectedDepartment.activities > 0 ? [
                      { id: "summary", type: "Activity", title: "Recorded department activities", date: "Live API total", status: "Tracked", points: selectedDepartment.activities.toLocaleString() },
                    ] : []).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl border border-[#E6E6E6] bg-white">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-grey-1">{activity.title}</p>
                            <p className="text-xs text-grey-3">{activity.type} â€¢ {activity.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{activity.points}</p>
                          <p className="text-[10px] text-grey-3 uppercase">{activity.status}</p>
                        </div>
                      </div>
                    ))}
                    {selectedDepartment.activities === 0 && <p className="rounded-xl border border-grey-4 bg-[#FAFAFA] py-10 text-center text-sm text-grey-3">No department activities have been recorded.</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteDepartment}
        title="Delete Department"
        description={`Are you sure you want to delete the ${selectedDepartment?.name} department? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />

      {/* Create Department Modal */}
      <AnimatePresence>{isCreateModalOpen && (
        <DrawerLayer onClose={() => setIsCreateModalOpen(false)} label="Create New Department" >
          <div className="flex h-full w-full flex-col overflow-hidden bg-white">
            <div className="h-[75px] shrink-0 px-6 border-b border-grey-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-grey-1">Create New Department</h2>
                <p className="text-xs text-grey-2">Fill in the details to start a new department</p>
              </div>
              <button type="button" aria-label="Close drawer" onClick={() => setIsCreateModalOpen(false)} className="text-grey-3 hover:text-grey-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-grey-1 mb-1.5">Department Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="e.g. Mongo Warriors"
                  className="w-full h-11 px-4 rounded-lg border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA6A05]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-1 mb-1.5">Add Team Member <span className="text-red-500">*</span></label>
                <div className="relative" ref={memberDropdownRef}>
                  <div
                    onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                    className="w-full min-h-[44px] px-4 py-2 rounded-lg border border-grey-4 text-sm text-grey-2 cursor-pointer flex items-center justify-between bg-white"
                  >
                    <span>Select team member to add, you can select multiple</span>
                    <ChevronDown className="w-4 h-4 text-grey-3" />
                  </div>

                  {isMemberDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grey-4 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto p-2">
                      {filteredMembers.map(member => (
                        <div
                          key={member.id}
                          onClick={() => toggleMemberSelection(member.id)}
                          className="flex items-center gap-3 p-2 hover:bg-grey-5 rounded-md cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedMembers.includes(member.id) ? 'bg-[#EA6A05] border-[#EA6A05]' : 'border-grey-3'}`}>
                            {selectedMembers.includes(member.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-[9px]">
                            {member.avatarUrl ? <Image src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" /> : member.firstName?.[0]}
                          </div>
                          <span className="text-sm text-grey-1">{member.firstName} {member.lastName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedMembers.map(id => {
                      const member = organizationMembers.find(m => m.id === id);
                      if (!member) return null;
                      return (
                        <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-grey-5 rounded-full border border-grey-4">
                          <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-[8px]">
                            {member.avatarUrl ? <Image src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" /> : member.firstName?.[0]}
                          </div>
                          <span className="text-xs font-medium text-grey-1">{member.firstName} {member.lastName}</span>
                          <button onClick={() => toggleMemberSelection(id)} className="text-red-400 hover:text-red-600 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="h-[75px] shrink-0 px-6 border-t border-grey-4 flex justify-end items-center gap-3 bg-grey-5">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2 rounded-lg border border-grey-4 text-sm font-medium text-grey-1 bg-white hover:bg-grey-5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDepartment}
                className="px-6 py-2 rounded-lg bg-[#EA6A05] text-white text-sm font-medium hover:bg-[#C45700]"
              >
                Create Department
              </button>
            </div>
          </div>
        </DrawerLayer>
      )}</AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>{isAddMemberModalOpen && (
        <DrawerLayer onClose={() => setIsAddMemberModalOpen(false)} label="Add a team member" >
          <div className="flex h-full w-full flex-col overflow-hidden bg-white">
            <div className="h-[75px] shrink-0 px-6 border-b border-grey-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-grey-1">Add a team member</h2>
                <p className="text-sm text-grey-2">Adding to {selectedDepartment?.name} Â· {selectedDepartment?.members} current members</p>
              </div>
              <button type="button" aria-label="Close drawer" onClick={() => setIsAddMemberModalOpen(false)} className="text-grey-3 hover:text-grey-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-grey-1 mb-1.5">Add Team Member <span className="text-red-500">*</span></label>
                <div className="relative" ref={memberDropdownRef}>
                  <div
                    onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                    className="w-full min-h-[44px] px-4 py-2 rounded-lg border border-grey-4 text-sm text-grey-2 cursor-pointer flex items-center justify-between bg-white"
                  >
                    <span>Select team member to add, you can select multiple</span>
                    <ChevronDown className="w-4 h-4 text-grey-3" />
                  </div>

                  {isMemberDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grey-4 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto p-2">
                      {filteredMembers.map(member => (
                        <div
                          key={member.id}
                          onClick={() => toggleMemberSelection(member.id)}
                          className="flex items-center gap-3 p-2 hover:bg-grey-5 rounded-md cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedMembers.includes(member.id) ? 'bg-[#EA6A05] border-[#EA6A05]' : 'border-grey-3'}`}>
                            {selectedMembers.includes(member.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-[9px]">
                            {member.avatarUrl ? <Image src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" /> : member.firstName?.[0]}
                          </div>
                          <span className="text-sm text-grey-1">{member.firstName} {member.lastName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedMembers.map(id => {
                      const member = organizationMembers.find(m => m.id === id);
                      if (!member) return null;
                      return (
                        <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-grey-5 rounded-full border border-grey-4">
                          <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-[8px]">
                            {member.avatarUrl ? <Image src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" /> : member.firstName?.[0]}
                          </div>
                          <span className="text-xs font-medium text-grey-1">{member.firstName} {member.lastName}</span>
                          <button onClick={() => toggleMemberSelection(id)} className="text-red-400 hover:text-red-600 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="h-[75px] shrink-0 px-6 border-t border-grey-4 flex justify-between items-center bg-grey-5">
              <span className="text-sm font-medium text-grey-1">{selectedMembers.length} Selected</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-grey-4 text-sm font-medium text-grey-1 bg-white hover:bg-grey-5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembers}
                  className="px-6 py-2 rounded-lg bg-[#EA6A05] text-white text-sm font-medium hover:bg-[#C45700]"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </DrawerLayer>
      )}</AnimatePresence>

      {/* Edit Department Modal */}
      <AnimatePresence>{isEditModalOpen && (
        <DrawerLayer onClose={() => setIsEditModalOpen(false)} label="Edit Department" >
          <div className="flex h-full w-full flex-col overflow-hidden bg-white">
            <div className="h-[75px] shrink-0 px-6 border-b border-grey-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-grey-1">Edit Department</h2>
                <p className="text-xs text-grey-2">Update the department details</p>
              </div>
              <button type="button" aria-label="Close drawer" onClick={() => setIsEditModalOpen(false)} className="text-grey-3 hover:text-grey-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-grey-1 mb-1.5">Department Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editDepartmentName}
                  onChange={(e) => setEditDepartmentName(e.target.value)}
                  placeholder="e.g. Mongo Warriors"
                  className="w-full h-11 px-4 rounded-lg border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA6A05]"
                />
              </div>
            </div>

            <div className="h-[75px] shrink-0 px-6 border-t border-grey-4 flex justify-end items-center gap-3 bg-grey-5">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 rounded-lg border border-grey-4 text-sm font-medium text-grey-1 bg-white hover:bg-grey-5"
              >
                Cancel
              </button>
              <button
                onClick={handleEditDepartment}
                className="px-6 py-2 rounded-lg bg-[#EA6A05] text-white text-sm font-medium hover:bg-[#C45700]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </DrawerLayer>
      )}</AnimatePresence>

    </div>
  );
}
