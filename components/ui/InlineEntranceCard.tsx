"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,

  type ComponentType,
  type SVGProps,
} from "react";
import { motion } from "framer-motion";

import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import type { VideoKey } from "@/contexts/SharedTransitionContext";

export interface InlineEntranceCardProps {
  title: string;
  href: string;
  videoKey: VideoKey;
  description?: string;
  videoSrc?: string; // kept for API compatibility
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
  const { startTransition } = useSharedTransition();

  // i18n CTA
  const isES = href.startsWith("/es");
  const ctaText = isES ? "Haz Click" : "Click Me";

  // slug for aria
  const slug = href.split("/").pop() || "";

  // responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // browser codec support (ref so we don't re-render)
  const preferWebmRef = useRef(false);
  useEffect(() => {
    const v = document.createElement("video");
    preferWebmRef.current = !!v.canPlayType?.('video/webm; codecs="vp9,vorbis"');
  }, []);

  // build chosen urls from naming scheme: slug-<mobile|HD>.(webm|mp4)
  const variantBase = slug ? `${slug}-${isMobile ? "mobile" : "HD"}` : "";
  const webmUrl = variantBase ? `/videos/${variantBase}.webm` : "";
  const mp4Url  = variantBase ? `/videos/${variantBase}.mp4`  : "";
  const primaryUrl  = preferWebmRef.current ? webmUrl : mp4Url;
  const fallbackUrl = preferWebmRef.current ? mp4Url : webmUrl;

  // preload chosen format+variant (once)
  const warmUpDone = useRef(false);
  const warmUpVideo = useCallback(() => {
    if (!variantBase || !primaryUrl || warmUpDone.current) return;
    const mark = `iec-preload-${variantBase}-${preferWebmRef.current ? "webm" : "mp4"}`;
    if (document.head.querySelector(`link[data-preload="${mark}"]`)) {
      warmUpDone.current = true;
      return;
    }
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = primaryUrl;
    link.type = primaryUrl.endsWith(".webm") ? "video/webm" : "video/mp4";
    link.setAttribute("data-preload", mark);
    document.head.appendChild(link);
    warmUpDone.current = true;
  }, [variantBase, primaryUrl]);

  // state
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // refs for imperative perf path
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rectRef  = useRef<DOMRect | null>(null);
  const rafRef   = useRef<number | null>(null);

  // in-view detection → enable hover playback
  useEffect(() => {
    const node = cardRef.current;
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

  // ── Imperative tilt (no React state on move) ────────────────────────────────
  const applyTilt = (clientX: number, clientY: number) => {
    const node = cardRef.current;
    const rect = rectRef.current;
    if (!node || !rect) return;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;

    // transform + shadow (same look as before)
    node.style.transform =
      `perspective(1000px) translateY(-8px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
    node.style.boxShadow =
      `${(-x * 20).toFixed(2)}px ${(y * 20).toFixed(2)}px 30px rgba(0,0,0,0.15)`;
    // keep transition snappy but not jittery
    node.style.transition = "transform 0.1s ease-out, box-shadow 0.2s ease-out";
  };

  const scheduleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const { clientX, clientY, currentTarget } = e;
    if (!rectRef.current) {
      rectRef.current = currentTarget.getBoundingClientRect();
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyTilt(clientX, clientY));
  };

  const clearTilt = () => {
    const node = cardRef.current;
    rectRef.current = null;
    if (!node) return;
    node.style.transform = "perspective(1000px) translateY(0) rotateX(0) rotateY(0)";
    node.style.boxShadow = "none";
    node.style.transition = "transform 0.5s ease, box-shadow 0.3s ease";
  };

  // resize: invalidate cached rect
  useEffect(() => {
    const onResize = () => (rectRef.current = null);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return;
    // ensure codec picked & preload kicked
    warmUpVideo();
    // ensure <video> has sources wired
    const v = videoRef.current;
    if (v && isInView && v.readyState === 0) v.load();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    clearTilt();
    setIsHovered(false);
  };

  const handleActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    warmUpVideo();
    onActivate?.();
    startTransition(videoKey, href);
  };

  // ── Dimensions (unchanged visuals) ─────────────────────────────────────────
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

  // Build URLs once per render (cheap) — the browser will pick the first playable <source>
  const primarySrc = primaryUrl ? (
    <source src={primaryUrl} type={primaryUrl.endsWith(".webm") ? "video/webm" : "video/mp4"} />
  ) : null;
  const fallbackSrc = fallbackUrl ? (
    <source src={fallbackUrl} type={fallbackUrl.endsWith(".webm") ? "video/webm" : "video/mp4"} />
  ) : null;

  return (
    <div
      className={className}
      style={{ width: isMobile ? "100%" : CARD_WIDTH }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        <motion.div whileTap={{ scale: 0.97 }} className={`relative overflow-visible cursor-pointer ${isMobile ? "drop-shadow-lg" : ""}`}>
          <div
            ref={cardRef}
            onMouseMove={scheduleTilt}
            style={{ width: "100%", height: containerHeight, cursor: "pointer" }}
          >
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
                  {primarySrc}
                  {fallbackSrc}
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
    </div>
  );
}
