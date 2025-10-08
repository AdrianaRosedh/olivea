// components/animations/NextGenBackgroundInitializer.tsx
"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/ScrollProvider";

type LenisScrollEvent = {
  scroll: number;
  limit: number;
};

type LenisLike = {
  on: (event: "scroll", cb: (e: LenisScrollEvent) => void) => void;
  off: (event: "scroll", cb: (e: LenisScrollEvent) => void) => void;
};

function isLenisLike(x: unknown): x is LenisLike {
  const obj = x as Record<string, unknown> | null;
  return (
    !!obj &&
    typeof obj.on === "function" &&
    typeof obj.off === "function"
  );
}

export default function NextGenBackgroundInitializer() {
  const lenis = useLenis();
  const last = useRef<LenisScrollEvent>({ scroll: 0, limit: 0 });

  useEffect(() => {
    let ticking = false;

    const setScrollPer = (value: number) => {
      const clamped = Math.max(0, Math.min(1, value));
      document.documentElement.style.setProperty("--scroll-per", String(clamped));
    };

    const computeProgressFromDoc = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(0, (doc.scrollHeight - doc.clientHeight));
      const current = window.scrollY || 0;
      return maxScroll > 0 ? current / maxScroll : 0;
    };

    const computeProgress = () => {
      // Prefer Lenis’ latest values if we have them; otherwise fall back to document
      const { scroll, limit } = last.current;
      if (limit > 0 && scroll >= 0) return scroll / limit;
      return computeProgressFromDoc();
    };

    const rafUpdate = () => {
      window.requestAnimationFrame(() => {
        setScrollPer(computeProgress());
        ticking = false;
      });
    };

    const onLenisScroll = (e: LenisScrollEvent) => {
      last.current = e;
      if (!ticking) {
        ticking = true;
        rafUpdate();
      }
    };

    const onWindowScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        rafUpdate();
      }
    };

    // Initial paint
    setScrollPer(computeProgress());

    if (isLenisLike(lenis)) {
      lenis.on("scroll", onLenisScroll);
      // seed once in case Lenis is idle at mount
      onLenisScroll({ scroll: window.scrollY || 0, limit: document.documentElement.scrollHeight - document.documentElement.clientHeight });
    } else {
      window.addEventListener("scroll", onWindowScrollOrResize, { passive: true });
      window.addEventListener("resize", onWindowScrollOrResize);
    }

    return () => {
      if (isLenisLike(lenis)) {
        lenis.off("scroll", onLenisScroll);
      } else {
        window.removeEventListener("scroll", onWindowScrollOrResize);
        window.removeEventListener("resize", onWindowScrollOrResize);
      }
    };
  }, [lenis]);

  return null;
}
