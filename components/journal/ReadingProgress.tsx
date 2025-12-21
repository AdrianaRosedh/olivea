// components/journal/ReadingProgress.tsx
"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight || document.body.scrollHeight;
      const clientHeight = el.clientHeight;
      const max = Math.max(1, scrollHeight - clientHeight);
      const next = Math.min(1, Math.max(0, scrollTop / max));
      setP(next);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-60 h-0.5 w-full bg-transparent">
      <div
        className="h-full w-full origin-left bg-black/70 dark:bg-white/70"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}