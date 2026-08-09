// path: lib/permissions.ts
import type { PermissionGrant } from "@/types/api";

export function hasPermission(
  permissions: PermissionGrant[],
  permissionName: string,
  branchId?: string,
): boolean {
  const grants = permissions.filter((p) => p.name === permissionName);
  if (grants.length === 0) return false;
  if (grants.some((g) => g.branchId === null)) return true;
  if (branchId === undefined) return true;
  return grants.some((g) => g.branchId === branchId);
}

export function branchesWithPermission(permissions: PermissionGrant[], permissionName: string): string[] {
  return permissions
    .filter((p) => p.name === permissionName && p.branchId !== null)
    .map((p) => p.branchId as string);
}

export function hasOrgWidePermission(permissions: PermissionGrant[], permissionName: string): boolean {
  return permissions.some((p) => p.name === permissionName && p.branchId === null);
}


export interface SwitchableScopes {
  canViewOverview: boolean;
  isOrgWide: boolean; // org-wide overview → can switch into ANY branch, not just listed ones
  scopedBranchIds: string[]; // specific branches granted, when not org-wide
}

export function getSwitchableScopes(permissions: PermissionGrant[]): SwitchableScopes {
  const isOrgWide = hasOrgWidePermission(permissions, "overview");
  const scopedBranchIds = branchesWithPermission(permissions, "overview");
  return {
    canViewOverview: isOrgWide || scopedBranchIds.length > 0,
    isOrgWide,
    scopedBranchIds,
  };
}

// add to lib/permissions.ts
export function getCreatableBranches(permissions: PermissionGrant[], permissionName: string) {
  return {
    canCreateOrgWide: hasOrgWidePermission(permissions, permissionName),
    branchIds: branchesWithPermission(permissions, permissionName),
  };
}