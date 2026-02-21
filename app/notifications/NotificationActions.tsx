"use client";

import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "@/app/actions/notifications";

export default function NotificationActions({
  unreadCount,
}: {
  unreadCount: number;
}) {
  const router = useRouter();

  if (unreadCount === 0) return null;

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleMarkAllRead}
      className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
    >
      Mark all as read
    </button>
  );
}
