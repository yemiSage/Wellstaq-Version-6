// path: app/dashboard/event/[id]/page.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Edit2, Trash2, Users, Calendar, Clock, Send, Plus, Check, Search, Pin, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { hasPermission } from "@/lib/permissions";
import { formatRelativeTime } from "@/lib/time";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditEventModal } from "@/components/events/edit-event-modal";
import { useRouter } from "next/navigation";
import type { EventItem, EventParticipantInfo, MessageResponse, OrganizationMemberInfo } from "@/types/api";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId, currentUser } = useDashboardData();
  const router = useRouter();

  const [id, setId] = useState<string | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [participants, setParticipants] = useState<EventParticipantInfo[]>([]);
  const [participantsTotal, setParticipantsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const sendingRef = useRef(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMemberInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const eventBranchId = event?.branchId;
  const canUpdate = currentUser ? hasPermission(currentUser.permissions, "event.update", eventBranchId) : false;
  const canDelete = currentUser ? hasPermission(currentUser.permissions, "event.delete", eventBranchId) : false;

  const participantIds = new Set(participants.map((p) => p.userId));
  const currentParticipation = participants.find((p) => p.userId === currentUser?.userId);
  const hasJoined = currentParticipation?.status === "accepted" || currentParticipation?.status === "pending";

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const loadEvent = useCallback(async (orgId: string, eventId: string) => {
    setIsLoading(true);
    try {
      const [eventData, participantsData] = await Promise.all([
        api.organization.getEvent(orgId, eventId),
        api.organization.getEventParticipants(orgId, eventId),
      ]);
      setEvent(eventData);
      setParticipants(participantsData.items);
      setParticipantsTotal(participantsData.total);
    } catch {
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!organizationId || !id) return;
    void loadEvent(organizationId, id);
  }, [organizationId, id, loadEvent]);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    api.organization.getMembers(organizationId).then((response) => {
      if (!cancelled) setOrganizationMembers(response.items);
    }).catch(() => {
      if (!cancelled) setOrganizationMembers([]);
    });
    return () => { cancelled = true; };
  }, [organizationId]);

  // Chat — same conversation_type pattern as club chat: "event" + event id.
  useEffect(() => {
    if (!organizationId || !id) return;
    let cancelled = false;

    async function loadEventChat(eventId: string, orgId: string) {
      setChatLoading(true);
      try {
        const messagesRes = await api.chat.getMessages(orgId, "event", eventId);
        if (cancelled) return;
        setMessages(messagesRes.items.slice().reverse()); // oldest first for display
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setChatLoading(false);
      }
    }
    void loadEventChat(id, organizationId);
    return () => { cancelled = true; };
  }, [organizationId, id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !organizationId || !id || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);

    try {
      const created = await api.chat.sendMessage(organizationId, "event", id, {
        content: message.trim(),
      });
      setMessages((prev) => [...prev, created]);
      setMessage("");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast.error("We couldn't send the message. Try again.");
    } finally { sendingRef.current = false; setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!organizationId) return;
    try {
      await api.chat.deleteMessage(organizationId, messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message deleted");
    } catch {
      toast.error("We couldn't delete the message. Try again.");
    }
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredMembers = organizationMembers.filter((member) => {
    if (participantIds.has(member.id)) return false;
    const fullName = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim().toLowerCase();
    const email = (member.email ?? "").toLowerCase();
    return fullName.includes(normalizedSearchQuery) || email.includes(normalizedSearchQuery);
  });

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((prev) => (prev.includes(memberId) ? prev.filter((mid) => mid !== memberId) : [...prev, memberId]));
  };

  const handleSendInvites = async () => {
    if (selectedMemberIds.length === 0 || !organizationId || !id) {
      toast.error("Please select at least one employee to invite");
      return;
    }
    setIsInviting(true);
    try {
      // Backend has no bulk-invite endpoint — join_event one at a time
      // with is_invite: true.
      await Promise.all(
        selectedMemberIds.map((userId) =>
          api.organization.inviteEventParticipant(organizationId, id, userId),
        ),
      );
      toast.success(`Invites sent to ${selectedMemberIds.length} employees!`);
      setIsInviteModalOpen(false);
      setSelectedMemberIds([]);
      setSearchQuery("");
      await loadEvent(organizationId, id);
    } catch {
      toast.error("Some invites failed to send.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!organizationId || !id || !currentUser?.userId) return;
    setIsJoining(true);
    try {
      await api.organization.joinEvent(organizationId, id, currentUser.userId);
      await loadEvent(organizationId, id);
      toast.success("You joined the event!");
    } catch {
      // Global API notifier provides the error message.
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!organizationId || !id) return;
    try {
      await api.organization.deleteEvent(organizationId, id);
      toast.success("Event deleted successfully");
      router.push("/dashboard/events");
    } catch {
      // error toast handled globally
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto py-16 text-center text-grey-3">Loading event...</div>;
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <p className="text-grey-2">Event not found.</p>
        <Link href="/dashboard/events" className="text-primary-1 font-medium hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 rounded-[12px] p-[12px]">
      <Link href="/dashboard/events" className="flex items-center gap-2 text-sm text-grey-2 hover:text-grey-1 transition-colors w-fit">
        <ChevronLeft className="w-4 h-4" />
        Go back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Card */}
          <div className="bg-white rounded-[12px] border border-grey-4 overflow-hidden">
            <div className="relative h-[300px] w-full bg-grey-4">
              {event.imageUrl && (
                <Image src={event.imageUrl} alt={event.title} fill className="object-cover" referrerPolicy="no-referrer" />
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="page-title">{event.title}</h1>
                <div className="flex items-center gap-2">
                  {!hasJoined && (
                    <Button onClick={handleJoinEvent} disabled={isJoining}>
                      <Plus className="mr-2 h-4 w-4" />
                      {isJoining ? "Joining..." : currentParticipation?.status === "invited" ? "Accept & Join" : "Join Event"}
                    </Button>
                  )}
                  {hasJoined && <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">Joined</span>}
                  {canUpdate && (
                    <button onClick={() => setIsEditModalOpen(true)} className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-primary-1 hover:border-primary-1 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 rounded-lg border border-grey-4 text-grey-2 hover:text-red-500 hover:border-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {event.description && <p className="text-sm text-grey-2 leading-relaxed">{event.description}</p>}

              <div className="flex flex-wrap items-center gap-6 text-sm text-grey-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{participantsTotal} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section — same pattern as club chat */}
          <div className="bg-white rounded-[12px] border border-grey-4 flex flex-col h-[600px]">
            <div className="p-4 border-b border-grey-4 flex items-center justify-between">
              <h2 className="font-bold text-grey-1">Chat</h2>
              <div className="flex items-center gap-1 text-xs text-grey-3">
                <Users className="w-3 h-3" />
                {participantsTotal} members
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {chatLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-grey-5 rounded-xl animate-pulse" />)}
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-grey-3 italic text-center mt-10">No messages yet — say hello!</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.userId === currentUser?.userId;
                  const sender = organizationMembers.find((member) => member.id === msg.userId);
                  const senderName = sender
                    ? `${sender.firstName} ${sender.lastName}`.trim()
                    : isMe
                      ? `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "You"
                      : "Member";
                  return (
                  <div key={msg.id} className={`flex gap-3 group ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative bg-grey-4">
                      {sender?.avatarUrl && <Image src={sender.avatarUrl} alt={senderName} fill className="object-cover" />}
                    </div>
                    <div className={`w-fit max-w-[78%] space-y-1 ${isMe ? "ml-auto" : "mr-auto"}`}>
                      <div className={`flex items-center gap-2 ${isMe ? "justify-end" : ""}`}>
                        <span className="font-bold text-sm text-grey-1">{senderName}</span>
                        <span className="text-xs text-grey-3">› {formatRelativeTime(msg.createdAt)}</span>
                        {msg.isPinned && <Pin className="w-3 h-3 text-primary-1" />}
                        {isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 text-grey-3 hover:text-red-500 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="mt-2 p-3 bg-grey-5/50 rounded-[0_12px_12px_0] border-l-2 border-primary-1">
                        <p className="text-sm text-grey-1 leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-grey-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-label="Event message" name="message" placeholder="Type a message…"
                  className="flex-1 h-11 px-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 bg-grey-5/30"
                />
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
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
          <div className="bg-white rounded-[12px] border border-grey-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-grey-1">Participants</h2>
              <button onClick={() => setIsInviteModalOpen(true)} className="text-xs font-bold text-primary-1 hover:text-primary-2 flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Invite Employee
              </button>
            </div>

            <div className="space-y-4">
              {participants.length === 0 ? (
                <p className="text-sm text-grey-3 italic">No participants yet.</p>
              ) : (
                participants.map((participant) => (
                  <div key={participant.userId} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-grey-1">{participant.firstName} {participant.lastName}</p>
                      <p className="text-xs text-grey-2">{participant.email}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-grey-3 shrink-0">{participant.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Employees"
        subtitle="Select team members to invite to this event."
        footer={
          <>
            <span className="mr-auto text-sm text-grey-2">{selectedMemberIds.length} selected</span>
            <Button variant="outline" className="border-grey-4 bg-white text-grey-2 hover:bg-grey-5" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvites} disabled={isInviting}>{isInviting ? "Sending..." : "Send Invites"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-3" />
            <Input className="pl-10" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2 no-scrollbar">
            {filteredMembers.map((emp) => {
              const fullName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || emp.email;
              const initials = `${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`.toUpperCase() || "?";
              return (
              <button key={emp.id} type="button" onClick={() => toggleMemberSelection(emp.id)} className={`flex w-full items-center justify-between rounded-[8px] border p-3 text-left transition-all ${selectedMemberIds.includes(emp.id) ? "border-primary-1 bg-primary-1/5" : "border-grey-4 hover:border-grey-3"}`}>
                <span className="flex items-center gap-3">
                  <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-grey-4 text-xs font-bold text-grey-2">
                    {emp.avatarUrl ? <Image src={emp.avatarUrl} alt={fullName} fill className="object-cover" /> : initials}
                  </span>
                  <span><span className="block text-sm font-bold text-grey-1">{fullName}</span><span className="block text-xs text-grey-2">{emp.email}</span></span>
                </span>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selectedMemberIds.includes(emp.id) ? "border-primary-1 bg-primary-1 text-white" : "border-grey-4"}`}>
                  {selectedMemberIds.includes(emp.id) && <Check className="h-3 w-3" />}
                </span>
              </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {event && (
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          event={event}
          onUpdated={(updated) => setEvent(updated)}
        />
      )}

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteEvent} title="Delete Event" description="Are you sure you want to delete this event? This action cannot be undone." confirmText="Delete Event" isDestructive />
    </div>
  );
}
