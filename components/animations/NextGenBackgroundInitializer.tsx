// components/animations/NextGenBackgroundInitializer.tsx
"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/ScrollProvider";

type LenisScrollEvent = { scroll: number; limit: number };
type LenisLike = {
  on: (event: "scroll", cb: (e: LenisScrollEvent) => void) => void;
  off: (event: "scroll", cb: (e: LenisScrollEvent) => void) => void;
};

function isLenisLike(x: unknown): x is LenisLike {
  const obj = x as Record<string, unknown> | null;
  return !!obj && typeof obj.on === "function" && typeof obj.off === "function";
}

export default function NextGenBackgroundInitializer() {
  const lenis = useLenis();

  // ✅ Hooks at component scope
  const lastLenis = useRef<LenisScrollEvent>({ scroll: 0, limit: 0 });
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const style = root.style;

    // Single rAF scheduler
    const schedule = (fn: () => void) => {
      if (rafIdRef.current != null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        fn();
      });
    };

    // State to avoid redundant writes
    let lastRounded = -1;
    const round3 = (v: number) => Math.max(0, Math.min(1, Math.round(v * 1000) / 1000));

    const progressFromDoc = () => {
      const doc = document.documentElement;
      const max = Math.max(0, doc.scrollHeight - doc.clientHeight);
      const cur = window.scrollY || 0;
      return max > 0 ? cur / max : 0;
    };

    const progress = () => {
      const { scroll, limit } = lastLenis.current;
      if (limit > 0 && scroll >= 0) return scroll / limit;
      return progressFromDoc();
    };

    const apply = () => {
      const rounded = round3(progress());
      if (rounded !== lastRounded) {
        style.setProperty("--scroll-per", String(rounded));
        lastRounded = rounded;
      }
    };

    // Visibility / motion preferences
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = () => mql.matches;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (rafIdRef.current != null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        return;
      }
      schedule(apply);
    };

    const onLenisScroll = (e: LenisScrollEvent) => {
      lastLenis.current = e;
      schedule(apply);
    };

    const onPassiveScrollOrResize = () => {
      schedule(apply);
    };

    const enable = () => {
      // seed once
      apply();

      if (isLenisLike(lenis)) {
        lenis.on("scroll", onLenisScroll);
        // synthetic seed in case Lenis hasn't fired yet
        onLenisScroll({
          scroll: window.scrollY || 0,
          limit:
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight,
        });
      } else {
        window.addEventListener("scroll", onPassiveScrollOrResize, { passive: true });
        window.addEventListener("resize", onPassiveScrollOrResize);
      }

      document.addEventListener("visibilitychange", onVisibility);
    };

    const disable = () => {
      if (isLenisLike(lenis)) {
        lenis.off("scroll", onLenisScroll);
      } else {
        window.removeEventListener("scroll", onPassiveScrollOrResize);
        window.removeEventListener("resize", onPassiveScrollOrResize);
      }
      document.removeEventListener("visibilitychange", onVisibility);

      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    // Respect prefers-reduced-motion
    if (reduce()) {
      style.setProperty("--scroll-per", "0");
      const onPrefChange = () => {
        disable();
        if (reduce()) {
          style.setProperty("--scroll-per", "0");
        } else {
          enable();
        }
      };
      mql.addEventListener("change", onPrefChange);
      return () => {
        mql.removeEventListener("change", onPrefChange);
      };
    }

    enable();
    return disable;
  }, [lenis]);

  return null;
}
