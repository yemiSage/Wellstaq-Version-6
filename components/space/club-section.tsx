"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Video, Send, Users, ChevronLeft, ImageIcon, MessageCircle,
  PanelLeftClose, Sticker, Paperclip, Trash2, X, Loader2, Pin, PinOff,
} from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import type {
  Club, ClubCategory, ClubMemberInfo, MessageResponse, OrganizationMemberInfo,
} from "@/types/api";
import { CLUB_CATEGORIES } from "@/types/api";
import { Avatar } from "@/components/space/story-section";

// ── Sidebar (tabs + club list) ──────────────────────────────────────────
function ClubSidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  clubsLoading,
  filteredClubs,
  filteredMyClubs,
  onSelectClub,
  onRequestJoin,
  canCreate,
  onOpenCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "Other Clubs" | "My Clubs";
  onTabChange: (tab: "Other Clubs" | "My Clubs") => void;
  clubsLoading: boolean;
  filteredClubs: Club[];
  filteredMyClubs: Club[];
  onSelectClub: (id: string) => void;
  onRequestJoin: (id: string) => void;
  canCreate: boolean;
  onOpenCreate: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="w-full border-r border-grey-4 bg-white flex flex-col h-full shrink-0">
      <div className="pt-4 px-4 pb-0 border-b border-grey-4">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onClose} className="text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0">
            <PanelLeftClose size={14} strokeWidth={1.5} />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-12 py-2 bg-white border border-grey-4 rounded-lg text-sm focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">K</kbd>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          <h2 className="text-[16px] font-bold leading-6 text-grey-1">Clubs</h2>
          <p className="text-[12px] text-grey-3">Join communities that match your goals</p>
        </div>

        <div className="mt-3 flex border-b border-grey-4">
          <button className={`flex-1 pb-2 text-sm font-medium ${activeTab === "Other Clubs" ? "text-primary-1 border-b-2 border-primary-1" : "text-grey-2"}`} onClick={() => onTabChange("Other Clubs")}>
            Other Clubs
          </button>
          <button className={`flex-1 pb-2 text-sm font-medium ${activeTab === "My Clubs" ? "text-primary-1 border-b-2 border-primary-1" : "text-grey-2"}`} onClick={() => onTabChange("My Clubs")}>
            My Clubs
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {clubsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-grey-5 rounded-xl animate-pulse" />)}
          </div>
        ) : activeTab === "Other Clubs" ? (
          <div className="space-y-4">
            {filteredClubs.map((club) => (
              <div key={club.id} className="p-4 border border-grey-4 rounded-[12px] hover:border-primary-1 cursor-pointer transition-colors" onClick={() => onSelectClub(club.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar url={club.imageUrl} seed={club.id} firstName={club.name} lastName="" size={40} showPlaceholderBadge />
                    <div className="flex flex-col items-start gap-0">
                      <h3 className="text-sm font-bold leading-6 text-grey-1">{club.name}</h3>
                      <span className="text-[10px] font-medium text-grey-2 bg-grey-5 px-2 py-0.5 rounded-full">
                        {CLUB_CATEGORIES.find((c) => c.value === club.category)?.label ?? club.category}
                      </span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onRequestJoin(club.id); }} className="w-6 h-6 rounded bg-primary-5 text-primary-1 flex items-center justify-center hover:bg-primary-1 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-grey-2 mb-3 leading-relaxed">{club.description}</p>
                <div className="flex items-center gap-1 text-[11px] text-grey-3">
                  <Users className="w-3 h-3" />
                  {club.memberCount} members
                </div>
              </div>
            ))}
          </div>
        ) : filteredMyClubs.length > 0 ? (
          <div className="space-y-4">
            {filteredMyClubs.map((club) => (
              <div key={club.id} className="p-4 border border-grey-4 rounded-[12px] hover:border-primary-1 cursor-pointer transition-colors" onClick={() => onSelectClub(club.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar url={club.imageUrl} seed={club.id} firstName={club.name} lastName="" size={40} showPlaceholderBadge />
                    <div className="flex flex-col items-start gap-0">
                      <h3 className="text-sm font-bold leading-6 text-grey-1">{club.name}</h3>
                      <span className="text-[10px] font-medium text-grey-2 bg-grey-5 px-2 py-0.5 rounded-full">
                        {CLUB_CATEGORIES.find((c) => c.value === club.category)?.label ?? club.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-grey-2 mb-3 leading-relaxed">{club.description}</p>
                <div className="flex items-center gap-1 text-[11px] text-grey-3">
                  <Users className="w-3 h-3" />
                  {club.memberCount} members
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-10">
            <div className="w-20 h-20 bg-grey-5 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-grey-3" />
            </div>
            <p className="text-sm text-grey-2 mb-6">No user club has been created so far, when someone or your organization creates a club, they&apos;ll appear here</p>
            {canCreate ? (
              <button onClick={onOpenCreate} className="w-full py-2 border border-primary-1 text-primary-1 rounded-lg text-sm font-medium hover:bg-primary-5 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create a club
              </button>
            ) : (
              <p className="text-xs text-grey-3 italic">Switch to a branch to create a club.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Club chat view (shown when a club is selected) ──────────────────────
function ClubChatView({
  club,
  user,
  chatLoading,
  chatMessages,
  getChatUser,
  canModerateChat,
  chatInput,
  onChatInputChange,
  onSendMessage,
  onSendAttachment,
  onDeleteMessage,
  onTogglePin,
  onBack,
  onJoin,
}: {
  club: Club | undefined;
  user: { id: string };
  chatLoading: boolean;
  chatMessages: MessageResponse[];
  getChatUser: (userId: string) => ClubMemberInfo | OrganizationMemberInfo | undefined;
  canModerateChat: boolean;
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSendMessage: (mediaUrl?: string, mediaType?: string) => void;
  onSendAttachment: (file: File) => void;
  onDeleteMessage: (messageId: string) => void;
  onTogglePin: (message: MessageResponse) => void;
  onBack: () => void;
  onJoin: () => void;
}) {
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  useClickOutside(emojiPickerRef, () => setIsEmojiPickerOpen(false));

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSendAttachment(file);
    e.target.value = "";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA] relative">
      <div className="p-5 bg-white border-b border-grey-4 flex items-center gap-2 sticky top-0 z-20 w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-grey-1 hover:text-primary-1 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Go back to Feed
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative">
        <div className="sticky top-0 z-10 w-full self-start bg-white border-b border-grey-4 pb-[12px] pt-[20px] px-[20px]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-[20px] font-bold text-grey-1 leading-[30px]">{club?.name}</h1>
            <div className="flex items-center gap-1 text-xs text-grey-3">
              <Users className="w-3 h-3" /> {club?.memberCount ?? 0} members
            </div>
          </div>
          <p className="text-sm text-grey-2 leading-relaxed">{club?.description}</p>
        </div>

        {club?.isMember ? (
          <>
            <div className="flex-1 space-y-6 px-[20px] py-[20px] bg-[#FAFAFA]">
              {chatLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-grey-5 rounded-xl animate-pulse" />)}
                </div>
              ) : chatMessages.map((msg) => {
                const sender = getChatUser(msg.userId);
                const isMe = msg.userId === user.id;
                const canDeleteThis = isMe || canModerateChat;
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <Avatar url={sender?.avatarUrl} seed={msg.userId} firstName={sender?.firstName} lastName={sender?.lastName} size={40} showPlaceholderBadge />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-grey-1">{isMe ? "You" : sender ? `${sender.firstName} ${sender.lastName}` : "Member"}</span>
                          {msg.isPinned && <Pin className="w-3 h-3 text-primary-1 fill-primary-1" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {canModerateChat && (
                            <button onClick={() => onTogglePin(msg)} className="p-1 text-grey-3 hover:text-primary-1 transition-colors" title={msg.isPinned ? "Unpin" : "Pin"}>
                              {msg.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            </button>
                          )}
                          {canDeleteThis && (
                            <button onClick={() => onDeleteMessage(msg.id)} className="p-1 text-grey-3 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-grey-3 mb-2">{new Date(msg.createdAt).toLocaleString()}</div>
                      <div className={`text-sm text-grey-1 pl-3 border-l-2 ${isMe ? "border-green-500" : "border-primary-1"}`}>
                        {msg.content}
                        {msg.mediaType === "image" && msg.mediaUrl && (
                          <div className="mt-2 relative aspect-video w-full max-w-[300px] rounded-lg overflow-hidden border border-grey-4">
                            <Image src={msg.mediaUrl} alt="attachment" fill className="object-cover" />
                          </div>
                        )}
                        {msg.mediaType === "video" && msg.mediaUrl && (
                          <video src={msg.mediaUrl} controls className="mt-2 w-full max-w-[300px] rounded-lg" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 z-10 bg-white border-t border-grey-4 p-4 flex items-center gap-3">
              <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*,video/*" onChange={handleChatFileUpload} />
              <div ref={emojiPickerRef} className="relative">
                <button onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className={`w-10 h-10 rounded-xl border border-grey-4 flex items-center justify-center transition-colors shrink-0 ${isEmojiPickerOpen ? "bg-primary-1/10 text-primary-1 border-primary-1" : "text-grey-3 hover:bg-grey-5"}`}>
                  <Sticker className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {isEmojiPickerOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-full left-0 mb-2 p-4 bg-white rounded-2xl shadow-2xl border border-grey-4 w-[280px] z-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-grey-1">Emojis & Stickers</span>
                        <button onClick={() => setIsEmojiPickerOpen(false)}><X className="w-4 h-4 text-grey-3" /></button>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {["😊", "😂", "🔥", "❤️", "👍", "🙌", "💪", "🏃", "🥗", "🧘", "✨", "🎉", "🌟", "💯", "🚀", "👏", "🤝", "✅"].map((emoji) => (
                          <button key={emoji} onClick={() => { onChatInputChange(chatInput + emoji); setIsEmojiPickerOpen(false); }} className="text-xl hover:scale-125 transition-transform p-1">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative flex items-center">
                <button onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} className="w-10 h-10 rounded-xl border border-grey-4 flex items-center justify-center text-grey-3 hover:bg-grey-5 transition-colors shrink-0">
                  <Plus className="w-5 h-5" />
                </button>
                {showAttachmentMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-grey-4 rounded-xl shadow-lg p-2 flex flex-col gap-1 min-w-[150px]">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-grey-1 hover:bg-grey-5 rounded-lg text-left" onClick={() => { setShowAttachmentMenu(false); chatFileInputRef.current?.click(); }}>
                      <Paperclip className="w-4 h-4" /> Attachment
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-grey-1 hover:bg-grey-5 rounded-lg text-left" onClick={() => { setShowAttachmentMenu(false); chatFileInputRef.current?.click(); }}>
                      <ImageIcon className="w-4 h-4" /> Image
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-grey-1 hover:bg-grey-5 rounded-lg text-left" onClick={() => { setShowAttachmentMenu(false); chatFileInputRef.current?.click(); }}>
                      <Video className="w-4 h-4" /> Video
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onSendMessage(); }}
                  className="w-full h-10 px-4 bg-white border border-grey-4 rounded-full text-sm focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                />
              </div>
              <button
                disabled={!chatInput.trim()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${chatInput.trim() ? "bg-primary-1 text-white shadow-lg shadow-primary-1/20" : "bg-grey-5 text-grey-3 cursor-not-allowed"}`}
                onClick={() => onSendMessage()}
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 bg-grey-5 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-grey-3" />
            </div>
            <h3 className="text-lg font-bold text-grey-1 mb-2">Join to Chat</h3>
            <p className="text-sm text-grey-2 mb-6 max-w-sm">You need to join this club to see the messages and participate in the conversation.</p>
            <button onClick={onJoin} className="px-6 py-2 bg-primary-1 text-white font-medium text-sm rounded-lg hover:bg-primary-2 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Join Club
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Club modal ────────────────────────────────────────────────────
function CreateClubModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  imagePreview,
  isUploadingImage,
  onImageSelect,
  onRemoveImage,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: { name: string; description: string; category: ClubCategory };
  onFormChange: (patch: Partial<{ name: string; description: string; category: ClubCategory }>) => void;
  imagePreview: string | null;
  isUploadingImage: boolean;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-grey-4 flex items-center justify-between bg-grey-5/30">
              <h3 className="text-lg font-bold text-grey-1">Create New Club</h3>
              <button onClick={onClose} className="p-2 hover:bg-grey-4 rounded-xl transition-colors"><X className="w-5 h-5 text-grey-2" /></button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-grey-1">Club Name</label>
                <input type="text" required value={formData.name} onChange={(e) => onFormChange({ name: e.target.value })} placeholder="e.g. Morning Runners" className="w-full h-12 px-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-grey-1">Club Image (optional)</label>
                {imagePreview ? (
                  <div className="relative h-[120px] w-full rounded-xl overflow-hidden border border-grey-4 bg-grey-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Club preview" className="h-full w-full object-cover" />
                    {isUploadingImage && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
                    <button type="button" onClick={onRemoveImage} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-grey-1 hover:bg-white"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label htmlFor="clubImage" className="flex h-[90px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-grey-4 bg-grey-5 text-grey-3 hover:border-primary-1 hover:text-primary-1">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-xs">Click to upload an image</span>
                    <input id="clubImage" type="file" accept="image/*" className="hidden" onChange={onImageSelect} />
                  </label>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-grey-1">Category</label>
                <select required value={formData.category} onChange={(e) => onFormChange({ category: e.target.value as ClubCategory })} className="w-full h-12 px-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 bg-white">
                  {CLUB_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-grey-1">Description</label>
                <textarea required value={formData.description} onChange={(e) => onFormChange({ description: e.target.value })} placeholder="What is this club about?" className="w-full p-4 rounded-xl border border-grey-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 min-h-[100px] resize-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl text-sm font-bold text-grey-2 hover:bg-grey-5 transition-colors">Cancel</button>
                <button type="submit" disabled={isUploadingImage} className="flex-1 h-12 bg-primary-1 text-white rounded-xl text-sm font-bold hover:bg-primary-2 transition-all shadow-lg shadow-primary-1/20 disabled:opacity-50">Create Club</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Join Club confirm modal ──────────────────────────────────────────────
function JoinClubModal({ clubId, onCancel, onConfirm }: { clubId: string | null; onCancel: () => void; onConfirm: (id: string) => void }) {
  if (!clubId) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold text-grey-1 mb-2">Join Club</h3>
        <p className="text-sm text-grey-2 mb-6">Are you sure you want to join this club?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg">Cancel</button>
          <button onClick={() => onConfirm(clubId)} className="px-4 py-2 text-sm font-medium bg-primary-1 text-white hover:bg-primary-1/90 rounded-lg">Join</button>
        </div>
      </div>
    </div>
  );
}

// ── Exported bundle ───────────────────────────────────────────────────────
export { ClubSidebar, ClubChatView, CreateClubModal, JoinClubModal };