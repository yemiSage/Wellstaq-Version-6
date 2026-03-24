"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, User, Video, MapPin, Send, Heart, Users, Flame, ChevronLeft, TrendingUp, ImageIcon, MessageCircle, Share2, Bookmark, ThumbsUp, PanelLeftClose, PanelLeftOpen, Sticker, Paperclip, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";

// Mock Data
const stories = [
  { id: 1, name: "Your Story", image: "https://picsum.photos/seed/opeyemi/100/100", isUser: true },
  { id: 2, name: "Ibukun", image: "https://picsum.photos/seed/ibukun/100/100" },
  { id: 3, name: "Amaka", image: "https://picsum.photos/seed/amaka/100/100" },
  { id: 4, name: "Chidi", image: "https://picsum.photos/seed/chidi/100/100" },
  { id: 5, name: "Segun", image: "https://picsum.photos/seed/segun/100/100" },
  { id: 6, name: "Tunde", image: "https://picsum.photos/seed/tunde/100/100" },
  { id: 7, name: "Ngozi", image: "https://picsum.photos/seed/ngozi/100/100" },
];

const trendingTopics = [
  { id: 1, tag: "#StepUpForHealth", posts: "2.4k" },
  { id: 2, tag: "#MindfulMovement", posts: "1.8k" },
  { id: 3, tag: "#LagosRuns", posts: "1.2k" },
  { id: 4, tag: "#CleanEating", posts: "987" },
  { id: 5, tag: "#TeamHIIT", posts: "743" },
];

const suggestedClubs = [
  {
    id: 1,
    name: "Yogo Club",
    category: "Team Bonding",
    description: "Innovative coders collaborating on projects and skills.",
    members: 30,
    image: "https://picsum.photos/seed/yogo/100/100"
  },
  {
    id: 2,
    name: "Design Gurus",
    category: "Creativity",
    description: "A community of designers sharing insights and trends.",
    members: 25,
    image: "https://picsum.photos/seed/design/100/100"
  }
];

const myClubs: any[] = [];

const chatMessages = [
  {
    id: 1,
    user: "Alex Carter",
    role: "UX Researcher",
    time: "13 Feb, 9:15am",
    message: "Hi team, looking forward to our meeting!",
    avatar: "https://picsum.photos/seed/alex/100/100",
    isMe: false
  },
  {
    id: 2,
    user: "Jamie Lee",
    role: "Frontend Developer",
    time: "13 Feb, 11:45am",
    message: "Just finished the new feature, excited to show you all!",
    avatar: "https://picsum.photos/seed/jamie/100/100",
    isMe: false
  },
  {
    id: 3,
    user: "Morgan Price",
    role: "Project Manager",
    time: "13 Feb, 1:30pm",
    message: "In our upcoming sync, I think it would be great to dive into our timelines, especially as we align our schedules. Additionally, I'd love to incorporate a discussion about a yoga plan that could complement our workflow. Perhaps we can explore how integrating some yoga sessions into our routine can enhance our productivity and well-being. Let's brainstorm some ideas on how to fit this into our timelines!",
    avatar: "https://picsum.photos/seed/morgan/100/100",
    isMe: false
  },
  {
    id: 4,
    user: "ME",
    role: "HR Manager",
    time: "13 Feb, 1:30pm",
    message: "Huuu yeeeh",
    avatar: "https://picsum.photos/seed/opeyemi/100/100",
    isMe: true
  },
  {
    id: 5,
    user: "Morgan Price",
    role: "Project Manager",
    time: "13 Feb, 1:30pm",
    message: "Lol, Tobi like free time mhen",
    avatar: "https://picsum.photos/seed/morgan/100/100",
    isMe: false
  }
];

const initialPosts = [
  {
    id: 1,
    user: "Brian Kim",
    email: "briankim@gmail.com",
    avatar: "https://picsum.photos/seed/brian/100/100",
    time: "2h ago",
    badge: "🏆 #1 Leaderboard",
    content: "Just crushed a 5K PB this morning! 🏃 The Step Up for Health challenge has been incredible for pushing my limits. Who else is hitting their goals this week?",
    hashtags: "#StepUpForHealth #PB #Running",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&h=600&auto=format&fit=crop",
    likes: 142,
    comments: 2,
    commentsList: [
      { id: 1, user: "Amaka", time: "1h ago", content: "Inspiring stuff. I need to start running too.", avatar: "https://picsum.photos/seed/amaka/100/100", isMe: false },
      { id: 2, user: "Chidi", time: "30m ago", content: "Great job!", avatar: "https://picsum.photos/seed/chidi/100/100", isMe: false }
    ],
    shares: 14,
    isLiked: false
  },
  {
    id: 2,
    user: "Sarah Williams",
    email: "sarahw@gmail.com",
    avatar: "https://picsum.photos/seed/sarah/100/100",
    time: "4h ago",
    badge: "🔥 10 Day Streak",
    content: "Yoga session completed! Feeling so refreshed and ready to tackle the day. Remember to take some time for yourself amidst the busy schedule.",
    hashtags: "#MindfulMovement #Yoga #Wellness",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&h=600&auto=format&fit=crop",
    likes: 89,
    comments: 0,
    commentsList: [],
    shares: 5,
    isLiked: true
  },
  {
    id: 3,
    user: "Michael Brown",
    email: "mbrown@gmail.com",
    avatar: "https://picsum.photos/seed/michael/100/100",
    time: "6h ago",
    badge: "💪 Fitness Guru",
    content: "Just finished an intense HIIT workout with the Mongo Warriors! We are absolutely crushing the team goals this month.",
    hashtags: "#TeamHIIT #Fitness #MongoWarriors",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&h=600&auto=format&fit=crop",
    likes: 215,
    comments: 0,
    commentsList: [],
    shares: 32,
    isLiked: false
  }
];

export default function SpacePage() {
  const [activeTab, setActiveTab] = useState<"Other Clubs" | "My Clubs">("Other Clubs");
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [suggested, setSuggested] = useState(suggestedClubs);
  const [myClubsList, setMyClubsList] = useState(myClubs);
  const [clubToJoin, setClubToJoin] = useState<number | null>(null);
  const [isLeftColumnOpen, setIsLeftColumnOpen] = useState(true);
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [posts, setPosts] = useState(initialPosts);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postLocation, setPostLocation] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<number | null>(null);
  const [deleteConfirmComment, setDeleteConfirmComment] = useState<{postId: number, commentId: number} | null>(null);
  const [messages, setMessages] = useState(chatMessages);
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse chat messages", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleJoinClub = (id: number) => {
    const club = suggested.find(c => c.id === id);
    if (club) {
      setSuggested(suggested.filter(c => c.id !== id));
      setMyClubsList([...myClubsList, club]);
      toast.success(`Successfully joined ${club.name}!`);
    }
    setClubToJoin(null);
  };

  const handleDeletePost = (id: number) => {
    setPosts(posts.filter(p => p.id !== id));
    setDeleteConfirmPostId(null);
    toast.success("Post deleted successfully");
  };

  const handleLikePost = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        const isLiked = !p.isLiked;
        return { ...p, isLiked, likes: p.likes + (isLiked ? 1 : -1) };
      }
      return p;
    }));
  };

  const handleCreatePost = () => {
    if (!postContent.trim() && !postImage && !postLocation) return;
    const newPost = {
      id: Date.now(),
      user: "Opeyemi Adegboye",
      email: "adegboyeopeyemi065@gmail.com",
      avatar: "https://picsum.photos/seed/opeyemi/100/100",
      time: "Just now",
      badge: "",
      content: postContent + (postLocation ? `\n📍 ${postLocation}` : ""),
      hashtags: "",
      image: postImage || "",
      likes: 0,
      comments: 0,
      commentsList: [],
      shares: 0,
      isLiked: false
    };
    setPosts([newPost, ...posts]);
    setPostContent("");
    setPostImage(null);
    setPostLocation(null);
    toast.success("Post created successfully!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPostImage(url);
    }
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const newMessage = {
        id: Date.now(),
        user: "ME",
        role: "HR Manager",
        time: "Just now",
        message: isVideo ? `[Video Attachment]` : `[Image Attachment]`,
        avatar: "https://picsum.photos/seed/opeyemi/100/100",
        isMe: true
      };
      setMessages([...messages, newMessage]);
      toast.success("Attachment sent!");
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage = {
      id: Date.now(),
      user: "ME",
      role: "HR Manager",
      time: "Just now",
      message: chatInput,
      avatar: "https://picsum.photos/seed/opeyemi/100/100",
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setChatInput("");
    toast.success("Message sent!");
  };

  const handleAddComment = (postId: number, content: string) => {
    if (!content.trim()) return;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: Date.now(),
          user: "Opeyemi Adegboye",
          time: "Just now",
          content,
          avatar: "https://picsum.photos/seed/opeyemi/100/100",
          isMe: true
        };
        return {
          ...p,
          commentsList: [...(p.commentsList || []), newComment],
          comments: (p.comments || 0) + 1
        };
      }
      return p;
    }));
    if (!expandedComments.includes(postId)) {
      setExpandedComments([...expandedComments, postId]);
    }
    toast.success("Comment added!");
  };

  const handleDeleteComment = (postId: number, commentId: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsList: p.commentsList.filter((c: any) => c.id !== commentId),
          comments: Math.max(0, (p.comments || 0) - 1)
        };
      }
      return p;
    }));
    setDeleteConfirmComment(null);
    toast.success("Comment deleted!");
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, we'll just set a mock location string
          // In a real app, you'd use a reverse geocoding API
          setPostLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setPostLocation("Lagos, Nigeria"); // Fallback
        }
      );
    } else {
      setPostLocation("Lagos, Nigeria");
    }
  };

  const renderLeftColumn = () => {
    if (!isLeftColumnOpen) return null;
    return (
      <div className="w-[320px] border-r border-grey-4 bg-white flex flex-col h-full shrink-0">
      <div className="pt-4 px-4 pb-0 border-b border-grey-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full pl-9 pr-12 py-2 bg-white border border-grey-4 rounded-lg text-sm focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-grey-5 text-[10px] font-medium text-grey-2 border border-grey-4">K</kbd>
            </div>
          </div>
          <button onClick={() => setIsLeftColumnOpen(false)} className="text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0">
            <PanelLeftClose size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div>
          <h2 className="text-[16px] font-bold text-grey-1">Clubs</h2>
          <p className="text-[12px] text-grey-3">Join communities that match your goals</p>
        </div>

        <div className="flex border-b border-grey-4">
          <button 
            className={`flex-1 pb-2 text-sm font-medium ${activeTab === "Other Clubs" ? "text-primary-1 border-b-2 border-primary-1" : "text-grey-2"}`}
            onClick={() => setActiveTab("Other Clubs")}
          >
            Other Clubs
          </button>
          <button 
            className={`flex-1 pb-2 text-sm font-medium ${activeTab === "My Clubs" ? "text-primary-1 border-b-2 border-primary-1" : "text-grey-2"}`}
            onClick={() => setActiveTab("My Clubs")}
          >
            My Clubs
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === "Other Clubs" ? (
          <div className="space-y-4">
            {suggested.map(club => (
              <div key={club.id} className="p-4 border border-grey-4 rounded-xl hover:border-primary-1 cursor-pointer transition-colors" onClick={() => setSelectedClub(club.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image src={club.image} alt={club.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <h3 className="text-sm font-bold text-grey-1">{club.name}</h3>
                      <span className="text-[10px] font-medium text-grey-2 bg-grey-5 px-2 py-0.5 rounded-full">{club.category}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setClubToJoin(club.id); }}
                    className="w-6 h-6 rounded bg-primary-5 text-primary-1 flex items-center justify-center hover:bg-primary-1 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-grey-2 mb-3 leading-relaxed">{club.description}</p>
                <div className="flex items-center gap-1 text-[11px] text-grey-3">
                  <Users className="w-3 h-3" />
                  {club.members} members
                </div>
              </div>
            ))}
          </div>
        ) : myClubsList.length > 0 ? (
          <div className="space-y-4">
            {myClubsList.map(club => (
              <div key={club.id} className="p-4 border border-grey-4 rounded-xl hover:border-primary-1 cursor-pointer transition-colors" onClick={() => setSelectedClub(club.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image src={club.image} alt={club.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <h3 className="text-sm font-bold text-grey-1">{club.name}</h3>
                      <span className="text-[10px] font-medium text-grey-2 bg-grey-5 px-2 py-0.5 rounded-full">{club.category}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-grey-2 mb-3 leading-relaxed">{club.description}</p>
                <div className="flex items-center gap-1 text-[11px] text-grey-3">
                  <Users className="w-3 h-3" />
                  {club.members} members
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-10">
            <div className="w-20 h-20 bg-grey-5 rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-grey-3">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <p className="text-sm text-grey-2 mb-6">
              No user club has been created so far, when someone or your organization creates a club, they&apos;ll appear here
            </p>
            <button className="w-full py-2 border border-primary-1 text-primary-1 rounded-lg text-sm font-medium hover:bg-primary-5 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Create a club
            </button>
          </div>
        )}
      </div>
    </div>
    );
  };

  const renderFeed = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F9FA]">
      <div className="p-4 bg-white border-b border-grey-4 flex items-center gap-3">
        {!isLeftColumnOpen && (
          <button onClick={() => setIsLeftColumnOpen(true)} className="text-grey-2 hover:text-grey-1 p-1 border border-grey-4 rounded-md bg-white flex-shrink-0">
            <PanelLeftOpen size={14} strokeWidth={1.5} />
          </button>
        )}
        <h2 className="text-[16px] font-bold text-grey-1">Feed {activeHashtag && <span className="text-primary-1 font-medium ml-1">{activeHashtag}</span>}</h2>
        {activeHashtag && (
          <button onClick={() => setActiveHashtag(null)} className="ml-auto text-xs text-primary-1 hover:underline">Clear Filter</button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="max-w-[600px] mx-auto space-y-6">
          {/* Create Post */}
          <div className="bg-white p-4 rounded-xl border border-grey-4">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0">
                <Image src="https://picsum.photos/seed/opeyemi/100/100" alt="User" fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <textarea 
                  placeholder="Share a workout, milestone, or wellness tip..." 
                  className="w-full resize-none outline-none text-sm pt-2 text-grey-1 placeholder:text-grey-3"
                  rows={2}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                {postImage && (
                  <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden border border-grey-4">
                    <Image src={postImage} alt="Upload preview" fill className="object-cover" />
                    <button 
                      onClick={() => setPostImage(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                )}
                {postLocation && (
                  <div className="flex items-center gap-1 text-xs text-primary-1 mt-2 bg-primary-5 px-2 py-1 rounded-md w-fit">
                    <MapPin className="w-3 h-3" />
                    {postLocation}
                    <button onClick={() => setPostLocation(null)} className="ml-1 hover:text-primary-2">
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-grey-4">
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                <button onClick={() => fileInputRef.current?.click()} className="text-grey-2 hover:text-grey-1"><ImageIcon className="w-5 h-5" /></button>
                <button className="text-grey-2 hover:text-grey-1"><Video className="w-5 h-5" /></button>
                <button onClick={handleShareLocation} className="text-grey-2 hover:text-grey-1"><MapPin className="w-5 h-5" /></button>
              </div>
              <button onClick={handleCreatePost} disabled={!postContent.trim() && !postImage && !postLocation} className="px-6 py-2 bg-primary-5 text-primary-1 font-medium text-sm rounded-lg hover:bg-primary-1 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          {posts.filter(post => !activeHashtag || post.hashtags.includes(activeHashtag)).map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-grey-4 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image src={post.avatar} alt={post.user} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-grey-1">{post.user}</h3>
                        {post.badge && (
                          <span className="text-[10px] font-medium text-primary-1 bg-primary-5 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {post.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-grey-3">{post.email} · {post.time}</p>
                    </div>
                  </div>
                  {post.user === "Opeyemi Adegboye" && (
                    <button onClick={() => setDeleteConfirmPostId(post.id)} className="text-grey-3 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-grey-1 mb-4 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                  {post.hashtags && (
                    <>
                      <br/><br/>
                      <span className="text-primary-1">{post.hashtags}</span>
                    </>
                  )}
                </p>
              </div>
              
              {post.image && (
                <div className="relative w-full h-[400px]">
                  <Image src={post.image} alt="Post image" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-grey-2 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-primary-1 flex items-center justify-center border border-white z-10">
                        <Heart className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border border-white">
                        <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    </div>
                    <span>{post.likes} likes</span>
                  </div>
                  <div className="flex gap-3">
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-b border-grey-4 mb-4">
                  <button 
                    onClick={() => setPosts(posts.map(p => p.id === post.id ? {...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1} : p))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${post.isLiked ? 'text-primary-1' : 'text-grey-2 hover:bg-grey-5 rounded-lg'}`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-primary-1' : ''}`} />
                    Like
                  </button>
                  <button 
                    onClick={() => setExpandedComments(prev => prev.includes(post.id) ? prev.filter(id => id !== post.id) : [...prev, post.id])}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Comment
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors">
                    <Bookmark className="w-5 h-5" />
                    Save
                  </button>
                </div>

                {expandedComments.includes(post.id) && post.commentsList && post.commentsList.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {post.commentsList.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                          <Image src={comment.avatar} alt={comment.user} fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 bg-grey-5 rounded-xl p-3 relative group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-grey-1">{comment.user}</span>
                            <span className="text-[10px] text-grey-3">{comment.time}</span>
                          </div>
                          <p className="text-sm text-grey-2">{comment.content}</p>
                          {comment.isMe && (
                            <button 
                              onClick={() => setDeleteConfirmComment({postId: post.id, commentId: comment.id})}
                              className="absolute top-2 right-2 text-grey-3 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                    <Image src="https://picsum.photos/seed/opeyemi/100/100" alt="User" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      className="w-full pl-4 pr-10 py-2 bg-white border border-grey-4 rounded-full text-sm focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          handleAddComment(post.id, e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-1" 
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input && input.value.trim()) {
                          handleAddComment(post.id, input.value);
                          input.value = "";
                        }
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClubView = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA] relative">
      <div className="p-5 bg-white border-b border-grey-4 flex items-center gap-2 sticky top-0 z-20 w-full">
        <button onClick={() => setSelectedClub(null)} className="flex items-center gap-2 text-sm font-bold text-grey-1 hover:text-primary-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Go back to Feed
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative">
        {/* Sticky Club Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-grey-4 pb-[12px] pt-[20px] px-[20px]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-[20px] font-medium text-grey-1 leading-[30px]">Yogo Club</h1>
            <div className="flex items-center gap-1 text-xs text-grey-3">
              <Users className="w-3 h-3" />
              30 members
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden relative">
                  <Image src={`https://picsum.photos/seed/user${i}/100/100`} alt="Member" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-grey-2 leading-relaxed">
            Join our vibrant yoga club where passionate practitioners come together to enhance their skills and share their love for yoga.
          </p>
        </div>

        {myClubsList.some(c => c.id === selectedClub) ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 space-y-6 px-[20px] py-[20px] bg-[#FAFAFA]">
              {messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0">
                    <Image src={msg.avatar} alt={msg.user} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-grey-1">{msg.user}</span>
                      <span className="text-xs text-grey-3">› {msg.time}</span>
                    </div>
                    <div className="text-xs text-grey-3 mb-2">{msg.role}</div>
                    <div className={`text-sm text-grey-1 pl-3 border-l-2 ${msg.isMe ? 'border-green-500' : 'border-primary-1'}`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Chat Input */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-grey-4 p-4 flex items-center gap-3">
              <input 
                type="file" 
                ref={chatFileInputRef} 
                className="hidden" 
                accept="image/*,video/*" 
                onChange={handleChatFileUpload} 
              />
              <button className="w-10 h-10 rounded-xl border border-grey-4 flex items-center justify-center text-grey-3 hover:bg-grey-5 transition-colors shrink-0">
                <Sticker className="w-5 h-5" />
              </button>
              <div className="relative flex items-center">
                <button 
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="w-10 h-10 rounded-xl border border-grey-4 flex items-center justify-center text-grey-3 hover:bg-grey-5 transition-colors shrink-0"
                >
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
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="w-full h-10 px-4 bg-white border border-grey-4 rounded-full text-sm focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                />
              </div>
              <button className="w-10 h-10 rounded-xl bg-[#F2C9A8] flex items-center justify-center text-white hover:bg-[#e8b890] transition-colors shrink-0" onClick={handleSendMessage}>
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
            <p className="text-sm text-grey-2 mb-6 max-w-sm">
              You need to join this club to see the messages and participate in the conversation.
            </p>
            <button 
              onClick={() => {
                const club = suggested.find(c => c.id === selectedClub);
                if (club) {
                  setMyClubsList([...myClubsList, club]);
                  setSuggested(suggested.filter(c => c.id !== selectedClub));
                }
              }}
              className="px-6 py-2 bg-primary-1 text-white font-medium text-sm rounded-lg hover:bg-primary-2 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Join Club
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderRightColumn = () => (
    <div className="w-[320px] border-l border-grey-4 bg-[#ffffff] p-6 overflow-y-auto no-scrollbar h-full">
      {/* Activity Card */}
      <div className="bg-gradient-to-br from-[#F27D26] to-[#FFB780] rounded-xl p-5 mb-6 text-white shadow-sm">
        <h3 className="text-[16px] font-bold mb-1">Your Activity This Week</h3>
        <p className="text-xs text-white/80 mb-6">Keep the momentum going!</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-lg mb-1">🏃</div>
            <div className="text-lg font-bold">42,800</div>
            <div className="text-[10px] text-white/80">Steps</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-lg mb-1">✍️</div>
            <div className="text-lg font-bold">3</div>
            <div className="text-[10px] text-white/80">Posts</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-lg mb-1">🤍</div>
            <div className="text-lg font-bold">28</div>
            <div className="text-[10px] text-white/80">Likes Given</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-lg mb-1">👥</div>
            <div className="text-lg font-bold">2 joined</div>
            <div className="text-[10px] text-white/80">Groups</div>
          </div>
        </div>
      </div>

      {/* Trending Card */}
      <div className="bg-white rounded-xl border border-grey-4 p-5">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-1" />
          <h3 className="text-[16px] font-bold text-grey-1">Trending in Wellness</h3>
        </div>
        
        <div className="space-y-5">
          {trendingTopics.map((topic, index) => (
            <div key={topic.id} className="flex items-start justify-between cursor-pointer group" onClick={() => { setActiveHashtag(topic.tag); setSelectedClub(null); }}>
              <div className="flex gap-3">
                <span className="text-sm font-medium text-grey-3 w-4">{index + 1}</span>
                <div>
                  <div className="text-sm font-bold text-grey-1 group-hover:text-primary-1 transition-colors">{topic.tag}</div>
                  <div className="text-xs text-grey-3">{topic.posts} posts</div>
                </div>
              </div>
              <Flame className={`w-4 h-4 ${index === 0 ? 'text-primary-1' : index === 1 ? 'text-purple-500' : index === 2 || index === 3 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-[calc(100vh-64px)] -m-[20px] bg-white overflow-hidden">
        {renderLeftColumn()}
        {selectedClub ? renderClubView() : renderFeed()}
        {renderRightColumn()}
      </div>

      {/* Join Club Modal */}
      {clubToJoin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-grey-1 mb-2">Join Club</h3>
            <p className="text-sm text-grey-2 mb-6">Are you sure you want to join this club?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setClubToJoin(null)} className="px-4 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg">Cancel</button>
              <button onClick={() => handleJoinClub(clubToJoin)} className="px-4 py-2 text-sm font-medium bg-primary-1 text-white hover:bg-primary-1/90 rounded-lg">Join</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmPostId}
        onClose={() => setDeleteConfirmPostId(null)}
        onConfirm={() => deleteConfirmPostId && handleDeletePost(deleteConfirmPostId)}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete Post"
        isDestructive
      />

      <ConfirmModal
        isOpen={!!deleteConfirmComment}
        onClose={() => setDeleteConfirmComment(null)}
        onConfirm={() => deleteConfirmComment && handleDeleteComment(deleteConfirmComment.postId, deleteConfirmComment.commentId)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        isDestructive
      />
    </>
  );
}
