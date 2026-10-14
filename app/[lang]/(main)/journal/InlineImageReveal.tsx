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
      // The root reaches far above the screen, so a photo jumped over in one go
      // (a contents link, a fast flick) counts as seen instead of staying hidden.
      { threshold: 0, rootMargin: "100000px 0px -15% 0px" }
    );

    figures.forEach((fig) => observer.observe(fig));
    return () => observer.disconnect();
  }, []);

  return null;
}
