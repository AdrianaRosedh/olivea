"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type FAQItem = {
  q: string;
  a: React.ReactNode;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ModernFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className="space-y-4 mt-6">
      {items.map((item, i) => {
        const open = openIndex === i;

        return (
          <motion.div
            key={`${i}-${item.q}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: i * 0.04 }}
            viewport={{ once: true }}
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
              <span className="font-semibold text-oliveaText text-base">
                {item.q}
              </span>

              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                aria-hidden="true"
                className="shrink-0"
              >
                <ChevronDown className="w-5 h-5 text-oliveaMuted" />
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
                    <div className="text-sm leading-relaxed space-y-2 text-oliveaText/80">
                      {item.a}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}