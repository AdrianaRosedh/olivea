// app/(main)/[lang]/prewarm-client.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isVotePath } from "@/lib/mexbest";

export default function ClientPrewarm() {
  const pathname = usePathname();

  useEffect(() => {
    // These three heroes are ~1.1MB together, warmed so that moving to
    // /farmtotable, /casa or /cafe paints instantly. The Reader's Choice vote
    // page is a dead end by design — its only exit is the MexBest ballot — so
    // there the prewarm is a megabyte of pure competition for the hero video,
    // on phones that are usually on restaurant wifi.
    if (isVotePath(pathname)) return;

    const urls = ["/images/farm/hero.jpg", "/images/casa/hero.jpg", "/images/cafe/hero.jpg"];
    urls.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [pathname]);

  return null;
}
