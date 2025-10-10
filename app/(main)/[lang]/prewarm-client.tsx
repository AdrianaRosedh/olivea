// app/(main)/[lang]/prewarm-client.tsx
"use client";

import { useEffect } from "react";

export default function ClientPrewarm() {
  useEffect(() => {
    const urls = ["/images/farm/hero.jpg", "/images/casa/hero.jpg", "/images/cafe/hero.jpg"];
    urls.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return null;
}