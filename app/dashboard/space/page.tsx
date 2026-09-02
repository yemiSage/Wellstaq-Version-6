"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { loadFeedThroughPost } from "@/lib/post-sharing";
import { PanelLeftOpen, X, Loader2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SelectablePill } from "@/components/ui/selectable-pill";
import { ModalLayer } from "@/components/ui/modal-layer";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { hasPermission } from "@/lib/permissions";
import { getUserErrorMessage } from "@/lib/errors";
import type {
  Club, ClubCategory, Post, Comment, Story,
  OrganizationMemberInfo, ClubMemberInfo, MessageResponse,
} from "@/types/api";
import { StoriesSection } from "@/components/space/story-section";
import { PostsSection } from "@/components/space/post-section";
import { ClubSidebar, ClubChatView, CreateClubModal, JoinClubModal } from "@/components/space/club-section";
import { TrendingSection } from "@/components/space/trending-section";
import { ActivitySection } from "@/components/space/activity-section";

const METRIC_TYPES = ["steps", "distance", "squat", "run", "7min_workout"] as const;
const METRIC_BADGE: Record<string, { emoji: string; label: string }> = {
  steps: { emoji: "🏃", label: "Steps Leader" },
  distance: { emoji: "📏", label: "Distance Leader" },
  squat: { emoji: "🏋️", label: "Squat Leader" },
  run: { emoji: "🏃‍♂️", label: "Running Leader" },
  "7min_workout": { emoji: "💪", label: "7-Min Workout" },
};
interface Badge { emoji: string; label: string; rank: number; }

function RestrictedResource({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-grey-4 bg-white p-6 text-center">
      <Lock className="h-6 w-6 text-grey-3" />
      <p className="text-sm text-grey-3">You don&apos;t have permission to view {label}.</p>
    </div>
  );
}

export default function SpacePage() {
  const { user, currentUser, organizationId, branches, isLoading: dashboardLoading } = useDashboardData();
  const { scope } = useDashboardScope();
  const spaceUser = useMemo(() => ({
    ...user,
    id: currentUser?.userId ?? "",
    avatarUrl: currentUser?.avatarUrl,
  }), [user, currentUser?.userId, currentUser?.avatarUrl]);

  const [activeTab, setActiveTab] = useState<"Other Clubs" | "My Clubs">("Other Clubs");
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [isLeftColumnOpen, setIsLeftColumnOpen] = useState(true);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null);
  const [deleteConfirmComment, setDeleteConfirmComment] = useState<{ postId: string; commentId: string } | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"explore" | "feed" | "clubs">("feed");

  const [feedView, setFeedView] = useState<"branch" | "org">("branch");
  const effectiveFeedScope: "org_only" | "branch_and_org" =
    scope.type === "overview" ? "org_only" : feedView === "org" ? "org_only" : "branch_and_org";

  // ── Activity stat deltas (optimistic local bumps — see ActivitySection) ──
  const [postDelta, setPostDelta] = useState(0);
  const [likeDelta, setLikeDelta] = useState(0);
  const [restrictedResources, setRestrictedResources] = useState<Set<"clubs" | "posts" | "stories">>(new Set());
  const setResourceForbidden = useCallback((resource: "clubs" | "posts" | "stories", error?: unknown) => {
    setRestrictedResources((current) => {
      const next = new Set(current);
      if (error instanceof ApiError && error.status === 403) next.add(resource);
      else next.delete(resource);
      return next;
    });
  }, []);

  // ── Hashtag modal (fed by TrendingSection AND inline hashtags in posts) ──
  const [hashtagModalTag, setHashtagModalTag] = useState<string | null>(null);
  const [hashtagPosts, setHashtagPosts] = useState<Post[]>([]);
  const [hashtagPostsLoading, setHashtagPostsLoading] = useState(false);

  const handleSelectHashtag = useCallback(async (tag: string) => {
    if (!organizationId) return;
    setHashtagModalTag(tag);
    setHashtagPosts([]);
    setHashtagPostsLoading(true);
    try {
      const res = await api.hashtag.getPostsByTag(organizationId, tag);
      setHashtagPosts(res.items);
    } catch {
      setHashtagPosts([]);
    } finally {
      setHashtagPostsLoading(false);
    }
  }, [organizationId]);

  // ── Org members map ──────────────────────────────────────────────────
  const [memberMap, setMemberMap] = useState<Map<string, OrganizationMemberInfo>>(new Map());
  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    api.organization.getMembers(organizationId).then((res) => {
      if (cancelled) return;
      setMemberMap(new Map(res.items.map((m) => [m.id, m])));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [organizationId]);
  const getMember = useCallback((userId: string) => memberMap.get(userId), [memberMap]);

  // ── Leaderboard badges ────────────────────────────────────────────────
  const [badgeMap, setBadgeMap] = useState<Map<string, Badge>>(new Map());
  useEffect(() => {
    if (!organizationId) return;
    const isOrgWide = scope.type === "overview" || feedView === "org";
    let cancelled = false;
    async function loadBadges() {
      const next = new Map<string, Badge>();
      await Promise.all(METRIC_TYPES.map(async (metric) => {
        try {
          const res = isOrgWide
            ? await api.leaderboard.getOrg(organizationId!, metric)
            : await api.leaderboard.getBranch(organizationId!, metric);
          res.items.forEach((entry) => {
            const rank = isOrgWide ? entry.orgRank : entry.rank;
            if (rank <= 3 && !next.has(entry.userId)) next.set(entry.userId, { ...METRIC_BADGE[metric], rank });
          });
        } catch {}
      }));
      if (!cancelled) setBadgeMap(next);
    }
    void loadBadges();
    return () => { cancelled = true; };
  }, [organizationId, scope.type, feedView]);

  // ── Clubs ──────────────────────────────────────────────────────────────
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubToJoin, setClubToJoin] = useState<string | null>(null);

  // FIX: club membership ("am I a member of this club?") is personal user
  // data — it must not be re-derived from whichever scoped list happens to
  // come back from the branch vs org-wide endpoint. Previously `allClubs`
  // (and therefore `isMember`) was fully replaced on every scope switch,
  // so a club you'd already joined could come back with `isMember: false`
  // from a differently-scoped call, causing the "+" join button to
  // reappear and membership to not persist across Overview/branch toggles.
  //
  // `joinedClubIds` is the standalone, scope-independent source of truth.
  // It's seeded from whatever the club list has told us so far and is
  // updated optimistically on join — it is never reset by a scope change.
  const joinedClubIdsRef = useRef<Set<string>>(new Set());

  // Membership belongs to the signed-in user, so do not carry it into a
  // different organization if the provider account changes in-place.
  useEffect(() => {
    joinedClubIdsRef.current.clear();
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    // On Overview, wait until bootstrap has supplied the complete branch list.
    // The org-wide discovery endpoint currently returns the right clubs but not
    // reliable per-user `isMember` flags; branch-scoped responses do return them.
    if (scope.type === "overview" && dashboardLoading) return;
    let cancelled = false;
    async function loadClubs(orgId: string) {
      setClubsLoading(true);
      try {
        const response = scope.type === "overview"
          ? await api.club.getClubs(orgId, { limit: 200 })
          : await api.club.getClubs(orgId, { branchId: scope.branchId, limit: 200 });

        // Seed personal membership on a fresh Overview load from every
        // branch-scoped club response. This removes the old dependency on the
        // user visiting a branch first before "My Clubs" becomes accurate.
        if (scope.type === "overview" && branches.length > 0) {
          const branchResponses = await Promise.allSettled(
            branches.map((branch) => api.club.getClubs(orgId, { branchId: branch.id, limit: 200 })),
          );
          if (cancelled) return;
          branchResponses.forEach((result) => {
            if (result.status !== "fulfilled") return;
            result.value.items.forEach((club) => {
              if (club.isMember) joinedClubIdsRef.current.add(club.id);
            });
          });
        }
        if (!cancelled) {
          // Merge: a club is "mine" if either this response says so, or we
          // already knew it was from a previous fetch in another scope.
          const merged = response.items.map((c) => {
            const isMember = c.isMember || joinedClubIdsRef.current.has(c.id);
            return { ...c, isMember };
          });
          merged.forEach((c) => {
            if (c.isMember) joinedClubIdsRef.current.add(c.id);
          });
          setAllClubs(merged);
          setResourceForbidden("clubs");
        }
      } catch (error) {
        if (!cancelled) {
          setAllClubs([]);
          setResourceForbidden("clubs", error);
        }
      } finally {
        if (!cancelled) setClubsLoading(false);
      }
    }
    void loadClubs(organizationId);
    return () => { cancelled = true; };
  }, [organizationId, scope, branches, dashboardLoading, setResourceForbidden]);

  useEffect(() => { setSelectedClub(null); }, [scope]);

  const filteredClubs = allClubs.filter((c) => !c.isMember);
  const filteredMyClubs = allClubs.filter((c) => c.isMember);

  const handleJoinClub = async (id: string) => {
    if (!organizationId) return;
    const club = allClubs.find((c) => c.id === id);
    if (club) {
      try {
        if (!currentUser?.userId) return;
        await api.club.joinClub(organizationId, id, currentUser.userId);
        joinedClubIdsRef.current.add(id); // persist personal membership immediately
        setAllClubs((prev) => prev.map((c) => (c.id === id ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c)));
        toast.success(`Successfully joined ${club.name}!`);
      } catch {
        toast.error("We couldn't join the club. Try again.");
      }
    }
    setClubToJoin(null);
  };

  // ── Club creation ─────────────────────────────────────────────────────
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [newClubData, setNewClubData] = useState<{ name: string; description: string; imageUrl: string; category: ClubCategory }>(
    { name: "", description: "", imageUrl: "", category: "fitness" },
  );
  const [clubImagePreview, setClubImagePreview] = useState<string | null>(null);
  const [isUploadingClubImage, setIsUploadingClubImage] = useState(false);
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [clubCreateError, setClubCreateError] = useState<string | null>(null);
  const clubRequestPending = useRef(false);
  const canCreateClub = !clubsLoading && !dashboardLoading && !!organizationId && scope.type === "branch" &&
    hasPermission(currentUser?.permissions ?? [], "club.create", scope.branchId);

  useEffect(() => {
    return () => { if (clubImagePreview) URL.revokeObjectURL(clubImagePreview); };
  }, [clubImagePreview]);

  const handleClubImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || clubRequestPending.current) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setClubCreateError("Choose a JPG, PNG, WebP or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setClubCreateError("Choose an image smaller than 5 MB.");
      return;
    }
    clubRequestPending.current = true;
    setClubCreateError(null);
    setClubImagePreview(URL.createObjectURL(file));
    setNewClubData((prev) => ({ ...prev, imageUrl: "" }));
    setIsUploadingClubImage(true);
    try {
      const { uploadUrl, mediaUrl } = await api.storage.requestUploadUrl({ domain: "clubs", contentType: file.type });
      const putResponse = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putResponse.ok) throw new Error(`Upload failed with ${putResponse.status}`);
      setNewClubData((prev) => ({ ...prev, imageUrl: mediaUrl }));
    } catch {
      setClubCreateError("Image upload failed. Try again or continue without an image.");
      setClubImagePreview(null);
      setNewClubData((prev) => ({ ...prev, imageUrl: "" }));
    } finally {
      clubRequestPending.current = false;
      setIsUploadingClubImage(false);
    }
  };

  const handleRemoveClubImage = () => {
    if (clubRequestPending.current) return;
    setClubCreateError(null);
    setClubImagePreview(null);
    setNewClubData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clubRequestPending.current) return;
    if (!organizationId) {
      setClubCreateError("Your account is still loading. Try again shortly.");
      return;
    }
    if (scope.type !== "branch") {
      setClubCreateError("Switch to a branch to create a club.");
      return;
    }
    if (!canCreateClub) {
      setClubCreateError("You don't have permission to create clubs in this branch.");
      return;
    }
    const name = newClubData.name.trim();
    const description = newClubData.description.trim();
    if (!name || !description) {
      setClubCreateError("Enter a club name and description.");
      return;
    }
    clubRequestPending.current = true;
    setIsCreatingClub(true);
    setClubCreateError(null);
    try {
      const created = await api.club.createClub(organizationId, scope.branchId, {
        name,
        description,
        imageUrl: newClubData.imageUrl || undefined,
        privacy: "public",
        category: newClubData.category,
      });
      joinedClubIdsRef.current.add(created.id); // creator is automatically a member
      setAllClubs((prev) => [{ ...created, isMember: true }, ...prev.filter((club) => club.id !== created.id)]);
      setActiveTab("My Clubs");
      setIsCreateClubModalOpen(false);
      setNewClubData({ name: "", description: "", imageUrl: "", category: "fitness" });
      setClubImagePreview(null);
      toast.success(`${created.name} created.`);
    } catch (error) {
      setClubCreateError(error instanceof ApiError && error.status === 409
        ? "A club with this name already exists. Choose another name."
        : error instanceof ApiError && error.status === 422
          ? "Check the club details and try again."
          : getUserErrorMessage(error, "We couldn't create the club. Try again."));
    } finally {
      clubRequestPending.current = false;
      setIsCreatingClub(false);
    }
  };

  // ── Posts ──────────────────────────────────────────────────────────────
  const sharedPostId = useSearchParams().get("postId");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploadingPostImage, setIsUploadingPostImage] = useState(false);
  const [postLocation, setPostLocation] = useState<string | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    async function loadPosts(orgId: string) {
      setPostsLoading(true);
      try {
        const items = await loadFeedThroughPost(
          (offset) => effectiveFeedScope === "org_only"
            ? api.post.getPosts(orgId, { scope: "org_only", offset })
            : api.post.getPosts(orgId, { branchId: scope.type === "branch" ? scope.branchId : undefined, scope: "branch_and_org", offset }),
          sharedPostId,
          () => cancelled,
        );
        if (!cancelled) {
          setPosts(items);
          setResourceForbidden("posts");
        }
      } catch (error) {
        if (!cancelled) {
          setPosts([]);
          setResourceForbidden("posts", error);
        }
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    }
    void loadPosts(organizationId);
    return () => { cancelled = true; };
  }, [organizationId, scope, effectiveFeedScope, setResourceForbidden, sharedPostId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostImagePreview(URL.createObjectURL(file));
    setPostImage(null);
    setIsUploadingPostImage(true);
    try {
      const { uploadUrl, mediaUrl } = await api.storage.requestUploadUrl({ domain: "posts", contentType: file.type });
      const putResponse = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putResponse.ok) throw new Error(`Upload failed with ${putResponse.status}`);
      setPostImage(mediaUrl);
    } catch (err) {
      console.error("Post image upload error:", err);
      toast.error("Image upload failed. You can retry or post without an image.");
      setPostImagePreview(null);
      setPostImage(null);
    } finally {
      setIsUploadingPostImage(false);
    }
  };

  const handleCreatePost = async () => {
    if (!organizationId) return;
    if (!postContent.trim() && !postImage && !postLocation) return;
    if (isUploadingPostImage) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }
    const content = postContent + (postLocation ? `\n📍 ${postLocation}` : "");
    const branchId = scope.type === "branch" ? scope.branchId : undefined;
    try {
      const created = await api.post.createPost(organizationId, {
        branchId,
        content: content.trim() || undefined,
        mediaUrl: postImage || undefined,
        mediaType: postImage ? "image" : undefined,
      });
      if (effectiveFeedScope === "org_only" ? !created.branchId : (scope.type === "branch" && created.branchId === scope.branchId)) {
        setPosts((prev) => [created, ...prev]);
      }
      setPostDelta((d) => d + 1);
      setPostContent("");
      setPostImage(null);
      setPostImagePreview(null);
      setPostLocation(null);
      toast.success("Post created successfully!");
    } catch {
      toast.error("We couldn't publish the post. Try again.");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!organizationId) return;
    try {
      await api.post.deletePost(organizationId, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted successfully");
    } catch {
      toast.error("We couldn't delete the post. Try again.");
    } finally {
      setDeleteConfirmPostId(null);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!organizationId) return;
    const isLiked = likedPostIds.has(postId);
    try {
      const result = isLiked
        ? await api.post.unlikePost(organizationId, postId)
        : await api.post.likePost(organizationId, postId);
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(postId); else next.delete(postId);
        return next;
      });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likeCount: result.likeCount } : p)));
      if (!isLiked && result.liked) setLikeDelta((d) => d + 1);
    } catch {
      toast.error("We couldn't update your reaction. Try again.");
    }
  };

  const handleToggleComments = async (postId: string) => {
    setExpandedComments((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
    if (!commentsByPost[postId] && organizationId) {
      try {
        const response = await api.post.getComments(organizationId, postId);
        setCommentsByPost((prev) => ({ ...prev, [postId]: response.items }));
      } catch {
        setCommentsByPost((prev) => ({ ...prev, [postId]: [] }));
      }
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!content.trim() || !organizationId) return;
    try {
      const comment = await api.post.addComment(organizationId, postId, content);
      setCommentsByPost((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), comment] }));
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)));
      if (!expandedComments.includes(postId)) setExpandedComments((prev) => [...prev, postId]);
      toast.success("Comment added!");
    } catch {
      toast.error("We couldn't add the comment. Try again.");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!organizationId) return;
    try {
      await api.post.deleteComment(organizationId, postId, commentId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: (prev[postId] ?? []).filter((c) => c.id !== commentId) }));
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p)));
      toast.success("Comment deleted!");
    } catch {
      toast.error("We couldn't delete the comment. Try again.");
    } finally {
      setDeleteConfirmComment(null);
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setPostLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`),
        () => setPostLocation("Lagos, Nigeria"),
      );
    } else {
      setPostLocation("Lagos, Nigeria");
    }
  };

  // ── Stories ────────────────────────────────────────────────────────────
  const [stories, setStories] = useState<Story[]>([]);
  const [isUploadingStory, setIsUploadingStory] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    async function loadStories(orgId: string) {
      try {
        const response = effectiveFeedScope === "org_only"
          ? await api.story.getStories(orgId, { scope: "org_only" })
          : await api.story.getStories(orgId, { branchId: scope.type === "branch" ? scope.branchId : undefined, scope: "branch_and_org" });
        if (!cancelled) {
          setStories(response.items);
          setResourceForbidden("stories");
        }
      } catch (error) {
        if (!cancelled) {
          setStories([]);
          setResourceForbidden("stories", error);
        }
      }
    }
    void loadStories(organizationId);
    return () => { cancelled = true; };
  }, [organizationId, scope, effectiveFeedScope, setResourceForbidden]);

  function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => reject(new Error("Could not read video metadata"));
      video.src = URL.createObjectURL(file);
    });
  }

  const handleCreateStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organizationId) return;

    if (file.type.startsWith("video/")) {
      try {
        const duration = await getVideoDuration(file);
        if (duration > 60) {
          toast.error("Videos for stories must be 1 minute or shorter.");
          e.target.value = "";
          return;
        }
      } catch {
        toast.error("Couldn't read that video file. Try a different one.");
        e.target.value = "";
        return;
      }
    }

    setIsUploadingStory(true);
    try {
      const { uploadUrl, mediaUrl } = await api.storage.requestUploadUrl({ domain: "stories", contentType: file.type });
      const putResponse = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putResponse.ok) throw new Error(`Upload failed with ${putResponse.status}`);

      const branchId = scope.type === "branch" ? scope.branchId : undefined;
      const created = await api.story.createStory(organizationId, {
        branchId,
        mediaUrl,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      });
      setStories((prev) => [created, ...prev]);
      toast.success("Story posted!");
    } catch (err) {
      console.error("Story upload error:", err);
      toast.error("We couldn't publish the story. Try again.");
    } finally {
      setIsUploadingStory(false);
      e.target.value = "";
    }
  };

  // ── Club chat ──────────────────────────────────────────────────────────
  const [chatMessagesList, setChatMessagesList] = useState<MessageResponse[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [clubMemberMap, setClubMemberMap] = useState<Map<string, ClubMemberInfo>>(new Map());

  const activeClubData = allClubs.find((c) => c.id === selectedClub);
  const canModerateChat = useMemo(() => {
    if (!currentUser || !activeClubData) return false;
    if (activeClubData.leaderId === currentUser?.userId) return true;
    return currentUser.permissions.some(
      (p: { name: string; branchId: string | null }) =>
        p.name === "chat.moderate" && (p.branchId === null || p.branchId === activeClubData.branchId),
    );
  }, [currentUser, activeClubData]);

  useEffect(() => {
    if (!selectedClub || !organizationId || !activeClubData?.isMember) return;
    let cancelled = false;
    async function loadClubChat(clubId: string, orgId: string) {
      setChatLoading(true);
      try {
        const [membersRes, messagesRes] = await Promise.all([
          api.club.getClubMembers(orgId, clubId),
          api.chat.getMessages(orgId, "club", clubId),
        ]);
        if (cancelled) return;
        setClubMemberMap(new Map(membersRes.items.map((m) => [m.id, m])));
        setChatMessagesList(messagesRes.items.slice().reverse());
      } catch {
        if (!cancelled) setChatMessagesList([]);
      } finally {
        if (!cancelled) setChatLoading(false);
      }
    }
    void loadClubChat(selectedClub, organizationId);
    return () => { cancelled = true; };
  }, [selectedClub, organizationId, activeClubData?.isMember]);

  const getChatUser = useCallback(
    (userId: string) => clubMemberMap.get(userId) ?? getMember(userId),
    [clubMemberMap, getMember],
  );

  const handleSendMessage = async (mediaUrl?: string, mediaType?: string) => {
    if (!chatInput.trim() && !mediaUrl) return;
    if (!organizationId || !selectedClub) return;
    try {
      const created = await api.chat.sendMessage(organizationId, "club", selectedClub, {
        content: chatInput.trim() || undefined,
        mediaUrl,
        mediaType,
      });
      setChatMessagesList((prev) => [...prev, created]);
      setChatInput("");
    } catch {
      toast.error("We couldn't send the message. Check your club access and try again.");
    }
  };

  const handleSendAttachment = async (file: File) => {
    if (!organizationId) return;
    const isVideo = file.type.startsWith("video/");
    try {
      const { uploadUrl, mediaUrl } = await api.storage.requestUploadUrl({ domain: "chat", contentType: file.type });
      const putResponse = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putResponse.ok) throw new Error(`Upload failed with ${putResponse.status}`);
      await handleSendMessage(mediaUrl, isVideo ? "video" : "image");
      toast.success("Attachment sent!");
    } catch {
      toast.error("We couldn't send the attachment. Try again.");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!organizationId) return;
    try {
      await api.chat.deleteMessage(organizationId, messageId);
      setChatMessagesList((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message deleted");
    } catch {
      toast.error("We couldn't delete the message. Try again.");
    }
  };

  const handleTogglePin = async (message: MessageResponse) => {
    if (!organizationId) return;
    try {
      if (message.isPinned) {
        await api.chat.unpinMessage(organizationId, message.id);
        setChatMessagesList((prev) => prev.map((m) => (m.id === message.id ? { ...m, isPinned: false } : m)));
      } else {
        await api.chat.pinMessage(organizationId, message.id);
        setChatMessagesList((prev) => prev.map((m) => ({ ...m, isPinned: m.id === message.id })));
      }
    } catch {
      toast.error("We couldn't update the pin. Try again.");
    }
  };

  return (
    <>
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white xl:flex-row">
        <div className="flex shrink-0 border-b border-grey-4 bg-white xl:hidden">
          <button onClick={() => setActiveMobileTab("explore")} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === "explore" ? "border-primary-1 text-primary-1" : "border-transparent text-grey-2"}`}>Explore</button>
          <button onClick={() => setActiveMobileTab("feed")} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === "feed" ? "border-primary-1 text-primary-1" : "border-transparent text-grey-2"}`}>Feed</button>
          <button onClick={() => setActiveMobileTab("clubs")} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === "clubs" ? "border-primary-1 text-primary-1" : "border-transparent text-grey-2"}`}>Clubs</button>
        </div>

        <div className={`min-h-0 flex-1 w-full xl:w-[320px] xl:flex-none shrink-0 border-r border-grey-4 bg-white overflow-y-auto ${!isLeftColumnOpen ? "hidden" : activeMobileTab === "clubs" ? "block" : "hidden xl:block"}`}>
          {restrictedResources.has("clubs") ? <RestrictedResource label="clubs" /> : <ClubSidebar
            isOpen={isLeftColumnOpen}
            onClose={() => setIsLeftColumnOpen(false)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            clubsLoading={clubsLoading}
            filteredClubs={filteredClubs}
            filteredMyClubs={filteredMyClubs}
            onSelectClub={setSelectedClub}
            onRequestJoin={setClubToJoin}
            canCreate={canCreateClub}
            createUnavailableReason={scope.type === "overview" ? "Switch to a branch to create a club." : clubsLoading || dashboardLoading ? "Loading your clubs..." : "You don't have permission to create clubs in this branch."}
            onOpenCreate={() => { setClubCreateError(null); setIsCreateClubModalOpen(true); }}
          />}
        </div>

        <div className={`flex-1 min-w-0 bg-[#FAFAFA] overflow-y-auto ${activeMobileTab === "feed" ? "block" : "hidden xl:block"}`}>
          {selectedClub ? (
            <ClubChatView
              club={activeClubData}
              user={spaceUser}
              chatLoading={chatLoading}
              chatMessages={chatMessagesList}
              getChatUser={getChatUser}
              canModerateChat={canModerateChat}
              chatInput={chatInput}
              onChatInputChange={setChatInput}
              onSendMessage={handleSendMessage}
              onSendAttachment={handleSendAttachment}
              onDeleteMessage={handleDeleteMessage}
              onTogglePin={handleTogglePin}
              onBack={() => setSelectedClub(null)}
              onJoin={() => selectedClub && handleJoinClub(selectedClub)}
            />
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA]">
              <div className="px-4 pt-4 pb-2 bg-white border-b border-grey-4 flex items-center gap-3">
                {!isLeftColumnOpen && (
                  <button onClick={() => setIsLeftColumnOpen(true)} className="text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0">
                    <PanelLeftOpen size={14} strokeWidth={1.5} />
                  </button>
                )}
                <h2 className="page-title">Feed</h2>
                {scope.type === "branch" && (
                  <div className="ml-auto flex bg-grey-5 rounded-lg p-0.5">
                    <SelectablePill onClick={() => setFeedView("branch")} selected={feedView === "branch"} appearance="plain" className="px-3">My Branch</SelectablePill>
                    <SelectablePill onClick={() => setFeedView("org")} selected={feedView === "org"} appearance="plain" className="px-3">General</SelectablePill>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                <div className="max-w-[600px] mx-auto mb-6">
                  {restrictedResources.has("stories") ? <RestrictedResource label="stories" /> : <StoriesSection
                    stories={stories}
                    getMember={getMember}
                    currentUser={currentUser}
                    isUploading={isUploadingStory}
                    onUploadStory={handleCreateStory}
                  />}
                </div>
                {restrictedResources.has("posts") ? <RestrictedResource label="posts" /> : <PostsSection
                  user={spaceUser}
                  posts={posts}
                  postsLoading={postsLoading}
                  sharedPostId={sharedPostId}
                  getMember={getMember}
                  badgeMap={badgeMap}
                  likedPostIds={likedPostIds}
                  commentsByPost={commentsByPost}
                  expandedComments={expandedComments}
                  postContent={postContent}
                  onContentChange={setPostContent}
                  postImagePreview={postImagePreview}
                  isUploadingPostImage={isUploadingPostImage}
                  onImageSelect={handleImageUpload}
                  onRemoveImage={() => { setPostImage(null); setPostImagePreview(null); }}
                  postLocation={postLocation}
                  onShareLocation={handleShareLocation}
                  onClearLocation={() => setPostLocation(null)}
                  onSubmitPost={handleCreatePost}
                  placeholder={effectiveFeedScope === "org_only" ? "Share something in General..." : "Share a workout, milestone, or wellness tip..."}
                  onToggleLike={handleToggleLike}
                  onToggleComments={handleToggleComments}
                  onAddComment={handleAddComment}
                  onRequestDeletePost={setDeleteConfirmPostId}
                  onRequestDeleteComment={(postId, commentId) => setDeleteConfirmComment({ postId, commentId })}
                  onHashtagClick={handleSelectHashtag}
                />}
              </div>
            </div>
          )}
        </div>

       <div className={`min-h-0 flex-1 w-full xl:w-[320px] xl:flex-none shrink-0 border-l border-grey-4 bg-white overflow-y-auto ${activeMobileTab === "explore" ? "block" : "hidden xl:block"}`}>
  <div className="w-full border-l border-grey-4 bg-[#ffffff] p-6 overflow-y-auto no-scrollbar h-full">
    <ActivitySection
      organizationId={organizationId ?? undefined}
      userId={currentUser?.userId}
      groupsJoined={filteredMyClubs.length}
      groupsRestricted={restrictedResources.has("clubs")}
      postDelta={postDelta}
      likeDelta={likeDelta}
    />
    <TrendingSection organizationId={organizationId ?? undefined} onSelectHashtag={handleSelectHashtag} />
  </div>
</div>
      </div>

      <CreateClubModal
        isOpen={isCreateClubModalOpen}
        onClose={() => { if (!clubRequestPending.current) setIsCreateClubModalOpen(false); }}
        formData={newClubData}
        onFormChange={(patch) => { setClubCreateError(null); setNewClubData((prev) => ({ ...prev, ...patch })); }}
        imagePreview={clubImagePreview}
        isUploadingImage={isUploadingClubImage}
        isCreating={isCreatingClub}
        error={clubCreateError}
        onImageSelect={handleClubImageSelect}
        onRemoveImage={handleRemoveClubImage}
        onSubmit={handleCreateClub}
      />

      <JoinClubModal clubId={clubToJoin} onCancel={() => setClubToJoin(null)} onConfirm={handleJoinClub} />

      <ConfirmModal isOpen={!!deleteConfirmPostId} onClose={() => setDeleteConfirmPostId(null)} onConfirm={() => deleteConfirmPostId && handleDeletePost(deleteConfirmPostId)} title="Delete Post" description="Are you sure you want to delete this post? This action cannot be undone." confirmText="Delete Post" isDestructive />
      <ConfirmModal isOpen={!!deleteConfirmComment} onClose={() => setDeleteConfirmComment(null)} onConfirm={() => deleteConfirmComment && handleDeleteComment(deleteConfirmComment.postId, deleteConfirmComment.commentId)} title="Delete Comment" description="Are you sure you want to delete this comment? This action cannot be undone." confirmText="Delete Comment" isDestructive />

      <AnimatePresence>
        {hashtagModalTag && (
          <ModalLayer className="flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setHashtagModalTag(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-grey-4 flex items-center justify-between bg-grey-5/30 shrink-0">
                <h3 className="text-lg font-bold text-grey-1">{hashtagModalTag}</h3>
                <button onClick={() => setHashtagModalTag(null)} className="p-2 hover:bg-grey-4 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-grey-2" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                {hashtagPostsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-primary-1 animate-spin" />
                  </div>
                ) : hashtagPosts.length === 0 ? (
                  <p className="text-sm text-grey-3 text-center py-10">No posts found for this hashtag yet.</p>
                ) : (
                  hashtagPosts.map((post) => (
                    <div key={post.id} className="border border-grey-4 rounded-xl p-4">
                      {post.content && <p className="text-sm text-grey-1 whitespace-pre-wrap mb-3">{post.content}</p>}
                      {post.mediaType === "image" && post.mediaUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.mediaUrl} alt="" className="w-full rounded-lg mb-3 object-cover max-h-[300px]" />
                      )}
                      {post.mediaType === "video" && post.mediaUrl && (
                        <video src={post.mediaUrl} controls className="w-full rounded-lg mb-3 max-h-[300px]" />
                      )}
                      <div className="flex items-center gap-4 text-xs text-grey-3">
                        <span>{post.likeCount} likes</span>
                        <span>{post.commentCount} comments</span>
                        <span>{post.shareCount} shares</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </ModalLayer>
        )}
      </AnimatePresence>
    </>
  );
}
