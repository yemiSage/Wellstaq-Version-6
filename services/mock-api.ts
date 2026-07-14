import { CHALLENGES, EVENTS, INITIAL_MEMBERS, MOCK_DEPARTMENTS, MOCK_MEMBERS, PARTICIPANT_OPTIONS } from "@/lib/mock-data";
import type { DashboardBootstrap } from "@/types/api";

export const mockDashboardBootstrap: DashboardBootstrap = {
  user: {
    firstName: "Demo",
    lastName: "Admin",
    email: "admin@example.com",
    businessName: "Wellstaq Demo",
  },
  branches: [],
  activeBranch: "Yemi Inc lokoja",
  members: INITIAL_MEMBERS,
  departments: MOCK_DEPARTMENTS,
  events: EVENTS,
  challenges: CHALLENGES,
  leaderboard: MOCK_MEMBERS,
  participantOptions: PARTICIPANT_OPTIONS,
};
