import { getTeachersForModule } from "@/lib/data/modules";

export default async function ModuleTeacherCard({ moduleId }: { moduleId: string }) {
  const teachers = await getTeachersForModule(moduleId);
  if (teachers.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-sm font-normal text-deep-green">
        Assigned Teacher{teachers.length > 1 ? "s" : ""}
      </h2>
      <ul className="mt-3 space-y-2">
        {teachers.map((t) => (
          <li key={t.id} className="text-sm text-foreground/90">
            <span className="font-medium text-deep-green/90">{t.fullName}</span>
            {t.email && (
              <span className="ml-2 text-foreground/70">({t.email})</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-foreground/60">
        Contact your teacher for guidance and questions about this module.
      </p>
    </section>
  );
}
