"use client";

// app/[lang]/(home)/HeroMedia.tsx
// ─────────────────────────────────────────────────────────────────────
// The hero: the garden photo, with the garden video over it once the video is
// actually playing.
//
// ★ NO BLACK FRAME. The phone version used to unmount the photo and mount the
//   video in its place; until the video decoded a frame the hero was black.
//   Now the photo always stays underneath and the video fades in once its first
//   frame is actually on screen (requestVideoFrameCallback; `playing` fires a
//   moment before the picture exists, which showed as two black frames). If it
//   never plays (data saver, low-power mode, a codec problem) the guest simply
//   keeps the photo.
// ★ The photo is the LCP element. On a phone the video is mounted only after
//   the photo has decoded (plus a short pause), so it never competes with it.
// ─────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { useEffect, useState, type RefObject } from "react";

export type VideoConfig = {
  version: string;
  mobile: { webm: string; mp4: string; poster: string };
  desktop: { webm: string; mp4: string; poster: string };
};

const DEFAULT_VIDEO_VERSION = "2026-10-13-v3";
const MOBILE_VIDEO_DELAY_MS = 600;

/** Calls `show` once the video has presented a frame (two paints later where
 *  requestVideoFrameCallback is missing). */
function revealOnFirstFrame(video: HTMLVideoElement, show: () => void) {
  if (typeof video.requestVideoFrameCallback === "function") {
    video.requestVideoFrameCallback(() => show());
  } else {
    requestAnimationFrame(() => requestAnimationFrame(show));
  }
}

export default function HeroMedia({
  isMobile,
  alt,
  videoConfig,
  videoRef,
}: {
  isMobile: boolean;
  alt: string;
  videoConfig?: VideoConfig;
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const version = videoConfig?.version ?? DEFAULT_VIDEO_VERSION;
  const [photoReady, setPhotoReady] = useState(false);
  const [mountVideo, setMountVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Desktop: the video right away. Phone: after the photo, so LCP stays the photo.
  useEffect(() => {
    if (!isMobile) {
      setMountVideo(true);
      return;
    }
    if (!photoReady) return;
    const t = setTimeout(() => setMountVideo(true), MOBILE_VIDEO_DELAY_MS);
    return () => clearTimeout(t);
  }, [isMobile, photoReady]);

  const sources = isMobile
    ? videoConfig?.mobile ?? {
        webm: "/videos/homepage-mobile.webm",
        mp4: "/videos/homepage-mobile.mp4",
      }
    : videoConfig?.desktop ?? {
        webm: "/videos/homepage-HD.webm",
        mp4: "/videos/homepage-HD.mp4",
      };

  return (
    <>
      <Image
        src="/images/hero.avif"
        alt={alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={isMobile ? 60 : 70}
        className="object-cover"
        onLoad={() => {
          setPhotoReady(true);
          document.body.classList.add("lcp-demote");
        }}
      />
      {mountVideo && (
        <video
          // A different source set per layout: remount rather than swap sources.
          key={isMobile ? "mobile" : "desktop"}
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.96] pointer-events-none transition-opacity duration-700 ease-out motion-reduce:transition-none"
          style={{ opacity: playing ? 1 : 0 }}
          muted
          playsInline
          loop
          autoPlay
          // The whole clip (under 1 MB): with only metadata buffered, every loop
          // back to the start dropped to readyState 1 and showed a black frame.
          preload="auto"
          aria-hidden
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={(e) => revealOnFirstFrame(e.currentTarget, () => setPlaying(true))}
          onLoadedData={(e) => void e.currentTarget.play().catch(() => {})}
        >
          <source src={`${sources.webm}?v=${version}`} type="video/webm" />
          <source src={`${sources.mp4}?v=${version}`} type="video/mp4" />
        </video>
      )}
    </>
  );
}
