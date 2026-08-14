"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Plus, X, Users, Activity, Calendar, Award, ChevronDown, Check, UserPlus, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Image from "next/image";
import { useClickOutside } from "@/hooks/use-click-outside";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { hasPermission } from "@/lib/permissions";

const STATS = [
  {
    title: "Total Staff",
    value: "52",
    subtitle: "32 currently active",
    trend: "+4 this month",
    icon: Users,
    color: "text-red-500",
    bg: "bg-red-100",
    trendColor: "text-green-600"
  },
  {
    title: "Total Activity",
    value: "12,342",
    subtitle: "From last week",
    trend: "+21%",
    icon: Activity,
    color: "text-purple-500",
    bg: "bg-purple-100",
    trendColor: "text-green-600"
  },
  {
    title: "Events Created",
    value: "231",
    subtitle: "Scheduled events",
    trend: "+12",
    icon: Calendar,
    color: "text-blue-500",
    bg: "bg-blue-100",
    trendColor: "text-green-600"
  },
  {
    title: "Total Departments",
    value: "100",
    subtitle: "Wellness departments",
    trend: "+8",
    icon: Users,
    color: "text-lime-600",
    bg: "bg-lime-100",
    trendColor: "text-green-600"
  }
];

interface Club {
  id: number;
  name: string;
  members: number;
  activities: number;
  rank: number;
  avatars?: string[];
  description?: string;
  category?: string;
}

const MOCK_CLUBS: Club[] = [];

const MOCK_MEMBERS = [
  { id: 1, name: "Toby Forge", role: "Designer | Engineering", steps: 19875, rank: 1, trend: "up", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg" },
  { id: 2, name: "Luna Rivers", role: "Marketer | Sales", steps: 18450, rank: 2, trend: "down", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334554/diverse-young-people-holding-hands_z0tupa.jpg" },
  { id: 3, name: "Milo Sparks", role: "Manager | Operations", steps: 15030, rank: 3, trend: "down", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170726/wellstaq_onboarding_image_les0xq.png" },
  { id: 4, name: "Ava Quinn", role: "Developer | Engineering", steps: 14200, rank: 4, trend: "up", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg" },
  { id: 5, name: "Jasper Moon", role: "Designer | Engineering", steps: 12000, rank: 5, trend: "up", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334554/diverse-young-people-holding-hands_z0tupa.jpg" },
  { id: 6, name: "Ella Stone", role: "Marketer | Sales", steps: 11500, rank: 6, trend: "down", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170726/wellstaq_onboarding_image_les0xq.png" },
  { id: 7, name: "Finn Wilder", role: "Manager | Operations", steps: 10000, rank: 7, trend: "down", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg" },
];

const monthlyStepsData = [
  { name: 'Jan', steps: 500000 },
  { name: 'Feb', steps: 500000 },
  { name: 'Mar', steps: 500000 },
  { name: 'Apr', steps: 500000 },
  { name: 'May', steps: 550000 },
  { name: 'Jun', steps: 550000 },
  { name: 'Jul', steps: 550000 },
  { name: 'Aug', steps: 600000 },
  { name: 'Sep', steps: 600000 },
  { name: 'Oct', steps: 600000 },
  { name: 'Nov', steps: 520000 },
  { name: 'Dec', steps: 580000 },
];

export default function ClubsPage() {
  const { activeBranch, currentUser } = useDashboardData();
  const canCreateClub = currentUser ? hasPermission(currentUser.permissions, "club.create", currentUser.branchId) : false;
  const canUpdateClub = currentUser ? hasPermission(currentUser.permissions, "club.update", currentUser.branchId) : false;
  const canDeleteClub = currentUser ? hasPermission(currentUser.permissions, "club.delete", currentUser.branchId) : false;
  const [clubs, setClubs] = useState<Club[]>(MOCK_CLUBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddMemberSuccessModalOpen, setIsAddMemberSuccessModalOpen] = useState(false);

  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(memberDropdownRef, () => setIsMemberDropdownOpen(false));

  useEffect(() => {
    void api.resources.list("clubs", MOCK_CLUBS, `branch=${encodeURIComponent(activeBranch)}`).then(setClubs);
  }, [activeBranch]);

  const [activeTab, setActiveTab] = useState("Overview");
  const [activeFilter, setActiveFilter] = useState("All Clubs");

  const [isCopied, setIsCopied] = useState(false);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredClubs = clubs.filter((club) => !normalizedSearch
    || club.name.toLowerCase().includes(normalizedSearch)
    || (club.description ?? "").toLowerCase().includes(normalizedSearch)
    || (club.category ?? "").toLowerCase().includes(normalizedSearch));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateDepartment = async () => {
    const newDepartment = {
      id: clubs.length + 1,
      name: newDepartmentName || "New Department",
      members: selectedMembers.length,
      activities: 0,
      rank: clubs.length + 1,
      avatars: selectedMembers
        .map(id => MOCK_MEMBERS.find(m => m.id === id)?.avatar)
        .filter((avatar): avatar is string => Boolean(avatar))
    };
    await api.resources.mutate({ resource: "clubs", action: "create", payload: { ...newDepartment, branch: activeBranch } });
    setClubs([newDepartment, ...clubs]);
    setIsCreateModalOpen(false);
    setIsSuccessModalOpen(true);

    // Reset form
    setNewDepartmentName("");
    setSelectedMembers([]);
  };

  const handleAddMembers = async () => {
    await api.resources.mutate({ resource: "clubs", action: "add-members", id: selectedClub?.id, payload: { memberIds: selectedMembers } });
    setIsAddMemberModalOpen(false);
    setIsAddMemberSuccessModalOpen(true);
    setSelectedMembers([]);
  };

  const toggleMemberSelection = (id: number) => {
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
          <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">Clubs</h1>
          <p className="text-sm text-grey-2">Join communities that match your goals</p>
        </div>
        {canCreateClub && <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#EA6A05] text-white rounded-lg text-sm font-medium hover:bg-[#C45700]"
        >
          <Plus className="w-4 h-4" />
          Create Club
        </button>}
      </div>

      {/* Selection Tabs */}
      <div className="flex items-center gap-2 mb-[24px]">
        {["All Clubs", "My Clubs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === tab
                ? "bg-white border border-[#EA6A05] text-[#EA6A05]"
                : "bg-white border border-grey-4 text-grey-2 hover:bg-grey-5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {STATS.map((stat, i) => (
          <div key={i} className="dashboard-card">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center text-xs font-medium ${stat.trendColor}`}>
                <ArrowUpRight className="w-3 h-3 mr-1" /> {stat.trend}
              </span>
            </div>
            <p className="text-sm text-[#4D4D4D] mb-1 font-medium">{stat.title}</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">{stat.value}</h3>
            <p className="text-xs text-grey-3">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="m-0 p-[12px] bg-white rounded-[12px] flex flex-col lg:flex-row gap-6 lg:h-[600px] mt-[12px]">
        {/* Left Sidebar - Club List */}
        <div className={`w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4 rounded-[12px] border-[1.5px] border-[#E6E6E6] p-[12px] ${selectedClub ? 'hidden lg:flex' : 'flex'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar min-h-[400px] lg:min-h-0">
            {filteredClubs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-[12px]">
                <h3 className="text-lg font-bold text-grey-1 mb-2">No Clubs Available</h3>
                <p className="text-sm text-grey-2 mb-6">You haven&apos;t created any clubs yet. Start by creating clubs and adding team members!</p>
                {canCreateClub && <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-white border border-[#EA6A05] text-[#EA6A05] rounded-lg text-sm font-medium hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4" />
                  Create Club
                </button>}
              </div>
            ) : (
              filteredClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => setSelectedClub(club)}
                  className={`p-[12px] rounded-[12px] cursor-pointer transition-all border-[1.5px] ${selectedClub?.id === club.id ? 'bg-white border-[#EA6A05] shadow-sm' : 'bg-white border-[#E6E6E6] hover:bg-grey-5'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${selectedClub?.id === club.id ? 'bg-orange-50 text-[#EA6A05]' : 'bg-grey-5 text-grey-2'}`}>
                        {club.name.charAt(0)}
                      </div>
                      <span className={`font-bold text-sm text-grey-1`}>{club.name}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-4 text-xs mb-3 text-grey-2`}>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {club.members} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      {club.activities} activities
                    </div>
                  </div>
                  {club.avatars && club.avatars.length > 0 && (
                    <div className="flex -space-x-2">
                      {club.avatars.slice(0, 4).map((avatar: string, i: number) => (
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

        {/* Right Area - Club Details */}
        <div className={`flex-1 bg-white rounded-[12px] overflow-hidden flex flex-col ${!selectedClub ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedClub ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-500">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-grey-1 mb-2">Please choose a club.</h3>
              <p className="text-sm text-grey-2">Pick a club from the list to see its details.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto border-[#E6E6E6] rounded-[12px] border-[1.5px] no-scrollbar">
              <div className="m-[12px] bg-[#FAFAFA] rounded-[12px] p-[12px]">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedClub(null)}
                  className="lg:hidden flex items-center gap-2 text-sm font-medium text-grey-2 mb-4 hover:text-grey-1"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Back to List
                </button>

                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-grey-5 flex items-center justify-center text-2xl font-bold text-grey-2 shrink-0">
                      {selectedClub.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-lg font-bold text-grey-1">{selectedClub.name}</h2>
                        <span className="text-xs font-bold text-green-600">Rank #{selectedClub.rank}</span>
                      </div>
                      <p className="text-sm text-grey-2 mb-2">{selectedClub.description}</p>
                      <span className="px-2 py-1 bg-orange-50 text-[#EA6A05] text-[10px] font-medium rounded-full">
                        {selectedClub.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canUpdateClub && <button onClick={() => setIsAddMemberModalOpen(true)} className="w-8 h-8 rounded-lg bg-[#EA6A05] text-white flex items-center justify-center hover:bg-[#C45700]">
                      <UserPlus className="w-4 h-4" />
                    </button>}
                    {canUpdateClub && <button className="w-8 h-8 rounded-lg border border-grey-4 text-grey-2 flex items-center justify-center hover:bg-grey-5">
                      <Edit2 className="w-4 h-4" />
                    </button>}
                    {canDeleteClub && <button className="w-8 h-8 rounded-lg border border-red-100 text-red-500 bg-red-50 flex items-center justify-center hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-[#E6E6E6] bg-white">
                    <h3 className="text-2xl font-bold text-grey-1 mb-1">{selectedClub.members}</h3>
                    <p className="text-xs text-grey-3">Members</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[#E6E6E6] bg-white">
                    <h3 className="text-2xl font-bold text-grey-1 mb-1">18,500</h3>
                    <p className="text-xs text-grey-3">Avg Daily Steps</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[#E6E6E6] bg-white">
                    <h3 className="text-2xl font-bold text-grey-1 mb-1">{selectedClub.activities}</h3>
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
                      <h3 className="text-sm font-bold text-grey-1 mb-4">Club Performance</h3>
                      <div className="bg-[#FAFAFA] rounded-xl p-4 h-[250px] relative group">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { subject: 'Health Score', A: 85, fullMark: 100 },
                            { subject: 'Engagement', A: 70, fullMark: 100 },
                            { subject: 'Retention', A: 85, fullMark: 100 },
                            { subject: 'Productivity', A: 78, fullMark: 100 },
                            { subject: 'Satisfaction', A: 92, fullMark: 100 }
                          ]}>
                            <PolarGrid stroke="#F2F4F7" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475467', fontSize: 10, fontWeight: 500 }} />
                            <Radar name="Performance" dataKey="A" stroke="#EA6A05" strokeWidth={2} fill="#EA6A05" fillOpacity={0.1} dot={{ r: 3, fill: '#EA6A05', strokeWidth: 1, stroke: '#fff' }} />
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
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-grey-1 mb-4">Wellness Engagement Index</h3>
                      <div className="bg-[#FAFAFA] rounded-xl p-4 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyStepsData.map(d => ({ ...d, score: d.steps / 10000 }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                    <h3 className="text-sm font-bold text-grey-1 mb-4">Wellbeing Score</h3>
                    <div className="space-y-4">
                      {MOCK_MEMBERS.slice(0, 5).map((member, idx) => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E6E6E6] bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative">
                              <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-grey-1">{member.name}</p>
                              <p className="text-[11px] text-grey-2">{idx === 0 ? "Designer | Engineering" : idx === 1 ? "Marketer | Sales" : idx === 2 ? "Manager | Operations" : "Developer | Engineering"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm font-bold text-grey-1">{85 + idx * 2}%</p>
                              <p className="text-[10px] text-grey-3 uppercase tracking-wider">Score</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-grey-1">#{member.rank}</span>
                              {member.trend === 'up' ? (
                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                              ) : member.trend === 'down' ? (
                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                              ) : (
                                <div className="w-4 h-0.5 bg-grey-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Activities" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-grey-1 mb-4">Recent Activities</h3>
                    {[
                      { id: 1, type: 'Challenge', title: 'Morning Yoga Session', date: 'Today, 08:30 AM', status: 'Completed', points: '+50' },
                      { id: 2, type: 'Club', title: 'Weekly Run Club', date: 'Yesterday, 06:00 PM', status: 'Completed', points: '+120' },
                      { id: 3, type: 'Event', title: 'Mental Health Webinar', date: '2 days ago', status: 'Upcoming', points: '+30' },
                    ].map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl border border-[#E6E6E6] bg-white">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.type === 'Challenge' ? 'bg-orange-100 text-orange-600' :
                            activity.type === 'Club' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {activity.type === 'Challenge' ? <Award className="w-5 h-5" /> :
                             activity.type === 'Club' ? <Activity className="w-5 h-5" /> :
                             <Calendar className="w-5 h-5" />}
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
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Department Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-grey-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-grey-1 mb-1">Create New Department</h2>
                <p className="text-sm text-grey-2">Fill in the details to start a new department</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-grey-3 hover:text-grey-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-5 overflow-y-auto">
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
                      {MOCK_MEMBERS.map(member => (
                        <div
                          key={member.id}
                          onClick={() => toggleMemberSelection(member.id)}
                          className="flex items-center gap-3 p-2 hover:bg-grey-5 rounded-md cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedMembers.includes(member.id) ? 'bg-[#EA6A05] border-[#EA6A05]' : 'border-grey-3'}`}>
                            {selectedMembers.includes(member.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="w-6 h-6 rounded-full overflow-hidden relative">
                            <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                          </div>
                          <span className="text-sm text-grey-1">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedMembers.map(id => {
                      const member = MOCK_MEMBERS.find(m => m.id === id);
                      if (!member) return null;
                      return (
                        <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-grey-5 rounded-full border border-grey-4">
                          <div className="w-5 h-5 rounded-full overflow-hidden relative">
                            <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                          </div>
                          <span className="text-xs font-medium text-grey-1">{member.name}</span>
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

            <div className="p-6 border-t border-grey-4 flex justify-end gap-3 bg-grey-5/30">
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
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 flex flex-col items-center text-center relative">
            <button onClick={() => setIsSuccessModalOpen(false)} className="absolute top-4 right-4 text-grey-3 hover:text-grey-1">
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-[#EA6A05]">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>

            <h2 className="text-xl font-bold text-grey-1 mb-2">Club successfully created</h2>
            <p className="text-sm text-grey-2 mb-8">
              Your club <span className="font-bold text-grey-1">{clubs[0]?.name}</span> have been successfully created
            </p>

            <div className="w-full flex items-center justify-between p-3 border border-grey-4 rounded-lg bg-white">
              <span className="text-sm text-grey-2 truncate mr-2">Https://wellstaq.com/clubs/{clubs[0]?.name.toLowerCase().replace(/\s+/g, '_')}...</span>
              <button
                onClick={() => handleCopy(`Https://wellstaq.com/clubs/${clubs[0]?.name.toLowerCase().replace(/\s+/g, '_')}`)}
                className={`flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors ${isCopied ? 'text-green-600' : 'text-grey-1'}`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-grey-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-grey-1 mb-1">Add a team member</h2>
                <p className="text-sm text-grey-2">Adding to {selectedClub?.name} Â· {selectedClub?.members} current members</p>
              </div>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-grey-3 hover:text-grey-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
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
                      {MOCK_MEMBERS.map(member => (
                        <div
                          key={member.id}
                          onClick={() => toggleMemberSelection(member.id)}
                          className="flex items-center gap-3 p-2 hover:bg-grey-5 rounded-md cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedMembers.includes(member.id) ? 'bg-[#EA6A05] border-[#EA6A05]' : 'border-grey-3'}`}>
                            {selectedMembers.includes(member.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="w-6 h-6 rounded-full overflow-hidden relative">
                            <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                          </div>
                          <span className="text-sm text-grey-1">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedMembers.map(id => {
                      const member = MOCK_MEMBERS.find(m => m.id === id);
                      if (!member) return null;
                      return (
                        <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-grey-5 rounded-full border border-grey-4">
                          <div className="w-5 h-5 rounded-full overflow-hidden relative">
                            <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                          </div>
                          <span className="text-xs font-medium text-grey-1">{member.name}</span>
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

            <div className="p-6 border-t border-grey-4 flex justify-between items-center bg-grey-5/30">
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
        </div>
      )}

      {/* Add Member Success Modal */}
      {isAddMemberSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 flex flex-col items-center text-center relative">
            <button onClick={() => setIsAddMemberSuccessModalOpen(false)} className="absolute top-4 right-4 text-grey-3 hover:text-grey-1">
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-[#EA6A05]">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>

            <h2 className="text-xl font-bold text-grey-1 mb-2">Members have been added successfully!</h2>
            <p className="text-sm text-grey-2">
              New members have been added successfully! They will be notified and added to the department.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
