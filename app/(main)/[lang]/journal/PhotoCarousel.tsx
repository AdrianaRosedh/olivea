// app/(main)/[lang]/journal/PhotoCarousel.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type CarouselImage = {
  src: string;
  alt: string;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function isCoarsePointer() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? true;
}

function isFineHover() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
}

export default function PhotoCarousel({ images }: { images: CarouselImage[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [paused, setPaused] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  // Duplicate images only for autoplay mode (seamless loop)
  const loopImages = useMemo(() => [...images, ...images, ...images], [images]);

  useEffect(() => {
    // Decide once on mount (and on resize-ish changes)
    const decide = () => {
      const reduced = prefersReducedMotion();
      const coarse = isCoarsePointer();
      const fine = isFineHover();

      // Autoplay only when it's likely performant and expected UX
      setAutoplayEnabled(!reduced && !coarse && fine);
    };

    decide();

    // Media queries can change (rotation, iPad modes)
    const m1 = window.matchMedia("(prefers-reduced-motion: reduce)");
    const m2 = window.matchMedia("(pointer: coarse)");
    const m3 = window.matchMedia("(hover: hover) and (pointer: fine)");

    const onChange = () => decide();
    m1?.addEventListener?.("change", onChange);
    m2?.addEventListener?.("change", onChange);
    m3?.addEventListener?.("change", onChange);

    return () => {
      m1?.removeEventListener?.("change", onChange);
      m2?.removeEventListener?.("change", onChange);
      m3?.removeEventListener?.("change", onChange);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const any = entries.some((e) => e.isIntersecting);
        setVisible(any);
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplayEnabled) return;
    if (!visible) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let rafId = 0;
    let x = 0;
    let last = performance.now();

    // throttle focus updates
    let lastFocus = 0;

    const SPEED = 0.035; // your original speed

    const updateFocus = (now: number) => {
      // Update at ~8fps (every 120ms). Looks smooth enough and much cheaper.
      if (now - lastFocus < 120) return;
      lastFocus = now;

      const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-card]"));
      const viewportCenter =
        container.getBoundingClientRect().left + container.offsetWidth / 2;

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - viewportCenter);
        const t = Math.min(dist / 420, 1);

        const scale = 1 - t * 0.18; // 1 → 0.85
        const opacity = 1 - t * 0.65; // 1 → 0.4

        card.style.transform = `scale(${scale})`;
        card.style.opacity = `${opacity}`;
      }
    };

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (!paused) {
        x -= dt * SPEED;

        const loopWidth = track.scrollWidth / 3;
        if (Math.abs(x) >= loopWidth) x = 0;

        track.style.transform = `translate3d(${x}px,0,0)`;
        updateFocus(now);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoplayEnabled, paused, visible]);

  // ✅ Mobile / low-power mode: scroll-snap (no RAF)
  if (!autoplayEnabled) {
    return (
      <section className="my-20">
        <div
          ref={containerRef}
          className="overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-4 px-1 snap-x snap-mandatory">
            {images.map((img, i) => (
              <figure
                key={i}
                className="relative w-70 h-80 rounded-3xl overflow-hidden shrink-0 snap-center"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 75vw, 320px"
                  className="object-cover"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ✅ Desktop autoplay mode
  return (
    <section
      ref={containerRef}
      className="relative my-28 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Soft edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-linear-to-r from-(--olivea-bg) to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-linear-to-l from-(--olivea-bg) to-transparent z-10" />

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-8 will-change-transform"
        style={{ width: "max-content", transform: "translate3d(0,0,0)" }}
      >
        {loopImages.map((img, i) => (
          <figure
            key={i}
            data-card
            className="relative w-65 h-75 rounded-3xl overflow-hidden shrink-0 transition-transform duration-700 ease-out"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="260px"
              className="object-cover scale-[1.05] transition-transform duration-6000 ease-out hover:scale-[1.12]"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}