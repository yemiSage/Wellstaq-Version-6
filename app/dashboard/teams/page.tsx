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
import { ScrollArea } from "@/components/ui/scroll-area";

type ManagementTab = "role" | "department" | "branch" | "audit";
const REVOKE_ROLE_OPTION = "__revoke_role__";
const SUPER_ADMIN_ROLE = "super_admin";
const BRANCH_MANAGER_ROLE = "branch_manager";

type MemberRole = { id: string | null; name: string | null };

function normalizeRoleName(name: string | null | undefined) {
  return name?.trim().toLowerCase().replaceAll(" ", "_") ?? "";
}

function getOrganizationRole(member: OrganizationMemberInfo, superAdminUserId?: string): MemberRole {
  if (member.organizationRoleName) {
    return { id: member.organizationRoleId ?? null, name: member.organizationRoleName };
  }
  if (normalizeRoleName(member.roleName) === SUPER_ADMIN_ROLE || member.id === superAdminUserId) {
    return { id: member.organizationRoleId ?? member.roleId, name: SUPER_ADMIN_ROLE };
  }
  return { id: member.organizationRoleId ?? null, name: null };
}

function getBranchRole(
  member: OrganizationMemberInfo,
  branchId: string | undefined,
  branchManagers: ReadonlyMap<string, string>,
  superAdminUserId?: string,
): MemberRole {
  const organizationRole = getOrganizationRole(member, superAdminUserId);
  if (organizationRole.name === SUPER_ADMIN_ROLE) return organizationRole;
  const assignment = branchId ? member.branchRoles?.find((role) => role.branchId === branchId) : undefined;
  if (branchId && branchManagers.get(branchId) === member.id) return { id: assignment?.roleId ?? null, name: BRANCH_MANAGER_ROLE };
  if (assignment) return { id: assignment.roleId, name: assignment.roleName };
  // The organization role must not leak into a branch-scoped view.
  return { id: null, name: null };
}

export default function TeamsPage() {
  const { organizationId, branches, currentUser, refresh } = useDashboardData();
  const { scope } = useDashboardScope();
  const scopeBranchId = scope.type === "branch" ? scope.branchId : undefined;
  const scopeKey = scopeBranchId ?? "overview";
  const branchManagers = useMemo(() => new Map(branches.flatMap((branch) => branch.managerId ? [[branch.id, branch.managerId] as const] : [])), [branches]);
  const superAdminUserId = currentUser?.role === SUPER_ADMIN_ROLE ? currentUser.userId : undefined;
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
  const [accountAction, setAccountAction] = useState<"suspend" | "delete" | null>(null);
  const canInvite = currentUser ? hasPermission(currentUser.permissions, "member.invite", scope.type === "branch" ? scope.branchId : undefined) : false;
  const permissionBranchId = scope.type === "branch" ? scope.branchId : undefined;
  const canAssignRole = currentUser ? hasPermission(currentUser.permissions, "member.role.assign", permissionBranchId) : false;
  const canRevokeRole = currentUser ? hasPermission(currentUser.permissions, "member.role.revoke", permissionBranchId) : false;
  const canAssignDepartment = currentUser ? hasPermission(currentUser.permissions, "member.department.assign", permissionBranchId) : false;
  const canAssignBranch = currentUser ? hasPermission(currentUser.permissions, "member.branch.assign", permissionBranchId) : false;
  const managementTabs: { value: ManagementTab; label: string }[] = [
    ...(canAssignRole || canRevokeRole ? [{ value: "role" as const, label: "Role" }] : []),
    ...(canAssignDepartment ? [{ value: "department" as const, label: "Department" }] : []),
    ...(canAssignBranch ? [{ value: "branch" as const, label: "Branch" }] : []),
    { value: "audit", label: "Audit log" },
  ];
  const activeManagementTab = managementTabs.find((tab) => tab.value === managementTab)?.value ?? managementTabs[0]?.value;
  const isRevokingRole = memberChanges.roleId === REVOKE_ROLE_OPTION;
  const selectedMemberRole = selectedMember
    ? scope.type === "branch" ? getBranchRole(selectedMember, scope.branchId, branchManagers, superAdminUserId) : getOrganizationRole(selectedMember, superAdminUserId)
    : null;
  const selectedMemberRoleId = selectedMemberRole?.id ?? null;
  const selectedMemberRoleName = selectedMemberRole?.name ?? null;

  useEffect(() => {
    if (!selectedMember?.id) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    managementDialogRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
    return () => { previousFocus?.focus(); };
  }, [selectedMember?.id]);

  useEffect(() => {
    setSelectedMember(null);
    setPendingChange(null);
    setAccountAction(null);
    setManageRoles([]);
    setManageDepartments([]);
    setMemberChanges({ roleId: "", departmentId: "", branchId: "", branchDepartmentId: "" });
  }, [scopeKey]);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      api.organization.getMembers(organizationId, { limit: 200 }),
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
    scope.type === "branch"
      ? members.filter((member) => (
        member.branchId === scope.branchId ||
        branchManagers.get(scope.branchId) === member.id ||
        member.branchRoles?.some((role) => role.branchId === scope.branchId && normalizeRoleName(role.roleName) === BRANCH_MANAGER_ROLE)
      ))
      : members
  ), [branchManagers, members, scope]);
  const occupiedBranchManagerId = scope.type === "branch"
    ? branchManagers.get(scope.branchId) ?? scopedMembers.find((member) => member.branchRoles?.some((role) => role.branchId === scope.branchId && normalizeRoleName(role.roleName) === BRANCH_MANAGER_ROLE))?.id
    : undefined;
  const occupiedBranchManager = occupiedBranchManagerId ? members.find((member) => member.id === occupiedBranchManagerId) : undefined;
  const occupiedBranchManagerName = occupiedBranchManager
    ? `${occupiedBranchManager.firstName ?? ""} ${occupiedBranchManager.lastName ?? ""}`.trim() || occupiedBranchManager.email
    : "another team member";
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
    const scopedRole = scope.type === "branch"
      ? getBranchRole(member, scope.branchId, branchManagers, superAdminUserId)
      : getOrganizationRole(member, superAdminUserId);
    const scopedRoleName = scopedRole.name;
    if (scopedRoleName === "super_admin") {
      toast.error("The Super Admin account cannot be reassigned or moved.");
      return;
    }
    setSelectedMember(member);
    setManagementTab(canAssignRole || canRevokeRole ? "role" : canAssignDepartment ? "department" : "branch");
    setMemberChanges({ roleId: scopedRole.id ?? "", departmentId: member.departmentId ?? "", branchId: member.branchId ?? "", branchDepartmentId: member.departmentId ?? "" });
    const [roleResponse, departmentResponse] = await Promise.all([
      api.roles.listOrganization(organizationId, permissionBranchId),
      api.organization.getDepartments(organizationId),
    ]);
    setManageRoles(roleResponse.items.filter((role) => role.name !== "super_admin"));
    setManageDepartments(departmentResponse.items);
  };

  const confirmMemberChange = async () => {
    if (!organizationId || !selectedMember || !pendingChange) return;
    if (pendingChange === "role") {
      const nextRole = manageRoles.find((item) => item.id === memberChanges.roleId);
      if (
        scope.type === "branch" &&
        normalizeRoleName(nextRole?.name) === BRANCH_MANAGER_ROLE &&
        occupiedBranchManagerId &&
        occupiedBranchManagerId !== selectedMember.id
      ) {
        toast.error(`${occupiedBranchManagerName} is already the Branch Manager. Change or revoke that assignment first.`);
        setPendingChange(null);
        return;
      }
    }
    setIsUpdatingMember(true);
    try {
      if (pendingChange === "role") {
        const role = manageRoles.find((item) => item.id === memberChanges.roleId);
        if (!role) return;
        await api.roles.assignToMember(organizationId, selectedMember.id, role);
        toast.success(`${selectedMember.firstName}'s role is now ${humanizeIdentifier(role.name)}.`);
      } else if (pendingChange === "revoke_role") {
        await api.roles.revokeFromMember(organizationId, selectedMember.id, permissionBranchId);
        toast.success(`${selectedMember.firstName}'s ${scope.type === "branch" ? "branch" : "organization"} role was revoked.`);
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
        const [refreshed] = await Promise.all([
          api.organization.getMembers(organizationId, { limit: 200 }),
          refresh(),
        ]);
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
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search members" name="member-search" placeholder="Search members…" className="h-10 w-full rounded-lg border border-grey-4 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-1" />
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
                  {scope.type === "branch" ? (() => {
                    const role = getBranchRole(member, scope.branchId, branchManagers, superAdminUserId);
                    return role.name ? humanizeIdentifier(role.name) : null;
                  })() : (() => {
                    const organizationRole = getOrganizationRole(member, superAdminUserId);
                    const branchAssignments = member.branchRoles ?? [];
                    const managerAssignments = branches
                      .filter((branch) => branch.managerId === member.id && !branchAssignments.some((assignment) => assignment.branchId === branch.id))
                      .map((branch) => ({ branchId: branch.id, roleId: `manager:${branch.id}`, roleName: BRANCH_MANAGER_ROLE }));
                    return (
                        <div className="flex flex-wrap gap-1.5">
                          {organizationRole.name && <span className="rounded-md border border-grey-4 bg-grey-5 px-2 py-1 text-[10px] font-bold">
                            Org: {humanizeIdentifier(organizationRole.name)}
                          </span>}
                          {[...branchAssignments, ...managerAssignments].map((assignment) => (
                            <span key={`${assignment.branchId}-${assignment.roleId}`} className="rounded-md border border-primary-1/15 bg-primary-1/5 px-2 py-1 text-[10px] font-bold text-primary-1">
                              {branchNames.get(assignment.branchId) ?? "Branch"}: {humanizeIdentifier(assignment.roleName)}
                            </span>
                          ))}
                        </div>
                    );
                  })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-grey-2">{humanizeIdentifier(member.status)}{(canAssignRole || canRevokeRole || canAssignDepartment || canAssignBranch) && <button type="button" className="ml-3 text-primary-1 hover:underline" onClick={(event) => { event.stopPropagation(); void openMemberManagement(member); }} aria-label={`Manage ${name}`}>Manage</button>}</td>
                  </tr>;
                })}
                {filteredMembers.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-grey-3">No team members found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>{selectedMember && <DrawerLayer onClose={() => { if (!isUpdatingMember && !pendingChange && !accountAction) setSelectedMember(null); }} label="Team member details" inert={pendingChange !== null || accountAction !== null || undefined}>
        <div
          ref={managementDialogRef}
          tabIndex={-1}
          aria-labelledby="manage-team-title"
          aria-describedby="manage-team-description"
          aria-busy={isUpdatingMember}
          className="flex h-full w-full flex-col overflow-hidden bg-white"
          onMouseDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (pendingChange || accountAction) return;
            if (event.key === "Escape" && !isUpdatingMember) {
              event.stopPropagation();
              setSelectedMember(null);
            } else if (event.key === "Tab") {
              const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"]), [tabindex="0"]:not(:disabled)')).filter((element) => element.getClientRects().length > 0);
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
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-grey-2">Team member</p>
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-5 text-lg font-semibold text-primary-1">
                  {selectedMember.avatarUrl ? <Image src={selectedMember.avatarUrl} alt="" fill className="object-cover" /> : (selectedMember.firstName || selectedMember.email || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 id="manage-team-title" className="break-words font-display text-xl font-semibold text-grey-1">{`${selectedMember.firstName ?? ""} ${selectedMember.lastName ?? ""}`.trim() || selectedMember.email}</h2>
                  <p className="mt-1 break-all text-xs text-grey-2">{selectedMember.email}</p>
                </div>
              </div>
              <p id="manage-team-description" className="mt-4 text-sm text-grey-2">Member details and access in {scopeBranchId ? branchNames.get(scopeBranchId) ?? "this branch" : "the organization"}.</p>
            </div>
            <button type="button" aria-label="Close team management" disabled={isUpdatingMember} onClick={() => setSelectedMember(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-grey-2 hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 disabled:opacity-40">
              <X className="h-5 w-5" />
            </button>
          </div>
          <ScrollArea className="flex-1">
          <dl className="mx-6 mt-5 grid grid-cols-2 gap-4 rounded-xl border border-grey-4 bg-grey-5 p-4 text-sm">
            <div><dt className="text-xs text-grey-2">Status</dt><dd className="mt-1 font-medium text-grey-1">{humanizeIdentifier(selectedMember.status) || "Unknown"}</dd></div>
            <div><dt className="text-xs text-grey-2">Role in this view</dt><dd className="mt-1 font-medium text-grey-1">{selectedMemberRoleName ? humanizeIdentifier(selectedMemberRoleName) : "—"}</dd></div>
            <div><dt className="text-xs text-grey-2">Home branch</dt><dd className="mt-1 font-medium text-grey-1">{selectedMember.branchId ? branchNames.get(selectedMember.branchId) ?? "Assigned branch" : "Unassigned"}</dd></div>
            <div><dt className="text-xs text-grey-2">Department</dt><dd className="mt-1 font-medium text-grey-1">{selectedMember.departmentId ? departmentNames.get(selectedMember.departmentId) ?? manageDepartments.find((item) => item.id === selectedMember.departmentId)?.name ?? "Assigned department" : "Unassigned"}</dd></div>
          </dl>
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
          <div id="manage-team-panel" className="px-6 pb-6" role="tabpanel" aria-labelledby={`manage-team-tab-${activeManagementTab}`}>
            {activeManagementTab === "audit" && <div className="rounded-xl border border-grey-4 p-5">
              <Activity className="mb-3 h-5 w-5 text-grey-2" aria-hidden="true" />
              <h3 className="font-semibold text-grey-1">Audit history unavailable</h3>
              <p className="mt-2 text-sm leading-relaxed text-grey-2">Member audit records aren&apos;t available from the service yet. Changes, timestamps, and who made them will appear here once audit history is connected.</p>
              <p className="mt-3 text-xs text-grey-2">This does not mean this member has no activity.</p>
            </div>}
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
                      { value: "", label: selectedMemberRoleName ? "Select role" : "No role in this scope" },
                      ...manageRoles
                        .filter((role) => canAssignRole || role.id === selectedMemberRoleId)
                        .filter((role) => !(
                          scope.type === "branch" &&
                          normalizeRoleName(role.name) === BRANCH_MANAGER_ROLE &&
                          occupiedBranchManagerId &&
                          occupiedBranchManagerId !== selectedMember.id
                        ))
                        .map((role) => ({ value: role.id, label: humanizeIdentifier(role.name) })),
                      ...(canRevokeRole && selectedMemberRoleName && selectedMemberRoleName !== "member" ? [{ value: REVOKE_ROLE_OPTION, label: "Revoke role (return to Member)" }] : []),
                    ]}
                    buttonClassName="h-12 w-full font-normal" menuClassName="max-h-36 w-full"
                  />
                  {scope.type === "branch" && occupiedBranchManagerId && occupiedBranchManagerId !== selectedMember.id && (
                    <p className="mt-2 text-xs text-grey-2">
                      Branch Manager is already assigned to {occupiedBranchManagerName}. Change or revoke that assignment before choosing a new manager.
                    </p>
                  )}
                </div>
                <div className="mt-6">
                  <Button type="button" disabled={isUpdatingMember || (isRevokingRole ? !canRevokeRole || !selectedMemberRoleName || selectedMemberRoleName === "member" : !canAssignRole || !memberChanges.roleId || memberChanges.roleId === selectedMemberRoleId)} onClick={() => setPendingChange(isRevokingRole ? "revoke_role" : "role")} className={`h-12 w-full ${isRevokingRole ? "bg-red-600 hover:bg-red-700" : ""}`}>
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
                <div className="mt-6">
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
                <div className="mt-6">
                  <Button type="button" disabled={isUpdatingMember || !memberChanges.branchId || !memberChanges.branchDepartmentId || memberChanges.branchId === selectedMember.branchId} onClick={() => setPendingChange("branch")} className="h-12 w-full">
                    {isUpdatingMember ? "Moving branch..." : "Move branch"}
                  </Button>
                </div>
              </>
            )}
          </div>
          <section className="mx-6 mb-6 border-t border-grey-4 pt-5" aria-labelledby="member-account-actions">
            <h3 id="member-account-actions" className="text-sm font-semibold text-grey-1">Member access</h3>
            <p className="mt-2 text-xs leading-relaxed text-grey-2">Suspension and deletion are not available from the service yet. No account changes can be made here.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={isUpdatingMember} onClick={() => setAccountAction("suspend")} className="min-h-10 rounded-lg border border-grey-4 px-4 text-sm font-medium text-grey-2 hover:bg-grey-5">Suspend member…</button>
              <button type="button" disabled={isUpdatingMember} onClick={() => setAccountAction("delete")} className="min-h-10 rounded-lg border border-error-4 px-4 text-sm font-medium text-error-1 hover:bg-error-5">Delete member…</button>
            </div>
          </section>
          </ScrollArea>
        </div>
      </DrawerLayer>}</AnimatePresence>

      <ConfirmModal isOpen={accountAction !== null} onClose={() => setAccountAction(null)} onConfirm={() => {}} title={accountAction === "suspend" ? "Suspend this member?" : "Delete this member?"} description={`This action is currently unavailable because the service does not provide member ${accountAction === "suspend" ? "suspension" : "deletion"}. No changes have been made. Confirmation will be required when this action is available.`} confirmText={accountAction === "suspend" ? "Confirm suspension" : "Confirm deletion"} cancelText="Close" confirmDisabled isDestructive />

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
