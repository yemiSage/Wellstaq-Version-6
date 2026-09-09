"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Activity, Building2, Mail, Network, Plus, Search, UserCheck, UserRound, Users, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { StatCard } from "@/components/dashboard/stat-card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { FilterDropdown, type FilterDropdownOption } from "@/components/ui/filter-dropdown";
import { Input } from "@/components/ui/input";
import { SelectablePill } from "@/components/ui/selectable-pill";
import type { DepartmentItem, OrganizationMemberInfo, RoleItem } from "@/types/api";
import { hasPermission } from "@/lib/permissions";
import { humanizeIdentifier } from "@/lib/format";

import { AnimatePresence } from "motion/react";
import { DrawerLayer } from "@/components/ui/drawer";

type ManagementTab = "role" | "department" | "branch";
const REVOKE_ROLE_OPTION = "__revoke_role__";

export default function TeamsPage() {
  const { organizationId, branches, currentUser } = useDashboardData();
  const { scope } = useDashboardScope();
  const scopeBranchId = scope.type === "branch" ? scope.branchId : undefined;
  const scopeKey = scopeBranchId ?? "overview";
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
  const [managementTab, setManagementTab] = useState<ManagementTab>("role");
  const managementDialogRef = useRef<HTMLDivElement>(null);
  const [manageRoles, setManageRoles] = useState<RoleItem[]>([]);
  const [manageDepartments, setManageDepartments] = useState<DepartmentItem[]>([]);
  const [memberChanges, setMemberChanges] = useState({ roleId: "", departmentId: "", branchId: "", branchDepartmentId: "" });
  const [pendingChange, setPendingChange] = useState<"role" | "revoke_role" | "department" | "branch" | null>(null);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const canInvite = currentUser ? hasPermission(currentUser.permissions, "member.invite", scope.type === "branch" ? scope.branchId : undefined) : false;
  const permissionBranchId = scope.type === "branch" ? scope.branchId : undefined;
  const canAssignRole = currentUser ? hasPermission(currentUser.permissions, "member.role.assign", permissionBranchId) : false;
  const canRevokeRole = currentUser ? hasPermission(currentUser.permissions, "member.role.revoke", permissionBranchId) : false;
  const canAssignDepartment = currentUser ? hasPermission(currentUser.permissions, "member.department.assign", permissionBranchId) : false;
  const canAssignBranch = currentUser ? hasPermission(currentUser.permissions, "member.branch.assign", permissionBranchId) : false;
  const managementTabs: { value: ManagementTab; label: string }[] = [
    ...(canAssignRole || canRevokeRole ? [{ value: "role" as const, label: "Change role" }] : []),
    ...(canAssignDepartment ? [{ value: "department" as const, label: "Move department" }] : []),
    ...(canAssignBranch ? [{ value: "branch" as const, label: "Move branch" }] : []),
  ];
  const activeManagementTab = managementTabs.find((tab) => tab.value === managementTab)?.value ?? managementTabs[0]?.value;
  const isRevokingRole = memberChanges.roleId === REVOKE_ROLE_OPTION;
  const selectedMemberRoleId = selectedMember
    ? scope.type === "branch" ? selectedMember.roleId : selectedMember.organizationRoleId ?? selectedMember.roleId
    : null;
  const selectedMemberRoleName = selectedMember
    ? scope.type === "branch" ? selectedMember.roleName : selectedMember.organizationRoleName ?? selectedMember.roleName
    : null;

  useEffect(() => {
    if (!selectedMember?.id) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    managementDialogRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
    return () => { previousFocus?.focus(); };
  }, [selectedMember?.id]);

  useEffect(() => {
    setSelectedMember(null);
    setPendingChange(null);
    setManageRoles([]);
    setManageDepartments([]);
    setMemberChanges({ roleId: "", departmentId: "", branchId: "", branchDepartmentId: "" });
  }, [scopeKey]);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      api.organization.getMembers(organizationId, { limit: 200, branchId: scopeBranchId }),
      api.organization.getDepartments(organizationId, scopeBranchId),
    ]).then(([memberResponse, departmentResponse]) => {
      if (cancelled) return;
      setMembers(memberResponse.items);
      setDepartments(departmentResponse.items);
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [organizationId, scopeBranchId]);

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
  const inviteBranchOptions: FilterDropdownOption<string>[] = [
    { label: "Select branch", value: "" },
    ...branches.map((branch) => ({ label: branch.name, value: branch.id })),
  ];
  const inviteDepartmentOptions: FilterDropdownOption<string>[] = [
    { label: "Select department", value: "" },
    ...inviteDepartments.map((department) => ({ label: department.name, value: department.id })),
  ];
  const inviteRoleOptions: FilterDropdownOption<string>[] = [
    {
      label: inviteRolesLoading ? "Loading roles..." : invite.branchId ? "Select role" : "Select a branch first",
      value: "",
    },
    ...inviteRoles.map((role) => ({ label: humanizeIdentifier(role.name), value: role.id })),
  ];
  const canSendInvite = Boolean(invite.email && invite.branchId && invite.departmentId && invite.roleId) && !isInviting;

  const openInvite = () => {
    const branchId = scope.type === "branch" ? scope.branchId : branches[0]?.id ?? "";
    setInvite({ email: "", branchId, departmentId: "", roleId: "" });
    setIsInviteOpen(true);
  };

  const openMemberManagement = async (member: OrganizationMemberInfo) => {
    if (!organizationId || (!canAssignRole && !canRevokeRole && !canAssignDepartment && !canAssignBranch)) return;
    const scopedRoleName = scope.type === "branch" ? member.roleName : member.organizationRoleName ?? member.roleName;
    if (scopedRoleName === "super_admin") {
      toast.error("The Super Admin account cannot be reassigned or moved.");
      return;
    }
    setSelectedMember(member);
    setManagementTab(canAssignRole || canRevokeRole ? "role" : canAssignDepartment ? "department" : "branch");
    const scopedRoleId = scope.type === "branch" ? member.roleId : member.organizationRoleId ?? member.roleId;
    setMemberChanges({ roleId: scopedRoleId ?? "", departmentId: member.departmentId ?? "", branchId: member.branchId ?? "", branchDepartmentId: member.departmentId ?? "" });
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
        toast.success(`${selectedMember.firstName}'s role is now ${humanizeIdentifier(role.name)}.`);
      } else if (pendingChange === "revoke_role") {
        await api.roles.revokeFromMember(organizationId, selectedMember.id, permissionBranchId);
        toast.success(`${selectedMember.firstName}'s role was revoked. The user is now a Member.`);
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
      if (pendingChange === "role" || pendingChange === "revoke_role") {
        const refreshed = await api.organization.getMembers(organizationId, { limit: 200, branchId: scopeBranchId });
        setMembers(refreshed.items);
        setSelectedMember(null);
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
        <div><h1 className="page-title">My Teams</h1>
        <p className="page-description">{scope.type === "branch" ? "Everyone assigned to this branch, including its manager." : "Everyone in the organization, including the super admin."}</p></div>
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
                  return <tr key={member.id} onClick={() => void openMemberManagement(member)} className={`border-b border-grey-4 ${(canAssignRole || canRevokeRole || canAssignDepartment || canAssignBranch) ? "cursor-pointer hover:bg-grey-5" : ""}`}>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-xs font-bold">{member.avatarUrl ? <Image src={member.avatarUrl} alt={name} fill className="object-cover" /> : name.slice(0, 1).toUpperCase()}</div>{member.publicProfile || member.id === currentUser?.userId ? <Link onClick={(event) => event.stopPropagation()} href={`/dashboard/profile/${member.id}`} className="text-sm font-medium text-grey-1 hover:text-primary-1 hover:underline">{name}</Link> : <span className="text-sm font-medium text-grey-1" title="This profile is private">{name}</span>}</div></td>
                    <td className="px-4 py-3 text-sm text-grey-2">{member.email}</td>
                    <td className="px-4 py-3 text-sm text-grey-2">{member.branchId ? branchNames.get(member.branchId) ?? "Assigned branch" : "General"}</td>
                    <td className="px-4 py-3 text-sm text-grey-2">{member.departmentId ? departmentNames.get(member.departmentId) ?? "Assigned department" : "Unassigned"}</td>
                    <td className="px-4 py-3 text-sm text-grey-2">
                      {scope.type === "branch" ? (
                        humanizeIdentifier(member.roleName ?? "member")
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="rounded-md border border-grey-4 bg-grey-5 px-2 py-1 text-[10px] font-bold">
                            Org: {humanizeIdentifier(member.organizationRoleName ?? member.roleName ?? (member.id === currentUser?.userId ? currentUser.role : null) ?? "member")}
                          </span>
                          {(member.branchRoles ?? []).map((assignment) => (
                            <span key={`${assignment.branchId}-${assignment.roleId}`} className="rounded-md border border-primary-1/15 bg-primary-1/5 px-2 py-1 text-[10px] font-bold text-primary-1">
                              {branchNames.get(assignment.branchId) ?? "Branch"}: {humanizeIdentifier(assignment.roleName)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-grey-2">{humanizeIdentifier(member.status)}</td>
                  </tr>;
                })}
                {filteredMembers.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-grey-3">No team members found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>{selectedMember && <DrawerLayer onClose={() => { if (!isUpdatingMember && !pendingChange) setSelectedMember(null); }} label="Manage team" inert={pendingChange !== null || undefined}>
        <div
          ref={managementDialogRef}
          tabIndex={-1}
          aria-labelledby="manage-team-title"
          aria-describedby="manage-team-description"
          aria-busy={isUpdatingMember}
          className="flex h-full w-full flex-col overflow-hidden bg-white"
          onMouseDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (pendingChange) return;
            if (event.key === "Escape" && !isUpdatingMember) {
              event.stopPropagation();
              setSelectedMember(null);
            } else if (event.key === "Tab") {
              const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"]), [tabindex="0"]:not(:disabled)'));
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (!first) {
                event.preventDefault();
                event.currentTarget.focus();
              } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <div className="shrink-0 border-b border-grey-4 p-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="manage-team-title" className="text-xl font-semibold text-grey-1">Manage {selectedMember.firstName} {selectedMember.lastName}</h2>
              <p id="manage-team-description" className="mt-1 text-sm text-grey-2">Update one assignment at a time. You&apos;ll confirm before saving.</p>
            </div>
            <button type="button" aria-label="Close team management" disabled={isUpdatingMember} onClick={() => setSelectedMember(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-grey-2 hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 disabled:opacity-40">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            role="tablist"
            aria-label="Team management options"
            className="mx-6 my-6 shrink-0 flex gap-0 border-b border-grey-4 pb-3"
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || isUpdatingMember) return;
              event.preventDefault();
              const currentIndex = managementTabs.findIndex((tab) => tab.value === activeManagementTab);
              const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? managementTabs.length - 1
                : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + managementTabs.length) % managementTabs.length;
              setManagementTab(managementTabs[nextIndex].value);
              event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
            }}
          >
            {managementTabs.map((tab) => (
              <SelectablePill key={tab.value} role="tab" id={`manage-team-tab-${tab.value}`} aria-controls="manage-team-panel" aria-selected={activeManagementTab === tab.value} aria-pressed={undefined} tabIndex={activeManagementTab === tab.value ? 0 : -1} selected={activeManagementTab === tab.value} appearance="plain" disabled={isUpdatingMember} onClick={() => setManagementTab(tab.value)} className="min-h-10 flex-1 px-2 sm:px-4 sm:text-sm">
                {tab.label}
              </SelectablePill>
            ))}
          </div>
          <div id="manage-team-panel" className="min-h-0 flex-1 overflow-y-auto px-6 pb-6" role="tabpanel" aria-labelledby={`manage-team-tab-${activeManagementTab}`}>
            {activeManagementTab === "role" && (
              <>
                <p className="mb-4 text-sm text-grey-2">Choose a new {scope.type === "branch" ? "branch" : "organization"} role for this team member. The other scope remains unchanged.</p>
                <div>
                  <label htmlFor="manage-staff-role" className="mb-2 block text-sm font-medium text-grey-1">Role</label>
                  <FilterDropdown
                    id="manage-staff-role" ariaLabel="Staff role" disabled={isUpdatingMember}
                    value={memberChanges.roleId}
                    onValueChange={(roleId) => setMemberChanges({ ...memberChanges, roleId })}
                    options={[
                      { value: "", label: "Select role" },
                      ...manageRoles.filter((role) => canAssignRole || role.id === selectedMemberRoleId).map((role) => ({ value: role.id, label: humanizeIdentifier(role.name) })),
                      ...(canRevokeRole && selectedMemberRoleName !== "member" ? [{ value: REVOKE_ROLE_OPTION, label: "Revoke role (return to Member)" }] : []),
                    ]}
                    buttonClassName="h-12 w-full font-normal" menuClassName="max-h-36 w-full"
                  />
                </div>
                <div className="mt-[80px]">
                  <Button type="button" disabled={isUpdatingMember || (isRevokingRole ? !canRevokeRole || selectedMemberRoleName === "member" : !canAssignRole || !memberChanges.roleId || memberChanges.roleId === selectedMemberRoleId)} onClick={() => setPendingChange(isRevokingRole ? "revoke_role" : "role")} className={`h-12 w-full ${isRevokingRole ? "bg-red-600 hover:bg-red-700" : ""}`}>
                    {isUpdatingMember ? "Updating role..." : isRevokingRole ? "Revoke role" : "Change role"}
                  </Button>
                </div>
              </>
            )}
            {activeManagementTab === "department" && (
              <>
                <p className="mb-4 text-sm text-grey-2">Choose another department in this member&apos;s current branch.</p>
                <div>
                  <label htmlFor="manage-staff-department" className="mb-2 block text-sm font-medium text-grey-1">Department</label>
                  <FilterDropdown
                    id="manage-staff-department" ariaLabel="Staff department" disabled={isUpdatingMember}
                    value={memberChanges.departmentId}
                    onValueChange={(departmentId) => setMemberChanges({ ...memberChanges, departmentId })}
                    options={[{ value: "", label: "Select department" }, ...manageDepartments.filter((department) => department.branchId === selectedMember.branchId).map((department) => ({ value: department.id, label: department.name }))]}
                    buttonClassName="h-12 w-full font-normal" menuClassName="max-h-36 w-full"
                  />
                </div>
                <div className="mt-[80px]">
                  <Button type="button" disabled={isUpdatingMember || !memberChanges.departmentId || memberChanges.departmentId === selectedMember.departmentId} onClick={() => setPendingChange("department")} className="h-12 w-full">
                    {isUpdatingMember ? "Moving department..." : "Move department"}
                  </Button>
                </div>
              </>
            )}
            {activeManagementTab === "branch" && (
              <>
                <p className="mb-4 text-sm text-grey-2">Choose a branch and a department to move this member to.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor="manage-destination-branch" className="mb-2 block text-sm font-medium text-grey-1">Branch</label>
                    <FilterDropdown
                      id="manage-destination-branch" ariaLabel="Destination branch" disabled={isUpdatingMember}
                      value={memberChanges.branchId}
                      onValueChange={(branchId) => setMemberChanges({ ...memberChanges, branchId, branchDepartmentId: "" })}
                      options={[{ value: "", label: "Select branch" }, ...branches.map((branch) => ({ value: branch.id, label: branch.name }))]}
                      buttonClassName="h-12 w-full font-normal" menuClassName="max-h-36 w-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="manage-destination-department" className="mb-2 block text-sm font-medium text-grey-1">Department</label>
                    <FilterDropdown
                      id="manage-destination-department" ariaLabel="Destination department" disabled={!memberChanges.branchId || isUpdatingMember}
                      value={memberChanges.branchDepartmentId}
                      onValueChange={(branchDepartmentId) => setMemberChanges({ ...memberChanges, branchDepartmentId })}
                      options={[{ value: "", label: "Select destination department" }, ...manageDepartments.filter((department) => department.branchId === memberChanges.branchId).map((department) => ({ value: department.id, label: department.name }))]}
                      buttonClassName="h-12 w-full font-normal" menuClassName="max-h-36 w-full"
                    />
                  </div>
                </div>
                <div className="mt-[80px]">
                  <Button type="button" disabled={isUpdatingMember || !memberChanges.branchId || !memberChanges.branchDepartmentId || memberChanges.branchId === selectedMember.branchId} onClick={() => setPendingChange("branch")} className="h-12 w-full">
                    {isUpdatingMember ? "Moving branch..." : "Move branch"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DrawerLayer>}</AnimatePresence>

      <ConfirmModal isOpen={pendingChange !== null} onClose={() => setPendingChange(null)} onConfirm={() => void confirmMemberChange()} title={pendingChange === "role" ? "Change user role?" : pendingChange === "revoke_role" ? "Revoke user role?" : pendingChange === "department" ? "Move user to another department?" : "Move user to another branch?"} description={pendingChange === "role" ? "This will replace the user's current role and its role-based access." : pendingChange === "revoke_role" ? "The current role will be removed and the user will return to the zero-permission Member role." : pendingChange === "department" ? "This will replace the user's current department assignment." : "This will change both the user's home branch and department."} confirmText={isUpdatingMember ? "Updating..." : "Confirm change"} isDestructive={pendingChange === "revoke_role"} />

      <AnimatePresence>{isInviteOpen && <DrawerLayer onClose={() => { if (!isInviting) setIsInviteOpen(false); }} label="Invite Team Member" >
        <form onSubmit={sendInvite} className="flex h-full w-full flex-col overflow-hidden bg-white">
          <div className="shrink-0 border-b border-grey-4 p-6 flex items-center justify-between"><h2 className="text-lg font-bold text-grey-1">Invite Team Member</h2><button type="button" aria-label="Close drawer" disabled={isInviting} onClick={() => setIsInviteOpen(false)}><X className="h-5 w-5" /></button></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
          <label className="block text-sm font-medium text-grey-1">Email
            <div className="relative mt-1">
              <Input required type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} className="pr-11" />
              <Mail className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-3" />
            </div>
          </label>
          <div className="text-sm font-medium text-grey-1">
            <span>Branch</span>
            <FilterDropdown value={invite.branchId} options={inviteBranchOptions} onValueChange={(branchId) => setInvite({ ...invite, branchId, departmentId: "" })} ariaLabel="Branch" disabled={scope.type === "branch"} leadingIcon={<Building2 className="h-4 w-4" />} buttonClassName="mt-1 h-12 w-full rounded-[8px] font-normal" menuClassName="w-full" />
          </div>
          <div className="text-sm font-medium text-grey-1">
            <span>Department</span>
            <FilterDropdown value={invite.departmentId} options={inviteDepartmentOptions} onValueChange={(departmentId) => setInvite({ ...invite, departmentId })} ariaLabel="Department" disabled={!invite.branchId} leadingIcon={<Network className="h-4 w-4" />} buttonClassName="mt-1 h-12 w-full rounded-[8px] font-normal" menuClassName="w-full" />
          </div>
          <div className="text-sm font-medium text-grey-1">
            <span>Role</span>
            <FilterDropdown value={invite.roleId} options={inviteRoleOptions} onValueChange={(roleId) => setInvite({ ...invite, roleId })} ariaLabel="Role" disabled={!invite.branchId || inviteRolesLoading} leadingIcon={<UserRound className="h-4 w-4" />} buttonClassName="mt-1 h-12 w-full rounded-[8px] font-normal" menuClassName="w-full" />
          </div>
          <Button type="submit" disabled={!canSendInvite} className="w-full">{isInviting ? "Sending..." : "Send Invitation"}</Button>
          </div>
        </form>
      </DrawerLayer>}</AnimatePresence>
    </div>
  );
}
