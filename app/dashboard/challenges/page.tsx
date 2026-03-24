"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Filter, Plus, Trophy, Users, Calendar, ArrowRight, CheckCircle2, Clock, MoreHorizontal, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "Active Challenges", value: "12", trend: "+2 this week", trendColor: "text-green-600", icon: <Trophy className="w-5 h-5" />, iconBg: "bg-orange-50 text-orange-600" },
  { label: "Total Participants", value: "845", trend: "+12% vs last month", trendColor: "text-green-600", icon: <Users className="w-5 h-5" />, iconBg: "bg-blue-50 text-blue-600" },
  { label: "Completion Rate", value: "68%", trend: "-2% vs last month", trendColor: "text-red-600", icon: <CheckCircle2 className="w-5 h-5" />, iconBg: "bg-green-50 text-green-600" },
];

const CHALLENGES = [
  {
    id: 1,
    title: "10k Steps a Day",
    category: "Physical",
    status: "Active",
    participants: 124,
    daysLeft: 14,
    progress: 45,
    image: "https://images.unsplash.com/photo-1552674605-15c37127ec8d?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Hit 10,000 steps every day for a month to improve cardiovascular health and build a consistent walking habit."
  },
  {
    id: 2,
    title: "Mindful Mornings",
    category: "Mental",
    status: "Starting Soon",
    participants: 86,
    daysLeft: 30,
    progress: 0,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Dedicate 10 minutes each morning to meditation or deep breathing exercises before starting your workday."
  },
  {
    id: 3,
    title: "Hydration Hero",
    category: "Nutrition",
    status: "Active",
    participants: 210,
    daysLeft: 5,
    progress: 82,
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Drink at least 8 glasses (2 liters) of water daily to stay hydrated and maintain optimal energy levels."
  },
  {
    id: 4,
    title: "Screen-Free Evenings",
    category: "Mental",
    status: "Completed",
    participants: 156,
    daysLeft: 0,
    progress: 100,
    image: "https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Disconnect from all digital screens 2 hours before bedtime to improve sleep quality and reduce eye strain."
  },
  {
    id: 5,
    title: "Healthy Recipe Swap",
    category: "Nutrition",
    status: "Active",
    participants: 92,
    daysLeft: 21,
    progress: 30,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Cook and share one new healthy recipe with the community each week."
  },
  {
    id: 6,
    title: "Desk Stretches",
    category: "Physical",
    status: "Active",
    participants: 178,
    daysLeft: 10,
    progress: 65,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Perform a 5-minute stretching routine at your desk twice a day to reduce muscle tension and improve posture."
  }
];

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignType, setAssignType] = useState<"individual" | "department">("individual");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredChallenges = CHALLENGES.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || challenge.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const paginatedChallenges = filteredChallenges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleJoin = (title: string) => {
    toast.success(`Successfully joined "${title}" challenge!`);
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Challenge created and assigned successfully!");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-[20px] pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-0">
        <div>
          <h1 className="text-[20px] font-medium text-grey-1 mb-[6px] leading-[30px]">Wellness Challenges</h1>
          <p className="text-sm text-grey-2">Join community challenges, track your progress, and earn rewards.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#E65100] text-white font-medium text-sm rounded-lg hover:bg-[#E65100]/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Challenge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-0">
        {STATS.map((stat, idx) => (
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
                    ? "bg-white border border-[#E65100] text-[#E65100]" 
                    : "bg-white border border-grey-4 text-grey-2 hover:bg-grey-5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-[#FAFAFA] rounded-lg border border-[#F0F0F0] overflow-hidden flex flex-col p-2 gap-2 h-[340px] relative group">
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
                      <span className="font-bold text-[#E65100]">{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-grey-4 rounded-full h-1">
                      <div 
                        className="bg-[#E65100] h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12 bg-[#FAFAFA] rounded-xl border border-[#F0F0F0]">
            <Trophy className="w-12 h-12 text-grey-3 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-grey-1 mb-1">No challenges found</h3>
            <p className="text-grey-2">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-grey-4 mt-4">
            <div className="text-[14px] leading-[20px] text-[#373737]">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredChallenges.length)} of {filteredChallenges.length} challenges
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
              >
                <ChevronsLeft className="w-4 h-4 text-[#626262]" /> First
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-[#626262]" /> Prev
              </button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
                      currentPage === page 
                        ? "bg-[#E65100] text-white" 
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
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4 text-[#626262]" />
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
              >
                Last <ChevronsRight className="w-4 h-4 text-[#626262]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Challenge"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-grey-2">Challenge Title</label>
            <Input placeholder="e.g. 10k Steps a Day" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-grey-2">Category</label>
              <select className="w-full h-[44px] px-4 rounded-[8px] border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1">
                <option>Physical</option>
                <option>Mental</option>
                <option>Nutrition</option>
                <option>Social</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-grey-2">Duration (Days)</label>
              <Input type="number" placeholder="30" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-grey-2">Description</label>
            <textarea 
              className="w-full p-4 rounded-[8px] border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 min-h-[100px] resize-none"
              placeholder="Describe the challenge goals and rules..."
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs text-grey-2">Assign To</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="assignType" 
                  checked={assignType === "individual"} 
                  onChange={() => setAssignType("individual")}
                  className="w-4 h-4 accent-[#E65100]"
                />
                <span className="text-sm text-grey-1">Individuals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="assignType" 
                  checked={assignType === "department"} 
                  onChange={() => setAssignType("department")}
                  className="w-4 h-4 accent-[#E65100]"
                />
                <span className="text-sm text-grey-1">Departments</span>
              </label>
            </div>

            {assignType === "individual" ? (
              <div className="space-y-2">
                <label className="text-xs text-grey-2">Select Individuals</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
                  <Input className="pl-9" placeholder="Search employees by name or email..." />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Sarah Jenkins", "Marcus Thorne"].map(name => (
                    <div key={name} className="flex items-center gap-1.5 px-2 py-1 bg-grey-5 border border-grey-4 rounded-md text-xs text-grey-1">
                      {name}
                      <button type="button" className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-grey-2">Select Departments</label>
                <select className="w-full h-[44px] px-4 rounded-[8px] border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-[#E65100] hover:bg-[#E65100]/90">Create Challenge</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
