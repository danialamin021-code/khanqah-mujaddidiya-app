"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { PRAYER_DEFAULT_CITY, PRAYER_DEFAULT_COUNTRY } from "@/lib/constants/prayer";

const ESSENTIALS_BG = "/assets/Home/home.png";

const PRAYER_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function getCurrentPrayer(timings: Record<string, string>, now: Date): { name: string; time: string } | null {
  const pad = (n: number) => String(n).padStart(2, "0");
  const nowStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  for (let i = PRAYER_ORDER.length - 1; i >= 0; i--) {
    const name = PRAYER_ORDER[i];
    const time = timings[name];
    if (time && nowStr >= time) {
      return { name, time };
    }
  }
  const next = PRAYER_ORDER[0];
  return { name: next, time: timings[next] ?? "—" };
}

export default function EssentialsPanel() {
  const [time, setTime] = useState("");
  const [dateGregorian, setDateGregorian] = useState("");
  const [tz, setTz] = useState("");
  const [prayerInfo, setPrayerInfo] = useState<{ name: string; time: string } | null>(null);
  const [hijriDate, setHijriDate] = useState<string | null>(null);

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

  useEffect(() => {
    const city = process.env.NEXT_PUBLIC_PRAYER_CITY ?? PRAYER_DEFAULT_CITY;
    const country = process.env.NEXT_PUBLIC_PRAYER_COUNTRY ?? PRAYER_DEFAULT_COUNTRY;
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data?.data?.timings) {
          const now = new Date();
          setPrayerInfo(getCurrentPrayer(data.data.timings, now));
        }
        if (data?.data?.date?.hijri) {
          const h = data.data.date.hijri;
          setHijriDate(`${h.day} ${h.month?.en ?? ""} ${h.year ?? ""} AH`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-green-soft bg-light-green/50 p-4 shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden>
        <SafeImage
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
          {prayerInfo ? `Current prayer: ${prayerInfo.name} — ${prayerInfo.time}` : "Loading prayer times…"}
        </p>
        <p className="mt-1 text-xs text-foreground/60">{tz || "—"}</p>
        <p className="mt-2 text-sm text-foreground/70">{dateGregorian || "—"}</p>
        <p className="mt-0.5 text-xs text-foreground/60">
          Hijri: {hijriDate ?? "—"}
        </p>
      </div>
    </div>
  );
}
