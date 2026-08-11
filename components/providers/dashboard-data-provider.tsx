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
  addBranch: (name: string) => Promise<Branch>;
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

    let me: CurrentUserResponse;
    try {
      me = await api.auth.me();
      setCurrentUser(me);
    } catch (reason) {
      setCurrentUser(null);
      setError(reason instanceof Error ? reason.message : "Unable to load your account.");
      setIsLoading(false);
      return;
    }

    const bootstrapResult = await Promise.resolve(api.dashboard.bootstrap(me.organizationId)).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason: unknown) => ({ status: "rejected" as const, reason }),
    );

    if (bootstrapResult.status === "fulfilled") {
      setData(bootstrapResult.value);
    } else {
      setError(
        bootstrapResult.reason instanceof Error
          ? bootstrapResult.reason.message
          : "Unable to load dashboard data.",
      );
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const nameCurrentBranch = useCallback(async (name: string) => {
    const renamed = await api.branches.nameCurrent(name);
    setData((current) => {
      const previousName = current.activeBranch;
      const rename = <T extends { branch: string }>(items: T[]) => items.map((item) => (
        item.branch === previousName ? { ...item, branch: renamed.name } : item
      ));

      return {
        ...current,
        activeBranch: renamed.name,
        branches: [renamed],
        members: rename(current.members),
        departments: rename(current.departments),
        events: rename(current.events),
        challenges: rename(current.challenges),
      };
    });
    return renamed;
  }, []);

  const addBranch = useCallback(async (name: string) => {
    if (!currentUser?.organizationId) throw new Error("Organization is not loaded.");
    const created = await api.organization.createBranch(currentUser.organizationId, name);
    setData((current) => ({
      ...current,
      branches: [...current.branches, created],
      activeBranch: created.name,
    }));
    return created;
  }, [currentUser?.organizationId]);

  const setActiveBranch = useCallback(async (name: string) => {
    await api.branches.select(name);
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
