// components/links/MenuScrollButton.tsx
"use client";

import { useCallback } from "react";

type LenisScrollOpts = {
  offset?: number;
  duration?: number;
  lock?: boolean;
  force?: boolean;
};

type LenisLike = {
  scrollTo: (target: HTMLElement | number | string, opts?: LenisScrollOpts) => void;
};

type GlobalWithLenis = Window & {
  lenis?: LenisLike;
  Lenis?: LenisLike;
};

type Props = {
  targetId?: string;           // default "menu"
  className?: string;
  children?: React.ReactNode;  // default "Menu"
  label?: string;              // aria-label
};

function getLenis(): LenisLike | null {
  const w = window as unknown as GlobalWithLenis;
  return w.lenis ?? w.Lenis ?? null;
}

function isMobileViewport() {
  return typeof window !== "undefined" &&
         window.matchMedia?.("(max-width: 767px)").matches;
}

// fallback smooth scroll (window scroller) with custom duration/easing
function nativeSmoothScrollTo(targetTop: number, durationMs: number) {
  const startY = window.scrollY;
  const delta  = targetTop - startY;
  const start  = performance.now();

  // easeInOutCubic
  const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let raf = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const y = startY + delta * ease(t);
    window.scrollTo(0, y);
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export default function MenuScrollButton({
  targetId = "menu",
  className = "",
  children = "Menu",
  label = "View menu",
}: Props) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const target =
      document.getElementById(targetId) ||
      document.querySelector<HTMLElement>(`.main-section#${targetId}`);
    if (!target) return;

    // header offset from CSS var
    const hcss = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    const headerH = Math.max(parseInt(hcss || "64", 10) || 64, 0);
    const EXTRA_OFFSET = 8;
    const OFFSET = -(headerH + EXTRA_OFFSET);

    // mobile gets a slightly longer duration
    const MOBILE = isMobileViewport();
    const DURATION_S = MOBILE ? 1.35 : 1.05;   // tweak to taste
    const DURATION_MS = DURATION_S * 1000;

    // Lenis if present
    const lenis = getLenis();

    // temporarily disable scroll-snap while we scroll
    const scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
    const prevSnap = scroller.style.scrollSnapType;
    scroller.style.scrollSnapType = "none";

    const THRESH = 10;
    const STABLE_FRAMES = 2;
    const TIMEOUT = Math.max(1800, DURATION_MS + 400);
    const OPEN_EVENT = "olivea:menu:open";
    const start = performance.now();
    let stable = 0;
    let rafId = 0;

    const arrivedNow = () => {
      const top = target.getBoundingClientRect().top;
      const idealTop = headerH + EXTRA_OFFSET;
      return Math.abs(top - idealTop) <= THRESH;
    };

    const tick = () => {
      if (arrivedNow()) stable += 1;
      else stable = 0;

      const expired = performance.now() - start > TIMEOUT;
      if (stable >= STABLE_FRAMES || expired) {
        if (window.location.hash.slice(1) !== targetId) {
          history.replaceState(null, "", `#${targetId}`);
        }
        window.dispatchEvent(new Event(OPEN_EVENT));
        scroller.style.scrollSnapType = prevSnap;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    // kick off scroll
    let cancelFallback: (() => void) | null = null;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(target, { offset: OFFSET, duration: DURATION_S, lock: true, force: true });
    } else {
      const targetTop = window.scrollY + target.getBoundingClientRect().top + OFFSET;
      cancelFallback = nativeSmoothScrollTo(targetTop, DURATION_MS);
    }

    rafId = requestAnimationFrame(tick);

    // cleanup on nav away
    const cleanup = () => {
      cancelAnimationFrame(rafId);
      cancelFallback?.();
      scroller.style.scrollSnapType = prevSnap;
      window.removeEventListener("pagehide", cleanup);
      window.removeEventListener("visibilitychange", visHandler);
    };
    const visHandler = () => {
      if (document.visibilityState === "hidden") cleanup();
    };
    window.addEventListener("pagehide", cleanup);
    window.addEventListener("visibilitychange", visHandler);
  }, [targetId]);

  return (
    <a
      href={`#${targetId}`}
      aria-label={label}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}