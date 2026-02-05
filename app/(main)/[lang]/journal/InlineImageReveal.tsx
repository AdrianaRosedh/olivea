"use client";

import { useEffect } from "react";

export default function InlineImageReveal() {
  useEffect(() => {
    const figures = document.querySelectorAll("article figure");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    figures.forEach((fig) => observer.observe(fig));
    return () => observer.disconnect();
  }, []);

  return null;
}
