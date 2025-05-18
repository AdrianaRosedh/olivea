"use client";

import { useEffect, useRef, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export interface MobileSectionNavItem {
  id: string;
  label: string;
}

interface Props {
  items: MobileSectionNavItem[];
}

export default function MobileSectionNav({ items }: Props) {
  const [activeSection, setActiveSection] = useState(items[0]?.id || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const pathname = usePathname();

  // smooth scroll to any section or subsection
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(sectionId);
    window.history.pushState(null, "", `#${sectionId}`);
    navigator.vibrate?.(10);
  };

  // detect active section/subsection
  useEffect(() => {
    const onScroll = () => {
      const secs = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
      const mid = window.innerHeight / 2;
      let closest = activeSection;
      let minDiff = Infinity;
      secs.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) {
          const diff = Math.abs(rect.top - mid);
          if (diff < minDiff) {
            minDiff = diff;
            closest = sec.id;
          }
        }
      });
      if (closest !== activeSection) setActiveSection(closest);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [activeSection, pathname]);

  // center active pill
  useEffect(() => {
    const cont = containerRef.current;
    const btn = buttonRefs.current[activeSection];
    if (!cont || !btn) return;
    const half = (cont.clientWidth - btn.offsetWidth) / 2;
    const left = btn.offsetLeft - half;
    const max = cont.scrollWidth - cont.clientWidth;
    cont.scrollTo({ left: Math.max(0, Math.min(left, max)), behavior: "smooth" });
  }, [activeSection]);

  return (
    <nav
      ref={containerRef}
      className="fixed bottom-1 inset-x-0 z-40 flex gap-3 py-3 px-2 overflow-x-auto no-scrollbar"
      aria-label="Mobile section navigation"
    >
      {items.map(item => {
        const isMainActive = item.id === activeSection ||
          document.getElementById(item.id)?.classList.contains("subsection") &&
          document.getElementById(item.id)?.closest(".main-section")?.id === item.id;

        // gather all subsections for this main section
        const sectionEl = document.getElementById(item.id);
        const subs: { id: string; label: string }[] = [];
        if (sectionEl?.classList.contains("main-section")) {
          Array.from(sectionEl.querySelectorAll<HTMLElement>(".subsection[id]")).forEach(subEl => {
            const heading = subEl.querySelector<HTMLElement>("h4");
            subs.push({ id: subEl.id, label: heading?.innerText || subEl.id });
          });
        }

        return (
          <Fragment key={item.id}>
            {/* main section pill */}
            <motion.a
              ref={el => { buttonRefs.current[item.id] = el; }}
              href={`#${item.id}`}
              onClick={e => { e.preventDefault(); scrollToSection(item.id); }}
              aria-current={item.id === activeSection ? "location" : undefined}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium uppercase border whitespace-nowrap",
                isMainActive
                  ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
                  : "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/10"
              )}
              initial={false}
            >
              {item.label}
            </motion.a>

            {/* inline subsections always visible */}
            <AnimatePresence initial={false}>
              {subs.map(sub => {
                const isSubActive = sub.id === activeSection;
                return (
                  <motion.a
                    key={sub.id}
                    ref={el => { buttonRefs.current[sub.id] = el; }}
                    href={`#${sub.id}`}
                    onClick={e => { e.preventDefault(); scrollToSection(sub.id); }}
                    aria-current={isSubActive ? "location" : undefined}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium uppercase border whitespace-nowrap ml-2",
                      isSubActive
                        ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
                        : "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/10"
                    )}
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {sub.label}
                  </motion.a>
                );
              })}
            </AnimatePresence>
          </Fragment>
        );
      })}
    </nav>
  );
}
