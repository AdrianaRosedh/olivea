"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useAnimation, useReducedMotion } from "framer-motion";

function isModifiedEvent(e: MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

function getSameOriginHref(a: HTMLAnchorElement) {
  const href = a.getAttribute("href");
  if (!href) return null;
  if (href.startsWith("#")) return null;          // in-page anchors
  if (href.startsWith("mailto:")) return null;
  if (href.startsWith("tel:")) return null;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

export default function MainFadeRouter({
  children,
  duration = 0.6,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const controls = useAnimation();
  const reduce = useReducedMotion();

  const pendingHrefRef = useRef<string | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Ensure we start visible
  useEffect(() => {
    controls.set({ opacity: 1 });
  }, [controls]);

  // When the route actually changes, fade in (if we were transitioning)
  useEffect(() => {
    if (!pendingHrefRef.current) return;
    // new route has mounted -> fade in
    controls.start({
      opacity: 1,
      transition: { duration: reduce ? 0 : duration, ease: [0.4, 0.0, 0.2, 1] },
    });
    pendingHrefRef.current = null;
  }, [pathname, controls, duration, reduce]);

  // Global link interception (captures <Link> and plain <a>)
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      if (reduce) return; // respect reduced motion
      if (isModifiedEvent(e)) return;

      const target = e.target as HTMLElement | null;
      const a = target?.closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      // Opt-out support
      if (a.dataset.noFade === "true") return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const href = getSameOriginHref(a);
      if (!href) return;

      // Same route? Let it behave normally (or your same-route handlers)
      const current = window.location.pathname + window.location.search + window.location.hash;
      if (href === current) return;

      // Prevent Next from navigating immediately
      e.preventDefault();
      if (isFadingOut) return;

      setIsFadingOut(true);
      pendingHrefRef.current = href;

      // Fade out first
      await controls.start({
        opacity: 0,
        transition: { duration, ease: [0.4, 0.0, 0.2, 1] },
      });

      // Now navigate while hidden
      router.push(href);
      setIsFadingOut(false);
    };

    document.addEventListener("click", onClick, true); // capture phase
    return () => document.removeEventListener("click", onClick, true);
  }, [router, controls, duration, reduce, isFadingOut]);

  return (
    <motion.div style={{ willChange: "opacity" }} animate={controls}>
      {children}
    </motion.div>
  );
}
