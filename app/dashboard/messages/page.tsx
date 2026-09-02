"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Lock, Send, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { api } from "@/services/api";
import type { MessageResponse } from "@/types/api";

interface ConversationThread {
  id: string;
  type: "branch" | "department";
  name: string;
  role: string;
  icon: LucideIcon;
}

export default function MessagesPage() {
  const { branches, departments, members, organizationId, currentUser } = useDashboardData();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser
    ? ["super_admin", "admin", "branch_manager", "Super Admin", "Branch Manager"].includes(currentUser.role)
    : false;

  const threads = useMemo<ConversationThread[]>(() => [
    ...branches.map((branch) => ({
      id: `branch:${branch.id}`,
      type: "branch" as const,
      name: branch.name,
      role: "Branch conversation",
      icon: Building2,
    })),
    ...departments.map((department) => ({
      id: `department:${department.id}`,
      type: "department" as const,
      name: department.name,
      role: "Department conversation",
      icon: Users,
    })),
  ], [branches, departments]);

  useEffect(() => {
    if (!threads.length) {
      setActiveThreadId(null);
      return;
    }
    if (!activeThreadId || !threads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads]);

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null;

  useEffect(() => {
    if (!organizationId || !activeThread) {
      setMessages([]);
      return;
    }
    const conversationId = activeThread.id.split(":")[1];
    let cancelled = false;
    setMessages([]);
    setIsLoading(true);
    setError(null);
    void api.chat.getMessages(organizationId, activeThread.type, conversationId)
      .then((response) => { if (!cancelled) setMessages(response.items); })
      .catch(() => { if (!cancelled) setError("We couldn't load this conversation. Try again."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [activeThread, organizationId]);

  const memberName = (userId: string) => {
    if (userId === currentUser?.userId) return "You";
    return members.find((member) => String(member.id) === userId)?.name ?? "Team member";
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !organizationId || !activeThread || isSending) return;
    const conversationId = activeThread.id.split(":")[1];
    setIsSending(true);
    setError(null);
    try {
      const created = await api.chat.sendMessage(organizationId, activeThread.type, conversationId, { content });
      setMessages((current) => [...current, created]);
      setDraft("");
    } catch {
      setError("We couldn't send your message. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-grey-4 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-grey-5 text-grey-2">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="page-title">Messaging</h1>
        <p className="page-description">Messaging is only available to admins.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-104px)] max-w-7xl flex-col gap-5">
      <div>
        <h1 className="page-title">Messaging</h1>
        <p className="page-description">Chat with team members and branch admins in one place.</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-grey-4 bg-white lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-grey-4 lg:border-b-0 lg:border-r">
          <div className="border-b border-grey-4 px-5 py-4">
            <p className="text-sm font-medium text-grey-1">Team conversations</p>
            <p className="text-xs text-grey-3">Loaded from your workspace</p>
          </div>
          <div className="p-2">
            {!threads.length && (
              <p className="px-3 py-8 text-center text-sm text-grey-3">No conversations are available yet.</p>
            )}
            {threads.map((thread) => {
              const Icon = thread.icon;
              const isActive = activeThread?.id === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${isActive ? "bg-primary-5" : "hover:bg-grey-5"}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-grey-4 bg-white text-primary-1">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-grey-1">{thread.name}</span>
                    <span className="block truncate text-xs text-grey-3">{thread.role}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          {activeThread ? (
            <>
              <div className="border-b border-grey-4 px-5 py-4">
                <h2 className="text-base font-medium text-grey-1">{activeThread.name}</h2>
                <p className="text-xs text-grey-3">{activeThread.role}</p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-grey-5/50 px-5 py-5">
                {isLoading && Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-xl bg-white" />
                ))}
                {!isLoading && error && <p className="text-center text-sm text-red-600" role="alert">{error}</p>}
                {!isLoading && !error && messages.length === 0 && (
                  <p className="py-12 text-center text-sm text-grey-3">No messages in this conversation yet.</p>
                )}
                {!isLoading && messages.map((message) => {
                  const mine = message.userId === currentUser?.userId;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] rounded-xl px-4 py-3 text-sm ${mine ? "bg-primary-1 text-white" : "border border-grey-4 bg-white text-grey-1"}`}>
                        {!mine && <p className="mb-1 text-xs font-medium text-grey-3">{memberName(message.userId)}</p>}
                        <p>{message.content}</p>
                        <p className={`mt-2 text-[11px] ${mine ? "text-white/70" : "text-grey-3"}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-grey-4 bg-white p-4">
                <div className="flex items-center gap-3 rounded-xl border border-grey-4 bg-white px-4 py-2 focus-within:ring-2 focus-within:ring-primary-1">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }}
                    placeholder={`Message ${activeThread.name}`}
                    className="h-9 min-w-0 flex-1 bg-transparent text-sm text-grey-1 placeholder:text-grey-3 focus:outline-none"
                  />
                  <button
                    onClick={() => void sendMessage()}
                    disabled={!draft.trim() || isSending}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-1 text-white transition-colors hover:bg-primary-1/90 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-grey-3">
              Select a backend conversation when one becomes available.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
