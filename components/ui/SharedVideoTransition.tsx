// components/ui/SharedVideoTransition.tsx
"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion, usePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const navigatedRef = useRef(false); // guard so push happens once
  const holdTimerRef = useRef<number | undefined>(undefined);

  const [isMobile, setIsMobile] = useState(false);
  const [snapUrl, setSnapUrl] = useState<string | null>(null);
  const [isPresent, safeToRemove] = usePresence(); // tells us when exit begins

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sources = useMemo(() => (videoKey ? VIDEO_MAP[videoKey] : null), [videoKey]);

  // ——— helpers ———
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

  // Start playback ASAP
  useEffect(() => {
    if (!isActive) return;
    const vid = videoRef.current;
    if (!vid) return;
    const onCanPlay = () => vid.play().catch(() => {});
    vid.addEventListener("canplay", onCanPlay, { once: true });
    return () => vid.removeEventListener("canplay", onCanPlay);
  }, [isActive]);

  // Exit phase: freeze exactly when exit starts (prevents black flash)
  useEffect(() => {
    if (isPresent) return; // only run when exiting
    const vid = videoRef.current;
    const url = captureFrame();
    if (url) {
      setSnapUrl(url);
      // hide live video after snapshot is set (next paint is enough here)
      requestAnimationFrame(() => {
        if (vid) {
          vid.pause();
          vid.style.visibility = "hidden";
        }
      });
    }
    // let the slide-up run (0.8s), then unmount
    const EXIT_MS = 800;
    const t = window.setTimeout(() => {
      setSnapUrl(null);
      safeToRemove?.();
    }, EXIT_MS + 20);
    return () => clearTimeout(t);
  }, [isPresent, safeToRemove]);

  // Prefetch target as soon as we know it
  useEffect(() => {
    if (isActive && targetHref) router.prefetch?.(targetHref);
  }, [isActive, targetHref, router]);

  // Config: how long the overlay should remain *after* nav starts
  const HOLD_MS_AFTER_NAV = 2000;   // keep overlay for 2s after we push
  const NAV_BUFFER_MS = 100;        // tiny buffer after entrance completes

  // Reset guards when transition starts/ends
  useEffect(() => {
    if (isActive) {
      navigatedRef.current = false;
    } else {
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = undefined;
    }
  }, [isActive]);

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key="sharedVideo"
          // initial: desktop faded/inset; mobile slides from bottom
          initial={
            isMobile
              ? { top: 0, left: 0, width: "100vw", height: "100vh", y: "100vh", borderRadius: 0 }
              : { top: "1vh", left: "1vw", width: "98vw", height: "98vh", y: 0, borderRadius: "1.5rem", opacity: 0 }
          }
          // animate: desktop fade; mobile settle to full-screen
          animate={
            isMobile
              ? {
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  y: 0,
                  borderRadius: 0,
                  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                }
              : {
                  opacity: 1,
                  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                }
          }
          // exit: your original slide-up
          exit={{ y: "-100vh", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
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
          // 🔑 Navigate only AFTER the entrance animation has completed
          onAnimationComplete={() => {
            if (!isActive || !targetHref || navigatedRef.current) return;
            navigatedRef.current = true;

            // push after a tiny buffer so we’re definitely fully in view
            window.setTimeout(() => {
              router.push(targetHref);

              // keep overlay on top for a fixed "hold" duration, then start exit
              holdTimerRef.current = window.setTimeout(() => {
                clearTransition(); // triggers AnimatePresence exit (snapshot handled above)
              }, HOLD_MS_AFTER_NAV);
            }, NAV_BUFFER_MS);
          }}
        >
          {/* Snapshot shown only during exit */}
          {snapUrl && (
            <img
              src={snapUrl}
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          )}

          <video
            key={videoKey}
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            loop
            // MP4 first for robust decode during motion; WebM fallback
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              visibility: snapUrl ? "hidden" : "visible",
              zIndex: 1,
            }}
          >
            {sources && (
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