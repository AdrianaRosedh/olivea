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
  const debugModeRef = useRef(false);

  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) console.log("[ScrollSync]", ...args);
  };

  const initializeScrollFunctionality = () => {
    if (typeof window === "undefined") return;
    debugLog("Initializing scroll functionality");
    const container = document.querySelector<HTMLElement>(".scroll-container");
    scrollContainerRef.current = container || document.documentElement;
    window.scrollBy(0, 1);
    window.scrollBy(0, -1);
    window.dispatchEvent(new Event("scroll"));
  };

  const smoothScrollTo = (targetPosition: number, duration = 800) => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const scrollDuration = isMobileDevice ? 500 : duration;

    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    const scrollContainer = scrollContainerRef.current || document.documentElement;
    const startPosition = scrollContainer.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    isScrollingProgrammatically.current = true;
    snapInProgressRef.current = true;

    emitEvent(EVENTS.SECTION_SNAP_START, {
      targetId: clickedSectionRef.current,
      startPosition,
      targetPosition,
    });

    const easing = isMobileDevice
      ? (t: number) => t * (2 - t)
      : (t: number) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      const easedProgress = easing(progress);

      scrollContainer.scrollTop = startPosition + distance * easedProgress;

      emitEvent(EVENTS.SCROLL_PROGRESS, {
        progress: easedProgress,
        targetId: clickedSectionRef.current,
        scrollPosition: scrollContainer.scrollTop,
        totalProgress:
          scrollContainer.scrollTop /
          (scrollContainer.scrollHeight - scrollContainer.clientHeight),
      });

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
      } else {
        scrollAnimationRef.current = null;
        emitEvent(EVENTS.SECTION_SNAP_COMPLETE, {
          targetId: clickedSectionRef.current,
          finalPosition: scrollContainer.scrollTop,
        });
        setTimeout(
          () => {
            isScrollingProgrammatically.current = false;
            snapInProgressRef.current = false;
            clickedSectionRef.current = null;
            window.dispatchEvent(new Event("scroll"));
          },
          isMobileDevice ? 50 : 100
        );
      }
    };

    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    initializeScrollFunctionality();

    const handleSectionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();
      const targetId = href.replace("#", "");
      clickedSectionRef.current = targetId;
      window.history.pushState(null, "", href);

      const targetSection = document.getElementById(targetId) as HTMLElement | null;
      if (targetSection) {
        smoothScrollTo(targetSection.offsetTop, 800);
        lastActiveSection.current = targetId;

        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: { id: targetId, intersectionRatio: 1, fromClick: true },
          })
        );
        emitEvent(EVENTS.SECTION_CHANGE, { id: targetId, source: "click" });
      }
    };

    let scrollTimeout: number | null = null;
    const handleScroll = () => {
      if (isScrollingProgrammatically.current || snapInProgressRef.current) return;
      if (clickedSectionRef.current) return;
      if (scrollTimeout !== null) return;

      scrollTimeout = window.setTimeout(() => {
        scrollTimeout = null;
        // Bulletproof sections via getElementsByTagName
        const rawSections = document.getElementsByTagName("section");
        const sections: HTMLElement[] = [];
        for (let i = 0; i < rawSections.length; i++) {
          const sec = rawSections[i];
          if (sec.id) sections.push(sec);
        }

        let activeSection: HTMLElement | null = null;
        let maxVisibility = 0;

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const visibleHeight =
            Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
          const visibility = visibleHeight / rect.height;

          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            activeSection = section;
          }
        });

        if (
          activeSection &&
          activeSection.id !== lastActiveSection.current
        ) {
          lastActiveSection.current = activeSection.id;
          debugLog(
            `New active section from scroll: ${activeSection.id}`
          );

          document.dispatchEvent(
            new CustomEvent("sectionInView", {
              detail: {
                id: activeSection.id,
                intersectionRatio: maxVisibility,
                fromScroll: true,
              },
            })
          );
          emitEvent(EVENTS.SECTION_CHANGE, {
            id: activeSection.id,
            source: "scroll",
            intersectionRatio: maxVisibility,
          });
        }
      }, 50);
    };

    const handleNavigationComplete = () =>
      setTimeout(initializeScrollFunctionality, 100);

    document.addEventListener(
      EVENTS.NAVIGATION_COMPLETE,
      handleNavigationComplete
    );
    document.addEventListener(
      EVENTS.SCROLL_INITIALIZE,
      initializeScrollFunctionality
    );
    document.addEventListener("click", handleSectionClick);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial active section
    setTimeout(() => {
      const first = document.getElementsByTagName("section")[0];
      if (first && first.id) lastActiveSection.current = first.id;
    }, 100);

    return () => {
      if (scrollAnimationRef.current)
        cancelAnimationFrame(scrollAnimationRef.current);
      if (scrollTimeout !== null) clearTimeout(scrollTimeout);
      document.removeEventListener(
        EVENTS.NAVIGATION_COMPLETE,
        handleNavigationComplete
      );
      document.removeEventListener(
        EVENTS.SCROLL_INITIALIZE,
        initializeScrollFunctionality
      );
      document.removeEventListener("click", handleSectionClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return null;
}