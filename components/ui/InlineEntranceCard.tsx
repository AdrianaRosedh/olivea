"use client";

import { useState, useEffect, useRef, MouseEvent, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

export interface InlineEntranceCardProps {
  title: string;
  href: string;
  description?: string;
  videoSrc?: string;
  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  onActivate?: () => void;
  /** position in mobile stack */
  index?: number;
}

export default function InlineEntranceCard({
  title,
  href,
  description = "Ut lorem purus nam feugiat malesuada quis libero cursus.",
  videoSrc = "/videos/homepage-temp.mp4",
  Logo,
  className = "",
  onActivate = () => {},
  index = 0,
}: InlineEntranceCardProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});

  // Dimensions
  const CARD_WIDTH = 256;
  const CARD_HEIGHT = 210;
  const TOP_DESKTOP = 128;
  const TOP_COLLAPSED = 96;
  const MOBILE_COLLAPSED = 96;
  const BOTTOM_DEFAULT = CARD_HEIGHT - TOP_DESKTOP;
  const CIRCLE_SIZE = 80;

  // Compute dynamic heights
  const topHeight = isMobile
    ? isOpened
      ? TOP_DESKTOP
      : 0
    : isHovered
    ? TOP_COLLAPSED
    : TOP_DESKTOP;

  const bottomHeight = isMobile
    ? isOpened
      ? CARD_HEIGHT - TOP_DESKTOP
      : MOBILE_COLLAPSED
    : isHovered
    ? CARD_HEIGHT - TOP_COLLAPSED
    : BOTTOM_DEFAULT;

  const containerHeight = isMobile
    ? isOpened
      ? CARD_HEIGHT
      : MOBILE_COLLAPSED
    : CARD_HEIGHT;

  // Mobile stacking
  const mobileStyle: CSSProperties = isMobile && !isOpened
    ? { transform: `translateY(${index * 40}px) scale(${1 - index * 0.05})`, transition: "transform 0.5s ease" }
    : {};

  // Detect mobile
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Video playback
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const shouldPlay = (!isMobile && isHovered) || (isMobile && isOpened);
    shouldPlay ? vid.play().catch(() => {}) : vid.pause();
  }, [isHovered, isOpened, isMobile]);

  // Mobile auto-navigate
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isMobile && isOpened) {
      onActivate();
      timer = setTimeout(() => router.push(href), 5000);
    }
    return () => clearTimeout(timer);
  }, [isMobile, isOpened, href, router, onActivate]);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    isMobile ? setIsOpened(true) : router.push(href);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltStyle({
      transform: `perspective(1000px) translateY(-8px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)` ,
      boxShadow: `${-x * 20}px ${y * 20}px 30px rgba(0,0,0,0.15)` ,
      transition: "transform 0.1s ease-out, box-shadow 0.2s ease-out",
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setTiltStyle({
      transform: "perspective(1000px) translateY(0) rotateX(0) rotateY(0)",
      boxShadow: "none",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    });
    setIsHovered(false);
  };

  return (
    <Tilt
      className={className}
      style={{ width: isMobile ? "100%" : CARD_WIDTH, ...mobileStyle }}
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      glareEnable={false}
      onEnter={() => setIsHovered(true)}
      onLeave={() => setIsHovered(false)}
    >
      {/* Wrapper for unified drop-shadow */}
      <div
        className="relative overflow-visible"
        style={{
          filter: isMobile ? "drop-shadow(0 8px 12px rgba(0,0,0,0.15))" : undefined,
        }}
      >
        <div
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: "100%", height: containerHeight, cursor: "pointer", ...tiltStyle }}
        >
          {/* Card frame */}
          <div style={{ border: "4px solid #e8e4d5", borderRadius: 24, overflow: "hidden", height: "100%" }}>
            {/* Top */}
            <motion.div
              initial={{ height: TOP_DESKTOP }}
              animate={{ height: topHeight }}
              transition={{ duration: 0.3 }}
              style={{ position: "relative", overflow: "hidden" }}
            >
              <video
                ref={videoRef}
                src={videoSrc}
                muted
                loop
                playsInline
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: ((!isMobile && isHovered) || (isMobile && isOpened)) ? 1 : 0,
                  transition: "opacity 0.5s",
                }}
              />
            </motion.div>
            {/* Bottom with title aligned lower on mobile */}
            <motion.div
              initial={{ height: BOTTOM_DEFAULT }}
              animate={{ height: bottomHeight }}
              transition={{ duration: 0.3 }}
              style={{
                background: "#e8e4d5",
                paddingTop: isMobile && !isOpened ? 8 : 10,
                paddingBottom: isMobile ? 16 : 8,
                paddingLeft: 16,
                paddingRight: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: isMobile
                  ? "flex-end"
                  : isHovered
                    ? "flex-start"
                    : "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-serif)",
                  fontSize: isMobile ? 28 : 24,
                  fontWeight: isMobile ? 600 : 300, 
                }}
              >
                {title}
              </h3>
              {!isMobile && isHovered && (
                <p style={{ marginTop: 8, textAlign: "center", fontSize: 16, maxWidth: 224 }}>
                  {description}
                </p>
              )}
            </motion.div>
          </div>

          {/* Floating logo circle positioned half out at top on mobile */}
          {Logo && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                border: "4px solid #e8e4d5",
                background: "#e8e4d5",
                overflow: "hidden",
                ...(isMobile
                  ? { top: 0, transform: "translate(-50%, -50%)" }
                  : { top: topHeight, transform: "translate(-50%, -50%)" }
                ),
                transition: "top 0.3s",
              }}
            >
              <Logo width="100%" height="100%" />
            </div>
          )}

          {/* Mobile auto-progress */}
          {isMobile && isOpened && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              style={{ position: "absolute", bottom: 0, left: 0, height: 4, background: "#b8a6ff" }}
            />
          )}
        </div>
      </div>
    </Tilt>
  );
}