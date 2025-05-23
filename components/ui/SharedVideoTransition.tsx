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
      // 3️⃣ Seek to the correct frame
      video.currentTime = videoPlaybackTime;

      // 4️⃣ Start playback immediately (unmuted is not needed)
      const playPromise = video.play().catch(() => {});

      // 5️⃣ Wait until we have enough buffer to play through, or timeout after 200ms
      await Promise.race([
        new Promise<void>((res) => {
          if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
            return res();
          }
          video.addEventListener("canplaythrough", () => res(), { once: true });
        }),
        new Promise<void>((res) => setTimeout(res, 200)),
      ]);

      // Ensure the play promise resolves before continuing
      await playPromise;

      // 6️⃣ Immediately position the overlay over the source card
      controls.set({
        top: initialBounds.top,
        left: initialBounds.left,
        width: initialBounds.width,
        height: initialBounds.height,
        borderRadius: "1.5rem",
        // keep it visible until we animate out
        opacity: 1,
      });

      // 7️⃣ Allow one frame for the styles to apply
      await new Promise(requestAnimationFrame);

      // 8️⃣ Animate overlay + video mask to full-screen in parallel
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

      // 9️⃣ Pause briefly so the user sees the full-screen frame
      await new Promise((res) => setTimeout(res, 300));

      //  🔟 Navigate
      await router.prefetch(targetHref);
      await router.push(targetHref);
      // clearTransition happens in the next useEffect
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

  if (!active || !initialBounds) return null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="sharedTransition"
        initial={false}
        animate={controls}
        exit={{ opacity: 1 }}
        style={{
          position: "fixed",
          overflow: "hidden",
          zIndex: 9999,
          background: "var(--olivea-olive)",
          willChange: "transform, opacity",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source data-type="webm" />
          <source data-type="mp4" />
          Your browser doesn’t support this video.
        </video>
      </motion.div>
    </AnimatePresence>
  );
}