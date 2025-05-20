"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";

export default function SharedVideoTransition() {
  const {
    videoSrc, // ✅ correct spelling
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
      videoRef.current.play();

      (async () => {
        videoControls.set({
          top: initialBounds.top,
          left: initialBounds.left,
          width: initialBounds.width,
          height: initialBounds.height,
          borderRadius: "1.5rem",
        });

        await new Promise(requestAnimationFrame);

        const isMobileMain = window.innerWidth < 768;
        const finalAnimation = isMobileMain
          ? { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: "0rem" }
          : {
              width: window.innerWidth * 0.98,
              height: window.innerHeight * 0.98,
              top: (window.innerHeight - window.innerHeight * 0.98) / 2,
              left: (window.innerWidth - window.innerWidth * 0.98) / 2,
              borderRadius: "1.5rem",
            };

        await videoControls.start({
          ...finalAnimation,
          transition: { duration: 0.8, ease: "easeInOut" },
        });

        router.prefetch(targetHref);
        router.push(targetHref);

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