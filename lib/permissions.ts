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

const ACTION_WORDS = new Set(["create", "update", "delete", "view", "manage", "assign", "grant", "revoke", "invite", "moderate"]);

export function readablePermission(permissionName: string): string {
  const parts = permissionName.split(".").filter(Boolean);
  if (parts.length === 0) return "this action";
  const actionIndex = [...parts].reverse().findIndex((part) => ACTION_WORDS.has(part));
  if (actionIndex >= 0) {
    const index = parts.length - 1 - actionIndex;
    const action = parts[index];
    const subject = [...parts.slice(0, index), ...parts.slice(index + 1)].map((part) => part === "org" ? "organization" : part).join(" ");
    return `${action.charAt(0).toUpperCase()}${action.slice(1)} ${subject}`.trim();
  }
  return parts.map((part) => part === "org" ? "organization" : part).join(" ").replace(/^./, (letter) => letter.toUpperCase());
}

export function permissionDeniedMessage(permissionName: string): string {
  return `You don't have permission to ${readablePermission(permissionName).toLowerCase()}.`;
}

export function permissionFromError(message: string): string | null {
  const match = message.match(/permission[^a-z0-9_.]+([a-z][a-z0-9_.]+)/i)
    ?? message.match(/([a-z][a-z0-9_.]+)[^a-z0-9_.]+permission/i);
  return match?.[1] ?? null;
}
