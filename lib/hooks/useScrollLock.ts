"use client";

import { useEffect } from "react";

/**
 * Locks page scrolling while `active` is true.
 *
 * globals.css sets `overflow-y: auto` on BOTH html and body. When both are set,
 * the viewport scrolls the <html> element — so the usual
 * `document.body.style.overflow = "hidden"` does nothing at all, and wheel
 * gestures over a modal keep moving the page behind it. Both elements are
 * locked here.
 *
 * The scrollbar's width is added back as body padding so the page doesn't
 * visibly jump sideways when a modal opens.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const body = document.body;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };

    const scrollbarWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPaddingRight;
    };
  }, [active]);
}
