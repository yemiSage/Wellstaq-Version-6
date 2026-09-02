import type { Post, PostListResponse } from "@/types/api";

export function buildPostLink(origin: string, post: Pick<Post, "id" | "branchId">) {
  const url = new URL("/dashboard/space", origin);
  if (post.branchId) url.searchParams.set("branchId", post.branchId);
  url.searchParams.set("postId", post.id);
  url.hash = `post-${post.id}`;
  return url.toString();
}

export function getPostShareLinks(link: string) {
  const encoded = encodeURIComponent(link);
  return {
    whatsapp: `https://wa.me/?text=${encoded}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
  };
}

/** Find an older shared post using the existing authorized, paginated feed API. */
export async function loadFeedThroughPost(
  loadPage: (offset: number) => Promise<PostListResponse>,
  postId: string | null,
  cancelled: () => boolean,
) {
  let response = await loadPage(0);
  const items = [...response.items];
  while (postId && !items.some((post) => post.id === postId) && !cancelled()) {
    const offset = response.offset + response.items.length;
    if (!response.items.length || offset >= response.total) break;
    const next = await loadPage(offset);
    if (next.offset < offset || !next.items.length) break;
    items.push(...next.items);
    response = next;
  }
  return Array.from(new Map(items.map((post) => [post.id, post])).values());
}
