// path: types/api.ts

export interface ApiErrorBody {
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  detail?: string | FastApiValidationItem[];
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  profileImage?: string;
  phone?: string;
  location?: string;
  website?: string;
  bio?: string;
}
export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  managerId: string | null;
  createdBy: string;
}

export interface BranchInvitee {
  userId?: string | number;
  name?: string;
  email: string;
}

export interface UserSearchResult {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
}

export interface DirectoryUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  country?: string;
  state?: string;
  status?: string;
  branchId?: string;
  branchName?: string;
  departmentId?: string;
  departmentName?: string;
  role?: string;
  joinedAt: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export interface Member {
  id: string | number;
  name: string;
  email: string;
  department: string;
  status: string;
  avatar?: string;
  branch: string;
  role: string;
}

export interface Department {
  id: string | number;
  name: string;
  members: number;
  activities: number;
  rank: number;
  branch: string;
  avatars: string[];
}

export interface WellnessEvent {
  id: string | number;
  title: string;
  date: string;
  time: string;
  participants: number;
  status: string;
  branch: string;
  image: string;
}

export interface Challenge {
  id: string | number;
  branchId?: string | null;
  title: string;
  category: string;
  status: string;
  participants: number;
  daysLeft: number;
  progress: number;
  branch: string;
  image: string;
  description: string;
}

export interface LeaderboardMember {
  id: string | number;
  name: string;
  role: string;
  steps: number;
  rank: number;
  trend: "up" | "down" | "flat";
  branch: string;
  avatar?: string;
}

export interface ParticipantOption {
  id: string;
  name: string;
  type: "department" | "user";
  icon?: string;
  avatar?: string;
  branch: string;
}

export interface DashboardBootstrap {
  user: UserProfile;
  branches: Branch[];
  activeBranch: string;
  members: Member[];
  departments: Department[];
  events: WellnessEvent[];
  challenges: Challenge[];
  leaderboard: LeaderboardMember[];
  participantOptions: ParticipantOption[];
}

export interface ResourceMutation {
  resource: string;
  action: string;
  id?: string | number;
  payload?: unknown;
}

export interface AvailabilityResponse {
  available: boolean;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface InviteRegistrationResponse {
  message: string;
  role: string;
  requiresApp: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface TwoFaChallengeResponse {
  requires2fa: true;
  twoFaMethod: "totp" | "email" | "sms";
  twoFaChallengeToken: string;
}

export type LoginResponse = AuthTokenResponse | TwoFaChallengeResponse;

export interface FastApiValidationItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}


export interface PermissionGrant {
  name: string;
  branchId: string | null;
}

export interface CurrentUserResponse {
  userId: string;
  phoneNumber?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  branchId: string;
  departmentId: string;
  permissions: PermissionGrant[];
  avatarUrl?: string;
  twoFaEnabled: boolean;
  twoFaMethod?: string;
}
export interface StatTrend {
  current: number;
  previous: number | null;
  changePct: number | null;
}
export interface OrgStatsResponse {
  totalUsers: number;
  usersTrend: StatTrend;
  totalBranches: number;
  branchesTrend: StatTrend;
  totalDepartments: number;
  departmentsTrend: StatTrend;
  totalClubs: number;
  clubsTrend: StatTrend;
  totalEvents: number;
  eventsTrend: StatTrend;
  totalChallenges: number;
  challengesTrend: StatTrend;
  activeChallenges: number;
  totalPosts: number;
  postsTrend: StatTrend;
}
export interface ActivitySummaryResponse {
  totalCount: number;
  byType: Array<{ activityType: string; count: number }>;
}
export type ChallengeStatus = "upcoming" | "active" | "completed" | "cancelled" | "archived";

export interface WellbeingChallenge {
  id: string;
  name: string;
}

export interface WellbeingChallengeListResponse {
  items: WellbeingChallenge[];
}
export interface ChallengeItem {
  id: string;
  organizationId: string;
  branchId: string | null;
  wellbeingChallengeId: string | null;
  name: string;
  description: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  status: string;
  metricType: string;
  targetType: string;
  targetValue: string;
  createdBy: string;
  createdAt: string;
  participantCount: number;
  completionRate: number | null;
}

export interface ChallengeStatsResponse {
  activeChallenges: number;
  totalParticipants: number;
  completionRate: number;
}
export interface ChallengeListResponse {
  items: ChallengeItem[];
  total: number;
  offset: number;
  limit: number;
}

export interface ChallengeParticipant {
  userId: string;
  firstName: string;
  lastName: string;
  rank: number;
  completedAt: string | null;
  joinedAt: string;
}

export interface ChallengeParticipantListResponse {
  items: ChallengeParticipant[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateChallengePayload {
  branchId?: string;
  wellbeingChallengeId?: string;
  name: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  metricType: string;
  targetType: string;
  targetValue: number;
}

export interface UpdateChallengePayload {
  name?: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  metricType?: string;
  targetType?: string;
  targetValue?: number;
  status?: string;
}

export interface JoinChallengeResponse {
  challengeId: string;
  userId: string;
  message: string;
}


export interface TrendData { current: number; previous: number; changePct: number; }
export interface ChallengeStatsResponse {
  activeChallenges: number;
  activeChallengesTrend: TrendData | null;
  totalParticipants: number;
  totalParticipantsTrend: TrendData | null;
  completionRate: number;
  completionRateTrend: TrendData | null;
}

export type ChallengeStatsPeriod = "week" | "month" | "six_months" | "custom";


export interface PulseQuestionResult {
  percent: number | null;
  status: string | null; // "Priority focus" | "Needs attention" | "Doing well" | null
}

export interface LivePulseResponse {
  windowId: string;
  respondentCount: number;
  stressManageability: PulseQuestionResult;
  energyRecovery: PulseQuestionResult;
  connectionBelonging: PulseQuestionResult;
  workloadSustainability: PulseQuestionResult;
  workplaceComfort: PulseQuestionResult;
  prioritySupportPct: number | null;
  needsAttentionPct: number | null;
  doingWellPct: number | null;
}


export type ClubCategory =
  | "fitness"
  | "creativity"
  | "team_bonding"
  | "mental_health"
  | "nutrition";

export const CLUB_CATEGORIES: { value: ClubCategory; label: string }[] = [
  { value: "fitness", label: "Fitness" },
  { value: "creativity", label: "Creativity" },
  { value: "team_bonding", label: "Team Bonding" },
  { value: "mental_health", label: "Mental Health" },
  { value: "nutrition", label: "Nutrition" },
];

export interface Club {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  privacy: "public" | "private";
  organizationId: string;
  branchId: string;
  category: ClubCategory;
  memberCount: number;
  createdBy: string | null;
  leaderId: string | null;
  isMember: boolean;
}

export interface CreateClubPayload {
  name: string;
  description: string;
  imageUrl?: string;
  privacy: "public" | "private";
  category: ClubCategory;
}

export interface UpdateClubPayload {
  name?: string;
  description?: string;
  imageUrl?: string;
  privacy?: "public" | "private";
  category?: ClubCategory;
}

export interface ClubListResponse {
  items: Club[];
  total: number;
  offset: number;
  limit: number;
}


export interface Post {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string | null;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  items: Post[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreatePostPayload {
  branchId?: string | null;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface CommentReply {
  id: string;
  postId: string;
  userId: string;
  content: string | null;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string | null;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  replies: CommentReply[];
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
  offset: number;
  limit: number;
}

export interface LikeActionResponse {
  postId: string;
  userId: string;
  liked: boolean;
  likeCount: number;
  message: string;
}

export interface Story {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string | null;
  mediaUrl: string;
  mediaType: string;
  expiresAt: string;
  createdAt: string;
}

export interface StoryListResponse {
  items: Story[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateStoryPayload {
  branchId?: string | null;
  mediaUrl: string;
  mediaType: string;
}


export interface OrganizationMemberInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  roleId: string | null;
  roleName?: string | null;
  organizationRoleId?: string | null;
  organizationRoleName?: string | null;
  branchRoles?: Array<{ branchId: string; roleId: string; roleName: string }>;
  branchId: string | null;
  departmentId?: string | null;
  publicProfile?: boolean;
}
export interface OrganizationMembersListResponse {
  items: OrganizationMemberInfo[]; total: number; offset: number; limit: number;
}
export interface OrganizationInviteItem {
  inviteId: string;
  invitedEmail: string;
  organizationId: string;
  branchId: string | null;
  invitedDepartmentId: string;
  invitedRoleId: string;
  invitedBy: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
}
export interface OrganizationInviteListResponse {
  items: OrganizationInviteItem[];
  total: number;
  offset: number;
  limit: number;
}

export interface DepartmentItem {
  id: string;
  name: string;
  description: string | null;
  avatarInitial: string | null;
  organizationId: string;
  branchId: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface DepartmentListResponse {
  items: DepartmentItem[]; total: number; offset: number; limit: number;
}
export interface DepartmentRankItem {
  departmentId: string; departmentName: string; branchId: string;
  rank: number | null; totalActivities: number | null;
  avgDailySteps: string | null; performanceScore: string | null;
  periodStart: string | null; periodEnd: string | null;
}
export interface DepartmentRankListResponse { items: DepartmentRankItem[]; }

export interface EventItem {
  id: string; title: string; description: string | null; imageUrl: string | null;
  startDate: string; endDate: string | null; recurrenceRule: string | null; time: string;
  status: string; organizationId: string; branchId: string; createdBy: string | null;
  participantCount: number;
}
export interface EventListResponse { items: EventItem[]; total: number; offset: number; limit: number; }
export interface EventParticipantInfo {
  userId: string; firstName: string; lastName: string; email: string;
  status: string | null; attended: boolean; invitedAt: string | null;
}
export interface EventParticipantsListResponse {
  items: EventParticipantInfo[]; total: number; offset: number; limit: number;
}

export interface ClubMemberInfo {
  id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null; status: string;
}
export interface ClubMembersListResponse {
  items: ClubMemberInfo[]; total: number; offset: number; limit: number;
}

export interface LeaderboardEntry {
  userId: string; firstName: string; lastName: string; value: number;
  rank: number; previousRank: number | null; orgRank: number; previousOrgRank: number | null;
  avatarUrl?: string | null;
}
export interface LeaderboardResponse {
  metricType: string; periodType: string; periodStart: string; periodEnd: string;
  scope: "branch" | "org"; items: LeaderboardEntry[];
}

export interface ChatMessageItem {
  id: string; organizationId: string; conversationType: string; conversationId: string;
  userId: string; content: string | null; mediaUrl: string | null; mediaType: string | null;
  isPinned: boolean; pinnedBy: string | null; pinnedAt: string | null; createdAt: string;
}
export type MessageResponse = ChatMessageItem;
export interface MessageListResponse { items: MessageResponse[]; total: number; offset: number; limit: number; }
export interface PinActionResponse { messageId: string; isPinned: boolean; message: string; }

export interface TrendingHashtagItem {
  tagName: string;
  totalPostCount: number;
  trendScore: string;
  windowEnd: string;
}
export interface TrendingHashtagListResponse {
  items: TrendingHashtagItem[];
}
export interface HashtagPostListResponse {
  items: Post[];
  total: number;
  offset: number;
  limit: number;
}

export interface ActivityTrendPoint {
  period: string;
  value: string;
}
export interface ActivityTrendResponse {
  metricType: string;
  granularity: string;
  points: ActivityTrendPoint[];
}
export type EngagementWellbeingTrendPeriod = "week" | "month" | "three_months";
export interface EngagementWellbeingTrendPoint {
  date: string;
  stressLevel: number | null;
  energyLevel: number | null;
  socialInteraction: number | null;
  productivity: number | null;
}
export interface EngagementWellbeingTrendsResponse {
  period: EngagementWellbeingTrendPeriod;
  startDate: string;
  endDate: string;
  points: EngagementWellbeingTrendPoint[];
}
export type InsightsPeriod = "month" | "three_months" | "six_months" | "nine_months" | "year";
export interface KPIOverviewApiResponse {
  period: InsightsPeriod;
  scope: "branch" | "organization";
  branchId: string | null;
  summary: {
    averageDailySteps: { value: number | null; change: number | null };
    healthScore: { value: number | null; change: number | null };
    activeEmployees: { value: number | null; change: number | null };
    challengesWon: { value: number | null; change: number | null };
  };
  monthlySteps: Array<{ name: string; actual: number | null; target: number | null }>;
  healthDistribution: Array<{ name: string; value: number; color: string }>;
  departmentPerformance: Array<{ name: string; branchName: string | null; engagement: number }>;
  weeklyActivity: Array<{ name: string; steps: number | null }>;
  topPerformers: Array<{
    userId: string; firstName: string; lastName: string; avatarUrl: string | null;
    steps: number; score: number; rank: number;
  }>;
}
export interface InsightsOverviewResponse {
  summary: {
    averageDailySteps: string;
    averageDailyStepsTrend: string;
    healthScore: string;
    healthScoreTrend: string;
    activeEmployees: string;
    activeEmployeesTrend: string;
    challengesWon: string;
    challengesWonTrend: string;
  };
  topPerformers: Array<{
    id: string | number;
    name: string;
    steps: string;
    score: number;
    avatar: string;
  }>;
  charts: {
    monthlySteps?: Array<{ name: string; actual: number; target: number }>;
    healthDistribution?: Array<{ name: string; value: number; color: string }>;
    departmentPerformance?: Array<{ name: string; branchName?: string | null; engagement: number }>;
    weeklyActivity?: Array<{ name: string; steps: number }>;
  };
}
export interface LikesGivenCountResponse {
  count: number;
}

export interface DepartmentMemberInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  status: string;
}

export interface DepartmentMembersListResponse {
  items: DepartmentMemberInfo[];
  total: number;
  offset: number;
  limit: number;
}

export interface NotificationItem {
  id: string; organizationId: string | null; actorId: string | null;
  notificationType: string; referenceId: string | null; referenceType: string | null;
  body: string; imageUrl: string | null; isRead: boolean;
  readAt: string | null; createdAt: string;
}
export interface NotificationListResponse {
  items: NotificationItem[]; total: number; unreadCount: number; offset: number; limit: number;
}
export interface UnreadCountResponse { unreadCount: number; }
export interface RoleItem { id: string; name: string; description: string | null; branchId?: string | null; isSystem?: boolean; isDefault?: boolean; userCount?: number; permissions?: string[]; permissionScopes?: Record<string, "org" | "branch">; }
export interface SystemRolesResponse { items: RoleItem[]; total: number; }
export interface PermissionCatalogueItem { id: string; name: string; description: string | null; category: string | null; scope: "org" | "branch" | "both"; }
export interface PermissionCatalogueResponse { items: PermissionCatalogueItem[]; total: number; }
export interface UserPermissionDetail {
  permissionName: string; category: string | null; catalogueScope: "org" | "branch" | "both";
  grantScope: "org_wide" | "branch"; branchId: string | null; grantedBy: string | null; grantedAt: string | null;
}
export interface UserPermissionsResponse { userId: string; organizationId: string; total: number; permissions: UserPermissionDetail[]; }
export interface UserPreferences {
  emailNotifications: boolean; pushNotifications: boolean; challengeReminders: boolean;
  publicProfile: boolean; showActivity: boolean; theme: "light" | "dark";
}
export interface SendInviteResponse {
  inviteId: string; invitedEmail: string; organizationId: string; branchId: string;
  invitedDepartmentId: string; invitedRoleId: string; status: string; expiresAt: string;
}

export interface SubscriptionPlanItem {
  id: string; name: string; billingInterval: "monthly" | "annual";
  amount: number; currency: string; features: Record<string, unknown>;
}
export interface SubscriptionPlanListResponse { items: SubscriptionPlanItem[]; }
export interface OrganizationSubscriptionInfo {
  id: string; planId: string; status: "trialing" | "active" | "past_due" | "cancelled";
  autoRenew: boolean; currentPeriodStart: string; currentPeriodEnd: string;
  trialEndsAt: string | null; cancelledAt: string | null;
}
export interface PaymentTransactionItem {
  id: string; amount: number; currency: string; status: "pending" | "succeeded" | "failed" | "refunded" | "cancelled";
  paymentMethod: string | null; createdAt: string; externalReference: string;
}
export interface PaymentTransactionListResponse { items: PaymentTransactionItem[]; total: number; offset: number; limit: number; }
export interface CheckoutResponse { authorizationUrl: string; reference: string; accessCode: string | null; }
export interface PaymentVerificationResponse { transaction: PaymentTransactionItem; providerStatus: string; reconciled: boolean; }
export interface ProfileSettingsInfo {
  id: string; firstName: string; lastName: string; email: string;
  avatarUrl: string | null; country: string | null; state: string | null;
}
export interface TwoFaSetupInfo { method: "totp" | "email" | "sms"; totpSecret: string | null; totpUri: string | null; }
export interface SecuritySessionItem {
  id: string; deviceName: string | null; ipAddress: string | null;
  locationLabel: string | null; lastSeenAt: string; createdAt: string; isCurrent: boolean;
}
export interface SecuritySessionListResponse { items: SecuritySessionItem[]; }
