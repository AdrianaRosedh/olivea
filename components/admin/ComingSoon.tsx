"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        flex flex-col items-center justify-center
        py-24 rounded-2xl
        bg-white/40 backdrop-blur-sm
        border border-dashed border-[var(--olivea-olive)]/[0.1]
      "
    >
      <div className="
        w-14 h-14 rounded-2xl
        bg-[var(--olivea-cream)]/60
        border border-[var(--olivea-olive)]/[0.08]
        flex items-center justify-center mb-5
      ">
        <Construction size={24} className="text-[var(--olivea-olive)]/50" />
      </div>
      <h2 className="text-lg font-medium text-[var(--olivea-ink)]">{title}</h2>
      <p className="text-sm text-[var(--olivea-clay)] mt-2 max-w-sm text-center">
        This section is coming next. The foundation is ready — we just need to build the editor UI.
      </p>
    </motion.div>
  );
}
