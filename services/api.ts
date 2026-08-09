// path: services/api.ts
import type { OnboardingData } from "@/types";
import type {
  AvailabilityResponse,
  Branch,
  ChatMessage,
  DashboardBootstrap,
  ResourceMutation,
  UserProfile,
  UserSearchResult,
  AuthTokenResponse,
  CurrentUserResponse,
  OrgStatsResponse,
  ActivitySummaryResponse,
  ChallengeListResponse,
  ChallengeParticipantListResponse,
  CreateChallengePayload,
  ChallengeItem,
  JoinChallengeResponse,
  UpdateChallengePayload,
  WellbeingChallengeListResponse,
  ChallengeStatsResponse,
  LivePulseResponse,
  DashboardTrendPeriod,
  DashboardTrendsResponse,
  WellbeingDistributionResponse,
  Club, 
  ClubListResponse,
  CreateClubPayload,
  Post, 
  PostListResponse, 
  CreatePostPayload, 
  Comment, 
  CommentListResponse, 
  LikeActionResponse,
  Story, 
  StoryListResponse, 
  CreateStoryPayload,
   OrganizationMembersListResponse,
  ClubMembersListResponse,
  LeaderboardResponse,
  MessageListResponse,
  MessageResponse,
  PinActionResponse,
  TrendingHashtagListResponse,
  HashtagPostListResponse,
  ActivityTrendResponse,
  LikesGivenCountResponse,

} from "@/types/api";
import { request, type RequestOptions, ApiError } from "@/services/http";
import { backendPath } from "@/services/config";
import { getAuthTokens, clearAuthTokens } from "@/services/auth-token";


// The application is backend-connected by default. Mock mode must be an
// explicit development choice; otherwise valid FastAPI routes (including
// chat) silently return their local fallback without making a request.
const dataSource = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "api") as "mock" | "api";
const usingMockData = dataSource === "mock";

const demoUser: UserProfile = {
  firstName: "Demo",
  lastName: "Admin",
  email: "admin@example.com",
  businessName: "Wellstaq Demo",
};

let mockUser = demoUser;

async function mockResult<T>(value: T): Promise<T> {
  return structuredClone(value);
}

async function fromApiOrMock<T>(path: string, fallback: T, options?: RequestOptions) {
  return usingMockData ? mockResult(fallback) : request<T>(backendPath(path), options);
}

function getClubPage(
  orgId: string,
  params: { branchId?: string; offset?: number; limit?: number } = {},
) {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit ?? 20));
  query.set("offset", String(params.offset ?? 0));
  const path = params.branchId
    ? `/organizations/${orgId}/branches/${params.branchId}/clubs?${query.toString()}`
    : `/organizations/${orgId}/clubs?${query.toString()}`;
  return fromApiOrMock<ClubListResponse>(
    path,
    { items: [], total: 0, offset: 0, limit: params.limit ?? 20 },
  );
}

async function getAllClubPages(orgId: string, branchId?: string) {
  const pageSize = 100;
  const items: Club[] = [];
  let offset = 0;
  let total = 0;

  do {
    const page = await getClubPage(orgId, { branchId, offset, limit: pageSize });
    items.push(...page.items);
    total = page.total;
    if (page.items.length === 0) break;
    offset += page.items.length;
  } while (offset < total);

  return items;
}

async function clubContainsUser(orgId: string, clubId: string, userId: string) {
  const pageSize = 200;
  let offset = 0;
  let total = 0;

  do {
    const query = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
    const page = await fromApiOrMock<ClubMembersListResponse>(
      `/organizations/${orgId}/clubs/${clubId}/members?${query.toString()}`,
      { items: [], total: 0, offset, limit: pageSize },
    );
    if (page.items.some((member) => member.id === userId)) return true;
    total = page.total;
    if (page.items.length === 0) break;
    offset += page.items.length;
  } while (offset < total);

  return false;
}

async function getAllClubsForUser(orgId: string, userId: string, branchId?: string) {
  const items = await getAllClubPages(orgId, branchId);
  const resolved: Club[] = [];

  for (let index = 0; index < items.length; index += 8) {
    const batch = items.slice(index, index + 8);
    const details = await Promise.all(batch.map(async (club) => {
      if (club.isMember) return club;
      try {
        const detail = await fromApiOrMock<Club>(
          `/organizations/${orgId}/clubs/${club.id}`,
          club,
        );
        const isMember = detail.isMember || await clubContainsUser(orgId, club.id, userId);
        return { ...club, ...detail, isMember };
      } catch {
        return club;
      }
    }));
    resolved.push(...details);
  }

  return resolved;
}

function parseEmployeeCountToInt(range: string): number {
  const numbers = range.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 0;
  const highest = Math.max(...numbers.map(Number));
  return range.toLowerCase().includes("over") ? highest + 1 : highest;
}

function mockOrgStats(): OrgStatsResponse {
  const zeroTrend = { current: 0, previous: null, changePct: null };
  return {
    totalUsers: 0, usersTrend: zeroTrend,
    totalBranches: 0, branchesTrend: zeroTrend,
    totalDepartments: 0, departmentsTrend: zeroTrend,
    totalClubs: 0, clubsTrend: zeroTrend,
    totalEvents: 0, eventsTrend: zeroTrend,
    totalChallenges: 0, challengesTrend: zeroTrend,
    activeChallenges: 0,
    totalPosts: 0, postsTrend: zeroTrend,
  };
}

export type StatsPeriod = "week" | "month" | "three_months" | "six_months" | "nine_months" | "year" | "custom";

interface StatsQueryParams {
  period?: StatsPeriod;
  startDate?: string; // YYYY-MM-DD, required when period === "custom"
  endDate?: string;   // YYYY-MM-DD, optional, defaults to today server-side
  userStatus?: string;
  challengeStatus?: string;
  eventStatus?: string;
}

function buildStatsQuery(params: StatsQueryParams): string {
  const query = new URLSearchParams();
  if (params.period) query.set("period", params.period);
  if (params.startDate) query.set("start_date", params.startDate);
  if (params.endDate) query.set("end_date", params.endDate);
  if (params.userStatus) query.set("user_status", params.userStatus);
  if (params.challengeStatus) query.set("challenge_status", params.challengeStatus);
  if (params.eventStatus) query.set("event_status", params.eventStatus);
  return query.toString();
}

export const api = {
  mode: dataSource,
  isMock: usingMockData,

  auth: {
    sendOtp: (email: string) => fromApiOrMock("/auth/signup/otp/request", { accepted: true }, {
      method: "POST",
      body: { email },
    }),
    verifyOtp: (email: string, code: string) =>
      fromApiOrMock<{ emailVerificationToken: string }>(
        "/auth/signup/otp/verify",
        { emailVerificationToken: `mock-token-${code}` },
        { method: "POST", body: { email, code } },
      ),
    login: (email: string, password: string) =>
      fromApiOrMock<AuthTokenResponse>(
        "/auth/login",
        { accessToken: "mock-access-token", refreshToken: "mock-refresh-token", tokenType: "bearer" },
        { method: "POST", body: { email, password } },
      ),
    me: () => fromApiOrMock<CurrentUserResponse>("/auth/me", {
      userId: "mock-user",
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      role: "super_admin",
      organizationId: "mock-org",
      branchId: "mock-branch",
      departmentId: "mock-department",
      permissions: [{ name: "overview", branchId: null }],
      twoFaEnabled: false,
    }),
    logout: async () => {
      const tokens = getAuthTokens();
      try {
        await fromApiOrMock(
          "/auth/logout",
          { success: true },
          { method: "POST", body: { refresh_token: tokens?.refreshToken ?? "" } },
        );
      } finally {
        clearAuthTokens();
      }
    },
  },

  organization: {
    getStats: (orgId: string, params: StatsQueryParams = {}) => {
      const qs = buildStatsQuery(params);
      return request<OrgStatsResponse>(backendPath(`/organizations/${orgId}/stats${qs ? `?${qs}` : ""}`));
    },
    getActiveUserStats: (orgId: string) =>
      request<OrgStatsResponse>(backendPath(`/organizations/${orgId}/stats?user_status=active`)),
    getActivitySummary: (orgId: string, params: StatsQueryParams = {}) => {
      const qs = buildStatsQuery(params);
      return request<ActivitySummaryResponse>(backendPath(`/organizations/${orgId}/activities/summary${qs ? `?${qs}` : ""}`));
    },

    getBranchStats: (orgId: string, branchId: string, params: StatsQueryParams = {}) => {
      const qs = buildStatsQuery(params);
      return request<OrgStatsResponse>(backendPath(`/organizations/${orgId}/branches/${branchId}/stats${qs ? `?${qs}` : ""}`));
    },
    getBranchActiveUserStats: (orgId: string, branchId: string) =>
      request<OrgStatsResponse>(backendPath(`/organizations/${orgId}/branches/${branchId}/stats?user_status=active`)),
    getBranchActivitySummary: (orgId: string, branchId: string, params: StatsQueryParams = {}) => {
      const qs = buildStatsQuery(params);
      return request<ActivitySummaryResponse>(backendPath(`/organizations/${orgId}/branches/${branchId}/activities/summary${qs ? `?${qs}` : ""}`));
    },

    getBranches: async (orgId: string) => {
      const response = await request<{ items: Branch[]; total: number; offset: number; limit: number }>(
        backendPath(`/organizations/${orgId}/branches?limit=100`),
      );
      return response.items;
    },
    getChallenges: (
      orgId: string,
      params: { branchId?: string; scope?: "organization" | "all"; status?: string; offset?: number; limit?: number } = {},
    ) => {
      const query = new URLSearchParams();
      query.set("limit", String(params.limit ?? 8));
      query.set("offset", String(params.offset ?? 0));
      if (params.branchId) query.set("branch_id", params.branchId);
      if (params.scope) query.set("scope", params.scope);
      if (params.status) query.set("status", params.status);
      return request<ChallengeListResponse>(backendPath(`/organizations/${orgId}/challenges?${query.toString()}`));
    },
    getChallenge: (orgId: string, challengeId: string) =>
      fromApiOrMock<ChallengeItem>(`/organizations/${orgId}/challenges/${challengeId}`, {} as ChallengeItem),

    createChallenge: (orgId: string, payload: CreateChallengePayload) =>
      fromApiOrMock<ChallengeItem>(`/organizations/${orgId}/challenges`, {} as ChallengeItem, {
        method: "POST",
        body: {
          branch_id: payload.branchId,
          wellbeing_challenge_id: payload.wellbeingChallengeId,
          name: payload.name,
          description: payload.description,
          image_url: payload.imageUrl,
          start_date: payload.startDate,
          end_date: payload.endDate,
          metric_type: payload.metricType,
          target_type: payload.targetType,
          target_value: payload.targetValue,
        },
      }),

    updateChallenge: (orgId: string, challengeId: string, payload: UpdateChallengePayload) =>
      fromApiOrMock<ChallengeItem>(`/organizations/${orgId}/challenges/${challengeId}`, {} as ChallengeItem, {
        method: "PATCH",
        body: {
          name: payload.name,
          description: payload.description,
          image_url: payload.imageUrl,
          start_date: payload.startDate,
          end_date: payload.endDate,
          metric_type: payload.metricType,
          target_type: payload.targetType,
          target_value: payload.targetValue,
          status: payload.status,
        },
      }),

    deleteChallenge: (orgId: string, challengeId: string) =>
      fromApiOrMock<{ success: true }>(`/organizations/${orgId}/challenges/${challengeId}`, { success: true }, {
        method: "DELETE",
      }),

    cancelChallenge: (orgId: string, challengeId: string) =>
      fromApiOrMock<ChallengeItem>(`/organizations/${orgId}/challenges/${challengeId}/cancel`, {} as ChallengeItem, {
        method: "POST",
      }),

    joinChallenge: (orgId: string, challengeId: string) =>
      fromApiOrMock<JoinChallengeResponse>(`/organizations/${orgId}/challenges/${challengeId}/join`, {
        challengeId, userId: "mock-user", message: "Joined",
      }, { method: "POST" }),

    leaveChallenge: (orgId: string, challengeId: string) =>
      fromApiOrMock<{ success: true }>(`/organizations/${orgId}/challenges/${challengeId}/join`, { success: true }, {
        method: "DELETE",
      }),

    getChallengeParticipants: (orgId: string, challengeId: string) =>
      fromApiOrMock<ChallengeParticipantListResponse>(
        `/organizations/${orgId}/challenges/${challengeId}/participants?limit=50`,
        { items: [], total: 0, offset: 0, limit: 50 },
      ),
    getChallengeStats: (
      orgId: string,
      params: {
        branchId?: string; scope?: "organization" | "all";
        period?: "week" | "month" | "six_months" | "custom";
        startDate?: string; endDate?: string; // YYYY-MM-DD
      } = {},
    ) => {
      const query = new URLSearchParams();
      if (params.branchId) query.set("branch_id", params.branchId);
      if (params.scope) query.set("scope", params.scope);
      if (params.period) query.set("period", params.period); // omitted entirely = all-time (backend default)
      if (params.startDate) query.set("start_date", params.startDate);
      if (params.endDate) query.set("end_date", params.endDate);
      const qs = query.toString();
      return fromApiOrMock<ChallengeStatsResponse>(
        `/organizations/${orgId}/challenges/stats${qs ? `?${qs}` : ""}`,
        { activeChallenges: 0, activeChallengesTrend: null, totalParticipants: 0, totalParticipantsTrend: null, completionRate: 0, completionRateTrend: null },
      );
    },

    getLivePulse: async (orgId: string, branchId?: string): Promise<LivePulseResponse | null> => {
      const qs = branchId ? `?branch_id=${branchId}` : "";
      try {
        const result = await request<LivePulseResponse | []>(backendPath(`/organizations/${orgId}/wellbeing-survey/pulse/live${qs}`));
        return Array.isArray(result) ? null : result;
      } catch (err) {
        // 404 = no open survey window right now — a legitimate empty state,
        // not a failure. Anything else should still surface as an error.
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    getMembers: (orgId: string, params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 200));
    query.set("offset", String(params.offset ?? 0));
    return fromApiOrMock<OrganizationMembersListResponse>(
      `/organizations/${orgId}/members?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 200 },
    );
  },
  },
leaderboard: {
  getBranch: (orgId: string, metricType: string, branchId?: string) => {
    const query = new URLSearchParams();
    query.set("metric_type", metricType);
    query.set("period_type", "weekly");
    query.set("limit", "7");
    if (branchId) query.set("branch_id", branchId);
    return request<LeaderboardResponse>(backendPath(`/organizations/${orgId}/leaderboard/branch?${query.toString()}`));
  },
  getOrg: (orgId: string, metricType: string) => {
    const query = new URLSearchParams();
    query.set("metric_type", metricType);
    query.set("period_type", "weekly");
    query.set("limit", "7");
    return request<LeaderboardResponse>(backendPath(`/organizations/${orgId}/leaderboard/org?${query.toString()}`));
  },
},
club: {
  // No branchId => org-wide discovery (GET /clubs). branchId set =>
  // GET /branches/{branchId}/clubs. These are two different backend
  // routes, not one route with a scope param.
  getClubs: getClubPage,

  getAllClubs: getAllClubPages,

  // Resolve membership independently because the org-wide list currently
  // returns false for clubs the authenticated user already belongs to.
  getAllClubsForUser,

  getClub: (orgId: string, clubId: string) =>
    fromApiOrMock<Club>(`/organizations/${orgId}/clubs/${clubId}`, {} as Club),

  // Creation is always branch-scoped — there's no org-wide create route.
  createClub: (orgId: string, branchId: string, payload: CreateClubPayload) =>
    fromApiOrMock<Club>(`/organizations/${orgId}/branches/${branchId}/clubs`, {} as Club, {
      method: "POST",
      body: {
        name: payload.name,
        description: payload.description,
        image_url: payload.imageUrl,
        privacy: payload.privacy,
        category: payload.category,
      },
    }),

  updateClub: (orgId: string, clubId: string, payload: Partial<CreateClubPayload>) =>
    fromApiOrMock<Club>(`/organizations/${orgId}/clubs/${clubId}`, {} as Club, {
      method: "PATCH",
      body: {
        name: payload.name,
        description: payload.description,
        image_url: payload.imageUrl,
        privacy: payload.privacy,
        category: payload.category,
      },
    }),

  deleteClub: (orgId: string, clubId: string) =>
    fromApiOrMock<{ clubId: string; organizationId: string; message: string }>(
      `/organizations/${orgId}/clubs/${clubId}`, { clubId, organizationId: orgId, message: "" }, { method: "DELETE" },
    ),

  joinClub: (orgId: string, clubId: string, userId: string) =>
    fromApiOrMock<{ userId: string; clubId: string; organizationId: string; message: string }>(
      `/organizations/${orgId}/clubs/${clubId}/members/${userId}`,
      { userId, clubId, organizationId: orgId, message: "Joined" }, { method: "PUT" },
    ),

  leaveClub: (orgId: string, clubId: string, userId: string) =>
    fromApiOrMock<{ userId: string; clubId: string; organizationId: string; message: string }>(
      `/organizations/${orgId}/clubs/${clubId}/members/${userId}/leave`,
      { userId, clubId, organizationId: orgId, message: "Left" }, { method: "DELETE" },
    ),
    getClubMembers: (orgId: string, clubId: string, params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 200));
    query.set("offset", String(params.offset ?? 0));
    return fromApiOrMock<ClubMembersListResponse>(
      `/organizations/${orgId}/clubs/${clubId}/members?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 200 },
    );
  },

},

hashtag: {
  getTrending: (orgId: string) =>
    fromApiOrMock<TrendingHashtagListResponse>(
      `/organizations/${orgId}/hashtags/trending`,
      { items: [] },
    ),

  getPostsByTag: (
    orgId: string,
    tagName: string,
    params: { offset?: number; limit?: number } = {},
  ) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 20));
    query.set("offset", String(params.offset ?? 0));
    return fromApiOrMock<HashtagPostListResponse>(
      `/organizations/${orgId}/hashtags/${encodeURIComponent(tagName)}/posts?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 20 },
    );
  },
},
activity: {
  getWeeklyStepsTrend: (orgId: string) => {
    const query = new URLSearchParams();
    query.set("metric_type", "steps");
    query.set("granularity", "weekly");
    query.set("limit", "1");
    return fromApiOrMock<ActivityTrendResponse>(
      `/organizations/${orgId}/activity-log/trend?${query.toString()}`,
      { metricType: "steps", granularity: "weekly", points: [] },
    );
  },
},
chat: {
  getMessages: (orgId: string, conversationType: string, conversationId: string, params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 50));
    query.set("offset", String(params.offset ?? 0));
    return fromApiOrMock<MessageListResponse>(
      `/organizations/${orgId}/conversations/${conversationType}/${conversationId}/messages?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 50 },
    );
  },
  sendMessage: (orgId: string, conversationType: string, conversationId: string, payload: { content?: string; mediaUrl?: string; mediaType?: string }) =>
    fromApiOrMock<MessageResponse>(
      `/organizations/${orgId}/conversations/${conversationType}/${conversationId}/messages`,
      {} as MessageResponse,
      { method: "POST", body: { content: payload.content, media_url: payload.mediaUrl, media_type: payload.mediaType } },
    ),
  deleteMessage: (orgId: string, messageId: string) =>
    fromApiOrMock<{ messageId: string; message: string }>(
      `/organizations/${orgId}/conversations/messages/${messageId}`,
      { messageId, message: "" },
      { method: "DELETE" },
    ),
  pinMessage: (orgId: string, messageId: string) =>
    fromApiOrMock<PinActionResponse>(
      `/organizations/${orgId}/conversations/messages/${messageId}/pin`,
      { messageId, isPinned: true, message: "" } as unknown as PinActionResponse,
      { method: "POST" },
    ),
  unpinMessage: (orgId: string, messageId: string) =>
    fromApiOrMock<PinActionResponse>(
      `/organizations/${orgId}/conversations/messages/${messageId}/pin`,
      { messageId, isPinned: false, message: "" } as unknown as PinActionResponse,
      { method: "DELETE" },
    ),
},
post: {
  getPosts: (
    orgId: string,
    params: { branchId?: string; scope: "org_only" | "branch_and_org"; offset?: number; limit?: number },
  ) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 20));
    query.set("offset", String(params.offset ?? 0));
    query.set("scope", params.scope);
    if (params.branchId) query.set("branch_id", params.branchId);
    return fromApiOrMock<PostListResponse>(
      `/organizations/${orgId}/posts?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 20 },
    );
  },
  getPostsByUser: (
  orgId: string,
  userId: string,
  params: { periodStart?: string; periodEnd?: string; offset?: number; limit?: number } = {},
  ) => {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit ?? 1));
  query.set("offset", String(params.offset ?? 0));
  if (params.periodStart) query.set("period_start", params.periodStart);
  if (params.periodEnd) query.set("period_end", params.periodEnd);
  return fromApiOrMock<PostListResponse>(
    `/organizations/${orgId}/posts/users/${userId}?${query.toString()}`,
    { items: [], total: 0, offset: 0, limit: params.limit ?? 1 },
    );
  },

  getLikesGivenCount: (orgId: string, params: { periodStart?: string; periodEnd?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.periodStart) query.set("period_start", params.periodStart);
    if (params.periodEnd) query.set("period_end", params.periodEnd);
    const qs = query.toString();
    return fromApiOrMock<LikesGivenCountResponse>(
      `/organizations/${orgId}/posts/likes/given/count${qs ? `?${qs}` : ""}`,
      { count: 0 },
    );
  },
  createPost: (orgId: string, payload: CreatePostPayload) =>
    fromApiOrMock<Post>(`/organizations/${orgId}/posts`, {} as Post, {
      method: "POST",
      body: { branch_id: payload.branchId, content: payload.content, media_url: payload.mediaUrl, media_type: payload.mediaType },
    }),

  deletePost: (orgId: string, postId: string) =>
    fromApiOrMock<{ success: true }>(`/organizations/${orgId}/posts/${postId}`, { success: true }, { method: "DELETE" }),

  likePost: (orgId: string, postId: string) =>
    fromApiOrMock<LikeActionResponse>(`/organizations/${orgId}/posts/${postId}/like`, {
      postId, userId: "mock-user", liked: true, likeCount: 1, message: "Liked.",
    }, { method: "POST" }),

  unlikePost: (orgId: string, postId: string) =>
    fromApiOrMock<LikeActionResponse>(`/organizations/${orgId}/posts/${postId}/like`, {
      postId, userId: "mock-user", liked: false, likeCount: 0, message: "Unliked.",
    }, { method: "DELETE" }),

  getComments: (orgId: string, postId: string, params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 50));
    query.set("offset", String(params.offset ?? 0));
    return fromApiOrMock<CommentListResponse>(
      `/organizations/${orgId}/posts/${postId}/comments?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 50 },
    );
  },

  addComment: (orgId: string, postId: string, content: string) =>
    fromApiOrMock<Comment>(`/organizations/${orgId}/posts/${postId}/comments`, {} as Comment, {
      method: "POST", body: { content },
    }),

  deleteComment: (orgId: string, postId: string, commentId: string) =>
    fromApiOrMock<{ success: true }>(
      `/organizations/${orgId}/posts/${postId}/comments/${commentId}`, { success: true }, { method: "DELETE" },
    ),
},

story: {
  getStories: (
    orgId: string,
    params: { branchId?: string; scope: "org_only" | "branch_and_org"; offset?: number; limit?: number },
  ) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 50));
    query.set("offset", String(params.offset ?? 0));
    query.set("scope", params.scope);
    if (params.branchId) query.set("branch_id", params.branchId);
    return fromApiOrMock<StoryListResponse>(
      `/organizations/${orgId}/stories?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 50 },
    );
  },

  createStory: (orgId: string, payload: CreateStoryPayload) =>
    fromApiOrMock<Story>(`/organizations/${orgId}/stories`, {} as Story, {
      method: "POST",
      body: { branch_id: payload.branchId, media_url: payload.mediaUrl, media_type: payload.mediaType },
    }),

  deleteStory: (orgId: string, storyId: string) =>
    fromApiOrMock<{ success: true }>(`/organizations/${orgId}/stories/${storyId}`, { success: true }, { method: "DELETE" }),
},
  storage: {
    requestUploadUrl: (payload: { domain: string; contentType: string }) =>
      fromApiOrMock<{ uploadUrl: string; objectKey: string; mediaUrl: string; contentType: string }>(
        "/storage/upload-url",
        { uploadUrl: "", objectKey: "", mediaUrl: "", contentType: payload.contentType },
        { method: "POST", body: payload },
      ),
  },
  wellbeing: {
    getChallenges: () =>
      fromApiOrMock<WellbeingChallengeListResponse>("/wellbeing/challenges", { items: [] }),
  },
  onboarding: {
    checkBusinessName: (name: string) =>
      fromApiOrMock<AvailabilityResponse>(
        `/auth/signup/check/business-name?name=${encodeURIComponent(name)}`,
        { available: true },
      ),
    checkPhoneNumber: (number: string) =>
      fromApiOrMock<AvailabilityResponse>(
        `/auth/signup/check/phone?number=${encodeURIComponent(number)}`,
        { available: true },
      ),
    complete: async (data: OnboardingData) => {
      const payload = {
        email_verification_token: data.emailVerificationToken,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        password: data.password,
        business_name: data.businessName.trim(),
        phone_number: `${data.phoneCode}${data.phoneNumber}`.trim(),
        employee_count: parseEmployeeCountToInt(data.employeeCount), // TODO: see note above
        organization_type: data.organizationType,
        work_model: data.workModel,
      };

      if (usingMockData) {
        mockUser = {
          ...mockUser,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          businessName: data.businessName.trim(),
        };
        return mockResult<AuthTokenResponse>({
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          tokenType: "bearer",
        });
      }
      return request<AuthTokenResponse>(backendPath("/auth/signup"), {
        method: "POST",
        body: payload,
      });
    },
  },

  dashboard: {
    getTrends: (orgId: string, period: DashboardTrendPeriod, branchId?: string) => {
      const query = new URLSearchParams({ period });
      if (branchId) query.set("branch_id", branchId);
      return request<DashboardTrendsResponse>(backendPath(`/organizations/${orgId}/dashboard/trends?${query.toString()}`));
    },
    getWellbeingDistribution: (orgId: string, branchId?: string) => {
      const query = branchId ? `?branch_id=${encodeURIComponent(branchId)}` : "";
      return request<WellbeingDistributionResponse>(backendPath(`/organizations/${orgId}/dashboard/wellbeing-distribution${query}`));
    },
    bootstrap: async (orgId: string): Promise<DashboardBootstrap> => {
      const raw = await request<{
        user: CurrentUserResponse;
        branches: Branch[];
        members: Array<{
          id: string; firstName: string; lastName: string; email: string;
          avatarUrl: string | null; status: string; branchId: string | null;
        }>;
        departments: Array<{
          id: string; name: string; members: number; activities: number | null;
          rank: number | null; branch: string | null; avatars: string[];
        }>;
        events: Array<Record<string, unknown>>;
        challenges: Array<{
          id: string; branchId: string | null; name: string; description: string | null;
          imageUrl: string | null; startDate: string | null; endDate: string | null;
          status: string; metricType: string | null; participantCount: number;
        }>;
        leaderboard: Array<{
          userId: string; firstName: string; lastName: string; avatarUrl?: string | null;
          value: number; rank: number; previousRank: number | null;
        }>;
      }>(backendPath(`/organizations/${orgId}/dashboard/bootstrap`));

      const branchNames = new Map(raw.branches.map((branch) => [branch.id, branch.name]));
      const activeBranch = branchNames.get(raw.user.branchId) ?? raw.branches[0]?.name ?? "";

      return {
        user: {
          id: raw.user.userId,
          firstName: raw.user.firstName,
          lastName: raw.user.lastName,
          email: raw.user.email,
          businessName: "",
          profileImage: raw.user.avatarUrl ?? undefined,
        },
        branches: raw.branches,
        activeBranch,
        members: raw.members.map((member, index) => ({
          id: index + 1,
          name: `${member.firstName} ${member.lastName}`.trim(),
          email: member.email,
          department: "",
          status: member.status,
          avatar: member.avatarUrl ?? "",
          branch: member.branchId ? (branchNames.get(member.branchId) ?? "") : "",
          role: member.id === raw.user.userId ? raw.user.role : "Employee",
        })),
        departments: raw.departments.map((department, index) => ({
          ...department,
          id: index + 1,
          activities: department.activities ?? 0,
          rank: department.rank ?? 0,
          branch: department.branch ? (branchNames.get(department.branch) ?? department.branch) : "",
        })),
        events: raw.events as DashboardBootstrap["events"],
        challenges: raw.challenges.map((challenge, index) => {
          const endTime = challenge.endDate ? new Date(challenge.endDate).getTime() : Date.now();
          return {
            id: index + 1,
            title: challenge.name,
            category: challenge.metricType ?? "Wellbeing",
            status: challenge.status,
            participants: challenge.participantCount,
            daysLeft: Math.max(0, Math.ceil((endTime - Date.now()) / 86_400_000)),
            progress: 0,
            branch: challenge.branchId ? (branchNames.get(challenge.branchId) ?? "") : "Organization-wide",
            image: challenge.imageUrl ?? "",
            description: challenge.description ?? "",
          };
        }),
        leaderboard: raw.leaderboard.map((entry, index) => ({
          id: index + 1,
          name: `${entry.firstName} ${entry.lastName}`.trim(),
          role: "",
          steps: Number(entry.value),
          rank: entry.rank,
          trend: (entry.previousRank == null || entry.rank <= entry.previousRank ? "up" : "down") as "up" | "down",
          branch: "",
          avatar: entry.avatarUrl ?? "",
        })),
        participantOptions: [],
      };
    },
  },

  branches: {
    update: (orgId: string, branchId: string, name: string) => fromApiOrMock<Branch>(`/organizations/${orgId}/branches/${branchId}`, {} as Branch, {
      method: "PATCH",
      body: { name },
    }),
    create: (orgId: string, name: string) => fromApiOrMock<Branch>(`/organizations/${orgId}/branches`, {} as Branch, {
      method: "POST",
      body: { name },
    }),
  },

  users: {
    search: async (query: string): Promise<UserSearchResult[]> => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return [];

      if (usingMockData) {
        const { mockDashboardBootstrap } = await import("@/services/mock-api");
        return mockDashboardBootstrap.members
          .filter((member) => (
            member.name.toLowerCase().includes(normalized) ||
            member.email.toLowerCase().includes(normalized)
          ))
          .slice(0, 6)
          .map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
          }));
      }

      return request<UserSearchResult[]>(
        backendPath(`/v1/users/search?q=${encodeURIComponent(query.trim())}`),
      );
    },
  },

  ai: {
    chat: (messages: ChatMessage[], branchName: string) => request<{ message: string }>("/api/ai/chat", {
      method: "POST",
      body: { messages, branchName },
      timeoutMs: 30_000,
    }),
  },

  resources: {
    get: <T>(resource: string, id: string | number, fallback: T) =>
      fromApiOrMock(`/v1/${resource}/${encodeURIComponent(String(id))}`, fallback),
    list: <T>(resource: string, fallback: T, query = "") =>
      fromApiOrMock(`/v1/${resource}${query ? `?${query}` : ""}`, fallback),
    mutate: <T = { success: true }>({ resource, action, id, payload }: ResourceMutation) =>
      fromApiOrMock(`/v1/${resource}${id === undefined ? "" : `/${encodeURIComponent(String(id))}`}/${action}`, { success: true } as T, {
        method: "POST",
        body: payload,
      }),
    upload: (resource: string, file: File) => {
      if (usingMockData) {
        return mockResult({ url: URL.createObjectURL(file) });
      }
      const form = new FormData();
      form.append("file", file);
      return request<{ url: string }>(backendPath(`/v1/${resource}/upload`), {
        method: "POST",
        body: form,
      });
    },
  },

  public: {
    requestDemo: (payload: { name: string; email: string; reason: string }) =>
      fromApiOrMock("/v1/public/demo-requests", { accepted: true }, { method: "POST", body: payload }),
    contactSupport: (payload: { name: string; email: string; subject: string; message: string }) =>
      fromApiOrMock("/v1/support/tickets", { accepted: true }, { method: "POST", body: payload }),
  },
};    
