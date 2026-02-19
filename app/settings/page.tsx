import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationPreferences from "@/components/NotificationPreferences";

export default function SettingsPage() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Settings
        </h1>
        <p className="mt-2 text-foreground/70">
          App and account preferences.
        </p>

        <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <h2 className="font-heading text-sm font-normal text-deep-green">Appearance</h2>
          <p className="mt-1 text-sm text-foreground/70">Choose light, dark, or follow system.</p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <h2 className="font-heading text-sm font-normal text-deep-green">Account</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Manage your profile, roles, and progress.
          </p>
          <Link
            href="/profile"
            className="mt-3 inline-block text-sm font-medium text-deep-green hover:underline"
          >
            Profile →
          </Link>
        </section>

        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <h2 className="font-heading text-sm font-normal text-deep-green">Notifications</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Choose when to receive email updates.
          </p>
          <NotificationPreferences />
        </section>
      </div>
    </main>
  );
}
