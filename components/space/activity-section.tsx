"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { Lock } from "lucide-react";

interface WeeklyStats {
  steps: number;
  posts: number;
  likes: number;
  groups: number;
}
type StatKey = keyof WeeklyStats;

function currentWeekBounds(): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };
  return { periodStart: toISODate(monday), periodEnd: toISODate(sunday) };
}

const STEPS_POLL_MS = 60_000;

export function ActivitySection({
  organizationId,
  userId,
  groupsJoined,
  groupsRestricted,
  postDelta,
  likeDelta,
}: {
  organizationId: string | undefined;
  userId: string | undefined;
  groupsJoined: number;
  groupsRestricted?: boolean;
  /** Bump this number (e.g. Date.now()) whenever the user creates a post,
   *  so this component knows to bump its local post count optimistically. */
  postDelta: number;
  /** Bump this number whenever the user likes a post (increments only —
   *  should NOT be bumped on unlike, see SpacePage wiring). */
  likeDelta: number;
}) {
  const [stats, setStats] = useState<WeeklyStats>({ steps: 0, posts: 0, likes: 0, groups: 0 });
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState<Set<StatKey>>(new Set());

  const loadStats = useCallback(async () => {
    if (!organizationId || !userId) {
      setLoading(false);
      return;
    }
    const { periodStart, periodEnd } = currentWeekBounds();
    try {
      const [trendResult, postsResult, likesResult] = await Promise.allSettled([
        api.activity.getWeeklyStepsTrend(organizationId),
        api.post.getPostsByUser(organizationId, userId, { periodStart, periodEnd, limit: 1 }),
        api.post.getLikesGivenCount(organizationId, { periodStart, periodEnd }),
      ]);

      // FIX: Promise.allSettled never rejects, so the outer try/catch below
      // was dead code — any failure in postsResult/likesResult that wasn't
      // a 403 (wrong param name, bad response shape, 500, network error,
      // etc.) was silently swallowed and just fell through to "keep
      // showing 0". Log every rejection here so real failures are visible
      // in devtools instead of looking like permanently-empty stats.
      const labels: StatKey[] = ["steps", "posts", "likes"];
      [trendResult, postsResult, likesResult].forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(`ActivitySection: "${labels[i]}" fetch failed:`, result.reason);
        }
      });

      const nextRestricted = new Set<StatKey>();
      const forbidden = (result: PromiseSettledResult<unknown>) =>
        result.status === "rejected" && result.reason instanceof ApiError && result.reason.status === 403;
      if (forbidden(trendResult)) nextRestricted.add("steps");
      if (forbidden(postsResult)) nextRestricted.add("posts");
      if (forbidden(likesResult)) nextRestricted.add("likes");
      if (groupsRestricted) nextRestricted.add("groups");
      setRestricted(nextRestricted);

      setStats((current) => {
        const point = trendResult.status === "fulfilled"
          ? trendResult.value.points.find((item) => item.period === periodStart) ?? trendResult.value.points.at(-1)
          : undefined;
        const steps = point ? Number(point.value) : current.steps;
        return {
          steps: Number.isFinite(steps) ? steps : current.steps,
          posts: postsResult.status === "fulfilled" ? postsResult.value.total : current.posts,
          likes: likesResult.status === "fulfilled" ? likesResult.value.count : current.likes,
          groups: groupsJoined,
        };
      });
    } catch (err) {
      // Kept as a defensive net for anything outside the allSettled calls
      // (e.g. currentWeekBounds throwing), though this should rarely fire.
      console.error("ActivitySection load error:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, userId, groupsJoined, groupsRestricted]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Steps: poll periodically since it's device/sync data, not something
  // this component can know about the moment it changes.
  useEffect(() => {
    if (!organizationId || !userId) return;
    const interval = setInterval(() => void loadStats(), STEPS_POLL_MS);
    return () => clearInterval(interval);
  }, [organizationId, userId, loadStats]);

  // Posts/likes: optimistic local bump the instant the parent's action
  // succeeds, no refetch needed.
  useEffect(() => {
    if (postDelta === 0) return;
    setStats((prev) => ({ ...prev, posts: prev.posts + 1 }));
  }, [postDelta]);

  useEffect(() => {
    if (likeDelta === 0) return;
    setStats((prev) => ({ ...prev, likes: prev.likes + 1 }));
  }, [likeDelta]);

  // Groups: always trust the parent's live count directly.
  useEffect(() => {
    setStats((prev) => ({ ...prev, groups: groupsJoined }));
  }, [groupsJoined]);

  if (loading) {
    return (
      <div className="bg-grey-5 border border-grey-4 rounded-[12px] p-5 mb-6 text-grey-1">
        <div className="space-y-1 mb-6">
          <h3 className="text-[16px] font-bold">Your Activity This Week</h3>
          <p className="text-xs text-grey-2">Keep the momentum going!</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-grey-4 rounded-lg p-3 h-[72px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-grey-5 border border-grey-4 rounded-[12px] p-5 mb-6 text-grey-1">
      <div className="space-y-1 mb-6">
        <h3 className="text-[16px] font-bold">Your Activity This Week</h3>
        <p className="text-xs text-grey-2">Keep the momentum going!</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-grey-4 rounded-lg p-3">
          <div className="text-lg mb-1">🏃</div>
          <div className="text-lg font-bold">{restricted.has("steps") ? <Lock className="h-4 w-4" /> : stats.steps.toLocaleString()}</div>
          <div className="text-[10px] text-grey-2">Steps</div>
          {restricted.has("steps") && <div className="mt-1 text-[9px] text-grey-2">No permission to view</div>}
        </div>
        <div className="bg-white border border-grey-4 rounded-lg p-3">
          <div className="text-lg mb-1">✍️</div>
          <div className="text-lg font-bold">{restricted.has("posts") ? <Lock className="h-4 w-4" /> : stats.posts}</div>
          <div className="text-[10px] text-grey-2">Posts</div>
          {restricted.has("posts") && <div className="mt-1 text-[9px] text-grey-2">No permission to view</div>}
        </div>
        <div className="bg-white border border-grey-4 rounded-lg p-3">
          <div className="text-lg mb-1">🤍</div>
          <div className="text-lg font-bold">{restricted.has("likes") ? <Lock className="h-4 w-4" /> : stats.likes}</div>
          <div className="text-[10px] text-grey-2">Likes Given</div>
          {restricted.has("likes") && <div className="mt-1 text-[9px] text-grey-2">No permission to view</div>}
        </div>
        <div className="bg-white border border-grey-4 rounded-lg p-3">
          <div className="text-lg mb-1">👥</div>
          <div className="text-lg font-bold">{restricted.has("groups") ? <Lock className="h-4 w-4" /> : `${stats.groups} joined`}</div>
          <div className="text-[10px] text-grey-2">Groups</div>
          {restricted.has("groups") && <div className="mt-1 text-[9px] text-grey-2">No permission to view</div>}
        </div>
      </div>
    </div>
  );
}
