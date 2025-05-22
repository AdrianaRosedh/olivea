"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
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
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controls = useAnimation();

  // Run before paint to prevent any flash of default positioning
  useLayoutEffect(() => {
    if (!active || !initialBounds || !videoRef.current) return;

    const video = videoRef.current;
    // Choose a non-null source string (fallback to empty string if needed)
    const src = targetVideo ?? videoSrc ?? "";
    video.src = src;
    video.load();

    const performTransition = async () => {
      // Wait until metadata/data is available for seeking
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) return resolve();
        const onLoaded = () => resolve();
        video.addEventListener("loadeddata", onLoaded, { once: true });
      });

      // Seek and play
      video.currentTime = videoPlaybackTime;
      await video.play().catch(() => {});

      // Place overlay exactly over the source card
      controls.set({
        top: initialBounds.top,
        left: initialBounds.left,
        width: initialBounds.width,
        height: initialBounds.height,
        borderRadius: "1.5rem",
      });

      // Wait one frame for the DOM to apply the set
      await new Promise(requestAnimationFrame);

      // Animate to full-screen (98% on desktop, 100% on mobile)
      const isMobile = window.innerWidth < 768;
      const finalAnim = isMobile
        ? { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: "0rem" }
        : {
            top: window.innerHeight * 0.01,
            left: window.innerWidth * 0.01,
            width: window.innerWidth * 0.98,
            height: window.innerHeight * 0.98,
            borderRadius: "1.5rem",
          };

      await controls.start({ ...finalAnim, transition: { duration: 0.8, ease: "easeInOut" } });

      // Brief pause at full-screen
      await new Promise((r) => setTimeout(r, 300));

      // Navigate once animation completes
      await router.prefetch(targetHref);
      await router.push(targetHref);

      // Clear will be triggered once route has changed below
    };

    performTransition();
  }, [
    active,
    initialBounds,
    videoPlaybackTime,
    targetHref,
    targetVideo,
    videoSrc,
    controls,
    router,
  ]);

  // Once the URL updates to targetHref, fade out and clear
  useEffect(() => {
    if (active && pathname === targetHref) {
      controls
        .start({ opacity: 0, transition: { duration: 0.2 } })
        .then(() => clearTransition());
    }
  }, [active, pathname, targetHref, controls, clearTransition]);

  if (!active || !initialBounds) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={false}
        animate={controls}
        style={{
          position: "fixed",
          overflow: "hidden",
          zIndex: 9999,
          willChange: "transform, opacity",
        }}
      >
        <video
          ref={videoRef}
          autoPlay 
          muted
          playsInline
          loop
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}