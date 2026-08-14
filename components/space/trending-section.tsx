"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, Flame } from "lucide-react";
import { api } from "@/services/api";

interface TrendingTopic {
  tag: string;
  count: number;
}

export function TrendingSection({
  organizationId,
  onSelectHashtag,
}: {
  organizationId: string | undefined;
  onSelectHashtag: (tag: string) => void;
}) {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const openingTagRef = useRef<string | null>(null); // guards against double-click re-fetch upstream

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    async function loadTrending(orgId: string) {
      setLoading(true);
      try {
        const res = await api.hashtag.getTrending(orgId);
        if (!cancelled) {
          setTopics(res.items.slice(0, 5).map((item) => ({ tag: item.tagName, count: item.totalPostCount })));
        }
      } catch {
        if (!cancelled) setTopics([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadTrending(organizationId);
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const handleClick = (tag: string) => {
    if (openingTagRef.current === tag) return;
    openingTagRef.current = tag;
    onSelectHashtag(tag);
    // release the guard shortly after — the parent's fetch has its own
    // loading state; this only needs to block a same-tick double click.
    setTimeout(() => {
      openingTagRef.current = null;
    }, 500);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[12px] border border-grey-4 p-5">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-1" />
          <h3 className="text-[16px] font-bold text-grey-1">Trending across spaces</h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-grey-5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-grey-4 p-5">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary-1" />
        <h3 className="text-[16px] font-bold text-grey-1">Trending across spaces</h3>
      </div>

      {topics.length === 0 ? (
        <p className="text-xs text-grey-3">Nothing trending yet — check back soon.</p>
      ) : (
        <div className="space-y-5">
          {topics.map((topic, index) => (
            <div
              key={topic.tag}
              role="button"
              className="flex items-start justify-between cursor-pointer group"
              onClick={() => handleClick(topic.tag)}
            >
              <div className="flex gap-3">
                <span className="text-sm font-medium text-grey-3 w-4">{index + 1}</span>
                <div>
                  <div className="text-sm font-bold text-grey-1 group-hover:text-primary-1 transition-colors">
                    {topic.tag}
                  </div>
                  <div className="text-xs text-grey-3">
                    {topic.count} {topic.count === 1 ? "post" : "posts"}
                  </div>
                </div>
              </div>
              <Flame
                className={`w-4 h-4 ${
                  index === 0
                    ? "text-primary-1"
                    : index === 1
                      ? "text-purple-500"
                      : index === 2 || index === 3
                        ? "text-green-500"
                        : "text-red-500"
                }`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}