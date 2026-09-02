// path: components/events/create-event-modal.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { useDashboardScope } from "@/lib/scope";

export function CreateEventModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { organizationId } = useDashboardData();
  const { scope } = useDashboardScope();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Same pattern as challenges: upload immediately on select, hold the
  // resulting mediaUrl, send that (not the file) on submit.
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const branchId = scope.type === "branch" ? scope.branchId : undefined;

  const reset = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setTime("");
    setImagePreview(null);
    setUploadedImageUrl(null);
    setIsUploadingImage(false);
    setGeneralError(null);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadedImageUrl(null);
    setIsUploadingImage(true);

    try {
      const { uploadUrl, mediaUrl } = await api.storage.requestUploadUrl({
        domain: "events",
        contentType: file.type,
      });

      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putResponse.ok) throw new Error("Upload failed");

      setUploadedImageUrl(mediaUrl);
    } catch {
      toast.error("Image upload failed. You can retry or create the event without an image.");
      setImagePreview(null);
      setUploadedImageUrl(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
  };

  const isValid = title.trim() && startDate && time && (scope.type === "branch" || branchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !isValid || !branchId) return;

    if (isUploadingImage) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);
    try {
      await api.organization.createEvent(organizationId, {
        branchId,
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: uploadedImageUrl ?? undefined,
        startDate,
        time,
      });
      toast.success("Event created successfully");
      reset();
      onCreated();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setGeneralError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      presentation="drawer"
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      subtitle="Fill in the details below to schedule a new event."
      footer={
        <>
          <Button type="button" variant="outline" className="border-grey-4 bg-white text-grey-2 hover:bg-grey-5" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-event-form" disabled={!isValid || isSubmitting || isUploadingImage}>
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </>
      }
    >
      <form id="create-event-form" onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{generalError}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="eventTitle">Event Title</Label>
          <Input id="eventTitle" placeholder="Enter event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Date</Label>
            <Input id="eventDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime">Time</Label>
            <Input id="eventTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventDescription">Description</Label>
          <textarea
            id="eventDescription"
            className="w-full p-4 rounded-[8px] border border-grey-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-1 min-h-[100px] resize-none"
            placeholder="Enter event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventImage">Event Image (optional)</Label>
          {imagePreview ? (
            <div className="relative h-[140px] w-full rounded-[8px] overflow-hidden border border-grey-4 bg-grey-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Event preview" className="h-full w-full object-cover" />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-grey-1 hover:bg-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="eventImage"
              className="flex h-[100px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-grey-4 bg-grey-5 text-grey-3 hover:border-primary-1 hover:text-primary-1"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs">Click to upload an image</span>
              <input id="eventImage" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
          )}
        </div>

        {scope.type !== "branch" && (
          <p className="text-xs text-grey-3 italic">Switch to a branch to create an event — every event must belong to one.</p>
        )}
      </form>
    </Modal>
  );
}
