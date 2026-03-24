"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar, Clock, MapPin, Users, Share2, Heart, CheckCircle2, Edit2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const EVENTS = [
  {
    id: 1,
    title: "Morning Yoga and Breathwork",
    date: "Every Monday",
    time: "2:00pm - 3:30pm",
    location: "Wellness Studio A",
    participants: 23,
    maxParticipants: 30,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Start your week right with our invigorating Morning Yoga and Breathwork session. This class is designed to awaken your body, clear your mind, and set a positive tone for the days ahead. We'll begin with gentle stretches, move into a flowing vinyasa sequence, and conclude with guided pranayama (breathwork) exercises.",
    host: {
      name: "Sarah Jenkins",
      role: "Lead Yoga Instructor",
      avatar: "https://picsum.photos/seed/sarah/100/100"
    }
  },
  {
    id: 2,
    title: "High-Intensity Interval Training",
    date: "Every Tuesday",
    time: "6:30am - 7:15am",
    location: "Main Gym",
    participants: 15,
    maxParticipants: 20,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&h=600&auto=format&fit=crop",
    description: "Push your limits with our High-Intensity Interval Training (HIIT) class. This fast-paced workout alternates between intense bursts of activity and fixed periods of less-intense active recovery or complete rest. It's the most efficient way to improve cardiovascular fitness and burn calories.",
    host: {
      name: "Marcus Thorne",
      role: "Fitness Coach",
      avatar: "https://picsum.photos/seed/marcus/100/100"
    }
  }
];

export default function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.id);
  
  // Find event or use a default one if not found (for mock purposes)
  const event = EVENTS.find(e => e.id === eventId) || {
    ...EVENTS[0],
    id: eventId,
    title: "Community Wellness Event",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&h=600&auto=format&fit=crop"
  };

  const [isJoined, setIsJoined] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleJoin = () => {
    setIsJoined(!isJoined);
    if (!isJoined) {
      toast.success("Successfully joined the event!");
    } else {
      toast.success("You have left the event.");
    }
  };

  const handleDelete = () => {
    toast.success("Event deleted successfully");
    setIsDeleteModalOpen(false);
    router.push("/dashboard/events");
  };

  const handleAction = (action: string) => {
    if (action === "Delete Event") {
      setIsDeleteModalOpen(true);
    } else {
      toast.info(`${action} modal would open here`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA]">
      <div className="p-5 bg-white border-b border-grey-4 flex items-center justify-between sticky top-0 z-20 w-full">
        <Link href="/dashboard/events" className="flex items-center gap-2 text-sm font-bold text-grey-1 hover:text-primary-1 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Back to Events
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleAction("Manage Members")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-grey-2 hover:text-grey-1 hover:bg-grey-5 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Manage Members
          </button>
          <button 
            onClick={() => handleAction("Edit Event")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-grey-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button 
            onClick={() => handleAction("Delete Event")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-grey-4 overflow-hidden shadow-sm">
          {/* Hero Image */}
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image 
              src={event.image} 
              alt={event.title} 
              fill 
              className="object-cover" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm transition-colors ${isLiked ? 'text-primary-1' : 'text-grey-2 hover:text-primary-1'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary-1' : ''}`} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-grey-2 hover:text-primary-1 shadow-sm transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1">
                <h1 className="text-[20px] font-medium text-grey-1 mb-4">{event.title}</h1>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-grey-2 bg-grey-5 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary-1" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-grey-2 bg-grey-5 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <Clock className="w-4 h-4 text-primary-1" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-grey-2 bg-grey-5 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <MapPin className="w-4 h-4 text-primary-1" />
                    {event.location}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-bold text-grey-1 mb-3">About this event</h2>
                  <p className="text-grey-2 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-grey-1 mb-4">Hosted by</h2>
                  <div className="flex items-center gap-4 p-4 border border-grey-4 rounded-xl">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0">
                      <Image src={event.host.avatar} alt={event.host.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="font-bold text-grey-1">{event.host.name}</h3>
                      <p className="text-sm text-grey-2">{event.host.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-[300px] shrink-0">
                <div className="bg-[#FAFAFA] border border-grey-4 rounded-xl p-6 sticky top-6">
                  <h3 className="font-bold text-grey-1 mb-4">Registration</h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-grey-2">Participants</span>
                    <span className="text-sm font-bold text-grey-1">{event.participants} / {event.maxParticipants}</span>
                  </div>
                  
                  <div className="w-full bg-grey-4 rounded-full h-2 mb-6">
                    <div 
                      className="bg-primary-1 h-2 rounded-full" 
                      style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex -space-x-2 mb-6">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                        <Image src={`https://picsum.photos/seed/user${i}/100/100`} alt="Participant" fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-grey-5 flex items-center justify-center text-[10px] font-bold text-grey-2 z-10">
                      +{event.participants - 5}
                    </div>
                  </div>

                  <button 
                    onClick={handleJoin}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                      isJoined 
                        ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100' 
                        : 'bg-primary-1 text-white hover:bg-primary-1/90'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        You're Going
                      </>
                    ) : (
                      'Join Event'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete Event"
        isDestructive
      />
    </div>
  );
}
