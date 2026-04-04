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
  Clock, 
  Send,
  MoreHorizontal,
  Plus,
  X,
  Check,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { INITIAL_MEMBERS } from "@/lib/mock-data";

const MOCK_EVENT = {
  id: 1,
  title: "Morning yoga and Breathwork",
  date: "every monday",
  time: "2:00pm",
  participants: 23,
  status: "Upcoming",
  image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&h=600&auto=format&fit=crop",
  description: "Join us for a rejuvenating morning yoga and breathwork session to start your week with clarity and energy.",
};

const MOCK_PARTICIPANTS = [
  { id: 1, name: "Brian Kim", role: "Designer", department: "Engineering", avatar: "https://picsum.photos/seed/brian/100/100" },
  { id: 2, name: "Catherine Chen", role: "Marketer", department: "Sales", avatar: "https://picsum.photos/seed/catherine/100/100" },
  { id: 3, name: "David Smith", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/david/100/100" },
  { id: 4, name: "Ella Johnson", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/ella/100/100" },
  { id: 5, name: "Frank Wilson", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/frank/100/100" },
  { id: 6, name: "Isabella Martinez", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/isabella/100/100" },
  { id: 7, name: "Jack Thompson", role: "Manager", department: "Operations", avatar: "https://picsum.photos/seed/jack/100/100" },
];

const MOCK_MESSAGES = [
  { 
    id: 1, 
    user: "Alex Carter", 
    role: "UX Researcher", 
    time: "13 Feb, 9:15am", 
    content: "Hi team, looking forward to our meeting!", 
    avatar: "https://picsum.photos/seed/alex/100/100" 
  },
  { 
    id: 2, 
    user: "Jamie Lee", 
    role: "Frontend Developer", 
    time: "13 Feb, 11:45am", 
    content: "Just finished the new feature, excited to show you all!", 
    avatar: "https://picsum.photos/seed/jamie/100/100" 
  },
  { 
    id: 3, 
    user: "Morgan Price", 
    role: "Project Manager", 
    time: "13 Feb, 1:30pm", 
    content: "In our upcoming sync, I think it would be great to dive into our timelines, especially as we align our schedules. Additionally, I'd love to incorporate a discussion about a yoga plan that could complement our workflow. Perhaps we can explore how integrating some yoga sessions into our routine can enhance our productivity and well-being. Let's brainstorm some ideas on how to fit this into our timelines!", 
    avatar: "https://picsum.photos/seed/morgan/100/100" 
  },
];

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: "Opeyemi Adegboye",
      role: "Admin",
      time: "Just now",
      content: message,
      avatar: "https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg"
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const filteredEmployees = INITIAL_MEMBERS.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSendInvites = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee to invite");
      return;
    }
    toast.success(`Invites sent to ${selectedEmployees.length} employees!`);
    setIsInviteModalOpen(false);
    setSelectedEmployees([]);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Back Link */}
      <Link 
        href="/dashboard/events" 
        className="flex items-center gap-2 text-sm text-grey-2 hover:text-grey-1 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Go back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Card */}
          <div className="bg-white rounded-2xl border border-grey-4 overflow-hidden">
            <div className="relative h-[300px] w-full">
              <Image 
                src={MOCK_EVENT.image} 
                alt={MOCK_EVENT.title} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-grey-1">{MOCK_EVENT.title}</h1>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-primary-1 hover:border-primary-1 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-red-500 hover:border-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-grey-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden relative">
                        <Image src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <span>{MOCK_EVENT.participants} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{MOCK_EVENT.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{MOCK_EVENT.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-2xl border border-grey-4 flex flex-col h-[600px]">
            <div className="p-4 border-b border-grey-4 flex items-center justify-between">
              <h2 className="font-bold text-grey-1">Chat</h2>
              <div className="flex items-center gap-1 text-xs text-grey-3">
                <Users className="w-3 h-3" />
                30 members
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
                    <div className="mt-2 p-3 bg-grey-5/50 rounded-2xl rounded-tl-none border-l-2 border-primary-1">
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
          <div className="bg-white rounded-2xl border border-grey-4 p-6">
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
              {MOCK_PARTICIPANTS.map((participant) => (
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
                          <p className="text-xs text-grey-2">{emp.role} • {emp.department}</p>
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
                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-grey-3">No employees found</p>
                    </div>
                  )}
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
