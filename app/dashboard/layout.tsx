// path: app/dashboard/layout.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { DashboardDataProvider, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { getSwitchableScopes } from "@/lib/permissions";
import { clearAuthTokens } from "@/services/auth-token";

function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { currentUser, isLoading } = useDashboardData();

  useEffect(() => {
    if (isLoading || !currentUser) return;

    if (!getSwitchableScopes(currentUser.permissions).canViewOverview) {
      clearAuthTokens();
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
      const params = new URLSearchParams(searchParams.toString());
      params.set("branchId", defaultBranchId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [currentUser, isLoading, pathname, router, searchParams]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-grey-3">Loading...</div>;
  }

  if (currentUser && !getSwitchableScopes(currentUser.permissions).canViewOverview) {
    return <div className="flex h-screen items-center justify-center px-6 text-center text-sm text-red-600">You don&apos;t have permission to view this resource. Redirecting to login...</div>;
  }

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isSpacePage = pathname === "/dashboard/space";

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <DashboardDataProvider>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-grey-3">Loading...</div>}>
        <AccessGate>
          <div className="flex h-dvh bg-grey-5 overflow-hidden">
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
              <main className={`flex-1 min-h-0 min-w-0 no-scrollbar [&>div]:!mx-0 [&>div]:!w-full [&>div]:!max-w-none ${isSpacePage ? "overflow-hidden p-0" : "overflow-y-auto px-3 py-3"}`}>
                {children}
              </main>
            </div>
          </div>
        </AccessGate>
      </Suspense>
    </DashboardDataProvider>
  );
}
