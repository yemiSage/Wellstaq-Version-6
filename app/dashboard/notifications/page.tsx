"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "@/services/api";
import type { NotificationItem } from "@/types/api";

function notificationHref(notification: NotificationItem) {
  if (!notification.referenceId) return null;
  if (notification.referenceType === "event") return `/dashboard/events/${notification.referenceId}`;
  if (notification.referenceType === "challenge") return `/dashboard/challenges/${notification.referenceId}`;
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.notifications.list({ limit: 100 });
      setNotifications(response.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadNotifications(); }, [loadNotifications]);

  const openNotification = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await api.notifications.markRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, isRead: true } : item
      )));
    }
    const href = notificationHref(notification);
    if (href) router.push(href);
  };

  const markAllRead = async () => {
    await api.notifications.markAllRead();
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  const hasUnread = notifications.some((notification) => !notification.isRead);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">Review invitations and updates from your organization.</p>
        </div>
        <button type="button" onClick={markAllRead} disabled={!hasUnread} className="inline-flex h-10 items-center gap-2 rounded-lg border border-grey-4 bg-white px-4 text-sm font-medium text-grey-1 hover:bg-grey-5 disabled:opacity-50">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-grey-4 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-lg bg-grey-5" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <Bell className="h-8 w-8 text-grey-3" />
            <p className="text-sm text-grey-2">You don&apos;t have any notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-grey-4">
            {notifications.map((notification) => {
              const href = notificationHref(notification);
              return (
                <button key={notification.id} type="button" onClick={() => void openNotification(notification)} className={`flex w-full gap-3 px-5 py-4 text-left ${href ? "hover:bg-grey-5" : "cursor-default"}`}>
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-grey-4" : "bg-primary-1"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-grey-1">{notification.body}</span>
                    <span className="mt-1 block text-xs text-grey-3">{new Date(notification.createdAt).toLocaleString()}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
