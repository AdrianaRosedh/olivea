"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";

export default function SharedVideoTransition() {
  const { videoSrc, videoPlaybackTime, active, targetHref, initialBounds, clearTransition } = useSharedTransition();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoControls = useAnimation();  // ✅ Moved here, clearly before useEffect

  useEffect(() => {
    if (active && videoRef.current && initialBounds) {
      videoRef.current.currentTime = videoPlaybackTime;
      videoRef.current.play();
  
      (async () => {
        // Start exactly at the initial card position
        await videoControls.start({
          top: initialBounds.top,
          left: initialBounds.left,
          width: initialBounds.width,
          height: initialBounds.height,
          borderRadius: "1.5rem",
          transition: { duration: 0 },
        });
  
        const isMobileMain = window.innerWidth < 768;
  
        if (isMobileMain) {
          // Mobile: animate to fullscreen centered, optimized positioning
          await videoControls.start({
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            borderRadius: "0rem",
            transition: { duration: 0.8, ease: "easeInOut" },
          });
        } else {
          // Desktop: your current shared dimensions
          const finalWidth = window.innerWidth * 0.98;
          const finalHeight = window.innerHeight * 0.98;
          const finalTop = (window.innerHeight - finalHeight) / 2;
          const finalLeft = (window.innerWidth - finalWidth) / 2;
  
          await videoControls.start({
            top: finalTop,
            left: finalLeft,
            width: finalWidth,
            height: finalHeight,
            borderRadius: "1.5rem",
            transition: { duration: 0.8, ease: "easeInOut" },
          });
        }
  
        router.push(targetHref);
        setTimeout(clearTransition, 500);
      })();
    }
  }, [
    active,
    initialBounds,
    videoPlaybackTime,
    router,
    targetHref,
    clearTransition,
    videoControls,
  ]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={false}
          animate={videoControls}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            zIndex: 9999,
            borderRadius: "1.5rem",
          }}
        >
          <video
            ref={videoRef}
            src={videoSrc || ""}
            muted
            autoPlay
            playsInline
            loop
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}