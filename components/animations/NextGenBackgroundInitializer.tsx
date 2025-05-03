// components/animations/NextGenBackgroundInitializer.tsx
"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/ScrollProvider";

export default function NextGenBackgroundInitializer() {
  const lenis = useLenis();

  useEffect(() => {
    // handler to run on every Lenis scroll
    const onScroll = ({ scroll }: { scroll: number }) => {
      document.documentElement.style.setProperty(
        "--scroll-position",
        scroll.toString()
      );
    };

    // subscribe
    lenis.on("scroll", onScroll);
    // initial kick
    onScroll({ scroll: 0 });

    return () => {
      // unsubscribe
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return null;
}