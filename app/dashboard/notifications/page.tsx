"use client";

import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { notificationGroups } from "@/lib/workspace-activity";

export default function NotificationsPage() {
  const [activeGroup, setActiveGroup] = useState(notificationGroups[0].group);
  const [readNotificationTitles, setReadNotificationTitles] = useState<Set<string>>(() => new Set());
  const selectedGroup = notificationGroups.find((group) => group.group === activeGroup) ?? notificationGroups[0];
  const hasUnreadNotifications = notificationGroups.some((group) => group.items.some((item) => item.unread && !readNotificationTitles.has(item.title)));

  const markAllRead = () => {
    setReadNotificationTitles(new Set(notificationGroups.flatMap((group) => group.items.map((item) => item.title))));
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title !font-bold">Notifications</h1>
          <p className="text-sm text-grey-2">Review workspace updates grouped by system, team, wellness, and events.</p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={!hasUnreadNotifications}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-grey-4 bg-white px-4 text-sm font-medium text-grey-1 hover:bg-grey-5 disabled:cursor-default disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-grey-4 bg-white">
        <div className="overflow-x-auto border-b border-grey-4 px-5">
          <div className="flex min-w-max gap-2" role="tablist" aria-label="Notification categories">
            {notificationGroups.map((group) => (
              (() => {
                const Icon = group.icon;
                return (
                  <button
                    key={group.group}
                    type="button"
                    role="tab"
                    aria-selected={activeGroup === group.group}
                    onClick={() => setActiveGroup(group.group)}
                    className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeGroup === group.group
                        ? "border-primary-1 text-primary-1"
                        : "border-transparent text-grey-2 hover:text-grey-1"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {group.group}
                  </button>
                );
              })()
            ))}
          </div>
        </div>

        <div className="divide-y divide-grey-4">
          {selectedGroup.items.map((item) => {
            const isUnread = item.unread && !readNotificationTitles.has(item.title);

            return (
              <article key={item.title} className="flex gap-3 px-5 py-4">
                <span className={`mt-2 h-2 w-2 rounded-full ${isUnread ? "bg-primary-1" : "bg-grey-4"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="flex h-8 items-center text-sm font-semibold leading-4 text-grey-1">{item.title}</h3>
                    <span className="shrink-0 text-xs text-grey-3">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-grey-2">{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
