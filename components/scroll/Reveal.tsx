"use client";

// components/scroll/Reveal.tsx
// ─────────────────────────────────────────────────────────────────────
// Fade/slide a block in — without making it wait for JavaScript.
//
// ★ CSS FIRST. The block carries its entrance as a CSS animation
//   (globals.css, [data-reveal]), so on the first screen it plays the moment
//   the page paints — before React has loaded. The previous version rendered
//   `opacity: 0` inline and only revealed on an IntersectionObserver after
//   hydration: on a mid-range phone the first screen of Contact, Careers,
//   Sustainability and the section heroes sat invisible for seconds, and
//   Lighthouse counted ~10 s of "render delay" before the main image showed.
//
// ★ SCROLL REVEAL KEPT. Once React is running, a block that is still below the
//   screen is put back to its hidden starting state (it is off-screen, so
//   nothing flickers) and plays the same entrance when it scrolls into view.
//
// ★ Reduced motion: the CSS shows everything at once, no entrance.
// ─────────────────────────────────────────────────────────────────────

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type PropsWithChildren,
  type ReactElement,
} from "react";

export type RevealPreset =
  | "fade"
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale-in"
  | "zoom-out"
  | "blur-up";

export type RevealProps = {
  preset?: RevealPreset;
  distance?: number; // px
  duration?: number; // s
  delay?: number; // s
  once?: boolean;
  amount?: number | "some" | "all";
  className?: string;
  id?: string;
  as?: ElementType;
  /** Extra inline style (fonts etc.); the entrance variables are added to it. */
  style?: CSSProperties;
};

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The starting offset of each preset, as CSS variables the keyframes read. */
function startVars(preset: RevealPreset, distance: number): Record<string, string> {
  switch (preset) {
    case "up":
      return { "--reveal-y": `${distance}px` };
    case "down":
      return { "--reveal-y": `${-distance}px` };
    case "left":
      return { "--reveal-x": `${-distance}px` };
    case "right":
      return { "--reveal-x": `${distance}px` };
    case "scale-in":
      return { "--reveal-scale": "0.96" };
    case "zoom-out":
      return { "--reveal-scale": "1.06" };
    case "blur-up":
      return { "--reveal-y": `${distance}px`, "--reveal-blur": "6px" };
    default:
      return {};
  }
}

export default function Reveal({
  children,
  preset = "up",
  distance = 24,
  duration = 0.7,
  delay = 0,
  once = true,
  amount = "some",
  className = "",
  id,
  as,
  style: extraStyle,
}: PropsWithChildren<RevealProps>): ReactElement {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  // After hydration: blocks below the screen wait for the scroll; blocks
  // already on screen keep the entrance they played on first paint.
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.revealState = "waiting";
    const threshold = amount === "all" ? 1 : amount === "some" ? 0 : amount;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.revealState = "play";
          if (once) io.disconnect();
        } else if (!once) {
          el.dataset.revealState = "waiting";
        }
      },
      // The root reaches far above the screen: a block jumped over in one go
      // (a chapter link, a fast flick) counts as reached, instead of waiting
      // invisibly for a scroll back up. The bottom edge is the screen's own:
      // a block is "waiting" only when it starts fully below the screen, so it
      // must play as soon as any of it is visible. A -20% margin here left a
      // block whose top settled in the bottom fifth (fonts, images loading)
      // blank until the visitor scrolled.
      { threshold, rootMargin: "100000px 0px 0px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, once]);

  const style = {
    ...extraStyle,
    ...startVars(preset, distance),
    "--reveal-duration": `${duration}s`,
    "--reveal-delay": `${Number(delay.toFixed(3))}s`,
  } as CSSProperties;

  return (
    <Tag ref={ref} id={id} className={className} data-reveal={preset} style={style}>
      {children}
    </Tag>
  );
}
