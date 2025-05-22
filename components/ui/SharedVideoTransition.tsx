"use client";

import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controls = useAnimation();

  // Run before paint to prevent any flash of default positioning
  useEffect(() => {
    if (!active || !initialBounds || !videoRef.current) return;
    
    const video = videoRef.current;
    
    // 1️⃣ Compute source URLs
    const mp4Url = (targetVideo ?? videoSrc ?? "").trim();
    const webmUrl = mp4Url.replace(/\.mp4$/, ".webm");
    
    // 2️⃣ Update <source> tags
    const sources = Array.from(video.querySelectorAll("source"));
    const webmSource = sources.find(s => s.getAttribute("data-type") === "webm");
    const mp4Source = sources.find(s => s.getAttribute("data-type") === "mp4");
    
    if (webmSource && mp4Source) {
      webmSource.src = webmUrl;
      mp4Source.src = mp4Url;
      video.load(); // pick up the new <source> URLs
    } else {
      // Fallback: if sources not found, set src directly to MP4
      video.src = mp4Url;
      video.load();
    }
  
    const performTransition = async () => {
      // Wait for enough data to seek
      await new Promise<void>(resolve => {
        if (video.readyState >= 2) return resolve();
        video.addEventListener("loadeddata", () => resolve(), { once: true });
      });
    
      // Seek & play
      video.currentTime = videoPlaybackTime;
      await video.play().catch(() => {});
    
      // Position overlay over the card
      controls.set({
        top: initialBounds.top,
        left: initialBounds.left,
        width: initialBounds.width,
        height: initialBounds.height,
        borderRadius: "1.5rem",
      });
    
      // One frame for the set to apply
      await new Promise(requestAnimationFrame);
    
      // Animate to full-screen
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
        
      await controls.start({
        ...finalAnim,
        transition: { duration: 0.8, ease: "easeInOut" },
      });
    
      // Pause briefly at full-screen
      await new Promise(r => setTimeout(r, 300));
    
      // Navigate
      await router.prefetch(targetHref);
      await router.push(targetHref);
    
      // clearTransition will run after route change
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
          style={{ width:"100%", height:"100%", objectFit:"cover" }}
        >
          {/* 1️⃣ WebM first */}
          <source data-type="webm" />
          {/* 2️⃣ MP4 fallback */}
          <source data-type="mp4" />
          Your browser doesn’t support this video.
        </video>
      </motion.div>
    </AnimatePresence>
  );
}