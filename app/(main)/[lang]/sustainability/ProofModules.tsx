"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const blockV: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

export function SignalsRow({ items }: { items?: string[] }) {
  if (!items?.length) return null;

  return (
    <motion.div
      variants={blockV}
      className="flex flex-wrap gap-2"
      style={{ willChange: "transform, opacity" }}
    >
      {items.map((x) => (
        <span
          key={x}
          className={cn(
            "px-3 py-1 rounded-full text-[12px]",
            "bg-white/30 ring-1 ring-(--olivea-olive)/12",
            "text-(--olivea-olive) opacity-90"
          )}
        >
          {x}
        </span>
      ))}
    </motion.div>
  );
}

export function PracticesCard({
  title,
  items,
  className,
  style,
}: {
  title: string;
  items?: string[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const hasItems = !!items?.length;

  return (
    <motion.div
      variants={blockV}
      className={cn(
        "rounded-2xl bg-white/40 ring-1 ring-(--olivea-olive)/12 p-5",
        "shadow-[0_14px_34px_rgba(40,60,35,0.10)]",
        className
      )}
      style={{ willChange: "transform, opacity", ...style }}
    >
      <div className="text-[11px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-70">
        {title}
      </div>

      {hasItems ? (
        <ul className="mt-3 space-y-2 text-[14px] text-(--olivea-clay) leading-relaxed">
          {items!.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="opacity-40">—</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 text-[14px] text-(--olivea-clay) opacity-55">
          {/* subtle placeholder so the card never looks “broken” */}
          —
        </div>
      )}
    </motion.div>
  );
}
