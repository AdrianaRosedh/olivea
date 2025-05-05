// components/ui/InlineEntranceCard.tsx
"use client";

import type { SVGProps, ComponentType, MouseEvent, CSSProperties } from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, MoreHorizontal } from "lucide-react";

export interface InlineEntranceCardProps {
  title: string;
  href: string;
  description?: string;
  videoSrc?: string;
  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  index?: number;
  isActive?: boolean;
  onActivate?: () => void;
  gradient?: string;
}

export function InlineEntranceCard({
  title,
  href,
  description = "Ut lorem purus nam feugiat malesuada quis libero cursus.",
  videoSrc = "/videos/homepage-temp.mp4",
  Logo,
  className = "",
  index = 0,
  isActive = false,
  onActivate = () => {},
  gradient = "var(--olivea-mist)",
}: InlineEntranceCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // play/pause video
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if ((isHovered && !isMobile) || (isOpened && isMobile)) vid.play().catch(() => {});
    else vid.pause();
  }, [isHovered, isOpened, isMobile]);

  // mobile auto‐navigate
  useEffect(() => {
    if (isMobile && isOpened) {
      const t = setTimeout(() => router.push(href), 5000);
      return () => clearTimeout(t);
    }
  }, [isOpened, isMobile, href, router]);

  // 3D tilt
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${y * 10}deg) rotateY(${-x * 10}deg)`,
      transition: "transform 0.1s ease-out",
    });
  };
  const onMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0) rotateY(0)",
      transition: "transform 0.5s ease-out",
    });
  };

  const onClick = (e: MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      setIsOpened(true);
      onActivate();
    } else {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        position: "relative",
        width: 256,
        height: 256,
        borderRadius: 24,
        overflow: "hidden",
        cursor: "pointer",
        perspective: 1000,
        transformStyle: "preserve-3d",
        ...(isHovered && !isMobile ? tiltStyle : {}),
        ...(isMobile && !isActive && !isOpened
          ? { transform: `translateY(${index * 40}px) scale(${1 - index * 0.05})` }
          : {}),
      }}
    >
      {/* Top half */}
      <div
        style={{
          position: "relative",
          height: isMobile && !isOpened ? 0 : isOpened && isMobile ? "60vh" : 128,
          transition: "height 0.5s",
          background: gradient,
          border: "4px solid white",
          borderBottom: "none",
        }}
      >
        {/* Video overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: (!isMobile && isHovered) || (isMobile && isOpened) ? 1 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        {/* Icons */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 1rem",
            opacity: (!isMobile && isHovered) || (isMobile && isOpened) ? 1 : 0,
            transition: "opacity 0.3s",
            color: "white",
          }}
        >
          <MessageCircle size={24} />
          <MoreHorizontal size={24} />
        </div>
      </div>

      {/* Bottom half */}
      <div
        style={{
          position: "relative",
          height: isMobile && !isOpened ? 128 : isOpened && isMobile ? "30vh" : 128,
          transition: "height 0.3s",
          background: "white",
          border: "4px solid white",
          borderTop: "none",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isOpened ? "flex-start" : "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
        <p
          style={{
            marginTop: 8,
            maxHeight: ((!isMobile && isHovered) || (isMobile && isOpened)) ? 100 : 0,
            opacity: ((!isMobile && isHovered) || (isMobile && isOpened)) ? 1 : 0,
            overflow: "hidden",
            transition: "all 0.3s",
            textAlign: "center",
          }}
        >
          {description}
        </p>

        {/* Progress bar */}
        {isMobile && isOpened && (
          <div
            style={{
              marginTop: 12,
              width: "100%",
              height: 4,
              background: "#eee",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#b8a6ff",
                transition: "width 5s linear",
              }}
            />
          </div>
        )}
      </div>

      {/* Floating logo */}
      {Logo && (
        <div
          style={{
            position: "absolute",
            top: 128,
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "4px solid white",
            overflow: "hidden",
            background: "white",
            transition: "top 0.5s",
            ...(isMobile && isOpened ? { top: "60vh" } : {}),
          }}
        >
          <Logo width="100%" height="100%" />
        </div>
      )}
    </div>
  );
}