import Link from "next/link";

/**
 * Settings placeholder. No logic yet.
 * TODO: Notifications, theme, language, etc. when required.
 */
export default function SettingsPage() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Settings
        </h1>
        <p className="mt-2 text-foreground/70">
          App and account settings. Options will appear here when available.
        </p>
        <div className="mt-8 rounded-2xl border border-green-soft bg-light-green/40 p-6">
          <p className="text-sm text-foreground/70">
            No settings to show yet. You can manage your account from{" "}
            <Link href="/profile" className="font-medium text-deep-green hover:underline">
              Profile
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
