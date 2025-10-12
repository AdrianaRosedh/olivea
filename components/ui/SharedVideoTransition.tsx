// components/ui/SharedVideoTransition.tsx
"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion, usePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import type { VideoKey } from "@/contexts/SharedTransitionContext";

type Pair = [string, string]; // [webm, mp4]
type Variant = { mobile: Pair; hd: Pair };

const VIDEO_MAP: Record<VideoKey, Variant> = {
  casa: {
    mobile: ["/videos/casa-mobile.webm", "/videos/casa-mobile.mp4"],
    hd:     ["/videos/casa-HD.webm",     "/videos/casa-HD.mp4"],
  },
  cafe: {
    mobile: ["/videos/cafe-mobile.webm", "/videos/cafe-mobile.mp4"],
    hd:     ["/videos/cafe-HD.webm",     "/videos/cafe-HD.mp4"],
  },
  farmtotable: {
    mobile: ["/videos/farmtotable-mobile.webm", "/videos/farmtotable-mobile.mp4"],
    hd:     ["/videos/farmtotable-HD.webm",     "/videos/farmtotable-HD.mp4"],
  },
};

// posters paired by key/variant (static LCP-friendly frames)
const POSTER_MAP: Record<VideoKey, { mobile: string; hd: string }> = {
  casa: { mobile: "/images/posters/casa-mobile.webp", hd: "/images/posters/casa-hd.webp" },
  cafe: { mobile: "/images/posters/cafe-mobile.webp", hd: "/images/posters/cafe-hd.webp" },
  farmtotable: {
    mobile: "/images/posters/farmtotable-mobile.webp",
    hd: "/images/posters/farmtotable-hd.webp",
  },
};

export default function SharedVideoTransition() {
  const { isActive, videoKey, targetHref, clearTransition } = useSharedTransition();
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const navigatedRef = useRef(false);
  const holdTimerRef = useRef<number | undefined>(undefined);

  const [isMobile, setIsMobile] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [snapUrl, setSnapUrl] = useState<string | null>(null);
  const [isPresent, safeToRemove] = usePresence();

  // track viewport size
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // format support (client only)
  const [preferWebm, setPreferWebm] = useState(false);
  useEffect(() => {
    const v = document.createElement("video");
    setPreferWebm(!!v.canPlayType?.('video/webm; codecs="vp9,vorbis"'));
  }, []);

  // choose variant by viewport
  const chosenPair = useMemo<Pair | null>(() => {
    if (!videoKey) return null;
    const variant = isMobile ? VIDEO_MAP[videoKey].mobile : VIDEO_MAP[videoKey].hd;
    return variant;
  }, [videoKey, isMobile]);

  const posterSrc = useMemo<string | null>(() => {
    if (!videoKey) return null;
    return isMobile ? POSTER_MAP[videoKey].mobile : POSTER_MAP[videoKey].hd;
  }, [videoKey, isMobile]);

  // order sources so preferred format is first
  const orderedSources = useMemo<[string, string] | null>(() => {
    if (!chosenPair) return null;
    const [webm, mp4] = chosenPair;
    return preferWebm ? [webm, mp4] : [mp4, webm];
  }, [chosenPair, preferWebm]);

  // warm up ONLY when active and only current variant
  useEffect(() => {
    if (!isActive || !videoKey || !chosenPair) return;

    const [webm, mp4] = chosenPair;
    const url = preferWebm ? webm : mp4;
    const type = preferWebm ? "video/webm" : "video/mp4";
    const mark = `svt-preload-${videoKey}-${isMobile ? "mobile" : "hd"}-${preferWebm ? "webm" : "mp4"}`;

    if (!document.head.querySelector(`link[data-preload="${mark}"]`)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = url;
      link.type = type;
      link.setAttribute("data-preload", mark);
      document.head.appendChild(link);
    }
  }, [isActive, videoKey, chosenPair, isMobile, preferWebm]);

  // ready → canplaythrough ensures no stall; fade poster out
  useEffect(() => {
    if (!isActive) return;
    const vid = videoRef.current;
    if (!vid) return;

    const onCanPlayThrough = () => {
      setIsReadyToPlay(true);
      vid.play().catch(() => {});
      // defer poster removal a tick to avoid flash
      requestAnimationFrame(() => setShowPoster(false));
    };

    vid.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
    return () => vid.removeEventListener("canplaythrough", onCanPlayThrough);
  }, [isActive]);

  // snapshot on exit (keep until exit anim completes)
  const captureFrame = () => {
    const vid = videoRef.current;
    if (!vid || !vid.videoWidth || !vid.videoHeight) return null;
    const canvas = document.createElement("canvas");
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    try {
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/webp");
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (isPresent) return; // exiting
    const url = captureFrame();
    if (url) setSnapUrl(url);

    const EXIT_MS = 800;
    const t = window.setTimeout(() => {
      setSnapUrl(null);
      safeToRemove?.();
    }, EXIT_MS + 20);
    return () => window.clearTimeout(t);
  }, [isPresent, safeToRemove]);

  // ⚠️ reduce background traffic: skip router.prefetch here (audits count it as "unused JS")
  // If you still want it, prefetch only on fast networks or after idle:
  // useEffect(() => {
  //   if (isActive && targetHref && 'connection' in navigator && (navigator as any).connection?.effectiveType === '4g') {
  //     requestIdleCallback?.(() => router.prefetch?.(targetHref));
  //   }
  // }, [isActive, targetHref, router]);

  // keep overlay a bit after nav push
  const HOLD_MS_AFTER_NAV = 2000;
  const NAV_BUFFER_MS = 100;

  useEffect(() => {
    if (isActive) {
      navigatedRef.current = false;
      setShowPoster(true);
      setIsReadyToPlay(false);
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
          initial={
            isMobile
              ? { top: 0, left: 0, width: "100vw", height: "100vh", y: "100vh", borderRadius: 0 }
              : { top: "1vh", left: "1vw", width: "98vw", height: "98vh", y: 0, borderRadius: "1.5rem", opacity: 0 }
          }
          animate={
            isMobile
              ? {
                  top: 0, left: 0, width: "100vw", height: "100vh", y: 0, borderRadius: 0,
                  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                }
              : { opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
          }
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
          onAnimationComplete={() => {
            if (!isActive || !targetHref || navigatedRef.current) return;
            navigatedRef.current = true;
            window.setTimeout(() => {
              router.push(targetHref);
              holdTimerRef.current = window.setTimeout(() => {
                clearTransition();
              }, HOLD_MS_AFTER_NAV);
            }, NAV_BUFFER_MS);
          }}
        >
          {/* Poster stays until canplaythrough, then fades out */}
          {posterSrc && showPoster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterSrc}
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 2,
                opacity: 1,
                transition: "opacity 300ms ease",
              }}
            />
          )}

          {/* Snapshot (only during exit) */}
          {snapUrl && (
            // eslint-disable-next-line @next/next/no-img-element
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
                zIndex: 3,
              }}
            />
          )}

          <video
            key={`${videoKey}-${isMobile ? "mobile" : "hd"}`}
            ref={videoRef}
            muted
            playsInline
            loop
            preload="metadata"
            // keep hidden under poster until we can play without stall
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              visibility: isReadyToPlay ? "visible" : "hidden",
              zIndex: 1,
            }}
          >
            {orderedSources && (
              <>
                <source
                  src={orderedSources[0]}
                  type={orderedSources[0].endsWith(".webm") ? "video/webm" : "video/mp4"}
                />
                <source
                  src={orderedSources[1]}
                  type={orderedSources[1].endsWith(".webm") ? "video/webm" : "video/mp4"}
                />
              </>
            )}
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}