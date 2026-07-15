"use client";

import { useMemo, useState } from "react";
import { Lock, Send } from "lucide-react";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { conversationMessages, messageThreads } from "@/lib/workspace-activity";

export default function MessagesPage() {
  const { user, members, activeBranch } = useDashboardData();
  const [activeThread, setActiveThread] = useState(messageThreads[0]);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(conversationMessages);

  const isAdmin = useMemo(() => {
    const currentUserRole = members.find((member) => member.email.toLowerCase() === user.email.toLowerCase() && member.branch === activeBranch)?.role;
    return !currentUserRole || ["Super Admin", "Branch Manager"].includes(currentUserRole) || user.email.toLowerCase().includes("admin");
  }, [activeBranch, members, user.email]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: current.length + 1, sender: "You", time: "Now", text, mine: true }]);
    setDraft("");
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border border-grey-4 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-grey-5 text-grey-2">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="page-title">Messaging</h1>
        <p className="text-sm text-grey-2">Messaging is only available to admins. Ask a branch admin to update your role if you need access.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex h-[calc(100vh-104px)] flex-col gap-5">
      <div>
        <h1 className="page-title">Messaging</h1>
        <p className="text-sm text-grey-2">Chat with team members and branch admins in one place.</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-grey-4 bg-white lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-grey-4 lg:border-b-0 lg:border-r">
          <div className="border-b border-grey-4 px-5 py-4">
            <p className="text-sm font-medium text-grey-1">Team conversations</p>
            <p className="text-xs text-grey-3">Admin-only messaging</p>
          </div>
          <div className="p-2">
            {messageThreads.map((thread) => {
              const Icon = thread.icon;
              const isActive = activeThread.id === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThread(thread)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${isActive ? "bg-primary-5" : "hover:bg-grey-5"}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-grey-4 text-primary-1">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-grey-1">{thread.name}</span>
                    <span className="block truncate text-xs text-grey-3">{thread.lastMessage}</span>
                  </span>
                  {thread.unread > 0 && (
                    <span className="rounded-full bg-primary-1 px-2 py-0.5 text-xs font-medium text-white">{thread.unread}</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-grey-4 px-5 py-4">
            <div>
              <h2 className="text-base font-medium text-grey-1">{activeThread.name}</h2>
              <p className="text-xs text-grey-3">{activeThread.role}</p>
            </div>
            <span className="rounded-full border border-grey-4 px-3 py-1 text-xs font-medium text-grey-2">Admin</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-grey-5/50 px-5 py-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-xl px-4 py-3 text-sm ${message.mine ? "bg-primary-1 text-white" : "bg-white text-grey-1 border border-grey-4"}`}>
                  {!message.mine && <p className="mb-1 text-xs font-medium text-grey-3">{message.sender}</p>}
                  <p>{message.text}</p>
                  <p className={`mt-2 text-[11px] ${message.mine ? "text-white/70" : "text-grey-3"}`}>{message.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-grey-4 bg-white p-4">
            <div className="flex items-center gap-3 rounded-xl border border-grey-4 bg-white px-4 py-2 focus-within:ring-2 focus-within:ring-primary-1">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder={`Message ${activeThread.name}`}
                className="h-9 min-w-0 flex-1 bg-transparent text-sm text-grey-1 placeholder:text-grey-3 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-1 text-white transition-colors hover:bg-primary-1/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
