"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { entrance } from "@/components/scroll/Reveal";

export type FAQItem = {
  q: string;
  a: React.ReactNode;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * With `initialCount`, only the first questions show and a quiet button opens
 * the rest in place: a page with 18–20 questions read as a wall. Every
 * question still reaches search engines and AI assistants through the page's
 * FAQ JSON-LD and server-rendered article, which list them all.
 */
export default function ModernFAQ({
  items,
  initialCount,
  moreLabel,
}: {
  items: FAQItem[];
  initialCount?: number;
  /** Button text for the rest, e.g. "Ver las 18 preguntas". */
  moreLabel?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const limited = !showAll && initialCount != null && items.length > initialCount + 1;
  const visible = limited ? items.slice(0, initialCount) : items;

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className="space-y-4 mt-6">
      {visible.map((item, i) => {
        const open = openIndex === i;

        return (
          <motion.div
            key={`${i}-${item.q}`}
            {...entrance(Math.min(i % 6, 5) * 0.04)}
            className="
              rounded-xl border border-black/10
              bg-white/10 backdrop-blur-sm
              shadow-[0_10px_30px_-20px_rgba(0,0,0,0.18)]
              overflow-hidden
            "
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="
                flex items-center justify-between w-full text-left
                px-5 py-4
              "
              aria-expanded={open}
            >
              <span className="font-semibold text-(--olivea-ink) text-base">
                {item.q}
              </span>

              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                aria-hidden="true"
                className="shrink-0"
              >
                <ChevronDown className="w-5 h-5 text-(--olivea-olive)" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <div className="px-5 pb-5 pt-0">
                    <div className="h-px w-full bg-black/10 mb-4" />
                    <div className="text-sm leading-relaxed space-y-2 text-(--olivea-ink)">
                      {item.a}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {limited && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 rounded-full border border-(--olivea-olive)/30 px-5 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-(--olivea-olive) hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
          >
            {moreLabel ?? `+ ${items.length - visible.length}`}
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}