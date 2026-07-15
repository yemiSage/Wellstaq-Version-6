import { CalendarCheck, MessageSquare, ShieldCheck, Trophy, UserPlus, Users } from "lucide-react";

export const notificationGroups = [
  {
    group: "System",
    description: "Security, sync, and workspace updates",
    icon: ShieldCheck,
    items: [
      { title: "Workspace backup complete", body: "Your Wellstaq data synced successfully across all branches.", time: "5m ago", unread: true },
      { title: "Security settings reviewed", body: "Admin permissions and branch access rules are up to date.", time: "1h ago", unread: false },
    ],
  },
  {
    group: "Team",
    description: "Member activity and admin requests",
    icon: Users,
    items: [
      { title: "Sarah Jenkins joined Engineering", body: "Sarah accepted the invite to your active branch.", time: "18m ago", unread: true },
      { title: "Marcus requested branch access", body: "Review the request before adding Marcus to Lagos Branch.", time: "2h ago", unread: true },
      { title: "New member profile completed", body: "Rachel Green finished onboarding and wellness preferences.", time: "Yesterday", unread: false },
    ],
  },
  {
    group: "Wellness",
    description: "Challenge, event, and engagement signals",
    icon: Trophy,
    items: [
      { title: "Mindful Mornings hit 80% participation", body: "Team engagement is trending above last week's average.", time: "Today", unread: true },
      { title: "Hydration Hero milestone reached", body: "92 employees logged progress for three consecutive days.", time: "Yesterday", unread: false },
    ],
  },
  {
    group: "Events",
    description: "Upcoming sessions and RSVPs",
    icon: CalendarCheck,
    items: [
      { title: "Morning yoga starts soon", body: "23 participants are confirmed for the next session.", time: "Tomorrow", unread: false },
      { title: "Nutrition Workshop needs a host", body: "Assign a facilitator before publishing final details.", time: "Friday", unread: false },
    ],
  },
];

export const messageThreads = [
  {
    id: "engineering",
    name: "Engineering Team",
    role: "Department channel",
    icon: MessageSquare,
    lastMessage: "David shared the weekly build readiness update.",
    unread: 3,
  },
  {
    id: "admins",
    name: "Branch Admins",
    role: "Admin-only",
    icon: ShieldCheck,
    lastMessage: "Marcus asked for the July wellness report.",
    unread: 1,
  },
  {
    id: "onboarding",
    name: "New Joiners",
    role: "Team support",
    icon: UserPlus,
    lastMessage: "Rachel completed her wellness profile.",
    unread: 0,
  },
];

export const conversationMessages = [
  { id: 1, sender: "Sarah Jenkins", time: "9:18 AM", text: "Can we move the breathwork challenge reminder to 10am?", mine: false },
  { id: 2, sender: "You", time: "9:22 AM", text: "Yes, that timing should work better for the Engineering team.", mine: true },
  { id: 3, sender: "Marcus Thorne", time: "9:31 AM", text: "I will update the Lagos branch calendar after standup.", mine: false },
];
