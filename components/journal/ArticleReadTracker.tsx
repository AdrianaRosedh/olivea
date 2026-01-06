"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";

type Depth = "50%" | "75%" | "100%";

export default function ArticleReadTracker({ slug }: { slug: string }) {
  const fired = useRef<Set<Depth>>(new Set());

  useEffect(() => {
    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY + window.innerHeight;
      const progress = scrollTop / scrollHeight;

      if (progress >= 0.5 && !fired.current.has("50%")) {
        track("article_progress", { slug, depth: "50%" });
        fired.current.add("50%");
      }

      if (progress >= 0.75 && !fired.current.has("75%")) {
        track("article_progress", { slug, depth: "75%" });
        fired.current.add("75%");
      }

      if (progress >= 0.98 && !fired.current.has("100%")) {
        track("article_progress", { slug, depth: "100%" });
        fired.current.add("100%");
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  return null;
}