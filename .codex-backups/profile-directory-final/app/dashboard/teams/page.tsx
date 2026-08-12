"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Users, Activity, UserCheck, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { StatCard } from "@/components/dashboard/stat-card";
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
  const [invite, setInvite] = useState({ email: "", branchId: "", departmentId: "", roleId: "" });
  const canInvite = currentUser ? hasPermission(currentUser.permissions, "member.invite", scope.type === "branch" ? scope.branchId : undefined) : false;

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    const branchId = scope.type === "branch" ? scope.branchId : undefined;
    setIsLoading(true);
    Promise.all([
      api.organization.getMembers(organizationId, { limit: 200 }),
      api.organization.getDepartments(organizationId, branchId),
      api.roles.listOrganization(organizationId, branchId),
    ]).then(([memberResponse, departmentResponse, roleResponse]) => {
      if (cancelled) return;
      setMembers(memberResponse.items);
      setDepartments(departmentResponse.items);
      setRoles(roleResponse.items.filter((role) => role.name.trim().toLowerCase().replaceAll(" ", "_") !== "super_admin"));
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [organizationId, scope]);

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
                  return <tr key={member.id} className="border-b border-grey-4">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-xs font-bold">{member.avatarUrl ? <Image src={member.avatarUrl} alt={name} fill className="object-cover" /> : name.slice(0, 1).toUpperCase()}</div><span className="text-sm font-medium text-grey-1">{name}</span></div></td>
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

      {isInviteOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
        <form onSubmit={sendInvite} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-grey-1">Invite Team Member</h2><button type="button" onClick={() => setIsInviteOpen(false)}><X className="h-5 w-5" /></button></div>
          <label className="block text-sm font-medium">Email<input required type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3" /></label>
          <label className="block text-sm font-medium">Branch<select required disabled={scope.type === "branch"} value={invite.branchId} onChange={(event) => setInvite({ ...invite, branchId: event.target.value, departmentId: "" })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3"><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
          <label className="block text-sm font-medium">Department<select required value={invite.departmentId} onChange={(event) => setInvite({ ...invite, departmentId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3"><option value="">Select department</option>{inviteDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
          <label className="block text-sm font-medium">Role<select required value={invite.roleId} onChange={(event) => setInvite({ ...invite, roleId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-grey-4 px-3"><option value="">Select role</option>{inviteRoles.map((role) => <option key={role.id} value={role.id}>{humanizeIdentifier(role.name)}</option>)}</select></label>
          <button disabled={isInviting} className="h-10 w-full rounded-lg bg-[#C45700] text-sm font-medium text-white disabled:opacity-50">{isInviting ? "Sending..." : "Send Invitation"}</button>
        </form>
      </div>}
    </div>
  );
}
