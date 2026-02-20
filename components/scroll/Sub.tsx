"use client";

import Reveal, { type RevealPreset } from "@/components/scroll/Reveal";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  children: React.ReactNode;
  /** reveal style */
  preset?: RevealPreset;
  delay?: number;
  /** min block height to avoid cramped look (tune per page) */
  minH?: number; // px
  className?: string;
};

export default function Sub({
  id,
  children,
  preset = "up",
  delay = 0,
  minH = 120,
  className = "",
}: Props) {
  return (
    <Reveal preset={preset} delay={delay} className={cn("snap-center", className)}>
      <div
        id={id}
        className={cn(
          "subsection leading-relaxed md:text-lg",
          // ✅ Olivea default text
          "text-(--olivea-olive)"
        )}
        style={minH ? { minHeight: minH } : undefined}
      >
        {children}
      </div>
    </Reveal>
  );
}