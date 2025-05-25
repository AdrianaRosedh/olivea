// components/ui/SharedVideoTransition.tsx
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

  useEffect(() => {
    if (!active || !initialBounds || !videoRef.current) return;
    const video = videoRef.current;

    // 1️⃣ Compute MP4 and WebM URLs
    const mp4Url = (targetVideo ?? videoSrc ?? "").trim();
    const webmUrl = mp4Url.replace(/\.mp4$/, ".webm");

    // 2️⃣ Assign into <source> tags
    const sources = Array.from(video.querySelectorAll("source"));
    const webmSource = sources.find((s) => s.getAttribute("data-type") === "webm");
    const mp4Source = sources.find((s) => s.getAttribute("data-type") === "mp4");
    if (webmSource && mp4Source) {
      webmSource.src = webmUrl;
      mp4Source.src = mp4Url;
      video.load();
    } else {
      // Fallback if your <source> tags are missing
      video.src = mp4Url;
      video.load();
    }

    const performTransition = async () => {
  video.currentTime = videoPlaybackTime;
  const playPromise = video.play().catch(() => {});

  await Promise.race([
    new Promise<void>((res) => {
      if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        return res();
      }
      video.addEventListener("canplaythrough", () => res(), { once: true });
    }),
    new Promise<void>((res) => setTimeout(res, 200)),
  ]);

  await playPromise;

  // Final animation to full viewport
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

  // Wait for animation to finish explicitly before navigation
  await controls.start({
    ...finalAnim,
    transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] },
  });

  // Add a slight delay to ensure animation fully settles visually
  await new Promise((res) => setTimeout(res, 150));

  // Then navigate
  await router.prefetch(targetHref);
  await router.push(targetHref);
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

  // Once navigation hits the target URL, fade out and clear the overlay
  useEffect(() => {
    if (active && pathname === targetHref) {
      clearTransition();
    }
  }, [active, pathname, targetHref, clearTransition]);

  useEffect(() => {
  const video = videoRef.current;
  return () => {
    if (video) {
      video.pause();             
      video.currentTime = 0;    
    }
  };
}, []);


  if (!active || !initialBounds) return null;

return (
  <AnimatePresence mode="wait" initial={true}>
    {active && initialBounds && (
      <motion.div
        key="sharedTransition"
        initial={{
          top: window.innerWidth < 768 ? "100vh" : initialBounds.top,
          left: window.innerWidth < 768 ? 0 : initialBounds.left,
          width: window.innerWidth < 768 ? "100vw" : initialBounds.width,
          height: window.innerWidth < 768 ? "100vh" : initialBounds.height,
          borderRadius: window.innerWidth < 768 ? "0rem" : "1.5rem",
          opacity: 1,
        }}
        animate={{
          top: window.innerWidth < 768 ? 0 : window.innerHeight * 0.01,
          left: window.innerWidth < 768 ? 0 : window.innerWidth * 0.01,
          width: window.innerWidth < 768 ? "100vw" : window.innerWidth * 0.98,
          height: window.innerWidth < 768 ? "100vh" : window.innerHeight * 0.98,
          borderRadius: window.innerWidth < 768 ? "0rem" : "1.5rem",
          opacity: 1,
        }}
        exit={{ opacity: 1, transition: { duration: 0.3 } }}
        transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }} // smooth ease-out
        style={{
          position: "fixed",
          overflow: "hidden",
          zIndex: 500,
          background: "var(--olivea-olive)",
          willChange: "transform, opacity",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source data-type="webm" />
          <source data-type="mp4" />
          Your browser doesn’t support this video.
        </video>
      </motion.div>
    )}
  </AnimatePresence>
);


}