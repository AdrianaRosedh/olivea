// app/(main)/[lang]/press/components/YearTabs.tsx
"use client";

import { cn } from "@/lib/utils";
import type { Lang } from "../pressTypes";
import { tt } from "../lib/pressText";

export default function YearTabs({
  lang,
  years,
  value,
  onChange,
  align = "right",
}: {
  lang: Lang;
  years: number[];
  value: number;
  onChange: (y: number) => void;
  align?: "right" | "left";
}) {
  if (!years.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        align === "right" ? "justify-start sm:justify-end" : "justify-start"
      )}
      aria-label={tt(lang, "Filtrar por año", "Filter by year")}
    >
      {years.map((y) => {
        const active = y === value;
        return (
          <button
            key={y}
            type="button"
            onClick={() => onChange(y)}
            className={cn(
              "inline-flex items-center rounded-full px-4 py-2 text-[12px]",
              "ring-1 transition",
              active
                ? "bg-(--olivea-olive) text-(--olivea-cream) ring-black/10"
                : "bg-white/30 text-(--olivea-olive) ring-(--olivea-olive)/14 hover:bg-white/40"
            )}
          >
            <span className="tabular-nums">{y}</span>
          </button>
        );
      })}
    </div>
  );
}
