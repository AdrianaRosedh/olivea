"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";

export default function SharedVideoTransition() {
  const {
    videoSrc,
    videoPlaybackTime,
    active,
    targetHref,
    clearTransition,
  } = useSharedTransition();

  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controls = useAnimation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!active || !videoSrc) return;

    const video = videoRef.current;
    if (!video) return;

    video.src = videoSrc;
    video.currentTime = videoPlaybackTime;
    video.play().catch(() => {});

    const performTransition = async () => {
      await new Promise(res => setTimeout(res, 300)); // Ensure buffering

      const finalAnim = isMobile
        ? { top: 0, opacity: 1 }
        : { opacity: 1 };

      await controls.start(finalAnim, {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      });

      await new Promise(res => setTimeout(res, 100));

      router.push(targetHref);
    };

    performTransition();
  }, [active, videoPlaybackTime, targetHref, videoSrc, controls, router, isMobile]);

  useEffect(() => {
    if (pathname === targetHref && active) {
      clearTransition();
    }
  }, [pathname, active, targetHref, clearTransition]);

  if (!active) return null;





  return (
    <AnimatePresence>
      <motion.div
  key="sharedTransition"
  initial={isMobile ? { top: "100vh", opacity: 1 } : { opacity: 0 }}
  animate={isMobile ? { top: 0, opacity: 1 } : { opacity: 1 }}
  exit={{ opacity: 0, transition: { duration: 0.3 } }}
  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
  style={{
    position: "fixed",
    overflow: "hidden",
    zIndex: 500,
    background: "var(--olivea-olive)",
    width: isMobile ? "100vw" : "98vw",
    height: isMobile ? "100vh" : "98vh",
    top: isMobile ? "100vh" : "1vh",
    left: isMobile ? 0 : "1vw",
    borderRadius: isMobile ? 0 : "1.5rem",
  }}
>

        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
