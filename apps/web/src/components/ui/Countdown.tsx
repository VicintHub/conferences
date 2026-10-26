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

  return (
    <div
      role="timer"
      aria-label="Countdown to the conference"
      className={cn("flex", variant === "hero" ? "justify-center gap-5" : "gap-5")}
    >
      {units.map(([label, value]) => (
        <div
          key={label}
          className={cn(
            "flex flex-col text-white",
            variant === "hero" ? "size-[120px] items-center justify-center rounded-[10px] border border-white/20" : "items-start",
          )}
        >
          <span className={cn("font-display font-bold leading-none tabular-nums", variant === "hero" ? "text-[56px]" : "text-[44px]")}>
            {value}
          </span>
          <span
            className={cn(
              "font-semibold uppercase tracking-[0.12em] text-cobalt-300",
              variant === "hero" ? "mt-2 text-xs" : "mt-1 text-[10px]",
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
