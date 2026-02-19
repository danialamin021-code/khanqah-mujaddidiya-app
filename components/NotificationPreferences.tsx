"use client";

import { useState, useEffect } from "react";
import { updateNotificationPreferences, getNotificationPreferences } from "@/app/actions/notification-preferences";
import { toast } from "sonner";

export default function NotificationPreferences() {
  const [announcements, setAnnouncements] = useState(true);
  const [events, setEvents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    getNotificationPreferences().then((prefs) => {
      if (prefs) {
        setAnnouncements(prefs.notifyAnnouncements);
        setEvents(prefs.notifyEvents);
      }
      setInitialized(true);
    });
  }, []);

  async function handleChange(
    key: "announcements" | "events",
    value: boolean
  ) {
    if (key === "announcements") setAnnouncements(value);
    else setEvents(value);
    setLoading(true);
    const result = await updateNotificationPreferences(
      key === "announcements" ? { notifyAnnouncements: value } : { notifyEvents: value }
    );
    setLoading(false);
    if (result.success) {
      toast.success("Preferences saved");
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  }

  if (!initialized) return <p className="text-sm text-foreground/60">Loading…</p>;

  return (
    <div className="mt-4 space-y-4">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={announcements}
          onChange={(e) => handleChange("announcements", e.target.checked)}
          disabled={loading}
          className="h-4 w-4 rounded border-green-soft text-muted-gold"
        />
        <span className="text-sm text-foreground/90">Email me about new announcements</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={events}
          onChange={(e) => handleChange("events", e.target.checked)}
          disabled={loading}
          className="h-4 w-4 rounded border-green-soft text-muted-gold"
        />
        <span className="text-sm text-foreground/90">Email me about event reminders</span>
      </label>
    </div>
  );
}
