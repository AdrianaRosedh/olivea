// components/ui/SharedVideoTransition.tsx
"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion, usePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import type { VideoKey } from "@/contexts/SharedTransitionContext";

const VIDEO_MAP: Record<VideoKey, [string, string]> = {
  casa:        ["/videos/casa.webm",        "/videos/casa.mp4"],
  cafe:        ["/videos/cafe.webm",        "/videos/cafe.mp4"],
  farmtotable: ["/videos/farmtotable.webm", "/videos/farmtotable.mp4"],
};

export default function SharedVideoTransition() {
  const { isActive, videoKey, targetHref, clearTransition } = useSharedTransition();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [snapUrl, setSnapUrl] = useState<string | null>(null);
  const [isPresent, safeToRemove] = usePresence(); // 👈 detect when exit begins

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sources = useMemo(() => (videoKey ? VIDEO_MAP[videoKey] : null), [videoKey]);

  // Capture CURRENT frame → dataURL
  const captureFrame = () => {
    const vid = videoRef.current;
    if (!vid || !vid.videoWidth || !vid.videoHeight) return null;
    const c = document.createElement("canvas");
    c.width = vid.videoWidth;
    c.height = vid.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    try {
      ctx.drawImage(vid, 0, 0, c.width, c.height);
      return c.toDataURL("image/webp");
    } catch {
      return null;
    }
  };

  // Play & schedule navigation (entry timing stays the same)
  useEffect(() => {
    if (!isActive || !videoKey || !targetHref) return;
    const vid = videoRef.current;
    if (!vid) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const net = (navigator as any)?.connection?.effectiveType ?? "";
    if (reduced || ["2g", "slow-2g"].includes(net)) {
      router.push(targetHref);
      clearTransition(); // triggers exit immediately
      return;
    }

    const onCanPlay = () => vid.play().catch(() => {});
    vid.addEventListener("canplay", onCanPlay, { once: true });

    const ENTRY_MS = 2000;
    const t = window.setTimeout(() => {
      router.push(targetHref);
      // 👇 trigger AnimatePresence exit NOW;
      // the component stays mounted in "exiting" state
      clearTransition();
    }, ENTRY_MS);

    return () => {
      vid.removeEventListener("canplay", onCanPlay);
      clearTimeout(t);
    };
  }, [isActive, videoKey, targetHref, router, clearTransition]);

  // Freeze EXACTLY when exit starts
  useEffect(() => {
    if (isPresent) return; // still entering/idle
    // We are now in the exit phase: grab frame, hide video
    const url = captureFrame();
    if (url) {
      setSnapUrl(url);
      const vid = videoRef.current;
      if (vid) {
        vid.pause();
        vid.style.visibility = "hidden";
      }
    }
    // Let the exit animation (0.8s) run, then fully remove
    const exitMs = 800;
    const t = window.setTimeout(() => {
      setSnapUrl(null);
      safeToRemove?.(); // allow AnimatePresence to unmount
    }, exitMs + 20);
    return () => clearTimeout(t);
  }, [isPresent, safeToRemove]);

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key="sharedVideo"
          initial={
            isMobile
              ? { top: 0, left: 0, width: "100vw", height: "100vh", y: "100vh", borderRadius: 0 }
              : { top: "1vh", left: "1vw", width: "98vw", height: "98vh", y: 0, borderRadius: "1.5rem", opacity: 0 }
          }
          animate={
            isMobile
              ? { top: 0, left: 0, width: "100vw", height: "100vh", y: 0, borderRadius: 0, transition: { duration: 0.9, ease: [0.22,1,0.36,1] } }
              : { opacity: 1, transition: { duration: 0.9, ease: [0.22,1,0.36,1] } }
          }
          exit={{ y: "-100vh", transition: { duration: 0.8, ease: [0.22,1,0.36,1] } }}
          style={{
            position: "fixed",
            overflow: "hidden",
            background: "var(--olivea-olive)",
            zIndex: 9999,
            willChange: "transform, opacity",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            isolation: "isolate",
            contain: "paint",
          }}
        >
          {/* Snapshot rendered only during exit */}
          {snapUrl && (
            <img
              src={snapUrl}
              alt=""
              aria-hidden
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
            />
          )}

          <video
            key={videoKey}
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            loop  // avoids 'ended' races on short clips
            style={{ width: "100%", height: "100%", objectFit: "cover", visibility: snapUrl ? "hidden" : "visible" }}
          >
            {sources && (
              // Prefer MP4 first during the transition for maximum robustness.
              <>
                <source src={sources[1]} type="video/mp4" />
                <source src={sources[0]} type="video/webm" />
              </>
            )}
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}