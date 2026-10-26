"use client";

import { cn } from "@/lib/cn";

type Option<T extends string> = { value: T; label: React.ReactNode };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
};

/** Pill-track segmented control. */
export function Segmented<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-full bg-ink-100 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold leading-none transition-[background-color,box-shadow,color] duration-200",
              "focus-visible:outline-none focus-visible:shadow-[var(--ring)]",
              active ? "bg-white text-cobalt-800 shadow-sm" : "text-ink-500",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
