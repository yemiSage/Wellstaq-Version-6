// path: services/api.ts
import type { OnboardingData } from "@/types";
import type {
  AvailabilityResponse,
  Branch,
  ChatMessage,
  DashboardBootstrap,
  ResourceMutation,
  UserSearchResult,
  AuthTokenResponse,
  LoginResponse,
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
  LeaderboardEntry,
  MessageListResponse,
  MessageResponse,
  PinActionResponse,
  TrendingHashtagListResponse,
  HashtagPostListResponse,
  ActivityTrendResponse,
  LikesGivenCountResponse,
  EngagementWellbeingTrendPeriod,
  EngagementWellbeingTrendsResponse,
  InsightsOverviewResponse,
  InsightsPeriod,
  KPIOverviewApiResponse,
  DepartmentItem,
  DepartmentListResponse,
  DepartmentRankListResponse,
  DepartmentMembersListResponse,
  EventItem,
  EventListResponse,
  EventParticipantsListResponse,
  NotificationListResponse,
  UnreadCountResponse,
  SystemRolesResponse,
  SendInviteResponse,
  SubscriptionPlanListResponse,
  OrganizationSubscriptionInfo,
  PaymentTransactionItem,
  PaymentTransactionListResponse,
  CheckoutResponse,
  PaymentVerificationResponse,
  ProfileSettingsInfo,
  TwoFaSetupInfo,
  SecuritySessionListResponse,
  RoleItem,
  UserPreferences,
  PermissionCatalogueResponse,
  UserPermissionsResponse,
  InviteRegistrationResponse,

} from "@/types/api";
import { request, type RequestOptions, ApiError } from "@/services/http";
import { backendPath } from "@/services/config";
import { getAuthTokens, clearAuthTokens } from "@/services/auth-token";


async function fromApi<T>(path: string, options?: RequestOptions) {
  return request<T>(backendPath(path), options);
}

function parseEmployeeCountToInt(range: string): number {
  const numbers = range.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 0;
  const highest = Math.max(...numbers.map(Number));
  return range.toLowerCase().includes("over") ? highest + 1 : highest;
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
  auth: {
    requestInviteOtp: (inviteCode: string) => fromApi<{ message: string; sentTo: string }>(
      "/auth/invite/otp/request",
      { method: "POST", body: { inviteCode }, suppressErrorNotification: true },
    ),
    verifyInviteOtp: (inviteCode: string, code: string) => fromApi<{ inviteVerificationToken: string }>(
      "/auth/invite/otp/verify",
      { method: "POST", body: { inviteCode, code }, suppressErrorNotification: true },
    ),
    registerInvite: (payload: {
      inviteVerificationToken: string; firstName: string; lastName: string; password: string;
      country: string; state: string;
      baseline: { entries: Array<{ dimension: string; level: string; reason: string }> };
      priorities: Array<{ priority: string; rank: number }>;
    }) => fromApi<InviteRegistrationResponse>(
      "/auth/register/invite",
      { method: "POST", body: payload, suppressErrorNotification: true },
    ),
    sendOtp: (email: string) => fromApi<{
      message?: string;
      existingUser?: boolean;
      isExistingUser?: boolean;
      userExists?: boolean;
      returningUser?: boolean;
      accountStatus?: string;
    }>("/auth/signup/otp/request", {
      method: "POST",
      body: { email },
      suppressErrorNotification: true,
    }),
    verifyOtp: (email: string, code: string) =>
      fromApi<{ emailVerificationToken: string }>(
        "/auth/signup/otp/verify",
        { method: "POST", body: { email, code } },
      ),
    login: (email: string, password: string) =>
      fromApi<LoginResponse>(
        "/auth/login",
        { method: "POST", body: { email, password }, suppressErrorNotification: true },
      ),
    verifyTwoFa: (twoFaChallengeToken: string, code: string) =>
      fromApi<AuthTokenResponse>(
        "/auth/2fa/verify",
        { method: "POST", body: { twoFaChallengeToken, code }, suppressErrorNotification: true },
      ),
    me: () => fromApi<CurrentUserResponse>("/auth/me"),
    logout: async () => {
      const tokens = getAuthTokens();
      try {
        await fromApi(
          "/auth/logout",
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
      return fromApi<OrgStatsResponse>(`/organizations/${orgId}/stats${qs ? `?${qs}` : ""}`);
    },
    getActiveUserStats: (orgId: string) =>
      fromApi<OrgStatsResponse>(`/organizations/${orgId}/stats?user_status=active`),
    getActivitySummary: (orgId: string) =>
      fromApi<ActivitySummaryResponse>(`/organizations/${orgId}/activities/summary`),

    getBranchStats: (orgId: string, branchId: string, params: StatsQueryParams = {}) => {
      const qs = buildStatsQuery(params);
      return fromApi<OrgStatsResponse>(
        `/organizations/${orgId}/branches/${branchId}/stats${qs ? `?${qs}` : ""}`,
      );
    },
    getBranchActiveUserStats: (orgId: string, branchId: string) =>
      fromApi<OrgStatsResponse>(
        `/organizations/${orgId}/branches/${branchId}/stats?user_status=active`,
      ),
    getBranchActivitySummary: (orgId: string, branchId: string) =>
      fromApi<ActivitySummaryResponse>(
        `/organizations/${orgId}/branches/${branchId}/activities/summary`,
      ),

    getBranches: async (orgId: string) => {
      const response = await fromApi<{ items: Branch[]; total: number; offset: number; limit: number }>(
        `/organizations/${orgId}/branches?limit=100`,
      );
      return response.items;
    },
    createBranch: (orgId: string, name: string) =>
      fromApi<Branch>(`/organizations/${orgId}/branches`, {
        method: "POST",
        body: { name },
      }),
    assignBranchManager: (orgId: string, branchId: string, managerId: string) =>
      fromApi<{ branchId: string; organizationId: string; managerId: string; message: string }>(
        `/organizations/${orgId}/branches/${branchId}/manager`,
        { method: "PUT", body: { managerId } },
      ),
    getDepartments: (orgId: string, branchId?: string) =>
      fromApi<DepartmentListResponse>(
        branchId
          ? `/organizations/${orgId}/branches/${branchId}/departments?limit=200`
          : `/organizations/${orgId}/departments?limit=200`,
      ),
    getDepartmentRanks: (orgId: string, branchId?: string) => {
      const query = branchId ? `?branch_id=${encodeURIComponent(branchId)}` : "";
      return fromApi<DepartmentRankListResponse>(
        `/organizations/${orgId}/department-rank${query}`,
      );
    },
    getDepartmentMembers: (orgId: string, departmentId: string) =>
      fromApi<DepartmentMembersListResponse>(
        `/organizations/${orgId}/departments/${departmentId}/members?limit=200`,
      ),
    createDepartment: (orgId: string, branchId: string, name: string) =>
      fromApi<DepartmentItem>(`/organizations/${orgId}/departments`, {
        method: "POST", body: { name, branch_id: branchId, avatar_initial: name.slice(0, 2).toUpperCase() },
      }),
    updateDepartment: (orgId: string, departmentId: string, name: string) =>
      fromApi<DepartmentItem>(`/organizations/${orgId}/departments/${departmentId}`, {
        method: "PATCH", body: { name },
      }),
    deleteDepartment: (orgId: string, departmentId: string) =>
      fromApi<{ departmentId: string; membersTransferred: number; message: string }>(
        `/organizations/${orgId}/departments/${departmentId}`,
        { method: "DELETE", body: { transfer_to_department_id: null } },
      ),
    assignDepartmentMember: (orgId: string, departmentId: string, userId: string) =>
      fromApi<{ message: string }>(
        `/organizations/${orgId}/departments/${departmentId}/members/${userId}`, { method: "PUT" },
      ),
    getEvents: (orgId: string, params: { branchId?: string; offset?: number; limit?: number } = {}) => {
      const query = new URLSearchParams({
        offset: String(params.offset ?? 0), limit: String(params.limit ?? 20),
      });
      if (params.branchId) query.set("branch_id", params.branchId);
      return fromApi<EventListResponse>(
        `/organizations/${orgId}/events?${query.toString()}`,
      );
    },
    getEvent: (orgId: string, eventId: string) =>
      fromApi<EventItem>(`/organizations/${orgId}/events/${eventId}`),
    createEvent: (orgId: string, payload: { branchId: string; title: string; description?: string; imageUrl?: string; startDate: string; endDate?: string; recurrenceRule?: string; time: string }) =>
      fromApi<EventItem>(`/organizations/${orgId}/events`, {
        method: "POST", body: {
          branch_id: payload.branchId, title: payload.title, description: payload.description,
          image_url: payload.imageUrl, start_date: payload.startDate, end_date: payload.endDate,
          recurrence_rule: payload.recurrenceRule, time: payload.time,
        },
      }),
    updateEvent: (orgId: string, eventId: string, payload: { title?: string; description?: string; imageUrl?: string; startDate?: string; endDate?: string; recurrenceRule?: string; time?: string; status?: string }) =>
      fromApi<EventItem>(`/organizations/${orgId}/events/${eventId}`, {
        method: "PATCH", body: {
          title: payload.title, description: payload.description, image_url: payload.imageUrl,
          start_date: payload.startDate, end_date: payload.endDate,
          recurrence_rule: payload.recurrenceRule, time: payload.time, status: payload.status,
        },
      }),
    deleteEvent: (orgId: string, eventId: string) =>
      fromApi<{ eventId: string; message: string }>(
        `/organizations/${orgId}/events/${eventId}`, { method: "DELETE" },
      ),
    getEventParticipants: (orgId: string, eventId: string) =>
      fromApi<EventParticipantsListResponse>(
        `/organizations/${orgId}/events/${eventId}/participants?limit=200`,
      ),
    inviteEventParticipant: (orgId: string, eventId: string, userId: string) =>
      fromApi<{ eventId: string; userId: string; message: string }>(
        `/organizations/${orgId}/events/${eventId}/participants`,
        {
          method: "POST",
          body: { user_id: userId, is_invite: true },
          errorMessage: "We couldn't invite this participant. Try again.",
        },
      ),
    joinEvent: (orgId: string, eventId: string, userId: string) =>
      fromApi<{ eventId: string; userId: string; message: string }>(
        `/organizations/${orgId}/events/${eventId}/participants`,
        {
          method: "POST",
          body: { user_id: userId, is_invite: false },
          errorMessage: "We couldn't join the event. Try again.",
        },
      ),
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
      return fromApi<ChallengeListResponse>(
        `/organizations/${orgId}/challenges?${query.toString()}`,
      );
    },
    getChallenge: (orgId: string, challengeId: string) =>
      fromApi<ChallengeItem>(`/organizations/${orgId}/challenges/${challengeId}`),

    createChallenge: (orgId: string, payload: CreateChallengePayload) =>
      fromApi<ChallengeItem>(`/organizations/${orgId}/challenges`, {
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
      fromApi<ChallengeItem>(`/organizations/${orgId}/challenges/${challengeId}`, {
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
      fromApi<{ success: true }>(`/organizations/${orgId}/challenges/${challengeId}`, {
        method: "DELETE",
      }),

    cancelChallenge: (orgId: string, challengeId: string) =>
      fromApi<ChallengeItem>(`/organizations/${orgId}/challenges/${challengeId}/cancel`, {
        method: "POST",
      }),

    joinChallenge: (orgId: string, challengeId: string) =>
      fromApi<JoinChallengeResponse>(`/organizations/${orgId}/challenges/${challengeId}/join`, { method: "POST" }),

    leaveChallenge: (orgId: string, challengeId: string) =>
      fromApi<{ success: true }>(`/organizations/${orgId}/challenges/${challengeId}/join`, {
        method: "DELETE",
      }),

    getChallengeParticipants: (orgId: string, challengeId: string) =>
      fromApi<ChallengeParticipantListResponse>(
        `/organizations/${orgId}/challenges/${challengeId}/participants?limit=50`,
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
      return fromApi<ChallengeStatsResponse>(
        `/organizations/${orgId}/challenges/stats${qs ? `?${qs}` : ""}`,
      );
    },

    getLivePulse: async (orgId: string, branchId?: string): Promise<LivePulseResponse | null> => {
      const qs = branchId ? `?branch_id=${branchId}` : "";
      try {
        return await fromApi<LivePulseResponse>(
          `/organizations/${orgId}/wellbeing-survey/pulse/live${qs}`,
        );
      } catch (err) {
        // 404 = no open survey window right now — a legitimate empty state,
        // not a failure. Anything else should still surface as an error.
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    getEngagementWellbeingTrends: (
      orgId: string,
      period: EngagementWellbeingTrendPeriod,
      branchId?: string,
    ) => {
      const query = new URLSearchParams({ period });
      if (branchId) query.set("branch_id", branchId);
      return fromApi<EngagementWellbeingTrendsResponse>(
        `/organizations/${orgId}/dashboard/engagement-wellbeing-trends?${query.toString()}`,
      );
    },
    getMembers: (orgId: string, params: { offset?: number; limit?: number; branchId?: string } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 200));
    query.set("offset", String(params.offset ?? 0));
    if (params.branchId) query.set("branch_id", params.branchId);
    return fromApi<OrganizationMembersListResponse>(
      `/organizations/${orgId}/members?${query.toString()}`,
    );
  },
    listInvites: (orgId: string, branchId?: string) => fromApi<import("@/types/api").OrganizationInviteListResponse>(
      `/organizations/${orgId}/invites?status=pending&limit=200${branchId ? `&branch_id=${encodeURIComponent(branchId)}` : ""}`,
    ),
    cancelInvite: (orgId: string, inviteId: string) => fromApi<void>(
      `/organizations/${orgId}/invites/${inviteId}`, { method: "DELETE" },
    ),
    sendInvite: (orgId: string, payload: { email: string; branchId: string; departmentId: string; roleId: string }) =>
      fromApi<SendInviteResponse>(
        `/organizations/${orgId}/invites`,
        { method: "POST", body: {
          invited_email: payload.email,
          branch_id: payload.branchId,
          invited_department_id: payload.departmentId,
          invited_role_id: payload.roleId,
        } },
      ),
  },
  roles: {
    listSystem: (assignableOnly = false) => fromApi<SystemRolesResponse>(`/roles/system?assignable_only=${assignableOnly}`),
    listOrganization: (orgId: string, branchId?: string) => fromApi<SystemRolesResponse>(
      `/organizations/${orgId}/roles${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`,
    ),
    create: (orgId: string, body: { name: string; description?: string; branchId?: string }) => fromApi<RoleItem>(
      `/organizations/${orgId}/roles`, { method: "POST", body },
    ),
    delete: (orgId: string, roleId: string) => fromApi<void>(
      `/organizations/${orgId}/roles/${encodeURIComponent(roleId)}`, { method: "DELETE" },
    ),
    copy: (orgId: string, roleId: string, body: { name: string }) => fromApi<RoleItem>(
      `/organizations/${orgId}/roles/${encodeURIComponent(roleId)}/copy`, { method: "POST", body },
    ),
    updatePermissions: (orgId: string, roleId: string, permissionNames: string[]) => fromApi<RoleItem>(
      `/organizations/${orgId}/roles/${encodeURIComponent(roleId)}/permissions`,
      { method: "PUT", body: { permissionNames } },
    ),
    assignToMember: (orgId: string, userId: string, role: RoleItem) => fromApi<void>(
      `/organizations/${orgId}/members/${userId}/${role.isDefault ? "system-role" : "custom-role"}`, {
        method: "PUT",
        body: { roleId: role.id },
        errorMessage: "We couldn't assign the role. Try again.",
      },
    ),
    revokeFromMember: (orgId: string, userId: string, branchId?: string) => fromApi<void>(
      `/organizations/${orgId}/members/${userId}/role${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`, {
        method: "DELETE",
        errorMessage: "We couldn't remove the role. Try again.",
      },
    ),
  },
  teamMembers: {
    assignDepartment: (orgId: string, departmentId: string, userId: string) => fromApi(
      `/organizations/${orgId}/departments/${departmentId}/members/${userId}`, { method: "PUT" },
    ),
    transferBranch: (orgId: string, branchId: string, userId: string, departmentId: string) => fromApi(
      `/organizations/${orgId}/branches/${branchId}/members/${userId}`, { method: "PUT", body: { departmentId } },
    ),
  },
  permissions: {
    listCatalogue: (branchId?: string) => fromApi<PermissionCatalogueResponse>(
      `/permissions${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`,
    ),
    getUser: (orgId: string, userId: string, branchId?: string) => fromApi<UserPermissionsResponse>(
      `/organizations/${orgId}/members/${userId}/permissions${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`,
    ),
    grant: (orgId: string, userId: string, permissionName: string, branchId: string | null) => fromApi(
      `/organizations/${orgId}/members/${userId}/permissions`,
      { method: "POST", body: { permissionName, branchId } },
    ),
    revoke: (orgId: string, userId: string, permissionName: string, branchId: string | null) => fromApi(
      `/organizations/${orgId}/members/${userId}/permissions`,
      { method: "DELETE", body: { permissionName, branchId } },
    ),
  },
  preferences: {
    get: () => fromApi<UserPreferences>("/user-settings/preferences"),
    update: (body: Partial<UserPreferences>) => fromApi<UserPreferences>(
      "/user-settings/preferences", { method: "PATCH", body },
    ),
  },
kpiSnapshots: {
  getOverview: async (
    orgId: string,
    period: InsightsPeriod = "month",
    branchId?: string,
  ) => {
    const query = new URLSearchParams({ period });
    if (branchId) query.set("branch_id", branchId);
    const raw = await request<KPIOverviewApiResponse>(
      backendPath(`/organizations/${orgId}/kpi-snapshots/overview?${query.toString()}`),
    );
    const number = (value: number | null) => value === null ? "0" : value.toLocaleString();
    const trend = (value: number | null, suffix = "%") => value === null ? `0${suffix}` : `${value > 0 ? "+" : ""}${value}${suffix}`;
    return {
      summary: {
        averageDailySteps: number(raw.summary.averageDailySteps.value),
        averageDailyStepsTrend: trend(raw.summary.averageDailySteps.change),
        healthScore: number(raw.summary.healthScore.value),
        healthScoreTrend: trend(raw.summary.healthScore.change, "pts"),
        activeEmployees: `${number(raw.summary.activeEmployees.value)}%`,
        activeEmployeesTrend: trend(raw.summary.activeEmployees.change),
        challengesWon: number(raw.summary.challengesWon.value),
        challengesWonTrend: trend(raw.summary.challengesWon.change, ""),
      },
      charts: {
        monthlySteps: (raw.monthlySteps ?? []).map((point) => ({ ...point, actual: point.actual ?? 0, target: point.target ?? 0 })),
        healthDistribution: raw.healthDistribution ?? [],
        departmentPerformance: raw.departmentPerformance ?? [],
        weeklyActivity: (raw.weeklyActivity ?? []).map((point) => ({ ...point, steps: point.steps ?? 0 })),
      },
      topPerformers: (raw.topPerformers ?? []).map((performer) => ({
        id: performer.userId,
        name: `${performer.firstName} ${performer.lastName}`.trim(),
        steps: performer.steps.toLocaleString(),
        score: performer.score,
        avatar: performer.avatarUrl ?? "",
      })),
    } satisfies InsightsOverviewResponse;
  },
},
leaderboard: {
  getBranch: (orgId: string, metricType: string, branchId?: string) => {
    const query = new URLSearchParams();
    query.set("metric_type", metricType);
    query.set("period_type", "daily");
    query.set("limit", "3");
    if (branchId) query.set("branch_id", branchId);
    return fromApi<LeaderboardResponse>(
      `/organizations/${orgId}/leaderboard/branch?${query.toString()}`,
    );
  },
  getOrg: (orgId: string, metricType: string) => {
    const query = new URLSearchParams();
    query.set("metric_type", metricType);
    query.set("period_type", "daily");
    query.set("limit", "3");
    return fromApi<LeaderboardResponse>(
      `/organizations/${orgId}/leaderboard/org?${query.toString()}`,
    );
  },
},
club: {
  // No branchId => org-wide discovery (GET /clubs). branchId set =>
  // GET /branches/{branchId}/clubs. These are two different backend
  // routes, not one route with a scope param.
  getClubs: (orgId: string, params: { branchId?: string; offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 20));
    query.set("offset", String(params.offset ?? 0));
    const path = params.branchId
      ? `/organizations/${orgId}/branches/${params.branchId}/clubs?${query.toString()}`
      : `/organizations/${orgId}/clubs?${query.toString()}`;
    return fromApi<ClubListResponse>(path);
  },

  getClub: (orgId: string, clubId: string) =>
    fromApi<Club>(`/organizations/${orgId}/clubs/${clubId}`),

  // Creation is always branch-scoped — there's no org-wide create route.
  createClub: (orgId: string, branchId: string, payload: CreateClubPayload) =>
    fromApi<Club>(`/organizations/${orgId}/branches/${branchId}/clubs`, {
      method: "POST",
      suppressErrorNotification: true,
      body: {
        name: payload.name,
        description: payload.description,
        image_url: payload.imageUrl,
        privacy: payload.privacy,
        category: payload.category,
      },
    }),

  updateClub: (orgId: string, clubId: string, payload: Partial<CreateClubPayload>) =>
    fromApi<Club>(`/organizations/${orgId}/clubs/${clubId}`, {
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
    fromApi<{ clubId: string; organizationId: string; message: string }>(
      `/organizations/${orgId}/clubs/${clubId}`, { method: "DELETE" },
    ),

  joinClub: (orgId: string, clubId: string, userId: string) =>
    fromApi<{ userId: string; clubId: string; organizationId: string; message: string }>(
      `/organizations/${orgId}/clubs/${clubId}/members/${userId}`, { method: "PUT" },
    ),

  leaveClub: (orgId: string, clubId: string, userId: string) =>
    fromApi<{ userId: string; clubId: string; organizationId: string; message: string }>(
      `/organizations/${orgId}/clubs/${clubId}/members/${userId}/leave`, { method: "DELETE" },
    ),
    getClubMembers: (orgId: string, clubId: string, params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 200));
    query.set("offset", String(params.offset ?? 0));
    return fromApi<ClubMembersListResponse>(
      `/organizations/${orgId}/clubs/${clubId}/members?${query.toString()}`,
    );
  },

},

hashtag: {
  getTrending: (orgId: string) =>
    fromApi<TrendingHashtagListResponse>(
      `/organizations/${orgId}/hashtags/trending`,
    ),

  getPostsByTag: (
    orgId: string,
    tagName: string,
    params: { offset?: number; limit?: number } = {},
  ) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 20));
    query.set("offset", String(params.offset ?? 0));
    return fromApi<HashtagPostListResponse>(
      `/organizations/${orgId}/hashtags/${encodeURIComponent(tagName)}/posts?${query.toString()}`,
    );
  },
},
activity: {
  getWeeklyStepsTrend: (orgId: string) => {
    const query = new URLSearchParams();
    query.set("metric_type", "steps");
    query.set("granularity", "weekly");
    query.set("limit", "1");
    return fromApi<ActivityTrendResponse>(
      `/organizations/${orgId}/activity-log/trend?${query.toString()}`,
    );
  },
},
chat: {
  getMessages: (orgId: string, conversationType: string, conversationId: string, params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 50));
    query.set("offset", String(params.offset ?? 0));
    return fromApi<MessageListResponse>(
      `/organizations/${orgId}/conversations/${conversationType}/${conversationId}/messages?${query.toString()}`,
    );
  },
  sendMessage: (orgId: string, conversationType: string, conversationId: string, payload: { content?: string; mediaUrl?: string; mediaType?: string }) =>
    fromApi<MessageResponse>(
      `/organizations/${orgId}/conversations/${conversationType}/${conversationId}/messages`,
      { method: "POST", body: { content: payload.content, media_url: payload.mediaUrl, media_type: payload.mediaType } },
    ),
  deleteMessage: (orgId: string, messageId: string) =>
    fromApi<{ messageId: string; message: string }>(
      `/organizations/${orgId}/conversations/messages/${messageId}`,
      { method: "DELETE" },
    ),
  pinMessage: (orgId: string, messageId: string) =>
    fromApi<PinActionResponse>(
      `/organizations/${orgId}/conversations/messages/${messageId}/pin`,
      { method: "POST" },
    ),
  unpinMessage: (orgId: string, messageId: string) =>
    fromApi<PinActionResponse>(
      `/organizations/${orgId}/conversations/messages/${messageId}/pin`,
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
    return fromApi<PostListResponse>(
      `/organizations/${orgId}/posts?${query.toString()}`,
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
  return fromApi<PostListResponse>(
    `/organizations/${orgId}/posts/users/${userId}?${query.toString()}`,
    );
  },

  getLikesGivenCount: (orgId: string, params: { periodStart?: string; periodEnd?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.periodStart) query.set("period_start", params.periodStart);
    if (params.periodEnd) query.set("period_end", params.periodEnd);
    const qs = query.toString();
    return fromApi<LikesGivenCountResponse>(
      `/organizations/${orgId}/posts/likes/given/count${qs ? `?${qs}` : ""}`,
    );
  },
  createPost: (orgId: string, payload: CreatePostPayload) =>
    fromApi<Post>(`/organizations/${orgId}/posts`, {
      method: "POST",
      body: { branch_id: payload.branchId, content: payload.content, media_url: payload.mediaUrl, media_type: payload.mediaType },
    }),

  deletePost: (orgId: string, postId: string) =>
    fromApi<{ success: true }>(`/organizations/${orgId}/posts/${postId}`, { method: "DELETE" }),

  likePost: (orgId: string, postId: string) =>
    fromApi<LikeActionResponse>(`/organizations/${orgId}/posts/${postId}/like`, { method: "POST" }),

  unlikePost: (orgId: string, postId: string) =>
    fromApi<LikeActionResponse>(`/organizations/${orgId}/posts/${postId}/like`, { method: "DELETE" }),

  getComments: (orgId: string, postId: string, params: { offset?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 50));
    query.set("offset", String(params.offset ?? 0));
    return fromApi<CommentListResponse>(
      `/organizations/${orgId}/posts/${postId}/comments?${query.toString()}`,
    );
  },

  addComment: (orgId: string, postId: string, content: string) =>
    fromApi<Comment>(`/organizations/${orgId}/posts/${postId}/comments`, {
      method: "POST", body: { content },
    }),

  deleteComment: (orgId: string, postId: string, commentId: string) =>
    fromApi<{ success: true }>(
      `/organizations/${orgId}/posts/${postId}/comments/${commentId}`, { method: "DELETE" },
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
    return fromApi<StoryListResponse>(
      `/organizations/${orgId}/stories?${query.toString()}`,
    );
  },

  createStory: (orgId: string, payload: CreateStoryPayload) =>
    fromApi<Story>(`/organizations/${orgId}/stories`, {
      method: "POST",
      body: { branch_id: payload.branchId, media_url: payload.mediaUrl, media_type: payload.mediaType },
    }),

  deleteStory: (orgId: string, storyId: string) =>
    fromApi<{ success: true }>(`/organizations/${orgId}/stories/${storyId}`, { method: "DELETE" }),
},
  storage: {
    requestUploadUrl: (payload: { domain: string; contentType: string }) =>
      fromApi<{ uploadUrl: string; objectKey: string; mediaUrl: string; contentType: string }>(
        "/storage/upload-url",
        { method: "POST", body: payload },
      ),
  },
  wellbeing: {
    getChallenges: () =>
      fromApi<WellbeingChallengeListResponse>("/wellbeing/challenges"),
  },
  onboarding: {
    checkBusinessName: (name: string) =>
      fromApi<AvailabilityResponse>(
        `/auth/signup/check/business-name?name=${encodeURIComponent(name)}`,
      ),
    checkPhoneNumber: (number: string) =>
      fromApi<AvailabilityResponse>(
        `/auth/signup/check/phone?number=${encodeURIComponent(number)}`,
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

      return request<AuthTokenResponse>(backendPath("/auth/signup"), {
        method: "POST",
        body: payload,
      });
    },
  },

  dashboard: {
    bootstrap: async (orgId: string): Promise<DashboardBootstrap> => {
      const payload = await request<DashboardBootstrap>(
        backendPath(`/organizations/${orgId}/dashboard/bootstrap`),
      );
      const branchNames = new Map(payload.branches.map((branch) => [branch.id, branch.name]));
      const normalizedChallenges = (payload.challenges as unknown as ChallengeItem[]).map((challenge) => {
        const endTime = challenge.endDate ? new Date(`${challenge.endDate}T00:00:00`).getTime() : Date.now();
        return {
          id: challenge.id,
          title: challenge.name,
          category: "Wellness",
          status: challenge.status ? `${challenge.status[0].toUpperCase()}${challenge.status.slice(1)}` : "Upcoming",
          participants: challenge.participantCount ?? 0,
          daysLeft: Math.max(0, Math.ceil((endTime - Date.now()) / 86_400_000)),
          progress: challenge.completionRate ?? 0,
          branchId: challenge.branchId,
          branch: challenge.branchId ? branchNames.get(challenge.branchId) ?? "Unknown branch" : "Organization",
          image: challenge.imageUrl ?? "",
          description: challenge.description ?? "",
        };
      }) as unknown as DashboardBootstrap["challenges"];
      const normalizedLeaderboard = (payload.leaderboard as unknown as LeaderboardEntry[]).map((entry) => ({
        id: entry.userId,
        name: `${entry.firstName} ${entry.lastName}`.trim(),
        role: "Employee",
        steps: Number(entry.value),
        rank: entry.rank,
        trend: entry.previousRank === null || entry.rank === entry.previousRank
          ? "flat"
          : entry.rank < entry.previousRank ? "up" : "down",
        branch: "",
        avatar: entry.avatarUrl ?? "",
      })) as unknown as DashboardBootstrap["leaderboard"];
      const dashboardUser = payload.user as DashboardBootstrap["user"] & { avatarUrl?: string };
      return {
        ...payload,
        user: {
          ...payload.user,
          businessName: payload.user.businessName ?? "",
          profileImage: payload.user.profileImage ?? dashboardUser.avatarUrl,
        },
        activeBranch: payload.activeBranch ?? payload.branches[0]?.name ?? "",
        challenges: normalizedChallenges,
        leaderboard: normalizedLeaderboard,
        participantOptions: payload.participantOptions ?? [],
      };
    },
  },

  branches: {
    nameCurrent: (name: string) => fromApi<Branch>("/v1/branches/current", {
      method: "PUT",
      body: { name },
    }),
    create: (branch: Omit<Branch, "id">) => fromApi("/v1/branches", {
      method: "POST",
      body: branch,
    }),
    select: (branchName: string) => fromApi("/v1/branches/active", {
      method: "PUT",
      body: { branchName },
    }),
  },

  users: {
    search: async (query: string): Promise<UserSearchResult[]> => {
      const normalized = query.trim();
      if (!normalized) return [];

      return request<UserSearchResult[]>(
        backendPath(`/v1/users/search?q=${encodeURIComponent(normalized)}`),
      );
    },
    profile: (userId: string) => fromApi<import("@/types/api").DirectoryUserProfile>(
      `/v1/users/${userId}/profile`,
    ),
  },

  ai: {
    chat: (messages: ChatMessage[], branchName: string) => request<{ message: string }>("/api/ai/chat", {
      method: "POST",
      body: { messages, branchName },
      timeoutMs: 30_000,
    }),
  },

  integrations: {
    list: (orgId: string) => fromApi<{ items: Array<{ id: string; name: string; description: string; status: "connected" | "disconnected"; enabled: boolean }> }>(`/organizations/${orgId}/integrations`),
    connect: (orgId: string, provider: string) => fromApi(`/organizations/${orgId}/integrations/${provider}/connect`, { method: "POST" }),
    toggle: (orgId: string, provider: string, enabled: boolean) => fromApi(`/organizations/${orgId}/integrations/${provider}`, { method: "PATCH", body: { enabled } }),
    disconnect: (orgId: string, provider: string) => fromApi<void>(`/organizations/${orgId}/integrations/${provider}`, { method: "DELETE" }),
  },

  billing: {
    listPlans: () => fromApi<SubscriptionPlanListResponse>("/plans"),
    getSubscription: (orgId: string) => fromApi<OrganizationSubscriptionInfo>(
      `/organizations/${orgId}/subscription`,
    ),
    listTransactions: (orgId: string, params: { offset?: number; limit?: number } = {}) => {
      const query = new URLSearchParams({ offset: String(params.offset ?? 0), limit: String(params.limit ?? 50) });
      return fromApi<PaymentTransactionListResponse>(
        `/organizations/${orgId}/transactions?${query.toString()}`,
      );
    },
    getTransaction: (orgId: string, reference: string) => fromApi<PaymentTransactionItem>(
      `/organizations/${orgId}/transactions/${encodeURIComponent(reference)}`,
    ),
    verifyTransaction: (orgId: string, reference: string) => fromApi<PaymentVerificationResponse>(
      `/organizations/${orgId}/transactions/${encodeURIComponent(reference)}/verify`, { method: "POST" },
    ),
    checkout: (orgId: string, payload: { planId: string; callbackUrl: string; autoRenew: boolean }) => fromApi<CheckoutResponse>(
      `/organizations/${orgId}/checkout`, {
        method: "POST", body: { plan_id: payload.planId, callback_url: payload.callbackUrl, auto_renew: payload.autoRenew },
      },
    ),
    cancelAutoRenew: (orgId: string) => fromApi<OrganizationSubscriptionInfo>(
      `/organizations/${orgId}/subscription/cancel-auto-renew`, { method: "POST" },
    ),
    updateAutoRenew: (orgId: string, enabled: boolean) => fromApi<OrganizationSubscriptionInfo>(
      `/organizations/${orgId}/subscription/auto-renew`,
      { method: "PATCH", body: { enabled } },
    ),
  },

  profile: {
    get: () => fromApi<ProfileSettingsInfo>("/user-settings/profile"),
    update: (payload: { firstName: string; lastName: string; country?: string; state?: string }) =>
      fromApi<ProfileSettingsInfo>("/user-settings/profile", {
        method: "PATCH",
        body: { first_name: payload.firstName, last_name: payload.lastName, country: payload.country || null, state: payload.state || null },
      }),
    updateAvatar: (mediaUrl: string) => fromApi<{ avatarUrl: string }>(
      "/user-settings/avatar", { method: "PUT", body: { media_url: mediaUrl } },
    ),
  },

  security: {
    changePassword: (currentPassword: string, newPassword: string) => fromApi<{ message: string }>(
      "/user-settings/change-password",
      { method: "POST", body: { current_password: currentPassword, new_password: newPassword } },
    ),
    setupTwoFa: (method: "totp" | "email") => fromApi<TwoFaSetupInfo>(
      "/auth/2fa/setup", { method: "POST", body: { method } },
    ),
    confirmTwoFa: (code: string) => fromApi<void>(
      "/auth/2fa/confirm", { method: "POST", body: { code } },
    ),
    disableTwoFa: (password: string) => fromApi<void>(
      "/auth/2fa/disable", { method: "POST", body: { password } },
    ),
    listSessions: () => fromApi<SecuritySessionListResponse>("/auth/sessions"),
    revokeSession: (sessionId: string) => fromApi<void>(
      `/auth/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" },
    ),
  },

  notifications: {
    list: (params: { unreadOnly?: boolean; offset?: number; limit?: number } = {}) => {
      const query = new URLSearchParams({
        unread_only: String(params.unreadOnly ?? false),
        offset: String(params.offset ?? 0),
        limit: String(params.limit ?? 50),
      });
      return fromApi<NotificationListResponse>(
        `/notifications?${query.toString()}`,
      );
    },
    unreadCount: () => fromApi<UnreadCountResponse>("/notifications/unread-count"),
    markRead: (notificationId: string) => fromApi<{ notificationId: string; isRead: boolean; message: string }>(
      `/notifications/${notificationId}/read`, { method: "PATCH" },
    ),
    markAllRead: () => fromApi<{ markedCount: number; message: string }>(
      "/notifications/read-all", { method: "PATCH" },
    ),
    remove: (notificationId: string) => fromApi<void>(
      `/notifications/${notificationId}`, { method: "DELETE" },
    ),
  },

  resources: {
    get: <T>(resource: string, id: string | number) =>
      fromApi<T>(`/v1/${resource}/${encodeURIComponent(String(id))}`),
    list: <T>(resource: string, query = "") =>
      fromApi<T>(`/v1/${resource}${query ? `?${query}` : ""}`),
    mutate: <T = { success: true }>({ resource, action, id, payload }: ResourceMutation) =>
      fromApi<T>(`/v1/${resource}${id === undefined ? "" : `/${encodeURIComponent(String(id))}`}/${action}`, {
        method: "POST",
        body: payload,
      }),
    upload: (resource: string, file: File) => {
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
      fromApi("/v1/public/demo-requests", { method: "POST", body: payload }),
    contactSupport: (payload: { name: string; email: string; subject: string; message: string }) =>
      fromApi("/support/tickets", { method: "POST", body: payload }),
  },
};
