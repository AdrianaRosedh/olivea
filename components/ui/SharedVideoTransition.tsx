// components/ui/SharedVideoTransition.tsx
"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import type { VideoKey } from "@/contexts/SharedTransitionContext";

// Map your section keys to [webm, mp4]
const VIDEO_MAP: Record<VideoKey, [string, string]> = {
  casa:        ["/videos/casa.webm",        "/videos/casa.mp4"],
  cafe:        ["/videos/cafe.webm",        "/videos/cafe.mp4"],
  farmtotable: ["/videos/farmtotable.webm", "/videos/farmtotable.mp4"],
};

export default function SharedVideoTransition() {
  const { isActive, videoKey, targetHref, clearTransition } = useSharedTransition();
  const router   = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 1) Detect mobile vs desktop
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 2) Load, play, redirect after entry‐animation, then clear on clip end
  useEffect(() => {
    if (!isActive || !videoKey || !targetHref) return;
    const vid = videoRef.current!;
    const [webm, mp4] = VIDEO_MAP[videoKey];

    vid.pause();
    vid.removeAttribute("src");
    vid.innerHTML = `
      <source src="${webm}" type="video/webm" />
      <source src="${mp4}" type="video/mp4" />
    `;
    vid.load();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn    = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    const net     = conn?.effectiveType ?? "";
    if (reduced || ["2g","slow-2g"].includes(net)) {
      router.push(targetHref);
      clearTransition();
      return;
    }

    const ENTRY_MS = 800; // wait for the entry animation to finish
    let timer: number;

    const onCanPlay = () => {
      vid.play().catch(() => {});
      timer = window.setTimeout(() => {
        router.push(targetHref);
      }, ENTRY_MS);
      vid.removeEventListener("canplay", onCanPlay);
    };
    vid.addEventListener("canplay", onCanPlay);

    const onEnded = () => {
      clearTransition();
      vid.removeEventListener("ended", onEnded);
    };
    vid.addEventListener("ended", onEnded);

    return () => {
      vid.removeEventListener("canplay", onCanPlay);
      vid.removeEventListener("ended", onEnded);
      clearTimeout(timer);
    };
  }, [isActive, videoKey, targetHref, router, clearTransition]);

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key="sharedVideo"
          // 3) initial: desktop full-screen no transform; mobile off-screen bottom
          initial={
            isMobile
              ? { top: 0, left: 0, width: "100vw", height: "100vh", y: "100vh", borderRadius: 0 }
              : { top: 0, left: 0, width: "100vw", height: "100vh", y: 0, borderRadius: 0 }
          }
          // 4) animate: desktop inset + round; mobile slide-in to full-screen
          animate={
            isMobile
              ? {
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  y: 0,
                  borderRadius: 0,
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                }
              : {
                  top: "1vh",
                  left: "1vw",
                  width: "98vw",
                  height: "98vh",
                  y: 0,
                  borderRadius: "1.5rem",
                  transition: {
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }
          }
          // 5) exit: slide up out for both
          exit={{
            y: "-100vh",
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          }}
          style={{
            position: "fixed",
            overflow: "hidden",
            background: "var(--olivea-olive)",
            zIndex: 9999,
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}