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
  minH = 180,                   // ↓ lower default to reduce big voids
  className = "",
}: Props) {
  return (
    <Reveal preset={preset} delay={delay} className={cn("snap-center", className)}>
      {/* the content block IS the subsection and carries the id */}
      <div
        id={id}
        className="subsection leading-relaxed text-black/75 md:text-lg"
        style={{ minHeight: minH }}
      >
        {children}
      </div>
    </Reveal>
  );
}