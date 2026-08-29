"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Globe2, Lock, Plus, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { hasPermission } from "@/lib/permissions";
import { api } from "@/services/api";
import { CLUB_CATEGORIES } from "@/types/api";
import type { Club, ClubCategory, ClubMemberInfo } from "@/types/api";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "fitness" as ClubCategory,
  privacy: "public" as "public" | "private",
};

export default function ClubsPage() {
  const { activeBranch, branches, currentUser, organizationId } = useDashboardData();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubMembers, setClubMembers] = useState<ClubMemberInfo[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const branchId = currentUser?.branchId || branches.find((branch) => branch.name === activeBranch)?.id;
  const canCreateClub = currentUser
    ? hasPermission(currentUser.permissions, "club.create", branchId)
    : false;

  const loadClubs = useCallback(async () => {
    if (!organizationId) return;
    setClubs([]);
    setSelectedClub(null);
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.club.getClubs(organizationId, { branchId, limit: 100 });
      setClubs(response.items);
    } catch {
      setError("We couldn't load clubs. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [branchId, organizationId]);

  useEffect(() => { void loadClubs(); }, [loadClubs]);

  useEffect(() => {
    if (!organizationId || !selectedClub) {
      setClubMembers([]);
      return;
    }
    let cancelled = false;
    setClubMembers([]);
    setMembersLoading(true);
    void api.club.getClubMembers(organizationId, selectedClub.id)
      .then((response) => { if (!cancelled) setClubMembers(response.items); })
      .catch(() => { if (!cancelled) setClubMembers([]); })
      .finally(() => { if (!cancelled) setMembersLoading(false); });
    return () => { cancelled = true; };
  }, [organizationId, selectedClub]);

  const filteredClubs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clubs;
    return clubs.filter((club) => (
      club.name.toLowerCase().includes(query) ||
      (club.description ?? "").toLowerCase().includes(query) ||
      club.category.toLowerCase().includes(query)
    ));
  }, [clubs, searchQuery]);

  const stats = useMemo(() => ({
    totalClubs: clubs.length,
    totalMembers: clubs.reduce((total, club) => total + club.memberCount, 0),
    publicClubs: clubs.filter((club) => club.privacy === "public").length,
    privateClubs: clubs.filter((club) => club.privacy === "private").length,
  }), [clubs]);

  const createClub = async () => {
    if (!organizationId || !branchId || !form.name.trim() || isCreating) return;
    setIsCreating(true);
    try {
      await api.club.createClub(organizationId, branchId, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        privacy: form.privacy,
      });
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      toast.success("Club created successfully");
      await loadClubs();
    } catch {
      toast.error("We couldn't create the club. Try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Clubs</h1>
          <p className="text-sm text-grey-2">Join communities that match your goals.</p>
        </div>
        {canCreateClub && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-1 px-4 py-2 text-sm font-medium text-white hover:bg-[#C45700]"
          >
            <Plus className="h-4 w-4" /> Create Club
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total Clubs", stats.totalClubs],
          ["Total Members", stats.totalMembers],
          ["Public Clubs", stats.publicClubs],
          ["Private Clubs", stats.privateClubs],
        ].map(([label, value]) => (
          <div key={label} className="dashboard-card border border-grey-4">
            <p className="text-xs font-medium text-grey-2 sm:text-sm">{label}</p>
            <p className="mt-2 text-xl font-bold text-grey-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-3" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search clubs"
          className="h-11 w-full rounded-lg border border-grey-4 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading clubs">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-xl bg-grey-4" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredClubs.length === 0 && (
        <div className="rounded-xl border border-dashed border-grey-4 bg-white px-6 py-16 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-grey-3" />
          <h2 className="font-semibold text-grey-1">No clubs found</h2>
          <p className="mt-1 text-sm text-grey-3">Clubs returned by the backend will appear here.</p>
        </div>
      )}

      {!isLoading && !error && filteredClubs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClubs.map((club) => (
            <button
              key={club.id}
              onClick={() => setSelectedClub(club)}
              className="overflow-hidden rounded-xl border border-grey-4 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative flex h-36 items-center justify-center bg-grey-5 text-2xl font-bold text-grey-2">
                {club.imageUrl ? (
                  <Image src={club.imageUrl} alt="" fill className="object-cover" />
                ) : (
                  club.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-grey-1">{club.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-grey-3">{club.description || "No description provided."}</p>
                  </div>
                  {club.privacy === "public" ? <Globe2 className="h-4 w-4 text-grey-3" /> : <Lock className="h-4 w-4 text-grey-3" />}
                </div>
                <div className="flex items-center justify-between text-xs text-grey-3">
                  <span className="capitalize">{club.category.replaceAll("_", " ")}</span>
                  <span>{club.memberCount} member{club.memberCount === 1 ? "" : "s"}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={`${selectedClub.name} details`}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-grey-1">{selectedClub.name}</h2>
                <p className="mt-1 text-sm text-grey-3">{selectedClub.description || "No description provided."}</p>
              </div>
              <button onClick={() => setSelectedClub(null)} className="rounded-lg p-2 text-grey-3 hover:bg-grey-5" aria-label="Close club details">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 border-t border-grey-4 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-grey-1">Members</h3>
              {membersLoading && <div className="h-24 animate-pulse rounded-lg bg-grey-4" />}
              {!membersLoading && clubMembers.length === 0 && <p className="text-sm text-grey-3">No members returned by the backend.</p>}
              {!membersLoading && clubMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 border-b border-grey-5 py-3 last:border-0">
                  <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-grey-4 text-xs font-semibold text-grey-2">
                    {member.avatarUrl ? <Image src={member.avatarUrl} alt="" fill className="object-cover" /> : `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-grey-1">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-grey-3">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Create club">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-grey-1">Create Club</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-lg p-2 text-grey-3 hover:bg-grey-5" aria-label="Close create club form"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-grey-1">Club name
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-grey-4 px-3 font-normal focus:outline-none focus:ring-2 focus:ring-primary-1" />
              </label>
              <label className="block text-sm font-medium text-grey-1">Description
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="mt-2 w-full rounded-lg border border-grey-4 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary-1" />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-grey-1">Category
                  <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ClubCategory }))} className="mt-2 h-11 w-full rounded-lg border border-grey-4 px-3 font-normal">
                    {CLUB_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-grey-1">Privacy
                  <select value={form.privacy} onChange={(event) => setForm((current) => ({ ...current, privacy: event.target.value as "public" | "private" }))} className="mt-2 h-11 w-full rounded-lg border border-grey-4 px-3 font-normal">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="rounded-lg border border-grey-4 px-4 py-2 text-sm font-medium text-grey-2">Cancel</button>
              <button onClick={() => void createClub()} disabled={!form.name.trim() || isCreating || !branchId} className="rounded-lg bg-primary-1 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isCreating ? "Creating..." : "Create Club"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
