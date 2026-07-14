"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Search, Plus, Calendar, Users, TrendingUp, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, X, ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useClickOutside } from "@/hooks/use-click-outside";

export default function EventsPage() {
  const { events: sourceEvents, participantOptions: PARTICIPANT_OPTIONS, activeBranch } = useDashboardData();
  const [activeTab, setActiveTab] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState(sourceEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalParticipants: 0
  });

  const updateStats = useCallback((branch: string, eventData: typeof sourceEvents) => {
    const branchEvents = eventData.filter(e => e.branch === branch);
    const upcoming = branchEvents.filter(e => e.status === 'Upcoming').length;
    const completed = branchEvents.filter(e => e.status === 'Completed').length;
    const participants = branchEvents.reduce((acc, e) => acc + e.participants, 0);

    setStats({
      totalEvents: branchEvents.length,
      upcomingEvents: upcoming,
      completedEvents: completed,
      totalParticipants: participants
    });
  }, []);

  useEffect(() => {
    setEvents(sourceEvents);
    setCurrentPage(1);
    updateStats(activeBranch, sourceEvents);
  }, [activeBranch, sourceEvents, updateStats]);

  const dashboardStats = [
    {
      title: "Total Events",
      value: stats.totalEvents.toString(),
      trend: "+4 this month",
      icon: <Users className="w-5 h-5 text-pink-500" />,
      iconBg: "bg-pink-100",
      trendColor: "text-green-500"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      trend: "+21%",
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      iconBg: "bg-purple-100",
      trendColor: "text-green-500"
    },
    {
      title: "Completed Events",
      value: stats.completedEvents.toString(),
      trend: "+12",
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      iconBg: "bg-blue-100",
      trendColor: "text-green-500"
    },
    {
      title: "Total Participants",
      value: stats.totalParticipants.toString(),
      trend: "+8",
      icon: <Users className="w-5 h-5 text-green-500" />,
      iconBg: "bg-green-100",
      trendColor: "text-green-500"
    }
  ];

  const [isParticipantDropdownOpen, setIsParticipantDropdownOpen] = useState(false);
  const participantDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(participantDropdownRef, () => setIsParticipantDropdownOpen(false));
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [deleteConfirmEventId, setDeleteConfirmEventId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All Events" || event.status === activeTab;
    const matchesBranch = event.branch === activeBranch;
    return matchesSearch && matchesTab && matchesBranch;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(pId => pId !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    await api.resources.mutate({ resource: "events", action: "delete", id });
    setEvents(events.filter(e => e.id !== id));
    setDeleteConfirmEventId(null);
    toast.success("Event deleted successfully");
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-[20px] pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-0">
        <div>
          <h1 className="text-[20px] font-medium text-grey-1 mb-[6px] leading-[30px]">My Events</h1>
          <p className="text-sm text-grey-2">Discover, Manage and join events across your organization.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#E65100] text-white font-medium text-sm rounded-lg hover:bg-[#E65100]/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px] mb-0">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-[14px] rounded-[12px] border border-grey-4">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <div className={`text-xs font-medium flex items-center gap-1 ${stat.trendColor}`}>
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div className="text-sm font-medium text-grey-2 mb-1">{stat.title}</div>
            <div className="text-2xl font-bold text-grey-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[12px] p-6 flex flex-col gap-[20px] border border-grey-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input 
              type="text" 
              placeholder="Search Event" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9 pr-4 w-full rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {["All Events", "Upcoming", "Completed", "Canceled"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? "bg-white border border-[#E65100] text-[#E65100]" 
                    : "bg-white border border-grey-4 text-grey-2 hover:bg-grey-5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {paginatedEvents.length > 0 ? (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginatedEvents.map((event) => (
                <Link href={`/dashboard/events/${event.id}`} key={event.id} className="bg-[#FAFAFA] rounded-lg border border-[#F0F0F0] overflow-hidden flex flex-col p-2 gap-2 h-[220px] cursor-pointer relative">
                  <div className="relative h-[85px] w-full rounded-lg overflow-hidden shrink-0">
                    <Image src={event.image} alt={event.title} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col flex-1 px-1 pb-2 pt-0 gap-[17px]">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-[#4D4D4D] text-[14px] leading-[20px] line-clamp-1">{event.title}</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-[12px] leading-[18px] text-[#999999]">
                          <Calendar className="w-3.5 h-3.5" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1 text-[12px] leading-[18px] text-[#999999]">
                          <Clock className="w-3.5 h-3.5" />
                          {event.time}
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-[18px] h-[18px] rounded-full border-[0.3191px] border-[#EA6A05] overflow-hidden relative">
                              <Image src={`https://picsum.photos/seed/user${i}/100/100`} alt="Participant" fill className="object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[12px] leading-[18px] text-[#999999] ml-1">{event.participants} participant{event.participants !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="relative" onClick={(e) => e.preventDefault()}>
                        <button className="text-[#999999] hover:text-grey-1 p-1 rounded-md hover:bg-grey-4 transition-colors peer">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-full right-0 mb-1 w-36 bg-white border border-grey-4 rounded-lg shadow-lg opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all z-10 flex flex-col py-1">
                          <button className="px-3 py-1.5 text-left text-sm text-grey-1 hover:bg-grey-5 w-full">Edit event</button>
                          <button className="px-3 py-1.5 text-left text-sm text-grey-1 hover:bg-grey-5 w-full">Add member</button>
                          <button 
                            onClick={() => setDeleteConfirmEventId(event.id)}
                            className="px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50 w-full"
                          >
                            Delete event
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-grey-4 mt-4">
                <div className="text-[14px] leading-[20px] text-[#373737]">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
                  >
                    <ChevronsLeft className="w-4 h-4 text-[#626262]" /> First
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#626262]" /> Back
                  </button>
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
                          currentPage === page 
                            ? "bg-[#E65100] text-white" 
                            : "hover:bg-grey-5 text-grey-2"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
                  >
                    Next <ChevronRight className="w-4 h-4 text-[#626262]" />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#373737] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50"
                  >
                    Last <ChevronsRight className="w-4 h-4 text-[#626262]" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-[#E65100]" />
            </div>
            <h3 className="text-xl font-bold text-grey-1 mb-2">No event found</h3>
            <p className="text-sm text-grey-2 mb-8 max-w-md text-center">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-grey-4 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-grey-1">Create New Event</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-grey-5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-grey-2" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-grey-1 mb-1">Event Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter event title"
                    className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#E65100] text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-grey-1 mb-1">Date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#E65100] text-sm text-grey-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-grey-1 mb-1">Time <span className="text-red-500">*</span></label>
                    <input 
                      type="time" 
                      className="w-full h-10 px-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#E65100] text-sm text-grey-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-grey-1 mb-1">Description</label>
                  <textarea 
                    placeholder="Enter event description"
                    className="w-full p-3 rounded-lg border border-grey-4 focus:outline-none focus:ring-2 focus:ring-[#E65100] text-sm min-h-[100px] resize-none"
                  />
                </div>

                <div className="relative" ref={participantDropdownRef}>
                  <label className="block text-sm font-medium text-grey-1 mb-1">Add Participants</label>
                  <button 
                    type="button"
                    onClick={() => setIsParticipantDropdownOpen(!isParticipantDropdownOpen)}
                    className="w-full h-10 px-3 rounded-lg border border-grey-4 flex items-center justify-between text-sm text-grey-2 bg-white"
                  >
                    {selectedParticipants.length > 0 
                      ? `${selectedParticipants.length} selected` 
                      : "Select departments or individuals"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isParticipantDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-grey-4 rounded-lg shadow-xl z-20 max-h-[300px] overflow-y-auto p-2">
                      <div className="p-2 border-b border-grey-4 mb-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey-3" />
                          <input type="text" placeholder="Search..." className="w-full h-8 pl-8 pr-3 text-xs border border-grey-4 rounded focus:outline-none" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold text-grey-3 uppercase tracking-wider">Departments</div>
                        {PARTICIPANT_OPTIONS.filter(o => o.type === 'department').map(option => (
                          <button
                            key={option.id}
                            onClick={() => toggleParticipant(option.id)}
                            className="w-full flex items-center justify-between p-2 hover:bg-grey-5 rounded transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                              <span className="text-sm text-grey-1">{option.name}</span>
                            </div>
                            {selectedParticipants.includes(option.id) && <Check className="w-4 h-4 text-[#E65100]" />}
                          </button>
                        ))}
                        
                        <div className="px-2 py-1 text-[10px] font-bold text-grey-3 uppercase tracking-wider mt-2">Individuals</div>
                        {PARTICIPANT_OPTIONS.filter(o => o.type === 'user').map(option => (
                          <button
                            key={option.id}
                            onClick={() => toggleParticipant(option.id)}
                            className="w-full flex items-center justify-between p-2 hover:bg-grey-5 rounded transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                <Image src={option.avatar!} alt={option.name} fill className="object-cover" />
                              </div>
                              <span className="text-sm text-grey-1">{option.name}</span>
                            </div>
                            {selectedParticipants.includes(option.id) && <Check className="w-4 h-4 text-[#E65100]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedParticipants.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedParticipants.map(id => {
                      const option = PARTICIPANT_OPTIONS.find(o => o.id === id);
                      return (
                        <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-grey-5 border border-grey-4 rounded-md text-xs text-grey-1">
                          {option?.name}
                          <button onClick={() => toggleParticipant(id)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-grey-4">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-grey-2 hover:bg-grey-5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await api.resources.mutate({ resource: "events", action: "create", payload: { branch: activeBranch, participantIds: selectedParticipants } });
                    toast.success("Event created successfully");
                    setIsCreateModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#E65100] text-white font-medium text-sm rounded-lg hover:bg-[#E65100]/90 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmEventId !== null}
        onClose={() => setDeleteConfirmEventId(null)}
        onConfirm={() => deleteConfirmEventId && handleDeleteEvent(deleteConfirmEventId)}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
