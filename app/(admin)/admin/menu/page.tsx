"use client";

import { ExternalLink, UtensilsCrossed, FileText } from "lucide-react";
import { motion } from "framer-motion";

/* ── Easing ── */
const cinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Menu links as used in the Farmpop popup ── */
const menuLinks = [
  {
    label: "Farm to Table Menu",
    description: "Seasonally updated dinner menu designed in Canva",
    url: "https://www.canva.com/design/DAGeTBdVvOg/vQ3NaFI2Qs-bFpCAq0CXOA/view",
  },
  {
    label: "Café Menu",
    description: "Breakfast and café offerings designed in Canva",
    url: "https://www.canva.com/design/DAGiEeB8GHg/XoLKcZn5yPY2-lv1OOKHQg/view",
  },
];

export default function MenuPage() {
  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: cinematic }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/10 flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 text-[var(--olivea-olive)]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--olivea-ink)] tracking-tight">
            Food Menu
          </h1>
          <p className="text-xs text-[var(--olivea-clay)]">
            Menus are designed in Canva and displayed via the Farmpop popup
          </p>
        </div>
      </div>

      {/* ── Info card ── */}
      <div className="rounded-2xl bg-[var(--olivea-cream)]/30 border border-[var(--olivea-olive)]/10 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--olivea-olive)]" />
          <span className="text-sm font-semibold text-[var(--olivea-ink)]">
            How menus work
          </span>
        </div>
        <p className="text-sm text-[var(--olivea-clay)] leading-relaxed">
          The public site displays menus through the Farmpop popup component, which embeds
          Canva design links. Visitors click the menu button on the Farm to Table or Café pages
          to see the current menu in a modal overlay. To update a menu, edit the design directly
          in Canva — changes appear immediately on the site.
        </p>
      </div>

      {/* ── Menu links ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Current Menu Links
        </h2>
        {menuLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-4 rounded-2xl p-5
              bg-white/60 backdrop-blur-sm border border-[var(--olivea-olive)]/[0.06]
              hover:bg-white/80 hover:border-[var(--olivea-olive)]/[0.12]
              hover:shadow-[0_4px_20px_rgba(94,118,88,0.06)]
              transition-all group
            "
          >
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--olivea-ink)] group-hover:text-[var(--olivea-olive)] transition-colors">
                {link.label}
              </h3>
              <p className="text-xs text-[var(--olivea-clay)] mt-0.5">{link.description}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[var(--olivea-olive)]/30 group-hover:text-[var(--olivea-olive)]/60 transition-colors flex-shrink-0" />
          </a>
        ))}
      </div>

      <p className="text-xs text-stone-400 text-center pt-2">
        To change menu links, update the Farmpop component configuration in the codebase.
      </p>
    </motion.div>
  );
}
