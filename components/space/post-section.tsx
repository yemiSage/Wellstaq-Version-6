"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ImageIcon, Video, MapPin, Send, Heart, MessageCircle, Share2, Bookmark, Trash2, X, Loader2,
} from "lucide-react";
import type { Post, Comment, OrganizationMemberInfo } from "@/types/api";
import { Avatar } from "@/components/space/story-section";
import { formatRelativeTime } from "@/lib/time";

interface Badge { emoji: string; label: string; rank: number; }

const HASHTAG_PATTERN = /#[\w-]+/g;

/** Splits post content into plain text + clickable hashtag spans. */
function renderContentWithHashtags(content: string, onHashtagClick: (tag: string) => void) {
  const parts = content.split(HASHTAG_PATTERN);
  const tags = content.match(HASHTAG_PATTERN) ?? [];
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    if (part) nodes.push(<span key={`t-${i}`}>{part}</span>);
    if (tags[i]) {
      const tag = tags[i];
      nodes.push(
        <button
          key={`h-${i}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onHashtagClick(tag);
          }}
          className="text-primary-1 font-medium hover:underline"
        >
          {tag}
        </button>,
      );
    }
  });

  return nodes;
}

// ── Create Post box ─────────────────────────────────────────────────────
function CreatePostBox({
  user,
  placeholder,
  postContent,
  onContentChange,
  postImagePreview,
  isUploadingImage,
  onImageSelect,
  onRemoveImage,
  postLocation,
  onShareLocation,
  onClearLocation,
  onSubmit,
  canSubmit,
}: {
  user: { avatarUrl?: string; firstName?: string; lastName?: string; id: string };
  placeholder: string;
  postContent: string;
  onContentChange: (v: string) => void;
  postImagePreview: string | null;
  isUploadingImage: boolean;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  postLocation: string | null;
  onShareLocation: () => void;
  onClearLocation: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  return (
    <div className="bg-white p-4 rounded-[12px] border border-grey-4">
      <div className="flex gap-3 mb-4">
        <Avatar url={user.avatarUrl} seed={user.id} firstName={user.firstName} lastName={user.lastName} size={40} showPlaceholderBadge />
        <div className="flex-1">
          <textarea
            placeholder={placeholder}
            className="w-full resize-none outline-none text-sm pt-2 text-grey-1 placeholder:text-grey-3"
            rows={2}
            value={postContent}
            onChange={(e) => onContentChange(e.target.value)}
          />
          {postImagePreview && (
            <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden border border-grey-4">
              <Image src={postImagePreview} alt="Upload preview" fill className="object-cover" />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <button onClick={onRemoveImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {postLocation && (
            <div className="flex items-center gap-1 text-xs text-primary-1 mt-2 bg-primary-5 px-2 py-1 rounded-md w-fit">
              <MapPin className="w-3 h-3" /> {postLocation}
              <button onClick={onClearLocation} className="ml-1 hover:text-primary-2"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-grey-4">
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" id="post-image-input" className="hidden" onChange={onImageSelect} />
          <label htmlFor="post-image-input" className="text-grey-2 hover:text-grey-1 cursor-pointer"><ImageIcon className="w-5 h-5" /></label>
          <button className="text-grey-2 hover:text-grey-1"><Video className="w-5 h-5" /></button>
          <button onClick={onShareLocation} className="text-grey-2 hover:text-grey-1"><MapPin className="w-5 h-5" /></button>
        </div>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || isUploadingImage}
          className="px-6 py-2 bg-primary-5 text-primary-1 font-medium text-sm rounded-lg hover:bg-primary-1 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" /> Post
        </button>
      </div>
    </div>
  );
}

// ── Single post card (with inline comments) ─────────────────────────────
function PostCard({
  post,
  user,
  author,
  badge,
  isLiked,
  comments,
  commentsExpanded,
  getMember,
  onToggleLike,
  onToggleComments,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  onHashtagClick,
}: {
  post: Post;
  user: { id: string; avatarUrl?: string; firstName?: string; lastName?: string };
  author: OrganizationMemberInfo | undefined;
  badge: Badge | undefined;
  isLiked: boolean;
  comments: Comment[];
  commentsExpanded: boolean;
  getMember: (userId: string) => OrganizationMemberInfo | undefined;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onAddComment: (content: string) => void;
  onDeletePost: () => void;
  onDeleteComment: (commentId: string) => void;
  onHashtagClick: (tag: string) => void;
}) {
  const isMine = post.userId === user.id;
  return (
    <div className="bg-white rounded-[12px] border border-grey-4 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar url={author?.avatarUrl} seed={post.userId} firstName={author?.firstName} lastName={author?.lastName} size={40} showPlaceholderBadge />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-grey-1">{author ? `${author.firstName} ${author.lastName}` : "Member"}</h3>
                {badge && (
                  <span className="text-[10px] font-medium text-primary-1 bg-primary-5 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {badge.emoji} #{badge.rank} {badge.label}
                  </span>
                )}
                {!post.branchId && (
                  <span className="text-[10px] font-medium text-primary-1 bg-primary-5 px-2 py-0.5 rounded-full">General</span>
                )}
              </div>
              <p className="text-xs text-grey-3">{author?.email ?? ""} · {formatRelativeTime(post.createdAt)}</p>
            </div>
          </div>
          {isMine && (
            <button onClick={onDeletePost} className="text-grey-3 hover:text-red-500 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {post.content && (
          <p className="text-sm text-grey-1 mb-4 leading-relaxed whitespace-pre-wrap">
            {renderContentWithHashtags(post.content, onHashtagClick)}
          </p>
        )}
      </div>

      {post.mediaUrl && (
        <div className="relative w-full h-[400px]">
          <Image src={post.mediaUrl} alt="Post image" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-grey-2 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary-1 flex items-center justify-center border border-white">
              <Heart className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <span>{post.likeCount} likes</span>
          </div>
          <div className="flex gap-3">
            <span>{post.commentCount} comments</span>
            <span>{post.shareCount} shares</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-b border-grey-4 mb-4">
          <button onClick={onToggleLike} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${isLiked ? "text-primary-1" : "text-grey-2 hover:bg-grey-5 rounded-lg"}`}>
            <Heart className={`w-5 h-5 ${isLiked ? "fill-primary-1" : ""}`} /> Like
          </button>
          <button onClick={onToggleComments} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors">
            <MessageCircle className="w-5 h-5" /> Comment
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" /> Share
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors">
            <Bookmark className="w-5 h-5" /> Save
          </button>
        </div>

        {commentsExpanded && comments.length > 0 && (
          <div className="mb-4 space-y-3">
            {comments.map((comment) => {
              const cAuthor = getMember(comment.userId);
              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar url={cAuthor?.avatarUrl} seed={comment.userId} firstName={cAuthor?.firstName} lastName={cAuthor?.lastName} size={32} showPlaceholderBadge />
                  <div className="flex-1 bg-grey-5 rounded-xl p-3 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-grey-1">{comment.userId === user.id ? "You" : cAuthor ? `${cAuthor.firstName} ${cAuthor.lastName}` : "Member"}</span>
                      <span className="text-[10px] text-grey-3">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-grey-2">{comment.content}</p>
                    {comment.userId === user.id && (
                      <button onClick={() => onDeleteComment(comment.id)} className="absolute top-2 right-2 text-grey-3 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Avatar url={user.avatarUrl} seed={user.id} firstName={user.firstName} lastName={user.lastName} size={32} showPlaceholderBadge />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Write a comment..."
              className="w-full pl-4 pr-10 py-2 bg-white border border-grey-4 rounded-full text-sm focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  onAddComment(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-1"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input && input.value.trim()) {
                  onAddComment(input.value);
                  input.value = "";
                }
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section — feed header, create box, list of cards ─────────────────────
export function PostsSection({
  user,
  posts,
  postsLoading,
  getMember,
  badgeMap,
  likedPostIds,
  commentsByPost,
  expandedComments,
  postContent,
  onContentChange,
  postImagePreview,
  isUploadingPostImage,
  onImageSelect,
  onRemoveImage,
  postLocation,
  onShareLocation,
  onClearLocation,
  onSubmitPost,
  placeholder,
  onToggleLike,
  onToggleComments,
  onAddComment,
  onRequestDeletePost,
  onRequestDeleteComment,
  onHashtagClick,
}: {
  user: { id: string; avatarUrl?: string; firstName?: string; lastName?: string };
  posts: Post[];
  postsLoading: boolean;
  getMember: (userId: string) => OrganizationMemberInfo | undefined;
  badgeMap: Map<string, Badge>;
  likedPostIds: Set<string>;
  commentsByPost: Record<string, Comment[]>;
  expandedComments: string[];
  postContent: string;
  onContentChange: (v: string) => void;
  postImagePreview: string | null;
  isUploadingPostImage: boolean;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  postLocation: string | null;
  onShareLocation: () => void;
  onClearLocation: () => void;
  onSubmitPost: () => void;
  placeholder: string;
  onToggleLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onRequestDeletePost: (postId: string) => void;
  onRequestDeleteComment: (postId: string, commentId: string) => void;
  onHashtagClick: (tag: string) => void;
}) {
  return (
    <div className="max-w-[600px] mx-auto space-y-6">
      <CreatePostBox
        user={user}
        placeholder={placeholder}
        postContent={postContent}
        onContentChange={onContentChange}
        postImagePreview={postImagePreview}
        isUploadingImage={isUploadingPostImage}
        onImageSelect={onImageSelect}
        onRemoveImage={onRemoveImage}
        postLocation={postLocation}
        onShareLocation={onShareLocation}
        onClearLocation={onClearLocation}
        onSubmit={onSubmitPost}
        canSubmit={!!(postContent.trim() || postImagePreview || postLocation)}
      />

      {postsLoading && (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-grey-5 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!postsLoading && posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          author={getMember(post.userId)}
          badge={badgeMap.get(post.userId)}
          isLiked={likedPostIds.has(post.id)}
          comments={commentsByPost[post.id] ?? []}
          commentsExpanded={expandedComments.includes(post.id)}
          getMember={getMember}
          onToggleLike={() => onToggleLike(post.id)}
          onToggleComments={() => onToggleComments(post.id)}
          onAddComment={(content) => onAddComment(post.id, content)}
          onDeletePost={() => onRequestDeletePost(post.id)}
          onDeleteComment={(commentId) => onRequestDeleteComment(post.id, commentId)}
          onHashtagClick={onHashtagClick}
        />
      ))}
    </div>
  );
}
