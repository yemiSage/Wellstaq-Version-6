export const INITIAL_MEMBERS = [
  { id: 1, name: "Sarah Jenkins", email: "sarah.j@example.com", department: "Engineering", status: "Excellent", avatar: "https://picsum.photos/seed/sarah/100/100", branch: "Yemi Inc lokoja", role: "Super Admin" },
  { id: 2, name: "Marcus Thorne", email: "marcus.t@example.com", department: "Design", status: "Good", avatar: "https://picsum.photos/seed/marcus/100/100", branch: "Yemi Inc lokoja", role: "Branch Manager" },
  { id: 3, name: "Elena Rodriguez", email: "elena.r@example.com", department: "Marketing", status: "Needs Attention", avatar: "https://picsum.photos/seed/elena/100/100", branch: "Lagos Branch", role: "Team Lead" },
  { id: 4, name: "David Chen", email: "david.c@example.com", department: "Engineering", status: "Excellent", avatar: "https://picsum.photos/seed/david/100/100", branch: "Yemi Inc lokoja", role: "Employee" },
  { id: 5, name: "Amira Hassan", email: "amira.h@example.com", department: "Sales", status: "Good", avatar: "https://picsum.photos/seed/amira/100/100", branch: "Abuja Branch", role: "Employee" },
  { id: 6, name: "James Wilson", email: "james.w@example.com", department: "HR", status: "Excellent", avatar: "https://picsum.photos/seed/james/100/100", branch: "Yemi Inc lokoja", role: "Team Lead" },
  { id: 7, name: "Lisa Taylor", email: "lisa.t@example.com", department: "Design", status: "Good", avatar: "https://picsum.photos/seed/lisa/100/100", branch: "Lagos Branch", role: "Employee" },
  { id: 8, name: "Robert Fox", email: "robert.f@example.com", department: "Engineering", status: "Needs Attention", avatar: "https://picsum.photos/seed/robert/100/100", branch: "Abuja Branch", role: "Employee" },
  { id: 9, name: "Kevin Hart", email: "kevin.h@example.com", department: "Marketing", status: "Good", avatar: "https://picsum.photos/seed/kevin/100/100", branch: "Lagos Branch", role: "Employee" },
  { id: 10, name: "Rachel Green", email: "rachel.g@example.com", department: "Design", status: "Excellent", avatar: "https://picsum.photos/seed/rachel/100/100", branch: "Yemi Inc lokoja", role: "Employee" },
  { id: 11, name: "Michael Scott", email: "michael.s@example.com", department: "Sales", status: "Good", avatar: "https://picsum.photos/seed/michael/100/100", branch: "Abuja Branch", role: "Branch Manager" },
  { id: 12, name: "Pam Beesly", email: "pam.b@example.com", department: "Design", status: "Excellent", avatar: "https://picsum.photos/seed/pam/100/100", branch: "Abuja Branch", role: "Employee" },
];

export const MOCK_DEPARTMENTS = [
  { id: 1, name: "Mongo Warriors", members: 4, activities: 342, rank: 1, branch: "Yemi Inc lokoja", avatars: ["https://picsum.photos/seed/1/100/100", "https://picsum.photos/seed/2/100/100"] },
  { id: 2, name: "Tabakrr boys", members: 4, activities: 278, rank: 2, branch: "Yemi Inc lokoja", avatars: ["https://picsum.photos/seed/3/100/100", "https://picsum.photos/seed/4/100/100"] },
  { id: 3, name: "Lagos Runners", members: 5, activities: 150, rank: 3, branch: "Lagos Branch", avatars: ["https://picsum.photos/seed/5/100/100"] },
  { id: 4, name: "Abuja Hikers", members: 3, activities: 120, rank: 4, branch: "Abuja Branch", avatars: ["https://picsum.photos/seed/6/100/100"] },
  { id: 5, name: "Lagos Techies", members: 4, activities: 210, rank: 5, branch: "Lagos Branch", avatars: ["https://picsum.photos/seed/7/100/100"] },
  { id: 6, name: "Abuja Yogis", members: 2, activities: 95, rank: 6, branch: "Abuja Branch", avatars: ["https://picsum.photos/seed/8/100/100"] },
];

export const EVENTS = [
  {
    id: 1,
    title: "Morning yoga and Breathwork",
    date: "every monday",
    time: "2:00pm",
    participants: 23,
    status: "Upcoming",
    branch: "Yemi Inc lokoja",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&h=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Team Building Hike",
    date: "2024-04-15",
    time: "9:00am",
    participants: 45,
    status: "Upcoming",
    branch: "Yemi Inc lokoja",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&h=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Nutrition Workshop",
    date: "2024-04-20",
    time: "1:00pm",
    participants: 30,
    status: "Upcoming",
    branch: "Lagos Branch",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&h=600&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Beach Run",
    date: "2024-04-25",
    time: "6:00am",
    participants: 50,
    status: "Upcoming",
    branch: "Lagos Branch",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&h=600&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Abuja City Walk",
    date: "2024-05-01",
    time: "7:00am",
    participants: 40,
    status: "Upcoming",
    branch: "Abuja Branch",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&h=600&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Mental Health Seminar",
    date: "2024-05-10",
    time: "10:00am",
    participants: 100,
    status: "Upcoming",
    branch: "Abuja Branch",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&h=600&auto=format&fit=crop"
  }
];

export const CHALLENGES = [
  {
    id: 1,
    title: "10k Steps a Day",
    category: "Physical",
    status: "Active",
    participants: 124,
    daysLeft: 14,
    progress: 45,
    branch: "Yemi Inc lokoja",
    image: "https://images.unsplash.com/photo-1552674605-15c37127ec8d?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Hit 10,000 steps every day for a month to improve cardiovascular health and build a consistent walking habit."
  },
  {
    id: 2,
    title: "Mindful Mornings",
    category: "Mental",
    status: "Starting Soon",
    participants: 86,
    daysLeft: 30,
    progress: 0,
    branch: "Yemi Inc lokoja",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Dedicate 10 minutes each morning to meditation or deep breathing exercises before starting your workday."
  },
  {
    id: 3,
    title: "Hydration Hero",
    category: "Nutrition",
    status: "Active",
    participants: 210,
    daysLeft: 5,
    progress: 82,
    branch: "Lagos Branch",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Drink at least 8 glasses (2 liters) of water daily to stay hydrated and maintain optimal energy levels."
  },
  {
    id: 4,
    title: "Screen-Free Evenings",
    category: "Mental",
    status: "Completed",
    participants: 156,
    daysLeft: 0,
    progress: 100,
    branch: "Lagos Branch",
    image: "https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Disconnect from all digital screens 2 hours before bedtime to improve sleep quality and reduce eye strain."
  },
  {
    id: 5,
    title: "Healthy Recipe Swap",
    category: "Nutrition",
    status: "Active",
    participants: 92,
    daysLeft: 21,
    progress: 30,
    branch: "Abuja Branch",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Cook and share one new healthy recipe with the community each week."
  },
  {
    id: 6,
    title: "Desk Stretches",
    category: "Physical",
    status: "Active",
    participants: 178,
    daysLeft: 10,
    progress: 65,
    branch: "Abuja Branch",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Perform a 5-minute stretching routine at your desk twice a day to reduce muscle tension and improve posture."
  }
];

export const MOCK_MEMBERS = [
  { id: 1, name: "Toby Forge", role: "Designer | Engineering", steps: 19875, rank: 1, trend: "up", branch: "Yemi Inc lokoja", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg" },
  { id: 2, name: "Luna Rivers", role: "Marketer | Sales", steps: 18450, rank: 2, trend: "down", branch: "Yemi Inc lokoja", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334554/diverse-young-people-holding-hands_z0tupa.jpg" },
  { id: 3, name: "Milo Sparks", role: "Manager | Operations", steps: 15030, rank: 3, trend: "down", branch: "Lagos Branch", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170726/wellstaq_onboarding_image_les0xq.png" },
  { id: 4, name: "Ava Quinn", role: "Developer | Engineering", steps: 14200, rank: 4, trend: "up", branch: "Yemi Inc lokoja", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg" },
  { id: 5, name: "Jasper Moon", role: "Designer | Engineering", steps: 12000, rank: 5, trend: "up", branch: "Abuja Branch", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334554/diverse-young-people-holding-hands_z0tupa.jpg" },
  { id: 6, name: "Ella Stone", role: "Marketer | Sales", steps: 11500, rank: 6, trend: "down", branch: "Lagos Branch", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170726/wellstaq_onboarding_image_les0xq.png" },
  { id: 7, name: "Finn Wilder", role: "Manager | Operations", steps: 10000, rank: 7, trend: "down", branch: "Abuja Branch", avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg" },
];

export const PARTICIPANT_OPTIONS = [
  { id: 'd1', name: 'Mongo Warriors', type: 'department', icon: 'Users', branch: "Yemi Inc lokoja" },
  { id: 'd2', name: 'Tabakrr boys', type: 'department', icon: 'Users', branch: "Yemi Inc lokoja" },
  { id: 'u1', name: 'Toby Forge', type: 'user', avatar: 'https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg', branch: "Yemi Inc lokoja" },
  { id: 'u2', name: 'Luna Rivers', type: 'user', avatar: 'https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334554/diverse-young-people-holding-hands_z0tupa.jpg', branch: "Yemi Inc lokoja" },
];
