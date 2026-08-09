// path: components/events/edit-event-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import type { EventItem } from "@/types/api";

export function EditEventModal({
  isOpen,
  onClose,
  event,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  onUpdated: (updated: EventItem) => void;
}) {
  const { organizationId } = useDashboardData();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [startDate, setStartDate] = useState(event.startDate);
  const [time, setTime] = useState(event.time);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(event.title);
    setDescription(event.description ?? "");
    setStartDate(event.startDate);
    setTime(event.time);
  }, [isOpen, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    setIsSubmitting(true);
    try {
      const updated = await api.organization.updateEvent(organizationId, event.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        time,
      });
      toast.success("Event updated successfully");
      onUpdated(updated);
      onClose();
    } catch {
      // error toast handled globally
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event"
      subtitle="Update the event details."
      footer={
        <>
          <Button type="button" variant="outline" className="border-grey-4 bg-white text-grey-2 hover:bg-grey-5" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-event-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </>
      }
    >
      <form id="edit-event-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editEventTitle">Event title</Label>
          <Input id="editEventTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editEventDate">Date</Label>
            <Input id="editEventDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editEventTime">Time</Label>
            <Input id="editEventTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="editEventDescription">Description</Label>
          <textarea
            id="editEventDescription"
            className="w-full p-4 rounded-[8px] border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 min-h-[100px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}