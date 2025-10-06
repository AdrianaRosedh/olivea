"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/providers/ScrollProvider";

/* ── Types ───────────────────────────────────────────────────────── */
type Lenis = {
  scrollTo: (y: number, options?: { duration?: number; easing?: (t: number) => number }) => void;
};

type Identity = "casa" | "cafe" | "farmtotable";

export type NavOverride = Array<{
  id: string;
  label: string;
  subs?: Array<{ id: string; label: string }>;
}>;

interface DockLeftProps {
  identity: Identity;
  sectionsOverride: NavOverride; // required now
}

/* ── Constants ───────────────────────────────────────────────────── */
const TOP_OFFSET_PX = 120;  // navbar + breathing room
const CENTER_PAD_PX = 8;    // activation tolerance around center line

/* ── Helpers ─────────────────────────────────────────────────────── */
function centerYFor(el: HTMLElement, topOffset = TOP_OFFSET_PX) {
  const vh = window.innerHeight;
  const rect = el.getBoundingClientRect();
  const pageY = window.pageYOffset;
  const h = Math.max(el.offsetHeight, 1);
  const idealY = rect.top + pageY - (vh - h) / 2 - topOffset;
  const alignTop = rect.top + pageY - topOffset;
  return h > vh ? Math.max(0, alignTop) : Math.max(0, idealY);
}
function clampToMaxScroll(y: number) {
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(0, y), maxY);
}

/* ── Animations ──────────────────────────────────────────────────── */
const subContainerVariants = {
  open: {
    opacity: 1,
    height: "auto",
    marginTop: 8,
    transition: { when: "beforeChildren", staggerChildren: 0.05, ease: "easeInOut", duration: 0.3 },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { when: "afterChildren", ease: "easeInOut", duration: 0.2 },
  },
};
const subItemVariants = {
  open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  collapsed: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

/* ── Component ───────────────────────────────────────────────────── */
export default function DockLeft({ sectionsOverride }: DockLeftProps) {
  const lenis = useLenis() as Lenis | null;

  // left nav items (number, id, label)
  const items = useMemo(
    () => sectionsOverride.map((s, i) => ({ id: s.id, label: s.label, number: `0${i + 1}` })),
    [sectionsOverride]
  );

  // quick lookup for subsections & parent mapping
  const subsForSection = useCallback(
    (sectionId: string) => sectionsOverride.find((s) => s.id === sectionId)?.subs ?? [],
    [sectionsOverride]
  );
  const subToParent = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sectionsOverride) (s.subs ?? []).forEach((sub) => (map[sub.id] = s.id));
    return map;
  }, [sectionsOverride]);

  // Active/hover state
  const [activeSection, setActiveSection] = useState(items[0]?.id || "");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Centered smooth scroll on click
  const scrollToSection = useCallback(
    (id: string) => {
      const el =
        (document.querySelector<HTMLElement>(`.subsection#${id}`) as HTMLElement) ||
        (document.querySelector<HTMLElement>(`.main-section#${id}`) as HTMLElement) ||
        document.getElementById(id);
      if (!el) return;

      const y = clampToMaxScroll(centerYFor(el));
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(y, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 3) });
        setTimeout(() => { if (Math.abs(window.scrollY - y) > 10) window.scrollTo({ top: y, behavior: "auto" }); }, 180);
      } else {
        window.scrollTo({ top: y, behavior: "auto" });
      }
      if (window.location.hash.slice(1) !== id) window.history.replaceState(null, "", `#${id}`);
    },
    [lenis]
  );

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      scrollToSection(id);
    },
    [scrollToSection]
  );

  // Deep-link on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    // retry until element renders
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (!el && ++tries < 40) return setTimeout(tryScroll, 50);
      if (el) {
        const y = clampToMaxScroll(centerYFor(el));
        if (lenis && typeof lenis.scrollTo === "function") lenis.scrollTo(y, { duration: 0.8 });
        else window.scrollTo({ top: y, behavior: "auto" });
      }
    };
    tryScroll();
  }, [lenis]);

  // Active state based on centerline
  const updateActive = useCallback(() => {
    const mid = window.innerHeight / 2;

    // subsections first
    for (const subId of Object.keys(subToParent)) {
      const el = document.querySelector<HTMLElement>(`.subsection#${subId}`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid + CENTER_PAD_PX && r.bottom >= mid - CENTER_PAD_PX) {
        setActiveSub(subId);
        setActiveSection(subToParent[subId]);
        return;
      }
    }

    // mains next
    setActiveSub(null);
    for (const { id } of items) {
      const el = document.querySelector<HTMLElement>(`.main-section#${id}`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid + CENTER_PAD_PX && r.bottom >= mid - CENTER_PAD_PX) {
        setActiveSection(id);
        return;
      }
    }
  }, [items, subToParent]);

  useEffect(() => {
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isActive = item.id === activeSection;
          const isHovered = item.id === hoveredId;
          const isAnimated = isActive || isHovered;
          const subs = subsForSection(item.id);

          return (
            <div key={item.id} className="flex flex-col">
              <a
                href={`#${item.id}`}
                onClick={(e) => handleSmoothScroll(e, item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "group flex items-center gap-4 cursor-pointer overflow-hidden",
                  isActive ? "text-[var(--olivea-olive)]" : "text-[var(--olivea-clay)] opacity-80 hover:opacity-100"
                )}
                aria-current={isActive ? "location" : undefined}
              >
                <span className="text-2xl tabular-nums font-extrabold w-10">
                  {item.number}
                </span>
                <div className="relative h-8 overflow-hidden min-w-[200px]">
                  {/* outgoing */}
                  <motion.div
                    className="block text-2xl font-bold whitespace-nowrap"
                    initial={false}
                    animate={{
                      y: isAnimated ? -28 : 0,
                      opacity: isAnimated ? 0 : 1,
                      filter: isAnimated ? "blur(1px)" : "blur(0px)",
                    }}
                    transition={{
                      y: { type: "spring", stiffness: 200, damping: 20 },
                      opacity: { duration: 0.2 },
                      filter: { duration: 0.2 },
                    }}
                  >
                    {item.label}
                  </motion.div>
                  {/* incoming */}
                  <motion.div
                    className="block text-2xl font-bold absolute top-0 left-0 whitespace-nowrap"
                    initial={{ y: 28, opacity: 0, filter: "blur(1px)" }}
                    animate={{
                      y: isAnimated ? 0 : 28,
                      opacity: isAnimated ? 1 : 0,
                      filter: isAnimated ? "blur(0px)" : "blur(1px)",
                    }}
                    transition={{
                      y: { type: "spring", stiffness: 200, damping: 20 },
                      opacity: { duration: 0.2 },
                      filter: { duration: 0.2 },
                    }}
                  >
                    {item.label}
                  </motion.div>
                </div>
              </a>

              <AnimatePresence initial={false}>
                {isActive && subs.length > 0 && (
                  <motion.div
                    key="subs"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={subContainerVariants}
                    className="ml-14 overflow-hidden"
                  >
                    {subs.map((sub) => {
                      const isSubActive = sub.id === activeSub;
                      return (
                        <motion.a
                          key={sub.id}
                          href={`#${sub.id}`}
                          onClick={(e) => handleSmoothScroll(e, sub.id)}
                          variants={subItemVariants}
                          className={cn(
                            "block text-sm transition-colors",
                            isSubActive ? "text-[var(--olivea-olive)]" : "text-[var(--olivea-clay)] hover:text-[var(--olivea-olive)]"
                          )}
                          aria-current={isSubActive ? "location" : undefined}
                        >
                          {sub.label}
                        </motion.a>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
