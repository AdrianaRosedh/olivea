"use client";

import { useState, useEffect, useCallback, useRef, CSSProperties } from "react";
import type { ComponentType, SVGProps } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import type { VideoKey } from "@/contexts/SharedTransitionContext";
import throttle from "lodash.throttle";

export interface InlineEntranceCardProps {
  title: string;
  href: string;
  videoKey: VideoKey;
  description?: string;
  videoSrc?: string; // (kept for API compatibility; not used with slugbed videos)
  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  onActivate?: () => void;
}

export default function InlineEntranceCard({
  title,
  href,
  videoKey,
  description = "Ut lorem purus nam feugiat malesuada quis libero cursus.",
  Logo,
  className = "",
  onActivate = () => {},
}: InlineEntranceCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startTransition } = useSharedTransition();

  // i18n CTA
  const isES = href.startsWith("/es");
  const ctaText = isES ? "Haz Click" : "Click Me";

  // slug and responsive format selection
  const slug = href.split("/").pop() || "";

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // browser format support (client-only)
  const [preferWebm, setPreferWebm] = useState(false);
  useEffect(() => {
    const v = document.createElement("video");
    setPreferWebm(!!v.canPlayType?.('video/webm; codecs="vp9,vorbis"'));
  }, []);

  // build chosen urls from new naming scheme: slug-<mobile|HD>.(webm|mp4)
  const variantBase = slug ? `${slug}-${isMobile ? "mobile" : "HD"}` : "";
  const webmUrl = variantBase ? `/videos/${variantBase}.webm` : "";
  const mp4Url = variantBase ? `/videos/${variantBase}.mp4` : "";
  const primaryUrl = preferWebm ? webmUrl : mp4Url;
  const fallbackUrl = preferWebm ? mp4Url : webmUrl;

  // warmup only chosen format+variant
  const warmUpVideo = useCallback(() => {
    if (!variantBase || !primaryUrl) return;
    const mark = `iec-preload-${variantBase}-${preferWebm ? "webm" : "mp4"}`;
    if (document.head.querySelector(`link[data-preload="${mark}"]`)) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = primaryUrl;
    link.type = primaryUrl.endsWith(".webm") ? "video/webm" : "video/mp4";
    link.setAttribute("data-preload", mark);
    document.head.appendChild(link);
  }, [variantBase, primaryUrl, preferWebm]);

  // state
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});
  const [isInView, setIsInView] = useState(false);

  // look-ahead IO to mark in-view (and allow early warmup)
  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "200px 0px 200px 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // hover playback (desktop only)
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isInView || isMobile) return;
    if (isHovered) vid.play().catch(() => {});
    else vid.pause();
  }, [isHovered, isMobile, isInView]);

  // tilt throttling + cleanup
  const throttledMouseMove = useRef(
    throttle((rect: DOMRect | null, clientX: number, clientY: number, isMobileFlag: boolean) => {
      if (isMobileFlag || !rect) return;
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      setTiltStyle({
        transform: `perspective(1000px) translateY(-8px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`,
        boxShadow: `${(-x * 20).toFixed(2)}px ${(y * 20).toFixed(2)}px 30px rgba(0,0,0,0.15)`,
        transition: "transform 0.1s ease-out, boxShadow 0.2s ease-out",
      });
    }, 20)
  );
  useEffect(() => {
    const throttled = throttledMouseMove.current;
    return () => throttled?.cancel?.();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget?.getBoundingClientRect();
      if (rect) throttledMouseMove.current(rect, e.clientX, e.clientY, isMobile);
    },
    [isMobile]
  );

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (videoRef.current && isInView && videoRef.current.readyState === 0) {
      videoRef.current.load();
    }
    warmUpVideo();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setTiltStyle({
      transform: "perspective(1000px) translateY(0) rotateX(0) rotateY(0)",
      boxShadow: "none",
      transition: "transform 0.5s ease, boxShadow 0.3s ease",
    });
    setIsHovered(false);
  };

  const handleActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    warmUpVideo();
    onActivate?.();
    startTransition(videoKey, href);
  };

  // ——— Dimensions ———
  const DESKTOP_SCALE = 1.3;
  const scale = isMobile ? 1 : DESKTOP_SCALE;
  const CARD_WIDTH = 256 * scale;
  const CARD_HEIGHT = 210 * scale;
  const TOP_DESKTOP = 128 * scale;
  const MOBILE_COLLAPSED = 96;
  const BOTTOM_DEFAULT = CARD_HEIGHT - TOP_DESKTOP;
  const CIRCLE_SIZE = 80 * scale;
  const UNDERLAY_HEIGHT = 25 * scale;

  const containerHeight = isMobile ? MOBILE_COLLAPSED : CARD_HEIGHT;
  const topHeight = isMobile ? 0 : TOP_DESKTOP;
  const bottomHeight = isMobile ? MOBILE_COLLAPSED : BOTTOM_DEFAULT;

  return (
    <Tilt
      className={className}
      style={{ width: isMobile ? "100%" : CARD_WIDTH }}
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      glareEnable={false}
      onEnter={handleMouseEnter}
      onLeave={handleMouseLeave}
    >
      <a
        href={href}
        role="link"
        tabIndex={0}
        aria-label={`Ir a ${title}`}
        aria-describedby={slug ? `${slug}-desc` : undefined}
        onClick={handleActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleActivate(e);
        }}
        className="block relative cursor-pointer"
      >
        <motion.div
          whileTap={{ scale: 0.97 }}
          className={`relative overflow-visible cursor-pointer ${isMobile ? "drop-shadow-lg" : ""}`}
        >
          <div onMouseMove={handleMouseMove} style={{ width: "100%", height: containerHeight, cursor: "pointer", ...tiltStyle }}>
            <div style={{ border: "4px solid #e8e4d5", borderRadius: 24, overflow: "hidden", height: "100%" }}>
              {/* Top Video */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 2000,
                  height: isHovered ? topHeight * 0.7 : topHeight,
                  transition: "height 0.4s ease",
                }}
              >
                <video
                  ref={videoRef}
                  muted
                  loop
                  playsInline
                  preload="none"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: !isMobile && isHovered ? 1 : 0,
                    display: isMobile ? "none" : "block",
                    zIndex: 2001,
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Prefer supported format first */}
                  {primaryUrl && (
                    <source
                      src={primaryUrl}
                      type={primaryUrl.endsWith(".webm") ? "video/webm" : "video/mp4"}
                    />
                  )}
                  {fallbackUrl && (
                    <source
                      src={fallbackUrl}
                      type={fallbackUrl.endsWith(".webm") ? "video/webm" : "video/mp4"}
                    />
                  )}
                </video>
              </div>

              {/* Bottom Text */}
              <motion.div
                initial={{ height: bottomHeight }}
                animate={{ height: isHovered ? bottomHeight + UNDERLAY_HEIGHT + 15 : bottomHeight }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  background: "#e8e4d5",
                  padding: "10px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  overflow: "hidden",
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                }}
              >
                <h3
                  style={{
                    margin: 1,
                    zIndex: 2,
                    fontFamily: "var(--font-serif)",
                    fontSize: isMobile ? 28 : 24,
                    fontWeight: isMobile ? 600 : 300,
                    marginTop: isHovered ? 25 : 33,
                    transition: "margin-top 0.4s ease",
                  }}
                  className="not-italic"
                >
                  {title}
                </h3>

                {!isMobile && isHovered && (
                  <p
                    id={`${slug}-desc`}
                    style={{
                      marginTop: 6,
                      textAlign: "center",
                      fontSize: 16,
                      maxWidth: 224,
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    {description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Underlay */}
          {!isMobile && (
            <motion.div
              initial={{ y: 0 }}
              animate={isHovered ? { y: UNDERLAY_HEIGHT } : { y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-full h-16 bg-white/30 backdrop-blur-md flex items-center justify-center pt-7 pointer-events-none"
              style={{
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                zIndex: -1,
              }}
            >
              <span style={{ fontFamily: "var(--font-serif)" }} className="font-semibold text-[var(--olivea-ink)]">
                {ctaText}
              </span>
            </motion.div>
          )}

          {/* Logo */}
          {Logo && (
            <div
              style={{
                position: "absolute",
                zIndex: 1,
                left: "50%",
                width: isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE,
                height: isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE,
                borderRadius: "50%",
                border: "4px solid #e8e4d5",
                background: "#e8e4d5",
                overflow: "hidden",
                top: isHovered ? topHeight * 0.6 : topHeight,
                transform: "translate(-50%, -50%)",
                transition: "top 0.4s ease, width 0.4s ease, height 0.4s ease",
              }}
            >
              <Logo width="100%" height="100%" />
            </div>
          )}
        </motion.div>
      </a>
    </Tilt>
  );
}
