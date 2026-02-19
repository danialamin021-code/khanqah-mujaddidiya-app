"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useActiveRole } from "@/components/ActiveRoleProvider";
import { LEARNING_MODULES } from "@/lib/constants/modules";
import EssentialsPanel from "@/components/home/EssentialsPanel";
import ModuleCard from "@/components/home/ModuleCard";
import IntroSlider from "@/components/home/IntroSlider";
import AssignedModulesCard from "@/components/home/AssignedModulesCard";

export interface AssignedModule {
  slug: string;
  title: string;
}

export default function HomePageContent({
  assignedModules,
  teacherName,
  reportsSection,
  newsSection,
}: {
  assignedModules: AssignedModule[];
  teacherName?: string;
  reportsSection: React.ReactNode;
  newsSection: React.ReactNode;
}) {
  const { activeRole } = useActiveRole();

  const essentialsSection = (
    <section key="essentials" className="px-4 py-6 md:py-8">
      <div className="mx-auto max-w-4xl">
        <EssentialsPanel />
      </div>
    </section>
  );

  const sliderSection = (
    <section key="slider" className="border-t border-light-green bg-light-green/30 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-xl font-normal text-deep-green">Introduction</h2>
        <div className="mt-6">
          <IntroSlider />
        </div>
      </div>
    </section>
  );

  const modulesSection = (
    <section key="modules" className="border-t border-light-green bg-[var(--background)] px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-xl font-normal text-deep-green">Learning Modules</h2>
        <p className="mt-1 text-sm text-foreground/70">
          Choose a module to explore. Enroll when you are ready.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
          {LEARNING_MODULES.map((m) => (
            <ModuleCard key={m.slug} slug={m.slug} name={m.name} />
          ))}
        </div>
        <p className="mt-6 text-center">
          <Link href="/modules" className="text-sm font-medium text-deep-green hover:underline">
            View all modules →
          </Link>
        </p>
      </div>
    </section>
  );

  const assignedSection = assignedModules.length > 0 && (
    <AssignedModulesCard key="assigned" modules={assignedModules} teacherName={teacherName} />
  );

  let sections: React.ReactNode[];
  if (activeRole === "admin") {
    sections = [essentialsSection, sliderSection, <Fragment key="reports">{reportsSection}</Fragment>, <Fragment key="news">{newsSection}</Fragment>];
  } else if (activeRole === "teacher") {
    sections = [
      essentialsSection,
      assignedSection,
      sliderSection,
      <Fragment key="news">{newsSection}</Fragment>,
    ].filter(Boolean);
  } else {
    sections = [essentialsSection, modulesSection, sliderSection, <Fragment key="news">{newsSection}</Fragment>];
  }

  return (
    <main className="min-h-full">
      {sections}
      <footer className="border-t border-light-green px-4 py-6">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-foreground/70">
            A space for guided learning. Reach out when you are ready.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/onboarding" className="font-medium text-deep-green/90 hover:text-deep-green">
              First time? Start here
            </Link>
            <Link href="/modules" className="font-medium text-deep-green/90 hover:text-deep-green">
              Learning Modules
            </Link>
            <Link href="/contact" className="font-medium text-deep-green/90 hover:text-deep-green">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
