"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";

interface WeeklyStats {
  steps: number;
  posts: number;
  likes: number;
  groups: number;
}

function currentWeekBounds(): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return { periodStart: toISODate(monday), periodEnd: toISODate(sunday) };
}

const STEPS_POLL_MS = 60_000;

export function ActivitySection({
  organizationId,
  userId,
  postDelta,
  likeDelta,
  groupDelta,
}: {
  organizationId: string | null | undefined;
  userId: string | undefined;
  /** Bump this number (e.g. Date.now()) whenever the user creates a post,
   *  so this component knows to bump its local post count optimistically. */
  postDelta: number;
  /** Bump this number whenever the user likes a post (increments only —
   *  should NOT be bumped on unlike, see SpacePage wiring). */
  likeDelta: number;
  /** Bump whenever the user successfully joins a club. */
  groupDelta: number;
}) {
  const [stats, setStats] = useState<WeeklyStats>({ steps: 0, posts: 0, likes: 0, groups: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
  if (!organizationId || !userId) {
    setLoading(false);
    return;
  }
  const { periodStart, periodEnd } = currentWeekBounds();
  try {
    const [trendResult, postsResult, likesResult, clubsResult] = await Promise.allSettled([
      api.activity.getWeeklyStepsTrend(organizationId),
      api.post.getPostsByUser(organizationId, userId, { periodStart, periodEnd, limit: 1 }),
      api.post.getLikesGivenCount(organizationId, { periodStart, periodEnd }),
      api.club.getAllClubsForUser(organizationId, userId),
    ]);
    const trendPoints = trendResult.status === "fulfilled" ? trendResult.value.points : [];
    const currentWeekPoint = trendPoints.find((p) => p.period.startsWith(periodStart)) ?? trendPoints.at(-1);
    const stepsValue = currentWeekPoint ? Number(currentWeekPoint.value) : 0;
    setStats({
      steps: Number.isFinite(stepsValue) ? stepsValue : 0,
      posts: postsResult.status === "fulfilled" ? postsResult.value.total : 0,
      likes: likesResult.status === "fulfilled" ? likesResult.value.count : 0,
      groups: clubsResult.status === "fulfilled"
        ? clubsResult.value.filter((club) => club.isMember).length
        : 0,
    });

    [trendResult, postsResult, likesResult, clubsResult].forEach((result) => {
      if (result.status === "rejected") console.error("Activity metric load error:", result.reason);
    });
  } catch (err) {
    console.error("ActivitySection load error:", err); // was silently swallowed — add this so future failures are visible in devtools instead of just showing 0s forever
  } finally {
    setLoading(false);
  }
}, [organizationId, userId]);

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

  useEffect(() => {
    if (groupDelta === 0) return;
    setStats((prev) => ({ ...prev, groups: prev.groups + 1 }));
  }, [groupDelta]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#EA6A05] to-[#FFB780] rounded-[12px] p-5 mb-6 text-white shadow-sm">
        <div className="space-y-1 mb-6">
          <h3 className="text-[16px] font-bold">Your Activity This Week</h3>
          <p className="text-xs text-white/80">Keep the momentum going!</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/20 rounded-lg p-3 h-[72px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#EA6A05] to-[#FFB780] rounded-[12px] p-5 mb-6 text-white shadow-sm">
      <div className="space-y-1 mb-6">
        <h3 className="text-[16px] font-bold">Your Activity This Week</h3>
        <p className="text-xs text-white/80">Keep the momentum going!</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-lg mb-1">🏃</div>
          <div className="text-lg font-bold">{stats.steps.toLocaleString()}</div>
          <div className="text-[10px] text-white/80">Steps</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-lg mb-1">✍️</div>
          <div className="text-lg font-bold">{stats.posts}</div>
          <div className="text-[10px] text-white/80">Posts</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-lg mb-1">🤍</div>
          <div className="text-lg font-bold">{stats.likes}</div>
          <div className="text-[10px] text-white/80">Likes Given</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-lg mb-1">👥</div>
          <div className="text-lg font-bold">{stats.groups} joined</div>
          <div className="text-[10px] text-white/80">Groups</div>
        </div>
      </div>
    </div>
  );
}
