"use client";

// The house pages' chapter heading (h2). One shared component so every
// chapter title looks and behaves the same, and so the "ink in" effect is
// owned by React instead of a page-wide script editing markup from outside.
//
// Ink in: as the heading rises from the bottom of the screen to just above the
// middle, --ink goes 0 → 1 and the CSS in main.css fills the words with full
// olive from left to right (desktop only; see `h2[data-ink]`). The value is
// written from an effect, after hydration, through a ref, so the server and
// client markup stay identical. --ink defaults to 1 in CSS, so without script,
// with reduced motion, or before the first measurement the heading is plain.
//
// All headings share one scroll listener and one rAF; an IntersectionObserver
// keeps only the headings near the screen in the measured set.

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const BASE = "text-2xl md:text-4xl font-semibold leading-tight";

/** Where the ink starts (heading top at 92% of the viewport) and finishes (52%). */
const INK_START = 0.92;
const INK_END = 0.52;

const active = new Set<HTMLElement>();
let raf = 0;
let listening = false;
let io: IntersectionObserver | null = null;

function measure() {
  raf = 0;
  const vh = window.innerHeight;
  const start = vh * INK_START;
  const end = vh * INK_END;
  // Read every position first, then write, so the browser lays out once.
  const reads: Array<[HTMLElement, number]> = [];
  active.forEach((el) => reads.push([el, el.getBoundingClientRect().top]));
  for (const [el, top] of reads) {
    const p = Math.min(1, Math.max(0, (start - top) / (start - end)));
    el.style.setProperty("--ink", p.toFixed(3));
  }
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(measure);
}

function observe(el: HTMLElement) {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const t = e.target as HTMLElement;
          if (e.isIntersecting) active.add(t);
          else active.delete(t);
        }
        schedule();
      },
      // A margin above and below so a heading is already tracked as it nears.
      { rootMargin: "25% 0px 25% 0px" }
    );
  }
  io.observe(el);
  if (!listening) {
    listening = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }
}

function unobserve(el: HTMLElement) {
  io?.unobserve(el);
  active.delete(el);
}

export default function SectionHeading({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.setProperty("--ink", "0");
    observe(el);
    return () => {
      unobserve(el);
      el.style.removeProperty("--ink");
    };
  }, []);

  return (
    <h2 ref={ref} id={id} data-ink="" className={cn(BASE, className)}>
      {children}
    </h2>
  );
}
