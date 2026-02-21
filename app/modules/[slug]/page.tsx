import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LEARNING_MODULES, MODULE_IMAGES } from "@/lib/constants/modules";
import type { ModuleSlug } from "@/lib/constants/modules";
import { getModuleBySlug } from "@/lib/data/modules";
import { getActiveRoleForServer, getAssignedModuleIds } from "@/lib/auth";
import ModuleEnrollButton from "./ModuleEnrollButton";
import ModuleBatchesSection from "./ModuleBatchesSection";
import { LiveSessionsBlock } from "@/components/LiveSessionsBlock";
import { getActiveBatchesForModule } from "@/lib/data/batches";
import ModuleTeacherCard from "@/components/ModuleTeacherCard";

const PLACEHOLDER_DESCRIPTION: Record<ModuleSlug, string> = {
  tafseer: "Study of Quranic exegesis and understanding the meanings of the Holy Quran in the light of tradition and reason.",
  ahadees: "Learning the sayings and teachings of the Prophet (peace be upon him) with chain of narration and context.",
  fiqah: "Islamic jurisprudence — understanding rulings and their evidence in a structured, respectful manner.",
  tajweed: "Correct recitation of the Quran with proper pronunciation and rules of recitation.",
  "seerat-e-tayyabah": "The life and character of the Prophet (peace be upon him) — a model for spiritual and practical life.",
  "sunnat-e-rasul": "The way and practice of the Messenger (peace be upon him) in worship, conduct, and daily life.",
  zikar: "Remembrance of Allah — practices and etiquettes of devotional remembrance.",
  "zikar-e-lataif": "Remembrance through the subtle centres — an advanced spiritual practice under guidance.",
  muraqbah: "Spiritual vigilance and self-observation under the guidance of a qualified teacher.",
};

/** Placeholder when no sessions in DB. */
const PLACEHOLDER_SCHEDULE = [
  { day: "Saturday", time: "10:00 AM", topic: "Main session" },
  { day: "Sunday", time: "10:00 AM", topic: "Review & Q&A" },
  { day: "Wednesday", time: "4:00 PM", topic: "Optional support" },
];

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module_ = LEARNING_MODULES.find((m) => m.slug === slug);
  if (!module_) notFound();

  const [dbModule, activeRole, assignedIds, sessionsRes, isEnrolled, moduleBatches] = await Promise.all([
    getModuleBySlug(slug),
    getActiveRoleForServer(),
    getAssignedModuleIds(),
    (async () => {
      const mod = await getModuleBySlug(slug);
      if (!mod) return [];
      const supabase = await createClient();
      if (!supabase) return [];
      const { data } = await supabase
        .from("module_sessions")
        .select("date, time, topic, status")
        .eq("module_id", mod.id)
        .order("date", { ascending: true })
        .limit(10);
      return (data ?? []) as { date: string; time: string | null; topic: string | null; status: string }[];
    })(),
    (async () => {
      const mod = await getModuleBySlug(slug);
      if (!mod) return false;
      const supabase = await createClient();
      if (!supabase) return false;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data: batches } = await supabase
        .from("batches")
        .select("id")
        .eq("module_id", mod.id)
        .eq("is_active", true);
      const batchIds = (batches ?? []).map((b) => (b as { id: string }).id);
      if (batchIds.length === 0) return false;
      const { data } = await supabase
        .from("batch_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("enrollment_status", "active")
        .in("batch_id", batchIds)
        .limit(1)
        .maybeSingle();
      return !!data;
    })(),
    (async () => {
      const mod = await getModuleBySlug(slug);
      if (!mod) return [];
      return getActiveBatchesForModule(mod.id);
    })(),
  ]);
  const moduleId = dbModule?.id ?? null;
  const isTeacherOfModule = moduleId && assignedIds.includes(moduleId);
  const isAdmin = activeRole === "admin";

  const description = PLACEHOLDER_DESCRIPTION[module_.slug];
  const bannerImage = MODULE_IMAGES[module_.slug];

  const scheduleRows =
    sessionsRes.length > 0
      ? sessionsRes.map((s) => ({
          day: formatDay(s.date),
          time: s.time ? String(s.time).slice(0, 5) : "—",
          topic: s.topic ?? "Session",
        }))
      : PLACEHOLDER_SCHEDULE;

  return (
    <main className="min-h-full">
      {/* Top banner: same image as home card, dark overlay, gold title */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64">
        <Image
          src={bannerImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="font-heading text-3xl font-normal text-[var(--muted-gold)] drop-shadow-md sm:text-4xl md:text-5xl">
            {module_.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 md:py-10">
        <Link
          href="/modules"
          className="text-sm font-medium text-deep-green/80 hover:text-deep-green"
        >
          ← All modules
        </Link>

        <section className="mt-6 rounded-2xl border border-green-soft bg-light-green/50 p-6">
          <h2 className="font-heading text-sm font-normal text-deep-green">
            About this module
          </h2>
          <p className="mt-3 text-foreground/90 leading-relaxed">
            {description}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-heading text-sm font-normal text-deep-green">
            Weekly schedule
          </h2>
          <p className="mt-1 text-sm text-foreground/70">
            {sessionsRes.length > 0 ? "Upcoming sessions." : "Placeholder — actual timings will be shared after enrollment."}
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-green-soft -mx-2 px-2 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[280px] text-sm">
              <thead>
                <tr className="border-b border-green-soft bg-light-green/60">
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Day</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-deep-green">Topic</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)]">
                {scheduleRows.map((row, i) => (
                  <tr key={i} className="border-b border-green-soft/80 last:border-0">
                    <td className="px-4 py-3 text-foreground/90">{row.day}</td>
                    <td className="px-4 py-3 text-foreground/90">{row.time}</td>
                    <td className="px-4 py-3 text-foreground/90">{row.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {moduleId && (
          <section className="mt-8">
            <LiveSessionsBlock moduleId={moduleId} />
          </section>
        )}

        {(activeRole === "student" || (!isTeacherOfModule && !isAdmin)) && moduleId && (
          <ModuleTeacherCard moduleId={moduleId} />
        )}

        {isTeacherOfModule && (
          <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-sm font-normal text-deep-green">
              Teacher Panel
            </h2>
            <p className="mt-2 text-sm text-foreground/80">
              You teach this module. Manage sessions, students, and resources.
            </p>
            <Link
              href={`/teacher/${slug}`}
              className="mt-4 inline-block rounded-lg bg-muted-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
            >
              Open Teacher Panel →
            </Link>
          </section>
        )}

        {isAdmin && (
          <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-sm font-normal text-deep-green">
              Admin
            </h2>
            <p className="mt-2 text-sm text-foreground/80">
              Manage module, assign teachers, edit sessions and announcements.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/modules"
                className="rounded-lg bg-deep-green/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-deep-green"
              >
                Module Management
              </Link>
              <Link
                href={`/admin/assignments?module=${slug}`}
                className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
              >
                Assign Teacher
              </Link>
              <Link
                href={`/teacher/${slug}`}
                className="rounded-lg border border-green-soft px-4 py-2 text-sm font-medium text-deep-green transition-colors hover:bg-light-green/50"
              >
                Teacher View
              </Link>
            </div>
          </section>
        )}

        <ModuleBatchesSection
          batches={moduleBatches.map((b) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            start_date: b.start_date,
            end_date: b.end_date,
          }))}
        />

        <div className="mt-10">
          <ModuleEnrollButton
            moduleName={module_.name}
            batches={moduleBatches.map((b) => ({
              id: b.id,
              name: b.name,
              whatsapp_group_link: b.whatsapp_group_link,
            }))}
            isEnrolled={isEnrolled}
          />
        </div>
      </div>
    </main>
  );
}
