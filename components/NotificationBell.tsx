"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationRow,
} from "@/app/actions/notifications";

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function getNotificationLink(n: NotificationRow): string | null {
  const meta = n.metadata as Record<string, unknown>;
  if (meta?.batchId) return `/batches/${meta.batchId}`;
  if (meta?.moduleId) return `/modules/${meta.moduleSlug ?? ""}`;
  if (meta?.moduleSlug) return `/modules/${meta.moduleSlug}`;
  if (meta?.announcementId) return "/announcements";
  if (meta?.batchId) return `/batches/${meta.batchId}`;
  if (meta?.requestType === "bayat") return "/admin/requests";
  if (meta?.requestType === "admin") return "/admin/approvals";
  if (meta?.requestType === "teacher") return "/admin/approvals";
  return "/notifications";
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount);
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([getNotifications(1), getUnreadCount()]).then(
        ([{ notifications: n }, count]) => {
          setNotifications(n);
          setUnreadCount(count);
          setLoading(false);
        }
      );
    }
  }, [open]);

  async function handleMarkRead(n: NotificationRow) {
    await markNotificationRead(n.id);
    setNotifications((prev) =>
      prev.map((x) =>
        x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((x) => ({ ...x, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-2 text-[var(--nav-icon)] transition-colors hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
      >
        <Bell className="h-6 w-6" strokeWidth={2} aria-hidden />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white"
            aria-hidden
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,360px)] rounded-xl border border-green-soft bg-[var(--background)] shadow-xl"
          role="menu"
        >
          <div className="flex items-center justify-between border-b border-green-soft/60 px-4 py-3">
            <h2 className="font-heading text-sm font-medium text-deep-green">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-deep-green/80 hover:text-deep-green"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,400px)] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-foreground/70">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-foreground/70">
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-green-soft/40">
                {notifications.map((n) => {
                  const href = getNotificationLink(n);
                  const isUnread = !n.read_at;
                  const content = (
                    <div className="px-4 py-3 text-left">
                      <p
                        className={`text-sm font-medium ${
                          isUnread ? "text-deep-green" : "text-foreground/90"
                        }`}
                      >
                        {n.title ?? "Notification"}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-foreground/70">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-foreground/50">
                        {formatTimeAgo(n.created_at)}
                      </p>
                    </div>
                  );

                  return (
                    <li key={n.id}>
                      {href ? (
                        <Link
                          href={href}
                          onClick={() => {
                            if (isUnread) handleMarkRead(n);
                            setOpen(false);
                          }}
                          className={`block transition-colors hover:bg-light-green/30 ${
                            isUnread ? "bg-light-green/20" : ""
                          }`}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (isUnread) handleMarkRead(n);
                          }}
                          className={`block w-full text-left transition-colors hover:bg-light-green/30 ${
                            isUnread ? "bg-light-green/20" : ""
                          }`}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-green-soft/60 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-deep-green hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
