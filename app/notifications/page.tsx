import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getNotificationsForUser,
  type NotificationRow,
} from "@/lib/data/notifications";
import NotificationActions from "./NotificationActions";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString();
}

function getNotificationLink(n: NotificationRow): string | null {
  const meta = n.metadata as Record<string, unknown>;
  if (meta?.batchId) return `/batches/${meta.batchId}`;
  if (meta?.moduleSlug) return `/modules/${meta.moduleSlug}`;
  if (meta?.announcementId) return "/announcements";
  if (meta?.requestType === "bayat") return "/admin/requests";
  if (meta?.requestType === "admin" || meta?.requestType === "teacher")
    return "/admin/approvals";
  return null;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/home");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { notifications, totalCount } = await getNotificationsForUser(1);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/home"
        className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
      >
        ← Back
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Notifications
        </h1>
        {totalCount > 0 && (
          <NotificationActions
            unreadCount={
              notifications.filter((n) => !n.read_at).length
            }
          />
        )}
      </div>

      <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/30 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-foreground/70">
            No notifications yet. You will see updates about modules, sessions,
            enrollments, and more here.
          </div>
        ) : (
          <ul className="divide-y divide-green-soft/60">
            {notifications.map((n) => {
              const href = getNotificationLink(n);
              const isUnread = !n.read_at;
              const content = (
                <div className="p-4">
                  <p
                    className={`text-sm font-medium ${
                      isUnread ? "text-deep-green" : "text-foreground/90"
                    }`}
                  >
                    {n.title ?? "Notification"}
                  </p>
                  {n.body && (
                    <p className="mt-1 text-sm text-foreground/80">{n.body}</p>
                  )}
                  <p className="mt-2 text-xs text-foreground/50">
                    {formatDate(n.created_at)}
                  </p>
                </div>
              );

              return (
                <li
                  key={n.id}
                  className={isUnread ? "bg-light-green/20" : ""}
                >
                  {href ? (
                    <Link
                      href={href}
                      className="block transition-colors hover:bg-light-green/30"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {totalCount > 30 && (
        <p className="mt-4 text-center text-xs text-foreground/60">
          Showing latest 30 of {totalCount}
        </p>
      )}
    </main>
  );
}
