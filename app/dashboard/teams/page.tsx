"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Search, Plus, Users, Activity, TrendingUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { api } from "@/services/api";

export default function TeamsPage() {
  const { members: sourceMembers, departments: MOCK_DEPARTMENTS, activeBranch } = useDashboardData();
  const [members, setMembers] = useState(sourceMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeTeams: 0,
    engagementRate: "0%"
  });

  const updateStats = useCallback((branch: string, memberData: typeof sourceMembers) => {
    const branchMembers = memberData.filter(m => m.branch === branch);
    const branchDepts = MOCK_DEPARTMENTS.filter(d => d.branch === branch);

    // Calculate engagement based on activities in departments
    const totalActivities = branchDepts.reduce((acc, dept) => acc + dept.activities, 0);
    const engagement = branchMembers.length > 0 ? Math.min(100, Math.round((totalActivities / (branchMembers.length * 100)) * 100)) : 0;

    setStats({
      totalMembers: branchMembers.length,
      activeTeams: branchDepts.length,
      engagementRate: `${engagement}%`
    });
  }, [MOCK_DEPARTMENTS]);

  useEffect(() => {
    setMembers(sourceMembers);
    setCurrentPage(1);
    updateStats(activeBranch, sourceMembers);
  }, [activeBranch, sourceMembers, updateStats]);

  const dashboardStats = [
    {
      title: "Total Members",
      value: stats.totalMembers.toString(),
      trend: "+12% this month",
      trendColor: "text-green-500",
      icon: <Users className="w-5 h-5 text-blue-500" />,
      iconBg: "bg-blue-50"
    },
    {
      title: "Active Teams",
      value: stats.activeTeams.toString(),
      trend: "Stable",
      trendColor: "text-grey-2",
      icon: <Activity className="w-5 h-5 text-purple-500" />,
      iconBg: "bg-purple-50"
    },
    {
      title: "Engagement Rate",
      value: stats.engagementRate,
      trend: "+5% this month",
      trendColor: "text-green-500",
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      iconBg: "bg-green-50"
    }
  ];

  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<(typeof sourceMembers)[number] | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", department: "Engineering", role: "Employee" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMembers = members.filter(m =>
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(searchQuery.toLowerCase())) &&
    m.branch === activeBranch
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRemoveMember = async () => {
    if (memberToDelete !== null) {
      await api.resources.mutate({ resource: "members", action: "delete", id: memberToDelete });
      setMembers(members.filter(m => m.id !== memberToDelete));
      toast.success("Team member removed successfully");
      setMemberToDelete(null);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (memberToEdit) {
      await api.resources.mutate({ resource: "members", action: "update", id: memberToEdit.id, payload: memberToEdit });
      setMembers(members.map(m => m.id === memberToEdit.id ? memberToEdit : m));
      toast.success("Team member updated successfully");
      setMemberToEdit(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const member = {
      id: members.length + 1,
      ...newMember,
      status: "Good", // Default status from wellness report
      branch: activeBranch,
      avatar: `https://picsum.photos/seed/${newMember.name}/100/100`
    };
    await api.resources.mutate({ resource: "members", action: "create", payload: member });
    setMembers([member, ...members]);
    toast.success("Team member added successfully");
    setIsAddMemberModalOpen(false);
    setNewMember({ name: "", email: "", department: "Engineering", role: "Employee" });
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
          <h1 className="text-[20px] font-bold text-grey-1 mb-[6px] leading-[30px]">My Teams</h1>
          <p className="text-sm text-grey-2">Manage your team members, view their wellness status, and organize departments.</p>
        </div>
        <button
          onClick={() => setIsAddMemberModalOpen(true)}
          className="px-4 py-2 bg-[#C45700] text-white font-medium text-sm rounded-lg hover:bg-[#C45700]/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
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

        {/* Table/Cards View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-grey-4">
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Department</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-2 uppercase tracking-wider">Role</th>
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
                  <td className="py-3 px-4 text-sm text-grey-2">
                    <span className="px-2 py-1 bg-grey-5 rounded-md text-[10px] font-bold text-grey-2 border border-grey-4">
                      {member.role || "Employee"}
                    </span>
                  </td>
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
                  <td colSpan={6} className="py-8 text-center text-sm text-grey-2">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {paginatedMembers.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl border border-grey-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0">
                    <Image src={member.avatar} alt={member.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-grey-1">{member.name}</p>
                    <p className="text-xs text-grey-3">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMemberToEdit(member)}
                    className="p-2 text-grey-3 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMemberToDelete(member.id)}
                    className="p-2 text-grey-3 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-grey-4">
                <div>
                  <p className="text-[10px] text-grey-3 uppercase font-bold tracking-wider mb-1">Department</p>
                  <p className="text-xs text-grey-2 font-medium">{member.department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-grey-3 uppercase font-bold tracking-wider mb-1">Role</p>
                  <span className="px-2 py-0.5 bg-grey-5 rounded text-[10px] font-bold text-grey-2 border border-grey-4 inline-block">
                    {member.role || "Employee"}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-grey-3 uppercase font-bold tracking-wider mb-1">Wellness Status</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {paginatedMembers.length === 0 && (
            <div className="py-8 text-center text-sm text-grey-2 bg-grey-5 rounded-xl border border-dashed border-grey-4">
              No team members found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-grey-4 mt-4">
            <div className="text-[14px] leading-[20px] text-[#1A1A1A]">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
              >
                <ChevronsLeft className="w-4 h-4 text-[#626262]" /> First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
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
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4 text-[#626262]" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
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
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-grey-1 mb-1">Full Name</label>
            <Input
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-grey-1 mb-1">Email Address</label>
            <Input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              placeholder="e.g. john@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-grey-1 mb-1">Department</label>
            <select
              value={newMember.department}
              onChange={(e) => setNewMember({...newMember, department: e.target.value})}
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
            <label className="block text-sm font-medium text-grey-1 mb-1">Role</label>
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
              className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm bg-white"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-1 text-white text-sm font-medium rounded-lg hover:bg-primary-1/90 transition-colors"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={memberToEdit !== null}
        onClose={() => setMemberToEdit(null)}
        title="Edit Team Member"
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
              <label className="block text-sm font-medium text-grey-1 mb-1">Role</label>
              <select
                value={memberToEdit.role || "Employee"}
                onChange={(e) => setMemberToEdit({...memberToEdit, role: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-primary-1 text-sm bg-white"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Branch Manager">Branch Manager</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Employee">Employee</option>
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
