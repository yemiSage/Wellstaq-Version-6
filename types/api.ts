export type DataSource = "mock" | "api";

export interface ApiErrorBody {
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
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
  id?: string;
  name: string;
  invitees: BranchInvitee[];
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

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export type Member = (typeof import("@/lib/mock-data").INITIAL_MEMBERS)[number];
export type Department = (typeof import("@/lib/mock-data").MOCK_DEPARTMENTS)[number];
export type WellnessEvent = (typeof import("@/lib/mock-data").EVENTS)[number];
export type Challenge = (typeof import("@/lib/mock-data").CHALLENGES)[number];
export type LeaderboardMember = (typeof import("@/lib/mock-data").MOCK_MEMBERS)[number];
export type ParticipantOption = (typeof import("@/lib/mock-data").PARTICIPANT_OPTIONS)[number];

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
