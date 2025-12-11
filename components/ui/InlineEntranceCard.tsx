// components/ui/InlineEntranceCard.tsx
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
import { useSharedTransition, type SectionKey } from "@/contexts/SharedTransitionContext";

/* ========= codec probe ========= */
let PREFERS_WEBM = false;
if (typeof window !== "undefined") {
  const v = document.createElement("video");
  PREFERS_WEBM = !!v.canPlayType?.('video/webm; codecs="vp9,vorbis"');
}

/* ========= requestIdle ========= */
type IdleReqCbDeadline = { didTimeout: boolean; timeRemaining: () => number };
type IdleReqCb = (deadline: IdleReqCbDeadline) => void;
function requestIdle(fn: () => void, timeout = 1200): () => void {
  if (typeof window === "undefined") return () => {};
  const ric = (window as Window & {
    requestIdleCallback?: (cb: IdleReqCb, opts?: { timeout?: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  }).requestIdleCallback;
  if (typeof ric === "function") {
    const id = ric(() => fn(), { timeout });
    return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
  } else {
    const id = window.setTimeout(fn, timeout);
    return () => window.clearTimeout(id);
  }
}

/* ========= in-view once ========= */
type IOCallback = (inView: boolean) => void;
let _io: IntersectionObserver | null = null;
const _watch = new Map<Element, IOCallback>();
function ensureObserver() {
  if (_io) return _io;
  _io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const cb = _watch.get(e.target);
        if (cb) cb(e.isIntersecting);
        if (e.isIntersecting) _io?.unobserve(e.target);
      }
    },
    { threshold: 0.1, rootMargin: "200px 0px 200px 0px" }
  );
  return _io;
}
function useInViewOnce<T extends Element>(ref: React.RefObject<T | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = ensureObserver();
    const cb: IOCallback = (v) => setInView(v);
    _watch.set(el, cb);
    io.observe(el);
    return () => {
      _watch.delete(el);
      try { io.unobserve(el); } catch {}
    };
  }, [ref, inView]);
  return inView;
}

/* ========= helpers / constants ========= */
function computeDesktopScale(viewW: number) {
  const WIDTH_MIN = 820, WIDTH_MAX = 1440, MIN_SCALE = 1.0, MAX_SCALE = 1.3;
  if (viewW >= WIDTH_MAX) return MAX_SCALE;
  if (viewW <= WIDTH_MIN) return MIN_SCALE;
  const t = (viewW - WIDTH_MIN) / (WIDTH_MAX - WIDTH_MIN);
  return MIN_SCALE + t * (MAX_SCALE - MIN_SCALE);
}
const HOVER_DUR = 0.4;
const HOVER_EASE_CSS = "cubic-bezier(0.22,1,0.36,1)";
const HOVER_EASE_ARRAY = [0.22, 1, 0.36, 1] as const;
const MAX_TILT_DEG = 5;
const HOVER_ATTACH_DELAY_MS = 120;
const isSafari =
  typeof navigator !== "undefined" &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/* ========= props ========= */
export interface InlineEntranceCardProps {
  title: string;
  href: string;
  sectionKey: SectionKey;
  description?: string;
  videoSrc?: never;
  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  onActivate?: () => void;
}

export default function InlineEntranceCard({
  title,
  href,
  sectionKey,
  description = "Click Me",
  Logo,
  className = "",
  onActivate = () => {},
}: InlineEntranceCardProps) {
  const { startTransition } = useSharedTransition();
  const isES = href.startsWith("/es");
  const ctaText = isES ? "Haz Click" : "Click Me";

  const [isMobile, setIsMobile] = useState(false);
  const [desktopScale, setDesktopScale] = useState(1.3);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = window.innerWidth;
        setIsMobile(w < 768);
        setDesktopScale(computeDesktopScale(w));
      });
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => { if (raf) cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const hoverTO = useRef<number | null>(null);

  const isInView = useInViewOnce(cardRef);
  const lastSeg = href.replace(/\/+$/, "").split("/").pop() || "";
  const slug = lastSeg || sectionKey;

  const videoBase = slug;
  const base = !isMobile && videoBase ? `${videoBase}-HD` : "";
  const srcA = base ? `/videos/${base}.${PREFERS_WEBM ? "webm" : "mp4"}` : "";
  const srcB = base ? `/videos/${base}.${PREFERS_WEBM ? "mp4" : "webm"}` : "";

  const sourcesAttachedRef = useRef(false);
  const attachSources = useCallback(() => {
    if (isMobile || !isInView || sourcesAttachedRef.current) return;
    const v = videoRef.current;
    if (!v || !srcA) return;
    while (v.firstChild) v.removeChild(v.firstChild);
    const s1 = document.createElement("source");
    s1.src = srcA; s1.type = srcA.endsWith(".webm") ? "video/webm" : "video/mp4";
    const s2 = document.createElement("source");
    s2.src = srcB; s2.type = srcB.endsWith(".webm") ? "video/webm" : "video/mp4";
    v.append(s1, s2);
    v.load();
    sourcesAttachedRef.current = true;
  }, [isMobile, isInView, srcA, srcB]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    hoverTO.current = window.setTimeout(() => {
      attachSources();
      const v = videoRef.current;
      if (v && isInView) {
        if (v.readyState < 2) v.load();
        v.currentTime = 0;
        v.play().catch(() => {});
      }
      setIsHovered(true);
    }, HOVER_ATTACH_DELAY_MS);
  }, [isMobile, isInView, attachSources]);

  const handlePointerEnter = handleMouseEnter;

  useEffect(() => {
    if (isMobile || !isInView || !srcA) return;
    const cancel = requestIdle(() => {
      const link = document.createElement("link");
      link.rel = "preload"; link.as = "video"; link.href = srcA;
      link.type = srcA.endsWith(".webm") ? "video/webm" : "video/mp4";
      link.setAttribute("importance", "low");
      document.head.appendChild(link);
    }, 1200);
    return cancel;
  }, [isMobile, isInView, srcA]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isInView || isMobile) return;
    if (isHovered) { if (!sourcesAttachedRef.current) attachSources(); vid.play().catch(() => {}); }
    else { vid.pause(); }
  }, [isHovered, isMobile, isInView, attachSources]);

  // transform-only tilt
  const applyTilt = (clientX: number, clientY: number) => {
    const node = cardRef.current, rect = rectRef.current;
    if (!node || !rect) return;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    const rx = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, -y * MAX_TILT_DEG));
    const ry = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG,  x * MAX_TILT_DEG));
    node.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    node.style.transition = "transform 0.1s ease-out";
  };

  const scheduleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const { clientX, clientY, currentTarget } = e;
    if (!rectRef.current) rectRef.current = currentTarget.getBoundingClientRect();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyTilt(clientX, clientY));
  };

  const clearTilt = () => {
    const node = cardRef.current;
    rectRef.current = null;
    if (!node) return;
    node.style.transform = "perspective(1000px) translateY(0) rotateX(0) rotateY(0)";
    node.style.transition = "transform 0.5s ease";
  };

  useEffect(() => {
    const onResize = () => (rectRef.current = null);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    if (hoverTO.current) { clearTimeout(hoverTO.current); hoverTO.current = null; }
    clearTilt();
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
    setIsHovered(false);
  }, [isMobile]);

  const handleActivate = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault(); e.stopPropagation();
    onActivate?.();
    startTransition(sectionKey, href);
  }, [href, sectionKey, onActivate, startTransition]);

  // dimensions
  const BASE = { CARD_W: 256, CARD_H: 210, TOP_H: 128, CIRCLE: 80, UNDERLAY_H: 25, MOBILE_COLLAPSED: 96 };
  const scale = isMobile ? 1 : desktopScale;
  const CARD_WIDTH = BASE.CARD_W * scale;
  const CARD_HEIGHT = BASE.CARD_H * scale;
  const TOP_DESKTOP = BASE.TOP_H * scale;
  const CIRCLE_SIZE = BASE.CIRCLE * scale;
  const UNDERLAY_H = BASE.UNDERLAY_H * scale;

  const containerHeight = isMobile ? BASE.MOBILE_COLLAPSED : CARD_HEIGHT;
  const topHeight = isMobile ? 0 : TOP_DESKTOP;
  const bottomHeight = isMobile ? BASE.MOBILE_COLLAPSED : CARD_HEIGHT - TOP_DESKTOP;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: isMobile ? "100%" : Math.round(CARD_WIDTH), overflow: "visible" }}
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
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleActivate(e); }}
        className="block relative cursor-pointer"
      >
        <motion.div
          whileTap={{ scale: 0.97 }}
          className={`relative overflow-visible cursor-pointer ${isMobile ? "drop-shadow-lg" : ""}`}
          onPointerEnter={handlePointerEnter}
        >
          <div
            ref={cardRef}
            onMouseMove={scheduleTilt}
            className="shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
            style={{
              width: "100%",
              height: Math.round(containerHeight),
              cursor: "pointer",
              contain: "layout paint style",
              willChange: "transform",
              transform: "translateZ(0)",
              borderRadius: 24, 
            }}
          >
            <div
              style={{
                // 🔁 FIX: transparent container (no cream fill over video)
                border: "4px solid #e7eae1",
                borderRadius: 24,
                overflow: "hidden",
                height: "100%",
                background: "transparent",
                boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
              }}
            >
              {/* Top (transparent over video) */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 2,
                  height: isHovered ? topHeight * 0.7 : topHeight,
                  transition: `height ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                }}
              >
                {!isMobile && (
                  <video
                    ref={videoRef}
                    muted
                    loop
                    playsInline
                    preload="none"
                    tabIndex={-1}
                    controls={false}
                    disablePictureInPicture
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: isHovered ? 1 : 0,
                      display: "block",
                      zIndex: 3,
                      willChange: "transform, opacity",
                      transition: `opacity ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                    }}
                  />
                )}
              </div>

              {/* Bottom (cream panel) */}
              <motion.div
                initial={{ height: bottomHeight }}
                animate={{ height: isHovered ? bottomHeight + UNDERLAY_H + 15 : bottomHeight }}
                transition={{ duration: HOVER_DUR, ease: HOVER_EASE_ARRAY }}
                style={{
                  background: "#e7eae1", // cream ONLY here
                  padding: `${Math.max(8, 10 * scale)}px ${Math.max(12, 16 * scale)}px`,
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
                    fontSize: isMobile ? 28 : Math.round(22 * scale),
                    fontWeight: 600,
                    marginTop: isHovered ? Math.round(20 * scale) : Math.round(28 * scale),
                    transition: `margin-top ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                  }}
                  className="not-italic"
                >
                  {title}
                </h3>

                {!isMobile && isHovered && (
                  <p
                    id={`${slug}-desc`}
                    style={{
                      marginTop: Math.round(6 * scale),
                      textAlign: "center",
                      fontSize: Math.max(14, Math.round(16 * Math.min(1, scale))),
                      maxWidth: Math.round(224 * scale),
                      opacity: isHovered ? 1 : 0,
                      transition: `opacity ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
                    }}
                  >
                    {description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Underlay (Safari-friendly) */}
          {!isMobile && (
            <motion.div
              initial={{ y: 0 }}
              animate={isHovered ? { y: UNDERLAY_H } : { y: 0 }}
              transition={{ duration: 0.3, ease: HOVER_EASE_ARRAY }}
              className={`absolute bottom-0 left-0 w-full h-16 flex items-center justify-center pt-7 pointer-events-none ${
                isSafari ? "bg-white/40" : "bg-white/30 backdrop-blur-sm"
              }`}
              style={{
                height: Math.max(48, Math.round(64 * scale)),
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                zIndex: -1,
              }}
            >
              <span
                style={{ fontFamily: "var(--font-serif)", color: "#000000" }}
                className="font-semibold"
              >
                {ctaText}
              </span>
            </motion.div>
          )}

          {/* Logo (fluid circle) */}
          {Logo && (
            <div
              style={{
                position: "absolute",
                zIndex: 4,
                left: "50%",
                width: Math.round(isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE),
                height: Math.round(isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE),
                borderRadius: "50%",
                border: "4px solid #e7eae1",
                background: "#e7eae1",
                overflow: "hidden",
                top: isHovered ? topHeight * 0.6 : topHeight,
                transform: "translate(-50%, -50%)",
                transition: `top ${HOVER_DUR}s ${HOVER_EASE_CSS}, width ${HOVER_DUR}s ${HOVER_EASE_CSS}, height ${HOVER_DUR}s ${HOVER_EASE_CSS}`,
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