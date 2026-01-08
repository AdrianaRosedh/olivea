'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "Is breakfast included?",
    a: "Yes — a seasonal continental breakfast is included daily for two people at Olivea Café.",
  },
  {
    q: "Do you allow children or pets?",
    a: "Casa Olivea is adults-only (18+). Pets are not allowed in rooms.",
  },
  {
    q: "Can I use the paddle courts?",
    a: "Yes — guests have free access to the courts from 8am–6pm, with reservation.",
  },
  {
    q: "Do you offer airport pickup?",
    a: "Not directly, but we can recommend trusted local drivers.",
  },
  {
    q: "Are you part of the Michelin Guide?",
    a: "Yes — Casa Olivea is listed in the Michelin Guide, and our restaurant holds a Michelin Star and Green Star.",
  },
];

export default function ModernFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="space-y-4 mt-6">
      {faqs.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          viewport={{ once: true }}
          className="rounded-xl border border-black/5 p-4 bg-transparent backdrop-blur-sm"
        >
          <button
            onClick={() => toggle(i)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-semibold text-gray-800 text-base">
              {item.q}
            </span>
            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
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
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
