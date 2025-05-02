// components/animations/ScrollSync.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { EVENTS, emitEvent } from "@/lib/navigation-events";

export default function ScrollSync() {
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const isScrollingProgrammatically = useRef(false);
  const pathname = usePathname();
  const lastActiveSection = useRef<string | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const clickedSectionRef = useRef<string | null>(null);
  const snapInProgressRef = useRef(false);

  // ─── smoothScrollTo HELPER ────────────────────────────────────────────────
  function smoothScrollTo(targetY: number, duration = 800) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const scrollDuration = isMobile ? 500 : duration;

    const container = scrollContainerRef.current || document.documentElement;
    const startY = container.scrollTop;
    const distance = targetY - startY;
    let startTime: number | null = null;

    // flag so we ignore native scroll events
    isScrollingProgrammatically.current = true;
    snapInProgressRef.current = true;

    emitEvent(EVENTS.SECTION_SNAP_START, {
      targetId: clickedSectionRef.current,
      startPosition: startY,
      targetPosition: targetY,
    });

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOutQuad = (t: number) => t * (2 - t);
    const ease = isMobile ? easeOutQuad : easeOutCubic;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / scrollDuration, 1);
      const eased = ease(t);
      container.scrollTop = startY + distance * eased;

      emitEvent(EVENTS.SCROLL_PROGRESS, {
        progress: eased,
        targetId: clickedSectionRef.current,
        scrollPosition: container.scrollTop,
        totalProgress: container.scrollTop / (container.scrollHeight - container.clientHeight),
      });

      if (t < 1) {
        scrollAnimationRef.current = requestAnimationFrame(step);
      } else {
        // done
        emitEvent(EVENTS.SECTION_SNAP_COMPLETE, {
          targetId: clickedSectionRef.current,
          finalPosition: container.scrollTop,
        });
        setTimeout(() => {
          isScrollingProgrammatically.current = false;
          snapInProgressRef.current = false;
          clickedSectionRef.current = null;
          window.dispatchEvent(new Event("scroll"));
        }, isMobile ? 50 : 100);
      }
    }

    scrollAnimationRef.current = requestAnimationFrame(step);
  }

  // ─── MAIN EFFECT ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // find our scroll container
    const container = document.querySelector<HTMLElement>(".scroll-container");
    scrollContainerRef.current = container || document.documentElement;

    // ── handle clicks on anchor links
    const onClick = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      const link = tgt.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();
      const id = href.slice(1);
      clickedSectionRef.current = id;
      window.history.pushState(null, "", href);

      const sectionEl = document.getElementById(id) as HTMLElement | null;
      if (sectionEl) {
        smoothScrollTo(sectionEl.offsetTop, 800);
        lastActiveSection.current = id;
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: { id, intersectionRatio: 1, fromClick: true },
          })
        );
        emitEvent(EVENTS.SECTION_CHANGE, { id, source: "click" });
      }
    };

    // ── handle native scroll
    let throttle: number | null = null;
    const onScroll = () => {
      if (isScrollingProgrammatically.current || snapInProgressRef.current) return;
      if (clickedSectionRef.current) return;
      if (throttle !== null) return;

      throttle = window.setTimeout(() => {
        throttle = null;

        // force TS to see HTMLElement[]
        const raw = document.getElementsByTagName("section") as HTMLCollectionOf<HTMLElement>;
        let bestId: string | null = null;
        let bestVis = 0;

        for (let i = 0; i < raw.length; i++) {
          const sec = raw[i];
          const rect = sec.getBoundingClientRect();
          const vh = window.innerHeight;
          const vis = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
          const ratio = vis / rect.height;
          if (ratio > bestVis) {
            bestVis = ratio;
            bestId = sec.id;
          }
        }

        if (bestId && bestId !== lastActiveSection.current) {
          lastActiveSection.current = bestId;
          document.dispatchEvent(
            new CustomEvent("sectionInView", {
              detail: { id: bestId, intersectionRatio: bestVis, fromScroll: true },
            })
          );
          emitEvent(EVENTS.SECTION_CHANGE, {
            id: bestId,
            source: "scroll",
            intersectionRatio: bestVis,
          });
        }
      }, 50);
    };

    // ── attach
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    scrollContainerRef.current.addEventListener("scroll", onScroll, { passive: true });

    // ── prime first section
    setTimeout(() => {
      const first = (document.getElementsByTagName("section") as HTMLCollectionOf<HTMLElement>)[0];
      if (first?.id) lastActiveSection.current = first.id;
    }, 100);

    // ── cleanup
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      scrollContainerRef.current?.removeEventListener("scroll", onScroll);
      if (throttle !== null) clearTimeout(throttle);
      if (scrollAnimationRef.current) cancelAnimationFrame(scrollAnimationRef.current);
    };
  }, [pathname]);

  return null;
}