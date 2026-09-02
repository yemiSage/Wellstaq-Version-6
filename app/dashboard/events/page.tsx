"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Calendar, Users, TrendingUp, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CreateEventModal } from "@/components/events/create-event-modal";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";
import { hasPermission } from "@/lib/permissions";
import { api } from "@/services/api";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/stat-card";
import { SelectablePill } from "@/components/ui/selectable-pill";
import type { EventItem } from "@/types/api";

const TABS = ["All Events", "scheduled", "ongoing", "completed", "cancelled"] as const;
const TAB_LABELS: Record<string, string> = {
  "All Events": "All Events",
  scheduled: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Canceled",
};

export default function EventsPage() {
  const { organizationId, currentUser } = useDashboardData();
  const { scope } = useDashboardScope();

  const [activeTab, setActiveTab] = useState<string>("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmEventId, setDeleteConfirmEventId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const branchId = scope.type === "branch" ? scope.branchId : undefined;
  const canCreate = currentUser ? hasPermission(currentUser.permissions, "event.create", branchId) : false;
  const canUpdate = currentUser ? hasPermission(currentUser.permissions, "event.update", branchId) : false;
  const canDelete = currentUser ? hasPermission(currentUser.permissions, "event.delete", branchId) : false;

  const loadEvents = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    try {
      const res = await api.organization.getEvents(organizationId, {
        branchId,
        offset: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      });
      setEvents(res.items);
      setTotal(res.total);
    } catch {
      // error toast handled globally
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, branchId, currentPage]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, branchId]);

  // Client-side filter for tab + search since backend list endpoint doesn't
  // filter by status/title. If this list grows large, ask backend to add
  // `status` and `q` query params instead of filtering client-side.
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All Events" || event.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const stats = {
    totalEvents: total,
    upcomingEvents: events.filter((e) => e.status === "scheduled").length,
    completedEvents: events.filter((e) => e.status === "completed").length,
    totalParticipants: events.reduce((acc, e) => acc + (e.participantCount ?? 0), 0),
  };

  const dashboardStats = [
    { title: "Total Events", value: stats.totalEvents.toString(), icon: <Users className="w-5 h-5" />, iconClassName: "bg-pink-100 text-pink-500" },
    { title: "Upcoming Events", value: stats.upcomingEvents.toString(), icon: <TrendingUp className="w-5 h-5" />, iconClassName: "bg-purple-100 text-purple-500" },
    { title: "Completed Events", value: stats.completedEvents.toString(), icon: <Calendar className="w-5 h-5" />, iconClassName: "bg-blue-100 text-blue-500" },
    { title: "Total Participants", value: stats.totalParticipants.toString(), icon: <Users className="w-5 h-5" />, iconClassName: "bg-green-100 text-green-500" },
  ];

  const handleDeleteEvent = async (id: string) => {
    if (!organizationId) return;
    try {
      await api.organization.deleteEvent(organizationId, id);
      toast.success("Event deleted successfully");
      await loadEvents();
    } catch {
      // error toast handled globally
    } finally {
      setDeleteConfirmEventId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-[20px] pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-0">
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-description">Discover, Manage and join events across your organization.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#C45700] text-white font-medium text-sm rounded-lg hover:bg-[#C45700]/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px] mb-0">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
          />
        ))}
      </div>

      <div className="bg-white rounded-[12px] p-6 flex flex-col gap-[20px] border border-grey-4">
        {/* Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="relative w-full xl:w-[320px] xl:shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <input
              type="text"
              placeholder="Search Event"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-4 w-full rounded-lg border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>
          <div className="flex w-full items-center gap-0 overflow-x-auto pb-2 xl:w-auto xl:pb-0 no-scrollbar">
            {TABS.map((tab) => (
              <SelectablePill
                key={tab}
                onClick={() => setActiveTab(tab)}
                selected={activeTab === tab}
                appearance="plain"
                className="whitespace-nowrap"
              >
                {TAB_LABELS[tab]}
              </SelectablePill>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[220px] bg-grey-5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEvents.map((event) => (
                <Link href={`/dashboard/events/${event.id}`} key={event.id} className="bg-[#FAFAFA] rounded-lg border border-[#F0F0F0] overflow-hidden flex flex-col p-2 gap-2 h-[220px] cursor-pointer relative">
                  <div className="relative h-[85px] w-full rounded-lg overflow-hidden shrink-0 bg-grey-4">
                    {event.imageUrl && (
                      <Image src={event.imageUrl} alt={event.title} fill className="object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 px-1 pb-2 pt-0 gap-[17px]">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-[#4D4D4D] text-[14px] leading-[20px] line-clamp-1">{event.title}</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-[12px] leading-[18px] text-[#999999]">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-[12px] leading-[18px] text-[#999999]">
                          <Clock className="w-3.5 h-3.5" />
                          {event.time}
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[12px] leading-[18px] text-[#999999]">
                        {event.participantCount ?? 0} participant{event.participantCount !== 1 ? "s" : ""}
                      </span>
                      {(canUpdate || canDelete) && (
                        <div className="relative" onClick={(e) => e.preventDefault()}>
                          <button className="text-[#999999] hover:text-grey-1 p-1 rounded-md hover:bg-grey-4 transition-colors peer">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-full right-0 mb-1 w-36 bg-white border border-grey-4 rounded-lg shadow-lg opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all z-10 flex flex-col py-1">
                            {canDelete && (
                              <button
                                onClick={() => setDeleteConfirmEventId(event.id)}
                                className="px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50 w-full"
                              >
                                Delete event
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-grey-4 mt-4">
                <div className="text-[14px] leading-[20px] text-[#1A1A1A]">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, total)} of {total} events
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50">
                    <ChevronsLeft className="w-4 h-4 text-[#626262]" /> First
                  </button>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4 text-[#626262]" /> Back
                  </button>
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center transition-colors ${
                          currentPage === page ? "bg-[#C45700] text-white" : "hover:bg-grey-5 text-grey-2"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50">
                    Next <ChevronRight className="w-4 h-4 text-[#626262]" />
                  </button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-2 rounded bg-[#FAFAFA] text-[14px] leading-[20px] text-[#1A1A1A] hover:bg-grey-5 flex items-center justify-center gap-1 h-[36px] disabled:opacity-50">
                    Last <ChevronsRight className="w-4 h-4 text-[#626262]" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="empty-state-icon w-16 h-16 bg-grey-5 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-grey-1 mb-2">No event found</h3>
            <p className="text-sm text-grey-2 mb-8 max-w-md text-center">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={loadEvents}
      />

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
