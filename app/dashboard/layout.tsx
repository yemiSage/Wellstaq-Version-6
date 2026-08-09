// path: app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { DashboardDataProvider, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { hasPermission, getSwitchableScopes } from "@/lib/permissions";

function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isLoading } = useDashboardData();

  useEffect(() => {
    if (isLoading || !currentUser) return;

    if (!hasPermission(currentUser.permissions, "overview")) {
      router.replace("/login?error=insufficient_permission");
      return;
    }

    // No branchId in the URL means "overview" is the requested scope.
    // Only org-wide overview permission actually grants that — everyone
    // else must default straight to a branch they're actually permitted
    // to view, or they'll hit branch-only stats endpoints with no access.
    const branchIdParam = searchParams.get("branchId");
    if (branchIdParam) return; // already scoped to a specific branch, leave it

    const switchable = getSwitchableScopes(currentUser.permissions);
    if (!switchable.isOrgWide && switchable.scopedBranchIds.length > 0) {
      const defaultBranchId = switchable.scopedBranchIds.includes(currentUser.branchId)
        ? currentUser.branchId
        : switchable.scopedBranchIds[0];
      router.replace(`/dashboard?branchId=${defaultBranchId}`);
    }
  }, [currentUser, isLoading, router, searchParams]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-grey-3">Loading...</div>;
  }

  if (currentUser && !hasPermission(currentUser.permissions, "overview")) {
    return null;
  }

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DashboardDataProvider>
      <AccessGate>
        <div className="flex h-screen bg-grey-5 overflow-hidden">
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className={`fixed lg:relative z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto p-3 no-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </AccessGate>
    </DashboardDataProvider>
  );
}