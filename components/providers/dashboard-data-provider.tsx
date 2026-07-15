"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import type { Branch, DashboardBootstrap, UserProfile } from "@/types/api";

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
  refresh: () => Promise<void>;
  nameCurrentBranch: (name: string) => Promise<Branch>;
  addBranch: (branch: Omit<Branch, "id">) => Promise<Branch>;
  setActiveBranch: (name: string) => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => void;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardBootstrap>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await api.dashboard.bootstrap());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const nameCurrentBranch = useCallback(async (name: string) => {
    const renamed = await api.branches.nameCurrent(name);
    setData((current) => {
      const previousName = current.activeBranch;
      const rename = <T extends {branch: string}>(items: T[]) => items.map((item) => (
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

  const addBranch = useCallback(async (branch: Omit<Branch, "id">) => {
    const created = await api.branches.create(branch);
    setData((current) => ({
      ...current,
      branches: [...current.branches, created],
      activeBranch: created.name,
    }));
    return created;
  }, []);

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
    refresh,
    nameCurrentBranch,
    addBranch,
    setActiveBranch,
    updateUser,
  }), [addBranch, data, error, isLoading, nameCurrentBranch, refresh, setActiveBranch, updateUser]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return context;
}
