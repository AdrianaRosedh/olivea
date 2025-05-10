// components/ui/MobileSectionNav.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface MobileSectionNavItem {
  id:    string;
  label: string;
}

interface Props {
  items: MobileSectionNavItem[];
}

export default function MobileSectionNav({ items }: Props) {
  const [activeSection, setActiveSection] = useState(items[0]?.id || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs  = useRef<Record<string, HTMLAnchorElement | null>>({});
  const pathname    = usePathname();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(sectionId);
    window.history.pushState(null, "", `#${sectionId}`);
    navigator.vibrate?.(10);
  };

  useEffect(() => {
    const checkVisibleSections = () => {
      const secs = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
      const threshold = window.innerHeight / 2;
      let newActive = activeSection;
      let closest   = Infinity;

      for (const sec of secs) {
        const rect = sec.getBoundingClientRect();
        const dist = Math.abs(rect.top);
        if (dist < closest && rect.top < threshold && rect.bottom > threshold / 2) {
          closest   = dist;
          newActive = sec.id;
        }
      }

      if (newActive !== activeSection) {
        setActiveSection(newActive);
      }
    };

    window.addEventListener("scroll",  checkVisibleSections, { passive: true });
    window.addEventListener("resize",  checkVisibleSections);
    const timer = window.setTimeout(checkVisibleSections, 100);

    return () => {
      window.removeEventListener("scroll",  checkVisibleSections);
      window.removeEventListener("resize", checkVisibleSections);
      clearTimeout(timer);
    };
  }, [pathname, activeSection]);

// 2️⃣ Clamp-center the active pill so it never scrolls into empty space
useEffect(() => {
  const container = containerRef.current;
  const btn       = buttonRefs.current[activeSection];
  if (!container || !btn) return;

  // calculate the ideal scrollLeft to center the button
  const halfView = (container.clientWidth - btn.offsetWidth) / 2;
  const desired  = btn.offsetLeft - halfView;

  // clamp between 0 and the max scrollable distance
  const maxScroll     = container.scrollWidth - container.clientWidth;
  const clampedScroll = Math.max(0, Math.min(desired, maxScroll));

  container.scrollTo({ left: clampedScroll, behavior: "smooth" });
}, [activeSection]);

  return (
    <nav
      ref={containerRef}
      className="fixed bottom-1 inset-x-0 z-40 flex gap-3 py-3 px-2 overflow-x-auto no-scrollbar"
      style={{ padding: "0 0.75rem" }}
      aria-label="Mobile section navigation"
    >
      {items.map((item) => {
        const isActive = item.id === activeSection;

        return (
          <a
            key={item.id}
            ref={(el) => { buttonRefs.current[item.id] = el }}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(item.id);
            }}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium uppercase border transition-all duration-200 whitespace-nowrap",
              isActive
                ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
                : "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/10"
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}