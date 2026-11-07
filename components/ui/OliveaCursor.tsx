"use client";

// The house cursor on desktop: a small olive seed that follows the pointer
// exactly, and a soft organic ring that trails a beat behind it. Over anything
// clickable the ring opens up and fills with a faint olive wash; on press it
// draws in. The ring's outline breathes slowly (CSS keyframes in globals.css).
//
// Who gets it: a fine, hovering pointer, motion allowed, and no forced colours
// (Windows High Contrast). Everyone else keeps the native cursor. The native
// cursor is only hidden once the drawn one is actually on screen (after the
// first real mouse move), and comes back whenever the drawn one hides:
// outside the window, over an embedded frame (OpenTable, maps, menus), over a
// text field, or over a disabled control.
//
// The follow loop runs only while the ring is catching up with the pointer
// and stops as soon as it settles, so an idle page does no work.

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], label, summary, select, [data-cursor="hover"]';
const NATIVE = 'input, textarea, select, [contenteditable="true"], :disabled, [aria-disabled="true"], iframe';
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";

/** How quickly the ring closes the gap to the pointer (0–1 per frame). */
const FOLLOW = 0.18;
const SCALE_EASE = 0.2;
const HOVER_SCALE = 1.7;
const PRESS_SCALE = 0.82;
/** Below this distance (px) and scale delta the ring counts as settled. */
const SETTLE = 0.1;

export default function OliveaCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Follows the media query live (e.g. a mouse plugged in, or reduced motion
  // switched on).
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    const root = document.documentElement;

    let x = 0, y = 0, rx = 0, ry = 0;
    let scale = 1, targetScale = 1;
    let visible = false, hovering = false, pressed = false;
    let raf = 0;

    const show = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      root.classList.toggle("olivea-cursor-on", v);
      dot.style.opacity = v ? "1" : "0";
      ring.style.opacity = v ? "1" : "0";
    };

    const setHover = (v: boolean) => {
      hovering = v;
      ring.dataset.hover = v ? "1" : "0";
      dot.dataset.hover = v ? "1" : "0";
      targetScale = (v ? HOVER_SCALE : 1) * (pressed ? PRESS_SCALE : 1);
      kick();
    };

    const frame = () => {
      raf = 0;
      rx += (x - rx) * FOLLOW;
      ry += (y - ry) * FOLLOW;
      scale += (targetScale - scale) * SCALE_EASE;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      const settled = Math.abs(x - rx) + Math.abs(y - ry) < SETTLE && Math.abs(targetScale - scale) < SETTLE / 10;
      if (!settled) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        rx = x;
        ry = y;
      }
      const el = e.target as Element | null;
      const inMain = !!el?.closest?.('[data-scope="main"]');
      show(inMain && !el?.closest?.(NATIVE));
      setHover(!!el?.closest?.(INTERACTIVE));
    };
    const onDown = () => {
      pressed = true;
      setHover(hovering);
    };
    const onUp = () => {
      pressed = false;
      setHover(hovering);
    };
    // Leaving the window, or moving onto an embedded frame (its own document
    // takes over the pointer there).
    const onOut = (e: MouseEvent) => {
      const to = e.relatedTarget as Element | null;
      if (!to || to.tagName === "IFRAME") show(false);
    };
    const onBlur = () => show(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseout", onOut);
    window.addEventListener("blur", onBlur);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("olivea-cursor-on");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2147483000]">
      <div ref={ringRef} className="olivea-cursor-ring absolute left-0 top-0 h-9 w-9 border opacity-0" />
      <div ref={dotRef} className="olivea-cursor-dot absolute left-0 top-0 h-[7px] w-[7px] rounded-full opacity-0" />
    </div>
  );
}
