"use client";

// Full-screen photo viewer for the house galleries. A soft cream ground, the
// photo large in its rounded frame, the photo's description beneath in italic
// serif, a counter, and thin arrows. ← → move, Esc closes, swipe on touch.
//
// Accessibility: while open, everything outside the viewer is made `inert`
// (no focus, no clicks, hidden from assistive tech), focus moves to Close and
// returns to the clicked photo afterwards, the counter is announced politely,
// and the arrows stay available on phones (screen-reader users can't swipe).
//
// Rendered into its own element under <body> through a portal: the gallery
// rows sit inside transformed (scroll-driven) parents, and a fixed overlay
// inside a transformed ancestor would be positioned against that ancestor.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useUiText } from "@/lib/uiText/context";
import { easeCinematicOut } from "@/lib/animations";
import type { Lang } from "@/lib/i18n";
import type { GalleryImage } from "./GalleryGrid";

/** The gallery tiles' own image settings. The viewer shows the tile's copy
 *  first: same sizes + quality means the browser picks the same file it
 *  already downloaded, so the photo appears instantly while the sharper copy
 *  loads on top. */
export const TILE_SIZES = "(max-width: 768px) 75vw, 35vw";
export const TILE_QUALITY = 80;

/** Most gallery photos are 2:3 portraits; used until a tile reports its own. */
const DEFAULT_ASPECT = 2 / 3;
/** Share of the screen height the photo may use (phone / desktop). */
const MAX_H = { phone: 0.62, desktop: 0.74 };
const MAX_W = 1200;
/** Horizontal swipe distance that counts as next/previous. */
const SWIPE_PX = 50;
const SLIDE_PX = 40;
const DURATION = { overlay: 0.35, photo: 0.35, exit: 0.14 };

type Box = { w: number; h: number };

/** On-screen size of a photo, so the sharp copy is requested at the width it
 *  is actually shown (a portrait is ~450px wide on desktop, not 1200). */
function displayBox(aspect: number): Box {
  const md = window.innerWidth >= 768;
  const maxH = window.innerHeight * (md ? MAX_H.desktop : MAX_H.phone);
  const maxW = Math.min(MAX_W, window.innerWidth - (md ? 160 : 32));
  const w = Math.min(maxH * aspect, maxW);
  return { w: Math.round(w), h: Math.round(w / aspect) };
}

/** Re-renders on resize / rotation so the photo box is re-measured. */
function useViewportTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((n) => n + 1);
    window.addEventListener("resize", on, { passive: true });
    return () => window.removeEventListener("resize", on);
  }, []);
}

/** Makes every other child of <body> inert while active. */
function useInertOutside(active: boolean, keep: HTMLElement | null) {
  useEffect(() => {
    if (!active || !keep) return;
    const touched: HTMLElement[] = [];
    for (const el of Array.from(document.body.children) as HTMLElement[]) {
      if (el === keep || el.contains(keep) || el.inert) continue;
      el.inert = true;
      touched.push(el);
    }
    return () => touched.forEach((el) => (el.inert = false));
  }, [active, keep]);
}

export default function GalleryViewer({
  lang,
  images,
  index,
  onClose,
  onIndex,
  aspects = [],
}: {
  lang: Lang;
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  /** width / height per image, read from the loaded tiles. */
  aspects?: number[];
}) {
  const open = index !== null;
  const t = useUiText(lang);
  const reduce = usePrefersReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const touchX = useRef<number | null>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [dir, setDir] = useState(0);
  const [sharpLoaded, setSharpLoaded] = useState<number | null>(null);

  useViewportTick();
  useScrollLock(open);

  // The portal host: one element of our own under <body>, so "everything
  // else" can be made inert around it.
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-gallery-viewer-host", "");
    document.body.appendChild(el);
    setHost(el);
    return () => el.remove();
  }, []);
  useInertOutside(open, host);

  const go = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      setDir(delta);
      onIndex((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndex]
  );

  // Focus: into the viewer on open, back to the tile on close.
  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement;
      requestAnimationFrame(() => closeRef.current?.focus());
    } else if (returnFocus.current instanceof HTMLElement) {
      returnFocus.current.focus();
      returnFocus.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, onClose]);

  if (!host) return null;

  const img = index !== null ? images[index] : null;
  const slide = reduce ? 0 : SLIDE_PX;
  const dur = (s: number) => (reduce ? 0.01 : s);
  const aspectOf = (i: number) => aspects[i] || DEFAULT_ASPECT;
  const box = index !== null ? displayBox(aspectOf(index)) : { w: 0, h: 0 };
  // The photos either side, fetched ahead so the arrows feel immediate.
  const neighbours =
    index !== null && images.length > 1
      ? Array.from(new Set([(index + 1) % images.length, (index - 1 + images.length) % images.length]))
      : [];
  const arrow =
    "grid h-11 w-11 place-items-center rounded-full text-(--olivea-olive) transition-colors hover:bg-(--olivea-olive)/10 focus-visible:outline-2 focus-visible:outline-(--olivea-olive) md:absolute md:top-1/2 md:h-12 md:w-12 md:-translate-y-1/2";

  return createPortal(
    <AnimatePresence>
      {open && img && (
        <motion.div
          key="olivea-gallery-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={t("editorial.gallery.dialog")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur(DURATION.overlay), ease: easeCinematicOut }}
          className="fixed inset-0 z-[5000] flex flex-col items-center justify-center px-4 py-6 md:px-20 md:py-10"
          style={{
            background: "color-mix(in srgb, var(--olivea-shell) 96%, transparent)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          // A click on the cream ground (not the photo or controls) closes.
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            touchX.current = null;
            const end = e.changedTouches[0]?.clientX;
            if (start == null || end == null) return;
            const dx = end - start;
            if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
          }}
          data-scope="main"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("editorial.gallery.close")}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-(--olivea-olive)/30 text-(--olivea-olive) transition-colors hover:bg-(--olivea-olive) hover:text-(--olivea-cream) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--olivea-olive) md:right-8 md:top-8"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.figure
              key={index}
              custom={dir}
              initial={{ opacity: 0, x: dir * slide }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * slide, transition: { duration: dur(DURATION.exit) } }}
              transition={{ duration: dur(DURATION.photo), ease: easeCinematicOut }}
              className="flex w-full max-w-[1200px] flex-col items-center"
            >
              {/* The photo keeps its own proportions, so the rounded corners
                  sit on the photo itself. The tile's already-downloaded copy
                  shows at once; the sharp copy, sized to this box, fades in
                  over it when it arrives. */}
              <div className="flex h-[62vh] w-full items-center justify-center md:h-[74vh]">
                <div className="relative overflow-hidden rounded-[28px]" style={{ width: box.w, height: box.h }}>
                  <Image src={img.src} alt="" aria-hidden="true" fill sizes={TILE_SIZES} quality={TILE_QUALITY} className="object-cover" />
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={`${box.w}px`}
                    quality={TILE_QUALITY}
                    priority
                    onLoad={() => setSharpLoaded(index)}
                    className="object-cover transition-opacity duration-500"
                    style={{ opacity: sharpLoaded === index ? 1 : 0 }}
                  />
                </div>
              </div>
              {img.alt && (
                <figcaption
                  className="olivea-display-italic mt-6 max-w-[680px] text-center"
                  style={{ fontSize: "clamp(17px, 1.5vw, 21px)", lineHeight: 1.35 }}
                >
                  {img.alt}
                </figcaption>
              )}
            </motion.figure>
          </AnimatePresence>

          {/* Arrows and counter: one row under the photo on phones; arrows at
              the sides on larger screens. */}
          <div className="mt-4 flex items-center gap-4 md:mt-3">
            {images.length > 1 && (
              <button type="button" onClick={() => go(-1)} aria-label={t("editorial.gallery.prev")} className={`${arrow} md:left-6`}>
                <ChevronLeft className="h-7 w-7" strokeWidth={1.2} />
              </button>
            )}
            <span className="olivea-eyebrow" aria-live="polite" aria-atomic="true">
              {(index ?? 0) + 1} / {images.length}
            </span>
            {images.length > 1 && (
              <button type="button" onClick={() => go(1)} aria-label={t("editorial.gallery.next")} className={`${arrow} md:right-6`}>
                <ChevronRight className="h-7 w-7" strokeWidth={1.2} />
              </button>
            )}
          </div>

          <div aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
            {neighbours.map((n) => {
              const b = displayBox(aspectOf(n));
              return (
                <div key={n} className="relative" style={{ width: b.w, height: b.h }}>
                  <Image src={images[n].src} alt="" fill sizes={`${b.w}px`} quality={TILE_QUALITY} loading="eager" />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    host
  );
}
