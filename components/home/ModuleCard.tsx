"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ScrollText,
  Scale,
  Mic,
  Heart,
  Star,
  Repeat,
  CircleDot,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { MODULE_IMAGES } from "@/lib/constants/modules";
import type { ModuleSlug } from "@/lib/constants/modules";

/** Lucide icon per module — single color, size via className. */
const MODULE_ICONS: Record<ModuleSlug, LucideIcon> = {
  tafseer: BookOpen,
  ahadees: ScrollText,
  fiqah: Scale,
  tajweed: Mic,
  "seerat-e-tayyabah": Heart,
  "sunnat-e-rasul": Star,
  zikar: Repeat,
  "zikar-e-lataif": CircleDot,
  muraqbah: Eye,
};

export default function ModuleCard({
  slug,
  name,
}: {
  slug: ModuleSlug;
  name: string;
}) {
  const Icon = MODULE_ICONS[slug] ?? BookOpen;
  const imageSrc = MODULE_IMAGES[slug];
  return (
    <Link
      href={`/modules/${slug}`}
      className="group flex min-h-[100px] items-stretch gap-0 overflow-hidden rounded-2xl border border-green-soft bg-light-green/50 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-deep-green/20 hover:bg-light-green hover:shadow-md active:scale-[0.99]"
    >
      {/* Left: icon + module name */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 p-3 text-center sm:gap-2 sm:p-4">
        <span
          className="text-deep-green transition-transform duration-200 group-hover:scale-110"
          aria-hidden
        >
          <Icon className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={2} />
        </span>
        <span className="font-heading text-xs font-normal text-deep-green leading-tight line-clamp-2 sm:text-sm">
          {name}
        </span>
      </div>
      {/* Right: clear module image (fixed aspect for consistent layout) */}
      <div className="relative w-20 shrink-0 sm:w-24 md:w-28" style={{ aspectRatio: "1" }}>
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover contrast-[1.08] brightness-[0.92]"
          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
        />
      </div>
    </Link>
  );
}