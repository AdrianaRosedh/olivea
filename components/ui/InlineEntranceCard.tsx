"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import type { ComponentType, SVGProps } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import type { VideoKey } from "@/contexts/SharedTransitionContext";
import { usePathname, useRouter } from "next/navigation";

export interface InlineEntranceCardProps {
  title: string;
  href: string;
  videoKey: VideoKey;
  description?: string;
  videoSrc?: string;
  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  onActivate?: () => void;
}

export default function InlineEntranceCard({
  title,
  href,
  videoKey,
  description = "Ut lorem purus nam feugiat malesuada quis libero cursus.",
  videoSrc,
  Logo,
  className = "",
  onActivate = () => {},
}: InlineEntranceCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startTransition } = useSharedTransition();
  const router = useRouter();  
  const pathname = usePathname();

  const slug   = href.split("/").pop() || "";
  const mp4Url = slug ? `/videos/${slug}.mp4` : videoSrc || "";
  const webmUrl = mp4Url.replace(/\.mp4$/, ".webm");
  // ───── warmUpVideo: injects <link rel="preload"> once per slug ─────
  const warmUpVideo = () => {
    if (document.head.querySelector(`link[data-preload="${slug}"]`)) return;
    [webmUrl, mp4Url].forEach((url) => {
      const link = document.createElement("link");
      link.rel  = "preload";
      link.as   = "video";
      link.href = url;
      link.type = url.endsWith(".webm") ? "video/webm" : "video/mp4";
      link.setAttribute("data-preload", slug);
      document.head.appendChild(link);
    });
  };

  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});
  const [isInView, setIsInView] = useState(false);

  // Dimension constants
  const DESKTOP_SCALE = 1.3;
  const scale = isMobile ? 1 : DESKTOP_SCALE;
  const CARD_WIDTH = 256 * scale;
  const CARD_HEIGHT = 210 * scale;
  const TOP_DESKTOP = 128 * scale;
  const MOBILE_COLLAPSED = 96;
  const BOTTOM_DEFAULT = CARD_HEIGHT - TOP_DESKTOP;
  const CIRCLE_SIZE = 80 * scale;
  const UNDERLAY_HEIGHT = 25 * scale;

  // Compute heights
  const containerHeight = isMobile ? MOBILE_COLLAPSED : CARD_HEIGHT;
  const topHeight = isMobile ? 0 : TOP_DESKTOP;
  const bottomHeight = isMobile ? MOBILE_COLLAPSED : BOTTOM_DEFAULT;

  // Detect mobile
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // IntersectionObserver to check when the video enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true); // Set to true when the video enters the viewport
        }
      },
      { threshold: 0.1 } // Load video when 10% of it is visible
    );
  
    const videoElement = videoRef.current; // Store the ref in a variable
  
    if (videoElement) {
      observer.observe(videoElement); // Observe the video
    }
  
    return () => {
      if (videoElement) {
        observer.unobserve(videoElement); // Unobserve the video when component is unmounted
      }
    };
  }, []);
  

  // Video playback on hover/open
  useEffect(() => {
  const vid = videoRef.current;
  if (!vid || !isInView || isMobile) return; // Never play inline videos on mobile
  if (isHovered) {
    vid.play().catch(() => {});
  } else {
    vid.pause();
  }
}, [isHovered, isMobile, isInView]);



  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltStyle({
      transform: `perspective(1000px) translateY(-8px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`,
      boxShadow: `${(-x * 20).toFixed(2)}px ${(y * 20).toFixed(2)}px 30px rgba(0,0,0,0.15)`,
      transition: "transform 0.1s ease-out, boxShadow 0.2s ease-out",
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setTiltStyle({ transform: "perspective(1000px) translateY(0) rotateX(0) rotateY(0)", boxShadow: "none", transition: "transform 0.5s ease, boxShadow 0.3s ease" });
    setIsHovered(false);
  };

  const handleActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // are we on the home page?
    const isHome = pathname === "/" || /^\/(en|es)$/.test(pathname)
    
    if (isHome) {
      warmUpVideo()
      onActivate?.()
      startTransition(videoKey, href)
    } else {
      router.push(href)
    }
  }

  return (
  <Tilt
    className={className}
    style={{ width: isMobile ? "100%" : CARD_WIDTH }}
    tiltMaxAngleX={10}
    tiltMaxAngleY={10}
    glareEnable={false}
    onEnter={() => {
      warmUpVideo();
      setIsHovered(true);
    }}
    onLeave={handleMouseLeave}
  >
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={`Go to ${title}`}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleActivate(e);
        }
      }}
      whileTap={{ scale: 0.97 }}
      style={{ filter: isMobile ? "drop-shadow(0 8px 12px rgba(0,0,0,0.15))" : undefined }}
      className="relative overflow-visible cursor-pointer"
    >
      <div
        onMouseMove={handleMouseMove}
        style={{ width: "100%", height: containerHeight, cursor: "pointer", ...tiltStyle }}
      >
        <div style={{ border: "4px solid #e8e4d5", borderRadius: 24, overflow: "hidden", height: "100%" }}>
          
          {/* Top Video container (NO ANIMATION) */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              zIndex: 2000,
              height: isHovered ? topHeight * 0.7 : topHeight, // animate height change
              transition: "height 0.4s ease",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
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
              }}
            >
              <source src={webmUrl} type="video/webm" />
              <source src={mp4Url} type="video/mp4" />
            </video>
          </div>

          {/* Bottom Text Container (WITH subtle ANIMATION) */}
          {/* Bottom Text Container (Final Corrected Version) */}
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
    borderBottomLeftRadius: 24,  // <-- explicitly added radius
    borderBottomRightRadius: 24, // <-- explicitly added radius
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

      {/* Click Me Overlay */}
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
          <span
            style={{ fontFamily: "var(--font-serif)" }}
            className="font-semibold text-[var(--olivea-ink)]"
          >
            Click Me
          </span>
        </motion.div>
      )}

      {/* Logo Icon */}
      {Logo && (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            left: "50%",
            width: isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE, // shrink size on hover
            height: isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE,
            borderRadius: "50%",
            border: "4px solid #e8e4d5",
            background: "#e8e4d5",
            overflow: "hidden",
            top: isHovered ? topHeight * 0.6 : topHeight, // move up on hover
            transform: "translate(-50%, -50%)",
            transition: "top 0.4s ease, width 0.4s ease, height 0.4s ease",
          }}
        >
          <Logo width="100%" height="100%" />
        </div>
      )}

    </motion.div>
  </Tilt>
);

}