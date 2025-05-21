"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";

export default function SharedVideoTransition() {
  const {
    videoSrc,
    videoPlaybackTime,
    active,
    targetHref,
    initialBounds,
    clearTransition,
    targetVideo,
  } = useSharedTransition();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoControls = useAnimation();

  useEffect(() => {
    if (active && videoRef.current && initialBounds) {
      videoRef.current.currentTime = videoPlaybackTime;
      videoRef.current.play().catch(() => {});

      (async () => {
        // 📍 Start exactly over the card
        videoControls.set({
          top: initialBounds.top,
          left: initialBounds.left,
          width: initialBounds.width,
          height: initialBounds.height,
          borderRadius: "1.5rem",
        });
        await new Promise(requestAnimationFrame);

        // 📈 Grow to full-screen (98% on desktop, 100% on mobile)
        const isMobile = window.innerWidth < 768;
        const finalAnim = isMobile
          ? { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: "0rem" }
          : {
              width: window.innerWidth * 0.98,
              height: window.innerHeight * 0.98,
              top: (window.innerHeight * 0.01),
              left: (window.innerWidth * 0.01),
              borderRadius: "1.5rem",
            };

        await videoControls.start({ ...finalAnim, transition: { duration: 0.8, ease: "easeInOut" } });

        // ⏸ Pause so the user actually sees it full-screen
        await new Promise(res => setTimeout(res, 500));

        // 🚀 Now navigate
        router.prefetch(targetHref);
        router.push(targetHref);

        // 🧹 Clear after navigation & fade-out
        setTimeout(clearTransition, 800);
      })();
    }
  }, [active, initialBounds, videoPlaybackTime, router, targetHref, clearTransition, videoControls]);

  if (!active || !initialBounds) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={false}
        animate={videoControls}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        style={{ position: "fixed", overflow: "hidden", zIndex: 9999 }}
      >
        <video
          ref={videoRef}
          src={targetVideo || videoSrc || ""}
          muted
          autoPlay
          playsInline
          loop
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}