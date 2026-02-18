"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Essentials: clock, prayer time, timezone, dates.
 * TODO: Integrate prayer times API; Hijri date library.
 * TODO: Replace placeholder with subtle background image from /public/assets/ when ready.
 */
const ESSENTIALS_BG = "/assets/Home/home.png";

export default function EssentialsPanel() {
  const [time, setTime] = useState("");
  const [dateGregorian, setDateGregorian] = useState("");
  const [tz, setTz] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateGregorian(now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-green-soft bg-light-green/50 p-4 shadow-sm">
      {/* Subtle background behind clock & prayer info — ratio matches panel, slight contrast and darkening */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden>
        <Image
          src={ESSENTIALS_BG}
          alt=""
          fill
          className="object-cover object-center contrast-[1.12] brightness-[0.9]"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
      <div className="relative">
        <p className="font-heading text-lg font-normal text-deep-green">Essentials</p>
      <p className="mt-2 text-2xl font-medium tabular-nums text-deep-green">{time || "—"}</p>
      <p className="mt-1 text-sm text-foreground/70">
        {/* TODO: Prayer times API — show current prayer name + time */}
        Current prayer: Fajr — 05:42
      </p>
      <p className="mt-1 text-xs text-foreground/60">{tz || "—"}</p>
      <p className="mt-2 text-sm text-foreground/70">{dateGregorian || "—"}</p>
      <p className="mt-0.5 text-xs text-foreground/60">
        {/* TODO: Hijri date */}
        Hijri: — 
      </p>
      </div>
    </div>
  );
}
