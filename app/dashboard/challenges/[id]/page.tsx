"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronLeft, 
  Edit2, 
  Trash2, 
  Users, 
  Calendar, 
  Send,
  Plus,
  X,
  Check,
  Search,
  Trophy,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";

const MOCK_PARTICIPANTS = [
  { id: 1, name: "Brian Kim", role: "Designer", department: "Engineering", avatar: "https://picsum.photos/seed/brian/100/100" },
  { id: 2, name: "Catherine Chen", role: "Marketer", department: "Sales", avatar: "https://picsum.photos/seed/catherine/100/100" },
  { id: 3, name: "David Smith", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/david/100/100" },
  { id: 4, name: "Ella Johnson", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/ella/100/100" },
  { id: 5, name: "Frank Wilson", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/frank/100/100" },
];

const MOCK_MESSAGES = [
  { 
    id: 1, 
    user: "Alex Carter", 
    role: "UX Researcher", 
    time: "13 Feb, 9:15am", 
    content: "How's everyone doing with the step challenge?", 
    avatar: "https://picsum.photos/seed/alex/100/100" 
  },
  { 
    id: 2, 
    user: "Jamie Lee", 
    role: "Frontend Developer", 
    time: "13 Feb, 11:45am", 
    content: "Just hit 8k steps! Almost at the daily goal.", 
    avatar: "https://picsum.photos/seed/jamie/100/100" 
  },
];

export default function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { members: INITIAL_MEMBERS, user } = useDashboardData();
  const [id, setId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [challengeData, setChallengeData] = useState<Record<string, unknown> | null>(null);
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id);
      const [loadedChallenge, loadedMessages, loadedParticipants] = await Promise.all([
        api.resources.get<Record<string, unknown>>("challenges", p.id, {}),
        api.resources.list("challenges/messages", MOCK_MESSAGES, `challengeId=${encodeURIComponent(p.id)}`),
        api.resources.list("challenges/participants", MOCK_PARTICIPANTS, `challengeId=${encodeURIComponent(p.id)}`),
      ]);
      setChallengeData(loadedChallenge);
      setMessages(loadedMessages);
      setParticipants(loadedParticipants);
    });
  }, [params]);

  // Mock data for the challenge
  const fallbackChallenge = {
    id: id,
    name: id === "1" ? "Step Up for Health" : 
          id === "2" ? "Green Fitness Initiative" : 
          id === "3" ? "Healthy Habits Month" : "Mindful Movement Week",
    description: "Join us for a month-long challenge to improve our daily step counts and overall cardiovascular health. Track your steps daily and compete with colleagues for the top spot on the leaderboard!",
    status: id === "3" ? "Upcoming" : "Active",
    startDate: "Oct 1, 2023",
    endDate: "Oct 31, 2023",
    participants: 124,
    goal: "10,000 steps/day",
    reward: "Fitness Tracker & $50 Gift Card",
    progress: 65,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&h=600&auto=format&fit=crop",
    leaderboard: [
      { rank: 1, name: "Sarah Jenkins", score: "285,000 steps", avatar: "https://picsum.photos/seed/sarah/100/100" },
      { rank: 2, name: "Michael Chen", score: "272,500 steps", avatar: "https://picsum.photos/seed/michael/100/100" },
      { rank: 3, name: "Emily Rodriguez", score: "268,000 steps", avatar: "https://picsum.photos/seed/emily/100/100" },
      { rank: 4, name: "David Kim", score: "254,000 steps", avatar: "https://picsum.photos/seed/david/100/100" },
      { rank: 5, name: "Jessica Taylor", score: "249,000 steps", avatar: "https://picsum.photos/seed/jessica/100/100" },
    ]
  };
  const challenge = {...fallbackChallenge, ...challengeData} as typeof fallbackChallenge;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: `${user.firstName} ${user.lastName}`,
      role: "Admin",
      time: "Just now",
      content: message,
      avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg"
    };

    await api.resources.mutate({ resource: "challenges/messages", action: "create", id: id ?? undefined, payload: newMessage });
    setMessages([...messages, newMessage]);
    setMessage("");
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const filteredEmployees = INITIAL_MEMBERS.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSendInvites = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee to invite");
      return;
    }
    await api.resources.mutate({ resource: "challenges", action: "invite", id: id ?? undefined, payload: { memberIds: selectedEmployees } });
    toast.success(`Invites sent to ${selectedEmployees.length} employees!`);
    setIsInviteModalOpen(false);
    setSelectedEmployees([]);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Back Link */}
      <Link 
        href="/dashboard/challenges" 
        className="flex items-center gap-2 text-sm text-grey-2 hover:text-grey-1 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Go back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Challenge Card */}
          <div className="bg-white rounded-[12px] border border-grey-4 overflow-hidden">
            <div className="relative h-[300px] w-full">
              <Image 
                src={challenge.image} 
                alt={challenge.name} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                  challenge.status === 'Active' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {challenge.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-grey-1">{challenge.name}</h1>
                  <p className="text-sm text-grey-2 mt-2 leading-relaxed">{challenge.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-primary-1 hover:border-primary-1 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-red-500 hover:border-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-grey-5 rounded-xl border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1">{challenge.startDate} - {challenge.endDate}</p>
                </div>
                <div className="p-4 bg-grey-5 rounded-xl border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Goal</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1">{challenge.goal}</p>
                </div>
                <div className="p-4 bg-grey-5 rounded-xl border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Participants</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1">{challenge.participants}</p>
                </div>
                <div className="p-4 bg-grey-5 rounded-xl border border-grey-4">
                  <div className="flex items-center gap-2 text-grey-3 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Reward</span>
                  </div>
                  <p className="text-xs font-bold text-grey-1">{challenge.reward}</p>
                </div>
              </div>

              <div className="p-6 bg-primary-1/5 rounded-[12px] border border-primary-1/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-grey-1">Your Progress</h2>
                  <span className="text-sm font-bold text-primary-1">{challenge.progress}% Complete</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden mb-4 border border-primary-1/10">
                  <div 
                    className="h-full bg-primary-1 rounded-full" 
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
                <p className="text-xs text-grey-2 text-center">
                  You&apos;ve completed 20 days out of 31. Keep it up!
                </p>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-[12px] border border-grey-4 flex flex-col h-[500px]">
            <div className="p-4 border-b border-grey-4 flex items-center justify-between">
              <h2 className="font-bold text-grey-1">Challenge Chat</h2>
              <div className="flex items-center gap-1 text-xs text-grey-3">
                <Users className="w-3 h-3" />
                {challenge.participants} members
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative">
                    <Image src={msg.avatar} alt={msg.user} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-grey-1">{msg.user}</span>
                      <span className="text-xs text-grey-3">› {msg.time}</span>
                    </div>
                    <p className="text-xs text-grey-2">{msg.role}</p>
                    <div className="mt-2 p-3 bg-grey-5/50 rounded-[0_16px_16px_0] border-l-2 border-primary-1">
                      <p className="text-sm text-grey-1 leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-grey-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-11 px-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 bg-grey-5/30"
                />
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="w-11 h-11 bg-primary-1 text-white rounded-xl flex items-center justify-center hover:bg-primary-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="bg-white rounded-[12px] border border-grey-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-grey-1">Participants</h2>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="text-xs font-bold text-primary-1 hover:text-primary-2 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Invite Employee
              </button>
            </div>

            <div className="space-y-4">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    <Image src={participant.avatar} alt={participant.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-grey-1">{participant.name}</p>
                    <p className="text-xs text-grey-2">{participant.role} | {participant.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-[12px] border border-grey-4 p-6">
            <h2 className="font-bold text-grey-1 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </h2>
            <div className="space-y-4">
              {challenge.leaderboard.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-grey-5 transition-colors border border-transparent hover:border-grey-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-200 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-grey-5 text-grey-2'
                    }`}>
                      {user.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    </div>
                    <span className="text-sm font-medium text-grey-1">{user.name}</span>
                  </div>
                  <span className="text-xs font-bold text-primary-1">{user.score}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 border border-grey-4 rounded-xl text-xs font-bold text-grey-2 hover:bg-grey-5 transition-colors">
              View Full Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-grey-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-grey-1">Invite Employees</h3>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-2 hover:bg-grey-5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-grey-2" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
                  <input 
                    type="text" 
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 no-scrollbar">
                  {filteredEmployees.map((emp) => (
                    <div 
                      key={emp.id}
                      onClick={() => toggleEmployeeSelection(emp.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedEmployees.includes(emp.id)
                          ? "border-primary-1 bg-primary-1/5"
                          : "border-grey-4 hover:border-grey-3"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <Image src={emp.avatar} alt={emp.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-grey-1">{emp.name}</p>
                          <p className="text-xs text-grey-2">{emp.department}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        selectedEmployees.includes(emp.id)
                          ? "bg-primary-1 border-primary-1 text-white"
                          : "border-grey-4"
                      }`}>
                        {selectedEmployees.includes(emp.id) && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-grey-5/50 border-t border-grey-4 flex items-center justify-between">
                <span className="text-sm text-grey-2">
                  {selectedEmployees.length} selected
                </span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-grey-2 hover:text-grey-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendInvites}
                    className="px-6 py-2 bg-primary-1 text-white rounded-xl text-sm font-bold hover:bg-primary-2 transition-colors"
                  >
                    Send Invites
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
