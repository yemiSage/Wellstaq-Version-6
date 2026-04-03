"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, MessageSquare, Bell, Sparkles, ChevronDown, X, Send, Menu, Edit, Layout, MoreHorizontal, Plus, Settings2, Scale, ArrowUp, ArrowUpRight, LogOut, History, MessageCirclePlus } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { generateChatResponse } from "@/app/actions/chat";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useClickOutside } from "@/hooks/use-click-outside";

export function TopNav() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [newBranchData, setNewBranchData] = useState({ name: "", employees: "" });
  const [showHistory, setShowHistory] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const orgSwitcherRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [chatHistory, setChatHistory] = useState<{id: string, title: string, date: string}[]>([
    { id: "1", title: "Workout routine for today", date: "Today" },
    { id: "2", title: "Local wellness departments", date: "Yesterday" },
    { id: "3", title: "Feeling stressed lately", date: "Last week" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: "Opeyemi",
    lastName: "Adegboye",
    email: "adegboyeopeyemi065@gmail.com",
    businessName: "Yemi Inc lokoja"
  });
  const [branches, setBranches] = useState<{name: string, employees: string}[]>([]);
  const [activeBranch, setActiveBranch] = useState("Yemi Inc lokoja");

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await generateChatResponse(newMessages, userData.firstName);
      setMessages([...newMessages, { role: 'ai', content: response }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'ai', content: "Sorry, I couldn't process that right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleAddBranch = () => {
    if (!newBranchData.name || !newBranchData.employees) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const updatedBranches = [...branches, newBranchData];
    setBranches(updatedBranches);
    setActiveBranch(newBranchData.name);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('branches', JSON.stringify(updatedBranches));
      localStorage.setItem('activeBranch', newBranchData.name);
    }
    
    toast.success("Branch added successfully!");
    setIsAddBranchModalOpen(false);
    setNewBranchData({ name: "", employees: "" });
  };

  const startNewChat = () => {
    setMessages([]);
    setShowHistory(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('onboardingData');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUserData({
            firstName: parsed.firstName || "Opeyemi",
            lastName: parsed.lastName || "Adegboye",
            email: parsed.email || "adegboyeopeyemi065@gmail.com",
            businessName: parsed.businessName || "Yemi Inc lokoja"
          });
          
          const storedBranches = localStorage.getItem('branches');
          if (storedBranches) {
            setBranches(JSON.parse(storedBranches));
          } else {
            setBranches([{ name: parsed.businessName || "Yemi Inc lokoja", employees: "10" }]);
          }
          
          const storedActiveBranch = localStorage.getItem('activeBranch');
          if (storedActiveBranch) {
            setActiveBranch(storedActiveBranch);
          } else {
            setActiveBranch(parsed.businessName || "Yemi Inc lokoja");
          }
        } catch (e) {
          console.error("Failed to parse onboarding data", e);
        }
      } else {
        const storedBranches = localStorage.getItem('branches');
        if (storedBranches) {
          setBranches(JSON.parse(storedBranches));
        } else {
          setBranches([{ name: "Yemi Inc lokoja", employees: "10" }]);
        }
        
        const storedActiveBranch = localStorage.getItem('activeBranch');
        if (storedActiveBranch) {
          setActiveBranch(storedActiveBranch);
        } else {
          setActiveBranch("Yemi Inc lokoja");
        }
      }
    }
  }, []);

  useClickOutside(profileRef, () => setIsProfileOpen(false));
  useClickOutside(orgSwitcherRef, () => setIsOrgSwitcherOpen(false));

  return (
    <>
      <header className="h-16 bg-white border-b border-grey-4 flex items-center justify-between px-6 relative z-40">
        <div className="flex-1 flex items-center gap-4">
          {/* Organization Switcher */}
          <div className="relative" ref={orgSwitcherRef}>
            <button 
              onClick={() => setIsOrgSwitcherOpen(!isOrgSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-grey-4 hover:bg-grey-5 transition-colors"
            >
              <div className="w-6 h-6 rounded bg-primary-1 text-white flex items-center justify-center text-xs font-bold">
                {activeBranch.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-grey-1">{activeBranch}</span>
              <ChevronDown className="w-4 h-4 text-grey-3" />
            </button>

            <AnimatePresence>
            {isOrgSwitcherOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 mt-2 w-[240px] bg-white border border-grey-4 rounded-lg shadow-lg z-50 p-2 origin-top-left"
              >
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-grey-3 uppercase tracking-wider mb-2">Organizations</p>
                  <div className="space-y-1">
                    {branches.map((branch, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveBranch(branch.name);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('activeBranch', branch.name);
                          }
                          setIsOrgSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${activeBranch === branch.name ? 'bg-grey-5' : 'hover:bg-grey-5'}`}
                      >
                        <div className="w-8 h-8 rounded bg-primary-1 text-white flex items-center justify-center text-sm font-bold">
                          {branch.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-grey-1">{branch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-grey-4 my-1"></div>
                <div className="p-1">
                  <button 
                    onClick={() => {
                      setIsOrgSwitcherOpen(false);
                      setIsAddBranchModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-grey-1 hover:bg-grey-5 rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4 text-grey-2" />
                    Add new branch
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          <div className="relative w-[459px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input 
              type="text" 
              placeholder="Search events, challenges, departments and more" 
              className="h-10 pl-[40px] pr-16 w-full rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">K</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          <button className="w-10 h-10 rounded-[12px] border border-grey-4 flex items-center justify-center text-grey-2 hover:bg-grey-5">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-[12px] border border-grey-4 flex items-center justify-center text-grey-2 hover:bg-grey-5">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="h-10 px-4 rounded-[12px] border border-grey-4 flex items-center gap-2 text-sm font-medium text-grey-1 hover:bg-grey-5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Ask ws-AI
          </button>
          
          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-3 ml-2 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-10 h-10 rounded-full bg-primary-1 text-white flex items-center justify-center font-medium overflow-hidden relative">
                <Image src="https://picsum.photos/seed/opeyemi/100/100" alt="Opeyemi" fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-grey-1 leading-tight">{userData.firstName} {userData.lastName}</p>
                <p className="text-xs text-grey-3">
                  {userData.email.split('@')[0].length > 7 
                    ? `${userData.email.substring(0, 4)}....${userData.email.split('@')[0].slice(-3)}@${userData.email.split('@')[1]}`
                    : userData.email}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-grey-3" />
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
                    <div className="w-16 h-16 relative mb-6 flex items-center justify-center text-[#F27D26]">
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
        onClose={() => setIsAddBranchModalOpen(false)}
        title="Add New Branch"
        subtitle="Create a new branch for your organization."
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              placeholder="e.g. London Office"
              value={newBranchData.name}
              onChange={(e) => setNewBranchData({ ...newBranchData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              placeholder="e.g. 50"
              value={newBranchData.employees}
              onChange={(e) => setNewBranchData({ ...newBranchData, employees: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-grey-4">
          <Button variant="outline" onClick={() => setIsAddBranchModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddBranch}>
            Add Branch
          </Button>
        </div>
      </Modal>
    </>
  );
}
