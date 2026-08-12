"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Users, Activity, UserCheck, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { StatCard } from "@/components/dashboard/stat-card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { DepartmentItem, OrganizationMemberInfo, RoleItem } from "@/types/api";
import { hasPermission } from "@/lib/permissions";
import { humanizeIdentifier } from "@/lib/format";

export default function TeamsPage() {
  const { organizationId, branches, currentUser } = useDashboardData();
  const { scope } = useDashboardScope();
  const [members, setMembers] = useState<OrganizationMemberInfo[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteRolesLoading, setInviteRolesLoading] = useState(false);
  const [invite, setInvite] = useState({ email: "", branchId: "", departmentId: "", roleId: "" });
  const [selectedMember, setSelectedMember] = useState<OrganizationMemberInfo | null>(null);
  const [manageRoles, setManageRoles] = useState<RoleItem[]>([]);
  const [manageDepartments, setManageDepartments] = useState<DepartmentItem[]>([]);
  const [memberChanges, setMemberChanges] = useState({ roleId: "", departmentId: "", branchId: "", branchDepartmentId: "" });
  const [pendingChange, setPendingChange] = useState<"role" | "department" | "branch" | null>(null);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const canInvite = currentUser ? hasPermission(currentUser.permissions, "member.invite", scope.type === "branch" ? scope.branchId : undefined) : false;
  const permissionBranchId = scope.type === "branch" ? scope.branchId : undefined;
  const canAssignRole = currentUser ? hasPermission(currentUser.permissions, "member.role.assign", permissionBranchId) : false;
  const canAssignDepartment = currentUser ? hasPermission(currentUser.permissions, "member.department.assign", permissionBranchId) : false;
  const canAssignBranch = currentUser ? hasPermission(currentUser.permissions, "member.branch.assign", permissionBranchId) : false;

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    const branchId = scope.type === "branch" ? scope.branchId : undefined;
    setIsLoading(true);
    Promise.all([
      api.organization.getMembers(organizationId, { limit: 200 }),
      api.organization.getDepartments(organizationId, branchId),
    ]).then(([memberResponse, departmentResponse]) => {
      if (cancelled) return;
      setMembers(memberResponse.items);
      setDepartments(departmentResponse.items);
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [organizationId, scope]);

  useEffect(() => {
    if (!isInviteOpen || !organizationId || !invite.branchId) {
      if (isInviteOpen) setRoles([]);
      return;
    }
    let cancelled = false;
    setInviteRolesLoading(true);
    setInvite((current) => ({ ...current, roleId: "" }));
    api.roles.listOrganization(organizationId, invite.branchId)
      .then((response) => {
        if (!cancelled) setRoles(response.items.filter((role) => role.name.trim().toLowerCase().replaceAll(" ", "_") !== "super_admin"));
      })
      .finally(() => { if (!cancelled) setInviteRolesLoading(false); });
    return () => { cancelled = true; };
  }, [invite.branchId, isInviteOpen, organizationId]);

  const branchNames = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches]);
  const departmentNames = useMemo(() => new Map(departments.map((department) => [department.id, department.name])), [departments]);
  const scopedMembers = useMemo(() => (
    scope.type === "branch" ? members.filter((member) => member.branchId === scope.branchId) : members
  ), [members, scope]);
  const query = searchQuery.trim().toLowerCase();
  const filteredMembers = scopedMembers.filter((member) => {
    const name = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim();
    const department = member.departmentId ? departmentNames.get(member.departmentId) ?? "" : "";
    return name.toLowerCase().includes(query) || (member.email ?? "").toLowerCase().includes(query) || department.toLowerCase().includes(query);
  });
  const activeMembers = scopedMembers.filter((member) => member.status?.toLowerCase() === "active").length;
  const inviteDepartments = departments.filter((department) => department.branchId === invite.branchId);
  const inviteRoles = roles.filter((role) => !role.branchId || role.branchId === invite.branchId);

  const openInvite = () => {
    const branchId = scope.type === "branch" ? scope.branchId : branches[0]?.id ?? "";
    setInvite({ email: "", branchId, departmentId: "", roleId: "" });
    setIsInviteOpen(true);
  };

  const openMemberManagement = async (member: OrganizationMemberInfo) => {
    if (!organizationId || (!canAssignRole && !canAssignDepartment && !canAssignBranch)) return;
    setSelectedMember(member);
    setMemberChanges({ roleId: member.roleId ?? "", departmentId: member.departmentId ?? "", branchId: member.branchId ?? "", branchDepartmentId: member.departmentId ?? "" });
    const [roleResponse, departmentResponse] = await Promise.all([
      api.roles.listOrganization(organizationId, permissionBranchId),
      api.organization.getDepartments(organizationId),
    ]);
    setManageRoles(roleResponse.items.filter((role) => role.name !== "super_admin"));
    setManageDepartments(departmentResponse.items);
  };

  const confirmMemberChange = async () => {
    if (!organizationId || !selectedMember || !pendingChange) return;
    setIsUpdatingMember(true);
    try {
      if (pendingChange === "role") {
        const role = manageRoles.find((item) => item.id === memberChanges.roleId);
        if (!role) return;
        await api.roles.assignToMember(organizationId, selectedMember.id, role);
        setMembers((items) => items.map((item) => item.id === selectedMember.id ? { ...item, roleId: role.id, roleName: role.name } : item));
        setSelectedMember({ ...selectedMember, roleId: role.id, roleName: role.name });
        toast.success(`${selectedMember.firstName}'s role is now ${humanizeIdentifier(role.name)}.`);
      } else if (pendingChange === "department") {
        const department = manageDepartments.find((item) => item.id === memberChanges.departmentId);
        if (!department) return;
        await api.teamMembers.assignDepartment(organizationId, department.id, selectedMember.id);
        setMembers((items) => items.map((item) => item.id === selectedMember.id ? { ...item, departmentId: department.id } : item));
        setSelectedMember({ ...selectedMember, departmentId: department.id });
        toast.success(`${selectedMember.firstName} was moved to ${department.name}.`);
      } else {
        const branch = branches.find((item) => item.id === memberChanges.branchId);
        const department = manageDepartments.find((item) => item.id === memberChanges.branchDepartmentId);
        if (!branch || !department) return;
        await api.teamMembers.transferBranch(organizationId, branch.id, selectedMember.id, department.id);
        setMembers((items) => items.map((item) => item.id === selectedMember.id ? { ...item, branchId: branch.id, departmentId: department.id } : item));
        setSelectedMember({ ...selectedMember, branchId: branch.id, departmentId: department.id });
        toast.success(`${selectedMember.firstName} was moved to ${branch.name}, ${department.name}.`);
      }
      setPendingChange(null);
    } finally { setIsUpdatingMember(false); }
  };

  const sendInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organizationId || !invite.email || !invite.branchId || !invite.departmentId || !invite.roleId) return;
    setIsInviting(true);
    try {
      await api.organization.sendInvite(organizationId, invite);
      toast.success("Team invitation sent successfully.");
      setIsInviteOpen(false);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-[20px] font-bold text-grey-1">My Teams</h1>
        <p className="text-sm text-grey-2">{scope.type === "branch" ? "Everyone assigned to this branch, including its manager." : "Everyone in the organization, including the super admin."}</p></div>
        {canInvite && <button type="button" onClick={openInvite} className="flex items-center gap-2 rounded-lg bg-[#C45700] px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Team Member</button>}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard title="Total Members" value={scopedMembers.length} subtitle="In the selected scope" icon={<Users className="h-5 w-5" />} iconClassName="bg-blue-50 text-blue-500" />
        <StatCard title="Departments" value={departments.length} subtitle="In the selected scope" icon={<Activity className="h-5 w-5" />} iconClassName="bg-purple-50 text-purple-500" />
        <StatCard title="Active Members" value={activeMembers} subtitle="Currently active accounts" icon={<UserCheck className="h-5 w-5" />} iconClassName="bg-green-50 text-green-500" />
      </div>

      <section className="rounded-xl border border-grey-4 bg-white p-6">
        <div className="relative mb-5 w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-3" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search members..." className="h-10 w-full rounded-lg border border-grey-4 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-1" />
        </div>
        {isLoading ? <p className="py-10 text-center text-sm text-grey-3">Loading team members...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-grey-4 text-xs uppercase text-grey-2"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const name = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.email;
                  return <tr key={member.id} onClick={() => void openMemberManagement(member)} className={`border-b border-grey-4 ${(canAssignRole || canAssignDepartment || canAssignBranch) ? "cursor-pointer hover:bg-grey-5" : ""}`}>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-xs font-bold">{member.avatarUrl ? <Image src={member.avatarUrl} alt={name} fill className="object-cover" /> : name.slice(0, 1).toUpperCase()}</div>{member.publicProfile || member.id === currentUser?.userId ? <Link onClick={(event) => event.stopPropagation()} href={`/dashboard/profile/${member.id}`} className="text-sm font-medium text-grey-1 hover:text-primary-1 hover:underline">{name}</Link> : <span className="text-sm font-medium text-grey-1" title="This profile is private">{name}</span>}</div></td>
                    <td className="px-4 py-3 text-sm text-grey-2">{member.email}</td>
                    <td className="px-4 py-3 text-sm text-grey-2">{member.branchId ? branchNames.get(member.branchId) ?? "Assigned branch" : "Organization-wide"}</td>
                    <td className="px-4 py-3 text-sm text-grey-2">{member.departmentId ? departmentNames.get(member.departmentId) ?? "Assigned department" : "Unassigned"}</td>
                    <td className="px-4 py-3 text-sm text-grey-2">{humanizeIdentifier(member.roleName ?? (member.id === currentUser?.userId ? currentUser.role : null) ?? "member")}</td>
                    <td className="px-4 py-3 text-sm text-grey-2">{humanizeIdentifier(member.status)}</td>
                  </tr>;
                })}
                {filteredMembers.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-grey-3">No team members found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedMember && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setSelectedMember(null)}>
        <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
          <div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-bold text-grey-1">Manage {selectedMember.firstName} {selectedMember.lastName}</h2><p className="mt-1 text-sm text-grey-2">Changes replace the user&apos;s current assignment and require confirmation.</p></div><button type="button" onClick={() => setSelectedMember(null)}><X className="h-5 w-5" /></button></div>
          <div className="space-y-5">
            {canAssignRole && <section className="rounded-xl border border-grey-4 p-4"><h3 className="text-sm font-bold text-grey-1">Change role</h3><p className="mb-3 text-xs text-grey-3">This replaces the user&apos;s current role.</p><div className="flex gap-2"><select value={memberChanges.roleId} onChange={(event) => setMemberChanges({ ...memberChanges, roleId: event.target.value })} className="h-10 flex-1 rounded-lg border border-grey-4 px-3 text-sm"><option value="">Select role</option>{manageRoles.map((role) => <option key={role.id} value={role.id}>{humanizeIdentifier(role.name)}</option>)}</select><button disabled={!memberChanges.roleId || memberChanges.roleId === selectedMember.roleId} onClick={() => setPendingChange("role")} className="rounded-lg bg-primary-1 px-4 text-sm font-medium text-white disabled:opacity-40">Change</button></div></section>}
            {canAssignDepartment && <section className="rounded-xl border border-grey-4 p-4"><h3 className="text-sm font-bold text-grey-1">Move department</h3><p className="mb-3 text-xs text-grey-3">Choose another department in the user&apos;s current branch.</p><div className="flex gap-2"><select value={memberChanges.departmentId} onChange={(event) => setMemberChanges({ ...memberChanges, departmentId: event.target.value })} className="h-10 flex-1 rounded-lg border border-grey-4 px-3 text-sm"><option value="">Select department</option>{manageDepartments.filter((department) => department.branchId === selectedMember.branchId).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select><button disabled={!memberChanges.departmentId || memberChanges.departmentId === selectedMember.departmentId} onClick={() => setPendingChange("department")} className="rounded-lg bg-primary-1 px-4 text-sm font-medium text-white disabled:opacity-40">Move</button></div></section>}
            {canAssignBranch && <section className="rounded-xl border border-grey-4 p-4"><h3 className="text-sm font-bold text-grey-1">Move branch</h3><p className="mb-3 text-xs text-grey-3">A destination department is required because branch and department change together.</p><div className="grid gap-2 sm:grid-cols-2"><select value={memberChanges.branchId} onChange={(event) => setMemberChanges({ ...memberChanges, branchId: event.target.value, branchDepartmentId: "" })} className="h-10 rounded-lg border border-grey-4 px-3 text-sm"><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><select value={memberChanges.branchDepartmentId} onChange={(event) => setMemberChanges({ ...memberChanges, branchDepartmentId: event.target.value })} className="h-10 rounded-lg border border-grey-4 px-3 text-sm"><option value="">Select destination department</option>{manageDepartments.filter((department) => department.branchId === memberChanges.branchId).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></div><button disabled={!memberChanges.branchId || !memberChanges.branchDepartmentId || memberChanges.branchId === selectedMember.branchId} onClick={() => setPendingChange("branch")} className="mt-3 h-10 w-full rounded-lg bg-primary-1 text-sm font-medium text-white disabled:opacity-40">Move to branch</button></section>}
          </div>
        </div>
      </div>}

      <ConfirmModal isOpen={pendingChange !== null} onClose={() => setPendingChange(null)} onConfirm={() => void confirmMemberChange()} title={pendingChange === "role" ? "Change user role?" : pendingChange === "department" ? "Move user to another department?" : "Move user to another branch?"} description={pendingChange === "role" ? "This will replace the user's current role and its role-based access." : pendingChange === "department" ? "This will replace the user's current department assignment." : "This will change both the user's home branch and department."} confirmText={isUpdatingMember ? "Updating..." : "Confirm change"} isDestructive={false} />

      {isInviteOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
        <form onSubmit={sendInvite} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-grey-1">Invite Team Member</h2><button type="button" onClick={() => setIsInviteOpen(false)}><X className="h-5 w-5" /></button></div>
          <label className="block text-sm font-medium">Email<input required type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3" /></label>
          <label className="block text-sm font-medium">Branch<select required disabled={scope.type === "branch"} value={invite.branchId} onChange={(event) => setInvite({ ...invite, branchId: event.target.value, departmentId: "" })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3"><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
          <label className="block text-sm font-medium">Department<select required value={invite.departmentId} onChange={(event) => setInvite({ ...invite, departmentId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3"><option value="">Select department</option>{inviteDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
          <label className="block text-sm font-medium">Role<select required disabled={!invite.branchId || inviteRolesLoading} value={invite.roleId} onChange={(event) => setInvite({ ...invite, roleId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3 disabled:bg-grey-5"><option value="">{inviteRolesLoading ? "Loading roles..." : invite.branchId ? "Select role" : "Select a branch first"}</option>{inviteRoles.map((role) => <option key={role.id} value={role.id}>{humanizeIdentifier(role.name)}</option>)}</select></label>
          <button disabled={isInviting} className="h-10 w-full rounded-lg bg-[#C45700] text-sm font-medium text-white disabled:opacity-50">{isInviting ? "Sending..." : "Send Invitation"}</button>
        </form>
      </div>}
    </div>
  );
}
