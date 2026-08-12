"use client";

import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { hasPermission, readablePermission } from "@/lib/permissions";

function useAllowed(permission: string) {
  const { currentUser } = useDashboardData();
  const { scope } = useDashboardScope();
  const branchId = scope.type === "branch" ? scope.branchId : undefined;
  return currentUser ? hasPermission(currentUser.permissions, permission, branchId) : false;
}

export function PermissionAction({ permission, children }: { permission: string; children: ReactNode }) {
  return useAllowed(permission) ? <>{children}</> : null;
}

export function PermissionCard({ permission, children, className = "rounded-xl border border-grey-4 bg-white p-6" }: { permission: string; children: ReactNode; className?: string }) {
  const allowed = useAllowed(permission);
  if (allowed) return <>{children}</>;
  return <div className={className}><div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center"><LockKeyhole className="h-5 w-5 text-grey-3" /><p className="text-sm font-medium text-grey-2">You don&apos;t have permission to {readablePermission(permission).toLowerCase()}.</p></div></div>;
}
