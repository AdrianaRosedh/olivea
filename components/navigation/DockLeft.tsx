// components/navigation/DockLeft.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import { useLenis } from "@/components/providers/ScrollProvider";

// Minimal local type for Lenis (no @studio-freight/react-lenis types needed)
type Lenis = {
  scrollTo: (target: number, options?: { duration?: number; easing?: (t: number) => number }) => void;
};

type Identity = "casa" | "cafe" | "farmtotable";
interface DockLeftProps {
  dict: AppDictionary;
  identity: Identity;
}

// Section order for Cafe specifically
const CAFE_SECTION_ORDER = [
  "all_day", "padel", "menu", "community", "ambience"
] as const;

const subContainerVariants = {
  open: {
    opacity: 1,
    height: "auto",
    marginTop: 8,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      ease: "easeInOut",
      duration: 0.3,
    },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      when: "afterChildren",
      ease: "easeInOut",
      duration: 0.2,
    },
  },
};
const subItemVariants = {
  open:      { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  collapsed: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

// Helper with retry for hash deep links
function scrollToSectionWithRetry(id: string, lenis: Lenis | null, maxTries = 40) {
  let tries = 0;
  const tryScroll = () => {
    const el = document.getElementById(id);
    if (!el) {
      if (++tries < maxTries) setTimeout(tryScroll, 50);
      return;
    }
    const y = el.getBoundingClientRect().top + window.pageYOffset - 120;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(y, { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      setTimeout(() => {
        if (Math.abs(window.scrollY - y) > 10) {
          window.scrollTo({ top: y, behavior: "auto" });
        }
      }, 180);
    } else {
      window.scrollTo({ top: y, behavior: "auto" });
    }
  };
  tryScroll();
}

export default function DockLeft({ dict, identity }: DockLeftProps) {
  const lenis = useLenis() as Lenis | null;

  // Memoized sections
  const sections = useMemo(
    () => dict[identity].sections as Record<string, { title: string; description: string; subsections?: Record<string, { title: string; description: string }> }>,
    [dict, identity]
  );
  const keysInOrder = useMemo(() => {
    if (identity === "cafe") return CAFE_SECTION_ORDER.filter(k => k in sections);
    return Object.keys(sections);
  }, [identity, sections]);

  const items = keysInOrder.map((id, i) => ({
    id,
    label: sections[id].title,
    number: `0${i + 1}`,
  }));

  // Subsection parent lookup
  const subToParent = useMemo(() => {
    const m: Record<string, string> = {};
    for (const pid of keysInOrder) {
      const ss = sections[pid].subsections;
      if (ss) for (const sid of Object.keys(ss)) m[sid] = pid;
    }
    return m;
  }, [keysInOrder, sections]);
  const subIds = Object.keys(subToParent);

  // Active/hover state
  const [activeSection, setActiveSection] = useState(items[0]?.id || "");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Click handler
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 120;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(y, { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      setTimeout(() => {
        if (Math.abs(window.scrollY - y) > 10) {
          window.scrollTo({ top: y, behavior: "auto" });
        }
      }, 180);
    } else {
      window.scrollTo({ top: y, behavior: "auto" });
    }
    if (window.location.hash.slice(1) !== id) {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, [lenis]);
  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      scrollToSection(id);
    },
    [scrollToSection]
  );

  // On mount, scroll to hash if present (for reload/deep link)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      scrollToSectionWithRetry(hash, lenis);
    }
  }, [lenis]);

  // Update active state on scroll
  const updateActive = useCallback(() => {
    const mid = window.innerHeight / 2;
    for (const sid of subIds) {
      const el = document.querySelector<HTMLElement>(`.subsection#${sid}`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        setActiveSub(sid);
        setActiveSection(subToParent[sid]);
        return;
      }
    }
    setActiveSub(null);
    for (const { id } of items) {
      const el = document.querySelector<HTMLElement>(`.main-section#${id}`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        setActiveSection(id);
        return;
      }
    }
  }, [items, subIds, subToParent]);

  useEffect(() => {
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  return (
    <nav className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isActive = item.id === activeSection;
          const isHovered = item.id === hoveredId;
          const isAnimated = isActive || isHovered;
          const subs = sections[item.id].subsections ?? {};

          return (
            <div key={item.id} className="flex flex-col">
              <a
                href={`#${item.id}`}
                onClick={(e) => handleSmoothScroll(e, item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "group flex items-center gap-4 cursor-pointer overflow-hidden",
                  isActive
                    ? "text-[var(--olivea-olive)]"
                    : "text-[var(--olivea-clay)] opacity-80 hover:opacity-100"
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
                    {item.label.toUpperCase()}
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
                    {item.label.toUpperCase()}
                  </motion.div>
                </div>
              </a>

              <AnimatePresence initial={false}>
                {isActive && Object.keys(subs).length > 0 && (
                  <motion.div
                    key="subs"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={subContainerVariants}
                    className="ml-14 overflow-hidden"
                  >
                    {Object.entries(subs).map(([subId, sub]) => {
                      const isSubActive = subId === activeSub;
                      return (
                        <motion.a
                          key={subId}
                          href={`#${subId}`}
                          onClick={(e) => handleSmoothScroll(e, subId)}
                          variants={subItemVariants}
                          className={cn(
                            "block text-sm transition-colors",
                            isSubActive
                              ? "text-[var(--olivea-olive)]"
                              : "text-[var(--olivea-clay)] hover:text-[var(--olivea-olive)]"
                          )}
                          aria-current={isSubActive ? "location" : undefined}
                        >
                          {sub.title}
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