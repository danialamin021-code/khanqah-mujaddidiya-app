"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

/** Same aspect ratio for all slides (3:2). Images from /public/assets/Sliders/. */
const SLIDE_IMAGE_ASPECT = { w: 3, h: 2 };

const SLIDES = [
  {
    id: "sheikh",
    title: "Sheikh Introduction",
    copy: "Professor Dr. Waseem Ahmed Farooqi — a brief introduction to our guide and his tradition.",
    readMoreHref: "/sheikh",
    image: "/assets/Sliders/Sheikh.png",
  },
  {
    id: "projects",
    title: "Our Projects",
    copy: "Markaz-e-Mujaddidiyya under Prof. Dr. Waseem Ahmed Farooqi — an overview of ongoing work.",
    readMoreHref: "/projects",
    image: "/assets/Sliders/Our%20Projects.png",
  },
  {
    id: "bayat",
    title: "About Bayat",
    copy: "Understanding Bayat: its meaning, importance, and how it is performed with intention and care.",
    readMoreHref: "/bayat",
    image: "/assets/Sliders/Bayat.png",
  },
];

export default function IntroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <section className="rounded-2xl border border-green-soft bg-light-green/40 overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-[200px] md:min-h-[220px]">
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-normal text-deep-green">{slide.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-foreground/85">{slide.copy}</p>
          </div>
          <Link
            href={slide.readMoreHref}
            className="mt-4 inline-block text-sm font-medium text-deep-green hover:underline"
          >
            Read More
          </Link>
        </div>
        <div
          className="relative w-full shrink-0 bg-deep-green/15 md:w-52"
          style={{ aspectRatio: `${SLIDE_IMAGE_ASPECT.w} / ${SLIDE_IMAGE_ASPECT.h}` }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            className="object-cover object-center contrast-[1.1] brightness-[0.9]"
            sizes="(max-width: 768px) 100vw, 208px"
          />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden />
        </div>
      </div>
      <div className="flex justify-center gap-1.5 border-t border-green-soft/80 py-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === index ? "w-6 bg-muted-gold" : "w-2 bg-deep-green/30 hover:bg-deep-green/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
