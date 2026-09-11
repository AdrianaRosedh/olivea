// app/(main)/[lang]/prewarm-client.tsx
"use client";

import { useEffect } from "react";

export default function ClientPrewarm() {
  useEffect(() => {
    // These three heroes are ~1.1MB together, warmed so that moving to
    // /farmtotable, /casa or /cafe paints instantly.
    const urls = ["/images/farm/hero.jpg", "/images/casa/hero.jpg", "/images/cafe/hero.jpg"];
    urls.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return null;
}
