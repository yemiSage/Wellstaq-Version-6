"use client";
// path: components/providers/dashboard-data-provider.tsx

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { getUserErrorMessage } from "@/lib/errors";
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
      setError(getUserErrorMessage(reason, "We couldn't load your account. Try again."));
      setIsLoading(false);
      return;
    }

    const bootstrapResult = await Promise.resolve(api.dashboard.bootstrap(me.organizationId)).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason: unknown) => ({ status: "rejected" as const, reason }),
    );

    if (bootstrapResult.status === "fulfilled") {
      setData({
        ...bootstrapResult.value,
        user: {
          ...bootstrapResult.value.user,
          profileImage: bootstrapResult.value.user.profileImage ?? me.avatarUrl,
        },
      });
    } else {
      setError(getUserErrorMessage(bootstrapResult.reason, "We couldn't load the dashboard. Try again."));
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
    if (!currentUser?.organizationId) throw new Error("Your organization is still loading. Try again shortly.");
    const organizationId = currentUser.organizationId;
    const created = await api.organization.createBranch(organizationId, name);
    setData((current) => ({
      ...current,
      branches: [...current.branches.filter((branch) => branch.id !== created.id), created],
      activeBranch: created.name,
    }));
    // Reconcile with the canonical server list without requiring a browser
    // refresh. Keep the newly-created row if a replica/cache is briefly stale.
    void api.organization.getBranches(organizationId).then((serverBranches) => {
      setData((current) => ({
        ...current,
        branches: serverBranches.some((branch) => branch.id === created.id)
          ? serverBranches
          : [...serverBranches, created],
      }));
    }).catch(() => undefined);
    return created;
  }, [currentUser?.organizationId]);

  const setActiveBranch = useCallback(async (name: string) => {
    await api.branches.select(name);
    setData((current) => ({ ...current, activeBranch: name }));
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setData((current) => ({ ...current, user: { ...current.user, ...updates } }));
    if (updates.profileImage !== undefined) {
      setCurrentUser((current) => current ? { ...current, avatarUrl: updates.profileImage } : current);
    }
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
