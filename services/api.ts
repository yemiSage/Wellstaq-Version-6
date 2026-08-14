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
  UpdatePostPayload,
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


const dataSource = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") as "mock" | "api";
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
    requestInviteOtp: (inviteCode: string) => fromApiOrMock<{ message: string; sentTo: string }>(
      "/auth/invite/otp/request", { message: "Verification code sent.", sentTo: "your email" },
      { method: "POST", body: { inviteCode } },
    ),
    verifyInviteOtp: (inviteCode: string, code: string) => fromApiOrMock<{ inviteVerificationToken: string }>(
      "/auth/invite/otp/verify", { inviteVerificationToken: `mock-invite-${code}` },
      { method: "POST", body: { inviteCode, code } },
    ),
    registerInvite: (payload: {
      inviteVerificationToken: string; firstName: string; lastName: string; password: string;
      country: string; state: string;
      baseline: { entries: Array<{ dimension: string; level: string; reason: string }> };
      priorities: Array<{ priority: string; rank: number }>;
    }) => fromApiOrMock<InviteRegistrationResponse>(
      "/auth/register/invite",
      { message: "Registration successful.", role: "member", requiresApp: true },
      { method: "POST", body: payload },
    ),
    sendOtp: (email: string) => fromApiOrMock("/auth/signup/otp/request", { accepted: true }, {
      method: "POST",
      body: { email },
      suppressErrorNotification: true,
    }),
    verifyOtp: (email: string, code: string) =>
      fromApiOrMock<{ emailVerificationToken: string }>(
        "/auth/signup/otp/verify",
        { emailVerificationToken: `mock-token-${code}` },
        { method: "POST", body: { email, code } },
      ),
    login: (email: string, password: string) =>
      fromApiOrMock<LoginResponse>(
        "/auth/login",
        { accessToken: "mock-access-token", refreshToken: "mock-refresh-token", tokenType: "bearer" },
        { method: "POST", body: { email, password }, suppressErrorNotification: true },
      ),
    verifyTwoFa: (twoFaChallengeToken: string, code: string) =>
      fromApiOrMock<AuthTokenResponse>(
        "/auth/2fa/verify",
        { accessToken: "mock-access-token", refreshToken: "mock-refresh-token", tokenType: "bearer" },
        { method: "POST", body: { twoFaChallengeToken, code } },
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
      return fromApiOrMock<OrgStatsResponse>(`/organizations/${orgId}/stats${qs ? `?${qs}` : ""}`, mockOrgStats());
    },
    getActiveUserStats: (orgId: string) =>
      fromApiOrMock<OrgStatsResponse>(`/organizations/${orgId}/stats?user_status=active`, mockOrgStats()),
    getActivitySummary: (orgId: string) =>
      fromApiOrMock<ActivitySummaryResponse>(`/organizations/${orgId}/activities/summary`, {
        totalCount: 0,
        byType: [],
      }),

    getBranchStats: (orgId: string, branchId: string, params: StatsQueryParams = {}) => {
      const qs = buildStatsQuery(params);
      return fromApiOrMock<OrgStatsResponse>(
        `/organizations/${orgId}/branches/${branchId}/stats${qs ? `?${qs}` : ""}`,
        mockOrgStats(),
      );
    },
    getBranchActiveUserStats: (orgId: string, branchId: string) =>
      fromApiOrMock<OrgStatsResponse>(
        `/organizations/${orgId}/branches/${branchId}/stats?user_status=active`,
        mockOrgStats(),
      ),
    getBranchActivitySummary: (orgId: string, branchId: string) =>
      fromApiOrMock<ActivitySummaryResponse>(
        `/organizations/${orgId}/branches/${branchId}/activities/summary`,
        { totalCount: 0, byType: [] },
      ),

    getBranches: async (orgId: string) => {
      const response = await fromApiOrMock<{ items: Branch[]; total: number; offset: number; limit: number }>(
        `/organizations/${orgId}/branches?limit=100`,
        { items: [], total: 0, offset: 0, limit: 100 },
      );
      return response.items;
    },
    createBranch: (orgId: string, name: string) =>
      fromApiOrMock<Branch>(`/organizations/${orgId}/branches`, {} as Branch, {
        method: "POST",
        body: { name },
      }),
    assignBranchManager: (orgId: string, branchId: string, managerId: string) =>
      fromApiOrMock<{ branchId: string; organizationId: string; managerId: string; message: string }>(
        `/organizations/${orgId}/branches/${branchId}/manager`,
        { branchId, organizationId: orgId, managerId, message: "Manager assigned successfully." },
        { method: "PUT", body: { managerId } },
      ),
    getDepartments: (orgId: string, branchId?: string) =>
      fromApiOrMock<DepartmentListResponse>(
        branchId
          ? `/organizations/${orgId}/branches/${branchId}/departments?limit=200`
          : `/organizations/${orgId}/departments?limit=200`,
        { items: [], total: 0, offset: 0, limit: 200 },
      ),
    getDepartmentRanks: (orgId: string, branchId?: string) => {
      const query = branchId ? `?branch_id=${encodeURIComponent(branchId)}` : "";
      return fromApiOrMock<DepartmentRankListResponse>(
        `/organizations/${orgId}/department-rank${query}`,
        { items: [] },
      );
    },
    getDepartmentMembers: (orgId: string, departmentId: string) =>
      fromApiOrMock<DepartmentMembersListResponse>(
        `/organizations/${orgId}/departments/${departmentId}/members?limit=200`,
        { items: [], total: 0, offset: 0, limit: 200 },
      ),
    createDepartment: (orgId: string, branchId: string, name: string) =>
      fromApiOrMock<DepartmentItem>(`/organizations/${orgId}/departments`, {} as DepartmentItem, {
        method: "POST", body: { name, branch_id: branchId, avatar_initial: name.slice(0, 2).toUpperCase() },
      }),
    updateDepartment: (orgId: string, departmentId: string, name: string) =>
      fromApiOrMock<DepartmentItem>(`/organizations/${orgId}/departments/${departmentId}`, {} as DepartmentItem, {
        method: "PATCH", body: { name },
      }),
    deleteDepartment: (orgId: string, departmentId: string) =>
      fromApiOrMock<{ departmentId: string; membersTransferred: number; message: string }>(
        `/organizations/${orgId}/departments/${departmentId}`,
        { departmentId, membersTransferred: 0, message: "" },
        { method: "DELETE", body: { transfer_to_department_id: null } },
      ),
    assignDepartmentMember: (orgId: string, departmentId: string, userId: string) =>
      fromApiOrMock<{ message: string }>(
        `/organizations/${orgId}/departments/${departmentId}/members/${userId}`,
        { message: "" }, { method: "PUT" },
      ),
    getEvents: (orgId: string, params: { branchId?: string; offset?: number; limit?: number } = {}) => {
      const query = new URLSearchParams({
        offset: String(params.offset ?? 0), limit: String(params.limit ?? 20),
      });
      if (params.branchId) query.set("branch_id", params.branchId);
      return fromApiOrMock<EventListResponse>(
        `/organizations/${orgId}/events?${query.toString()}`,
        { items: [], total: 0, offset: params.offset ?? 0, limit: params.limit ?? 20 },
      );
    },
    getEvent: (orgId: string, eventId: string) =>
      fromApiOrMock<EventItem>(`/organizations/${orgId}/events/${eventId}`, {} as EventItem),
    createEvent: (orgId: string, payload: { branchId: string; title: string; description?: string; imageUrl?: string; startDate: string; endDate?: string; recurrenceRule?: string; time: string }) =>
      fromApiOrMock<EventItem>(`/organizations/${orgId}/events`, {} as EventItem, {
        method: "POST", body: {
          branch_id: payload.branchId, title: payload.title, description: payload.description,
          image_url: payload.imageUrl, start_date: payload.startDate, end_date: payload.endDate,
          recurrence_rule: payload.recurrenceRule, time: payload.time,
        },
      }),
    updateEvent: (orgId: string, eventId: string, payload: { title?: string; description?: string; imageUrl?: string; startDate?: string; endDate?: string; recurrenceRule?: string; time?: string; status?: string }) =>
      fromApiOrMock<EventItem>(`/organizations/${orgId}/events/${eventId}`, {} as EventItem, {
        method: "PATCH", body: {
          title: payload.title, description: payload.description, image_url: payload.imageUrl,
          start_date: payload.startDate, end_date: payload.endDate,
          recurrence_rule: payload.recurrenceRule, time: payload.time, status: payload.status,
        },
      }),
    deleteEvent: (orgId: string, eventId: string) =>
      fromApiOrMock<{ eventId: string; message: string }>(
        `/organizations/${orgId}/events/${eventId}`, { eventId, message: "" }, { method: "DELETE" },
      ),
    getEventParticipants: (orgId: string, eventId: string) =>
      fromApiOrMock<EventParticipantsListResponse>(
        `/organizations/${orgId}/events/${eventId}/participants?limit=200`,
        { items: [], total: 0, offset: 0, limit: 200 },
      ),
    inviteEventParticipant: (orgId: string, eventId: string, userId: string) =>
      fromApiOrMock<{ eventId: string; userId: string; message: string }>(
        `/organizations/${orgId}/events/${eventId}/participants`,
        { eventId, userId, message: "" },
        { method: "POST", body: { user_id: userId, is_invite: true } },
      ),
    joinEvent: (orgId: string, eventId: string, userId: string) =>
      fromApiOrMock<{ eventId: string; userId: string; message: string }>(
        `/organizations/${orgId}/events/${eventId}/participants`,
        { eventId, userId, message: "" },
        { method: "POST", body: { user_id: userId, is_invite: false } },
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
      return fromApiOrMock<ChallengeListResponse>(
        `/organizations/${orgId}/challenges?${query.toString()}`,
        { items: [], total: 0, offset: 0, limit: params.limit ?? 8 },
      );
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
        return await fromApiOrMock<LivePulseResponse>(
          `/organizations/${orgId}/wellbeing-survey/pulse/live${qs}`,
          {
            windowId: "", respondentCount: 0,
            stressManageability: { percent: null, status: null },
            energyRecovery: { percent: null, status: null },
            connectionBelonging: { percent: null, status: null },
            workloadSustainability: { percent: null, status: null },
            workplaceComfort: { percent: null, status: null },
            prioritySupportPct: null, needsAttentionPct: null, doingWellPct: null,
          },
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
      return fromApiOrMock<EngagementWellbeingTrendsResponse>(
        `/organizations/${orgId}/dashboard/engagement-wellbeing-trends?${query.toString()}`,
        { period, startDate: "", endDate: "", points: [] },
      );
    },
    getMembers: (orgId: string, params: { offset?: number; limit?: number; branchId?: string } = {}) => {
    const query = new URLSearchParams();
    query.set("limit", String(params.limit ?? 200));
    query.set("offset", String(params.offset ?? 0));
    if (params.branchId) query.set("branch_id", params.branchId);
    return fromApiOrMock<OrganizationMembersListResponse>(
      `/organizations/${orgId}/members?${query.toString()}`,
      { items: [], total: 0, offset: 0, limit: params.limit ?? 200 },
    );
  },
    listInvites: (orgId: string, branchId?: string) => fromApiOrMock<import("@/types/api").OrganizationInviteListResponse>(
      `/organizations/${orgId}/invites?status=pending&limit=200${branchId ? `&branch_id=${encodeURIComponent(branchId)}` : ""}`,
      { items: [], total: 0, offset: 0, limit: 200 },
    ),
    cancelInvite: (orgId: string, inviteId: string) => fromApiOrMock<void>(
      `/organizations/${orgId}/invites/${inviteId}`, undefined, { method: "DELETE" },
    ),
    sendInvite: (orgId: string, payload: { email: string; branchId: string; departmentId: string; roleId: string }) =>
      fromApiOrMock<SendInviteResponse>(
        `/organizations/${orgId}/invites`,
        {} as SendInviteResponse,
        { method: "POST", body: {
          invited_email: payload.email,
          branch_id: payload.branchId,
          invited_department_id: payload.departmentId,
          invited_role_id: payload.roleId,
        } },
      ),
  },
  roles: {
    listSystem: (assignableOnly = false) => fromApiOrMock<SystemRolesResponse>(`/roles/system?assignable_only=${assignableOnly}`, { items: [], total: 0 }),
    listOrganization: (orgId: string, branchId?: string) => fromApiOrMock<SystemRolesResponse>(
      `/organizations/${orgId}/roles${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`,
      { items: [], total: 0 },
    ),
    create: (orgId: string, body: { name: string; description?: string; branchId?: string }) => fromApiOrMock<RoleItem>(
      `/organizations/${orgId}/roles`, {} as RoleItem, { method: "POST", body },
    ),
    delete: (orgId: string, roleId: string) => fromApiOrMock<void>(
      `/organizations/${orgId}/roles/${encodeURIComponent(roleId)}`, undefined, { method: "DELETE" },
    ),
    copy: (orgId: string, roleId: string, body: { name: string }) => fromApiOrMock<RoleItem>(
      `/organizations/${orgId}/roles/${encodeURIComponent(roleId)}/copy`, {} as RoleItem, { method: "POST", body },
    ),
    updatePermissions: (orgId: string, roleId: string, permissionNames: string[]) => fromApiOrMock<RoleItem>(
      `/organizations/${orgId}/roles/${encodeURIComponent(roleId)}/permissions`, {} as RoleItem,
      { method: "PUT", body: { permissionNames } },
    ),
    assignToMember: (orgId: string, userId: string, role: RoleItem) => fromApiOrMock<void>(
      `/organizations/${orgId}/members/${userId}/${role.isDefault ? "system-role" : "custom-role"}`,
      undefined, { method: "PUT", body: { roleId: role.id } },
    ),
    revokeFromMember: (orgId: string, userId: string, branchId?: string) => fromApiOrMock<void>(
      `/organizations/${orgId}/members/${userId}/role${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`,
      undefined, { method: "DELETE" },
    ),
  },
  teamMembers: {
    assignDepartment: (orgId: string, departmentId: string, userId: string) => fromApiOrMock(
      `/organizations/${orgId}/departments/${departmentId}/members/${userId}`, {}, { method: "PUT" },
    ),
    transferBranch: (orgId: string, branchId: string, userId: string, departmentId: string) => fromApiOrMock(
      `/organizations/${orgId}/branches/${branchId}/members/${userId}`, {}, { method: "PUT", body: { departmentId } },
    ),
  },
  permissions: {
    listCatalogue: (branchId?: string) => fromApiOrMock<PermissionCatalogueResponse>(
      `/permissions${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`,
      { items: [], total: 0 },
    ),
    getUser: (orgId: string, userId: string, branchId?: string) => fromApiOrMock<UserPermissionsResponse>(
      `/organizations/${orgId}/members/${userId}/permissions${branchId ? `?branch_id=${encodeURIComponent(branchId)}` : ""}`,
      { userId, organizationId: orgId, total: 0, permissions: [] },
    ),
    grant: (orgId: string, userId: string, permissionName: string, branchId: string | null) => fromApiOrMock(
      `/organizations/${orgId}/members/${userId}/permissions`, {},
      { method: "POST", body: { permissionName, branchId } },
    ),
    revoke: (orgId: string, userId: string, permissionName: string, branchId: string | null) => fromApiOrMock(
      `/organizations/${orgId}/members/${userId}/permissions`, {},
      { method: "DELETE", body: { permissionName, branchId } },
    ),
  },
  preferences: {
    get: () => fromApiOrMock<UserPreferences>("/user-settings/preferences", {
      emailNotifications: true, pushNotifications: true, challengeReminders: true,
      publicProfile: false, showActivity: false, theme: "light",
    }),
    update: (body: Partial<UserPreferences>) => fromApiOrMock<UserPreferences>(
      "/user-settings/preferences", {} as UserPreferences, { method: "PATCH", body },
    ),
  },
kpiSnapshots: {
  getOverview: async (
    orgId: string,
    period: InsightsPeriod = "month",
    branchId?: string,
    fallback?: InsightsOverviewResponse,
  ) => {
    const empty = fallback ?? {
      summary: {
        averageDailySteps: "0", averageDailyStepsTrend: "0%",
        healthScore: "0", healthScoreTrend: "0pts",
        activeEmployees: "0%", activeEmployeesTrend: "0%",
        challengesWon: "0", challengesWonTrend: "0",
      },
      topPerformers: [],
      charts: {},
    };
    if (usingMockData) return mockResult(empty);

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
        avatar: performer.avatarUrl || `https://picsum.photos/seed/${performer.userId}/100/100`,
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
    return fromApiOrMock<LeaderboardResponse>(
      `/organizations/${orgId}/leaderboard/branch?${query.toString()}`,
      { metricType, periodType: "daily", periodStart: "", periodEnd: "", scope: "branch", items: [] } as unknown as LeaderboardResponse,
    );
  },
  getOrg: (orgId: string, metricType: string) => {
    const query = new URLSearchParams();
    query.set("metric_type", metricType);
    query.set("period_type", "daily");
    query.set("limit", "3");
    return fromApiOrMock<LeaderboardResponse>(
      `/organizations/${orgId}/leaderboard/org?${query.toString()}`,
      { metricType, periodType: "daily", periodStart: "", periodEnd: "", scope: "org", items: [] } as unknown as LeaderboardResponse,
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
    return fromApiOrMock<ClubListResponse>(path, { items: [], total: 0, offset: 0, limit: params.limit ?? 20 });
  },

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
    bootstrap: async (orgId: string): Promise<DashboardBootstrap> => {
      if (usingMockData) {
        const { mockDashboardBootstrap } = await import("@/services/mock-api");
        return mockResult({ ...mockDashboardBootstrap, user: mockUser });
      }
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
          branch: challenge.branchId ? branchNames.get(challenge.branchId) ?? "Unknown branch" : "Organization",
          image: challenge.imageUrl ?? "",
          description: challenge.description ?? "",
        };
      }) as DashboardBootstrap["challenges"];
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
        avatar: `https://picsum.photos/seed/${entry.userId}/100/100`,
      })) as DashboardBootstrap["leaderboard"];
      return {
        ...payload,
        user: { ...payload.user, businessName: payload.user.businessName ?? "" },
        activeBranch: payload.activeBranch ?? payload.branches[0]?.name ?? "",
        challenges: normalizedChallenges,
        leaderboard: normalizedLeaderboard,
        participantOptions: payload.participantOptions ?? [],
      };
    },
  },

  branches: {
    nameCurrent: (name: string) => fromApiOrMock("/v1/branches/current", { name, invitees: [] }, {
      method: "PUT",
      body: { name },
    }),
    create: (branch: Omit<Branch, "id">) => fromApiOrMock("/v1/branches", branch, {
      method: "POST",
      body: branch,
    }),
    select: (branchName: string) => fromApiOrMock("/v1/branches/active", { activeBranch: branchName }, {
      method: "PUT",
      body: { branchName },
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
    profile: (userId: string) => fromApiOrMock<import("@/types/api").DirectoryUserProfile>(
      `/v1/users/${userId}/profile`, {} as import("@/types/api").DirectoryUserProfile,
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
    list: (orgId: string) => fromApiOrMock<{ items: Array<{ id: string; name: string; description: string; status: "connected" | "disconnected"; enabled: boolean }> }>(`/organizations/${orgId}/integrations`, { items: [] }),
    connect: (orgId: string, provider: string) => fromApiOrMock(`/organizations/${orgId}/integrations/${provider}/connect`, {}, { method: "POST" }),
    toggle: (orgId: string, provider: string, enabled: boolean) => fromApiOrMock(`/organizations/${orgId}/integrations/${provider}`, {}, { method: "PATCH", body: { enabled } }),
    disconnect: (orgId: string, provider: string) => fromApiOrMock<void>(`/organizations/${orgId}/integrations/${provider}`, undefined, { method: "DELETE" }),
  },

  billing: {
    listPlans: () => fromApiOrMock<SubscriptionPlanListResponse>("/plans", { items: [] }),
    getSubscription: (orgId: string) => fromApiOrMock<OrganizationSubscriptionInfo>(
      `/organizations/${orgId}/subscription`, {} as OrganizationSubscriptionInfo,
    ),
    listTransactions: (orgId: string, params: { offset?: number; limit?: number } = {}) => {
      const query = new URLSearchParams({ offset: String(params.offset ?? 0), limit: String(params.limit ?? 50) });
      return fromApiOrMock<PaymentTransactionListResponse>(
        `/organizations/${orgId}/transactions?${query.toString()}`,
        { items: [], total: 0, offset: params.offset ?? 0, limit: params.limit ?? 50 },
      );
    },
    getTransaction: (orgId: string, reference: string) => fromApiOrMock<PaymentTransactionItem>(
      `/organizations/${orgId}/transactions/${encodeURIComponent(reference)}`, {} as PaymentTransactionItem,
    ),
    verifyTransaction: (orgId: string, reference: string) => fromApiOrMock<PaymentVerificationResponse>(
      `/organizations/${orgId}/transactions/${encodeURIComponent(reference)}/verify`, {} as PaymentVerificationResponse, { method: "POST" },
    ),
    checkout: (orgId: string, payload: { planId: string; callbackUrl: string; autoRenew: boolean }) => fromApiOrMock<CheckoutResponse>(
      `/organizations/${orgId}/checkout`, {} as CheckoutResponse, {
        method: "POST", body: { plan_id: payload.planId, callback_url: payload.callbackUrl, auto_renew: payload.autoRenew },
      },
    ),
    cancelAutoRenew: (orgId: string) => fromApiOrMock<OrganizationSubscriptionInfo>(
      `/organizations/${orgId}/subscription/cancel-auto-renew`, {} as OrganizationSubscriptionInfo, { method: "POST" },
    ),
    updateAutoRenew: (orgId: string, enabled: boolean) => fromApiOrMock<OrganizationSubscriptionInfo>(
      `/organizations/${orgId}/subscription/auto-renew`, {} as OrganizationSubscriptionInfo,
      { method: "PATCH", body: { enabled } },
    ),
  },

  profile: {
    get: () => fromApiOrMock<ProfileSettingsInfo>("/user-settings/profile", {} as ProfileSettingsInfo),
    update: (payload: { firstName: string; lastName: string; country?: string; state?: string }) =>
      fromApiOrMock<ProfileSettingsInfo>("/user-settings/profile", {} as ProfileSettingsInfo, {
        method: "PATCH",
        body: { first_name: payload.firstName, last_name: payload.lastName, country: payload.country || null, state: payload.state || null },
      }),
    updateAvatar: (mediaUrl: string) => fromApiOrMock<{ avatarUrl: string }>(
      "/user-settings/avatar", { avatarUrl: mediaUrl }, { method: "PUT", body: { media_url: mediaUrl } },
    ),
  },

  security: {
    changePassword: (currentPassword: string, newPassword: string) => fromApiOrMock<{ message: string }>(
      "/user-settings/change-password", { message: "Password changed successfully." },
      { method: "POST", body: { current_password: currentPassword, new_password: newPassword } },
    ),
    setupTwoFa: (method: "totp" | "email") => fromApiOrMock<TwoFaSetupInfo>(
      "/auth/2fa/setup", {} as TwoFaSetupInfo, { method: "POST", body: { method } },
    ),
    confirmTwoFa: (code: string) => fromApiOrMock<void>(
      "/auth/2fa/confirm", undefined, { method: "POST", body: { code } },
    ),
    disableTwoFa: (password: string) => fromApiOrMock<void>(
      "/auth/2fa/disable", undefined, { method: "POST", body: { password } },
    ),
    listSessions: () => fromApiOrMock<SecuritySessionListResponse>("/auth/sessions", { items: [] }),
    revokeSession: (sessionId: string) => fromApiOrMock<void>(
      `/auth/sessions/${encodeURIComponent(sessionId)}`, undefined, { method: "DELETE" },
    ),
  },

  notifications: {
    list: (params: { unreadOnly?: boolean; offset?: number; limit?: number } = {}) => {
      const query = new URLSearchParams({
        unread_only: String(params.unreadOnly ?? false),
        offset: String(params.offset ?? 0),
        limit: String(params.limit ?? 50),
      });
      return fromApiOrMock<NotificationListResponse>(
        `/notifications?${query.toString()}`,
        { items: [], total: 0, unreadCount: 0, offset: params.offset ?? 0, limit: params.limit ?? 50 },
      );
    },
    unreadCount: () => fromApiOrMock<UnreadCountResponse>("/notifications/unread-count", { unreadCount: 0 }),
    markRead: (notificationId: string) => fromApiOrMock<{ notificationId: string; isRead: boolean; message: string }>(
      `/notifications/${notificationId}/read`, { notificationId, isRead: true, message: "" }, { method: "PATCH" },
    ),
    markAllRead: () => fromApiOrMock<{ markedCount: number; message: string }>(
      "/notifications/read-all", { markedCount: 0, message: "" }, { method: "PATCH" },
    ),
    remove: (notificationId: string) => fromApiOrMock<void>(
      `/notifications/${notificationId}`, undefined, { method: "DELETE" },
    ),
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
      fromApiOrMock("/support/tickets", { accepted: true }, { method: "POST", body: payload }),
  },
};    
