import { LEARNING_MODULES } from "@/lib/constants/modules";
import ModuleCard from "@/components/home/ModuleCard";

export default function ModulesPage() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Learning Modules
        </h1>
        <p className="mt-2 text-foreground/80">
          Choose a module to explore. Tap to open and enroll when you are ready.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {LEARNING_MODULES.map((m) => (
            <ModuleCard key={m.slug} slug={m.slug} name={m.name} />
          ))}
        </div>
      </div>
    </main>
  );
}
