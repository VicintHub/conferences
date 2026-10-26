"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const EVENT_START = "2027-01-19T17:00:00+01:00";

export function remaining(target: number, now: number) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  target?: string;
  /** "card" = compact app card on cobalt; "hero" = large boxed desktop hero. */
  variant?: "card" | "hero";
};

export function Countdown({ target = EVENT_START, variant = "card" }: Props) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = now === null ? null : remaining(end, now);
  const units = [
    ["Days", t ? (variant === "hero" ? pad(t.days) : String(t.days)) : "--"],
    [variant === "hero" ? "Hours" : "Hrs", t ? pad(t.hours) : "--"],
    [variant === "hero" ? "Minutes" : "Min", t ? pad(t.minutes) : "--"],
    [variant === "hero" ? "Seconds" : "Sec", t ? pad(t.seconds) : "--"],
  ] as const;

  const hero = variant === "hero";

  return (
    <div
      role="timer"
      aria-label="Countdown to the conference"
      className={cn(hero ? "grid w-full grid-cols-4 gap-2 md:flex md:w-auto md:justify-center md:gap-3.5" : "flex gap-5")}
    >
      {units.map(([label, value]) => (
        <div
          key={label}
          className={cn(
            "flex flex-col text-white",
            hero
              ? "items-center gap-1 rounded-[10px] border border-white/20 bg-cobalt-950/40 py-3 md:w-[120px] md:py-[18px]"
              : "items-start",
          )}
        >
          <span
            className={cn(
              "font-display leading-none tabular-nums",
              hero ? "text-[30px] font-semibold md:text-[52px]" : "text-[44px] font-bold",
            )}
          >
            {value}
          </span>
          <span
            className={cn(
              hero
                ? "text-[11px] font-medium text-cobalt-200 md:text-xs"
                : "mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cobalt-300",
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
