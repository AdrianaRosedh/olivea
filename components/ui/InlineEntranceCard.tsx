"use client";

import { useState, useEffect, useRef, MouseEvent, CSSProperties } from "react";
import type { ComponentType, SVGProps } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";

export interface InlineEntranceCardProps {
  title: string;
  href: string;
  description?: string;
  videoSrc?: string;
  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  onActivate?: () => void;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startTransition } = useSharedTransition();

  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});

  // Dimensions
  // 1) Define desktop scale inside the component
  const DESKTOP_SCALE = 1.3;
  // 2) Pick scale = 1 on mobile, DESKTOP_SCALE on desktop
  const scale = isMobile ? 1 : DESKTOP_SCALE;

  // 3) Apply to all your dims
  const CARD_WIDTH       = 256 * scale;
  const CARD_HEIGHT      = 210 * scale;
  const TOP_DESKTOP      = 128 * scale;
  const TOP_COLLAPSED    = 96  * scale;
  const MOBILE_COLLAPSED = 96;  // mobile stays 96 because scale=1 there
  const BOTTOM_DEFAULT   = CARD_HEIGHT - TOP_DESKTOP;
  const CIRCLE_SIZE      = 80  * scale;
  const UNDERLAY_HEIGHT  = 25  * scale;


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

  // Circle positioning style
  const circleStyle: CSSProperties = isMobile
    ? { top: 0, transform: "translate(-50%, -50%)" }
    : { top: topHeight, transform: "translate(-50%, -50%)" };

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
    if (shouldPlay) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isHovered, isOpened, isMobile]);

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  
    const playbackTime = videoRef.current?.currentTime || 0;
    const bounds = videoRef.current?.getBoundingClientRect();
  
    if (!bounds) return; // safety check
  
    onActivate?.();
    const slug = href.split("/").pop() || "";                          
    const targetVideo = slug ? `/videos/${slug}.mp4` : videoSrc;       
    sessionStorage.setItem("fromHomePage", "true");
    sessionStorage.setItem("fromHomePageTime", String(playbackTime));
    sessionStorage.setItem("targetVideo", targetVideo);   
  
    if (isMobile) {
      await new Promise((res) => setTimeout(res, 800)); 
      setIsOpened(true);
    } else {
      startTransition(videoSrc, playbackTime, href, bounds, targetVideo); 
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltStyle({
      transform: `perspective(1000px) translateY(-8px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`,
      boxShadow: `${(-x * 20).toFixed(2)}px ${(y * 20).toFixed(2)}px 30px rgba(0,0,0,0.15)`,
      transition: "transform 0.1s ease-out, box-shadow 0.2s ease-out",
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setTiltStyle({
      transform: "perspective(1000px) translateY(0) rotateX(0) rotateY(0)",
      boxShadow: "none",
      transition: "transform 0.5s ease, box-shadow 0.3s ease",
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
      onLeave={handleMouseLeave}
      
    >
      {/* Wrapper for unified drop-shadow */}
      <div
        className="relative overflow-visible cursor-pointer"
        style={{ filter: isMobile ? "drop-shadow(0 8px 12px rgba(0,0,0,0.15))" : undefined }}
        onClick={handleClick}
        onPointerDown={handleClick}
      >
        <motion.div
        // start at the collapsed height on mobile, or full card on desktop
          initial={{ height: isMobile ? MOBILE_COLLAPSED : CARD_HEIGHT }}
          animate={{ height: containerHeight }}
          transition={{ duration: 0.3 }}
          // when that expand finishes on mobile, trigger the shared-element
          onAnimationComplete={() => {
            if (isMobile && isOpened) {
              setTimeout(() => {
                const playbackTime = videoRef.current?.currentTime || 0;
                const bounds = videoRef.current?.getBoundingClientRect();
                if (!bounds) return;
                const slug = href.split("/").pop() || "";                
                const targetVideo = slug ? `/videos/${slug}.mp4` : videoSrc; 
                startTransition(videoSrc, playbackTime, href, bounds, targetVideo);
                setIsOpened(false);
              }, 200); // ✅ wait extra 0.2s for smoother transition
            }
          }}          
          onMouseMove={handleMouseMove}
          style={{ width: "100%", height: containerHeight, cursor: "pointer", ...tiltStyle }}
        >
          {/* Card frame */}
          <div style={{ border: "4px solid #e8e4d5", borderRadius: 24, overflow: "hidden", height: "100%" }}>
            {/* Top section (video) */}
            <motion.div
              initial={{ height: TOP_DESKTOP }}
              animate={{ height: topHeight }}
              transition={{ duration: 0.5 }}
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
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "opacity 0.5s",
                  opacity: (!isMobile && isHovered) || (isMobile && isOpened) ? 1 : 0,
                }}
              />
            </motion.div>

            {/* Bottom section (title) */}
            <motion.div
              initial={{ height: BOTTOM_DEFAULT }}
              animate={{ height: bottomHeight }}
              transition={{ duration: 0.3 }}
              style={{
                background: "#e8e4d5",
                paddingTop: isMobile && !isOpened ? 8 : 10,
                paddingBottom: isMobile ? 22 : 10,
                paddingLeft: 16,
                paddingRight: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: isMobile ? "flex-end" : isHovered ? "flex-start" : "center",
              }}
            >
              <h3
                style={{
                  margin: 1,
                  zIndex: 2,
                  fontFamily: "var(--font-serif)",
                  fontSize: isMobile ? 28 : 24,
                  fontWeight: isMobile ? 600 : 300,
                  marginTop: !isMobile && isHovered ? 40 : 5,
                  transition: "margin-top 0.5s ease",
                  fontStyle: "normal"  
                }}
                className="not-italic"
              >
                {title}
              </h3>
              {!isMobile && isHovered ? (
                <p style={{ marginTop: 10, textAlign: "center", fontSize: 16, maxWidth: 224 }}>
                  {description}
                </p>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
        
        {!isMobile && (
          <motion.div
            // start fully BELOW the card:
            initial={{ y: 0 }}
            // on hover, Framer Motion will animate to y: 0
            animate={ isHovered ? { y: UNDERLAY_HEIGHT } : { y: 0 } }
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="absolute bottom-0 left-0 w-full h-16
                       bg-white/30 backdrop-blur-md
                       flex items-center justify-center pt-7 pointer-events-none"
            style={{
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              zIndex: -1,
            }}
          >
            <span style={{ fontFamily: "var(--font-serif)" }} className="font-semibold text-[var(--olivea-ink)] ">
              Click Me
            </span>
          </motion.div>
        )}

          {/* Floating logo circle */}
          {Logo && (
          <div 
          style={{
            position:      "absolute",
            zIndex: 1,
            left:          "50%",
            width:         CIRCLE_SIZE,
            height:        CIRCLE_SIZE,
            borderRadius:  CIRCLE_SIZE / 2,
            border:        "4px solid #e8e4d5",
            background:    "#e8e4d5",
            overflow:      "hidden",
            ...circleStyle,
            transition:    "top 0.5s",
          }}
          >
            <Logo width="100%" height="100%" />
          </div>
        )}
        </div>
    </Tilt>
  );
}