"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/ScrollProvider";

export default function NextGenBackgroundInitializer() {
  const lenis = useLenis();

  useEffect(() => {
    let ticking = false;

    const onScroll = ({ scroll }: { scroll: number }) => {
      // normalize scroll into 0–1 range
      const scrollPer = Math.min(scroll / 1000, 1);
      if (!ticking) {
        window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty(
            "--scroll-per",
            scrollPer.toString()
          );
          ticking = false;
        });
        ticking = true;
      }
    };

    // subscribe to Lenis scroll
    lenis.on("scroll", onScroll);
    // set initial value
    onScroll({ scroll: window.scrollY });

    return () => {
      // unsubscribe
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return null;
}
