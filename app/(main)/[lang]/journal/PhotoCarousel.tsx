"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CarouselImage = {
  src: string;
  alt: string;
};

export default function PhotoCarousel({
  images,
}: {
  images: CarouselImage[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate images for seamless loop
  const loopImages = [...images, ...images, ...images];

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let rafId: number;
    let x = 0;
    let last = performance.now();

    const SPEED = 0.035;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (!isPaused) {
        x -= dt * SPEED;
        const loopWidth = track.scrollWidth / 3;
        if (Math.abs(x) >= loopWidth) x = 0;
        track.style.transform = `translateX(${x}px)`;
        updateFocus();
      }

      rafId = requestAnimationFrame(tick);
    };

    const updateFocus = () => {
      const cards = Array.from(
        track.querySelectorAll<HTMLElement>("[data-card]")
      );
      const viewportCenter =
        container.getBoundingClientRect().left +
        container.offsetWidth / 2;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - viewportCenter);
        const t = Math.min(dist / 420, 1);

        const scale = 1 - t * 0.18;      // 1 → 0.85
        const opacity = 1 - t * 0.65;    // 1 → 0.4

        card.style.transform = `scale(${scale})`;
        card.style.opacity = `${opacity}`;
      });
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused]);

  return (
    <section
      ref={containerRef}
      className="relative my-28 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Soft edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-linear-to-r from-(--olivea-bg) to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-linear-to-l from-(--olivea-bg) to-transparent z-10" />

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-8 will-change-transform"
        style={{ width: "max-content" }}
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
