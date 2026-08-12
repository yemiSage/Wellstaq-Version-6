"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, MessageSquare, Bell, Sparkles, ChevronDown, X, Menu, Plus, Settings2, ArrowUp, ArrowUpRight, LogOut, History, MessageCirclePlus, LoaderCircle, UserPlus } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useClickOutside } from "@/hooks/use-click-outside";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import type { BranchInvitee, NotificationItem, UserSearchResult } from "@/types/api";


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function truncateProfileText(value: string) {
  return value.length > 14 ? `${value.slice(0, 14)}...` : value;
}

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [branchModalStep, setBranchModalStep] = useState<"current" | "new">("current");
  const [currentBranchName, setCurrentBranchName] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [invitees, setInvitees] = useState<BranchInvitee[]>([]);
  const [userMatches, setUserMatches] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalUserMatches, setGlobalUserMatches] = useState<UserSearchResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [chatHistory] = useState<{ id: string, title: string, date: string }[]>([
    { id: "1", title: "Workout routine for today", date: "Today" },
    { id: "2", title: "Local wellness departments", date: "Yesterday" },
    { id: "3", title: "Feeling stressed lately", date: "Last week" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const branchSearchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user: userData, activeBranch, addBranch, nameCurrentBranch, members } = useDashboardData();

  const currentUserRole = members.find((member) => (member.email ?? "").toLowerCase() === (userData.email ?? "").toLowerCase() && member.branch === activeBranch)?.role;
  const isAdmin = !currentUserRole || ["Super Admin", "Branch Manager"].includes(currentUserRole) || userData.email.toLowerCase().includes("admin");
  const signedInUserName = `${userData.firstName} ${userData.lastName}`.trim();
  const navigationItems = [
    ["Overview", "/dashboard"], ["Teams", "/dashboard/teams"], ["Departments", "/dashboard/departments"],
    ["Events", "/dashboard/events"], ["Challenges", "/dashboard/challenges"], ["Clubs", "/dashboard/clubs"],
    ["Integrations", "/dashboard/integrations"], ["Settings", "/dashboard/settings"], ["Contact Support", "/dashboard/contact"],
  ] as const;
  const globalNavigationMatches = globalSearch.trim().length < 2 ? [] : navigationItems.filter(([label]) => label.toLowerCase().includes(globalSearch.trim().toLowerCase()));

  useEffect(() => {
    const query = globalSearch.trim();
    if (query.length < 2) return setGlobalUserMatches([]);
    let cancelled = false;
    const timer = setTimeout(() => void api.users.search(query).then((matches) => {
      if (!cancelled) setGlobalUserMatches(matches.slice(0, 5));
    }).catch(() => { if (!cancelled) setGlobalUserMatches([]); }), 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [globalSearch]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, isTyping]);

  useEffect(() => {
    let cancelled = false;
    api.notifications.list({ limit: 10 }).then((response) => {
      if (!cancelled) setNotifications(response.items);
    }).catch(() => { if (!cancelled) setNotifications([]); });
    return () => { cancelled = true; };
  }, []);

  const openNotification = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await api.notifications.markRead(notification.id);
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
    }
    setIsNotificationsOpen(false);
    if (notification.referenceType === "event" && notification.referenceId) router.push(`/dashboard/events/${notification.referenceId}`);
    else if (notification.referenceType === "challenge" && notification.referenceId) router.push(`/dashboard/challenges/${notification.referenceId}`);
  };

  useEffect(() => {
    const query = employeeQuery.trim();
    if (!isAddBranchModalOpen || branchModalStep !== "new" || query.length < 2) {
      setUserMatches([]);
      setIsSearchingUsers(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const matches = await api.users.search(query);
        if (!cancelled) {
          const selectedEmails = new Set(invitees.map((invitee) => invitee.email.toLowerCase()));
          setUserMatches(matches.filter((match) => !selectedEmails.has(match.email.toLowerCase())));
        }
      } finally {
        if (!cancelled) setIsSearchingUsers(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [branchModalStep, employeeQuery, invitees, isAddBranchModalOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await api.ai.chat(newMessages, activeBranch);
      const aiResponse = response.message;
      setMessages([...newMessages, { role: 'ai', content: aiResponse }]);
    } catch (e) {
      console.error("AI Chat Error:", e);
      const errorMessage = e instanceof Error ? e.message : "Sorry, I couldn't process that right now.";
      setMessages([...newMessages, { role: 'ai', content: errorMessage.includes("API Key") ? "AI service is currently unavailable. Please contact support to configure the API key." : "Sorry, I couldn't process that right now. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      toast.success("Logged out successfully");
    } catch {
      // Tokens are cleared locally regardless (see api.auth.logout's finally
      // block) — a failed server call shouldn't block the user from leaving.
      toast.success("Logged out successfully");
    } finally {
      setIsLogoutModalOpen(false);
      router.push("/login");
    }
  };
  const openBranchModal = () => {
    setBranchModalStep("new");
    setCurrentBranchName("");
    setNewBranchName("");
    setEmployeeQuery("");
    setInvitees([]);
    setUserMatches([]);
    setIsAddBranchModalOpen(true);
  };

  const closeBranchModal = () => {
    setIsAddBranchModalOpen(false);
    setBranchModalStep("current");
    setCurrentBranchName("");
    setNewBranchName("");
    setEmployeeQuery("");
    setInvitees([]);
    setUserMatches([]);
  };

  const handleNameCurrentBranch = async () => {
    const name = currentBranchName.trim();
    if (!name) {
      toast.error("Please enter the current branch name");
      return;
    }

    await nameCurrentBranch(name);
    setBranchModalStep("new");
  };

  const addInvitee = (invitee: BranchInvitee) => {
    if (invitees.some((item) => item.email.toLowerCase() === invitee.email.toLowerCase())) {
      toast.error("This employee has already been added");
      return;
    }

    setInvitees((current) => [...current, invitee]);
    setEmployeeQuery("");
    setUserMatches([]);
  };

  const addEmployeeQuery = () => {
    const email = employeeQuery.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      toast.error("Enter a valid email or select an existing user");
      return;
    }
    addInvitee({ email });
  };

  const handleAddBranch = async () => {
    const name = newBranchName.trim();
    if (!name) {
      toast.error("Please enter a branch name");
      return;
    }

    let branchInvitees = invitees;
    const pendingEmail = employeeQuery.trim().toLowerCase();
    if (pendingEmail) {
      if (!EMAIL_PATTERN.test(pendingEmail)) {
        toast.error("Enter a valid email or select an existing user");
        return;
      }
      if (!branchInvitees.some((item) => item.email.toLowerCase() === pendingEmail)) {
        branchInvitees = [...branchInvitees, { email: pendingEmail }];
      }
    }

    await addBranch({ name, invitees: branchInvitees });

    toast.success("Branch added successfully!");
    closeBranchModal();
  };

  const startNewChat = () => {
    setMessages([]);
    setShowHistory(false);
  };

  useClickOutside(profileRef, () => setIsProfileOpen(false));
  useClickOutside(notificationsRef, () => setIsNotificationsOpen(false));
  useClickOutside(branchSearchRef, () => setUserMatches([]));

  useEffect(() => {
    window.addEventListener("wellstaq:open-add-branch", openBranchModal);
    return () => window.removeEventListener("wellstaq:open-add-branch", openBranchModal);
  }, []);

  return (
    <>
      <header className="h-[72px] bg-white border-b border-grey-4 flex items-center justify-between px-4 lg:px-5 relative z-40">
        <div className="flex-1 flex items-center gap-2 lg:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-grey-2 hover:bg-grey-5 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative hidden sm:block sm:flex-1 sm:max-w-[460px] lg:w-[460px] lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && globalNavigationMatches[0]) {
                  router.push(globalNavigationMatches[0][1]);
                  setGlobalSearch("");
                }
              }}
              className="h-11 w-full rounded-[8px] border border-grey-4 bg-white pl-10 pr-16 text-sm focus:border-primary-1 focus:outline-none focus:ring-2 focus:ring-primary-1/20"
            />
            {globalSearch.trim().length >= 2 && (globalNavigationMatches.length > 0 || globalUserMatches.length > 0) && <div className="absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-xl border border-grey-4 bg-white p-2 shadow-xl">
              {globalNavigationMatches.map(([label, href]) => <button key={href} onClick={() => { router.push(href); setGlobalSearch(""); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-grey-5">{label}</button>)}
              {globalUserMatches.map((match) => <button key={match.id} onClick={() => { router.push(`/dashboard/profile/${match.id}`); setGlobalSearch(""); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-grey-5"><div className="text-sm font-medium text-grey-1">{match.name}</div><div className="text-xs text-grey-3">{match.email}</div></button>)}
            </div>}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">K</kbd>
            </div>
          </div>

        </div>

        <div className="flex items-center gap-2 lg:gap-4 ml-2 lg:ml-4">
          <button
            onClick={() => {
              if (!isAdmin) {
                toast.error("Messaging is only available to admins.");
                return;
              }
              router.push("/dashboard/messages");
            }}
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-[12px] border border-grey-4 flex items-center justify-center text-grey-2 hover:bg-grey-5 hidden sm:flex"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen((current) => !current)}
              className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-[12px] border border-grey-4 flex items-center justify-center text-grey-2 hover:bg-grey-5"
              title="Notifications"
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              {notifications.some((item) => !item.isRead) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-1" />}
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[12px] border border-grey-4 bg-white shadow-lg"
                >
                  <div className="px-4 py-3 border-b border-grey-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-grey-1">Notifications</p>
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-medium text-primary-1 hover:text-primary-1/80"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto p-2">
                    {notifications.length === 0 && <p className="px-3 py-8 text-center text-sm text-grey-3">No notifications yet.</p>}
                    {notifications.map((item) => (
                      <button type="button" onClick={() => void openNotification(item)} key={item.id} className="flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left hover:bg-grey-5">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!item.isRead ? "bg-primary-1" : "bg-grey-4"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium capitalize text-grey-1">{item.notificationType.replaceAll("_", " ")}</p>
                            <p className="shrink-0 text-xs text-grey-3">{new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="mt-1 text-xs text-grey-2">{item.body}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setIsChatOpen(true)}
            className="h-8 lg:h-10 px-2 lg:px-4 rounded-[12px] border border-grey-4 flex items-center gap-2 text-xs lg:text-sm font-medium text-grey-1 hover:bg-grey-5 transition-colors"
          >
            <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Ask ws-AI</span>
          </button>

          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center gap-2 lg:gap-3 ml-1 lg:ml-2 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary-1 text-white flex items-center justify-center font-medium overflow-hidden relative border border-grey-4">
                {userData.profileImage ? (
                  <Image src={userData.profileImage} alt={userData.firstName} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xs lg:text-sm">
                    {(userData.firstName.charAt(0) + userData.lastName.charAt(0)).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-grey-1 leading-tight" title={signedInUserName}>
                  {truncateProfileText(signedInUserName)}
                </p>
                <p className="text-xs text-grey-3" title={userData.email}>
                  {truncateProfileText(userData.email)}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-grey-3" />
            </div>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-grey-4 rounded-lg shadow-lg z-50 py-1 origin-top-right"
                >
                  <Link
                    href={userData.id ? `/dashboard/profile/${userData.id}` : "/dashboard/settings"}
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-grey-1 hover:bg-grey-5 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    View profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-grey-1 hover:bg-grey-5 flex items-center gap-2"
                  >
                    <Settings2 className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-grey-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* AI Chatbot Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/5 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[450px] bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-4 flex items-center justify-between bg-white border-b border-grey-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-grey-1 text-[15px]">{showHistory ? 'Chat History' : 'Ask ws-AI'}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-1.5 rounded-md transition-colors ${showHistory ? 'bg-grey-5 text-grey-1' : 'text-grey-2 hover:bg-grey-5 hover:text-grey-1'}`}
                    title="History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={startNewChat}
                    className="p-1.5 rounded-md text-grey-2 hover:bg-grey-5 hover:text-grey-1 transition-colors"
                    title="New Chat"
                  >
                    <MessageCirclePlus className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-grey-4 mx-1"></div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-grey-2 hover:text-grey-1 p-1.5 rounded-md hover:bg-grey-5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className={`flex-1 overflow-y-auto p-6 flex flex-col ${messages.length === 0 && !showHistory ? 'items-center justify-center' : 'items-start justify-start'} bg-white`}>
                {showHistory ? (
                  <div className="w-full space-y-4">
                    {chatHistory.map((item) => (
                      <button key={item.id} onClick={() => setShowHistory(false)} className="w-full text-left p-4 rounded-xl border border-grey-4 hover:border-primary-1 hover:bg-grey-5 transition-all group">
                        <h4 className="font-medium text-grey-1 text-sm mb-1 group-hover:text-primary-1">{item.title}</h4>
                        <p className="text-xs text-grey-3">{item.date}</p>
                      </button>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <>
                    <div className="w-16 h-16 relative mb-6 flex items-center justify-center text-[#EA6A05]">
                      <Sparkles className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-grey-1 mb-8">How can I help, {userData.firstName}?</h2>

                    <div className="w-full space-y-3 max-w-[380px]">
                      <button onClick={() => handleSendMessage("Suggest a workout routine for today.")} className="w-full flex items-center gap-3 p-3 bg-white border border-grey-4 rounded-lg text-sm text-grey-1 hover:bg-grey-5 transition-colors text-left">
                        <MessageSquare className="w-4 h-4 text-grey-2" />
                        Suggest a workout routine for today.
                      </button>
                      <button onClick={() => handleSendMessage("Find local wellness departments near me.")} className="w-full flex items-center gap-3 p-3 bg-white border border-grey-4 rounded-lg text-sm text-grey-1 hover:bg-grey-5 transition-colors text-left">
                        <MessageSquare className="w-4 h-4 text-grey-2" />
                        Find local wellness departments near me.
                      </button>
                      <button onClick={() => handleSendMessage("What should I work on next?")} className="w-full flex items-center gap-3 p-3 bg-white border border-grey-4 rounded-lg text-sm text-grey-1 hover:bg-grey-5 transition-colors text-left">
                        <MessageSquare className="w-4 h-4 text-grey-2" />
                        What should I work on next?
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full space-y-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary-1 text-white rounded-br-none' : 'bg-grey-5 text-grey-1 rounded-bl-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex w-full justify-start">
                        <div className="max-w-[85%] p-3 rounded-lg text-sm bg-grey-5 text-grey-1 rounded-bl-none flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-grey-3 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-grey-3 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1.5 h-1.5 bg-grey-3 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-white">
                <div className="border-b border-grey-4 p-3 shadow-none focus-within:border-primary-1 transition-all flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage(chatInput);
                      }
                    }}
                    placeholder="Ask anything..."
                    className="w-full bg-transparent text-sm focus:outline-none text-grey-1 placeholder:text-grey-3"
                  />
                  <button
                    onClick={() => handleSendMessage(chatInput)}
                    disabled={!chatInput.trim()}
                    className="w-8 h-8 bg-primary-1 text-white rounded-lg flex shrink-0 items-center justify-center hover:bg-primary-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1 mt-3 text-[11px] text-grey-3">
                  <span className="w-3 h-3 rounded-full border border-grey-3 flex items-center justify-center text-[8px]">i</span>
                  Uses AI. Verify results.
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Logout"
        description="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        isDestructive={true}
      />

      <Modal
        isOpen={isAddBranchModalOpen}
        onClose={closeBranchModal}
        title={branchModalStep === "current" ? "Name Current Branch" : "Create New Branch"}
        subtitle={branchModalStep === "current" ? "Give your current branch a name before adding another." : "Create another branch for your organization."}
        footer={
          <>
            <Button variant="outline" className="border-grey-4 bg-white text-grey-2 hover:bg-grey-5" onClick={closeBranchModal}>Cancel</Button>
            <Button onClick={branchModalStep === "current" ? handleNameCurrentBranch : handleAddBranch}>
              {branchModalStep === "current" ? "Continue" : "Add Branch"}
            </Button>
          </>
        }
      >
        {branchModalStep === "current" ? (
          <div>
            <div className="space-y-2">
              <Label htmlFor="currentBranchName">Current Branch Name</Label>
              <Input
                id="currentBranchName"
                placeholder="e.g. Lagos Headquarters"
                value={currentBranchName}
                onChange={(e) => setCurrentBranchName(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">New Branch Name</Label>
                <Input
                  id="branchName"
                  placeholder="e.g. Abuja Office"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees">Add/invite employee</Label>
                <div ref={branchSearchRef} className="relative">
                  <div className="flex gap-2">
                    <Input
                      id="employees"
                      type="text"
                      autoComplete="off"
                      placeholder="Search users or enter an email"
                      value={employeeQuery}
                      onChange={(e) => setEmployeeQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEmployeeQuery();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addEmployeeQuery}
                      title="Add email invitation"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  {(isSearchingUsers || userMatches.length > 0) && (
                    <div className="absolute left-0 right-12 top-[48px] z-20 max-h-48 overflow-y-auto rounded-lg border border-grey-4 bg-white shadow-lg">
                      {isSearchingUsers ? (
                        <div className="flex items-center gap-2 px-3 py-3 text-sm text-grey-3">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Searching users
                        </div>
                      ) : (
                        userMatches.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => addInvitee({
                              userId: user.id,
                              name: user.name,
                              email: user.email,
                            })}
                            className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-grey-5"
                          >
                            <span>
                              <span className="block text-sm font-medium text-grey-1">{user.name}</span>
                              <span className="block text-xs text-grey-3">{user.email}</span>
                            </span>
                            <Plus className="h-4 w-4 text-primary-1" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {invitees.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {invitees.map((invitee) => (
                      <span
                        key={invitee.email}
                        className="inline-flex max-w-full items-center gap-1 rounded-md bg-primary-5 px-2 py-1 text-xs text-primary-1"
                      >
                        <span className="truncate">{invitee.name ?? invitee.email}</span>
                        <button
                          type="button"
                          onClick={() => setInvitees((current) => current.filter((item) => item.email !== invitee.email))}
                          className="shrink-0"
                          aria-label={`Remove ${invitee.name ?? invitee.email}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
