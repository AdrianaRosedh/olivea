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

/* ========= one-time codec probe (module scope) ========= */
let PREFERS_WEBM = false;
if (typeof window !== "undefined") {
  const v = document.createElement("video");
  PREFERS_WEBM = !!v.canPlayType?.('video/webm; codecs="vp9,vorbis"');
}

/* ========= requestIdle helper (no `any`) ========= */
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

/* ========= singleton IntersectionObserver + generic hook ========= */
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
        if (e.isIntersecting) _io?.unobserve(e.target); // fire once
      }
    },
    { threshold: 0.1, rootMargin: "200px 0px 200px 0px" }
  );
  return _io;
}

// null-safe, generic
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
      try {
        io.unobserve(el);
      } catch {}
    };
  }, [ref, inView]);
  return inView;
}

/* ========= fluid desktop scale helper =========
   Shrinks desktop smoothly between WIDTH_MIN..WIDTH_MAX.
   - At >= WIDTH_MAX → MAX_SCALE
   - At <= WIDTH_MIN → MIN_SCALE
   - In between → linear interpolation
*/
function computeDesktopScale(viewW: number) {
  const WIDTH_MIN = 820;    // start shrinking below this (desktop/tablet-ish)
  const WIDTH_MAX = 1440;   // full desktop width
  const MIN_SCALE = 1.0;    // smallest desktop scale (just above mobile)
  const MAX_SCALE = 1.3;    // your current desktop "big" scale

  if (viewW >= WIDTH_MAX) return MAX_SCALE;
  if (viewW <= WIDTH_MIN) return MIN_SCALE;

  const t = (viewW - WIDTH_MIN) / (WIDTH_MAX - WIDTH_MIN);
  return MIN_SCALE + t * (MAX_SCALE - MIN_SCALE);
}

/* ======================================================= */
export interface InlineEntranceCardProps {
  title: string;
  href: string;
  sectionKey: SectionKey; // "casa" | "cafe" | "farmtotable"
  description?: string;
  videoSrc?: never;        // unused, API-compat only
  Logo?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  onActivate?: () => void;
}

export default function InlineEntranceCard({
  title,
  href,
  sectionKey,
  description = "Ut lorem purus nam feugiat malesuada quis libero cursus.",
  Logo,
  className = "",
  onActivate = () => {},
}: InlineEntranceCardProps) {
  const { startTransition } = useSharedTransition();

  // i18n CTA
  const isES = href.startsWith("/es");
  const ctaText = isES ? "Haz Click" : "Click Me";



  // responsive breakpoints
  const [isMobile, setIsMobile] = useState(false);
  const [desktopScale, setDesktopScale] = useState(1.3);

  // rAF-throttled resize handler to update isMobile + desktop scale
  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = window.innerWidth;
        setIsMobile(w < 768);
        // Only matters on desktop; harmless to update always
        setDesktopScale(computeDesktopScale(w));
      });
    };

    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // hover state
  const [isHovered, setIsHovered] = useState(false);

  // refs
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rectRef  = useRef<DOMRect | null>(null);
  const rafRef   = useRef<number | null>(null);

  // in-view (shared IO)
  const isInView = useInViewOnce(cardRef);
  // slug for aria + asset naming (trailing-slash safe)
  const lastSeg = href.replace(/\/+$/, "").split("/").pop() || "";
  const slug = lastSeg || sectionKey; // fallback to sectionKey if last segment is empty

  // If you prefer explicit control per card, allow an optional prop:
  // export interface InlineEntranceCardProps { ... videoBase?: string; ... }
  // and plumb it in; for now we infer:
  const videoBase = slug; // or props.videoBase ?? slug

  // desktop hover video URLs (mobile skips entirely)
  const base = !isMobile && videoBase ? `${videoBase}-HD` : "";
  const srcA = base ? `/videos/${base}.${PREFERS_WEBM ? "webm" : "mp4"}` : "";
  const srcB = base ? `/videos/${base}.${PREFERS_WEBM ? "mp4"  : "webm"}` : "";

  // attach <source> lazily the first time we hover (desktop, in view)
  const sourcesAttachedRef = useRef(false);
  const attachSources = useCallback(() => {
    if (isMobile || !isInView || sourcesAttachedRef.current) return;
    const v = videoRef.current;
    if (!v || !srcA) return;
    // Clean stale sources (in case of hot reloads)
    while (v.firstChild) v.removeChild(v.firstChild);
    const s1 = document.createElement("source");
    s1.src = srcA;
    s1.type = srcA.endsWith(".webm") ? "video/webm" : "video/mp4";
    const s2 = document.createElement("source");
    s2.src = srcB;
    s2.type = srcB.endsWith(".webm") ? "video/webm" : "video/mp4";
    v.append(s1, s2);
    v.load();
    sourcesAttachedRef.current = true;
  }, [isMobile, isInView, srcA, srcB]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    attachSources();
    const v = videoRef.current;
    if (v && isInView) {
      if (v.readyState < 2) v.load();
      v.currentTime = 0; // nudge
      v.play().catch(() => {});
    }
    setIsHovered(true);
  }, [isMobile, isInView, attachSources]);

  // also support keyboard/focus & touchpad
  const handlePointerEnter = handleMouseEnter;


  // optional: idle preload (desktop only, once visible)
  useEffect(() => {
    if (isMobile || !isInView || !srcA) return;
    const cancel = requestIdle(() => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = srcA;
      link.type = srcA.endsWith(".webm") ? "video/webm" : "video/mp4";
      link.setAttribute("importance", "low");
      document.head.appendChild(link);
    }, 1200);
    return cancel;
  }, [isMobile, isInView, srcA]);

  // hover playback (desktop only)
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isInView || isMobile) return;
    if (isHovered) {
      if (!sourcesAttachedRef.current) attachSources();
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isHovered, isMobile, isInView, attachSources]);

  // ── Imperative tilt (no React state on move) ─────────────────────
  const applyTilt = (clientX: number, clientY: number) => {
    const node = cardRef.current;
    const rect = rectRef.current;
    if (!node || !rect) return;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;

    node.style.transform =
      `perspective(1000px) translateY(-8px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
    node.style.boxShadow =
      `${(-x * 20).toFixed(2)}px ${(y * 20).toFixed(2)}px 30px rgba(0,0,0,0.15)`;
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

  // resize: invalidate cached rect (already handled globally, but safe to keep)
  useEffect(() => {
    const onResize = () => (rectRef.current = null);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    clearTilt();
    setIsHovered(false);
  }, [isMobile]);

  const handleActivate = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate?.();
    startTransition(sectionKey, href); // transition independent of hover video
  }, [href, sectionKey, onActivate, startTransition]);

  // ── Dimensions (FLUID DESKTOP, FIXED MOBILE) ─────────────────────
  // Base design tokens (unscaled)
  const BASE = {
    CARD_W: 256,
    CARD_H: 210,
    TOP_H: 128,
    CIRCLE: 80,
    UNDERLAY_H: 25,
    MOBILE_COLLAPSED: 96,
  };

  // Compute scale for desktop; mobile stays as your current visuals.
  const scale = isMobile ? 1 : desktopScale;

  const CARD_WIDTH   = BASE.CARD_W * scale;
  const CARD_HEIGHT  = BASE.CARD_H * scale;
  const TOP_DESKTOP  = BASE.TOP_H * scale;
  const CIRCLE_SIZE  = BASE.CIRCLE * scale;
  const UNDERLAY_H   = BASE.UNDERLAY_H * scale;

  const containerHeight = isMobile ? BASE.MOBILE_COLLAPSED : CARD_HEIGHT;
  const topHeight       = isMobile ? 0 : TOP_DESKTOP;
  const bottomHeight    = isMobile ? BASE.MOBILE_COLLAPSED : (CARD_HEIGHT - TOP_DESKTOP);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: isMobile ? "100%" : Math.round(CARD_WIDTH),
        overflow: "visible",
      }}
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
        <motion.div
          whileTap={{ scale: 0.97 }}
          className={`relative overflow-visible cursor-pointer ${isMobile ? "drop-shadow-lg" : ""}`}
          onPointerEnter={handlePointerEnter}
        >
          <div
            ref={cardRef}
            onMouseMove={scheduleTilt}
            style={{
              width: "100%",
              height: Math.round(containerHeight),
              cursor: "pointer",
              contain: "layout paint style", // perf: isolate layout/paint
              willChange: "transform",       // perf: smoother tilt
              transform: "translateZ(0)",    // perf: own layer
            }}
          >
            <div style={{ border: "4px solid #e8e4d5", borderRadius: 24, overflow: "hidden", height: "100%" }}>
              {/* Top Video (DESKTOP ONLY) */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 2000,
                  height: isHovered ? topHeight * 0.7 : topHeight,
                  transition: "height 0.4s ease",
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
                      zIndex: 2001,
                      willChange: "transform, opacity",
                    }}
                  />
                )}
              </div>

              {/* Bottom Text (unchanged content, fluid spacing) */}
              <motion.div
                initial={{ height: bottomHeight }}
                animate={{ height: isHovered ? bottomHeight + UNDERLAY_H + 15 : bottomHeight }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  background: "#e8e4d5",
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
                    fontSize: isMobile ? 28 : Math.round(22 * scale), // fluid but keeps hierarchy
                    fontWeight: isMobile ? 600 : 300,
                    marginTop: isHovered ? Math.round(20 * scale) : Math.round(28 * scale),
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
                      marginTop: Math.round(6 * scale),
                      textAlign: "center",
                      fontSize: Math.max(14, Math.round(16 * Math.min(1, scale))),
                      maxWidth: Math.round(224 * scale),
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

          {/* Underlay (fluid height) */}
          {!isMobile && (
            <motion.div
              initial={{ y: 0 }}
              animate={isHovered ? { y: UNDERLAY_H } : { y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-full h-16 bg-white/30 backdrop-blur-md flex items-center justify-center pt-7 pointer-events-none"
              style={{
                height: Math.max(48, Math.round(64 * scale)),
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

          {/* Logo (fluid circle) */}
          {Logo && (
            <div
              style={{
                position: "absolute",
                zIndex: 400,
                left: "50%",
                width: Math.round((isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE)),
                height: Math.round((isHovered ? CIRCLE_SIZE * 0.7 : CIRCLE_SIZE)),
                borderRadius: "50%",
                border: "4px solid #e8e4d5",
                background: "#e8e4d5",
                overflow: "hidden",
                top: (isHovered ? topHeight * 0.6 : topHeight),
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