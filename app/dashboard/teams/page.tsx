"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Plus, Users, Activity, TrendingUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";

const STATS = [
  {
    title: "Total Members",
    value: "142",
    trend: "+12% this month",
    trendColor: "text-green-500",
    icon: <Users className="w-5 h-5 text-blue-500" />,
    iconBg: "bg-blue-50"
  },
  {
    title: "Active Teams",
    value: "8",
    trend: "Stable",
    trendColor: "text-grey-2",
    icon: <Activity className="w-5 h-5 text-purple-500" />,
    iconBg: "bg-purple-50"
  },
  {
    title: "Engagement Rate",
    value: "87%",
    trend: "+5% this month",
    trendColor: "text-green-500",
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    iconBg: "bg-green-50"
  }
];

const INITIAL_MEMBERS = [
  { id: 1, name: "Sarah Jenkins", email: "sarah.j@example.com", department: "Engineering", status: "Excellent", avatar: "https://picsum.photos/seed/sarah/100/100" },
  { id: 2, name: "Marcus Thorne", email: "marcus.t@example.com", department: "Design", status: "Good", avatar: "https://picsum.photos/seed/marcus/100/100" },
  { id: 3, name: "Elena Rodriguez", email: "elena.r@example.com", department: "Marketing", status: "Needs Attention", avatar: "https://picsum.photos/seed/elena/100/100" },
  { id: 4, name: "David Chen", email: "david.c@example.com", department: "Engineering", status: "Excellent", avatar: "https://picsum.photos/seed/david/100/100" },
  { id: 5, name: "Amira Hassan", email: "amira.h@example.com", department: "Sales", status: "Good", avatar: "https://picsum.photos/seed/amira/100/100" },
  { id: 6, name: "James Wilson", email: "james.w@example.com", department: "HR", status: "Excellent", avatar: "https://picsum.photos/seed/james/100/100" },
  { id: 7, name: "Lisa Taylor", email: "lisa.t@example.com", department: "Design", status: "Good", avatar: "https://picsum.photos/seed/lisa/100/100" },
  { id: 8, name: "Robert Fox", email: "robert.f@example.com", department: "Engineering", status: "Needs Attention", avatar: "https://picsum.photos/seed/robert/100/100" },
  { id: 9, name: "Kevin Hart", email: "kevin.h@example.com", department: "Marketing", status: "Good", avatar: "https://picsum.photos/seed/kevin/100/100" },
  { id: 10, name: "Rachel Green", email: "rachel.g@example.com", department: "Design", status: "Excellent", avatar: "https://picsum.photos/seed/rachel/100/100" },
];

export default function TeamsPage() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<typeof INITIAL_MEMBERS[0] | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRemoveMember = () => {
    if (memberToDelete !== null) {
      setMembers(members.filter(m => m.id !== memberToDelete));
      toast.success("Team member removed successfully");
      setMemberToDelete(null);
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberToEdit) {
      setMembers(members.map(m => m.id === memberToEdit.id ? memberToEdit : m));
      toast.success("Team member updated successfully");
      setMemberToEdit(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent": return "bg-green-50 text-green-600 border-green-200";
      case "Good": return "bg-blue-50 text-blue-600 border-blue-200";
      case "Needs Attention": return "bg-orange-50 text-orange-600 border-orange-200";
      default: return "bg-grey-5 text-grey-2 border-grey-4";
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-[20px] pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-0">
        <div>
          <h1 className="text-[20px] font-medium text-grey-1 mb-[6px] leading-[30px]">My Teams</h1>
          <p className="text-sm text-grey-2">Manage your team members, view their wellness status, and organize departments.</p>
        </div>
        <button className="px-4 py-2 bg-[#E65100] text-white font-medium text-sm rounded-lg hover:bg-[#E65100]/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Member
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
              <div className={`text-xs font-medium flex items-center gap-1 ${stat.trendColor}`}>
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div className="text-sm font-medium text-grey-2 mb-1">{stat.title}</div>
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
              placeholder="Search members..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9 pr-4 w-full rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-grey-4">
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Department</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Wellness Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member) => (
                <tr key={member.id} className="border-b border-grey-4 hover:bg-grey-5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                        <Image src={member.avatar} alt={member.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-sm font-medium text-grey-1">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-grey-2">{member.email}</td>
                  <td className="py-3 px-4 text-sm text-grey-2">{member.department}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setMemberToEdit(member)}
                        className="p-1.5 text-grey-3 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Member"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setMemberToDelete(member.id)}
                        className="p-1.5 text-grey-3 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-grey-2">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-grey-4 mt-4">
            <div className="text-[14px] leading-[20px] text-[#373737]">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
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

      <ConfirmModal
        isOpen={memberToDelete !== null}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member? This action cannot be undone."
        confirmText="Remove"
        isDestructive={true}
      />

      <Modal
        isOpen={memberToEdit !== null}
        onClose={() => setMemberToEdit(null)}
        title="Edit Team Member"
        maxWidth="max-w-md"
      >
        {memberToEdit && (
          <form onSubmit={handleSaveMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-grey-1 mb-1">Name</label>
              <input 
                type="text" 
                value={memberToEdit.name}
                onChange={(e) => setMemberToEdit({...memberToEdit, name: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-grey-1 mb-1">Email</label>
              <input 
                type="email" 
                value={memberToEdit.email}
                onChange={(e) => setMemberToEdit({...memberToEdit, email: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-grey-1 mb-1">Department</label>
              <select 
                value={memberToEdit.department}
                onChange={(e) => setMemberToEdit({...memberToEdit, department: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-grey-1 mb-1">Status</label>
              <select 
                value={memberToEdit.status}
                onChange={(e) => setMemberToEdit({...memberToEdit, status: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm bg-white"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setMemberToEdit(null)}
                className="px-4 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary-1 text-white text-sm font-medium rounded-lg hover:bg-primary-1/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
