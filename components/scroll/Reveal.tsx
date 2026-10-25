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
//
// ★ ONE ENTRANCE. Every block rises the same 16px over the same 0.45s with
//   the same easing; "fade" is the only other look. The presets, distances
//   and durations callers still pass used to give each section its own
//   motion (blur, slides from the side, up to 0.9s), so a fast scroller saw
//   half-faded text. They are accepted and mapped onto this one entrance.
//   Blocks animated with framer-motion use `entrance()` below for the same.
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
  /** @deprecated Every block shares ENTRANCE.distance; kept so callers compile. */
  distance?: number; // px
  /** @deprecated Every block shares ENTRANCE.duration; kept so callers compile. */
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

export const ENTRANCE = {
  distance: 16, // px
  duration: 0.45, // s
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** A block never waits longer than this once it is reached. */
  maxDelay: 0.3, // s
} as const;

/** The same entrance for a framer-motion block: spread onto `motion.*`. */
export function entrance(delay = 0) {
  return {
    initial: { opacity: 0, y: ENTRANCE.distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: {
      duration: ENTRANCE.duration,
      ease: ENTRANCE.ease,
      delay: Math.min(delay, ENTRANCE.maxDelay),
    },
  } as const;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The starting offset, as CSS variables the keyframes read: a plain fade,
 *  or the one shared rise for every other preset. */
function startVars(preset: RevealPreset): Record<string, string> {
  return preset === "fade" ? {} : { "--reveal-y": `${ENTRANCE.distance}px` };
}

export default function Reveal({
  children,
  preset = "up",
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
    // A block already "waiting" must always be watched again: if this effect
    // runs a second time (React's development double-run, a remount) after
    // the page has jumped — the /menu shortcut lands on #menu — the block is
    // above the screen and would otherwise stay invisible for good.
    if (el.dataset.revealState !== "waiting" && el.getBoundingClientRect().top < window.innerHeight) return;

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
    ...startVars(preset),
    "--reveal-duration": `${ENTRANCE.duration}s`,
    "--reveal-delay": `${Number(Math.min(delay, ENTRANCE.maxDelay).toFixed(3))}s`,
  } as CSSProperties;

  return (
    <Tag ref={ref} id={id} className={className} data-reveal={preset} style={style}>
      {children}
    </Tag>
  );
}
