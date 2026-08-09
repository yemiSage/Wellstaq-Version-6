"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Video, X, Loader2, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { Story, OrganizationMemberInfo } from "@/types/api";

const IMAGE_STORY_DURATION_MS = 5000;

// ── Shared avatar primitive — used across all space/ sections ─────────────
export function Avatar({
  url, firstName, lastName, seed, size = 40, className = "", showPlaceholderBadge = false,
}: {
  url?: string | null;
  firstName?: string;
  lastName?: string;
  seed?: string;
  size?: number;
  className?: string;
  showPlaceholderBadge?: boolean;
}) {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Member";
  const isPlaceholder = !url;
  const imgSrc = url || `https://picsum.photos/seed/${encodeURIComponent(seed || name)}/200/200`;

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Image src={imgSrc} alt={name} fill className="object-cover" referrerPolicy="no-referrer" />
      {isPlaceholder && showPlaceholderBadge && (
        <div
          className="absolute bottom-0 right-0 bg-grey-1/80 rounded-full flex items-center justify-center"
          style={{ width: size * 0.34, height: size * 0.34 }}
        >
          <ImageIcon className="text-white" style={{ width: size * 0.2, height: size * 0.2 }} />
        </div>
      )}
    </div>
  );
}

function StoryThumb({ story, size }: { story: Story; size: number }) {
  if (story.mediaType === "image") {
    return (
      <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size }}>
        <Image src={story.mediaUrl} alt="Story" fill className="object-cover" referrerPolicy="no-referrer" />
      </div>
    );
  }
  return (
    <div className="relative rounded-full overflow-hidden bg-black" style={{ width: size, height: size }}>
      <Image
        src={`https://picsum.photos/seed/${story.id}/200/200`}
        alt="Story video"
        fill
        className="object-cover opacity-50"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Video className="text-white" style={{ width: size * 0.4, height: size * 0.4 }} />
      </div>
    </div>
  );
}

interface StoryGroup {
  userId: string;
  stories: Story[];
}

export function StoriesSection({
  stories,
  getMember,
  currentUser,
  isUploading,
  onUploadStory,
}: {
  stories: Story[];
  getMember: (userId: string) => OrganizationMemberInfo | undefined;
  currentUser: { id: string; profileImage?: string; firstName?: string; lastName?: string };
  isUploading: boolean;
  onUploadStory: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageTimerRef = useRef<number | null>(null);

  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [groupIndex, setGroupIndex] = useState<number | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Group by poster, oldest → newest within each group, so the viewer
  // cycles one person's stories before moving to the next person —
  // matching WhatsApp/Facebook story behavior.
  const storyGroups = useMemo<StoryGroup[]>(() => {
    const map = new Map<string, Story[]>();
    stories.forEach((s) => {
      const arr = map.get(s.userId) ?? [];
      arr.push(s);
      map.set(s.userId, arr);
    });
    return Array.from(map.entries()).map(([userId, items]) => ({
      userId,
      stories: items.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }));
  }, [stories]);

  const currentGroup = groupIndex !== null ? storyGroups[groupIndex] : null;
  const currentStory = currentGroup ? currentGroup.stories[storyIndex] : null;

  const openGroup = (idx: number) => {
    setGroupIndex(idx);
    setStoryIndex(0);
  };

  const close = () => {
    setGroupIndex(null);
    setStoryIndex(0);
    setProgress(0);
  };

  const goNext = useCallback(() => {
    if (groupIndex === null) return;
    const group = storyGroups[groupIndex];
    if (storyIndex + 1 < group.stories.length) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex + 1 < storyGroups.length) {
      setGroupIndex((g) => (g === null ? null : g + 1));
      setStoryIndex(0);
    } else {
      close();
    }
  }, [groupIndex, storyIndex, storyGroups]);

  const goPrev = useCallback(() => {
    if (groupIndex === null) return;
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prevGroup = storyGroups[groupIndex - 1];
      setGroupIndex((g) => (g === null ? null : g - 1));
      setStoryIndex(prevGroup.stories.length - 1);
    }
  }, [groupIndex, storyIndex, storyGroups]);

  // Drives progress bar + auto-advance for the open story.
  useEffect(() => {
    if (imageTimerRef.current) {
      window.clearInterval(imageTimerRef.current);
      imageTimerRef.current = null;
    }
    if (!currentStory) return;

    setViewedIds((prev) => new Set(prev).add(currentStory.id));
    setProgress(0);

    if (currentStory.mediaType === "image") {
      const start = Date.now();
      imageTimerRef.current = window.setInterval(() => {
        const pct = Math.min(100, ((Date.now() - start) / IMAGE_STORY_DURATION_MS) * 100);
        setProgress(pct);
        if (pct >= 100) goNext();
      }, 50);
    }

    return () => {
      if (imageTimerRef.current) {
        window.clearInterval(imageTimerRef.current);
        imageTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory?.id]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - left;
    if (tapX < width * 0.3) goPrev();
    else goNext();
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={onUploadStory} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-14 h-14 rounded-full p-0.5 border-2 border-grey-4 relative disabled:opacity-50">
            <Avatar
              url={currentUser.profileImage}
              seed={currentUser.id}
              firstName={currentUser.firstName}
              lastName={currentUser.lastName}
              size={52}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-1 text-white border-2 border-white flex items-center justify-center">
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            </span>
          </button>
          <span className="text-[10px] font-medium text-grey-2 truncate w-14 text-center">Your Story</span>
        </div>
        {storyGroups.map((group, idx) => {
          const latest = group.stories[group.stories.length - 1];
          const m = getMember(group.userId);
          const allViewed = group.stories.every((s) => viewedIds.has(s.id));
          return (
            <button key={group.userId} onClick={() => openGroup(idx)} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className={`w-14 h-14 rounded-full p-0.5 border-2 ${allViewed ? "border-grey-4" : "border-primary-1"}`}>
                <StoryThumb story={latest} size={52} />
              </div>
              <span className="text-[10px] font-medium text-grey-2 truncate w-14 text-center">{m?.firstName ?? "Member"}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {currentGroup && currentStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="absolute inset-0 bg-black/80" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-black">
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {currentGroup.stories.map((s, i) => (
                  <div key={s.id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{
                        width: i < storyIndex ? "100%" : i === storyIndex ? `${progress}%` : "0%",
                        transition: i === storyIndex ? "none" : "width 150ms linear",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute top-6 left-3 right-12 flex items-center gap-2 z-20">
                <Avatar
                  url={getMember(currentGroup.userId)?.avatarUrl}
                  seed={currentGroup.userId}
                  firstName={getMember(currentGroup.userId)?.firstName}
                  lastName={getMember(currentGroup.userId)?.lastName}
                  size={32}
                  showPlaceholderBadge
                />
                <div>
                  <span className="text-white text-sm font-medium drop-shadow block leading-tight">
                    {getMember(currentGroup.userId)?.firstName ?? "Member"}
                  </span>
                  <span className="text-white/70 text-[10px] drop-shadow">
                    {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <button onClick={close} className="absolute top-6 right-3 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>

              <div className="absolute inset-0 z-10" onClick={handleTap}>
                {currentStory.mediaType === "video" ? (
                  <video
                    ref={videoRef}
                    src={currentStory.mediaUrl}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
                    }}
                    onEnded={goNext}
                  />
                ) : (
                  <Image src={currentStory.mediaUrl} alt="Story" fill className="object-contain" referrerPolicy="no-referrer" />
                )}
              </div>

              {(storyIndex > 0 || groupIndex! > 0) && (
                <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
