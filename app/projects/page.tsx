import Link from "next/link";
import Image from "next/image";
import { PROJECTS } from "@/lib/constants/projects";

/**
 * Projects overview. Cards link to dedicated project screens.
 * Using shared projects image; add per-project images under /assets/Projects/ when available.
 */
const PROJECT_CARD_IMAGE = "/assets/Home/home.png";

export default function ProjectsPage() {
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/home" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
          ← Home
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          Our Projects
        </h1>
        <p className="mt-3 text-foreground/80 leading-relaxed">
          Markaz-e-Mujaddidiyya under Professor Dr. Waseem Ahmed Farooqi works across education, spiritual guidance, and community outreach. Below is a brief overview of key projects.
        </p>
        <ul className="mt-8 space-y-4">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className="block overflow-hidden rounded-2xl border border-green-soft bg-light-green/50 transition-colors duration-200 hover:bg-light-green"
              >
                <div className="relative aspect-[2/1] w-full bg-light-green/80">
                  <Image
                    src={PROJECT_CARD_IMAGE}
                    alt=""
                    fill
                    className="object-cover object-center contrast-[1.1] brightness-[0.9]"
                    sizes="(max-width: 672px) 100vw, 672px"
                  />
                  <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden />
                </div>
                <div className="p-5">
                  <span className="font-heading font-normal text-deep-green">{p.name}</span>
                  <p className="mt-2 text-sm text-foreground/75">{p.short}</p>
                  <span className="mt-2 inline-block text-sm font-medium text-deep-green">Read more →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
