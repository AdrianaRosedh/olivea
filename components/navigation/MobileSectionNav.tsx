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
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
      window.history.pushState(null, "", `#${sectionId}`);
      navigator.vibrate?.(10);
    }
  };

  useEffect(() => {
    // define inside effect so it's not a missing-deps issue
    const checkVisibleSections = () => {
      const sections = Array.from(document.querySelectorAll("section[id]"));
      const threshold = window.innerHeight / 2;
      let mostVisible    = activeSection;
      let closestDist    = Infinity;

      for (const section of sections) {
        const rect     = section.getBoundingClientRect();
        const distance = Math.abs(rect.top);
        if (
          distance < closestDist &&
          rect.top < threshold &&
          rect.bottom > threshold / 2
        ) {
          closestDist    = distance;
          mostVisible    = section.id;
        }
      }

      if (mostVisible !== activeSection) {
        setActiveSection(mostVisible);
      }
    };

    window.addEventListener("scroll", checkVisibleSections, { passive: true });
    window.addEventListener("resize", checkVisibleSections);

    // initial bump
    const timer = window.setTimeout(checkVisibleSections, 100);

    return () => {
      window.removeEventListener("scroll",  checkVisibleSections);
      window.removeEventListener("resize", checkVisibleSections);
      clearTimeout(timer);
    };
  }, [pathname, activeSection]);

  useEffect(() => {
    const container = containerRef.current;
    const button    = buttonRefs.current[activeSection];
    if (container && button) {
      const cRect   = container.getBoundingClientRect();
      const bRect   = button.getBoundingClientRect();
      const offset  =
        bRect.left -
        cRect.left -
        cRect.width / 2 +
        bRect.width / 2;

      container.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, [activeSection]);

  return (
    <nav
      ref={containerRef}
      className="flex gap-3 px-4 py-2 overflow-x-auto no-scrollbar bg-transparent"
      aria-label="Mobile section navigation"
    >
      {items.map((item) => (
        <a
          key={item.id}
          ref={(el) => { buttonRefs.current[item.id] = el }}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection(item.id);
          }}
          aria-current={activeSection === item.id ? "location" : undefined}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium uppercase border transition-all duration-300",
            activeSection === item.id
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
              : "text-[var(--olivea-olive)] border-[var(--olivea-olive)]/70 hover:bg-[var(--olivea-olive)]/10"
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}