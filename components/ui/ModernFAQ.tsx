"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type FAQItem = {
  q: string;
  a: React.ReactNode;
};

export default function ModernFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className="space-y-4 mt-6">
      {items.map((item, i) => (
        <motion.div
          key={`${i}-${item.q}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          viewport={{ once: true }}
          className="rounded-xl border border-black/5 p-4 bg-transparent backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => toggle(i)}
            className="flex items-center justify-between w-full text-left"
            aria-expanded={openIndex === i}
          >
            <span className="font-semibold text-gray-800 text-base">
              {item.q}
            </span>

            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            >
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mt-3 text-sm text-gray-700 leading-relaxed space-y-2">
                  {item.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}