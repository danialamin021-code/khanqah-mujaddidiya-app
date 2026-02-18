import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/constants/projects";

const PLACEHOLDER_DETAIL: Record<string, { description: string; work: string; efforts: string; progress: string }> = {
  markaz: {
    description: "Markaz-e-Mujaddidiyya serves as the central hub for learning, Bayat, and ongoing guidance under Professor Dr. Waseem Ahmed Farooqi.",
    work: "Structured programmes in Quran, Hadith, Fiqah, and spiritual disciplines; one-to-one guidance where appropriate.",
    efforts: "Volunteers and teachers support the Markaz under the Sheikh’s direction. All work is human-led and reviewed.",
    progress: "Ongoing. New batches and modules are added as capacity allows.",
  },
  education: {
    description: "Education and curriculum development for students at different levels, from foundations to advanced studies.",
    work: "Course design, materials, and assessments in Tafseer, Ahadees, Fiqah, Tajweed, Seerat, and related subjects.",
    efforts: "Teachers and scholars contribute under the supervision of the Sheikh. Quality and authenticity are prioritised.",
    progress: "Curriculum is updated regularly. Progress is tracked per student (see Student Dashboard).",
  },
  outreach: {
    description: "Outreach and publications to make authentic knowledge and spiritual guidance accessible to a wider audience.",
    work: "Books, recorded lectures, and digital resources; coordination with other institutions where beneficial.",
    efforts: "Content is prepared and reviewed by qualified scholars. No automated or AI-generated religious content.",
    progress: "Steady. New publications and resources are released as they are ready.",
  },
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();
  const detail = PLACEHOLDER_DETAIL[slug] ?? {
    description: "Details for this project will be added here.",
    work: "—",
    efforts: "—",
    progress: "—",
  };

  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/projects" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
          ← Our Projects
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          {project.name}
        </h1>
        <section className="mt-8 space-y-6">
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-sm font-normal text-deep-green">Description</h2>
            <p className="mt-2 text-foreground/90 leading-relaxed">{detail.description}</p>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-sm font-normal text-deep-green">Work</h2>
            <p className="mt-2 text-foreground/90 leading-relaxed">{detail.work}</p>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-sm font-normal text-deep-green">Efforts</h2>
            <p className="mt-2 text-foreground/90 leading-relaxed">{detail.efforts}</p>
          </div>
          <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
            <h2 className="font-heading text-sm font-normal text-deep-green">Progress</h2>
            <p className="mt-2 text-foreground/90 leading-relaxed">{detail.progress}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
