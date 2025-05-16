"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AppDictionary } from "@/app/[lang]/dictionaries";

type Identity = "casa" | "cafe" | "restaurant";

interface DockLeftProps {
  dict: AppDictionary;
  identity: Identity;
  dynamicCafeCategories?: string[];
}

// Variants for subsections animation
const subContainerVariants = {
  open: {
    opacity: 1,
    height: "auto",
    marginTop: 8,
    transition: {
      delay: 0.2,
      when: "beforeChildren",
      delayChildren: 0.1,
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

const handleSmoothScroll = (e: React.MouseEvent, id: string) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `#${id}`);
  }
};

const subItemVariants = {
  open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  collapsed: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

export default function DockLeft({ dict, identity, dynamicCafeCategories = [] }: DockLeftProps) {
  // pull in sections
  const sections = useMemo(
    () => (dict[identity]?.sections ?? {}) as Record<
      string,
      { title: string; description: string; subsections?: Record<string, { title: string; description: string }> }
    >,
    [dict, identity]
  );

  // top-level nav items
  const items = useMemo(
    () => Object.entries(sections).map(([id, sec], idx) => ({ id, label: sec.title, number: `0${idx + 1}` })),
    [sections]
  );

  // map subsections to parent section
  const subToParent = useMemo(() => {
    const map: Record<string,string> = {};
    for (const [pid, sec] of Object.entries(sections)) {
      if (sec.subsections) {
        for (const sid of Object.keys(sec.subsections)) {
          map[sid] = pid;
        }
      }
      if (identity === "cafe" && pid === "menu") {
        for (const cat of dynamicCafeCategories) {
          map[cat] = pid;
        }
      }
    }
    return map;
  }, [sections, identity, dynamicCafeCategories]);

  const subIds = useMemo(() => Object.keys(subToParent), [subToParent]);

  // state
  const [activeSection, setActiveSection] = useState(items[0]?.id || "");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // scroll watcher
  const updateActive = useCallback(() => {
    const mid = window.innerHeight / 2;
    // check subsections first
    for (const sid of subIds) {
      const el = document.querySelector<HTMLElement>(`.subsection#${sid}`);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          setActiveSub(sid);
          setActiveSection(subToParent[sid]);
          return;
        }
      }
    }
    // no subsection -> clear
    setActiveSub(null);
    // check main sections
    for (const { id } of items) {
      const el = document.querySelector<HTMLElement>(`.main-section#${id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          setActiveSection(id);
          return;
        }
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
        {items.map(item => {
          const isActive = item.id === activeSection;
          const isHovered = item.id === hoveredId;
          const isAnimated = isActive || isHovered;

          // build subsections list
          let subs = sections[item.id].subsections ?? {};
          if (identity === "cafe" && item.id === "menu") {
            subs = dynamicCafeCategories.reduce((a,cat) => ({...a,[cat]:{title:cat,description:""}}),{} as Record<string,{title:string;description:string}>);
          }

          return (
            <div key={item.id} className="flex flex-col">
              {/* main link */}
              <a
                href={`#${item.id}`}
                onClick={(e) => handleSmoothScroll(e, item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "group flex items-center gap-4 cursor-pointer overflow-hidden",
                  isActive
                    ? "text-[var(--olivea-clay)]"
                    : "text-[var(--olivea-olive)] opacity-80 hover:opacity-100"
                )}
                aria-current={isActive ? "location" : undefined}
              >
                <span className="text-2xl tabular-nums font-extrabold w-10">{item.number}</span>
                <div className="relative h-8 overflow-hidden min-w-[200px]">
                  <div className="relative">
                    {/* outgoing */}
                    <motion.div
                      className="block text-2xl font-bold whitespace-nowrap"
                      initial={false}
                      animate={{
                        y: isAnimated ? -28 : 0,
                        opacity: isAnimated ? 0 : 1,
                        filter: isAnimated ? "blur(1px)" : "blur(0px)",
                      }}
                      transition={{ y:{type:"spring",stiffness:200,damping:20},opacity:{duration:0.2},filter:{duration:0.2}}}
                    >
                      {item.label.toUpperCase()}
                    </motion.div>
                    {/* incoming */}
                    <motion.div
                      className="block text-2xl font-bold absolute top-0 left-0 whitespace-nowrap"
                      initial={{ y:28, opacity:0, filter:"blur(1px)" }}
                      animate={{
                        y: isAnimated ? 0 : 28,
                        opacity: isAnimated ? 1 : 0,
                        filter: isAnimated ? "blur(0px)" : "blur(1px)",
                      }}
                      transition={{ y:{type:"spring",stiffness:200,damping:20},opacity:{duration:0.2},filter:{duration:0.2}}}
                    >
                      {item.label.toUpperCase()}
                    </motion.div>
                  </div>
                </div>
              </a>

              {/* subsections */}
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
                          onClick={(e) => handleSmoothScroll(e, subId)} // ← add this line
                          variants={subItemVariants}
                          className={cn(
                            "block text-sm transition-colors",
                            isSubActive
                              ? "text-[var(--olivea-clay)]"
                              : "text-[var(--olivea-olive)] hover:text-[var(--olivea-clay)]"
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