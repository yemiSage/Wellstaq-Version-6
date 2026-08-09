"use client";
// path: components/providers/dashboard-data-provider.tsx

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import type { Branch, CurrentUserResponse, DashboardBootstrap, UserProfile } from "@/types/api";

const emptyData: DashboardBootstrap = {
  user: {
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
  },
  branches: [],
  activeBranch: "",
  members: [],
  departments: [],
  events: [],
  challenges: [],
  leaderboard: [],
  participantOptions: [],
};

interface DashboardDataContextValue extends DashboardBootstrap {
  isLoading: boolean;
  error: string | null;
  currentUser: CurrentUserResponse | null;
  organizationId: string | null;
  refresh: () => Promise<void>;
  nameCurrentBranch: (name: string) => Promise<Branch>;
  addBranch: (branch: Omit<Branch, "id">) => Promise<Branch>;
  setActiveBranch: (name: string) => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => void;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardBootstrap>(emptyData);
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Bootstrap is organization-scoped, so /auth/me must resolve first.
    // Calling both concurrently forced the old frontend-only /v1 route.
    const meResult = await Promise.resolve(api.auth.me()).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason: unknown) => ({ status: "rejected" as const, reason }),
    );

    const bootstrapResult = meResult.status === "fulfilled"
      ? await Promise.resolve(api.dashboard.bootstrap(meResult.value.organizationId)).then(
        (value) => ({ status: "fulfilled" as const, value }),
        (reason: unknown) => ({ status: "rejected" as const, reason }),
      )
      : ({ status: "rejected" as const, reason: meResult.reason });

    if (bootstrapResult.status === "fulfilled") {
      setData(bootstrapResult.value);
    } else {
      setError(
        bootstrapResult.reason instanceof Error
          ? bootstrapResult.reason.message
          : "Unable to load dashboard data.",
      );
    }

    if (meResult.status === "fulfilled") {
      setCurrentUser(meResult.value);
    }
    // If /auth/me itself fails, currentUser stays null and organizationId-
    // dependent effects (like the stats fetch) correctly stay idle — that's
    // a real "not logged in" case, distinct from bootstrap being unfinished.

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const nameCurrentBranch = useCallback(async (name: string) => {
    const currentBranch = data.branches.find((branch) => branch.name === data.activeBranch);
    const orgId = currentUser?.organizationId;
    if (!currentBranch || !orgId) throw new Error("No active branch is available to rename.");
    const renamed = await api.branches.update(orgId, currentBranch.id, name);
    setData((current) => {
      const previousName = current.activeBranch;
      const rename = <T extends { branch: string }>(items: T[]) => items.map((item) => (
        item.branch === previousName ? { ...item, branch: renamed.name } : item
      ));

      return {
        ...current,
        activeBranch: renamed.name,
        branches: current.branches.map((branch) => branch.id === renamed.id ? renamed : branch),
        members: rename(current.members),
        departments: rename(current.departments),
        events: rename(current.events),
        challenges: rename(current.challenges),
      };
    });
    return renamed;
  }, [currentUser?.organizationId, data.activeBranch, data.branches]);

  const addBranch = useCallback(async (branch: Omit<Branch, "id">) => {
    const orgId = currentUser?.organizationId ?? branch.organizationId;
    const created = await api.branches.create(orgId, branch.name);
    setData((current) => ({
      ...current,
      branches: [...current.branches, created],
      activeBranch: created.name,
    }));
    return created;
  }, [currentUser?.organizationId]);

  const setActiveBranch = useCallback(async (name: string) => {
    setData((current) => ({ ...current, activeBranch: name }));
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setData((current) => ({ ...current, user: { ...current.user, ...updates } }));
  }, []);

  const value = useMemo(() => ({
    ...data,
    isLoading,
    error,
    currentUser,
    organizationId: currentUser?.organizationId ?? null,
    refresh,
    nameCurrentBranch,
    addBranch,
    setActiveBranch,
    updateUser,
  }), [addBranch, currentUser, data, error, isLoading, nameCurrentBranch, refresh, setActiveBranch, updateUser]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return context;
}
