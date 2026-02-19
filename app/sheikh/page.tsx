import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { SHEIKH_CONFIG } from "@/lib/constants/sheikh";

export default function SheikhPage() {
  const { name, title, image, bioFull } = SHEIKH_CONFIG;
  return (
    <main className="min-h-full px-4 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/home" className="text-sm font-medium text-deep-green/80 hover:text-deep-green">
          ← Home
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-normal text-deep-green">
          {title}
        </h1>
        <p className="mt-1 text-foreground/70">
          {name}
        </p>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="relative aspect-square w-48 shrink-0 overflow-hidden rounded-2xl bg-light-green">
            <SafeImage
              src={image}
              alt=""
              fill
              className="object-cover object-center contrast-[1.08] brightness-[0.92]"
              sizes="192px"
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-2xl" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-normal text-deep-green">
              Introduction
            </h2>
            <p className="mt-3 text-foreground/90 leading-relaxed">
              {bioFull}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
